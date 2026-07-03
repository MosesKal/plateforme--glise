import { create } from "zustand"

/** État UI global du backoffice (drawer mobile de la sidebar). */
interface UiState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}))
