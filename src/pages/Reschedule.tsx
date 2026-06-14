import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Calendar, X, Clock, Users, MapPin,
  AlertCircle, RefreshCw, Star, RotateCcw, Info
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { useBookingStore } from '@/store/useBookingStore'
import { useMemberStore } from '@/store/useMemberStore'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/lib/utils'
import type { Booking } from '@/types'

type TabType = 'all' | 'confirmed' | 'completed' | 'cancelled'
type QuickDate = 'today' | 'week' | 'month' | 'custom'

const tabMap: Record<TabType, { label: string; status?: string }> = {
  all: { label: '全部' }, confirmed: { label: '待使用', status: 'confirmed' },
  completed: { label: '已完成', status: 'completed' }, cancelled: { label: '已取消', status: 'cancelled' },
}

const cancelReasons = [
  { id: 'trip', label: '行程变更' }, { id: 'health', label: '身体不适' },
  { id: 'venue', label: '场馆原因' }, { id: 'other', label: '其他' },
]

const statusStyles: Record<string, { border: string; badge: string; text: string }> = {
  confirmed: { border: 'border-l-success-500', badge: 'bg-success-50 text-success-600 border-success-200', text: '待使用' },
  pending: { border: 'border-l-warning-500', badge: 'bg-warning/10 text-warning-600 border-warning-200', text: '待支付' },
  completed: { border: 'border-l-primary-500', badge: 'bg-primary-50 text-primary-600 border-primary-200', text: '已完成' },
  cancelled: { border: 'border-l-gray-400', badge: 'bg-gray-100 text-gray-500 border-gray-200', text: '已取消' },
}

const venueIcons: Record<string, string> = { 篮球馆: '🏀', 羽毛球馆: '🏸', 游泳馆: '🏊' }
const timeSlots = Array.from({ length: 14 }, (_, i) => `${(8 + i).toString().padStart(2, '0')}:00`)
const todayStr = new Date().toISOString().split('T')[0]

