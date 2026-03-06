/**
 * ATOM TYPE CONTRACTS
 * ===================
 *
 * The universal type system for 700 interactive therapeutic atoms
 * across 70 series (7 collections).
 *
 * ARCHITECTURE:
 *   These atoms are NOT visual primitives (circles, waves, lines).
 *   They are interactive physics engines — each a self-contained world
 *   with its own laws, gesture vocabulary, and therapeutic resolution arc.
 *
 *   The atom IS the experience. It fills the viewport edge-to-edge.
 *   The composition layer (DeviceMirror / HeroRenderer) handles
 *   environmental blending — atmosphere, background, color story.
 *   The atom doesn't fight with those layers; it breathes through them.
 *
 * RULES:
 *   - Every atom implements AtomProps — no exceptions
 *   - Atoms never import haptics directly — they call onHaptic()
 *   - Atoms never hardcode colors — they use color + accentColor
 *   - Atoms never manage their own breath engine — they receive amplitude
 *   - Atoms declare their renderMode, surfaces, and requirements in metadata
 *   - SVG filter/gradient IDs are namespaced via useId()
 *   - reducedMotion gates ALL animation including repeat:Infinity
 *
 * DEPENDENCIES:
 *   This file imports NOTHING. It is the foundation.
 */

// =====================================================================
// 1. SERIES
// =====================================================================

export type SeriesId =
  | 'physics-engines'        // Series 1: Base Mechanics (Atoms 1–10)
  | 'quantum-mechanics'      // Series 2: Attention & Observation (Atoms 11–20)
  | 'biomimetic-algorithms'  // Series 3: Organic Growth (Atoms 21–30)
  | 'via-negativa'           // Series 4: Subtraction & The Void (Atoms 31–40)
  | 'chrono-acoustic'        // Series 5: Sound & Frequency (Atoms 41–50)
  | 'meta-system-glitch'     // Series 6: Breaking Autopilot (Atoms 51–60)
  | 'retro-causal'           // Series 7: Rewriting Time (Atoms 61–70)
  | 'kinematic-topology'     // Series 8: Perspective & Scale (Atoms 71–80)
  | 'shadow-crucible'        // Series 9: Facing the Dark (Atoms 81–90)
  | 'reality-bender'         // Series 10: Total Sovereignty (Atoms 91–100)
  // ── Collection 2: The Telemetric Navigator ───────────────
  | 'epistemic-constructs'   // Series 11: Belief & Truth (Atoms 101–110)
  | 'friction-mechanics'     // Series 12: Action & Resistance (Atoms 111–120)
  | 'semantic-translators'   // Series 13: Language & Meaning (Atoms 121–130)
  | 'social-physics'         // Series 14: Tribe & Boundary (Atoms 131–140)
  | 'time-capsule'           // Series 15: Future Weaving (Atoms 141–150)
  | 'soma-perception'        // Series 16: Body & Senses (Atoms 151–160)
  | 'diplomat-empathy'       // Series 17: Empathy & Boundaries (Atoms 161–170)
  | 'visionary-strategist'   // Series 18: Architecture of Future (Atoms 171–180)
  | 'mystic-infinite'        // Series 19: Transcendence & Play (Atoms 181–190)
  | 'omega-integration'      // Series 20: Final Integration (Atoms 191–200)
  // ── Collection 3: The Transcendent Witness ───────────────
  | 'metacognitive-mirror'   // Series 21: The Witness (Atoms 201–210)
  | 'predictive-override'    // Series 22: Raw Perception (Atoms 211–220)
  | 'fluidity-mechanics'     // Series 23: The Wiggly World (Atoms 221–230)
  | 'net-of-indra'           // Series 24: Interconnection (Atoms 231–240)
  | 'dialectical-engine'     // Series 25: Paradox & Tension (Atoms 241–250)
  | 'identity-decoupling'    // Series 26: Role to Soul (Atoms 251–260)
  | 'cosmic-play'            // Series 27: Lila & The Dance (Atoms 261–270)
  | 'impermanence-engine'    // Series 28: Anicca & Letting Go (Atoms 271–280)
  | 'interoceptive-anchor'   // Series 29: "Here" (Atoms 281–290)
  | 'loving-awareness'       // Series 30: Wholeness & Integration (Atoms 291–300)
  // ── Collection 4: The Alchemical Synthesizer ───────────────
  | 'particle-collider'      // Series 31: High-Velocity Synthesis (Atoms 301–310)
  | 'cymatic-engine'         // Series 32: Finding the Frequency (Atoms 311–320)
  | 'catalyst-web'           // Series 33: Organizing the Overwhelm (Atoms 321–330)
  | 'chaos-loom'             // Series 34: Anchoring the Storm (Atoms 331–340)
  | 'pressure-vessel'        // Series 35: Productive Constraint (Atoms 341–350)
  | 'friction-spark'         // Series 36: Earning the Energy (Atoms 351–360)
  | 'conduit-flow'           // Series 37: Channeling the Force (Atoms 361–370)
  | 'magnetic-sieve'         // Series 38: Ruthless Reduction (Atoms 371–380)
  | 'momentum-wheel'         // Series 39: Overcoming Inertia (Atoms 381–390)
  | 'synthesis-forge'        // Series 40: The Melting Point (Atoms 391–400)
  // ── Collection 5: The Non-Euclidean Diver ──────────────────
  | 'shadow-caster'           // Series 41: Changing the Light (Atoms 401–410)
  | 'escher-loop'             // Series 42: Breaking the Paradox (Atoms 411–420)
  | 'gravity-inverter'        // Series 43: Flipping the Paradigm (Atoms 421–430)
  | 'depth-sounder'           // Series 44: Pinging the Dark (Atoms 431–440)
  | 'tesseract-geometry'      // Series 45: Unfolding the Hypercube (Atoms 441–450)
  | 'optical-blind-spot'      // Series 46: The Optical Truth (Atoms 451–460)
  | 'mirror-world'            // Series 47: Psychological Projection (Atoms 461–470)
  | 'klein-bottle'            // Series 48: The Victim Trap (Atoms 471–480)
  | 'abyssal-anchor'          // Series 49: Hitting Rock Bottom (Atoms 481–490)
  | 'shadow-integration'      // Series 50: The Master Alloy (Atoms 491–500)
  // ── Collection 6: The Chrono-Weaver ────────────────────────
  | 'glacial-pacer'           // Series 51: Physics of Slowness (Atoms 501–510)
  | 'fractal-zoom'            // Series 52: Infinite Perspective (Atoms 511–520)
  | 'tectonic-shift'          // Series 53: Invisible Pressure (Atoms 521–530)
  | 'geological-carver'       // Series 54: Physics of Erosion (Atoms 531–540)
  | 'hourglass-inversion'     // Series 55: Accumulation of Mass (Atoms 541–550)
  | 'ancestral-tether'        // Series 56: Generational Chain (Atoms 551–560)
  | 'horizon-line'            // Series 57: Physics of Foresight (Atoms 561–570)
  | 'ephemeral-bloom'         // Series 58: Physics of Letting Go (Atoms 571–580)
  | 'legacy-seed'             // Series 59: Blind Architecture (Atoms 581–590)
  | 'eternal-river'            // Series 60: Physics of Surrender (Atoms 591–600)
  // ── Collection 7: The Fluid Tactician ──────────────────────
  | 'aikido-redirect'         // Series 61: Tangential Swipe (Atoms 601–610)
  | 'bezier-curve'            // Series 62: Continuous Flow (Atoms 611–620)
  | 'elastic-yield'           // Series 63: Physics of Invulnerability (Atoms 621–630)
  | 'momentum-theft'          // Series 64: Physics of Kinetic Robbery (Atoms 631–640)
  | 'slipstream'              // Series 65: Physics of Effortless Action (Atoms 641–650)
  | 'centrifuge'              // Series 66: Physics of Repulsion (Atoms 651–660)
  | 'harmonious-friction'     // Series 67: Physics of Directional Control (Atoms 661–670)
  | 'counter-balance'         // Series 68: Physics of Equilibrium (Atoms 671–680)
  | 'minimum-effective-dose'  // Series 69: Physics of Leverage (Atoms 681–690)
  | 'wu-wei-master';          // Series 70: Physics of Effortless Action (Atoms 691–700)

