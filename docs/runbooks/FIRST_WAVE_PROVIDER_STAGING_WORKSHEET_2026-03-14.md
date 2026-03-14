# First-Wave Provider Staging Worksheet

Date: 2026-03-14
Status: fill-in worksheet
Scope: staging activation for Apple, Google, Cronofy, Stripe

Purpose:
- give operators one literal worksheet for sourcing and registering first-wave provider values
- map every sourced value to the exact staging env or provider dashboard field it belongs to
- remove translation work between the activation checklist, env templates, and live callback/webhook URLs

Companion docs:
- `/Users/daniel/Documents/New project/docs/runbooks/FIRST_WAVE_PROVIDER_ACTIVATION_CHECKLIST_2026-03-14.md`
- `/Users/daniel/Documents/New project/docs/runbooks/PROVIDER_INSTALL_SEQUENCE_2026-03-14.md`
- `/Users/daniel/Documents/New project/docs/architecture/PROVIDER_ENV_SECRET_MATRIX_2026-03-14.md`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.staging.example`
- `/Users/daniel/Documents/New project/apps/site/.env.staging.example`

## Staging preflight

Fill these first. The rest of the worksheet depends on them.

### Platform identity
- Staging site origin:
- Staging site base domain:
- Staging Supabase project ref:
- Staging Supabase URL:
- Staging site app env value: `staging`

### Derived public URLs
- LINK start endpoint:
- LINK callback endpoint:
- Cronofy webhook endpoint:
- Stripe webhook endpoint:
- Stripe checkout session endpoint:
- Stripe checkout confirm endpoint:

### Expected staging patterns
- LINK callback endpoint: `https://<staging-project-ref>.supabase.co/functions/v1/echo-link-callback`
- Cronofy webhook endpoint: `https://<staging-project-ref>.supabase.co/functions/v1/cronofy-console-core-webhook`
- Stripe webhook endpoint: `https://<staging-project-ref>.supabase.co/functions/v1/stripe-console-core-webhook`

## Site staging env worksheet

Source file:
- `/Users/daniel/Documents/New project/apps/site/.env.staging.example`

Populate these values before enabling the first wave.

### Core site values
- `VITE_APP_ENV=`
- `VITE_SUPABASE_PROJECT_ID=`
- `VITE_SUPABASE_ANON_KEY=`
- `VITE_ECHO_LINK_ENABLED=`
- `VITE_ECHO_LINK_START_ENDPOINT=`
- `VITE_ECHO_LINK_CALLBACK_ENDPOINT=`
- `VITE_ECHO_LINK_RETURN_PATH=`

### Companion auth values
- `VITE_COMPANION_AUTH_MODE=`
- `VITE_COMPANION_AUTH_GOOGLE_ENABLED=`
- `VITE_COMPANION_AUTH_APPLE_ENABLED=`
- `VITE_COMPANION_AUTH_REDIRECT_PATH=`
- `VITE_COMPANION_AUTH_PREVIEW_ORIGIN=`

### Stripe public values
- `VITE_STRIPE_PUBLISHABLE_KEY=`
- `VITE_STRIPE_CHECKOUT_SESSION_ENDPOINT=`
- `VITE_STRIPE_CHECKOUT_SESSION_CONFIRM_ENDPOINT=`
- `VITE_STRIPE_SUCCESS_PATH=`
- `VITE_STRIPE_CANCEL_PATH=`
- `VITE_STRIPE_PRICE_MONTHLY=`
- `VITE_STRIPE_PRICE_YEARLY=`
- `VITE_STRIPE_PRICE_LIFETIME=`
- `VITE_STRIPE_PAYMENT_LINK_MONTHLY=`
- `VITE_STRIPE_PAYMENT_LINK_YEARLY=`
- `VITE_STRIPE_PAYMENT_LINK_LIFETIME=`

### Optional provider URL overrides
Leave blank unless UI needs a provider-specific override.
- `VITE_ECHO_LINK_APPLE_URL=`
- `VITE_ECHO_LINK_GOOGLE_URL=`

## Function staging env worksheet

