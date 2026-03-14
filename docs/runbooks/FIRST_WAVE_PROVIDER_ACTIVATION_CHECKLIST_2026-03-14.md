# First-Wave Provider Activation Checklist

Date: 2026-03-14
Status: operator-ready
Scope: Apple, Google, Cronofy, Stripe

This is the concrete source-of-values checklist for the first real provider activation wave.
It is written against the current Recoverlution stack:
- Supabase Edge Functions for LINK and provider webhooks
- `echo-link-start`
- `echo-link-callback`
- `cronofy-console-core-webhook`
- `stripe-console-core-webhook`

Canonical companion docs:
- `/Users/daniel/Documents/New project/docs/architecture/PROVIDER_ENV_SECRET_MATRIX_2026-03-14.md`
- `/Users/daniel/Documents/New project/docs/runbooks/PROVIDER_INSTALL_SEQUENCE_2026-03-14.md`
- `/Users/daniel/Documents/New project/docs/architecture/ECHO_LINK_PROVIDER_CONTRACT_2026-03-14.md`
- `/Users/daniel/Documents/New project/docs/architecture/PROFESSIONAL_CONSOLE_ORG_CORE_PROVIDER_SYNC_LAYER_2026-03-14.md`

Updated secret templates:
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.local.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.staging.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.production.example`

## Shared platform values we already know

### Dev project
- Supabase project ref: `wzeqlkbmqxlsjryidagf`
- LINK callback URL: `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/echo-link-callback`
- Cronofy webhook URL: `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/cronofy-console-core-webhook`
- Stripe webhook URL: `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/stripe-console-core-webhook`

### Staging URL pattern
- LINK callback URL: `https://<staging-project-ref>.supabase.co/functions/v1/echo-link-callback`
- Cronofy webhook URL: `https://<staging-project-ref>.supabase.co/functions/v1/cronofy-console-core-webhook`
- Stripe webhook URL: `https://<staging-project-ref>.supabase.co/functions/v1/stripe-console-core-webhook`

### Production URL pattern
- LINK callback URL: `https://<production-project-ref>.supabase.co/functions/v1/echo-link-callback`
- Cronofy webhook URL: `https://<production-project-ref>.supabase.co/functions/v1/cronofy-console-core-webhook`
- Stripe webhook URL: `https://<production-project-ref>.supabase.co/functions/v1/stripe-console-core-webhook`

## Activation rule

For each provider, source the values first, then decide whether each value belongs in:
- current envs already consumed by code
- reserved envs for the next code-exchange pass
- provider dashboard configuration only

Do not invent missing values during activation.

## 1. Apple

### Source from Apple Developer
Required:
- Apple Developer team access with permissions to manage Sign in with Apple
- `Team ID`
- `Primary App ID` / bundle identifier with Sign in with Apple enabled
- `Services ID` for web auth (`client_id` for Apple web flows)
- `Sign in with Apple private key` (`.p8`)
- `Key ID` for that private key
- `Return URL(s)` for each environment
- `Domain(s)` for each environment if Apple web config requires them

### Platform values to prepare
Current env consumed now:
- `ECHO_LINK_APPLE_AUTH_URL`

Reserved envs to fill now for next pass:
- `ECHO_LINK_APPLE_CLIENT_ID`
- `ECHO_LINK_APPLE_TEAM_ID`
- `ECHO_LINK_APPLE_KEY_ID`
- `ECHO_LINK_APPLE_PRIVATE_KEY`
- `ECHO_LINK_APPLE_REDIRECT_URI`

### Exact callback value to register
- Dev: `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/echo-link-callback`
- Staging: `https://<staging-project-ref>.supabase.co/functions/v1/echo-link-callback`
- Production: `https://<production-project-ref>.supabase.co/functions/v1/echo-link-callback`

### Notes
- Apple auth URL itself is assembled from the values above. Do not hand-type it if we can compose it deterministically next pass.
- The private key belongs in server-side secrets only.
- If we also use Apple for main site auth outside LINK, keep those callback URLs and app config clearly separated from the LINK callback.

