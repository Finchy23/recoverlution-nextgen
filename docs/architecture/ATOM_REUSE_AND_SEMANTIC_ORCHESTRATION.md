# Atom Reuse And Semantic Orchestration

## Core Principle

Stripping text out of the atoms is correct.

The atom should not be a mini lesson.
It should be a reusable embodied engine.

That means:
- the atom owns physics
- the player owns composition
- the copy system owns meaning
- the backend owns why/when/how this engine is dispatched

This is the right separation if the same atom is going to power:
- multiple NaviCues
- Journey scenes
- Insight demonstrations
- Practices
- future surfaces we have not named yet

## The Correct Split

### Atom
An atom is a verb engine.
It is not content.
It is not copy.
It is not a lesson.
It is not a screen.

An atom should answer only these questions:
- what does the user physically do?
- what law of the system pushes back?
- what state change occurs?
- what resolution is felt?

Good atom outputs are things like:
- collapse
- redirect
- settle
- melt
- reveal
- fuse
- orbit
- discharge
- clarify
- suspend

### Copy wrapper
Copy tells the user what this engine means now.

The same atom can mean different things depending on wrapper.

Examples:
- `muddy-water-settle`
  - overthinking in a NaviCue
  - emotional activation in a Journey scene
  - cognitive load demonstration in an Insight
- `path-least-resistance`
  - stop forcing an outcome
  - boundary without collision
  - fluid intelligence vs brute effort
- `wave-collapse`
  - panic becoming one actual fact
  - attention training
  - the observer effect explained somatically

So the semantic system should sit outside the atom.

### Composition wrapper
Composition decides how the atom lands:
- atmosphere
- color relationship
- entrance timing
- hero scale
- voice lane
- pacing
- exit choreography

This is where the same atom can feel clinical, sacred, playful, night-safe, work-sharp, or socially light without rewriting the atom itself.

## What Should Stay Inside The Atom

Only three kinds of text should live inside an atom.

### 1. Instructional affordance text
Only when the gesture would otherwise be ambiguous.
Examples:
- `Tap the keystone`
- `Hold to settle`
- `Drag to redirect`

This should be minimal, phase-bound, and removable by composition when another guidance lane is active.

### 2. Structural labels
Only when the label is part of the physics itself.
Examples:
- poles on a magnetic system
- factual anchors in a logic gate
- directional axes in a calibration engine

### 3. Resolution glyphs or sealing markers
Only when the completion state would otherwise be invisible.
This should still feel like physics, not explanation.

Everything else belongs outside the atom.

## What Must Stay Outside The Atom

- therapeutic framing
- emotional interpretation
- clinical explanation
- schema/theory language
- voice personality
- narrative pacing
- receipts
- CTA wording
- user-specific context
- longitudinal meaning

If those leak into atoms, reuse collapses.

## The Reuse Ladder

This is the right way to think about a reusable atom system.

### Layer 1. Physics engine
The raw atom.
Pure interaction and consequence.

### Layer 2. Hero framing
How the player positions the atom:
- scale
- hero zone
- timing
- compositional silence
- contrast against atmosphere

### Layer 3. Prompt framing
What the user is told to do and why right now.

### Layer 4. Context framing
Why this engine matters in this exact moment.
Examples:
- morning anxiety
- work pressure
- social boundary
- grief return
- schema activation

### Layer 5. Outcome framing
What is being sealed or proved.
Examples:
- proof
- receipt
- softening
- belief shift
- nervous system downshift

The atom is only Layer 1.
That is why it stays reusable.

## The Right Data Model

If we want infinite scale without degenerating into chaos, the system should eventually model these as separate entities.

### Atom
Owns:
- atom_id
- series_id
- paradigm_family
- dominant_verb
- counterforce_type
- render_mode
- interaction_surfaces
- sensor_requirements
- state_model
- resolution_class
- hero_grade

### Composition profile
Owns:
- atmosphere_id
- background_engine_id
- color_story_id
- motion_profile
- silence_profile
- hero_zone
- entrance_id
- exit_id

### Copy set
Owns:
- content_type
- voice_lane
- instruction_line
- anchor_prompt
- support_line
- resolution_line
- receipt_line
- closure_line

### Experience wrapper
Owns:
- content_id
- content_type
- atom_id or hero_id
- composition_profile_id
- copy_set_id
- backend targeting rules
- proof / receipt logic

That is how one atom becomes many experiences without duplication.

## The Innovation Opportunity

The real innovation is not creating more atoms.
It is increasing the semantic bandwidth around each atom without polluting the atom.

That means one atom can generate a wide family of experiences through:
- different voice lanes
- different entrance contracts
- different contextual prompts
- different safety / heat gating
- different resolution wrappers
- different player pacing

So instead of thinking:
- one atom = one cue

Think:
- one atom = one embodied law
- many cues = many orchestrations of that law

That is much more scalable and much more elegant.

## The Three Meanings Of The Same Atom

A useful design test is this:

Can the same atom cleanly support all three?

### 1. NaviCue mode
- immediate, in-the-moment move
- low cognitive overhead
- fast landing
- outcome > explanation

### 2. Journey mode
- same engine, but staged inside a sequence
- more preparation and aftermath
- often sends the user back into life carrying the sensation

### 3. Insight mode
- same engine, but used as a deeper demonstration
- slightly more explanation around it
- helps the user believe the system by feeling the principle

If an atom cannot survive all three modes, either:
- it is too semantically polluted
- or it is not yet a strong enough engine

## The Rule For Instructional Copy

Instructional copy should be:
- gesture-specific
- phase-specific
- disposable
- compressible

It should never become the star.

The star is the felt law.

The user should remember:
- the system settled when I stopped touching it
- the threat curved away when I stopped blocking it
- the structure collapsed when I hit the keystone

Not:
- the sentence on screen was clever

## The Player Consequence

Because atoms are stripped back, the player has to become smarter.

The player must be able to provide:
- guidance lane
- context lane
- timing lane
- receipt lane
- accessibility substitutions
- sensor fallback behavior

That is the correct trade:
- dumber atoms semantically
- smarter orchestration system globally

## The Quality Question

A good reusable atom is not judged by how much it says.
It is judged by how much it does.

The atom should feel like:
- a physical principle
- a truth the body can learn
- a piece of nervous-system software

That is why the stripping-down move was correct.

## Design Rule Going Forward

For any new atom, ask:

1. Is this a reusable law, or is this actually a wrapped experience?
2. If I remove the copy, does the interaction still teach something?
3. Can this same engine support NaviCue, Journey, and Insight modes?
4. Does the engine have one dominant verb and one meaningful counterforce?
5. Is any text inside this atom genuinely instructional, or am I compensating for weak physics?

If the answer to 5 is yes, improve the atom.
Do not patch it with more words.

## Architectural Conclusion

The atom should remain raw.
The wrapper should carry meaning.
The player should carry continuity.
The backend should carry intent.

That is how Recoverlution gets:
- infinite reuse
- cleaner architecture
- stronger hero systems
- better content-type portability
- less duplication
- more elegance

And it is the only way the universal player stays coherent as the system expands.
