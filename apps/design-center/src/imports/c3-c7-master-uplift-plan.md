# Collections 3 & 7 — Master Uplift Plan v2
## "Every Atom an Instrument" — Apple-Grade+ Next-Gen Quality

---

## The Quality Gap: Honest Assessment

| Reference | Lines/Atom | Visual Layers | Gradient Stops | Innovation |
|-----------|-----------|---------------|----------------|------------|
| **C1 Equilibrium** (atom 9) | **530** | **8** (glass, refraction, specular x2, shadow, calibration, bubble, halo) | **4–5 per gradient** | Micro-noise breath-steadying, liquid refraction |
| **S39 Heavy Flywheel** (atom 381) | **421** | **7** (shadow, perpetual glow, rim, particles, spokes, hub, blur) | **3–4** | Mass inertia, grinding sparks, speed blur |
| **S38 Magnetic Pull** (atom 377) | **448** | **7** (field, sensing-radius, truth-glow, magnet-trail, snap-burst, orbit, constellation) | **3–4** | 80-node field, polarity matching, orbit mechanics |
| **S30 Altar** (rewrite) | **~340** | **5** | **2–3** | Combustion, ember physics |
| **S25 Tensegrity** (rewrite) | **~270** | **4–5** | **2–3** | Spring-strut network |
| **S22 Raw Data** (current) | **~172** | **2** | **1–2** | Basic bokeh |
| **S66 Vortex Core** (current) | **~86** | **1–2** | **1** | Minimal |

### The Verdict
The S25–S30 and S69–S70 rewrites are at **~65% of the C1/S38 benchmark**. They fulfill the contract checklist but lack the *visual depth*, *rendering richness*, and *physics nuance* that make C1 and S38 feel like real instruments. To be apple-grade+, every atom needs to be an **instrument you want to stare at**.

---

## The Platinum Contract (supersedes Gold Standard)

Everything from the Gold Standard, PLUS:

1. **7–8 rendering layers minimum** — shadow beneath, back-glow field, body with multi-stop gradient, detail overlay, specular/highlight, atmospheric haze, progress indicator, completion bloom
2. **4–5 stops per radial gradient** — no 2-stop gradients for hero elements; body gradients need inner core, mid-tone, falloff, edge, and transparent
3. **Specular highlights** on every solid element — small bright spot + secondary reflection ellipse (see C1 Equilibrium bubble)
4. **Glass/surface refraction** where appropriate — subtle light displacement opposite to moving elements
5. **Extracted helper functions** — complex geometry/physics in named functions above the component
6. **Documented interfaces** for ALL state types — not anonymous inline objects
7. **Section separators** — `═══` or `────` formatting between render passes
8. **Breath coupling depth** — breath should affect 2–3 visual parameters (not just scale): glow intensity, particle drift speed, gradient color warmth
9. **Particle counts 60–200** where applicable — dense fields that feel alive
10. **Physics constant JSDoc comments** — every constant has a `/** description */` comment
11. **400–550 lines per atom** — no shortcuts
12. **Signature rendering technique** — each series has ONE technique used nowhere else in the platform

---

## Innovation Technique Vault

### Tier 1: Unused Rendering Techniques (assign to series)
These are rendering approaches NOT yet used anywhere in the platform:

| Technique | Description | Best For |
|-----------|-------------|----------|
| **Signed Distance Fields** | Soft procedural shapes that blend/morph smoothly | Shape transformation, identity |
| **Voronoi Tessellation** | Cell-based patterns that fragment/reform | Deconstruction, analysis |
| **Perlin/Simplex Noise Fields** | Organic flowing landscapes, terrain | Dissolution, emergence |
| **Metaball Rendering** | Implicit surfaces that merge/split like liquid mercury | Fusion, separation |
| **Dot Matrix / LED Display** | Retro grid rendering with addressable pixels | Data, information, override |
| **Topographic Contour Lines** | Elevation maps that reshape with interaction | Depth, layers, interoception |
| **Circuit Board Traces** | Electronic pathways that energize sequentially | Connection, network, flow |
| **Caustic Light Patterns** | Light refraction through water surface | Fluidity, clarity, perception |
| **Cellular Automata** | Conway's Life, rule-based emergent patterns | Emergence, network, indra |
| **Holographic Diffraction** | Rainbow interference, angle-dependent color | Multiple perspectives, play |
| **Phase Portrait Flow Fields** | Dynamical systems as 2D vector flow | Equilibrium, balance, momentum |
| **Acoustic Chladni Patterns** | Sand organizing from frequency vibration | Resonance, somatic, anchor |
| **Gravitational Lensing** | Light bending around massive objects | Perception, weight, gravity |
| **Fabric/Cloth Simulation** | Draping, tearing, wind interaction | Release, impermanence, letting go |
| **Smoke/Fog Advection** | Volumetric density that drifts and dissipates | Wu wei, non-action, settling |
| **Interference Fringes** | Double-slit experiment visible patterns | Duality, wave-particle, dialectic |
| **Crystal Growth** | Nucleation, dendritic branching from seed | Emergence, patience, growth |
| **Seismograph Traces** | Real-time waveform with scrolling time axis | Monitoring, awareness, tremor |
| **Magnetic Field Iron Filings** | Field line visualization with thousands of particles | Force, polarity, suspension |
| **Parallax Depth Layers** | Multi-layer depth with pointer-driven parallax | Observer, metacognition, mirror |

