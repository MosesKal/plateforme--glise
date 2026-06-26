"use client"

import { useQuery } from "@tanstack/react-query"
import ReactMarkdown from "react-markdown"
import { publicPagesApi } from "@/lib/api/pages"
import { useI18n } from "@/components/providers/I18nProvider"

interface Props {
  slug: string
}

export function SitePageContent({ slug }: Props) {
  const { locale } = useI18n()

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ["public", "pages", slug],
    queryFn: () => publicPagesApi.getBySlug(slug),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-1 w-16 rounded bg-gray-100" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-4 animate-pulse rounded bg-gray-100 ${i === 4 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !page || !page.published) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <p className="text-lg font-medium text-gray-400">Cette page n&apos;est pas encore disponible.</p>
      </div>
    )
  }

  const title   = locale === "en" && page.titleEn   ? page.titleEn   : page.titleFr
  const content = locale === "en" && page.contentEn ? page.contentEn : page.contentFr

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold text-cecj-green">{title}</h1>
      <div className="mb-10 h-1 w-16 rounded bg-cecj-gold/60" />
      <div className="prose prose-lg prose-cecj max-w-none text-gray-700
        prose-headings:text-cecj-green prose-headings:font-bold
        prose-strong:text-gray-900
        prose-a:text-cecj-green prose-a:underline-offset-4
        prose-li:marker:text-cecj-gold
      ">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
