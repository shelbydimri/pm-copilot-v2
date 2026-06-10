'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard/personal' })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mx-auto mb-4">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">PM Copilot</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your AI assistant for personal and team work
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-gray-400" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/dashboard/personal'}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continue without signing in →
          </button>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Gmail connected read-only — we never send emails on your behalf
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Your data stays private — never shared or sold
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Disconnect anytime from Settings
          </div>
        </div>

      </div>
    </div>
  )
}
