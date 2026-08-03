"use client"

import { useEffect, useRef } from "react"
import type { Testimony } from "@/lib/api/admin/testimonies"

interface TestimonyReaderDialogProps {
  testimony: Testimony
  onClose: () => void
}

export function TestimonyReaderDialog({
  testimony,
  onClose,
}: TestimonyReaderDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialog.showModal()

    return () => {
      document.body.style.overflow = previousOverflow
      if (dialog.open) dialog.close()
    }
  }, [])

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      aria-labelledby="testimony-reader-title"
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-[2rem] border border-cecj-rule bg-cecj-panel p-0 text-cecj-ink shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="flex items-start justify-between gap-5 border-b border-cecj-rule px-5 py-5 sm:px-8 sm:py-6">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-cecj-green/60">
              Témoignage complet
            </p>
            <h2
              id="testimony-reader-title"
              className="truncate text-xl font-bold text-cecj-green sm:text-2xl"
            >
              {testimony.fullName}
            </h2>
            <p className="mt-1 text-xs capitalize text-cecj-ink-dim">
              {new Date(testimony.createdAt).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Fermer le témoignage"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cecj-rule text-cecj-green transition-colors hover:border-cecj-green hover:bg-cecj-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          <div
            className="mb-2 font-serif text-7xl leading-none text-cecj-gold/30"
            aria-hidden="true"
          >
            &ldquo;
          </div>
          <blockquote className="whitespace-pre-wrap break-words text-base font-medium leading-8 sm:text-lg sm:leading-9">
            {testimony.content}
          </blockquote>
        </div>

        <footer className="border-t border-cecj-rule bg-cecj-tint px-5 py-4 text-right sm:px-8">
          <button
            type="button"
            onClick={close}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-cecj-green px-6 text-sm font-bold text-white transition-colors hover:bg-cecj-gold hover:text-cecj-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cecj-green"
          >
            Fermer
          </button>
        </footer>
      </div>
    </dialog>
  )
}
