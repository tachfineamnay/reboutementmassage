"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ImageUploader from "./ImageUploader";
import SeoPanel from "./SeoPanel";
import { slugify } from "@/lib/utils";

// Tiptap ne fonctionne pas en SSR
const TiptapEditor = dynamic(() => import("./TiptapEditor"), { ssr: false });

type Locale = "FR" | "EN" | "ES";
type ArticleStatus = "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";

type ArticleFormData = {
  id?: string;
  locale: Locale;
  title: string;
  slug: string;
  excerpt: string;
  content: Record<string, unknown> | null;
  contentHtml: string;
  contentPlainText: string;
  contentWordCount: number;
  contentReadingTime: number;
  coverImageId: string;
  coverImageUrl: string;
  status: ArticleStatus;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  noindex: boolean;
};

type ArticleFormProps = {
  initialData?: Partial<ArticleFormData>;
  mode: "create" | "edit";
};

const DEFAULT: ArticleFormData = {
  locale: "FR",
  title: "",
  slug: "",
  excerpt: "",
  content: null,
  contentHtml: "",
  contentPlainText: "",
  contentWordCount: 0,
  contentReadingTime: 0,
  coverImageId: "",
  coverImageUrl: "",
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
  focusKeyword: "",
  noindex: false,
};

export default function ArticleForm({ initialData, mode }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<ArticleFormData>({ ...DEFAULT, ...initialData });
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    set("title", title);
    if (mode === "create") {
      set("slug", slugify(title));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const url =
          mode === "create"
            ? "/api/admin/articles"
            : `/api/admin/articles/${data.id}`;
        const method = mode === "create" ? "POST" : "PUT";

        // Payload Article (champs plats)
        const articlePayload = {
          locale: data.locale,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || null,
          status: data.status,
          coverImageId: data.coverImageId || null,
          publishedAt:
            data.status === "PUBLISHED" ? new Date().toISOString() : null,
        };

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(articlePayload),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Erreur lors de la sauvegarde");
        }

        const saved = await res.json();
        const articleId = saved.id as string;

        // Upsert ArticleContent
        await fetch(`/api/admin/articles/${articleId}/content`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            editorJson: data.content,
            html: data.contentHtml || null,
            plainText: data.contentPlainText || null,
            wordCount: data.contentWordCount,
            readingTime: data.contentReadingTime,
          }),
        });

        // Upsert ArticleSeo
        await fetch(`/api/admin/articles/${articleId}/seo`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seoTitle: data.seoTitle || null,
            metaDescription: data.seoDescription || null,
            focusKeyword: data.focusKeyword || null,
            noindex: data.noindex,
          }),
        });

        router.push("/admin/articles");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="article-form">
      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="article-form__layout">
        {/* Colonne principale */}
        <div className="article-form__main">
          {/* Langue */}
          <div className="admin-field">
            <label className="admin-label" htmlFor="article-locale">
              Langue <span className="admin-required">*</span>
            </label>
            <select
              id="article-locale"
              className="admin-input"
              value={data.locale}
              onChange={(e) => set("locale", e.target.value as Locale)}
              disabled={mode === "edit"}
            >
              <option value="FR">🇫🇷 Français</option>
              <option value="EN">🇬🇧 English</option>
              <option value="ES">🇪🇸 Español</option>
            </select>
          </div>

          {/* Titre */}
          <div className="admin-field">
            <label className="admin-label" htmlFor="article-title">
              Titre <span className="admin-required">*</span>
            </label>
            <input
              id="article-title"
              type="text"
              required
              className="admin-input admin-input--lg"
              placeholder="Titre de l'article"
              value={data.title}
              onChange={handleTitleChange}
            />
          </div>

          {/* Slug */}
          <div className="admin-field">
            <label className="admin-label" htmlFor="article-slug">
              Slug URL <span className="admin-required">*</span>
            </label>
            <div className="admin-input-group">
              <span className="admin-input-prefix">
                /{data.locale.toLowerCase()}/stories/
              </span>
              <input
                id="article-slug"
                type="text"
                required
                className="admin-input"
                placeholder="mon-article"
                value={data.slug}
                onChange={(e) => set("slug", e.target.value)}
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                title="Minuscules, chiffres et tirets uniquement"
              />
            </div>
          </div>

          {/* Extrait */}
          <div className="admin-field">
            <label className="admin-label" htmlFor="article-excerpt">
              Extrait
            </label>
            <textarea
              id="article-excerpt"
              className="admin-input"
              rows={3}
              placeholder="Court résumé affiché dans la liste des articles…"
              value={data.excerpt}
              maxLength={500}
              onChange={(e) => set("excerpt", e.target.value)}
            />
            <span className="admin-hint">{data.excerpt.length}/500 caractères</span>
          </div>

          {/* Éditeur de contenu */}
          <div className="admin-field">
            <label className="admin-label">Contenu</label>
            <TiptapEditor
              initialContent={data.content}
              onChange={({ editorJson, html, plainText, stats }) => {
                set("content", editorJson);
                set("contentHtml", html);
                set("contentPlainText", plainText);
                set("contentWordCount", stats.wordCount);
                set("contentReadingTime", stats.readingTime);
              }}
            />
          </div>
        </div>

        {/* Colonne latérale */}
        <aside className="article-form__sidebar">
          {/* Statut + Publier */}
          <div className="admin-panel">
            <h3 className="admin-panel__title">Publication</h3>
            <div className="admin-field">
              <label className="admin-label" htmlFor="article-status">
                Statut
              </label>
              <select
                id="article-status"
                className="admin-input"
                value={data.status}
                onChange={(e) => set("status", e.target.value as ArticleStatus)}
              >
                <option value="DRAFT">Brouillon</option>
                <option value="READY">Prêt à publier</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>

            <div className="article-form__actions">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => router.push("/admin/articles")}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn--primary"
                disabled={isPending}
              >
                {isPending
                  ? "Sauvegarde…"
                  : mode === "create"
                  ? "Créer l'article"
                  : "Enregistrer"}
              </button>
            </div>
          </div>

          {/* Image de couverture */}
          <div className="admin-panel">
            <ImageUploader
              currentImage={data.coverImageUrl || null}
              onUpload={(asset) => {
                set("coverImageId", asset.id);
                set("coverImageUrl", asset.url);
              }}
            />
          </div>

          {/* SEO */}
          <div className="admin-panel">
            <SeoPanel
              seoTitle={data.seoTitle}
              seoDescription={data.seoDescription}
              focusKeyword={data.focusKeyword}
              noindex={data.noindex}
              slug={data.slug}
              locale={data.locale}
              title={data.title}
              plainText={data.contentPlainText}
              html={data.contentHtml}
              editorJson={data.content}
              onChange={(field, value) =>
                set(field as keyof ArticleFormData, value as never)
              }
            />
          </div>
        </aside>
      </div>
    </form>
  );
}
