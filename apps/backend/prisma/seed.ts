import { PrismaClient, ExtensionStatus, EventStatus, LeaderRole } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // ── Roles ──────────────────────────────────────────────────────────────────

  const roleDefinitions = [
    { name: "Super Admin",               description: "Acces complet a toute la plateforme" },
    { name: "Administrateur General",    description: "Gestion globale du contenu" },
    { name: "Responsable Communication", description: "Actualites, galerie, evenements, medias" },
    { name: "Responsable Extension",     description: "Gestion de sa propre extension" },
    { name: "Moderateur",                description: "Validation des contenus soumis" },
    { name: "Member",                    description: "Membre inscrit - acces de base" },
  ]

  const createdRoles = await Promise.all(
    roleDefinitions.map((r) =>
      prisma.role.upsert({ where: { name: r.name }, update: {}, create: r }),
    ),
  )
  const superAdminRole = createdRoles[0]
  console.log(`OK ${createdRoles.length} roles crees`)

  // ── Super Admin user ───────────────────────────────────────────────────────

  const adminPassword = await bcrypt.hash("Admin1234!", 12)
  await prisma.user.upsert({
    where: { email: "admin@cecj.org" },
    update: {},
    create: {
      firstName: "Paulin",
      lastName: "Mambwe",
      email: "admin@cecj.org",
      password: adminPassword,
      roleId: superAdminRole.id,
    },
  })
  console.log("OK Super Admin cree — admin@cecj.org / Admin1234!")

  // ── Extensions ────────────────────────────────────────────────────────────

  await prisma.extension.deleteMany({})
  await prisma.extension.createMany({
    data: [
      {
        name: "Camp de Jésus-Christ Bel-Air Fizi",
        country: "République Démocratique du Congo",
        city: "Lubumbashi",
        address: "13 Av. Bondo, Bel-Air Kilobelobe, Réf. Arrêt Fizi",
        phone: "+243 898 700 596",
        pastorName: "Apôtre Paulin Mambwe",
        latitude: -11.6609,
        longitude: 27.4795,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2016-01-01"),
        description: "Siège principal de la Communauté des Églises Le Camp de Jésus-Christ, fondé en 2016 avec plus de 2 000 membres.",
      },
      {
        name: "Camp de Jésus-Christ Salongo",
        country: "République Démocratique du Congo",
        city: "Kolwezi",
        pastorName: "Pasteur Thomas",
        latitude: -10.7200,
        longitude: 25.4700,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2020-01-01"),
      },
      {
        name: "Camp de Jésus-Christ Likasi",
        country: "République Démocratique du Congo",
        city: "Likasi",
        pastorName: "Pasteur Louis",
        latitude: -10.9839,
        longitude: 26.7322,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2020-01-01"),
      },
      {
        name: "Camp de Jésus-Christ Sakania",
        country: "République Démocratique du Congo",
        city: "Sakania",
        pastorName: "Pasteur Sarton",
        latitude: -12.7444,
        longitude: 28.5694,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2020-01-01"),
      },
      {
        name: "Camp de Jésus-Christ Kipushi",
        country: "République Démocratique du Congo",
        city: "Kipushi",
        pastorName: "Pasteur Jérémie",
        latitude: -11.7667,
        longitude: 27.2500,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2020-01-01"),
      },
      {
        name: "Camp de Jésus-Christ Kinshasa-Ngaliema",
        country: "République Démocratique du Congo",
        city: "Kinshasa",
        pastorName: "Pasteur Alain",
        latitude: -4.3100,
        longitude: 15.2600,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2020-01-01"),
      },
      {
        name: "Camp de Jésus-Christ Kinshasa-Mongafula",
        country: "République Démocratique du Congo",
        city: "Kinshasa",
        pastorName: "Pasteur Messie",
        latitude: -4.4264,
        longitude: 15.2300,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2021-01-01"),
      },
      {
        name: "Camp de Jésus-Christ Kinshasa-Kalembelembe",
        country: "République Démocratique du Congo",
        city: "Kinshasa",
        pastorName: "Pasteur Elie Tshinguli",
        latitude: -4.3795,
        longitude: 15.2892,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2022-01-01"),
      },
      {
        name: "Camp de Jésus-Christ Uganda",
        country: "Uganda",
        city: "Kampala",
        pastorName: "Pasteur Big",
        latitude: 0.3476,
        longitude: 32.5825,
        status: ExtensionStatus.ACTIVE,
        foundedAt: new Date("2023-01-01"),
      },
    ],
  })
  console.log("OK 9 extensions creees")

  // ── Leaders ────────────────────────────────────────────────────────────────

  await prisma.leader.deleteMany({})
  await prisma.leader.create({
    data: {
      firstName: "Paulin",
      lastName: "Mambwe",
      title: "Apotre",
      role: LeaderRole.FOUNDER,
      bio: "Fondateur et visionnaire du Camp de Jesus-Christ Bel-Air Fizi, il conduit l'oeuvre depuis 2016 avec une passion pour la saine doctrine et l'expansion du Royaume.",
      order: 1,
      isActive: true,
    },
  })
  console.log("OK 1 leader cree")

  // ── Departments ────────────────────────────────────────────────────────────

  await prisma.department.deleteMany({})
  await prisma.department.createMany({
    data: [
      { name: "Louange & Adoration",  description: "Conduit l'assemblee dans l'adoration a travers le chant, la musique et la danse sacree.", order: 1 },
      { name: "Jeunesse",             description: "Forme et accompagne les jeunes dans leur marche avec Dieu, leur identite en Christ et leur vocation.", order: 2 },
      { name: "Femmes",               description: "Rassemble les femmes de l'eglise pour la priere, l'enseignement biblique, l'entraide et l'evangelisation.", order: 3 },
      { name: "Hommes",               description: "Forme les hommes a etre des piliers spirituels dans leur foyer, leur eglise et leur communaute.", order: 4 },
      { name: "Enfants",              description: "Enseigne la Parole de Dieu aux enfants de maniere adaptee et les integre dans la vie de l'eglise.", order: 5 },
      { name: "Evangelisation",       description: "Organise les campagnes d'evangelisation, les missions et la formation des evangelistes.", order: 6 },
      { name: "Intercession",         description: "Couvre l'eglise et ses membres par une priere continue, organisee et strategique.", order: 7 },
      { name: "Ecole Biblique",       description: "Forme les membres a la connaissance approfondie de la Parole de Dieu et aux fondements doctrinaux.", order: 8 },
    ],
  })
  console.log("OK 8 departements crees")

  // ── Events ─────────────────────────────────────────────────────────────────

  await prisma.event.deleteMany({})
  await prisma.event.createMany({
    data: [
      {
        titleFr: "Action Affranchis 2",
        descriptionFr: "Soiree de Louange & Adoration organisee par Le Chantre Agreable de Christ.",
        category:  "Louange & Adoration",
        organizer: "Le Chantre Agreable de Christ",
        startDate: new Date("2026-07-12T14:30:00"),
        endDate:   new Date("2026-07-12T18:00:00"),
        location:  "Lubumbashi",
        address:   "13 Av. Bondo, Bel-Air (Ref. Arret Fizi), Lubumbashi",
        coverImage: "/event_avenir.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: true,
      },
      {
        titleFr: "Culte des Mamans - Juin 2026",
        descriptionFr: "Rencontre mensuelle des mamans de l'eglise.",
        category:  "Rencontre des Mamans",
        startDate: new Date("2026-06-09T16:00:00"),
        endDate:   new Date("2026-06-09T17:30:00"),
        location:  "Lubumbashi",
        address:   "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
        coverImage: "/event_avenir_6.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: false,
      },
      {
        titleFr: "Un Mois d'Enseignements - Le Saint-Esprit",
        descriptionFr: "Ecole de Tyrannus — un mois complet consacre a l'enseignement sur le Saint-Esprit, en presentiel et en ligne.",
        category:  "Ecole de Tyrannus",
        startDate: new Date("2026-04-01T00:00:00"),
        endDate:   new Date("2026-04-30T23:59:59"),
        location:  "Lubumbashi - en ligne",
        address:   "Eglise Le Camp de Jesus-Christ, Bel-Air Fizi",
        coverImage: "/event_avenir_10.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: false,
      },
      {
        titleFr: "Je Connais Ma Bible - 1ere edition",
        descriptionFr: "Concours biblique organise par la Communaute des Eglises Le Camp de Jesus-Christ.",
        category:  "Concours Biblique",
        organizer: "Communaute des Eglises Le Camp de Jesus-Christ",
        startDate: new Date("2026-02-22T14:00:00"),
        endDate:   new Date("2026-02-22T18:00:00"),
        location:  "Lubumbashi",
        address:   "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
        coverImage: "/event_avenir_3.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: false,
      },
      {
        titleFr: "Consecration des Pasteurs",
        descriptionFr: "Culte special de consecration anime par le Pasteur Elie Tshinguli.",
        category:  "Culte special",
        speaker:   "Pasteur Elie Tshinguli",
        startDate: new Date("2025-11-23T08:00:00"),
        endDate:   new Date("2025-11-23T11:00:00"),
        location:  "Lubumbashi",
        address:   "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
        coverImage: "/event_avenir_4.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: false,
      },
      {
        titleFr: "Les Personnages Feminins dans la Bible",
        descriptionFr: "Conference des Femmes animee par Maman Karine Tumba, Maman Wivine Bobo et Maman Valine Kalem.",
        category:  "Conference des Femmes",
        organizer: "Maman Karine Tumba, Maman Wivine Bobo, Maman Valine Kalem",
        startDate: new Date("2025-10-25T13:30:00"),
        endDate:   new Date("2025-10-26T18:00:00"),
        location:  "Lubumbashi",
        address:   "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
        coverImage: "/event_avenir_5.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: false,
      },
      {
        titleFr: "Je Connais Ma Bible - 2eme seance",
        descriptionFr: "Deuxieme seance du concours biblique de la C.E.C.J.C.",
        category:  "Concours Biblique",
        organizer: "Communaute des Eglises Le Camp de Jesus-Christ",
        startDate: new Date("2026-03-22T13:30:00"),
        endDate:   new Date("2026-03-22T17:30:00"),
        location:  "Lubumbashi",
        address:   "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
        coverImage: "/event_avenir_9.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: false,
      },
      {
        titleFr: "Culte des Mamans - Mars 2026",
        descriptionFr: "Rencontre mensuelle des mamans de l'eglise.",
        category:  "Rencontre des Mamans",
        startDate: new Date("2026-03-10T16:00:00"),
        endDate:   new Date("2026-03-10T17:30:00"),
        location:  "Lubumbashi",
        address:   "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
        coverImage: "/event_avenir_14.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: false,
      },
      {
        titleFr: "Culte Dominical - Actions de Grace",
        descriptionFr: "Culte special d'actions de grace anime par l'Apotre Paulin Mambwe.",
        category:  "Culte special",
        speaker:   "Apotre Paulin Mambwe",
        startDate: new Date("2025-07-06T08:00:00"),
        endDate:   new Date("2025-07-06T11:00:00"),
        location:  "Lubumbashi",
        address:   "13 Av. Bondo, Bel-Air Kilobelobe, Lubumbashi",
        coverImage: "/event_avenir_13.jpeg",
        status:    EventStatus.PUBLISHED,
        isFeatured: false,
      },
    ],
  })
  console.log("OK 9 evenements crees")

  // ── Programme hebdomadaire (récurrent) ─────────────────────────────────────

  await prisma.scheduleEntry.deleteMany({ where: { isRecurring: true } })
  await prisma.scheduleEntry.createMany({
    data: [
      {
        title:      "Culte Matinal",
        days:       ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
        startTime:  "06:00",
        endTime:    "07:00",
        category:   "Prière",
        isRecurring: true,
        sortOrder:  0,
      },
      {
        title:      "Culte des Mamans",
        days:       ["Mardi"],
        startTime:  "16:00",
        endTime:    "17:30",
        category:   "Famille",
        isRecurring: true,
        sortOrder:  1,
      },
      {
        title:           "Nuit de Prière",
        days:            ["Mardi"],
        startTime:       "21:00",
        endTime:         "00:00",
        category:        "Prière",
        liveOnYoutube:   true,
        isRecurring:     true,
        sortOrder:       2,
      },
      {
        title:         "Culte d'Enseignements et Prières",
        days:          ["Mercredi", "Jeudi", "Vendredi"],
        startTime:     "12:00",
        endTime:       "18:00",
        category:      "Enseignement",
        liveOnYoutube: true,
        isRecurring:   true,
        sortOrder:     3,
      },
      {
        title:              "Culte de Dimanche",
        days:               ["Dimanche"],
        startTime:          "08:00",
        endTime:            "11:00",
        category:           "Adoration",
        liveOnYoutube:      true,
        facebookPhotosAfter: true,
        isRecurring:        true,
        sortOrder:          4,
      },
    ],
  })
  console.log("OK Programme hebdomadaire seede (5 entrees recurrentes)")

  console.log("\nSeed termine avec succes !")
  console.log("  Super Admin : admin@cecj.org")
  console.log("  Mot de passe: Admin1234!")
}

main()
  .catch((e) => {
    console.error("Seed echoue:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
