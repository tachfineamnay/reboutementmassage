import type { ReactNode } from "react";
import styles from "./LandingBuilder.module.css";

export function LandingSeoStep({ children }: { children?: ReactNode }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">6. SEO</h2>
      <div className={styles.panel}>
        {children ?? <p className="admin-page__meta">Titre SEO, meta description, indexation et hreflang.</p>}
      </div>
    </section>
  );
}

export default LandingSeoStep;
