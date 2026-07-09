import Link from "next/link"
import { PageHeader } from "@/components/shared/PageHeader"
import { ADMIN_ROUTES } from "@/constants/routes"

/** Module « Enseignements écrits (PDF) » — à implémenter (backend + upload PDF). */
export default function AdminEnseignementsEcritsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enseignements écrits (PDF)"
        subtitle="Notes d'enseignement, études bibliques et supports à télécharger"
      />

      <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-cecj-green/8 text-cecj-green">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-semibold text-gray-900">Module en préparation</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-400">
          La gestion des enseignements au format PDF (upload, thèmes, publication) sera
          disponible dans une prochaine version. La structure de navigation est déjà en place.
        </p>
        <Link
          href={ADMIN_ROUTES.enseignements}
          className="mt-6 inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-cecj-green hover:text-cecj-green"
        >
          ← Retour à la vue d&apos;ensemble
        </Link>
      </div>
    </div>
  )
}
