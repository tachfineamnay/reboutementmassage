"use client";

import { useMemo, useState, useTransition } from "react";
import type {
  AiAction,
  ArticleAiResponse,
  ArticleData,
  ArticlePatch,
} from "./ArticleStudioTypes";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  patch?: ArticlePatch;
  warnings?: string[];
};

type QuickPrompt = {
  label: string;
  action: AiAction;
  instruction: string;
  targetLanguage?: string;
};

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: "Générer brief SEO/AEO/GEO",
    action: "brief",
    instruction: "Construis un brief stratégique actionnable.",
  },
  {
    label: "Proposer plan H2/H3",
    action: "outline",
    instruction: "Propose un plan H2/H3 clair pour répondre à l'intention.",
  },
  {
    label: "Rédiger draft",
    action: "draft",
    instruction: "Rédige un premier draft en HTML simple.",
  },
  {
    label: "Améliorer intro",
    action: "revise",
    instruction: "Améliore l'introduction et rends la promesse plus claire.",
  },
  {
    label: "Ajouter FAQ",
    action: "faq",
    instruction: "Propose des questions-réponses visibles et utiles.",
  },
  {
    label: "Optimiser SEO",
    action: "seo",
    instruction: "Optimise les champs SEO, AEO et GEO sans surpromesse.",
  },
  {
    label: "Adapter EN",
    action: "translate",
    instruction: "Propose une adaptation anglaise éditoriale.",
    targetLanguage: "EN",
  },
  {
    label: "Adapter ES-MX",
    action: "translate",
    instruction: "Propose une adaptation espagnol Mexique.",
    targetLanguage: "ES-MX",
  },
  {
    label: "Générer prompt image",
    action: "imagePrompt",
    instruction: "Crée un prompt d'image principale, les textes alt et un nom de fichier recommandé.",
  },
];

function patchSummary(patch?: ArticlePatch) {
  if (!patch) return "";
  const keys = Object.keys(patch).filter((key) => {
    const value = patch[key as keyof ArticlePatch];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  return keys.length ? `Patch proposé: ${keys.join(", ")}` : "";
}

export default function ArticleAIAssistant({
  article,
  onApplyPatch,
  onInsertHtml,
}: {
  article: ArticleData;
  onApplyPatch: (patch: ArticlePatch) => void;
  onInsertHtml: (html: string, mode: "insert" | "replace") => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text:
        "Je peux proposer un brief, un plan, un draft, des optimisations SEO ou des adaptations. Le canvas article reste la source de vérité.",
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const topic = useMemo(
    () => article.seo.primaryQuestion || article.title || article.excerpt,
    [article.excerpt, article.seo.primaryQuestion, article.title]
  );

  async function runPrompt(prompt: QuickPrompt | null) {
    const instruction = prompt?.instruction || input.trim();
    if (!instruction) return;

    const action = prompt?.action || "revise";
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: prompt?.label || instruction,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/ai/article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            articleId: article.id,
            locale: article.locale,
            topic,
            title: article.title,
            excerpt: article.excerpt,
            contentPlainText: article.content.plainText,
            seo: article.seo,
            instruction,
            targetLanguage: prompt?.targetLanguage,
          }),
        });
        const body = (await response.json().catch(() => ({}))) as Partial<ArticleAiResponse> & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            response.status === 503
              ? "IA non configurée. Ajoutez OPENAI_API_KEY côté serveur."
              : body.error || "Erreur IA."
          );
        }

        const patch = body.patch || {};
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: [body.message || "Proposition générée.", patchSummary(patch)]
              .filter(Boolean)
              .join("\n\n"),
            patch,
            warnings: body.warnings || [],
          },
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur IA inconnue.";
        setError(message);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: message,
            warnings: [message],
          },
        ]);
      }
    });
  }

  function copyMessage(message: Message) {
    void navigator.clipboard?.writeText(message.text);
  }

  return (
    <aside className="article-ai-assistant" aria-label="Assistant IA article">
      <div className="article-ai-assistant__header">
        <div>
          <p className="seo-panel__eyebrow">Assistant IA</p>
          <h2>Studio conversationnel</h2>
        </div>
        <span className="article-ai-assistant__status">
          {isPending ? "Génération..." : "Prêt"}
        </span>
      </div>

      <div className="article-ai-assistant__quick">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            type="button"
            key={prompt.label}
            onClick={() => runPrompt(prompt)}
            disabled={isPending}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <div className="article-ai-assistant__messages">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`article-ai-message article-ai-message--${message.role}`}
          >
            <p>{message.text}</p>
            {message.warnings && message.warnings.length > 0 && (
              <ul className="article-ai-message__warnings">
                {message.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
            <div className="article-ai-message__actions">
              <button type="button" onClick={() => copyMessage(message)}>
                Copier
              </button>
              {message.patch && (
                <button type="button" onClick={() => onApplyPatch(message.patch!)}>
                  Appliquer
                </button>
              )}
              {message.patch?.contentHtml && (
                <>
                  <button
                    type="button"
                    onClick={() => onInsertHtml(message.patch!.contentHtml!, "insert")}
                  >
                    Insérer
                  </button>
                  <button
                    type="button"
                    onClick={() => onInsertHtml(message.patch!.contentHtml!, "replace")}
                  >
                    Remplacer
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <form
        className="article-ai-assistant__form"
        onSubmit={(event) => {
          event.preventDefault();
          void runPrompt(null);
        }}
      >
        <textarea
          className="admin-input"
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Demander une révision, une idée, une optimisation..."
          disabled={isPending}
        />
        <button
          type="submit"
          className="admin-btn admin-btn--primary admin-btn--full"
          disabled={isPending || !input.trim()}
        >
          Envoyer
        </button>
      </form>
    </aside>
  );
}
