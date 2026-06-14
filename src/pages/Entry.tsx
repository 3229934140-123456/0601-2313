import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Printer, AlarmClock, Search, Check, Copy, Send, Ban,
  Dumbbell, MapPin, Clock, Users,
} from 'lucide-react'
import { useBookingStore } from '@/store/useBookingStore'
import { useUiStore } from '@/store/useUiStore'
import { members } from '@/data/members'
import { maskName } from '@/utils/format'
import { cn } from '@/lib/utils'
import type { Booking } from '@/types'

const getStatusInfo = (b: Booking) => {
  if (b.status === 'checked_in') return { label: '已入场', cls: 'bg-slate-100 text-slate-600' }
  if (!b.timeRange || !b.date) return { label: '待入场', cls: 'bg-success-500/10 text-success-600' }
  const now = new Date()
  const [sh] = b.timeRange.split(' - ')[0].split(':').map(Number)
  const st = new Date(b.date); st.setHours(sh, Number(b.timeRange.split(':')[1].slice(0, 2)), 0, 0)
  const dm = (st.getTime() - now.getTime()) / 60000
  if (dm < -15) return { label: '超时', cls: 'bg-danger-500/10 text-danger-600' }
  if (dm <= 30) return { label: '即将开始', cls: 'bg-warning-500/10 text-warning-600' }
  return { label: '待入场', cls: 'bg-success-500/10 text-success-600' }
}

const isOverdue = (b: Booking) => {
  if (!b.timeRange || !b.date) return false
  const now = new Date()
  const [sh] = b.timeRange.split(' - ')[0].split(':').map(Number)
  const st = new Date(b.date); st.setHours(sh, Number(b.timeRange.split(':')[1].slice(0, 2)), 0, 0)
  return (now.getTime() - st.getTime()) / 60000 > 15
}

