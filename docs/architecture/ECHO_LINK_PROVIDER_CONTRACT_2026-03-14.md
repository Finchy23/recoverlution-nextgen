# ECHO LINK Provider Contract

Date: 2026-03-14
Status: foundation scaffold

## Purpose

Define the operational contract for `ECHO > LINK` so provider rollout uses one shared model across:

- Supabase
- `navigate-runtime`
- site/platform backend
- future frontend LINK shell

## Canonical Layers

### Supabase

Source of truth for:

- `integration_provider_catalog`
- `integration_accounts`
- `integration_consent`
- `external_signal_contracts`
- `v_external_signal_integration_health`

### Runtime package

Shared authority for:

- provider catalog
- domain grouping
- manifest compilation
- connect-route building

Files:

- `/Users/daniel/Documents/New project/packages/navicue-engine/src/runtime/echo-link-runtime.ts`
- `/Users/daniel/Documents/New project/packages/navicue-engine/src/runtime/echo-link-routes.ts`
- `/Users/daniel/Documents/New project/packages/types/src/runtime-services.ts`

### Site/platform backend

Mirror consumer for:

- provider launch urls
- site env posture
- return path and connect intent building

Files:

- `/Users/daniel/Documents/New project/apps/site/src/echo-link-runtime.ts`
- `/Users/daniel/Documents/New project/apps/site/src/echo-link-routes.ts`
- `/Users/daniel/Documents/New project/apps/site/src/app/integrations/config.ts`

## Provider Groups

- `identity_gate`
- `biology`
- `recovery`
- `movement`
- `attention`
- `frequency`

## Route Contract

Default provider connect route:

- `/link/start?provider=...&individual_id=...&return_path=...&source_surface=...`

The site can override per-provider start urls through env:

- `VITE_ECHO_LINK_*_URL`

If no explicit provider url exists:

- the shared route builder falls back to `VITE_ECHO_LINK_START_ENDPOINT`

## Env Contract

Current site env keys:

- `VITE_ECHO_LINK_ENABLED`
- `VITE_ECHO_LINK_START_ENDPOINT`
- `VITE_ECHO_LINK_RETURN_PATH`
- `VITE_ECHO_LINK_APPLE_URL`
- `VITE_ECHO_LINK_GOOGLE_URL`
- `VITE_ECHO_LINK_HEALTHKIT_URL`
- `VITE_ECHO_LINK_HEALTH_CONNECT_URL`
- `VITE_ECHO_LINK_OURA_URL`
- `VITE_ECHO_LINK_WHOOP_URL`
- `VITE_ECHO_LINK_STRAVA_URL`
- `VITE_ECHO_LINK_GARMIN_URL`
- `VITE_ECHO_LINK_COROS_URL`
- `VITE_ECHO_LINK_SCREEN_TIME_URL`
- `VITE_ECHO_LINK_FOCUS_MODES_URL`
- `VITE_ECHO_LINK_SPOTIFY_URL`
- `VITE_ECHO_LINK_APPLE_MUSIC_URL`

## Rollout Order

1. `apple`
2. `google`
3. `oura`
4. `whoop`
5. `strava`
6. `spotify`
7. `apple_music`

Then:

- `healthkit`
- `health_connect`
- `screen_time`
- `focus_modes`

Then partner-only:

- `garmin`
- `coros`

## Not In Scope Yet

- token vault implementation
- refresh-token rotation
- webhook ingestion
- native mobile bridge implementation
- LINK surface UI binding
