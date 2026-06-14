import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Calendar,
  User,
  Ticket,
  QrCode,
  RefreshCw,
  GraduationCap,
  Megaphone,
  Home,
  Dumbbell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/useUiStore'

const menuItems = [
  { path: '/calendar', label: '场地日历', Icon: Calendar },
  { path: '/member', label: '会员识别', Icon: User },
  { path: '/booking', label: '预约下单', Icon: Ticket },
  { path: '/verify', label: '入场核验', Icon: QrCode },
  { path: '/reschedule', label: '临时改签', Icon: RefreshCw },
  { path: '/course', label: '课程报名', Icon: GraduationCap },
  { path: '/notice', label: '公告与反馈', Icon: Megaphone },
]

export default function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-gradient-to-b from-primary-600 to-primary-800 text-white transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 border-b border-white/10',
          collapsed ? 'justify-center px-2 py-6' : 'px-6 py-6'
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg">
          <Dumbbell className="h-6 w-6 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold tracking-wide">智慧体育馆</h1>
            <p className="text-xs text-primary-200">Smart Sports Venue</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30'
                  : 'text-primary-100 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <span className="truncate text-sm font-medium">{label}</span>
            )}
            {collapsed && (
              <div className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-xl group-hover:block">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => navigate('/')}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-primary-100 transition hover:bg-white/20 hover:text-white',
            collapsed ? 'justify-center' : ''
          )}
        >
          <Home className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">返回首页</span>}
        </button>
        {!collapsed && (
          <div className="mt-3 text-center">
            <p className="text-lg font-mono font-bold text-accent-400">
              {time.toLocaleTimeString('zh-CN', { hour12: false })}
            </p>
            <p className="text-xs text-primary-300">
              {time.toLocaleDateString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                weekday: 'short',
              })}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}
