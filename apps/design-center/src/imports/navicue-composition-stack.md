THE NAVICUE COMPOSITION STACK
(The 7 Layers of a Living NaviCue)

Last updated: 2026-03-04
Status: Canonical architectural reference

This document serves as the master architectural blueprint for the Recoverlution Operating System. It outlines a fundamentally new medium for psychological intervention: a physics engine for the human condition.
We do not treat psychological pain with static text, endless journaling, or chatbot lectures. We treat it with gravity, friction, light, and breath. By translating invisible emotional states — like panic, enmeshment, or shame — into manipulatable digital matter, we empower the user to mechanically regulate their own nervous system.
To achieve this "Instagram with a mind, body, and soul" aesthetic at scale, the system's design and logic are strictly decoupled. A NaviCue is not a pre-drawn screen. It is a Temporal Architecture — a living, breathing, neuro-adaptive ecosystem compiled in milliseconds.
Every single interaction is built by stacking 7 highly specific, modular layers. The backend identifies the clinical target and generates the exact typographic payload; the front-end renders the physics, the atmosphere, and the haptics. The result is a system capable of producing millions of unique, perfectly paced interventions that feel handcrafted, deeply empathic, and structurally flawless.
Here is the precise anatomy of the glass.

IMPLEMENTATION NOTES:
- Platform: TypeScript React + Vite web application (NOT React Native)
- Animation: motion/react (NOT framer-motion)
- Routing: react-router (NOT react-router-dom)
- State: Zustand with useShallow from zustand/react/shallow
- Canvas: 2D Canvas API (no WebGL/konva in this environment)
- Sizing: All positions/sizes viewport-relative via minDim * factor
- Colors: No hardcoded hex — everything through design-tokens.ts named constants
- Transparency: Never use 'transparent' in animations — use TRANSPARENT ('rgba(0,0,0,0)')

---

LAYER 1: THE DIAGNOSTIC CORE
(The Invisible Trigger)
Before the glass ever wakes up, the system must calculate the exact coordinates of the user's suffering. This is the backend logic that prevents the system from acting like a generic meditation app. It does not treat the symptom; it maps the root geometry of the pain before a single pixel is rendered.
The Schema Target (The Source Code): The psychological architecture driving the mindblock (e.g., Defectiveness, Abandonment, Unrelenting Standards). This variable ensures the AI targets the actual root wound, preventing the "whack-a-mole" treatment of surface-level anxiety. It dictates the Why.
The Heat Band (The Autonomic Velocity): The user's biological state, measured from Level 1 (Calm/Resting) to Level 5 (Amygdala Hijack/Panic). This strict parameter dictates the cognitive load of the entire interaction. If the Heat is high, the system physically locks out complex reading and forces pure somatic mechanics. It dictates the How.
The Chrono-Context (The Temporal Reality): The psychological environment of the moment (Morning, Work, Social, Night). This ensures the intervention respects the user's immediate reality. A morning cue requires emergence and momentum; a night cue requires dissolution and letting go. It dictates the When.

LAYER 2: THE LIVING ATMOSPHERE
(The Background Engine)
The screen is never a static backdrop; it is a reactive, living ecosystem. By combining the variables below with the chrono-context of Layer 1, the system generates thousands of possible unique skies. This layer acts as the digital equivalent of a sympathetic nervous system — it listens, breathes, and responds to the user's presence before a single word is ever read.

The 4 atmosphere systems are fully harmonized and orthogonal:
- Color Signatures (8 palettes in navicue-data.ts) = WHAT color
- Visual Engines (6 canvas renderers in EngineRenderers.tsx) = WHAT moves
- Response Profiles (4 modes enriched in dc-tokens.ts RESPONSE_VISUALS) = HOW it responds to touch
- Atmosphere Presets (6 in composition-presets.ts) = HOW MUCH of everything

Presets set ONLY engineParams and breathPattern, never overriding engine/color/response.

