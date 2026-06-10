import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { action, payload } = await req.json()

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 })
  }

  const prompts: Record<string, string> = {
    draftReply: `Channel: ${payload.channel}\n\nConversation:\n${payload.thread}\n\nDraft a concise, natural reply. Human tone, not corporate. Keep it short.`,
    extractCommitments: `Channel: ${payload.channel}\n\nConversation:\n${payload.thread}\n\nExtract all commitments and follow-ups. Who promised what, by when?`,
    summariseThread: `Channel: ${payload.channel}\n\nConversation:\n${payload.thread}\n\nSummarise in 3–5 sentences. What was decided? What is pending? Who needs to do what?`,
    dailyDigest: `${payload.commitmentsSummary}\n\nWrite a 4–6 sentence daily briefing. What is most urgent? What pattern do you notice?`,
    draftFollowUp: `I need to follow up on: "${payload.commitment}"\nChannel: ${payload.channel}\nStatus: ${payload.due}\n\nWrite a short natural follow-up message.`,
    quickAnswer: `${payload.context}\n\nQuestion: ${payload.question}`,
    sprintSummary: `JIRA issues:\n${payload.issues}\n\nProvide structured PM analysis: top priorities, blockers, stalled work, next actions.`,
    draftTicket: `User idea: "${payload.idea}"\n\nGenerate a JIRA ticket as JSON only, no markdown:\n{"title":"","issueType":"Story","priority":"","priorityReason":"","description":"","acceptanceCriteria":[]}`,
    metricsAnomaly: `Metrics:\n${payload.metrics}\n\nAnalyse and return JSON only:\n{"healthScore":0,"summary":"","anomalies":[{"metric":"","severity":"CRITICAL","change":0,"cause":"","action":""}]}`,
  }

  const systemPrompts: Record<string, string> = {
    personal: `You are a personal assistant for a busy startup founder or PM. Be concise, warm, practical. Plain text only — no markdown or bullet symbols. Under 200 words unless drafting.`,
    team: `You are an AI PM copilot for a startup team. Be structured, precise, decision-ready. Output is consumed by PMs and engineering leads.`,
  }

  const teamActions = ['sprintSummary', 'draftTicket', 'metricsAnomaly']
  const mode = teamActions.includes(action) ? 'team' : 'personal'
  const prompt = prompts[action]

  if (!prompt) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompts[mode] },
          { role: 'user', content: prompt }
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ result: text })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
