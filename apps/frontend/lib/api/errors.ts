import { AxiosError } from "axios"

/**
 * Traducteur central des erreurs API : toute erreur axios est normalisée en
 * ApiError avec un message français prêt à afficher. Le backend renvoie un
 * contrat unique { statusCode, message: string | string[] } (HttpExceptionFilter).
 */

export interface ApiError {
  /** Statut HTTP, ou null si le serveur n'a pas répondu (réseau, timeout). */
  status: number | null
  /** Message principal, en français, prêt à afficher. */
  message: string
  /** Détails de validation (400 class-validator), bruts, pour affichage secondaire. */
  details: string[]
}

/** Contexte d'affichage : affine certains messages (ex. 401 au login ≠ 401 en session). */
export type ApiErrorContext = "login" | "changePassword" | "default"

// ── Messages backend connus (exacts) → français ────────────────────────────────
const KNOWN_MESSAGES: Record<string, string> = {
  "Invalid credentials":            "Email ou mot de passe incorrect.",
  "Account is not active":          "Votre compte est inactif ou suspendu. Contactez un administrateur.",
  "Email already in use":           "Cet email est déjà utilisé.",
  "Role name already in use":       "Ce nom de rôle est déjà utilisé.",
  "Role not found":                 "Rôle introuvable.",
  "User not found":                 "Utilisateur introuvable.",
  "Refresh token invalid or expired": "Votre session a expiré. Reconnectez-vous.",
  "Current password incorrect":     "Mot de passe actuel incorrect.",
  "Only Super Admin can change email or password":
    "Seul le Super Admin peut modifier l'email ou le mot de passe d'un utilisateur.",
  "Cannot delete your own account": "Vous ne pouvez pas supprimer votre propre compte.",
}

// ── Messages backend dynamiques (préfixe) → français ──────────────────────────
const KNOWN_PREFIXES: Array<[prefix: string, fr: string]> = [
  ["Cannot delete role", "Impossible de supprimer ce rôle : des utilisateurs y sont encore rattachés."],
]

// ── Fallbacks par statut HTTP ──────────────────────────────────────────────────
function fallbackForStatus(status: number, context: ApiErrorContext): string {
  switch (status) {
    case 400:
      return "Certaines informations sont invalides. Vérifiez le formulaire."
    case 401:
      return context === "login"
        ? "Email ou mot de passe incorrect."
        : context === "changePassword"
          ? "Mot de passe actuel incorrect."
          : "Votre session a expiré. Reconnectez-vous."
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action."
    case 404:
      return "La ressource demandée est introuvable."
    case 409:
      return "Cette opération entre en conflit avec des données existantes."
    case 413:
      return "Le fichier envoyé est trop volumineux."
    case 429:
      return "Trop de tentatives. Patientez un instant puis réessayez."
    default:
      return status >= 500
        ? "Une erreur est survenue côté serveur. Réessayez dans un instant."
        : "Une erreur est survenue. Réessayez."
  }
}

function translate(raw: string, status: number, context: ApiErrorContext): string {
  if (KNOWN_MESSAGES[raw]) return KNOWN_MESSAGES[raw]
  const prefix = KNOWN_PREFIXES.find(([p]) => raw.startsWith(p))
  if (prefix) return prefix[1]
  return fallbackForStatus(status, context)
}

export function parseApiError(
  err: unknown,
  context: ApiErrorContext = "default",
): ApiError {
  if (err instanceof AxiosError) {
    // Le serveur n'a pas répondu : réseau coupé, backend éteint, timeout.
    if (!err.response) {
      return {
        status: null,
        message: "Impossible de joindre le serveur. Vérifiez votre connexion.",
        details: [],
      }
    }

    const status = err.response.status
    const raw = (err.response.data as { message?: string | string[] } | undefined)
      ?.message

    // Validation class-validator : message = tableau de détails par champ.
    if (Array.isArray(raw)) {
      return {
        status,
        message: fallbackForStatus(400, context),
        details: raw,
      }
    }

    return {
      status,
      message:
        typeof raw === "string"
          ? translate(raw, status, context)
          : fallbackForStatus(status, context),
      details: [],
    }
  }

  return {
    status: null,
    message: "Une erreur inattendue est survenue. Réessayez.",
    details: [],
  }
}