Source file:
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.staging.example`

Populate these values before staging deployment.

### Core function values
- `SUPABASE_URL=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `ECHO_LINK_DEFAULT_RETURN_PATH=`
- `ECHO_LINK_DEFAULT_INDIVIDUAL_ID=`
- `COMPANION_BOOTSTRAP_INDIVIDUAL_ID=`

### Current provider values used by code now
- `ECHO_LINK_APPLE_AUTH_URL=`
- `ECHO_LINK_GOOGLE_AUTH_URL=`
- `CRONOFY_CLIENT_SECRET=`
- `CRONOFY_WEBHOOK_SIGNING_SECRET=`
- `STRIPE_SECRET_KEY=`
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET=`
- `STRIPE_WEBHOOK_SECRET=`

### Reserved values to source now for the next exchange pass
- `ECHO_LINK_APPLE_CLIENT_ID=`
- `ECHO_LINK_APPLE_TEAM_ID=`
- `ECHO_LINK_APPLE_KEY_ID=`
- `ECHO_LINK_APPLE_PRIVATE_KEY=`
- `ECHO_LINK_APPLE_REDIRECT_URI=`
- `ECHO_LINK_GOOGLE_CLIENT_ID=`
- `ECHO_LINK_GOOGLE_CLIENT_SECRET=`
- `ECHO_LINK_GOOGLE_REDIRECT_URI=`
- `CRONOFY_CLIENT_ID=`
- `CRONOFY_REDIRECT_URI=`
- `CRONOFY_AUTH_URL=`
- `STRIPE_ACCOUNT_ID=`

## Provider section: Apple

### Source from Apple Developer
- Team ID:
- App ID / bundle identifier:
- Services ID:
- Key ID:
- Private key file location:
- Private key fingerprint or note:
- Staging return URL registered:
- Staging domain registered:

### Exact staging values
- `ECHO_LINK_APPLE_CLIENT_ID=`
- `ECHO_LINK_APPLE_TEAM_ID=`
- `ECHO_LINK_APPLE_KEY_ID=`
- `ECHO_LINK_APPLE_PRIVATE_KEY=`
- `ECHO_LINK_APPLE_REDIRECT_URI=`
- `ECHO_LINK_APPLE_AUTH_URL=`

### Provider dashboard registration
- Registered return URL:
- Registered web domain:
- Services ID confirmed:
- Sign in with Apple capability enabled on App ID: `yes / no`

### Placement
- Function envs now:
  - `ECHO_LINK_APPLE_AUTH_URL`
- Function envs reserved now for next pass:
  - `ECHO_LINK_APPLE_CLIENT_ID`
  - `ECHO_LINK_APPLE_TEAM_ID`
  - `ECHO_LINK_APPLE_KEY_ID`
  - `ECHO_LINK_APPLE_PRIVATE_KEY`
  - `ECHO_LINK_APPLE_REDIRECT_URI`

### Staging signoff
- Apple values sourced:
- Apple callback registered:
- Apple secret stored server-side only:
- Apple auth URL ready:

## Provider section: Google

### Source from Google Cloud
- Google Cloud project name:
- OAuth consent screen app name:
- Support email:
- OAuth client ID:
- OAuth client secret:
- Authorized redirect URI registered:
- Authorized JavaScript origin registered if needed:

### Exact staging values
- `ECHO_LINK_GOOGLE_CLIENT_ID=`
- `ECHO_LINK_GOOGLE_CLIENT_SECRET=`
- `ECHO_LINK_GOOGLE_REDIRECT_URI=`
- `ECHO_LINK_GOOGLE_AUTH_URL=`

### Provider dashboard registration
- Authorized redirect URI:
- Authorized JavaScript origin:
- Consent screen published or test-user ready:

### Placement
- Function envs now:
  - `ECHO_LINK_GOOGLE_AUTH_URL`
- Function envs reserved now for next pass:
  - `ECHO_LINK_GOOGLE_CLIENT_ID`
  - `ECHO_LINK_GOOGLE_CLIENT_SECRET`
  - `ECHO_LINK_GOOGLE_REDIRECT_URI`

### Staging signoff
- Google values sourced:
- Google callback registered:
- Google auth URL ready:
- Minimal scope posture confirmed:

## Provider section: Cronofy

### Source from Cronofy
- Cronofy app name:
- Cronofy client ID:
- Cronofy client secret:
- Cronofy auth URL or data-center base:
- Cronofy redirect URI:
- Cronofy webhook signing secret:
- Cronofy notification endpoint registered:

### Exact staging values
- `CRONOFY_CLIENT_ID=`
- `CRONOFY_CLIENT_SECRET=`
- `CRONOFY_REDIRECT_URI=`
- `CRONOFY_AUTH_URL=`
- `CRONOFY_WEBHOOK_SIGNING_SECRET=`

### Provider dashboard registration
- OAuth redirect URI:
- Webhook endpoint:
- Notification signing secret copied:

### Placement
- Function envs now:
  - `CRONOFY_CLIENT_SECRET`
  - `CRONOFY_WEBHOOK_SIGNING_SECRET`
- Function envs reserved now for next pass:
  - `CRONOFY_CLIENT_ID`
  - `CRONOFY_REDIRECT_URI`
  - `CRONOFY_AUTH_URL`

### Staging signoff
- Cronofy values sourced:
- Cronofy redirect registered:
- Cronofy webhook registered:
- Cronofy signature secret stored:

## Provider section: Stripe

### Source from Stripe Dashboard
- Stripe mode for staging: `test`
- Publishable key:
- Secret key:
- Webhook signing secret:
- Monthly price ID:
- Yearly price ID:
- Lifetime price ID:
- Monthly payment link:
- Yearly payment link:
- Lifetime payment link:
- Stripe account ID if applicable:

### Exact staging values
- `VITE_STRIPE_PUBLISHABLE_KEY=`
- `VITE_STRIPE_PRICE_MONTHLY=`
- `VITE_STRIPE_PRICE_YEARLY=`
- `VITE_STRIPE_PRICE_LIFETIME=`
- `VITE_STRIPE_PAYMENT_LINK_MONTHLY=`
- `VITE_STRIPE_PAYMENT_LINK_YEARLY=`
- `VITE_STRIPE_PAYMENT_LINK_LIFETIME=`
- `STRIPE_SECRET_KEY=`
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET=`
- `STRIPE_WEBHOOK_SECRET=`
- `STRIPE_ACCOUNT_ID=`

