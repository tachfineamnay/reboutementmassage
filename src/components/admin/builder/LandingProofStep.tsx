import type { ReactNode } from "react";
import styles from "./LandingBuilder.module.css";

export function LandingProofStep({ children }: { children?: ReactNode }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">4. Preuves</h2>
      <div className={styles.panel}>
        {children ?? <p className="admin-page__meta">Badges, témoignages et preuves locales.</p>}
      </div>
    </section>
  );
}

export default LandingProofStep;
