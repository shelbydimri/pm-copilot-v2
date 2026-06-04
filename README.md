# PM Copilot — AI-powered JIRA toolkit

Three CLI tools that replace common PM busywork: sprint summaries, ticket drafting, and Slack digests — powered by Claude.

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

---

## Tech stack

| | |
|---|---|
| Language | Python 3.11 |
| AI | Claude API — `claude-sonnet-4-6` (Anthropic) |
| Integrations | JIRA REST API v3, Slack Incoming Webhooks |
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
```

---

## Why I built this

Most AI demos are toys. This one is wired into real tools (JIRA) and produces output a PM would actually use.

It demonstrates AI-native product skills that matter right now:

- **MCP-style integrations** — connecting external APIs (JIRA) as context sources for LLM reasoning
- **Prompt engineering** — structuring retrieval output into a prompt that produces consistent, decision-ready analysis
- **Workflow automation** — replacing a manual standup-prep task with a single command

The goal was to show what happens when you treat AI as an integration layer, not just a chatbot.