### Official references
- [Create a Sign in with Apple private key](https://developer.apple.com/help/account/configure-app-capabilities/create-a-sign-in-with-apple-private-key/)
- [Configure Sign in with Apple for the web](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web)

## 2. Google

### Source from Google Cloud
Required:
- Google Cloud project for Recoverlution auth
- OAuth consent screen app name/support email/domain setup
- `OAuth 2.0 Web Client ID`
- `OAuth 2.0 Client Secret`
- `Authorized redirect URI(s)` per environment
- Optional if browser-based sign-in is also used directly: `Authorized JavaScript origins`

### Platform values to prepare
Current env consumed now:
- `ECHO_LINK_GOOGLE_AUTH_URL`

Reserved envs to fill now for next pass:
- `ECHO_LINK_GOOGLE_CLIENT_ID`
- `ECHO_LINK_GOOGLE_CLIENT_SECRET`
- `ECHO_LINK_GOOGLE_REDIRECT_URI`

### Exact callback value to register
- Dev: `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/echo-link-callback`
- Staging: `https://<staging-project-ref>.supabase.co/functions/v1/echo-link-callback`
- Production: `https://<production-project-ref>.supabase.co/functions/v1/echo-link-callback`

### Notes
- For LINK, the critical values are client ID, client secret, and redirect URI.
- If site-level Google sign-in is also enabled via Supabase Auth, keep that config distinct from the LINK provider exchange so the two paths don’t get muddled.
- Recommended first-wave scope for LINK identity is the minimum required identity profile scope, not broader calendar/mail scope.

### Official references
- [Using OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)

## 3. Cronofy

### Source from Cronofy
Required:
- Cronofy application per environment
- `Client ID`
- `Client Secret`
- Authorization base URL / data-center app URL if not default
- `Redirect URI` for OAuth return
- `Webhook / notification callback URL`

### Platform values to prepare
Current env consumed now:
- `CRONOFY_CLIENT_SECRET`
- `CRONOFY_WEBHOOK_SIGNING_SECRET` (if issued/used separately)

Reserved envs to fill now for next pass:
- `CRONOFY_CLIENT_ID`
- `CRONOFY_REDIRECT_URI`
- `CRONOFY_AUTH_URL`

### Exact callback values to register
OAuth redirect:
- Dev: `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/echo-link-callback`
- Staging: `https://<staging-project-ref>.supabase.co/functions/v1/echo-link-callback`
- Production: `https://<production-project-ref>.supabase.co/functions/v1/echo-link-callback`

Webhook / notification callback:
- Dev: `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/cronofy-console-core-webhook`
- Staging: `https://<staging-project-ref>.supabase.co/functions/v1/cronofy-console-core-webhook`
- Production: `https://<production-project-ref>.supabase.co/functions/v1/cronofy-console-core-webhook`

### Notes
- Our current webhook verifier can use `CRONOFY_WEBHOOK_SIGNING_SECRET` if we have a dedicated signing secret, or `CRONOFY_CLIENT_SECRET` as the HMAC source if that’s how the app is configured.
- Cronofy expects a public HTTPS callback and a fast `2xx` response.
- First wave should only activate one org and one practitioner calendar path at a time.

### Official references
- [Individual authorization](https://docs.cronofy.com/developers/authorization/individual-connect/)
- [Push notifications](https://docs.cronofy.com/developers/api/push-notifications/)
- [Real-time scheduling](https://docs.cronofy.com/developers/api/scheduling/real-time-scheduling/)

## 4. Stripe

### Source from Stripe Dashboard
Required:
- `Publishable key` per environment
- `Secret key` per environment
- `Webhook signing secret` for each webhook endpoint
- If checkout is in active use: `Price IDs` and/or `Payment Link URLs`

Optional next-pass value:
- `Stripe account ID` if we need explicit account targeting in ops scripts or multi-account handling

### Platform values to prepare
Frontend env consumed now:
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_CHECKOUT_SESSION_ENDPOINT`
- `VITE_STRIPE_CHECKOUT_SESSION_CONFIRM_ENDPOINT`
- `VITE_STRIPE_PRICE_MONTHLY`
- `VITE_STRIPE_PRICE_YEARLY`
- `VITE_STRIPE_PRICE_LIFETIME`
- `VITE_STRIPE_PAYMENT_LINK_MONTHLY`
- `VITE_STRIPE_PAYMENT_LINK_YEARLY`
- `VITE_STRIPE_PAYMENT_LINK_LIFETIME`

Backend secrets consumed now:
- `STRIPE_SECRET_KEY`
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET`
- `STRIPE_WEBHOOK_SECRET`

Reserved env to fill now for next pass:
- `STRIPE_ACCOUNT_ID`

### Exact webhook values to register
- Dev: `https://wzeqlkbmqxlsjryidagf.supabase.co/functions/v1/stripe-console-core-webhook`
- Staging: `https://<staging-project-ref>.supabase.co/functions/v1/stripe-console-core-webhook`
- Production: `https://<production-project-ref>.supabase.co/functions/v1/stripe-console-core-webhook`

### Notes
- Keep test and live webhook endpoints and signing secrets separate.
- The webhook endpoint is already verified to reject invalid signatures cleanly with `400`.
- If we move to Connect payouts, that is a follow-on pass, not part of first-wave activation.

### Official references
- [Webhook signatures](https://docs.stripe.com/webhooks/signature)
- [Webhooks](https://docs.stripe.com/webhooks)
- [API keys](https://docs.stripe.com/keys)

## Environment destination matrix

### Site envs
- `/Users/daniel/Documents/New project/apps/site/.env.local.example`
- `/Users/daniel/Documents/New project/apps/site/.env.staging.example`
- `/Users/daniel/Documents/New project/apps/site/.env.production.example`

Populate there now:
- `VITE_STRIPE_PUBLISHABLE_KEY`
- checkout/session endpoints
- price IDs / payment links if commercial flows are active
- optional `VITE_ECHO_LINK_*_URL` only if we intentionally override the shared LINK route in the UI

### Function/server envs
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.local.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.staging.example`
- `/Users/daniel/Documents/New project/services/supabase/.env.functions.production.example`

Populate there now:
- `ECHO_LINK_APPLE_AUTH_URL`
- `ECHO_LINK_GOOGLE_AUTH_URL`
- `CRONOFY_CLIENT_SECRET`
- `CRONOFY_WEBHOOK_SIGNING_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET`

Populate there now for the next exchange pass even though code is not using them yet:
- `ECHO_LINK_APPLE_CLIENT_ID`
- `ECHO_LINK_APPLE_TEAM_ID`
- `ECHO_LINK_APPLE_KEY_ID`
- `ECHO_LINK_APPLE_PRIVATE_KEY`
- `ECHO_LINK_APPLE_REDIRECT_URI`
- `ECHO_LINK_GOOGLE_CLIENT_ID`
- `ECHO_LINK_GOOGLE_CLIENT_SECRET`
- `ECHO_LINK_GOOGLE_REDIRECT_URI`
- `CRONOFY_CLIENT_ID`
- `CRONOFY_REDIRECT_URI`
- `CRONOFY_AUTH_URL`
- `STRIPE_ACCOUNT_ID`

## Execution order

1. Source Apple values
2. Source Google values
3. Source Cronofy values
4. Source Stripe values
5. Fill staging templates completely
6. Register staging callbacks/webhooks in each provider dashboard
7. Activate Google + Stripe first
8. Activate Apple + Cronofy second

## Definition of done for first-wave sourcing

We are ready for first real activation when all of these are true:
- Apple values are sourced and recorded in secure storage
- Google values are sourced and recorded in secure storage
- Cronofy values are sourced and recorded in secure storage
- Stripe values are sourced and recorded in secure storage
- staging callback URLs are registered in each provider dashboard
- staging envs are fully populated for site and functions
