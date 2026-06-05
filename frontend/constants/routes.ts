// ─── Site public ─────────────────────────────────────────────────────────────
export const SITE_ROUTES = {
  accueil:       "/",
  presentation:  "/presentation",
  vision:        "/vision",
  mission:       "/mission",
  leadership:    "/leadership",
  extensions:    "/extensions",
  galerie:       "/galerie",
  evenements:    "/evenements",
  contact:       "/contact",
} as const

// ─── Authentification ─────────────────────────────────────────────────────────
export const AUTH_ROUTES = {
  login:    "/login",
  register: "/register",
} as const

// ─── Backoffice ───────────────────────────────────────────────────────────────
export const ADMIN_ROUTES = {
  dashboard:    "/admin",
  utilisateurs: "/admin/utilisateurs",
  utilisateur:  (id: string) => `/admin/utilisateurs/${id}`,
  roles:        "/admin/roles",
  evenements:   "/admin/evenements",
  galerie:      "/admin/galerie",
  extensions:   "/admin/extensions",
  pages:        "/admin/pages",
} as const

// ─── Raccourci global ─────────────────────────────────────────────────────────
export const ROUTES = {
  ...SITE_ROUTES,
  ...AUTH_ROUTES,
  ...ADMIN_ROUTES,
} as const
