import type { Metadata } from "next"
import { OG_DEFAULTS } from "@/lib/seo"
import { ContactContent } from "@/components/features/contact/ContactContent"

export const metadata: Metadata = {
  title: "Contact | C.E.C.J.C.",
  description: "Contactez l'Église Camp de Jésus-Christ Bel-Air Fizi. Une question, une demande de prière ou envie de nous rejoindre ? Nous sommes là pour vous.",
  openGraph: {
    ...OG_DEFAULTS,
    title: "Contact | C.E.C.J.C.",
    description: "Contactez la C.E.C.J.C. — nous sommes là pour vous.",
  },
}

export default function ContactPage() {
  return <ContactContent />
}
