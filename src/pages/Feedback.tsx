import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DoorClosed, PartyPopper, Settings, Bell, Search, ChevronDown, ChevronUp,
  AlertCircle, ThumbsUp, Star, Camera, Phone, Flame, CheckCircle, Clock,
  Users, TrendingUp, DollarSign, UserPlus, AlertTriangle, X, Send,
  PieChart as PieChartIcon, BarChart3, Award, BellRing, Calendar
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils'
import { announcements } from '@/data/announcements'
import { venues } from '@/data/venues'
import { useMemberStore } from '@/store/useMemberStore'
import { useUiStore } from '@/store/useUiStore'
import { useFeedbackStore, type RepairOrder } from '@/store/useFeedbackStore'
import BigButton from '@/components/ui/BigButton'

type TabKey = 'announcement' | 'repair' | 'review' | 'stats'
const TABS: { key: TabKey; label: string; icon: typeof Bell }[] = [
  { key: 'announcement', label: '公告通知', icon: BellRing },
  { key: 'repair', label: '设施报修', icon: Settings },
  { key: 'review', label: '服务评价', icon: ThumbsUp },
  { key: 'stats', label: '当日统计', icon: BarChart3 },
]
const TYPE_CFG: Record<string, { icon: typeof DoorClosed; color: string; bg: string }> = {
  '闭馆通知': { icon: DoorClosed, color: 'text-danger-600', bg: 'bg-danger-50' },
  '活动公告': { icon: PartyPopper, color: 'text-warning-600', bg: 'bg-warning-50' },
  '设施维护': { icon: Settings, color: 'text-primary-600', bg: 'bg-primary-50' },
  '系统公告': { icon: Bell, color: 'text-success-600', bg: 'bg-success-50' },
}
const FAULT_TYPES = ['灯光', '空调', '地面', '器材', '淋浴', '更衣室', '其他']
const REVIEW_TAGS = ['环境好', '器材新', '服务棒', '教练专业', '场地干净', '性价比高', '停车方便']
const REVIEW_TARGETS = ['场馆整体', '篮球馆', '羽毛球馆', '游泳馆', '前台服务', '教练服务']
const URGENCY = ['普通', '重要', '紧急']
const URG_COLOR = ['from-success-400 to-success-500', 'from-warning-400 to-warning-500', 'from-danger-400 to-danger-500']
const PIE_DATA = [{ name: '篮球馆', value: 38, color: '#3B82F6' }, { name: '羽毛球馆', value: 32, color: '#F59E0B' }, { name: '游泳馆', value: 30, color: '#10B981' }]
const BAR_DATA = Array.from({ length: 14 }, (_, i) => ({ hour: `${i + 9}时`, count: [12, 8, 15, 22, 35, 48, 52, 45, 38, 42, 35, 28, 18, 10][i] }))
const TOP_COURTS = [{ name: '篮球VIP场地', pct: 95 }, { name: '羽毛球VIP场地', pct: 88 }, { name: '篮球场地1号', pct: 82 }, { name: '羽毛球场地5号', pct: 78 }, { name: '标准泳道1', pct: 72 }, { name: '篮球场地2号', pct: 68 }, { name: '羽毛球场地6号', pct: 65 }, { name: '标准泳道2', pct: 60 }, { name: '羽毛球场地1号', pct: 55 }, { name: '篮球场地3号', pct: 48 }]
const WARN = [{ code: 'BK20260615001', name: '张伟', venue: '篮球场地1号', overdue: '35分钟' }, { code: 'BK20260615002', name: '李娜', venue: '羽毛球场地3号', overdue: '20分钟' }, { code: 'BK20260615003', name: '王强', venue: '标准泳道3', overdue: '12分钟' }]

function CountUp({ end, dur = 1500, pre = '', suf = '' }: { end: number; dur?: number; pre?: string; suf?: string }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf: number, s = performance.now()
    const t = (n: number) => { const p = Math.min((n - s) / dur, 1); setV(Math.floor(end * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(t) }
    raf = requestAnimationFrame(t); return () => cancelAnimationFrame(raf)
  }, [end, dur])
  return <span className="animate-number">{pre}{v.toLocaleString()}{suf}</span>
}

