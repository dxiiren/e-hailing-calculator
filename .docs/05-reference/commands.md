# Commands reference

> **TL;DR** Everything is a `just` recipe. `just start` / `just stop` bracket your day;
> `just serve` for a foreground server; `just open` for the browser. Run bare `just` to list
> all recipes.

## App lifecycle

| Command | What it does | When to use |
| --- | --- | --- |
| `just start` | Serves `http://127.0.0.1:8118` in a background PowerShell window. Runs `stop` first, so a lingering previous server never blocks the port. | Normal dev session start |
| `just serve` | Same server, foreground — Ctrl+C to stop. | When you want the server logs in your face |
| `just stop` | Kills only **this repo's** `python.exe` processes — matched by this repo's path on the process command line. Other projects' servers survive. | End of session; port conflicts |
| `just open` | Opens `http://127.0.0.1:8118` in the default browser. | After `just start` |

## Tools

| Command | What it does |
| --- | --- |
| `just claudex` | Launch Claude Code — Sonnet, all permissions |
| `just claudeo` | Launch Claude Code — Opus, all permissions |
| `just claudeh` | Launch Claude Code — Haiku, all permissions |

## Guard behavior

Recipes that need uv depend on the private `_require-uv` guard: if `uv` is missing from PATH
they fail fast with "Run setup.ps1 first" instead of a cryptic error.

## Port

The port is `8118` by default and can be overridden per-invocation:

```powershell
$env:PORT = "8200"; just start
```

Keep 8118 for normal work — each local repo on this machine has its own assigned port so
several projects can serve side by side.

## One-time / occasional

| Command | What it does |
| --- | --- |
| `pwsh ./setup.ps1` | Idempotent machine bootstrap — installs Git, Node, Claude CLI, uv+Python, just, gh; seeds `.mcp.json` |
| `curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:8118/index.html` | Boot-verify the server (expect `200`) |

## Related docs

| Doc | Why you'd read it |
| --- | --- |
| [project-layout.md](project-layout.md) | Where the files the recipes touch live |
| [../02-setup/getting-started.md](../02-setup/getting-started.md) | First-time setup before any recipe works |
| [../06-troubleshooting/common-issues.md](../06-troubleshooting/common-issues.md) | When a recipe misbehaves |
