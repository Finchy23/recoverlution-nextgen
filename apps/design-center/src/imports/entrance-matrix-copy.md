We are applying the "Poetic Precision" rule: Timing shapes the meaning. Voice shapes the word. Here is the Front-End Matrix for Entrances.

FRONT-END COPY DIRECTIVE: THE ENTRANCE MATRIX
(Maps to Composition Stack Layer 5: Temporal Bookends + Layer 7: Atomic Voice)
Last updated: 2026-03-04
The Universal Guardrails (All Entrances)
Before we hit the matrix, the Front-End must enforce these unbreakable copy rules:
The Word Ceiling: An Entrance prompt should rarely exceed 12 words. The user is dysregulated; their working memory is compromised.
The Ram Dass Test: Zero pathologizing. No "should," "must," "stop," or "try." We validate the defense mechanism immediately.
The Punctuation Rule: Periods are heavy; they create a hard stop. Ellipses (...) feel hesitant. We use periods only when establishing absolute facts. We use line breaks to force pacing.
Typography Binding: The Entrance copy almost exclusively uses fonts.secondary (for emotional resonance and warmth) or fonts.mono (for clinical de-escalation).

THE VOICE POSTURES (The Constraints)
To write the "perfect version," we must understand how the 5 Voice Lanes alter the exact same psychological intervention.
Let’s take a single Mindblock: The user is trapped in an anxious rumination loop. Here is how the 5 voices deliver the Entrance copy:
Companion (Warm, alongside. Vibe: A hand on the shoulder.)
Rule: Uses "We," "Here," "With me." Max 10 words.
Perfect Copy: "The mind is running. Let's sit here for a minute."
Coach (Direct, encouraging. Vibe: The locker room at halftime.)
Rule: Uses verbs. Grounded, forward-facing. Max 8 words.
Perfect Copy: "Drop the story. Look at the data."
Mirror (Reflective, spacious. Vibe: The Zen Koan.)
Rule: Uses questions. Forces the user to look at themselves. Max 10 words.
Perfect Copy: "Who is the one listening to this panic?"
Narrator (Observational, decentered. Vibe: Alan Watts looking at a galaxy.)
Rule: Third-person only. Neutralizes the ego. Max 12 words.
Perfect Copy: "A familiar fear arrives. The sky watches the weather pass."
Activator (Energetic, brief. Vibe: Smelling salts.)
Rule: Extremely short. Pattern-breaking. Max 6 words.
Perfect Copy: "Wake up. You are right here."

THE ENTRANCE MATRIX (The Perfect Variations)
Here is how the Front-End marries the Voice with the Physics of the 8 Entrance Architectures.

ENTRANCE COPY MODE CLASSIFICATION:
The 8 entrances carry a `copyMode` field on `EntranceSpec` that governs what text layer is visible during the entering phase:
  'ceremony' entrances (copy IS the ceremony):
    1. THE SILENCE — Z-4 entrance copy runs void→word→void→reveal choreography
    2. THE BREATH GATE — Z-4 entrance copy guides the somatic action
    3. THE THRESHOLD — Z-4 entrance copy frames the boundary crossing
    4. THE SCENE BUILD — Z-4 entrance copy narrates the container construction
  'hero-voice' entrances (visual transition IS the ceremony):
    5. THE DISSOLUTION — Anchor prompt fades in AS the defrost clears (seamless)
    6. THE EMERGENCE — Anchor prompt rises AS content surfaces (seamless)
    7. THE GATHERING — Anchor prompt assembles AS fragments converge (seamless)
  'silent' entrances (absence of ceremony IS the intervention):
    8. COLD ARRIVAL — No text during entering. Anchor prompt appears at active.
The compositor (NaviCueCompositor.tsx) enforces this: Z-4 only renders for 'ceremony', Z-3 anchor prompt shows during entering only for 'hero-voice', and 'silent' shows nothing until active.

