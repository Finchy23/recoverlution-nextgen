# Atom Seed Pack For Creative / UI Agent Exploration

Purpose:
- give a creative or UI agent a **bounded slice** of the atom system
- show the language of the glass without dumping the whole library
- preserve room for invention instead of over-prescribing every scene

This is a handoff pack, not the full atom doctrine.

## Why this exists

The wider ambition is a `700`-atom system across `70` series and `7` collections.

The current canonical implementation in this repo is the first `100` atoms across the first `10` series. That is already far too much to hand to an external creative agent if the goal is original exploration rather than imitation.

The right move is:
- send a **curated seed pack**
- make sure it spans the major interaction archetypes
- include just enough shell and room context
- avoid turning the handoff into a giant specification

## Recommended pack size

Recommended:
- **18 atoms**

Why:
- `10` core atoms gives one representative from each of the first `10` series
- `8` stretch atoms gives range in emotional altitude, room possibility, and control language

If a smaller handoff is needed:
- use the **core 10**

## What this pack should cover

The receiving agent should be able to feel:
- somatic regulation
- perception shift
- organic repair
- subtraction / void
- sound / frequency
- interruption / glitch
- time rewrite
- perspective / scale
- shadow work
- sovereignty / world-building

The receiving agent should also see multiple control archetypes:
- `hold`
- `drag`
- `swipe`
- `pinch`
- `tap`
- `draw`
- `voice`
- `type`

## The core 10

These are the recommended one-per-series anchors.

### 1. Somatic regulation
- `somatic-resonance`
- file:
  - `DesignCenter/src/app/components/atoms/series-1-physics/somatic-resonance.tsx`
- why:
  - clearest expression of embodied regulation
  - shows breath, pressure, and weight without becoming overly conceptual

### 2. Observation changes the field
- `wave-collapse`
- file:
  - `DesignCenter/src/app/components/atoms/series-2-quantum/wave-collapse.tsx`
- why:
  - captures the “attention changes reality” law
  - useful for more cognitive and insight-shaped room thinking

### 3. Organic growth
- `mycelial-routing`
- file:
  - `DesignCenter/src/app/components/atoms/series-3-biomimetic/mycelial-routing.tsx`
- why:
  - shows healing as growth rather than fixing
  - gives the agent a non-linear, living-system reference

### 4. Subtraction and stillness
- `dark-matter`
- file:
  - `DesignCenter/src/app/components/atoms/series-4-via-negativa/dark-matter.tsx`
- why:
  - one of the strongest examples of silence, absence, and removal
  - useful for teaching that the glass gets stronger by getting quieter

### 5. Sound made visible
- `cymatic-coherence`
- file:
  - `DesignCenter/src/app/components/atoms/series-5-chrono-acoustic/cymatic-coherence.tsx`
- why:
  - bridges sound, entrainment, and visual order
  - highly relevant to `Play`, `Talk`, and shell atmosphere

### 6. Interruption / trance break
- `phantom-alert`
- file:
  - `DesignCenter/src/app/components/atoms/series-6-meta-glitch/phantom-alert.tsx`
- why:
  - introduces rupture and interruption
  - shows that magic also includes breaking autopilot

### 7. Rewriting time / meaning
- `narrative-flip`
- file:
  - `DesignCenter/src/app/components/atoms/series-7-retro-causal/narrative-flip.tsx`
- why:
  - strong example of meaning shift through physics
  - useful for `Talk`, `Insights`, and `Journeys`

### 8. Perspective and scale
- `overview-effect`
- file:
  - `DesignCenter/src/app/components/atoms/series-8-kinematic-topology/overview-effect.tsx`
- why:
  - gives the agent a strong scale-and-distance reframe
  - important for `Signal`, `Insights`, and shell transitions

### 9. Shadow and transmutation
- `phoenix-ash`
- file:
  - `DesignCenter/src/app/components/atoms/series-9-shadow-crucible/phoenix-ash.tsx`
