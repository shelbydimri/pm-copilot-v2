# PM Copilot v2

> Your conversations are where decisions live. PM Copilot makes sure none of them get lost.

## The problem

You're running a startup or leading a team. Your work lives across 6 different tools simultaneously.

A decision gets made in a **MS Teams call** — but no one creates the ticket.
A commitment is made in **WhatsApp** — but there's no reminder.
A blocker is raised in a **Slack thread** — but it gets buried under 200 other messages.
A follow-up is promised in a **Gmail thread** — but it never gets sent.
An **Asana task** gets updated — but the person it affects is in MS Teams and never sees it.

The result: missed follow-ups, dropped commitments, stalled work, and relationships that go cold. Not because people don't care — but because no single tool connects all the conversations.

**PM Copilot is that connection layer.**

## What it does

PM Copilot watches your channels and surfaces what needs your attention — before it's too late.

### Personal mode
- Tracks every commitment you've made across WhatsApp, Gmail, Slack, MS Teams
- Detects when someone is waiting on you — even if you forgot
- Drafts replies based on full conversation context
- Extracts commitments automatically from email and message threads
- Generates a daily AI briefing: what's overdue, what's due today, who needs a follow-up
- Answers natural questions: "Who needs a follow-up?", "What's overdue?", "What should I prioritize today?"

### Team mode
- Sprint summaries from JIRA — top priorities, blockers, stalled work, next actions
- AI story drafter — turn a rough idea into a structured JIRA ticket in seconds
- Metrics anomaly detection — catch regressions before they become incidents
- Slack digest — automated Monday morning team briefing

## Why it's different from Slack, Asana, or any single tool

Every tool solves one channel. PM Copilot connects all of them.

A commitment made in MS Teams that becomes a WhatsApp follow-up that should be a JIRA ticket — PM Copilot sees that entire chain. No other tool does.

## Status

🚧 **Active development — v2 building phase**

| Feature | Status |
|---|---|
| Personal dashboard | ✅ Live |
| Gmail integration (read-only OAuth) | ✅ Live |
| AI assistant (Groq / Llama 3.3 70b) | ✅ Live |
| Commitment tracker | ✅ Live |
| Reply drafter | ✅ Live |
| Daily digest | ✅ Live |
| Team mode — sprint summary | ✅ Live |
| MS Teams integration | 🔜 Building |
| WhatsApp Business API | 🔜 Building |
| Slack OAuth | 🔜 Building |
| Auto-extract commitments from Gmail | 🔜 Building |
| Cross-channel conversation graph | 🔜 Planned |
| Asana / Notion sync | 🔜 Planned |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui |
| AI | Groq API — Llama 3.3 70b (free tier) |
| Auth | NextAuth v5, Google OAuth 2.0 |
| Database | Prisma ORM, SQLite (local) / Postgres (production) |
| Channels | Gmail API read-only, WhatsApp Business API (coming), MS Teams Graph API (coming) |
| Original CLI | Python 3.11, Claude API, JIRA REST API v3, Slack Webhooks |

## Quick start

```bash
git clone https://github.com/shelbydimri/pm-copilot-v2
cd pm-copilot
npm install
cp .env.local.example .env.local
# Add your keys to .env.local
npx prisma db push
npm run dev
```

Open http://localhost:3000

## Environment variables

```
GROQ_API_KEY=           # Free at console.groq.com
GOOGLE_CLIENT_ID=       # Google Cloud Console
GOOGLE_CLIENT_SECRET=   # Google Cloud Console  
NEXTAUTH_SECRET=        # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
NEXTAUTH_URL=           # http://localhost:3000
DATABASE_URL=           # file:./dev.db
```

## Roadmap

### Now — v2 core
- Gmail auto-commit extraction on sign-in
- WhatsApp Business API connection
- MS Teams Graph API for missed message detection
- Deploy to Vercel

### Next — v2.1
- Slack OAuth and DM scanning
- Cross-channel conversation graph
- Link a Teams message to a Gmail reply to a JIRA ticket — one traceable chain
- Auto-follow-up scheduling

### Later — v3
- Asana and Notion sync
- Team workspaces with shared commitment tracking
- ProductHunt launch
- Monetisation — free personal tier, paid team tier

## The origin

This started as a Python CLI — four tools that automated JIRA busywork for PMs. Sprint summaries, ticket drafting, Slack digests, metrics anomaly detection. All powered by Claude.

v2 is the web product built on top of that foundation — same core insight, now with a real UI and real channel integrations.

The v1 CLI still lives in the root of this repo.

## Built by

**Shelby Dimri** — PM turned builder.

The frustration of watching important decisions get buried in MS Teams calls, WhatsApp threads, and Gmail chains — and then losing track of who committed to what — became this product.

---

*Decisions happen in Teams. Commitments happen in WhatsApp. Tasks live in JIRA. PM Copilot connects them all.*
