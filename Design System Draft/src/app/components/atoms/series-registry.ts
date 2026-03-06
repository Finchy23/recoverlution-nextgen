/**
 * SERIES REGISTRY
 * ===============
 *
 * The 70 interactive series across 7 collections — each a distinct
 * psychological domain expressed through a specific physics/interaction paradigm.
 *
 * Collection 1: The Somatic Architect (Series 1–10, Atoms 1–100)
 * Collection 2: The Telemetric Navigator (Series 11–20, Atoms 101–200)
 * Collection 3: The Transcendent Witness (Series 21–30, Atoms 201–300)
 * Collection 4: The Alchemical Synthesizer (Series 31–40, Atoms 301–400)
 * Collection 5: The Non-Euclidean Diver (Series 41–50, Atoms 401–500)
 * Collection 6: The Chrono-Weaver (Series 51–60, Atoms 501–600)
 * Collection 7: The Fluid Tactician (Series 61–70, Atoms 601–700)
 *
 * ZERO imports from outside this folder.
 */

import type { SeriesId, SeriesMeta } from './types';

// =====================================================================
// SERIES DEFINITIONS
// =====================================================================

export const SERIES_CATALOG: Record<SeriesId, SeriesMeta> = {

  'physics-engines': {
    id: 'physics-engines',
    number: 1,
    name: 'The Physics Engines',
    subtitle: 'Base Mechanics',
    domain: 'Time, Transmutation, Distance, Regulation, Boundaries, Truth, Connection, Perception, Balance, Energy',
    physicsParadigm: 'Newtonian mechanics — rotational friction, fluid dynamics, rigid-body physics, gyroscopic tilt, thermodynamics',
    colorIdentity: '#FF6B6B',
    atomRange: [1, 10],
  },

  'quantum-mechanics': {
    id: 'quantum-mechanics',
    number: 2,
    name: 'The Quantum Mechanics',
    subtitle: 'Attention & Observation',
    domain: 'The architecture of attention — proving that the mind actively renders reality',
    physicsParadigm: 'Probability clouds, interference patterns, superposition, entanglement, uncertainty, tunnelling, holographic recursion',
    colorIdentity: '#6B52FF',
    atomRange: [11, 20],
  },

  'biomimetic-algorithms': {
    id: 'biomimetic-algorithms',
    number: 3,
    name: 'The Biomimetic Algorithms',
    subtitle: 'Organic Growth',
    domain: 'Transitioning from mechanical fixing to ecological healing — you do not build a tree; you grow it',
    physicsParadigm: 'L-systems, Boids flocking, cellular automata, mycelial pathfinding, Lotka-Volterra equilibrium, erosion smoothing',
    colorIdentity: '#8BCD6B',
    atomRange: [21, 30],
  },

  'via-negativa': {
    id: 'via-negativa',
    number: 4,
    name: 'The Via Negativa',
    subtitle: 'Subtraction & The Void',
    domain: 'Healing by removing noise — enlightenment by subtraction, sensory deprivation, erasure mechanics',
    physicsParadigm: 'Negative space, OLED blackness, opacity masks, scratch-to-reveal, aggressive minimalism',
    colorIdentity: '#8A8499',
    atomRange: [31, 40],
  },

  'chrono-acoustic': {
    id: 'chrono-acoustic',
    number: 5,
    name: 'The Chrono-Acoustic Drives',
    subtitle: 'Sound & Frequency',
    domain: 'Bypassing the visual cortex — using sound and vibration to directly entrain the nervous system',
    physicsParadigm: 'Web Audio API, granular synthesis, binaural beats, isochronic haptics, phase-shift resonance',
    colorIdentity: '#FFB852',
    atomRange: [41, 50],
  },

  'meta-system-glitch': {
    id: 'meta-system-glitch',
    number: 6,
    name: 'The Meta-System & Glitch',
    subtitle: 'Breaking Autopilot',
    domain: 'Snapping the user out of the autopilot trance — breaking the fourth wall to prove the simulation can be altered',
    physicsParadigm: 'Intentional UI tearing, CSS distortion, simulated lag, algorithm hijacking, terminal aesthetics',
    colorIdentity: '#FF3366',
    atomRange: [51, 60],
  },

  'retro-causal': {
    id: 'retro-causal',
    number: 7,
    name: 'The Retro-Causal Engine',
    subtitle: 'Rewriting Time',
    domain: 'Teaching that the past is clay, not stone — you can change the colour grade and the soundtrack',
    physicsParadigm: 'Video-editing metaphors, timeline scrubbing, chromatic manipulation, reverse-time simulation',
    colorIdentity: '#D4A8FF',
    atomRange: [61, 70],
  },

  'kinematic-topology': {
    id: 'kinematic-topology',
    number: 8,
    name: 'The Kinematic Topology',
    subtitle: 'Perspective & Scale',
    domain: 'Destroying the ego\'s sense of proportion — showing how small the crisis is, or how massive the potential',
    physicsParadigm: 'Extreme scaling, fractal generation, non-Euclidean geometry, infinite Z-axis, recursive rendering',
    colorIdentity: '#52B8FF',
    atomRange: [71, 80],
  },

  'shadow-crucible': {
    id: 'shadow-crucible',
    number: 9,
    name: 'The Shadow & Crucible',
    subtitle: 'Facing the Dark',
    domain: 'Safely guiding into the darkest parts of the psyche — harvesting gold from shame, anger, and grief',
    physicsParadigm: 'Thermodynamic UI, simulated fire, high-friction drag, pressure mechanics, transmutation',
    colorIdentity: '#FF8552',
    atomRange: [81, 90],
  },

  'reality-bender': {
    id: 'reality-bender',
    number: 10,
    name: 'The Reality Bender',
    subtitle: 'Total Sovereignty',
    domain: 'The capstone — the user is no longer healing; they are actively architecting their universe',
    physicsParadigm: 'Blank canvases, drawing mechanics, world-building generation, weather engineering, infinite gestures',
    colorIdentity: '#C9A87C',
    atomRange: [91, 100],
  },

  // =================================================================
  // COLLECTION 2: THE TELEMETRIC NAVIGATOR (Atoms 101–200)
  // =================================================================

  'epistemic-constructs': {
    id: 'epistemic-constructs',
    number: 11,
    name: 'The Epistemic Constructs',
    subtitle: 'Belief & Truth',
    domain: 'Separating facts from feelings, deconstructing inference ladders, closing logic loops, building steel-man arguments',
    physicsParadigm: 'High-G rotation, structural scaffolding, electrical pathfinding, tensile bridge building, raycasting, acoustic dampening',
    colorIdentity: '#E06B4F',
    atomRange: [101, 110],
  },

  'friction-mechanics': {
    id: 'friction-mechanics',
    number: 12,
    name: 'The Friction Mechanics',
    subtitle: 'Action & Resistance',
    domain: 'Breaking inertia, shrinking overwhelm, commitment devices, habit friction, momentum preservation, perfectionism defeat',
    physicsParadigm: 'Breakaway force thresholds, radial downscaling, one-way gates, collision generation, rotational momentum, elastic rejection',
    colorIdentity: '#FF9F43',
    atomRange: [111, 120],
  },

  'semantic-translators': {
    id: 'semantic-translators',
    number: 13,
    name: 'The Semantic Translators',
    subtitle: 'Language & Meaning',
    domain: 'Thermal reading of subtext, emotion layer peeling, syntactic hope injection, conjunction shifts, headline deflation',
    physicsParadigm: 'Thermal imaging shaders, Z-depth page peeling, magnetic text docking, crossfade morphing, typography weight interpolation',
    colorIdentity: '#5FC9A8',
    atomRange: [121, 130],
  },

  'social-physics': {
    id: 'social-physics',
    number: 14,
    name: 'The Social Physics',
    subtitle: 'Tribe & Boundary',
    domain: 'Reverse orbits, elastic forcefields, status leveling, empathy bridges, aikido redirects, social battery management',
    physicsParadigm: 'Inverse magnetic polarity, elastic collision, fulcrum dynamics, cantilever construction, Bezier path curving, fluid drainage',
    colorIdentity: '#6C7BD4',
    atomRange: [131, 140],
  },

  'time-capsule': {
    id: 'time-capsule',
    number: 15,
    name: 'The Time Capsule & Future Weaving',
    subtitle: 'Temporal Architecture',
    domain: 'Strength storage, rage containment, catastrophe auditing, accountability devices, regret minimization, branch pruning',
    physicsParadigm: 'Viscous fluid injection, heavy metal doors, ground-penetrating stakes, spring-loaded timers, Y-axis divergence, domino unwinding',
    colorIdentity: '#A87CDB',
    atomRange: [141, 150],
  },

  'soma-perception': {
    id: 'soma-perception',
    number: 16,
    name: 'The Soma & Perception',
    subtitle: 'Body & Senses',
    domain: 'Somatic localization, cardiac sync, fascia release, proprioceptive grounding, micro-texture anchoring, vocal discharge',
    physicsParadigm: '3D mesh raycasting, metronomic time-stamping, tensile spring physics, gyroscope mapping, SVG macro-scaling, real-time FFT',
    colorIdentity: '#E8836B',
    atomRange: [151, 160],
  },

  'diplomat-empathy': {
    id: 'diplomat-empathy',
    number: 17,
    name: 'The Diplomat & Social Physics II',
    subtitle: 'Empathy & Boundaries',
    domain: 'Kinetic deflection, vulnerability sequencing, perspective swapping, subtext decryption, boundary dancing, de-escalation',
    physicsParadigm: 'Rigid-body collisions, gravitational anchoring, 3D camera rotation, opacity crossfading, magnetic repulsion, Z-axis elevation',
    colorIdentity: '#4ECDC4',
    atomRange: [161, 170],
  },

  'visionary-strategist': {
    id: 'visionary-strategist',
    number: 18,
    name: 'The Visionary & Strategist',
    subtitle: 'Architecture of the Future',
    domain: 'Priority distillation, compound interest visualization, deep work vaulting, leverage mechanics, horizon scanning, obstacle flipping',
    physicsParadigm: 'Rigid-body drag-and-drop, exponential Bezier curves, heavy rigid body translation, seesaw mechanics, infinite horizontal panning',
    colorIdentity: '#FFD166',
    atomRange: [171, 180],
  },

  'mystic-infinite': {
    id: 'mystic-infinite',
    number: 19,
    name: 'The Mystic & Infinite Player',
    subtitle: 'Transcendence & Play',
    domain: 'Illusion piercing, ego dissolution, cosmic humor, decentering, beginner\'s mind, creation-destruction cycles, wonder exploration',
    physicsParadigm: 'Refraction shaders, particle evaporation, Bezier curve manipulation, Z-depth parallax, multi-touch erasure, particle recycling',
    colorIdentity: '#B8A9E8',
    atomRange: [181, 190],
  },

  'omega-integration': {
    id: 'omega-integration',
    number: 20,
    name: 'The Omega & Integration',
    subtitle: 'Final Integration',
    domain: 'White light synthesis, golden spiral ascension, temporal collapse, radical acceptance, event horizon surrender, the final seal',
    physicsParadigm: 'Reverse-raytracing, Fibonacci helical rotation, bi-directional collapsing, multi-mesh overlaying, gravitational singularity, total UI collapse',
    colorIdentity: '#F4F1DE',
    atomRange: [191, 200],
  },

  // =================================================================
  // COLLECTION 3: THE TRANSCENDENT WITNESS (Atoms 201–300)
  // =================================================================

  'metacognitive-mirror': {
    id: 'metacognitive-mirror',
    number: 21,
    name: 'The Metacognitive Mirror',
    subtitle: 'The Witness',
    domain: 'Z-axis decentering, figure-ground shifting, identity-thought severance, urge surfing, spatial audio distancing, observer-state anchoring',
    physicsParadigm: 'Exponential Z-axis camera extraction, depth-of-field manipulation, kinetic typography splitting, parallax layering, volumetric cloud rendering, vortex dynamics',
    colorIdentity: '#A8D8EA',
    atomRange: [201, 210],
  },

  'predictive-override': {
    id: 'predictive-override',
    number: 22,
    name: 'The Predictive Override',
    subtitle: 'Raw Perception',
    domain: 'Semantic stripping, optical defocus, chromatic breakdown, micro-perception, acoustic un-naming, beginner\'s mind, wabi-sabi, somatic trust',
    physicsParadigm: 'Text-to-mesh morphing, extreme bokeh shaders, RGB channel separation, macro-scale particle bursting, real-time FFT magnification, procedural fracturing',
    colorIdentity: '#C4E0B4',
    atomRange: [211, 220],
  },

  'fluidity-mechanics': {
    id: 'fluidity-mechanics',
    number: 23,
    name: 'The Fluidity Mechanics',
    subtitle: 'The Wiggly World',
    domain: 'Binary dissolution, adaptive yielding, identity fluidity, dialectical synthesis, effortless action, rigidity thawing, metamorphosis, depth anchoring',
    physicsParadigm: '2D WebGL fluid dynamics, soft-body particle constraints, liquid volume transfer, centripetal fluid merging, vector field flow, procedural ice-cracking, elastic polygon morphing',
    colorIdentity: '#7EC8E3',
    atomRange: [221, 230],
  },

  'net-of-indra': {
    id: 'net-of-indra',
    number: 24,
    name: 'The Net of Indra',
    subtitle: 'Interconnection',
    domain: 'Recursive jewel reflection, symbiotic respiration, mycelial networking, DMN dissolution, karmic echo, emergent murmuration, gravitational bonding, butterfly causation',
    physicsParadigm: 'Ray-traced refraction, fractal generation, Z-axis subterranean scrolling, surface tension collapse, concentric wave propagation, Boids algorithm, Newtonian gravity, chaos attractors',
    colorIdentity: '#E8B4CB',
    atomRange: [231, 240],
  },

  'dialectical-engine': {
    id: 'dialectical-engine',
    number: 25,
    name: 'The Dialectical Engine',
    subtitle: 'Paradox & Tension',
    domain: 'Tensegrity balance, both/and fusion, zen koan exhaustion, complementary neutralisation, pendulum arresting, magnetic suspension, acceptance-change dialectic, non-dual topology',
    physicsParadigm: 'Spring-distance constraints, magnetic repulsion, non-Euclidean geometry, chromatic wheel math, pendulum dampening, inverse-square hovering, helical spring resonance, 3D Mobius rendering',
    colorIdentity: '#D4C5A9',
    atomRange: [241, 250],
  },

  'identity-decoupling': {
    id: 'identity-decoupling',
    number: 26,
    name: 'The Identity Decoupling',
    subtitle: 'Role to Soul',
    domain: 'Matryoshka peeling, armor dropping, predicate erasing, costume shedding, changeless witness, unconditional worth, space containment, ego relief, playful re-entry',
    physicsParadigm: '3D mesh fracturing, rigid-body latch snapping, typography particle dispersion, cloth simulation, procedural aging shaders, thermal combustion, wireframe expansion, mosaic pixelation',
    colorIdentity: '#F2D5CE',
    atomRange: [251, 260],
  },

  'cosmic-play': {
    id: 'cosmic-play',
    number: 27,
    name: 'The Cosmic Play',
    subtitle: 'Lila & The Dance',
    domain: 'Destination override, sand mandala impermanence, threat deflation, Sisyphean joy, spontaneous improvisation, stakes-free exploration, character de-roling, juggling lightness',
    physicsParadigm: 'Procedural audio sequencing, granular particle synthesis, soft-body elastic bouncing, heavy mass rolling, randomised path generation, zero-penalty collision, spotlight masking, multi-body projectile arcs',
    colorIdentity: '#FFB7C5',
    atomRange: [261, 270],
  },

  'impermanence-engine': {
    id: 'impermanence-engine',
    number: 28,
    name: 'The Impermanence Engine',
    subtitle: 'Anicca & Letting Go',
    domain: 'Open palm releasing, phase-state evaporation, graceful autumn yielding, wave decay, ebb tide erosion, metamorphosis, exhale cycling, kintsugi repair, sunset beauty',
    physicsParadigm: 'Pressure-sensitive mesh distortion, thermodynamic state-shifting, procedural detachment, ADSR envelopes, height-map erosion, Voronoi fracturing, volumetric compression, spline tracing, atmospheric scattering',
    colorIdentity: '#C9B99A',
    atomRange: [271, 280],
  },

  'interoceptive-anchor': {
    id: 'interoceptive-anchor',
    number: 29,
    name: 'The Interoceptive Anchor',
    subtitle: 'Here',
    domain: 'Pulse synchronisation, breath pendulum, gravitational centering, cymatic resonance, focal collapse, tectonic grounding, micro-tremor mirroring, thermal boundary drawing',
    physicsParadigm: 'Concentric wave generation, microphone-gated pendulum, device orientation gravity vectors, real-time FFT cymatics, radial vignette masking, extreme Z-axis acceleration, accelerometer amplification, thermal gradient shaders',
    colorIdentity: '#8FB996',
    atomRange: [281, 290],
  },

  'loving-awareness': {
    id: 'loving-awareness',
    number: 30,
    name: 'The Loving Awareness',
    subtitle: 'Wholeness & Integration',
    domain: 'Shadow embrace, metta radiance, golden thread lifeline, sacred altar surrender, divine seeing, karmic severance, infinite heart expansion, pure existence, ocean surrender, the singularity of love',
    physicsParadigm: 'Magnetic attraction color-inversion, unbounded radial scaling, Bezier spline node illumination, gravitational drop combustion, alpha-mask depth revelation, tensile rope snap, volumetric heart expansion, kinetic typography erasure, surface tension fluid mixing, total UI singularity collapse',
    colorIdentity: '#F0E6D3',
    atomRange: [291, 300],
  },

  // =================================================================
  // COLLECTION 4: THE ALCHEMICAL SYNTHESIZER (Atoms 301–400)
  // =================================================================

  'particle-collider': {
    id: 'particle-collider',
    number: 31,
    name: 'The Particle Collider',
    subtitle: 'High-Velocity Synthesis',
    domain: 'Binary paralysis, Either/Or thinking, rigid belief systems, forced synthesis through high-velocity collision of opposing concepts',
    physicsParadigm: 'High-tension spring slingshots, rigid-body collision detection, shell-shattering particle bursts, kinetic energy accumulation, magnetic repulsion fields, tangential friction sparks',
    colorIdentity: '#FF4D6A',
    atomRange: [301, 310],
  },

  'cymatic-engine': {
    id: 'cymatic-engine',
    number: 32,
    name: 'The Cymatic Engine',
    subtitle: 'Finding the Frequency',
    domain: 'Brute-force exhaustion, frequency alignment, resonant discovery, harmonic stacking, amplitude modulation, noise filtering, cymatic pattern emergence',
    physicsParadigm: 'Frequency fader mapping, sine wave phase alignment, acoustic resonance shattering, mandala geometry generation, amplitude-driven scaling, circular dial rotation, Chladni plate simulation',
    colorIdentity: '#7B68EE',
    atomRange: [311, 320],
  },

  'catalyst-web': {
    id: 'catalyst-web',
    number: 33,
    name: 'The Catalyst Web',
    subtitle: 'Organizing the Overwhelm',
    domain: 'Executive dysfunction, priority paralysis, gravitational anchoring, constellation mapping, paradigm inversion, enmeshment untangling, magnetic insight, neural pruning, ripple initiation',
    physicsParadigm: 'Zero-gravity node physics, gravitational weight assignment, structural tethering, Z-axis gravity inversion, Bezier path dragging, WebGL displacement ripples, magnetic grid snapping, rigid-body domino cascading',
    colorIdentity: '#4DB8A4',
    atomRange: [321, 330],
  },

  'chaos-loom': {
    id: 'chaos-loom',
    number: 34,
    name: 'The Chaos Loom',
    subtitle: 'Anchoring the Storm',
    domain: 'Flight response, scattered attention, sunk cost destruction, weak-strand braiding, micromanagement release, structural repair, expansion fear, hyper-fixation, macro-perspective',
    physicsParadigm: 'Sine-wave thread wrapping, circular spooling dynamics, two-finger fabric tearing, rhythmic braid physics, perpendicular blade mechanics, perpendicular grid locking, zig-zag suture drawing, expanding spiral generation, two-finger knot pulling, pinch-to-zoom pixel resolution',
    colorIdentity: '#C77DBA',
    atomRange: [331, 340],
  },

  'pressure-vessel': {
    id: 'pressure-vessel',
    number: 35,
    name: 'The Pressure Vessel',
    subtitle: 'Productive Constraint',
    domain: 'Transformative compression, diamond-from-coal crystallization, productive use of constraint and pressure, vacuum clarity, hydraulic persistence, tectonic release, depth beauty, controlled implosion',
    physicsParadigm: 'Radial compression fields, vacuum particle physics, hydraulic piston mechanics, sealed thermal acceleration, layered deposition rendering, tectonic fault-line simulation, bathymetric pressure gradients, controlled implosion dynamics, pressure-valve fluid mechanics, crystallographic lattice generation',
    colorIdentity: '#5B8DEF',
    atomRange: [341, 350],
  },

  'friction-spark': {
    id: 'friction-spark',
    number: 36,
    name: 'The Friction Spark',
    subtitle: 'Earning the Energy',
    domain: 'Apathy ignition, repetition mastery, initial resistance, sprint energy, stored potential in rest, anxiety conversion, burnout cooling, chain reaction momentum, rhythmic battery charging, ember resuscitation',
    physicsParadigm: 'Kinetic friction heat generation, piston spring mechanics, rotational resistance decay, gravity-opposed velocity tracking, bowstring tension storage, flywheel energy conversion, multi-finger heat absorption, rigid-body kinetic chain transfer, breath-synced liquid filling, rhythmic bellows pumping',
    colorIdentity: '#FF8C42',
    atomRange: [351, 360],
  },

  'conduit-flow': {
    id: 'conduit-flow',
    number: 37,
    name: 'The Conduit',
    subtitle: 'Channeling the Force',
    domain: 'Energy dissipation, raw force direction, chaotic grounding, spectral decomposition, voltage regulation, capillary persistence, signal integrity, flow acceleration through constraint, resistance elimination, circuit completion',
    physicsParadigm: 'Electrostatic attraction simulation, fluid channel dynamics, prismatic light refraction, electromagnetic coil winding, capillary surface tension, total internal reflection rendering, Venturi fluid acceleration, zero-resistance particle flow, wireless field emission, circuit path completion logic',
    colorIdentity: '#3DD9D6',
    atomRange: [361, 370],
  },

  'magnetic-sieve': {
    id: 'magnetic-sieve',
    number: 38,
    name: 'The Magnetic Sieve',
    subtitle: 'Ruthless Reduction',
    domain: 'Information gluttony, people-pleasing, emotional enmeshment, obsolete habit purging, context-switching, ego purification, patience cultivation, effort validation, FOMO commitment',
    physicsParadigm: 'Mass-based gravity filtering, negative polarity repulsion, centrifugal separation, breath-driven wind simulation, horizontal threshold gating, gyroscopic tilt pouring, polarity-matched magnetic attraction, sustained thermal evaporation, device-shake gold panning, sequential node incineration',
    colorIdentity: '#A8A0D6',
    atomRange: [371, 380],
  },

  'momentum-wheel': {
    id: 'momentum-wheel',
    number: 39,
    name: 'The Momentum Wheel',
    subtitle: 'Overcoming Inertia',
    domain: 'Executive dysfunction, starting paralysis, rhythm burnout, gear misalignment, fragility, micro-step dismissal, brute-force fallacy, manic energy dissipation, failure avoidance, perpetual motion achievement',
    physicsParadigm: 'Rotational inertia accumulation, pendulum apex timing, gear tooth phase alignment, gyroscopic stabilization, inclined-plane mass absorption, fulcrum repositioning, siphon fluid dynamics, escapement spring regulation, gravitational slingshot trajectories, frictionless orbital mechanics',
    colorIdentity: '#E6C75A',
    atomRange: [381, 390],
  },

  'synthesis-forge': {
    id: 'synthesis-forge',
    number: 40,
    name: 'The Synthesis Forge',
    subtitle: 'The Melting Point',
    domain: 'Rigid identity, imposter syndrome, post-transformation vulnerability, hidden stress fractures, toxic residue, shattered trust repair, disciplined passion forging, impatient release, the apex of creation',
    physicsParadigm: 'Radial heat WebGL distortion, circular stir fluid fusion, geometric perimeter tracing, deep liquid pool quenching, sustained thermal realignment, horizontal surface skimming, arc electricity welding, rhythmic concussive shaping, circular friction polishing, five-finger total particle convergence',
    colorIdentity: '#D4645C',
    atomRange: [391, 400],
  },

  // =================================================================
  // COLLECTION 5: THE NON-EUCLIDEAN DIVER (Atoms 401–500)
  // =================================================================

  'shadow-caster': {
    id: 'shadow-caster',
    number: 41,
    name: 'The Shadow Caster',
    subtitle: 'Changing the Light',
    domain: 'Catastrophizing, magnification, misinterpretation, future-tripping, paranoia, false barriers, self-shrinking, enmeshment, uncertainty terror, external dependence',
    physicsParadigm: '3D ray-traced shadow projection, Z-axis parallax light manipulation, Y-axis light rotation, multi-source shadow interference, zero-collision ghost bodies, eclipse Z-layering, penumbra focal sharpening, orbital sun simulation, omnidirectional self-illumination',
    colorIdentity: '#2D3047',
    atomRange: [401, 410],
  },

  'escher-loop': {
    id: 'escher-loop',
    number: 42,
    name: 'The Escher Loop',
    subtitle: 'Breaking the Paradox',
    domain: 'Toxic rumination, enmeshment loops, dialectical tension, forced-perspective illusions, recursive anxiety, echo chambers, self-sabotage cycles, victim traps, overcomplication, analysis paralysis',
    physicsParadigm: 'Penrose staircase topology, Möbius strip bisection, Necker cube bistable rendering, forced-perspective 3D rotation, Droste recursive generation, closed-circuit rerouting, segmented ouroboros mechanics, Klein bottle topology, 4D hypercube unfolding, high-velocity Gordian slice',
    colorIdentity: '#8B5CF6',
    atomRange: [411, 420],
  },

  'gravity-inverter': {
    id: 'gravity-inverter',
    number: 43,
    name: 'The Gravity Inverter',
    subtitle: 'Flipping the Paradigm',
    domain: 'Depressive weight, drowning overwhelm, disaster leverage, panic freefall, groundlessness, displacement advantage, magnetic repulsion, expectation weight, gravitational addiction, Atlas perspective shift',
    physicsParadigm: 'Gyroscope-driven gravity inversion, viscosity-density buoyancy physics, pulley-tether kinetic redirection, aerodynamic drag spreading, centrifugal force-field generation, Archimedes displacement calculation, magnetic polarity flipping, zero-G toggle mechanics, tangential escape velocity, extreme Z-axis camera rotation',
    colorIdentity: '#06B6D4',
    atomRange: [421, 430],
  },

  'depth-sounder': {
    id: 'depth-sounder',
    number: 44,
    name: 'The Depth Sounder',
    subtitle: 'Pinging the Dark',
    domain: 'Nameless dread, somatic disconnection, uncertainty paralysis, avoidance behavior, surface-level healing, dissociation, introspection terror, sensory overload, relapse despair, existential isolation',
    physicsParadigm: 'Concentric sonar ring propagation, horizontal radar sweep scanning, fog-of-war light radius, Doppler frequency shifting, viscous thermocline barriers, anchor cable deployment, bathymetric pressure simulation, stealth mode toggle, elastic safety net catching, wide-radius beacon pinging',
    colorIdentity: '#1E3A5F',
    atomRange: [431, 440],
  },

  'tesseract-geometry': {
    id: 'tesseract-geometry',
    number: 45,
    name: 'The Tesseract',
    subtitle: 'Unfolding the Hypercube',
    domain: 'Multidimensional overwhelm, future projection collapse, complex interior examination, emotional proportion distortion, trauma enmeshment, accountability blind spots, anxiety cloud organization, criticism magnification, repression exhaustion, incomprehensible pain',
    physicsParadigm: '4D hypercube unfolding into 2D net, Z-axis multiplier crushing, boolean cross-section slicing, perspective-to-orthographic camera toggle, spatial coordinate de-clipping, inverse-kinematics face hiding, gravity-plane vertex snapping, dimensional reduction extrusion, origami fold-tension release, full-palm rotation halt and 2D printing',
    colorIdentity: '#A78BFA',
    atomRange: [441, 450],
  },

  'optical-blind-spot': {
    id: 'optical-blind-spot',
    number: 46,
    name: 'The Blind Spot',
    subtitle: 'The Optical Truth',
    domain: 'Denial, figure-ground neglect, active suppression, toxic habit camouflage, psychological blind spots, confirmation bias, avoidance fixation, invisible red flags, hypocrisy projection, armor shedding',
    physicsParadigm: 'Polarization contrast filtering, negative-space typography expansion, sustained-heat redaction burning, gyroscopic parallax camouflage breaking, peripheral vision solidification, chromatic channel filtering, Z-axis focal plane shifting, UV blacklight illumination, mirror-plane pronoun inversion, explosive multi-finger armor stripping',
    colorIdentity: '#F59E0B',
    atomRange: [451, 460],
  },

  'mirror-world': {
    id: 'mirror-world',
    number: 47,
    name: 'The Mirror World',
    subtitle: 'Psychological Projection',
    domain: 'Shadow projection, blame tethering, doppelgänger rejection, kaleidoscope fragmentation, puppet control, toxic echo return, emotional wall building, moral superiority shadow, double standard cruelty, final unification',
    physicsParadigm: 'Perfect velocity mirroring, rigid-body stick constraints, color-inverted phase merging, mirrored shard pinch convergence, inverse-kinematics puppet strings, spherical mirror fisheye gravity, sustained-warmth glass melting, opposite-direction shadow casting, friction-resistant self-compassion, two-hand barrier folding',
    colorIdentity: '#94A3B8',
    atomRange: [461, 470],
  },

  'klein-bottle': {
    id: 'klein-bottle',
    number: 48,
    name: 'The Klein Bottle',
    subtitle: 'The Victim Trap',
    domain: 'Endless struggle loops, panic escalation, impulsive flailing, learned helplessness, infinite analysis, resentment tethering, bottomless energy drain, depressive undertow, obsessive self-picking, inverted ceiling trap',
    physicsParadigm: 'Non-orientable topological routing, Chinese finger trap constriction, viscous quicksand kinetic-mass calculation, phantom cage optical illusion, procedural infinite maze generation, elastic grudge tethering, bottomless bucket fluid dynamics, powerful current undertow, shadow knot dissolution through neglect, gyroscopic 180-degree ceiling inversion',
    colorIdentity: '#DC2626',
    atomRange: [471, 480],
  },

  'abyssal-anchor': {
    id: 'abyssal-anchor',
    number: 49,
    name: 'The Abyssal Anchor',
    subtitle: 'Hitting Rock Bottom',
    domain: 'Chronic anxiety release, crushing grief survival, identity stripping, panic grounding, total collapse foundation, suffering compression, isolation tethering, buoyancy rebound, deep shame resources, absolute indestructibility',
    physicsParadigm: 'Z-axis freefall with bedrock collision, atmospheric pressure vignette with structural integrity math, timed darkness self-illumination, heavy Y-axis anchor deployment, shattered-piece fusion into foundation layer, dual-finger Z-axis compression heat, wide-radius sonar with cascading return, depth-pressure buoyancy inversion, silt-clearing bioluminescence, bedrock-bolted impact absorption',
    colorIdentity: '#374151',
    atomRange: [481, 490],
  },

  'shadow-integration': {
    id: 'shadow-integration',
    number: 50,
    name: 'The Shadow Integration',
    subtitle: 'The Master Alloy',
    domain: 'Self-disgust acceptance, black-and-white flaw thinking, trauma-as-weakness, internal civil war, suppressed darkness, disconnected painful past, perfectionist contradiction, stagnant shame, transformation hesitation, total shadow reclamation',
    physicsParadigm: 'Elastic tether shadow absorption, gyroscopic Damascus steel fluid marbling, carbon-reinforced structural transformation, binary orbit energy field compression, eclipse corona ring generation, Z-axis root system reconnection, asymmetric chimera polygon fusion, chemical combustion kinetic conversion, event horizon passive crossing, total magnetic gravity well shadow absorption',
    colorIdentity: '#D4AF37',
    atomRange: [491, 500],
  },

  // =================================================================
  // COLLECTION 6: THE CHRONO-WEAVER (Atoms 501–600)
  // =================================================================

  'glacial-pacer': {
    id: 'glacial-pacer',
    number: 51,
    name: 'The Glacial Pacer',
    subtitle: 'The Physics of Slowness',
    domain: 'Hustle-culture burnout, frantic speed addiction, brute-force exhaustion, surface dabbling, instant gratification, erratic rhythms, panic pivoting, impatient clock torture, daily slog resentment, slow-mass power',
    physicsParadigm: 'Non-Newtonian velocity-dependent viscosity, sustained-input kinetic multiplier, kinetic friction heat generation, sustained-pressure crystallographic cleaving, slow-drag taproot generation, pendulum apex synchronisation, heavy-mass micro-steering, biometric chrono-lock patience, viscous golden coating accumulation, glacial grinding geological force',
    colorIdentity: '#5E81AC',
    atomRange: [501, 510],
  },

  'fractal-zoom': {
    id: 'fractal-zoom',
    number: 52,
    name: 'The Fractal Zoom',
    subtitle: 'The Infinite Perspective',
    domain: 'Micro-fixation, short-term graph panic, relapse shame, proximity blindness, dark-chapter despair, chaotic-life meaning, hardship resentment, ego weight, flat-earth boredom, existential today-terror',
    physicsParadigm: 'Exponential Z-axis pinch-out scaling, X-axis temporal viewport expansion, Mandelbrot fractal recursive zoom, first-person to orthographic camera elevation, waveform symphonic integration, Z-axis thread alignment, spike-to-texture zoom, infinite ocean dissolution, planetary curvature reveal, continuous 10-second macro-scale timeline reduction',
    colorIdentity: '#2EC4B6',
    atomRange: [511, 520],
  },

  'tectonic-shift': {
    id: 'tectonic-shift',
    number: 53,
    name: 'The Tectonic Shift',
    subtitle: 'The Invisible Pressure',
    domain: 'Invisible effort despair, hidden labour loss, suppressed desire ache, macro-patience frustration, micro-habit dismissal, wasted-years regret, stuck-period depression, progress fragility, burnout tremor ignorance, painful friction elevation',
    physicsParadigm: 'Subterranean heat-map pressure accumulation, geological subduction plate forcing, sustained-hold magma reservoir expansion, imperceptible continental drift automation, fast-forward stalactite geological simulation, compressive stratigraphy bedrock forging, hidden stored-energy gauge coiling, sedimentary fossilisation time-pressure, micro-tremor fault-line valve release, tectonic collision vertical orogeny forcing',
    colorIdentity: '#8B4513',
    atomRange: [521, 530],
  },

  'geological-carver': {
    id: 'geological-carver',
    number: 54,
    name: 'The Geological Carver',
    subtitle: 'The Physics of Erosion',
    domain: 'Instant gratification addiction, brute-force creative exhaustion, tiny-effort dismissal, single-miss catastrophising, all-or-nothing perfectionism, rest-as-weakness hustle culture, systemic institutional defeat, messy-middle editing hatred, rigid-plan stubbornness, 10-year goal impossibility despair',
    physicsParadigm: 'Cumulative micro-impact stone erosion, fluid-dynamic meandering riverbed carving, microphone-driven wind-shear particle physics, rhythmic wave coastal undercutting, gravitational sediment layer fusion, thermal expansion-contraction stress fracturing, biological hydraulic root-wedge pressure, heavy-mass glacial terrain polishing, fluid-dynamic oxbow erosion pinch-off, time-dial accelerated canyon carving',
    colorIdentity: '#CD853F',
    atomRange: [531, 540],
  },

  'hourglass-inversion': {
    id: 'hourglass-inversion',
    number: 55,
    name: 'The Hourglass Inversion',
    subtitle: 'The Accumulation of Mass',
    domain: 'Mid-life crisis panic, aging relevance loss, past-self cringe, lost-momentum illusion, societal deadline suffocation, confined-container limitation, descending-into-nothing depression, time-as-burden weight, late-start despair, final-grain ego-death terror',
    physicsParadigm: 'Gyroscopic 180° gravity inversion, gravitational center-of-mass shifting, two-finger Z-axis stratigraphy compression, sand-absorption kinetic mass accumulation, two-finger bottleneck dynamic stretching, double-tap glass container shattering, camera-pan stalagmite upward-build reveal, pulley-system leverage displacement, gyroscopic downhill snowball exponential growth, WebGL flash golden statue reveal',
    colorIdentity: '#DAA520',
    atomRange: [541, 550],
  },

  'ancestral-tether': {
    id: 'ancestral-tether',
    number: 56,
    name: 'The Ancestral Tether',
    subtitle: 'The Generational Chain',
    domain: 'Existential isolation, energy depletion burnout, generational trauma cycle, nihilistic meaninglessness, heavy responsibility resentment, small-act invisibility, broken-family orphan pain, lone-wolf crushing, ancestral rigid anger, mortality ego-death terror',
    physicsParadigm: 'Z-axis past/future tether locking, ancestral kinetic pulse chain transfer, kinetic dampener generational shock absorption, gravity-opposed node trail generation, two-finger pinch-out structural thickening, infinite WebGL Z-axis ripple propagation, horizontal lateral lattice forging, architectural compression arch load distribution, manual tether slack tension release, five-finger cosmic DNA helix zoom-out',
    colorIdentity: '#704214',
    atomRange: [551, 560],
  },

  'horizon-line': {
    id: 'horizon-line',
    number: 57,
    name: 'The Horizon Line',
    subtitle: 'The Physics of Foresight',
    domain: 'Daily suffocation overwhelm, reactive fire-fighting exhaustion, future-plan refusal, habit-goal disconnect, setback total-defeat, delayed-return frustration, impulsive compounding ignorance, mortality denial, shallow-validation chasing, chased-horizon exhaustion',
    physicsParadigm: '2D-to-3D Z-axis plane tilting, focal lock obstacle blur, beacon-radius fog clearing, one-point perspective vanishing convergence, FOV exponential retreat expansion, seasonal sun traverse simulation, trajectory angle micro-adjustment, Z-axis Doppler mass approach, multi-plane parallax depth locking, Z-axis fold horizon-to-present collapse',
    colorIdentity: '#87CEEB',
    atomRange: [561, 570],
  },

  'ephemeral-bloom': {
    id: 'ephemeral-bloom',
    number: 58,
    name: 'The Ephemeral Bloom',
    subtitle: 'The Physics of Letting Go',
    domain: 'Beautiful-loss devastation, outdated-loyalty dead weight, messy-transition identity terror, total-failure waste, outgrown-safety claustrophobia, forced-ending suffering, perfectionism soul-killing, past-nostalgia paralysis, uncontrollable-variable exhaustion, ego-death final proliferation',
    physicsParadigm: 'Fluid-dynamic wind mandala scattering, gyroscopic shake dead-leaf abscission, sustained-thermal chrysalis dissolution, mechanical grinder failure shredding, two-finger armor pry expansion, forced solar descent physics, strict half-life mathematical decay, massive 3D-to-2D memory compression, magnetic freeze-release exhale, voluntary apex bloom kinetic seed scatter',
    colorIdentity: '#DB7093',
    atomRange: [571, 580],
  },

  'legacy-seed': {
    id: 'legacy-seed',
    number: 59,
    name: 'The Legacy Seed',
    subtitle: 'The Blind Architecture',
    domain: 'Invisible-finish-line refusal, hoarded-resource scarcity, sole-hero arrogance, tiny-contribution insignificance, thin-spread collapse, instant-recognition demand, unseen-bridge futility, stagnant-wealth rot, helicopter-control terror, anonymous-gift ego death',
    physicsParadigm: 'Camera-locked blind vertical stacking, energy-expended canopy shade generation, stamina-decay relay baton timing, single-catalyst bioluminescent chain reaction, 15-second perfect cornerstone alignment, Z-axis time-locked vault sealing, architectural bridge pillar blueprint overlay, five-finger outward energy purge distribution, centrifugal escape velocity orbit launch, identity-erasure anonymous light release',
    colorIdentity: '#556B2F',
    atomRange: [581, 590],
  },

  'eternal-river': {
    id: 'eternal-river',
    number: 60,
    name: 'The Eternal River',
    subtitle: 'The Physics of Surrender',
    domain: 'Upstream time-fighting exhaustion, rigid adaptation refusal, nostalgic stagnation loop, unstoppable transition terror, identity-loss merger fear, shallow-spread energy waste, scenic-route frustration, numbing false-pause suppression, centralised-power dispersal grief, absolute mortality ego dissolution',
    physicsParadigm: 'Fluid-dynamic upstream resistance with energy depletion, rigid-to-fluid liquefaction toggle, whirlpool eddy escape via center-current re-entry, waterfall Z-axis zero-G plunge mechanics, Y-junction confluence particle weaving, bank-constriction Venturi acceleration, fluid-dynamic meandering terrain navigation, ice-freeze pressure suppression with catastrophic shatter, delta branching irrigation dispersion, infinite borderless ocean node dissolution',
    colorIdentity: '#1A5276',
    atomRange: [591, 600],
  },

  // =================================================================
  // COLLECTION 7: THE FLUID TACTICIAN (Atoms 601–700)
  // =================================================================

  'aikido-redirect': {
    id: 'aikido-redirect',
    number: 61,
    name: 'The Aikido Redirect',
    subtitle: 'The Tangential Swipe',
    domain: 'Defensive flinching, combative exhaustion, reactivity, power-dynamic panic, passive-aggression internalisation, petty argument waste, multi-front overwhelm, bait reactivity, insult friction, chaos-as-fuel conversion',
    physicsParadigm: 'Tangential X-axis force redirection, micro-velocity judoka throw, tight circular coordinate swap, slow-drag thermal absorption cooling, parabolic curve velocity return, single-pixel Y-axis sidestep, figure-eight Bezier slingshot, hologram signature decoy, material toggle friction drop, fixed turbine kinetic conversion',
    colorIdentity: '#C41E3A',
    atomRange: [601, 610],
  },

  'bezier-curve': {
    id: 'bezier-curve',
    number: 62,
    name: 'The Bezier Curve',
    subtitle: 'The Continuous Flow',
    domain: 'Ruined-day syndrome, emotional overcorrection, all-or-nothing paralysis, forced detour despair, anxiety spiraling, perfectionism asymptote, sunk cost fallacy, toxic intersection derailing, rigid expectation snapping, chaotic life path rejection',
    physicsParadigm: 'Control-handle Bezier vertex smoothing, spline slider sawtooth-to-sine transformation, two-finger path pinch merging, sweeping arc obstacle bypass, tangent handle retraction, mathematical constraint shattering, 180° slingshot U-turn, Z-axis Bezier overpass, catenary curve natural sag, full-palm master spline interpolation',
    colorIdentity: '#4169E1',
    atomRange: [611, 620],
  },

  'elastic-yield': {
    id: 'elastic-yield',
    number: 63,
    name: 'The Elastic Yield',
    subtitle: 'The Physics of Invulnerability',
    domain: 'Brittle ego, rigid pride, setback despair, long-term burden exhaustion, martyr complex, defensive feedback deflection, compromise identity fear, emotional bottling, risk paralysis, trauma invulnerability',
    physicsParadigm: 'Tensile slider glass-to-rubber transformation, flexible reed hurricane survival, stored potential energy slingshot, viscoelastic surface area distribution, horizontal net weaving load dispersal, porous soft-body kinetic absorption, shape-memory alloy thermal recall, pinch-out rigid-to-elastic field expansion, non-Newtonian viscosity floor shift, infinite Z-axis hyper-elastic membrane stretch',
    colorIdentity: '#50C878',
    atomRange: [621, 630],
  },

  'momentum-theft': {
    id: 'momentum-theft',
    number: 64,
    name: 'The Momentum Theft',
    subtitle: 'The Physics of Kinetic Robbery',
    domain: 'Freeze-panic, systemic overwhelm exhaustion, startup capital waste, narrative manipulation, crushing failure, anger absorption, bureaucratic delay, chaotic team panic, hard-way bias, impossible-odds defeatism',
    physicsParadigm: 'Perfect elastic collision kinetic transfer, orbital gravity well slingshot, inelastic collision permanent fusion, reverse gear tooth mesh, fulcrum lever trebuchet inversion, U-valve fire redirection, whip-crack tip compression, angular momentum siphon tethering, precise slipstream pocket positioning, simultaneous five-vector center-point absorption',
    colorIdentity: '#FF6347',
    atomRange: [631, 640],
  },

  'slipstream': {
    id: 'slipstream',
    number: 65,
    name: 'The Slipstream',
    subtitle: 'The Physics of Effortless Action',
    domain: 'Ego-driven self-reliance, deliberate drama introduction, forced creative hype, head-against-wall stubbornness, approaching-wave terror, pioneer jealousy, constraint-as-prison thinking, poor timing friction, micromanagement suffocation, suffering-equals-earning bias',
    physicsParadigm: 'Aerodynamic drafting pocket positioning, turbulence-to-laminar streamline shifting, thermal updraft vertical catch, solid-to-fluid state transition seeping, bow-wave geometric edge surfing, cleared-wake frictionless cruising, capillary action constriction-driven rise, oscillating gate phase alignment, buoyancy natural ascent release, drag coefficient sculpting to absolute zero',
    colorIdentity: '#708090',
    atomRange: [641, 650],
  },

  'centrifuge': {
    id: 'centrifuge',
    number: 66,
    name: 'The Centrifuge',
    subtitle: 'The Physics of Repulsion',
    domain: 'Emotional contagion sponging, petty drama attachment, crisis panic joining, single-comment fragility, enmeshment confusion, constant-target exhaustion, daily zero-start exhaustion, personality-invaded powerlessness, savior-complex weight, room-control obsession',
    physicsParadigm: 'Centrifugal force circular gesture repulsion, angular velocity shear threshold, vortex eye dead-center stillness, gyroscopic vertical axis lock, centrifugal atomic-weight stratification, Coriolis effect trajectory curving, flywheel kinetic energy storage, expanding repulsion radius, tensile-strength centrifugal tether snap, impenetrable centrifugal sphere generation',
    colorIdentity: '#9932CC',
    atomRange: [651, 660],
  },

  'harmonious-friction': {
    id: 'harmonious-friction',
    number: 67,
    name: 'The Harmonious Friction',
    subtitle: 'The Physics of Directional Control',
    domain: 'Keep-the-peace compliance, boundary-saying inability, ego-shielded feedback rejection, passionless stagnation, argument-means-broken fear, echo-chamber hydroplaning, toxic enmeshment avoidance, soft-praise weakness, micro-resentment accumulation, conflict-avoidance trajectory loss',
    physicsParadigm: 'Spike-deployed ice grip steering, mechanical brake caliper friction, abrasive grindstone geometry shedding, violent strike kinetic ignition, gear-tooth initial clash to mesh lock, rough dissent particle traction injection, kinetic strike cleaving wedge, hard-wall velocity reflection doubling, constant micro-friction tap alignment, dynamic glide-to-carve friction toggle',
    colorIdentity: '#B87333',
    atomRange: [661, 670],
  },

  'counter-balance': {
    id: 'counter-balance',
    number: 68,
    name: 'The Counter-Balance',
    subtitle: 'The Physics of Equilibrium',
    domain: 'All-or-nothing manic cycling, panic over-correction, top-heavy ego fragility, sledgehammer over-reaction, static balance illusion, narrow-base collapse, matched-anger escalation, instant-reaction regret, opposing-desire tearing, external-chaos helplessness',
    physicsParadigm: 'Pendulum dead-center friction dampening, counter-intuitive skid-direction steering, ballast-drop center-of-gravity shifting, pinch-to-subdivide micro-weight calibration, continuous micro-input slackline balance, lateral outrigger buoyancy deployment, inverse waveform destructive interference, delayed wave natural settling, rigid tensegrity strut opposing-force lock, needlepoint fulcrum micro-shift equilibrium',
    colorIdentity: '#4682B4',
    atomRange: [671, 680],
  },

  'minimum-effective-dose': {
    id: 'minimum-effective-dose',
    number: 69,
    name: 'The Minimum Effective Dose',
    subtitle: 'The Physics of Leverage',
    domain: 'Brute-force exhaustion, over-explanation power dilution, 50-fire overwhelm, screaming-to-be-heard desperation, nervous silence-filling, total-rebuild overwhelm, plateau giving-up, over-analysis wound inflation, wrong-direction cargo ship, external-chaos energy drain',
    physicsParadigm: 'Hidden fulcrum torque multiplication, single-keystone physics penalty, lead-domino cascading kinetic transfer, resonant frequency glass shattering, null-input pressure-flip negotiation, keystone removal gravity collapse, phase-change threshold crossing, single-pixel origin-point web dissolution, 10000% zoom trim-tab fluid dynamics, 0.01% energy chain-reaction board clearance',
    colorIdentity: '#228B22',
    atomRange: [681, 690],
  },

  'wu-wei-master': {
    id: 'wu-wei-master',
    number: 70,
    name: 'The Wu Wei Master',
    subtitle: 'The Physics of Effortless Action',
    domain: 'Overthinking mental fog, panic-grip tightening, troll-feeding compulsion, crossfire triangulation, artificial urgency reactivity, heavy-armor exhaustion, forced-alignment micromanagement, desperate chasing, personal-identification collision, absolute surrender sovereignty',
    physicsParadigm: 'Gravity-settled silt clearing, paradoxical inward-slide mesh expansion, null-input oxygen deprivation fire starvation, dead-center null-zone mutual annihilation, ignored countdown manufactured urgency dissolution, solid-to-permeable wireframe lattice toggle, slack-release natural repulsion unspooling, zero-velocity low-pressure vacuum magnetism, collision-boundary ghost toggle dis-identification, absolute null-input catastrophic self-destruction orchestration',
    colorIdentity: '#C4A882',
    atomRange: [691, 700],
  },
};