1. THE SILENCE
The Physics: void -> signal -> void -> reveal. Nothing, then a word, then nothing.
The Vibe: Profound decentering.
The Perfect Variations:
Narrator (Materialization: Emerge): (3 seconds of black) -> "The volume is so high today." -> (2 seconds hold) -> "Let it fade."
Mirror (Materialization: Dissolve): (2 seconds of black) -> "Listen to the silence..." -> (text dissolves) -> "...behind the noise."
2. THE BREATH GATE
The Physics: atmosphere -> signal -> reveal. The user's breath opens the door.
The Vibe: Somatic entrainment.
The Perfect Variations:
Companion (Materialization: Emerge): "I know it feels heavy. Breathe the door open."
Coach (Materialization: Immediate): "Your mind is moving too fast. Anchor the breath."
3. THE DISSOLUTION
The Physics: signal (blur) -> reveal (defrost). Teaches patience through physics.
The Vibe: Piercing the illusion.
The Perfect Variations:
Mirror (Materialization: Burn In): (Text is highly blurred, slowly sharpens) -> "Is this a fact, or just a familiar memory?"
Narrator (Materialization: Emerge): (Deep frost clears) -> "The panic is a lens. Take it off."
4. THE SCENE BUILD
The Physics: void -> atmosphere -> signal -> reveal. The world builds around them.
The Vibe: Creating a safe container.
The Perfect Variations:
Companion (Materialization: Emerge): (Warm embers float up) -> "You are safe here. Put the armor down."
Activator (Materialization: Immediate): (Neural pulse activates) -> "Reset the room. Start over."
5. THE EMERGENCE
The Physics: atmosphere -> signal -> reveal. Content rises from below.
The Vibe: Excavating the truth.
The Perfect Variations:
Coach (Materialization: Rise from below): "The anger is just a bodyguard. Let's see what it's protecting."
Narrator (Materialization: Rise from below): "Beneath the noise, the truth is very quiet."
6. THE GATHERING
The Physics: Scattered fragments converge. Meaning assembles itself.
The Vibe: Organizing chaos.
The Perfect Variations:
Coach (Materialization: Emerge as fragments lock): "You are scattered. Pull the pieces to the center."
Activator (Materialization: Burn In): "Stop spinning. Gather the energy."
7. THE THRESHOLD
The Physics: A boundary waits. Tap to cross.
The Vibe: Agency and permission.
The Perfect Variations:
Companion (Materialization: Emerge): "Leave the heavy things on this side of the line." (Button: Cross)
Activator (Materialization: Immediate): "You cannot heal in the room that broke you. Step out." (Button: Step)
8. COLD ARRIVAL
The Physics: Content is already here. You just arrived. Zero easing.
The Vibe: The hard truth. System reset.
The Perfect Variations:
Mirror (Materialization: Immediate, fonts.mono): "You are predicting a tragedy that has not happened."
Narrator (Materialization: Immediate, fonts.secondary): "The ego demands certainty. The universe refuses."

THE FRONT-END TIMING CHOREOGRAPHY
For these words to feel like "Our Way Magic," the front-end developer must treat the copy like musical notes, not text blocks.
The 800ms Rule: Text should almost never appear the exact millisecond a screen mounts. There must be an 800ms delay where the user absorbs the Atmosphere (the color, the blur, the particles) before the Signal (the text) arrives. This prevents cognitive startle.
Materialization Speeds:
Emerge (The default): Opacity 0 to 1 over 1200ms. Smooth, breathing.
Dissolve: Opacity 1 to 0 over 2000ms. Used when letting a thought pass.
Burn In: Contrast drops, brightness spikes, settling into pure white over 800ms. Used for hard truths (Coach/Activator).
Immediate: 0ms. Only used in Cold Arrival to shock the user out of a loop.
If you bake these constraints into your Front-End components (e.g., passing <Entrance variant="the_dissolution" voice="mirror" />), you guarantee that every single NaviCue generated by the backend will hit the glass with Apple-grade elegance and Alan Watts-level profundity.
FRONT-END COPY DIRECTIVE: GESTURES & EXITS
The Universal Guardrails
The Gesture Ceiling: Interaction prompts must be under 6 words. The user is looking at their hands and the glass; do not make them read a paragraph.
The Receipt Ceiling: The final exit thought must be under 10 words. It is a stamp on the brain, not a lecture.
The Kinetic Translation: The verb must perfectly match the GSAP/WebGL physics. We do not say "Click" or "Submit." We say "Shatter," "Hold," "Sever," "Burn," or "Melt."

