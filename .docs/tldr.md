# TL;DR — every doc in 30 seconds

One paragraph per document. Read this page first; follow the links only where you need depth.

## [01-overview/project-overview.md](01-overview/project-overview.md)

The repo is one `index.html` + one `app.js`: a financial planning calculator for e-hailing
drivers. You enter your usual fuel spend (RM), how far that fuel takes you (km), and what you
earn per km; you pick one or more monthly net-income targets (RM 3,500 / 4,000 / custom) and
working-day counts (20 / 24 / custom), and it computes required km/day, gross/day, and
gross/month for every combination in a sortable, PDF-exportable table. Vue 3 + vue-i18n
(English / Bahasa Melayu) + Tailwind + jsPDF, all from CDNs — no build step, no backend.

## [01-overview/architecture.md](01-overview/architecture.md)

`index.html` holds the Vue template (a teal hero header, Tailwind-classed inputs, two chip
toggle groups, the results card) and the CDN `<script>` tags; `app.js` holds everything else — the `en`/`ms` i18n message
trees, the reactive refs, and a chain of computed properties: `costPerKm` = fuel cost / fuel km,
net per km = earnings per km − cost per km, `requiredKM` = ceil(net per day / net per km), then
gross/day and gross/month. `targetCombinations` is the cartesian product of selected incomes ×
selected days; `sortedCombinations` sorts it; `exportPDF()` renders the same rows via
jsPDF + autotable.

## [02-setup/getting-started.md](02-setup/getting-started.md)

Run `pwsh ./setup.ps1` once on a fresh PC — it installs Git, Node (only for the Claude Code
CLI), uv + Python, just, gh, and seeds `.mcp.json` from the stub. Close and reopen PowerShell,
then `just start` serves the calculator at `http://127.0.0.1:8118` and `just open` opens it.
The script is idempotent — re-running prints `[OK]` for everything already present.

## [03-development/workflow.md](03-development/workflow.md)

The loop is: edit `index.html` or `app.js`, reload the browser, verify. No compile, no hot
reload — the server serves the files as-is. UI strings go through `$t()` and must exist in both
the `en` and `ms` trees; new reactive state must be returned from `setup()`. Branch off `main`
for non-trivial work, commit with Conventional Commits (no attribution footers), PR into `main`
with `/create-pr`. The `.claude/skills/` catalog (`/commit`, `/lint-check`, `/pre-pr-review`,
...) automates the routine parts.

## [04-deployment/deployment.md](04-deployment/deployment.md)

There is no deployment. No CI/CD, no hosting target — the calculator runs locally via
`just start`, and that is the intended state. The doc lists low-effort options (GitHub Pages,
any static host) if publishing is ever wanted, and the one caveat (the page needs internet for
its CDN libraries wherever it is hosted).

## [05-reference/commands.md](05-reference/commands.md)

`just start` (serve :8118 in the background, auto-stopping any previous run), `just serve`
(foreground), `just stop` (kill only this repo's python server — path-scoped), `just open`
(browser), plus `just claudex`/`claudeo`/`claudeh` to launch Claude Code. Run bare `just` to
list everything.

## [05-reference/project-layout.md](05-reference/project-layout.md)

`index.html` (template + CDN tags) and `app.js` (i18n + state + math + PDF export) are the
entire app. Everything else is tooling: `justfile` (recipes), `setup.ps1` (bootstrap),
`.mcp.json.stub` (committed MCP placeholders), `.claude/` (skills, hooks, settings, memory),
`.docs/` (this documentation), `README.md` + `CLAUDE.md` at the root.

## [06-troubleshooting/common-issues.md](06-troubleshooting/common-issues.md)

The recurring issues are environmental, not code: a stale PATH after `setup.ps1` (reopen
PowerShell), port 8118 held by a previous serve (`just stop`), a server window that outlived
its session (`just stop` again — it is path-scoped and safe), a blank/unstyled page when
offline (the CDN libraries never loaded), and the historical negative "Required KM/Day" rows
from unprofitable inputs — fixed test-first in v2 (the app now shows a warning banner; if you
still see negative distances you are on a pre-v2 checkout).

## [07-faq/faq.md](07-faq/faq.md)

Why no build step (the Vue global build runs straight off a `<script>` tag), why Python serves
it (stdlib, zero config, comes with uv), why port 8118 (each local repo gets a unique assigned
port; never 8000), how the money math works (net target ÷ days ÷ net-per-km, rounded up), and
how to add a third language (one more message tree in `app.js` + one `<option>`).
