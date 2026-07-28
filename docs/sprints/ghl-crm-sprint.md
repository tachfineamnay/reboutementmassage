# GHL CRM sprint

## Canonical routes

- Main site routes keep using their existing localized URLs and the official shared form.
- Static CDMX ES route: `/es/reset-corporal-frances-cdmx`.
- Dynamic CDMX EN route: `/en/mexico-city-french-body-reset`.
- Dynamic CDMX FR route: `/fr/french-body-reset-mexico-city`.
- Historical redirects stay active:
  - `/en/mexico-city-private-session` -> `/en/mexico-city-french-body-reset`
  - `/es/sesion-privada-cdmx` -> `/es/reset-corporal-frances-cdmx`
  - `/fr/seance-privee-mexico-city` -> `/fr/french-body-reset-mexico-city`

## Official form

- `src/components/SharedContactForm.tsx` remains the official form for the main site.
- Do not change its design during this sprint.
- CRM values must follow `docs/crm-reference-for-tajfine.md`.
- Tags keep their canonical spelling, especially underscores.

## Official CDMX landing

- `/es/reset-corporal-frances-cdmx` is the official ES landing.
- It is static, WhatsApp-first, and independent from PostgreSQL.
- The dynamic PostgreSQL ES landing with the same slug must not be recreated as `LIVE`.
- Post-deployment manual action: find the existing ES dynamic DB entry where `locale=ES` and `slug=reset-corporal-frances-cdmx`, then set it to `PAUSED` or `ARCHIVED` from the admin/DB. Do not delete it automatically.

## Legacy components

- `BookingExperience` and local simulated booking slots were retired after GHL calendar handoff.
- `CampaignLeadForm` was removed after `git grep` confirmed no active imports.
- `copywriting-claude/source` is a historical snapshot, not the active stack.
- `copywriting-claude/source` is excluded from TypeScript, ESLint and Docker context; propose deletion in a separate cleanup.

## Pipeline routing ownership

- GHL workflows own pipeline creation and movement.
- The site collects the form and required fields, then sends the trigger tags and enrolls the contact in the configured workflow.
- A site lead is never considered `SENT_TO_GHL` unless mandatory workflow enrollment succeeds.
- A contact must not remain in two pipelines after routing.

## Final handoff hardening

- `/api/lead` uses `handleLeadRequestHardened`.
- Admin retry uses `retryLeadSubmissionGhlHardened`.
- GHL tags, notes and tasks are buffered per request with `AsyncLocalStorage`.
- Required-field failure clears the buffer, so no trigger tag reaches GHL.
- Successful handoff order is `tags → note → task → workflow`.
- Missing workflow returns `partial` with `GHL_WORKFLOW_NOT_CONFIGURED`.
- Failed enrollment returns `partial` with `GHL_WORKFLOW_ENROLLMENT_FAILED`.
- Body Reset Fix resolves `Destination.slug = cdmx` server-side and does not depend on a dynamic ES landing.
- The compatibility guard is isolated to the public lead route and admin retry; other server fetches pass through unchanged.

## Decisions still requiring GHL IDs or URLs

- Confirm workflow IDs per intention.
- Confirm calendar URLs for training, workshop and private session.
- Confirm existing GHL custom field IDs for every field currently mapped by visible name.
- Confirm the single target pipeline strategy for unqualified contacts.
