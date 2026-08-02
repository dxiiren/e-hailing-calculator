# Project overview

> **TL;DR** A single-page financial planning calculator for e-hailing drivers: fuel cost +
> fuel range + earnings per km in, required km/day and gross earnings per day/month out, for
> every combination of selected net-income targets and working-day counts. Vue 3 + vue-i18n +
> Tailwind + jsPDF, all from CDNs; one `index.html` + `app.js`, no build step, no backend.

## What it is

The app answers one question for an e-hailing (ride-hailing) driver in Malaysia: *"How far do
I have to drive each day to take home my target income?"*

The driver enters three facts about their situation:

| Input | Default | Meaning |
| --- | --- | --- |
| Fuel cost (RM) | 60 | What they usually spend on a fill-up |
| Fuel distance (km) | 400 | How far that fill-up takes them |
| Earnings per km (RM) | 0.70 | What they gross per kilometre driven |

Then they pick **one or more** monthly net-income targets (presets RM 3,500 / RM 4,000, plus
any number of custom values) and **one or more** working-days-per-month counts (presets 20 /
24, plus custom). Every income × days combination becomes a row in the results table:

| Column | How it is computed |
| --- | --- |
| Net/Day (RM) | net target ÷ working days |
| Required KM/Day | ceil(net per day ÷ (earnings per km − fuel cost per km)) |
| Gross/Day (RM) | required km × earnings per km |
| Gross/Month (RM) | gross per day × working days |

The table sorts by working days or net target (click the header), and **Export to PDF**
downloads the same rows as `financial_calculator.pdf` via jsPDF + autotable.

## Bilingual UI

All labels go through vue-i18n with two message trees in `app.js`: `en` (English) and `ms`
(Bahasa Melayu). A `<select>` in the top-right corner switches locale live; missing keys fall
back to English.

## Tech stack

| Layer | Technology | Notes |
| --- | --- | --- |
| UI framework | Vue 3 (global build) | Loaded from unpkg CDN; Composition API in `app.js` |
| i18n | vue-i18n 9 | Loaded from unpkg CDN |
| Styling | Tailwind CSS (CDN Play build) + Font Awesome 6.7.2 | Utility classes inline in the template |
| PDF export | jsPDF 2.5.1 + jspdf-autotable 3.5.29 | CDN; `exportPDF()` in `app.js` |
| Serving | Python `http.server` via uv | `just start` on 127.0.0.1:8118 |

There is **no package.json, no build step, no backend, no database**. The page needs internet
at load time because every library comes from a CDN.

## Repo history

The repo lives at `github.com/dxiiren/e-hailing-calculator` and was earlier named
`e-hailing-financial-calculator`, then `e-hailing-cal` (the pre-kit README carried both
early names). Development history
is a series of label/i18n refinements on top of the original calculator.

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [architecture.md](architecture.md) | How the template, state, math, and PDF export fit together |
| [../02-setup/getting-started.md](../02-setup/getting-started.md) | Get it running on a fresh PC |
| [../07-faq/faq.md](../07-faq/faq.md) | Quick answers about the stack choices |
