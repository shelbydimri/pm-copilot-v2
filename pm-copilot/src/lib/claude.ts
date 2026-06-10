const CLAUDE_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

const PERSONAL_SYSTEM = `You are a personal assistant for a busy startup founder or PM.
You help track commitments, draft replies, and summarise conversations across WhatsApp, Gmail, and Slack.
Be concise, warm, and practical. Plain text only — no markdown headers or bullet symbols.
Keep responses under 200 words unless drafting a reply.`

const TEAM_SYSTEM = `You are an AI-powered PM copilot for a startup team.
You analyse JIRA sprints, draft tickets, detect metric anomalies, and send Slack digests.
Be structured, precise, and decision-ready. Output is consumed by PMs and engineering leads.`

async function callClaude(
  prompt: string,
  mode: 'personal' | 'team' = 'personal',
  maxTokens = 1000
): Promise<string> {
  const res = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: mode === 'personal' ? PERSONAL_SYSTEM : TEAM_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? 'No response from Claude.'
}

export const claude = {
  // Personal mode
  draftReply: (channel: string, thread: string) =>
    callClaude(
      `Channel: ${channel}\n\nConversation:\n${thread}\n\nDraft a concise, natural reply. Human tone, not corporate.`,
      'personal'
    ),

  extractCommitments: (channel: string, thread: string) =>
    callClaude(
      `Channel: ${channel}\n\nConversation:\n${thread}\n\nExtract all commitments and follow-ups. Who promised what, by when?`,
      'personal'
    ),

  summariseThread: (channel: string, thread: string) =>
    callClaude(
      `Channel: ${channel}\n\nConversation:\n${thread}\n\nSummarise in 3–5 sentences. What was decided? What is pending?`,
      'personal'
    ),

  dailyDigest: (commitmentsSummary: string) =>
    callClaude(
      `${commitmentsSummary}\n\nWrite a 4–6 sentence daily briefing. What is most urgent? What to focus on first? Any patterns?`,
      'personal'
    ),

  draftFollowUp: (commitment: string, channel: string, due: string) =>
    callClaude(
      `I need to follow up on: "${commitment}"\nChannel: ${channel}\nStatus: ${due}\n\nWrite a short, natural follow-up message.`,
      'personal'
    ),

  quickAnswer: (context: string, question: string) =>
    callClaude(`${context}\n\nQuestion: ${question}`, 'personal'),

  // Team mode
  sprintSummary: (issues: string) =>
    callClaude(
      `JIRA issues:\n${issues}\n\nProvide: top priorities, blockers, stalled work, next actions. Be structured and decision-ready.`,
      'team',
      1500
    ),

  draftTicket: (idea: string) =>
    callClaude(
      `Idea: "${idea}"\n\nGenerate a JIRA ticket. Return JSON only:\n{"title":"","issueType":"","priority":"","priorityReason":"","description":"","acceptanceCriteria":[]}`,
      'team'
    ),

  metricsAnomaly: (metrics: string) =>
    callClaude(
      `Metrics data:\n${metrics}\n\nAnalyse anomalies. Return JSON only:\n{"healthScore":0,"summary":"","anomalies":[{"metric":"","severity":"CRITICAL|WARNING|POSITIVE","change":0,"cause":"","action":""}]}`,
      'team',
      1500
    ),
}
