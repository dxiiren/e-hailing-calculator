# E-Hailing Financial Calculator — developer documentation

Documentation for the `e-hailing-calculator` repo: a single-page Vue 3 (CDN) financial calculator for
e-hailing drivers, served locally on port 8118.

> **New here? Start with [`tldr.md`](tldr.md)** — every document below summarised in 30 seconds
> each, with links.

## Who is this for?

| Reader | Start here |
| --- | --- |
| New developer setting up the repo for the first time | [`02-setup/getting-started.md`](02-setup/getting-started.md) |
| Anyone asking "what even is this project?" | [`01-overview/project-overview.md`](01-overview/project-overview.md) |
| Developer editing the calculator UI or math | [`03-development/workflow.md`](03-development/workflow.md) |
| Someone looking for the right `just` command | [`05-reference/commands.md`](05-reference/commands.md) |
| Someone whose serve/setup broke | [`06-troubleshooting/common-issues.md`](06-troubleshooting/common-issues.md) |

## Recommended reading order

1. [`tldr.md`](tldr.md)
2. [`01-overview/project-overview.md`](01-overview/project-overview.md)
3. [`01-overview/architecture.md`](01-overview/architecture.md)
4. [`02-setup/getting-started.md`](02-setup/getting-started.md)
5. [`03-development/workflow.md`](03-development/workflow.md)
6. [`05-reference/commands.md`](05-reference/commands.md)
7. Everything else, on demand.

## 01-overview

| Document | What it covers |
| --- | --- |
| [`project-overview.md`](01-overview/project-overview.md) | What the calculator does, its inputs/outputs, tech stack, repo history |
| [`architecture.md`](01-overview/architecture.md) | How `index.html` + `app.js` fit together — the reactive data flow, the money math, i18n, PDF export |

## 02-setup

| Document | What it covers |
| --- | --- |
| [`getting-started.md`](02-setup/getting-started.md) | From a fresh Windows PC to the calculator serving on :8118 — `setup.ps1`, what it installs, first serve |

## 03-development

| Document | What it covers |
| --- | --- |
| [`workflow.md`](03-development/workflow.md) | Day-2 loop: edit `index.html`/`app.js`, reload, verify; branching, commits, PRs, and the Claude Code skills |

## 04-deployment

| Document | What it covers |
| --- | --- |
| [`deployment.md`](04-deployment/deployment.md) | The honest answer: there is no deployment — local-only, and what your options are if that changes |

## 05-reference

| Document | What it covers |
| --- | --- |
| [`commands.md`](05-reference/commands.md) | Every `just` recipe, what it does, and when to use it |
| [`project-layout.md`](05-reference/project-layout.md) | Every file/folder in the repo and its purpose |

## 06-troubleshooting

| Document | What it covers |
| --- | --- |
| [`common-issues.md`](06-troubleshooting/common-issues.md) | Real symptoms and fixes: PATH staleness, port conflicts, lingering servers, blank page offline, negative KM rows |

## 07-faq

| Document | What it covers |
| --- | --- |
| [`faq.md`](07-faq/faq.md) | Quick answers: why no build step, why Python serves it, why port 8118, how the math works, how to add a language |
