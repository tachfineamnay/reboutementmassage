import type { ReactNode } from "react";
import styles from "./LandingBuilder.module.css";

export function LandingConversionStep({ children }: { children?: ReactNode }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">5. Conversion</h2>
      <div className={styles.panel}>
        {children ?? <p className="admin-page__meta">Formulaire court, routage GHL et tracking.</p>}
      </div>
    </section>
  );
}

export default LandingConversionStep;
