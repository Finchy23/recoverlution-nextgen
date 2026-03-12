# TALK Frontend Figma Directive

Last updated: 2026-03-12
Audience: frontend and Figma AI agents shaping the TALK shell before product integration
Status: active handoff brief

## Purpose

This brief defines what the frontend should finish for TALK, what must stay out of frontend ownership, and how to keep the shell elegant without accidentally hardening a second runtime.

TALK is not chat.
TALK is not a general assistant.
TALK is a self-instigated corridor that helps a person articulate, recognize, and seal truth without being swallowed by endless conversation.

The immediate goal is not to ship the whole intelligence stack from this workspace.
The immediate goal is to finish the visible shell so it can be bound cleanly to shared package authority and the existing TALK runtime spine.

## North Star

Ship one calm corridor.

- user-instigated
- system-bounded
- page-first
- seal-centered
- thread-aware
- graceful to enter
- graceful to leave

The user should feel:

- I started this
- the corridor held me
- I was not interrogated
- I did not get trapped in chat
- something true was sealed and carried forward

## Canonical authority

Treat this order as law:

1. shared runtime and corridor law
- `packages/talk-core/src/machine.ts`
- `packages/talk-core/src/selection.ts`
- `packages/talk-core/src/runtime-client.ts`

2. shared types and content contracts
- `packages/types/src/talk-corridor.ts`
- `packages/content/src/talk/response-matrix.ts`

3. shared UI authority
- `packages/ui/src/talk/talk-corridor-kit.tsx`

4. proving ground
- `apps/design-center/src/app/pages/design-center/TalkCorridorLab.tsx`

Do not let Figma output, app-local prototypes, or standalone WIP apps become canonical by accident.

## Upstream creative source

The current upstream exploratory source is:

- `Build Design System (WIP)/src/app/components/talk/`
- `Build Design System (WIP)/src/app/components/surfaces/TalkSurface.tsx`

This source is valuable for shell intelligence, pacing, and atmosphere.
It is not authoritative for backend contracts, persistence law, schema detection, KBE logic, or product routing.

Use it as an experiment and mirror, not as final runtime truth.

## Visible corridor law

Frontend should preserve these TALK phases:

1. `arriving`
2. `prompting`
3. `writing`
4. `sealing`
5. `reflecting`
6. `threading`
7. `resting`

Every visual decision should make these phases feel legible without adding more chrome.

## Required shell regions

The shell should keep these regions distinct, even if they overlap visually:

- doorway
- page
- seal
- reflection
- bridge
- thread
- rest state

If a region is unresolved, label it by function, not by marketing copy.

Examples:

- `prompt-field`
- `journal-page`
- `seal-node`
- `reflection-line`
- `schema-bridge`
- `thread-map`
- `rest-state`

## What frontend owns

Frontend should finish only the shell side of TALK:

- phase hierarchy
- page geometry and proportions
- prompt field composition
- seal position, hold affordance, and sink behavior
- reflection placement and timing
- bridge placement and coexistence rules
- thread-map reveal timing and visual weight
- mobile composition
- responsive behavior
- keyboard flow and focus handling
- reduced-motion fallback
- contrast and readability in low-opacity states
- package extraction boundaries for reusable shell parts

## What frontend must not own

Do not harden these into app-local frontend logic:

- persistence contracts
- prompt evolution rules
- response-family selection law
- schema detection
- KBE nudging
- deep thread mining
- learning model behavior
- product routing contracts
- analytics event schema
- Supabase transport details

Those belong in shared packages and runtime services.

## Architectural warning

The upstream WIP `TalkSurface.tsx` is a strong prototype of the organism, but it mixes too many responsibilities:

- shell orchestration
- persistence
- prompt evolution
- schema detection
- deep mining
- navigation

Do not merge that file wholesale into production surfaces.
Extract the visual laws.
Do not adopt the local runtime law.

## Interaction principles

Use these as the design law for the shell:

- one question at a time
- one truth at a time
- one visible move at a time
- no transcript feel
- no chatbot affordances
- no stacked bubble UI
- no eager interpretation
- no nagging bridge behavior
- exit always available

If a change makes TALK feel more like chat, it is probably wrong.

## Bridge law

The bridge should feel like a quiet recognition, not a recommendation engine.

Allowed posture:

- "something here has a shape"
- "would you like to see it"

Disallowed posture:

- strong recommendation cards
- repeated prompts
- persistent nags
- explanatory overlays

The bridge is an invitation, not a command.

## Thread law

The thread is topology, not analytics.

It should communicate:

- continuity
- accumulation
- recognition
- afterglow

It should not communicate:

- scores
- progress bars
- metrics
- achievement logic

## Frontend close-out checklist

Before frontend considers TALK visually closed, all must be true:

- all seven phases are represented clearly
- the main shell regions are stable
- motion between phases feels intentional
- mobile layout holds without collapse
- thread and bridge do not visually fight the page
- the seal mechanic is legible and emotionally central
- the writing state feels like a page, not a form
- the reflection state is bounded and quiet
- accessibility basics are sane
- the implementation path back into `packages/ui/src/talk/` is obvious

## Handoff back to shared authority

Once the shell is visually ready:

1. promote reusable shell pieces into `packages/ui/src/talk/`
2. keep runtime law in `packages/talk-core`
3. keep response law in `packages/content/src/talk/`
4. keep Design Center as the proving ground
5. only then wire the first product consumer

## Definition of done for this frontend lane

This lane is done when:

- the shell law is visually settled
- no second runtime has been invented locally
- shared extraction boundaries are clear
- the result can be handed off for package-first binding without creative ambiguity

This lane is not done when:

- the standalone WIP app looks impressive
- the shell contains hidden backend assumptions
- the corridor still depends on app-local intelligence
- the page, seal, bridge, and thread are still competing for dominance

## Final instruction

Design the shell as if it is the only visible thing the user will ever see.
Build it so shared packages can carry it.
Do not solve intelligence in the glass.
