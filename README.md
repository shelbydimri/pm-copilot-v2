<img width="1532" height="876" alt="image" src="https://github.com/user-attachments/assets/7940174d-a005-4ed3-b8fd-322c17103491" /># PM Copilot v2

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
<img width="1532" height="876" alt="image" src="https://github.com/user-attachments/assets/7ad21be2-7bc7-4ba2-be69-6e7b1a3f9fdd" />

<img width="1466" height="868" alt="image" src="https://github.com/user-attachments/assets/0eaeb183-1dc1-4bbf-8a33-c60da57fdcb8" />
<img width="1510" height="837" alt="image" src="https://github.com/user-attachments/assets/3836ec9a-7028-485c-81d4-63753c1dbd37" />
<img width="1507" height="816" alt="image" src="https://github.com/user-attachments/assets/9ff31d63-389d-4d0a-bd1d-e88ab6aca59c" />
<img width="1481" height="726" alt="image" src="https://github.com/user-attachments/assets/1a07fca3-4aa3-443d-ac13-20342561e13f" />





## Built by

Shelby Dimri — PM turned builder.
The frustration of watching decisions get buried in MS Teams, WhatsApp, Gmail and Slack — and losing track of who committed to what — became this product.
