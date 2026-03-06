# ATOMS 61-100 BUILD BLUEPRINT
## Series 7-10 Implementation Plan

**Date**: 2026-03-01
**Status**: COMPLETED — all 40 atoms built and integrated into series registry
**Scope**: 40 atoms across 4 series (10 each)

---

## 0. REGISTRY CONFLICTS (RESOLVED)

The original `atom-registry.ts` had early-draft entries for S7-S10 that
conflicted with the master blueprint numbering. These were corrected
during the build phase — all renumbering below has been applied.

### Current registry vs. master blueprint:

| Registry ID           | Registry # | Master Blueprint # | Master Name                    | Action     |
|-----------------------|------------|-------------------|--------------------------------|------------|
| `color-grade`         | 61         | 62                | Chromatic Grade Engine         | Renumber   |
| `narrative-flip`      | 62         | 63                | Narrative Flip Engine          | Renumber   |
| `fractal-zoom`        | 71         | 72                | Fractal Zoom Engine            | Renumber   |
| `overview-effect`     | 72         | 71                | Overview Engine                | Renumber   |
| `crucible`            | 81         | 81                | Crucible Engine                | OK         |
| `shadow-hug`          | 82         | 82                | Shadow Hug Engine              | OK         |
| `atmosphere-engineer` | 91         | 91                | Atmosphere Engine              | OK         |
| `infinite-seal`       | 92         | 100               | Infinite/Ouroboros Engine      | Move to 100|

### Resolution strategy:
1. Replace ALL S7-S10 entries in `types.ts` AtomId union with final IDs
2. Replace ALL S7-S10 entries in `atom-registry.ts` with full entries
3. The master blueprint is canonical — no exceptions

---

## 1. ARCHITECTURE CONTRACT

Every atom MUST follow these rules without exception:

### Imports (from `../atom-utils`)
```typescript
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';
```
Additional utils (`easeOutCubic`, `easeSineInOut`, `easeInOutCubic`, `setupCanvas`,
`advanceEntrance`, `ATOM_BG_ALPHA`, `ELEMENT_ALPHA`) imported as needed.

### Prop threading
```typescript
export default function AtomName({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  // propsRef pattern for animation loop access
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => {
    propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor };
  }, [breathAmplitude, reducedMotion, phase, color, accentColor]);
```

### Color system
- `primaryRgb = parseColor(color)` — updated on color change via useEffect
- `accentRgb = parseColor(accentColor)` — same
- ALL palette constants defined as `RGB` tuples at module top
- ALL palette usage goes through `lerpColor(PALETTE_CONST, primaryRgb, 0.01-0.08)`
- Background fill: `rgba(lerpColor(BG, primaryRgb, t), entrance * 0.03)` max

### Entrance system
```typescript
if (s.entranceProgress < 1) {
  const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
  s.entranceProgress = Math.min(1, s.entranceProgress + rate);
}
const ent = easeOutExpo(s.entranceProgress);
```

### Alpha ranges (from ELEMENT_ALPHA tokens)
- Primary elements: `0.04 - 0.12`
- Secondary/atmospheric: `0.01 - 0.06`
- Tertiary/texture: `0.005 - 0.03`
- Text: `0.04 - 0.10`
- Glow: `0.01 - 0.08`

### Canvas setup (DPR-correct)
```typescript
const dpr = window.devicePixelRatio || 1;
const cw = Math.round(w * dpr);
const ch = Math.round(h * dpr);
if (canvas.width !== cw || canvas.height !== ch) {
  canvas.width = cw;  canvas.height = ch;
}
ctx.save();
ctx.scale(dpr, dpr);
ctx.clearRect(0, 0, w, h);
// ... render ...
ctx.restore();
```

### reducedMotion
- Thread through EVERY `Math.sin`, rotation, velocity, particle movement
- `repeat: Infinity` animations → `repeat: reducedMotion ? 0 : Infinity`
- Canvas loops → skip per-frame motion updates, show static final state
- Never remove content — only remove animation

### Web Audio API (S7 audio atoms)
- AudioContext created on first user gesture (tap/click handler)
- Graceful degradation: render visual-only if AudioContext unavailable
- Use `AudioContext.currentTime` for scheduling
- Clean up all audio nodes on unmount

### Render mode
- ALL 40 atoms render to Canvas 2D (no WebGL/Three.js/konva)
- 3D effects simulated via perspective math on 2D canvas
- Fractal rendering via progressive per-frame pixel computation
- "Physics engine" = manual velocity/gravity/friction in state

---

## 2. FILE STRUCTURE

```
/src/app/components/atoms/
  series-7-retro-causal/
    audio-rescore.tsx          # 61
    chromatic-grade.tsx        # 62
    narrative-flip.tsx         # 63
    splicing-timeline.tsx      # 64
    prequel-context.tsx        # 65
    metadata-rewrite.tsx       # 66
    forgiveness-filter.tsx     # 67
    ancestral-cut.tsx          # 68
    time-travel-rescue.tsx     # 69
    third-person-shift.tsx     # 70
  series-8-kinematic-topology/
    overview-effect.tsx        # 71
    fractal-zoom.tsx           # 72
    deep-time.tsx              # 73
    systemic-zoom.tsx          # 74
    ego-zoom.tsx               # 75
    micro-step.tsx             # 76
    vastness-expansion.tsx     # 77
    horizon-infinite.tsx       # 78
    stardust-dissolve.tsx      # 79
    holographic-drop.tsx       # 80
  series-9-shadow-crucible/
    crucible-fire.tsx          # 81
    shadow-hug.tsx             # 82
    projection-mirror.tsx      # 83
    solve-coagula.tsx          # 84
    paradox-tension.tsx        # 85
    monster-taming.tsx         # 86
    shame-compass.tsx          # 87
    anger-forge.tsx            # 88
    inner-child.tsx            # 89
    phoenix-ash.tsx            # 90
  series-10-reality-bender/
    atmosphere-weather.tsx     # 91
    distortion-grid.tsx        # 92
    belief-bridge.tsx          # 93
    future-memory.tsx          # 94
    luck-surface.tsx           # 95
    possibility-prism.tsx      # 96
    architect-stone.tsx        # 97
    narrative-override.tsx     # 98
    pure-yes.tsx               # 99
    infinite-ouroboros.tsx      # 100
```

---

## 3. ATOM-BY-ATOM SPECIFICATIONS

---

### SERIES 7: THE RETRO-CAUSAL ENGINE
**Theme**: Rewriting the past through cinematic physics metaphors
**Color identity**: `#D4A8FF` (warm lavender — memory warmth)
**Physics paradigm**: Timeline scrubbing, chromatic manipulation, reverse-time

---

#### ATOM 61: AUDIO RESCORE (`audio-rescore`)
**Name**: The Audio Rescore Engine — Soundtrack Swapping
**Intent**: A memory feels tragic because the ego plays a tragic soundtrack. Change the music, change the neurochemistry.
**Render**: Canvas 2D + Web Audio API

**Visual concept**: Two waveform visualisations (minor-key vs. major-key) rendered as mirrored amplitude bars. A heavy mixing fader sits vertically at centre. As the fader slides up, the bottom waveform (tragic, slow, red-tinted) crossfades into the top waveform (rising, bright, gold-tinted). The waveforms are real Web Audio oscillator outputs rendered via `analyserNode.getByteFrequencyData()`.

**Canvas physics**:
- Two `OscillatorNode` banks: low drone (minor 2nd intervals) and bright pad (major 7th/9th)
- `GainNode` crossfade controlled by fader position (0 = all tragic, 1 = all rising)
- Waveform bars: 64 bins, bar height = frequency amplitude * entrance * alpha
- Fader: draggable vertical track, snaps at 10% increments (haptic `drag_snap`)
- Background: subtle horizontal lines suggesting a mixing console

**Interaction**: `draggable`, `scrubable`
**Haptics**: `drag_snap` (fader notches), `step_advance` (crossfade milestones), `completion` (full rescore)
**Scale**: `focus`
**State**: 0-1 continuous (fader position)
**Resolution**: Fader reaches top → full rescore → `completion`
**Device**: `haptics`, `audio-output`

**Audio graceful degradation**: If Web Audio unavailable, render static waveform shapes that morph from jagged/compressed to smooth/expansive as fader moves. Visual-only mode is still therapeutic.

**reducedMotion**: Waveform bars don't animate amplitude — show static mid-level bars. Fader still draggable.

**Unique differentiation**: This is the ONLY atom that does real-time audio crossfading with visual waveform feedback. The two soundscapes are emotionally opposite — hearing the shift is the therapy.

---

#### ATOM 62: CHROMATIC GRADE (`chromatic-grade`)
**Name**: The Chromatic Grade Engine — Colouring the Past
**Intent**: Trauma desaturates memory. The user manually injects warmth and colour back.
**Render**: Canvas 2D

**Visual concept**: A central rectangular "memory card" rendered in extreme desaturation — cold blue-grey tones, flat, lifeless. The user places their thumb on the screen. A radial warmth mask expands from the touch point, transitioning the colour grade from cold/dead to rich golden-hour warmth. The mask edge is soft (gaussian falloff). Multiple touches leave persistent warm zones that eventually merge to fill the frame.

**Canvas physics**:
- Memory card: rounded rect with abstract geometric shapes inside (circles, lines, soft rectangles — suggest a scene without depicting one)
- Cold palette: `[45, 55, 75]` (steel blue), `[60, 65, 80]`, `[35, 40, 55]`
- Warm palette: `[200, 160, 100]` (golden hour), `[180, 140, 90]`, `[220, 180, 120]`
- Radial mask: per-pixel alpha blend between cold and warm based on distance from touch points
- Implementation: composite canvas — draw cold scene, then warm scene clipped to radial masks
- Mask expansion: starts at r=0, grows at `2px/frame` to `minDim * 0.6`, with gaussian edge softness

**Interaction**: `holdable`, `draggable`
**Haptics**: `hold_start` (touch warmth begins), `drag_snap` (saturation notches), `completion` (fully warm)
**Scale**: `full`
**State**: 0-1 continuous (percentage of canvas warmed)
**Resolution**: >90% warm coverage → `completion`
**Device**: `haptics`

**reducedMotion**: Mask expansion is instant (no animation), warmth zone appears at full radius on touch.

**Unique differentiation**: Radial heat-map interaction — warmth literally radiates from touch. No other atom uses spatial colour grading.

---

#### ATOM 63: NARRATIVE FLIP (`narrative-flip`)
**Name**: The Narrative Flip Engine — Reversing the Vector
**Intent**: The ego calls it "The End." The sovereign mind calls it "The Inciting Incident." Physically reverse gravity.
**Render**: Canvas 2D

