"use client"

import Image from "next/image"
import Link from "next/link"
import { useI18n } from "@/components/providers/I18nProvider"
import type { TeachingTheme } from "@/lib/api/teachings"

export function ThemeCard({ theme, href }: { theme: TeachingTheme; href: string }) {
  const { t } = useI18n()
  const count = theme._count.audioTeachings

  return (
    <Link
      href={href}
      className="group relative flex min-h-32 flex-col justify-end overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-h-40 sm:p-6"
    >
      {theme.coverImage ? (
        <>
          <Image
            src={theme.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cecj-green/95 via-cecj-green/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-cecj-green to-cecj-green/80" />
      )}

      <div className="relative">
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">{theme.nameFr}</h3>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-cecj-gold sm:text-xs sm:tracking-widest">
          {count}{" "}
          {count > 1
            ? t("teachings.common.teachingPlural")
            : t("teachings.common.teachingSingular")}
        </p>
      </div>
    </Link>
  )
}
