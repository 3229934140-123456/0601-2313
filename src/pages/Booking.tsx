import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  ChevronLeft, ChevronRight, Minus, Plus, Check, X,
  CheckCircle, XCircle, Loader2, Wallet, CreditCard,
  Home, TicketPercent, Users, CalendarDays, MapPin, Clock,
  ArrowRight, Sparkles, AlertTriangle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBookingStore } from '@/store/useBookingStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useUiStore } from '@/store/useUiStore'
import { courts, venues, getCourtsByVenue, timeSlots } from '@/data/venues'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils/format'
import BigButton from '@/components/ui/BigButton'
import type { Coupon } from '@/types'

const STEPS = ['选择时段', '场地人数', '优惠券', '确认支付']

const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
  const h = 9 + i
  return {
    id: `slot-${h}`,
    time: `${h.toString().padStart(2, '0')}:00`,
    endTime: `${(h + 1).toString().padStart(2, '0')}:00`,
  }
})

const COUPON_COLORS: Record<string, string> = {
  '满减': 'from-accent-500 to-accent-600',
  '折扣': 'from-primary-500 to-primary-600',
  '立减': 'from-success-500 to-success-600',
  '体验券': 'from-warning-500 to-warning-600',
}

export default function Booking() {
  const nav = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [paymentState, setPaymentState] = useState<'idle' | 'paying' | 'success' | 'failed'>('idle')
  const [payMethod, setPayMethod] = useState<'balance' | 'wechat' | 'alipay'>('balance')
  const [couponTab, setCouponTab] = useState<'available' | 'unavailable'>('available')
  const [courtOpen, setCourtOpen] = useState(false)

  const bk = useBookingStore()
  const mb = useMemberStore()
  const ui = useUiStore()

  const venue = venues.find(v => v.id === bk.selectedVenueId)
  const venueCourts = getCourtsByVenue(bk.selectedVenueId)
  const selectedCourt = courts.find(c => c.id === bk.selectedCourtId)
  const slot = timeSlots.find(s => s.id === bk.selectedSlotId)
  const totals = bk.calculateTotal()
  const balanceInsufficient = payMethod === 'balance' && (mb.member?.balance || 0) < totals.pay

  const selectedSlotTime = slot ? `${slot.startTime}-${slot.endTime}` :
    TIME_SLOTS.find(s => s.id === bk.selectedSlotId)
      ? `${TIME_SLOTS.find(s => s.id === bk.selectedSlotId)!.time}-${TIME_SLOTS.find(s => s.id === bk.selectedSlotId)!.endTime}` : ''

  const availableCoupons = useMemo(() => mb.coupons.filter(c => {
    if (c.used) return false
    if (c.minAmount && totals.total < c.minAmount) return false
    return new Date(c.expireAt) >= new Date()
  }), [mb.coupons, totals.total])

  const unavailableCoupons = useMemo(() => mb.coupons.filter(c => !availableCoupons.includes(c)), [mb.coupons, availableCoupons])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (el) el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  const nextStep = () => {
    if (step === 0 && !bk.selectedSlotId) { ui.showToast('warning', '请选择时段'); return }
    if (step === 1 && !bk.selectedCourtId) { ui.showToast('warning', '请选择场地'); return }
    setStep(s => Math.min(3, s + 1))
  }
  const prevStep = () => setStep(s => Math.max(0, s - 1))

  const handlePay = async () => {
    if (balanceInsufficient) { ui.showToast('error', '余额不足'); return }
    if (!mb.isLoggedIn) { ui.showToast('warning', '请先登录'); return }
    setPaymentState('paying')
    try {
      await new Promise(r => setTimeout(r, 1600))
      await bk.confirmPayment()
      setPaymentState('success')
    } catch {
      setPaymentState('failed')
    }
  }

  useEffect(() => {
    if (bk.selectedCourtId && !courtOpen) setCourtOpen(false)
  }, [bk.selectedCourtId])

  const getSlotStatus = (idx: number) => {
    const patterns = ['free', 'free', 'busy', 'busy', 'free', 'free', 'full', 'busy', 'full', 'free', 'busy', 'free', 'free']
    return patterns[idx % patterns.length]
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-slate-900">预订确认</h1>
          <span className="text-sm text-slate-500">第 {step + 1}/4 步</span>
        </div>
        <div className="max-w-2xl mx-auto mt-5 flex items-center gap-2">
          {STEPS.map((name, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                    i < step && 'bg-success-500 border-success-500 text-white',
                    i === step && 'bg-accent-500 border-accent-500 text-white',
                    i > step && 'bg-white border-slate-200 text-slate-400'
                  )}
                  animate={{ scale: i === step ? [1, 1.08, 1] : 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </motion.div>
                <span className={cn('text-xs', i <= step ? 'text-slate-700 font-medium' : 'text-slate-400')}>{name}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-1 h-0.5 bg-slate-200 rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-success-500 to-accent-500"
                    initial={false}
                    animate={{ width: i < step ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <div className="card p-6 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-3xl">{venue?.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">{venue?.name}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                      <CalendarDays className="w-4 h-4" /><span>{bk.selectedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">选择时段</h3>
                  <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>
                <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-5 px-5 snap-x">
                  {TIME_SLOTS.map((ts, i) => {
                    const status = getSlotStatus(i)
                    const isFull = status === 'full'
                    const isSelected = bk.selectedSlotId === ts.id
                    const remain = isFull ? 0 : status === 'busy' ? 4 : 8
                    const price = selectedCourt?.pricePerHour || 100
                    return (
                      <button
                        key={ts.id}
                        disabled={isFull}
                        onClick={() => bk.setSelectedSlotId(isSelected ? null : ts.id)}
                        className={cn(
                          'snap-start shrink-0 w-28 rounded-2xl p-4 border-2 transition-all',
                          isFull && 'bg-slate-100 border-slate-100 cursor-not-allowed',
                          !isFull && !isSelected && 'bg-white border-slate-200 hover:border-primary-300 hover:shadow-md',
                          isSelected && 'bg-gradient-to-br from-accent-500 to-accent-600 border-accent-500 text-white shadow-lg shadow-accent-500/30'
                        )}
                      >
                        {isFull ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className={cn('text-xl font-bold', isSelected ? 'text-white' : 'text-slate-300 line-through')}>{ts.time}</span>
                            <XCircle className={cn('w-6 h-6', isSelected ? 'text-white' : 'text-slate-400')} />
                            <span className={cn('text-xs', isSelected ? 'text-white/80' : 'text-slate-400')}>已满</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <span className={cn('text-xl font-bold', isSelected ? 'text-white' : 'text-slate-900')}>{ts.time}</span>
                            <div className={cn('text-xs px-2 py-0.5 rounded-full', isSelected ? 'bg-white/20 text-white' : remain <= 4 ? 'bg-warning-100 text-warning-600' : 'bg-success-100 text-success-600')}>剩{remain}位</div>
                            <span className={cn('text-sm font-semibold', isSelected ? 'text-white' : 'text-accent-600')}>¥{price}</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <div className="card p-5 mb-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" />选择场地</h3>
                <div className="relative">
                  <button onClick={() => setCourtOpen(o => !o)} className={cn(
                    'w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between transition-all',
                    courtOpen ? 'border-primary-400 bg-primary-50/50' : 'border-slate-200 bg-white hover:border-primary-300'
                  )}>
                    {selectedCourt ? (
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{selectedCourt.name}</div>
                        <div className="text-sm text-slate-500 mt-0.5">¥{selectedCourt.pricePerHour}/小时 · 容纳{selectedCourt.capacity}人</div>
                      </div>
                    ) : (
                      <span className="text-slate-400">请选择场地</span>
                    )}
                    <ChevronRight className={cn('w-5 h-5 text-slate-400 transition-transform', courtOpen && 'rotate-90')} />
                  </button>
                  <AnimatePresence>
                    {courtOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mt-2 rounded-2xl border border-slate-200 overflow-hidden"
                      >
                        {venueCourts.map(c => (
                          <button
                            key={c.id}
                            onClick={() => { bk.setSelectedCourtId(c.id); setCourtOpen(false) }}
                            className={cn(
                              'w-full text-left p-4 flex items-center justify-between border-b last:border-b-0 transition-colors',
                              bk.selectedCourtId === c.id ? 'bg-accent-50' : 'hover:bg-slate-50'
                            )}
                          >
                            <div>
                              <div className={cn('font-semibold', bk.selectedCourtId === c.id ? 'text-accent-600' : 'text-slate-800')}>{c.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{c.facilities}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-accent-600 font-bold">¥{c.pricePerHour}</div>
                              <div className="text-xs text-slate-400">{c.capacity}人</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2"><Users className="w-5 h-5 text-primary-500" />人数</h3>
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={() => bk.setPeopleCount(bk.peopleCount - 1)}
                    className="touch-target w-[72px] h-[72px] rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    <Minus className="w-8 h-8 text-slate-700" strokeWidth={3} />
                  </button>
                  <motion.div
                    key={bk.peopleCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 text-center"
                  >
                    <div className="text-6xl font-bold gradient-text">{bk.peopleCount}</div>
                    <div className="text-sm text-slate-500 mt-1">人</div>
                  </motion.div>
                  <button
                    onClick={() => bk.setPeopleCount(bk.peopleCount + 1)}
                    className="touch-target w-[72px] h-[72px] rounded-full bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/30 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <Plus className="w-8 h-8 text-white" strokeWidth={3} />
                  </button>
                </div>
                {selectedCourt && (
                  <div className="mt-6 p-4 rounded-2xl bg-primary-50 border border-primary-100 text-center">
                    <div className="text-sm text-primary-600">
                      场地容纳 <span className="font-bold">{selectedCourt.capacity}</span> 人 · 推荐 <span className="font-bold">{Math.min(6, selectedCourt.capacity)}</span> 人
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <div className="card p-1 mb-5">
                <div className="flex">
                  {(['available', 'unavailable'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setCouponTab(t)}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-semibold text-sm transition-all',
                        couponTab === t ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {t === 'available' ? `可用 (${availableCoupons.length})` : `不可用 (${unavailableCoupons.length})`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 mb-5">
                {(couponTab === 'available' ? availableCoupons : unavailableCoupons).map((c: Coupon) => {
                  const disabled = couponTab === 'unavailable'
                  const selected = bk.selectedCouponId === c.id
                  const canUse = !disabled
                  const benefitText = c.type === '满减' ? `满¥${c.minAmount}减¥${c.discount}` :
                    c.type === '折扣' ? `${(c.discountPercent || c.discount) * 10}折` :
                    c.type === '立减' ? `立减¥${c.discount}` : `体验券`
                  return (
                    <motion.button
                      key={c.id}
                      whileTap={canUse ? { scale: 0.98 } : {}}
                      onClick={() => canUse && bk.setSelectedCouponId(selected ? null : c.id)}
                      disabled={disabled}
                      className={cn(
                        'w-full relative overflow-hidden rounded-2xl border-2 transition-all text-left flex',
                        selected && 'border-accent-500 shadow-lg shadow-accent-500/20',
                        !selected && !disabled && 'border-slate-200 hover:border-primary-300',
                        disabled && 'border-slate-100 opacity-60'
                      )}
                    >
                      <div className={cn('w-2 shrink-0 bg-gradient-to-b', COUPON_COLORS[c.type] || 'from-slate-400 to-slate-500')} />
                      <div className="flex-1 p-4 bg-white flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{c.name}</h4>
                            <span className={cn('text-xs px-2 py-0.5 rounded-full text-white bg-gradient-to-r', COUPON_COLORS[c.type])}>{c.type}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1.5">有效期至 {c.expireAt}</div>
                          {c.minAmount && <div className="text-xs text-slate-400 mt-0.5">满¥{c.minAmount}可用</div>}
                        </div>
                        <div className="text-right pr-2">
                          {c.type === '折扣' ? (
                            <div className="text-2xl font-bold text-accent-600">
                              {(c.discountPercent || c.discount) * 10}<span className="text-sm">折</span>
                            </div>
                          ) : (
                            <div className="text-2xl font-bold text-accent-600">
                              ¥{c.discount}
                            </div>
                          )}
                          <div className="text-xs text-slate-400 mt-0.5">{benefitText}</div>
                        </div>
                        {selected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  )
                })}
                {couponTab === 'available' && availableCoupons.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <TicketPercent className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <div>暂无可用优惠券</div>
                  </div>
                )}
              </div>
              <button
                onClick={() => bk.setSelectedCouponId(null)}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all',
                  !bk.selectedCouponId ? 'border-primary-400 bg-primary-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                )}
              >
                <span className="font-semibold text-slate-700">不使用优惠券</span>
                {!bk.selectedCouponId && <Check className="w-5 h-5 text-primary-500" strokeWidth={3} />}
              </button>
              {totals.discount > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-success-50 to-accent-50 border border-success-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-500" />
                    <span className="text-slate-700 font-medium">已优惠</span>
                  </div>
                  <span className="text-xl font-bold text-success-600">-¥{totals.discount.toFixed(2)}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <AnimatePresence mode="wait">
                {paymentState === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="card p-5 mb-5">
                      <h3 className="font-bold text-slate-800 mb-4">订单明细</h3>
                      <div className="space-y-3">
                        {[
                          { icon: MapPin, label: '场馆', value: venue?.name || '-' },
                          { icon: MapPin, label: '场地', value: selectedCourt?.name || '-' },
                          { icon: CalendarDays, label: '日期', value: bk.selectedDate },
                          { icon: Clock, label: '时段', value: selectedSlotTime || '-' },
                          { icon: Users, label: '人数', value: `${bk.peopleCount}人` },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center py-2 border-b last:border-b-0 border-slate-100">
                            <item.icon className="w-4 h-4 text-slate-400 mr-3" />
                            <span className="text-sm text-slate-500 w-16">{item.label}</span>
                            <span className="text-sm text-slate-800 font-medium flex-1">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card p-5 mb-5">
                      <h3 className="font-bold text-slate-800 mb-4">价格明细</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-slate-600"><span>原价</span><span>¥{totals.total.toFixed(2)}</span></div>
                        {totals.discount > 0 && <div className="flex justify-between text-success-600"><span>优惠券优惠</span><span>-¥{totals.discount.toFixed(2)}</span></div>}
                        <div className="h-px bg-slate-100 my-3" />
                        <div className="flex justify-between items-end">
                          <span className="text-slate-700 font-semibold">实付金额</span>
                          <span className="text-3xl font-bold gradient-text">¥{totals.pay.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="card p-5 mb-6">
                      <h3 className="font-bold text-slate-800 mb-4">支付方式</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => setPayMethod('balance')}
                          className={cn(
                            'w-full p-4 rounded-2xl border-2 flex items-center transition-all text-left',
                            payMethod === 'balance' ? 'border-accent-500 bg-accent-50/50' : 'border-slate-200 hover:border-slate-300'
                          )}
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mr-4">
                            <Wallet className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900">余额支付</div>
                            <div className={cn('text-sm mt-0.5', balanceInsufficient ? 'text-danger-500' : 'text-slate-500')}>
                              当前余额 ¥{(mb.member?.balance || 0).toFixed(2)}
                              {balanceInsufficient && <span className="ml-2 flex items-center gap-1 inline-flex"><AlertTriangle className="w-3 h-3" />余额不足</span>}
                            </div>
                          </div>
                          <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center', payMethod === 'balance' ? 'bg-accent-500 border-accent-500' : 'border-slate-300')}>
                            {payMethod === 'balance' && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { k: 'wechat', label: '微信支付', icon: '💚', bg: 'from-green-500 to-green-600' },
                            { k: 'alipay', label: '支付宝', icon: '💙', bg: 'from-blue-500 to-blue-600' },
                          ].map(m => (
                            <button
                              key={m.k}
                              onClick={() => setPayMethod(m.k as 'wechat' | 'alipay')}
                              className={cn(
                                'p-4 rounded-2xl border-2 flex flex-col items-center transition-all',
                                payMethod === m.k ? 'border-accent-500 bg-accent-50/50' : 'border-slate-200 hover:border-slate-300'
                              )}
                            >
                              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2 bg-gradient-to-br', m.bg)}>{m.icon}</div>
                              <span className="text-sm font-semibold text-slate-700">{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentState === 'paying' && (
                  <motion.div key="paying" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="card p-12 text-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-accent-200 border-t-accent-500 flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-800">正在处理支付...</h3>
                    <p className="text-slate-500 mt-2">请稍候，不要关闭页面</p>
                  </motion.div>
                )}

                {paymentState === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="card p-8 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }} transition={{ type: 'spring', bounce: 0.6 }} className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg shadow-success-500/30">
                      <CheckCircle className="w-14 h-14 text-white" strokeWidth={3} />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">支付成功</h3>
                    <p className="text-slate-500 mb-6">入场码已生成，请按时到场</p>
                    <div className="inline-block p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm mb-6">
                      <QRCodeSVG value={bk.entryCode || 'ENTRY'} size={160} level="H" includeMargin />
                      <div className="mt-4 font-mono text-lg tracking-widest text-slate-700 font-bold">{bk.entryCode}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <BigButton variant="outline" size="md" icon={<TicketPercent className="w-5 h-5" />} onClick={() => nav('/entry')}>查看入场码</BigButton>
                      <BigButton variant="primary" size="md" icon={<Home className="w-5 h-5" />} onClick={() => nav('/calendar')}>返回首页</BigButton>
                    </div>
                  </motion.div>
                )}

                {paymentState === 'failed' && (
                  <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="card p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-danger-500 to-danger-600 flex items-center justify-center shadow-lg shadow-danger-500/30">
                      <XCircle className="w-14 h-14 text-white" strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">支付失败</h3>
                    <p className="text-slate-500 mb-8">请检查支付方式后重试</p>
                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      <BigButton variant="outline" size="md" onClick={() => setPaymentState('idle')}>返回</BigButton>
                      <BigButton variant="danger" size="md" icon={<CreditCard className="w-5 h-5" />} onClick={handlePay}>重试支付</BigButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {paymentState === 'idle' && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 pb-6">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 0 ? (
              <BigButton variant="outline" size="lg" icon={<ChevronLeft className="w-5 h-5" />} onClick={prevStep}>上一步</BigButton>
            ) : (
              <BigButton variant="ghost" size="lg" icon={<Home className="w-5 h-5" />} onClick={() => nav('/calendar')}>取消</BigButton>
            )}
            {step < 3 ? (
              <BigButton variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right" fullWidth onClick={nextStep}>下一步</BigButton>
            ) : (
              <BigButton variant="accent" size="lg" icon={<CreditCard className="w-5 h-5" />} fullWidth onClick={handlePay}>确认支付 ¥{totals.pay.toFixed(2)}</BigButton>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
