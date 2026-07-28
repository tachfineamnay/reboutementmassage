export const GHL_INTENT_VALUES = {
  private_session: "Private Session",
  hospitality_partner: "Hospitality Partner",
  training: "Training",
  workshop: "Workshop",
  partnership: "Partnership",
  other: "Other",
} as const;

export type GhlIntentKey = keyof typeof GHL_INTENT_VALUES;

export const GHL_SYSTEM_TAGS = {
  sourceSitePremium: "source-site-premium",
  training: "intent_training",
  privateSession: "intent_private_session",
  partnership: "intent_partnership",
} as const;

export const GHL_SYSTEM_TAG_VALUES = new Set<string>(Object.values(GHL_SYSTEM_TAGS));

export const GHL_CUSTOM_FIELDS = {
  intention: { label: "Intention", env: "GHL_FIELD_INTENTION_ID" },
  mainObjective: { label: "Main Objective", env: "GHL_FIELD_MAIN_OBJECTIVE_ID" },
  mainObstacle: { label: "Main Obstacle", env: "GHL_FIELD_MAIN_OBSTACLE_ID" },
  priorExperience: { label: "Prior Experience", env: "GHL_FIELD_PRIOR_EXPERIENCE_ID" },
  readiness: { label: "Readiness", env: "GHL_FIELD_READINESS_ID" },
  timingUrgency: { label: "Timing / Urgency", env: "GHL_FIELD_TIMING_URGENCY_ID" },
  currentLocation: { label: "Current Location", env: "GHL_FIELD_CURRENT_LOCATION_ID" },
  zonesOfInterest: { label: "Zones of Interest", env: "GHL_FIELD_ZONES_OF_INTEREST_ID" },
  chosenFormat: { label: "Chosen Format", env: "GHL_FIELD_CHOSEN_FORMAT_ID" },
  sessionLocationPreference: {
    label: "Session Location Preference",
    env: "GHL_FIELD_SESSION_LOCATION_PREFERENCE_ID",
  },
  knownContraindication: {
    label: "Known Contraindication",
    env: "GHL_FIELD_KNOWN_CONTRAINDICATION_ID",
  },
  preSessionNotes: { label: "Pre-Session Notes", env: "GHL_FIELD_PRE_SESSION_NOTES_ID" },
  qualificationScore: {
    label: "Qualification Score",
    env: "GHL_FIELD_QUALIFICATION_SCORE_ID",
  },
  roleFunction: { label: "Role / Function", env: "GHL_FIELD_ROLE_FUNCTION_ID" },
  companyEstablishment: {
    label: "Company / Establishment",
    env: "GHL_FIELD_COMPANY_ESTABLISHMENT_ID",
  },
  establishmentType: {
    label: "Establishment Type",
    env: "GHL_FIELD_ESTABLISHMENT_TYPE_ID",
  },
  numberOfParticipants: {
    label: "Number of Participants",
    env: "GHL_FIELD_NUMBER_OF_PARTICIPANTS_ID",
  },
  duration: { label: "Duration", env: "GHL_FIELD_DURATION_ID" },
  hasSpaceToHostTraining: {
    label: "Has Space to Host Training",
    env: "GHL_FIELD_HAS_SPACE_TO_HOST_TRAINING_ID",
  },
  currentPracticeSummary: {
    label: "Current Practice Summary",
    env: "GHL_FIELD_CURRENT_PRACTICE_SUMMARY_ID",
  },
  currentSessionPrice: {
    label: "Current Session Price",
    env: "GHL_FIELD_CURRENT_SESSION_PRICE_ID",
  },
  internalNotes: { label: "Internal Notes", env: "GHL_FIELD_INTERNAL_NOTES_ID" },
  webinarDate: { label: "Webinar Date", env: "GHL_FIELD_WEBINAR_DATE_ID" },
  formLanguage: { label: "Form Language", env: "GHL_FIELD_FORM_LANGUAGE_ID" },
  marketingConsent: { label: "Marketing Consent", env: "GHL_FIELD_MARKETING_CONSENT_ID" },
  informalTone: { label: "OK to Use Informal Tone", env: "GHL_FIELD_INFORMAL_TONE_ID" },
  otherSpecify: { label: "Other (Please Specify)", env: "GHL_FIELD_OTHER_SPECIFY_ID" },
} as const;

export type GhlCustomFieldKey = keyof typeof GHL_CUSTOM_FIELDS;

export function resolveGhlIntentValue(intent: string | null | undefined) {
  if (!intent) return null;
  if (intent in GHL_INTENT_VALUES) {
    return GHL_INTENT_VALUES[intent as GhlIntentKey];
  }
  throw new Error(`UNKNOWN_GHL_INTENT:${intent}`);
}

export function getConfiguredGhlFieldId(
  key: GhlCustomFieldKey,
  env: NodeJS.ProcessEnv = process.env
) {
  const value = env[GHL_CUSTOM_FIELDS[key].env]?.trim();
  return value || null;
}

export function isCanonicalGhlSystemTag(tag: string) {
  return GHL_SYSTEM_TAG_VALUES.has(tag);
}
