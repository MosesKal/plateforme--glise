"use client"

import Link from "next/link"
import type { TeachingTheme } from "@/lib/api/teachings"

export function ThemeCard({ theme, href }: { theme: TeachingTheme; href: string }) {
  const count = theme._count.audioTeachings

  return (
    <Link
      href={href}
      className="group relative flex min-h-40 flex-col justify-end overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {theme.coverImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={theme.coverImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cecj-green/95 via-cecj-green/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-cecj-green to-cecj-green/80" />
      )}

      <div className="relative">
        <h3 className="text-lg font-bold text-white">{theme.nameFr}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-cecj-gold">
          {count} enseignement{count > 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  )
}
