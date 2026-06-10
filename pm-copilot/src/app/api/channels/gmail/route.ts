import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { decodeHtmlEntities } from '@/lib/html-decode'

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ connected: false, error: 'Not authenticated' }, { status: 401 })
  }

  const accessToken = (session as any).accessToken
  if (!accessToken) {
    return NextResponse.json({ connected: false, error: 'No access token' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'status'

  try {
    if (action === 'status') {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return NextResponse.json({ connected: res.ok })
    }

    if (action === 'threads') {
      const data = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=10&labelIds=INBOX',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      ).then(r => r.json())

      const messages = await Promise.all(
        (data.messages ?? []).slice(0, 10).map(async (m: { id: string }) => {
          const msg = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          ).then(r => r.json())
          const headers = msg.payload?.headers ?? []
          const get = (name: string) => {
            const h = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())
            return h?.value ?? ''
          }
          return {
            id: m.id,
            subject: decodeHtmlEntities(get('Subject')),
            from: decodeHtmlEntities(get('From')),
            date: get('Date'),
            snippet: decodeHtmlEntities(msg.snippet ?? '')
          }
        })
      )
      return NextResponse.json({ messages, connected: true })
    }

    if (action === 'thread') {
      const threadId = searchParams.get('id')
      if (!threadId) {
        return NextResponse.json({ error: 'Missing thread id' }, { status: 400 })
      }

      const msg = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${threadId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      ).then(r => r.json())

      const headers = msg.payload?.headers ?? []
      const getHeader = (name: string) => {
        const h = headers.find((h: any) => h.name?.toLowerCase() === name.toLowerCase())
        return h?.value ?? ''
      }

      let body = ''
      const parts = msg.payload?.parts ?? [msg.payload]
      for (const part of parts) {
        if (part?.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8')
          break
        }
      }

      const thread = `From: ${getHeader('From')}\nSubject: ${getHeader('Subject')}\nDate: ${getHeader('Date')}\n\n${body}`
      return NextResponse.json({ thread, connected: true })
    }

    return NextResponse.json({ connected: false, error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ connected: false, error: String(err) }, { status: 500 })
  }
}
