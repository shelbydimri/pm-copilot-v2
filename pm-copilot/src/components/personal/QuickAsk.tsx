'use client'

import { useState } from 'react'
import { useClaude } from '@/lib/useClaude'
import type { Commitment } from '@/types'
import { Sparkles, Loader2 } from 'lucide-react'

const QUICK_QUESTIONS = [
  "What's overdue?",
  'Who needs a follow-up?',
  'What to prioritize today?',
  'Summarize my week',
]

export function QuickAsk({ commitments }: { commitments: Commitment[] }) {
  const { call, loading, result } = useClaude()
  const [activeQ, setActiveQ] = useState<string | null>(null)

  function buildContext() {
    return `My open commitments:\n${commitments
      .map((c) => `- ${c.text} | ${c.channel} | ${c.due}${c.person ? ' | ' + c.person : ''}`)
      .join('\n')}`
  }

  async function ask(question: string) {
    setActiveQ(question)
    await call('quickAnswer', { context: buildContext(), question })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Sparkles size={14} className="text-violet-500" />
        <h2 className="text-sm font-medium text-gray-800">Ask your assistant</h2>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => ask(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
            <Loader2 size={14} className="animate-spin" />
            Thinking…
          </div>
        )}

        {result && !loading && (
          <div className="border-l-2 border-violet-400 pl-3 py-1">
            {activeQ && <p className="text-[11px] text-gray-400 mb-1">{activeQ}</p>}
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}
