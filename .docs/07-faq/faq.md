# FAQ

> **TL;DR** Quick answers on the stack choices, the port, the math, and how to extend the
> calculator.

## Why is there no build step / package.json?

The app uses Vue 3's **global build** straight off a CDN `<script>` tag, so there is nothing
to compile, bundle, or install. For a two-file calculator that's a feature: clone → serve →
works. The trade-off is the CDN dependency at page load.

## Why does Python serve a JavaScript app?

`python -m http.server` is a zero-config static file server that ships with the Python that
`uv` installs anyway (the `.claude` tooling needs it). The app is static files from the
server's point of view — no Node server is involved or needed.

## Why port 8118?

Every local repo on this machine gets its own assigned port so multiple projects can serve
side by side without collisions (and never a framework default like 8000/5173 that any random
tool might grab). This repo's assignment is 8118, baked into the `justfile` (`port :=` line,
overridable via `$env:PORT`).

## How exactly is a table row computed?

For each selected net-income target × working-days combination:

```
costPerKm    = fuelCost / fuelKm                     # e.g. 60/400 = RM 0.15
netPerKm     = earningsPerKm - costPerKm             # e.g. 0.70-0.15 = RM 0.55
netPerDay    = netTarget / workingDays               # e.g. 3500/20 = RM 175
requiredKM   = ceil(netPerDay / netPerKm)            # e.g. ceil(175/0.55) = 319 km
grossPerDay  = requiredKM * earningsPerKm            # e.g. 319*0.70 = RM 223.30
grossPerMonth= grossPerDay * workingDays             # e.g. RM 4,466
```

"Net" treats fuel as the only cost — commissions, maintenance, and phone/data are not modeled.

## Why can the table show negative kilometres?

No guard exists for unprofitable inputs (cost per km ≥ earnings per km). See
[../06-troubleshooting/common-issues.md](../06-troubleshooting/common-issues.md).

## How do I add another language?

1. Add a third message tree to `messages` in `app.js` (copy the `ms` block, translate every
   key — keep it key-for-key identical to `en`).
2. Add one `<option>` to the locale `<select>` in `index.html`.

vue-i18n falls back to English for any key you miss, silently — diff the key sets.

## Why is the exported PDF always in English?

`exportPDF()` hard-codes its column headers instead of using `$t()`. Translating them means
mapping the current locale's `table.*` messages into the `headers` array — a small, contained
change if ever wanted.

## Can I use custom income targets or day counts?

Yes — tap the `Custom` chip in either toggle group and the custom-value inputs appear (with an
"Add custom income/days" button for more rows); each filled value joins the combination grid
alongside the preset selections.

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [../01-overview/project-overview.md](../01-overview/project-overview.md) | The full feature walkthrough |
| [../01-overview/architecture.md](../01-overview/architecture.md) | Where each answer lives in the code |