// =====================================================================
// 2. ATOM IDS
// =====================================================================
// Each atom has a unique kebab-case ID. Numbered 1–100 globally.
// The ID encodes the engine name, NOT the visual shape.

export type AtomId =
  // ── Series 1: Physics Engines ─────────────────────────────
  | 'chrono-kinetic'           //  1
  | 'phase-shift'              //  2
  | 'z-axis-parallax'          //  3
  | 'somatic-resonance'        //  4
  | 'constructive-destructive' //  5
  | 'cryptographic'            //  6
  | 'symbiotic'                //  7
  | 'optical'                  //  8
  | 'equilibrium'              //  9
  | 'thermodynamic'            // 10
  // ── Series 2: Quantum Mechanics ───────────────────────────
  | 'wave-collapse'            // 11
  | 'schrodinger-box'          // 12
  | 'double-slit'              // 13
  | 'many-worlds'              // 14
  | 'entanglement'             // 15
  | 'uncertainty-blur'         // 16
  | 'quantum-tunnel'           // 17
  | 'zero-point-field'         // 18
  | 'retrocausal'              // 19
  | 'holographic'              // 20
  // ── Series 3: Biomimetic Algorithms ───────────────────────
  | 'l-system-branching'       // 21
  | 'boids-flocking'           // 22
  | 'composting'               // 23
  | 'mycelial-routing'         // 24
  | 'symbiosis'                // 25
  | 'pruning'                  // 26
  | 'dormancy'                 // 27
  | 'ecosystem-balancer'       // 28
  | 'pollination'              // 29
  | 'erosion'                  // 30
  // ── Series 4: Via Negativa ────────────────────────────────
  | 'sensory-deprivation'      // 31
  | 'un-naming'                // 32
  | 'figure-ground-reversal'   // 33
  | 'vacuum-seal'              // 34
  | 'dark-matter'              // 35
  | 'static-clear'             // 36
  | 'apneic-pause'             // 37
  | 'format-reset'             // 38
  | 'noise-gate'               // 39
  | 'singularity'              // 40
  // ── Series 5: Chrono-Acoustic ────────────────────────────
  | 'phase-lock'               // 41
  | 'vagal-hum'                // 42
  | 'isochronic-pacer'        // 43
  | 'cymatic-coherence'       // 44
  | 'audio-zoom'              // 45
  | 'brown-noise'             // 46
  | 'tempo-override'          // 47
  | 'crescendo'               // 48
  | 'standing-wave'           // 49
  | 'silent-rest'             // 50
  // ── Series 6: Meta-System & Glitch ────────────────────────
  | 'fourth-wall-break'        // 51
  | 'lag-spike'                // 52
  | 'phantom-alert'            // 53
  | 'kernel-panic'             // 54
  | 'algorithm-jammer'         // 55
  | 'reality-tear'             // 56
  | 'muscle-memory'            // 57
  | 'pixelation'               // 58
  | 'attention-paywall'        // 59
  | 'semantic-crash'           // 60
  // ── Series 7: Retro-Causal ────────────────────────────────
  | 'audio-rescore'            // 61
  | 'chromatic-grade'          // 62
  | 'narrative-flip'           // 63
  | 'splicing-timeline'        // 64
  | 'prequel-context'          // 65
  | 'metadata-rewrite'         // 66
  | 'forgiveness-filter'       // 67
  | 'ancestral-cut'            // 68
  | 'time-travel-rescue'       // 69
  | 'third-person-shift'       // 70
  // ── Series 8: Kinematic Topology ──────────────────────────
  | 'overview-effect'          // 71
  | 'fractal-zoom'             // 72
  | 'deep-time'                // 73
  | 'systemic-zoom'            // 74
  | 'ego-zoom'                 // 75
  | 'micro-step'               // 76
  | 'vastness-expansion'       // 77
  | 'horizon-infinite'         // 78
  | 'stardust-dissolve'        // 79
  | 'holographic-drop'         // 80
  // ── Series 9: Shadow & Crucible ───────────────────────────
  | 'crucible-fire'            // 81
  | 'shadow-hug'               // 82
  | 'projection-mirror'        // 83
  | 'solve-coagula'            // 84
  | 'paradox-tension'          // 85
  | 'monster-taming'           // 86
  | 'shame-compass'            // 87
  | 'anger-forge'              // 88
  | 'inner-child'              // 89
  | 'phoenix-ash'              // 90
  // ── Series 10: Reality Bender ─────────────────────────────
  | 'atmosphere-weather'       // 91
  | 'distortion-grid'          // 92
  | 'belief-bridge'            // 93
  | 'future-memory'            // 94
  | 'luck-surface'             // 95
  | 'possibility-prism'        // 96
  | 'architect-stone'          // 97
  | 'narrative-override'       // 98
  | 'pure-yes'                 // 99
  | 'infinite-ouroboros'       // 100
  // ── Series 11: Epistemic Constructs ───────────────────────
  | 'centrifuge-engine'        // 101
  | 'ladder-of-inference'      // 102
  | 'logic-gate'               // 103
  | 'steel-man'                // 104
  | 'blind-spot'               // 105
  | 'sunk-cost-severance'      // 106
  | 'absurdity-deflation'      // 107
  | 'first-principles'         // 108
  | 'echo-cancellation'        // 109
  | 'axiomatic-seal'           // 110
  // ── Series 12: Friction Mechanics ─────────────────────────
  | 'inertia-break'            // 111
  | 'micro-step-shrink'        // 112
  | 'ulysses-pact'             // 113
  | 'friction-injection'       // 114
  | 'flywheel'                 // 115
  | 'good-enough'              // 116
  | 'burn-rate'                // 117
  | 'vector-pivot'             // 118
  | 'friction-polish'          // 119
  | 'kinetic-seal'             // 120
  // ── Series 13: Semantic Translators ───────────────────────
  | 'subtext-scanner'          // 121
  | 'translator-peel'          // 122
  | 'yet-append'               // 123
  | 'conjunction-shift'        // 124
  | 'headline-rewrite'         // 125
  | 'label-inception'          // 126
  | 'meaning-mine'             // 127
  | 'absurdity-filter'         // 128
  | 'silent-mirror'            // 129
  | 'interpreter-seal'         // 130
  // ── Series 14: Social Physics ─────────────────────────────
  | 'reverse-orbit'            // 131
  | 'forcefield'               // 132
  | 'status-seesaw'            // 133
  | 'empathy-bridge'           // 134
  | 'aikido-redirect'          // 135
  | 'social-battery'           // 136
  | 'gossip-firewall'          // 137
  | 'lighthouse'               // 138
  | 'roche-limit'              // 139
  | 'diplomat-seal'            // 140
  // ── Series 15: Time Capsule & Future Weaving ──────────────
  | 'open-when'                // 141
  | 'rage-vault'               // 142
  | 'prediction-stake'         // 143
  | 'dead-mans-switch'         // 144
  | 'regret-minimization'      // 145
  | 'pre-hindsight'            // 146
  | 'branch-pruner'            // 147
  | 'worst-case-simulator'     // 148
  | 'ten-year-echo'            // 149
  | 'capsule-seal'             // 150
  // ── Series 16: Soma & Perception ──────────────────────────
  | 'skin-map'                 // 151
  | 'pulse-reader'             // 152
  | 'fascia-wave'              // 153
  | 'proprioception'           // 154
  | 'micro-texture'            // 155
  | 'voice-box'                // 156
  | 'blind-walk'               // 157
  | 'temperature-scan'         // 158
  | 'gut-signal'               // 159
  | 'soma-seal'                // 160
  // ── Series 17: Diplomat & Empathy ─────────────────────────
  | 'mirror-shield'            // 161
  | 'truce-table'              // 162
  | 'perspective-swap'         // 163
  | 'translation-ear'          // 164
  | 'boundary-dance'           // 165
  | 'third-chair'              // 166
  | 'steel-man-build'          // 167
  | 'de-escalation'            // 168
  | 'mirror-neuron'            // 169
  | 'common-ground-seal'       // 170
  // ── Series 18: Visionary & Strategist ─────────────────────
  | 'essentialism'             // 171
  | 'compound-interest'        // 172
  | 'deep-work'                // 173
  | 'leverage-engine'          // 174
  | 'horizon-scan'             // 175
  | 'obstacle-flip'            // 176
  | 'courage-map'              // 177
  | 'abundance-scan'           // 178
  | 'permissionless'           // 179
  | 'becoming-seal'            // 180
  // ── Series 19: Mystic & Infinite Player ───────────────────
  | 'maya-veil'                // 181
  | 'no-self'                  // 182
  | 'cosmic-joke'              // 183
  | 'space-between'            // 184
  | 'beginners-mind'           // 185
  | 'dance-of-shiva'           // 186
  | 'unplanned-hour'           // 187
  | 'wonder-walk'              // 188
  | 'light-source'             // 189
  | 'mystic-seal'              // 190
  // ── Series 20: Omega & Integration ────────────────────────
  | 'prism-return'             // 191
  | 'golden-spiral'            // 192
  | 'time-collapse'            // 193
  | 'mirror-of-truth'          // 194
  | 'event-horizon'            // 195
  | 'alpha-omega'              // 196
  | 'circle-close'             // 197
  | 'final-exhale'             // 198
  | 'tail-swallow'             // 199
  | 'atlas-seal'               // 200
  // ── Series 21: Metacognitive Mirror ───────────────────────
  | 'theater-lens'             // 201
  | 'focal-glass'              // 202
  | 'syntactic-severance'      // 203
  | 'traffic-observer'         // 204
  | 'sky-and-clouds'           // 205
  | 'empty-boat'               // 206
  | 'glass-wall'               // 207
  | 'echomaker'                // 208
  | 'holographic-parallax'     // 209
  | 'observer-seal'            // 210
  // ── Series 22: Predictive Override ────────────────────────
  | 'semantic-stripping'       // 211
  | 'raw-data'                 // 212
  | 'color-deconstruct'        // 213
  | 'taste-explode'            // 214
  | 'acoustic-unnaming'        // 215
  | 'tabula-rasa'              // 216
  | 'wabi-sabi'                // 217
  | 'somatic-trust'            // 218
  | 'texture-touch'            // 219
  | 'perception-seal'          // 220
  // ── Series 23: Fluidity Mechanics ─────────────────────────
  | 'binary-breaker'           // 221
  | 'water-mode'               // 222
  | 'identity-fluidity'        // 223
  | 'harmonic-synthesis'       // 224
  | 'wu-wei'                   // 225
  | 'thawing'                  // 226
  | 'proteus'                  // 227
  | 'ocean-depth'              // 228
  | 'complexity-breath'        // 229
  | 'shifter-seal'             // 230
  // ── Series 24: Net of Indra ───────────────────────────────
  | 'indra-node'               // 231
  | 'mutual-respiration'       // 232
  | 'mycelium-network'         // 233
  | 'dmn-deactivation'         // 234
  | 'echo-chamber'             // 235
  | 'murmuration'              // 236
  | 'gravity-well'             // 237
  | 'butterfly-effect'         // 238
  | 'interference-pattern'     // 239
  | 'cosmic-tapestry-seal'     // 240
  // ── Series 25: Dialectical Engine ─────────────────────────
  | 'tensegrity'               // 241
  | 'both-and'                 // 242
  | 'zen-koan'                 // 243
  | 'complementary-color'      // 244
  | 'pendulum-arrest'          // 245
  | 'magnetic-suspension'      // 246
  | 'acceptance-change'        // 247
  | 'mobius-strip'             // 248
  | 'weight-of-opposites'      // 249
  | 'dialectical-seal'         // 250
  // ── Series 26: Identity Decoupling ────────────────────────
  | 'matryoshka'               // 251
  | 'armor-drop'               // 252
  | 'predicate-eraser'         // 253
  | 'costume-closet'           // 254
  | 'time-lapse-mirror'        // 255
  | 'resume-burner'            // 256
  | 'space-container'          // 257
  | 'nobody'                   // 258
  | 're-entry'                 // 259
  | 'soul-seal'                // 260
  // ── Series 27: Cosmic Play ────────────────────────────────
  | 'destination-override'     // 261
  | 'sand-mandala'             // 262
  | 'toy-box'                  // 263
  | 'sisyphus-smile'           // 264
  | 'improvisation'            // 265
  | 'stakes-free'              // 266
  | 'character-drop'           // 267
  | 'juggler'                  // 268
  | 'infinite-canvas'          // 269
  | 'lila-seal'                // 270
  // ── Series 28: Impermanence Engine ────────────────────────
  | 'open-palm'                // 271
  | 'evaporation'              // 272
  | 'autumn-leaf'              // 273
  | 'wave-decay'               // 274
  | 'ebb-tide'                 // 275
  | 'metamorphosis'            // 276
  | 'exhale-cycle'             // 277
  | 'kintsugi'                 // 278
  | 'sunset'                   // 279
  | 'anicca-seal'              // 280
  // ── Series 29: Interoceptive Anchor ───────────────────────
  | 'bio-mirror'               // 281
  | 'respiration-pendulum'     // 282
  | 'plumb-line'               // 283
  | 'cymatic-resonance'        // 284
  | 'focal-collapse'           // 285
  | 'tectonic-drop'            // 286
  | 'micro-tremor'             // 287
  | 'thermal-boundary'         // 288
  | 'weight-of-world'          // 289
  | 'anchor-seal'              // 290
  // ── Series 30: Loving Awareness ───────────────────────────
  | 'shadow-embrace'           // 291
  | 'metta-radiance'           // 292
  | 'golden-thread'            // 293
  | 'altar'                    // 294
  | 'namaste-lens'             // 295
  | 'karmic-severance'         // 296
  | 'infinite-heart'           // 297
  | 'i-am'                     // 298
  | 'ocean-drop'               // 299
  | 'atlas-omega'              // 300
  // ── Series 31: Particle Collider ─────────────────────────────
  | 'synthesis-strike'         // 301
  | 'magnetic-paradox'         // 302
  | 'orbital-decay'            // 303
  | 'asymmetric-smash'         // 304
  | 'velocity-threshold'       // 305
  | 'fragmentation-engine'     // 306
  | 'elastic-snapback'         // 307
  | 'glancing-blow'            // 308
  | 'triangulation'            // 309
  | 'absolute-zero'            // 310
  // ── Series 32: Cymatic Engine ────────────────────────────────
  | 'base-frequency'           // 311
  | 'dissonant-chord'          // 312
  | 'resonant-shatter'         // 313
  | 'silence-gap'              // 314
  | 'harmonic-stack'           // 315
  | 'sub-bass-drop'            // 316
  | 'amplitude-surge'          // 317
  | 'noise-filter'             // 318
  | 'chladni-organization'     // 319
  | 'cymatic-link'             // 320
  // ── Series 33: Catalyst Web ──────────────────────────────────
  | 'central-node'             // 321
  | 'constellation-link'       // 322
  | 'gravity-inversion'        // 323
  | 'tangled-thread'           // 324
  | 'magnetic-snap'            // 325
  | 'neural-pruning'           // 326
  | 'ripple-effect'            // 327
  | 'alignment-grid'           // 328
  | 'domino-vector'            // 329
  | 'orbit-stabilizer'         // 330
  // ── Series 34: Chaos Loom ────────────────────────────────────
  | 'loom-anchor'              // 331
  | 'spindle-focus'            // 332
  | 'fabric-tear'              // 333
  | 'braided-cord'             // 334
  | 'tension-snap'             // 335
  | 'warp-and-weft'            // 336
  | 'suture-mend'              // 337
  | 'web-spinner'              // 338
  | 'knot-release'             // 339
  | 'tapestry-integration'     // 340
  // ── Series 35: Pressure Vessel ───────────────────────────────
  | 'compression-diamond'      // 341
  | 'vacuum-chamber'           // 342
  | 'hydraulic-press'          // 343
  | 'pressure-cook'            // 344
  | 'carbon-layer'             // 345
  | 'fault-line-release'       // 346
  | 'depth-pressure'           // 347
  | 'implosion-core'           // 348
  | 'steam-valve'              // 349
  | 'crystal-lattice'          // 350
  // ── Series 36: Friction Spark ────────────────────────────────
  | 'flint-strike'             // 351
  | 'piston-pump'              // 352
  | 'hand-crank'               // 353
  | 'velocity-sled'            // 354
  | 'bowstring-draw'           // 355
  | 'dynamo-spin'              // 356
  | 'heat-sink'                // 357
  | 'resonance-cascade'        // 358
  | 'kinetic-battery'          // 359
  | 'bellows-breath'           // 360
  // ── Series 37: Conduit Flow ──────────────────────────────────
  | 'lightning-rod'            // 361
  | 'aqueduct-channel'         // 362
  | 'prism-spectrum'           // 363
  | 'transformer-coil'         // 364
  | 'capillary-action'         // 365
  | 'fiber-optic'              // 366
  | 'venturi-effect'           // 367
  | 'superconductor'           // 368
  | 'tesla-coil'               // 369
  | 'circuit-complete'         // 370
  // ── Series 38: Magnetic Sieve ────────────────────────────────
  | 'gravity-drop'             // 371
  | 'polarity-shift'           // 372
  | 'centrifuge-spin'          // 373
  | 'winnowing-wind'           // 374
  | 'noise-threshold'          // 375
  | 'decant-pour'              // 376
  | 'magnetic-pull'            // 377
  | 'evaporation-patience'     // 378
  | 'gold-pan'                 // 379
  | 'singularity-focus'        // 380
  // ── Series 39: Momentum Wheel ────────────────────────────────
  | 'heavy-flywheel'           // 381
  | 'pendulum-swing'           // 382
  | 'gear-mesh'                // 383
  | 'gyroscope-balance'        // 384
  | 'snowball-roll'            // 385
  | 'lever-advantage'          // 386
  | 'siphon-transfer'          // 387
  | 'escapement-tick'          // 388
  | 'slingshot-orbit'          // 389
  | 'perpetual-motion'         // 390
  // ── Series 40: Synthesis Forge ───────────────────────────────
  | 'crucible-heat'            // 391
  | 'alloy-fusion'             // 392
  | 'casting-mold'             // 393
  | 'quench-harden'            // 394
  | 'annealing-relief'         // 395
  | 'slag-skim'                // 396
  | 'arc-weld'                 // 397
  | 'hammer-forge'             // 398
  | 'polish-refine'            // 399
  | 'master-forge'             // 400
  // ── Series 41: Shadow Caster ─────────────────────────────────
  | 'magnification-shadow'    // 401
  | 'distorted-angle'         // 402
  | 'long-cast-shadow'        // 403
  | 'multiple-sources'        // 404
  | 'silhouetted-wall'        // 405
  | 'eclipse-cover'           // 406
  | 'looming-proximity'       // 407
  | 'penumbra-blur'           // 408
  | 'sun-dial-passage'        // 409
  | 'luminous-core'           // 410
  // ── Series 42: Escher Loop ───────────────────────────────────
  | 'penrose-stair'           // 411
  | 'mobius-slice'            // 412
  | 'necker-cube'             // 413
  | 'impossible-tribar'       // 414
  | 'droste-recursion'        // 415
  | 'closed-circuit-drain'    // 416
  | 'ouroboros-pry'           // 417
  | 'klein-escape'            // 418
  | 'tesseract-unfold'        // 419
  | 'gordian-slice'           // 420
  // ── Series 43: Gravity Inverter ──────────────────────────────
  | 'paradigm-flip'           // 421
  | 'buoyancy-shift'          // 422
  | 'kinetic-pulley'          // 423
  | 'terminal-velocity-hover' // 424
  | 'centrifugal-floor'       // 425
  | 'archimedes-lift'         // 426
  | 'magnetic-floor'          // 427
  | 'zero-g-release'          // 428
  | 'orbit-escape'            // 429
  | 'atlas-shift'             // 430
  // ── Series 44: Depth Sounder ─────────────────────────────────
  | 'echolocation-ping'       // 431
  | 'frequency-sweep'         // 432
  | 'blind-navigation'        // 433
  | 'doppler-approach'        // 434
  | 'thermocline-descent'     // 435
  | 'submarine-cable'         // 436
  | 'bathysphere-dive'        // 437
  | 'silent-running'          // 438
  | 'false-bottom-net'        // 439
  | 'trench-beacon'           // 440
  // ── Series 45: Tesseract Geometry ────────────────────────────
  | 'tesseract-unfolding'     // 441
  | 'z-axis-flatten'          // 442
  | 'cross-section-slice'     // 443
  | 'orthographic-shift'      // 444
  | 'spatial-clipping'        // 445
  | 'hidden-face-expose'      // 446
  | 'vertex-snap-plane'       // 447
  | 'dimensional-extrusion'   // 448
  | 'origami-tension'         // 449
  | 'master-net-print'        // 450
  // ── Series 46: Blind Spot Optics ─────────────────────────────
  | 'polarized-lens'          // 451
  | 'negative-space-reveal'   // 452
  | 'redaction-burn'          // 453
  | 'camouflage-parallax'     // 454
  | 'macula-peripheral'       // 455
  | 'chromatic-filter'        // 456
  | 'focal-length-shift'      // 457
  | 'uv-revelation'           // 458
  | 'mirror-flip-hypocrisy'   // 459
  | 'ego-strip'               // 460
  // ── Series 47: Mirror World ──────────────────────────────────
  | 'perfect-symmetry'        // 461
  | 'tethered-avatar'         // 462
  | 'doppelganger-merge'      // 463
  | 'kaleidoscope-source'     // 464
  | 'puppet-strings'          // 465
  | 'judgment-return'         // 466
  | 'prison-wall-melt'        // 467
  | 'superiority-shadow'      // 468
  | 'asymmetric-reconciliation' // 469
  | 'projection-unification'  // 470
  // ── Series 48: Klein Bottle ──────────────────────────────────
  | 'non-orientable-surface'  // 471
  | 'finger-trap'             // 472
  | 'quicksand-still'         // 473
  | 'boundary-illusion'       // 474
  | 'recursive-maze'          // 475
  | 'elastic-resentment'      // 476
  | 'impossible-container'    // 477
  | 'undertow-surrender'      // 478
  | 'shadow-knot-heal'        // 479
  | 'glass-ceiling-fall'      // 480
  // ── Series 49: Abyssal Anchor ────────────────────────────────
  | 'freefall-bedrock'        // 481
  | 'crushing-depth'          // 482
  | 'void-deprivation'        // 483
  | 'heavy-anchor-ground'     // 484
  | 'bedrock-scatter'         // 485
  | 'compression-forge'       // 486
  | 'echolocation-return'     // 487
  | 'buoyancy-rebound'        // 488
  | 'benthic-light'           // 489
  | 'titan-stance'            // 490
  // ── Series 50: Shadow Integration ────────────────────────────
  | 'magnetic-embrace'        // 491
  | 'fluid-alloy'             // 492
  | 'structural-load'         // 493
  | 'shadow-symbiosis'        // 494
  | 'eclipse-merge'           // 495
  | 'mycelial-revival'        // 496
  | 'chimera-fusion'          // 497
  | 'kinetic-conversion'      // 498
  | 'shadow-horizon'          // 499
  | 'shadow-synthesis'        // 500
  // ── Series 51: Glacial Pacer ─────────────────────────────────
  | 'non-newtonian-shield'    // 501
  | 'kinetic-multiplier'      // 502
  | 'friction-burn'           // 503
  | 'deep-cleave'             // 504
  | 'taproot-depth'           // 505
  | 'pendulum-weight'         // 506
  | 'over-steer'              // 507
  | 'chrono-lock'             // 508
  | 'viscous-climb'           // 509
  | 'glacier-force'           // 510
  // ── Series 52: Fractal Zoom ──────────────────────────────────
  | 'dead-pixel-zoom'         // 511
  | 'volatile-graph'          // 512
  | 'fractal-recursion'       // 513
  | 'maze-wall-elevation'     // 514
  | 'dissonant-note'          // 515
  | 'tangled-thread-weave'    // 516
  | 'rough-texture-grip'      // 517
  | 'drop-in-ocean'           // 518
  | 'horizon-curve'           // 519
  | 'lifetime-axis'           // 520
  // ── Series 53: Tectonic Shift ────────────────────────────────
  | 'fault-line-snap'         // 521
  | 'subduction-zone'         // 522
  | 'magma-chamber'           // 523
  | 'continental-drift'       // 524
  | 'stalactite-drip'         // 525
  | 'stratigraphy-compress'   // 526
  | 'kinetic-potential-spring' // 527
  | 'fossilization-press'     // 528
  | 'tremor-valve'            // 529
  | 'orogeny-peak'            // 530
  // ── Series 54: Geological Carver ─────────────────────────────
  | 'water-drop-erosion'      // 531
  | 'riverbed-flow'           // 532
  | 'wind-shear-breath'       // 533
  | 'coastal-shelf-undercut'  // 534
  | 'sediment-deposit'        // 535
  | 'thermal-expansion-rest'  // 536
  | 'root-wedge'              // 537
  | 'glacial-polish'          // 538
  | 'oxbow-pivot'             // 539
  | 'grand-canyon-carve'      // 540
  // ── Series 55: Hourglass Inversion ───────────────────────────
  | 'hourglass-gravity-flip'  // 541
  | 'center-of-mass'          // 542
  | 'strata-compress'         // 543
  | 'kinetic-impact-age'      // 544
  | 'bottleneck-expand'       // 545
  | 'hourglass-shatter'       // 546
  | 'stalagmite-build'        // 547
  | 'weight-displacement-lever' // 548
  | 'compound-snowball'       // 549
  | 'apex-inversion-monument' // 550
  // ── Series 56: Ancestral Tether ──────────────────────────────
  | 'load-bearing-link'       // 551
  | 'kinetic-transfer-pulse'  // 552
  | 'shock-absorber-chain'    // 553
  | 'forward-cast-nodes'      // 554
  | 'structural-integrity-chain' // 555
  | 'ripple-effect-tap'       // 556
  | 'orphan-node-lattice'     // 557
  | 'compression-arch-load'   // 558
  | 'tension-release-slack'   // 559
  | 'infinite-zoom-helix'     // 560
  // ── Series 57: Horizon Line ──────────────────────────────────
  | 'claustrophobia-expand'   // 561
  | 'reactive-dodge-focus'    // 562
  | 'fog-of-war-beacon'       // 563
  | 'vanishing-point-converge' // 564
  | 'tactical-retreat-flank'  // 565
  | 'delayed-yield-harvest'   // 566
  | 'trajectory-plot-aim'     // 567
  | 'doppler-shift-approach'  // 568
  | 'parallax-scroll-depth'   // 569
  | 'horizon-merge-present'   // 570
  // ── Series 58: Ephemeral Bloom ───────────────────────────────
  | 'sand-mandala-sweep'      // 571
  | 'seasonal-shed'           // 572
  | 'chrysalis-melt'          // 573
  | 'compost-grind'           // 574
  | 'molting-shell-crack'     // 575
  | 'sunset-anomaly'          // 576
  | 'kinetic-decay-halflife'  // 577
  | 'memory-compression'      // 578
  | 'exhale-release'          // 579
  | 'seed-scatter-bloom'      // 580
  // ── Series 59: Legacy Seed ───────────────────────────────────
  | 'blind-architect-stack'   // 581
  | 'shade-tree-canopy'       // 582
  | 'relay-baton-pass'        // 583
  | 'catalyst-drop-grid'      // 584
  | 'cornerstone-align'       // 585
  | 'time-capsule-vault'      // 586
  | 'bridge-pillar-span'      // 587
  | 'endowment-purge'         // 588
  | 'orbit-launch-escape'     // 589
  | 'unknown-benefactor'      // 590
  // ── Series 60: Eternal River ─────────────────────────────────
  | 'upstream-swim'           // 591
  | 'rigid-boulder-liquefy'   // 592
  | 'eddy-escape'             // 593
  | 'cataract-plunge'         // 594
  | 'confluence-merge'        // 595
  | 'deep-channel-focus'      // 596
  | 'meander-curve'           // 597
  | 'ice-carapace-shatter'    // 598
  | 'delta-dispersion'        // 599
  | 'eternal-ocean'            // 600
  // ── Series 61: Aikido Redirect ───────────────────────────────
  | 'linear-strike-redirect'  // 601
  | 'heavy-momentum-throw'    // 602
  | 'corner-trap-pivot'       // 603
  | 'escalation-cool'         // 604
  | 'kinetic-return-curve'    // 605
  | 'rigid-stance-sidestep'   // 606
  | 'multiple-fronts-flow'    // 607
  | 'false-target-matador'    // 608
  | 'frictionless-plane'      // 609
  | 'kinetic-conversion-turbine' // 610
  // ── Series 62: Bezier Curve ──────────────────────────────────
  | 'sharp-corner-handle'     // 611
  | 'sawtooth-spline'         // 612
  | 'binary-fork-merge'       // 613
  | 'forced-detour-arc'       // 614
  | 'tangent-handle-retract'  // 615
  | 'asymptote-collision'     // 616
  | 'u-turn-slingshot'        // 617
  | 'intersection-overpass'   // 618
  | 'tension-catenary'        // 619
  | 'master-spline-smooth'    // 620
  // ── Series 63: Elastic Yield ─────────────────────────────────
  | 'trampoline-rebound'      // 621
  | 'bowed-reed'              // 622
  | 'slingshot-comeback'      // 623
  | 'viscoelastic-creep'      // 624
  | 'tension-net-weave'       // 625
  | 'shock-absorber-sponge'   // 626
  | 'shape-memory-recall'     // 627
  | 'impact-radius-release'   // 628
  | 'non-newtonian-floor'     // 629
  | 'invincible-membrane'     // 630
  // ── Series 64: Momentum Theft ────────────────────────────────
  | 'kinetic-siphon-transfer' // 631
  | 'gravity-assist-slingshot' // 632
  | 'inelastic-latch-fuse'    // 633
  | 'gear-reversal-flip'      // 634
  | 'trebuchet-counterweight'  // 635
  | 'valve-redirect-thrust'   // 636
  | 'whip-crack-propagation'  // 637
  | 'angular-theft-stabilize' // 638
  | 'slipstream-draft'        // 639
  | 'absolute-robbery'        // 640
  // ── Series 65: Slipstream ────────────────────────────────────
  | 'aerodynamic-draft'       // 641
  | 'laminar-flow-smooth'     // 642
  | 'thermal-updraft-lift'    // 643
  | 'path-least-resistance'   // 644
  | 'bow-wave-surf'           // 645
  | 'wake-ride-pioneer'       // 646
  | 'capillary-action-rise'   // 647
  | 'phase-alignment-gate'    // 648
  | 'buoyant-ascent-release'  // 649
  | 'zero-drag-teardrop'      // 650
  // ── Series 66: Centrifuge ────────────────────────────────────
  | 'rotational-boundary'     // 651
  | 'angular-velocity-shed'   // 652
  | 'vortex-core-stillness'   // 653
  | 'gyroscopic-stabilizer'   // 654
  | 'particle-separation'     // 655
  | 'orbital-deflection'      // 656
  | 'flywheel-momentum'       // 657
  | 'expanding-radius'        // 658
  | 'tether-snap-release'     // 659
  | 'apex-centrifuge'         // 660
  // ── Series 67: Harmonious Friction ───────────────────────────
  | 'black-ice-grip'          // 661
  | 'brake-caliper-stop'      // 662
  | 'grindstone-edge'         // 663
  | 'ignition-spark-strike'   // 664
  | 'meshed-gears-lock'       // 665
  | 'traction-loss-grit'      // 666
  | 'cleaving-wedge-break'    // 667
  | 'sounding-board-ricochet' // 668
  | 'micro-adjustment-steer'  // 669
  | 'apex-carve-slalom'       // 670
  // ── Series 68: Counter-Balance ───────────────────────────────
  | 'pendulum-dampener'       // 671
  | 'counter-steer-skid'      // 672
  | 'ballast-drop-gravity'    // 673
  | 'micro-weight-calibrate'  // 674
  | 'slackline-balance'       // 675
  | 'outrigger-expand'        // 676
  | 'phase-cancellation-wave' // 677
  | 'delayed-shift-wait'      // 678
  | 'tension-strut-tensegrity' // 679
  | 'apex-equilibrium'        // 680
  // ── Series 69: Minimum Effective Dose ────────────────────────
  | 'archimedes-lever'        // 681
  | 'one-pixel-tap'           // 682
  | 'lead-domino-cascade'     // 683
  | 'resonant-frequency-shatter' // 684
  | 'unfilled-space-silence'  // 685
  | 'keystone-removal'        // 686
  | 'boiling-point-degree'    // 687
  | 'acupuncture-needle'      // 688
  | 'trim-tab-correction'     // 689
  | 'apex-economy'            // 690
  // ── Series 70: Wu Wei Master ─────────────────────────────────
  | 'muddy-water-settle'      // 691
  | 'chinese-finger-trap'     // 692
  | 'unfed-fire-starve'       // 693
  | 'mutual-annihilation'     // 694
  | 'false-alarm-ignore'      // 695
  | 'permeable-membrane'      // 696
  | 'tangled-knot-slack'      // 697
  | 'vacuum-pull-magnetism'   // 698
  | 'ghost-node-disidentify'  // 699
  | 'apex-wu-wei';            // 700

