import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PanelLeft, Bell, LogOut, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/useUiStore'
import { useMemberStore } from '@/store/useMemberStore'
import { announcements } from '@/data/announcements'
import { maskName } from '@/utils/format'

interface HeaderProps {
  title?: string
}

export default function Header({ title = '首页' }: HeaderProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const showToast = useUiStore((s) => s.showToast)
  const member = useMemberStore((s) => s.member)
  const isLoggedIn = useMemberStore((s) => s.isLoggedIn)
  const logout = useMemberStore((s) => s.logout)
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogin = () => {
    navigate('/member')
  }

  const handleLogout = () => {
    logout()
    showToast('success', '已安全退出登录')
  }

  const typeColors: Record<string, string> = {
    info: 'bg-primary-100 text-primary-700',
    warning: 'bg-warning-500/20 text-warning-600',
    success: 'bg-success-500/20 text-success-600',
    closure: 'bg-danger-500/20 text-danger-600',
    activity: 'bg-accent-100 text-accent-600',
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm">
      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-primary-600"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>

      <div className="flex flex-1 items-center overflow-hidden">
        <div className="relative flex w-full items-center overflow-hidden rounded-xl bg-slate-50 px-4 py-2">
          <Bell className="mr-3 h-4 w-4 shrink-0 text-accent-500 animate-pulse" />
          <div className="relative flex-1 overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap gap-12">
              {[...announcements, ...announcements].map((item, idx) => (
                <span key={`${item.id}-${idx}`} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium',
                      typeColors[item.type] || typeColors.info
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="text-sm text-slate-600 truncate max-w-[400px]">{item.content}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="text-right">
          <p className="text-base font-mono font-bold text-primary-600">
            {time.toLocaleTimeString('zh-CN', { hour12: false })}
          </p>
          <p className="text-xs text-slate-500">
            {time.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </p>
        </div>

        <div className="h-10 w-px bg-slate-200" />

        {isLoggedIn && member ? (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-accent-400"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500">
                <UserCircle className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-800">{maskName(member.name)}</p>
              <p className="text-xs text-primary-600">{member.level}会员</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-danger-500/10 hover:text-danger-500"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-primary-500/20 transition hover:shadow-lg hover:shadow-primary-500/30"
          >
            点击登录
          </button>
        )}
      </div>
    </header>
  )
}
