import type { CrmRoutingRule, Locale, OfferType } from "@prisma/client";

export type CrmRoutingMatchInput = {
  destinationId: string;
  locale?: Locale | null;
  offerType?: OfferType | null;
  source?: string | null;
  intent?: string | null;
  leadSegment?: string | null;
};

function ruleMatches(rule: CrmRoutingRule, input: CrmRoutingMatchInput): boolean {
  if (rule.status !== "ACTIVE") return false;
  if (rule.destinationId !== input.destinationId) return false;
  if (rule.locale && input.locale && rule.locale !== input.locale) return false;
  if (rule.offerType && input.offerType && rule.offerType !== input.offerType) return false;
  if (rule.source && input.source && rule.source !== input.source) return false;
  if (rule.intent && input.intent && rule.intent !== input.intent) return false;
  if (rule.leadSegment && input.leadSegment && rule.leadSegment !== input.leadSegment) return false;
  return true;
}

export function matchCrmRoutingRule(
  rules: CrmRoutingRule[],
  input: CrmRoutingMatchInput
): CrmRoutingRule | null {
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);
  return sorted.find((rule) => ruleMatches(rule, input)) ?? null;
}

export function parseTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === "string");
  return [];
}

export function parseCustomFields(fields: unknown): Record<string, string> {
  if (fields && typeof fields === "object" && !Array.isArray(fields)) {
    return Object.fromEntries(
      Object.entries(fields as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
    );
  }
  return {};
}
