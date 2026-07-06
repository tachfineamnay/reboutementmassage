import type { ReactNode } from "react";
import styles from "./LandingBuilder.module.css";

export function LandingBuilderShell({
  title = "Builder page locale",
  description = "Wizard progressif : marché, offre, hero, preuves, conversion, SEO.",
  children,
  sidebar,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  sidebar?: ReactNode;
}) {
  return (
    <div className="admin-page admin-page--wide">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{title}</h1>
          <p className="admin-page__meta">{description}</p>
        </div>
      </div>
      <div className={styles.layout}>
        <div>{children}</div>
        {sidebar ? <aside className={styles.sidebar}>{sidebar}</aside> : null}
      </div>
    </div>
  );
}
