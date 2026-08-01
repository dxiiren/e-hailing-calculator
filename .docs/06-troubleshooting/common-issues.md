# Common issues

> **TL;DR** Almost everything that breaks here is environmental: stale PATH, a lingering
> server on 8118, or missing internet for the CDN libraries. The one in-app gotcha is
> negative "Required KM/Day" from unprofitable inputs.

## `just` or `uv` is not recognized

**Symptom** — PowerShell says the command is not found right after `setup.ps1` succeeded.

**Cause** — the shell you ran `setup.ps1` in still holds the pre-install PATH.

**Fix** — close and reopen PowerShell. If it persists, re-run `pwsh ./setup.ps1` (idempotent)
and check its final verification list for `[MISSING]` lines.

## Port 8118 is already in use

**Symptom** — `just start`'s window shows `OSError: [WinError 10048]` (address in use), or
the page serves stale content.

**Cause** — a previous server from this repo is still alive.

**Fix** — `just stop`. It kills only python processes whose command line contains this repo's
path, so other projects' servers survive. `just start` also runs `stop` first automatically,
so simply re-running `just start` usually self-heals.

## A server window survived the session

**Symptom** — you closed the terminal but `http://127.0.0.1:8118` still answers.

**Cause** — `just start` launches the server in its own background PowerShell window, which
outlives the shell that started it.

**Fix** — `just stop` from any shell in this repo. Verify with
`Get-CimInstance Win32_Process -Filter "Name = 'python.exe'"` — no process should mention
this repo's path afterwards.

## The page loads (HTTP 200) but is blank or unstyled

**Symptom** — the server answers, but you see raw `{{ $t('title') }}` text, no styling, or an
empty page.

**Cause** — Vue, vue-i18n, Tailwind, jsPDF, and Font Awesome all load from public CDNs at
page load. Offline (or behind a blocking proxy) the HTML arrives but the app never mounts.

**Fix** — restore internet access and hard-reload (Ctrl+F5). This is architectural, not a
regression — see [../04-deployment/deployment.md](../04-deployment/deployment.md) for the
vendoring option if it ever matters.

## The table shows negative "Required KM/Day" or huge numbers

**Symptom** — rows like `-1167 km` or absurd gross values.

**Cause** — the math has no unprofitability guard: `requiredKM = ceil(netPerDay / netPerKm)`
where `netPerKm = earningsPerKm − fuelCost/fuelKm`. If cost per km ≥ earnings per km, the
divisor is zero or negative and the result flips sign or explodes. Known issue, deliberately
left un-"fixed" by the onboarding kit (kit commits don't change app behavior).

**Fix (as a user)** — enter profitable values; the defaults (60 / 400 / 0.70 → cost RM 0.15/km
vs earnings RM 0.70/km) are safe. **Fix (as a developer)** — add a `netPerKm <= 0` guard in
`targetCombinations` and decide whether to skip or flag the combo; keep `exportPDF()` in sync.

## Tailwind console warning

**Symptom** — the browser console says the Tailwind CDN "should not be used in production".

**Cause** — the page uses the Tailwind Play CDN build by design (no build step).

**Fix** — none needed; expected for this repo.

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [../02-setup/getting-started.md](../02-setup/getting-started.md) | The setup steps these symptoms trace back to |
| [../01-overview/architecture.md](../01-overview/architecture.md) | Why the CDN dependency and the math edge case exist |
| [../05-reference/commands.md](../05-reference/commands.md) | The start/stop recipes referenced above |
