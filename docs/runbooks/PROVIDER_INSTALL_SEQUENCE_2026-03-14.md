# Provider Install Sequence

Date: 2026-03-14
Status: executable baseline

Canonical references:
- `/Users/daniel/Documents/New project/docs/architecture/PROVIDER_ENV_SECRET_MATRIX_2026-03-14.md`
- `/Users/daniel/Documents/New project/docs/architecture/ECHO_LINK_PROVIDER_CONTRACT_2026-03-14.md`
- `/Users/daniel/Documents/New project/docs/architecture/PROFESSIONAL_CONSOLE_ORG_CORE_PROVIDER_SYNC_LAYER_2026-03-14.md`

Template files:
- `/Users/daniel/Documents/New project/apps/site/.env.local.example`
- `/Users/daniel/Documents/New project/apps/site/.env.staging.example`
- `/Users/daniel/Documents/New project/apps/site/.env.production.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.local.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.staging.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.production.example`

## Scope

This runbook covers the first provider install wave:
- Apple
- Google
- Cronofy
- Stripe

## Local

### 1. Copy local templates
```bash
cd '/Users/daniel/Documents/New project'
cp apps/site/.env.local.example apps/site/.env.local
cp services/supabase/.env.functions.local.example services/supabase/.env.functions.local
```

### 2. Fill placeholders
Populate in `apps/site/.env.local`:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY` using a test key

Populate in `services/supabase/.env.functions.local`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` using a test key
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET` after starting `stripe listen`
- `CRONOFY_WEBHOOK_SIGNING_SECRET` or `CRONOFY_CLIENT_SECRET`
- active `ECHO_LINK_*_AUTH_URL` values for the providers being exercised

### 3. Start local Supabase
```bash
cd '/Users/daniel/Documents/New project/services/supabase'
supabase start
supabase db reset
supabase functions serve --env-file .env.functions.local
```

### 4. Start the site
```bash
cd '/Users/daniel/Documents/New project/apps/site'
npm run dev
```

### 5. Test Stripe webhook locally
Start a local listener as documented by Stripe, forwarding to the public webhook function path:
```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-console-core-webhook
```
Use the `whsec_...` value printed by Stripe as `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET`, then trigger sandbox events:
```bash
stripe trigger payment_intent.succeeded
stripe trigger invoice.paid
```

### 6. Test Cronofy webhook locally
Cronofy requires a public callback URL and expects a `2xx` response within 5 seconds. For local testing, expose the Supabase local function URL through your preferred tunnel and use that callback URL when creating a notification channel.

Recommended local callback target:
- `https://<public-tunnel-host>/functions/v1/cronofy-console-core-webhook`

## Staging / Flight Test

### 1. Copy staging templates
```bash
cd '/Users/daniel/Documents/New project'
cp apps/site/.env.staging.example apps/site/.env.staging
cp services/supabase/.env.functions.staging.example services/supabase/.env.functions.staging
```

### 2. Fill staging values
Populate:
- staging Supabase project ref and anon key
- Stripe test publishable + secret keys
- Cronofy staging/test app credentials
- Apple/Google staging callback URLs
- `ECHO_LINK_*_AUTH_URL` values for the first-wave providers

### 3. Push schema to staging
```bash
cd '/Users/daniel/Documents/New project/services/supabase'
supabase db push --project-ref <staging-project-ref>
```

### 4. Push staging function secrets
```bash
cd '/Users/daniel/Documents/New project/services/supabase'
supabase secrets set --env-file .env.functions.staging --project-ref <staging-project-ref>
```

### 5. Deploy public functions
These functions should be deployed without JWT verification because they are callback/start surfaces:
```bash
cd '/Users/daniel/Documents/New project/services/supabase'
supabase functions deploy echo-link-start --no-verify-jwt --project-ref <staging-project-ref>
supabase functions deploy echo-link-callback --no-verify-jwt --project-ref <staging-project-ref>
supabase functions deploy cronofy-console-core-webhook --no-verify-jwt --project-ref <staging-project-ref>
supabase functions deploy stripe-console-core-webhook --no-verify-jwt --project-ref <staging-project-ref>
```

### 6. Set site envs in the staging host
Set values from `apps/site/.env.staging` in the actual site host for the staging deployment.

### 7. Register webhook endpoints
Use the deployed URLs:
- `https://<staging-project-ref>.supabase.co/functions/v1/cronofy-console-core-webhook`
- `https://<staging-project-ref>.supabase.co/functions/v1/stripe-console-core-webhook`

### 8. Smoke check
- connect Apple and Google through `LINK`
- verify `echo-link-start` and `echo-link-callback` round-trip
- send Stripe sandbox events to the staging webhook
- create at least one Cronofy notification channel and verify receipt is reflected in provider health

## Production

### 1. Copy production templates
```bash
cd '/Users/daniel/Documents/New project'
cp apps/site/.env.production.example apps/site/.env.production
cp services/supabase/.env.functions.production.example services/supabase/.env.functions.production
```

### 2. Fill live values
Populate:
- production Supabase project values
- live Stripe publishable + secret keys
- live Cronofy credentials
- live Apple/Google app callback URLs
- only the provider auth URLs we are ready to support operationally

### 3. Push schema to production
```bash
cd '/Users/daniel/Documents/New project/services/supabase'
supabase db push --project-ref <production-project-ref>
```

### 4. Push production function secrets
```bash
cd '/Users/daniel/Documents/New project/services/supabase'
supabase secrets set --env-file .env.functions.production --project-ref <production-project-ref>
```

### 5. Deploy public functions
```bash
cd '/Users/daniel/Documents/New project/services/supabase'
supabase functions deploy echo-link-start --no-verify-jwt --project-ref <production-project-ref>
supabase functions deploy echo-link-callback --no-verify-jwt --project-ref <production-project-ref>
supabase functions deploy cronofy-console-core-webhook --no-verify-jwt --project-ref <production-project-ref>
supabase functions deploy stripe-console-core-webhook --no-verify-jwt --project-ref <production-project-ref>
```

### 6. Set site envs in production host
Set values from `apps/site/.env.production` in the actual production host.

### 7. Register live webhook endpoints
Use the production URLs:
- `https://<production-project-ref>.supabase.co/functions/v1/cronofy-console-core-webhook`
- `https://<production-project-ref>.supabase.co/functions/v1/stripe-console-core-webhook`

### 8. Go-live checks
- confirm Stripe test and live webhooks are separated correctly
- confirm Apple and Google callback URLs match the production host exactly
- confirm Cronofy callback endpoint returns `2xx` rapidly
- verify provider health view populates after live callbacks

## Operator smoke checklist

### LINK
- Apple connect works
- Google connect works
- callback returns to `/link`
- provider account row and transaction row are created

### Console / Core
- Cronofy webhook row appears in `cronofy_webhook_events`
- `v_console_core_provider_connection_health` shows latest webhook receipt time
- Stripe webhook row appears in `stripe_webhook_events`
- invoice and payout rollups update as expected

## Notes

- Keep Stripe test and live keys completely separate.
- Cronofy push notifications require a valid public callback URL and treat non-`2xx` or slow responses as failures.
- `deno` is worth installing locally for function validation before deploy.
