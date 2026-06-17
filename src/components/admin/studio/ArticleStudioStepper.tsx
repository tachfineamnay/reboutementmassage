import type { ArticleData } from "./ArticleStudioTypes";

const STEPS = [
  "Topic",
  "Brief",
  "Draft",
  "SEO",
  "Image",
  "Traductions",
  "Publish",
] as const;

function getStepState(step: (typeof STEPS)[number], article: ArticleData) {
  if (step === "Topic") return Boolean(article.title || article.seo.targetAudience);
  if (step === "Brief") {
    return Boolean(
      article.seo.primaryQuestion ||
        article.seo.targetAudience ||
        article.seo.geoLocation ||
        article.seo.businessGoal
    );
  }
  if (step === "Draft") return article.content.wordCount > 0;
  if (step === "SEO") return article.seo.score >= 50 || Boolean(article.seo.seoTitle);
  if (step === "Image") return Boolean(article.coverImageId);
  if (step === "Traductions") return article.locale !== "FR";
  return article.status === "READY" || article.status === "PUBLISHED";
}

export default function ArticleStudioStepper({ article }: { article: ArticleData }) {
  const currentIndex = STEPS.findIndex((step) => !getStepState(step, article));
  const activeIndex = currentIndex === -1 ? STEPS.length - 1 : currentIndex;

  return (
    <ol className="article-studio-stepper" aria-label="Progression du studio article">
      {STEPS.map((step, index) => {
        const done = getStepState(step, article);
        const active = index === activeIndex;
        return (
          <li
            className={`article-studio-stepper__item ${
              done ? "article-studio-stepper__item--done" : ""
            } ${active ? "article-studio-stepper__item--active" : ""}`}
            key={step}
          >
            <span className="article-studio-stepper__dot">{done ? "✓" : index + 1}</span>
            <span>{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
