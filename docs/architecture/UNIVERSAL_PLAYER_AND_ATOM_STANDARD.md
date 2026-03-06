# Universal Player And Atom Standard

## Purpose

Recoverlution should not standardize by making everything look the same.
It should standardize by making every content type obey the same compositional grammar,
while allowing the hero system inside that grammar to stay diverse.

The code already points in the right direction:
- `/apps/design-center/src/navicue-types.ts` defines a 7-layer composition contract.
- `/apps/design-center/src/app/components/NaviCueCompositor.tsx` defines the player Z-stack.
- `/apps/design-center/src/app/components/atoms/types.ts` defines the atom as a self-contained physics engine.
- `/apps/design-center/src/app/components/atoms/series-registry.ts` defines series as physics/psychology paradigms.
- `/apps/design-center/src/app/components/atoms/atom-registry*.ts` defines intent, physics, surfaces, resolution, and hardware fit.

The system problem is not lack of philosophy.
The system problem is that the quality bar between `metadata says this is complete` and `this feels hero-grade in the player` is still too loose.

## The Correct Mental Model

There are four different things that must not be conflated.

1. Content type
- NaviCue
- Journey scene
- Insight scene
- Practice
- Video
- Article

2. Universal player
- The shared rendering and orchestration shell that all content types use.

3. Composition stack
- The layered contract that decides atmosphere, timing, voice, entrance, hero zone, and exit.

4. Hero system
- The thing in the middle that does the real work.
- For NaviCues, this is the atom.
- For Journeys, it is a sequence of staged hero beats.
- For Insights, it is a concept lens plus a deeper interactive demonstration.

The most important rule:

The player should be shared.
The hero system should vary.
The composition grammar should be strict.

## What The Code Already Establishes

### 1. The player layering is already correct

`NaviCueCompositor.tsx` already expresses the right stack:
- Z-0 black void
- Z-1 living atmosphere
- Z-2 hero physics
- Z-3 breathing HUD / narrative scaffolding
- diagnostic and persona layers feeding configuration into the renderer

That is already a universal-player pattern.
It should be generalized, not replaced.

### 2. The atom contract is already correct

`atoms/types.ts` already says the important thing clearly:
- the atom is not a visual primitive
- it is a self-contained physics engine
- it fills the viewport edge-to-edge
- the composition layer owns atmosphere/background/color story
- atoms do not own haptics directly
- atoms do not hardcode colors
- atoms do not own breath

That is the right philosophical bedrock.

### 3. The series system is already correct

`series-registry.ts` does not define themes.
It defines paradigms:
- domain
- physics paradigm
- color identity
- atom range

That means the system should standardize at the paradigm level, not at the visual-style level.

### 4. Metadata completeness is not the same as experience quality

The registries are rich and useful:
- intent
- physics
- render mode
- default scale
- surfaces
- haptic signature
- state range
- continuous / resolution
- breath coupling
- device requirements

But none of those fields guarantee:
- hero scale
- interaction depth
- consequence of failure
- perceptual payoff
- compositional restraint
- memorable resolution

That is the actual gap.

## The Universal Player Standard

All content types should render through the same envelope.

### Layer A. Envelope
- safe area
- viewport handling
- composed mode
- reduced motion
- sensor permissions
- diagnostics

### Layer B. Atmosphere
- color story
- background engine
- motion profile
- silence profile
- reactive behavior

### Layer C. Hero zone
- the primary experiential object
- always the most important thing in the viewport
- receives most of the visual voltage and kinetic weight

### Layer D. Guidance lane
- prompt
- support line
- live affordance hints
- phase-sensitive microcopy

### Layer E. Resolution lane
- receipt
- lock-in gesture
- closing signal
- exit choreography

The player should never care whether the hero is an atom, a journey stage, an insight lens, or a practice block.
It should only care that the hero conforms to the hero contract.

## Content-Type Rules

### NaviCue
- Highest complexity content type.
- Hero is a physics engine.
- Real-time input and real-time consequence are mandatory.
- Must feel like a move, not a lesson.

### Journey
- Multi-scene experiential container.
- Same player grammar, but the hero changes across scenes.
- Each scene should still have one dominant action and one real-world transfer.
- Journeys should feel like staged field conditions, not a slideshow.

### Insight
- Deeper conceptual immersion.
- Same player grammar, but hero is a concept lens, demonstration, or controlled transformation.
- More context, less friction than a NaviCue.
- Insight exists to accelerate believing, not to overwhelm with exposition.

### Practice
- Lightweight reusable module.
- Can be embedded anywhere.
- Less theatrical, but still embodied and specific.

### Video / Article
- Lowest hero complexity.
- Still rendered inside the same envelope and voice system.
- The player should preserve continuity of atmosphere, typography, and pacing.

## How To Streamline Without Flattening

The mistake would be to reduce variation.
The correct move is to reduce ambiguity.

### Standardize these

1. Composition grammar
- fixed player layers
- fixed hero zone logic
- fixed phase model
- fixed entry / active / resolve / seal / exit choreography

2. Paradigm families
- every atom belongs to a series physics paradigm
- every journey scene should declare its hero family
- every insight should declare its demonstration family

3. Quality gates
- a built atom is not a hero-grade atom
- registry completeness is not enough

4. Color relationships
- background color, atmosphere glow, and hero color must be coordinated intentionally
- they should not all sit at the same temperature, brightness, or saturation

5. Exit logic
- every experience must leave a clear memory trace
- even subtle experiences need a recognizable lock-in

### Keep these open

1. Gesture vocabulary
- hold
- drag
- swipe
- pinch
- rotate
- tilt
- breath
- gaze
- silence
- multi-touch
- hardware-linked gestures

