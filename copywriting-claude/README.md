# Sauvegarde copywriting-claude

Instantané créé le 8 juin 2026 avant toute nouvelle modification éditoriale.

## Contenu

- `source/src/` : copie complète des sources actuelles, incluant tous les textes visibles, traductions FR/EN/ES, métadonnées SEO, CTA, formulaires et textes de l'assistant éditorial.
- `source/prisma/schema.prisma` : structure du CMS articles et sections.
- `source/prisma/seed.ts` : seed Prisma actuel.

## Points d'entrée principaux du copywriting

- `source/src/data/copy.ts`
- `source/src/app/landing-page.tsx`
- `source/src/app/biography-page.tsx`
- `source/src/app/seances-page.tsx`
- `source/src/app/workshops-page.tsx`
- `source/src/app/[lang]/luxury-hospitality/page.tsx`
- `source/src/components/SharedHeader.tsx`
- `source/src/components/SharedFooter.tsx`
- `source/src/components/SharedContactForm.tsx`
- `source/src/components/BookingExperience.tsx`
- `source/src/lib/seo.ts`

## Limite

Les contenus dynamiques stockés dans PostgreSQL ne sont pas inclus, car aucune variable `DATABASE_URL` n'était disponible lors de la sauvegarde.
