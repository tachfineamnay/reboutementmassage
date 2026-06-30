import { FORBIDDEN_MEDICAL_TERMS } from "@/lib/growth/types";

export function scanComplianceText(text: string): string[] {
  const violations: string[] = [];
  for (const pattern of FORBIDDEN_MEDICAL_TERMS) {
    if (pattern.test(text)) {
      violations.push(pattern.source);
    }
  }
  return violations;
}

export function hasComplianceIssues(...texts: Array<string | null | undefined>): boolean {
  return texts.some((t) => t && scanComplianceText(t).length > 0);
}
