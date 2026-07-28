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

- `BookingExperience` stays in place temporarily but is legacy.
- Local simulated booking slots are not the target architecture.
- `CampaignLeadForm` is legacy unless a new usage is proven.
- `copywriting-claude/source` is a historical snapshot, not the active stack.

## Pipeline routing ownership

- GHL workflows own pipeline creation and movement.
- The site should collect the form, tags and fields, then trigger the configured workflow.
- A contact must not remain in two pipelines after routing.

## Decisions still requiring GHL IDs or URLs

- Confirm workflow IDs per intention.
- Confirm calendar URLs for training, workshop and private session.
- Confirm custom field IDs or stable keys for every field currently mapped by visible name.
- Confirm the single target pipeline strategy for unqualified contacts.
