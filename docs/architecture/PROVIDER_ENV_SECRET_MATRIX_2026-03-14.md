# Provider Env and Secret Matrix

Date: 2026-03-14
Status: operator-ready baseline

## Purpose

Define exactly which environment variables and secrets are required for:
- local development
- staging / flight test
- production

This matrix covers the current integration layers for:
- `ECHO > LINK`
- Professional Console
- Organisational Core
- `Stripe` checkout + billing webhook posture
- `Cronofy` scheduling / conferencing webhook posture

Template pack:
- `/Users/daniel/Documents/New project/apps/site/.env.local.example`
- `/Users/daniel/Documents/New project/apps/site/.env.staging.example`
- `/Users/daniel/Documents/New project/apps/site/.env.production.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.local.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.staging.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.production.example`

## Storage Rules

### Public frontend envs
Store in the site app env for the relevant deployment target.
These are safe to expose to the browser.

Primary source:
- `/Users/daniel/Documents/New project/apps/site/.env.example`

### Backend secrets
Store server-side only:
- Supabase Edge Function secrets
- Vercel/hosted server env
- never in browser-exposed env files

### Provider credentials
Keep one app set per environment tier whenever the provider supports it:
- `local/dev`
- `staging/test`
- `production/live`

## Environment Matrix

### 1. Local

#### Frontend public env
Required:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ECHO_LINK_ENABLED=false` or `true` if you are actively exercising LINK
- `VITE_ECHO_LINK_START_ENDPOINT`
- `VITE_ECHO_LINK_CALLBACK_ENDPOINT`
- `VITE_ECHO_LINK_RETURN_PATH=/link`
- `VITE_STRIPE_PUBLISHABLE_KEY` using a `test` key only

Optional if exercising more of the shell:
- `VITE_STRIPE_PRICE_MONTHLY`
- `VITE_STRIPE_PRICE_YEARLY`
- `VITE_STRIPE_PRICE_LIFETIME`
- `VITE_STRIPE_PAYMENT_LINK_MONTHLY`
- `VITE_STRIPE_PAYMENT_LINK_YEARLY`
- `VITE_STRIPE_PAYMENT_LINK_LIFETIME`
- provider-specific LINK overrides such as `VITE_ECHO_LINK_OURA_URL`

#### Backend secrets
Required for local webhook and function testing:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ECHO_LINK_DEFAULT_RETURN_PATH=/link`

Optional but recommended for preview/test flows:
- `ECHO_LINK_DEFAULT_INDIVIDUAL_ID`
- `COMPANION_BOOTSTRAP_INDIVIDUAL_ID`

Only if testing providers locally:
- `ECHO_LINK_APPLE_AUTH_URL`
- `ECHO_LINK_GOOGLE_AUTH_URL`
- `ECHO_LINK_OURA_AUTH_URL`
- `ECHO_LINK_WHOOP_AUTH_URL`
- `ECHO_LINK_STRAVA_AUTH_URL`
- `ECHO_LINK_SPOTIFY_AUTH_URL`
- `ECHO_LINK_APPLE_MUSIC_AUTH_URL`
- `CRONOFY_WEBHOOK_SIGNING_SECRET` or `CRONOFY_CLIENT_SECRET`
- `STRIPE_SECRET_KEY` using a `test` key only
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET` or `STRIPE_WEBHOOK_SECRET`

#### Provider posture
Use only:
- Stripe test mode
- Cronofy sandbox/test app if available
- test/dev Apple and Google OAuth apps
- test/dev Oura/Whoop/Strava/Spotify apps where supported

### 2. Staging / Flight Test

#### Frontend public env
Required:
- `VITE_SUPABASE_PROJECT_ID` for staging project
- `VITE_SUPABASE_ANON_KEY` for staging project
- `VITE_ECHO_LINK_ENABLED=true`
- `VITE_ECHO_LINK_START_ENDPOINT`
- `VITE_ECHO_LINK_CALLBACK_ENDPOINT`
- `VITE_ECHO_LINK_RETURN_PATH=/link`
- `VITE_STRIPE_PUBLISHABLE_KEY` using `test` unless staging needs live financial flow
- `VITE_STRIPE_CHECKOUT_SESSION_ENDPOINT`
- `VITE_STRIPE_CHECKOUT_SESSION_CONFIRM_ENDPOINT`

Recommended:
- all three Stripe price refs or payment links for the active pricing paths
- explicit provider override URLs only where a provider cannot use the shared LINK start endpoint cleanly

#### Backend secrets
Required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ECHO_LINK_DEFAULT_RETURN_PATH`
- `ECHO_LINK_DEFAULT_INDIVIDUAL_ID` or `COMPANION_BOOTSTRAP_INDIVIDUAL_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET` or `STRIPE_WEBHOOK_SECRET`
- `CRONOFY_WEBHOOK_SIGNING_SECRET` or `CRONOFY_CLIENT_SECRET`

