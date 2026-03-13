# Recoverlution Frontend Agent Brief

Date: 2026-03-13
Status: active
Audience: frontend / Figma / implementation AI agent working in `/Users/daniel/Documents/New project/Build Design System2(WIP)`

## Mission

Build the strongest possible Recoverlution organism shell without creating a second backend, a second doctrine, or a second navigation system.

This workspace should produce:
- the shell law
- the room behavior
- the glass hierarchy
- the interaction grammar
- the resilience / fallback posture
- the frontend seams that will later accept live runtime truth

It should not become the authority for:
- backend semantics
- compile law
- orchestration truth
- auth doctrine
- asset delivery doctrine
- production analytics truth

## Product truth

This workspace is not building a collection of pages.
It is building one living operating system on a single sheet of glass.

The primary frontend law is:
- `Surface` = default canvas / home
- `Anchor` = intentional invocation clutch
- `Stream` = horizon / current / continuity

The current working room taxonomy in code is valuable, but it is not yet final doctrine.
Use it carefully and avoid hardening naming drift into product truth before harmony freezes the map.

## Build outcome

The shell should feel:
- singular
- light
- emotionally precise
- low-friction to re-enter
- resilient when uncertainty rises
- more like an organism than an app

The visual and behavioral leap is already strong in this repo.
The job now is to preserve that leap while adding only the minimum plumbing needed to support future live runtime truth.

## Frontend owns

Frontend owns:
- shell behavior
- `Surface / Anchor / Stream` embodiment
- room transitions and return law
- attention law and yielding behavior
- spatial hierarchy
- fallback / degraded mode behavior
- room-level interaction grammar
- mock/live adapter boundaries
- transport shell for video and audio experiences
- event hook points for later analytics

## Runtime owns

Backend/runtime owns:
- content truth
- navicue truth
- talk prompt/discovery truth
- play station compilation truth
- signal/map truth
- navigate/support/inbox/SOS truth
- auth and trust boundaries
- media delivery truth
- semantic and orchestration truth

## Current sign-off target

Before heavy plumbing, we want frontend sign-off on these UI truths:
1. shell law
2. room taxonomy
3. invocation and return behavior
4. attention law
5. failure and fallback law

If those are right, the shell is worth wiring into.

## Plumbing to install now

Install or stub these now because they protect the organism architecture:

### 1. Shell actor seam
Add an `XState v5` shell actor model for:
- current room
- anchor invocation
- stream expansion
- return path
- transient overlays
- fallback / degraded state

### 2. Unified runtime gateway
Keep one frontend gateway layer for:
- `content`
- `navicue`
- `talk`
- `play`
- `signal`
- `navigate`

Do not allow direct room-level fetch drift.

### 3. Session / identity seam
Use one frontend session provider or preview persona context so person-bound rooms do not invent their own identity assumptions.

### 4. Event seam
Use one event adapter so room events can later flow into PostHog without retrofitting every component.

### 5. Media seam
Use one adapter layer for:
- JW Player video
- audio transport / Tone.js-ready playback shell
- fallback media handling

### 6. Resilience seam
Use a single fallback / degraded-mode seam for:
- network loss
- missing payload
- low-power device posture
- sensory override / reduced stimulation mode

## Stub now, do not harden yet

These should be represented as seams or adapter shapes, not fully wired truth:
- `phenomenon`
- `formulation`
- `strategy`
- `orchestration_posture`
- room temperature / governor state
- production analytics payloads
- person-bound continuity truth

## Do not wire yet

Do not fully wire these until shell sign-off and harmony alignment:
- full live Talk behavior
- full live Play orchestration behavior
- deep heat/KBE adaptation
- full Signal map semantics in-room
- real support / SOS behavioral escalation in shell flows
- room-specific production auth assumptions

## Existing repo seams that should be preserved

Keep and normalize these patterns rather than bypassing them:
- `src/app/components/runtime/runtime-gateway.ts`
- `src/app/components/runtime/session-seam.ts`
- `src/app/components/runtime/resilience-seam.tsx`
- `src/app/components/runtime/content-runtime.ts`
- `src/app/components/runtime/usePlayRuntime.ts`
- `src/app/components/talk/talk-runtime.ts`

## Known steering notes

### 1. Talk seam
The current Talk client is still pointed at an old function seam and should eventually be normalized to the reviewed `talk-runtime` path.
Do not invent a local second Talk backend to compensate.

### 2. Play seam
The current Play surface is directionally strong. Keep its room law and control grammar, but normalize transport and persistence through the shared runtime/media seams instead of direct room-level fetches over time.

### 3. Naming discipline
The room names in frontend are strong, but should still be treated as working names until harmony freezes the canonical mapping.

### 4. Generic UI gravity
Use generic component-library primitives only where they truly disappear into the organism.
Do not let box-thinking silently become the shell law.

## Canonical backend references

Use these as backend invocation and contract truth:
- `/Users/daniel/Documents/integration/backend/40-frontend-runtime-call-index.md`
- `/Users/daniel/Documents/integration/backend/41-jw-player-call-contract.md`
- `/Users/daniel/Documents/integration/backend/42-soundbite-play-call-contract.md`
- `/Users/daniel/Documents/integration/backend/43-toolkit-call-contract.md`
- `/Users/daniel/Documents/integration/backend/48-phenomenon-contract.md`
- `/Users/daniel/Documents/integration/backend/49-formulation-contract.md`
- `/Users/daniel/Documents/integration/backend/50-strategy-contract.md`
- `/Users/daniel/Documents/integration/backend/51-orchestration-posture-contract.md`
- `/Users/daniel/Documents/integration/backend/62-xstate-shell-actor-map.md`

## Working mode

Support two frontend modes:
1. `mock shell mode`
2. `live-contract mode`

Move quickly in mock shell mode, but keep component boundaries compatible with the live-contract path.

## Success criteria

Success looks like:
- the shell already feels inevitable before full data wiring
- the organism can be wired without structural rewrites
- no second backend has been invented in the process
- no room has become a page in disguise
- the user would want to come back to this glass

## Feedback rule

Stop and surface a contract gap when:
- the shell needs data the current runtime does not expose
- a room behavior implies new backend semantics
- a control needs persistence truth not yet defined
- a visual decision would force auth, analytics, or asset doctrine to change

When that happens, escalate the gap instead of patching around it invisibly.