### Tier 2: Elevation Techniques (add to existing atoms)
These enhance any atom to platinum level:

- **Fresnel glow edges** — rim light that intensifies at glancing angles
- **Volumetric light shafts** — god rays through openings
- **Heat shimmer distortion** — wavy displacement for hot/energized zones
- **Chromatic fringing** — subtle RGB split at high-energy edges
- **Depth-of-field blur** — sharp center, soft periphery
- **Motion smear** — directional blur on fast-moving elements
- **Subsurface scattering** — light passing through translucent surfaces
- **Film grain** — subtle noise texture for organic feel
- **Vignetting** — darkened edges focusing attention to center

---

## COLLECTION 3: THE TRANSCENDENT WITNESS (S21–S30)

### S21 — Metacognitive Mirror · 10 atoms · Currently ~292 avg
**Status:** Best C3 series. Needs polish, not rewrite.
**Target:** 380–450 lines/atom
**Current gaps:** Raw fractions instead of SIZE tokens, no lerpColor transitions, no progress rings, some atoms lack STROKE/GLOW tokens

**Signature technique: PARALLAX DEPTH LAYERS**
Each atom renders 3–4 depth planes that shift with pointer position. The observer IS the parallax — you can't look without moving the layers. This mechanically teaches metacognition: watching changes what you see.

**Per-atom innovation:**
| Atom | ID | Upgrade Focus |
|------|----|--------------|
| 201 | `echomaker` | Add echo-trail depth planes, parallax between echo layers |
| 202 | `glass-wall` | Frosted glass with real Fresnel edges, refraction displacement |
| 203 | `theater-lens` | Iris aperture with depth-of-field blur on non-focal elements |
| 204 | `traffic-observer` | Moving elements in 3 parallax lanes, observer stillness glow |
| 205 | `sky-and-clouds` | Volumetric cloud layers with depth separation, parallax sky |
| 206 | `holographic-parallax` | Full holographic diffraction rainbow at pointer angle |
| 207 | `focal-glass` | Lens caustic patterns from focused light, refraction rings |
| 208 | `syntactic-severance` | Text-like particles dissolving through depth planes |
| 209 | `empty-boat` | Boat on parallax water layers, ripple refraction |
| 210 | `observer-seal` | All depth planes collapsing to single point of awareness |

**Work estimate:** ~10 atoms × 100 lines added = ~1,000 new lines

---

### S22 — Predictive Override · 10 atoms · Currently ~172 avg
**Status:** Intermediate. Needs major elevation.
**Target:** 400–480 lines/atom
**Current gaps:** Tiny elements (0.03–0.08), no shadow/glow layers, no reduced motion, no haptics, no progress

**Signature technique: DOT MATRIX / LED DISPLAY RENDERING**
The perceptual override series strips labels from reality. Render sensory data as raw LED dot-matrix grids — the brain's "display" before meaning is applied. Elements dissolve from recognizable shapes into raw luminous pixel grids. This is the visual language of "raw data before interpretation."

