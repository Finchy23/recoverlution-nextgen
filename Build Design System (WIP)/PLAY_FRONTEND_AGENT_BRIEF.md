# PLAY Frontend Agent Brief

Date: 2026-03-12
Status: active
Audience: frontend AI agent working in `Build Design System (WIP)`

## Mission

Build the most compelling PLAY shell possible without creating a second backend.

This workspace should produce:

- the visual room
- the interaction grammar
- the sensory shell

It should not become the authority for station composition.

## Product truth

PLAY is a Discovery Station, not a library.

The user should feel:

- held
- guided
- able to steer the room
- never burdened with browsing

The room is shaped by:

- `frequency`: nervous-system state
- `thread`: what truth stream is being spoken
- `beat`: what sonic character carries the room
- `depth`: voice/music relationship

## Design outcome

The shell should feel:

- premium
- quiet
- spatial
- emotionally precise
- continuous rather than file-swapped

Use TUNE as a guardrail for discipline and system coherence, but let PLAY have its own sonic/material identity.

## Build boundaries

### Frontend owns

- invitation and immersion states
- glass composition
- hero orb, constellation, and sonic field
- control affordances
- motion and transition atmosphere
- saved-station shell affordances
- subtle room-inspector/debug affordances

### Runtime owns

- compiled session law
- queue and rolling-window truth
- bed-family selection
- mutation continuity
- saved-station truth
- event logging schema
- runtime health truth

## Implementation directive

Build against these conceptual contracts even in mock mode:

- `PlayCompiledStation`
- `PlayActiveBedFamily`
- `PlayBedFamilyRoster`
- `PlayQueueItem`
- `PlayPendingMutation`
- `PlaySavedStation`
- `PlayRuntimeEvent`
- `PlayRuntimeHealthState`

If the live runtime is not wired in this workspace, create adapters and mocks for those shapes instead of inventing alternate models.

## Current quality targets

### 1. Room hierarchy

The room should read as:

- full-viewport signature/canvas
- sonic field above
- hero anchor and central action
- control constellation around the anchor
- optional quiet inspector for debug

### 2. Control grammar

The controls should feel embodied:

- `frequency` should feel like state
- `thread` should feel like meaning
- `beat` should feel like bed character
- `depth` should feel like bodily tuning

### 3. Mutation law

The shell should visually support:

- pending mutation
- phrase-safe handoff
- continuity rather than resets

### 4. Saved stations

The shell should support:

- opening a named room
- saving a tuned room
- treating saved stations as "my station", not filters

### 5. Debug visibility

The shell should allow:

- room truth inspection
- compare loop support
- hidden queue and state sanity during design

But keep all of that subtle and non-primary.

## Near-term deliverables

1. Production-quality PLAY room shell.
2. Better in-room depth control.
3. Pending-mutation whisper cue.
4. Saved-station open/save shell.
5. Mock/live adapter boundary.
6. Quiet runtime inspector.

## Do not do this

- do not rename runtime concepts casually
- do not invent a new session payload
- do not hardcode sequencing logic as product truth
- do not expose catalog thinking
- do not let the shell become data-authoritative

## Canonical references

- `../../packages/types/src/play-station.ts`
- `../../DesignCenter/src/utils/playRuntimeClient.ts`
- `../../docs/architecture/PLAY_DJ_ENGINE_RUNTIME_SPEC_2026-03-11.md`
- `../../docs/runbooks/PLAY_PRODUCTION_PATH_2026-03-12.md`
- `../../docs/runbooks/PLAY_FRONTEND_MAGIC_SHELL_BRIEF_2026-03-12.md`

## Backend Confirmation Rule

Use the current live repo types as the working contract.

Do not stop this design lane waiting for backend confirmation.

If you need a new field, new behavior, or a clarified contract:

- call out the gap clearly
- keep building in `mock` mode
- assume the main repo path will resolve the contract

## Feedback loop

If you hit one of these, stop and surface it:

- the design needs a contract the runtime does not currently expose
- a control needs a new persistence rule
- a visual decision implies new sequencing law
- the shell needs data the current contract does not supply

When that happens, ask for the contract gap rather than patching around it invisibly.