**Visual concept**: A heavy geometric object (rounded square with weight lines) falls slowly from top of screen under simulated gravity. Trailing behind it: fading afterimages showing its trajectory. The word "END" faintly visible on the object. The user swipes up from the bottom with force. Gravity inverts. The object compresses like a spring at the bottom, then launches upward. The word morphs to "BEGIN". Rising particles trail behind it.

**Canvas physics**:
- Object: 60x60px rounded rect, position driven by `y += velocity; velocity += gravity`
- Default gravity: `+0.15` (falling)
- Swipe detection: pointer down → pointer up, if `deltaY < -100px` and `velocity > 3`, trigger flip
- On flip: `gravity = -0.15`, object compresses (scaleY: 1→0.6→1 over 20 frames), then launches
- Afterimages: array of last 12 positions, each drawn with decreasing alpha
- Text morph: "END" fades out (alpha 0.08→0) over 15 frames, "BEGIN" fades in

**Interaction**: `swipeable`, `observable`
**Haptics**: `swipe_commit` (the reversal), `completion` (object exits top)
**Scale**: `focus`
**State**: discrete — `falling`, `compressed`, `rising`, `complete`
**Resolution**: Object exits top of viewport → `completion`
**Device**: `haptics`

**reducedMotion**: Object starts at centre, swipe instantly flips text from "END" to "BEGIN" with colour shift, no falling/rising animation.

**Unique differentiation**: Kinetic gravity reversal — the only atom where you physically fight gravity and win. The spring compression is the key moment.

---

#### ATOM 64: SPLICING TIMELINE (`splicing-timeline`)
**Name**: The Splicing Engine — The Deleted Scene
**Intent**: Depression edits out the light. Find the bright clip. Splice it back into the timeline.
**Render**: Canvas 2D

**Visual concept**: A horizontal filmstrip spans the viewport. 8 frames rendered as small rectangles with varying brightness. A dark gap (3 frames wide) sits in the centre — the "deleted" section. Below the filmstrip, a bright, glowing clip fragment sits in a staging area. The user drags this fragment upward into the gap. Magnetic snapping engages within 20px — the clip locks into place with a satisfying thud. The entire filmstrip illuminates.

**Canvas physics**:
- Filmstrip: 8 rects, w=`minDim*0.08`, h=`minDim*0.06`, evenly spaced horizontally at `cy`
- Existing frames: warm tints at alpha 0.06-0.08
- Gap: 3 missing frames (drawn as dashed outlines at alpha 0.02)
- Draggable clip: bright rect at `(cx, cy + minDim*0.2)`, follows pointer when dragged
- Magnetic snap zone: when clip centre is within 20px of gap centre, engage snap
- Snap animation: clip lerps to exact gap position over 8 frames
- Post-snap: light pulse travels left-to-right through all 8 frames (sequential alpha bump)

**Interaction**: `draggable`
**Haptics**: `drag_snap` (approaching gap), `seal_stamp` (locked in), `completion` (timeline illuminates)
**Scale**: `field`
**State**: discrete — `idle`, `dragging`, `snapping`, `complete`
**Resolution**: Clip snaps into gap → `completion`
**Device**: `haptics`

**reducedMotion**: Clip teleports to gap on drag release near target. No magnetic animation. Light pulse is instant.

**Unique differentiation**: Film-editing metaphor — magnetic snap is the signature moment. The post-snap illumination cascade is uniquely cinematic.

---

#### ATOM 65: PREQUEL CONTEXT (`prequel-context`)
**Name**: The Prequel Engine — Zooming the Context
**Intent**: You walked into the middle of their movie. Pull the timeline backward to see the wound behind the attack.
**Render**: Canvas 2D

**Visual concept**: A red jagged "Attack" node sits at centre — sharp angles, aggressive colour. The user drags rightward, scrolling the timeline backward. From the left edge, a massive "Wound" node slides into view — soft, bleeding, blue-purple. A connecting line reveals that the Attack node is attached to (caused by) the Wound node. The Attack node's colour softens as context is revealed.

**Canvas physics**:
- Timeline: horizontal scroll driven by pointer drag (deltaX mapped to offset)
- Attack node: jagged polygon (8 vertices with randomised radii), red-tinted
- Wound node: soft, rounded, bleeding shape (large circle with drip particles), blue-purple
- Connecting line: bezier curve between the two nodes, revealed as scroll progresses
- As scroll reaches full reveal (Wound fully visible): Attack node vertices lerp from jagged to smooth
- Colour shift: Attack transitions from `[200, 60, 60]` to `[140, 100, 130]` (neutralised)
- Label text: "ATTACK" fades to "REACTION", "WOUND" label appears

**Interaction**: `draggable`, `scrubable`
**Haptics**: `drag_snap` (timeline scrub notches), `step_advance` (wound appears), `completion` (full context)
**Scale**: `full`
**State**: 0-1 continuous (scroll position)
**Resolution**: Full scroll → context revealed → `completion`
**Device**: `haptics`

**reducedMotion**: No smooth scrolling — discrete steps. Each drag increment jumps to next position.

**Unique differentiation**: Horizontal timeline-as-empathy. The visual softening of the "enemy" as you see their backstory is uniquely powerful.

---

#### ATOM 66: METADATA REWRITE (`metadata-rewrite`)
**Name**: The Metadata Engine — Tag Reassignment
**Intent**: The memory is neutral data. The pain is the tag. Rewrite "FLAW" to "DATA".
**Render**: Canvas 2D

**Visual concept**: A memory block (rounded card) sits at centre with a heavy red badge reading "FLAW" in uppercase. The badge has a tiny lock icon. The user long-presses the badge. After hold threshold (2 seconds), the lock "clicks" open — the red drains downward like liquid, replaced by cool silver rising from the bottom. The text "FLAW" morphs letter-by-letter into "DATA" (F→D, L→A, A→T, W→A). The emotional weight visually lightens — the card's shadow reduces, its y-position rises slightly.

**Canvas physics**:
- Card: `minDim*0.5 x minDim*0.15` rounded rect, subtle shadow (4px blur)
- Badge: smaller rect on card, initially `[200, 60, 50]` (red), transitions to `[160, 165, 175]` (silver)
- Colour drain: vertical wipe — red retreats upward as silver fills from bottom, driven by hold progress
- Text morph: each letter transitions independently with 100ms stagger
- Lock icon: tiny padlock shape (2 arcs + rect), rotates 30 degrees on unlock
- Post-unlock: card shadow shrinks from 4px to 1px, card y lerps up by 8px (lighter weight)

**Interaction**: `holdable`
**Haptics**: `hold_start`, `hold_threshold` (lock clicks), `step_advance` (each letter morphs), `completion`
**Scale**: `focus`
**State**: discrete — `locked`, `unlocking`, `morphing`, `complete`
**Resolution**: All letters morphed → `completion`
**Device**: `haptics`

**reducedMotion**: Instant colour change on hold threshold. Text swap is immediate, no letter-by-letter morph.

**Unique differentiation**: Typography transformation as therapy. The letter-by-letter morph from emotional to clinical language is mesmerising.

---

#### ATOM 67: FORGIVENESS FILTER (`forgiveness-filter`)
**Name**: The Forgiveness Filter Engine — De-Masking the Monster
**Intent**: Anger requires a monster. Forgiveness reveals the terrified child inside the monster suit.
**Render**: Canvas 2D

**Visual concept**: A massive, sharp-edged, dark shadow dominates the viewport — towering, angular, intimidating. The user places two fingers on screen and pulls apart (pinch-out). The shadow splits vertically down the centre, each half fading as it pulls apart. Behind the shadow: a tiny, fragile, glowing light shivering in the exact centre. The light pulses gently with breath. As the shadow fully parts, the light grows slightly — still small, but warm and safe.

**Canvas physics**:
- Shadow: two mirrored halves of a jagged polygon, drawn from centre outward
- Split mechanics: track two-pointer distance. As distance increases, halves separate horizontally
- Shadow alpha: fades from 0.10 to 0.01 as split progresses
- Inner light: small radial gradient at centre, r=`minDim*0.02`, grows to `minDim*0.05`
- Light shimmer: subtle random offset (`±1px` per frame), alpha pulses with breathAmplitude
- Shadow edge: rough/jagged vertices (pre-computed), 12 points per half

**Interaction**: `pinchable` (two-finger spread)
**Haptics**: `hold_start` (fingers placed), `drag_snap` (shadow tearing), `completion` (light revealed)
**Scale**: `full`
**State**: 0-1 continuous (split distance / max distance)
**Resolution**: Shadow fully parted → light stable → `completion`
**Device**: `haptics`

**reducedMotion**: Shadow halves separate instantly on gesture. Light appears without shimmer.

**Unique differentiation**: Two-finger "lens opening" mechanic. The contrast between the massive shadow and the tiny fragile light is the emotional payload.

---

#### ATOM 68: ANCESTRAL CUT (`ancestral-cut`)
**Name**: The Ancestral Cut Engine — Ending the Franchise
**Intent**: Generational trauma is a 200-year movie. You are the one who cuts the film.
**Render**: Canvas 2D

**Visual concept**: A heavy, ancient-looking chain (or filmstrip) extends vertically from top to bottom — infinite in both directions. The chain links are textured, dark, oxidised. The user swipes horizontally across the centre with force. A bright cutting line appears. The chain severs perfectly. The top half retracts upward (with momentum/spring), the bottom half dissolves into particles that evaporate downward. The user holds a clean, blank slate in the centre.

**Canvas physics**:
- Chain: vertical series of 20 linked ovals, each `minDim*0.04` wide, alternating orientation
- Sever detection: horizontal swipe across middle third, deltaX > 80px, velocity > 2
- Cut line: bright horizontal slash, width expands from 0 to viewport width over 5 frames
- Top half: retracts upward with spring physics (velocity = -8, decelerate, slight bounce)
- Bottom half: each link converts to 8 particles, particles fall with gravity + random spread, fade to 0
- Post-clear: clean horizontal line at cy, subtle glow

**Interaction**: `swipeable`
**Haptics**: `swipe_commit` (the cut — heavy, definitive), `completion` (clean slate)
**Scale**: `full`
**State**: discrete — `intact`, `cutting`, `retracting`, `complete`
**Resolution**: Bottom half fully dissolved → `completion`
**Device**: `haptics`

**reducedMotion**: Chain snaps instantly on swipe. No retraction animation. Bottom half vanishes immediately.

**Unique differentiation**: The horizontal sever across a vertical chain is viscerally satisfying. The asymmetry (top retracts, bottom dissolves) tells the story — the past pulls away, the future evaporates because you chose not to pass it on.

---

