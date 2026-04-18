import { create } from 'zustand'

interface AppState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useStore = create<AppState>()((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
