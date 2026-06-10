'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { useClaude } from '@/lib/useClaude'
import { Loader2, RefreshCw, Sun, AlertTriangle, Clock, CheckCircle2, Wifi } from 'lucide-react'

export default function DigestPage() {
  const { commitments } = useAppStore()
  const { call, loading } = useClaude()
  const [digest, setDigest] = useState<string | null>(null)
  const [generated, setGenerated] = useState(false)

  const open = commitments.filter((c) => !c.done)
  const overdue = open.filter((c) => c.due === 'Overdue')
  const today = open.filter((c) => c.due === 'Today')
  const upcoming = open.filter((c) => c.due !== 'Overdue' && c.due !== 'Today')

  async function generate() {
    const summary = `Open commitments: ${open.length}. Overdue: ${overdue.length}. Due today: ${today.length}.\n\nOverdue:\n${overdue.map((c) => `- ${c.text} (${c.channel})`).join('\n') || 'None'}\n\nDue today:\n${today.map((c) => `- ${c.text} (${c.channel})`).join('\n') || 'None'}\n\nUpcoming:\n${upcoming.map((c) => `- ${c.text} (${c.channel})`).join('\n') || 'None'}`
    const result = await call('dailyDigest', { commitmentsSummary: summary })
    if (result) { setDigest(result); setGenerated(true) }
  }

  const sections = [
    { icon: AlertTriangle, label: 'Overdue', items: overdue, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { icon: Clock, label: 'Due today', items: today, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    { icon: CheckCircle2, label: 'Upcoming', items: upcoming, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Daily digest</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your AI-powered briefing for the day.</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? <Loader2 size={14} className="animate-spin" />
            : generated ? <RefreshCw size={14} /> : <Sun size={14} />}
          {generated ? 'Regenerate' : 'Generate digest'}
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <Loader2 size={20} className="animate-spin text-violet-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Building your briefing…</p>
        </div>
      )}

      {digest && !loading && (
        <div className="bg-white rounded-xl border border-violet-200 overflow-hidden">
          <div className="px-4 py-3 bg-violet-50 border-b border-violet-100 flex items-center gap-2">
            <Sun size={14} className="text-violet-500" />
            <span className="text-xs font-medium text-violet-700 uppercase tracking-wide">AI briefing</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{digest}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {sections.map(({ icon: Icon, label, items, color, bg, border }) => (
          <div key={label} className={`rounded-xl border ${border} ${bg} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={14} className={color} />
              <span className="text-xs font-medium text-gray-700">{label}</span>
              <span className="text-xs text-gray-400 ml-auto">{items.length}</span>
            </div>
            {items.length === 0 ? (
              <p className="text-xs text-gray-400">None</p>
            ) : (
              <ul className="space-y-1.5">
                {items.map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    <span className="text-xs text-gray-400 mt-0.5 shrink-0">{c.channel}</span>
                    <span className="text-sm text-gray-700">{c.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
        <Wifi size={16} className="text-gray-300" />
        <div>
          <p className="text-xs font-medium text-gray-600">Channel connections coming in v2</p>
          <p className="text-xs text-gray-400 mt-0.5">WhatsApp, Gmail, and Slack will auto-populate your commitments.</p>
        </div>
      </div>
    </div>
  )
}