// =====================================================================
// 3. RENDER MODE
// =====================================================================
// How the atom draws itself. Determines which hosting strategy
// the composition layer uses (SVG overflow, canvas DPR, GL context, etc.)

export type RenderMode =
  | 'svg'     // SVG viewBox — path generation, bezier curves, organic growth
  | 'canvas'  // Canvas 2D — particle systems, per-frame physics, fluid
  | 'webgl'   // WebGL — shaders, 3D, displacement maps, fractal loops
  | 'dom'     // DOM + CSS — text manipulation, blur, blend modes, erasure
  | 'audio';  // Web Audio API — oscillators, granular synthesis, spatial

// =====================================================================
// 4. INTERACTION SURFACES
// =====================================================================
// What gesture vocabulary the atom responds to.

export type InteractionSurface =
  | 'tappable'            // Discrete taps
  | 'holdable'            // Sustained press (duration-sensitive)
  | 'draggable'           // Positional drag
  | 'drawable'            // Freeform path drawing
  | 'typeable'            // Keyboard input
  | 'breathable'          // Coupled to breath engine
  | 'swipeable'           // Directional swipe
  | 'observable'          // Time-based progression, no input
  | 'pinchable'           // Scale gesture (zoom/fractal)
  | 'pressure-sensitive'  // Force touch / sustained press intensity
  | 'gyroscopic'          // Device tilt/orientation
  | 'voice'               // Microphone input (humming, tone)
  | 'scrubable';          // Timeline scrubbing (slider-like continuous)

