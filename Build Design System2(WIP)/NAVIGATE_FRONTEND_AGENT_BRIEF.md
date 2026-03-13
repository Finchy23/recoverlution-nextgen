# Navigate / Support / SOS Frontend Agent Brief

Date: 2026-03-13
Status: active
Audience: frontend / Figma / implementation AI agent working on `LINK` and support infrastructure

## Mission

Build `Navigate` as the infrastructural room of the organism.
It should feel like a secure symbiotic bridge, not a settings graveyard.

This workspace should define:
- how support, professional, and organizational continuity live on the glass
- how SOS and support pathways feel calm, serious, and low-friction
- how links, sync state, and trust cues emerge without turning into admin UI

It should not become the authority for:
- support graph truth
- consent doctrine
- SOS backend behavior
- notification delivery truth
- auth or identity truth

## Product truth

`LINK` lives under `ECHO`.
It is the place where logistics, support, and continuity become visible.
It is not “settings”.
It is not profile management.
It is not a CRM.

## Frontend owns

Frontend owns:
- room behavior and visual hierarchy
- support graph feel
- therapist/professional sync feel
- SOS entry and reassurance posture
- inbox/support/navigation affordances
- degraded / unavailable state behavior

## Backend owns

Backend/runtime owns:
- `navigate-runtime` truth
- support graph truth
- SOS and rescue truth
- inbox and notification truth
- integration / context truth
- professional and org continuity truth
- consent/auth boundary

## Canonical backend references

Use these as source of truth:
- `/Users/daniel/Documents/integration/backend/40-frontend-runtime-call-index.md`
- `/Users/daniel/Documents/integration/backend/15-backend-continuity-truth-boundary.md`
- `/Users/daniel/Documents/integration/backend/53-user-learning-first-principle.md`

## Runtime calls

Do not invent support behavior locally.
Call:
- `navigate-runtime /manifest`
- `navigate-runtime /context`
- `navigate-runtime /network`
- `navigate-runtime /shared-room`
- `navigate-runtime /inbox`
- `navigate-runtime /rescue`
- `navigate-runtime /support/ping`
- `navigate-runtime /sos`

## Install now

Install or stub:
- network room shell
- support graph seam
- SOS drawer/sheet seam
- inbox/notification seam
- fallback posture for unavailable support or offline mode
- event hooks for support, rescue, and infrastructure entry points

## Do not harden yet

Do not harden:
- final support routing behavior in frontend alone
- real consent or trust logic locally
- fake professional/org semantics
- fake safety assurances the backend cannot actually support

## Success criteria

Success looks like:
- LINK feels trustworthy, quiet, and serious
- support and rescue feel reachable without feeling alarming
- the room can accept real backend continuity truth later without a redesign
