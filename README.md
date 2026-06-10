# PM Copilot v2

> Your conversations are where decisions live. PM Copilot makes sure none of them get lost.

## The problem

Decisions get made in MS Teams calls — but no one creates the ticket.
Commitments are made in WhatsApp — but there is no reminder.
Blockers get raised in Slack — but buried under 200 messages.
Follow-ups are promised in Gmail — but never sent.
Asana tasks get updated — but the person it affects is in MS Teams and never sees it.

The result: missed follow-ups, dropped commitments, stalled work, and relationships that go cold.

PM Copilot is the connection layer across all of them.

## What it does

Personal mode — tracks commitments across WhatsApp, Gmail, Slack, MS Teams, drafts replies, extracts commitments from threads, daily AI briefing

Team mode — sprint summaries from JIRA, AI story drafter, metrics anomaly detection, Slack digest

## Status — v2 building phase

- Personal dashboard — live
- Gmail integration read-only — live  
- AI assistant Groq Llama 3.3 — live
- MS Teams integration — building
- WhatsApp Business API — building
- Slack OAuth — building
- Cross-channel conversation graph — planned

## Quick start

```bash
cd pm-copilot
npm install
cp .env.local.example .env.local
npx prisma db push
npm run dev
```

<img width="1504" height="965" alt="image" src="https://github.com/user-attachments/assets/e40b2c85-576f-41a4-8bfd-223609643057" />


## Built by

Shelby Dimri — PM turned builder.
The frustration of watching decisions get buried in MS Teams, WhatsApp, Gmail and Slack — and losing track of who committed to what — became this product.
