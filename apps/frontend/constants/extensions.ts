export type ExtensionType   = "siege" | "locale" | "fille" | "point_priere"
export type ExtensionStatus = "active" | "establishing"
export type Continent       = "rdc" | "afrique" | "europe"

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
  // ── RDC — Lubumbashi & environs ──────────────────────────────────
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
    pastor:      "Pasteur Paulin Mambwe",
    founded:     "2016",
    members:     "2 000+",
    lat:         -11.6609,
    lng:          27.4795,
  },
  {
    id:          "lubumbashi-katuba",
    name:        "Camp de Jésus-Christ Katuba",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Lubumbashi",
    address:     "Quartier Katuba, Lubumbashi",
    pastor:      "Pasteur Emmanuel Kabwe",
    founded:     "2019",
    lat:         -11.7012,
    lng:          27.4601,
  },
  {
    id:          "likasi",
    name:        "Camp de Jésus-Christ Likasi",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Likasi",
    pastor:      "Pasteur Samuel Ilunga",
    founded:     "2020",
    lat:         -10.9839,
    lng:          26.7322,
  },
  {
    id:          "kolwezi",
    name:        "Camp de Jésus-Christ Kolwezi",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kolwezi",
    pastor:      "Pasteur Daniel Mutombo",
    founded:     "2021",
    lat:         -10.7167,
    lng:          25.4667,
  },
  {
    id:          "pweto",
    name:        "Camp de Jésus-Christ Pweto",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Pweto",
    pastor:      "Pasteur Joseph Mulumba",
    founded:     "2020",
    lat:         -8.4694,
    lng:          28.8984,
  },
  {
    id:          "kalemie",
    name:        "Camp de Jésus-Christ Kalemie",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kalemie",
    pastor:      "Pasteur Pierre Lukwebo",
    founded:     "2021",
    lat:         -5.9475,
    lng:          29.1964,
  },
  {
    id:          "fizi",
    name:        "Camp de Jésus-Christ Fizi",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Fizi",
    pastor:      "Pasteur Isaac Ngoy",
    founded:     "2018",
    lat:         -4.2989,
    lng:          29.1118,
  },
  {
    id:          "kamituga",
    name:        "Camp de Jésus-Christ Kamituga",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kamituga",
    pastor:      "Pasteur Théophile Amisi",
    founded:     "2019",
    lat:         -3.0442,
    lng:          28.1789,
  },
  {
    id:          "bukavu",
    name:        "Camp de Jésus-Christ Bukavu",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Bukavu",
    pastor:      "Pasteur Caleb Bisimwa",
    founded:     "2020",
    lat:         -2.4978,
    lng:          28.8594,
  },
  {
    id:          "goma",
    name:        "Camp de Jésus-Christ Goma",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Goma",
    pastor:      "Pasteur Nathan Bauma",
    founded:     "2022",
    lat:         -1.6818,
    lng:          29.2256,
  },
  {
    id:          "kinshasa",
    name:        "Camp de Jésus-Christ Kinshasa",
    type:        "fille",
    status:      "active",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Kinshasa",
    pastor:      "Pasteur David Lufungula",
    founded:     "2022",
    lat:         -4.3217,
    lng:          15.3222,
  },
  {
    id:          "mbuji-mayi",
    name:        "Camp de Jésus-Christ Mbuji-Mayi",
    type:        "fille",
    status:      "establishing",
    continent:   "rdc",
    country:     "République Démocratique du Congo",
    countryCode: "CD",
    city:        "Mbuji-Mayi",
    pastor:      "Pasteur Élias Tshiswaka",
    founded:     "2023",
    lat:         -6.1360,
    lng:          23.5900,
  },

  // ── Afrique ──────────────────────────────────────────────────────
  {
    id:          "lusaka",
    name:        "Camp de Jésus-Christ Lusaka",
    type:        "fille",
    status:      "active",
    continent:   "afrique",
    country:     "Zambie",
    countryCode: "ZM",
    city:        "Lusaka",
    pastor:      "Pasteur Jonathan Mwansa",
    founded:     "2021",
    lat:         -15.4166,
    lng:          28.2833,
  },
  {
    id:          "bujumbura",
    name:        "Camp de Jésus-Christ Bujumbura",
    type:        "fille",
    status:      "active",
    continent:   "afrique",
    country:     "Burundi",
    countryCode: "BI",
    city:        "Bujumbura",
    pastor:      "Pasteur Fiston Ndayishimiye",
    founded:     "2021",
    lat:         -3.3869,
    lng:          29.3600,
  },
  {
    id:          "kigali",
    name:        "Camp de Jésus-Christ Kigali",
    type:        "point_priere",
    status:      "establishing",
    continent:   "afrique",
    country:     "Rwanda",
    countryCode: "RW",
    city:        "Kigali",
    founded:     "2023",
    lat:         -1.9441,
    lng:          30.0619,
  },
  {
    id:          "johannesburg",
    name:        "Camp de Jésus-Christ Johannesburg",
    type:        "fille",
    status:      "active",
    continent:   "afrique",
    country:     "Afrique du Sud",
    countryCode: "ZA",
    city:        "Johannesburg",
    pastor:      "Pasteur Benjamin Kabila",
    founded:     "2022",
    lat:         -26.2041,
    lng:          28.0473,
  },
  {
    id:          "luanda",
    name:        "Camp de Jésus-Christ Luanda",
    type:        "point_priere",
    status:      "establishing",
    continent:   "afrique",
    country:     "Angola",
    countryCode: "AO",
    city:        "Luanda",
    founded:     "2024",
    lat:         -8.8368,
    lng:          13.2343,
  },

  // ── Europe ───────────────────────────────────────────────────────
  {
    id:          "bruxelles",
    name:        "Camp de Jésus-Christ Bruxelles",
    type:        "fille",
    status:      "active",
    continent:   "europe",
    country:     "Belgique",
    countryCode: "BE",
    city:        "Bruxelles",
    pastor:      "Pasteur Matthieu Kazadi",
    founded:     "2020",
    lat:          50.8503,
    lng:           4.3517,
  },
  {
    id:          "paris",
    name:        "Camp de Jésus-Christ Paris",
    type:        "fille",
    status:      "active",
    continent:   "europe",
    country:     "France",
    countryCode: "FR",
    city:        "Paris",
    pastor:      "Pasteur Marc Mbuyi",
    founded:     "2021",
    lat:          48.8566,
    lng:           2.3522,
  },
  {
    id:          "liege",
    name:        "Camp de Jésus-Christ Liège",
    type:        "point_priere",
    status:      "establishing",
    continent:   "europe",
    country:     "Belgique",
    countryCode: "BE",
    city:        "Liège",
    founded:     "2023",
    lat:          50.6326,
    lng:           5.5797,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function flagEmoji(code: string): string {
  const offset = 0x1f1e6 - "A".charCodeAt(0)
  return [...code.toUpperCase()].map((c) => String.fromCodePoint(c.charCodeAt(0) + offset)).join("")
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R   = 6371
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
  rdc:     { fr: "RD Congo",  en: "DR Congo" },
  afrique: { fr: "Afrique",   en: "Africa"   },
  europe:  { fr: "Europe",    en: "Europe"   },
}

export const TYPE_LABELS: Record<ExtensionType, { fr: string; en: string }> = {
  siege:        { fr: "Siège",           en: "Main Church"    },
  locale:       { fr: "Église locale",   en: "Local Church"   },
  fille:        { fr: "Église fille",    en: "Church Plant"   },
  point_priere: { fr: "Point de prière", en: "Prayer Point"   },
}
