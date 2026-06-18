export type ProgramCategory = "Prière" | "Famille" | "Enseignement" | "Adoration"

export interface ProgramActivity {
  id: string
  days: string[]
  title: string
  startTime: string
  endTime: string
  category: ProgramCategory
  /** Diffusé en direct sur la chaîne YouTube de l'église */
  liveOnYoutube?: boolean
  /** Photos du culte publiées sur la page Facebook après l'événement */
  facebookPhotosAfter?: boolean
}

export const WEEKLY_PROGRAM: ProgramActivity[] = [
  {
    id: "culte-matinal",
    days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    title: "Culte Matinal",
    startTime: "06:00",
    endTime: "07:00",
    category: "Prière",
  },
  {
    id: "culte-mamans",
    days: ["Mardi"],
    title: "Culte des Mamans",
    startTime: "16:00",
    endTime: "17:30",
    category: "Famille",
  },
  {
    id: "nuit-de-priere",
    days: ["Mardi"],
    title: "Nuit de prière",
    startTime: "21:00",
    endTime: "00:00",
    category: "Prière",
    liveOnYoutube: true,
  },
  {
    id: "enseignements-et-prieres",
    days: ["Mercredi", "Jeudi"],
    title: "Culte d'enseignements et prières",
    startTime: "12:00",
    endTime: "18:00",
    category: "Enseignement",
    liveOnYoutube: true,
  },
  {
    id: "reunion-de-priere",
    days: ["Vendredi"],
    title: "Réunion de prière",
    startTime: "08:30",
    endTime: "18:00",
    category: "Prière",
    liveOnYoutube: true,
  },
  {
    id: "culte-dominical",
    days: ["Dimanche"],
    title: "Culte de Dimanche",
    startTime: "08:00",
    endTime: "11:00",
    category: "Adoration",
    liveOnYoutube: true,
    facebookPhotosAfter: true,
  },
]
