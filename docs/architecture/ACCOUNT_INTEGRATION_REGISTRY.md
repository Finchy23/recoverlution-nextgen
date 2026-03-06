# Account Integration Registry

## Objective
Single source of truth for every external account used by the Recoverlution platform.

## Runtime Integrations (Web)

| Integration | Status in code | Environment keys | Notes |
|---|---|---|---|
| Supabase | Integrated | `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY` | Core data/auth/storage spine |
| PostHog | Integrated | `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | Product analytics |
| Sentry | Integrated | `VITE_SENTRY_DSN`, sample-rate keys | Error + performance monitoring |
| OneSignal | Integrated | `VITE_ONESIGNAL_APP_ID`, `VITE_ONESIGNAL_SAFARI_WEB_ID` | Web push (init is safe-noop if key missing) |
| Stripe | Integrated (module-ready) | `VITE_STRIPE_PUBLISHABLE_KEY` | Billing frontend module ready |
| JW Player | Integrated (module-ready) | `VITE_JWPLAYER_LIBRARY_ID` | Media layer helpers wired in `src/app/integrations/jwplayer.ts` |

## Mobile Integrations (Planned / Contracted)

| Integration | Status | Environment keys | Notes |
|---|---|---|---|
| RevenueCat | Contracted | `REVENUECAT_PUBLIC_API_KEY_IOS`, `REVENUECAT_PUBLIC_API_KEY_ANDROID` | React Native implementation path |

## Operational Integrations

| Integration | Purpose | Implementation surface |
|---|---|---|
| GitHub Actions | CI / quality gates | `.github/workflows/*` |
| Vercel | Deploy previews + prod | `docs/runbooks/VERCEL_RELEASE_RUNBOOK.md` |
| Supabase Edge Functions | API and media surfaces | `Command Center Execution Plan/supabase/functions/*` |

## Enforcement

- Account readiness report: `npm run accounts:check`
- Strict account gate (release): `npm run accounts:check:strict`
- Vercel account sync: `npm run accounts:sync`
- Full release gate: `npm run release:gate`