// =====================================================================
// 4b. HAPTIC EVENT IDS (local mirror)
// =====================================================================
// Local typed union mirroring the 12 canonical haptic events from
// haptic-tokens.ts. Defined here so the atom library stays self-contained
// (zero imports from design-system) while maintaining type safety.
// The composition layer maps these to the real HapticEvent at runtime.

export type AtomHapticEventId =
  | 'tap'
  | 'hold_start'
  | 'hold_threshold'
  | 'hold_release'
  | 'drag_snap'
  | 'swipe_commit'
  | 'step_advance'
  | 'completion'
  | 'seal_stamp'
  | 'breath_peak'
  | 'entrance_land'
  | 'error_boundary';

// =====================================================================
// 5. ATOM SCALE
// =====================================================================
// How much of the viewport the atom's primary element claims.
// The atom always fills the full viewport — this describes its
// visual weight within that space.

export type AtomScale =
  | 'point'     // 2–8vw  — dots, signal points, cursors
  | 'element'   // 10–20vw — icons, small shapes, nodes
  | 'focus'     // 25–45vw — primary focal objects
  | 'field'     // 60–80vw — distributed elements, particle fields
  | 'full';     // 100vw   — total viewport immersion

// =====================================================================
// 5b. EXIT TRIGGER TYPE
// =====================================================================
// HOW a scene exits. Determines whether the atom's own completion
// sequence drives the transition, or whether the scene needs an
// explicit CTA button.
//
//   'in-atom-action'  — The atom has a resolution arc. The user completes
//                        an interaction sequence, the atom fires onResolve(),
//                        and the orchestrator listens for that signal to
//                        trigger the exit transition.
//
//   'scene-cta'       — The atom has no inherent completion. It's a
//                        continuous / observable / open-ended experience.
//                        The scene must present a CTA button to allow
//                        the user to advance.

