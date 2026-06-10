'use client'

import { useAppStore } from '@/store'
import { CommitmentCard } from '@/components/personal/CommitmentCard'
import { QuickAsk } from '@/components/personal/QuickAsk'
import { GmailInbox } from '@/components/personal/GmailInbox'
import { AlertTriangle, CheckCircle2, Clock, Layers } from 'lucide-react'

export default function PersonalDashboard() {
  const { commitments } = useAppStore()

  const open = commitments.filter((c) => !c.done)
  const overdue = open.filter((c) => c.due === 'Overdue')
  const today = open.filter((c) => c.due === 'Today')
  const done = commitments.filter((c) => c.done)
  const urgent = [...overdue, ...today]

  const stats = [
    { label: 'Open', value: open.length, icon: Layers, color: 'text-gray-700' },
    { label: 'Overdue', value: overdue.length, icon: AlertTriangle, color: overdue.length > 0 ? 'text-red-600' : 'text-gray-400' },
    { label: 'Due today', value: today.length, icon: Clock, color: today.length > 0 ? 'text-amber-600' : 'text-gray-400' },
    { label: 'Done this week', value: done.length, icon: CheckCircle2, color: 'text-emerald-600' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Good morning</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what needs your attention today.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">{label}</p>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-800">Needs attention</h2>
          {urgent.length === 0 && (
            <span className="text-xs text-emerald-600 font-medium">All clear ✓</span>
          )}
        </div>
        {urgent.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Nothing overdue or due today. Well done.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {urgent.map((c) => (
              <CommitmentCard key={c.id} commitment={c} />
            ))}
          </div>
        )}
      </div>

      <QuickAsk commitments={open} />

      <GmailInbox />
    </div>
  )
}
