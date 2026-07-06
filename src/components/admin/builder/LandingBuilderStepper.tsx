import styles from "./LandingBuilder.module.css";

const BUILDER_STEPS = ["Marché", "Offre", "Hero", "Preuves", "Conversion", "SEO", "Preview"];

export function LandingBuilderStepper({ currentStep = 0 }: { currentStep?: number }) {
  return (
    <ol className={styles.stepper}>
      {BUILDER_STEPS.map((step, index) => (
        <li
          key={step}
          className={`${styles.step} ${index === currentStep ? styles.stepActive : ""}`}
        >
          {index + 1}. {step}
        </li>
      ))}
    </ol>
  );
}
