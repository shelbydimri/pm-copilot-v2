'use client'

import { useEffect, useState } from 'react'
import { useClaude } from '@/lib/useClaude'
import { Loader2, Mail, ArrowUpRight, Sparkles } from 'lucide-react'

interface GmailMessage {
  id: string
  subject: string
  from: string
  date: string
  snippet: string
}

export function GmailInbox() {
  const [messages, setMessages] = useState<GmailMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [threadText, setThreadText] = useState('')
  const { call, loading: aiLoading, result } = useClaude()

  useEffect(() => {
    fetchMessages()
  }, [])

  async function fetchMessages() {
    setLoading(true)
    try {
      const res = await fetch('/api/channels/gmail?action=threads')
      const data = await res.json()
      if (data.connected) {
        setConnected(true)
        const cleanedMessages = (data.messages ?? []).map((msg: GmailMessage) => ({
          ...msg,
          snippet: (msg.snippet ?? '').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/[\u{0080}-\u{FFFF}]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 120)
        }))
        setMessages(cleanedMessages)
      } else {
        setConnected(false)
      }
    } catch {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  async function openThread(id: string) {
    console.log('Opening thread:', id)
    setSelected(id)
    try {
      const res = await fetch(`/api/channels/gmail?action=thread&id=${id}`)
      console.log('Thread response status:', res.status)
      const data = await res.json()
      console.log('Thread data:', data)
      setThreadText(data.thread ?? '')
    } catch(e) {
      console.log('Thread error:', e)
    }
  }

  async function extractFromThread() {
    if (!threadText) return
    await call('extractCommitments', { channel: 'Gmail', thread: threadText })
  }

  async function draftReply() {
    if (!threadText) return
    await call('draftReply', { channel: 'Gmail', thread: threadText })
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
        <Loader2 size={14} className="animate-spin" /> Loading Gmail…
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
        <Mail size={24} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600">Gmail not connected</p>
        <p className="text-xs text-gray-400 mt-1 mb-4">Connect Gmail in Settings to see your inbox here</p>
        <a
          href="/settings"
          className="text-xs font-medium text-violet-600 hover:text-violet-700 px-4 py-2 rounded-lg bg-violet-50 hover:bg-violet-100 transition-colors"
        >
          Go to Settings →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-red-400" />
            <span className="text-sm font-medium text-gray-700">Recent Gmail threads</span>
          </div>
          <span className="text-xs text-gray-400">{messages.length} unread</span>
        </div>

        {messages.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">No unread emails</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openThread(msg.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected === msg.id ? 'bg-violet-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{msg.subject && msg.subject.trim() ? msg.subject : '(no subject)'}</p>
                  <ArrowUpRight size={12} className="text-gray-300 flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.from}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{msg.snippet}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && threadText && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <Sparkles size={14} className="text-violet-500" />
            <span className="text-sm font-medium text-gray-700">AI actions</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={extractFromThread}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs font-medium bg-violet-600 text-white px-3 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                Extract commitments
              </button>
              <button
                onClick={draftReply}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Draft reply
              </button>
            </div>

            {result && !aiLoading && (
              <div className="border-l-2 border-violet-400 pl-3 py-1">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{result}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
