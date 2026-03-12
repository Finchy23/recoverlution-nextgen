# Recoverlution Frontend Guidelines

This workspace is a sensory shell for Recoverlution surfaces.

The current priority is `PLAY`.

Treat this workspace as a proving ground for the frontend magic shell, not as the authority for runtime behavior or platform contracts.

## Core rule

- frontend owns the room
- runtime owns the station truth

## What PLAY is

PLAY is not a library and not a playlist.

It is a living station:

- one piece of glass
- one anchor
- one hidden queue
- one room that the user steers through `frequency`, `thread`, `beat`, and `depth`

The hardest part should be pressing play.

## What this AI should optimize for

Build the most elegant, calm, atmospheric PLAY shell possible while protecting the existing runtime contract.

Prioritize:

- spatial elegance
- sensory continuity
- emotionally intelligent motion
- no visible playlist thinking
- tactile clarity
- a premium Apple-grade feeling of one-ness

## What the frontend should own

- glass hierarchy and room composition
- invitation, immersion, paused, and pending-mutation states
- hero orb and control placement
- sonic field and analyser-driven atmosphere
- frequency signature and canvas identity
- in-room control grammar for `frequency`, `thread`, `beat`, and `depth`
- subtle debug and compare affordances during design/proving
- saved-station surface treatment

## What must not be invented here

Do not harden or redefine:

- backend compile request law
- queue composition law
- mutation continuity law
- bed-family selection law
- saved-station persistence law
- runtime event schema
- analytics or health payload truth

If the runtime is not available, mock it cleanly behind a boundary instead of inventing new truth.

## Required build mode

Everything for PLAY should support two modes:

1. `mock shell mode`
2. `live-contract mode`

The UI can move fast in mock mode, but the component boundaries must remain compatible with the live PLAY contract.

## Current PLAY build intent

Build the shell as if these are already true:

- the room opens from a compiled station contract
- a live bed family exists
- a bed-family roster exists
- a hidden voice queue exists
- pending retunes can exist before promotion
- saved stations can be opened and saved
- runtime health can be surfaced quietly for debug

## Use these files as authority

- `../../packages/types/src/play-station.ts`
- `../../DesignCenter/src/utils/playRuntimeClient.ts`
- `../../docs/architecture/PLAY_DJ_ENGINE_RUNTIME_SPEC_2026-03-11.md`
- `../../docs/runbooks/PLAY_PRODUCTION_PATH_2026-03-12.md`
- `../PLAY_FRONTEND_AGENT_BRIEF.md`
- `../PLAY_FRONTEND_AGENT_DIRECTIVE.md`

## Immediate PLAY rules

- preserve the station feeling
- no exposed lists or playlist rails
- no metrics-heavy UI
- no backend-shaped jargon in the visible surface
- controls should feel carved into glass, not bolted on
- depth should feel close to transport and bodily, not technical
- pending mutation should be visible but whispered
- saved stations should feel like "my room", not saved filters

## Working style

- prefer small, composable components
- keep files readable
- extract helper modules when the room logic starts getting heavy
- keep the shell expressive but not noisy
- preserve the existing Recoverlution tone and calm

## Feedback rule

If a design or interaction choice would force a new runtime contract, stop and call that out clearly instead of baking it in.
