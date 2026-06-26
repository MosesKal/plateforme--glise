# Guide de déploiement — CECJ Platform

Ce fichier est destiné à **Claude Code sur le serveur**. Il décrit comment déployer la plateforme CECJ de zéro ou mettre à jour une installation existante.

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
