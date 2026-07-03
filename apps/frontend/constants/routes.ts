export const SITE_ROUTES = {
  accueil:         "/",
  organisation:    "/organisation",
  apropos:         "/a-propos",
  presentation:    "/presentation",
  vision:          "/vision",
  mission:         "/mission",
  leadership:      "/leadership",
  extensions:      "/extensions",
  adhesion:        "/adhesion",
  galerie:         "/galerie",
  enseignements:   "/enseignements",
  evenements:      "/evenements",
  temoignages:     "/temoignages",
  departements:    "/departements",
  contact:         "/contact",
  lectureBiblique: "/lecture-biblique",
} as const

export const AUTH_ROUTES = {
  login:    "/login",
  register: "/register",
} as const

export const ADMIN_ROUTES = {
  dashboard:     "/admin",
  utilisateurs:  "/admin/utilisateurs",
  roles:         "/admin/roles",
  evenements:    "/admin/evenements",
  programme:     "/admin/programme",
  galerie:       "/admin/galerie",
  extensions:    "/admin/extensions",
  enseignements: "/admin/enseignements",
  temoignages:   "/admin/temoignages",
  departements:  "/admin/departements",
  leaders:       "/admin/leaders",
  contact:       "/admin/contact",
  pages:         "/admin/pages",
} as const

export const ROUTES = {
  ...SITE_ROUTES,
  ...AUTH_ROUTES,
  ...ADMIN_ROUTES,
} as const
