# Signal / Map Frontend Agent Brief

Date: 2026-03-13
Status: active
Audience: frontend / Figma / implementation AI agent working on `PLOT` and `∞MAP`

## Mission

Build `Signal / Map` as the proof-and-perception layer of the organism.
It should feel like living visibility, not analytics furniture.

This workspace should define:
- how `PLOT` feels as an active check-in and state-reading room
- how `∞MAP` feels as a living field of meaning and movement
- how proof, focus, and map navigation inhabit the glass
- what yields, what leads, and what remains quiet

It should not become the authority for:
- semantic truth
- KBE scoring doctrine
- final map clustering rules
- signal confidence logic
- backend focus-zone truth

## Product truth

`PLOT` and `∞MAP` live under `ECHO`.
They belong to the organism as proof, coordinates, and learning.
They are not dashboards.
They are not settings.
They are not BI.

The frontend should treat them as:
- `PLOT` = the active sensing/check-in room
- `∞MAP` = the spatial meaning/proof room

## Build outcome

The rooms should feel:
- legible without over-explaining
- calm under pressure
- spatial, not chart-heavy
- precise enough to trust
- quiet enough to return to

## Frontend owns

Frontend owns:
- spatial map behavior
- proof visibility hierarchy
- focus-zone affordances
- field navigation and depth
- how coordinates, clusters, and proof traces appear
- degraded rendering and fallback map posture

## Backend owns

Backend/runtime owns:
- `signal-runtime` truth
- schema / node / cluster semantics
- current state truth
- focus-zone truth
- proof truth
- longitudinal scoring logic

## Canonical backend references

Use these as source of truth:
- `/Users/daniel/Documents/integration/backend/40-frontend-runtime-call-index.md`
- `/Users/daniel/Documents/integration/backend/48-phenomenon-contract.md`
- `/Users/daniel/Documents/integration/backend/50-strategy-contract.md`
- `/Users/daniel/Documents/integration/backend/51-orchestration-posture-contract.md`

## Runtime calls

Do not invent local map semantics.
Call:
- `signal-runtime /now`
- `signal-runtime /map`
- `signal-runtime /focus-zones`
- `signal-runtime /proof`

Prefer `group_by=schema` as the hero map view first.
Node-level density is drill-in only, not the default truth.

## Install now

Install or stub:
- map room shell
- focus-zone interaction seam
- proof trace visualization seam
- reduced rendering mode
- event hooks for map entry, focus-zone set, proof view, cluster drill-in

## Do not harden yet

Do not harden:
- final KBE color doctrine in frontend alone
- full raw mindblock graph as the first map view
- local classification logic
- speculative proof scoring
- local focus-zone authority

## Success criteria

Success looks like:
- `PLOT` feels like coordinates, not forms
- `∞MAP` feels like a living field, not an analytics canvas
- proof is visible without gamification
- the room can accept better semantics later without structural rework
