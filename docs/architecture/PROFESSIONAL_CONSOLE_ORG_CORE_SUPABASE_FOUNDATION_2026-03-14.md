# Professional Console / Organisational Core Supabase Foundation

Date: 2026-03-14
Status: foundation migration authored

Canonical migration:
- `/Users/daniel/Documents/New project/services/supabase/migrations/20260314_professional_console_org_core_foundation.sql`

## Purpose

Create the Recoverlution-owned operational substrate for:

- professional identity
- organization membership
- client/patient assignment
- scheduling and booking
- conferencing state
- billing state
- appointment state
- dashboard rollups

This foundation deliberately keeps:

- `Supabase` as domain truth
- `Cronofy` as the scheduling/conferencing orchestration layer
- `Stripe` as the money spine

## What The Migration Adds

### Identity and membership

- `public.professional_profiles`
- `public.organization_professional_memberships`
- `public.individual_professional_assignments`

### Scheduling and conferencing

- `public.professional_calendar_connections`
- `public.organization_scheduling_settings`
- `public.conference_provider_connections`
- `public.booking_links`
- `public.appointment_sessions`
- `public.appointment_attendees`
- `public.appointment_change_log`

### Billing and payments

- `public.billing_accounts`
- `public.billing_subscriptions`
- `public.payment_transactions`

### Read models

- `public.v_professional_console_upcoming_sessions`
- `public.v_organizational_core_operational_snapshot_30d`

## Architectural Call

This migration does **not** try to turn Supabase into:

- the direct Google/Outlook/iCloud calendar API layer
- the direct Zoom/Teams/Meet orchestration engine
- the Stripe dashboard

Instead it holds the Recoverlution truth that those systems feed.

## Why This Matters

Without this layer, the product would drift into:

- provider-owned scheduling truth
- payment-owned billing truth
- disconnected CRM state
- dashboards built on external admin panels instead of the platform

This migration prevents that.

## What Still Comes Next

- provider-specific external refs and sync workers
- `Cronofy` account / webhook ingestion
- `Stripe` webhook and payout posture
- richer dashboard views
- console/core runtime contracts
- role-based access and RLS pass

## Important Constraint

This is a foundation cut, not a finished operations system.

It is designed to let the Console/Core become real without forcing:

- direct-provider sprawl
- generic booking-product authority
- a second CRM beside `Supabase`
