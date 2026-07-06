import type { LandingBuilderInput } from "@/lib/admin/builder/landing-builder-schema";
import styles from "./LandingBuilder.module.css";

export function LandingBuilderPreview({ value }: { value: LandingBuilderInput }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">Preview</h2>
      <div className={styles.preview}>
        <span className="admin-page__meta">{value.market.locale} · /{value.market.slug || "slug"}</span>
      <h3 className={styles.previewTitle}>{value.hero.heroTitle || "Titre hero"}</h3>
      <p className="admin-page__meta">{value.hero.heroSubtitle || "Sous-titre de la page locale"}</p>
        <div className={styles.previewActions}>
          <span className="admin-btn admin-btn--primary">{value.hero.primaryCta}</span>
          <span className="admin-btn admin-btn--ghost">{value.hero.secondaryCta}</span>
        </div>
      </div>
    </section>
  );
}
