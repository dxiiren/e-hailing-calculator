# Goal file template - the exact shape of every `{topic}-goal.md`

Every file `define-goal` writes uses this structure, in this order. Consistency is the point: a
reader (human or the `/goal` evaluator) always finds the STOP CONDITION at the top and the work-list
in the middle. Fill **every** section; if one truly doesn't apply, keep the heading and write one
line saying why (e.g. "No environment bootstrap - pure-analysis goal") rather than deleting it.

## Contents

- [The template](#the-template)
- [Field guidance](#field-guidance)
- [Worked example (compact)](#worked-example-compact)
- [The handoff block to print after writing](#the-handoff-block-to-print-after-writing)

## The template

Copy this verbatim, then fill each `{placeholder}` and resolve each `<!-- note -->`. The template is
markdown, so it drops straight into a `.md` file.

````markdown
# GOAL - {Title Case mission name}

> Read this whole file before starting. Execute the Work List top to bottom. After EVERY item:
> set its status + append one Run Log line. This file - not your memory - is the source of truth.

## STOP CONDITION - read before ending ANY turn (the /goal evaluator checks THIS file)

**This goal is NOT complete - and you MUST NOT stop, summarize, or hand back - until EVERY row in
the Work List has a TERMINAL status.**

- **Terminal (a row may end here):** `DONE` - `GAP` (not implemented / out of scope - cite the code
  fact) - `BLOCKED` (proven impossible in code or a hard infra failure you cannot fix - cite
  `file:line` or the exact error).
- **Non-terminal (work remains - keep going):** `TODO` - `IN-PROGRESS` - `PARTIAL`. The words
  **"deferred" / "next session" / "focused session" / "later" are BANNED as a status.** Large or
  messy is not a reason to defer - slice it, timebox it, annotate honestly, mark it `DONE`/`PARTIAL`
  with a concrete note, and move to the next row.
- **Do NOT write a completion summary while any row is non-terminal.** A "Summary"/"final status"
  written early makes this file read as _met_ and lets you quit with work undone. Write the closing
  summary ONLY when the Work List has zero `TODO`/`IN-PROGRESS`/`PARTIAL` rows.
- **On every Stop attempt:** re-read this section, scan the Work List, pick the topmost non-terminal
  row, and execute it. Repeat until none remain.

## Mission

{1-2 sentences: the single objective and what "success" concretely delivers.}

## Locked decisions (do not re-litigate)

- {Decision already made - the agent must NOT reopen it. One bullet each. Delete the list only if
  there are genuinely none.}

## Environment bootstrap

<!-- Idempotent; re-verify every run. Delete/deactivate this section only for a pure-analysis goal. -->

- {Step to bring the world up + how to check it's up + what to do if it's down. e.g. `just start`
  (serves :8118; check `curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:8118/index.html`
  = 200; if down, `just stop` then `just start`). Reference the exact command.}

## Hard prohibitions / guardrails

- {git commit? push? staging? - state explicitly, e.g. "NEVER git commit/push/stage; all work stays
  in the working tree."}
- {External posts - GitHub PR/issue / email / any service: allowed or forbidden?}
- {Destructive ops, files/dirs that are off-limits, "touch only X".}
- {Any project house-rule that applies, e.g. "run only long-lived servers in background".}

## What counts as a REAL blocker

- **Real (may mark `BLOCKED`):** {code facts - a structural HTML error the parser proves at a line,
  a missing referenced asset, a value that cannot be reconciled; or a hard infra failure you tried
  once to fix and couldn't.}
- **NOT a blocker (keep working):** "it's late", "it's complex", "needs a focused session", a
  serve process that died (-> `just stop` + `just start`, re-poll, continue).

## Definition of Done

Per item - an item is `DONE` only when:

- [ ] {check 1}
- [ ] {check 2}
- [ ] {evidence recorded - the concrete proof line, e.g. the pasted `/lint-check` parse result, a
      curl 200 line, a report path}

Global goals:

- **G1** {checkable outcome}
- **G2** {checkable outcome}

<!-- add G3.. as needed; each must be verifiable, not aspirational -->

## Work List

<!-- CHOOSE ONE of the two forms below and delete the other. -->

<!-- FORM 1 - KNOWN, enumerable list: one row per unit of work. -->

| #   | Item   | Status |
| --- | ------ | ------ |
| 1   | {item} | `TODO` |
| 2   | {item} | `TODO` |
| ... | ...    | `TODO` |

<!-- FORM 2 - UNKNOWN size: a discovery sweep enumerates the list first, then a Task Template. -->

### Goal 0 - Discovery sweep - `TODO`

Enumerate every unit of work into the table below BEFORE executing any of them. {How to discover:
grep/glob/section scan of index.html / app.js.} Append one row per item found; set each to `TODO`.

| #                       | Item | Status |
| ----------------------- | ---- | ------ |
| _(populated by Goal 0)_ |      |        |

### Task Template (copy for each row when you start it)

```text
### {id} - {item name} - `TODO`
- [ ] {DoD check 1}
- [ ] {DoD check 2}
- [ ] Evidence: {proof}
```

## Resume protocol

- Statuses in this file are the single source of truth - not conversation memory.
- On every (re)start, crash, or context compaction: re-read STOP CONDITION -> Work List -> continue
  from the first non-terminal row.
- Set a row to `IN-PROGRESS` the moment you start it, so a resumed run knows where you died.
- After EVERY item (not in batches): set its status + append one Run Log line.

## Run Log (append-only - one timestamped line per item)

<!-- format: "- {YYYY-MM-DD HH:MM} | {item id} | {what happened + evidence}" -->

- {first line goes here}
````

## Field guidance

- **STOP CONDITION** - keep it verbatim; only adjust the terminal-status _names_ if this goal needs
  a different vocabulary. It must stay checkable by re-reading the file.
- **Mission** - success must be stateable as something observable. If the answer was fuzzy in
  interrogation, it isn't ready to write.
- **Environment bootstrap** - only for goals that touch the served page. For an unattended run,
  make each step idempotent and give the up/down check + the recovery action inline.
- **Work List** - Form 1 when the developer handed you a finite list; Form 2 when the count is
  unknown or must be derived. Never leave the count implicit - Goal 0 makes it explicit before work
  starts, which is what makes "EVERY row terminal" a real bar.
- **Definition of Done** - the per-item checklist is what stops "looks done" from passing. Always
  include an **evidence** line (a pasted result / a report path), never just a checkbox.
- **Guardrails** - for an unattended run, default to the safe side: no commit/push, no external
  posts, unless the developer explicitly authorized them in interrogation.

## Worked example (compact)

A finite, attended-ish goal - fix accessibility gaps in three named UI areas:

```markdown
# GOAL - Fix accessibility gaps in three calculator UI areas

## STOP CONDITION - read before ending ANY turn (the /goal evaluator checks THIS file)

**NOT complete until EVERY row in the Work List has a TERMINAL status (`DONE`/`GAP`/`BLOCKED`).**
... (standard block) ...

## Mission

Give the input form, the target multi-selects, and the results table in `index.html`
programmatic labels (`for`/`id` on every `<label>`-input pair), non-color-carried meaning for
the highlighted Gross/Day column, and correct heading order. Success = each area passes the
per-item DoD and `/lint-check` layer 1 still parses clean.

## Locked decisions (do not re-litigate)

- Keep the visual design - fix semantics/contrast, don't restyle the page.
- Keep the CDN-loaded Vue 3 + Tailwind stack; no build step, no new dependencies.

## Environment bootstrap

- `just start` (serves :8118). Check: `curl.exe -s -o NUL -w "%{http_code}"
  http://127.0.0.1:8118/index.html` prints 200. If down: `just stop` then `just start`.

## Hard prohibitions / guardrails

- NEVER git commit/push/stage - leave changes in the working tree for review.
- No GitHub PR/issue posts.
- Touch only `index.html`.

## What counts as a REAL blocker

- Real: a contrast fix that cannot be met without abandoning the locked Tailwind palette -
  cite the computed ratio and the two colors.
- Not a blocker: "the section is big" - slice the elements and fix them.

## Definition of Done

Per item - `DONE` only when:

- [ ] The area's meaning survives with CSS disabled (text labels, list/table semantics)
- [ ] Heading levels inside the area are sequential
- [ ] Evidence: the `/lint-check` parse line + the curl 200 line pasted

Global: **G1** all three areas fixed. **G2** `/lint-check` overall PASS.

## Work List

| #   | Item                 | Status |
| --- | -------------------- | ------ |
| 1   | Input form           | `TODO` |
| 2   | Target multi-selects | `TODO` |
| 3   | Results table        | `TODO` |

## Resume protocol

... (standard block) ...

## Run Log (append-only - one timestamped line per item)

- {first line goes here}
```

## The handoff block to print after writing

```text
Wrote .claude/checklist/{topic}/{topic}-goal.md
Run it in a fresh instance (Fable):
  /goal Work through @.claude/checklist/{topic}/{topic}-goal.md until the STOP CONDITION at the
  top is met. Follow every rule in it; update statuses + Run Log after each item.
```
