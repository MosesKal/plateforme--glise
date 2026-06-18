export interface Leader {
  nom: string
  titre: { fr: string; en: string }
  description?: { fr: string; en: string }
  initiales: string
}

export interface Departement {
  id: string
  nom: { fr: string; en: string }
  description: { fr: string; en: string }
  responsable?: string
  icon: string
}

export const LEADERSHIP: Leader[] = [
  {
    nom: "Apôtre Paulin Mambwe",
    titre: { fr: "Apôtre — Fondateur", en: "Apostle — Founder" },
    description: {
      fr: "Fondateur et visionnaire du Camp de Jésus-Christ Bel-Air Fizi, il conduit l'œuvre depuis 2016 avec une passion pour la saine doctrine et l'expansion du Royaume.",
      en: "Founder and visionary of Camp de Jésus-Christ Bel-Air Fizi, he has led the work since 2016 with a passion for sound doctrine and the expansion of the Kingdom.",
    },
    initiales: "PM",
  },
]

export const DEPARTEMENTS: Departement[] = [
  {
    id: "louange",
    nom: { fr: "Département de Louange & Adoration", en: "Worship & Praise Department" },
    description: {
      fr: "Conduit l'assemblée dans l'adoration à travers le chant, la musique et la danse sacrée.",
      en: "Leads the congregation in worship through singing, music, and sacred dance.",
    },
    icon: "music",
  },
  {
    id: "jeunesse",
    nom: { fr: "Département Jeunesse", en: "Youth Department" },
    description: {
      fr: "Forme et accompagne les jeunes dans leur marche avec Dieu, leur identité en Christ et leur vocation.",
      en: "Forms and accompanies young people in their walk with God, their identity in Christ, and their calling.",
    },
    icon: "users",
  },
  {
    id: "femmes",
    nom: { fr: "Département des Femmes", en: "Women's Department" },
    description: {
      fr: "Rassemble les femmes de l'église pour la prière, l'enseignement biblique, l'entraide et l'évangélisation.",
      en: "Gathers the women of the church for prayer, biblical teaching, mutual support, and evangelism.",
    },
    icon: "heart",
  },
  {
    id: "hommes",
    nom: { fr: "Département des Hommes", en: "Men's Department" },
    description: {
      fr: "Forme les hommes à être des piliers spirituels dans leur foyer, leur église et leur communauté.",
      en: "Forms men to be spiritual pillars in their home, church, and community.",
    },
    icon: "shield",
  },
  {
    id: "enfants",
    nom: { fr: "Département des Enfants", en: "Children's Department" },
    description: {
      fr: "Enseigne la Parole de Dieu aux enfants de manière adaptée et les intègre dans la vie de l'église.",
      en: "Teaches the Word of God to children in an appropriate way and integrates them into the life of the church.",
    },
    icon: "star",
  },
  {
    id: "evangelisation",
    nom: { fr: "Département d'Évangélisation", en: "Evangelism Department" },
    description: {
      fr: "Organise les campagnes d'évangélisation, les missions et la formation des évangélistes.",
      en: "Organises evangelism campaigns, missions, and training of evangelists.",
    },
    icon: "globe",
  },
  {
    id: "intercession",
    nom: { fr: "Département d'Intercession", en: "Intercession Department" },
    description: {
      fr: "Couvre l'église et ses membres par une prière continue, organisée et stratégique.",
      en: "Covers the church and its members through continuous, organised, and strategic prayer.",
    },
    icon: "prayer",
  },
  {
    id: "enseignement",
    nom: { fr: "École Biblique", en: "Bible School" },
    description: {
      fr: "Forme les membres à la connaissance approfondie de la Parole de Dieu et aux fondements doctrinaux.",
      en: "Trains members in in-depth knowledge of the Word of God and doctrinal foundations.",
    },
    icon: "book",
  },
]
