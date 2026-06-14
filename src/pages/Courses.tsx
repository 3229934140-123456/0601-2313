import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Star, Users, MapPin, Clock,
  X, CheckCircle2, Award, MessageSquare, Calendar, Dumbbell, Flame, Sparkles
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { useMemberStore } from '@/store/useMemberStore'
import { useCourseStore } from '@/store/useCourseStore'
import { coaches, getCoachById } from '@/data/courses'
import { formatCurrency } from '@/utils/format'
import { cn } from '@/lib/utils'
import type { Course } from '@/types'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const venueTypeMap: Record<string, { label: string; icon: string; gradient: string }> = {
  basketball: { label: '篮球', icon: '🏀', gradient: 'from-orange-500 to-red-500' },
  badminton: { label: '羽毛球', icon: '🏸', gradient: 'from-emerald-500 to-teal-500' },
  swimming: { label: '游泳', icon: '🏊', gradient: 'from-blue-500 to-cyan-500' },
}

export default function Courses() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null)
  const [enrollModal, setEnrollModal] = useState<{ open: boolean; course: Course | null }>({ open: false, course: null })
  const [readTerms, setReadTerms] = useState(false)
  const [enrolling, setEnrolling] = useState(false)

  const showToast = useUiStore((s) => s.showToast)
  const member = useMemberStore((s) => s.member)
  const deductBalance = useMemberStore((s) => s.deductBalance)
  const courses = useCourseStore((s) => s.courses)
  const enrollCourse = useCourseStore((s) => s.enrollCourse)
  const isEnrolled = useCourseStore((s) => s.isEnrolled)

  const weekDates = useMemo(() => {
    const now = new Date()
    now.setDate(now.getDate() + weekOffset * 7)
    const start = new Date(now); start.setDate(now.getDate() - now.getDay())
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
  }, [weekOffset])

  const todayStr = new Date().toISOString().split('T')[0]
  const activeDay = selectedDay || todayStr

  const courseCountByDay = useMemo(() => {
    const map: Record<string, number> = {}
    courses.forEach((c) => { const d = new Date(c.startTime).toISOString().split('T')[0]; map[d] = (map[d] || 0) + 1 })
    return map
  }, [])

  const filteredCourses = useMemo(() => {
    let list = courses.filter((c) => new Date(c.startTime).toISOString().split('T')[0] === activeDay)
    if (selectedCoachId) list = list.filter((c) => c.coachId === selectedCoachId)
    return list
  }, [activeDay, selectedCoachId])

  const fmt = (n: number) => n.toString().padStart(2, '0')
  const formatCourseTime = (iso: string, duration: number) => {
    const d = new Date(iso), end = new Date(d.getTime() + duration * 60 * 1000)
    return `${weekDays[d.getDay()]} ${fmt(d.getHours())}:${fmt(d.getMinutes())} - ${fmt(end.getHours())}:${fmt(end.getMinutes())}`
  }
  const getTag = (c: Course) => {
    const r = c.enrolled / c.capacity
    if (c.id === 'course1' || c.id === 'course4') return { l: '热门', c: 'bg-danger-500 text-white' }
    if (c.id === 'course6' || c.id === 'course3') return { l: '新课', c: 'bg-accent-500 text-white' }
    if (r >= 1) return { l: '满员', c: 'bg-gray-400 text-white' }
    return null
  }
  const getProg = (c: Course) => { const r = c.enrolled / c.capacity; return r >= 1 ? 'bg-gray-400' : r >= 0.8 ? 'bg-warning-500' : 'bg-success-500' }

  const handleEnroll = async () => {
    if (!enrollModal.course) return
    if (!readTerms) { showToast('warning', '请先勾选注意事项'); return }
    if (!member) { showToast('warning', '请先登录会员'); return }
    if (member.balance < enrollModal.course.price) { showToast('error', '余额不足'); return }
    if (isEnrolled(enrollModal.course.id, member.id)) { showToast('warning', '您已报名该课程'); return }
    if (enrollModal.course.enrolled >= enrollModal.course.capacity) { showToast('warning', '课程已满员'); return }

    setEnrolling(true)
    await new Promise((r) => setTimeout(r, 1200))

    deductBalance(enrollModal.course.price)
    const result = enrollCourse(enrollModal.course.id, member.id)
    setEnrolling(false)
    setReadTerms(false)

    if (result.success) {
      showToast('success', `报名成功！已支付${formatCurrency(enrollModal.course.price)}`)
      setEnrollModal({ open: false, course: null })
    } else {
      showToast('error', result.message)
    }
  }

  const renderStars = (rating: number, key: string) => (
    <div key={key} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const f = i <= Math.floor(rating), h = !f && i - 0.5 <= rating
        return (
          <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.05, type: 'spring' }}>
            <Star className={cn('h-5 w-5', f ? 'fill-warning-500 text-warning-500' : h ? 'fill-warning-500/50 text-warning-500' : 'text-gray-300')} />
          </motion.span>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-accent-50/20 pb-16">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">课程报名</h1>
          <p className="mt-1 text-sm text-gray-500">精选专业课程，跟随优秀教练开启训练之旅</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition"><ChevronLeft className="h-5 w-5" /></button>
            <h2 className="text-base font-bold text-gray-700">{weekDates[0].getMonth() + 1}月{weekDates[0].getDate()}日 - {weekDates[6].getMonth() + 1}月{weekDates[6].getDate()}日</h2>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((d) => {
              const ds = d.toISOString().split('T')[0], isA = activeDay === ds, cnt = courseCountByDay[ds] || 0
              return (
                <button key={ds} onClick={() => setSelectedDay(ds)}
                  className={cn('flex flex-col items-center gap-1 rounded-2xl py-3 transition-all',
                    isA ? 'bg-gradient-to-b from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30 scale-105' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}>
                  <span className={cn('text-xs font-semibold', isA ? 'text-white/80' : 'text-gray-400')}>{weekDays[d.getDay()]}</span>
                  <span className={cn('text-xl font-bold', isA && 'drop-shadow-sm')}>{d.getDate()}</span>
                  <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded-full', isA ? 'bg-white/25 text-white' : cnt > 0 ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-400')}>{cnt}课</span>
                </button>
              )
            })}
          </div>
          {selectedCoachId && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 flex items-center justify-between rounded-xl bg-primary-50 px-4 py-2.5 overflow-hidden">
              <span className="text-sm text-primary-700">筛选教练：<span className="font-bold">{getCoachById(selectedCoachId)?.name}</span> 的课程</span>
              <button onClick={() => setSelectedCoachId(null)} className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-primary-600 border border-primary-200 hover:bg-primary-100 transition">清除</button>
            </motion.div>
          )}
        </motion.div>

        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800"><Dumbbell className="h-5 w-5 text-accent-500" />精选课程</h2>
          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white py-16 shadow-card">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"><Calendar className="h-10 w-10 text-gray-300" /></div>
              <p className="text-lg font-medium text-gray-500">当日暂无课程</p><p className="mt-1 text-sm text-gray-400">请选择其他日期</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((c, idx) => {
                const coach = getCoachById(c.coachId), tag = getTag(c), ratio = Math.min(100, (c.enrolled / c.capacity) * 100)
                const v = venueTypeMap[c.venueType] || venueTypeMap.basketball
                const full = c.enrolled >= c.capacity
                const alreadyEnrolled = member ? isEnrolled(c.id, member.id) : false
                return (
                  <motion.div key={c.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="group overflow-hidden rounded-3xl bg-white shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1">
                    <div className={cn('relative h-28 bg-gradient-to-br p-5 flex items-center justify-between', v.gradient)}>
                      <span className="text-5xl drop-shadow-lg">{v.icon}</span>
                      {tag && <span className={cn('absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-md', tag.c)}>{tag.l}</span>}
                    </div>
                    <div className="p-5">
                      <h3 className="mb-2 text-lg font-bold text-gray-800">{c.name}</h3>
                      <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                        <img src={coach?.avatar} className="h-6 w-6 rounded-full border-2 border-white shadow-sm" alt="" />
                        <span className="font-medium text-gray-700">{coach?.name}</span><span>·</span>
                        <span className="flex items-center gap-0.5"><Clock className="h-3.5 w-3.5" />{c.duration}min</span>
                      </div>
                      <p className="mb-1 flex items-center gap-1.5 text-sm text-gray-600"><Calendar className="h-4 w-4 text-primary-500" />{formatCourseTime(c.startTime, c.duration)}</p>
                      <p className="mb-3 flex items-center gap-1.5 text-sm text-gray-600"><MapPin className="h-4 w-4 text-primary-500" />{v.label}馆 · {c.level || '通用'}班</p>
                      <div className="mb-4">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 font-medium text-gray-500"><Users className="h-3.5 w-3.5" />已报名 {c.enrolled}/{c.capacity}</span>
                          <span className={cn('font-bold', full ? 'text-gray-400' : ratio >= 80 ? 'text-warning-500' : 'text-success-500')}>{full ? '已满员' : ratio >= 80 ? '紧张' : '充足'}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                          <motion.div className={cn('h-full rounded-full', getProg(c))} initial={{ width: 0 }} animate={{ width: `${ratio}%` }} transition={{ duration: 0.6, delay: idx * 0.05 }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div><span className="text-2xl font-bold text-accent-600">{formatCurrency(c.price)}</span><span className="ml-1 text-xs text-gray-400">/人</span></div>
                        <button onClick={() => !alreadyEnrolled && !full && setEnrollModal({ open: true, course: c })} disabled={full || alreadyEnrolled}
                          className={cn('h-12 rounded-xl px-5 font-bold text-sm transition active:scale-95',
                            alreadyEnrolled ? 'bg-success-100 text-success-600 cursor-not-allowed' :
                            full ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                            'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl')}>
                          {alreadyEnrolled ? '已报名' : full ? '已满员' : '立即报名'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800"><Award className="h-5 w-5 text-accent-500" />明星教练团</h2>
          <div className="snap-x snap-mandatory flex gap-5 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-thin">
            {coaches.map((coach, idx) => (
              <motion.div key={coach.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}
                className="snap-start shrink-0 w-72 overflow-hidden rounded-3xl bg-white shadow-card hover:shadow-card-hover transition-all">
                <div className="p-6 pb-4 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10">
                  <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-full p-1.5 bg-gradient-to-br from-primary-400 via-accent-400 to-primary-500 shadow-xl">
                    <img src={coach.avatar} alt={coach.name} className="h-full w-full rounded-full object-cover bg-white" />
                  </div>
                  <h3 className="text-center text-xl font-bold text-gray-800">{coach.name}</h3>
                  <p className="mt-1 text-center text-sm text-gray-500">教龄 {coach.experience} 年</p>
                </div>
                <div className="px-6 pb-6">
                  <div className="mb-3 flex flex-wrap gap-1.5 justify-center">
                    {coach.specialty.split(/[，,、]/).slice(0, 3).map((t, i) => (
                      <span key={i} className={cn('rounded-full px-3 py-1 text-xs font-semibold',
                        i === 0 ? 'bg-primary-100 text-primary-600' : i === 1 ? 'bg-accent-100 text-accent-600' : 'bg-success-50 text-success-600')}>{t}</span>
                    ))}
                  </div>
                  <div className="mb-3 flex items-center justify-center gap-3 py-2 rounded-xl bg-gray-50">
                    {renderStars(coach.rating, coach.id)}<span className="text-lg font-bold text-warning-500">{coach.rating}</span>
                  </div>
                  <p className="mb-4 flex items-center justify-center gap-1 text-xs text-gray-500"><MessageSquare className="h-3.5 w-3.5" />{120 + idx * 8}条好评</p>
                  <button onClick={() => setSelectedCoachId(selectedCoachId === coach.id ? null : coach.id)}
                    className={cn('w-full h-12 rounded-xl font-bold text-sm transition active:scale-95',
                      selectedCoachId === coach.id ? 'border-2 border-primary-500 text-primary-600 bg-primary-50'
                        : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25 hover:shadow-xl')}>
                    {selectedCoachId === coach.id ? '✓ 已筛选' : 'TA的课程'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {enrollModal.open && enrollModal.course && (() => {
          const coach = getCoachById(enrollModal.course.coachId)
          const v = venueTypeMap[enrollModal.course.venueType] || venueTypeMap.basketball
          return (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !enrolling && setEnrollModal({ open: false, course: null })} />
              <motion.div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl" initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 30 }}>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                  <h3 className="text-xl font-bold text-gray-800">确认报名</h3>
                  <button disabled={enrolling} onClick={() => setEnrollModal({ open: false, course: null })}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-50"><X className="h-5 w-5" /></button>
                </div>
                <div className="max-h-[55vh] overflow-y-auto px-6 py-5">
                  <div className="mb-5 rounded-2xl border border-gray-100 bg-gradient-to-br from-primary-50/50 to-accent-50/50 p-4">
                    <div className="flex gap-3">
                      <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-2xl', v.gradient)}>{v.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">{enrollModal.course.name}</h4>
                        <p className="text-sm text-gray-500 mt-0.5">{coach?.name} · {enrollModal.course.duration}分钟</p>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatCourseTime(enrollModal.course.startTime, enrollModal.course.duration)}</p>
                      </div>
                      <p className="text-xl font-bold text-accent-600 shrink-0">{formatCurrency(enrollModal.course.price)}</p>
                    </div>
                  </div>
                  <div className="mb-5 rounded-2xl bg-gray-50 p-4">
                    <h5 className="mb-2 text-sm font-bold text-gray-700 flex items-center gap-1.5"><Users className="h-4 w-4" />报名人信息</h5>
                    {member ? (
                      <div className="flex items-center gap-3">
                        <img src={member.avatar} className="h-10 w-10 rounded-full border-2 border-white shadow-sm" alt="" />
                        <div><p className="font-semibold text-gray-800">{member.name}</p><p className="text-xs text-gray-500">{member.memberNo} · {member.level}</p></div>
                        <div className="ml-auto text-right">
                          <p className="text-xs text-gray-400">余额</p>
                          <p className={cn('font-bold', member.balance < enrollModal.course!.price ? 'text-danger-500' : 'text-success-600')}>{formatCurrency(member.balance)}</p>
                        </div>
                      </div>
                    ) : <p className="text-sm text-gray-500">请先登录会员</p>}
                  </div>
                  <div className="mb-3 rounded-2xl border border-warning-200 bg-warning/5 p-4">
                    <h5 className="mb-2 text-sm font-bold text-warning-700 flex items-center gap-1.5"><Flame className="h-4 w-4" />注意事项</h5>
                    <ul className="text-xs text-warning-700/90 space-y-1"><li>· 提前15分钟签到，携带装备水杯</li><li>· 开课前2h可免费取消</li><li>· 心脏病患者请提前告知教练</li></ul>
                  </div>
                  <label className="flex cursor-pointer items-start gap-2.5 select-none">
                    <input type="checkbox" checked={readTerms} onChange={(e) => setReadTerms(e.target.checked)} disabled={enrolling}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 border-gray-300 text-primary-500 focus:ring-primary-400" />
                    <span className="text-sm text-gray-600">我已阅读并同意《课程报名须知》和《会员服务条款》</span>
                  </label>
                </div>
                <div className="flex items-stretch gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                  <button disabled={enrolling} onClick={() => setEnrollModal({ open: false, course: null })} className="flex-1 h-14 rounded-2xl border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50">取消</button>
                  <button onClick={handleEnroll} disabled={enrolling || !readTerms}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 font-bold text-white shadow-lg shadow-primary-500/25 hover:shadow-xl transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100">
                    {enrolling ? <span className="flex items-center justify-center gap-2"><Sparkles className="h-5 w-5 animate-pulse" />支付中...</span>
                      : <span className="flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" />确认支付 {formatCurrency(enrollModal.course.price)}</span>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
