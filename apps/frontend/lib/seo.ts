import type { Metadata } from "next"
import { CONFIG } from "@/constants/config"
import { SITE_ROUTES } from "@/constants/routes"

/** Route qui génère l'image Open Graph par défaut (app/og/route.tsx). */
export const OG_IMAGE_PATH = "/og"
export const SEO_LOCALES = ["fr", "en"] as const
export type SeoLocale = (typeof SEO_LOCALES)[number]

/**
 * Variantes réellement utilisées pour rechercher la communauté.
 * Elles alimentent les données structurées et les métadonnées de marque ;
 * le contenu visible reste rédigé naturellement pour éviter le keyword stuffing.
 */
export const BRAND_SEARCH_VARIANTS = [
  "Camp de Jésus",
  "Camp de Jésus-Christ",
  "Camp de Jésus Christ",
  "Camp de Jésus-Christ Bel-Air",
  "Camp de Jésus-Christ Bel Air",
  "Camp de Jésus-Christ Bel-Air Fizi",
  "Camp de Jésus-Christ Bel Air Fizi",
  "Église Camp de Jésus-Christ Bel-Air Fizi",
  "CECJC Bel-Air Fizi",
  "C.E.C.J.C. Bel-Air Fizi",
] as const

export const OG_DEFAULTS = {
  siteName: "C.E.C.J.C.",
  type: "website" as const,
  images: [OG_IMAGE_PATH],
}

export const INDEXABLE_SITE_PATHS = Object.values(SITE_ROUTES)

export function localizedPath(locale: SeoLocale, path: string): string {
  return `/${locale}${path === "/" ? "" : path}`
}

export function localizedAlternates(locale: SeoLocale, path: string) {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      fr: localizedPath("fr", path),
      en: localizedPath("en", path),
      "x-default": localizedPath("fr", path),
    },
  }
}

interface LocalizedMetadataInput {
  locale: SeoLocale
  path: string
  title: string
  description: string
}

/**
 * Construit les balises essentielles d'une page publique.
 * Les URLs relatives sont résolues par metadataBase dans le layout de locale.
 */
