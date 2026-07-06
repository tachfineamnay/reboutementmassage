import type { ReactNode } from "react";
import styles from "./LandingBuilder.module.css";

export function LandingOfferStep({ children }: { children?: ReactNode }) {
  return (
    <section className="admin-section">
      <h2 className="admin-section__title">2. Offre</h2>
      <div className={styles.panel}>
        {children ?? <p className="admin-page__meta">Offre, canal WhatsApp et logique de conversion.</p>}
      </div>
    </section>
  );
}

export default LandingOfferStep;