Required as providers are activated:
- provider auth URLs for each LINK provider being flight tested

#### Provider posture
Recommended:
- Apple/Google apps with staging callback URLs
- Stripe test mode unless real-money validation is explicitly needed
- Cronofy staging/test app where available
- only a small set of real integrations turned on at once for supportability

### 3. Production

#### Frontend public env
Required:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ECHO_LINK_ENABLED=true`
- `VITE_ECHO_LINK_START_ENDPOINT`
- `VITE_ECHO_LINK_CALLBACK_ENDPOINT`
- `VITE_ECHO_LINK_RETURN_PATH=/link`
- `VITE_STRIPE_PUBLISHABLE_KEY` using a `live` key
- `VITE_STRIPE_CHECKOUT_SESSION_ENDPOINT`
- `VITE_STRIPE_CHECKOUT_SESSION_CONFIRM_ENDPOINT`
- active price IDs / payment links for all shipping commercial paths

#### Backend secrets
Required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ECHO_LINK_DEFAULT_RETURN_PATH`
- `STRIPE_SECRET_KEY` using a `live` key
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET` or `STRIPE_WEBHOOK_SECRET`
- `CRONOFY_WEBHOOK_SIGNING_SECRET` or `CRONOFY_CLIENT_SECRET`
- live provider auth URLs for each enabled LINK provider

#### Provider posture
Use:
- production Apple/Google apps
- production Stripe account and webhook endpoints
- production Cronofy app / notification channels
- production Oura/Whoop/Strava/Spotify/Apple Music apps only once support and consent flows are ready

## Provider-by-Provider Summary

### Apple
Public env:
- optional `VITE_ECHO_LINK_APPLE_URL` if not using shared LINK start route

Backend secrets:
- `ECHO_LINK_APPLE_AUTH_URL`

### Google
Public env:
- optional `VITE_ECHO_LINK_GOOGLE_URL`

Backend secrets:
- `ECHO_LINK_GOOGLE_AUTH_URL`

### Oura
Public env:
- optional `VITE_ECHO_LINK_OURA_URL`

Backend secrets:
- `ECHO_LINK_OURA_AUTH_URL`

### Whoop
Public env:
- optional `VITE_ECHO_LINK_WHOOP_URL`

Backend secrets:
- `ECHO_LINK_WHOOP_AUTH_URL`

### Strava
Public env:
- optional `VITE_ECHO_LINK_STRAVA_URL`

Backend secrets:
- `ECHO_LINK_STRAVA_AUTH_URL`

### Spotify
Public env:
- optional `VITE_ECHO_LINK_SPOTIFY_URL`

Backend secrets:
- `ECHO_LINK_SPOTIFY_AUTH_URL`

### Apple Music
Public env:
- optional `VITE_ECHO_LINK_APPLE_MUSIC_URL`

Backend secrets:
- `ECHO_LINK_APPLE_MUSIC_AUTH_URL`

### Cronofy
Public env:
- none required directly

Backend secrets:
- `CRONOFY_WEBHOOK_SIGNING_SECRET` or `CRONOFY_CLIENT_SECRET`

### Stripe
Public env:
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_CHECKOUT_SESSION_ENDPOINT`
- `VITE_STRIPE_CHECKOUT_SESSION_CONFIRM_ENDPOINT`
- price IDs / payment links as needed

Backend secrets:
- `STRIPE_SECRET_KEY`
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET` or `STRIPE_WEBHOOK_SECRET`

## Activation Guidance

### First install wave
- Apple
- Google
- Cronofy
- Stripe

### Second wave
- Oura
- Whoop
- Strava
- Spotify
- Apple Music

### Later wave
- HealthKit
- Health Connect
- Screen Time
- Focus Modes
- Garmin
- Coros

## Operational Notes

- Never reuse `live` Stripe secrets in local or staging.
- Keep callback URLs environment-specific.
- Treat staging as a real rehearsal: use realistic but bounded provider activation.
- Do not mark providers active in UI just because credentials exist; the runtime should reflect real connection state.
- `deno` is worth installing locally so function checks can run before deploy.
