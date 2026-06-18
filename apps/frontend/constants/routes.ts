export const SITE_ROUTES = {
  accueil:       "/",
  organisation:  "/organisation",
  apropos:       "/a-propos",
  presentation:  "/presentation",
  vision:        "/vision",
  mission:       "/mission",
  leadership:    "/leadership",
  extensions:    "/extensions",
  galerie:       "/galerie",
  evenements:    "/evenements",
  contact:       "/contact",
} as const

export const AUTH_ROUTES = {
  login:    "/login",
  register: "/register",
} as const

export const ADMIN_ROUTES = {
  dashboard:    "/admin",
  utilisateurs: "/admin/utilisateurs",
  roles:        "/admin/roles",
  evenements:   "/admin/evenements",
  galerie:      "/admin/galerie",
  extensions:   "/admin/extensions",
  pages:        "/admin/pages",
} as const

export const ROUTES = {
  ...SITE_ROUTES,
  ...AUTH_ROUTES,
  ...ADMIN_ROUTES,
} as const
