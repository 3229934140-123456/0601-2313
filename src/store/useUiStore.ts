import { create } from 'zustand'
import type { ReactNode } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

interface ModalData {
  title?: string
  content?: ReactNode
  amount?: number
  desc?: string
}

interface ModalState {
  type: string
  data?: ModalData
}

interface UiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  toast: Toast[]
  showToast: (type: Toast['type'], message: string) => void
  modal: ModalState | null
  openModal: (type: string, data?: ModalData) => void
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
