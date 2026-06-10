'use client'

import { useEffect, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { CheckCircle2, XCircle, Loader2, Mail, MessageSquare, Hash, ExternalLink } from 'lucide-react'

interface ChannelStatus {
  id: string
  name: string
  icon: React.ReactNode
  connected: boolean
  loading: boolean
  scope: string
  available: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const [gmailConnected, setGmailConnected] = useState(false)
  const [checkingGmail, setCheckingGmail] = useState(true)

  useEffect(() => {
    if (session?.user) {
      checkGmail()
    } else {
      setCheckingGmail(false)
    }
  }, [session])

  async function checkGmail() {
    setCheckingGmail(true)
    try {
      const res = await fetch('/api/channels/gmail?action=status')
      const data = await res.json()
      setGmailConnected(data.connected === true)
    } catch {
      setGmailConnected(false)
    } finally {
      setCheckingGmail(false)
    }
  }

  const channels = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: <Mail size={18} className="text-red-500" />,
      connected: gmailConnected,
      loading: checkingGmail,
      scope: 'Read-only access to your inbox threads',
      available: true,
      action: () => signIn('google', { callbackUrl: '/settings' }),
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <MessageSquare size={18} className="text-emerald-500" />,
      connected: false,
      loading: false,
      scope: 'Via WhatsApp Business API — coming in v2',
      available: false,
      action: () => {},
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: <Hash size={18} className="text-violet-500" />,
      connected: false,
      loading: false,
      scope: 'Read channels and DMs you are part of',
      available: false,
      action: () => {},
    },
  ]

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and connected channels.</p>
      </div>

      {/* Account */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account</p>
        </div>
        <div className="p-4">
          {status === 'loading' ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={14} className="animate-spin" /> Loading…
            </div>
          ) : session?.user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img src={session.user.image} className="w-9 h-9 rounded-full" alt="" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                  <p className="text-xs text-gray-400">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Not signed in — features are limited</p>
              <button
                onClick={() => signIn('google')}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Channels */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Connected channels</p>
        </div>
        <div className="divide-y divide-gray-100">
          {channels.map((ch) => (
            <div key={ch.id} className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                {ch.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{ch.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{ch.scope}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {ch.loading ? (
                  <Loader2 size={14} className="animate-spin text-gray-300" />
                ) : ch.connected ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">Connected</span>
                  </>
                ) : ch.available ? (
                  <button
                    onClick={ch.action}
                    className="text-xs font-medium text-violet-600 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 border border-violet-200 transition-colors"
                  >
                    Connect
                  </button>
                ) : (
                  <span className="text-xs text-gray-300 font-medium">Coming soon</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety note */}
      <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 space-y-1.5">
        <p className="text-xs font-medium text-emerald-700">Your data is safe</p>
        <p className="text-xs text-emerald-600 leading-relaxed">
          Gmail access is read-only. PM Copilot can never send emails on your behalf.
          Tokens are stored encrypted in your local database and never leave your server.
          You can disconnect any channel at any time.
        </p>
      </div>

      {/* Setup guide */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Setup guide</p>
        </div>
        <div className="p-4 space-y-3">
          {[
            { step: '1', text: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local', done: false },
            { step: '2', text: 'Add DATABASE_URL=file:./dev.db to .env.local', done: false },
            { step: '3', text: 'Run: npx prisma db push', done: false },
            { step: '4', text: 'Restart the dev server: npm run dev', done: false },
            { step: '5', text: 'Sign in with Google and connect Gmail above', done: false },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-[11px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                {step}
              </span>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          ))}
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 mt-2"
          >
            <ExternalLink size={12} />
            Open Google Cloud Console to create credentials
          </a>
        </div>
      </div>
    </div>
  )
}
