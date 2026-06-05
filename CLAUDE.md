# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Projet

**CECJ Platform — Communauté des Eglise Camps de Jésus-Christ**

Plateforme web officielle de la C.E.C.J. Monorepo avec `backend/` (NestJS) et `frontend/` (Next.js).

Objectifs :
- Présentation de l'église et de ses extensions
- Diffusion des enseignements (vidéo, audio, PDF)
- Gestion des événements
- Communication avec les membres
- Administration centralisée via un backoffice sécurisé
- Architecture pensée pour la croissance internationale (multi-pays, multi-villes, multi-extensions)

---

## Stack technique

### Frontend — `frontend/` (port 3000)

| Outil | Rôle |
|---|---|
| Next.js 15 (App Router) | Framework React SSR/SSG |
| TypeScript strict | Typage |
| Tailwind CSS v4 | Styles utilitaires |
| Shadcn UI | Composants UI (à intégrer) |
| React Query | Data fetching & cache serveur |
| Zustand | État client global (auth, UI) |
| react-hook-form + Zod | Formulaires et validation |
| Axios | Client HTTP (intercepteurs JWT) |

### Backend — `backend/` (port 3001)

| Outil | Rôle |
|---|---|
| NestJS + TypeScript | Framework backend |
| Prisma ORM | Accès base de données |
| PostgreSQL | Base de données principale |
| JWT + Refresh Token | Authentification |
| RBAC | Contrôle d'accès par rôle |
| Stockage S3-compatible | Médias (AWS S3 / Cloudflare R2 / MinIO) |

---

## Identité visuelle

### Palette de couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Principale (vert profond) | `#024339` | Header, boutons principaux, éléments importants |
| Secondaire (or) | `#ffcb32` | Accents, bordures, icônes, éléments premium |
| Accent (rouge) | `#fe0107` | Alertes, CTA forts, éléments symboliques |
| Neutre clair | `#F8F9FA` / `#E9ECEF` | Fonds, séparateurs |

### Typographie

- **Titres & corps** : Montserrat
- **Éléments décoratifs** : Brittany Signature

### Style UI attendu

Moderne, élégant, spirituel, professionnel, Mobile First.
Inspirations : Hillsong, Elevation Church, Transformation Church, Bethel Church.

---

## Commandes

### Frontend

```bash
cd frontend
npm run dev       # http://localhost:3000
npm run build
npm run lint
```

### Backend

```bash
cd backend
npm run start:dev       # http://localhost:3001 (watch mode)
npm run build
npm run test
npm run test:e2e
npm run test -- --testPathPattern=<fichier>
npm run lint
```

### Prisma (dans `backend/`)

```bash
npx prisma migrate dev --name <nom>
npx prisma generate
npx prisma studio
```

---

## Architecture frontend (`frontend/`)

