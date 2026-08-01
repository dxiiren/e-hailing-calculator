# Getting started

> **TL;DR** `pwsh ./setup.ps1` once, reopen PowerShell, `just start`, `just open`. The
> calculator is at `http://127.0.0.1:8118`. The script is idempotent — re-run it any time.

## Prerequisites

A stock Windows 10/11 machine with PowerShell and winget. Nothing else — `setup.ps1` installs
the rest.

## Step 1 — run the bootstrap

```powershell
pwsh ./setup.ps1
```

What it installs (skipping anything already present, printing `[OK]` for each):

| # | Tool | Why this repo needs it |
| --- | --- | --- |
| 1 | Git | version control |
| 2 | Node.js LTS | only for the Claude Code CLI (npm) — the app itself uses no Node |
| 3 | Claude Code CLI | AI-assisted development (optional to use) |
| 4 | uv | Python manager/runner — supplies the serving Python |
| 5 | Python (via uv) | `python -m http.server` serves the site; also runs `.claude` tooling |
| 6 | just | the task runner behind every day-2 command |
| 7 | GitHub CLI (`gh`) | used by the `/create-pr` and `/commit` skills |
| 8 | `.mcp.json` seed | copies `.mcp.json.stub` → `.mcp.json` (git-ignored) if missing |

## Step 2 — reopen PowerShell

PATH changes land in *new* shells. Close and reopen PowerShell (skipping this is the #1
cause of "`just` is not recognized").

## Step 3 — serve and open

```powershell
just start   # serves http://127.0.0.1:8118 in a background window
just open    # opens it in your default browser
```

You should see the calculator with its defaults (RM 60 fuel / 400 km / RM 0.70 per km) and a
populated results table. Switch the top-right dropdown to Bahasa Melayu to sanity-check i18n.

**Internet required at page load** — Vue, vue-i18n, Tailwind, jsPDF, and Font Awesome all
come from CDNs. A 200 from the local server with a blank page means the CDNs didn't load.

## Step 4 — optional extras

- `claude` — log in to Claude Code the first time.
- `gh auth login` — authenticate the GitHub CLI once (needed for `/create-pr`).
- Fill the GitHub PAT placeholder in `.mcp.json` if you want the GitHub MCP server.

## Verifying the install

Re-run `pwsh ./setup.ps1` — every step should print `[OK]` and the final verification list
should show all seven tools present. Then:

```powershell
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:8118/index.html   # → 200
just stop
```

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [../03-development/workflow.md](../03-development/workflow.md) | What to do after setup — the daily loop |
| [../05-reference/commands.md](../05-reference/commands.md) | Every `just` recipe |
| [../06-troubleshooting/common-issues.md](../06-troubleshooting/common-issues.md) | When a step doesn't go as written |