**Per-atom innovation:**
| Atom | ID | Technique |
|------|----|-----------|
| 211 | `semantic-stripping` | Recognizable shape dissolving into LED dot grid |
| 212 | `raw-data` | Progressive bokeh with dot-matrix quantization |
| 213 | `taste-explode` | Flavor particles as colored LED bursts, synesthesia rendering |
| 214 | `texture-touch` | Surface texture as dense dot-matrix height map |
| 215 | `acoustic-unnaming` | Sound wave as scrolling LED spectrogram |
| 216 | `color-deconstruct` | RGB channel separation, chromatic aberration |
| 217 | `somatic-trust` | Body silhouette as heat-mapped LED grid |
| 218 | `wabi-sabi` | Perfect geometry corrupting into beautiful imperfect LED noise |
| 219 | `tabula-rasa` | Full LED screen clearing to blank luminous slate |
| 220 | `perception-seal` | All LED elements converging to unified clean signal |

**Work estimate:** ~10 atoms × 280 lines added = ~2,800 new lines

---

### S23 — Fluidity Mechanics · 10 atoms · Currently ~145 avg
**Status:** Functional but tiny. Needs major elevation.
**Target:** 400–480 lines/atom
**Current gaps:** Same as S22 — undersized, no visual depth, no progress/haptics

**Signature technique: METABALL / IMPLICIT SURFACE RENDERING**
Fluid mechanics demand liquid-looking rendering. Metaballs (implicit surfaces) create that mercury/water-droplet aesthetic where blobs merge and split seamlessly. Each atom renders 20–40 metaballs that combine into organic flowing shapes.

**Per-atom innovation:**
| Atom | ID | Technique |
|------|----|-----------|
| 221 | `identity-fluidity` | Rigid geometric shape melting into metaball fluid |
| 222 | `water-mode` | 50 metaball particles flowing around obstacles |
| 223 | `thawing` | Ice crystal structure melting into liquid metaballs |
| 224 | `proteus` | Shape-shifting metaball mass cycling through forms |
| 225 | `ocean-depth` | Pressure-responsive metaball layers at different depths |
| 226 | `binary-breaker` | Sharp binary grid dissolving into organic metaball flow |
| 227 | `wu-wei` | Metaballs that only move when you DON'T interact |
| 228 | `complexity-breath` | Metaball count pulsing with breath amplitude |
| 229 | `harmonic-synthesis` | Multiple metaball frequencies combining into standing wave |
| 230 | `shifter-seal` | All metaballs merging into one perfect sphere |

**Work estimate:** ~10 atoms × 300 lines added = ~3,000 new lines

---

### S24 — Net of Indra · 10 atoms · Currently ~95 avg
**Status:** Skeletal stubs. Full rewrite.
**Target:** 420–520 lines/atom
**Current gaps:** Everything.

**Signature technique: CELLULAR AUTOMATA + REACTION-DIFFUSION**
Indra's net is about interconnection — every node reflects every other. Cellular automata (Conway's Life, Wolfram rules) create emergent complexity from simple rules. Combined with reaction-diffusion for organic Turing patterns, this creates the visual language of "everything connected."

**Per-atom innovation:**
| Atom | ID | Technique |
|------|----|-----------|
| 231 | `indra-node` | Reaction-diffusion Turing patterns emerging from seeded node |
| 232 | `butterfly-effect` | Tiny perturbation → exponentially diverging cellular automata trails |
| 233 | `mycelium-network` | L-system branching with bioluminescent pulse propagation |
| 234 | `echo-chamber` | Acoustic ray-tracing: bouncing signals amplify in enclosed space |
| 235 | `gravity-well` | Spacetime grid deformation, geodesic particle paths |
| 236 | `murmuration` | 200+ boid particles with cohesion/separation/alignment |
| 237 | `interference-pattern` | Two-source wave superposition with visible fringes |
| 238 | `mutual-respiration` | Coupled oscillator circles syncing rhythm (Kuramoto model) |
| 239 | `dmn-deactivation` | Perlin noise field dissolving layer by layer to silence |
| 240 | `cosmic-tapestry-seal` | Golden thread weaving all previous patterns into stable fabric |

**Work estimate:** ~10 atoms × 420 lines = ~4,200 new lines (full rewrite)

---

### S25 — Dialectical Engine · 10 atoms · Currently ~260 avg (just rewritten)
**Status:** Recently rewritten but below platinum bar. Needs RE-ELEVATION.
**Target:** 420–520 lines/atom
**Current gaps:** Missing specular highlights, only 2-stop gradients, no glass effects, insufficient particle counts, no section separators, no extracted helpers

