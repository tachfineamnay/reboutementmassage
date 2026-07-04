# CDMX Option B — Rapport d'audit et déploiement

Date : 2026-07-04

## Fichiers inspectés

- `next.config.ts`
- `prisma/seed-growth-cdmx.ts`
- `src/data/campaign-landings.ts`
- `src/components/campaign/OfferBlock.tsx`
- `src/components/campaign/ShortLeadForm.tsx`
- `src/lib/campaign-tracking.ts`
- `src/lib/growth/landing-config.ts`
- `src/app/[lang]/[slug]/page.tsx`
- `src/app/dynamic-landing-page.tsx`
- `src/app/sitemap.ts`
- `src/proxy.ts` (RedirectRule dynamique — Next.js 16 utilise `proxy.ts` natif, pas `middleware.ts`)
- `src/components/GoogleAnalytics.tsx`

## Problèmes trouvés

1. Redirects CDMX absents dans `next.config.ts`
2. Pages legacy statiques encore présentes (`sesion-privada-cdmx`, etc.)
3. Contenu ES obsolète (pas Body Reset Fix/Full, mauvais H1, anciennes routes)
4. Seed avec `update: {}` — landings existantes non mises à jour
5. Variable GA4 incorrecte (`NEXT_PUBLIC_GA_MEASUREMENT_ID` + fallback hardcodé)
6. `ShortLeadForm` simplifié — champs ES-MX étendus non affichés
7. `landing-config.ts` ignorait `content.shortForm` et `content.offerBlocks`
8. `OfferBlock` mono-offre uniquement
9. Sitemap fallback exposait les anciennes URLs via `getCdmxCampaignAlternates()`

## Problèmes corrigés

| Zone | Correction |
|------|------------|
| Redirects | 301 permanents CDMX dans `next.config.ts` |
| Legacy | Suppression des 3 pages statiques + `cdmx-private-session-route.tsx` |
| Contenu ES | H1 Body Reset — CDMX, dual-offre Fix/Full, FAQ courte, WhatsApp Fix/Full |
| Routes | Canoniques ES/EN/FR + alternates sitemap |
| Seed | Upsert complet (contenu, shortForm, offerBlocks, RedirectRule) |
| GA4 | `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, pas de fallback hardcodé |
| Formulaire | Mode étendu ES (nom, zone, offre, urgence, message) + payload API complet |
| Mapping CMS | `landing-config.ts` lit `content.shortForm` et `content.offerBlocks` |
| OfferBlock | Rendu dual-offre via `offerBlocks` |

## Fichiers modifiés

- `next.config.ts`
- `prisma/seed-growth-cdmx.ts`
- `src/data/campaign-landings.ts`
- `src/lib/growth/landing-config.ts`
- `src/components/campaign/OfferBlock.tsx`
- `src/components/campaign/ShortLeadForm.tsx`
- `src/components/GoogleAnalytics.tsx`
- `CDMX_OPTION_B_AUDIT.md` (ce fichier)

## Fichiers supprimés

- `src/app/[lang]/sesion-privada-cdmx/page.tsx`
- `src/app/[lang]/mexico-city-private-session/page.tsx`
- `src/app/[lang]/seance-privee-mexico-city/page.tsx`
- `src/app/cdmx-private-session-route.tsx`

## Commandes lancées

```bash
pnpm exec prisma validate   # OK
pnpm exec tsc --noEmit      # OK
pnpm lint                   # OK (warnings préexistants hors CDMX, 0 errors)
pnpm build                  # OK
```

## Résultat des commandes

- **prisma validate** : schéma valide
- **tsc --noEmit** : aucune erreur
- **lint** : 0 erreurs (17 warnings admin/hors scope CDMX)
- **build** : succès — Proxy (Middleware) actif via `src/proxy.ts`

## Risques restants

- **Seed non exécuté en prod** : les landings dynamiques 404 tant que `sh ./scripts/run-seed.sh` n'a pas tourné (après redeploy avec seed bundle)
- **RedirectRule DB** : complète les redirects `next.config` ; nécessite DB + seed
- **Contenu EN/FR** : routes migrées ; copy encore orientée « 75 min private session » (hors scope ES)
- **Fallback WhatsApp** : `33665517735` si `NEXT_PUBLIC_CDMX_WHATSAPP_NUMBER` absent — configurer en prod

## Instructions Coolify

### Variables d'environnement

```
NEXT_PUBLIC_CDMX_WHATSAPP_NUMBER=<digits only, Mexico>
NEXT_PUBLIC_GA4_MEASUREMENT_ID=<GA4 ID>
SEED_GROWTH_CDMX=1
DATABASE_URL=<postgres>
SITE_URL=https://<domaine>
```

### Post-déploiement (terminal conteneur)

```sh
cd /app
./node_modules/.bin/prisma validate
sh ./scripts/run-migrate-deploy.sh
sh ./scripts/run-seed.sh
```

### Vérifications curl

```sh
curl -I https://<domaine>/es/sesion-privada-cdmx
# → 301/308 Location: .../es/reset-corporal-frances-cdmx

curl -I https://<domaine>/es/reset-corporal-frances-cdmx
# → 200

curl -s https://<domaine>/sitemap.xml | grep reset-corporal-frances-cdmx
# → présent avec hreflang
```

## Smoke tests manuels

| # | Test | Attendu |
|---|------|---------|
| 1 | `GET /es/reset-corporal-frances-cdmx` | Landing Body Reset ES, indexable, canonical `/es/reset-corporal-frances-cdmx` |
| 2 | `GET /es/sesion-privada-cdmx` | 301/308 → `/es/reset-corporal-frances-cdmx` |
| 3 | `GET /en/mexico-city-private-session` | 301 → `/en/mexico-city-french-body-reset` |
| 4 | `GET /fr/seance-privee-mexico-city` | 301 → `/fr/french-body-reset-mexico-city` |
| 5 | Formulaire ES | LeadSubmission avec `needType` (zone), `intent` (offerIntent), `urgency`, `branchData.offerIntent`, `branchData.urgency`, `landingPageId`, `destinationId`, `offerId` |
| 6 | CTA WhatsApp | `wa.me/{CDMX_NUMBER}` — messages orientation Fix/Full, sticky Body Reset |

### Détail formulaire ES (payload `/api/lead`)

- `firstName` : nom réel saisi
- `contact` : WhatsApp
- `needType` : zone prioritaria
- `intent` : offerIntent (`body_reset_fix`, `french_body_reset_full`, `unsure`)
- `urgency` : urgence choisie
- `context` : offre + message optionnel
- `currentLocation` : zone
- `branchData.offerIntent`, `branchData.urgency`
- `landingPageId`, `destinationId`, `offerId`

### Détail WhatsApp ES

| Intent | Message |
|--------|---------|
| default | Orientation Body Reset Fix ou French Body Reset Full |
| book_intent | Réservation Body Reset Fix |
| more_info_intent | Information French Body Reset Full |
| sticky_cta | Réservation Body Reset |

Numéro : `NEXT_PUBLIC_CDMX_WHATSAPP_NUMBER` (via WhatsappChannel seedé ou fallback statique sitemap-off).
