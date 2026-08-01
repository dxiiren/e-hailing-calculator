# E-Hailing Financial Calculator

A single-page financial planning calculator for e-hailing drivers. Enter your usual fuel
spend, the distance that fuel covers, and your earnings per km; pick one or more monthly
net-income targets and working-day counts (presets or custom), and the app computes the
required km/day plus gross earnings per day and month for every combination — in a sortable
table you can export to PDF. Bilingual UI (English / Bahasa Melayu) via vue-i18n. One
`index.html` + `app.js`, every library loaded from a CDN — no build step, no backend.

> **New developer? Start with [`.docs/tldr.md`](.docs/tldr.md)** — every doc summarised on one
> page. The full guide lives in [`.docs/`](.docs/README.md).

## Prerequisites

| Tool | Version | Installed by |
| --- | --- | --- |
| PowerShell + winget | Windows 10/11 stock | — (the only true prerequisites) |
| Git | any recent | `setup.ps1` (winget) |
| Node.js | LTS | `setup.ps1` (winget) — needed only for the Claude Code CLI |
| uv + Python | latest | `setup.ps1` — serves the site (`python -m http.server`) |
| just | any recent | `setup.ps1` |
| Claude Code CLI | latest | `setup.ps1` (optional, for AI-assisted dev) |

## Quick start

```powershell
# 1. One-time machine setup (idempotent — safe to re-run)
pwsh ./setup.ps1

# 2. Close and reopen PowerShell so PATH updates land
# 3. Serve the calculator (background window)
just start

# 4. Open it in the default browser
just open
```

The app is now at **http://127.0.0.1:8118**. Stop it with `just stop`.

## Commands

Run `just` with no arguments to list every recipe. The ones you'll use daily:

| Command | What it does |
| --- | --- |
| `just start` | Serve on http://127.0.0.1:8118 in a background window (stops any previous run first) |
| `just serve` | Serve in the foreground (Ctrl+C to stop) |
| `just stop` | Kill only this repo's python server (path-scoped — other projects unaffected) |
| `just open` | Open http://127.0.0.1:8118 in the default browser |
| `just claudex` | Launch Claude Code (Sonnet, all permissions) |

## Troubleshooting

### `just` or `uv` is not recognized

`setup.ps1` finished but the current shell still has the old PATH. Close and reopen
PowerShell, then run the command again. If it persists, re-run `pwsh ./setup.ps1`.

### Port 8118 is already in use

A previous server from this repo is still running. `just stop` kills it (path-scoped, so other
projects' servers survive). `just start` also runs `stop` first automatically.

### The page loads but is blank or unstyled

Every library (Vue, vue-i18n, Tailwind, jsPDF, Font Awesome) loads from a CDN at page load.
With no internet the local server still returns 200 but the app never mounts and the page
renders unstyled. Reconnect and reload.

### The table shows negative "Required KM/Day"

Not a server problem — the math has no unprofitability guard. If fuel cost per km is greater
than or equal to earnings per km, net per km goes non-positive and `requiredKM` flips sign.
Enter profitable values (defaults: RM 60 fuel / 400 km / RM 0.70 per km).

More in [`.docs/06-troubleshooting/common-issues.md`](.docs/06-troubleshooting/common-issues.md).

## Project layout

```
e-hailing-cal/
  index.html      # UI markup — Vue template, Tailwind classes, CDN <script> tags
  app.js          # Vue 3 app — i18n messages, reactive inputs, calculator math, PDF export
  justfile        # dev recipes: start / serve / stop / open
  setup.ps1       # one-time machine bootstrap (idempotent)
  README.md
  CLAUDE.md
  .mcp.json.stub  # committed MCP placeholders (real .mcp.json is git-ignored)
  .docs/          # numbered developer documentation
  .claude/        # skills, hooks, settings, memory
```