**Signature technique: INTERFERENCE FRINGES + SUPERPOSITION**
Dialectics is about opposites coexisting. Interference fringes (double-slit patterns) create visible constructive/destructive zones. Two opposing wave sources create the visual language of "both/and" — bright where they reinforce, dark where they cancel.

**Per-atom re-elevation:**
| Atom | ID | Add |
|------|----|-----|
| 241 | `tensegrity` | +150 lines: glass-like node rendering with specular, Fresnel cable glow, shadow gradients, helper functions |
| 242 | `both-and` | +150 lines: interference fringe field between clouds, 4-stop cloud gradients, specular on fused orb |
| 243 | `zen-koan` | +150 lines: impossible bar rendering with depth overlap illusion improved, trail glow with fresnel edges |
| 244 | `complementary-color` | +150 lines: spectral wheel with real HSL computation per segment, afterimage ghost rendering |
| 245 | `pendulum-arrest` | +130 lines: fulcrum glass surface, pendulum shadow with stretch, energy visualization arc |
| 246 | `magnetic-suspension` | +150 lines: iron filing field line particles (200+), magnetic field density rendering |
| 247 | `acceptance-change` | +130 lines: coil rendering with individual wire highlights, resonance standing wave harmonics |
| 248 | `mobius-strip` | +150 lines: improved 3D projection with z-sorting, surface shading per-face, depth fog |
| 249 | `weight-of-opposites` | +130 lines: gyro ring rendering with thickness/depth, motion blur at speed, wobble-dependent haze |
| 250 | `dialectical-seal` | +150 lines: improved vortex with spiral galaxy arms, yin-yang fill rendering, breath pulse |

**Work estimate:** ~10 atoms × 140 lines added = ~1,400 lines (re-elevation)

---

### S26 — Identity Decoupling · 10 atoms · Currently ~310 avg (recently rewritten)
**Status:** Recently rewritten, closer to gold but needs platinum push.
**Target:** 420–520 lines/atom
**Current gaps:** Similar to S25 — needs deeper visual layers, specular, extracted helpers

**Signature technique: SIGNED DISTANCE FIELD MORPHING**
Identity decoupling is about peeling away layers to find what's underneath. SDFs allow smooth blending between shapes — a mask can morph seamlessly into the face behind it, shells can dissolve from the outside in with mathematically smooth edges.

**Per-atom re-elevation:** Same pattern as S25 — +100–150 lines each adding specular, deeper gradients, SDF edge rendering, shadow depth

**Work estimate:** ~10 atoms × 120 lines added = ~1,200 lines (re-elevation)

---

### S27 — Cosmic Play · 10 atoms · Currently ~330 avg (recently rewritten)
**Status:** Recently rewritten, good baseline.
**Target:** 420–520 lines/atom

**Signature technique: HOLOGRAPHIC DIFFRACTION + GENERATIVE ART**
Play is about multiple perspectives simultaneously. Holographic diffraction creates angle-dependent rainbow color — the same object looks different from different viewpoints. Combined with generative art (kaleidoscope, fractal), this is the visual language of "nothing is fixed."

**Per-atom re-elevation:** +100–150 lines each

**Work estimate:** ~10 atoms × 110 lines = ~1,100 lines

---

### S28 — Impermanence Engine · 10 atoms · Currently ~320 avg (recently rewritten)
**Status:** Recently rewritten.
**Target:** 420–520 lines/atom

**Signature technique: FABRIC/CLOTH SIMULATION + ENTROPY RENDERING**
Impermanence is about things falling apart beautifully. Cloth simulation creates visible draping, tearing, wind effects. Combined with entropy rendering (ordered → disordered progression), this teaches that decay can be beautiful.

**Per-atom re-elevation:** +100–130 lines each

**Work estimate:** ~10 atoms × 110 lines = ~1,100 lines

---

### S29 — Interoceptive Anchor · 10 atoms · Currently ~310 avg (recently rewritten)
**Status:** Recently rewritten.
**Target:** 420–520 lines/atom

**Signature technique: TOPOGRAPHIC CONTOUR + CHLADNI PATTERNS**
Interoception is about feeling the body's inner landscape. Topographic contour lines create the visual language of "inner terrain" — elevation maps of sensation. Chladni patterns (sand organizing from vibration) create visible resonance — the body as vibrating instrument.

**Per-atom re-elevation:** +100–130 lines each

**Work estimate:** ~10 atoms × 110 lines = ~1,100 lines

---