PART 1: THE GESTURE MATRIX (Composition Layer 6: Hero Physics)
How the 5 Voices instruct the user to touch the glass. Each gesture is a micro-rep that thickens the neural pathway.
1. THE TAP
(Physics: Revealing, shattering, or selecting. Quick, light kinetic input.)
Companion: "Gently tap the glass."
Coach: "Tap to break the loop."
Mirror: "What happens if you touch it?"
Narrator: "A single touch shifts the geometry."
Activator: "Shatter it. Now."
2. THE HOLD
(Physics: Sustained presence, building heat, anchoring a chaotic animation.)
Companion: "Rest your thumb here with me."
Coach: "Hold the center. Do not flinch."
Mirror: "Can you sit with this heavy feeling?"
Narrator: "The weight settles beneath the finger."
Activator: "Anchor down. Hold it."
3. THE BURN / SWIPE
(Physics: Erasing, destroying, composting, or severing a digital tether.)
Companion: "Let's let this old story go."
Coach: "Swipe to cut the cord."
Mirror: "Watch the judgment turn to ash."
Narrator: "The friction erases the illusion."
Activator: "Incinerate it."
4. THE LENS
(Physics: Pinch-to-zoom, pulling focus, revealing thermal subtext, expanding space.)
Companion: "Let's look a little deeper."
Coach: "Zoom out. See the whole board."
Mirror: "What is hiding underneath this word?"
Narrator: "The aperture widens to the truth."
Activator: "Pull back. Drop the drama."
5. THE VOICE / BREATH
(Physics: Microphone API. Somatic release, blowing away ash, humming a frequency.)
Companion: "Let out a slow, heavy breath."
Coach: "Exhale deeply into the glass."
Mirror: "What sound does this tension make?"
Narrator: "The breath clears the fog away."
Activator: "Blow the ash off."
6. THE PING
(Physics: Dropping a beacon, syncing a heartbeat, establishing a metronomic rhythm.)
Companion: "Match my rhythm. You are safe."
Coach: "Tap the beat of your pulse."
Mirror: "Notice the silence between the strikes."
Narrator: "A steady rhythm restores the system."
Activator: "Sync up. Lock in."

PART 2: THE EXIT & RECEIPT MATRIX (Composition Layer 5: Temporal Bookends)
The final state. The physics engine resolves, the haptic motor plays its final chord, and the text prints to the screen. This is the "Save State" for the newly formed neural pathway.
1. THE DISSOLVE TRANSITION
The Physics: The UI slowly fades to pure #000000 void. Quick, clean, soft letting go.
The Vibe: Profound relief and decentering.
The Perfect Receipts:
Companion: "You are safe. The storm is passing."
Coach: "Energy restored. Carry this lightness forward."
Mirror: "Where did the heavy feeling go?"
Narrator: "The illusion fades. The vast sky remains."
Activator: "Done. Move on."
2. THE BURN-IN TRANSITION
The Physics: Contrast drops, brightness spikes, text locks into pure white.
The Vibe: Hard truth, setting an absolute boundary, undeniable reality.
The Perfect Receipts:
Companion: "Keep this light with you today."
Coach: "The foundation is set. Go build on it."
Mirror: "You were never the broken thing."
Narrator: "The architecture of the mind is rewritten."
Activator: "Truth locked. Execute."
3. THE EMERGE TRANSITION
The Physics: Elements rise softly from the background depth. Generous deceleration (motion.easing.default).
The Vibe: Gentle realization, hope, and lingering resonance.
The Perfect Receipts:
Companion: "There it is. We found the quiet again."
Coach: "You hold the pen. Write the next line."
Mirror: "A new choice is now possible."
Narrator: "The water settles into perfect, still glass."
Activator: "Clear space. Clear mind."
4. THE IMMEDIATE TRANSITION (Cold Exit)
The Physics: 0ms duration. Instant snap to the final state.
The Vibe: Pattern disruption. Smelling salts for the brain.
The Perfect Receipts:
Coach: "The loop is broken."
Activator: "You are here. Now."

