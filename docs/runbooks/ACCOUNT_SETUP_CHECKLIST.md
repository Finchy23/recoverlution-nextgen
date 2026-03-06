# Account Setup Checklist

Use this checklist to complete production account wiring.

Create local runtime file first:

```bash
cp "Command Center Execution Plan/.env.example" "Command Center Execution Plan/.env.local"
```

## Required for production gate

| Integration | Key(s) needed | Where to get it |
|---|---|---|
| Sentry | `VITE_SENTRY_DSN` | Sentry project settings -> Client Keys (DSN) |
| Stripe | `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard -> Developers -> API keys |
| JW Player | `VITE_JWPLAYER_LIBRARY_ID` | JW Player dashboard -> player library id |

## Already pre-wired in env template

| Integration | Key(s) |
|---|---|
| Supabase | `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_ANON_KEY` |
| PostHog | `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` |
| OneSignal | `VITE_ONESIGNAL_APP_ID` |
| RevenueCat (mobile) | `REVENUECAT_PUBLIC_API_KEY_IOS`, `REVENUECAT_PUBLIC_API_KEY_ANDROID` |

## Validation commands

```bash
npm run accounts:check
npm run accounts:check:strict
npm run accounts:sync:dry-run
npm run accounts:sync
npm run release:gate
```

## Vercel sync behavior

- `npm run accounts:sync` writes configured keys to `development` and `production` in Vercel.
- To sync preview env vars too, run:

```bash
node ./scripts/vercel-account-sync.mjs --strict --preview-branch <feature-branch>
```

## Report outputs

- `docs/reports/account-readiness.md`
- `docs/reports/account-readiness.json`