### S30 — Loving Awareness · 10 atoms · Currently ~340 avg (recently rewritten)
**Status:** Recently rewritten. CAPSTONE — needs to be the most emotionally powerful C3 series.
**Target:** 450–550 lines/atom (highest C3 target)

**Signature technique: VOLUMETRIC LIGHT + SACRED GEOMETRY EMANATION**
Love/awareness is radiant light. Volumetric light shafts (god rays) through sacred geometric openings. Every atom should feel like standing in a cathedral with light streaming through stained glass. The geometry IS the light.

**Per-atom re-elevation:** +120–180 lines each
**Special:** `atlas-omega` (atom 300) must be 500+ lines — the C3 finale deserves the most elaborate rendering in the collection. Galaxy spiral with 300 orbiting lights converging to heartbeat.

**Work estimate:** ~10 atoms × 150 lines = ~1,500 lines

---

## COLLECTION 7: THE FLUID TACTICIAN (S61–S70)

### S61 — Aikido Redirect · ✅ DONE (Gold Standard Reference)
No work needed. But note: even S61 is below the platinum bar. Consider future re-elevation.

---

### S62 — Bezier Curve · 10 atoms · Currently ~210 avg
**Status:** Intermediate. Decent physics, needs visual depth.
**Target:** 420–500 lines/atom

**Signature technique: PHASE PORTRAIT FLOW FIELDS**
Bezier curves are about smooth mathematical paths through space. Phase portraits visualize dynamical systems as 2D flow fields — every point in space has a velocity vector. Render the Bezier's tangent/normal/curvature as visible flow lines. The user sees not just the path but the entire mathematical force field that shapes it.

**Per-atom innovation:**
| Atom | ID | Technique |
|------|----|-----------|
| 611 | `sharp-corner-handle` | Flow field showing velocity vectors that spike at corner |
| 612 | `tangent-handle-retract` | Tangent lines as visible flow streams |
| 613 | `tension-catenary` | Catenary curve with gravity flow field |
| 614 | `sawtooth-spline` | Jagged phase portrait smoothing to laminar flow |
| 615 | `u-turn-slingshot` | Orbital flow field with slingshot trajectory |
| 616 | `forced-detour-arc` | Obstacle creating flow field bifurcation |
| 617 | `intersection-overpass` | Two flow fields crossing without interference |
| 618 | `asymptote-collision` | Approaching curves with divergent flow field |
| 619 | `binary-fork-merge` | Bifurcation → reunion flow topology |
| 620 | `master-spline-smooth` | All flow fields harmonizing into single laminar stream |

**Work estimate:** ~10 atoms × 230 lines added = ~2,300 lines

---

### S63 — Elastic Yield · 10 atoms · Currently ~206 avg
**Status:** Decent physics. Needs visual depth.
**Target:** 420–500 lines/atom

**Signature technique: STRESS TENSOR VISUALIZATION**
Elastic materials have internal stress distributions. Render stress as color-mapped heat overlays on deforming shapes — cool blue in relaxed zones, hot red at yield points. Von Mises stress contours, Mohr's circle implied. The physics of material science made beautiful.

**Work estimate:** ~10 atoms × 230 lines added = ~2,300 lines

---

### S64 — Momentum Theft · 10 atoms · Currently ~209 avg
**Status:** Decent. Needs depth.
**Target:** 420–500 lines/atom

**Signature technique: KINETIC ENERGY PARTICLE TRAILS**
Momentum transfer should be VISIBLE. Every moving object leaves a velocity-proportional trail of energy particles. When objects collide, the trail transfers — you literally see kinetic energy flowing from one body to another. Color temperature shifts with speed (cool slow → hot fast).

**Work estimate:** ~10 atoms × 220 lines added = ~2,200 lines

---

### S65 — Slipstream · 10 atoms · Currently ~202 avg
**Status:** Consistent intermediate quality.
**Target:** 420–500 lines/atom

**Signature technique: SMOKE/FOG ADVECTION**
Slipstream is about flow dynamics. Smoke advection creates visible fluid dynamics — streamlines, vortex sheets, turbulent eddies. Render the invisible airflow as visible smoke particles being advected by the velocity field. 200+ particles being carried by the flow.

**Work estimate:** ~10 atoms × 240 lines added = ~2,400 lines

---

### S66 — Centrifuge · 10 atoms · Currently ~178 avg (variable)
**Status:** Mixed quality. 3–4 skeletal, rest intermediate.
**Target:** 420–500 lines/atom

**Signature technique: MAGNETIC FIELD IRON FILING RENDERING**
Centrifugal force creates radial fields. Render centrifugal/centripetal forces as thousands of tiny "iron filing" particles that align with the force field. 500+ micro-particles showing field direction and intensity through density and alignment. The invisible force becomes a visible texture.

**Work estimate:** ~10 atoms × 270 lines added = ~2,700 lines (4 near-rewrites + 6 elevations)

---

### S67 — Harmonious Friction · 10 atoms · Currently ~183 avg
**Status:** Intermediate. Consistent.
**Target:** 420–500 lines/atom

**Signature technique: HEAT SHIMMER + SURFACE TEXTURE DENSITY**
Friction creates heat. Heat shimmers — wavy displacement of light above hot surfaces. Render friction interfaces with visible heat haze, increasing surface texture density at contact points, glowing contact patches. The user SEES the friction as thermal energy.

**Work estimate:** ~10 atoms × 250 lines added = ~2,500 lines

---

### S68 — Counter-Balance · 10 atoms · Currently ~126 avg (variable)
**Status:** Highly variable. 4 skeletal, 6 intermediate.
**Target:** 420–500 lines/atom

**Signature technique: CRYSTAL GROWTH + EQUILIBRIUM RENDERING**
Balance is about finding the crystallization point — the exact state where forces cancel. Render equilibrium as crystal-like geometric perfection that grows/decays based on how close to balance. Dendritic branching appears when balanced, dissolves when not. The structure IS the balance.

**Work estimate:** ~10 atoms × 300 lines added = ~3,000 lines (4 near-rewrites + 6 elevations)

---

### S69 — Minimum Effective Dose · 10 atoms · Currently ~320 avg (recently rewritten)
**Status:** Recently rewritten, good baseline.
**Target:** 420–520 lines/atom

**Signature technique: CASCADE AMPLIFICATION WITH EXPONENTIAL SCALING**
MED is about tiny inputs creating massive outputs. Every atom should start with a microscopic element and end with viewport-filling results. Render the amplification chain as a visible exponential curve — each step visually larger than the last. The cascade IS the physics lesson.

**Per-atom re-elevation:** +100–150 lines each

**Work estimate:** ~10 atoms × 120 lines = ~1,200 lines

---

### S70 — Wu Wei Master · 10 atoms · Currently ~350 avg (recently rewritten)
**Status:** Recently rewritten. CAPSTONE — platform's atom #700.
**Target:** 450–550 lines/atom (highest C7 target)

**Signature technique: SMOKE/VOID ADVECTION + PATIENCE RENDERING**
Wu Wei is non-action. The rendering itself should embody WAITING. Smoke that settles only when untouched. Turbulent particles that self-organize through passive physics. Time-based rendering where patience IS the interaction. The absence of input is the most powerful force.

**Per-atom re-elevation:** +100–150 lines each
**Special:** `apex-wu-wei` (atom 700) must be 550+ lines — the PLATFORM CAPSTONE. 80+ threat particles with wave behavior, near-miss spark trails, dramatic silence reveal, sovereignty seal with breath-coupled eternal pulse.

**Work estimate:** ~10 atoms × 130 lines = ~1,300 lines

---

## Work Summary v2 (Platinum Standard)

| Category | Series | Atoms | Avg Lines to Add | Total New Lines |
|----------|--------|-------|-------------------|-----------------|
| **Re-elevate** (recent rewrites → platinum) | S25–S30, S69–S70 | 80 | ~120 | ~9,600 |
| **Major elevation** (intermediate → platinum) | S22–S23, S62–S68 | 90 | ~250 | ~22,200 |
| **Polish** (good → platinum) | S21 | 10 | ~100 | ~1,000 |
| **Full rewrite** (skeletal → platinum) | S24 | 10 | ~420 | ~4,200 |
| **TOTAL** | 20 series | **190 atoms** | — | **~37,000 lines** |

(S61 excluded as done; S38–S40 excluded as original benchmark)

---

## Execution Strategy: Maximum Impact Order

### Wave 1: CAPSTONES — Define the Ceiling
1. **`atlas-omega`** (atom 300) — C3 finale. 500+ lines. Galaxy convergence.
2. **`apex-wu-wei`** (atom 700) — Platform finale. 550+ lines. Non-action symphony.
3. **`observer-seal`** (atom 210) — S21 seal. Parallax depth collapse.
4. **`master-spline-smooth`** (atom 620) — S62 seal. All flow fields unified.

*Why:* Capstones define the ceiling. Build the best first, then every other atom knows what it's reaching for.

### Wave 2: FULL REWRITES — S24 Net of Indra
5. **S24** (10 atoms) — Last Tier A series. Cellular automata + reaction-diffusion.

*Why:* S24 is the last fully skeletal C3 series. Completing it means ALL of C3 has at least a first-pass rewrite.

### Wave 3: RE-ELEVATE Recent Rewrites (S25–S30)
6. **S30** re-elevation (10 atoms) — Capstone series, emotional apex
7. **S29** re-elevation (10 atoms) — Chladni/topographic upgrade
8. **S28** re-elevation (10 atoms) — Cloth/entropy upgrade
9. **S27** re-elevation (10 atoms) — Holographic upgrade
10. **S26** re-elevation (10 atoms) — SDF morphing upgrade
11. **S25** re-elevation (10 atoms) — Interference fringe upgrade

*Why:* These are closest to done. 100–150 lines each pushes them to platinum.

### Wave 4: RE-ELEVATE C7 Recent Rewrites
12. **S70** re-elevation (10 atoms) — Platform capstone series
13. **S69** re-elevation (10 atoms) — Cascade amplification upgrade

### Wave 5: MAJOR ELEVATIONS — C7 Tier B
14. **S62** Bezier Curve — Phase portrait flow fields
15. **S63** Elastic Yield — Stress tensor visualization
16. **S64** Momentum Theft — Kinetic energy trails
17. **S65** Slipstream — Smoke advection
18. **S66** Centrifuge — Iron filing fields
19. **S67** Harmonious Friction — Heat shimmer
20. **S68** Counter-Balance — Crystal growth equilibrium

*Why:* These are C7's bread-and-butter. 70 atoms that define the collection's feel.

### Wave 6: MAJOR ELEVATIONS — C3 Tier B
21. **S22** Predictive Override — Dot matrix rendering
22. **S23** Fluidity Mechanics — Metaball rendering

### Wave 7: POLISH — S21
23. **S21** Metacognitive Mirror — Parallax depth + token upgrade

---

## Signature Technique Registry (No Duplicates)

| Series | Signature Technique | Visual Language |
|--------|-------------------|-----------------|
| S21 | Parallax depth layers | Observer perspective |
| S22 | Dot matrix / LED display | Raw perception data |
| S23 | Metaball implicit surfaces | Fluid identity |
| S24 | Cellular automata + reaction-diffusion | Interconnected emergence |
| S25 | Interference fringes + superposition | Dialectical coexistence |
| S26 | Signed distance field morphing | Identity dissolution |
| S27 | Holographic diffraction | Playful multiple perspectives |
| S28 | Fabric/cloth simulation | Beautiful impermanence |
| S29 | Topographic contours + Chladni patterns | Inner body landscape |
| S30 | Volumetric light + sacred geometry | Radiant love/awareness |
| S62 | Phase portrait flow fields | Mathematical path-shaping |
| S63 | Stress tensor heat mapping | Material yielding |
| S64 | Kinetic energy particle trails | Momentum transfer |
| S65 | Smoke/fog advection | Flow dynamics |
| S66 | Iron filing field density | Centrifugal force fields |
| S67 | Heat shimmer + surface texture | Friction as thermal energy |
| S68 | Crystal growth equilibrium | Balance as crystallization |
| S69 | Exponential cascade scaling | Tiny input → massive output |
| S70 | Void advection + patience rendering | Non-action as power |

*Every series has a unique visual fingerprint. No two will look the same.*

---

## Quality Gates

Before any atom ships:
- [ ] 7+ rendering layers visible in a single frame
- [ ] Hero element uses SIZE.lg (0.32) minimum
- [ ] At least one 4-stop radial gradient
- [ ] Specular highlight on primary solid element
- [ ] Shadow gradient beneath primary element
- [ ] Breath affects 2+ visual parameters
- [ ] 400+ lines of code
- [ ] Extracted helper function for complex geometry
- [ ] Documented interface for state type
- [ ] Section separators between render passes
- [ ] Completion state visually distinct and beautiful on its own
- [ ] Reduced motion state is not just "skip to end" but a beautiful static composition
