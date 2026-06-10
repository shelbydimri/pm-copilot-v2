'use client'

import { useState } from 'react'

interface UseClaudeOptions {
  onSuccess?: (result: string) => void
}

export function useClaude({ onSuccess }: UseClaudeOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function call(action: string, payload: Record<string, unknown>) {
    console.log('Calling Claude with action:', action)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      })
      console.log('API response status:', res.status)
      const data = await res.json()
      console.log('API response data:', data)
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setResult(data.result)
      onSuccess?.(data.result)
      return data.result as string
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log('API error:', msg)
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { call, loading, result, error, setResult }
}
