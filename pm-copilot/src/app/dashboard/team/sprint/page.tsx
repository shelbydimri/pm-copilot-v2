'use client'

import { useState } from 'react'
import { useClaude } from '@/lib/useClaude'
import { Loader2, RefreshCw, Zap } from 'lucide-react'

const MOCK_ISSUES = `KAN-1: Fix login page timeout bug — In Progress — Bug — High — Arjun
KAN-2: Add password reset flow — To Do — Story — High — Unassigned
KAN-3: Update onboarding email sequence — In Progress — Task — Medium — Priya
KAN-4: Performance regression on dashboard — Blocked — Bug — Critical — Dev Team
KAN-5: Implement Slack webhook integration — Done — Story — Medium — Neha
KAN-6: Sprint retrospective docs — To Do — Task — Low — Shelby
KAN-7: Analytics dashboard v2 — In Progress — Story — High — Raj
KAN-8: Mobile responsive fixes — Blocked — Task — High — Dev Team`

export default function SprintPage() {
  const { call, loading, result } = useClaude()
  const [issues, setIssues] = useState(MOCK_ISSUES)
  const [hasRun, setHasRun] = useState(false)

  async function runSummary() {
    await call('sprintSummary', { issues })
    setHasRun(true)
  }

  const sections = result ? parseSummary(result) : []

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sprint summary</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered analysis of your current sprint.</p>
        </div>
        <button
          onClick={runSummary}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : hasRun ? <RefreshCw size={14} /> : <Zap size={14} />}
          {hasRun ? 'Refresh' : 'Run summary'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">JIRA issues (paste or connect)</p>
        </div>
        <textarea
          value={issues}
          onChange={(e) => setIssues(e.target.value)}
          rows={8}
          className="w-full text-xs font-mono p-4 focus:outline-none resize-none text-gray-600 bg-gray-50"
          placeholder="Paste JIRA issues or connect your JIRA account in Settings…"
        />
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <Loader2 size={20} className="animate-spin text-violet-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Analysing your sprint…</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sprint analysis</span>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{result}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function parseSummary(text: string) {
  return text.split('\n\n').filter(Boolean).map((block) => {
    const lines = block.split('\n')
    return { heading: lines[0], items: lines.slice(1) }
  })
}
