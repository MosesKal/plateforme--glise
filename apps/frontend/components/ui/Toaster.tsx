"use client"

import { useToastStore, type ToastType } from "@/store/toast.store"
import { cn } from "@/lib/utils"

const STYLES: Record<ToastType, { box: string; icon: string; path: string }> = {
  error: {
    box: "border-red-200 bg-red-50 text-red-800",
    icon: "text-red-500",
    path: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  },
  success: {
    box: "border-green-200 bg-green-50 text-green-800",
    icon: "text-green-500",
    path: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  info: {
    box: "border-blue-200 bg-blue-50 text-blue-800",
    icon: "text-blue-500",
    path: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  },
}

/** Pile de notifications en bas à droite — alimentée par le store toast. */
export function Toaster() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const style = STYLES[t.type]
        return (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "toast-in pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
              style.box,
            )}
          >
            <svg
              className={cn("mt-0.5 h-5 w-5 shrink-0", style.icon)}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={style.path} />
            </svg>
            <p className="min-w-0 flex-1 text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Fermer"
              className="shrink-0 rounded p-0.5 opacity-50 transition-opacity hover:opacity-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
