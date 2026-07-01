# Growth CMS — Méthode TMS®

Moteur CMS complet de production pour la gestion multilingue des campagnes, destinations, offres, canaux WhatsApp, routages CRM (GHL), tracking de pixels, redirections dynamiques, expériences A/B, et médiathèque.

## Quick start

```bash
pnpm install
cp .env.example .env
# Configurer DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET

pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm exec tsx prisma/seed.ts
pnpm dev
```

Console d'administration : `/admin/login` → Dashboard de Growth sur `/admin/growth`.

## Architecture des modules avancés

### 1. Médiathèque & Gestion des Assets (`/admin/media`)
- **Types supportés** : `IMAGE`, `VIDEO`, `POSTER`, `DOCUMENT`.
- **Upload local** : Enregistre les fichiers dans le stockage persistant (configuré via `UPLOAD_DIR`, avec fallback local dans `./uploads/`).
- **Liens externes** : Permet de référencer des URLs de vidéos (YouTube, Vimeo, CDN externe) sans consommer d'espace disque.
- **Diagnostics de poids** : Alerte si la taille du fichier dépasse 2 Mo pour éviter de ralentir les mobiles en 3G/4G.
- **Suivi d'usages** : Indique précisément sur combien de pages landings et de témoignages chaque média est utilisé avant de permettre sa suppression sécurisée.
- **Balises Alt** : Exige et valide des descriptions Alt multilingues (`altFr`, `altEn`, `altEs`) pour garantir un SEO et une accessibilité irréprochables.

### 2. Témoignages & Système de Fallback (`/admin/testimonials`)
- **Sélection explicite** : Une page de destination peut lier un ou plusieurs témoignages spécifiques via `testimonialIds`.
- **Moteur de Fallback intelligent** : Si aucun témoignage n'est sélectionné, le système interroge la base de données de manière asynchrone pour trouver le témoignage `LIVE` le plus pertinent en fonction de :
  - La même **destination**
  - La même **langue (locale)**
  - Le consentement de publication sur site web (`consentWebsite = true`)
  - Le tri par **priorité décroissante** combiné aux scores émotionnels et de crédibilité.
- **Lecteur vidéo premium** : Intègre les sous-titres (`subtitlesUrl`) et l'image d'illustration (poster) configurée dans la médiathèque.

### 3. Expériences A/B Testing (`/admin/experiments`)
- **Attribution stable par cookie** : L'attribution d'un visiteur à une variante A/B est persistée via le cookie de session `exp_[id_experience]` pour éviter tout clignotement ou changement de variante lors de la navigation.
- **Surcharges supportées (Overrides)** :
  - `heroTitle`, `heroSubtitle`, `primaryCta`
  - Témoignage alternatif (`testimonialId`)
  - Blocs de contenus complexes via fusion JSON (`contentOverrides`)
- **Intégrité SEO** : Les balises canoniques (`<link rel="canonical">`) pointent systématiquement vers la version d'origine sans paramètre A/B, protégeant l'indexation contre le duplicate content.
- **Bannière de débogage** : Une bannière explicative s'affiche en mode `preview` pour permettre aux administrateurs de valider l'affichage de chaque variante.
- **Attribution des conversions** : L'ID de la variante active est injecté dans le tunnel de tracking `/api/events` pour incrémenter les compteurs d'impressions, de clics WhatsApp, de clics booking, et de leads soumis par variante.

### 4. Indicateurs & Santé Opérationnelle (`/admin/health`)
- **Health Checks d'infrastructure** :
  - Test de connexion PostgreSQL (ping DB).
  - Test de permissions d'écriture sur le dossier d'uploads local.
  - Audit de présence des clés secrètes GHL (Go High Level).
  - Diagnostic des profils de tracking actifs et de l'intégrité des numéros WhatsApp (format E.164).
- **Audit SEO international (`/admin/seo-health`)** :
  - Détection des `hreflang` manquants ou incohérents.
  - Détection des conflits de slugs et des balises `x-default` manquantes.
- **Rapports d'erreurs en temps réel** :
  - Journalisation des 5 derniers logs d'événements de tracking de pixels.
  - Journalisation des 5 derniers échecs de routage de leads vers le CRM Go High Level, avec affichage des messages d'erreur retournés par l'API.

## Workflow : ajouter une nouvelle destination (ex: Saint-Barth)

Pour ouvrir une nouvelle destination sur le site de manière autonome :
1. **Destination** — `/admin/destinations/new` — Définir `Saint-Barth`, les langues (`FR`, `EN`), la devise (`EUR`), et le statut `LIVE`.
2. **Canal WhatsApp** — `/admin/whatsapp/new` — Associer un numéro de téléphone avec les messages d'accueil préremplis en français et en anglais.
3. **Profil de Tracking** — `/admin/tracking/new` — Configurer les IDs de pixel Meta, TikTok ou Google Analytics spécifiques à cette région.
4. **Routage CRM** — `/admin/crm-routing/new` — Définir les tags GHL spécifiques (ex: `lead-saint-barth`) et le pipeline de conversion associé.
5. **Médias** — `/admin/media` — Uploader les visuels locaux de la villa ou de la plage avec leurs textes Alt.
6. **Témoignage** — `/admin/testimonials/new` — Créer ou lier un témoignage d'un client local en statut `LIVE` et `consentWebsite: true`.
7. **Landing Page** — `/admin/landings/new` — Remplir les textes via l'éditeur visuel complet, associer la destination, l'offre, le profil de tracking et WhatsApp, et publier. Le sitemap et les métadonnées SEO internationales s'actualiseront instantanément.

## APIs & Tracking

| Point d'accès | Rôle |
|---|---|
| `POST /api/lead` | Ingestions de leads, qualification, attribution d'UTMs, et routage CRM |
| `POST /api/events` | Réception des événements de clics / vues, journalisation de pixel, et incrémentation des variantes A/B |
