# Navigate / Support / SOS Frontend Agent Brief

Date: 2026-03-12
Status: active
Audience: frontend / Figma / implementation AI agent working in `/Users/daniel/Documents/New project/Build Design System (WIP)`

## Mission

Build the strongest possible `LINK` shell without turning support, infrastructure, and continuity into settings sludge.

This workspace should produce:
- the support graph shell
- the shared-room shell
- the context/integrations shell
- the inbox shell
- the rescue / SOS shell
- the quiet control-center layer for complex real-world logistics

It should not become the authority for:
- support-contact truth
- professional/org relationship truth
- rescue escalation truth
- notification delivery truth
- integration-account truth
- consent/auth/privacy doctrine

## Product truth

`Navigate` is not a settings page.
It is the infrastructure layer that keeps the organism connected to real people, real systems, and real safety.

In the current room model:
- `LINK` = infrastructure / support / control center

The shell should help the user feel:
- supported
- connected
- not alone
- able to reach help quickly
- able to understand what is connected without feeling surveilled or administrated

## Build outcome

The shell should feel:
- minimal
- secure
- trustworthy
- quietly powerful
- more like a bridge than a menu

## Frontend owns

Frontend owns:
- support graph shell and hierarchy
- shared-room surface treatment
- integrations/context surface composition
- inbox and notification shell behavior
- support ping and SOS invocation shell
- guardrail copy placement and escalation affordance hierarchy
- debug visibility for buildout and preview testing

## Runtime owns

Backend/runtime owns:
- support contacts and channels
- professional and organization links
- inbox truth
- support ping and SOS write actions
- integration and context truth
- rescue state and escalation logic
- auth, consent, privacy, and preview/production boundary

## Current sign-off target

Before deep live wiring, we want frontend sign-off on:
1. support graph hierarchy
2. rescue / SOS invocation and confirmation behavior
3. shared-room structure
4. context/integration visibility law
5. inbox and support-state visibility law

## Build against these runtime calls

Use the reviewed backend contract, not local assumptions:
- `GET /navigate-runtime/manifest?individual_id=...`
- `GET /navigate-runtime/compass?individual_id=...`
- `GET /navigate-runtime/context?individual_id=...`
- `GET /navigate-runtime/network?individual_id=...`
- `GET /navigate-runtime/shared-room?individual_id=...`
- `GET /navigate-runtime/inbox?individual_id=...`
- `GET /navigate-runtime/rescue?individual_id=...`
- `POST /navigate-runtime/support/ping`
- `POST /navigate-runtime/sos`

Canonical backend references:
- `../../integration/backend/40-frontend-runtime-call-index.md`
- `../../integration/backend/15-backend-continuity-truth-boundary.md`
- `../../integration/backend/21-rec-8-evidence-pack.md`
- `../../integration/backend/35-rec-105-production-access-model-review.md`
- `../../integration/backend/36-rec-106-test-profile-seed-pack-review.md`
- `../../integration/backend/38-rec-108-live-cohort-observability-review.md`

## Current backend rules

- current dev/preview flows still use explicit `individual_id`
- support ping and SOS are real backend seams
- external support contacts do not need full platform membership
- frontend must not imply delivery channels or escalation guarantees beyond what runtime returns

## Install now

Install or preserve these seams now:
- one `navigateRuntime` gateway
- one support-graph room adapter/provider
- one rescue/SOS action seam
- one inbox adapter seam
- one context/integration adapter seam
- one event seam for support ping, SOS, inbox action, and integration interactions

## Stub now, do not harden yet

Represent these as seams or preview-safe placeholders, not final truth:
- real outbound SMS/email delivery confirmation
- launch-safe auth-derived identity in every flow
- final support escalation doctrines beyond runtime output
- full calendar/wearable sync narrative claims
- clinician-console parity assumptions in the consumer shell

## Do not do this

- do not build a generic settings center
- do not imply support actions that backend cannot actually perform
- do not invent contact or escalation truth locally
- do not let preview support behavior masquerade as launch-safe doctrine
- do not bury SOS behind decorative complexity

## Success criteria

Success looks like:
- support and infrastructure feel integrated, not administrative
- SOS feels immediate and safe
- shared-room continuity feels believable
- inbox and context feel quiet and useful
- later runtime hookup is additive, not structural

## Feedback rule

Stop and surface a contract gap when:
- the support graph needs fields the runtime does not expose
- SOS/rescue UI implies guarantees the runtime does not make
- shared-room behavior needs stronger continuity/auth semantics
- inbox or context surfaces need delivery or consent truth the runtime does not currently return
