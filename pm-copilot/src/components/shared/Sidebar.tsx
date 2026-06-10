'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store'
import {
  User, Users, CheckSquare, MessageSquare, Sun,
  Zap, BarChart2, BookOpen, Bell, ChevronRight, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const personalNav = [
  { href: '/dashboard/personal', label: 'Dashboard', icon: Sun },
  { href: '/dashboard/personal/commitments', label: 'Commitments', icon: CheckSquare },
  { href: '/dashboard/personal/reply', label: 'Draft reply', icon: MessageSquare },
  { href: '/dashboard/personal/digest', label: 'Daily digest', icon: Bell },
]

const teamNav = [
  { href: '/dashboard/team', label: 'Sprint summary', icon: Zap },
  { href: '/dashboard/team/stories', label: 'Story drafter', icon: BookOpen },
  { href: '/dashboard/team/metrics', label: 'Metrics', icon: BarChart2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { mode, setMode } = useAppStore()

  const nav = mode === 'personal' ? personalNav : teamNav

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">PM Copilot</span>
        </div>

        <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-medium">
          <button
            onClick={() => setMode('personal')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all',
              mode === 'personal'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <User size={12} />
            Personal
          </button>
          <button
            onClick={() => setMode('team')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 transition-all',
              mode === 'team'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Users size={12} />
            Team
          </button>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-violet-50 text-violet-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={15} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto opacity-40" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-2 border-t border-gray-100">
        <a href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
          <span>⚙</span> Settings
        </a>
      </div>
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700">
            SD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">Shelby Dimri</p>
            <p className="text-[11px] text-gray-400 truncate">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
