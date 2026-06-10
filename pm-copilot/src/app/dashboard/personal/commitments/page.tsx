'use client'

import { useState } from 'react'
import { useAppStore } from '@/store'
import { CommitmentCard } from '@/components/personal/CommitmentCard'
import type { Channel, DueStatus } from '@/types'
import { Plus } from 'lucide-react'

const CHANNELS: Channel[] = ['WhatsApp', 'Gmail', 'Slack', 'MS Teams', 'Manual']
const DUE_OPTIONS: DueStatus[] = ['Today', 'Tomorrow', 'This week', 'Overdue']

export default function CommitmentsPage() {
  const { commitments, addCommitment } = useAppStore()
  const [text, setText] = useState('')
  const [channel, setChannel] = useState<Channel>('WhatsApp')
  const [due, setDue] = useState<DueStatus>('Today')
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('open')

  const sorted = commitments
    .filter((c) => {
      if (filter === 'open') return !c.done
      if (filter === 'done') return c.done
      return true
    })
    .sort((a, b) => {
      const order: Record<string, number> = { Overdue: 0, Today: 1, Tomorrow: 2, 'This week': 3, Done: 4 }
      return (order[a.done ? 'Done' : a.due] ?? 3) - (order[b.done ? 'Done' : b.due] ?? 3)
    })

  function handleAdd() {
    const t = text.trim()
    if (!t) return
    addCommitment(t, channel, due)
    setText('')
  }

  const open = commitments.filter((c) => !c.done).length

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Commitments</h1>
        <p className="text-sm text-gray-500 mt-0.5">{open} open across your channels</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder='e.g. "Send revised proposal to Raj by Friday"'
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent placeholder:text-gray-400"
          />
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-700"
          >
            {CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={due}
            onChange={(e) => setDue(e.target.value as DueStatus)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 text-gray-700"
          >
            {DUE_OPTIONS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {(['open', 'all', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-violet-100 text-violet-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            {filter === 'done' ? 'Nothing marked done yet.' : 'No commitments yet — add one above.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sorted.map((c) => <CommitmentCard key={c.id} commitment={c} />)}
          </div>
        )}
      </div>
    </div>
  )
}
