# MCP Troubleshooting

## Goal
Keep all required MCP servers available in Codex (GitHub, Figma, Notion, Linear, Supabase, Playwright).

## Quick check

```bash
npm run mcp:check
```

Strict mode (fails on missing auth/config):

```bash
npm run mcp:check:strict
```

## GitHub MCP not appearing

Current config expects:

- Server: `mcp_servers.github`
- Auth env var: `GITHUB_PERSONAL_ACCESS_TOKEN`

If GitHub MCP does not load, the env var is usually missing in GUI app runtime.

## Fix on macOS (GUI app env)

Set token for GUI-launched apps:

```bash
launchctl setenv GITHUB_PERSONAL_ACCESS_TOKEN "<your_pat>"
```

Then fully restart Codex desktop and re-run:

```bash
npm run mcp:check
```

## PAT minimum scopes

- `repo` (private repo read/write as needed)
- `read:org` (if org repos are used)

## Verify in Codex session

- `list_mcp_resources` should include GitHub-backed resources once auth is valid.

