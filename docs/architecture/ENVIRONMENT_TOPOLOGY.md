# Environment Topology

## Target Model

GitHub is the source of truth for code.
Vercel is the delivery plane for web surfaces.

## Projects (Vercel)

1. `recoverlution-design-center`
- live design-system, token, composition, and frontend review surface
- domain target: `design.recoverlution.com`
- current active frontend review runtime

2. `recoverlution-marketing`
- public marketing site and conversion pages
- domain target: `recoverlution.com` / `www.recoverlution.com`
- inactive until marketing rebuild is ready

3. `recoverlution-app`
- authenticated platform shell
- domain target: `app.recoverlution.com`
- inactive until product shell is promoted

4. `recoverlution-analytics`
- internal analytics and reporting surface
- domain target: `analytics.recoverlution.com`
- inactive

5. `recoverlution-command`
- legacy project record only
- domain target: `command.recoverlution.com`
- not an active runtime surface

## Source of Truth

- registry file: `infra/vercel/project-registry.json`
- topology report command: `npm run vercel:topology`
- strict topology gate: `npm run vercel:topology:strict`

Current active review surface in the registry:
- `recoverlution-design-center` rooted at `apps/design-center`

Legacy/inactive:
- `recoverlution-command` rooted at `Command Center Execution Plan`

## Environments per Project

- `development`
- `preview`
- `production`
- `staging`

Optional later:
- `demo`
- `partner-sandbox`

## Promotion Flow

1. `codex/*` branch pushes to GitHub
2. Vercel preview validates stream changes
3. quality gates pass
4. merge to `main`
5. production deploy from `main`

## Non-Negotiables

- no active production assumptions based on legacy folders
- no per-surface backend truths
- no app-level token ownership
- keep internal control surfaces separate from customer-facing surfaces