export default function Entry() {
  const { bookings, checkInBooking, cancelBooking } = useBookingStore()
  const showToast = useUiStore((s) => s.showToast)
  const pending = useMemo(() => bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending'), [bookings])

  const [selectedId, setSelectedId] = useState<string | null>(pending[0]?.id || null)
  const [staffId, setStaffId] = useState('')
  const [staffPwd, setStaffPwd] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [countdown, setCountdown] = useState(15 * 60)
  const [isVerifying, setIsVerifying] = useState(false)

  const selected = pending.find((b) => b.id === selectedId) || null
  const member = selected ? members.find((m) => m.id === selected.memberId) : null

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleCopy = async () => {
    if (selected?.entryCode) {
      await navigator.clipboard.writeText(selected.entryCode)
      showToast('success', '入场码已复制')
    }
  }
  const handlePrint = () => { showToast('info', '正在打开打印预览...'); setTimeout(() => window.print(), 300) }

  const handleVerify = () => {
    if (!selected) return
    if (!staffId || !staffPwd) { showToast('warning', '请输入工号和密码'); return }
    setIsVerifying(true)
    setTimeout(() => {
      checkInBooking(selected.id); setIsVerifying(false)
      showToast('success', `核销成功！${maskName(member?.name || '会员')}已入场`)
    }, 1000)
  }

  const handleRemind = () => {
    if (!selected) return
    showToast('info', `已向${maskName(member?.name || '会员')}发送提醒短信`)
  }

  const handleCancel = () => {
    if (!selected) return
    cancelBooking(selected.id); showToast('warning', '预约已取消，场地已释放')
    setSelectedId(pending.find((b) => b.id !== selected.id)?.id || null)
  }

  const handleSearch = () => {
    const f = pending.find((b) => b.entryCode === manualCode.toUpperCase())
    if (f) { setSelectedId(f.id); showToast('success', '找到对应预约') }
    else showToast('error', '未找到该入场码')
  }

  const cd = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`

  return (
    <div className="flex h-screen w-full gap-4 p-4 bg-gradient-to-br from-slate-50 to-primary-50/50 print:p-0 print:bg-white">
      {/* 左栏 */}
      <div className="flex w-80 flex-col gap-3 print:hidden">
        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-primary-700">
            <Dumbbell className="h-5 w-5 text-accent-500" />待入场预约
          </h2>
          <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {pending.length === 0 ? (
              <div className="py-12 text-center text-slate-400">暂无待入场预约</div>
            ) : pending.map((b) => {
              const st = getStatusInfo(b)
              const sel = b.id === selectedId
              return (
                <motion.div key={b.id} onClick={() => setSelectedId(b.id)}
                  layoutId={`bk-${b.id}`}
                  className={cn('cursor-pointer rounded-2xl border-2 p-4 transition-all',
                    sel ? 'border-accent-500 bg-accent-50/50 shadow-lg shadow-accent-500/20'
                        : 'border-slate-100 bg-white hover:border-primary-200 hover:shadow-md')}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
                        <span className="truncate">{b.venueName}</span>
                      </div>
                      <div className="mt-1 text-sm text-slate-600 truncate">{b.courtName}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" /><span>{b.timeRange}</span>
                      </div>
                    </div>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', st.cls)}>{st.label}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 中栏 */}
      <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto print:overflow-visible">
        {selected ? (<>
          <motion.div key={selected.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="ticket-torn w-full max-w-md bg-white shadow-2xl shadow-primary-500/20 rounded-3xl overflow-hidden">
            <div className="relative p-8 pb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-primary-700">{selected.venueName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{selected.date}</p>
                </div>
                <div className="rounded-xl bg-primary-50 px-3 py-2 text-center">
                  <div className="text-[10px] text-primary-500 font-medium">NO.</div>
                  <div className="text-xs font-mono font-bold text-primary-700">{selected.id.toUpperCase()}</div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative bg-white p-4 rounded-2xl border-2 border-dashed border-primary-100">
                  <QRCodeSVG value={selected.entryCode || 'PLACEHOLDER'} size={280} level="H" fgColor="#083F73" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg ring-4 ring-white">
                      <Dumbbell className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex h-12 w-full items-end justify-center gap-0.5 px-4">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="bg-slate-800 rounded-t-sm"
                      style={{ width: `${(i % 3) + 1}px`, height: `${30 + ((i * 7) % 18)}px` }} />
                  ))}
                </div>
                <button onClick={handleCopy}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-5 py-2.5 transition hover:bg-primary-50 group">
                  <span className="font-mono text-2xl font-bold tracking-[0.2em] text-primary-700">
                    {selected.entryCode || '--------'}
                  </span>
                  <Copy className="h-4 w-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                </button>
              </div>
            </div>
            <div className="relative border-t-2 border-dashed border-slate-200">
              <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full bg-gradient-to-br from-slate-50 to-primary-50/50" />
              <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-gradient-to-br from-slate-50 to-primary-50/50" />
              <div className="p-6 pt-8 bg-gradient-to-b from-white to-slate-50">
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="text-xs text-slate-500">会员</div>
                    <div className="mt-0.5 font-semibold text-slate-800">{maskName(member?.name || '会员')}</div></div>
                  <div><div className="text-xs text-slate-500">场地</div>
                    <div className="mt-0.5 font-semibold text-slate-800 truncate">{selected.courtName}</div></div>
                  <div><div className="text-xs text-slate-500">时段</div>
                    <div className="mt-0.5 font-semibold text-slate-800">{selected.timeRange}</div></div>
                  <div className="flex items-end"><div>
                    <div className="text-xs text-slate-500">人数</div>
                    <div className="mt-0.5 flex items-center gap-1 font-semibold text-slate-800">
                      <Users className="h-4 w-4 text-primary-500" />{selected.peopleCount}人
                    </div></div></div>
                </div>
                <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4">
                  {['请提前15分钟到场，开场15分钟后未入场将自动取消',
                    '凭此码入场核销，请勿泄露给他人',
                    '如需取消请提前2小时操作，避免影响信用'].map((t, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
                      <span className="text-accent-500">•</span><span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          <button onClick={handlePrint} className="btn-primary w-full max-w-md py-4 text-lg print:hidden">
            <Printer className="h-5 w-5 mr-2" />打印入场小票
          </button>
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-md border border-slate-100 print:hidden">
            <AlarmClock className={cn('h-5 w-5', countdown < 60 ? 'text-danger-500' : 'text-warning-500')} />
            <div className="text-sm text-slate-600">入场码有效期</div>
            <div className={cn('font-mono text-xl font-bold tabular-nums',
              countdown < 60 ? 'text-danger-500' : 'text-primary-700')}>{cd}</div>
          </div>
        </>) : (
          <div className="flex flex-1 flex-col items-center justify-center text-slate-400">
            <Dumbbell className="h-20 w-20 mb-4 opacity-30" />
            <p className="text-lg">请从左侧选择一个预约</p>
          </div>
        )}
      </div>

      {/* 右栏 */}
      <div className="flex w-80 flex-col gap-4 print:hidden">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="glass card p-5 flex-1">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-primary-700">
            <Check className="h-5 w-5 text-success-500" />工作人员核销
          </h2>
          <div className="space-y-3">
            <div><label className="mb-1.5 block text-xs font-medium text-slate-600">工号</label>
              <input type="text" value={staffId} onChange={(e) => setStaffId(e.target.value)}
                placeholder="请输入工号"
                className="touch-target-sm w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100" />
            </div>
            <div><label className="mb-1.5 block text-xs font-medium text-slate-600">密码</label>
              <input type="password" value={staffPwd} onChange={(e) => setStaffPwd(e.target.value)}
                placeholder="请输入密码"
                className="touch-target-sm w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {isVerifying ? (
              <motion.div key="ving" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} className="my-5 flex flex-col items-center gap-3 py-4">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-success-500">
                  <Check className="h-8 w-8 text-white" />
                </motion.div>
                <span className="text-sm font-medium text-success-600">正在核销...</span>
              </motion.div>
            ) : selected?.status === 'checked_in' ? (
              <motion.div key="cked" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="my-5 flex items-center justify-center gap-2 rounded-xl bg-success-500/10 py-4 text-success-600">
                <Check className="h-5 w-5" /><span className="font-semibold">已完成核销</span>
              </motion.div>
            ) : (
              <motion.button key="vb" onClick={handleVerify} disabled={!selected}
                whileHover={selected ? { scale: 1.02 } : {}} whileTap={selected ? { scale: 0.98 } : {}}
                className="btn-success mt-5 w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                <Check className="h-5 w-5 mr-2" />核销入场
              </motion.button>
            )}
          </AnimatePresence>
          <div className={cn('mt-5 rounded-2xl border-2 p-4 transition',
            selected && isOverdue(selected) ? 'border-danger-300 bg-danger-50' : 'border-warning-200 bg-warning-50/50')}>
            <div className="mb-3 flex items-center gap-2">
              <AlarmClock className={cn('h-5 w-5', selected && isOverdue(selected) ? 'text-danger-500' : 'text-warning-500')} />
              <span className={cn('font-bold', selected && isOverdue(selected) ? 'text-danger-700' : 'text-warning-700')}>
                超时未到提醒
              </span>
            </div>
            {selected && isOverdue(selected) && (
              <div className="mb-3 rounded-xl bg-danger-500/10 px-3 py-2 text-xs text-danger-700 font-medium">
                ⚠ 该预约已超过开始时间15分钟
              </div>
            )}
            <div className="space-y-2">
              <button onClick={handleRemind} disabled={!selected}
                className="btn w-full border-2 border-warning-300 bg-white text-warning-700 py-2.5 text-sm hover:bg-warning-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="h-4 w-4 mr-1.5" />提醒会员
              </button>
              <button onClick={handleCancel} disabled={!selected}
                className="btn w-full border-2 border-danger-300 bg-white text-danger-600 py-2.5 text-sm hover:bg-danger-50 disabled:opacity-50 disabled:cursor-not-allowed">
                <Ban className="h-4 w-4 mr-1.5" />取消释放场地
              </button>
            </div>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-5">
            <label className="mb-2 block text-xs font-medium text-slate-600">手动输入入场码核验</label>
            <div className="flex gap-2">
              <input type="text" value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="输入8位入场码" maxLength={8}
                className="touch-target-sm flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 font-mono font-bold uppercase tracking-wider outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100" />
              <button onClick={handleSearch} className="btn-secondary touch-target-sm h-12 w-12 shrink-0 p-0">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      <style>{`@media print{body *{visibility:hidden}.ticket-torn,.ticket-torn *{visibility:visible}.ticket-torn{position:absolute;left:50%;top:40px;transform:translateX(-50%);box-shadow:none!important}}`}</style>
    </div>
  )
}