export type ExitTriggerType = 'in-atom-action' | 'scene-cta';

// =====================================================================
// 6. ATOM LIFECYCLE PHASE
// =====================================================================
// Where in the narrative arc the atom currently sits.
// Driven by the NaviCue orchestrator, not by the atom itself.

export type AtomPhase =
  | 'enter'    // Entrance choreography — first contact
  | 'active'   // Main interactive state — the therapeutic work
  | 'resolve'; // Resolution state — integration, completion, seal

// =====================================================================
// 7. DEVICE REQUIREMENTS
// =====================================================================
// Which hardware APIs the atom needs beyond standard touch.

export type DeviceRequirement =
  | 'haptics'      // CoreHaptics / Vibration API
  | 'gyroscope'    // DeviceOrientation API
  | 'camera'       // Gaze tracking / video feed
  | 'pressure'     // Force Touch / 3D Touch
  | 'microphone'   // Web Audio input (humming)
  | 'audio-output'; // Speakers (binaural, isochronic)

// =====================================================================
// 8. ATOM PROPS — the universal component contract
// =====================================================================
// Every atom component receives exactly this interface.
// The composition layer resolves everything before passing it in.

export interface AtomProps {
  // ─ Environment (from composition pipeline) ──────────────
  /** 0–1 normalised breath amplitude from the breath engine */
  breathAmplitude: number;
  /** When true, disable ALL animation including repeat:Infinity */
  reducedMotion: boolean;
  /** Primary color from the color story pipeline */
  color: string;
  /** Secondary/accent color from the color story pipeline */
  accentColor: string;
  /** Viewport dimensions — the atom fills this space edge-to-edge */
  viewport: { width: number; height: number };

