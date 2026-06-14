import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  CreditCard,
  QrCode,
  Loader2,
  CalendarClock,
  Dumbbell,
  Gift,
  BarChart3,
  Calendar,
  LogOut,
  Crown,
  Sparkles,
  Star,
  CircleUser,
  Ticket,
} from 'lucide-react'
import { useMemberStore } from '@/store/useMemberStore'
import { useUiStore } from '@/store/useUiStore'
import { formatCurrency, formatPhone, maskName } from '@/utils/format'
import BigButton from '@/components/ui/BigButton'
import type { MemberLevel, Coupon } from '@/types'

const levelConfig: Record<MemberLevel, { bg: string; text: string; border: string; icon: typeof Star }> = {
  钻石卡: { bg: 'from-cyan-400 to-blue-600', text: 'text-white', border: 'border-cyan-300', icon: Crown },
  钻石: { bg: 'from-cyan-400 to-blue-600', text: 'text-white', border: 'border-cyan-300', icon: Crown },
  金卡: { bg: 'from-amber-400 to-orange-500', text: 'text-white', border: 'border-amber-300', icon: Sparkles },
  银卡: { bg: 'from-slate-300 to-slate-500', text: 'text-white', border: 'border-slate-300', icon: Star },
  普通: { bg: 'from-gray-300 to-gray-400', text: 'text-gray-700', border: 'border-gray-300', icon: CircleUser },
}

