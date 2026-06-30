# Growth CMS — Méthode TMS®

Production-ready CMS for international campaign landings, destinations, offers, WhatsApp, CRM routing, tracking, and SEO.

## Quick start

```bash
pnpm install
cp .env.example .env
# Set DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET

pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm exec tsx prisma/seed.ts
pnpm dev
```

Admin: `/admin/login` → Growth Dashboard at `/admin/growth`.

## Database migrations

| Migration | Purpose |
|-----------|---------|
| `20260617180000_add_admin_settings` | Admin settings table |
| `20260617230000_add_article_studio_seo_intelligence` | Article Studio + SEO intelligence |
| `20260630000000_baseline` | Idempotent core schema (articles, leads, media, landing sections) |
| `20260630100000_growth_cms_complete` | 13 Growth models + LeadSubmission/MediaAsset extensions |

**Production:** always use `prisma migrate deploy` (not `db push` alone).

Regenerate baseline after schema changes (pre-Growth only):

```bash
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o prisma/migrations/_full_diff.sql
node prisma/scripts/build-baseline-migration.mjs
```

## Workflow: new destination → live landing

1. **Destination** — `/admin/destinations/new` — city, locales, currency, status `LIVE`
2. **Offer** — `/admin/offers/new` — type, duration, CTAs, `showPrice`
3. **WhatsApp** — `/admin/whatsapp/new` — phone, locale messages, test wa.me link
4. **Tracking** — `/admin/tracking/new` — Meta/TikTok/GA4/GTM toggles
5. **CRM Routing** — `/admin/crm-routing/new` — tags, pipeline, workflow, priority
6. **Landing** — `/admin/landings/new` — template `MOBILE_WHATSAPP_FIRST`, copy blocks JSON, readiness ≥ 80 to publish
7. **Publish** — set status `LIVE`, `noindex: false` for sitemap inclusion
8. **Redirects** (optional) — `/admin/redirects` — 301 from legacy URLs

Public URL: `/{locale}/{slug}` (e.g. `/en/mexico-city-french-body-reset`).

## CDMX seed

When `SEED_GROWTH_CDMX !== "0"` (default), seed creates:

- Destination `cdmx`, Founder Session offer, WhatsApp, tracking, CRM rule
- 3 landings (EN/ES/FR) with new slugs
- `RedirectRule` 301 from legacy CDMX URLs

Legacy static routes redirect via `next.config.ts` to CMS slugs.

## APIs

| Endpoint | Role |
|----------|------|
| `POST /api/lead` | Lead capture → Prisma → GHL (with CRM routing) |
| `POST /api/events` | Pixel events → `PixelEventLog` + daily metrics |

## Readiness gate

Landings require readiness score ≥ 80 before `LIVE` unless admin sets `publishOverride`. See `/admin/landings/[id]/edit`.

## Health & SEO

- **Growth Dashboard** — `/admin/growth` — KPIs per destination
- **SEO Health** — `/admin/seo-health` — readiness + SEO issues
- **Health Checks** — `/admin/health` — DB, GHL, pixels, migrations

## Environment variables

See `.env.example` for GHL, Resend, pixels, WhatsApp, and Growth flags.

Key Growth vars:

- `NEXT_PUBLIC_CDMX_WHATSAPP_NUMBER` — CDMX WhatsApp digits
- `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_ID`
- `SEED_GROWTH_CDMX=0` — skip CDMX seed
