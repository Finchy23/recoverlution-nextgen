# System Gap Analysis

Generated: 2026-03-06T12:23:20.672Z

- Score: **76**
- Checks: **17**
- Failed: **4** (critical: 0, major: 2, minor: 2)

## Results

| Status | Severity | Area | Check | Evidence |
|---|---|---|---|---|
| FAIL | major | Observability | PostHog integration module + startup wiring detected | apps/design-center/src/main.tsx + src/app/observability/posthog.ts |
| FAIL | major | Observability | Sentry integration module + startup wiring detected | apps/design-center/src/main.tsx + src/app/observability/sentry.ts |
| FAIL | minor | Observability | Event taxonomy module exists | apps/design-center/src/app/observability/events.ts |
| FAIL | minor | Platform Integrations | OneSignal + Stripe + JW Player integration modules exist | apps/design-center/src/app/integrations/onesignal.ts + src/app/integrations/stripe.ts + src/app/integrations/jwplayer.ts |
| PASS | critical | Delivery QA | Design Center has quality scripts | apps/design-center/package.json scripts |
| PASS | critical | Governance | SSOT manifest exists | system/source-of-truth.manifest.json |
| PASS | critical | Governance | SSOT guard script exists | scripts/ssot-guard.sh |
| PASS | major | Content Pipeline | Active Lab window is structurally complete (4001-5000) | found 10 active files and 1000 cues |
| PASS | major | Delivery QA | PR gate workflow exists | .github/workflows/navicue-pr-gate.yml |
| PASS | major | Delivery QA | Nightly QA workflow exists | .github/workflows/navicue-nightly-qa.yml |
| PASS | major | Design System Ops | Design Center token export is present | apps/design-center/tokens/design-tokens.flat.json |
| PASS | major | Governance | Root scripts include readiness + qa + hooks installer | package.json scripts: readiness, qa, hooks:install |
| PASS | major | Governance | Account readiness gate script exists | scripts/account-readiness.mjs |
| PASS | minor | Design System Ops | Prettier config in Design Center | apps/design-center/.prettierrc.json |
| PASS | minor | Developer Experience | Pre-commit hook exists | .githooks/pre-commit |
| PASS | minor | Observability | Observability env contract documented | apps/design-center/.env.example + docs/runbooks/OBSERVABILITY_SETUP.md |
| PASS | minor | Release Management | Vercel release runbook exists | docs/runbooks/VERCEL_RELEASE_RUNBOOK.md |

## Priority Actions

1. [major] PostHog integration module + startup wiring detected -- Wire PostHog in app entrypoint and document core event taxonomy.
2. [major] Sentry integration module + startup wiring detected -- Initialize Sentry in app entrypoint for frontend crash triage.
3. [minor] Event taxonomy module exists -- Create a centralized event taxonomy and shared event helpers.
4. [minor] OneSignal + Stripe + JW Player integration modules exist -- Create shared integration modules so notifications and billing stay modular.
