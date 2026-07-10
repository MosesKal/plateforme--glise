"use client"

import { create } from "zustand"

export type ToastType = "error" | "success" | "info"

export interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastState {
  toasts: Toast[]
  push: (type: ToastType, message: string) => void
  dismiss: (id: number) => void
}

let nextId = 0
const AUTO_DISMISS_MS = 6_000

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  push(type, message) {
    // Dédoublonnage : la même erreur répétée (ex. plusieurs mutations en échec)
    // ne s'empile pas à l'écran.
    if (get().toasts.some((t) => t.message === message)) return

    const id = ++nextId
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => get().dismiss(id), AUTO_DISMISS_MS)
  },

  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

/** Raccourcis utilisables hors composants React (ex. callbacks React Query). */
export const toast = {
  error:   (message: string) => useToastStore.getState().push("error", message),
  success: (message: string) => useToastStore.getState().push("success", message),
  info:    (message: string) => useToastStore.getState().push("info", message),
}
