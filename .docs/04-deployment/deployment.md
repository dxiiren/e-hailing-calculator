# Deployment

> **TL;DR** There is no deployment. No CI/CD, no hosting target, no environments — the
> calculator runs locally via `just start`, and that is the intended state of this repo.

## Current state

| Aspect | Answer |
| --- | --- |
| CI/CD | None — no workflows, no pipelines |
| Hosting | None — local `python -m http.server` on port 8118 only |
| Environments | One: your machine |
| Secrets | None in the app; only the git-ignored `.mcp.json` (per-dev tooling, not the app) |

## If publishing is ever wanted

The app is two static files, so any static host works with **zero code changes**:

| Option | Effort | Notes |
| --- | --- | --- |
| GitHub Pages | Lowest | Serve the repo root from `main`; `index.html` is already the entry point |
| Netlify / Vercel / Cloudflare Pages | Low | Drag-and-drop or point at the repo; no build command needed |
| Any web server | Low | Copy `index.html` + `app.js` into the docroot |

The one caveat that follows the page anywhere: **it loads Vue, vue-i18n, Tailwind, jsPDF, and
Font Awesome from public CDNs at page load**. Whatever host you choose, visitors need internet
access to those CDNs. For a hardened deployment you would vendor the libraries locally and
swap the Tailwind Play CDN for a small built stylesheet — that is the only real "build" work
this app could ever need.

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [../01-overview/project-overview.md](../01-overview/project-overview.md) | What the app is |
| [../02-setup/getting-started.md](../02-setup/getting-started.md) | The local "deployment" that does exist |
