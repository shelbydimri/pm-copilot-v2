# PM Copilot — AI-powered sprint summariser for JIRA

Pulls all issues from a JIRA project and uses Claude to generate a structured, actionable sprint summary in seconds.

---

## What it does

- Fetches all issues from a JIRA project via the REST API v3 (summary, status, type, priority, assignee)
- Sends them to Claude with a PM-focused prompt and gets back a structured analysis
- Surfaces top priorities, blockers, stalled work, and concrete next actions for the team
- Runs as a single CLI command — no dashboard, no config UI, no friction

---

## Sample output

```
======================================================================
  AI PM SPRINT SUMMARY  |  Project: KAN  |  8 issues analyzed
======================================================================

# Sprint Summary — KAN Project

---

## Top 3 Priorities Right Now

- **KAN-1 – Build Claude API Integration** *(In Progress)*: This is the core engine of the sprint.
  Getting this to Done unlocks downstream testing and delivery tasks. It should be the team's
  primary focus until complete.
- **KAN-5 – Test Sprint Summary Output Quality** *(In Review)*: Already in Review — this is closest
  to Done and should be pulled across the line first to free up capacity. Don't let it stall
  waiting for a reviewer.
- **KAN-2 – Design Prompt Template** *(To Do)*: Directly feeds into KAN-1 and KAN-5. If the prompt
  template isn't defined, both the integration and quality testing are working against an unstable
  target. Start this in parallel now.

---

## Blockers & Risks

- **No assignees on any tickets** — this is the most significant risk in the sprint. Without clear
  ownership, nothing has an accountable driver and work will drift.
- **KAN-2 is a hidden dependency**: The prompt template should arguably be *ahead* of KAN-1, not
  behind it. If KAN-1 completes before KAN-2 is finalised, rework is likely.
- **KAN-7 (Rate Limiting & Error Handling) is unstarted**: Shipping without this creates a fragile
  integration. It's a risk if the team plans to demo or deliver to real users this sprint.
- **KAN-5 is In Review with no assignee**: Reviews don't complete themselves — this ticket is at
  risk of quietly stalling at the last step.

---

## In Progress vs Stalled

| Status | Tickets |
|---|---|
| ✅ Done | KAN-3 (JIRA Auth), KAN-8 (.env / Secrets) |
| 🔄 Moving | KAN-1 (Claude Integration — In Progress) |
| ⚠️ Needs Attention | KAN-5 (In Review, no reviewer assigned) |
| 🧊 Not Started | KAN-2, KAN-4, KAN-6, KAN-7 |

Four of eight tickets haven't been started. With KAN-2 being a dependency on active work,
the backlog needs to be pulled into motion immediately.

---

## Suggested Next Actions

1. **Assign every ticket right now** — even a solo developer should explicitly self-assign.
   Ownership is the single fastest fix for velocity loss.
2. **Close out KAN-5 today** — assign a reviewer, get it to Done, and use it as proof-of-concept
   validation before building further.
3. **Start KAN-2 immediately and timebox it** — spend no more than a few hours locking down the
   prompt template so KAN-1 has a stable target to build against.
4. **Prioritise KAN-7 before KAN-6** — don't wire up Slack delivery until the API layer is
   resilient. Delivering errors to Slack at scale is worse than not delivering at all.
5. **Treat KAN-4 (README/Docs) as a sprint-closing task** — schedule it last, but don't drop it.
   If this is an open-source or shared tool, missing docs will create onboarding debt immediately
   after launch.

---

*5 of 8 tickets remain open. The sprint is deliverable but needs ownership assigned and KAN-2
pulled forward urgently.*

----------------------------------------------------------------------
  Model: claude-sonnet-4-6
----------------------------------------------------------------------
```

---

## Tech stack

| | |
|---|---|
| Language | Python 3.11 |
| AI | Claude API — `claude-sonnet-4-6` (Anthropic) |
| Integrations | JIRA REST API v3 |
| Config | `python-dotenv` |

---

## Setup in 3 steps

**1. Clone and install**
```bash
git clone https://github.com/shelbydimri/pm-copilot.git
cd pm-copilot
pip install -r requirements.txt
```

**2. Add your credentials**
```bash
cp .env.example .env
# Fill in ANTHROPIC_API_KEY, JIRA_EMAIL, JIRA_API_TOKEN
```

**3. Run**
```bash
python pm_agent.py
```

---

## Why I built this

Most AI demos are toys. This one is wired into real tools (JIRA) and produces output a PM would actually use.

It demonstrates AI-native product skills that matter right now:

- **MCP-style integrations** — connecting external APIs (JIRA) as context sources for LLM reasoning
- **Prompt engineering** — structuring retrieval output into a prompt that produces consistent, decision-ready analysis
- **Workflow automation** — replacing a manual standup-prep task with a single command

The goal was to show what happens when you treat AI as an integration layer, not just a chatbot.