  // ── Lifecycle (from NaviCue orchestration) ───────────────
  /** Current phase in the narrative arc */
  phase: AtomPhase;

  // ── Composition mode ──────────────────────────────────────
  /**
   * When true, the atom is being rendered inside the NaviCue Compositor.
   * The atom MUST suppress:
   *   - Layer 2 concerns: atmosphere glow / radial background
   *   - Layer 7 concerns: decorative text labels
   *   - Layer 5 concerns: self-managed entrance/exit timing
   * These are handled by the compositor's own layers.
   * When false or undefined, the atom renders standalone (design center mode).
   */
  composed?: boolean;

  // ── Output callbacks ─────────────────────────────────────
  /** Fire a haptic event — atom never imports haptics directly */
  onHaptic: (event: AtomHapticEventId) => void;
  /** Report internal state change to the orchestrator (0–1 normalised) */
  onStateChange?: (state: number) => void;
  /** Signal that the atom has reached therapeutic resolution */
  onResolve?: () => void;
}

// =====================================================================
// 9. ATOM METADATA — the registry entry for each atom
// =====================================================================
// This is the blueprint, NOT the component. It describes what the
// atom IS so the composition layer can make intelligent decisions.

export interface AtomMeta {
  /** Unique atom ID */
  id: AtomId;
  /** Global number 1–100 */
  number: number;
  /** Which series this atom belongs to */
  series: SeriesId;
  /** Position within its series (1–10) */
  seriesPosition: number;
  /** Human name — e.g. 'The Chrono-Kinetic Engine' */
  name: string;
  /** Therapeutic intent — WHY this atom exists */
  intent: string;
  /** Physics description — the interaction paradigm */
  physics: string;