The Color Signature (The Emotional Hue): The foundational color palette and atmospheric vibe (8 options, e.g., Sacred Ordinary, Quiet Authority, Neural Reset). This dictates the ambient temperature of the glass, shifting the mood from warm co-regulation to clinical objectivity.

The Visual Engine (The Material Reality): The underlying canvas material that renders the space.
Particle Field: Floating dots that scatter, attract, or orbit. A living, breathing sky.
Gradient Mesh: Soft color blobs that morph and drift. The Northern Lights made intimate.
Noise Fabric: Perlin noise undulating like cloth. A tactile texture that breathes beneath the words.
Constellation: Connected dots forming and dissolving networks. Neural pathways made visible.
Liquid Pool: Fluid simulation feeling — warmth pooling and flowing toward gravity and touch.
Void: Almost nothing. Deep space. The faintest pulse on the deepest dark to teach the power of emptiness.

The Response Profile (The Kinetic Empathy): How the background handles the user's physical input. It dictates the relationship between the user and the environment.
Resonance (Echo): The background echoes the gesture. Your dance partner. It ripples outward on a tap and intensifies its glow during a hold.
Contrast (Koan): The background does the exact opposite of the user. It creates depth and pattern-disruption through therapeutic tension.
Witness (Ghost): The background notices you, but does not perform for you. It provides felt support and presence without creating dependency.
Immersion (Dissolve): The boundary between the interactive Hero object and the background completely dissolves. The screen is the interaction.

LAYER 3: THE PULSE & MOTION
(The Nervous System)
If Layer 2 provides the environment, Layer 3 provides the heartbeat. This is where Apple-grade design precision meets autonomic neurobiology. The animation is never decorative; it is entirely functional. By mathematically syncing the UI's movement to specific respiratory and somatic frequencies, the interface acts as a visual metronome, entraining the user's nervous system into regulation simply by having them watch the glass.
The Motion Curves (The Physics of Feeling): The exact mathematical easings that dictate how digital mass behaves. It creates the visceral feeling of weight, relief, and realization.
Arrival (easing.default): Generous, beautiful deceleration. This is how insight lands — with patience and weight.
Departure (duration.slow): Quick, clean, and complete. No lingering opacity. This is how pain leaves the system.
Spring (easing.spring): The living, organic feel. A highly subtle 2px overshoot on landing that proves the digital object has actual physical mass.

The Breath Engine (useBreathEngine): The master sine-based timing function that underlies the entire animation state. The particles, the gradient, and the text all pulse to this underlying rhythm, pulling the user's autonomic state with it.
Calm: The standard parasympathetic baseline. Smooth, rolling, effortless.
Box: 4-count square breathing (In-Hold-Out-Hold). High-structure pacing designed to arrest acute panic.
Simple: Standard, rhythmic inhale/exhale for gentle focus and presence.
Energize (4-7-8): The absolute parasympathetic reset. The UI physically holds its "breath" and then executes an exhale animation that is mathematically twice as long as the inhale.

LAYER 4: THE PERSONA
(The Audio/Visual Tone)
In traditional software, text is just data. In this system, text has posture, weight, and a soul. Layer 4 determines exactly how the system looks and speaks to the user. By tightly coupling the psychological archetype to the structural geometry of the typography, we ensure that the intervention never feels like a chatbot. The words do not just convey information; they carry a specific emotional resonance, perfectly calibrated to the user's current defensive state.
The Voice Lane (The Psychological Archetype): The specific therapeutic posture the AI adopts to deliver the intervention (5 core lanes: Companion, Coach, Mirror, Narrator, Activator). If a user is paralyzed by shame, The Companion speaks with warm, alongside presence. If a user is caught in a toxic rumination loop, The Activator delivers a high-voltage, pattern-breaking directive. This dictates the vocabulary, the pacing, and the soul.

KEY PRINCIPLE: Voice lane is fully independent from all other variables (color signature, visual engine, response profile, atmosphere preset, entrance, exit).