#### ATOM 69: TIME TRAVEL RESCUE (`time-travel-rescue`)
**Name**: The Time Travel Engine — The Rescue
**Intent**: A part of the psyche is still trapped in the past. Reach back and pull them out.
**Render**: Canvas 2D

**Visual concept**: A deep, dark portal — concentric rings receding into Z-depth (perspective projection). At the deepest point (smallest ring), a tiny vibrating light is trapped. The user presses their finger onto the light and drags upward. The light resists initially (friction), then begins to move along the Z-axis toward the foreground. As it approaches, it grows larger and warmer. When it reaches the surface, it merges with a subtle avatar outline at the top of the screen — a warm pulse radiates outward.

**Canvas physics**:
- Portal: 8 concentric ellipses, each slightly offset (parallax), getting smaller toward centre
- Perspective: each ring's radius = `baseR * (1 / (1 + depth * 0.3))`
- Trapped light: small pulsing dot at deepest ring, subtle vibration (±1px random)
- Extraction: pointer drag up maps to depth position. Light grows as it moves forward
- Light size: `2px` at depth → `minDim*0.04` at surface
- Resistance: first 20% of drag has 0.3x movement multiplier (friction)
- Avatar outline: faint silhouette circle at top area, alpha = 0.02
- Merge: when light reaches surface, radial pulse from avatar position

**Interaction**: `draggable`, `holdable`
**Haptics**: `hold_start` (grab the light), `drag_snap` (depth layers), `completion` (merge)
**Scale**: `full`
**State**: 0-1 continuous (depth position of rescued light)
**Resolution**: Light reaches surface + merges → `completion`
**Device**: `haptics`

**reducedMotion**: No vibration on trapped light. Drag moves light without resistance animation.

**Unique differentiation**: Z-depth extraction is unique to this atom. The growing light as it approaches the viewer creates a powerful "rescue" sensation. The initial friction (hard to pull free) then release (it comes to you) mirrors the therapeutic process.

---

#### ATOM 70: THIRD-PERSON SHIFT (`third-person-shift`)
**Name**: The Third-Person Shift Engine — The Director's Chair
**Intent**: First-person fusion with a memory causes pain. Shift to third-person to become the Director.
**Render**: Canvas 2D

**Visual concept**: A tight, claustrophobic first-person view — the viewport shows a single scene element up close (a large rectangle filling 80% of the frame, representing "the memory"). Heavy vignette. The user uses two-finger twist (rotation gesture). The "camera" rotates upward and outward — the rectangle shrinks, tilts into an isometric projection, and the user sees a tiny avatar figure standing next to it. The vignette dissolves. A subtle grid floor appears. The user is now watching from the Director's Chair.

**Canvas physics**:
- Phase 1 (first-person): large rect fills most of viewport, dark vignette border
- Rotation tracking: two-pointer angle change drives camera transition (0-1)
- Phase 2 (transitioning): rect shrinks via perspective transform, rotates to ~30deg isometric tilt
- Isometric projection: `drawX = x - y * 0.5`, `drawY = (x + y) * 0.25` (simplified)
- Avatar: tiny stick figure appears at transition > 0.3, grows to full opacity at 1.0
- Grid floor: perspective grid lines appearing at transition > 0.5
- Vignette: alpha decreases as transition increases
- Camera feel: smooth eased transition, not linear