  // ── Rendering contract ──────────────────────────────────
  /** How the atom draws itself */
  renderMode: RenderMode;
  /** Visual weight within the viewport */
  defaultScale: AtomScale;

  // ── Interaction contract ────────────────────────────────
  /** What gestures the atom responds to */
  surfaces: readonly InteractionSurface[];
  /** Which of the 12 haptic events this atom fires */
  hapticEvents: readonly AtomHapticEventId[];
  /** Human description of the haptic signature */
  hapticSignature: string;

  // ── Behavioral contract ─────────────────────────────────
  /** Internal state range [min, max] */
  stateRange: readonly [number, number];
  /** Whether state is continuous (analog) or discrete (steps) */
  continuous: boolean;
  /** Whether the atom reaches a therapeutic resolution */
  hasResolution: boolean;
  /** How breath couples: drives = primary input, modulates = secondary, none = decorative */
  breathCoupling: 'drives' | 'modulates' | 'none';

  // ── Hardware requirements ───────────────────────────────
  /** Which device APIs beyond touch are needed */
  deviceRequirements: readonly DeviceRequirement[];

  // ── Implementations (named variants within the engine) ──
  /** Named interaction variants described in the blueprints */
  implementations: readonly string[];

  // ── Build status ────────────────────────────────────────
  /** Whether this atom has a built component yet */
  status: 'designed' | 'building' | 'complete';
}

// =====================================================================
// 10. SERIES METADATA
// =====================================================================

export interface SeriesMeta {
  /** Unique series ID */
  id: SeriesId;
  /** Series number 1–10 */
  number: number;
  /** Human name — e.g. 'The Physics Engines' */
  name: string;
  /** Subtitle — e.g. 'Base Mechanics' */
  subtitle: string;
  /** Therapeutic domain this series covers */
  domain: string;
  /** Core physics/interaction paradigm */
  physicsParadigm: string;
  /** Series signature color */
  colorIdentity: string;
  /** Global atom number range */
  atomRange: readonly [number, number];
}
