import { NextRequest, NextResponse } from 'next/server'

const JIRA_BASE = process.env.JIRA_BASE_URL
const JIRA_EMAIL = process.env.JIRA_EMAIL
const JIRA_TOKEN = process.env.JIRA_API_TOKEN
const JIRA_PROJECT = process.env.JIRA_PROJECT_KEY ?? 'KAN'

function jiraHeaders() {
  const creds = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64')
  return {
    Authorization: `Basic ${creds}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'issues'

  if (!JIRA_BASE || !JIRA_EMAIL || !JIRA_TOKEN) {
    return NextResponse.json({ error: 'JIRA credentials not configured' }, { status: 500 })
  }

  try {
    if (action === 'issues') {
      const jql = encodeURIComponent(`project=${JIRA_PROJECT} ORDER BY priority ASC`)
      const res = await fetch(
        `${JIRA_BASE}/rest/api/3/search?jql=${jql}&fields=summary,status,issuetype,priority,assignee&maxResults=50`,
        { headers: jiraHeaders() }
      )
      const data = await res.json()
      const issues = (data.issues ?? []).map((i: any) => ({
        id: i.id,
        key: i.key,
        summary: i.fields.summary,
        status: i.fields.status?.name ?? 'Unknown',
        issueType: i.fields.issuetype?.name ?? 'Task',
        priority: i.fields.priority?.name ?? 'Medium',
        assignee: i.fields.assignee?.displayName ?? 'Unassigned',
      }))
      return NextResponse.json({ issues })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, payload } = body

  if (!JIRA_BASE || !JIRA_EMAIL || !JIRA_TOKEN) {
    return NextResponse.json({ error: 'JIRA credentials not configured' }, { status: 500 })
  }

  try {
    if (action === 'createTicket') {
      const { title, issueType, priority, description, acceptanceCriteria } = payload
      const acText = acceptanceCriteria?.map((ac: string, i: number) => `${i + 1}. ${ac}`).join('\n') ?? ''

      const res = await fetch(`${JIRA_BASE}/rest/api/3/issue`, {
        method: 'POST',
        headers: jiraHeaders(),
        body: JSON.stringify({
          fields: {
            project: { key: JIRA_PROJECT },
            summary: title,
            issuetype: { name: issueType ?? 'Story' },
            priority: { name: priority ?? 'Medium' },
            description: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: `${description}\n\nAcceptance Criteria:\n${acText}` }],
                },
              ],
            },
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })
      return NextResponse.json({ key: data.key, url: `${JIRA_BASE}/browse/${data.key}` })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
