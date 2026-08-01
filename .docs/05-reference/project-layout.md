# Project layout

> **TL;DR** Two files are the app (`index.html`, `app.js`); everything else is tooling,
> documentation, or Claude Code configuration.

```
e-hailing-cal/
  index.html          # THE APP's markup — Vue template, Tailwind classes, CDN <script> tags
  app.js              # THE APP's logic — i18n messages (en/ms), reactive state, money math,
                      #   sorting, jsPDF export
  justfile            # dev recipes: start / serve / stop / open / claudex|o|h
  setup.ps1           # one-time machine bootstrap (idempotent; see 02-setup)
  README.md           # front door: what it is, quick start, commands, troubleshooting
  CLAUDE.md           # AI-assistant instructions: stack facts, conventions, skills, memory
  .gitignore          # ignores per-dev secrets: .mcp.json, settings.local.json, workspace/
  .mcp.json.stub      # committed MCP config placeholders (real .mcp.json is git-ignored)
  .docs/              # this documentation tree (01-overview ... 07-faq + tldr.md)
  .claude/
    skills/           # 10 project skills (commit, create-pr, pre-pr-review, lint-check,
                      #   setup-mcp, test-all-mcp, audit-skills, define-goal,
                      #   claude-transfer, llm-transfer) + README.md catalog
    hooks/
      statusline.py   # custom Claude Code status line (repo, branch, model)
    memory/
      MEMORY.md       # project memory index (one line per stored fact)
    settings.json     # committed Claude Code settings: statusline wiring, permission
                      #   allowlist, enabled MCP servers
```

## Files git ignores (never commit)

| Path | Why |
| --- | --- |
| `.mcp.json` | Holds the real GitHub PAT — the committed `.stub` is the template |
| `.claude/settings.local.json` | Per-developer setting overrides |
| `.claude/workspace/` | Generated reports (pre-pr reviews, transfers) |

## Where things you'll look for actually live

| Looking for... | It's in |
| --- | --- |
| A UI label (either language) | `app.js` → `messages.en` / `messages.ms` |
| The money math | `app.js` → `targetCombinations` computed |
| The results-table markup | `index.html` → `#resultsTable` |
| The PDF columns | `app.js` → `exportPDF()` |
| The serve port (8118) | `justfile` → `port :=` line |
| The tool bootstrap | `setup.ps1` |

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [../01-overview/architecture.md](../01-overview/architecture.md) | How the two app files work together |
| [commands.md](commands.md) | The recipes that operate on this tree |
