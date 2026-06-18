import type { ArticleData, StudioSection } from "./ArticleStudioTypes";

const STEPS: { id: StudioSection; label: string; icon: React.ReactNode }[] = [
  { 
    id: "brief", 
    label: "Brief",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3h12M2 6.5h8M2 10h10M2 13.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    id: "draft", 
    label: "Rédaction",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M11.5 2.5L13.5 4.5M2 14l.5-2L11 3.5l2 2L4.5 14l-2 .5-.5-.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    id: "seo", 
    label: "SEO",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  },
  { 
    id: "image", 
    label: "Visuel",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1"/>
        <path d="M1.5 11l3-3 2 2 4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    id: "publish", 
    label: "Publier",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v8M8 2L5 5M8 2l3 3M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
];

function getStepProgress(stepId: StudioSection, article: ArticleData): "done" | "active" | "pending" {
  switch (stepId) {
    case "brief":
      if (article.seo.primaryQuestion || article.seo.targetAudience || article.seo.businessGoal) {
        return "done";
      }
      return article.title ? "active" : "pending";
    case "draft":
      if (article.content.wordCount >= 300) return "done";
      if (article.content.wordCount > 0) return "active";
      return "pending";
    case "seo":
      if (article.seo.score >= 70) return "done";
      if (article.seo.seoTitle || article.seo.metaDescription) return "active";
      return "pending";
    case "image":
      return article.coverImageId ? "done" : "pending";
    case "publish":
      if (article.status === "PUBLISHED") return "done";
      if (article.status === "READY") return "active";
      return "pending";
    default:
      return "pending";
  }
}

function getStepScore(stepId: StudioSection, article: ArticleData): number | null {
  switch (stepId) {
    case "draft":
      if (article.content.wordCount === 0) return null;
      return Math.min(100, Math.round((article.content.wordCount / 800) * 100));
    case "seo":
      return article.seo.score > 0 ? article.seo.score : null;
    default:
      return null;
  }
}

export default function ArticleStudioStepper({ 
  article, 
  activeSection,
  onSectionChange 
}: { 
  article: ArticleData;
  activeSection?: StudioSection;
  onSectionChange?: (section: StudioSection) => void;
}) {
  const totalDone = STEPS.filter((s) => getStepProgress(s.id, article) === "done").length;
  const progressPercent = Math.round((totalDone / STEPS.length) * 100);

  return (
    <nav className="studio-stepper" aria-label="Progression du studio article">
      <div className="studio-stepper__progress">
        <div 
          className="studio-stepper__progress-fill" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <ol className="studio-stepper__list">
        {STEPS.map((step) => {
          const progress = getStepProgress(step.id, article);
          const score = getStepScore(step.id, article);
          const isActive = activeSection === step.id;
          
          return (
            <li key={step.id}>
              <button
                type="button"
                className={`studio-stepper__item ${
                  progress === "done" ? "studio-stepper__item--done" : ""
                } ${progress === "active" ? "studio-stepper__item--active" : ""} ${
                  isActive ? "studio-stepper__item--selected" : ""
                }`}
                onClick={() => onSectionChange?.(step.id)}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="studio-stepper__icon">
                  {progress === "done" ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    step.icon
                  )}
                </span>
                <span className="studio-stepper__label">{step.label}</span>
                {score !== null && (
                  <span className={`studio-stepper__score ${score >= 70 ? "studio-stepper__score--good" : score >= 40 ? "studio-stepper__score--medium" : "studio-stepper__score--low"}`}>
                    {score}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