```
app/
  page.tsx          → / (Accueil — homepage publique avec Navbar + Footer intégrés)
  layout.tsx        → Root layout : Montserrat, html/body
  globals.css       → Palette CECJ (--color-cecj-green, --color-cecj-gold, --color-cecj-red)

  (site)/           → Site public (layout : Navbar + PublicFooter)
    presentation/   → /presentation
    vision/         → /vision
    mission/        → /mission
    leadership/     → /leadership
    extensions/     → /extensions
    galerie/        → /galerie
    evenements/     → /evenements
    contact/        → /contact

  (auth)/           → /login, /register  (layout centré)

  (admin)/          → Backoffice (layout : AdminSidebar + Header)
    admin/          → /admin (tableau de bord)
      utilisateurs/ → /admin/utilisateurs
      roles/        → /admin/roles
      evenements/   → /admin/evenements
      galerie/      → /admin/galerie
      extensions/   → /admin/extensions
      pages/        → /admin/pages

components/
  ui/               → Button, Input, Badge, Card (primitives sans logique métier)
  layout/
    Navbar.tsx      → navigation publique sticky (vert CECJ + logo blanc)
    AdminSidebar.tsx→ sidebar backoffice (logo + nav admin)
    Header.tsx      → header backoffice (profil utilisateur + déconnexion)
    PublicFooter.tsx→ footer du site public
  shared/           → PageHeader, StatCard

features/           → domaines métier
  auth/             → LoginForm, RegisterForm, useAuth
  membres/          → MemberList, useMembers
  extensions/       → (à implémenter)

lib/
  api/client.ts     → axios instance + intercepteurs (token mémoire, refresh auto 401)
  api/auth.ts       → endpoints auth
  api/membres.ts    → endpoints membres
  validations/      → schémas Zod (auth.ts, membre.ts)
  utils.ts          → cn(), formatDate(), formatCurrency(), getInitials()

store/
  auth.store.ts     → user + accessToken (Zustand) — setAuth() synchronise axios
  ui.store.ts       → sidebarOpen

types/
  models.ts         → User, Membre, Evenement, Groupe, Don
  api.ts            → ApiError, PaginatedResponse, AuthResponse

constants/
  routes.ts         → SITE_ROUTES, AUTH_ROUTES, ADMIN_ROUTES (tous exportés + ROUTES fusionné)
  config.ts         → CONFIG.apiUrl, CONFIG.appName, CONFIG.appFullName

hooks/
  useDebounce.ts    → hook générique de debounce
```

---

## Roadmap fonctionnelle

### MVP (priorité)

**Site public** : Accueil, Présentation, Vision, Mission, Leadership, Extensions, Galerie, Contact, Événements

**Backoffice** : Auth, Gestion utilisateurs, Gestion rôles, Gestion pages, Gestion événements, Gestion galerie, Gestion extensions

### Version 1

Enseignements (vidéo, audio, PDF), Témoignages, Départements, Newsletter

### Version 2

Carte interactive des extensions, Recherche d'extensions, Gestion multi-extensions, Inscriptions aux événements, Statistiques

### Version 3

Espace membres, Demandes de prières, Notifications, Application mobile

---

## Gestion des rôles (RBAC)

| Rôle | Périmètre |
|---|---|
| Super Admin | Accès complet |
| Administrateur Général | Gestion globale |
| Responsable Communication | Actualités, galerie, témoignages, médias |
| Responsable Extension | Sa propre extension uniquement |
| Responsable Département | Son propre département uniquement |
| Modérateur | Validation des contenus |

---

## Entités principales

```
User          id, firstName, lastName, email, password, roleId, status
Role          id, name, permissions
Extension     id, name, country, city, address, phone, email, pastor, latitude, longitude
Event         id, title, description, startDate, endDate, location, coverImage
Sermon        id, title, speaker, description, videoUrl, audioUrl, pdfUrl
Department    id, name, description, leader
Gallery       id, title, type, mediaUrl
Testimony     id, fullname, content, status
```

---

## Conventions importantes

- **Alias `@/`** → racine du frontend (ex : `@/components/ui/Button`)
- **Route groups** `(auth)` et `(dashboard)` → n'ajoutent pas de segment dans l'URL
- **`"use client"`** requis sur tout composant utilisant hooks, événements, stores
- **Token d'accès** stocké en mémoire (jamais `localStorage`) — refresh auto sur 401 via `lib/api/client.ts`
- **Ajout d'un domaine** : créer `features/<domaine>/`, `lib/api/<domaine>.ts`, `lib/validations/<domaine>.ts`, puis la page dans `app/(dashboard)/<domaine>/`
- **i18n** : prévoir les structures pour Français et Anglais dès le départ
- **SEO** : chaque page doit avoir un `title` unique, une `meta description`, et des Open Graph générés automatiquement

---

## Principes de développement

- TypeScript strict partout
- SOLID et Clean Architecture
- Conventions NestJS et Next.js officielles
- Composants réutilisables, constantes centralisées, zéro duplication
- Code maintenable et évolutif pour la croissance internationale
