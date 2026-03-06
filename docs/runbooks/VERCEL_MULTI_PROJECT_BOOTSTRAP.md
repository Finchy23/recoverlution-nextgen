# Vercel Multi-Project Bootstrap

## Goal
Run four clean deployment surfaces with one command-driven topology:
- `recoverlution-command` (active now)
- `recoverlution-marketing` (reserved)
- `recoverlution-app` (reserved)
- `recoverlution-analytics` (reserved)

Registry source:
- `infra/vercel/project-registry.json`

## 1. Check topology

```bash
npm run vercel:topology
```

Strict gate:

```bash
npm run vercel:topology:strict
```

## 2. Link each Vercel project (one-time)

Use the commands from `docs/reports/vercel-topology.md`, for example:

```bash
cd "Command Center Execution Plan" && npx vercel link --project recoverlution-command
cd "apps/marketing" && npx vercel link --project recoverlution-marketing
cd "apps/web" && npx vercel link --project recoverlution-app
cd "apps/analytics" && npx vercel link --project recoverlution-analytics
```

## 3. Sync env vars

Current active runtime sync:

```bash
npm run accounts:sync
```

Registry-based multi-project sync (`envSync=true` only):

```bash
npm run vercel:sync:all
```

Dry-run:

```bash
npm run vercel:sync:all:dry-run
```

## 4. Release gate

```bash
npm run release:gate
npm run infra:check
```

## Non-negotiables

- Keep `recoverlution-command` as active runtime until migration is complete.
- Do not mark reserved projects `envSync=true` until linked and validated.
- Keep server secrets out of `VITE_*`.
