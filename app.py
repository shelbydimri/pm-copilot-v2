#!/usr/bin/env python3
"""
PM Copilot — Flask web UI.

Wraps all pm_agent modes in a browser interface.
Local:  python app.py
Deploy: PORT env var is respected for Railway / Render / Vercel.
"""

import os
import json
from html import escape

from flask import Flask, request

from pm_agent import (
    fetch_jira_issues,
    format_issues_for_prompt,
    generate_sprint_summary,
    generate_ticket_draft,
    create_jira_ticket,
    load_metrics,
    generate_anomaly_report,
    format_summary_for_slack,
    format_anomalies_for_slack,
    send_slack_digest,
    JIRA_PROJECT_KEY,
    CLAUDE_MODEL,
    SLACK_WEBHOOK_URL,
)

app = Flask(__name__)

# ─── Shared CSS ───────────────────────────────────────────────────────────────

CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0d1117;
  color: #e6edf3;
  min-height: 100vh;
}
nav {
  background: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  height: 56px;
}
.brand {
  font-weight: 700;
  font-size: 1.05rem;
  color: #e6edf3 !important;
  text-decoration: none;
  margin-right: 1.25rem;
}
nav a {
  color: #8b949e;
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}
nav a:hover { color: #e6edf3; background: #21262d; }
main { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem; }
h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.4rem; }
h2 { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.75rem; color: #c9d1d9; }
h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.3rem; }
.tagline { color: #8b949e; margin-bottom: 2.5rem; font-size: 0.95rem; }
.card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
.action-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 1.75rem 1.5rem;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: border-color 0.15s, background 0.15s;
  cursor: pointer;
}
.action-card:hover { border-color: #7c3aed; background: #1a1020; }
.action-card .icon { font-size: 1.8rem; margin-bottom: 0.65rem; }
.action-card h3 { font-size: 1rem; margin-bottom: 0.3rem; color: #e6edf3; }
.action-card p { font-size: 0.83rem; color: #8b949e; line-height: 1.5; }
button, .btn {
  background: #7c3aed;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.35rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background 0.15s;
}
button:hover, .btn:hover { background: #6d28d9; }
button:disabled { background: #373757; color: #8b949e; cursor: not-allowed; }
.btn-danger { background: #b91c1c; }
.btn-danger:hover { background: #991b1b; }
.btn-ghost {
  background: transparent;
  border: 1px solid #30363d;
  color: #c9d1d9;
}
.btn-ghost:hover { background: #21262d; }
.field { margin-bottom: 1.25rem; }
label { display: block; margin-bottom: 0.4rem; font-size: 0.85rem; color: #8b949e; }
textarea, input[type=text] {
  width: 100%;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  color: #e6edf3;
  padding: 0.7rem 0.9rem;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}
textarea:focus, input[type=text]:focus { border-color: #7c3aed; }
textarea { resize: vertical; min-height: 90px; }
.badge {
  display: inline-block;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
  border: 1px solid;
}
.badge-critical { background: #2d0f0f; color: #f85149; border-color: #6e1c1c; }
.badge-warning  { background: #2b1d00; color: #e3b341; border-color: #6e4c00; }
.badge-positive { background: #0b2416; color: #3fb950; border-color: #1a5c35; }
.badge-story { background: #0f1f3d; color: #79b8ff; border-color: #1a3a6e; }
.badge-task  { background: #0b2416; color: #3fb950; border-color: #1a5c35; }
.badge-bug   { background: #2d0f0f; color: #f85149; border-color: #6e1c1c; }
.priority-high   { color: #f85149; font-weight: 600; }
.priority-medium { color: #e3b341; font-weight: 600; }
.priority-low    { color: #3fb950; font-weight: 600; }
.score-wrap { margin: 1rem 0; }
.score-label { font-size: 2.5rem; font-weight: 700; line-height: 1; }
.score-bar-bg { background: #21262d; border-radius: 999px; height: 8px; margin-top: 0.6rem; }
.score-bar { height: 8px; border-radius: 999px; }
.anomaly-block {
  border-left: 3px solid;
  padding: 0.9rem 1.1rem;
  margin-bottom: 0.75rem;
  background: #0d1117;
  border-radius: 0 8px 8px 0;
}
.anomaly-block.critical { border-color: #f85149; }
.anomaly-block.warning  { border-color: #e3b341; }
.anomaly-block.positive { border-color: #3fb950; }
.anomaly-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; }
.anomaly-change { font-size: 0.82rem; color: #8b949e; }
.anomaly-detail { font-size: 0.86rem; color: #c9d1d9; margin-top: 0.25rem; }
.summary-text {
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.75;
  color: #c9d1d9;
  font-family: inherit;
}
.row { display: flex; align-items: baseline; gap: 0.6rem; margin-bottom: 0.5rem; }
.row-label { color: #8b949e; font-size: 0.82rem; min-width: 130px; flex-shrink: 0; }
.row-value { color: #e6edf3; font-size: 0.9rem; }
.ac-list { list-style: none; padding: 0; margin-top: 0.25rem; }
.ac-list li {
  padding: 0.35rem 0;
  font-size: 0.875rem;
  color: #c9d1d9;
  display: flex;
  gap: 0.5rem;
}
.ac-list li::before { content: "✓"; color: #3fb950; flex-shrink: 0; }
.alert {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}
.alert-success { background: #0b2416; border: 1px solid #1a5c35; color: #3fb950; }
.alert-error   { background: #2d0f0f; border: 1px solid #6e1c1c; color: #f85149; }
.loader { display: none; margin-top: 1.5rem; text-align: center; color: #8b949e; }
.spinner {
  border: 3px solid #30363d;
  border-top-color: #7c3aed;
  border-radius: 50%;
  width: 28px; height: 28px;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 0.6rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
.divider { border: none; border-top: 1px solid #30363d; margin: 1.5rem 0; }
.actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; align-items: center; }
.muted { color: #8b949e; font-size: 0.85rem; }
a.plain { color: #79b8ff; text-decoration: none; }
a.plain:hover { text-decoration: underline; }
"""

LOADING_JS = """
<script>
function showLoader(formId, btnId, loaderId, msg) {
  var form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', function() {
    var btn = document.getElementById(btnId);
    var loader = document.getElementById(loaderId);
    if (btn) { btn.disabled = true; btn.textContent = msg || 'Running…'; }
    if (loader) loader.style.display = 'block';
  });
}
</script>
"""

# ─── Layout helper ─────────────────────────────────────────────────────────────

def page(title: str, body: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PM Copilot — {escape(title)}</title>
  <style>{CSS}</style>
</head>
<body>
<nav>
  <a href="/" class="brand">⚡ PM Copilot</a>
  <a href="/summary">Sprint Summary</a>
  <a href="/draft">Draft Ticket</a>
  <a href="/slack">Slack Digest</a>
  <a href="/metrics">Metrics</a>
</nav>
<main>{body}</main>
{LOADING_JS}
</body>
</html>"""


def error_page(message: str) -> str:
    body = f"""
<h1>Something went wrong</h1>
<p class="tagline">An error occurred while processing your request.</p>
<div class="alert alert-error">{escape(message)}</div>
<a href="/" class="btn btn-ghost">← Back to home</a>
"""
    return page("Error", body)

# ─── Home ─────────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    body = """
<h1>PM Copilot</h1>
<p class="tagline">AI-powered JIRA tools — sprint summaries, ticket drafting, Slack digests, and metrics anomaly detection.</p>
<div class="grid">
  <a href="/summary" class="action-card">
    <div class="icon">📋</div>
    <h3>Sprint Summary</h3>
    <p>Fetch all JIRA issues and get a Claude-generated analysis: top priorities, blockers, stalled work, and next actions.</p>
  </a>
  <a href="/draft" class="action-card">
    <div class="icon">✏️</div>
    <h3>Draft a Ticket</h3>
    <p>Type a rough idea in plain English. Claude generates a structured JIRA ticket with acceptance criteria — then creates it live.</p>
  </a>
  <a href="/slack" class="action-card">
    <div class="icon">💬</div>
    <h3>Send Slack Digest</h3>
    <p>Generate the sprint summary and post it directly to your Slack channel via incoming webhook.</p>
  </a>
  <a href="/metrics" class="action-card">
    <div class="icon">📊</div>
    <h3>Metrics Report</h3>
    <p>Analyse week-over-week metrics from metrics.json. Claude flags Critical, Warning, and Positive anomalies with a health score.</p>
  </a>
</div>
"""
    return page("Dashboard", body)

# ─── Sprint Summary ────────────────────────────────────────────────────────────

@app.route("/summary", methods=["GET", "POST"])
def summary():
    if request.method == "GET":
        body = f"""
<h1>Sprint Summary</h1>
<p class="tagline">Fetches all issues from JIRA project <strong>{JIRA_PROJECT_KEY}</strong> and runs Claude analysis.</p>
<div class="card">
  <form method="POST" id="summary-form">
    <button id="summary-btn" type="submit">Run Sprint Summary</button>
  </form>
  <div class="loader" id="summary-loader">
    <div class="spinner"></div>
    Fetching JIRA issues and analysing with Claude…
  </div>
</div>
<script>showLoader('summary-form','summary-btn','summary-loader','Analysing…')</script>
"""
        return page("Sprint Summary", body)

    # POST — run the analysis
    try:
        issues = fetch_jira_issues()
    except SystemExit:
        return error_page("Could not fetch JIRA issues. Check JIRA_EMAIL and JIRA_API_TOKEN in your .env file.")

    try:
        summary_text = generate_sprint_summary(format_issues_for_prompt(issues))
    except Exception as exc:
        return error_page(f"Claude API error: {exc}")

    escaped = escape(summary_text)
    body = f"""
<h1>Sprint Summary</h1>
<p class="tagline">Project <strong>{JIRA_PROJECT_KEY}</strong> — {len(issues)} issues analysed &nbsp;·&nbsp; Model: {CLAUDE_MODEL}</p>
<div class="card">
  <div class="summary-text">{escaped}</div>
</div>
<div class="actions">
  <form method="POST"><button type="submit">Refresh</button></form>
  <a href="/" class="btn btn-ghost">← Home</a>
</div>
"""
    return page("Sprint Summary", body)

# ─── Draft Ticket ──────────────────────────────────────────────────────────────

@app.route("/draft", methods=["GET", "POST"])
def draft():
    # Step 3: create the ticket in JIRA
    if request.method == "POST" and request.form.get("action") == "create":
        raw = request.form.get("ticket_json", "")
        try:
            ticket = json.loads(raw)
        except json.JSONDecodeError:
            return error_page("Invalid ticket data. Please go back and try again.")

        try:
            url = create_jira_ticket(ticket)
        except SystemExit:
            return error_page("Could not create the JIRA ticket. Check your credentials.")

        if url:
            body = f"""
<h1>Ticket Created</h1>
<div class="alert alert-success">Ticket created successfully in JIRA project {JIRA_PROJECT_KEY}.</div>
<div class="card">
  <p style="margin-bottom:0.75rem">Your new ticket is live at:</p>
  <a class="plain" href="{escape(url)}" target="_blank" rel="noopener">{escape(url)}</a>
</div>
<div class="actions">
  <a href="/draft" class="btn">Draft another</a>
  <a href="/" class="btn btn-ghost">← Home</a>
</div>
"""
        else:
            body = """
<h1>Creation Failed</h1>
<div class="alert alert-error">JIRA returned an error. Check the terminal for details.</div>
<div class="actions">
  <a href="/draft" class="btn btn-ghost">← Try again</a>
</div>
"""
        return page("Ticket Created", body)

    # Step 2: generate the ticket from the idea
    if request.method == "POST" and request.form.get("action") == "generate":
        idea = request.form.get("idea", "").strip()
        if not idea:
            return _draft_form(error="Please enter an idea before submitting.")

        try:
            ticket = generate_ticket_draft(idea)
        except Exception as exc:
            return error_page(f"Claude API error: {exc}")

        if ticket is None:
            return error_page("Claude returned an invalid response. Please try again.")

        return _draft_preview(idea, ticket)

    # Step 1: show the input form
    return _draft_form()


def _draft_form(error: str = "") -> str:
    error_html = f'<div class="alert alert-error">{escape(error)}</div>' if error else ""
    body = f"""
<h1>Draft a Ticket</h1>
<p class="tagline">Describe your idea in plain English — Claude turns it into a structured JIRA ticket.</p>
{error_html}
<div class="card">
  <form method="POST" id="draft-form">
    <input type="hidden" name="action" value="generate">
    <div class="field">
      <label for="idea">Your idea</label>
      <textarea id="idea" name="idea" placeholder="e.g. users should be able to reset their password from the login page" rows="4"></textarea>
    </div>
    <button id="draft-btn" type="submit">Generate Ticket</button>
  </form>
  <div class="loader" id="draft-loader">
    <div class="spinner"></div>
    Generating ticket with Claude…
  </div>
</div>
<script>showLoader('draft-form','draft-btn','draft-loader','Generating…')</script>
"""
    return page("Draft Ticket", body)


def _draft_preview(idea: str, ticket: dict) -> str:
    issue_type = ticket.get("issue_type", "Story")
    priority   = ticket.get("priority", "Medium")
    badge_type = f"badge-{issue_type.lower()}"
    pri_class  = f"priority-{priority.lower()}"

    ac_items = "".join(
        f"<li>{escape(ac)}</li>"
        for ac in ticket.get("acceptance_criteria", [])
    )

    ticket_json = escape(json.dumps(ticket))

    body = f"""
<h1>Ticket Preview</h1>
<p class="tagline">Based on: <em>"{escape(idea)}"</em></p>
<div class="card">
  <div class="row"><span class="row-label">Title</span>
    <span class="row-value" style="font-weight:600">{escape(ticket.get('title',''))}</span></div>
  <div class="row"><span class="row-label">Type</span>
    <span class="badge {badge_type}">{escape(issue_type)}</span></div>
  <div class="row"><span class="row-label">Priority</span>
    <span class="row-value {pri_class}">{escape(priority)}</span>
    <span class="muted">— {escape(ticket.get('priority_reasoning',''))}</span></div>
  <hr class="divider">
  <div class="field">
    <label>Description</label>
    <p style="font-size:0.9rem;color:#c9d1d9;line-height:1.6">{escape(ticket.get('description',''))}</p>
  </div>
  <div class="field">
    <label>Acceptance Criteria</label>
    <ul class="ac-list">{ac_items}</ul>
  </div>
</div>
<div class="actions">
  <form method="POST">
    <input type="hidden" name="action" value="create">
    <input type="hidden" name="ticket_json" value="{ticket_json}">
    <button type="submit">Create in JIRA</button>
  </form>
  <a href="/draft" class="btn btn-ghost">← Start over</a>
</div>
"""
    return page("Ticket Preview", body)

# ─── Slack Digest ─────────────────────────────────────────────────────────────

@app.route("/slack", methods=["GET", "POST"])
def slack():
    if request.method == "GET":
        webhook_set = bool(SLACK_WEBHOOK_URL)
        warning = "" if webhook_set else '<div class="alert alert-error">SLACK_WEBHOOK_URL is not set in .env — the digest will not be delivered.</div>'
        body = f"""
<h1>Slack Digest</h1>
<p class="tagline">Generates the sprint summary and posts it to your Slack channel.</p>
{warning}
<div class="card">
  <form method="POST" id="slack-form">
    <button id="slack-btn" type="submit" {"disabled" if not webhook_set else ""}>Send Slack Digest</button>
  </form>
  <div class="loader" id="slack-loader">
    <div class="spinner"></div>
    Fetching issues and sending to Slack…
  </div>
</div>
<script>showLoader('slack-form','slack-btn','slack-loader','Sending…')</script>
"""
        return page("Slack Digest", body)

    # POST — fetch, summarise, send
    try:
        issues = fetch_jira_issues()
    except SystemExit:
        return error_page("Could not fetch JIRA issues. Check JIRA_EMAIL and JIRA_API_TOKEN in your .env file.")

    try:
        summary_text = generate_sprint_summary(format_issues_for_prompt(issues))
    except Exception as exc:
        return error_page(f"Claude API error: {exc}")

    slack_text = format_summary_for_slack(summary_text, len(issues))
    success = send_slack_digest(slack_text)

    status_html = (
        '<div class="alert alert-success">Digest sent to Slack!</div>'
        if success else
        '<div class="alert alert-error">Slack delivery failed. Check SLACK_WEBHOOK_URL and your internet connection.</div>'
    )

    escaped = escape(summary_text)
    body = f"""
<h1>Slack Digest</h1>
{status_html}
<div class="card">
  <h2>Summary sent</h2>
  <div class="summary-text">{escaped}</div>
</div>
<div class="actions">
  <form method="POST"><button type="submit">Send again</button></form>
  <a href="/" class="btn btn-ghost">← Home</a>
</div>
"""
    return page("Slack Digest", body)

# ─── Metrics ──────────────────────────────────────────────────────────────────

@app.route("/metrics", methods=["GET", "POST"])
def metrics():
    if request.method == "GET":
        body = """
<h1>Metrics Report</h1>
<p class="tagline">Loads <code>metrics.json</code> and runs Claude anomaly detection on week-over-week changes.</p>
<div class="card">
  <form method="POST" id="metrics-form">
    <button id="metrics-btn" type="submit">Run Metrics Report</button>
  </form>
  <div class="loader" id="metrics-loader">
    <div class="spinner"></div>
    Analysing metrics with Claude…
  </div>
</div>
<script>showLoader('metrics-form','metrics-btn','metrics-loader','Analysing…')</script>
"""
        return page("Metrics", body)

    # POST — load and analyse
    try:
        metrics_data = load_metrics()
    except SystemExit:
        return error_page("metrics.json not found or invalid. Make sure the file exists in the project root.")

    try:
        report = generate_anomaly_report(metrics_data)
    except Exception as exc:
        return error_page(f"Claude API error: {exc}")

    if report is None:
        return error_page("Claude returned an invalid response. Please try again.")

    return _metrics_report(report)


def _metrics_report(report: dict) -> str:
    score    = report.get("health_score", 0)
    summary  = report.get("health_summary", "")
    week     = report.get("week", "")
    product  = report.get("product", "")
    anomalies = report.get("anomalies", [])

    # Score bar colour
    if score >= 67:
        bar_color = "#3fb950"
    elif score >= 34:
        bar_color = "#e3b341"
    else:
        bar_color = "#f85149"

    score_color = bar_color

    # Build anomaly blocks
    anomaly_html = ""
    for a in anomalies:
        sev       = a.get("severity", "Warning")
        sev_lower = sev.lower()
        direction = "▲" if a.get("pct_change", 0) > 0 else "▼"
        pct       = abs(a.get("pct_change", 0))
        anomaly_html += f"""
<div class="anomaly-block {sev_lower}">
  <div class="anomaly-header">
    <span class="badge badge-{sev_lower}">{escape(sev)}</span>
    <h3>{escape(a.get('metric',''))}</h3>
  </div>
  <div class="anomaly-change">{direction} {pct}% &nbsp;·&nbsp; {escape(str(a.get('previous','')))} → {escape(str(a.get('current','')))}</div>
  <div class="anomaly-detail"><strong>Cause:</strong> {escape(a.get('root_cause',''))}</div>
  <div class="anomaly-detail"><strong>Action:</strong> {escape(a.get('recommended_action',''))}</div>
</div>"""

    if not anomaly_html:
        anomaly_html = '<p class="muted">No anomalies detected — all metrics within 10% of last week.</p>'

    criticals = [a for a in anomalies if a.get("severity") == "Critical"]
    slack_note = ""
    if criticals and SLACK_WEBHOOK_URL:
        alert_text = format_anomalies_for_slack(report)
        sent = send_slack_digest(alert_text)
        slack_note = (
            f'<div class="alert alert-success">{len(criticals)} Critical anomaly/anomalies detected — Slack alert sent.</div>'
            if sent else
            '<div class="alert alert-error">Critical anomalies found but Slack delivery failed.</div>'
        )
    elif criticals:
        slack_note = f'<div class="alert alert-error">{len(criticals)} Critical anomaly/anomalies detected. Set SLACK_WEBHOOK_URL in .env to enable automatic Slack alerts.</div>'

    body = f"""
<h1>Metrics Report</h1>
<p class="tagline">{escape(product)} &nbsp;·&nbsp; {escape(week)}</p>
{slack_note}
<div class="card">
  <h2>Health Score</h2>
  <div class="score-wrap">
    <span class="score-label" style="color:{bar_color}">{score}<span style="font-size:1.2rem;color:#8b949e"> / 100</span></span>
    <div class="score-bar-bg">
      <div class="score-bar" style="width:{score}%;background:{bar_color}"></div>
    </div>
    <p style="margin-top:0.5rem;font-size:0.875rem;color:#8b949e">{escape(summary)}</p>
  </div>
</div>
<div class="card">
  <h2>Anomalies &nbsp;<span class="muted" style="font-weight:400;font-size:0.85rem">{len(anomalies)} flagged</span></h2>
  {anomaly_html}
</div>
<div class="actions">
  <form method="POST"><button type="submit">Refresh</button></form>
  <a href="/" class="btn btn-ghost">← Home</a>
</div>
"""
    return page("Metrics Report", body)

# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