export function createLocalizedMetadata({
  locale,
  path,
  title,
  description,
}: LocalizedMetadataInput): Metadata {
  const url = localizedPath(locale, path)

  return {
    title,
    description,
    alternates: localizedAlternates(locale, path),
    openGraph: {
      ...OG_DEFAULTS,
      title,
      description,
      url,
      locale: locale === "fr" ? "fr_CD" : "en",
      alternateLocale: locale === "fr" ? ["en"] : ["fr_CD"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
  }
}

export function toSeoLocale(locale: string): SeoLocale {
  return locale === "en" ? "en" : "fr"
}

type SeoCopy = Record<SeoLocale, { title: string; description: string }>

export const PUBLIC_PAGE_SEO: Record<string, SeoCopy> = {
  "/contact": {
    fr: {
      title: "Contact et adresse de l'église à Lubumbashi",
      description:
        "Contactez le Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi : adresse, téléphone, demande de prière et informations pour préparer votre visite.",
    },
    en: {
      title: "Contact and church address in Lubumbashi",
      description:
        "Contact Camp de Jésus-Christ Bel-Air Fizi in Lubumbashi: address, phone number, prayer requests and information to plan your visit.",
    },
  },
  "/departements": {
    fr: { title: "Départements et ministères", description: "Découvrez les départements, ministères et services du Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi." },
    en: { title: "Departments and ministries", description: "Discover the departments, ministries and services of Camp de Jésus-Christ Bel-Air Fizi Church in Lubumbashi." },
  },
  "/enseignements": {
    fr: { title: "Enseignements bibliques à Lubumbashi", description: "Retrouvez les enseignements bibliques du Camp de Jésus-Christ Bel-Air Fizi en audio, vidéo et supports écrits." },
    en: { title: "Bible teachings in Lubumbashi", description: "Explore Bible teachings from Camp de Jésus-Christ Bel-Air Fizi in audio, video and written formats." },
  },
  "/enseignements/audio": {
    fr: { title: "Enseignements bibliques audio", description: "Écoutez les prédications et enseignements bibliques audio du Camp de Jésus-Christ Bel-Air Fizi, classés par thème et orateur." },
    en: { title: "Audio Bible teachings", description: "Listen to sermons and audio Bible teachings from Camp de Jésus-Christ Bel-Air Fizi, organised by topic and speaker." },
  },
  "/enseignements/videos": {
    fr: { title: "Enseignements bibliques vidéo", description: "Regardez les prédications et enseignements bibliques vidéo du Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi." },
    en: { title: "Video Bible teachings", description: "Watch sermons and video Bible teachings from Camp de Jésus-Christ Bel-Air Fizi Church in Lubumbashi." },
  },
  "/enseignements/ecrits": {
    fr: { title: "Études bibliques et enseignements PDF", description: "Consultez les études bibliques, notes d'enseignement et supports PDF du Camp de Jésus-Christ Bel-Air Fizi." },
    en: { title: "Bible studies and PDF teachings", description: "Read Bible studies, teaching notes and PDF resources from Camp de Jésus-Christ Bel-Air Fizi." },
  },
  "/galerie": {
    fr: { title: "Galerie photos de l'église", description: "Découvrez en images les cultes, événements et activités du Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi." },
    en: { title: "Church photo gallery", description: "Discover photos from services, events and activities at Camp de Jésus-Christ Bel-Air Fizi Church in Lubumbashi." },
  },
  "/leadership": {
    fr: { title: "Leadership de l'église", description: "Découvrez les responsables spirituels et l'équipe qui servent le Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi." },
    en: { title: "Church leadership", description: "Meet the spiritual leaders and team serving Camp de Jésus-Christ Bel-Air Fizi Church in Lubumbashi." },
  },
  "/mission": {
    fr: { title: "Notre mission", description: "Découvrez la mission du Camp de Jésus-Christ Bel-Air Fizi : annoncer Jésus-Christ, former des disciples et servir la communauté." },
    en: { title: "Our mission", description: "Discover the mission of Camp de Jésus-Christ Bel-Air Fizi: proclaim Jesus Christ, make disciples and serve the community." },
  },
  "/presentation": {
    fr: { title: "Présentation de l'église", description: "Découvrez l'histoire, l'identité et la doctrine du Camp de Jésus-Christ Bel-Air Fizi, église chrétienne à Lubumbashi." },
    en: { title: "About our church", description: "Discover the history, identity and doctrine of Camp de Jésus-Christ Bel-Air Fizi, a Christian church in Lubumbashi." },
  },
  "/temoignages": {
    fr: { title: "Témoignages chrétiens", description: "Découvrez des témoignages de foi et de transformation vécus au Camp de Jésus-Christ Bel-Air Fizi, et partagez le vôtre." },
    en: { title: "Christian testimonies", description: "Read stories of faith and transformed lives at Camp de Jésus-Christ Bel-Air Fizi, and share your own testimony." },
  },
  "/vision": {
    fr: { title: "Notre vision", description: "Découvrez la vision spirituelle et les valeurs du Camp de Jésus-Christ Bel-Air Fizi à Lubumbashi." },
    en: { title: "Our vision", description: "Discover the spiritual vision and values of Camp de Jésus-Christ Bel-Air Fizi Church in Lubumbashi." },
  },
}

export function createPublicPageMetadata(localeValue: string, path: string): Metadata {
  const locale = toSeoLocale(localeValue)
  const copy = PUBLIC_PAGE_SEO[path][locale]
  return createLocalizedMetadata({ locale, path, ...copy })
}

export function absoluteUrl(path: string): string {
  return new URL(path, CONFIG.siteUrl).toString()
}
