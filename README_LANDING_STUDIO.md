# TMS Landing Studio

Le Landing Studio ajoute une expérience visuelle Puck pour les pages locales, sans supprimer le mode expert existant.

## Routes

- `/admin/pages` : liste Studio des landings Prisma.
- `/admin/pages/new` : création guidée existante, avec initialisation Puck automatique.
- `/admin/pages/[id]/studio` : édition visuelle Puck.
- `/admin/pages/[id]/settings` : état, liens preview/live et accès expert.
- `/admin/landings` et `/admin/landings/[id]/edit` restent disponibles comme mode expert.

## Stockage

La source de vérité reste `LandingPage.content`.

Les nouvelles pages stockent :

```json
{
  "editor": "puck",
  "builderVersion": 1,
  "puckData": {
    "root": {
      "props": {
        "pageStyle": "premium-reset",
        "density": "conversion",
        "locale": "FR"
      }
    },
    "content": []
  }
}
```

Aucune table Prisma n'est ajoutée en V1. Les anciennes pages ne sont pas migrées automatiquement ; le Studio affiche un écran “Créer une version Studio” et sauvegarde un brouillon initialisé.

## Blocs V1

Les blocs autorisés sont strictement validés par Zod dans `src/lib/builder/puck-data-schema.ts` :

- `HeroSection`
- `PainChipsSection`
- `ProofBadgesSection`
- `OfferSection`
- `DifferenceSection`
- `TestimonialSection`
- `ProcessSection`
- `LeadFormSection`
- `FAQSection`
- `FinalCtaSection`

Les blocs enveloppent les composants campagne existants. Le schéma refuse les blocs inconnus et les props libres de style ou d'exécution : pas de CSS libre, HTML brut, script, iframe, couleur, font, margin ou padding libre.

## Rendu Public

`src/components/landing/LandingRenderer.tsx` est le point d'entrée unique :

- si `content.puckData` est valide, il rend `<Render config={puckConfig} data={puckData} />`;
- sinon il fallback vers `MobileWhatsappFirstLanding`.

Le pipeline existant dans `src/app/dynamic-landing-page.tsx` conserve le même contexte tracking, médias, variantes A/B et preview.

## Preview

`TrackingProvider` accepte `previewMode`.

En preview :

- les pixels GA4, Meta et TikTok sont désactivés ;
- `trackGrowthEvent`, `/api/events` et les bridges pixels ne sont pas appelés depuis le provider ;
- le formulaire court ne poste pas vers `/api/lead`.

## Publication

Les actions Studio recalculent la readiness et écrivent un audit log :

- `savePuckDataAction`
- `publishLandingAction`
- `unpublishLandingAction`
- `archiveLandingAction`
- `generatePreviewTokenAction`

La publication passe en `LIVE` uniquement si la readiness est au moins `80`, sans issue critique. La publication lève alors `noindex`.

## Validation Locale

Commandes de validation utilisées pour ce chantier :

```sh
pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```
