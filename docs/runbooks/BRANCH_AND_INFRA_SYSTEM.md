# Branch And Infra System

## Objective
Run parallel component/token/product streams without collisions, while keeping production release safety deterministic.

## Branch model

- Base branch: `main`
- Workstream branch prefix: `codex/`
- One branch = one stream objective (small and shippable)

### Stream lanes

- `tokens`: design tokens + variable architecture
- `components`: component library + interaction primitives
- `navicue`: NaviCue runtime and specimen quality
- `auth`: identity, OAuth, session contracts
- `billing`: Stripe/RevenueCat entitlement stack
- `mobile`: React Native + store release path
- `infra`: CI/CD, QA, release automation
- `growth`: analytics, feature flags, experimentation

## Branch creation workflow

Dry-run plan:

```bash
node ./scripts/create-workstream-branch.mjs --stream components --name motion-surface-v1
```

Create branch + switch:

```bash
node ./scripts/create-workstream-branch.mjs --stream components --name motion-surface-v1 --create
```

Create branch + worktree + preview env sync:

```bash
node ./scripts/create-workstream-branch.mjs \
  --stream components \
  --name motion-surface-v1 \
  --create \
  --with-worktree \
  --preview-sync
```

## Production readiness gates

Local:

```bash
npm run accounts:check:strict
npm run quality:gaps
npm run infra:check
npm run vercel:topology:strict
```

Release prep:

```bash
npm run release:apple
```

## Required infrastructure controls

- PR gate workflow active (`.github/workflows/navicue-pr-gate.yml`)
- Nightly QA workflow active (`.github/workflows/navicue-nightly-qa.yml`)
- Release gate workflow active (`.github/workflows/release-gate.yml`)
- Vercel env sync script (`scripts/vercel-account-sync.mjs`)
- Multi-project sync runner (`scripts/vercel-multi-project-sync.mjs`)
- Vercel project registry (`infra/vercel/project-registry.json`)
- Account readiness strict gate (`scripts/account-readiness.mjs`)

## Multi-project operations

Topology check:

```bash
npm run vercel:topology
```

Strict topology gate:

```bash
npm run vercel:topology:strict
```

Sync env vars for all `envSync=true` projects:

```bash
npm run vercel:sync:all
```

Dry-run sync:

```bash
npm run vercel:sync:all:dry-run
```

## Non-negotiables

- Never put server secrets in `VITE_*` vars.
- Use `SENTRY_AUTH_TOKEN` for CI/API; use `VITE_SENTRY_DSN` for frontend runtime.
- Use `VITE_STRIPE_PUBLISHABLE_KEY` on frontend; `STRIPE_SECRET_KEY` server-side only.
- Keep each stream branch focused to one bounded objective.