function StarRow({ value, onChange, size = 64 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [h, setH] = useState(0), d = h || value
  return (
    <div className="flex gap-3">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} onMouseLeave={() => setH(0)} className="relative touch-target-sm flex items-center justify-center"
          onMouseMove={e => { const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect(); setH(i - 1 + (e.clientX - r.left < r.width / 2 ? .5 : 1)) }}
          onClick={e => { const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect(); onChange(i - 1 + (e.clientX - r.left < r.width / 2 ? .5 : 1)) }}>
          <Star style={{ width: size, height: size }} className={cn(d >= i ? 'fill-warning-400 text-warning-400' : d >= i - .5 ? '' : 'text-slate-200')} strokeWidth={1.5} />
          {d >= i - .5 && d < i && <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}><Star style={{ width: size, height: size }} className="fill-warning-400 text-warning-400" strokeWidth={1.5} /></div>}
        </button>
      ))}
    </div>
  )
}

export default function Feedback() {
  const [tab, setTab] = useState<TabKey>('announcement')
  const member = useMemberStore(s => s.member)
  const showToast = useUiStore(s => s.showToast)
  const feedbacks = useFeedbackStore(s => s.feedbacks)
  const repairOrders = useFeedbackStore(s => s.repairOrders)
  const addFeedback = useFeedbackStore(s => s.addFeedback)
  const addRepairOrder = useFeedbackStore(s => s.addRepairOrder)
  const [search, setSearch] = useState(''), [expId, setExpId] = useState<string | null>(null), [ci, setCi] = useState(0)
  const [vs, setVs] = useState(''), [fs, setFs] = useState<string[]>([]), [loc, setLoc] = useState(''), [fd, setFd] = useState(''), [ph, setPh] = useState(''), [urg, setUrg] = useState(0)
  const [rt, setRt] = useState(0), [tg, setTg] = useState<string[]>([]), [tg2, setTg2] = useState(REVIEW_TARGETS[0]), [rv, setRv] = useState(''), [anon, setAnon] = useState(false), [cele, setCele] = useState(false)
  const pinned = announcements.filter(a => a.pinned)
  useEffect(() => { if (!pinned.length) return; const t = setInterval(() => setCi(i => (i + 1) % pinned.length), 4000); return () => clearInterval(t) }, [pinned.length])
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); const all = [...announcements].sort((a, b) => Number(b.pinned ?? 0) - Number(a.pinned ?? 0)); return q ? all.filter(a => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)) : all }, [search])
  const vMap = useMemo(() => Object.fromEntries(venues.map(v => [v.id, v.name])), [])
  const vLabel = (ids: string[]) => ids.length >= venues.length ? '全馆' : ids.map(id => vMap[id] || id).join('、') || '全馆'
  const submitRepair = () => {
    if (!vs) return showToast('error', '请选择场馆')
    if (!loc.trim()) return showToast('error', '请填写故障位置')
    const venue = venues.find(v => v.id === vs)
    const order = addRepairOrder({
      memberId: member?.id || 'guest',
      memberName: anon ? '匿名会员' : member?.name,
      venueId: vs,
      venueName: `${venue?.name || ''}·${fs.join('、') || '其他'}`,
      faultTypes: fs.length ? fs : ['其他'],
      location: loc,
      description: fd || '无详细描述',
      phone: ph || member?.phone || '',
      urgency: urg,
    })
    showToast('success', `报修提交成功！工单号：${order.id}，预计2h内响应`)
    setVs(''); setFs([]); setLoc(''); setFd(''); setPh(''); setUrg(0)
  }
  const submitReview = () => {
    if (!rt) return showToast('error', '请选择星级评分')
    const type = rt >= 4 ? '表扬' : rt >= 3 ? '建议' : '投诉'
    const content = rv || (tg.length > 0 ? `标签评价：${tg.join('、')}` : '无文字评价')
    addFeedback({
      memberId: member?.id || 'guest',
      memberName: anon ? '匿名会员' : member?.name,
      type,
      rating: rt,
      content,
    })
    setCele(true)
    setTimeout(() => { setCele(false); showToast('success', '感谢您的评价！') }, 2500)
    setRt(0); setTg([]); setRv(''); setAnon(false)
  }
  const displayRepairOrders = member
    ? repairOrders.filter(r => r.memberId === member.id)
    : repairOrders
  const formatTimeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mb-6"><h1 className="text-3xl font-bold text-slate-800">公告与反馈</h1><p className="mt-1 text-slate-500">查看公告、提交报修、评价服务</p></div>
      <div className="card mb-6 overflow-hidden">
        <div className="flex border-b border-slate-100">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={cn('relative flex-1 touch-target-sm flex items-center justify-center gap-2 px-6 py-5 font-semibold transition-all', tab === key ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600')}>
              <Icon className="h-5 w-5" /><span>{label}</span>
              {tab === key && <motion.div layoutId="tu" className="absolute bottom-0 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'announcement' && (
          <motion.div key="a" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="card overflow-hidden">
              <div className="relative h-56 overflow-hidden bg-gradient-to-r from-primary-500 to-accent-500">
                <AnimatePresence mode="wait">
                  {pinned[ci] && (
                    <motion.div key={pinned[ci].id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="absolute inset-0 flex flex-col justify-center p-8 text-white">
                      <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur"><AlertTriangle className="h-4 w-4" /> 重要置顶</div>
                      <h2 className="text-2xl font-bold">{pinned[ci].title}</h2>
                      <p className="mt-2 line-clamp-2 max-w-3xl text-primary-50">{pinned[ci].content}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute bottom-4 right-6 flex gap-2">{pinned.map((_, i) => <button key={i} onClick={() => setCi(i)} className={cn('h-2 rounded-full transition-all', i === ci ? 'w-8 bg-white' : 'w-2 bg-white/40')} />)}</div>
              </div>
            </div>
            <div className="card p-4"><div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索公告标题或内容..." className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-4 pl-12 pr-4 outline-none transition focus:border-primary-400 focus:bg-white" /></div></div>
            <div className="space-y-4">
              {filtered.map(a => { const cfg = TYPE_CFG[a.type] || TYPE_CFG['系统公告'], Icon = cfg.icon, exp = expId === a.id
                return (
                  <motion.div key={a.id} layout className={cn('card p-6 transition-shadow', a.pinned && 'ring-2 ring-danger-200')}>
                    <div className="flex gap-4">
                      <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', cfg.bg)}><Icon className={cn('h-7 w-7', cfg.color)} /></div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start gap-3"><h3 className="text-lg font-bold text-slate-800">{a.title}</h3>{a.pinned && <span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-3 py-1 text-xs font-bold text-danger-600"><AlertCircle className="h-3 w-3" />重要</span>}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span>{new Date(a.publishAt).toLocaleString('zh-CN')}</span><span>·</span><span>管理员发布</span>
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600"><Users className="h-3 w-3" />{vLabel(a.targetVenues)}</span>
                        </div>
                        <AnimatePresence>{exp && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="mt-4 leading-relaxed text-slate-600">{a.content}</p></motion.div>}</AnimatePresence>
                      </div>
                    </div>
                    <button onClick={() => setExpId(exp ? null : a.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
                      {exp ? <>收起<ChevronUp className="h-4 w-4" /></> : <>展开详情<ChevronDown className="h-4 w-4" /></>}
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {tab === 'repair' && (
          <motion.div key="b" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-800">提交报修</h2><p className="mt-1 text-sm text-slate-500">填写以下信息，我们将尽快处理</p>
              <div className="mt-6"><label className="mb-3 block text-sm font-semibold text-slate-700">选择场馆</label>
                <div className="grid grid-cols-3 gap-3">{venues.map(v => (
                  <button key={v.id} onClick={() => setVs(v.id)} className={cn('rounded-2xl border-2 p-5 transition-all', vs === v.id ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-200/50' : 'border-slate-200 bg-white hover:border-primary-300')}>
                    <div className="text-4xl">{v.icon}</div><div className={cn('mt-2 text-sm font-bold', vs === v.id ? 'text-primary-600' : 'text-slate-700')}>{v.name}</div>
                  </button>
                ))}</div>
              </div>
              <div className="mt-6"><label className="mb-3 block text-sm font-semibold text-slate-700">故障类型（多选）</label>
                <div className="flex flex-wrap gap-2">{FAULT_TYPES.map(t => (
                  <button key={t} onClick={() => setFs(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t])} className={cn('rounded-full px-4 py-2 text-sm font-medium transition-all', fs.includes(t) ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{t}</button>
                ))}</div>
              </div>
              <div className="mt-6"><label className="mb-2 block text-sm font-semibold text-slate-700">故障位置</label><input value={loc} onChange={e => setLoc(e.target.value)} placeholder="例：3号场地东北角" className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-primary-400" /></div>
              <div className="mt-6"><label className="mb-2 block text-sm font-semibold text-slate-700">故障描述</label><textarea value={fd} onChange={e => setFd(e.target.value)} rows={5} placeholder="请详细描述故障情况..." className="w-full resize-none rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-primary-400" /></div>
              <div className="mt-6"><label className="mb-3 block text-sm font-semibold text-slate-700">照片上传</label><div className="grid grid-cols-4 gap-3">{[0, 1, 2, 3].map(i => <button key={i} onClick={() => showToast('info', '请联系前台协助拍照上传')} className="flex h-24 w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-primary-400 hover:text-primary-500"><Camera className="h-8 w-8" /></button>)}</div></div>
              <div className="mt-6"><label className="mb-2 block text-sm font-semibold text-slate-700">联系方式</label><div className="relative"><Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={ph} onChange={e => setPh(e.target.value)} placeholder={member?.phone || '请输入手机号'} className="w-full rounded-2xl border-2 border-slate-200 py-3 pl-12 pr-4 outline-none transition focus:border-primary-400" /></div></div>
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between"><label className="text-sm font-semibold text-slate-700">紧急程度</label><span className={cn('rounded-full px-3 py-1 text-sm font-bold text-white bg-gradient-to-r', URG_COLOR[urg])}><Flame className="mr-1 inline h-4 w-4" />{URGENCY[urg]}</span></div>
                <input type="range" min={0} max={2} step={1} value={urg} onChange={e => setUrg(+e.target.value)} className="w-full h-3 rounded-full appearance-none bg-gradient-to-r from-success-300 via-warning-300 to-danger-300 cursor-pointer accent-transparent" />
                <div className="mt-2 flex justify-between text-xs text-slate-400">{URGENCY.map(l => <span key={l}>{l}</span>)}</div>
              </div>
              <BigButton size="lg" fullWidth className="mt-8" icon={<Send className="h-6 w-6" />} onClick={submitRepair}>提交报修</BigButton>
            </div>
            <div className="card p-6">
              <h2 className="text-xl font-bold text-slate-800">历史报修</h2><p className="mt-1 text-sm text-slate-500">查看您的报修处理进度</p>
              <div className="mt-6 space-y-4">
                {displayRepairOrders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Settings className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>暂无报修记录</p>
                  </div>
                ) : (
                  displayRepairOrders.map((r: RepairOrder) => (
                    <div key={r.id} className="rounded-2xl border-2 border-slate-100 p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-sm font-bold text-primary-600">#{r.id}</div>
                          <div className="mt-1 font-semibold text-slate-800">{r.venueName}</div>
                          {r.location && <div className="mt-0.5 text-xs text-slate-500">位置：{r.location}</div>}
                        </div>
                        <span className={cn('rounded-full px-3 py-1 text-xs font-bold',
                          r.status === '处理中' ? 'bg-warning-100 text-warning-600' :
                          r.status === '已完成' ? 'bg-success-100 text-success-600' :
                          'bg-primary-100 text-primary-600')}>{r.status}</span>
                      </div>
                      <div className="mt-4">
                        <div className="relative flex items-center justify-between">
                          {['提交', '受理', '派单', '完成'].map((s, i) => (
                            <div key={s} className="relative z-10 flex flex-col items-center">
                              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold', i < r.stage ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500')}>{i < r.stage ? <CheckCircle className="h-4 w-4" /> : i + 1}</div>
                              <span className={cn('mt-2 text-xs font-medium', i < r.stage ? 'text-primary-600' : 'text-slate-400')}>{s}</span>
                            </div>
                          ))}
                          <div className="absolute left-4 right-4 top-4 h-1 -z-0 rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${Math.max(0, (r.stage - 1)) / 3 * 100}%` }} /></div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3 w-3" />{formatTimeAgo(r.createdAt)}提交</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'review' && (
          <motion.div key="c" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AnimatePresence>{cele && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="card bg-white p-12 text-center">
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: .6, repeat: 3 }} className="text-8xl">🎉</motion.div>
                  <h3 className="mt-6 text-2xl font-bold text-slate-800">感谢您的评价！</h3>
                </motion.div>
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div key={i} className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full" style={{ backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'][i % 5] }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }} animate={{ x: (Math.random() - .5) * 800, y: (Math.random() - .5) * 800 - 200, scale: 1, opacity: 0 }} transition={{ duration: 2, ease: 'easeOut' }} />
                ))}
              </motion.div>
            )}</AnimatePresence>
            <div className="mx-auto max-w-3xl card p-8">
              <h2 className="text-2xl font-bold text-slate-800">服务评价</h2><p className="mt-1 text-slate-500">您的每一条评价都至关重要</p>
              <div className="mt-8 flex flex-col items-center"><p className="mb-4 text-lg font-medium text-slate-700">整体评分</p><StarRow value={rt} onChange={setRt} /><p className="mt-3 text-sm text-slate-400">{rt > 0 ? `${rt} 分` : '点击星星进行评分（支持半星）'}</p></div>
              <div className="mt-8"><label className="mb-3 block text-sm font-semibold text-slate-700">快速标签（多选）</label>
                <div className="flex flex-wrap gap-2">{REVIEW_TAGS.map(t => (
                  <button key={t} onClick={() => setTg(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t])} className={cn('rounded-2xl border-2 px-5 py-2.5 text-sm font-medium transition-all', tg.includes(t) ? 'border-accent-400 bg-accent-50 text-accent-600' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>{t}</button>
                ))}</div>
              </div>
              <div className="mt-8"><label className="mb-2 block text-sm font-semibold text-slate-700">评价对象</label><select value={tg2} onChange={e => setTg2(e.target.value)} className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-primary-400 bg-white">{REVIEW_TARGETS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="mt-8"><label className="mb-2 block text-sm font-semibold text-slate-700">文字评价</label><textarea value={rv} onChange={e => setRv(e.target.value)} rows={5} placeholder="分享您的体验..." className="w-full resize-none rounded-2xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-primary-400" /></div>
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 p-5">
                <div><div className="font-semibold text-slate-800">匿名评价</div><div className="mt-1 text-sm text-slate-500">开启后将不显示您的姓名和头像</div></div>
                <button onClick={() => setAnon(!anon)} className={cn('relative h-9 w-16 rounded-full transition-colors', anon ? 'bg-primary-500' : 'bg-slate-300')}>
                  <motion.div animate={{ x: anon ? 28 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-1 h-7 w-7 rounded-full bg-white shadow-md" />
                </button>
              </div>
              <BigButton size="lg" fullWidth className="mt-8" variant="accent" icon={<Send className="h-6 w-6" />} onClick={submitReview}>提交评价</BigButton>
              <div className="mt-10"><h3 className="text-lg font-bold text-slate-800">最近评价</h3><div className="mt-4 space-y-4">
                {feedbacks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <ThumbsUp className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>暂无评价记录</p>
                  </div>
                ) : (
                  feedbacks.slice(0, 5).map(f => (
                    <div key={f.id} className="rounded-2xl border-2 border-slate-100 p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-600">{f.memberName?.[0] || '会'}</div>
                          <div>
                            <div className="font-semibold text-slate-800">{f.memberName || '匿名会员'}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-3 w-3', i < Math.floor(f.rating) ? 'fill-warning-400 text-warning-400' : 'text-slate-200')} />)}
                              <span className="ml-2">{new Date(f.createdAt).toLocaleDateString('zh-CN')} {new Date(f.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        <span className={cn('rounded-full px-3 py-1 text-xs font-bold', f.type === '表扬' ? 'bg-success-100 text-success-600' : f.type === '建议' ? 'bg-primary-100 text-primary-600' : 'bg-danger-100 text-danger-600')}>{f.type}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.content}</p>
                      {f.reply && <div className="mt-3 rounded-xl bg-primary-50 p-4"><div className="text-xs font-bold text-primary-600">官方回复</div><p className="mt-1 text-sm text-slate-600">{f.reply}</p></div>}
                    </div>
                  ))
                )}
              </div></div>
            </div>
          </motion.div>
        )}

        {tab === 'stats' && (
          <motion.div key="d" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[{ t: '当日预约总数', v: 328, sf: '单', i: Calendar, td: '+12%', c: 'from-primary-500 to-primary-600' }, { t: '入场率', v: 87, sf: '%', i: Users, td: '+5%', c: 'from-accent-500 to-accent-600' }, { t: '营业额', v: 52680, pf: '¥', i: DollarSign, td: '', c: 'from-success-500 to-success-600', m: true }, { t: '新增会员', v: 18, sf: '人', i: UserPlus, td: '+3', c: 'from-warning-500 to-warning-600' }].map((s, idx) => (
                <motion.div key={s.t} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * .1 }} className="card p-6">
                  <div className="flex items-start justify-between">
                    <div><div className="text-sm text-slate-500">{s.t}</div><div className="mt-2"><span className={cn('bg-gradient-to-r bg-clip-text text-transparent text-4xl font-bold', s.c)}><CountUp end={s.v} pre={s.pf} suf={s.sf} /></span></div>
                      {s.td && <div className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-success-600"><TrendingUp className="h-4 w-4" />{s.td} 同比</div>}
                    </div>
                    <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-white bg-gradient-to-br', s.c)}><s.i className="h-7 w-7" /></div>
                  </div>
                  {s.m && <div className="mt-3 h-10"><ResponsiveContainer><BarChart data={[12, 18, 15, 22, 28, 25, 32]}><Bar dataKey="" fill="#10B981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}
                </motion.div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="card p-6 lg:col-span-2">
                <div className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary-500" /><h3 className="text-lg font-bold text-slate-800">各场馆分布</h3></div>
                <div className="mt-4 h-72"><ResponsiveContainer><PieChart><Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" strokeWidth={0}>{PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
                <div className="mt-2 space-y-2">{PIE_DATA.map(d => <div key={d.name} className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-slate-600">{d.name}</span></div><span className="font-bold text-slate-800">{d.value}%</span></div>)}</div>
              </div>
              <div className="card p-6 lg:col-span-3">
                <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-accent-500" /><h3 className="text-lg font-bold text-slate-800">热门时段分布</h3></div>
                <div className="mt-4 h-72"><ResponsiveContainer><BarChart data={BAR_DATA}>
                  <defs><linearGradient id="bg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} /><XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} /><Tooltip /><Bar dataKey="count" fill="url(#bg)" radius={[8, 8, 0, 0]} />
                </BarChart></ResponsiveContainer></div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card p-6">
                <div className="flex items-center gap-2"><Award className="h-5 w-5 text-warning-500" /><h3 className="text-lg font-bold text-slate-800">场地预约排行Top10</h3></div>
                <div className="mt-5 space-y-3">{TOP_COURTS.map((c, i) => (
                  <motion.div key={c.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .05 }} className="flex items-center gap-4">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold', i < 3 ? 'bg-gradient-to-br from-warning-400 to-warning-500 text-white' : 'bg-slate-100 text-slate-500')}>{i + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between"><span className="truncate text-sm font-medium text-slate-700">{c.name}</span><span className="ml-2 text-sm font-bold text-slate-800">{c.pct}%</span></div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 1, delay: i * .05 }} className={cn('h-full rounded-full', c.pct >= 80 ? 'bg-gradient-to-r from-danger-400 to-danger-500' : c.pct >= 60 ? 'bg-gradient-to-r from-warning-400 to-warning-500' : 'bg-gradient-to-r from-primary-400 to-primary-500')} />
                      </div>
                    </div>
                  </motion.div>
                ))}</div>
              </div>
              <div className="card p-6">
                <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-danger-500" /><h3 className="text-lg font-bold text-slate-800">超时未到预警</h3></div>
                <div className="mt-5 overflow-hidden rounded-2xl border-2 border-danger-100">
                  <table className="w-full"><thead><tr className="bg-danger-50">{['单号', '会员', '场地', '超时', '操作'].map((h, i) => <th key={h} className={cn('px-4 py-3 text-xs font-bold text-danger-700', i < 4 ? 'text-left' : 'text-right')}>{h}</th>)}</tr></thead>
                    <tbody>{WARN.map(r => (
                      <tr key={r.code} className="border-t border-danger-50 bg-danger-50/50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.code}</td><td className="px-4 py-3 text-sm font-semibold text-slate-800">{r.name}</td><td className="px-4 py-3 text-sm text-slate-600">{r.venue}</td>
                        <td className="px-4 py-3"><span className="inline-flex items-center gap-1 rounded-full bg-danger-100 px-2 py-1 text-xs font-bold text-danger-600"><Clock className="h-3 w-3" />{r.overdue}</span></td>
                        <td className="px-4 py-3"><div className="flex justify-end gap-1.5">
                          <button onClick={() => showToast('success', `已提醒${r.name}`)} className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-primary-600">提醒</button>
                          <button onClick={() => showToast('warning', `已取消${r.code}`)} className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-300"><X className="h-3 w-3" /></button>
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-warning-50 px-4 py-3 text-sm text-warning-700"><Bell className="h-4 w-4 shrink-0" /><span>超过30分钟未到将自动取消预约并扣除信用分</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