The Typography Stack (The Structural Shape): The font family that physically embodies the voice on the glass. Typography is used as a psychological tool.
Primary Stack: Clean, frictionless, and modern. Used for grounded interface elements and clear instructions.
Secondary Stack: High emotional weight, beautifully serif-driven. Used for profound reflection and narrative shifts.
Mono Stack: Stark, tracked-out, and clinical. Used to strip the emotion out of a terrifying feeling and present it as objective, manageable data.
The Materialization (The Kinetic Delivery): How the text physically enters the glass. Timing shapes the meaning.
Emerge: Rises softly from the depth. Trusting gravity. Used for gentle realizations.
Dissolve: Fades slowly into nothingness. Used for letting go of rigid thoughts.
Burn In: Contrast drops, brightness spikes, locking into pure white. Used for setting undeniable boundaries and hard truths.
Immediate: 0ms delay. A sudden snap. Used for pattern-disruption and smelling-salts moments.

LAYER 5: THE TEMPORAL BOOKENDS
(Opening & Closing)
A NaviCue is not an infinite scroll; it is a contained, strictly bounded therapeutic ceremony. Layer 5 dictates the exact choreography of how the intervention begins and how it resolves. By controlling the temporal flow of the opening and closing, we ensure the user's nervous system is primed to receive the physics, and that the resulting insight is securely anchored into memory.
The Entrance (The Doorway): 8 distinct behavioral architectures (e.g., The Breath Gate, The Dissolution, The Scene Build). We never simply flash text onto a screen — that triggers cognitive startle in a dysregulated brain. The Entrance controls how time, attention, and agency organize. It might require the user to take a physical breath to clear the screen (The Breath Gate), or it might slowly defrost a heavy blur over 2.8 seconds to subconsciously teach patience (The Dissolution).

Entrance Copy Mode (copyMode): The 8 entrances naturally split into two categories based on WHERE the ceremony lives, governed by the `copyMode` field on `EntranceSpec`:
  - 'ceremony' (The Silence, Breath Gate, Threshold, Scene Build) — The COPY IS the ceremony. Z-4 entrance copy runs its full choreography, then clears. The anchor prompt appears fresh when active phase begins.
  - 'hero-voice' (The Dissolution, Emergence, Gathering) — The VISUAL TRANSITION IS the entrance. No Z-4 entrance copy at all. Instead, the anchor prompt (Z-3) fades in AS the entrance alongside the atom, creating a seamless entering→active transition with zero text swap.
  - 'silent' (Cold Arrival) — No copy during entering at all. The absence of ceremony IS the intervention. Atmosphere + atom entrance animation only. Anchor prompt appears when active starts.

The Exit (The Somatic Save-State): 4 final transitions (e.g., Dissolve, Burn In, Emerge, Immediate). Once the Hero physics resolve, the interaction must end with absolute certainty. The Exit delivers the final "receipt" — the closing philosophical stamp. Dissolve fades the UI beautifully into void to simulate profound relief and letting go. Burn In spikes the contrast to lock a hard, undeniable truth into the user's visual cortex.

NOTE: Exit triggers are defined in /src/app/pages/motion/exit-triggers.ts, completely decoupled from voice copy.

LAYER 6: THE HERO PHYSICS & THE RESOLUTION MATRIX
(The Core Interaction)
This is the centerpiece of the operating system. If the earlier layers built the stage and set the mood, Layer 6 is the heavy, physical object placed in the center of the room. This is where the user physically touches their psychological block. By turning abstract trauma into tangible digital mass, we bypass the analytical brain and allow the user to literally "move" their mind.

The 2 Atomic Collections (The Library of Matter)
The system pulls from a master library of 200 pre-coded Canvas 2D components, categorized into 2 collections with 10 series each:

