# AI PM Workflow Automator

A Python CLI tool that pulls all issues from a JIRA project and uses Claude to generate a structured sprint summary — priorities, blockers, in-progress vs. stalled work, and concrete next actions for the team.

Built as a portfolio project demonstrating AI-powered product management tooling.

---

## What it does

1. **Fetches** all issues from the configured JIRA project (summary, status, issue type, priority, assignee) via the JIRA REST API v3.
2. **Sends** them to Claude (`claude-sonnet-4-20250514`) using the Anthropic Python SDK.
3. **Returns** a clean, structured sprint summary with four sections:
   - Top 3 priorities right now
   - Blockers & risks
   - In progress vs. stalled
   - Suggested next actions
4. **Prints** the summary to the terminal with readable section headers.

---

## Setup

### 1. Clone / download the project

```bash
git clone <your-repo-url>
cd PM_copilot
```

### 2. Create a virtual environment and install dependencies

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

### 3. Configure credentials

```bash
cp .env.example .env
```

Open `.env` and fill in the three values:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `JIRA_EMAIL` | Your Atlassian account email |
| `JIRA_API_TOKEN` | [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens) |

> **Never commit `.env`** — it is already in `.gitignore`.

---

## Run

```bash
python pm_agent.py
```

Example output:

```
[PM Agent] Starting up …
[PM Agent] Fetching issues from JIRA project: KAN …
[PM Agent] Fetched 12 issue(s). Sending to Claude for analysis …

══════════════════════════════════════════════════════════════════════
  AI PM SPRINT SUMMARY  ·  Project: KAN  ·  12 issues analyzed
══════════════════════════════════════════════════════════════════════

## Top 3 Priorities Right Now
...

## Blockers & Risks
...

## In Progress vs Stalled
...

## Suggested Next Actions
...

──────────────────────────────────────────────────────────────────────
  Model: claude-sonnet-4-20250514
──────────────────────────────────────────────────────────────────────
```

---

## Project structure

```
PM_copilot/
├── pm_agent.py       # Main script
├── requirements.txt  # Dependencies
├── .env.example      # Credential template
├── .env              # Your credentials (git-ignored)
├── .gitignore
└── README.md
```

---

## How it works

```
pm_agent.py
  │
  ├─ validate_env()            Check all credentials are present
  │
  ├─ fetch_jira_issues()       GET /rest/api/3/search  →  raw issue list
  │
  ├─ format_issues_for_prompt() Convert issues to a compact bullet list
  │
  ├─ generate_sprint_summary()  POST to Anthropic Messages API
  │   └─ System prompt cached with cache_control: ephemeral
  │      (saves tokens on repeated runs)
  │
  └─ print_summary()           Render the result to the terminal
```

The system prompt is marked with `cache_control: ephemeral` so the Anthropic API can serve it from cache on repeated runs — reducing both latency and token cost.

---

## Customisation

- **Different JIRA project** — change `JIRA_PROJECT_KEY` in `pm_agent.py`
- **Different JIRA domain** — change `JIRA_DOMAIN` in `pm_agent.py`
- **Different model** — change `CLAUDE_MODEL` in `pm_agent.py`
- **More issues** — increase `maxResults` in `fetch_jira_issues()`
- **Different summary format** — edit the `user_message` string inside `generate_sprint_summary()`

---

## Requirements

- Python 3.10+
- A JIRA Cloud account with API access
- An Anthropic API key
