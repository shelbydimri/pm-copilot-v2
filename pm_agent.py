#!/usr/bin/env python3
"""
PM Workflow Automator — AI-powered sprint summary generator.

Fetches all issues from a JIRA project and sends them to Claude,
which returns a structured sprint summary with priorities, blockers,
in-progress/stalled breakdown, and recommended next actions.
"""

import os
import sys

# Ensure Unicode output works on Windows terminals (cp1252 → utf-8).
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import requests
from dotenv import load_dotenv
import anthropic

# ─── Config ───────────────────────────────────────────────────────────────────

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
JIRA_EMAIL       = os.getenv("JIRA_EMAIL")
JIRA_API_TOKEN   = os.getenv("JIRA_API_TOKEN")

JIRA_DOMAIN      = "saranshsworkspace-35970721.atlassian.net"
JIRA_PROJECT_KEY = "KAN"
CLAUDE_MODEL     = "claude-sonnet-4-6"

# ─── Validation ───────────────────────────────────────────────────────────────

def validate_env() -> None:
    """Exit early with a clear message if any required variable is missing."""
    missing = [v for v in ("ANTHROPIC_API_KEY", "JIRA_EMAIL", "JIRA_API_TOKEN")
               if not os.getenv(v)]
    if missing:
        print(f"[error] Missing environment variables: {', '.join(missing)}")
        print("        Copy .env.example → .env and fill in your credentials.")
        sys.exit(1)

# ─── JIRA ─────────────────────────────────────────────────────────────────────

def fetch_jira_issues() -> list[dict]:
    """
    Query the JIRA REST API v3 for all issues in the KAN project.

    Returns a list of raw issue dicts sorted by priority (descending)
    and most-recently-updated first.
    """
    url     = f"https://{JIRA_DOMAIN}/rest/api/3/search/jql"
    auth    = (JIRA_EMAIL, JIRA_API_TOKEN)
    headers = {"Accept": "application/json"}
    params  = {
        "jql":       f"project = {JIRA_PROJECT_KEY} ORDER BY priority DESC, updated DESC",
        "fields":    "summary,status,issuetype,priority,assignee,description",
        "maxResults": 100,
    }

    try:
        response = requests.get(url, auth=auth, headers=headers, params=params, timeout=15)
        response.raise_for_status()
    except requests.exceptions.HTTPError as exc:
        print(f"[error] JIRA API returned an error: {exc}")
        sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("[error] Could not reach JIRA. Check your domain and internet connection.")
        sys.exit(1)
    except requests.exceptions.Timeout:
        print("[error] JIRA request timed out. Try again in a moment.")
        sys.exit(1)

    issues = response.json().get("issues", [])

    if not issues:
        print(f"[info] No issues found in project {JIRA_PROJECT_KEY}. Nothing to summarize.")
        sys.exit(0)

    return issues


def format_issues_for_prompt(issues: list[dict]) -> str:
    """
    Convert raw JIRA issue objects into a compact, readable bullet list
    that fits neatly inside the Claude prompt.
    """
    lines = []
    for issue in issues:
        fields       = issue.get("fields", {})
        key          = issue.get("key", "???")
        summary      = fields.get("summary", "No summary")
        status       = (fields.get("status") or {}).get("name", "Unknown")
        issue_type   = (fields.get("issuetype") or {}).get("name", "Unknown")
        priority     = (fields.get("priority") or {}).get("name", "None")
        assignee_obj = fields.get("assignee") or {}
        assignee     = assignee_obj.get("displayName", "Unassigned")

        lines.append(
            f"- [{key}] {summary} "
            f"| Type: {issue_type} | Status: {status} "
            f"| Priority: {priority} | Assignee: {assignee}"
        )

    return "\n".join(lines)

# ─── Claude ───────────────────────────────────────────────────────────────────

# The system prompt is stable across every run, so we mark it with
# cache_control so the Anthropic API can serve it from the prompt cache
# on repeated invocations — saving tokens and latency.
SYSTEM_PROMPT = (
    "You are an experienced Product Manager and Agile coach. "
    "You analyze JIRA sprint data and produce clear, actionable summaries "
    "for development teams. Your output is direct, practical, and helps the "
    "team focus on what matters most right now."
)


def generate_sprint_summary(issues_text: str) -> str:
    """
    Send the formatted issue list to Claude and return the sprint summary.

    The system prompt is cached with ephemeral cache_control so that
    repeated runs don't re-process the same stable instructions.
    """
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    user_message = f"""Here are the current issues from our JIRA project ({JIRA_PROJECT_KEY}):

{issues_text}

Please provide a structured sprint summary with these four sections:

## Top 3 Priorities Right Now
List the 3 most important issues the team should focus on immediately, with brief reasoning.

## Blockers & Risks
Identify potential blockers, high-priority bugs, or risks that could derail the sprint.

## In Progress vs Stalled
Categorize what is actively moving forward versus what appears stuck or needs attention.

## Suggested Next Actions
Give 3–5 concrete, actionable recommendations for the team to improve velocity or address risks.

Keep the summary concise and actionable. Use bullet points where appropriate."""

    response = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1500,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                # Cache the stable system prompt across repeated runs.
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_message}],
    )

    return response.content[0].text

# ─── Output ───────────────────────────────────────────────────────────────────

def print_summary(summary: str, issue_count: int) -> None:
    """Render the sprint summary with clean section headers in the terminal."""
    width = 70
    divider = "-" * width

    print(f"\n{'=' * width}")
    print(f"  AI PM SPRINT SUMMARY  |  Project: {JIRA_PROJECT_KEY}  |  {issue_count} issues analyzed")
    print(f"{'=' * width}\n")
    print(summary)
    print(f"\n{divider}")
    print(f"  Model: {CLAUDE_MODEL}")
    print(f"{divider}\n")

# ─── Entry point ──────────────────────────────────────────────────────────────

def main() -> None:
    print(f"\n[PM Agent] Starting up …")

    validate_env()

    print(f"[PM Agent] Fetching issues from JIRA project: {JIRA_PROJECT_KEY} …")
    issues = fetch_jira_issues()
    print(f"[PM Agent] Fetched {len(issues)} issue(s). Sending to Claude for analysis …")

    issues_text = format_issues_for_prompt(issues)

    try:
        summary = generate_sprint_summary(issues_text)
    except anthropic.AuthenticationError:
        print("[error] Invalid ANTHROPIC_API_KEY. Check your .env file.")
        sys.exit(1)
    except anthropic.APIError as exc:
        print(f"[error] Claude API error: {exc}")
        sys.exit(1)

    print_summary(summary, len(issues))


if __name__ == "__main__":
    main()
