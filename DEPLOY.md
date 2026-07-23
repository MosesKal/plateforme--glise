# Guide de déploiement — CECJC Platform

Ce fichier est destiné à **Claude Code sur le serveur**. Il décrit comment déployer la plateforme CECJC de zéro ou mettre à jour une installation existante.

---

## Prérequis serveur

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- PostgreSQL 15+ (base de données `cecj_db` créée)
- PM2 (`npm install -g pm2`) pour garder les processus vivants
- Git configuré avec accès au dépôt

---

## Variables d'environnement

### Backend — `apps/backend/.env`

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/cecj_db

JWT_ACCESS_SECRET=<secret_long_aleatoire>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<autre_secret_long_aleatoire>
JWT_REFRESH_EXPIRES_IN=7d

PORT=3001
NODE_ENV=production
```

### Frontend — `apps/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=https://api.ton-domaine.com
```

> Si le frontend et le backend sont sur le même serveur : `NEXT_PUBLIC_API_URL=http://localhost:3001`

---

## Premier déploiement

```bash
# 1. Cloner le dépôt
git clone https://github.com/TON_USER/eglise.git cecj
cd cecj

# 2. Créer les fichiers .env (remplir avec les vraies valeurs)
cp apps/backend/.env.example apps/backend/.env   # ou créer manuellement
nano apps/backend/.env

# 3. Installer les dépendances (monorepo entier)
pnpm install --frozen-lockfile

# 4. Builder le package partagé (obligatoire avant backend et frontend)
pnpm --filter @cecj/shared build

# 5. Appliquer les migrations Prisma + générer le client
cd apps/backend
npx prisma migrate deploy
npx prisma generate
cd ../..

# 6. Builder le backend
pnpm --filter @cecj/backend build

# 7. Builder le frontend
pnpm --filter @cecj/frontend build

# 8. Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # pour redémarrage auto au reboot
```

---

## Mise à jour (déploiement suivant)

```bash
cd cecj

# 1. Récupérer les nouveaux commits
git pull origin main

# 2. Installer les nouvelles dépendances si pnpm-lock.yaml a changé
pnpm install --frozen-lockfile

# 3. Rebuilder le shared si modifié
pnpm --filter @cecj/shared build

# 4. Appliquer les nouvelles migrations Prisma (sans risque si aucune)
cd apps/backend
npx prisma migrate deploy
npx prisma generate
cd ../..

# 5. Rebuilder backend + frontend
pnpm --filter @cecj/backend build
pnpm --filter @cecj/frontend build

# 6. Redémarrer les processus
pm2 restart cecj-backend
pm2 restart cecj-frontend
```

---

## Configuration PM2

Créer le fichier `ecosystem.config.js` à la racine :

```js
module.exports = {
  apps: [
    {
      name: 'cecj-backend',
      script: 'apps/backend/dist/main.js',
      cwd: '/chemin/vers/cecj',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'cecj-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/chemin/vers/cecj/apps/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
```

---

## Vérification post-déploiement

```bash
# Status des processus
pm2 list

# Logs en temps réel
pm2 logs cecj-backend --lines 50
pm2 logs cecj-frontend --lines 50

# Tester l'API backend
curl http://localhost:3001/health   # ou un endpoint public

# Tester le frontend
curl -I http://localhost:3000
```

---

## Checklist complète d'une mise à jour

- [ ] `git pull origin main` réussi
- [ ] `pnpm install` si `pnpm-lock.yaml` a changé
- [ ] `pnpm --filter @cecj/shared build` si `packages/shared/` a changé
- [ ] `npx prisma migrate deploy` dans `apps/backend/` (toujours sans danger)
- [ ] `npx prisma generate` dans `apps/backend/`
- [ ] `pnpm --filter @cecj/backend build`
- [ ] `pnpm --filter @cecj/frontend build`
- [ ] `pm2 restart cecj-backend cecj-frontend`
- [ ] Vérifier `pm2 list` (status `online`)
- [ ] Vérifier les logs pour erreurs

---

## Nouveautés récentes à ne pas oublier

| Commit | Impact déploiement |
|---|---|
| `feat(upload)` — Multer + fichiers statiques | Le dossier `apps/backend/uploads/` doit être accessible. S'assurer que le répertoire existe et que le processus a les droits d'écriture. |
| `feat(cms)` — Gestion des pages | Migration `add_site_pages` sera appliquée par `prisma migrate deploy`. |
| `feat(gallery)` — Upload image couverture album | Même dossier `uploads/` que ci-dessus. |
| `feat(teachings)` — Module Enseignements audio | Voir la section dédiée ci-dessous (MEDIA_ROOT, ffmpeg, Nginx `/media/`). |

---

## Module Enseignements audio

### 1. Prérequis serveur

```bash
# ffprobe : extraction de la durée à l'upload
# ffmpeg  : transcodage async AAC-LC 96 kbps (+faststart) après chaque upload.
#           S'il est absent, les fichiers sont servis tels quels (aucun blocage),
#           mais on perd la compression et le démarrage rapide de la lecture.
sudo apt install -y ffmpeg

# Répertoire des médias HORS de l'arborescence applicative
# (survit aux redéploiements ; servi directement par Nginx)
sudo mkdir -p /var/lib/cecj/media
sudo chown <user_pm2>:<user_pm2> /var/lib/cecj/media
```

### 2. Variables d'environnement backend (`apps/backend/.env`)

