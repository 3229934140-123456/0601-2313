import { create } from 'zustand'
import type { Member, Coupon } from '../types'
import { members } from '../data/members'

interface MemberState {
  member: Member | null
  isLoggedIn: boolean
  coupons: Coupon[]
  loginByCard: () => Promise<void>
  loginByQR: () => Promise<void>
  logout: () => void
  deductBalance: (amount: number) => void
}

const mockCoupons: Coupon[] = [
  { id: 'c1', memberId: 'm1', name: '新人满减券', discount: 50, type: '满减', minAmount: 200, expireAt: '2026-12-31', used: false },
  { id: 'c2', memberId: 'm1', name: '周末8折券', discount: 0.8, type: '折扣', expireAt: '2026-08-31', used: false },
  { id: 'c3', memberId: 'm1', name: '生日立减券', discount: 100, type: '立减', expireAt: '2026-07-31', used: false },
]

export const useMemberStore = create<MemberState>((set, get) => ({
  member: null,
  isLoggedIn: false,
  coupons: [],

  loginByCard: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const idx = Math.floor(Math.random() * members.length)
    const member = members[idx]
    const coupons = mockCoupons.filter((c) => c.memberId === member.id)
    set({ member, isLoggedIn: true, coupons })
  },

  loginByQR: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const member = members[0]
    const coupons = mockCoupons.filter((c) => c.memberId === member.id)
    set({ member, isLoggedIn: true, coupons })
  },

  logout: () => set({ member: null, isLoggedIn: false, coupons: [] }),

  deductBalance: (amount: number) => {
    const { member } = get()
    if (!member) return
    set({
      member: {
        ...member,
        balance: Math.max(0, Number((member.balance - amount).toFixed(2))),
      },
    })
  },
}))
