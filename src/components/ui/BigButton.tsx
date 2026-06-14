import { useState, useRef, type ButtonHTMLAttributes, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

type Size = 'lg' | 'md' | 'sm'
type Variant = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost'
type IconPosition = 'left' | 'right'

interface Ripple {
  x: number
  y: number
  size: number
  id: number
}

export interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size
  variant?: Variant
  icon?: ReactNode
  iconPosition?: IconPosition
  fullWidth?: boolean
}

const sizeClasses: Record<Size, string> = {
  lg: 'h-20 px-8 text-lg rounded-2xl',
  md: 'h-16 px-6 text-base rounded-xl',
  sm: 'h-12 px-4 text-sm rounded-lg',
}

const iconSizeClasses: Record<Size, string> = {
  lg: 'h-7 w-7',
  md: 'h-6 w-6',
  sm: 'h-5 w-5',
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/35 active:from-primary-600 active:to-primary-700',
  accent:
    'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/35 active:from-accent-600 active:to-accent-700',
  success:
    'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-lg shadow-success-500/25 hover:shadow-xl hover:shadow-success-500/35',
  warning:
    'bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-lg shadow-warning-500/25 hover:shadow-xl hover:shadow-warning-500/35',
  danger:
    'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-lg shadow-danger-500/25 hover:shadow-xl hover:shadow-danger-500/35',
  outline:
    'border-2 border-primary-500 text-primary-600 bg-white hover:bg-primary-50 active:bg-primary-100',
  ghost:
    'text-primary-600 bg-primary-50 hover:bg-primary-100 active:bg-primary-200',
}

export default function BigButton({
  size = 'md',
  variant = 'primary',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  children,
  onClick,
  ...props
}: BigButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const buttonRef = useRef<HTMLButtonElement>(null)

  const createRipple = (e: MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now()

    setRipples((prev) => [...prev, { x, y, size, id }])

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 600)
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    createRipple(e)
    onClick?.(e)
  }

  const IconWrap = () =>
    icon ? <span className={iconSizeClasses[size]}>{icon}</span> : null

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={cn(
        'relative inline-flex select-none items-center justify-center gap-3 overflow-hidden font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-3">
        {icon && iconPosition === 'left' && <IconWrap />}
        {children && <span>{children}</span>}
        {icon && iconPosition === 'right' && <IconWrap />}
      </span>

      <span className="pointer-events-none absolute inset-0 overflow-hidden">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute block animate-ping rounded-full bg-white/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              animationDuration: '600ms',
            }}
          />
        ))}
      </span>
    </button>
  )
}
