export interface ChurchInfo {
  name: string
  slogan: string
  welcomeMessage: string
  location: {
    district: string
    city: string
    country: string
    fullAddress: string
  }
  contact: {
    phone: string
  }
  socials: {
    facebookName?: string
    facebookUrl?: string
    instagram?: string
    tiktok?: string
    youtube?: string
    whatsappChannel?: string
    whatsappContact?: string
    radioUrl?: string
  }
}

export const CHURCH_INFO: ChurchInfo = {
  name: "Église Camp de Jésus-Christ Bel-Air Fizi",
  slogan: "Jésus-Christ revient bientôt",
  welcomeMessage: "Karibu !",
  location: {
    district: "Bel-Air Fizi",
    city: "Lubumbashi",
    country: "République Démocratique du Congo",
    fullAddress: "13 Avenue Bondo, Bel-Air Kilobelobe, Référence Arrêt Fizi, Lubumbashi, RDC",
  },
  contact: {
    phone: "+243 810 531 035",
  },
  socials: {
    facebookName: "Église Camp de Jésus-Christ Bel-Air Fizi",
    facebookUrl: "https://www.facebook.com/profile.php?id=61567215980367&mibextid=rS40aB7S9Ucbxw6v",
    instagram: "https://www.instagram.com/eglisecampdejesusbelair",
    tiktok: "https://www.tiktok.com/@camp_de_jesusbel_air",
    youtube: "https://www.youtube.com/@EgliseleCampdeJésusBel-air",
    whatsappChannel: "https://whatsapp.com/channel/0029VanHIZF3QxRtb86lI61n",
    whatsappContact: "https://wa.me/243810531035",
    radioUrl: "https://citelecampdejesus.radio12345.com/",
  },
}
