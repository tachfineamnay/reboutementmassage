import type { ReactNode } from "react";
import styles from "./LandingBuilder.module.css";

export function LandingMarketStep({ children }: { children?: ReactNode }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">1. Marché</h2>
      <div className={styles.panel}>
        {children ?? <p className="admin-page__meta">Destination, langue et slug de la page locale.</p>}
      </div>
    </section>
  );
}

export default LandingMarketStep;