2. Physics metaphors
- fluid
- tensile
- orbital
- acoustic
- optical
- thermal
- structural
- topological
- ecological
- paradoxical

3. Resolution forms
- collapse
- melt
- clear
- crystallize
- orbit
- settle
- bloom
- deflect
- fuse
- vanish

The correct design system is therefore:
- narrow in composition
- wide in hero invention

## The Hero-Grade Atom Standard

An atom should only be considered hero-grade if it passes all of the following.

### 1. Hero Occupancy
The atom must command the hero zone.
It cannot feel like a small widget floating in a big stage.

Pass condition:
- the atom claims spatial authority
- its motion footprint is large enough to feel consequential
- the eye lands on it before anything else

### 2. Singular Dominant Verb
Every atom needs one dominant embodied verb.
Examples:
- collapse
- redirect
- melt
- split
- hold
- thread
- settle
- tune

Pass condition:
- the user can feel what the atom wants from them within seconds
- there is one main move, not three equal moves

### 3. Counterforce
Every good atom has an opposing law.
The user should feel what happens when they do the wrong thing.

Examples from code:
- `one-pixel-tap` punishes frantic tapping by growing the structure
- `linear-strike-redirect` punishes blocking and rewards tangential motion
- `muddy-water-settle` punishes touching by re-agitating the system
- `path-least-resistance` punishes force and rewards liquefaction

Pass condition:
- the atom teaches through consequence, not explanation

### 4. Stateful Transformation
The atom must genuinely change state.
Not just animate.
Transform.

Pass condition:
- clear state model
- user input alters the simulation
- state progression is legible
- the atom cannot be mistaken for a looped illustration

### 5. Resolution Payoff
There must be a satisfying endpoint, even for quiet atoms.

Pass condition:
- the system clearly registers completion or deepening
- the ending feels inevitable and earned
- the perceptual payoff is stronger than the prompt text

### 6. Composed-Mode Discipline
The atom must stay pure inside the player.

Pass condition:
- no fighting the atmosphere
- no local color chaos against the color story
- no rogue text system inside the atom
- no hardcoded environmental assumptions

### 7. Multisensory Consequence
The atom must have a felt signature, not just a visual one.

Pass condition:
- haptic consequence is meaningful where hardware exists
- breath or silence coupling is intentional where relevant
- motion curves support the therapeutic physics instead of decorating it

### 8. Memory Trace
The atom should leave a residue in the user’s memory.

Pass condition:
- the user can describe what just happened physically
- the atom has a distinct internal logic or signature image
- the resolution can be recalled later in real life

## The Color Relationship Matrix

Color should not be selected atom-by-atom in isolation.
It should be computed through relationship.

### Recommended model

1. Background / atmosphere color story
- sets the emotional field
- owns the world tone

2. Hero primary
- defines object identity
- must separate from the field

3. Hero accent
- defines active edge, target, pressure, or resolution

4. Glow / resolution color
- defines the memory trace of change

### Rule set

1. The hero cannot disappear into the atmosphere.
2. The accent should usually be a directional contrast, not a duplicate of the background.
3. Resolution color should feel like an event, not just more of the same hue.
4. If the atmosphere is warm and dense, the hero often needs a cleaner or sharper read.
5. If the atmosphere is quiet and minimal, the hero can afford more internal richness.

The right move is not one universal palette.
The right move is a governed relationship matrix.

## Why Some Atoms Feel Small

This is the main failure mode visible in the codebase.

An atom feels small when one of these is true:
- the motion footprint is too local
- the dominant verb is weak
- the counterforce is absent or visually unclear
- the resolution does not recompose the field
- the atmosphere is doing more work than the hero
- the hero object is physically tiny without compensating field consequence

A small atom is not fixed by bigger graphics.
It is fixed by bigger consequence.

## The Correct QA Ladder

There should be four states, not one.

1. Designed
- intent and physics contract exist

2. Implemented
- component renders and input works

3. Playable
- composed mode works
- reduced motion works
- state progression is legible

4. Hero-grade
- passes the Hero-Grade Atom Standard
- feels compositionally worthy of the system
- can sit beside Collection 1 without embarrassment

Current registry status should not be treated as final quality truth.
A large number of atoms are implemented; fewer are truly hero-grade.

## What To Do Next

### 1. Build a dedicated hero package
Create a dedicated package for atoms / hero systems.

Target:
- `packages/navicue-atoms`

This package should own:
- atom contracts
- atom registries
- atom utilities
- hero QA metadata
- future journey / insight hero contracts if they converge

### 2. Add a hero audit layer
Every atom should gain a small additional metadata contract:
- dominantVerb
- counterforceType
- consequenceProfile
- occupancyGrade
- resolutionClass
- heroGrade
- memoryTraceType

That is the missing bridge between metadata and actual experience quality.

### 3. Separate “implemented” from “hero-grade”
Do not mark atoms complete just because they render.
The next audit pass should explicitly downgrade any atom that is merely functional.

### 4. Standardize the composition shell before standardizing the atoms
Do not flatten atom invention.
Tighten the envelope first:
- hero zone
- copy lane
- phase timing
- exit choreography
- color matrix

### 5. Apply the same player logic to Journeys and Insights
Journeys and Insights should not invent parallel frontend architectures.
They should inherit the same player and composition grammar, with lighter hero contracts.

## Architectural Conclusion

The right simplification is not:
- fewer atoms
- less variation
- more template sameness

The right simplification is:
- one player grammar
- one composition grammar
- one hero standard
- many hero expressions

That is how Recoverlution stays elegant without becoming generic.
That is how the atoms get raised to the same standard without becoming repetitive.
