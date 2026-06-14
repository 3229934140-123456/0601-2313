import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/useUiStore'

type ToastType = 'success' | 'warning' | 'error' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

const configs: Record<
  ToastType,
  { Icon: typeof CheckCircle; bg: string; border: string; text: string; iconColor: string }
> = {
  success: {
    Icon: CheckCircle,
    bg: 'bg-success-50',
    border: 'border-success-500/30',
    text: 'text-success-600',
    iconColor: 'text-success-500',
  },
  warning: {
    Icon: AlertTriangle,
    bg: 'bg-warning-500/10',
    border: 'border-warning-500/30',
    text: 'text-warning-600',
    iconColor: 'text-warning-500',
  },
  error: {
    Icon: XCircle,
    bg: 'bg-danger-500/10',
    border: 'border-danger-500/30',
    text: 'text-danger-600',
    iconColor: 'text-danger-500',
  },
  info: {
    Icon: Info,
    bg: 'bg-primary-50',
    border: 'border-primary-500/30',
    text: 'text-primary-700',
    iconColor: 'text-primary-500',
  },
}

export default function Toast() {
  const toasts = useUiStore((s) => s.toast) as ToastItem[]

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 flex w-80 flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const cfg = configs[toast.type] || configs.info
          const Icon = cfg.Icon
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 120, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 120, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl shadow-black/5 backdrop-blur-sm',
                cfg.bg,
                cfg.border
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', cfg.iconColor)} />
              <p className={cn('flex-1 text-sm font-medium leading-relaxed', cfg.text)}>
                {toast.message}
              </p>
              <div className={cn('text-xs opacity-60', cfg.text)}></div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