```env
# Racine du stockage des médias (défaut si absent : ./media dans le cwd)
MEDIA_ROOT=/var/lib/cecj/media

# Optionnel : origine publique des URLs médias (défaut : domaine public backend)
# MEDIA_BASE_URL=https://api.campdejesusbelairfizi.com

# Optionnel : chemins de ffprobe/ffmpeg s'ils ne sont pas dans le PATH
# FFPROBE_PATH=/usr/bin/ffprobe
# FFMPEG_PATH=/usr/bin/ffmpeg

# Sync YouTube (enseignements vidéo) — clé API « YouTube Data API v3 »
# créée sur console.cloud.google.com, et ID de la chaîne (commence par UC…,
# visible dans YouTube Studio > Paramètres > Chaîne > Informations avancées).
# Sans ces variables, le module vidéo reste inactif (cron silencieux).
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
```

Le transcodage tourne dans le processus Node (file en mémoire, un fichier à la
fois) : au redémarrage de l'app, les jobs interrompus reprennent automatiquement
via la colonne `processing` (PENDING/PROCESSING). Un échec de transcodage passe
l'enseignement en `FAILED` mais conserve le fichier original, qui reste écoutable.

### 3. Nginx — servir l'audio SANS passer par Node (critique pour la lecture)

Ajouter dans le bloc `server` du domaine backend, AVANT le `location /` qui
proxifie vers Node :

```nginx
location /media/ {
    alias /var/lib/cecj/media/;
    add_header Cache-Control "public, max-age=31536000, immutable";
    access_log off;
}
```

Nginx gère nativement les requêtes Range (seek instantané) et `sendfile`.
Sans ce bloc, le fallback Express de main.ts sert quand même les fichiers
(fonctionnel mais moins performant).

Pour les uploads volumineux (fichiers audio jusqu'à 500 Mo), dans le même bloc
`server` :

```nginx
client_max_body_size 512m;
proxy_request_buffering off;
```

### 4. Vérification

```bash
# L'API du module répond
curl https://<domaine>/api/v1/teachings/themes

# Après un premier upload : le fichier est servi avec support Range
curl -I -H "Range: bytes=0-99" https://<domaine>/media/audio/<annee>/<fichier>
# → HTTP/1.1 206 Partial Content
```

### 5. Import de masse de la bibliothèque audio existante

Structure attendue : un dossier par thème, les fichiers audio dedans.
L'orateur (unique) est assigné à tout l'import. Le script copie les fichiers
(la bibliothèque source reste intacte), crée les thèmes manquants et lance le
transcodage AAC 96k — il est relançable sans créer de doublons.

```bash
# 1. Copier la bibliothèque sur le serveur
scp -r ./bibliotheque user@vps:/tmp/bibliotheque-audio

# 2. Prévisualiser le plan d'import (aucune écriture)
cd apps/backend
node dist/scripts/import-audio.js --dir /tmp/bibliotheque-audio \
  --speaker "Nom de l'orateur" --dry-run

# 3. Importer (retirer --dry-run) — attend la fin des transcodages avant de sortir
node dist/scripts/import-audio.js --dir /tmp/bibliotheque-audio \
  --speaker "Nom de l'orateur"

# En développement (depuis la racine du monorepo) :
pnpm --filter @cecj/backend import:audio -- --dir <chemin> --speaker "Nom" --dry-run
```

Options : `--status DRAFT` pour importer en brouillon (défaut : `PUBLISHED`),
`--dry-run` pour afficher le plan sans rien écrire.

### 6. Flux RSS podcast (distribution Spotify / Apple Podcasts / YouTube Music)

Le backend génère un flux RSS conforme podcast à partir des enseignements
audio `PUBLISHED`. URL publique à donner aux annuaires :

```
https://<domaine>/podcast.xml
```

(réécriture Next vers `/api/v1/teachings/podcast.xml` — les deux répondent).

Variables d'environnement backend, toutes optionnelles :

```env
# Requis par Apple Podcasts au moment de la soumission (sinon bloc owner omis)
PODCAST_OWNER_EMAIL=contact@example.org
# Apple exige une image carrée 1400–3000 px (JPG/PNG) — le fallback
# /pwa-icon/512 est trop petit pour la soumission Apple
PODCAST_IMAGE_URL=https://<domaine>/podcast-cover.jpg
# Personnalisation (défauts corrects sinon)
PODCAST_TITLE=Enseignements — C.E.C.J.C.
PODCAST_DESCRIPTION=...
PODCAST_AUTHOR=C.E.C.J.C.
```

Soumission (une seule fois, gratuite) :
- **Spotify** : https://creators.spotify.com → « Ajouter votre podcast » → coller l'URL du flux
- **Apple Podcasts** : https://podcastsconnect.apple.com (nécessite `PODCAST_OWNER_EMAIL` — Apple envoie un code de vérification à cette adresse)
- **YouTube Music** : https://studio.youtube.com → Créer → « Nouveau podcast » → « Envoyer un flux RSS »

Vérification : `curl -I https://<domaine>/podcast.xml` → `200` +
`application/rss+xml`. Valider le flux sur https://podba.se/validate/ avant
de soumettre.

---

## En cas de problème

### Prisma : erreur de migration
```bash
cd apps/backend
npx prisma migrate status   # voir l'état
npx prisma migrate deploy   # appliquer ce qui manque
```

### Port déjà utilisé
```bash
lsof -i :3001   # voir quel process utilise le port
pm2 delete cecj-backend && pm2 start ecosystem.config.js --only cecj-backend
```

### Build frontend qui échoue (mémoire)
```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm --filter @cecj/frontend build
```
