# Figma UI Final Brief

This is the final UI handoff pack for the next Figma pass.

Use this workspace as the live organism reference. It is not fully wired to canonical backend truth yet, but the shell, room identities, and interaction laws are now strong enough to drive the next design return.

## What This Pass Is

This is a design-signoff and refinement pass for:
- the `Companion` as the personal, app-first organism
- the `Professional Console` as a desktop-first practitioner workbench
- the `Organisational Core` as a desktop-first operating/admin layer

This is not a backend pass.
This is not a taxonomy reinvention pass.
This is not a dashboard-overload pass.

## Core Product Split

### Companion
The Companion stays app-first and intimate.
It should feel:
- private
- calm
- returnable
- bodily
- cinematic
- low-friction

It must not feel like:
- an admin tool
- a settings app
- a dashboard product
- a content library
- a therapy CRM

### Professional Console
The Professional Console is desktop-first.
It is the practitioner workbench.
It should hold:
- client roster
- upcoming sessions
- booking and availability
- conference/join flows
- payment exceptions
- prep and follow-up posture
- light dashboards

It should feel:
- efficient
- trustworthy
- operational
- clear under load

### Organisational Core
The Organisational Core is also desktop-first.
It is the operating/admin layer.
It should hold:
- team members and roles
- org scheduling policy
- provider health
- billing posture
- utilisation and revenue views
- audit/compliance posture
- org-wide controls

It should feel:
- denser than Companion
- more analytical than Console
- still elegant, but not room-like

## Companion Authority

The Companion should now be designed around these public room families:
- `CUES`
- `ACTS`
- `PLAY`
- `TALK`
- `TUNE`
- `KNOW`
- `ECHO`

Internal code still contains legacy/transition names in places.
For Figma, prefer the public language above.
Keep internal alias notes where needed, but do not let code-era naming flatten the interface.

## Companion Spatial Law

The Companion still runs on one piece of glass:
- `Surface`
- `Anchor`
- `Stream`

The Universal Player should remain the organism.
Rooms compile into it.
They do not become separate apps.

The player should continue to own:
- atmosphere
- timing
- copy emergence
- attention budget
- return behavior
- motion grammar
- seal behavior

## What Feels Frozen Enough To Design Against

These truths are stable enough for Figma to push hard on:
- the Universal Player is the shell
- Companion is app-first only
- Console and Core are desktop-first
- `READ` is not a library; it is a calibration chamber
- `ECHO` is not settings; it is the listening and tethering layer
- `LINK` should feel infrastructural but still intimate
- `PLOT` should feel like bodily telemetry, not a form
- `MAP` should feel like a living constellation, not analytics
- copy must avoid assumption-heavy app-time language
- the product should feel timeless, not session-tethered

## What Is Still Open

Do not prematurely freeze these in Figma as backend truth:
- final cue compiler logic
- final runtime-driven signpost logic
- final KBE/heat adaptation behavior
- final provider/live-data states
- final semantic spine wording

Those are still architecture/runtime questions.

## Room Priorities For The Next Figma Return

### Highest priority
- Companion shell refinement
- `READ`
- `ECHO > PLOT`
- `ECHO > MAP`
- `ECHO > LINK`

### Second priority
- `TALK`
- `PLAY`
- top-level `KNOW`
- top-level `TUNE`

### Desktop priority
- Professional Console top-level IA
- Organisational Core top-level IA
- their relationship back to Companion

## READ Law

`READ` is now the Infinite Book.
It is one sentient reading room, not a searchable article index.

The user calibrates the aperture.
The system delivers the right chapter.

Protect:
- three-dial simplicity
- `Spark -> Unspooling`
- no search bar
- no results grid
- no visible schema labels
- no content-library behavior

## ECHO Law

`ECHO` is the quiet listening layer.
It should group tethered integrations by meaning, not by vendor logos.

Think in families like:
- to read the body
- to map the movement
- to measure the noise
- to anchor the frequency

Protect:
- elegance
- consent clarity
- biological framing
- no generic settings-page feeling

## Language Law

Copy should follow the architecture of resonance.

That means:
- no assumption-heavy app-time phrases
- no false certainty
- no overclaiming emotional outcome
- no diagnostic UX helper tone
- no software congratulation loops

Instead:
- entrances widen perspective
- the kinetic middle yields to physics
- the seal leaves a lingering chord

## Runtime Boundary For Figma

The UI should assume these seams exist, but it should not try to solve them visually:
- shell actor seam
- runtime gateway seam
- session seam
- resilience seam
- analytics/event seam
- media seam

As of this pass, `LINK`, `PLOT`, and `MAP` have clean runtime seams in code.
Treat that as permission to design them confidently without inventing more transport logic into the UI.

## Desktop Guidance

Do not make Console/Core look like enlarged versions of Companion.

They should share:
- brand language
- type system discipline
- color restraint
- trust posture

They should not share:
- pacing
- density
- room choreography
- emotional softness at all times

## Deliverables Expected Back From Figma

1. Companion shell refinement
2. Final pass on `READ`
3. Final pass on `ECHO > PLOT / MAP / LINK`
4. Desktop-first top-level IA for `Professional Console`
5. Desktop-first top-level IA for `Organisational Core`
6. Copy and motion guardrails where design intent matters to code

## Final Rule

Preserve the organism.
Do not let either backend convenience or generic product patterns drag it back into a normal app.
