'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import type { Commitment } from '@/types'
import { Check, Trash2, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const CHANNEL_STYLES: Record<string, string> = {
  WhatsApp: 'bg-emerald-50 text-emerald-700',
  Gmail: 'bg-blue-50 text-blue-700',
  Slack: 'bg-violet-50 text-violet-700',
  'MS Teams': 'bg-indigo-50 text-indigo-700',
  Manual: 'bg-gray-100 text-gray-600',
}

const DUE_STYLES: Record<string, string> = {
  Overdue: 'bg-red-50 text-red-700',
  Today: 'bg-amber-50 text-amber-700',
  Tomorrow: 'bg-sky-50 text-sky-700',
  'This week': 'bg-emerald-50 text-emerald-700',
  Done: 'bg-gray-100 text-gray-500',
}

export function CommitmentCard({ commitment: c }: { commitment: Commitment }) {
  const { toggleCommitment, deleteCommitment } = useAppStore()
  const router = useRouter()

  function handleDraftReply() {
    router.push(`/dashboard/personal/reply?commitmentId=${c.id}`)
  }

  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors', c.done && 'opacity-50')}>
      <button
        onClick={() => toggleCommitment(c.id)}
        className={cn(
          'mt-0.5 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors',
          c.done
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 hover:border-violet-400'
        )}
        aria-label={c.done ? 'Mark incomplete' : 'Mark done'}
      >
        {c.done && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm text-gray-800 leading-snug', c.done && 'line-through text-gray-400')}>
          {c.text}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', CHANNEL_STYLES[c.channel] ?? 'bg-gray-100 text-gray-600')}>
            {c.channel}
          </span>
          <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', DUE_STYLES[c.done ? 'Done' : c.due])}>
            {c.done ? 'Done' : c.due}
          </span>
          {c.person && (
            <span className="text-[11px] text-gray-400">{c.person}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {!c.done && (
          <button
            onClick={handleDraftReply}
            className="flex items-center gap-1 text-[11px] text-violet-600 hover:text-violet-700 font-medium px-2 py-1 rounded-md hover:bg-violet-50 transition-colors"
          >
            Draft reply <ArrowUpRight size={11} />
          </button>
        )}
        <button
          onClick={() => deleteCommitment(c.id)}
          className="p-1.5 text-gray-300 hover:text-red-400 rounded-md hover:bg-red-50 transition-colors"
          aria-label="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
