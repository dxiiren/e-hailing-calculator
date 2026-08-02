# CLAUDE.md — e-hailing-cal

> Human-facing developer docs live in [`.docs/`](./.docs/README.md) — start at
> [`.docs/tldr.md`](./.docs/tldr.md). Keep them in sync when changing behavior they document.

## Project: E-Hailing Financial Calculator

A single-page financial planning calculator for e-hailing drivers. Enter your usual fuel
spend, the distance that fuel covers, and your earnings per km; pick one or more monthly
net-income targets and working-day counts (presets or custom), and the app computes the
required km/day plus gross earnings per day and month for every combination — in a sortable
table you can export to PDF. Bilingual UI (English / Bahasa Melayu) via vue-i18n.

- **Repo:** GitHub — `github.com/dxiiren/e-hailing-cal`
- **Live demo:** https://e-hailing-cal.vercel.app (static hosting of the same files).
  Locally, `just start` serves on `http://127.0.0.1:8118`.

### Tech Stack Quick Reference

| Layer | Technology | Key details |
| --- | --- | --- |
| UI framework | Vue 3 (global build, CDN) | Composition API in `app.js`; mounts on `#app` |
| i18n | vue-i18n 9 (CDN) | `en` + `ms` message trees at the top of `app.js`; locale `<select>` in the header |
| Styling | Tailwind CSS (CDN Play build) + Font Awesome 6.7.2 | Utility classes inline in `index.html`; FA carets show sort direction |
| PDF export | jsPDF 2.5.1 + jspdf-autotable 3.5.29 (CDN) | `exportPDF()` saves `financial_calculator.pdf` |
| Calculator math | `lib/calc.js` (pure ES module) | Imported by `app.js` (script is `type="module"`) and by the tests |
| Tests | Vitest (dev-only npm dependency) | `just test` (or `npm test`); suite in `tests/calc.test.js`; no build step for the app itself |
| Serving | `python -m http.server` via uv | `just start` on 127.0.0.1:8118; no build step, no backend; `package.json` exists only for the Vitest harness |

### Project Structure

```
e-hailing-cal/
  index.html      # UI markup — Vue template, Tailwind classes, CDN <script> tags
  app.js          # Vue 3 app — i18n messages, reactive inputs, PDF export (ES module)
  lib/calc.js     # pure calculator math — imported by app.js and the tests
  tests/          # Vitest suite: regression pins, unprofitability guard, edge inputs
  docs/images/    # README screenshot
  package.json    # dev-only test harness (vitest devDependency; node_modules git-ignored)
  justfile        # dev recipes: start / serve / stop / open / test
  setup.ps1       # one-time machine bootstrap (idempotent)
  README.md
  CLAUDE.md
  .mcp.json.stub  # committed MCP placeholders (real .mcp.json is git-ignored)
  .docs/          # numbered developer documentation
  .claude/        # skills, hooks, settings, memory
```

## Git Commits

- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:` ...).
- **NEVER** add `Co-Authored-By` lines or "Generated with Claude Code" / session-link footers to
  **any** outward artifact — commit messages, PR descriptions, or issue comments.
- Commit author email for this repo is `mohdakmal875@gmail.com` (set repo-locally).
- Only stage and commit files relevant to the change. **Never auto-commit** after a fix — the
  developer says "commit" first.

## Local Development

- One-time machine setup: `pwsh ./setup.ps1` (idempotent — installs Git, Node LTS (for the
  Claude Code CLI), uv + Python (serves the site), just, the Claude Code CLI). Then run
  `just start`.
- All day-2 commands are `just` recipes — run `just` to list them. Never invent an alternative
  command for something a recipe already covers.
- `just stop` kills only THIS repo's server processes (matched by repo path on the command
  line) — safe to run while other projects are serving.
- Every library (Vue, vue-i18n, Tailwind, jsPDF, Font Awesome) loads from a CDN at page load —
  with no internet the page renders blank/unstyled even though the local server is up.
- Tailwind is the CDN Play build — the browser console warns it is not for production. That is
  expected for this repo, not a bug.
- The math IS guarded against unprofitable inputs (fixed in v2, test-first): if fuel cost per
  km >= earnings per km, `computeRequirement()` returns `unprofitable: true` with null figures
  and the UI shows a bilingual warning banner — it never returns a negative `requiredKM`.
  Guard lives in `lib/calc.js`; tests in `tests/calc.test.js`; run `just test` before touching
  the math (see `.docs/06-troubleshooting/common-issues.md`).

## Project Skills

Development skills live in `.claude/skills/` — check `.claude/skills/README.md` for the catalog
and **follow the relevant skill before writing code**. Notables: `/commit`, `/create-pr`,
`/pre-pr-review`, `/lint-check`, `/claude-transfer`, `/llm-transfer`, `/define-goal`,
`/setup-mcp`, `/test-all-mcp`, `/audit-skills`.

## MCP Servers

Wired via the committed-stub + git-ignored-secret pattern: `.mcp.json.stub` (committed,
placeholders) → `.mcp.json` (git-ignored, real — seeded by `setup.ps1`). Turnkey: `context7`
(library docs — call `resolve-library-id` then `query-docs` instead of recalling APIs),
`playwright` (drive a real browser). Per-dev: `github` (fill the PAT in `.mcp.json`).
Health check: `/test-all-mcp`. Fall back to native tools silently if a server is unavailable.

## Memory

Lightweight, single-developer, file-based project memory at `.claude/memory/`:

- **`MEMORY.md`** is the index (one line per memory: `- [Title](file.md) — hook`), loaded each
  session.
- Each memory is **one fact in its own `*.md` file** with frontmatter (`name`, `description`,
  `metadata.type` = `reference` | `feedback` | `project`). Read the fact file on demand when its
  index hook is relevant.
- After writing a fact file, add its one-line pointer to `MEMORY.md`. Update rather than
  duplicate; delete a memory that turns out wrong. Don't store what the repo already records.