### Provider dashboard registration
- Webhook endpoint:
- Events subscribed:
- Signing secret copied:
- Price IDs confirmed:
- Payment links confirmed:

### Placement
- Site envs now:
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `VITE_STRIPE_PRICE_MONTHLY`
  - `VITE_STRIPE_PRICE_YEARLY`
  - `VITE_STRIPE_PRICE_LIFETIME`
  - `VITE_STRIPE_PAYMENT_LINK_MONTHLY`
  - `VITE_STRIPE_PAYMENT_LINK_YEARLY`
  - `VITE_STRIPE_PAYMENT_LINK_LIFETIME`
- Function envs now:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET`
  - `STRIPE_WEBHOOK_SECRET`
- Function envs reserved now for next pass:
  - `STRIPE_ACCOUNT_ID`

### Staging signoff
- Stripe values sourced:
- Stripe webhook registered:
- Stripe test keys confirmed:
- Price IDs or payment links loaded:

## Deployment handoff

Once every provider section is complete:
1. populate `/Users/daniel/Documents/New project/apps/site/.env.staging.example` into the actual staging site env store
2. populate `/Users/daniel/Documents/New project/services/supabase/.env.functions.staging.example` into the actual staging function secret store
3. deploy or update staging functions
4. register provider callbacks and webhooks
5. run the first-wave smoke checks in this order:
   - Google
   - Stripe
   - Apple
   - Cronofy

## Final staging readiness check
- Staging project ref confirmed:
- Staging site origin confirmed:
- All callback/webhook URLs registered:
- Site staging env populated:
- Function staging env populated:
- Functions deployed after secret update:
- Google activation ready:
- Stripe activation ready:
- Apple activation ready:
- Cronofy activation ready:
