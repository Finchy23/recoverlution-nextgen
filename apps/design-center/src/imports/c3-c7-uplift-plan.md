# Collections 3 & 7 — Gold Standard Uplift Plan

## Benchmark Calibration

| Reference Series | Total Lines | Avg/Atom | Quality |
|-----------------|-------------|----------|---------|
| **S38 Magnetic Sieve** | 4,480 | **~448** | Gold standard |
| **S39 Momentum Wheel** | 5,520 | **~552** | Gold standard (highest) |
| **S40 Synthesis Forge** | 3,443 | **~344** | Gold standard (just completed) |
| **S61 Aikido Redirect** | 3,250 | **~325** | Gold standard reference |

**Target: 300–500 lines per atom** with every gold-standard contract upheld.

---

## The Gold Standard Contract (non-negotiable per atom)

1. **Full JSDoc header** — PHYSICS, INTERACTION, RENDER, REDUCED MOTION sections
2. **Named physics constants** — top-level `const` block with meaningful names, 0.15–0.3 range fractions
3. **Hero-sized elements** — `SIZE.md` (0.22) minimum for hero shapes, `SIZE.lg` (0.32) primary, `SIZE.xl` (0.42) hero instruments
4. **Multi-layer rendering** — shadow beneath, glow behind, body, detail overlay, atmospheric haze
5. **`parseColor`/`lerpColor`/`rgba`** — zero hardcoded hex, color interpolation for state transitions
6. **Proper entrance/phase/resolve lifecycle** — `advanceEntrance`, resolve auto-completes gracefully
7. **Reduced motion static fallback** — full static render path with glow and structure
8. **Breath coupling** — where registry specifies `breathCoupling: 'modulates'`
9. **Native `addEventListener`** — zero React synthetic events on canvas
10. **Progress indicator** — ring, bar, or dot-based progress visualization
11. **Step haptics** — `onHaptic` at meaningful physics thresholds
12. **`onStateChange` progress** — 0–0.5 during interaction, 0.5–1.0 during completion
13. **Spark/particle/glow effects** — at transition moments and completion
14. **`composed` flag respected** — skip atmosphere when composed
15. **Viewport-relative sizing** — `minDim * factor` everywhere, zero px literals

---

## COLLECTION 3: THE TRANSCENDENT WITNESS (S21–S30, 100 atoms)

### S21 — Metacognitive Mirror · `~292 avg` → **Tier C (Polish)**
**Current state:** Properly structured, has particle glow, breath, multi-layer rendering. The best C3 series.
**Gap:** Missing `SIZE` token usage (uses raw fractions), some atoms lack `STROKE`/`GLOW` tokens, no `lerpColor` transitions, no progress ring indicators.
**Work:** ~10 atoms, light-touch: swap raw fractions → SIZE tokens, add progress rings, add lerpColor transitions, verify reduced motion paths exist.

### S22 — Predictive Override · `~172 avg` → **Tier B (Major Elevation)**
**Current state:** Has structure and proper boilerplate, but undersized elements, no reduced motion fallback, no multi-layer glow.
**Gap:** Elements at ~0.03–0.08 fraction (should be 0.22+), no shadow/haze layers, no progress indicators, no step haptics, no completion glow pulse.
**Work:** ~10 atoms, each needs hero resizing, shadow layer, glow layer, reduced motion path, progress ring, step haptics.
**Innovation targets:** Perceptual illusion rendering — chromatic aberration for "stripping labels", depth-of-field blur for "raw data", Moiré interference for "semantic stripping".

### S23 — Fluidity Mechanics · `~145 avg` → **Tier B (Major Elevation)**
**Current state:** Functional but small. Has basic physics but tiny elements and no visual richness.
**Gap:** Hero sizing, multi-layer glow, reduced motion, progress indicators, breath coupling.
**Work:** ~10 atoms, same elevation pattern as S22.
**Innovation targets:** Fluid simulation techniques — viscous flow trails, surface tension effects, phase-state transitions (ice→water→steam), non-Newtonian viscosity response.

### S24 — Net of Indra · `~95 avg` → **Tier A (Full Rewrite)**
**Current state:** Compact skeletal stubs. Single-line minified format. ~74–128 lines.
**Gap:** Everything. These are functional sketches, not instruments.
**Work:** ~10 atoms, full rewrite from scratch.
**Innovation targets:**
- `indra-node` (231): **Reaction-diffusion patterns** — Turing patterns emerging from connected nodes
- `mycelium-network` (233): **Branching L-system** with bioluminescent pulse propagation
- `butterfly-effect` (232): **Sensitivity visualization** — tiny perturbation creating exponentially diverging trajectories
- `murmuration` (236): **Boid flocking simulation** — 200+ particles with cohesion/separation/alignment rules
- `interference-pattern` (237): **Wave superposition** — two circular wave sources creating visible constructive/destructive interference
- `echo-chamber` (234): **Acoustic ray-tracing** — sound bouncing off walls, getting louder in enclosed space
- `gravity-well` (235): **Spacetime curvature** — grid deformation around massive body, particles follow geodesics
- `mutual-respiration` (238): **Coupled oscillator** — two breath-sized circles that sync their rhythm
- `dmn-deactivation` (233): **Noise field dissolution** — active Perlin noise that goes silent layer by layer
- `cosmic-tapestry-seal` (240): **Thread weaving** — golden threads connecting all nodes into stable fabric

### S25 — Dialectical Engine · `~96 avg` → **Tier A (Full Rewrite)**
**Current state:** Compact stubs, some slightly longer (dialectical-seal 121, tensegrity 121).
**Gap:** Everything.
**Work:** ~10 atoms, full rewrite.
**Innovation targets:**
- `both-and` (242): **Superposition visualization** — two states existing simultaneously as overlapping probability clouds
- `mobius-strip` (246): **Parametric 3D surface** — projected Möbius strip the user traces, experiencing the one-sided nature
- `tensegrity` (248): **Spring-strut simulation** — floating compression members held by tension network
- `pendulum-arrest` (247): **Coupled pendulum** — two pendulums that exchange energy, user finds the arrest point
- `magnetic-suspension` (245): **Diamagnetic levitation** — object floating in dynamic equilibrium between forces
- `zen-koan` (250): **Paradox physics** — contradictory forces that resolve only when you stop trying
- `weight-of-opposites` (249): **Balance scale** — loading both sides equally creates unexpected upward lift
- `complementary-color` (243): **Afterimage physics** — stare at accent color, release reveals primary in negative space
- `acceptance-change` (241): **Dual-phase material** — simultaneous solid and liquid coexisting
- `dialectical-seal` (250): **Thesis-antithesis spiral** — two orbiting forces that fuse into synthesis

### S26 — Identity Decoupling · `~84 avg` → **Tier A (Full Rewrite)**
**Current state:** Compact stubs, 73–96 lines.
**Gap:** Everything.
**Work:** ~10 atoms, full rewrite.
**Innovation targets:**
- `matryoshka` (253): **Nested shell peeling** — concentric layers that peel away with each tap, revealing smaller true self
- `armor-drop` (251): **Particle armor** — hundreds of particles forming a shell that dramatically cascades off
- `costume-closet` (252): **Mask cycle** — cycling through rendered masks that dissolve on selection
- `resume-burner` (257): **Combustion physics** — text-like particles that catch fire and float as ash
- `time-lapse-mirror` (260): **Trail persistence** — ghost afterimages showing past positions fading over time
- `space-container` (259): **Void expansion** — vast inner space expanding while outer boundary stays fixed
- `nobody` (254): **Subtraction rendering** — elements disappear until only empty luminous space remains
- `predicate-eraser` (255): **Label dissolution** — geometric labels that dissolve at the edges like sugar in water
- `re-entry` (256): **Atmospheric re-entry** — fiery friction on return, protective heat shield
- `soul-seal` (258): **Core light** — all layers stripped, single irreducible bright point remains

### S27 — Cosmic Play · `~88 avg` → **Tier A (Full Rewrite)**
**Current state:** Compact stubs, 70–99 lines.
**Gap:** Everything.
**Work:** ~10 atoms, full rewrite.
**Innovation targets:**
- `sand-mandala` (262): **Radial symmetry generative art** — 8-fold kaleidoscope construction, then wind-scatter
- `juggler` (265): **Projectile physics** — 3–5 balls with parabolic arcs, user taps to keep aloft
- `infinite-canvas` (264): **Fractal zoom** — endless zoom revealing self-similar structure at every scale
- `sisyphus-smile` (268): **Hill physics with joy** — boulder rolls up, rolls down, but the character smiles (glow intensifies each cycle)
- `improvisation` (263): **Generative music visualization** — random but harmonious pattern that the user guides
- `toy-box` (270): **Tumbling physics** — playful rigid bodies bouncing with joy, no stakes
- `stakes-free` (269): **Zero-gravity sandbox** — elements drift freely, no failure state, pure play
- `character-drop` (261): **Puppet string cut** — cut the strings, figure drops to ground, gets up lighter
- `destination-override` (262): **Path hijack** — trajectory suddenly curves to unexpected beautiful destination
- `lila-seal` (270): **Divine play geometry** — sacred geometric pattern that assembles through playful interaction

### S28 — Impermanence Engine · `~85 avg` → **Tier A (Full Rewrite)**
**Current state:** Compact stubs, 75–97 lines.
**Gap:** Everything.
**Work:** ~10 atoms, full rewrite.
**Innovation targets:**
- `kintsugi` (278): **Crack-fill with gold** — large bowl with visible cracks, trace to fill with liquid gold, glow reveals beauty
- `autumn-leaf` (272): **Aerodynamic falling** — leaf with realistic tumble physics and wind
- `wave-decay` (280): **Damped oscillation** — wave amplitude decreasing to stillness (acceptance)
- `metamorphosis` (277): **Morphing geometry** — caterpillar-to-butterfly transformation through intermediate impossible shapes
- `evaporation` (274): **Phase transition** — liquid surface evaporating particle by particle into air
- `sunset` (279): **Atmospheric scattering** — gradient color shift simulating actual Rayleigh scattering
- `ebb-tide` (273): **Tidal simulation** — water level slowly retreating, revealing what was hidden beneath
- `exhale-cycle` (275): **Breath-synchronized decay** — elements release on exhale, synchronized with breathAmplitude
- `open-palm` (278): **Grasp release physics** — clenched particle cluster that opens and particles drift free
- `anicca-seal` (280): **Impermanence mandala** — beautiful structure that gracefully dissolves and reforms endlessly

### S29 — Interoceptive Anchor · `~81 avg` → **Tier A (Full Rewrite)**
**Current state:** Compact stubs, 67–92 lines. Lowest C3 avg after S30.
**Gap:** Everything.
**Work:** ~10 atoms, full rewrite.
**Innovation targets:**
- `respiration-pendulum` (287): **Breath-driven pendulum** — swings with breathAmplitude, damping on exhale
- `plumb-line` (286): **Gravity sensor** — weighted line finding true vertical despite viewport tilt
- `thermal-boundary` (289): **Heat map rendering** — warm/cool zones on body map, user finds the warm center
- `weight-of-world` (290): **Compression spring** — massive weight pressing down, user discovers their own resistance
- `micro-tremor` (285): **Amplified vibration** — tiny tremors made visible as beautiful wave patterns
- `bio-mirror` (282): **Heart rate visualization** — pulsing concentric rings synced to breath
- `cymatic-resonance` (283): **Chladni plate** — sand particles organizing into patterns from frequency
- `focal-collapse` (284): **Depth-of-field** — scattered elements coming into sharp focus at center
- `tectonic-drop` (288): **Geological settling** — heavy mass finding its lowest-energy resting state
- `anchor-seal` (290): **Anchor physics** — heavy anchor dropping through water to find the bedrock

### S30 — Loving Awareness · `~76 avg` → **Tier A (Full Rewrite)** ⚠️ CAPSTONE SERIES
**Current state:** Lowest avg in C3. The CAPSTONE (atlas-omega, atom 300) is only 93 lines. Unacceptable.
**Gap:** Everything. This is the Collection 3 finale — should be the most emotionally powerful.
**Work:** ~10 atoms, full rewrite with extra care for emotional resonance.
**Innovation targets:**
- `atlas-omega` (300): **CAPSTONE** — Galaxy collapse into singularity. 299 orbiting lights converge to one heartbeat pixel. Needs to be 400+ lines with nested glow halos, heartbeat physics, breath coupling, reduced motion showing final state.
- `metta-radiance` (297): **Emanation waves** — lovingkindness as concentric circles radiating outward with increasing warmth
- `infinite-heart` (295): **Fractal heart** — zoom into heart shape reveals infinite nested hearts
- `golden-thread` (293): **Thread of connection** — luminous thread drawn between points, creating constellation of care
- `ocean-drop` (299): **Drop-into-ocean** — single droplet falls into vast ocean, ripples expand to infinity
- `shadow-embrace` (300): **Shadow integration** — dark mirror shape approaches, user embraces it, shadows merge with light
- `i-am` (294): **Subtraction to essence** — everything strips away until only awareness remains (negative-space rendering)
- `karmic-severance` (296): **Thread cutting** — tangled threads to the past, user severs each one, each falls away
- `namaste-lens` (298): **Recognition physics** — two nodes approach, moment of contact reveals inner light in both
- `altar` (291): **Sacred geometry** — mandala/yantra assembly from geometric primitives, each piece placed with intention

---

## COLLECTION 7: THE FLUID TACTICIAN (S61–S70, 100 atoms)

### S61 — Aikido Redirect · `~325 avg` → ✅ **DONE** (Gold Standard Reference)

### S62 — Bezier Curve · `~210 avg` → **Tier B (Major Elevation)**
**Current state:** Has structure, proper boilerplate, ~180–264 lines. Missing hero sizing, multi-layer glow, reduced motion, progress rings.
**Gap:** Undersized elements, no shadow layers, no completion glow, sparse reduced motion.
**Work:** ~10 atoms, each needs ~80–120 lines of additions.
**Innovation targets:** Spline mathematics made visible — control point glow, tangent handle visualization, curvature heat map.

### S63 — Elastic Yield · `~206 avg` → **Tier B (Major Elevation)**
**Current state:** Decent physics, ~174–238 lines.
**Gap:** Similar to S62.
**Work:** ~10 atoms.
**Innovation targets:** Material science rendering — stress visualization (color gradient along strain), elastic limit visualization, spring constant as visible coils.

### S64 — Momentum Theft · `~209 avg` → **Tier B (Major Elevation)**
**Current state:** Decent, ~175–230 lines.
**Gap:** Hero sizing, glow depth, reduced motion.
**Work:** ~10 atoms.
**Innovation targets:** Kinetic energy transfer visualization — velocity vectors as trailing arrows, momentum conservation shown as energy-color transfer between objects.

### S65 — Slipstream · `~202 avg` → **Tier B (Major Elevation)**
**Current state:** Decent, consistent ~186–229 lines.
**Gap:** Hero sizing, multi-layer atmosphere, reduced motion.
**Work:** ~10 atoms.
**Innovation targets:** Fluid dynamics — streamline visualization, Reynolds number shown as turbulence-to-laminar, pressure differential as gradient fields.

### S66 — Centrifuge · `~178 avg` → **Tier B+ (Mixed)**
**Current state:** Mixed quality, 86–216 lines. Some good, some skeletal.
**Gap:** Highly variable. Some need full rewrite, others need elevation.
**Work:** ~10 atoms (3–4 may need full rewrite, rest elevation).
**Innovation targets:** Rotational physics — centripetal force shown as glowing tension lines, angular momentum as visible rotation blur, separation as radial color banding.

### S67 — Harmonious Friction · `~183 avg` → **Tier B (Major Elevation)**
**Current state:** Decent, ~166–205 lines.
**Gap:** Hero sizing, glow depth, reduced motion, progress rings.
**Work:** ~10 atoms.
**Innovation targets:** Contact mechanics — friction heat shown as interface glow, coefficient of friction as surface texture density, traction as visible grip particles.

### S68 — Counter-Balance · `~126 avg` → **Tier B+ (Mixed)**
**Current state:** Varies wildly, 86–182 lines.
**Gap:** 4 atoms near skeletal (86–92 lines), rest intermediate.
**Work:** ~10 atoms (4 need closer to full rewrite, 6 need elevation).
**Innovation targets:** Equilibrium physics — balance point as glowing fulcrum, weight distribution as gradient fills, oscillation damping as decreasing amplitude rings.

### S69 — Minimum Effective Dose · `~52 avg` → **Tier A (Full Rewrite)**
**Current state:** Skeletal stubs, 41–85 lines. Many are 42-line minified stubs.
**Gap:** Everything.
**Work:** ~10 atoms, full rewrite.
**Innovation targets:** (CRITICAL — these atoms are about MINIMAL INPUT, MAXIMAL OUTPUT. The rendering itself should embody this.)
- `one-pixel-tap` (689): **Single tap cascade** — one pixel tap triggers exponential chain reaction filling viewport
- `archimedes-lever` (682): **Lever physics** — tiny force on long arm lifts massive weight on short arm
- `resonant-frequency-shatter` (689): **Glass resonance** — tiny sustained tone shatters massive crystal
- `keystone-removal` (685): **Structural collapse** — remove one small piece, entire arch collapses beautifully
- `lead-domino-cascade` (686): **Domino energy amplification** — tiny domino topples each-larger chain
- `trim-tab-correction` (688): **Tiny rudder, massive ship** — microscopic angle change curves enormous trajectory
- `boiling-point-degree` (684): **Phase transition** — one final degree transforms everything (liquid→gas explosion)
- `acupuncture-needle` (681): **Precision point** — one precise touch point unlocks flow through entire system
- `unfilled-space-silence` (690): **Negative space power** — the ABSENCE of action creates the result
- `apex-economy` (690): **CAPSTONE** — all minimal-input principles combined into one perfect gesture

### S70 — Wu Wei Master · `~44 avg` → **Tier A (Full Rewrite)** ⚠️ CAPSTONE SERIES
**Current state:** Skeletal stubs, 32–59 lines. Atom 700 (apex-wu-wei) is only 59 lines.
**Gap:** Everything. This is the Collection 7 finale AND the entire platform's atom #700.
**Work:** ~10 atoms, full rewrite with philosophical depth.
**Innovation targets:** (CRITICAL — Wu Wei = "effortless action". The physics must teach NON-DOING.)
- `muddy-water-settle` (695): **Turbidity clearing** — stop stirring, particles settle by gravity alone
- `chinese-finger-trap` (692): **Paradox physics** — pulling harder tightens, relaxing releases
- `unfed-fire-starve` (698): **Combustion extinction** — fire that dies when you stop feeding it (don't fight it)
- `tangled-knot-slack` (696): **Knot physics** — tension tightens knot, slack loosens it
- `permeable-membrane` (697): **Osmotic flow** — resistance blocks, permeability allows passage
- `false-alarm-ignore` (693): **Threat habituation** — threats that dissolve when you don't react
- `ghost-node-disidentify` (694): **Attachment release** — node that fades when you stop tracking it
- `vacuum-pull-magnetism` (699): **Void attraction** — empty space creating pull (nature abhors a vacuum)
- `mutual-annihilation` (696): **Particle-antiparticle** — opposing forces that annihilate into pure light when they meet
- `apex-wu-wei` (700): **THE CAPSTONE OF ALL CAPSTONES** — chaos annihilates itself through pure non-action. 30 threats swarm, user does NOTHING for 5 seconds, they self-destruct. The ultimate lesson. Needs 400+ lines with patience timer, escalating visual threat, dramatic self-annihilation cascade, and the most profound completion state in the entire platform.

---

## Work Summary

| Tier | Description | Atom Count | Lines to Write |
|------|-------------|------------|----------------|
| **A** | Full rewrite (skeletal → gold) | **90 atoms** | ~32,000 |
| **B/B+** | Major elevation (intermediate → gold) | **80 atoms** | ~12,000 |
| **C** | Polish (good → gold) | **10 atoms** | ~1,500 |
| ✅ | Already gold standard | **20 atoms** (S38–S40, S61) | 0 |
| **TOTAL** | | **200 atoms** | ~45,500 lines |

### Tier A Breakdown (90 atoms)
- C3: S24 (10) + S25 (10) + S26 (10) + S27 (10) + S28 (10) + S29 (10) + S30 (10) = **70 atoms**
- C7: S69 (10) + S70 (10) = **20 atoms**

### Tier B/B+ Breakdown (80 atoms)
- C3: S22 (10) + S23 (10) = **20 atoms**
- C7: S62 (10) + S63 (10) + S64 (10) + S65 (10) + S66 (10) + S67 (10) + S68 (10) = **70 atoms**
  *(Note: S66 and S68 are B+ — some atoms within need fuller rewrites)*

### Tier C Breakdown (10 atoms)
- C3: S21 (10) = **10 atoms**

---

## Recommended Execution Order

### Phase 1: Capstones First (highest impact)
1. **S30 Loving Awareness** (Tier A) — C3 finale, emotional apex. `atlas-omega` (atom 300) first.
2. **S70 Wu Wei Master** (Tier A) — C7 finale, platform apex. `apex-wu-wei` (atom 700) first.

### Phase 2: Tier A Full Rewrites (skeletal → gold)
3. **S29 Interoceptive Anchor** (Tier A) — somatic depth, breath coupling
4. **S28 Impermanence Engine** (Tier A) — entropy + beauty
5. **S27 Cosmic Play** (Tier A) — playful physics, generative art
6. **S26 Identity Decoupling** (Tier A) — layered peeling, subtraction rendering
7. **S25 Dialectical Engine** (Tier A) — paradox physics, dual-system
8. **S24 Net of Indra** (Tier A) — network science, emergence
9. **S69 Minimum Effective Dose** (Tier A) — economy of gesture

### Phase 3: Tier B Major Elevations
10. **S22 Predictive Override** (Tier B) — perceptual illusion techniques
11. **S23 Fluidity Mechanics** (Tier B) — fluid simulation
12. **S62–S68** (Tier B/B+) — C7 mid-series elevation (70 atoms)

### Phase 4: Tier C Polish
13. **S21 Metacognitive Mirror** (Tier C) — SIZE tokens, progress rings, lerpColor

---

## Innovation Technique Registry (ensuring no two series look the same)

| Series | Primary Technique | Secondary Technique |
|--------|-------------------|---------------------|
| S21 | Observer perspective layers | Parallax depth |
| S22 | Perceptual illusion / afterimage | Chromatic aberration |
| S23 | Fluid dynamics / viscosity | Phase-state transitions |
| S24 | Network graph / reaction-diffusion | Boid flocking |
| S25 | Dual-system paradox physics | Lissajous phase-space |
| S26 | Layer peeling / subtraction | Trail persistence / ghosting |
| S27 | Generative art / kaleidoscope | Rigid-body playground |
| S28 | Entropy / decay simulation | Atmospheric scattering |
| S29 | Somatic body-field mapping | Coupled oscillators |
| S30 | Sacred geometry emanation | Singularity/convergence |
| S62 | Spline mathematics | Control-point visualization |
| S63 | Material stress/strain | Spring-damper chains |
| S64 | Kinetic energy transfer | Velocity vector fields |
| S65 | Streamline fluid dynamics | Pressure gradient fields |
| S66 | Rotational force fields | Angular momentum blur |
| S67 | Contact mechanics / friction heat | Surface texture density |
| S68 | Equilibrium/balance physics | Oscillation damping |
| S69 | Cascade amplification | Threshold phase-transitions |
| S70 | Paradox/non-action physics | Patience-based resolution |
