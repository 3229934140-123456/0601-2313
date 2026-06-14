import { create } from 'zustand'
import type { Member, Coupon } from '../types'
import { members } from '../data/members'
import { getCouponsByMember } from '../data/coupons'

interface MemberState {
  member: Member | null
  isLoggedIn: boolean
  coupons: Coupon[]
  loginByCard: () => Promise<void>
  loginByQR: () => Promise<void>
  logout: () => void
  deductBalance: (amount: number) => void
  markCouponUsed: (couponId: string) => void
}

export const useMemberStore = create<MemberState>((set, get) => ({
  member: null,
  isLoggedIn: false,
  coupons: [],

  loginByCard: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const idx = Math.floor(Math.random() * members.length)
    const member = members[idx]
    const coupons = getCouponsByMember(member.id, true)
    set({ member, isLoggedIn: true, coupons })
  },

  loginByQR: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const member = members[0]
    const coupons = getCouponsByMember(member.id, true)
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

  markCouponUsed: (couponId: string) => {
    const { coupons } = get()
    set({
      coupons: coupons.map((c) =>
        c.id === couponId ? { ...c, used: true } : c
      ),
    })
  },
}))