export default function Login() {
  const navigate = useNavigate()
  const { member, isLoggedIn, coupons, loginByCard, loginByQR, logout } = useMemberStore()
  const { showToast, openModal } = useUiStore()
  const [cardLoading, setCardLoading] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)

  const handleCardLogin = async () => {
    if (cardLoading) return
    setCardLoading(true)
    try {
      await loginByCard()
      showToast('success', '刷卡登录成功，欢迎回来！')
    } catch {
      showToast('error', '刷卡失败，请重试')
    } finally {
      setCardLoading(false)
    }
  }

  const handleQRLogin = async () => {
    if (qrLoading) return
    setQrLoading(true)
    try {
      await loginByQR()
      showToast('success', '扫码登录成功，欢迎回来！')
    } catch {
      showToast('error', '扫码失败，请重试')
    } finally {
      setQrLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    showToast('info', '已安全退出登录')
  }

  const showCouponsModal = () => {
    const valid = coupons.filter((c: Coupon) => !c.used)
    const content = (
      <div className="space-y-3">
        {valid.length === 0 ? (
          <p className="py-8 text-center text-gray-400">暂无可用优惠券</p>
        ) : (
          valid.map((c: Coupon) => (
            <div key={c.id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 text-white">
                <Ticket className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800">{c.name}</p>
                <p className="text-sm text-gray-500">有效期至 {c.expireAt}</p>
              </div>
              <p className="text-lg font-bold text-accent-500 text-right">
                {c.type === '折扣' && c.discountPercent ? `${(c.discountPercent * 10).toFixed(1)}折` : c.type === '体验券' ? '免费' : `¥${c.discount}`}
              </p>
            </div>
          ))
        )}
      </div>
    )
    openModal('coupons', { title: '我的优惠券', content })
  }

  const showRecordsModal = () => {
    const records = [
      { name: '羽毛球VIP场地', time: '2026-06-10 14:00-16:00', amount: '¥120.00' },
      { name: '游泳课程体验', time: '2026-06-05 09:00-10:00', amount: '¥80.00' },
      { name: '篮球场地2小时', time: '2026-06-01 18:00-20:00', amount: '¥160.00' },
    ]
    const content = (
      <div className="space-y-3">
        {records.map((r) => (
          <div key={r.name} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{r.name}</p>
                <p className="text-sm text-gray-500">{r.time}</p>
              </div>
              <p className="text-lg font-bold text-primary-600">{r.amount}</p>
            </div>
          </div>
        ))}
      </div>
    )
    openModal('records', { title: '消费记录', content })
  }

  const level = member ? levelConfig[member.level] : levelConfig.普通
  const LevelIcon = level.icon

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      <div className="flex h-screen w-full">
        <div className="relative flex w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 grain-bg">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-accent-400 blur-3xl" />
            <div className="absolute bottom-10 right-20 h-80 w-80 rounded-full bg-cyan-400 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-10 px-12">
            <div className="relative flex h-72 w-72 items-center justify-center">
              {!cardLoading && [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`absolute rounded-full animate-pulse-ring ${
                    i === 0 ? 'inset-0 border-4 border-white/30' : i === 1 ? 'inset-4 border-2 border-white/40' : 'inset-8 border border-white/50'
                  }`}
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border-4 border-white shadow-2xl">
                {cardLoading ? <Loader2 className="h-20 w-20 text-white animate-spin" /> : <CreditCard className="h-20 w-20 text-white drop-shadow-lg" />}
              </div>
            </div>

            <div className="text-center text-white">
              <h2 className="text-2xl font-bold tracking-wide">请将会员卡放置于感应区</h2>
              <p className="mt-2 text-white/70">RFID 智能感应 · 非接触式识别</p>
            </div>

            <BigButton
              size="lg"
              variant="accent"
              icon={cardLoading ? <Loader2 className="animate-spin" /> : <CreditCard />}
              onClick={handleCardLogin}
              disabled={cardLoading}
              className="shadow-glow min-w-[280px]"
            >
              {cardLoading ? '正在识别中...' : '模拟刷卡登录'}
            </BigButton>
          </div>
        </div>

        <div className="relative flex w-1/2 items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-8 px-12">
            <div className="text-center">
              <h1 className="text-3xl font-bold gradient-text">扫码快捷登录</h1>
              <p className="mt-2 text-gray-500">扫一扫，无需密码快速进入</p>
            </div>

            <div className="relative">
              <div className="relative flex h-[400px] w-[400px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 overflow-hidden">
                <div className="absolute left-0 top-0 h-12 w-12 border-l-4 border-t-4 border-primary-500 rounded-tl-xl" />
                <div className="absolute right-0 top-0 h-12 w-12 border-r-4 border-t-4 border-primary-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 h-12 w-12 border-b-4 border-l-4 border-primary-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 h-12 w-12 border-b-4 border-r-4 border-primary-500 rounded-br-xl" />

                {qrLoading ? (
                  <Loader2 className="h-24 w-24 text-primary-500 animate-spin" />
                ) : (
                  <div className="relative">
                    <QrCode className="h-48 w-48 text-gray-700" strokeWidth={1.2} />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <motion.div
                        className="h-2 w-full bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-lg shadow-primary-400/50 animate-scan"
                        style={{ animationDuration: '2s' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-600">
              打开手机 <span className="font-semibold text-primary-600">APP</span> /{' '}
              <span className="font-semibold text-green-600">微信</span> 扫一扫
            </p>

            <BigButton
              size="lg"
              variant="primary"
              icon={qrLoading ? <Loader2 className="animate-spin" /> : <QrCode />}
              onClick={handleQRLogin}
              disabled={qrLoading}
              className="min-w-[280px]"
            >
              {qrLoading ? '扫码验证中...' : '模拟扫码登录'}
            </BigButton>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLoggedIn && member && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-8 bg-gradient-to-br from-slate-900/40 to-primary-900/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl"
              initial={{ x: '100vw', opacity: 0, rotateY: -15 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              exit={{ x: '-100vw', opacity: 0, rotateY: 15 }}
              transition={{ type: 'spring', stiffness: 120, damping: 25, mass: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800" />
              <div className="absolute inset-0 opacity-30">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-400 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-cyan-300 blur-3xl" />
              </div>
              <div className="absolute inset-0 grain-bg opacity-50" />

              <div className="relative glass border-0 m-0 p-8">
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${level.bg} p-1`}>
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-full w-full rounded-full border-4 border-white object-cover bg-white"
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${level.bg} shadow-lg`}>
                      <LevelIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-white drop-shadow">{maskName(member.name)}</h2>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r ${level.bg} ${level.text} shadow-md`}>
                        <LevelIcon className="h-3.5 w-3.5" />
                        {member.level}
                      </span>
                    </div>
                    <div className="space-y-1 text-white/80">
                      <p className="font-mono tracking-wider">会员号：{member.memberNo.slice(0, 4)}****{member.memberNo.slice(-4)}</p>
                      <p>手机号：{formatPhone(member.phone)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="rounded-2xl bg-white/10 backdrop-blur p-5 border border-white/20">
                    <p className="text-sm text-white/70 mb-1">账户余额</p>
                    <p className="text-3xl font-bold text-white font-mono animate-number">
                      {formatCurrency(member.balance)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 backdrop-blur p-5 border border-white/20">
                    <p className="text-sm text-white/70 mb-1">累计消费</p>
                    <p className="text-3xl font-bold text-white font-mono animate-number">
                      ¥{((10000 - member.balance) | 0).toLocaleString()}.00
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: CalendarClock, label: '我的预约', path: '/reschedule', color: 'from-cyan-400 to-blue-500' },
                    { icon: Dumbbell, label: '我的课程', path: '/course', color: 'from-violet-400 to-purple-600' },
                    { icon: Gift, label: '我的优惠券', action: showCouponsModal, color: 'from-amber-400 to-orange-500', badge: coupons.filter((c) => !c.used).length },
                    { icon: BarChart3, label: '消费记录', action: showRecordsModal, color: 'from-emerald-400 to-green-600' },
                  ].map((it) => (
                    <motion.button key={it.label} whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => (it.path ? navigate(it.path) : it.action?.())}
                      className="relative flex items-center gap-4 rounded-2xl bg-white p-5 shadow-lg hover:shadow-xl text-left">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${it.color} shadow-md`}>
                        <it.icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{it.label}</p>
                        <p className="text-xs text-gray-400">点击进入</p>
                      </div>
                      {it.badge && it.badge > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white shadow-lg">{it.badge}</span>
                      )}
                    </motion.button>
                  ))}
                </div>

                <div className="space-y-3">
                  <BigButton size="lg" variant="accent" icon={<Calendar />} fullWidth onClick={() => navigate('/calendar')} className="shadow-glow h-20 text-xl">
                    开始预约
                  </BigButton>
                  <BigButton size="md" variant="ghost" icon={<LogOut />} fullWidth onClick={handleLogout} className="!bg-white/10 !text-white border border-white/30 hover:!bg-white/20">
                    安全退出
                  </BigButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