// ── Ordered series list ─────────────────────────────────────────────

export const SERIES_IDS: readonly SeriesId[] = [
  'physics-engines',
  'quantum-mechanics',
  'biomimetic-algorithms',
  'via-negativa',
  'chrono-acoustic',
  'meta-system-glitch',
  'retro-causal',
  'kinematic-topology',
  'shadow-crucible',
  'reality-bender',
  // Collection 2: The Telemetric Navigator
  'epistemic-constructs',
  'friction-mechanics',
  'semantic-translators',
  'social-physics',
  'time-capsule',
  'soma-perception',
  'diplomat-empathy',
  'visionary-strategist',
  'mystic-infinite',
  'omega-integration',
  // Collection 3: The Transcendent Witness
  'metacognitive-mirror',
  'predictive-override',
  'fluidity-mechanics',
  'net-of-indra',
  'dialectical-engine',
  'identity-decoupling',
  'cosmic-play',
  'impermanence-engine',
  'interoceptive-anchor',
  'loving-awareness',
  // Collection 4: The Alchemical Synthesizer
  'particle-collider',
  'cymatic-engine',
  'catalyst-web',
  'chaos-loom',
  'pressure-vessel',
  'friction-spark',
  'conduit-flow',
  'magnetic-sieve',
  'momentum-wheel',
  'synthesis-forge',
  // Collection 5: The Non-Euclidean Diver
  'shadow-caster',
  'escher-loop',
  'gravity-inverter',
  'depth-sounder',
  'tesseract-geometry',
  'optical-blind-spot',
  'mirror-world',
  'klein-bottle',
  'abyssal-anchor',
  'shadow-integration',
  // Collection 6: The Chrono-Weaver
  'glacial-pacer',
  'fractal-zoom',
  'tectonic-shift',
  'geological-carver',
  'hourglass-inversion',
  'ancestral-tether',
  'horizon-line',
  'ephemeral-bloom',
  'legacy-seed',
  'eternal-river',
  // Collection 7: The Fluid Tactician
  'aikido-redirect',
  'bezier-curve',
  'elastic-yield',
  'momentum-theft',
  'slipstream',
  'centrifuge',
  'harmonious-friction',
  'counter-balance',
  'minimum-effective-dose',
  'wu-wei-master',
] as const;

// ── Series color lookup ─────────────────────────────────────────────

export const SERIES_COLORS: Record<SeriesId, string> = Object.fromEntries(
  Object.values(SERIES_CATALOG).map(s => [s.id, s.colorIdentity]),
) as Record<SeriesId, string>;