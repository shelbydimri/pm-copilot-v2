# PM Copilot

> Your conversations are where decisions live. PM Copilot makes sure none of them get lost.

## Versions

### v2 — Web app (current) 
📁 [`/pm-copilot`](./pm-copilot) — Next.js web application with Gmail integration, Google OAuth, personal dashboard, and AI assistant powered by Groq.

### v1 — Python CLI 
📁 Root of this repo — Four CLI tools that automated PM busywork: sprint summaries, ticket drafting, Slack digests, and metrics anomaly detection powered by Claude.
See [README_v1_cli.md](./README_v1_cli.md) for full v1 documentation.

---

## The problem

Decisions get made in **MS Teams calls** — but no one creates the ticket.
Commitments are made in **WhatsApp** — but there is no reminder.
Blockers get raised in **Slack** — but buried under 200 messages.
Follow-ups are promised in **Gmail** — but never sent.
**Asana tasks** get updated — but the person it affects is in MS Teams and never sees it.

The result: missed follow-ups, dropped commitments, stalled work, and relationships that go cold.

PM Copilot is the connection layer across all of them.

---

## What PM Copilot v2 does

**Personal mode**
- Tracks commitments made across WhatsApp, Gmail, Slack, MS Teams
- Drafts replies based on full conversation context
- Extracts commitments automatically from email and message threads
- Daily AI briefing: what is overdue, what is due today, who needs a follow-up
- Answers: "Who needs a follow-up?", "What is overdue?", "What to prioritize today?"

**Team mode**
- Sprint summaries from JIRA
- AI story drafter — rough idea to structured JIRA ticket in seconds
- Metrics anomaly detection
- Slack digest — automated Monday morning team briefing

---

## Status

🚧 Active development — v2 building phase

| Feature | Status |
|---|---|
| Personal dashboard | ✅ Live |
| Gmail integration (read-only) | ✅ Live |
| AI assistant (Groq / Llama 3.3) | ✅ Live |
| Commitment tracker | ✅ Live |
| Reply drafter | ✅ Live |
| Daily digest | ✅ Live |
| Team mode — sprint summary | ✅ Live |
| MS Teams integration | 🔜 Building |
| WhatsApp Business API | 🔜 Building |
| Slack OAuth | 🔜 Building |
| Asana / Notion sync | 🔜 Planned |
| Cross-channel conversation graph | 🔜 Planned |

---

## Quick start (v2)

```bash
cd pm-copilot
npm install
cp .env.local.example .env.local
npx prisma db push
npm run dev
```

---

## Built by

Shelby Dimri — PM turned builder.
The frustration of watching decisions get buried in MS Teams, WhatsApp, Gmail, and Slack — and losing track of who committed to what — became this product.

---
