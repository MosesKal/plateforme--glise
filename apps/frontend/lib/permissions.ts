/**
 * Miroir frontend des règles d'accès du backend (décorateurs @Roles des
 * contrôleurs Nest — source de vérité). Sert à masquer dans l'UI ce que
 * l'API refuserait de toute façon : la sécurité réelle reste côté serveur.
 */

export type AdminResource =
  | "dashboard"
  | "teachings"
  | "events"
  | "schedule"
  | "gallery"
  | "testimonies"
  | "contact"
  | "pages"
  | "extensions"
  | "departments"
  | "leaders"
  | "users"
  | "roles"

const SA  = "Super Admin"
const AG  = "Administrateur Général"
const RC  = "Responsable Communication"
const MOD = "Modérateur"

/** Liste vide = accessible à tout utilisateur authentifié. */
const ACCESS: Record<AdminResource, string[]> = {
  dashboard:   [],
  teachings:   [SA, AG, RC],
  events:      [SA, AG, RC],
  schedule:    [SA, AG, RC],
  gallery:     [SA, AG, RC],
  pages:       [SA, AG, RC],
  testimonies: [SA, AG, MOD],
  contact:     [SA, AG],
  extensions:  [SA, AG],
  departments: [SA, AG],
  leaders:     [SA, AG],
  users:       [SA, AG],
  roles:       [SA, AG],
}

// Insensible aux accents et à la casse — les noms en base ont été seedés sans
// accents (« Administrateur General »), le code les écrit avec.
function normalize(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

export function canAccess(
  roleName: string | null | undefined,
  resource: AdminResource,
): boolean {
  if (!roleName) return false
  const allowed = ACCESS[resource]
  if (allowed.length === 0) return true
  const role = normalize(roleName)
  return allowed.some((r) => normalize(r) === role)
}

/** Préfixes de chemins /admin/... → ressource (pour le gate du layout admin). */
const PATH_RESOURCES: Array<[prefix: string, resource: AdminResource]> = [
  ["/admin/utilisateurs",  "users"],
  ["/admin/roles",         "roles"],
  ["/admin/evenements",    "events"],
  ["/admin/programme",     "schedule"],
  ["/admin/galerie",       "gallery"],
  ["/admin/extensions",    "extensions"],
  ["/admin/enseignements", "teachings"],
  ["/admin/temoignages",   "testimonies"],
  ["/admin/departements",  "departments"],
  ["/admin/leaders",       "leaders"],
  ["/admin/contact",       "contact"],
  ["/admin/pages",         "pages"],
]

export function resourceForPath(pathname: string): AdminResource {
  const found = PATH_RESOURCES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
  return found ? found[1] : "dashboard"
}
