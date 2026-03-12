# Signal / Map Frontend Agent Brief

Date: 2026-03-12
Status: active
Audience: frontend / Figma / implementation AI agent working in `/Users/daniel/Documents/New project/Build Design System (WIP)`

## Mission

Build the strongest possible `PLOT` and `∞MAP` shell without inventing a second telemetry engine or a second semantic spine.

This workspace should produce:
- the check-in shell
- the map shell
- the focus-zone interaction layer
- the visual proof grammar
- the debug and inspection posture for design/buildout

It should not become the authority for:
- biometric interpretation truth
- KBE scoring truth
- semantic mapping truth
- proof calculation truth
- focus-zone persistence truth

## Product truth

`Signal` is not a dashboard and not a chart product.
It is the visible proof layer of the organism.

In the current room model:
- `PLOT` = current check-in / operating truth
- `∞MAP` = schema-first constellation / longer-horizon movement

The shell should help the user feel:
- oriented
- witnessed
- able to see movement without being judged
- able to steer intentional focus without pretending the system knows too much

## Build outcome

The shell should feel:
- spatial
- calm
- authoritative without being clinical sludge
- evidence-led without being gamified
- more like a living map than an analytics page

## Frontend owns

Frontend owns:
- `PLOT` shell and state readout composition
- `∞MAP` visual hierarchy and navigation shell
- schema-cluster-first map embodiment
- focus-zone interaction affordances
- proof receipt visibility and sequence feel
- room-level transitions between check-in, map, focus, and proof
- debug inspectors and design-time sanity views

## Runtime owns

Backend/runtime owns:
- `now` truth for Energy / Clarity / Anchorage
- map grouping and semantic state
- KBE stage interpretation
- focus-zone persistence
- proof stack truth
- schema / node / pillar / concept / theme lineage
- dev identity posture and auth rules

## Current sign-off target

Before deep data wiring, we want frontend sign-off on:
1. `PLOT` room hierarchy
2. `∞MAP` schema-first navigation shell
3. focus-zone interaction law
4. proof visibility law
5. fallback behavior when signal data is partial or uncertain

## Build against these runtime calls

Use the reviewed backend contract, not ad hoc derivation:
- `GET /signal-runtime/manifest?individual_id=...`
- `GET /signal-runtime/now?individual_id=...`
- `GET /signal-runtime/map?individual_id=...&group_by=schema`
- `GET /signal-runtime/focus-zones?individual_id=...`
- `POST /signal-runtime/focus-zones`
- `GET /signal-runtime/proof?individual_id=...&limit=...`

Canonical backend references:
- `../../integration/backend/40-frontend-runtime-call-index.md`
- `../../integration/backend/48-phenomenon-contract.md`
- `../../integration/backend/49-formulation-contract.md`
- `../../integration/backend/50-strategy-contract.md`
- `../../integration/backend/51-orchestration-posture-contract.md`
- `../../integration/backend/54-returnability-measurement-and-learning-framework.md`
- `../../integration/backend/55-returnability-event-model.md`

## Current backend rules

- default map view should be `group_by=schema`
- node-level view is drill-in, not default landing
- early system learning should prioritize user response and returnability over overconfident heat or KBE claims
- `individual_id` is still explicit in dev and preview paths

## Install now

Install or preserve these seams now:
- one `signalRuntime` gateway
- one `SignalStateProvider` or equivalent room adapter
- one map interaction seam for focus zones
- one event seam for check-in, focus-zone, and proof interactions
- one fallback/degraded mode seam for partial data and empty states

## Stub now, do not harden yet

Represent these as seams or visual placeholders, not final truth:
- deep KBE causal stories
- high-confidence heat interpretation
- full node-universe landing view
- permanent identity conclusions from sparse data
- clinician-facing map assumptions inside the consumer shell

## Do not do this

- do not build a generic analytics dashboard
- do not over-weight heart rate or biometrics in the shell
- do not derive map truth locally from partial payloads
- do not turn proof into gamification
- do not land on raw node density before schema clusters
- do not make the map claim more certainty than backend can support

## Success criteria

Success looks like:
- `PLOT` feels like operating truth, not a form
- `∞MAP` feels like a living constellation, not a graph explorer
- focus zones feel actionable without overclaiming
- proof feels honest and motivating without scoring the person
- later runtime hookup is additive, not structural

## Feedback rule

Stop and surface a contract gap when:
- the map shell needs semantic grouping the runtime does not expose
- focus-zone UX implies new persistence rules
- proof UX implies a new event schema or promotion rule
- the shell needs stronger confidence or ambiguity signals than the runtime currently returns
