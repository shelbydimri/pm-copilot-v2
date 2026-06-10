'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppStore } from '@/store'
import { useClaude } from '@/lib/useClaude'
import type { Channel } from '@/types'
import { Loader2, Copy, RefreshCw, CheckCheck } from 'lucide-react'

const CHANNELS: Channel[] = ['WhatsApp', 'Gmail', 'Slack', 'MS Teams']

function ReplyDrafter() {
  const searchParams = useSearchParams()
  const commitmentId = searchParams.get('commitmentId')
  const { commitments } = useAppStore()

  const [channel, setChannel] = useState<Channel>('WhatsApp')
  const [thread, setThread] = useState('')
  const [copied, setCopied] = useState(false)
  const { call, loading, result, setResult } = useClaude()

  useEffect(() => {
    if (commitmentId) {
      const c = commitments.find((x) => x.id === commitmentId)
      if (c) {
        setChannel(c.channel as Channel)
        setThread(`Context: I committed to "${c.text}" via ${c.channel}. Status: ${c.due}.`)
        setTimeout(() => {
          call('draftFollowUp', { commitment: c.text, channel: c.channel, due: c.due })
        }, 100)
      }
    }
  }, [commitmentId])

  async function copy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Draft reply</h1>
        <p className="text-sm text-gray-500 mt-0.5">Paste a conversation and get an AI-drafted response.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                channel === ch
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-700'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        <textarea
          value={thread}
          onChange={(e) => setThread(e.target.value)}
          rows={6}
          placeholder="Paste your conversation thread here — WhatsApp messages, email chain, Slack thread…"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent placeholder:text-gray-400"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setResult(null); call('draftReply', { channel, thread }) }}
            disabled={loading || !thread.trim()}
            className="flex items-center gap-1.5 text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-40 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Draft reply
          </button>
          <button
            onClick={() => { setResult(null); call('extractCommitments', { channel, thread }) }}
            disabled={loading || !thread.trim()}
            className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Extract commitments
          </button>
          <button
            onClick={() => { setResult(null); call('summariseThread', { channel, thread }) }}
            disabled={loading || !thread.trim()}
            className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Summarise thread
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-2 px-1">
          <Loader2 size={14} className="animate-spin text-violet-500" />
          Claude is thinking…
        </div>
      )}

      {result && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI response</span>
            <div className="flex gap-1.5">
              <button
                onClick={copy}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                {copied ? <CheckCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => call('draftReply', { channel, thread })}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <RefreshCw size={12} /> Regenerate
              </button>
            </div>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{result}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReplyPage() {
  return (
    <Suspense>
      <ReplyDrafter />
    </Suspense>
  )
}