COLLECTION 1: THE SOMATIC ARCHITECT (Atoms 1-100)
The Architecture of Physics, Agency, Observation, Growth, Subtraction, Frequency, Disruption, Memory, Scale, and Transmutation.
Series 1: The Physics Engines (1-10) — Newtonian mechanics, thermodynamics, rigid-body collisions
Series 2: The Quantum Mechanics (11-20) — Probability clouds, superposition, entanglement
Series 3: The Biomimetic Algorithms (21-30) — L-systems, Boids flocking, cellular automata
Series 4: The Via Negativa (31-40) — Negative space, erasure mechanics, sensory deprivation
Series 5: The Chrono-Acoustic Drives (41-50) — Web Audio, binaural beats, resonance
Series 6: The Meta-System & Glitch (51-60) — UI tearing, fourth-wall breaks, lag spikes
Series 7: The Retro-Causal Engine (61-70) — Timeline scrubbing, chromatic manipulation
Series 8: The Kinematic Topology (71-80) — Extreme scaling, fractal generation
Series 9: The Shadow & Crucible (81-90) — Thermodynamic UI, simulated fire, pressure
Series 10: The Reality Bender (91-100) — Blank canvases, world-building, infinite gestures

COLLECTION 2: THE TELEMETRIC NAVIGATOR (Atoms 101-200)
The Architecture of Data, Connection, Language, Social Physics, Temporal Weaving, Somatic Perception, Empathy, Strategy, Transcendence, and Integration.
Series 11: The Epistemic Constructs (101-110) — Belief deconstruction, logic gates
Series 12: The Friction Mechanics (111-120) — Inertia, momentum, commitment devices
Series 13: The Semantic Translators (121-130) — Subtext scanning, reframing, label injection
Series 14: The Social Physics (131-140) — Boundary forcefields, empathy bridges
Series 15: The Time Capsule & Future Weaving (141-150) — Strength storage, catastrophe auditing
Series 16: The Soma & Perception (151-160) — Body mapping, cardiac sync, proprioception
Series 17: The Diplomat & Social Physics II (161-170) — Deflection, perspective swapping
Series 18: The Visionary & Strategist (171-180) — Priority distillation, leverage mechanics
Series 19: The Mystic & Infinite Player (181-190) — Ego dissolution, cosmic humor
Series 20: The Omega & Integration (191-200) — White light synthesis, the final seal

The Hero Atom & The Gesture
The Hero Atom: The specific, pre-compiled Canvas 2D component pulled from the 20 Series. It is a pure physics engine — it contains no hard-coded text, making it infinitely reusable.
The Gesture (The Micro-Rep): The required kinetic input to solve the physical puzzle. A gesture is not a UI mechanic; it is a somatic rep. (Tap, Hold, Drag, Draw, Type, Breathe, Swipe, Watch).
The Resolution Matrix (The Somatic Secret Sauce)
This is where the magic locks in. The system never pairs a gesture with a random background. To guarantee somatic harmony, the Resolution Matrix automatically binds the required Gesture directly to the optimal Living Atmosphere (Layer 2). The environment physically supports the action:
Hold triggers the Gradient Mesh: Sustained, patient presence maps perfectly to slow-morphing, warm colors.
Drag triggers the Constellation: Sustained physical movement leaves a visible, glowing neural pathway in its wake.
Type triggers the Noise Fabric: The highly cognitive, rhythmic act of typing sends subtle tactile pulses through the digital cloth.
Draw triggers the Liquid Pool: Freeform, expressive movement causes fluid dynamics to beautifully follow the finger.
Watch triggers the Void: The profound act of pure observation requires absolute emptiness.
Tap / Swipe triggers the Particle Field: Quick, decisive agency causes the particles to scatter, shatter, or snap to attention.

LAYER 7: THE ATOMIC VOICE
(The LLM Payload & Typographic Throttles)
If the Hero Physics (Layer 6) is the body, the Atomic Voice is the soul. This layer represents a massive architectural unlock: the physics components contain zero hard-coded text. Instead, the backend LLM generates a highly throttled, multi-dimensional JSON payload that is injected directly into the canvas at runtime.
To prevent the "Design Leak" (where an AI generates too many words and breaks the Apple-grade interface), the LLM does not write paragraphs. It acts as a symphonic composer, injecting microscopic fragments of language into an 8-Variable Typographic Instrument. This guarantees infinite semantic variability while maintaining mathematically flawless UI constraints.

