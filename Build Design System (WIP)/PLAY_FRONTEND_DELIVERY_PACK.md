# PLAY Frontend Delivery Pack

Date: 2026-03-12
Status: active
Audience: frontend AI agent and human review loop

## Start Here

This file is the single entrypoint for PLAY frontend work in this workspace.

If you are picking up the WIP, read this file first, then:

1. [`guidelines/Guidelines.md`](./guidelines/Guidelines.md)
2. [`PLAY_FRONTEND_AGENT_BRIEF.md`](./PLAY_FRONTEND_AGENT_BRIEF.md)
3. [`PLAY_FRONTEND_AGENT_DIRECTIVE.md`](./PLAY_FRONTEND_AGENT_DIRECTIVE.md)

## Mission

Build the magic shell for PLAY.

That means:

- premium sensory room
- elegant glass hierarchy
- emotionally intelligent motion
- a discovery-station feeling
- no visible playlist thinking

## Non-Negotiable Rule

- frontend owns the room
- runtime owns the station truth

Do not create a second backend in this workspace.

## What PLAY Must Feel Like

PLAY is not a catalog.

It is:

- one piece of glass
- one anchor
- one hidden queue
- one station the user steers with `frequency`, `thread`, `beat`, and `depth`

The user should feel:

- held
- guided
- in control without being burdened
- carried by one continuous room

## What Frontend Should Build

Frontend should build:

- the invitation state
- the immersion state
- the paused state
- the pending-mutation whisper
- the glass/hero/sonic-field hierarchy
- the tactile control grammar
- the saved-station shell
- the quiet runtime inspector
- mock/live adapter boundaries

## What Frontend Must Not Invent

Do not invent or redefine:

- session compile law
- queue law
- mutation law
- bed-family selection law
- saved-station truth
- runtime event truth
- analytics schema
- health schema

If something is missing, expose the contract gap instead of patching it invisibly.

## Required Contract Boundary

Even in mock mode, build against shapes equivalent to:

- `PlayCompiledStation`
- `PlayActiveBedFamily`
- `PlayBedFamilyRoster`
- `PlayQueueItem`
- `PlayPendingMutation`
- `PlaySavedStation`
- `PlayRuntimeEvent`
- `PlayRuntimeHealthState`

## Current Design Priorities

1. Invitation → immersion quality
2. Hero clarity and carved-glass controls
3. Better bodily `depth` control
4. Subtle continuity and mutation cues
5. Saved-station feeling
6. Debug visibility without breaking the spell

## Canonical Runtime References

Use these files as authority:

- [`../../packages/types/src/play-station.ts`](../../packages/types/src/play-station.ts)
- [`../../DesignCenter/src/utils/playRuntimeClient.ts`](../../DesignCenter/src/utils/playRuntimeClient.ts)
- [`../../docs/architecture/PLAY_DJ_ENGINE_RUNTIME_SPEC_2026-03-11.md`](../../docs/architecture/PLAY_DJ_ENGINE_RUNTIME_SPEC_2026-03-11.md)
- [`../../docs/runbooks/PLAY_PRODUCTION_PATH_2026-03-12.md`](../../docs/runbooks/PLAY_PRODUCTION_PATH_2026-03-12.md)
- [`../../docs/runbooks/PLAY_FRONTEND_MAGIC_SHELL_BRIEF_2026-03-12.md`](../../docs/runbooks/PLAY_FRONTEND_MAGIC_SHELL_BRIEF_2026-03-12.md)

## Explicit Directive

Build PLAY as a premium sensory station shell in `mock` and `live-contract` modes.

Keep the shell magical on its own, but make sure it can snap back onto the live PLAY runtime without structural rewrites.

## Handoff Rule

When this work comes back into the main Codex/runtime path:

- preserve the frontend experience primitives
- replace local runtime stubs with canonical runtime adapters
- do not carry ad hoc backend law back with it

## Review Loop

This workspace is expected to move in a loop:

1. frontend agent evolves the shell
2. human reviews the result
3. Codex receives screenshots, questions, or code
4. Codex steers the shell back toward the live PLAY runtime

That loop is intentional. Do not optimize it away by hardcoding runtime truth locally.
