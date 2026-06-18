"use client";

import { useMemo, useState, useTransition, useRef, useEffect } from "react";
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
  icon: React.ReactNode;
};

type PromptGroup = {
  label: string;
  prompts: QuickPrompt[];
};

const PROMPT_GROUPS: PromptGroup[] = [
  {
    label: "Stratégie",
    prompts: [
      {
        label: "Générer brief SEO/AEO/GEO",
        action: "brief",
        instruction: "Construis un brief stratégique actionnable.",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3.5h10M2 7h6M2 10.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: "Proposer plan H2/H3",
        action: "outline",
        instruction: "Propose un plan H2/H3 clair pour répondre à l'intention.",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3h8M3 7h8M3 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="3" cy="3" r="1" fill="currentColor"/>
            <circle cx="3" cy="7" r="1" fill="currentColor"/>
            <circle cx="3" cy="11" r="1" fill="currentColor"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: "Rédaction",
    prompts: [
      {
        label: "Rédiger draft",
        action: "draft",
        instruction: "Rédige un premier draft en HTML simple.",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 2L12 4M2 12l.5-2L10 2.5l2 2L4.5 12l-2 .5-.5-.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
      {
        label: "Améliorer intro",
        action: "revise",
        instruction: "Améliore l'introduction et rends la promesse plus claire.",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: "Ajouter FAQ",
        action: "faq",
        instruction: "Propose des questions-réponses visibles et utiles.",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5.5 5.5a1.5 1.5 0 113 0c0 1-1.5 1-1.5 2M7 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: "Optimisation",
    prompts: [
      {
        label: "Optimiser SEO",
        action: "seo",
        instruction: "Optimise les champs SEO, AEO et GEO sans surpromesse.",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
      },
      {
        label: "Prompt image",
        action: "imagePrompt",
        instruction: "Crée un prompt d'image principale, les textes alt et un nom de fichier recommandé.",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="4.5" cy="5.5" r="1.5" stroke="currentColor"/>
            <path d="M1 9l3-3 2 2 4-4 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: "Traduction",
    prompts: [
      {
        label: "Adapter EN",
        action: "translate",
        instruction: "Propose une adaptation anglaise éditoriale.",
        targetLanguage: "EN",
        icon: <span className="ai-flag">🇬🇧</span>,
      },
      {
        label: "Adapter ES-MX",
        action: "translate",
        instruction: "Propose une adaptation espagnol Mexique.",
        targetLanguage: "ES-MX",
        icon: <span className="ai-flag">🇲🇽</span>,
      },
    ],
  },
];

function patchSummary(patch?: ArticlePatch) {
  if (!patch) return "";
  const keys = Object.keys(patch).filter((key) => {
    const value = patch[key as keyof ArticlePatch];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  return keys.length ? `Modifications proposées: ${keys.join(", ")}` : "";
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
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Stratégie");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const topic = useMemo(
    () => article.seo.primaryQuestion || article.title || article.excerpt,
    [article.excerpt, article.seo.primaryQuestion, article.title]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <aside className="ai-assistant" aria-label="Assistant IA article">
      <div className="ai-assistant__header">
        <div className="ai-assistant__title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L2 7l8 5 8-5-8-5zM2 13l8 5 8-5M2 10l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Assistant IA</span>
        </div>
        <span className={`ai-assistant__status ${isPending ? "ai-assistant__status--busy" : ""}`}>
          {isPending ? (
            <>
              <span className="ai-assistant__spinner" />
              Génération...
            </>
          ) : (
            "Prêt"
          )}
        </span>
      </div>

      <div className="ai-assistant__quick">
        {PROMPT_GROUPS.map((group) => (
          <div key={group.label} className="ai-assistant__group">
            <button
              type="button"
              className={`ai-assistant__group-header ${expandedGroup === group.label ? "ai-assistant__group-header--expanded" : ""}`}
              onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
            >
              <span>{group.label}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expandedGroup === group.label ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {expandedGroup === group.label && (
              <div className="ai-assistant__group-content">
                {group.prompts.map((prompt) => (
                  <button
                    type="button"
                    key={prompt.label}
                    className="ai-assistant__prompt"
                    onClick={() => runPrompt(prompt)}
                    disabled={isPending}
                  >
                    <span className="ai-assistant__prompt-icon">{prompt.icon}</span>
                    <span>{prompt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ai-assistant__messages">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`ai-message ai-message--${message.role}`}
          >
            {message.role === "assistant" && (
              <div className="ai-message__avatar">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L1 4l6 3 6-3-6-3zM1 10l6 3 6-3M1 7l6 3 6-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className="ai-message__content">
              <p>{message.text}</p>
              {message.warnings && message.warnings.length > 0 && (
                <ul className="ai-message__warnings">
                  {message.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              )}
              {(message.patch || message.role === "assistant") && (
                <div className="ai-message__actions">
                  <button 
                    type="button" 
                    className="ai-message__action"
                    onClick={() => copyMessage(message)}
                    title="Copier"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  </button>
                  {message.patch && Object.keys(message.patch).length > 0 && (
                    <button 
                      type="button" 
                      className="ai-message__action ai-message__action--primary"
                      onClick={() => onApplyPatch(message.patch!)}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l4 4 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Appliquer
                    </button>
                  )}
                  {message.patch?.contentHtml && (
                    <>
                      <button
                        type="button"
                        className="ai-message__action"
                        onClick={() => onInsertHtml(message.patch!.contentHtml!, "insert")}
                      >
                        Insérer
                      </button>
                      <button
                        type="button"
                        className="ai-message__action"
                        onClick={() => onInsertHtml(message.patch!.contentHtml!, "replace")}
                      >
                        Remplacer
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <form
        className="ai-assistant__form"
        onSubmit={(event) => {
          event.preventDefault();
          void runPrompt(null);
        }}
      >
        <div className="ai-assistant__input-wrapper">
          <textarea
            className="ai-assistant__input"
            rows={2}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Demander une révision, une idée, une optimisation..."
            disabled={isPending}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (input.trim()) runPrompt(null);
              }
            }}
          />
          <button
            type="submit"
            className="ai-assistant__submit"
            disabled={isPending || !input.trim()}
            title="Envoyer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 9h14M16 9l-5-5M16 9l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="ai-assistant__hint">Appuyez sur Entrée pour envoyer</p>
      </form>
    </aside>
  );
}