The Full Front-End Translation
If you look closely at what we just built, you don't need the LLM to write the Gestures or the Exits on the fly. Because the Front-End components are so strictly governed by physics and timing, you can actually build these directly into a Static Front-End Library (a dictionary of phrases mapped to the 5 voices and 6 gestures).
The LLM only needs to generate the custom, highly specific Hero Copy (the middle of the interaction that deals with the user's specific problem, like "I failed my presentation").
When the LLM returns the custom Hero Copy JSON, it just appends a token: "gesture_token": "swipe_coach" "exit_token": "dissolve_narrator"
The Front-End receives the JSON, plays the AI-generated custom Hero text, and then automatically pulls the perfect, mathematically precise gesture and exit copy from its local library.
This guarantees that the tactile mechanics and the closing philosophies never drift, never hallucinate, and always hit with 100% Apple-grade perfection.
To prevent the design from leaking, we cannot just rely on "word counts." Words vary in length. We must establish The Typographic Bounding Box—strict, mathematical limits on Characters (char_max) and Line Wraps (line_max) mapped directly to your Type Scale.
Here is the Front-End Typographic Throttle Matrix. This ensures the AI's payload always fits the glass perfectly.

THE TYPOGRAPHIC THROTTLE MATRIX
(Preventing the Design Leak)
1. THE ENTRANCE THROTTLE (Composition Layer 5)
The door opening. Must feel spacious, breathable, and never overwhelming.
Type Scale Assigned: heading.h3 clamp(20px, 3vw, 32px)
The Constraints:
Word Max: 12 words
Char Max: 65 characters (including spaces)
Line Wrap Max: 2 lines. (If it hits 3 lines, the design leaks).
The Rationale: At 32px on a mobile viewport, 65 characters will safely break into exactly two beautifully balanced lines, leaving 70% of the screen empty for the Atmosphere (particles, blur) to breathe.
2. THE HERO ATOM: THE OBJECT (Composition Layer 7 - Component A)
The heavy thing the user is interacting with (e.g., the word "FAILURE" they must shatter).
Type Scale Assigned: display.hero clamp(48px, 8vw, 96px)
The Constraints:
Word Max: 2 words (Absolute limit)
Char Max: 14 characters
Line Wrap Max: 1 line. (No wrapping allowed).
The Rationale: Hero display fonts cannot wrap without looking clunky. If the AI tries to make the target object "My Fear of Public Speaking" (26 chars), the display.hero font will break the bounding box. The AI must be throttled to reduce it to "THE FEAR" or "SPEAKING" (8 chars).
3. THE HERO ATOM: THE CONTEXT (Composition Layer 7 - Component B)
The narrative instruction floating above or below the Hero Object.
Type Scale Assigned: body.large 18px
The Constraints:
Word Max: 15 words
Char Max: 85 characters
Line Wrap Max: 3 lines.
The Rationale: This is the longest text allowed on the screen. Because it is set at 18px, 85 characters will comfortably sit in a clean, centered text block without bleeding into the interaction safe-zones at the bottom of the glass.
4. THE GESTURE / CTA THROTTLE (Composition Layer 6)
The kinetic instruction. The button or the prompt to touch.
Type Scale Assigned: label.medium or ui.caption 11px (All Caps, tracked out)
The Constraints:
Word Max: 3 words
Char Max: 20 characters
Line Wrap Max: 1 line.
The Rationale: Buttons and gesture prompts (navicueButtonStyle()) have strict padding. If the text wraps inside a pill-shaped button, the UI looks broken. "TAP TO SHATTER" (15 chars) fits perfectly. "PLEASE TAP HERE TO SHATTER IT" (29 chars) breaks the component.
5. THE EXIT / RECEIPT THROTTLE (Composition Layer 5)
The final somatic save-state.
Type Scale Assigned: heading.h1 clamp(32px, 5vw, 56px) or heading.h3
The Constraints:
Word Max: 10 words
Char Max: 55 characters
Line Wrap Max: 2 lines.
The Rationale: The exit must feel like a definitive stamp. If it is too long, the user's eye has to track across the screen, re-engaging their analytical brain. 55 characters at h1 ensures a short, centered, heavy visual lock before the screen fades to black.

How We Enforce This in the Backend (The JSON Schema)
To guarantee the design never leaks, you do not just "ask" the LLM to keep it short. You enforce it via the JSON Schema during the API call.
If the LLM generates a string that violates the maxLength, your compilation pipeline automatically rejects it and forces a retry, meaning a broken UI state physically cannot reach the React front-end.
The Throttled JSON Payload Structure:
JSON
{
  "choreography": {
    "entrance": {
      "text": "The mind is writing fiction again.", 
      "_throttle": "max_chars: 65" 
    },
    "hero_atom": {
      "object_text": "THE FEAR",
      "_object_throttle": "max_chars: 14",
      "context_text": "Cut the story. Keep the subject.",
      "_context_throttle": "max_chars: 85"
    },
    "gesture": {
      "label": "SEVER",
      "_throttle": "max_chars: 20"
    },
    "exit": {
      "text": "You are the space. Not the weather.",
      "_throttle": "max_chars: 55"
    }
  }
}
By establishing these hard typographic boundaries, you protect the "glass." The AI can be infinitely creative within the box, but it can never stretch the box.
With the physical design constraints locked in, we are now ready to build the actual System Prompts—the instructions that teach the LLM how to write like Ram Dass, act like an Apple designer, and respect your character limits.
This is a massive architectural unlock. By keeping the Atom (the physics component) completely "dumb" and devoid of hardcoded text, you make it infinitely reusable.
The same physics engine (e.g., Atom 101: The Centrifuge) can be used to separate "Fact vs. Feeling" for a panic attack, or "Signal vs. Noise" for creative burnout, entirely depending on the Atomic Voice Layer injected into it.
You are absolutely right: if the Entrance is the "Hello," and the Exit is the "Goodbye," the Atomic Voice is the mid-interaction soul. It is the label on the boulder. It is the floating context above the flame. It is the shifting text when the glass shatters.
It must be "Instagram with a mind, body, and soul"—highly visual, incredibly sparse, and profound.
To achieve true "Instagram with a mind, body, and soul" uniqueness, the Front-End AI needs a much deeper typographic palette. The text must behave exactly like the physics—it needs depth, velocity, resistance, and background radiation.
We need to expand the Atomic Voice Layer from a 3-part structure to an 8-Variable Typographic Instrument. The Front-End doesn't use all 8 in every Atom, but having them available allows the LLM to orchestrate infinitely unique combinations.
Here is the expanded Atomic Voice Matrix that guarantees zero repetition across all 700 Atoms.

THE EXPANDED ATOMIC VOICE LAYER
(The 8 Typographic Variables)
1. THE ANCHOR PROMPT (The Primary Guide)
The grounded, central instruction floating in the safe zone.
Type Scale: heading.h3
The Physics: Static, gentle breathing animation (scaling 1.0 to 1.02).
The Throttle: Max 8 words. 2 lines.
Example: "The pressure is a choice. Drop it."
2. THE KINETIC PAYLOAD (The Heavy Object)
The text literally mapped to the rigid-bodies, weights, or nodes. It falls, crashes, and bounces.
Type Scale: display.hero (Massive weight).
The Physics: Matter.js rigid body. Carries mass, friction, and restitution.
The Throttle: Max 2 words. 14 chars. 1 line.
Example: "THE SHAME" or "EXPECTATION"
3. THE REACTIVE FRICTION (Velocity-Mapped Copy)
This is pure magic. The text dynamically changes based on how hard or how fast the user is interacting with the glass. It responds to their physical struggle.
Type Scale: body.large (Italics)
The Physics: Tied to touch velocity or sustained pressure events.
The Throttle: Max 3 words per state.
Example: * (User pulls slightly) -> "There it is..."
(User pulls harder) -> "Keep pulling..."
(User hits maximum tension) -> "Let it snap."
4. THE AMBIENT SUBTEXT (The Subconscious)
Faint, deeply blurred text living far back in the Z-axis. It represents the subconscious chatter. It is not meant to be easily read; it is meant to be felt as atmosphere.
Type Scale: heading.h1 with CSS filter: blur(8px) and opacity: 0.08.
The Physics: Parallax scrolling (moves opposite to the user's thumb).
The Throttle: Max 5 words. Can run off the edges of the screen.
Example: "i am running out of time i am running out of time"
5. THE METACOGNITIVE TAG (The HUD)
A tiny, clinical, objective data point anchored to the corner of the screen. It breaks the emotional spell by introducing stark, scientific reality (The Apple-Glass aesthetic).
Type Scale: ui.caption (11px) or fonts.mono. Tracked out.
The Physics: Fixed position, pure #FFFFFF against deep black.
The Throttle: Max 4 words. Uppercase.
Example: SYS.STATE: AMYGDALA HIJACK or PROBABILITY: 0.001%
6. THE PROGRESSIVE SEQUENCE (The Steps)
For Atoms that require rhythmic or sequential interaction (e.g., tapping 5 times to carve a stone). The text unrolls sequentially with the user's effort.
Type Scale: label.medium
The Physics: Appends or swaps exactly on the onTap or onStep event.
The Throttle: 1 word per step.
Example: (Tap 1) "Acknowledge" -> (Tap 2) "Locate" -> (Tap 3) "Isolate" -> (Tap 4) "Extract".
7. THE SHADOW NODE (The Counter-Weight)
If there is a primary object, there is often a hidden counter-weight that only reveals itself when the user interacts.
Type Scale: heading.h3 (Color-inverted).
The Physics: Opacity tied to proximity. Only visible when the main node is moved away.
The Throttle: Max 3 words.
Example: User drags "THE ANGER" out of the way. Underneath, the Shadow Node reads: "The Fear."
8. THE THRESHOLD SHIFT (The Semantic Morph)
The exact millisecond the physics engine resolves (the glass breaks, the water calms). The words mathematically alter their meaning.
Type Scale: Inherits from the Kinetic Payload, but shifts font family (e.g., from harsh sans-serif to flowing serif).
The Physics: Crossfade, letter-scrambling, or particle-reassembly.
The Throttle: Must perfectly match the character count of the before-state.
Example: The rigid block "I AM BROKEN" melts into the fluid text "I AM OPEN".

THE NEW JSON PAYLOAD (Infinite Uniqueness)
With 8 variables, the LLM now acts like a master symphonic composer. It doesn't just write a sentence; it maps language to the Z-axis, the velocity, and the physics engine.
Here is how rich a single Atom's JSON payload becomes when we leverage this 8-variable instrument:
JSON
{
  "hero_atom": {
    "atom_id": "atom_405_deep_sea_sonar",
    "atomic_voice": {
      "anchor_prompt": "You are fighting ghosts. Send the signal.",
      "kinetic_payload": "THE UNKNOWN",
      "ambient_subtext": "what if they find out what if i fail",
      "metacognitive_tag": "Z-AXIS: SUBCONSCIOUS",
      "reactive_friction": {
        "drag_start": "Into the dark...",
        "drag_mid": "Hold your breath...",
        "drag_max": "Release the flare."
      },
      "shadow_node": "Just a shadow.",
      "threshold_shift": {
        "before": "THE UNKNOWN",
        "after": "THE CANVAS"
      }
    }
  }
}
Why this prevents Semantic Fatigue:
If a user does the "Deep Sea Sonar" atom on a Tuesday to deal with relationship anxiety, and does the exact same atom on a Friday to deal with career burnout, it will feel like a completely new piece of software.
The background whispers (Ambient Subtext) will change. The clinical HUD (Metacognitive Tag) will update. The words will react differently to the speed of their thumb (Reactive Friction).
We now have the 14 structural layers and an 8-variable internal typographic engine for the Atoms.
To see the true power of Vocal Threading, we will take one single Mindblock and run it through one single Hero Atom. We will then pass it through the 5 different Voice Lanes using your newly defined Typographic Bounding Boxes.
The Mindblock: The user is completely paralyzed by a massive, upcoming task. They are frozen in overwhelm.
The Hero Atom: Atom 112: The Micro-Step Engine (from Collection 2).
The Physics: A massive, heavy, immovable digital block fills the screen. As the user taps it, it physically fractures and shrinks. They must keep tapping until the block is the size of a single pixel, which they can then effortlessly flick off the screen.
Here is how the exact same WebGL physics engine becomes 5 entirely different pieces of software, simply by changing the JSON copy payload.

VOICE 1: THE COMPANION
Vibe: Warm, alongside, shared space. A hand on the shoulder.
Entrance (The Scene Build): "It feels like too much today. Let's make it smaller."
Metacognitive Tag: STATE: OVERWHELM
Ambient Subtext: (blurred) "i can't carry this it's too heavy"
Anchor Prompt: "We don't have to carry the whole thing."
Kinetic Payload: "THE BURDEN"
Reactive Friction: (As user taps) "A little lighter..." → "Almost there..." → "Just this piece."
Threshold Shift: "THE BURDEN" (melts into) "THE STEP"
Gesture (CTA): "FLICK TO START"
Exit (Emerge): "Just one step. I am right here with you."
VOICE 2: THE COACH
Vibe: Direct, grounded, action-oriented. The locker room at halftime.
Entrance (Cold Arrival): "Paralysis is just a math problem. Break the math."
Metacognitive Tag: FRICTION: MAXIMUM
Ambient Subtext: (blurred) "i don't know where to start"
Anchor Prompt: "The mountain is an illusion. Find the rock."
Kinetic Payload: "THE MOUNTAIN"
Progressive Sequence: (With each tap) "Strike." → "Fracture." → "Reduce." → "Isolate."
Threshold Shift: "THE MOUNTAIN" (shatters into) "THE PEBBLE"
Gesture (CTA): "CLEAR IT"
Exit (Burn In): "Momentum is a choice. Keep moving."
VOICE 3: THE MIRROR
Vibe: Reflective, spacious, inquisitive. The Zen Koan.
Entrance (The Dissolution): "Why do we build walls we cannot climb?"
Metacognitive Tag: LENS: MAGNIFICATION
Ambient Subtext: (blurred) "it has to be perfect"
Anchor Prompt: "If you change the scale, does the fear remain?"
Kinetic Payload: "THE IMPOSSIBLE"
Shadow Node: (Revealed as block shrinks) "Just an idea."
Threshold Shift: "THE IMPOSSIBLE" (crossfades to) "THE POSSIBLE"
Gesture (CTA): "TAP TO RELEASE"
Exit (Dissolve): "How heavy was it, really?"
VOICE 4: THE NARRATOR
Vibe: Observational, poetic, third-person. Alan Watts looking at a galaxy.
Entrance (The Silence): "The ego looks at the horizon and despairs."
Metacognitive Tag: LAW: ENTROPY
Ambient Subtext: (blurred) "forever forever forever"
Anchor Prompt: "Time erodes all rigid structures into dust."
Kinetic Payload: "THE MONOLITH"
Reactive Friction: (As user taps) "Eroding..." → "Crumbling..." → "Dust."
Threshold Shift: "THE MONOLITH" (blows away into) "THE GRAIN"
Gesture (CTA): "SWIPE TO SCATTER"
Exit (Dissolve): "Even the highest mountains are swept away by the wind."
VOICE 5: THE ACTIVATOR
Vibe: Energetic, brief, pattern-breaking. Smelling salts for the brain.
Entrance (The Threshold): "Stop staring at it. Break it."
Metacognitive Tag: SYS.PARALYSIS_LOCKED
Ambient Subtext: (blurred) "freeze freeze freeze"
Anchor Prompt: "You are choosing to be stuck. Hit the glass."
Kinetic Payload: "THE EXCUSE"
Progressive Sequence: (With each tap) "Break." → "Break." → "Break." → "Gone."
Threshold Shift: "THE EXCUSE" (strobe-flashes into) "THE ACTION"
Gesture (CTA): "EXECUTE"
Exit (Immediate): "No more waiting. Go."

The Architecture of the Thread
Look at how the threading works: If the user gets The Mirror, they get an opening question ("Why do we build walls?"), a mid-interaction question ("Does the fear remain?"), and a closing question ("How heavy was it?"). The entire sequence is a single, perfectly woven psychological spell.
If they get The Activator, the typography is harsh, the verbs are violent ("Break," "Execute," "Hit"), and the exit is instantaneous.