- why:
  - covers darker, more alchemical emotional territory
  - includes particulate transformation and breath-adjacent interaction

### 10. Sovereignty / construction
- `future-memory`
- file:
  - `DesignCenter/src/app/components/atoms/series-10-reality-bender/future-memory.tsx`
- why:
  - shows authorship and construction instead of only release
  - useful for where the system goes after regulation

## The stretch 8

These widen the handoff without bloating it.

### 11. Overwhelm reduction
- `micro-step-shrink`
- file:
  - `DesignCenter/src/app/components/atoms/series-12-friction/micro-step-shrink.tsx`
- why:
  - one of the clearest examples of a useful, believable on-glass mechanic

### 12. Direct vagal entrainment
- `vagal-resonance`
- file:
  - `DesignCenter/src/app/components/atoms/series-5-chrono-acoustic/vagal-resonance.tsx`
- why:
  - stronger regulatory sound/body example than cymatics alone

### 13. Sonic reframing
- `audio-rescore`
- file:
  - `DesignCenter/src/app/components/atoms/series-7-retro-causal/audio-rescore.tsx`
- why:
  - directly useful for `Play`
  - shows narrative shift through soundtrack

### 14. Director mode
- `third-person-shift`
- file:
  - `DesignCenter/src/app/components/atoms/series-7-retro-causal/third-person-shift.tsx`
- why:
  - useful for camera logic, self-observation, and corridor design

### 15. Shame navigation
- `shame-compass`
- file:
  - `DesignCenter/src/app/components/atoms/series-9-shadow-crucible/shame-compass.tsx`
- why:
  - gives the pack a sharper affective navigation mechanic

### 16. User alters the room
- `atmosphere-weather`
- file:
  - `DesignCenter/src/app/components/atoms/series-10-reality-bender/atmosphere-weather.tsx`
- why:
  - shows that the user can affect the room itself, not just an object in it

### 17. Faith materializes
- `belief-bridge`
- file:
  - `DesignCenter/src/app/components/atoms/series-10-reality-bender/belief-bridge.tsx`
- why:
  - strong example of reality appearing through trust and movement

### 18. Tenderness / armor drop
- `inner-child`
- file:
  - `DesignCenter/src/app/components/atoms/series-9-shadow-crucible/inner-child.tsx`
- why:
  - gives the pack softness and care, not just intensity

## Minimum companion files

Do not send atoms alone.

Send these alongside the pack:

### Shell / glass context
- `DesignCenter/src/app/pages/PlayerPage.tsx`

### Atom system context
- `DesignCenter/src/app/components/atoms/atom-registry.ts`
- `DesignCenter/src/app/components/atoms/series-registry.ts`
- `DesignCenter/src/app/components/atoms/types.ts`

### Room and doctrine context
- `Command Center Execution Plan/figma-drop/guidelines/Guidelines.md`
- `docs/runbooks/RECOVERLUTION_DOCTRINE_TO_RULES_2026-03-08.md`

## What not to send

Do not send:
- the whole `100`-atom implementation set
- raw token files as the main design stimulus
- every room code path
- every audit document
- every string or runtime payload

The goal is not to make the receiving agent mirror the current UI.

The goal is to let the receiving agent:
- understand the language of the glass
- see the emotional and interaction range
- invent against the system without inheriting every current decision

## What the receiving agent should infer

If the pack is working, the receiving agent should naturally infer:
- the glass is alive
- the user changes the room
- the room can catch, hold, cool, interrupt, reveal, transmute, or expand
- not every atom is intense
- the same shell can hold many emotional altitudes
- the system can move from regulation to insight to sovereignty

## Recommendation

Use this as the default creative/UI-agent atom handoff:
- send the **18-atom pack**
- include the **minimum companion files**
- explicitly say:
  - this is representative, not exhaustive
  - stay faithful to the one-glass philosophy
  - do not recreate the current UI literally
  - use the pack to discover what the system could become
