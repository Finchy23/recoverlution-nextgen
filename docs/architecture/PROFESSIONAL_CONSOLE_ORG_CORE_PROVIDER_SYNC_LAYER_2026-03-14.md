# Professional Console / Organisational Core Provider Sync Layer

Date: 2026-03-14
Status: provider sync substrate authored

Canonical artifacts:
- `/Users/daniel/Documents/New project/services/supabase/migrations/20260314_professional_console_org_core_provider_sync_foundation.sql`
- `/Users/daniel/Documents/New project/services/supabase/functions/cronofy-console-core-webhook/index.ts`
- `/Users/daniel/Documents/New project/services/supabase/functions/stripe-console-core-webhook/index.ts`

## Purpose

Attach the first provider-sync and webhook layer to the Console/Core foundation.

This layer is responsible for:

- Cronofy notification channels
- Cronofy sync cursors
- Cronofy webhook event audit
- Stripe webhook event audit
- invoice records
- payout records
- provider connection health rollups

## Why This Layer Exists

The foundation migration created the internal operational model.

This migration adds the first provider-facing seam so:

- external changes can be received
- webhook deliveries can be audited
- provider refs do not remain inert strings forever
- invoice and payout state can become first-class platform data

## What It Adds

### Cronofy
- `cronofy_notification_channels`
- `cronofy_sync_cursors`
- `cronofy_webhook_events`
- `cronofy-console-core-webhook` edge function

### Stripe
- `billing_invoice_records`
- `payout_records`
- `stripe_webhook_events`
- `stripe-console-core-webhook` edge function

### Health view
- `v_console_core_provider_connection_health`

## Important Constraints

These webhooks are intentionally conservative.

They do not yet try to perform the entire provider orchestration story.
They do:

- verify signatures when secrets are present
- persist raw events
- map basic subscription / invoice / payout state
- queue the platform for the next sync layer
- expose provider connection health, including most recent webhook receipt time

They do not yet:

- perform Cronofy event-read reconciliation after `changes_since`
- provision conferencing links from booking intent
- manage Stripe Connect onboarding end-to-end
- build payout workflows
- run retry/backoff orchestration beyond provider delivery behavior

## Env Contract

### Cronofy
- `CRONOFY_WEBHOOK_SIGNING_SECRET` or `CRONOFY_CLIENT_SECRET`

Cronofy webhook verification expects the `cronofy-hmac-sha256` header and
compares the request body HMAC using `SHA-256` encoded as `base64`.
Cronofy may send multiple comma-separated signatures during secret rotation, so
the handler accepts any matching digest in the header value.

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_CONSOLE_CORE_WEBHOOK_SECRET` or `STRIPE_WEBHOOK_SECRET`

Stripe webhook verification uses the official signature envelope from the
`stripe-signature` header via `stripe.webhooks.constructEvent(...)`.

## Next Layer

- Cronofy event reconciliation worker using `changes_since`
- scheduling request sync and appointment mutation policy
- Stripe appointment charge mapping
- Stripe Connect onboarding / account-state sync
- operator dashboards over provider health and webhook failures
