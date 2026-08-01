# Architecture

> **TL;DR** `index.html` is the Vue template plus five CDN `<script>` tags; `app.js` is the
> whole application — i18n messages, reactive refs, a chain of computed properties that turns
> three inputs and two multi-selects into a cartesian-product results table, and a jsPDF
> export. No components, no router, no store, no build.

## The two files

```
index.html        # template + CDN loads
├─ <head>         # Vue 3, vue-i18n 9, Tailwind (Play CDN), jsPDF + autotable, Font Awesome
├─ #app           # the Vue mount point
│  ├─ locale <select>          # bound to $i18n.locale (en / ms)
│  ├─ 3 number inputs          # fuelCost, fuelKm, earningsPerKm (v-model.number)
│  ├─ 2 multi-selects          # selectedIncomes, selectedDays (+ "custom" option that
│  │                           #   reveals dynamic custom-value inputs)
│  ├─ Export to PDF button     # @click="exportPDF"
│  └─ #resultsTable            # v-for over sortedCombinations; sortable th's
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
- The `"custom"` option is a sentinel string mixed into a numeric multi-select; both
  `allNetTargets` and `allWorkingDays` filter it out before `Number()`-mapping. Keep that
  filtering if you touch the selects.

## Known edge case (unguarded)

`requiredKM = Math.ceil(netPerDay / netPerKm)` has **no guard for `netPerKm <= 0`**. If the
driver's fuel cost per km meets or exceeds earnings per km, rows show negative or `Infinity`
kilometres. Documented in
[../06-troubleshooting/common-issues.md](../06-troubleshooting/common-issues.md); fix
deliberately not applied by the onboarding kit (kit commits don't change app behavior).

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