export default function Reschedule() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [quickDate, setQuickDate] = useState<QuickDate>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  const [cancelModal, setCancelModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })
  const [selectedCancelReason, setSelectedCancelReason] = useState('')
  const [cancelRemark, setCancelRemark] = useState('')
  const [rescheduleModal, setRescheduleModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })
  const [selectedNewDate, setSelectedNewDate] = useState('')
  const [selectedNewSlot, setSelectedNewSlot] = useState('')

  const showToast = useUiStore((s) => s.showToast)
  const bookings = useBookingStore((s) => s.bookings)
  const cancelBooking = useBookingStore((s) => s.cancelBooking)
  const member = useMemberStore((s) => s.member)

  const filteredBookings = useMemo(() => {
    let list = bookings
    if (member) list = list.filter((b) => b.memberId === member.id)
    if (tabMap[activeTab].status) list = list.filter((b) => b.status === tabMap[activeTab].status)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((b) => b.id.toLowerCase().includes(q) || (b.venueName || '').toLowerCase().includes(q) || (b.courtName || '').toLowerCase().includes(q))
    }
    if (quickDate === 'today') list = list.filter((b) => b.date === todayStr)
    else if (quickDate === 'week') {
      const now = new Date(), ws = new Date(now); ws.setDate(now.getDate() - now.getDay())
      const we = new Date(ws); we.setDate(ws.getDate() + 6)
      list = list.filter((b) => b.date && new Date(b.date) >= ws && new Date(b.date) <= we)
    } else if (quickDate === 'month') {
      const now = new Date()
      list = list.filter((b) => b.date && new Date(b.date).getMonth() === now.getMonth() && new Date(b.date).getFullYear() === now.getFullYear())
    } else if (quickDate === 'custom' && customDate) list = list.filter((b) => b.date === customDate)
    return list
  }, [bookings, activeTab, searchQuery, quickDate, customDate, member])

  const calcRefund = (booking: Booking) => {
    const start = new Date(`${booking.date}T${booking.timeRange?.split(' - ')[0] || '00:00'}:00`)
    const hours = (start.getTime() - Date.now()) / (1000 * 60 * 60)
    const rate = hours >= 24 ? 1 : hours >= 2 ? 0.7 : 0
    return { rate, amount: Number((booking.payAmount * rate).toFixed(2)), hours }
  }

  const handleConfirmCancel = () => {
    if (!cancelModal.booking || !selectedCancelReason) { showToast('warning', '请选择取消原因'); return }
    cancelBooking(cancelModal.booking.id)
    const refund = calcRefund(cancelModal.booking)
    showToast('success', `取消成功！退款${formatCurrency(refund.amount)}将在3-5工作日内到账`)
    setCancelModal({ open: false, booking: null }); setSelectedCancelReason(''); setCancelRemark('')
  }

  const handleConfirmReschedule = () => {
    if (!rescheduleModal.booking || !selectedNewDate || !selectedNewSlot) { showToast('warning', '请选择新的日期和时段'); return }
    showToast('success', '改签成功！已发送确认通知')
    setRescheduleModal({ open: false, booking: null }); setSelectedNewDate(''); setSelectedNewSlot('')
  }

  const renderCalendar = () => {
    const now = new Date()
    const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(now); d.setDate(now.getDate() + i); return d })
    return (
      <div className="absolute top-full left-0 z-20 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
        <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold text-gray-700">选择日期</span>
          <button onClick={() => setShowCalendar(false)} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button></div>
        <div className="grid grid-cols-7 gap-1">
          {['日', '一', '二', '三', '四', '五', '六'].map((w) => (<div key={w} className="py-1 text-center text-xs text-gray-400">{w}</div>))}
          {Array.from({ length: now.getDay() }).map((_, i) => (<div key={`e-${i}`} />))}
          {days.map((d) => {
            const ds = d.toISOString().split('T')[0]
            return (<button key={ds} onClick={() => { setCustomDate(ds); setQuickDate('custom'); setShowCalendar(false) }}
              className={cn('aspect-square rounded-lg text-sm transition', customDate === ds ? 'bg-primary-500 font-bold text-white shadow-md'
                : ds === todayStr ? 'bg-primary-50 font-bold text-primary-600' : 'text-gray-600 hover:bg-gray-50')}>{d.getDate()}</button>)
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 pb-12">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">临时改签</h1>
          <p className="mt-1 text-sm text-gray-500">管理您的场地预约，支持取消和改签</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-3xl bg-white p-6 shadow-card">
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(tabMap) as TabType[]).map((key) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={cn('rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                  activeTab === key ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>
                {tabMap[key].label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-2">
              {(['today', 'week', 'month'] as QuickDate[]).map((q) => (
                <button key={q} onClick={() => { setQuickDate(q); setCustomDate('') }}
                  className={cn('rounded-xl px-4 py-2 text-sm font-medium transition',
                    quickDate === q ? 'bg-accent-500 text-white shadow-md shadow-accent-500/25' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>
                  {q === 'today' ? '今日' : q === 'week' ? '本周' : '本月'}
                </button>
              ))}
              <div className="relative">
                <button onClick={() => setShowCalendar(!showCalendar)}
                  className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                    quickDate === 'custom' ? 'bg-accent-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>
                  <Calendar className="h-4 w-4" />{customDate || '选择日期'}
                </button>
                {showCalendar && renderCalendar()}
              </div>
            </div>
            <div className="relative lg:ml-auto lg:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="输入预约号/场馆名搜索"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100" />
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredBookings.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-3xl bg-white py-20 shadow-card">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"><Calendar className="h-10 w-10 text-gray-300" /></div>
                <p className="text-lg font-medium text-gray-500">暂无预约记录</p><p className="mt-1 text-sm text-gray-400">试试更换筛选条件</p>
              </motion.div>
            ) : filteredBookings.map((b, idx) => {
              const style = statusStyles[b.status as keyof typeof statusStyles] || statusStyles.pending
              return (
                <motion.div key={b.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.03 }}
                  className={cn('overflow-hidden rounded-3xl bg-white shadow-card transition-shadow hover:shadow-card-hover border-l-8', style.border)}>
                  <div className="p-6">
                    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-accent-50 text-3xl">{venueIcons[b.venueName || ''] || '🏟️'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{b.venueName}</h3>
                            <span className={cn('rounded-lg border px-2.5 py-1 text-xs font-semibold', style.badge)}>{style.text}</span>
                          </div>
                          <p className="flex items-center gap-1.5 text-sm text-gray-500 mb-1"><MapPin className="h-4 w-4" />{b.courtName}</p>
                          <p className="text-2xl font-bold text-primary-600 mt-2">{b.date} {b.timeRange}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 shrink-0">
                        <span className="flex items-center gap-1.5 text-gray-500"><Users className="h-4 w-4" />{b.peopleCount}人</span>
                        <span className="text-xl font-bold text-accent-600">{formatCurrency(b.payAmount)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      {b.status === 'confirmed' && (
                        <>
                          <button onClick={() => setCancelModal({ open: true, booking: b })} className="flex h-14 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-2xl border-2 border-danger-500 bg-white text-danger-600 font-bold text-base transition hover:bg-danger-50 active:scale-[0.98]">
                            <X className="h-5 w-5" />取消预约
                          </button>
                          <button onClick={() => { setRescheduleModal({ open: true, booking: b }); setSelectedNewDate(b.date || '') }}
                            className="flex h-14 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-base shadow-lg shadow-primary-500/25 transition hover:shadow-xl active:scale-[0.98]">
                            <RefreshCw className="h-5 w-5" />改签
                          </button>
                        </>
                      )}
                      {b.status === 'completed' && (
                        <>
                          <button onClick={() => showToast('info', '跳转至预约页面')} className="flex h-14 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-2xl border-2 border-primary-500 bg-white text-primary-600 font-bold text-base transition hover:bg-primary-50 active:scale-[0.98]">
                            <RotateCcw className="h-5 w-5" />再来一单
                          </button>
                          <button onClick={() => showToast('info', '打开评价页面')} className="flex h-14 flex-1 min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold text-base shadow-lg shadow-accent-500/25 transition hover:shadow-xl active:scale-[0.98]">
                            <Star className="h-5 w-5" />评价
                          </button>
                        </>
                      )}
                      {b.status === 'cancelled' && (
                        <button onClick={() => showToast('info', '跳转至预约页面')} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-base shadow-lg shadow-primary-500/25 transition hover:shadow-xl active:scale-[0.98]">
                          <RotateCcw className="h-5 w-5" />重新预约
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {cancelModal.open && cancelModal.booking && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCancelModal({ open: false, booking: null })} />
            <motion.div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 30 }}>
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <h3 className="text-xl font-bold text-gray-800">取消预约</h3>
                <button onClick={() => setCancelModal({ open: false, booking: null })} className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
                <div className="mb-5 rounded-2xl bg-danger-50/50 border border-danger-100 p-4">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-danger-500 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-danger-700 mb-1">取消退款规则</p>
                      <ul className="text-sm text-danger-600 space-y-0.5"><li>· 24h前：全额退款</li><li>· 2~24h：退款70%</li><li>· 不足2h：不退</li></ul>
                      <p className="mt-3 pt-3 border-t border-danger-200/50 text-sm">
                        距开场约 <span className="font-bold">{Math.max(0, Math.floor(calcRefund(cancelModal.booking).hours))}h</span>，
                        退款：<span className="ml-1 text-lg font-bold text-danger-600">{formatCurrency(calcRefund(cancelModal.booking).amount)}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">取消原因 *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {cancelReasons.map((r) => (
                      <button key={r.id} onClick={() => setSelectedCancelReason(r.id)}
                        className={cn('rounded-xl border-2 px-4 py-3 text-left transition', selectedCancelReason === r.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                        <span className="font-medium">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={cancelRemark} onChange={(e) => setCancelRemark(e.target.value)} rows={2} placeholder="补充说明（选填）"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100" />
              </div>
              <div className="flex items-stretch gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                <button onClick={() => setCancelModal({ open: false, booking: null })} className="flex-1 h-14 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 transition hover:bg-gray-50">再想想</button>
                <button onClick={handleConfirmCancel} className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-danger-500 to-danger-600 font-bold text-white shadow-lg shadow-danger-500/25 transition hover:shadow-xl active:scale-[0.98]">确认取消</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rescheduleModal.open && rescheduleModal.booking && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRescheduleModal({ open: false, booking: null })} />
            <motion.div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 30 }}>
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <h3 className="text-xl font-bold text-gray-800">改签预约</h3>
                <button onClick={() => setRescheduleModal({ open: false, booking: null })} className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl bg-gray-100 p-5">
                    <p className="mb-3 font-semibold text-gray-600"><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-300 text-xs font-bold text-white">原</span>原预约信息</p>
                    <div className="space-y-2 text-gray-700">
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span className="font-medium">{rescheduleModal.booking.venueName}</span>·{rescheduleModal.booking.courtName}</p>
                      <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><span className="font-bold">{rescheduleModal.booking.date}</span></p>
                      <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span className="font-bold">{rescheduleModal.booking.timeRange}</span></p>
                      <p className="pt-2 text-lg font-bold text-accent-600">{formatCurrency(rescheduleModal.booking.payAmount)}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/30 p-5">
                    <p className="mb-3 font-semibold text-primary-700"><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-white">新</span>新预约选择</p>
                    <div className="space-y-4">
                      <input type="date" value={selectedNewDate} min={todayStr} onChange={(e) => setSelectedNewDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-gray-600">选择时段</label>
                        <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto">
                          {timeSlots.map((t) => (
                            <button key={t} onClick={() => setSelectedNewSlot(t)}
                              className={cn('rounded-lg py-2 text-xs font-semibold transition', selectedNewSlot === t ? 'bg-primary-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600')}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl bg-accent-50 border border-accent-200 p-5">
                  <div className="flex items-center gap-2 mb-3"><Info className="h-5 w-5 text-accent-600" /><span className="font-semibold text-accent-800">费用明细</span></div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600"><span>原订单金额</span><span>{formatCurrency(rescheduleModal.booking.payAmount)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>改签服务费</span><span className="text-danger-600">+{formatCurrency(5)}</span></div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-accent-200"><span className="font-bold text-gray-800">需补差价（多退少补）</span><span className="text-lg font-bold text-accent-600">{formatCurrency(5)}</span></div>
                  </div>
                </div>
              </div>
              <div className="flex items-stretch gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                <button onClick={() => setRescheduleModal({ open: false, booking: null })} className="flex-1 h-14 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 transition hover:bg-gray-50">取消</button>
                <button onClick={handleConfirmReschedule} className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 font-bold text-white shadow-lg shadow-primary-500/25 transition hover:shadow-xl active:scale-[0.98]">确认改签</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
