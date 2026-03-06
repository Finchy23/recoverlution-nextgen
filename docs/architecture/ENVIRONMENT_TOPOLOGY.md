# Environment Topology

## Target model
GitHub is source-of-truth for code. Vercel is delivery plane for web surfaces.

## Projects (Vercel)

1. `recoverlution-marketing`
- Public marketing site and conversion pages.
- Domain: `recoverlution.com` / `www`.

2. `recoverlution-app`
- Main authenticated product surface.
- Domain: `app.recoverlution.com`.

3. `recoverlution-design-center`
- Live design-system, token, and composition review surface.
- Domain: `design.recoverlution.com`.

4. `recoverlution-command`
- Command/design hub and lab operations.
- Domain: `command.recoverlution.com`.

5. `recoverlution-data`
- Internal analytics/reporting/insight UI.
- Domain: `data.recoverlution.com`.

6. `recoverlution-growth`
- Internal campaign and lifecycle orchestration surface.
- Domain: `growth.recoverlution.com`.

7. `recoverlution-sales`
- Internal CRM, partner, and deal operations surface.
- Domain: `sales.recoverlution.com`.

## Source Of Truth

- Registry file: `infra/vercel/project-registry.json`
- Topology report command: `npm run vercel:topology`
- Strict topology gate: `npm run vercel:topology:strict`

Current active runtime in registry:
- `recoverlution-command` rooted at `Command Center Execution Plan/`
- `recoverlution-design-center` rooted at `Design System Draft/`

Reserved projects (`marketing`, `app`, `data`, `growth`, `sales`) remain non-active until linked and promoted.

## Environments per project

- `development`: local and internal dev validation.
- `preview`: branch/PR deploys (`codex/*` streams).
- `production`: stable customer-facing release.
- `staging`: pre-production integration environment for internal acceptance and partner-safe validation.

Optional later:
- `demo`: enterprise-safe demonstration surface
- `partner-sandbox`: controlled sandbox for partner workflows

## Branch strategy

- `main` -> production deploy candidate.
- `codex/<stream>-<scope>` -> preview deploy, stream-specific work.
- Use `scripts/create-workstream-branch.mjs` for consistent naming and docs.

## Data/control planes

- Supabase: application data/auth/runtime contracts.
- PostHog: analytics, flags, experiments, session replay.
- Sentry: error + trace observability.
- OneSignal: notifications.
- Stripe / RevenueCat: monetization and entitlements.
- Temporal: durable workflow orchestration.

## Promotion flow

1. Stream branch (`codex/*`) pushes to GitHub.
2. Vercel preview deploy validates stream changes.
3. Quality gates pass (`accounts`, `quality:gaps`, `infra`, `vercel:topology`).
4. Merge to `main`.
5. Production deploy from `main`.

## Non-negotiables

- No secrets in `VITE_*` variables.
- Keep per-project env vars explicit (do not rely on cross-project drift).
- Keep command hub isolated from marketing runtime dependencies.
- Keep internal control surfaces separate from customer-facing product surfaces.
- Do not create isolated backend truths per surface; all surfaces operate on the same governed platform spine.
