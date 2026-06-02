# Guide d'Administration et de Déploiement Coolify

Ce document fournit toutes les instructions nécessaires pour configurer, déployer et administrer l'application sur un serveur Coolify avec une base de données PostgreSQL.

---

## 1. Variables d'Environnement (.env)

Voici la liste des variables d'environnement requises à configurer dans Coolify ou dans votre fichier `.env` de production :

### Base de données & Sécurité
- `DATABASE_URL` : URL de connexion PostgreSQL (ex: `postgresql://user:password@host:port/dbname?schema=public`).
- `ADMIN_EMAIL` : Adresse email de l'administrateur principal.
- `ADMIN_PASSWORD` : Mot de passe de l'administrateur principal.
- `SESSION_SECRET` : Clé secrète de chiffrement des cookies de session (générez une chaîne longue et aléatoire).
- `SITE_URL` : URL publique du site (ex: `https://votre-domaine.fr`).

### Uploads d'Images
- `UPLOAD_DIR` : Chemin absolu vers le volume d'upload. En production Coolify, utilisez `/app/storage/uploads`.
- `UPLOAD_PUBLIC_PATH` : Préfixe public de l'URL des uploads. Utilisez `/uploads`.

### Intégration Google APIs (Optionnel)
*Si ces variables sont absentes, l'application passera en mode dégradé "non configuré" de manière transparente sans crash.*
- `GOOGLE_CLIENT_ID` : Google Client ID OAuth 2.0.
- `GOOGLE_CLIENT_SECRET` : Google Client Secret OAuth 2.0.
- `GOOGLE_REFRESH_TOKEN` : Google Refresh Token OAuth 2.0.
- `GOOGLE_SEARCH_CONSOLE_SITE_URL` : URL du site dans Search Console (ex: `sc-domain:votre-domaine.fr` ou `https://votre-domaine.fr`).
- `GA4_PROPERTY_ID` : Identifiant de la propriété Google Analytics 4.
- `PAGESPEED_API_KEY` : Clé d'API publique PageSpeed Insights (facultatif mais recommandé).

---

## 2. Configuration des Volumes sur Coolify

Pour éviter la perte des images uploadées lors du redémarrage ou de la mise à jour des conteneurs Docker (déploiements sans état), vous devez monter un volume persistant.

### Procédure de configuration sur Coolify :
1. Dans le tableau de bord de votre application sur Coolify, allez dans l'onglet **Storage** (ou Stockage).
2. Ajoutez un nouveau montage de volume persistant :
   - **Nom du volume** : `tms-uploads` (ou le nom de votre choix).
   - **Destination dans le conteneur** : `/app/storage`.
3. Configurez les variables d'environnement correspondantes :
   - `UPLOAD_DIR=/app/storage/uploads`
   - `UPLOAD_PUBLIC_PATH=/uploads`
4. De cette façon, tous les fichiers enregistrés dans `/app/storage` persisteront sur l'hôte Docker.

---

## 3. Commandes Utiles

### Base de données (Prisma)
- **Générer le client Prisma** :
  ```bash
  npx prisma generate
  ```
- **Synchroniser le schéma en production** (le Dockerfile le fait automatiquement au démarrage si `DATABASE_URL` est défini) :
  ```bash
  npx prisma db push
  ```
- **Créer une nouvelle migration en développement** :
  ```bash
  npx prisma migrate dev --name <nom_de_la_migration>
  ```
- **Lancer Prisma Studio** (interface graphique locale) :
  ```bash
  npx prisma studio
  ```

### Build & Démarrage
- **Lancer en développement** :
  ```bash
  npm run dev
  ```
- **Compiler pour la production** :
  ```bash
  npm run build
  ```
- **Démarrer en production** :
  ```bash
  npm run start
  ```
- **Lancer le typecheck** :
  ```bash
  npx tsc --noEmit
  ```
- **Lancer le linter** :
  ```bash
  npm run lint
  ```

---

## 4. Workflow de Publication d'Article

Pour publier un nouvel article ou une "story" sur le site public :

1. **Création** : Connectez-vous sur `/admin`, allez sur `/admin/articles` et cliquez sur "+ Écrire une story".
2. **Rédaction** : Saisissez le titre et le contenu via l'éditeur Tiptap. Vous pouvez téléverser des images en ligne ou en couverture.
3. **Paramétrage SEO** : 
   - Dans l'onglet **SEO**, remplissez le mot-clé principal, le titre SEO et la méta description.
   - Corrigez les anomalies relevées dans la table d'audit de santé ou par le score SEO intégré.
4. **Validation de l'état** : Passez l'état de l'article de `DRAFT` à `READY` (Prêt à publier).
5. **Publication** : Cliquez sur "Publier". L'article reçoit une date de publication, passe à l'état `PUBLISHED` et devient immédiatement visible sur le flux public `/stories` et dans le fichier `sitemap.xml`.
6. **Performance Google** (si configuré) :
   - Dans l'onglet **Performances** de l'article, vous pouvez inspecter l'état d'indexation réel sur Google via le bouton "Inspecter l'URL".
   - Lancer un audit de performance mobile via le bouton "Lancer PageSpeed".
   - Consulter le trafic et les conversions GA4 (sessions, lectures, clics sur CTA).

---

## 5. Checklist de Déploiement Coolify

Avant de marquer le déploiement comme prêt :

- [ ] **Base de données** : Le service PostgreSQL est actif et accessible depuis le conteneur Next.js via `DATABASE_URL`.
- [ ] **Champs requis** : Les variables `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `SESSION_SECRET` sont renseignées dans la configuration de l'application Coolify.
- [ ] **Configuration de volume** : Le volume persistant est monté sur le chemin `/app/storage`.
- [ ] **Variables d'upload** : `UPLOAD_DIR` est bien configuré sur `/app/storage/uploads` et `UPLOAD_PUBLIC_PATH` sur `/uploads`.
- [ ] **Adresse de site** : `SITE_URL` pointe sur l'URL de domaine de production finale (ex: `https://votre-domaine.fr`), nécessaire pour la génération du sitemap.xml, des redirections et des métadonnées canoniques.
- [ ] **Initialisation Prisma** : le démarrage Docker exécute `prisma db push`, sauf si `SKIP_DB_PUSH=1` est défini.
