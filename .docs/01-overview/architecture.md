# Architecture

> **TL;DR** `index.html` is the Vue template plus five CDN `<script>` tags; `app.js` is the
> whole application — i18n messages, reactive refs, a chain of computed properties that turns
> three inputs and two chip toggle groups into a cartesian-product results table, and a jsPDF
> export. No components, no router, no store, no build.

## The two files

```
index.html        # template + CDN loads
├─ <head>         # Vue 3, vue-i18n 9, Tailwind (Play CDN), jsPDF + autotable, Font Awesome
├─ #app           # the Vue mount point
│  ├─ hero header              # branding bar + locale <select> bound to $i18n.locale (en / ms)
│  ├─ 3 number inputs          # fuelCost, fuelKm, earningsPerKm (v-model.number)
│  ├─ 2 chip toggle groups     # selectedIncomes, selectedDays via toggleIncome/toggleDay
│  │                           #   (+ "custom" chip that reveals dynamic custom-value inputs)
│  ├─ Export to PDF button     # @click="exportPDF" — CTA in the results-card header
│  └─ #resultsTable            # v-for over sortedCombinations; sortable th's; empty state
│                              #   card when no combinations are selected
└─ <script src="app.js">       # loaded last, after the CDN libraries

app.js
├─ messages { en, ms }         # every UI string, per locale
├─ i18n = VueI18n.createI18n   # locale "en", fallback "en"
├─ createApp({ setup() {...}}) # all state + logic below
└─ app.use(i18n); app.mount("#app")
```

## Reactive data flow

Everything derives from eight refs via pure computed properties:

```
fuelCost, fuelKm ──────────► costPerKm = fuelCost / fuelKm
selectedIncomes, customIncomes ──► allNetTargets   (filters out the "custom" sentinel)
selectedDays, customDays ────────► allWorkingDays
earningsPerKm ──┐
costPerKm ──────┤
allNetTargets ──┼──► targetCombinations   (income × days cartesian product; per combo:
allWorkingDays ─┘      netPerDay = income/days
                       netPerKm  = earningsPerKm − costPerKm
                       requiredKM = ceil(netPerDay / netPerKm)
                       grossPerDay = requiredKM × earningsPerKm
                       grossPerMonth = grossPerDay × days)
sortKey, sortAsc ──► sortedCombinations   (spread + sort; never mutates the source)
```

Rules the code already follows and edits must preserve:

- Computeds are **side-effect-free**; `sortedCombinations` copies before sorting.
- Every binding used by the template is **returned from `setup()`** — an unreturned ref
  renders as blank with no error.
- The `"custom"` chip is a sentinel string mixed into the numeric selection arrays
  (`selectedIncomes` / `selectedDays` — the same state model the old native multi-selects
  used); both `allNetTargets` and `allWorkingDays` filter it out before `Number()`-mapping.
  `toggleIncome`/`toggleDay` only push/splice those arrays — keep that filtering if you touch
  the chip groups.

## Unprofitability guard (fixed in v2)

`computeRequirement()` in `lib/calc.js` guards `netPerKm <= 0`: if the driver's fuel cost per
km meets or exceeds earnings per km it returns `unprofitable: true` with null figures, the UI
shows a bilingual warning banner (`data-test="unprofitable-warning"`), and the table/PDF render
"—" instead of impossible distances. History and the test-first fix trail in
[../06-troubleshooting/common-issues.md](../06-troubleshooting/common-issues.md).

## i18n

`messages.en` and `messages.ms` must stay key-for-key mirrors — vue-i18n falls back to English
silently for any key missing from `ms`, so a forgotten translation is invisible in testing if
you only check the English locale. The locale `<select>` writes `$i18n.locale` directly.

## PDF export

`exportPDF()` rebuilds the table **independently** of the DOM: it maps `sortedCombinations`
into a rows array and hands it to `jsPDF` + `autoTable`, saving `financial_calculator.pdf`.
The PDF headers are hard-coded **English only** (not `$t()`-translated) — see the FAQ. If you
change a table column, change it in both the template and `exportPDF()`.

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [project-overview.md](project-overview.md) | What the app is for and the full input/output table |
| [../03-development/workflow.md](../03-development/workflow.md) | The edit-reload-verify loop and code conventions |
| [../06-troubleshooting/common-issues.md](../06-troubleshooting/common-issues.md) | The negative-KM edge case as a symptom |
