import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Gift, Ticket, Receipt, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/useUiStore'
import { useMemberStore } from '@/store/useMemberStore'
import { formatCurrency } from '@/utils/format'

export default function Modal() {
  const modal = useUiStore((s) => s.modal)
  const closeModal = useUiStore((s) => s.closeModal)
  const coupons = useMemberStore((s) => s.coupons)
  const member = useMemberStore((s) => s.member)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modal) closeModal()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [modal, closeModal])

  const renderContent = () => {
    if (!modal) return null
    switch (modal.type) {
      case 'coupons':
        return (
          <div>
            <h3 className="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
              <Gift className="h-6 w-6 text-accent-500" />我的优惠券
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {coupons.filter(c => c.memberId === member?.id || !c.memberId).length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Ticket className="h-16 w-16 mx-auto mb-3 opacity-40" />
                  <p>暂无优惠券</p>
                </div>
              ) : (
                coupons.filter(c => c.memberId === member?.id || !c.memberId).map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      'flex rounded-2xl overflow-hidden border transition-all',
                      c.used ? 'bg-slate-50 border-slate-200 opacity-60' :
                      c.type === 'discount' ? 'border-accent-200 bg-gradient-to-r from-accent-50 to-white' :
                      c.type === 'cash' ? 'border-primary-200 bg-gradient-to-r from-primary-50 to-white'
                                         : 'border-success-200 bg-gradient-to-r from-success-50 to-white'
                    )}
                  >
                    <div className={cn(
                      'w-28 flex flex-col items-center justify-center py-4 px-3 text-white font-bold',
                      c.used ? 'bg-slate-400' :
                      c.type === 'discount' ? 'bg-gradient-to-br from-accent-400 to-accent-600' :
                      c.type === 'cash' ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                                         : 'bg-gradient-to-br from-success-400 to-success-600'
                    )}>
                      {c.type === 'discount' && <div className="text-3xl">{c.discountPercent?.toString().replace('0.', '')}折</div>}
                      {c.type === 'cash' && <div className="text-3xl">¥{c.discountAmount}</div>}
                      {c.type === 'voucher' && <div className="text-xl">体验券</div>}
                      {c.used && <div className="text-xs mt-1">已使用</div>}
                    </div>
                    <div className="flex-1 p-4">
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {c.minSpend ? `满${formatCurrency(c.minSpend)}可用` : '无门槛'}
                        {' · '}有效期至 {new Date(c.expireAt).toLocaleDateString('zh-CN')}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">{c.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      case 'records':
        return (
          <div>
            <h3 className="mb-4 text-xl font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary-500" />消费记录
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {[
                { date: '2026-06-14', name: '羽毛球3号场地 2小时', amount: -180 },
                { date: '2026-06-12', name: '充值 ¥500 赠 ¥50', amount: 550 },
                { date: '2026-06-10', name: '篮球半场 1.5小时', amount: -225 },
                { date: '2026-06-08', name: '游泳培训报名', amount: -680 },
                { date: '2026-06-05', name: '羽毛球1号场地 3小时', amount: -270 },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition">
                  <div>
                    <p className="font-semibold text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{r.date}</p>
                  </div>
                  <div className={cn('font-bold font-mono text-lg', r.amount > 0 ? 'text-success-600' : 'text-slate-700')}>
                    {r.amount > 0 ? '+' : ''}{formatCurrency(r.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'payment':
        return (
          <div className="text-center py-6">
            <h3 className="mb-4 text-xl font-bold text-slate-800">
              {modal.data?.title || '支付确认'}
            </h3>
            <CreditCard className="h-20 w-20 mx-auto mb-4 text-primary-500" />
            <p className="text-4xl font-bold gradient-text mb-6">{formatCurrency(modal.data?.amount || 0)}</p>
            <p className="text-sm text-slate-500 mb-6">{modal.data?.desc || '请确认支付信息'}</p>
          </div>
        )
      default:
        return (
          <div>
            <h3 className="mb-3 text-xl font-bold text-slate-800">
              {modal.data?.title || '提示信息'}
            </h3>
            <p className="text-slate-600">{modal.data?.content || '操作已执行'}</p>
          </div>
        )
    }
  }

  return (
    <AnimatePresence>
      {modal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl"
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-6">{renderContent()}</div>
            <div className="flex gap-3 border-t border-slate-100 p-4">
              <button
                onClick={closeModal}
                className="btn-secondary flex-1 h-14"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
