# PM Copilot — AI-powered JIRA toolkit

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pm--copilot.onrender.com-7c3aed?style=for-the-badge&logo=render&logoColor=white)](https://pm-copilot-9iw0.onrender.com)

Four CLI tools that replace common PM busywork: sprint summaries, ticket drafting, Slack digests, and metrics anomaly detection — powered by Claude.

---

## What it does

**Mode 1 — Sprint summary** (`python pm_agent.py`)
- Fetches all issues from a JIRA project via the REST API v3 (summary, status, type, priority, assignee)
- Sends them to Claude with a PM-focused prompt and gets back a structured analysis
- Surfaces top priorities, blockers, stalled work, and concrete next actions for the team

**Mode 2 — Story drafter** (`python pm_agent.py --draft`)
- You type a rough idea in plain English (e.g. "users should be able to reset their password from the login page")
- Claude generates a structured JIRA ticket: title, issue type, priority with reasoning, description, and 3–5 testable acceptance criteria
- Shows you a preview in the terminal for review, then creates it live in JIRA on confirmation and returns the ticket URL

**Mode 3 — Slack digest** (`python pm_agent.py --slack`)
- Runs the same sprint summary logic as Mode 1, reformats it for Slack (bold headings, `•` bullets)
- POSTs it to a Slack channel via an incoming webhook URL stored in `.env`
- Prints "Digest sent to Slack!" on success

**Mode 3b — Scheduled digest** (`python pm_agent.py --schedule`)
- Keeps the process alive and fires the Slack digest automatically every Monday at 09:00
- Uses Python's `schedule` library — no cron setup required

**Mode 4 — Metrics anomaly detector** (`python pm_agent.py --metrics`)
- Loads `metrics.json` (current week vs previous week; mirrors GA4 + Mixpanel API structure)
- Claude calculates % change for each metric, classifies each as **Critical** (>20% wrong direction), **Warning** (10–20%), or **Positive** (>10% right direction), and suggests a root cause and recommended action for each
- Produces an overall health score 0–100 and prints a full anomaly report in the terminal
- Automatically sends a Slack alert if any Critical anomalies are found — no extra flag needed

---

## Sample output

### Mode 1 — Sprint summary

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
| **Done** | KAN-3 (JIRA Auth), KAN-8 (.env / Secrets) |
| **Moving** | KAN-1 (Claude Integration — In Progress) |
| **Needs Attention** | KAN-5 (In Review, no reviewer assigned) |
| **Not Started** | KAN-2, KAN-4, KAN-6, KAN-7 |

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

### Mode 2 — Story drafter

```
$ python pm_agent.py --draft

[Story Drafter] Describe your idea in plain English.
  Example: 'users should be able to reset their password from the login page'

> users should be able to reset their password from the login page

[Story Drafter] Generating ticket …

======================================================================
  GENERATED TICKET PREVIEW
======================================================================

  Title       : Add Password Reset Flow from Login Page
  Type        : Story
  Priority    : High  —  Password reset is a critical authentication feature
                that directly impacts user access and account security.

  Description :
  Users currently have no self-service way to recover account access when
  they forget their password. This story adds a password reset flow initiated
  from the login page, allowing users to receive a secure reset link via email
  and set a new password without contacting support.

  Acceptance Criteria:
    1. A "Forgot password?" link is visible on the login page below the sign-in form
    2. Clicking the link prompts the user to enter their registered email address
    3. A password reset email is sent within 60 seconds of the request
    4. The reset link expires after 24 hours and can only be used once
    5. After a successful reset, the user is redirected to login with a confirmation message

======================================================================

Create this in JIRA? (y/n): y

[Story Drafter] Creating ticket in JIRA …

[Story Drafter] Done!  https://saranshsworkspace-35970721.atlassian.net/browse/KAN-12
```

### Mode 3 — Slack digest

```
$ python pm_agent.py --slack

[Slack Digest] Fetching issues from JIRA project: KAN …
[Slack Digest] Fetched 8 issue(s). Sending to Claude for analysis …
[Slack Digest] Posting to Slack …
[Slack Digest] Digest sent to Slack!
```

Posted to Slack:

```
📋 *AI PM Sprint Digest — KAN | 8 issues*

*Top 3 Priorities Right Now*

• *KAN-1 – Build Claude API Integration* _(In Progress)_: Core engine of the sprint — primary focus until Done.
• *KAN-5 – Test Sprint Summary Output Quality* _(In Review)_: Closest to Done, pull it across the line today.
• *KAN-2 – Design Prompt Template* _(To Do)_: Hidden dependency on KAN-1; start in parallel now.

*Blockers & Risks*

• No assignees on any tickets — ownership is the single fastest fix for velocity loss.
• KAN-2 should be ahead of KAN-1, not behind it. Risk of rework if sequence isn't corrected.
• KAN-7 (Rate Limiting) unstarted — shipping without it creates a fragile integration.

*Suggested Next Actions*

• Assign every ticket — even self-assign on a solo project.
• Close KAN-5 today: assign a reviewer and get it to Done.
• Timebox KAN-2 to a few hours so KAN-1 has a stable prompt target.
```

### Mode 4 — Metrics anomaly detector

```
$ python pm_agent.py --metrics

[Metrics] Loading metrics.json …
[Metrics] Analysing 2025-W23 data for AI Workflow Agent …

======================================================================
  METRICS ANOMALY REPORT  |  AI Workflow Agent  |  2025-W23
======================================================================

  Health Score : 34 / 100
  Summary      : Severe product regression this week — DAU, velocity,
                 and resolution rate all collapsed while bugs and API
                 errors spiked sharply.

  Anomalies detected: 6

  [CRITICAL] daily_active_users
    Change  : ▼ 21.5%  (1580 → 1240)
    Cause   : Likely caused by a degraded onboarding or activation flow
              reducing new user retention.
    Action  : Audit the activation funnel in GA4 for drop-off points
              introduced this week.

  [CRITICAL] api_error_rate
    Change  : ▲ 166.7%  (0.03 → 0.08)
    Cause   : A recent deployment likely introduced a regression in an
              API endpoint under moderate load.
    Action  : Review error logs and recent deploys; rollback or hotfix
              the offending change immediately.

  [CRITICAL] sprint_velocity
    Change  : ▼ 25.0%  (24 → 18)
    Cause   : Team capacity loss or a high volume of unplanned work
              (bugs, incidents) crowding out sprint tickets.
    Action  : Hold a quick retrospective; identify what pulled the team
              off planned work and shield next sprint accordingly.

  [WARNING] ticket_resolution_rate
    Change  : ▼ 17.3%  (0.81 → 0.67)
    Cause   : Correlated with velocity drop — fewer tickets completed
              as a share of those attempted.
    Action  : Triage open tickets and close or defer anything that
              isn't sprint-critical.

  [WARNING] session_duration_avg_mins
    Change  : ▼ 22.0%  (4.1 → 3.2)
    Cause   : Users are finding less value per session, possibly due to
              reliability issues surfaced by the API error spike.
    Action  : Check if session drop correlates temporally with the API
              error increase.

  [POSITIVE] bug_open_count
    Change  : ▲ 75.0%  (8 → 14)
    Cause   : Bug count increase is directionally bad here despite the
              Positive label — flag for immediate triage.
    Action  : Assign owners to all 6 new bugs and assess severity
              before next sprint planning.

======================================================================

[Metrics] 3 Critical anomaly/anomalies found — sending Slack alert …
[Metrics] Slack alert sent!
```

---

## Tech stack

| | |
|---|---|
| Language | Python 3.11 |
| AI | Claude API — `claude-sonnet-4-6` (Anthropic) |
| Integrations | JIRA REST API v3, Slack Incoming Webhooks, GA4-compatible metrics |
| Scheduling | `schedule` library |
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
# For Slack modes, also add SLACK_WEBHOOK_URL
```

**3. Run**
```bash
python pm_agent.py            # sprint summary
python pm_agent.py --draft    # story drafter
python pm_agent.py --slack    # send digest to Slack now
python pm_agent.py --schedule # post to Slack every Monday at 09:00
python pm_agent.py --metrics  # metrics anomaly report
```

---

## Why I built this

Most AI demos are toys. This one is wired into real tools (JIRA) and produces output a PM would actually use.

It demonstrates AI-native product skills that matter right now:

- **MCP-style integrations** — connecting external APIs (JIRA) as context sources for LLM reasoning
- **Prompt engineering** — structuring retrieval output into a prompt that produces consistent, decision-ready analysis
- **Workflow automation** — replacing a manual standup-prep task with a single command

The goal was to show what happens when you treat AI as an integration layer, not just a chatbot.
