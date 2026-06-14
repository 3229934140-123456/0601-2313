import { create } from 'zustand'
import type { Booking } from '../types'
import { courts, venues } from '../data/venues'
import { bookings as initialBookings } from '../data/bookings'
import { generateEntryCode } from '../utils/format'
import { useMemberStore } from './useMemberStore'

const STORAGE_KEY = 'booking-store-v1'

const loadBookings = (): Booking[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {}
  return [...initialBookings]
}

interface BookingState {
  selectedVenueId: string
  selectedDate: string
  selectedSlotId: string | null
  selectedCourtId: string | null
  peopleCount: number
  selectedCouponId: string | null
  currentBooking: Booking | null
  entryCode: string | null
  bookings: Booking[]
  setSelectedVenueId: (id: string) => void
  setSelectedDate: (date: string) => void
  setSelectedSlotId: (id: string | null) => void
  setSelectedCourtId: (id: string | null) => void
  setPeopleCount: (count: number) => void
  setSelectedCouponId: (id: string | null) => void
  calculateTotal: () => { total: number; discount: number; pay: number }
  confirmPayment: () => Promise<void>
  cancelBooking: (id: string) => void
  rescheduleBooking: (id: string, data: { date?: string; timeRange?: string; startTime?: string; endTime?: string }) => void
  checkInBooking: (id: string) => void
}

const today = new Date()
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

const parseSlotTime = (slotId: string | null): { startTime: string; endTime: string; timeRange: string } => {
  if (!slotId) return { startTime: '', endTime: '', timeRange: '' }
  let startHour = 9
  if (slotId.startsWith('slot-')) {
    startHour = parseInt(slotId.replace('slot-', ''), 10)
  } else {
    const parts = slotId.split('-')
    const lastPart = parts[parts.length - 1]
    startHour = parseInt(lastPart, 10)
    if (isNaN(startHour)) startHour = 9
  }
  const endHour = startHour + 1
  const startTime = `${String(startHour).padStart(2, '0')}:00`
  const endTime = `${String(endHour).padStart(2, '0')}:00`
  const timeRange = `${startTime} - ${endTime}`
  return { startTime, endTime, timeRange }
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedVenueId: 'v1',
  selectedDate: todayStr,
  selectedSlotId: null,
  selectedCourtId: null,
  peopleCount: 2,
  selectedCouponId: null,
  currentBooking: null,
  entryCode: null,
  bookings: loadBookings(),

  setSelectedVenueId: (id) => set({ selectedVenueId: id, selectedCourtId: null, selectedSlotId: null }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedSlotId: null }),
  setSelectedSlotId: (id) => set({ selectedSlotId: id }),
  setSelectedCourtId: (id) => set({ selectedCourtId: id }),
  setPeopleCount: (count) => set({ peopleCount: Math.max(1, count) }),
  setSelectedCouponId: (id) => set({ selectedCouponId: id }),

  calculateTotal: () => {
    const { selectedCourtId, selectedCouponId } = get()
    const coupons = useMemberStore.getState().coupons
    const court = courts.find((c) => c.id === selectedCourtId)
    const total = court ? court.pricePerHour : 0
    let discount = 0
    if (selectedCouponId && coupons.length > 0) {
      const coupon = coupons.find((c) => c.id === selectedCouponId)
      if (coupon && !coupon.used) {
        if (coupon.type === '满减' && total >= (coupon.minAmount || 0)) discount = coupon.discount
        else if (coupon.type === '折扣' && coupon.discountPercent) {
          discount = Number((total * (1 - coupon.discountPercent)).toFixed(2))
        } else if (coupon.type === '立减') discount = coupon.discount
        else if (coupon.type === '体验券') discount = coupon.discount
      }
    }
    discount = Math.min(discount, total)
    return { total, discount, pay: Number((total - discount).toFixed(2)) }
  },

  confirmPayment: async () => {
    const state = get()
    const { total, discount, pay } = state.calculateTotal()
    const mState = useMemberStore.getState()
    mState.deductBalance(pay)
    if (state.selectedCouponId) {
      useMemberStore.getState().markCouponUsed(state.selectedCouponId)
    }
    const code = generateEntryCode()
    const court = courts.find((c) => c.id === state.selectedCourtId)
    const venue = venues.find((v) => v.id === state.selectedVenueId)
    const { startTime, endTime, timeRange } = parseSlotTime(state.selectedSlotId)
    const booking: Booking = {
      id: `bk${Date.now()}`,
      memberId: mState.member?.id || '',
      courtId: state.selectedCourtId || '',
      slotIds: state.selectedSlotId ? [state.selectedSlotId] : [],
      status: 'confirmed',
      peopleCount: state.peopleCount,
      totalAmount: total,
      discount,
      payAmount: pay,
      payStatus: 'paid',
      entryCode: code,
      createdAt: new Date().toISOString(),
      date: state.selectedDate,
      venueName: venue?.name,
      courtName: court?.name,
      startTime,
      endTime,
      timeRange,
    }
    set({
      currentBooking: booking,
      entryCode: code,
      bookings: [booking, ...state.bookings],
      selectedSlotId: null,
      selectedCouponId: null,
    })
  },

  cancelBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled', payStatus: 'refunded' } : b
      ),
    }))
  },

  rescheduleBooking: (id, data) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...data } : b
      ),
    }))
  },

  checkInBooking: (id) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'checked_in' } : b
      ),
    }))
  },
}))

useBookingStore.subscribe((state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bookings))
  } catch {}
})
