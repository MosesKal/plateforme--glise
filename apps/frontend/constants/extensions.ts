export type ExtensionType   = "siege" | "fille" | "point_priere"
export type ExtensionStatus = "active" | "establishing"
export type Continent       = "rdc" | "afrique"

export interface Extension {
  id: string
  name: string
  type: ExtensionType
  status: ExtensionStatus
  continent: Continent
  country: string
  countryCode: string
  city: string
  address?: string
  phone?: string
  pastor?: string
  founded?: string
  members?: string
  lat: number
  lng: number
}

export const EXTENSIONS: Extension[] = [
  // ── RDC — Lubumbashi ─────────────────────────────────────────────
  {
    id:          "lubumbashi-belair",
    name:        "Camp de Jésus-Christ Bel-Air Fizi",
    type:        "siege",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Lubumbashi",
    address:     "13 Av. Bondo, Bel-Air Kilobelobe, Réf. Arrêt Fizi",
    phone:       "+243 898 700 596",
    pastor:      "Apôtre Paulin Mambwe",
    founded:     "2016",
    members:     "2 000+",
    lat:         -11.6609,
    lng:          27.4795,
  },

  // ── RDC — Kolwezi ────────────────────────────────────────────────
  {
    id:          "kolwezi-salongo",
    name:        "Camp de Jésus-Christ Salongo",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kolwezi",
    pastor:      "Pasteur Thomas",
    founded:     "2020",
    lat:         -10.7200,
    lng:          25.4700,
  },

  // ── RDC — Likasi ─────────────────────────────────────────────────
  {
    id:          "likasi",
    name:        "Camp de Jésus-Christ Likasi",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Likasi",
    pastor:      "Pasteur Louis",
    founded:     "2020",
    lat:         -10.9839,
    lng:          26.7322,
  },

  // ── RDC — Sakania ────────────────────────────────────────────────
  {
    id:          "sakania",
    name:        "Camp de Jésus-Christ Sakania",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Sakania",
    pastor:      "Pasteur Sarton",
    founded:     "2020",
    lat:         -12.7444,
    lng:          28.5694,
  },

  // ── RDC — Kipushi ────────────────────────────────────────────────
  {
    id:          "kipushi",
    name:        "Camp de Jésus-Christ Kipushi",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kipushi",
    pastor:      "Pasteur Jéremie",
    founded:     "2020",
    lat:         -11.7667,
    lng:          27.2500,
  },

  // ── RDC — Kinshasa ───────────────────────────────────────────────
  {
    id:          "kinshasa-ngaliema",
    name:        "Camp de Jésus-Christ Kinshasa-Ngaliema",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kinshasa",
    pastor:      "Pasteur Alain",
    founded:     "2020",
    lat:         -4.3100,
    lng:          15.2600,
  },
  {
    id:          "kinshasa-mongafula",
    name:        "Camp de Jésus-Christ Kinshasa-Mongafula",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kinshasa",
    pastor:      "Pasteur Messie",
    founded:     "2021",
    lat:         -4.4264,
    lng:          15.2300,
  },
  {
    id:          "kinshasa-kalembelembe",
    name:        "Camp de Jésus-Christ Kinshasa-Kalembelembe",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kinshasa",
    pastor:      "Pasteur Elie Tshinguli",
    founded:     "2022",
    lat:         -4.3795,
    lng:          15.2892,
  },

  // ── Afrique ──────────────────────────────────────────────────────
  {
    id:          "uganda-kampala",
    name:        "Camp de Jésus-Christ Uganda",
    type:        "fille",
    status:      "active",
    continent:   "afrique",
    country:     "Uganda",
    countryCode: "UG",
    city:        "Kampala",
    pastor:      "Pasteur Big",
    founded:     "2023",
    lat:          0.3476,
    lng:          32.5825,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function flagEmoji(code: string): string {
  const offset = 0x1f1e6 - "A".charCodeAt(0)
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(c.charCodeAt(0) + offset)).join("")
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const CONTINENT_LABELS: Record<Continent, { fr: string; en: string }> = {
  rdc:     { fr: "RD Congo", en: "DR Congo" },
  afrique: { fr: "Afrique",  en: "Africa"   },
}

export const TYPE_LABELS: Record<ExtensionType, { fr: string; en: string }> = {
  siege:        { fr: "Siège",           en: "Main Church"  },
  fille:        { fr: "Église fille",    en: "Church Plant" },
  point_priere: { fr: "Point de prière", en: "Prayer Point" },
}
