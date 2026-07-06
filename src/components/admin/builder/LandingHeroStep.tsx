import type { ReactNode } from "react";
import styles from "./LandingBuilder.module.css";

export function LandingHeroStep({ children }: { children?: ReactNode }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">3. Hero</h2>
      <div className={styles.panel}>
        {children ?? <p className="admin-page__meta">Titre, sous-titre, CTA et image hero.</p>}
      </div>
    </section>
  );
}

export default LandingHeroStep;
