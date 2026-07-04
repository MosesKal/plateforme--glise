import type { Metadata } from "next"
import { ContactContent } from "@/components/features/contact/ContactContent"

export const metadata: Metadata = {
  title: "Contact | C.E.C.J.C.",
  description: "Contactez l'Église Camp de Jésus Bel-air. Une question, une demande de prière ou envie de nous rejoindre ? Nous sommes là pour vous.",
  openGraph: {
    title: "Contact | C.E.C.J.C.",
    description: "Contactez la C.E.C.J.C. — nous sommes là pour vous.",
  },
}

export default function ContactPage() {
  return <ContactContent />
}
