---
name: pre-pr-review
description: Use when the developer says 'pre-pr review', 'review my branch', 'audit my work', or 'self review' — self-reviews the current branch's diff against a static-HTML / JS / accessibility / i18n / calculation-accuracy checklist before opening a PR, then saves a report to .claude/workspace/reports/pr/.
model: opus
---

# Pre-PR Review (Self-Audit)

Self-review your feature-branch diff **before** opening a PR. This is a static single-page
Vue 3 app (`index.html` + `app.js`, Vue/vue-i18n/Tailwind/jsPDF all loaded from CDNs, no
build) — the goal is to catch structure, accessibility, i18n, and calculation problems early.
There is no hook/CI safety net in this repo, so this review is the only gate.

## Trigger

- `"pre-pr review"` / `"self review"`
- `"review my branch"` / `"review my work"` / `"review my code"`
- `"audit my work"` / `"audit my branch"`

## Step 1 — Branch & base

```bash
git branch --show-current
```

If on `main`: **STOP** — "You're on `main`; switch to your feature branch first."

```bash
git fetch origin main
git diff origin/main...HEAD --name-only
```

If no files changed: **STOP** — "No changes vs `main`."

Scope the review to reviewable source: `index.html` and `app.js` (and any `*.html`, `*.css`,
`*.js` added later).
**Exclude** `.claude/` and `.docs/` (docs-only changes get a light read for accuracy, not
this checklist). If only excluded files changed: **STOP** — "No reviewable source changed."

Report: "Branch `{name}` changed {N} source files. Running static-page review."

## Step 2 — Fetch the diff

```bash
git diff origin/main...HEAD -- '*.html' '*.css' '*.js'
```

For context-dependent checks (heading order, duplicate ids, unclosed tags) read the **full
file**, not just the hunk.

## Step 3 — Run the checklist

Verify each finding against the actual code before reporting it.

| #   | Check                    | Label      | What to look for                                                                                                                                                                                                                 |
| --- | ------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Well-formed HTML**     | issue      | Unclosed/mismatched tags, duplicate `id`s, attributes without quotes, content outside `<body>`. Cross-check with `/lint-check` layer 1.                                                                                          |
| 2   | **Accessibility**        | issue      | Form inputs whose `<label>` isn't programmatically associated (`for`/`id`); color as the only signal (the yellow-highlighted Gross/Day column needs its text/`<th>` to carry the meaning); sufficient contrast; heading order. |
| 3   | **Semantic HTML**        | issue      | One `<h1>` per page; data as `<table>` with `<th>` headers (the results table already is — don't regress); buttons as `<button>`, not clickable `<div>`s.                |
| 4   | **SEO / head**           | suggestion | `<title>` still accurate; `meta viewport` intact; consider `meta description` if the page is ever published.                                                                                                                     |
| 5   | **i18n integrity**       | issue      | Every user-facing string goes through `$t()` and its key exists in **both** the `en` and `ms` message trees in `app.js` — a key missing from `ms` silently falls back to English.                                                                          |
| 6   | **Vue correctness**      | issue      | New reactive state/functions are returned from `setup()` (unreturned bindings render as blanks); `v-for` rows carry a `:key`; computed chains (`costPerKm` → `targetCombinations`) stay side-effect-free.                                                                    |
| 7   | **External dependencies**| suggestion | Everything (Vue, vue-i18n, Tailwind, jsPDF, Font Awesome) loads from CDNs — flag any NEW external URL or version bump, and prefer pinned versions over floating tags.                                                                 |
| 8   | **Calculation accuracy** | issue      | Changes to the money math (`costPerKm`, net-per-km, `requiredKM` ceil, gross/day, gross/month) must keep the on-screen table AND the jsPDF export columns in `exportPDF()` in sync — the same numbers appear in both.                                                           |
| 9   | **No debug leftovers**   | issue      | `console.log`/`debugger`, commented-out dead blocks, `TODO` without a follow-up, placeholder text (lorem ipsum), leftover kit placeholder tokens.                                                                                                              |

## Step 4 — Serve check

If `index.html` or `app.js` changed, boot-verify:

```bash
just start
curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:8118/index.html
just stop
```

Expect `200`. Note the result in the report.

## Step 5 — Finding labels & caps

- **issue** (blocking) — fix before opening the PR.
- **suggestion** (non-blocking) — recommended.
- **nitpick** (non-blocking) — minor/optional.

Every finding must carry: the label, the `file:line`, and **WHY** it matters (not just what).
Issues: uncapped. Suggestions + nitpicks: cap at 15 total; note "{X} more non-blocking findings
omitted" if over.

## Step 6 — Present

```
## Pre-PR Review: {branch}
Branch: {branch} -> main   |   Files: {N}
Serve check: {200 / skipped}

### Issues (fix before PR)
1. [path:line] Finding — why it matters

### Suggestions
2. [path:line] Finding

### Nitpicks
3. [path:line] Finding

---
{Total} findings: {issues} issues, {suggestions} suggestions, {nitpicks} nitpicks
```

Zero findings → "No issues found — branch looks clean. Ready to open the PR."

## Step 7 — Save the report

Path: `.claude/workspace/reports/pr/{branch}-{YYYY-MM-DD}.md` (replace `/` in the branch name
with `-`; overwrite on a same-day re-run). Frontmatter then the same body as the terminal
output:

```yaml
---
branch: { branch }
base: main
date: { YYYY-MM-DD }
files_changed: { N }
issues: { count }
suggestions: { count }
nitpicks: { count }
---
```

Confirm: "Report saved to `{path}`".

## Tone

Self-improvement, not a verdict from a lead. "Consider extracting…", not "You must fix…". Never
directive, never judgmental.

## Evolution Log

- Adapted from akmal-resume-website's Vue/Nuxt checklist for this static single-page repo:
  dropped reactivity/composable/coverage/Tailwind checks, added well-formedness, print-layout,
  external-dependency, and content-accuracy checks; serve check replaces the coverage gate.
- Ported from career-estimation for e-hailing-cal: print-layout/content-accuracy checks
  replaced with i18n-integrity (en + ms message trees), Vue-correctness (setup() returns,
  `:key`, computed purity), and calculation-accuracy (table vs `exportPDF()`) checks; `app.js`
  added to the review scope.
