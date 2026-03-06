# Observability Setup

## Scope
Frontend observability for Command Center:
- Product analytics via PostHog
- Error and performance monitoring via Sentry

## Required environment variables
Set these in Vercel project env and local `.env` as needed.

- `VITE_APP_ENV` (`development`, `preview`, `production`)
- `VITE_APP_RELEASE` (optional release string, e.g. git SHA)
- `VITE_OBSERVABILITY_DEBUG` (`true`/`false`)
- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST` (default: `https://eu.i.posthog.com`)
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_TRACES_SAMPLE_RATE` (0..1)
- `VITE_SENTRY_SESSION_REPLAY_SAMPLE_RATE` (0..1)
- `VITE_SENTRY_ERROR_REPLAY_SAMPLE_RATE` (0..1)

## Event taxonomy source
All shared event names live in:
- `Command Center Execution Plan/src/app/observability/events.ts`

Current baseline events:
- `app_loaded`
- `route_viewed`
- `navicue_viewed`
- `navicue_completed`
- `lab_filter_applied`
- `command_center_opened`

## Startup wiring
Observability initialization is called in:
- `Command Center Execution Plan/src/main.tsx`

Modules:
- `src/app/observability/posthog.ts`
- `src/app/observability/sentry.ts`
- `src/app/observability/init.ts`

## Verification
1. Run: `npm --prefix "Command Center Execution Plan" run -s build`
2. Run: `npm run quality:gaps`
3. Open app and confirm events in PostHog live events.
4. Trigger a test error in local dev and verify Sentry capture.
