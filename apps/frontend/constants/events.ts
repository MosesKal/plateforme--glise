export interface ChurchEvent {
  id: string
  title: string
  category: string
  organizer?: string
  speaker?: string
  dateLabel: string
  day: string
  month: string
  time: string
  location: string
  image: string
  /** ISO date (YYYY-MM-DD) — premier jour de l'événement */
  startDate: string
  /** ISO date (YYYY-MM-DD) — dernier jour, utilisé pour déterminer si l'événement est passé */
  endDate: string
}

export const CHURCH_EVENTS: ChurchEvent[] = [
  {
    id: "action-affranchis-2",
    title: "Action Affranchis 2",
    category: "Louange & Adoration",
    organizer: "Le Chantre Agréable de Christ",
    dateLabel: "Dimanche 12 Juillet 2026",
    day: "12",
    month: "Juil.",
    time: "14h30 – 18h00",
    location: "13 Av. Bondo, Bel-Air (Réf. Arrêt Fizi), Lubumbashi",
    image: "/event_avenir.jpeg",
    startDate: "2026-07-12",
    endDate: "2026-07-12",
  },
  {
    id: "confbib-eglise-jerusalem",
    title: "Conférence Biblique — L'Église de Jérusalem",
    category: "Conférence Biblique",
    organizer: "École des Lecteurs de la Bible",
    speaker: "Apôtre Paulin Mambwe",
    dateLabel: "28 & 29 Mars 2026",
    day: "28-29",
    month: "Mars",
    time: "14h30 – 18h00",
    location: "Église Le Camp de Jésus-Christ, Bel-Air",
    image: "/event_avenir_2.jpeg",
    startDate: "2026-03-28",
    endDate: "2026-03-29",
  },
  {
    id: "je-connais-ma-bible",
    title: "Je Connais Ma Bible — 1ère édition",
    category: "Concours Biblique",
    organizer: "Communauté des Églises Le Camp de Jésus-Christ",
    dateLabel: "Dimanche 22 Février 2026",
    day: "22",
    month: "Fév.",
    time: "14h00",
    location: "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
    image: "/event_avenir_3.jpeg",
    startDate: "2026-02-22",
    endDate: "2026-02-22",
  },
  {
    id: "consecration-pasteurs",
    title: "Consécration des Pasteurs",
    category: "Culte spécial",
    speaker: "Pasteur Élie Tshinguli",
    dateLabel: "Dimanche 23 Novembre 2025",
    day: "23",
    month: "Nov.",
    time: "08h00 – 11h00",
    location: "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
    image: "/event_avenir_4.jpeg",
    startDate: "2025-11-23",
    endDate: "2025-11-23",
  },
  {
    id: "personnages-feminins-bible",
    title: "Les Personnages Féminins dans la Bible",
    category: "Conférence des Femmes",
    organizer: "Maman Karine Tumba, Maman Wivine Bobo, Maman Valine Kalem",
    dateLabel: "25 & 26 Octobre 2025",
    day: "25-26",
    month: "Oct.",
    time: "13h00 – 18h00",
    location: "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
    image: "/event_avenir_5.jpeg",
    startDate: "2025-10-25",
    endDate: "2025-10-26",
  },
]

export function isEventUpcoming(event: ChurchEvent): boolean {
  const end = new Date(`${event.endDate}T23:59:59`)
  return end.getTime() >= Date.now()
}