**Interaction**: `pinchable` (two-finger rotation)
**Haptics**: `drag_snap` (camera rotation notches), `step_advance` (view shift), `completion` (director's chair)
**Scale**: `full`
**State**: 0-1 continuous (camera position first→third)
**Resolution**: Full rotation to third-person → `completion`
**Device**: `haptics`

**reducedMotion**: Tap toggles between first-person and third-person instantly. No smooth camera rotation.

**Unique differentiation**: Camera perspective shift as psychological metaphor. No other atom changes the fundamental viewing angle. The tiny avatar reveal is the "aha" moment.

---

### SERIES 8: THE KINEMATIC TOPOLOGY
**Theme**: Perspective and scale — destroying the ego's sense of proportion
**Color identity**: `#52B8FF` (cosmic blue — vastness)
**Physics paradigm**: Extreme scaling, fractal generation, infinite Z-axis

---

#### ATOM 71: OVERVIEW EFFECT (`overview-effect`)
**Name**: The Overview Engine — Orbital Perspective
**Intent**: From orbit, borders and deadlines disappear. Pull the camera back until the crisis is a pixel.
**Render**: Canvas 2D

**Visual concept**: A massive wall of dense text dominates the viewport ("DEADLINE CRISIS PANIC URGENT..."). As the user pinch-zooms out, the text shrinks exponentially (not linearly). It becomes a paragraph, then a page, then a tiny rectangle, then a continent shape, then a glowing blue marble floating in OLED black. Each zoom level is a distinct visual regime. The final state: a tiny blue-white dot in vast, peaceful darkness.

**Canvas physics**:
- 5 zoom regimes, each with distinct rendering:
  - Level 1 (close): Large text fills viewport, claustrophobic
  - Level 2: Text shrinks to paragraph block
  - Level 3: Block becomes abstract rectangle with texture
  - Level 4: Rectangle becomes continent-like organic shape
  - Level 5: Shape becomes tiny glowing marble in void
- Zoom driven by two-pointer distance (pinch gesture) or single-finger vertical drag
- Exponential mapping: `zoomLevel = Math.pow(pinchScale, 3)` — first zoom is fast, later is vast
- Each transition: crossfade between regime renderings over 0.1 zoom range
- Background: transitions from claustrophobic grey to pure black
- Final marble: radial gradient, r=4px, subtle atmospheric glow ring

**Interaction**: `pinchable`, `draggable`
**Haptics**: `step_advance` (each zoom regime transition), `completion` (orbital view)
**Scale**: `full`
**State**: 0-1 continuous (zoom level)
**Resolution**: Reach orbital view → `completion`
**Device**: `haptics`

**reducedMotion**: Tap cycles through the 5 zoom regimes discretely. No smooth zooming.

**Unique differentiation**: 5-regime zoom with entirely different visual content at each level. The exponential zoom curve creates an overwhelming sense of scale.

---

#### ATOM 72: FRACTAL ZOOM (`fractal-zoom`)
**Name**: The Fractal Zoom Engine — Infinite Self-Similarity
**Intent**: No matter how deep or far you zoom, the architecture is consistent. You cannot fall out.
**Render**: Canvas 2D

**Visual concept**: A Mandelbrot-like fractal structure rendered progressively. The user pinch-zooms in. As they pass through the boundary, the interior reveals the same macro-structure — infinite visual loop. Each zoom level is rendered in a different primary colour from the palette, creating a rainbow depth effect.

**Canvas physics**:
- Progressive Mandelbrot: render 4 scanlines per frame for performance
- Zoom centre: tracks pinch midpoint
- Depth colouring: iteration count mapped to `lerpColor(primaryRgb, accentRgb, t)`
- Infinite loop: when zoom > threshold, reset zoom to 1.0 with new centre offset (seamless)
- Pre-computed tile cache: 4x4 grid of tiles, re-render only dirty tiles on zoom change
- Resolution: start at 1px per 4 canvas pixels, increase to 1:1 as zoom settles
- Max iterations: 64 (performance) — sufficient for visual beauty

**Interaction**: `pinchable`, `tappable` (tap to zoom centre)
**Haptics**: `step_advance` (each loop boundary crossing)
**Scale**: `full`
**State**: continuous (zoom depth, but cycles infinitely)
**Resolution**: None — this atom has no end. It IS the infinite game.
**Device**: none

**reducedMotion**: Render static fractal. Tap cycles between 3 pre-computed zoom levels.

**Unique differentiation**: Real mathematical fractal rendering on Canvas 2D. The infinite zoom loop — passing through the boundary only to find the same structure — is the philosophical payload.

---

#### ATOM 73: DEEP TIME (`deep-time`)
**Name**: The Deep Time Engine — Geological Velocity
**Intent**: The ego panics in hours. The earth thinks in millennia. Every mountain becomes dust.
**Render**: Canvas 2D

**Visual concept**: A landscape silhouette with sharp, jagged peaks (representing crises). A horizontal timeline slider at the bottom reads "NOW → 10,000 YEARS". As the user scrubs right, the peaks erode — procedural wind/rain smooths the jagged vertices over thousands of simulated years. Sharp spikes become rolling hills become flat, fertile plains. Small grass particles appear on the smoothed terrain.

**Canvas physics**:
- Terrain: array of 120 y-values across viewport width, initially jagged (random peaks)
- Erosion algorithm: for each time step, each y-value lerps toward the average of its neighbours
- Multiple passes per scrub increment for visible smoothing
- Grass particles: spawn on flat sections (slope < threshold), green-tinted dots
- Sky gradient: transitions from stormy grey to warm amber as terrain smooths
- Timeline text: "NOW", "1,000 YRS", "5,000 YRS", "10,000 YRS" — appears at scrub positions
- Terrain colour: dark granite → warm earth tones → green-tinted

**Interaction**: `scrubable`, `draggable`
**Haptics**: `drag_snap` (millennium markers), `step_advance` (terrain regime changes), `completion` (flat plains)
**Scale**: `full`
**State**: 0-1 continuous (time position)
**Resolution**: Full erosion → flat, fertile → `completion`
**Device**: `haptics`

**reducedMotion**: Discrete terrain states. Each scrub increment jumps to next pre-computed erosion level.

**Unique differentiation**: Procedural erosion is mesmerising. Watching mountains literally dissolve under the weight of time is profoundly calming.

---

#### ATOM 74: SYSTEMIC ZOOM (`systemic-zoom`)
**Name**: The Systemic Zoom Engine — Forest vs. Trees
**Intent**: You're obsessing over one diseased leaf. Zoom out to see the health of the forest.
**Render**: Canvas 2D

**Visual concept**: Camera starts locked tight on a single, large, glowing node (rendered massive — fills 60% of viewport). Each tap or drag-out zooms the camera back. The node shrinks, and surrounding nodes appear. Continue zooming: the single node is revealed to be one of thousands in a massive, healthy, pulsing network graph. Lines connect nearby nodes. The "diseased" node is barely visible in the larger system.

**Canvas physics**:
- Node graph: pre-computed 200 nodes with random positions in a large virtual space
- Camera: position + zoom level. Start: zoomed in on node[0]
- Zoom-out: each tap multiplies zoom by 0.7 (or pinch gesture)
- Node rendering: only draw nodes within viewport bounds (culling for performance)
- Connections: draw lines between nodes within `minDim*0.1` of each other (at current zoom)
- Node pulse: each node has phase-offset sine pulse on alpha
- Original node: subtly highlighted with accent colour ring
- Network health: overall graph shows many bright nodes vs. one dim one

**Interaction**: `tappable`, `pinchable`
**Haptics**: `step_advance` (each zoom level — "10 nodes", "100 nodes", "1000 nodes"), `completion` (full network)
**Scale**: `full`
**State**: discrete (zoom levels: 1, 10, 100, 1000 nodes visible)
**Resolution**: Full network visible → `completion`
**Device**: `haptics`

**reducedMotion**: No node pulsing. Tap instantly jumps between zoom levels.

**Unique differentiation**: The dramatic scale shift from "one massive crisis node" to "tiny speck in a healthy network" is the therapeutic insight.

---

#### ATOM 75: EGO ZOOM (`ego-zoom`)
**Name**: The Ego Zoom Engine — Concentric Reality
**Intent**: Expand identity from body → city → species → cosmos.
**Render**: Canvas 2D

**Visual concept**: The user presses thumb at centre. Concentric rings of light ripple outward from the touch point, each representing an identity layer. Each ring has a faint label: "Body", "Home", "City", "Country", "Species", "Earth", "Cosmos". As rings expand, the dark viewport edges are pushed outward — more light, more space. The final ring fills the entire viewport with warm, expansive light.

**Canvas physics**:
- Touch hold triggers sequential ring emissions (one every 60 frames)
- Each ring: expanding circle, stroke width 0.5px, alpha fades as it grows
- Ring colour: `lerpColor(primaryRgb, accentRgb, ringIndex / 7)`
- Labels: appear at ring's initial position, fade in as ring passes, persist
- Dark edge: radial vignette that shrinks as rings expand
- Total 7 rings for 7 identity layers
- Ripple physics: ring radius += `1.5 * (1 + breathAmplitude * 0.3)` per frame

**Interaction**: `holdable`, `breathable`
**Haptics**: `breath_peak` (each ring emission), `completion` (cosmos ring)
**Scale**: `full`
**State**: discrete (which ring is active, 0-7)
**Resolution**: All 7 rings emitted → `completion`
**Device**: `haptics`

**reducedMotion**: All rings appear simultaneously at their final positions. No expansion animation.

**Unique differentiation**: Concentric identity expansion — each ring is a philosophical leap. The haptic "stone in a pond" feel is unique.

---

#### ATOM 76: MICRO-STEP (`micro-step`)
**Name**: The Micro-Step Engine — Atomic Granularity
**Intent**: A task too massive to lift. Shrink it until it's too small to fail.
**Render**: Canvas 2D

**Visual concept**: A massive, heavy, brutalist rectangle dominates the viewport — 80% of screen. It has visible "weight" (drop shadow, thick border, dense fill). The user tries to drag it — it barely moves (friction = 0.95). The user double-taps. The block shrinks dramatically with each double-tap (80% → 40% → 15% → 5% → tiny dot). As it shrinks, its shadow lightens, its colour warms, and friction approaches zero. At dot-size, the user can flick it off the screen with joyful ease.

**Canvas physics**:
- Block: rounded rect, initial size = `minDim * 0.8`
- Drag physics: `velocity *= friction; position += velocity * (1 - friction)`
- Friction per size: `0.95, 0.7, 0.3, 0.05, 0.01` (indexed by shrink level)
- Double-tap detection: two taps within 300ms
- Shrink animation: size lerps to target over 20 frames (easeOutExpo)
- Shadow: `4px blur → 2px → 1px → 0.5px → 0px`
- Colour: `[60, 55, 70]` (heavy) → `[180, 170, 140]` (light, warm)
- Flick detection: release velocity > 5 at smallest size → block flies off-screen
- Post-flick: faint sparkle particles at exit point

**Interaction**: `draggable`, `tappable` (double-tap)
**Haptics**: `tap` (each shrink), `step_advance` (each size level), `completion` (flicked away)
**Scale**: `full`
**State**: discrete (5 size levels)
**Resolution**: Flick off screen at smallest size → `completion`
**Device**: `haptics`

**reducedMotion**: Shrink is instant per double-tap. No lerp animation. Flick teleports block off-screen.

**Unique differentiation**: The friction-to-frictionless transformation IS the therapy. The heavy impossible block becoming a weightless joy-dot.

---

#### ATOM 77: VASTNESS EXPANSION (`vastness-expansion`)
**Name**: The Vastness Engine — Space Expansion
**Intent**: Claustrophobia of the mind. Push the walls of reality outward. Create breathing room.
**Render**: Canvas 2D

**Visual concept**: A tight, restrictive vignette borders the screen — the visible area is only 30% of the viewport (a small circle of light in oppressive darkness). The user places two fingers in the centre and pushes outward (pinch-out). The vignette is physically shoved off the edges, revealing a vast, warmly lit background. The expansion has elastic physics — overshoots slightly, settles.

**Canvas physics**:
- Vignette: radial gradient — transparent at centre, opaque black at edges
- Vignette radius: starts at `minDim * 0.15`, max = `minDim * 0.8`
- Pinch-out tracking: two-pointer distance change maps to radius delta
- Elastic physics: on release, radius springs to nearest detent with slight overshoot
- Background reveal: warm gradient (golden/amber) becomes visible as vignette retreats
- Subtle particles in the revealed space (floating dust motes in warm light)
- 4 expansion detents: 30%, 50%, 75%, 100% — each with distinct background detail level

**Interaction**: `pinchable`
**Haptics**: `drag_snap` (expansion detents), `completion` (fully open)
**Scale**: `full`
**State**: 0-1 continuous (vignette radius / max)
**Resolution**: Vignette fully pushed off → `completion`
**Device**: `haptics`

**reducedMotion**: Tap cycles through 4 expansion states. No elastic animation.

**Unique differentiation**: Physical vignette removal. The user literally creates more space — the claustrophobia-to-vastness arc is the atom's emotional journey.

---

#### ATOM 78: HORIZON INFINITE (`horizon-infinite`)
**Name**: The Horizon Engine — Infinite Play
**Intent**: There is no finish line. The horizon is not a destination; it is an orientation.
**Render**: Canvas 2D

**Visual concept**: A glowing horizon line sits in the middle-distance. A parallax ground plane scrolls beneath the viewer (perspective lines converging at the horizon). As the user swipes up, the ground moves — but the horizon stays exactly equidistant. Small environmental details scroll past (subtle dots representing landmarks). The user enters a meditative flow of forward motion without arrival.

**Canvas physics**:
- Horizon line: horizontal line at `cy - minDim * 0.1`, fixed position
- Ground plane: 8 perspective lines converging at horizon, scroll speed proportional to swipe velocity
- Scrolling dots: random positions on the ground plane, scroll toward viewer (grow + spread)
- Parallax layers: 3 depth layers scrolling at different speeds (0.3x, 0.6x, 1.0x)
- Swipe drive: continuous y-axis swipe velocity drives scroll speed
- Auto-glide: after swipe, scroll continues with gentle deceleration (friction = 0.98)
- Horizon glow: subtle pulse with breath, never changes distance

**Interaction**: `swipeable`, `breathable`
**Haptics**: `breath_peak` (rhythmic pulse matching forward motion)
**Scale**: `full`
**State**: continuous (distance traveled — but never "arrives")
**Resolution**: None — this atom is about the journey. No completion.
**Device**: `haptics`

**reducedMotion**: Static scene. Horizon visible. No scrolling. Subtle breath-coupled glow on horizon.

**Unique differentiation**: The ONLY atom that explicitly has no resolution. Forward motion without arrival. The unreachable horizon is the point.

---

#### ATOM 79: STARDUST DISSOLVE (`stardust-dissolve`)
**Name**: The Stardust Engine — Deconstruction of Mass
**Intent**: You are not solid. You are particles temporarily holding a shape. Dissolve the rigidity.
**Render**: Canvas 2D

**Visual concept**: A solid, opaque circular shape at centre — rendered as 2000 tightly packed particles with high cohesion. It looks solid. The user touches it. The cohesion parameter disables. Particles begin drifting apart — slowly at first, then with increasing freedom. The shape dissolves into a swirling galaxy of luminous dots. Each particle's alpha increases slightly as it separates (individual beauty emerging from mass conformity).

**Canvas physics**:
- 2000 particles in circular formation, initial radius spread = `minDim * 0.08`
- Cohesion: each particle has `force toward centre = cohesion * distance`
- Touch disables cohesion → particles drift via their random initial velocities
- Velocity: each particle gets random `vx, vy` in range `[-0.3, 0.3]`, only active when freed
- Orbital tendency: add slight tangential velocity → particles spiral rather than scatter linearly
- Luminosity: particle alpha increases from 0.03 (packed) to 0.08 (free)
- Colour: `lerpColor(primaryRgb, accentRgb, particleIndex / 2000)` — spectrum across the swarm
- Performance: batch-render particles as 1px rects (faster than arc)

**Interaction**: `tappable`, `holdable`
**Haptics**: `tap` (cohesion breaks), `completion` (fully dispersed)
**Scale**: `field`
**State**: 0-1 continuous (dispersion ratio)
**Resolution**: >90% of particles beyond initial radius * 3 → `completion`
**Device**: `haptics`

**reducedMotion**: On tap, particles instantly teleport to dispersed positions (random within viewport). No drift animation.

**Unique differentiation**: 2000-particle cohesion physics. The solid-to-galaxy transformation. Individual particles becoming MORE luminous as they separate — a visual metaphor for individuation.

---

#### ATOM 80: HOLOGRAPHIC DROP (`holographic-drop`)
**Name**: The Holographic Fragment Engine — The Drop and the Ocean
**Intent**: The drop dies so the ocean can be born. Surrender ego to integrate with the whole.
**Render**: Canvas 2D

**Visual concept**: A perfectly rendered luminous water drop hovers above a still, dark surface line. The user taps the drop. It falls (gravity). The moment it hits the surface, it vanishes entirely (ego death). But its impact generates a breathtaking concentric ripple that expands across the entire viewport. The ripple is mathematically perfect — silver lines on dark water. The whole surface vibrates with the drop's energy.

**Canvas physics**:
- Drop: teardrop shape (bezier path), luminous gradient fill, hovers at `cy - minDim * 0.15`
- Fall physics: `y += velocity; velocity += 0.4` (fast, decisive fall)
- Surface line: horizontal at `cy + minDim * 0.1`
- Impact frame: drop vanishes, first ripple circle spawns at impact point
- Ripples: array of expanding circles, each spawned 8 frames after the previous
- Ripple physics: radius += 2, alpha starts at 0.08, decreases with age
- Max 12 ripples active at once
- Ripple rendering: thin stroke circles (lineWidth 0.3-0.5)
- Surface perturbation: the surface line itself wobbles (sine wave) for 60 frames after impact

**Interaction**: `tappable`
**Haptics**: `tap` (release the drop), `entrance_land` (impact moment), `completion` (ripples fill viewport)
**Scale**: `full`
**State**: discrete — `hovering`, `falling`, `impact`, `rippling`, `complete`
**Resolution**: All ripples reach viewport edges → `completion`
**Device**: `haptics`

**reducedMotion**: Drop teleports to surface instantly. Ripples appear at final positions simultaneously.

**Unique differentiation**: The drop vanishes but its energy propagates everywhere. The perfect mathematical ripples on a dark surface are visually stunning. Ego death as integration, not destruction.

---

### SERIES 9: THE SHADOW & CRUCIBLE
**Theme**: Safely guiding into the darkest psychological territory — transmuting shadow into gold
**Color identity**: `#FF8552` (forge orange — fire and transformation)
**Physics paradigm**: Thermodynamic UI, fire shaders, high-friction drag, pressure mechanics

---

#### ATOM 81: CRUCIBLE FIRE (`crucible-fire`)
**Name**: The Crucible Engine — Thermodynamic Transmutation
**Intent**: Hold your finger in the fire. That is the only instruction. Endure heat → lead becomes gold.
**Render**: Canvas 2D

**Visual concept**: A heavy, leaden block sits in a raging procedural fire. The fire is rendered as layered Perlin-noise-like columns of particles rising from the bottom third. The user must press their thumb into the fire zone. The device "vibrates" (haptic crackle). If they release early, the block stays lead. If they hold for 8 seconds, the block melts, deforms, and resolidifies as a smooth golden sphere. The fire calms to warm embers.

**Canvas physics**:
- Fire: 80 particles rising from bottom, each with random x-drift, size decreasing with height
- Fire colour: `[220, 80, 30]` → `[255, 200, 50]` → `[255, 255, 200]` (bottom to top)
- Block: rounded rect at centre, initially `[80, 75, 90]` (lead grey)
- Hold tracking: count frames while pointer is down within fire zone
- Hold progress: 0-1 over 480 frames (8 seconds)
- Block transformation: at progress 0.5, block vertices begin warping (melting)
- At progress 0.8: shape transitions from rect to circle (lerp between path shapes)
- At progress 1.0: colour transitions to `[220, 190, 80]` (gold), fire calms
- Fire calm: particle count decreases, colours shift to warm amber embers

**Interaction**: `holdable`, `pressure-sensitive`
**Haptics**: `hold_start`, `hold_threshold` (intermittent during fire), `completion` (gold achieved)
**Scale**: `full`
**State**: 0-1 continuous (hold progress)
**Resolution**: 8-second hold → lead to gold → `completion`
**Device**: `haptics`

**reducedMotion**: Fire is static gradient. Block colour transitions without melting animation. Simpler shape morph.

**Unique differentiation**: Sustained courage mechanic — the user must endure discomfort to achieve transformation. The 8-second hold is an eternity on a phone. The haptic "crackle" during the fire is viscerally uncomfortable, making the gold payoff earned.

---

#### ATOM 82: SHADOW HUG (`shadow-hug`)
**Name**: The Shadow Hug Engine — Yielding to Terror
**Intent**: Fighting demons makes them stronger. Approach with agonising slowness. Hug the monster.
**Render**: Canvas 2D

**Visual concept**: A dark, jagged, intimidating shape sits at centre — sharp vertices, dark colour, subtle pulsing. If the user moves their finger toward it quickly (velocity > threshold), it violently scatters and shakes. The user must approach with agonising slowness (velocity < 0.5 px/frame). When they finally place their thumb gently over it, the jagged edges collapse inward, smoothing into a warm, glowing circle.

**Canvas physics**:
- Shadow: 12-vertex polygon with jagged radii (r varies ±40% of base)
- Evasion: if pointer velocity > 2px/frame within `minDim*0.2` of shadow, shadow jumps to random position + screen shake (2px offset for 5 frames)
- Slow approach: if velocity < 0.5 and distance decreasing, no evasion triggers
- Hug detection: pointer within shadow bounds for 60 continuous frames at low velocity
- Collapse: vertices lerp from jagged to circular (all radii → base radius) over 40 frames
- Colour shift: `[40, 35, 50]` (dark) → `[200, 170, 120]` (warm golden)
- Post-collapse: warm radial glow expands from centre

**Interaction**: `draggable`, `holdable`
**Haptics**: `hold_start` (gentle approach), `hold_threshold` (shadow yields), `completion` (warm circle)
**Scale**: `field`
**State**: discrete — `hostile`, `approaching`, `hugging`, `yielded`, `complete`
**Resolution**: Shadow fully yields → `completion`
**Device**: `haptics`

**reducedMotion**: No evasion animation. Shadow stays still. Slow hold collapses it instantly.

**Unique differentiation**: The velocity-inverse mechanic — aggression causes failure, gentleness succeeds. The user must reprogram their instinct to attack.

---

#### ATOM 83: PROJECTION MIRROR (`projection-mirror`)
**Name**: The Projection Engine — The Mirror of the Enemy
**Intent**: What you hate in them is a shadow in you. Wipe the glass to reveal your own reflection.
**Render**: Canvas 2D

**Visual concept**: A harsh, aggressive silhouette at centre — angular, dark, threatening (sharp polygon). The user wipes/scrubs the surface (drag back and forth). Where they scrub, the aggressive silhouette morphs — hard angles soften, dark colour warms. After enough scrubbing, the silhouette has completely transformed into a softer, rounder, lighter shape — recognisably different from the original. A faint label: "You" appears below.

**Canvas physics**:
- Enemy silhouette: 16-vertex polygon, sharp angles, dark fill `[50, 30, 35]`
- Scrub mask: composite canvas tracking scrubbed areas (paint white where pointer moves)
- Morph: for each vertex, lerp from sharp position to soft position based on local scrub density
- Scrub coverage: percentage of bounding box area covered by scrub strokes
- Colour morph: as coverage increases, fill transitions from dark red-black to warm neutral
- "You" label: appears at coverage > 0.8, alpha fades in over 30 frames
- Scrub visual: subtle "shine" effect following the pointer (glass-cleaning feel)

**Interaction**: `draggable` (scrubbing)
**Haptics**: `drag_snap` (scrub friction), `step_advance` (morph milestones at 25/50/75%), `completion`
**Scale**: `focus`
**State**: 0-1 continuous (scrub coverage)
**Resolution**: >90% scrubbed → full morph → `completion`
**Device**: `haptics`

**reducedMotion**: Each drag stroke morphs a large section instantly. No gradual wipe.

**Unique differentiation**: The scrubbing mechanic (like cleaning a mirror) is tactile and meditative. The enemy→self morph is the psychological revelation.

---

#### ATOM 84: SOLVE COAGULA (`solve-coagula`)
**Name**: The Coagula Engine — Disintegration and Reassembly
**Intent**: Solve et Coagula — dissolve the old form, then reassemble into something stronger.
**Render**: Canvas 2D

**Visual concept**: Phase 1 (Solve): A rigid geometric shape (hexagon) sits at centre. User taps — it shatters into ~60 Voronoi-like shards that fall under gravity to the bottom of the screen. Phase 2 (Coagula): User long-presses the centre. A magnetic force pulls shards upward. They don't re-form the old hexagon — they interlock into a new, higher-order geometry (dodecagon or starburst).

**Canvas physics**:
- Initial shape: regular hexagon, radius `minDim * 0.12`
- Shatter: pre-computed Voronoi subdivision (60 triangular shards)
- Each shard: position, velocity, rotation, colour (slight variation from base)
- Gravity: shards fall with `vy += 0.3`, bounce off bottom with dampening
- Magnetic pull: on long-press, each shard gets force toward centre: `force = 1 / distance²`
- Reassembly: shards don't return to hexagon positions — they snap to dodecagon vertices
- New shape colour: brighter, warmer, with subtle inner glow
- Performance: 60 shards × (position + rotation + colour) is manageable

**Interaction**: `tappable` (shatter), `holdable` (reassemble)
**Haptics**: `tap` (shatter crack), `hold_start` (magnetic pull begins), `seal_stamp` (new shape locks), `completion`
**Scale**: `focus`
**State**: discrete — `intact`, `shattering`, `scattered`, `pulling`, `reassembling`, `complete`
**Resolution**: New geometry locked → `completion`
**Device**: `haptics`

**reducedMotion**: Shatter is instant scatter. Reassembly is instant new shape. No physics animation.

**Unique differentiation**: Two-phase interaction (destroy then rebuild). The new shape being fundamentally different from the old one IS the point — you don't go back to who you were.

---

#### ATOM 85: PARADOX TENSION (`paradox-tension`)
**Name**: The Paradox Tension Engine — Holding Opposites
**Intent**: The sovereign mind holds contradictions. Drag two repelling nodes together.
**Render**: Canvas 2D

**Visual concept**: Two nodes labelled "GRIEF" and "JOY" actively repel each other on opposite sides of the viewport. The user must use two fingers to drag them toward the centre simultaneously. The closer they get, the stronger the repulsion (visual: electric arcs between them, haptic: grinding resistance). The user must hold them together under maximum tension for 3 seconds. Fusion event: the two nodes merge into a single iridescent core.

**Canvas physics**:
- Two nodes: circles, r=`minDim*0.04`, positioned at `(cx-spread, cy)` and `(cx+spread, cy)`
- Repulsion: when distance < `minDim*0.3`, force = `repulsionStrength / distance²`
- Two-touch tracking: each pointer controls one node (assigned by proximity on pointerdown)
- Electric arcs: when nodes within `minDim*0.15`, draw 3 jagged polylines between them
- Arc rendering: random vertex offsets refreshed every 3 frames, alpha = tension * 0.06
- Fusion countdown: when distance < `minDim*0.03` for 180 consecutive frames (3 sec)
- Fusion: both nodes lerp to cx, merge into single circle with iridescent colour cycling
- Labels: "GRIEF" and "JOY" fade, replaced by "BOTH" during fusion

**Interaction**: `draggable` (two-finger), `holdable`
**Haptics**: `drag_snap` (tension grinding), `hold_threshold` (fusion countdown), `completion` (fusion)
**Scale**: `field`
**State**: 0-1 continuous (inverse of distance, then fusion countdown)
**Resolution**: Fusion completes → `completion`
**Device**: `haptics`

**reducedMotion**: No electric arcs animation. Nodes move without animated repulsion — just position change.

**Unique differentiation**: Two-finger dual-node control with mutual repulsion. The 3-second tension hold under resistance — the user must sustain effort. Unique iridescent fusion reward.

---

#### ATOM 86: MONSTER TAMING (`monster-taming`)
**Name**: The Monster Taming Engine — Feeding the Demon
**Intent**: The demon is a guardian gone feral. Don't kill it. Feed it calm. Give it a new job.
**Render**: Canvas 2D

**Visual concept**: A chaotic swarm of 40 red particles flies violently around the screen in random directions. The user holds their thumb at the centre. The swarm attacks — particles rush toward the thumb and bounce off aggressively. But as the user remains still, the swarm gradually calms. Red shifts to silver. Chaotic paths become smooth orbital curves. Eventually: 40 particles orbit the thumb in a beautiful protective shield.

**Canvas physics**:
- 40 particles, initial state: random positions, random velocities in [-3, 3] range
- Aggressive phase: if pointer is down, particles accelerate toward pointer + bounce off within 20px
- Calm accumulation: each frame pointer is held still, `calmLevel += 0.002`
- Calm effects:
  - velocity max decreases: `3 * (1 - calm) + 0.5 * calm`
  - colour lerps: `[200, 50, 40]` → `[170, 175, 185]` (red → silver)
  - orbit tendency increases: tangential force component grows with calm
- Full calm (calm >= 1.0): all particles in stable circular orbit, radius `minDim*0.08`
- Performance: 40 particles, each with position + velocity + colour is lightweight

**Interaction**: `holdable`
**Haptics**: `hold_start`, `drag_snap` (aggressive bounces), `hold_threshold` (calm milestones), `completion`
**Scale**: `field`
**State**: 0-1 continuous (calm level)
**Resolution**: Calm level reaches 1.0 → stable orbit → `completion`
**Device**: `haptics`

**reducedMotion**: Particles start in orbital positions. Hold changes colour from red to silver without movement changes.

**Unique differentiation**: Patience-as-mechanic. The swarm's transformation from chaos to order is hypnotic. The user's stillness is the input.

---

#### ATOM 87: SHAME COMPASS (`shame-compass`)
**Name**: The Compass of Shame Engine — Navigating the Dark
**Intent**: Shame guards the gate to your values. Walk through shame to find the treasure.
**Render**: Canvas 2D

**Visual concept**: The screen is mostly dark. A compass needle at centre points into the absolute darkest corner of the viewport. A small safe zone of light exists around the user's draggable node. The user must drag their node away from the safe centre and follow the needle into the oppressive darkness. As they cross the threshold (enter the darkest zone), it bursts into brilliant light — their core value is revealed.

**Canvas physics**:
- Viewport divided into zones: centre (lit, safe), corners (dark, threatening)
- Compass needle: thin line from centre, rotation points toward darkest corner (pre-determined)
- User node: small glowing circle, draggable, starts at centre
- Light zone: radial gradient following user node, r=`minDim*0.1`
- Dark zone: target corner has extra-dense darkness (vignette overlay)
- Threshold: when node enters target corner (distance from corner < `minDim*0.15`)
- Revelation: corner explodes into light — radial gradient expands from corner
- Value text: a word appears in the light ("COURAGE", "HONESTY", "LOVE" — randomised)

**Interaction**: `draggable`
**Haptics**: `drag_snap` (moving through resistance), `step_advance` (entering dark zone), `completion` (revelation)
**Scale**: `full`
**State**: 0-1 continuous (distance toward target / max distance)
**Resolution**: Cross threshold → revelation → `completion`
**Device**: `haptics`

**reducedMotion**: Node teleports to threshold position on drag release near target. Instant light reveal.

**Unique differentiation**: Inverse navigation — the compass points toward fear, not safety. The dark→light burst is emotionally cathartic.

---

#### ATOM 88: ANGER FORGE (`anger-forge`)
**Name**: The Forge Engine — Transmuting Anger
**Intent**: Anger is kinetic energy. Strike the anvil to build something from the rage.
**Render**: Canvas 2D

**Visual concept**: A deformed, glowing red-hot mass of iron sits on a surface. The user must rhythmically tap the screen. Each tap triggers a hammer-strike visual (brief white flash + deformation). With each strike, the mass flattens slightly and cools slightly. After ~20 rhythmic strikes, the mass has been shaped into a recognisable tool form (sword or shield outline). The final form is cool steel — sharp, precise, useful.

**Canvas physics**:
- Iron mass: blobby polygon, initially very irregular (12 vertices with high random offsets)
- Strike detection: tap events
- Strike visual: white flash overlay (alpha 0.1 → 0 over 3 frames), camera shake (±2px)
- Per-strike: vertices lerp 5% toward target shape (sword/shield outline)
- Colour per-strike: `[220, 80, 30]` (red-hot) → `[160, 60, 30]` → `[100, 100, 110]` (cool steel)
- 20 strikes total for complete shaping
- Anvil surface: subtle horizontal line at `cy + minDim * 0.1`
- Sparks: 5-10 particles flying off impact point per strike, orange, fast, short-lived
- Rhythm bonus: if taps are rhythmic (consistent interval ±20%), shape converges faster

**Interaction**: `tappable`
**Haptics**: `tap` (each hammer strike — heavy metallic clang), `step_advance` (every 5th strike), `completion`
**Scale**: `focus`
**State**: 0-1 continuous (strikes / 20)
**Resolution**: 20 strikes → final form → `completion`
**Device**: `haptics`

**reducedMotion**: No camera shake, no sparks. Shape morphs instantly per tap. Colour changes without animation.

**Unique differentiation**: Rhythmic tapping as forging. The anger is channelled into creation. The increasingly precise shape emerging from chaos mirrors the psychological process.

---

#### ATOM 89: INNER CHILD (`inner-child`)
**Name**: The Inner Child Engine — The Vulnerability Drop
**Intent**: Logic cannot heal the deepest wounds. Drop the armour. Provide pure presence.
**Render**: Canvas 2D

**Visual concept**: A core of soft light at centre is wrapped in 4 concentric spinning metallic defensive rings. If the user touches normally (tap or fast drag), the rings recoil — spin faster, pull tighter. The user must execute an incredibly gentle, sustained touch (barely-there pressure, no movement). Slowly, the rings stop spinning, detach, and fall away one by one. The core of light is revealed — pulsing gently in sync with breath.

**Canvas physics**:
- Core: small radial gradient, r=`minDim*0.02`, warm colour
- 4 rings: concentric ellipses, each with rotation speed and radius
- Ring rendering: thin arcs (not full circles — 270deg arcs with gaps), metallic colour
- Aggressive touch: ring rotation speed *= 1.3, ring radius *= 0.95 (tighten)
- Gentle touch: velocity < 0.3 for sustained frames → `gentleLevel += 0.003`
- Ring shedding: at gentleLevel thresholds (0.25, 0.5, 0.75, 1.0), outermost ring detaches
- Detach animation: ring radius expands, alpha fades, rotation decelerates to 0
- Post-shed: core grows slightly with each ring removed
- Breath sync: at final state, core radius pulses with breathAmplitude

**Interaction**: `holdable`
**Haptics**: `hold_start` (gentle contact), `step_advance` (each ring shed), `completion` (core exposed)
**Scale**: `focus`
**State**: discrete (0-4 rings shed)
**Resolution**: All 4 rings shed → `completion`
**Device**: `haptics`

**reducedMotion**: Rings don't spin. Gentle hold removes rings one at a time without animation. Core pulses statically.

**Unique differentiation**: Gentleness-as-input. Aggression triggers defence, softness disarms. The spinning armour rings shedding one by one is visually dramatic. Breath-synced core at resolution is deeply intimate.

---

#### ATOM 90: PHOENIX ASH (`phoenix-ash`)
**Name**: The Phoenix Engine — The Beautiful Ash
**Intent**: The ash is not the end. It is the cradle. Blow away the ash to reveal the jewel.
**Render**: Canvas 2D

**Visual concept**: The screen is covered in a thick layer of grey ash particles. Underneath (hidden): a small, brilliant jewel shape at centre. The user swipes/drags across the screen. Where they drag, the ash particles scatter — blown away by the gesture. Progressive reveal of the clean surface beneath. The jewel glows once fully exposed. Optional: microphone input to "blow" ash away with breath.

**Canvas physics**:
- 3000 ash particles covering viewport, each 1-3px, grey tones with slight variation
- Drag-to-blow: pointer movement creates a circular wind zone (r=`minDim*0.06`)
- Wind physics: particles within the zone get velocity away from pointer direction
- Particles affected by wind drift off-screen and are removed
- Jewel: multi-faceted polygon at centre (8-vertex star), initially hidden (drawn under ash layer)
- Jewel reveal: composite canvas — draw jewel, then draw remaining ash particles on top
- Jewel luminance: as nearby ash clears, jewel alpha increases from 0 to 0.10
- Microphone fallback: if available, audio input amplitude adds wind to all particles
- Without mic: swipe-only interaction is fully functional

**Interaction**: `draggable`, `voice` (optional microphone)
**Haptics**: `drag_snap` (ash scatter), `step_advance` (jewel partially revealed), `completion` (fully exposed)
**Scale**: `full`
**State**: 0-1 continuous (percentage of ash cleared from jewel zone)
**Resolution**: Jewel zone >90% clear → `completion`
**Device**: `haptics`, `microphone` (optional)

**Microphone graceful degradation**: Attempt `navigator.mediaDevices.getUserMedia({ audio: true })` on first interaction. If denied or unavailable, proceed with drag-only mode. No error shown to user.

**reducedMotion**: Drag clears ash in large rectangular sections instead of particle-by-particle.

**Unique differentiation**: The ash-clearing reveal mechanic. 3000 particles for dense coverage. Optional microphone breath input adds a somatic dimension unique in the entire system.

---

### SERIES 10: THE REALITY BENDER
**Theme**: Total sovereignty — the user is no longer healing; they are architecting
**Color identity**: `#C9A87C` (warm gold — creation/mastery)
**Physics paradigm**: Blank canvases, world-building, weather engineering, infinite gestures

---

#### ATOM 91: ATMOSPHERE WEATHER (`atmosphere-weather`)
**Name**: The Atmosphere Engine — Generative Weather
**Intent**: Don't enter the room. Happen to the room. You bring the weather.
**Render**: Canvas 2D

**Visual concept**: Blank grey void. The user sweeps their hand across the glass. The velocity, curve, and duration of the swipe are analysed and translated into a weather system. Slow/gentle → warm golden drifting particles (breeze). Fast/sharp → crisp high-contrast updraft particles. The user paints the mood of the scene.

**Canvas physics**:
- Gesture analysis: track pointer velocity, curvature (angle change), and duration
- Weather mapping:
  - Slow + long: warm particles, amber colour, low velocity, drifting paths
  - Fast + short: crisp particles, blue-white, high velocity, directional
  - Curved: swirling particles, spiral paths
  - Straight: linear particle flows
- Particle emission: spawn 5 particles per frame during gesture, properties from analysis
- Particle lifetime: 180 frames, alpha fades in last 30
- Ambient lighting: background gradient shifts to match weather mood
- Up to 200 active particles (older ones expire)
- Multiple gestures layer — the user builds up the weather system

**Interaction**: `drawable`, `swipeable`
**Haptics**: `step_advance` (weather system established), `drag_snap` (gesture feedback)
**Scale**: `full`
**State**: continuous (weather complexity — particle count and variety)
**Resolution**: None — this is a generative sandbox. The user decides when they're done.
**Device**: `haptics`

**reducedMotion**: Particles move at 50% speed. No swirling. Simpler trajectories.

**Unique differentiation**: Gesture-to-weather translation. The user's movement style determines the emotional atmosphere. No two sessions produce the same result.

---

#### ATOM 92: DISTORTION GRID (`distortion-grid`)
**Name**: The Distortion Engine — Malleable Geometry
**Intent**: Reality is consensus hallucination. The rules can be bent. Warp the grid.
**Render**: Canvas 2D

**Visual concept**: A strict, rigid grid (corporate, institutional) covers the viewport. It looks immovable. The user presses and drags — the grid vertices near the touch deform like soft rubber, stretching around the touch point. Release: the grid slowly springs back to rigid (or stays warped — user's choice).

**Canvas physics**:
- Grid: 20x20 vertices, initial positions perfectly regular
- Vertex displacement: each vertex has `homeX, homeY` (rigid) and `currentX, currentY`
- Touch influence: vertices within `minDim*0.15` of pointer are displaced away from pointer
- Displacement falloff: gaussian — strongest at touch, fading with distance
- Spring physics: each frame, `current lerps toward home by 0.02` (slow return)
- While touching, displacement overrides spring return
- Grid rendering: draw lines connecting adjacent vertices, stroke alpha 0.04-0.06
- Fill: slight colour gradient in each cell based on distortion amount
- Multi-touch: supports multiple simultaneous distortion points

**Interaction**: `draggable`, `holdable`
**Haptics**: `drag_snap` (stretching resistance), `hold_start` (pressing into grid)
**Scale**: `full`
**State**: continuous (total grid distortion energy)
**Resolution**: None — meditative sandbox.
**Device**: `haptics`

**reducedMotion**: No spring animation on release. Grid snaps back instantly when pointer lifts.

**Unique differentiation**: The soft-rubber feel of a rigid grid is deeply satisfying. The contrast between the corporate aesthetic and the playful warping is the metaphor.

---

#### ATOM 93: BELIEF BRIDGE (`belief-bridge`)
**Name**: The Belief Bridge Engine — Faith Mechanics
**Intent**: The bridge only appears because you take the step. Step into the void.
**Render**: Canvas 2D

**Visual concept**: The user's avatar (small glowing circle) stands at the left edge of a platform. Ahead: a black, terrifying chasm. No bridge. No path. The user must drag their avatar directly out into the void. At the exact millisecond the avatar occupies empty space, a glowing stone tile materialises beneath it. One tile per step. The user walks across the void on tiles that only exist because they stepped.

**Canvas physics**:
- Platform: left-side solid rect, width `minDim*0.15`
- Avatar: small circle, r=`minDim*0.015`, draggable horizontally
- Chasm: everything right of platform is pure darkness
- Tile generation: when avatar x > last tile's right edge + gap, spawn new tile beneath avatar
- Tile: small rect, `minDim*0.06 x minDim*0.015`, materialises with alpha fade-in (0→0.06 over 8 frames)
- Tile colour: `lerpColor(primaryRgb, accentRgb, tileIndex / 12)` — shifts across the bridge
- Target: right-side platform at far edge, same style as left
- Heavy haptic `seal_stamp` on each tile materialisation
- 12 tiles to cross the full chasm

**Interaction**: `draggable`
**Haptics**: `seal_stamp` (each tile materialises), `completion` (reach far platform)
**Scale**: `full`
**State**: discrete (tiles created, 0-12)
**Resolution**: Avatar reaches far platform → `completion`
**Device**: `haptics`

**reducedMotion**: All 12 tiles pre-rendered at positions. Avatar movement is unconstrained. No materialisation animation.

**Unique differentiation**: Tiles-from-nothing is a profound metaphor for faith. Each `seal_stamp` haptic is the universe responding to courage. No other atom generates the ground beneath you as you walk.

---

#### ATOM 94: FUTURE MEMORY (`future-memory`)
**Name**: The Future Memory Engine — Temporal Authoring
**Intent**: The brain cannot distinguish between vivid memory and vivid simulation. Construct your future.
**Render**: Canvas 2D + DOM (text input)

**Visual concept**: A hazy, nebulous cloud of light particles floats at centre — undefined, unformed. A text input field appears below. As the user types their future intention, each character acts as a "seed crystal." The cloud rapidly crystallises around the text — fuzzy particles snap into geometric formations. The typed text appears embedded within a sharp, luminous structure. The future is "locked in."

**Canvas physics**:
- Cloud: 200 particles in brownian motion within `minDim*0.15` of centre, soft, hazy
- Text overlay: DOM input positioned below canvas, styled minimal
- Per character typed: 15 cloud particles snap from random to geometric positions
- Geometric positions: arranged in crystalline lattice (hexagonal grid within cloud zone)
- Crystallised particle: stops brownian motion, alpha increases, colour sharpens
- Text rendering: typed text drawn on canvas at centre, font = system serif
- Full crystallisation: when all 200 particles are locked, structure pulses once
- Structure glow: subtle radial gradient behind crystallised form

**Interaction**: `typeable`, `observable`
**Haptics**: `tap` (each character crystallises), `seal_stamp` (sentence complete), `completion`
**Scale**: `focus`
**State**: 0-1 continuous (characters typed / estimated word length ~20 chars)
**Resolution**: User presses enter or types period → structure seals → `completion`
**Device**: `haptics`

**reducedMotion**: Particles snap to geometric positions instantly. No brownian motion.

**Unique differentiation**: The ONLY atom with text input. Typing as crystallisation — each keystroke literally solidifies the future. The hazy-to-sharp visual transformation is beautiful.

---

#### ATOM 95: LUCK SURFACE (`luck-surface`)
**Name**: The Luck Surface Engine — Probability Expansion
**Intent**: Luck is not magic. It is geometry. Expand the net to catch more opportunities.
**Render**: Canvas 2D

**Visual concept**: A small, tight circle (comfort zone) sits at centre. High-value glowing particles (opportunities) fly rapidly across the screen in random directions, missing the small circle. The user pinch-expands the circle into a massive screen-filling net. Particles that hit the expanded surface light up — collision detected, opportunity caught. The more surface area, the more hits.

**Canvas physics**:
- Comfort zone: circle, initial r=`minDim*0.04`
- Pinch tracking: two-pointer distance increase maps to radius increase
- Max radius: `minDim*0.4` (fills most of screen)
- Particles: 30 opportunity particles, random directions, velocity 2-4px/frame
- Particle paths: straight lines across viewport, wrapping at edges
- Collision: when particle centre is within circle radius, particle "catches"
- Catch visual: particle stops, colour intensifies, emits brief radial pulse
- Catch counter: small tally at top of screen
- Net rendering: circle outline changes from thin solid to mesh-like pattern as it grows
- Net mesh: cross-hatch lines within the circle at large sizes

**Interaction**: `pinchable`
**Haptics**: `drag_snap` (expansion), `tap` (each particle catch — satisfying ping), `completion` (10 catches)
**Scale**: `full`
**State**: 0-1 continuous (catches / 10)
**Resolution**: 10 particles caught → `completion`
**Device**: `haptics`

**reducedMotion**: Particles move at 50% speed. No pulse on catch. Expansion is discrete (3 steps).

**Unique differentiation**: Probability as geometry — the visual proof that expanding your surface area catches more luck. Each catch is a dopamine hit.

---

#### ATOM 96: POSSIBILITY PRISM (`possibility-prism`)
**Name**: The Possibility Prism Engine — Refraction of Events
**Intent**: An event is white light. Pass it through a prism. See the spectrum of possibilities.
**Render**: Canvas 2D

**Visual concept**: A harsh beam of white light enters from the left side. A glass prism shape sits at centre (triangle). The user drags the prism into the beam's path. The light hits the prism surface, enters, slows down visually, and splits into 5 distinct coloured beams exiting the right side — each illuminating a different target zone. Each coloured beam represents a different interpretation/possibility.

**Canvas physics**:
- White beam: horizontal line from left edge to prism position, lineWidth 3, white, alpha 0.08
- Prism: equilateral triangle, `minDim*0.06` side, draggable
- Refraction trigger: when prism overlaps beam path
- Split beams: 5 lines emanating from prism's right vertex, angles ±15deg, ±7deg, 0deg
- Beam colours: 5 colours from `lerpColor(primaryRgb, accentRgb, t)` at t = 0, 0.25, 0.5, 0.75, 1.0
- Target zones: 5 small circles on the right side where beams land
- Zone illumination: target circle glows when beam reaches it
- Prism rendering: transparent fill with subtle internal refraction lines
- Light speed: visible "travel" from prism to targets (beam extends rightward over 30 frames)

**Interaction**: `draggable`
**Haptics**: `drag_snap` (prism snaps to beam), `step_advance` (each beam reaches target), `completion` (all 5)
**Scale**: `field`
**State**: discrete (beams reaching targets, 0-5)
**Resolution**: All 5 beams reach targets → `completion`
**Device**: `haptics`

**reducedMotion**: Beams appear instantly when prism is placed. No travel animation.

**Unique differentiation**: Optical physics as cognitive reframing. A single white "event" splitting into a spectrum of interpretations. The prism-drag mechanic is elegant and tactile.

---

#### ATOM 97: ARCHITECT STONE (`architect-stone`)
**Name**: The Architect Engine — Foundation Laying
**Intent**: Every castle needs a cornerstone. Lay it with absolute, unshakeable permanence.
**Render**: Canvas 2D

**Visual concept**: A massive, textured stone block hovers above a grid. The user drags it downward. It resists — heavy, slow, high-friction drag. When it touches the bottom of the grid, it does not bounce. Zero elasticity. The heaviest possible haptic thud. The screen perfectly aligns and stabilises around the stone. Construction lines appear — the beginning of a foundation.

**Canvas physics**:
- Stone: large rounded rect, `minDim*0.15 x minDim*0.1`, textured fill (noise pattern)
- Hover position: `cy - minDim*0.12`
- Drag physics: `velocity = pointerDelta * 0.3` (heavy — 0.3x movement multiplier)
- Gravity assist: stone gently drifts downward on its own (gravity = 0.05)
- Landing zone: grid floor at `cy + minDim*0.15`
- Impact: zero bounce (elasticity = 0), stone locks to exact grid position
- Screen align: subtle camera shake (2px) on impact, then everything snaps to grid
- Construction lines: horizontal lines extend outward from stone edges after landing
- Stone colour: `[140, 130, 115]` — warm grey stone, lerped with primaryRgb
- Post-landing: stone is immovable, slight warm glow from beneath

**Interaction**: `draggable`
**Haptics**: `drag_snap` (heavy dragging), `seal_stamp` (the landing — deepest possible thud), `completion`
**Scale**: `focus`
**State**: discrete — `hovering`, `dragging`, `placed`, `complete`
**Resolution**: Stone placed → `completion`
**Device**: `haptics`

**reducedMotion**: Stone starts at landing position. Tap to place. No drag physics.

**Unique differentiation**: The HEAVIEST atom. Maximum friction, zero bounce, deepest haptic. The permanence is the point — this foundation will not move.

---

#### ATOM 98: NARRATIVE OVERRIDE (`narrative-override`)
**Name**: The Narrative Override Engine — The Pen
**Intent**: You are the author. Rewrite the script. The pen never leaves your hand.
**Render**: Canvas 2D

**Visual concept**: Toxic narrative text is written across the screen in dark, rigid, oppressive typography. The user's finger acts as an eraser/pen. As they swipe through the dark text, it bleeds out like wet ink, replaced by glowing golden script. The replacement text is not predefined — it's the user overwriting darkness with light. The transition is fluid and continuous.

**Canvas physics**:
- Dark text: 3 lines of negative statements, dark colour, rigid font
  - "I am not enough."
  - "I will always fail."
  - "I am alone."
- Eraser zone: circular mask following pointer, r=`minDim*0.04`
- Ink bleed: dark text within mask zone fades with a "wet ink spreading" effect
- Golden text: new text appears in the erased zone
  - "I am enough."
  - "I am learning."
  - "I am connected."
- Text rendering: draw dark text on one composite canvas, golden on another, mask with pointer trail
- Trail persistence: pointer path is accumulated (alpha channel mask grows)
- Ink bleed visual: dark text alpha decreases outward from trail centre
- Full coverage: when >80% of text area has been swiped, golden text fully replaces dark

**Interaction**: `draggable` (erasing/writing)
**Haptics**: `drag_snap` (pen on glass feel), `step_advance` (each line transformed), `completion`
**Scale**: `full`
**State**: 0-1 continuous (coverage of erased area)
**Resolution**: >80% coverage → `completion`
**Device**: `haptics`

**reducedMotion**: Each swipe transforms an entire line at once. No gradual ink bleed.

**Unique differentiation**: The user literally rewrites their narrative by physically erasing dark text and revealing light. The wet-ink transition effect is beautiful. The specific text transformations are therapeutically chosen.

---

#### ATOM 99: PURE YES (`pure-yes`)
**Name**: The Pure Yes Engine — Unhindered Expansion
**Intent**: Remove all resistance. Allow infinite, joyful expansion. Zero friction. Zero limit.
**Render**: Canvas 2D

**Visual concept**: The user touches the centre. Unlike every other atom, there is ZERO friction. A massive, continuous, accelerating bloom of light expands from the touch point. It fills the viewport, then keeps expanding (the "light" pushes past the edges — the entire canvas brightens). The bloom never stops while the finger is held. Particles join the bloom — riding the expansion wave outward. Pure, unhindered yes.

**Canvas physics**:
- Touch triggers bloom: radial gradient expanding from touch point
- Expansion rate: accelerating — `radius += radius * 0.02 + 1` (exponential growth)
- No cap: radius can exceed viewport (the edges glow — radial gradient extends beyond bounds)
- Bloom colour: starts warm gold, shifts through spectrum as it grows
- Riding particles: 100 particles spawned at touch, ride the expansion wave outward
- Particle positions: `r = bloomRadius * (particleOffset)`, maintaining relative position on wave
- Canvas brightness: global alpha overlay increases as bloom grows
- Release: bloom holds at current size, gently pulsing with breath
- Optional: multiple touches create multiple blooms that merge

**Interaction**: `holdable`
**Haptics**: `hold_start`, `breath_peak` (continuous expansion pulses)
**Scale**: `full`
**State**: continuous (bloom radius — no upper bound)
**Resolution**: None explicit — the atom is about the FEELING of unhindered expansion. After 10 seconds, `completion` fires.
**Device**: `haptics`

**reducedMotion**: Static golden gradient fills viewport from touch point. No expansion animation.

**Unique differentiation**: The ONLY atom with zero friction and no upper bound. It just... expands. The acceleration creates euphoria. Every other atom has limits — this one doesn't.

---

#### ATOM 100: INFINITE OUROBOROS (`infinite-ouroboros`)
**Name**: The Infinite Engine — The Ouroboros
**Intent**: Mastery is not a destination. It is an eternal loop. The end is the beginning.
**Render**: Canvas 2D

**Visual concept**: An elegant, softly glowing infinity symbol (lemniscate) rendered in 3D-esque perspective at the centre. The user traces it with their finger. A brilliant light follows the touch point. Because the shape is infinite, the user never hits a wall or boundary. They can trace it forever. A smooth, frictionless, rhythmic haptic glide matches the curve. The trail accumulates — after several loops, the entire lemniscate is illuminated.

**Canvas physics**:
- Lemniscate curve: parametric `x = a * cos(t) / (1 + sin²(t))`, `y = a * sin(t) * cos(t) / (1 + sin²(t))`
- Scale: `a = minDim * 0.2`
- Centre: `(cx, cy)`
- Trail: array of illuminated points along the curve (where user has traced)
- Touch proximity: if pointer is within `minDim*0.02` of any curve point, that point illuminates
- Illumination: each point has alpha 0→0.06 when touched, fades slowly (0.0005/frame)
- Re-tracing strengthens: each pass through a point increases its max alpha by 0.01
- Light following: a bright point on the curve nearest to the pointer, glow radius `minDim*0.015`
- Curve rendering: base curve drawn at alpha 0.015, illuminated portions at higher alpha
- Crossing point: where the curve crosses itself, a subtle pulse (the eternal return)

**Interaction**: `drawable`, `breathable`
**Haptics**: `breath_peak` (at each crossing point — the eternal pulse)
**Scale**: `focus`
**State**: continuous (loops completed — but never "done")
**Resolution**: None — this IS the infinite game. After 3 complete traces, fire `completion` to signal engagement but the atom continues.
**Device**: `haptics`

**reducedMotion**: Curve is fully illuminated. No tracing required. Crossing point pulses with breath.

**Unique differentiation**: The capstone atom. Atom 100. The mathematical infinity symbol that you can trace forever. The accumulating light trail. The haptic pulse at the crossing point. This is not the end — it IS the infinite game.

---

## 4. REGISTRY UPDATE PLAN

### types.ts — Replace placeholder AtomIds

Replace `retro-causal-3` through `retro-causal-10`, `kinematic-3` through `kinematic-10`,
`shadow-crucible-3` through `shadow-crucible-10`, and `reality-bender-3` through `reality-bender-10`
with the final 40 descriptive IDs listed above.

Also update the existing early-draft IDs:
- `color-grade` → `chromatic-grade` (and renumber 61→62)
- `narrative-flip` stays but renumber 62→63
- `fractal-zoom` stays but renumber 71→72
- `overview-effect` stays but renumber 72→71
- `crucible` → `crucible-fire` (keeps 81)
- `shadow-hug` stays (keeps 82)
- `atmosphere-engineer` → `atmosphere-weather` (keeps 91)
- `infinite-seal` → `infinite-ouroboros` (renumber 92→100)

### atom-registry.ts — Full entries for all 40

Replace all placeholder entries with complete `AtomMeta` objects matching
the specifications above. The `status` field should be `'designed'` initially,
changed to `'complete'` as each atom is built.

### index.ts — Barrel exports

Add lazy imports and ATOM_COMPONENTS entries for all 40 atoms as they are built.

---

## 5. BUILD ORDER RECOMMENDATION

Build in series order, 1 atom at a time:

**Phase 1: Series 7** (canvas-heavy, establishes retro-causal patterns)
61 → 62 → 63 → 64 → 65 → 66 → 67 → 68 → 69 → 70

**Phase 2: Series 8** (scale/zoom mechanics, fractal rendering)
71 → 72 → 73 → 74 → 75 → 76 → 77 → 78 → 79 → 80

**Phase 3: Series 9** (emotionally intense, precision interactions)
81 → 82 → 83 → 84 → 85 → 86 → 87 → 88 → 89 → 90

**Phase 4: Series 10** (capstone — generative, open-ended, triumphant)
91 → 92 → 93 → 94 → 95 → 96 → 97 → 98 → 99 → 100

---

## 6. QUALITY CHECKLIST PER ATOM

Before marking any atom as `'complete'`:

- [ ] Imports ONLY from `../atom-utils` (zero inline colour/easing code)
- [ ] Uses `ENTRANCE_RATE_ENTER` / `ENTRANCE_RATE_ACTIVE` tokens
- [ ] All palette constants are `RGB` tuples with `lerpColor(CONST, primaryRgb, t)`
- [ ] Background alpha: `entrance * 0.03` maximum
- [ ] Element alphas within `ELEMENT_ALPHA` ranges
- [ ] `reducedMotion` fully threaded (every `Math.sin`, rotation, velocity)
- [ ] `setupCanvas` or equivalent DPR-correct rendering
- [ ] Canvas `clearRect` called every frame
- [ ] All content centred within viewport (`cx`, `cy`, `minDim`)
- [ ] Haptic events match the registry
- [ ] `onStateChange` reports normalised 0-1 progress
- [ ] `onResolve` fires at therapeutic completion (if `hasResolution`)
- [ ] Pointer events use `setPointerCapture`/`releasePointerCapture`
- [ ] Animation cleanup: `cancelAnimationFrame` in useEffect return
- [ ] Audio cleanup (S7): disconnect all nodes, close context on unmount
- [ ] No `framer-motion` — only `motion/react`
- [ ] No `react-router-dom` — only `react-router`
- [ ] No `useShallow` from `zustand` — only from `zustand/react/shallow`
- [ ] TypeScript strict — no `any`, no `@ts-ignore`
- [ ] Component is default export
- [ ] File JSDoc header matches registry intent

---

## 7. DEPENDENCY NOTES

- **No new packages required** — all 40 atoms use Canvas 2D + existing deps
- Web Audio API is native browser API (atoms 61, 90)
- Microphone API is native browser API (atom 90, optional)
- Multi-touch: native PointerEvent tracking (atoms 67, 70, 71, 75, 77, 85, 95)
- Text input: single DOM `<input>` element overlaid on canvas (atom 94 only)

---

*End of blueprint. Ready for review.*