The 8 Typographic Variables:
1. The Anchor Prompt (The Primary Guide): The grounded, central instruction floating in the safe zone. Rendered in heading.h3 with a subtle breathing animation. (Max 8 words. e.g., "The pressure is a choice. Drop it.")
2. The Kinetic Payload (The Heavy Object): The text physically mapped to the rigid-bodies, weights, or nodes. Rendered in massive display.hero type. It falls, crashes, and carries mass. (Max 14 characters, strictly 1 line. e.g., "THE SHAME").
3. The Reactive Friction (Velocity-Mapped Copy): Text that dynamically changes based on how hard or how fast the user is interacting with the glass. It responds to their physical struggle in real-time. (e.g., [User pulls slightly] "There it is..." -> [Pulls harder] "Keep pulling..." -> [Max tension] "Let it snap.")
4. The Ambient Subtext (The Subconscious): Faint, deeply blurred text living far back in the Z-axis. It uses parallax scrolling to move opposite to the user's thumb. It validates the subconscious chatter without forcing the user to read it. (Max 5 words, opacity: 0.08. e.g., "i am running out of time")
5. The Metacognitive Tag (The HUD): A tiny, clinical, objective data point anchored to the corner of the screen in an 11px Mono font. It breaks the emotional spell by introducing stark, scientific reality. (Max 4 words. e.g., SYS.STATE: AMYGDALA HIJACK)
6. The Progressive Sequence (The Steps): For atoms requiring rhythmic interaction, the text unrolls sequentially with the user's kinetic effort. (1 word per step. e.g., Tap 1: "Locate" -> Tap 2: "Isolate" -> Tap 3: "Extract").
7. The Shadow Node (The Counter-Weight): A hidden truth that only reveals itself when the user interacts. (e.g., The user physically drags "THE ANGER" out of the way, revealing the shadow node underneath: "The Fear.")
8. The Threshold Shift (The Semantic Morph): The magic moment. The exact millisecond the physics engine resolves (the glass breaks, the puzzle locks), the words mathematically alter their meaning via crossfade or particle-reassembly. (e.g., The rigid block "I AM BROKEN" melts into the fluid text "I AM OPEN".)

COPY SYSTEM ARCHITECTURE:
The copy system in navicue-data.ts has 4 exported copy maps:
- ENTRANCE_COPY (8 entrances x 5 voice lanes)
- EXIT_COPY (4 exits x 5 voice lanes)
- GESTURE_COPY (6 gestures x 5 voice lanes)
- PING_COPY (6 pings x 5 voice lanes)

The getAtomicVoiceCopy(atomId, voiceLane) derivation system lives in /src/app/pages/voice/atomic-voice-copy.ts.

All entrance/hero copy/exit/CTA content will ultimately be JSON authored in Supabase mapped to ~10,000 NaviCues. The current local copy maps are for styling/token/ID work only.

---

REFERENCE FILE MAP:
- Reference atom: /src/app/components/atoms/series-11-epistemic/centrifuge-engine.tsx (atom 101)
- Full C2 blueprint: /src/imports/telemetric-navigator-atoms.md
- Voice/Entrance/Atomic Voice spec: /src/imports/entrance-matrix-copy.md
- Vocal families: /src/imports/vocal-families.md
- Atom concept docs: See per-series .md files in /src/imports/
- Exit triggers: /src/app/pages/motion/exit-triggers.ts
- Scene copy: /src/app/pages/motion/SceneCopyComponents.tsx
- Series registry: /src/app/components/atoms/series-registry.ts (zero outside imports contract)
- Atmosphere systems: navicue-data.ts, EngineRenderers.tsx, dc-tokens.ts, composition-presets.ts