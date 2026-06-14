import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

interface ModalState {
  type: string
  data?: unknown
}

interface UiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  toast: Toast[]
  showToast: (type: Toast['type'], message: string) => void
  modal: ModalState | null
  openModal: (type: string, data?: unknown) => void
  closeModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toast: [],

  showToast: (type, message) => {
    const id = `t${Date.now()}`
    set((s) => ({ toast: [...s.toast, { id, type, message }] }))
    setTimeout(() => {
      set((s) => ({ toast: s.toast.filter((t) => t.id !== id) }))
    }, 3000)
  },

  modal: null,

  openModal: (type, data) => set({ modal: { type, data } }),

  closeModal: () => set({ modal: null }),
}))
