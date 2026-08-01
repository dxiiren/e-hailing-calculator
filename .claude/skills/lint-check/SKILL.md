---
name: lint-check
description: Use when the developer says 'lint check', 'run lint', 'check lint', 'run the quality suite', or 'lint everything' — runs the quality checks available to this static repo (HTML well-formedness parse, leftover-placeholder grep, debug-leftover grep) and reports pass/fail per layer. No ESLint/Prettier here — there is no npm toolchain.
model: sonnet
---

# lint-check — Static-site quality checks (parse · placeholders · leftovers)

This repo has **no npm toolchain** — no ESLint, no Prettier, no typecheck. The quality
suite is therefore three lightweight layers that need only the tools `setup.ps1`
installs (uv/Python, grep). Run each independently so one failure doesn't hide the others.

## Trigger

When the developer says any of: "lint check", "run lint", "check lint",
"run the quality suite", "lint everything".

---

## What to Do

### 1 — HTML well-formedness parse

Parse `index.html` with Python's stdlib parser; a structural error (unclosed tag the
parser trips on, broken attribute quoting) raises.

```bash
uv run python - <<'EOF'
from html.parser import HTMLParser
import sys

class Check(HTMLParser):
    VOID = {"area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []
    def handle_starttag(self, tag, attrs):
        if tag not in self.VOID:
            self.stack.append((tag, self.getpos()))
    def handle_endtag(self, tag):
        if self.stack and self.stack[-1][0] == tag:
            self.stack.pop()
        else:
            self.errors.append(f"line {self.getpos()[0]}: unexpected </{tag}>")

c = Check()
c.feed(open("index.html", encoding="utf-8").read())
c.errors += [f"line {pos[0]}: <{tag}> never closed" for tag, pos in c.stack]
print("\n".join(c.errors) if c.errors else "OK: index.html parses cleanly")
sys.exit(1 if c.errors else 0)
EOF
```

Pass = `OK: index.html parses cleanly`, exit 0.

### 2 — Leftover template placeholders

The onboarding kit stamps files from templates whose fill-in tokens are delimited by
doubled at-signs. The `@[@]` character class below matches that delimiter in files
without this skill file matching its own check:

```bash
grep -rn "@[@]" --include="*.html" --include="*.md" --include="*.ps1" --include="justfile" .
```

Pass = **zero hits** (grep exits 1). Any hit is an unfilled kit placeholder token —
fix it at the source.

### 3 — Debug / draft leftovers

```bash
grep -n "TODO\|FIXME\|XXX\|console\.log\|debugger\|lorem ipsum" index.html app.js
```

Pass = zero hits (grep exits 1). A hit is not automatically fatal — judge it: a
deliberate TODO with a follow-up is fine; a `console.log` or `debugger` left over
from debugging `app.js` is not.

---

## Reporting back

Report a per-layer table, then an overall verdict:

```
LAYER         TOOL                    STATUS
parse         python html.parser      PASS | FAIL (N errors)
placeholders  grep "@[@]"             PASS | FAIL (N hits)
leftovers     grep TODO/debug         PASS | FAIL (N hits, judged)
OVERALL: PASS | FAIL
```

- **parse** failures are fixed by hand in `index.html` at the reported line — never by
  weakening the check.
- **placeholders** failures mean an unfilled template token from the onboarding kit —
  fill it with the real value.
- **leftovers** hits require judgment — report each with its line and a verdict.

---

## Notes

- Run from the **repo root** — the paths above are root-relative.
- Do NOT introduce an npm/ESLint/Prettier toolchain just to lint one HTML file — the
  stdlib parse is deliberate minimalism for this repo.
- Visual regressions are not covered here — verify styling changes by reloading
  `http://127.0.0.1:8118` (`just start`).

## Evolution Log

- Adapted from akmal-resume-website's lint-check (ESLint/Prettier/typecheck) for this
  toolchain-less static repo: replaced the npm layers with an stdlib HTML parse, a
  kit-placeholder grep, and a debug-leftover grep.
- Ported from career-estimation for e-hailing-cal: layer 3 now also greps `app.js`
  (this repo has real JavaScript — the Vue 3 calculator logic).
