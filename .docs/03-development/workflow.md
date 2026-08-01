# Development workflow

> **TL;DR** Edit `index.html` / `app.js`, reload the browser, verify both locales. No
> compile, no hot reload. Branch for non-trivial work, Conventional Commits without
> attribution footers, PR into `main`. The `.claude/skills/` catalog automates the routine.

## The loop

1. `just start` (or `just serve` for a foreground server you can Ctrl+C).
2. Edit `index.html` (template/markup) or `app.js` (state, math, i18n, PDF export).
3. Reload the browser — the server serves files as-is; there is no HMR and no cache layer
   worth fighting (hard-reload with Ctrl+F5 if the browser clings to an old `app.js`).
4. Verify in **both locales** (the top-right dropdown) if you touched any UI string.
5. `just stop` when done.

## Code conventions (this repo's real rules)

- **Every UI string goes through `$t()`** with the key present in BOTH `messages.en` and
  `messages.ms` in `app.js`. A key missing from `ms` silently falls back to English — easy to
  miss if you only test one locale.
- **Return what you bind.** Anything the template references must be in the object returned
  from `setup()`; a forgotten return renders as blank with no console error.
- **Keep computeds pure.** The chain `costPerKm → targetCombinations → sortedCombinations`
  is side-effect-free; `sortedCombinations` spreads before sorting. Keep it that way.
- **Table and PDF stay in sync.** A column change means editing both the template table and
  the `headers`/`rows` arrays in `exportPDF()`.
- **Tailwind utility classes** in the template; don't add a stylesheet or inline `style=""`
  for things a utility covers. The tiny `<style>` block in `index.html` exists only for the
  body font and the sortable-header hover.
- **No new CDN dependencies** without a good reason — every extra `<script>` is another
  point of failure offline. Pin versions (the jsPDF tags are pinned; follow that pattern).

## Quality gate

Run `/lint-check` (Claude Code) before a PR: it parses `index.html` with Python's stdlib
parser, greps for leftover kit placeholders, and greps `index.html app.js` for debug leftovers
(`console.log`, `debugger`, TODOs).

## Branch, commit, PR

- Small fixes can go straight to `main`; anything non-trivial gets a branch.
- **Conventional Commits**: `feat(app): ...`, `fix(app): ...`, `docs: ...`, `chore(tooling): ...`.
  Scopes: `app`, `tooling`, `docs`, `skills`, `claude`, `mcp`.
- **Never** add `Co-Authored-By` or "Generated with Claude Code" footers.
- Commit author email is `mohdakmal875@gmail.com` (already set repo-locally).
- `/commit` handles staging + message; `/create-pr` pushes the branch and opens the GitHub PR;
  `/pre-pr-review` self-reviews the diff first (a11y, i18n integrity, Vue correctness,
  calculation accuracy).

## Working with the skills

| When you're about to... | Use |
| --- | --- |
| Commit | `/commit` |
| Open a PR | `/create-pr` (after `/pre-pr-review`) |
| Check quality | `/lint-check` |
| Hand a session to another Claude session | `/claude-transfer` |
| Hand a task to ChatGPT/Ollama/etc. | `/llm-transfer` |
| Turn a vague ask into an executable goal file | `/define-goal` |
| Verify/repair MCP servers | `/setup-mcp`, `/test-all-mcp` |
| Audit the skills catalog itself | `/audit-skills` |

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [../01-overview/architecture.md](../01-overview/architecture.md) | The data-flow rules the conventions protect |
| [../05-reference/commands.md](../05-reference/commands.md) | The full `just` recipe list |
| [../06-troubleshooting/common-issues.md](../06-troubleshooting/common-issues.md) | When the loop breaks |
