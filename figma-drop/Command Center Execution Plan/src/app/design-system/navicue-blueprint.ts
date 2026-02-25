/**
 * NAVICUE DESIGN BLUEPRINT
 * ========================
 * 
 * The scalable foundation for 1,435 NaviCues.
 * THE SINGLE AUTHORITY for all specimen-domain design decisions.
 * 
 * PHILOSOPHY: Every NaviCue is a tiny world. Same grammar, unique poetry.
 * 
 * TOKEN AUTHORITY (what lives here and nowhere else):
 *   Typography    -> navicueType (micro, kbeLabel, status...hero, 11px floor)
 *   Composited    -> navicueStyles (kbeLabel, annotation, accentReadout,
 *                                   shadowAnnotation, interactionHint, accentHint,
 *                                   interactionContainer) -- palette-aware factories
 *   Interaction   -> navicueInteraction (tapZone, tapHint, holdZone,
 *                                        dragTrack, drawCanvas, input, dot, progress)
 *   Layout        -> navicueLayout (immersive, centered, content, contentLab,
 *                                   stageContent, stageContentLab)
 *   Tap helper    -> immersiveTap(palette, glowRadius?) -- GOLD STANDARD
 *   Tap pill (T)  -> immersiveTapPillThemed(accentHSL) -- themed tap pill for series specimens
 *   Hold helper   -> immersiveHoldButton(palette, size?, glowRadius?)
 *   Hold pill     -> immersiveHoldPill(palette) -- pill-shaped hold buttons
 *   Hold pill (T) -> immersiveHoldPillThemed(accentHSL) -- themed pill for series specimens
 *   Hold scene    -> immersiveHoldScene(palette, w, h) -- rectangular scene containers
 *   Visibility    -> safeOpacity(value, floor?), safeStroke(value, floor?), safeAlpha(value)
 *   Motion safety -> safeAnimate(props), safeNumber(value, fallback?)
 *   Color temp    -> applyColorTemperature(palette, config)
 *   Chrono worlds -> CHRONO_MODIFIERS (morning/work/social/night)
 *   Palette       -> createNaviCuePalette(signature, mechanism?, kbe?)
 *   Atmosphere    -> createAtmosphereConfig(palette, signature, form?)
 *   Motion        -> createMotionConfig(signature)
 *   Quickstart    -> navicueQuickstart(signature, mechanism?, kbe?, form?)
 *
 * DEPRECATED (do not use in new code):
 *   navicueButtonStyle()    -> replaced by immersiveTapButton() (no pill buttons)
 *   navicueInteraction.button / buttonSmall -> replaced by tapButton/tapButtonSmall
 *   Spreading `...tapZone, ...navicueType.hint` -> replaced by immersiveTapButton()
 *   navicue-tokens.ts       -> legacy magic/typography/interaction
 *   navicue-magic-colors.ts -> legacy hex-based color system
 *   navicueTypography in design-tokens.ts -> legacy contemplative typography
 *
 * GOLD STANDARD (established by S101-S120, specimens 1001-1200):
 *   1. Text-based tap interactions MUST use immersiveTapButton(palette)
 *      - Never spread `...tapZone, ...navicueType.hint` (creates invisible tap targets)
 *      - tapButton geometry ensures 48px minimum with visible padding
 *      - Glow feedback on active state makes touch response clear
 *   2. Visual-only tap interactions (SVG, canvas) use immersiveTap(palette)
 *   3. No sub-11px fonts -- runtime enforced by sanitizeCopy in NaviCueShell/Verse
 *   4. 48px minimum touch targets -- enforced by tapButton/tapZone.minWidth/minHeight
 *   5. 120px hold zones -- enforced by holdZone dimensions
 *   6. Smooth CSS transitions -- no clunky UI chrome
 *   7. Mobile-first immersive interactions -- visual IS the interaction
 * 
 * ARCHITECTURE:
 * 1. magicSignatures (design-tokens.ts) define 8 aesthetic families
 * 2. This blueprint provides the DERIVATION SYSTEM that generates
 *    per-specimen palettes, atmosphere configs, and motion from those families
 * 3. Shared components (NaviCueShell, NaviCueAtmosphere) consume these tokens
 * 4. Bespoke implementations focus ONLY on their unique interaction/narrative
 * 
 * COLOR MATRIX:
 * - Magic Signature sets the BASE HUE FAMILY (warm stone, deep ocean, etc.)
 * - Mechanism provides an ACCENT SHIFT (metacognition=cool, compassion=warm)
 * - KBE Layer controls INTENSITY (believing=softer/lighter, embodying=deeper/richer)
 * - Each specimen gets a unique micro-variation within its family
 * 
 * STAGE SYSTEM:
 * Every NaviCue follows this arc:
 *   arriving  -> The world appears (1.5-3s)
 *   present   -> The invitation/prompt (user sees the challenge)
 *   active    -> The interaction (user engages)
 *   resonant  -> The landing (insight settles, 3-6s)
 *   afterglow -> The fade (poetic coda, auto-advances)
 * 
 * Not all stages are used in every NaviCue, but the arc is always:
 * threshold -> engagement -> landing
 */

import { magicSignatures, withAlpha, surfaces, fonts, radius } from '@/design-tokens';

// Re-export radius so NaviCue implementations can import it from either location
export { radius };

// Re-export fonts so NaviCue implementations can access fonts.mono without a second import
export { fonts };

// =====================================================================
// TYPES
// =====================================================================

export type MagicSignatureKey = keyof typeof magicSignatures;

export type NaviCueStage = 
  | 'arriving'   // World appears
  | 'present'    // Invitation visible
  | 'active'     // User interacting
  | 'resonant'   // Insight landing
  | 'afterglow'; // Poetic fade

export type ContainerMode = 'immersive' | 'centered';

// =====================================================================
// FORM-BASED ATMOSPHERE MOODS
// =====================================================================

/**
 * Each NaviCue form creates a different kind of "world feel."
 * These moods modify the base signature atmosphere.
 * 
 * Think of it as:
 *   Magic Signature = what planet you're on
 *   Form Mood = what weather system you're experiencing
 *   Mechanism = accent lighting
 *   KBE = time of day (believing=dawn, knowing=noon, embodying=golden hour)
 * 
 * This is the missing layer that makes two sacred_ordinary specimens
 * feel like the same family but different rooms.
 */
export type NaviCueForm = 
  // ── Original 7 (Integrate series forms) ──
  | 'Mirror'          // Reflective shimmer, bilateral, glass surface
  | 'Probe'           // Depth-pulling, concentric, inward gravity
  | 'Key'             // Vault precision, contained dust, mechanical
  | 'InventorySpark'  // Firefly discovery, bright scattered sparks
  | 'Practice'        // Spacious sky, slow drift, breathing room
  | 'PartsRollcall'   // Multiple soft presences, orbiting chorus
  | 'IdentityKoan'    // Still singularity, minimal, intense center
  // ── Expanded archetypes (series-family atmosphere moods) ──
  | 'Ember'           // Rising warmth, campfire sparks (Shaman, Ancestor, Alchemist-heat)
  | 'Stellar'         // Vast star field, deep expanse (Astronaut, Stargazer, Observer)
  | 'Canopy'          // Dappled filtering light, organic (Gardener, Gaia, Wilding)
  | 'Storm'           // Dynamic chaos settling to calm (Trickster, Glitch, LoopBreaker)
  | 'Ocean'           // Deep pressure, slow lateral drift (Void, DreamWalker)
  | 'Theater'         // Dramatic spotlight, stage glow (Maestro, MythMaker, Biographer)
  | 'Hearth'          // Intimate contained warmth (Guardian, Lover, Servant, Diplomat)
  | 'Circuit'         // Digital precision, grid pulse (Hacker, Futurist, Engineer, Mentat)
  | 'Cosmos'          // Expansive dark, distant light (Infinite, Horizon, Ascendant, OmegaPoint)
  // ── Second Millennium forms ──
  | 'Glacier'         // Slow crystalline drift, cold clarity (Catalyst Chemistry S107)
  | 'Tide'            // Rhythmic lateral swell, probability pulse (Quantum Architect S108)
  | 'Lattice'         // Structural tension web, interlocking nodes (Tensegrity S116)
  | 'Compass'         // Directional oriented navigation, cardinal clarity (Wayfinder S117)
  | 'Pulse'           // Rhythmic signal amplitude, reception beat (Receiver S118)
  | 'Drift'           // Directional flow, trajectory momentum (Vector S119)
  | 'Echo';           // Reverberant harmonic, resonant decay (Tuning S120)

export interface AtmosphereMoodModifiers {
  /** Multiply base particle count (0.5 = half, 2 = double) */
  particleMultiplier: number;
  /** Multiply base particle speed */
  speedMultiplier: number;
  /** Override particle drift range in px */
  driftRange: number;
  /** Background gradient focal point - where the light source lives */
  gradientOrigin: string;
  /** Background gradient reach - how far the glow extends (%) */
  gradientReach: number;
  /** Secondary background layer (vignette, depth, etc.) */
  secondaryLayer: string | null;
  /** Ambient glow orb: soft radial light that breathes */
  glowOrb: { x: string; y: string; size: string; opacity: number } | null;
  /** Particle opacity ceiling (0-1) - controls overall brightness */
  particleOpacityMax: number;
  /** Optional secondary particle color (null = use primary) */
  secondaryParticleColor: 'accent' | 'secondary' | null;
  /** Fraction of particles that use the secondary color (0-1) */
  secondaryParticleFraction: number;
}

/**
 * Form mood definitions.
 * Each form/archetype gets a distinct atmosphere character.
 * 
 * ORIGINAL 7: Mirror, Probe, Key, InventorySpark, Practice, PartsRollcall, IdentityKoan
 * EXPANDED 9: Ember, Stellar, Canopy, Storm, Ocean, Theater, Hearth, Circuit, Cosmos
 * 
 * The expanded archetypes cover the full 100-series landscape so every
 * series family gets a contextually relevant living atmosphere.
 */
const FORM_MOODS: Record<NaviCueForm, AtmosphereMoodModifiers> = {
  // ═══════════════════════════════════════════════════════════════
  // ORIGINAL 7 - Integrate series forms
  // ═══════════════════════════════════════════════════════════════
  Mirror: {
    particleMultiplier: 1.0,
    speedMultiplier: 0.7,
    driftRange: 25,
    gradientOrigin: '50% 50%',       // centered - symmetrical
    gradientReach: 70,
    secondaryLayer: 'linear-gradient(180deg, transparent 0%, FAINT 100%)',  // bottom reflection pool
    glowOrb: { x: '50%', y: '35%', size: '40%', opacity: 0.06 },
    particleOpacityMax: 0.2,
    secondaryParticleColor: 'secondary',
    secondaryParticleFraction: 0.3,
  },
  Probe: {
    particleMultiplier: 0.8,
    speedMultiplier: 0.5,
    driftRange: 15,                   // tight, gravitational
    gradientOrigin: '50% 60%',       // light source below center - depth
    gradientReach: 55,
    secondaryLayer: 'radial-gradient(circle at 50% 50%, GLOW 0%, transparent 40%)',  // core pull
    glowOrb: { x: '50%', y: '55%', size: '25%', opacity: 0.08 },
    particleOpacityMax: 0.22,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.2,
  },
  Key: {
    particleMultiplier: 0.6,
    speedMultiplier: 0.4,
    driftRange: 20,
    gradientOrigin: '50% 45%',       // slightly high - vault ceiling light
    gradientReach: 60,
    secondaryLayer: null,              // clean, mechanical
    glowOrb: null,                     // no soft glow - precision
    particleOpacityMax: 0.15,         // dust motes, very subtle
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.15,
  },
  InventorySpark: {
    particleMultiplier: 1.5,
    speedMultiplier: 1.2,
    driftRange: 55,                   // wide scatter - discovery
    gradientOrigin: '50% 40%',
    gradientReach: 75,
    secondaryLayer: null,
    glowOrb: { x: '50%', y: '40%', size: '50%', opacity: 0.04 },
    particleOpacityMax: 0.3,          // bright sparks
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.4,   // lots of accent sparks
  },
  Practice: {
    particleMultiplier: 1.2,
    speedMultiplier: 0.6,
    driftRange: 50,                   // wide, lazy drift - sky
    gradientOrigin: '50% 30%',       // high - open sky
    gradientReach: 85,
    secondaryLayer: 'linear-gradient(180deg, GLOW 0%, transparent 50%)',  // sky wash
    glowOrb: { x: '50%', y: '25%', size: '60%', opacity: 0.04 },
    particleOpacityMax: 0.18,
    secondaryParticleColor: 'secondary',
    secondaryParticleFraction: 0.25,
  },
  PartsRollcall: {
    particleMultiplier: 1.3,
    speedMultiplier: 0.8,
    driftRange: 35,
    gradientOrigin: '50% 45%',
    gradientReach: 65,
    secondaryLayer: null,
    glowOrb: { x: '50%', y: '45%', size: '35%', opacity: 0.05 },
    particleOpacityMax: 0.25,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.3,   // accent particles = "other voices"
  },
  IdentityKoan: {
    particleMultiplier: 0.5,
    speedMultiplier: 0.3,
    driftRange: 10,                   // almost still - singularity
    gradientOrigin: '50% 50%',
    gradientReach: 45,                // tight, intense center
    secondaryLayer: 'radial-gradient(circle at 50% 50%, GLOW 0%, transparent 30%)',
    glowOrb: { x: '50%', y: '50%', size: '20%', opacity: 0.1 },
    particleOpacityMax: 0.2,
    secondaryParticleColor: null,     // monochrome - pure
    secondaryParticleFraction: 0,
  },

  // ══════════════════════════════════════════════════════════════���
  // EXPANDED 9 - Series-family atmosphere archetypes
  // ═══════════════════════════════════════════════════════════════

  /** Ember - rising warmth, sparks climbing like a sacred fire.
   *  For: Shaman, Ancestor, Alchemist-heat, Elemental-Fire, MagnumOpus */
  Ember: {
    particleMultiplier: 1.1,
    speedMultiplier: 0.9,
    driftRange: 20,                   // mostly upward, slight wander
    gradientOrigin: '50% 75%',       // light source LOW - fire below
    gradientReach: 65,
    secondaryLayer: 'linear-gradient(0deg, GLOW 0%, transparent 40%)',  // warm floor glow
    glowOrb: { x: '50%', y: '70%', size: '45%', opacity: 0.07 },
    particleOpacityMax: 0.28,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.35,
  },

  /** Stellar - vast star field, distant and expansive.
   *  For: Astronaut, Stargazer, Observer, Schrodinger */
  Stellar: {
    particleMultiplier: 1.8,
    speedMultiplier: 0.3,
    driftRange: 8,                    // nearly still - stars don't rush
    gradientOrigin: '50% 50%',
    gradientReach: 90,                // wide, everywhere
    secondaryLayer: null,              // pure dark sky
    glowOrb: null,                     // no glow - just stars
    particleOpacityMax: 0.35,         // bright pinpoints
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.2,
  },

  /** Canopy - dappled light filtering through leaves, organic drift.
   *  For: Gardener, Gaia, Wilding, Elementalist-Earth */
  Canopy: {
    particleMultiplier: 1.4,
    speedMultiplier: 0.5,
    driftRange: 40,                   // lazy lateral - light through trees
    gradientOrigin: '50% 20%',       // light from above - canopy
    gradientReach: 80,
    secondaryLayer: 'linear-gradient(180deg, GLOW 0%, transparent 35%, FAINT 100%)',  // sky through canopy + forest floor
    glowOrb: { x: '45%', y: '20%', size: '55%', opacity: 0.05 },
    particleOpacityMax: 0.22,
    secondaryParticleColor: 'secondary',
    secondaryParticleFraction: 0.35,
  },

  /** Storm - active initial energy that settles to stillness.
   *  For: Trickster, Glitch, LoopBreaker, Adaptive, Pattern-series */
  Storm: {
    particleMultiplier: 1.6,
    speedMultiplier: 1.4,
    driftRange: 60,                   // chaotic - storm scatter
    gradientOrigin: '45% 40%',       // slightly off-center - unstable
    gradientReach: 70,
    secondaryLayer: 'radial-gradient(ellipse at 55% 45%, GLOW 0%, transparent 50%)',
    glowOrb: { x: '55%', y: '40%', size: '35%', opacity: 0.06 },
    particleOpacityMax: 0.3,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.45,  // lots of accent = visual noise
  },

  /** Ocean - deep pressure, slow lateral drift, bottom-of-the-sea.
   *  For: Void, DreamWalker, deep Threshold, Elemental-Water */
  Ocean: {
    particleMultiplier: 0.9,
    speedMultiplier: 0.4,
    driftRange: 30,                   // lateral drift - current
    gradientOrigin: '50% 30%',       // light filtering from above surface
    gradientReach: 50,                // limited - deep water
    secondaryLayer: 'linear-gradient(180deg, FAINT 0%, transparent 30%, GLOW 100%)',  // light above, dark depth
    glowOrb: { x: '50%', y: '25%', size: '50%', opacity: 0.04 },
    particleOpacityMax: 0.18,
    secondaryParticleColor: 'secondary',
    secondaryParticleFraction: 0.2,
  },

  /** Theater - dramatic spotlight, stage presence, directed attention.
   *  For: Maestro, MythMaker, Biographer, Catalyst, Composer */
  Theater: {
    particleMultiplier: 0.7,
    speedMultiplier: 0.5,
    driftRange: 15,
    gradientOrigin: '50% 25%',       // spotlight from above
    gradientReach: 55,                // focused pool of light
    secondaryLayer: 'radial-gradient(ellipse at 50% 30%, GLOW 0%, transparent 45%)',  // stage light cone
    glowOrb: { x: '50%', y: '30%', size: '30%', opacity: 0.09 },
    particleOpacityMax: 0.15,         // dust in spotlight
    secondaryParticleColor: null,
    secondaryParticleFraction: 0,
  },

  /** Hearth - intimate contained warmth, close and protective.
   *  For: Guardian, Lover, Servant, Diplomat, SocialPhysics */
  Hearth: {
    particleMultiplier: 0.8,
    speedMultiplier: 0.5,
    driftRange: 20,
    gradientOrigin: '50% 55%',       // warm center - heart level
    gradientReach: 60,
    secondaryLayer: 'radial-gradient(circle at 50% 55%, GLOW 0%, transparent 50%)',  // warm center glow
    glowOrb: { x: '50%', y: '50%', size: '40%', opacity: 0.07 },
    particleOpacityMax: 0.2,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.25,
  },

  /** Circuit - digital precision, minimal, grid-like awareness.
   *  For: Hacker, Futurist, Engineer, Mentat, Cognitive */
  Circuit: {
    particleMultiplier: 0.7,
    speedMultiplier: 0.6,
    driftRange: 12,                   // tight, controlled
    gradientOrigin: '50% 50%',
    gradientReach: 65,
    secondaryLayer: null,              // clean digital space
    glowOrb: null,                     // precision, no soft glow
    particleOpacityMax: 0.2,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.5,   // heavy accent = data-like
  },

  /** Cosmos - expansive darkness with distant light, vast perspective.
   *  For: Infinite, Horizon, Ascendant, OmegaPoint, Source, Unity */
  Cosmos: {
    particleMultiplier: 1.3,
    speedMultiplier: 0.35,
    driftRange: 45,                   // wide, slow - everything is far away
    gradientOrigin: '50% 50%',
    gradientReach: 95,                // extends to edges - vastness
    secondaryLayer: 'radial-gradient(circle at 50% 50%, GLOW 0%, transparent 60%)',
    glowOrb: { x: '50%', y: '50%', size: '65%', opacity: 0.035 },
    particleOpacityMax: 0.22,
    secondaryParticleColor: 'secondary',
    secondaryParticleFraction: 0.3,
  },

  // ── Second Millennium forms ──

  /** Glacier -- slow crystalline drift, cold translucent clarity.
   *  For: Catalyst Chemistry (S107) */
  Glacier: {
    particleMultiplier: 0.6,
    speedMultiplier: 0.25,           // glacially slow
    driftRange: 18,                   // tight, crystalline structure
    gradientOrigin: '50% 80%',        // light refracting up from below
    gradientReach: 70,
    secondaryLayer: 'linear-gradient(to top, GLOW 0%, transparent 40%)', // ice-floor glow
    glowOrb: { x: '50%', y: '75%', size: '50%', opacity: 0.04 },
    particleOpacityMax: 0.18,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.2,
  },

  /** Tide -- rhythmic lateral swell, probability-wave pulse.
   *  For: Quantum Architect (S108) */
  Tide: {
    particleMultiplier: 0.9,
    speedMultiplier: 0.5,
    driftRange: 35,                   // wide lateral swell
    gradientOrigin: '30% 50%',        // off-center tidal pull
    gradientReach: 80,
    secondaryLayer: 'linear-gradient(90deg, GLOW 0%, transparent 30%, transparent 70%, GLOW 100%)', // tidal edges
    glowOrb: { x: '35%', y: '50%', size: '55%', opacity: 0.04 },
    particleOpacityMax: 0.2,
    secondaryParticleColor: 'secondary',
    secondaryParticleFraction: 0.35,
  },

  /** Lattice -- structural tension web, interlocking nodes.
   *  For: Tensegrity (S116) */
  Lattice: {
    particleMultiplier: 0.7,
    speedMultiplier: 0.4,
    driftRange: 14,                   // tight, structural, web-like
    gradientOrigin: '50% 50%',        // centered -- structural balance
    gradientReach: 60,
    secondaryLayer: null,              // clean, engineering precision
    glowOrb: { x: '50%', y: '50%', size: '35%', opacity: 0.05 },
    particleOpacityMax: 0.18,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.3,
  },

  /** Compass -- directional navigation, cardinal clarity.
   *  For: Wayfinder (S117) */
  Compass: {
    particleMultiplier: 0.8,
    speedMultiplier: 0.5,
    driftRange: 25,                   // moderate -- purposeful movement
    gradientOrigin: '50% 35%',        // north pull -- looking ahead
    gradientReach: 70,
    secondaryLayer: 'radial-gradient(circle at 50% 40%, GLOW 0%, transparent 45%)', // compass glow
    glowOrb: { x: '50%', y: '35%', size: '40%', opacity: 0.05 },
    particleOpacityMax: 0.2,
    secondaryParticleColor: 'secondary',
    secondaryParticleFraction: 0.25,
  },

  /** Pulse -- rhythmic signal, reception beat, amplitude waves.
   *  For: Receiver (S118) */
  Pulse: {
    particleMultiplier: 1.0,
    speedMultiplier: 0.7,
    driftRange: 18,                   // rhythmic, contained beat
    gradientOrigin: '50% 50%',        // centered pulse origin
    gradientReach: 65,
    secondaryLayer: 'radial-gradient(circle at 50% 50%, GLOW 0%, transparent 35%)', // signal core
    glowOrb: { x: '50%', y: '50%', size: '30%', opacity: 0.06 },
    particleOpacityMax: 0.22,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.35,
  },

  /** Drift -- directional flow, trajectory momentum.
   *  For: Vector (S119) */
  Drift: {
    particleMultiplier: 1.1,
    speedMultiplier: 0.6,
    driftRange: 40,                   // wide lateral -- trajectory
    gradientOrigin: '35% 50%',        // left-biased -- movement direction
    gradientReach: 75,
    secondaryLayer: 'linear-gradient(90deg, FAINT 0%, transparent 40%)', // trailing edge
    glowOrb: { x: '40%', y: '50%', size: '45%', opacity: 0.04 },
    particleOpacityMax: 0.2,
    secondaryParticleColor: 'secondary',
    secondaryParticleFraction: 0.25,
  },

  /** Echo -- reverberant harmonic, resonant decay, wave patterns.
   *  For: Tuning (S120) */
  Echo: {
    particleMultiplier: 0.9,
    speedMultiplier: 0.45,
    driftRange: 22,                   // moderate -- sound wave propagation
    gradientOrigin: '50% 45%',        // slightly high -- sound rising
    gradientReach: 70,
    secondaryLayer: 'radial-gradient(ellipse at 50% 45%, GLOW 0%, transparent 50%)', // reverb center
    glowOrb: { x: '50%', y: '45%', size: '40%', opacity: 0.05 },
    particleOpacityMax: 0.2,
    secondaryParticleColor: 'accent',
    secondaryParticleFraction: 0.3,
  },
};

/**
 * Get the atmosphere mood modifiers for a given form.
 */
export function getFormMood(form?: NaviCueForm): AtmosphereMoodModifiers {
  if (!form) return FORM_MOODS.Practice; // safe default -- spacious, neutral
  return FORM_MOODS[form] || FORM_MOODS.Practice;
}

export interface NaviCuePalette {
  /** Dark foundation -- always surfaces.solid.base */
  base: string;
  /** Signature primary at full opacity */
  primary: string;
  /** Signature primary with glow alpha (0.15-0.25) */
  primaryGlow: string;
  /** Signature primary very faint (0.05-0.08) */
  primaryFaint: string;
  /** Signature secondary at full opacity */
  secondary: string;
  /** Signature secondary with glow alpha */
  secondaryGlow: string;
  /** Warm-shifted text -- readable on dark */
  text: string;
  /** Faint text for whispers and invitations */
  textFaint: string;
  /** Accent from mechanism override (or signature accent) */
  accent: string;
  /** Accent glow */
  accentGlow: string;
  /** Shadow/danger -- desaturated warm red, for "wrong choice" annotations */
  shadow: string;
  /** Shadow faint -- lower-opacity variant for subtle shadow hints */
  shadowFaint: string;
}

export interface NaviCueAtmosphereConfig {
  /** Radial gradient from palette for background */
  backgroundGradient: string;
  /** Number of ambient particles */
  particleCount: number;
  /** Particle color (from palette) */
  particleColor: string;
  /** Particle drift range in px */
  particleDrift: number;
  /** Particle speed multiplier (1 = normal) */
  particleSpeed: number;
  /** Bottom breath line color */
  breathLineColor: string;
  /** Mood modifiers for the atmosphere component */
  mood: AtmosphereMoodModifiers;
  /** Secondary particle color (resolved from palette) */
  secondaryParticleColor: string | null;
  /** Optional secondary background layer CSS */
  secondaryLayerCSS: string | null;
  /** Ambient glow orb config */
  glowOrb: { x: string; y: string; size: string; opacity: number; color: string } | null;
}

export interface NaviCueMotionConfig {
  /** Entry animation duration in ms */
  entryDuration: number;
  /** Entry animation easing */
  entryEase: readonly number[];
  /** Dwell/ambient animation character */
  dwellCharacter: string;
  /** Exit/transition duration in ms */
  exitDuration: number;
  /** Time in ms for arriving stage */
  arrivingDuration: number;
  /** Time in ms for afterglow before auto-advance */
  afterglowDuration: number;
}

// =====================================================================
// PALETTE FACTORY
// =====================================================================

/**
 * Parse an HSLA string into components.
 * Input: 'hsla(30, 25%, 50%, 1)' -> { h: 30, s: 25, l: 50, a: 1 }
 */
function parseHSLA(hsla: string): { h: number; s: number; l: number; a: number } {
  const match = hsla.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!match) return { h: 0, s: 0, l: 50, a: 1 };
  return {
    h: parseFloat(match[1]),
    s: parseFloat(match[2]),
    l: parseFloat(match[3]),
    a: match[4] !== undefined ? parseFloat(match[4]) : 1,
  };
}

function hsla(h: number, s: number, l: number, a: number): string {
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
}

/**
 * KBE intensity multiplier.
 * Believing = softer, more inviting (0.85)
 * Embodying = deeper, richer (1.15)
 * Knowing = crystalline, clear (1.0)
 */
function kbeMultiplier(kbe: string): number {
  const k = kbe?.toLowerCase?.() || '';
  if (k === 'believing' || k === 'b') return 0.85;
  if (k === 'embodying' || k === 'e') return 1.15;
  return 1.0; // knowing
}

/**
 * Mechanism accent colors.
 * These provide a subtle accent shift on top of the signature family.
 */
const MECHANISM_ACCENTS: Record<string, { h: number; s: number; l: number }> = {
  'metacognition':          { h: 210, s: 40, l: 60 },   // cool clarity
  'behavioral activation':  { h: 25,  s: 55, l: 55 },   // warm momentum
  'exposure':               { h: 200, s: 30, l: 55 },   // safe ocean
  'self-compassion':        { h: 345, s: 40, l: 62 },   // tender rose
  'values clarification':   { h: 150, s: 35, l: 50 },   // grounded sage
  'attention shift':        { h: 42,  s: 50, l: 55 },   // amber redirect
  'cognitive restructuring':{ h: 265, s: 40, l: 58 },   // purple reframe
  'somatic regulation':     { h: 195, s: 35, l: 55 },   // sky breath
  'somatic awareness':      { h: 215, s: 40, l: 45 },   // deep body
  'self-advocacy':          { h: 350, s: 30, l: 65 },   // pink boundary
  'reparenting':            { h: 280, s: 30, l: 62 },   // lavender care
  'connection':             { h: 340, s: 35, l: 60 },   // warm relational
};

/**
 * Generate a complete NaviCue palette from a magic signature key.
 * 
 * @param signatureKey - Key from magicSignatures (e.g., 'sacred_ordinary')
 * @param mechanism - Optional mechanism name for accent override
 * @param kbe - Optional KBE layer for intensity ('believing'|'embodying'|'knowing')
 */
export function createNaviCuePalette(
  signatureKey: MagicSignatureKey,
  mechanism?: string,
  kbe?: string,
): NaviCuePalette {
  const sig = magicSignatures[signatureKey];
  if (!sig) {
    // Fallback to sacred_ordinary
    return createNaviCuePalette('sacred_ordinary', mechanism, kbe);
  }

  const primary = parseHSLA(sig.colors.primary);
  const secondary = parseHSLA(sig.colors.secondary);
  const intensity = kbeMultiplier(kbe || '');

  // Adjust saturation and lightness by KBE intensity
  const adjS = (s: number) => Math.min(100, s * intensity);
  const adjL = (l: number) => Math.max(20, Math.min(80, l * (kbe === 'e' ? 0.9 : kbe === 'b' ? 1.1 : 1)));

  // Mechanism accent
  const mechKey = mechanism?.toLowerCase?.() || '';
  const mechAccent = MECHANISM_ACCENTS[mechKey];
  const accentHSL = mechAccent || { h: primary.h, s: primary.s * 0.8, l: primary.l + 10 };

  return {
    base: surfaces.solid.base,
    primary: hsla(primary.h, adjS(primary.s), adjL(primary.l), 1),
    primaryGlow: hsla(primary.h, adjS(primary.s), adjL(primary.l), 0.2),
    primaryFaint: hsla(primary.h, adjS(primary.s), adjL(primary.l), 0.06),
    secondary: hsla(secondary.h, adjS(secondary.s), adjL(secondary.l), 1),
    secondaryGlow: hsla(secondary.h, adjS(secondary.s), adjL(secondary.l), 0.15),
    text: hsla(primary.h, 15, 88, 0.85),
    textFaint: hsla(primary.h, 15, 88, 0.35),
    accent: hsla(accentHSL.h, accentHSL.s, accentHSL.l, 1),
    accentGlow: hsla(accentHSL.h, accentHSL.s, accentHSL.l, 0.2),
    // Shadow: warm red-shifted from primary, desaturated -- for wrong-choice / danger annotations
    shadow: hsla(Math.max(0, (primary.h + 360 - 10) % 360), 30, 50, 0.6),
    shadowFaint: hsla(Math.max(0, (primary.h + 360 - 10) % 360), 25, 45, 0.3),
  };
}

// =====================================================================
// ATMOSPHERE FACTORY
// =====================================================================

/**
 * Generate atmosphere configuration from a palette.
 * Now accepts an optional form to apply mood modifiers.
 */
export function createAtmosphereConfig(
  palette: NaviCuePalette,
  signatureKey: MagicSignatureKey,
  form?: NaviCueForm,
): NaviCueAtmosphereConfig {
  const sig = magicSignatures[signatureKey];
  const mood = getFormMood(form);
  
  // Particle count varies by signature character
  const particleCounts: Record<string, number> = {
    sacred_ordinary: 14,
    witness_ritual: 16,
    poetic_precision: 8,
    science_x_soul: 12,
    koan_paradox: 10,
    pattern_glitch: 20,
    sensory_cinema: 20,
    relational_ghost: 12,
  };

  // Particle speed varies by motion character
  const speeds: Record<string, number> = {
    sacred_ordinary: 0.8,
    witness_ritual: 0.6,
    poetic_precision: 1.2,
    science_x_soul: 1.0,
    koan_paradox: 0.9,
    pattern_glitch: 1.5,
    sensory_cinema: 0.5,
    relational_ghost: 0.7,
  };

  // Apply mood modifiers to base values
  const baseCount = particleCounts[signatureKey] || 14;
  const baseSpeed = speeds[signatureKey] || 1.0;

  // Resolve secondary layer CSS -- replace FAINT/GLOW placeholders with palette colors
  let secondaryLayerCSS: string | null = null;
  if (mood.secondaryLayer) {
    secondaryLayerCSS = mood.secondaryLayer
      .replace(/FAINT/g, palette.primaryFaint)
      .replace(/GLOW/g, palette.primaryGlow);
  }

  // Resolve secondary particle color from palette
  let resolvedSecondaryColor: string | null = null;
  if (mood.secondaryParticleColor === 'accent') {
    resolvedSecondaryColor = palette.accent;
  } else if (mood.secondaryParticleColor === 'secondary') {
    resolvedSecondaryColor = palette.secondary;
  }

  // Resolve glow orb with palette color
  const glowOrb = mood.glowOrb ? {
    ...mood.glowOrb,
    color: palette.primary,
  } : null;

  return {
    backgroundGradient: `radial-gradient(ellipse at ${mood.gradientOrigin}, ${palette.primaryGlow}, ${palette.primaryFaint} ${mood.gradientReach}%, ${palette.base} ${Math.min(mood.gradientReach + 30, 100)}%)`,
    particleCount: Math.round(baseCount * mood.particleMultiplier),
    particleColor: palette.primary,
    particleDrift: mood.driftRange,
    particleSpeed: baseSpeed * mood.speedMultiplier,
    breathLineColor: palette.primary,
    mood,
    secondaryParticleColor: resolvedSecondaryColor,
    secondaryLayerCSS,
    glowOrb,
  };
}

// =====================================================================
// MOTION FACTORY
// =====================================================================

/**
 * Generate motion configuration from a magic signature.
 */
export function createMotionConfig(signatureKey: MagicSignatureKey): NaviCueMotionConfig {
  const sig = magicSignatures[signatureKey];

  // Arriving durations -- longer for contemplative, shorter for activating
  const arrivingDurations: Record<string, number> = {
    sacred_ordinary: 2800,
    witness_ritual: 1800,
    poetic_precision: 1200,
    science_x_soul: 2000,
    koan_paradox: 2400,
    pattern_glitch: 1000,
    sensory_cinema: 2500,
    relational_ghost: 3000,
  };

  // Afterglow durations -- how long the coda plays before auto-advance
  const afterglowDurations: Record<string, number> = {
    sacred_ordinary: 5000,
    witness_ritual: 6000,
    poetic_precision: 3000,
    science_x_soul: 4000,
    koan_paradox: 4500,
    pattern_glitch: 2500,
    sensory_cinema: 6000,
    relational_ghost: 5500,
  };

  return {
    entryDuration: sig.motion.entry.duration,
    entryEase: sig.motion.entry.ease,
    dwellCharacter: sig.motion.dwell,
    exitDuration: sig.motion.exit.duration,
    arrivingDuration: arrivingDurations[signatureKey] || 2000,
    afterglowDuration: afterglowDurations[signatureKey] || 4000,
  };
}

// =====================================================================
// SIGNATURE COLOR DERIVATION
// =====================================================================

/**
 * Derive a unique HSLA signature color from a magic signature key.
 * Used for Lab dot navigation and metadata displays.
 * 
 * Instead of 50 hardcoded colors, this generates them from the signature.
 */
export function deriveSignatureColor(signatureKey: MagicSignatureKey): string {
  const sig = magicSignatures[signatureKey];
  if (!sig) return 'hsla(0, 0%, 50%, 0.6)';
  const p = parseHSLA(sig.colors.primary);
  return hsla(p.h, Math.min(p.s + 5, 60), Math.min(p.l + 5, 58), 0.6);
}

// =====================================================================
// TYPOGRAPHY TOKENS (NaviCue-specific)
// =====================================================================

/**
 * NaviCue Typography System -- "Breathable Restraint"
 * ===================================================
 *
 * DESIGN PHILOSOPHY:
 * Every NaviCue is an intimate moment. The typography should feel like
 * a conversation with a wise friend -- never a billboard, never a footnote.
 * Even the biggest revelation whispers. Even the smallest annotation
 * respects the reader's eyes.
 *
 * MOBILE-FIRST PRINCIPLES (Apple HIG informed):
 * 1. FLOOR AT 11px -- the absolute smallest readable size on a 375px
 *    viewport. Apple's Caption 2 is 11pt; we match that floor in CSS px.
 *    Nothing renders smaller. NaviCueShell enforces this at render time.
 * 2. CEILING AT 36px -- even hero moments practice restraint
 * 3. EACH STEP BREATHES -- perceptibly different, never jarring
 * 4. OPTICAL PRECISION -- letter-spacing widens as size shrinks,
 *    tightens as size grows (compensating for optical weight)
 * 5. LINE HEIGHT ARC -- tight at display scale (1.15), generous
 *    at body scale (1.5-1.6), poetic at afterglow (1.7)
 * 6. MONOSPACE ALWAYS USES fonts.mono -- never raw 'monospace'.
 *    NaviCueShell enforces this at render time.
 *
 * ZONES (smallest to largest):
 *   MARGINALIA  -- micro, status, code    (the experience's annotations)
 *   WHISPER     -- caption, hint, afterglow (quiet guidance & coda)
 *   VOICE       -- texture, input, choice, narrative (the conversation)
 *   PRESENCE    -- subheading, arrival     (transitional prominence)
 *   REVELATION  -- prompt, koan, hero, display (the moments that land)
 *
 * RULE: No hardcoded font sizes in specimens. Ever.
 * If a size doesn't exist here, add it here first.
 *
 * ENFORCEMENT:
 * - NaviCueShell.sanitizeCopy() clamps any inline fontSize < 11px
 *   up to 11px at render time (same pattern as em-dash sanitization)
 * - NaviCueVerse wraps render-prop children with sanitizeCopy() so
 *   specimen interaction content also gets the floor enforced
 * - NaviCueShell.sanitizeCopy() replaces bare fontFamily: 'monospace'
 *   with fonts.mono at render time
 * - These are safety nets; source files should still use tokens correctly
 *
 * GOLD STANDARD (S101-S120, specimens 1001-1200):
 * - All navicueButtonStyle usage replaced with immersiveTap(palette)
 * - All sub-11px fonts enforced at runtime by sanitizeCopy (dev warns in console)
 * - All hold zones use navicueInteraction.holdZone (120px minimum)
 * - All touch targets meet 48px minimum via navicueInteraction.tapZone
 * - Smooth CSS transitions (0.2-0.3s ease) instead of clunky UI chrome
 * - Mobile-first: visual IS the interaction, no pill buttons
 *
 * SPECIMEN TEMPLATE (gold standard pattern for next batch):
 * ```tsx
 * import { navicueStyles, navicueType, immersiveTap } from '@/app/design-system/navicue-blueprint';
 *
 * // Interaction container (flex column, centered, min-height):
 * <div style={navicueStyles.interactionContainer(16)}>
 *
 *   // Tap interaction (borderless, glow+scale feedback):
 *   const tap = immersiveTap(verse.palette);
 *   <div style={{ ...tap.zone, ...(isActive ? tap.active : {}) }} onClick={...}>
 *     <VisualContent />
 *   </div>
 *
 *   // SVG annotation labels (axis, compass, markers):
 *   <text style={{ ...navicueType.micro }} fill={verse.palette.textFaint} opacity={0.3}>label</text>
 *
 *   // Faint annotation:
 *   <span style={navicueStyles.annotation(palette)}>waiting</span>
 *
 *   // Shadow/danger text (wrong choice, fear):
 *   <span style={navicueStyles.shadowAnnotation(palette)}>not yours</span>
 *
 *   // Accent readout (result, confirmation):
 *   <span style={navicueStyles.accentReadout(palette)}>complete</span>
 *
 *   // Status hint (current action prompt):
 *   <span style={navicueStyles.interactionHint(palette)}>drag toward planet</span>
 *
 *   // Accent hint (success state):
 *   <span style={navicueStyles.accentHint(palette)}>true north</span>
 *
 *   // KBE label (ALWAYS last element):
 *   <div style={navicueStyles.kbeLabel(palette)}>{done ? 'kbe' : 'hint'}</div>
 * </div>
 * ```
 *
 * RULES:
 * - Never hardcode fontSize. Use navicueType tokens or navicueStyles factories.
 * - Never hardcode 'hsla(...)' for text. Use palette.shadow / palette.accent / palette.textFaint.
 * - Never assemble style objects inline (e.g., `...hint, fontSize: 10, opacity: 0.35`).
 *   Use navicueStyles factories instead. If a pattern doesn't have a factory, add one.
 * - Never use navicueButtonStyle(). Use immersiveTap(palette).
 */

/** Minimum font size in px. NaviCueShell enforces this at render time. */
export const NAVICUE_TYPE_FLOOR_PX = 11;

// =====================================================================
// VISIBILITY SAFETY -- minimum opacity & stroke floors
// =====================================================================
// On mobile OLED screens in ambient light, opacities below 0.12 and
// stroke widths below 1px vanish entirely. These utilities enforce
// design-system-wide floors so specimens remain legible on every panel.

/** Minimum rendered opacity for any visible element */
export const MIN_OPACITY = 0.12;

/**
 * Minimum color alpha for themeColor() HSLA output.
 * 0.01-0.02 alpha is imperceptible on virtually all displays.
 * This floor ensures every themeColor call produces at least a
 * perceptible tint without overriding intentionally-subtle design.
 */
export const MIN_ALPHA = 0.03;

/**
 * Clamp a color alpha to the perceptibility floor.
 * Used internally by registryThemeColor(); also available for manual use.
 */
export function safeAlpha(value: number, floor: number = MIN_ALPHA): number {
  return Math.max(floor, Math.min(1, value));
}

/** Minimum rendered stroke width in SVG/CSS (px) */
export const MIN_STROKE = 1;

/**
 * Clamp opacity to the visibility floor.
 * Use for any element that MUST be seen (structural lines, labels, scene elements).
 * Intentionally-invisible elements (initial={{ opacity: 0 }}) should NOT use this.
 *
 * @param value - desired opacity (0-1)
 * @param floor - minimum opacity (default MIN_OPACITY = 0.12)
 */
export function safeOpacity(value: number, floor: number = MIN_OPACITY): number {
  return Math.max(floor, Math.min(1, value));
}

/**
 * Clamp stroke width to the visibility floor.
 *
 * @param value - desired stroke width in px
 * @param floor - minimum width (default MIN_STROKE = 1)
 */
export function safeStroke(value: number, floor: number = MIN_STROKE): number {
  return Math.max(floor, value);
}

/**
 * Minimum SVG stroke width for decorative/atmospheric lines.
 * 0.3px and below is imperceptible on 1x displays and barely visible on 2x.
 * 0.5px renders correctly on all retina displays.
 */
export const MIN_SVG_STROKE = 0.5;

/**
 * Clamp SVG strokeWidth to the retina-safe floor.
 * Use for decorative SVG strokes where sub-pixel rendering is intentional
 * but below-threshold values should be caught.
 *
 * @param value - desired strokeWidth in SVG units
 * @param floor - minimum width (default MIN_SVG_STROKE = 0.5)
 */
export function safeSvgStroke(value: number, floor: number = MIN_SVG_STROKE): number {
  return Math.max(floor, value);
}

export const navicueType = {
  /** Marginalia -- axis labels, compass points, slider endpoints (11-12px) */
  micro: {
    fontSize: 'clamp(11px, 1.6vw, 12px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.3,
    letterSpacing: '0.04em',
  },
  /**
   * KBE / mechanism label -- the bottom-of-specimen attribution line.
   * Every specimen has one. This token replaces the common anti-pattern
   * of `...navicueType.hint, fontSize: 10, opacity: 0.35` with a single
   * semantic token that meets the 11px floor.
   *
   * Usage:
   *   <div style={{ ...navicueType.kbeLabel, color: verse.palette.textFaint }}>
   *     {done ? 'kbe name' : 'interaction hint'}
   *   </div>
   */
  kbeLabel: {
    fontSize: 'clamp(11px, 1.6vw, 12px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.3,
    letterSpacing: '0.04em',
    opacity: 0.35,
  },
  /** Status indicators -- energy bars, decay counters, progress (11-13px) */
  status: {
    fontSize: 'clamp(11px, 1.8vw, 13px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.3,
    letterSpacing: '0.03em',
  },
  /** Interaction hint -- "touch to soften", "stay with it" (12-14px) */
  hint: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.45,
  },
  /** Inline captions -- small labels, category names (12-14px) */
  caption: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  /** Texture narration -- small revelations during interaction (14-16px) */
  texture: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  /** Afterglow -- the closing poetic line, spacious breathing (13-15px) */
  afterglow: {
    fontSize: 'clamp(13px, 2.2vw, 15px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.7,
    letterSpacing: '0.01em',
  },
  /** Choice labels -- buttons, value options, interactive elements (15-17px) */
  choice: {
    fontSize: 'clamp(15px, 2.6vw, 17px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  /** Narrative body -- transitions, emphasis, mid-weight prose (16-19px) */
  narrative: {
    fontSize: 'clamp(16px, 2.8vw, 19px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '400',
    lineHeight: 1.55,
    letterSpacing: '0.01em',
  },
  /** Subheading -- phase titles, section emphasis (18-22px) */
  subheading: {
    fontSize: 'clamp(18px, 3.2vw, 22px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '300',
    lineHeight: 1.45,
    letterSpacing: '0.01em',
  },
  /** Arrival -- the opening whisper, threshold text (20-25px) */
  arrival: {
    fontSize: 'clamp(20px, 3.5vw, 25px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '300',
    lineHeight: 1.4,
    letterSpacing: '0.01em',
  },
  /** Prompt -- the central question, the thing to sit with (22-28px) */
  prompt: {
    fontSize: 'clamp(22px, 3.8vw, 28px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '300',
    lineHeight: 1.4,
    letterSpacing: '0.005em',
  },
  /** Koan -- paradox, central statement, the weight of a question (25-32px) */
  koan: {
    fontSize: 'clamp(25px, 4.5vw, 32px)',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontWeight: '300',
    lineHeight: 1.25,
    letterSpacing: '0.005em',
  },
  /** Hero -- single-word reveals, maximum impact. Breaks italic convention. (28-36px) */
  hero: {
    fontSize: 'clamp(28px, 5vw, 36px)',
    fontFamily: fonts.secondary,
    fontWeight: '300',
    lineHeight: 1.15,
    letterSpacing: '0',
  },
  /** Display numbers -- countdowns, ages, metrics. Upright, tabular. (22-28px) */
  display: {
    fontSize: 'clamp(22px, 4vw, 28px)',
    fontFamily: fonts.secondary,
    fontWeight: '300',
    lineHeight: 1.15,
    fontVariantNumeric: 'tabular-nums' as const,
  },
  /** Input fields -- text entry within specimens. Neutral, comfortable. (14-16px) */
  input: {
    fontSize: 'clamp(14px, 2.4vw, 16px)',
    fontFamily: fonts.secondary,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  /** Code / data readout -- terminal lines, system readbacks, monospace data (11-12px) */
  code: {
    fontSize: 'clamp(11px, 1.6vw, 12px)',
    fontFamily: fonts.mono, // Uses design system mono stack, not raw 'monospace'
    fontWeight: '400',
    lineHeight: 1.4,
    letterSpacing: '0.02em',
  },
  /** Code body -- larger monospace for readable code blocks, script lines (12-14px) */
  codeBody: {
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontFamily: fonts.mono, // Uses design system mono stack, not raw 'monospace'
    fontWeight: '400',
    lineHeight: 1.5,
  },
  /** Data label -- monospace numeric readouts, percentages, counters (11-13px) */
  data: {
    fontSize: 'clamp(11px, 1.8vw, 13px)',
    fontFamily: fonts.mono,
    fontWeight: '400',
    lineHeight: 1.3,
    letterSpacing: '0.03em',
    fontVariantNumeric: 'tabular-nums' as const,
  },
} as const;

// =====================================================================
// INTERACTION TOKENS (NaviCue-specific)
// =====================================================================

/**
 * Standard interaction element styles for NaviCue specimens.
 * Every button, progress bar, and interactive surface uses these.
 * 
 * RULE: No hardcoded padding, border-radius, or button styles in specimens.
 * The specimens provide color from their palette. These provide the geometry.
 */
export const navicueInteraction = {
  /** @deprecated Standard action button -- use tapZone + immersiveTap() instead */
  button: {
    padding: '14px 24px',
    borderRadius: '9999px', // True pill -- bulletproof at any content height
    cursor: 'pointer',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontSize: 'clamp(14px, 2.4vw, 16px)',
    fontWeight: '400',
    letterSpacing: '0.02em',
    transition: 'all 0.3s ease',
    outline: 'none',
    touchAction: 'none' as const, // Prevent scroll/zoom on hold interactions
  },
  /** @deprecated Small action button -- use tapZone + immersiveTap() instead */
  buttonSmall: {
    padding: '12px 18px',
    borderRadius: '9999px', // True pill -- bulletproof at any content height
    cursor: 'pointer',
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontWeight: '400',
    letterSpacing: '0.02em',
    transition: 'all 0.3s ease',
    outline: 'none',
    touchAction: 'none' as const, // Prevent scroll/zoom on hold interactions
  },
  /** Progress track -- energy bars, decay bars, fill indicators */
  progressTrack: {
    height: '4px',
    borderRadius: '2px',
    overflow: 'hidden' as const,
  },
  /** Progress fill -- the moving part inside the track */
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '2px',
  },
  /** Dot indicator -- mercury drops, stage markers */
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    transition: 'all 0.5s ease',
  },
  /** Input field -- text inputs within specimens */
  inputField: {
    padding: '12px 16px',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: fonts.secondary,
    fontSize: 'clamp(14px, 2.4vw, 16px)',
    fontWeight: '400',
    lineHeight: 1.5,
    transition: 'all 0.3s ease',
  },

  // ── Interaction zone tokens ────────────────────────────────────
  // Standard container shapes for drag, draw, and hold elements.
  // Specimens spread these onto the interactive element alongside
  // the hook's props. This replaces the copy-paste pattern of
  // manual ref callbacks + style objects that caused dead-ref bugs.
  //
  // Usage:
  //   <div {...drag.dragProps} style={{ ...navicueInteraction.dragTrack, ...drag.dragProps.style, ... }}>

  /** Hold zone -- circular ceremonial hold target (120px for mobile touch) */
  holdZone: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    cursor: 'pointer',
    touchAction: 'none' as const,
    userSelect: 'none' as const,
  },
  /** Drag track -- horizontal or vertical slider rail */
  dragTrack: {
    width: '100%',
    maxWidth: 280,
    height: 44,
    borderRadius: 22,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    touchAction: 'none' as const,
    cursor: 'grab',
  },
  /** Draw canvas -- freeform drawing surface */
  drawCanvas: {
    position: 'relative' as const,
    width: 240,
    height: 180,
    touchAction: 'none' as const,
    cursor: 'crosshair',
  },

  // ── Standard layout containers for specimens ─────────────────────
  // These tokens provide consistent sizing and spacing across all
  // 200 S101-S120 specimens. Specimens should use these instead of
  // ad-hoc minHeight, gap, and width values.

  /** Interaction wrapper -- standard flex column for all specimen content */
  interactionWrapper: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: 20,
    width: '100%',
    maxWidth: 300,
  },
  /** Interaction canvas -- standard SVG/visual container */
  interactionCanvas: {
    position: 'relative' as const,
    width: 220,
    height: 160,
  },

  // ── Immersive interaction zones (borderless, touch-friendly) ──────
  // These replace pill buttons for tap interactions. The visual element
  // IS the interaction. Minimum 48px touch target (Apple HIG).

  /** Tap zone -- transparent wrapper for making any visual element tappable */
  tapZone: {
    cursor: 'pointer',
    touchAction: 'manipulation' as const,
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    border: 'none',
    background: 'none',
    padding: 0,
    minWidth: 48,
    minHeight: 48,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  /** Tap hint -- subtle text prompt below a visual tap zone */
  tapHint: {
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontSize: 'clamp(12px, 2.2vw, 14px)',
    letterSpacing: '0.04em',
    opacity: 0.45,
    transition: 'opacity 0.3s ease',
    marginTop: 8,
  },

  /**
   * Tap button -- the CORRECT way to create text-based tap interactions.
   * Enforces 48px minimum touch target with proper padding around the text.
   * Replaces the anti-pattern of spreading `...tapZone, ...navicueType.hint`.
   * 
   * This provides adequate visual weight and clear tappability while maintaining
   * the 48px minimum. The padding creates visible interactive area around text.
   * 
   * Usage:
   *   <button style={navicueInteraction.tapButton} onClick={...}>
   *     {children}
   *   </button>
   * 
   * For palette-aware styling with glow feedback, use immersiveTapButton():
   *   const btn = immersiveTapButton(palette);
   *   <button style={{ ...btn.base }} onClick={...}>
   *     {children}
   *   </button>
   */
  tapButton: {
    cursor: 'pointer',
    touchAction: 'manipulation' as const,
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    border: 'none',
    background: 'none',
    // Padding creates visible interactive area (text + breathing room = ~48px)
    padding: '14px 20px',
    minWidth: 48,
    minHeight: 48,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    // Typography built in so text is always readable
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontSize: 'clamp(14px, 2.4vw, 16px)',
    fontWeight: '400',
    letterSpacing: '0.02em',
    lineHeight: 1.5,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
  },

  /**
   * Tap button small -- compact variant for multiple choice scenarios.
   * Still meets 48px minimum height with vertical padding.
   */
  tapButtonSmall: {
    cursor: 'pointer',
    touchAction: 'manipulation' as const,
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    border: 'none',
    background: 'none',
    padding: '16px 18px', // Vertical padding ensures 48px minimum
    minWidth: 48,
    minHeight: 48,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontFamily: fonts.secondary,
    fontStyle: 'italic' as const,
    fontSize: 'clamp(12px, 2vw, 14px)',
    fontWeight: '400',
    letterSpacing: '0.02em',
    lineHeight: 1.3,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
  },
} as const;

/**
 * Helper: create consistent button style from palette + theme + size.
 *
 * @deprecated Use immersiveTap(palette) instead for all new specimens.
 * Pill buttons with visible borders/backgrounds are legacy UI chrome.
 * The gold standard (S101-S120) uses immersiveTap for all tap interactions:
 * borderless, background-transparent, glow + scale feedback on active state.
 *
 * Only Novice_ConnectionThread (outside 1001-1200 range) still uses this.
 * Will be removed once pre-1001 specimens are migrated.
 *
 * Legacy usage:
 *   style={{ ...navicueButtonStyle(palette) }}
 *
 * Replacement (gold standard):
 *   const tap = immersiveTap(palette);
 *   <div style={{ ...tap.zone, ...(isActive ? tap.active : {}) }} onClick={...}>
 */
export function navicueButtonStyle(
  palette: NaviCuePalette,
  variant: 'primary' | 'ghost' = 'primary',
  size: 'standard' | 'small' = 'standard',
) {
  const geometry = size === 'small'
    ? navicueInteraction.buttonSmall
    : navicueInteraction.button;

  return {
    ...geometry,
    background: variant === 'ghost' ? 'none' : palette.primaryFaint,
    border: `1px solid ${variant === 'ghost' ? palette.primary : palette.primaryGlow}`,
    color: variant === 'ghost' ? palette.textFaint : palette.text,
  };
}

/**
 * Helper: create immersive tap interaction style from palette.
 *
 * The GOLD STANDARD replacement for pill buttons. The visual element IS
 * the interaction -- borderless, background-transparent, with glow feedback
 * via box-shadow and scale transform on active/pressed state.
 *
 * Applies tapZone geometry (48px minimum touch target) and provides
 * active-state styles that specimens apply via React state or CSS :active.
 *
 * Usage:
 *   const tap = immersiveTap(palette);
 *   <div style={{ ...tap.zone }} onClick={...}>
 *     <VisualContent />
 *   </div>
 *
 * Active feedback (apply when pressed/active):
 *   style={{ ...tap.zone, ...(isActive ? tap.active : {}) }}
 *
 * @param palette - NaviCuePalette for glow color derivation
 * @param glowRadius - box-shadow spread in px (default 20)
 */
export function immersiveTap(
  palette: NaviCuePalette,
  glowRadius: number = 20,
) {
  return {
    /** Base zone styles -- spread onto the tappable container */
    zone: {
      ...navicueInteraction.tapZone,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    } as const,
    /** Active/pressed state -- merge when user is touching */
    active: {
      transform: 'scale(0.97)',
      boxShadow: `0 0 ${glowRadius}px ${palette.primaryGlow}`,
    } as const,
    /** Glow-only feedback (no scale) for subtle interactions */
    glow: {
      boxShadow: `0 0 ${glowRadius}px ${palette.primaryGlow}`,
    } as const,
  };
}

/**
 * Helper: create immersive tap BUTTON with proper sizing + palette + feedback.
 *
 * This is the RECOMMENDED way to create text-based tap interactions in NaviCues.
 * Combines navicueInteraction.tapButton geometry with palette-aware colors and
 * active-state glow feedback. Ensures 48px minimum touch target with adequate
 * visual weight (padding around text makes the interactive area VISIBLE).
 *
 * Solves the common anti-pattern of `...tapZone, ...navicueType.hint` which
 * creates tiny invisible tap targets.
 *
 * Usage with React state:
 *   const btn = immersiveTapButton(palette);
 *   const [active, setActive] = useState(false);
 *   <button 
 *     style={{ ...btn.base, ...(active ? btn.active : {}) }}
 *     onPointerDown={() => setActive(true)}
 *     onPointerUp={() => setActive(false)}
 *     onClick={...}
 *   >
 *     tap me
 *   </button>
 *
 * Usage with Motion whileTap (simpler):
 *   const btn = immersiveTapButton(palette);
 *   <motion.button 
 *     style={btn.base}
 *     whileTap={btn.active}
 *     onClick={...}
 *   >
 *     tap me
 *   </motion.button>
 *
 * @param palette - NaviCuePalette for color derivation
 * @param variant - 'primary' (normal text) | 'accent' (highlighted) | 'faint' (de-emphasized)
 * @param size - 'standard' (14-16px) | 'small' (12-14px)
 * @param glowRadius - box-shadow spread in px (default 20)
 */
export function immersiveTapButton(
  palette: NaviCuePalette,
  variant: 'primary' | 'accent' | 'faint' = 'primary',
  size: 'standard' | 'small' = 'standard',
  glowRadius: number = 20,
) {
  const geometry = size === 'small' 
    ? navicueInteraction.tapButtonSmall 
    : navicueInteraction.tapButton;

  const color = variant === 'accent' 
    ? palette.accent 
    : variant === 'faint' 
      ? palette.textFaint 
      : palette.text;

  // Material presence: derive border + glow from variant
  // This gives the button form and depth even at rest,
  // so it never looks like orphaned floating text
  const borderColor = variant === 'accent'
    ? palette.accentGlow
    : palette.primaryGlow;

  const restingGlow = variant === 'accent'
    ? `0 0 8px ${palette.accentGlow}`
    : `0 0 8px ${palette.primaryFaint}`;

  return {
    /** Base button styles -- resting state with material presence.
     *  Border + micro-glow give the element form without UI chrome.
     *  z-index ensures it floats above scene SVGs/animations. */
    base: {
      ...geometry,
      color,
      border: `1px solid ${borderColor}`,
      borderRadius: 8,
      boxShadow: restingGlow,
      position: 'relative' as const,
      zIndex: 2,
    } as const,
    /** Active/pressed state -- glow intensifies with double-layer bloom,
     *  border brightens. Scale 0.97 provides tactile press feedback. */
    active: {
      transform: 'scale(0.97)',
      boxShadow: `0 0 ${glowRadius}px ${borderColor}, 0 0 ${glowRadius * 2}px ${palette.primaryFaint}`,
    } as const,
    /** Disabled state -- apply when button is not interactive */
    disabled: {
      opacity: 0.25,
      cursor: 'not-allowed',
      pointerEvents: 'none' as const,
    } as const,
  };
}

/**
 * immersiveTapPillThemed -- pill-shaped tap button for series-themed specimens.
 *
 * Replaces the copy-paste pattern used across ~46 specimens that use
 * themeColor(TH.accentHSL, ...) for pill-shaped tap/choice buttons.
 *
 * Usage:
 *   const tap = immersiveTapPillThemed(TH.accentHSL);
 *   <motion.div whileTap={tap.whileTap} onClick={handler} style={tap.container}>
 *     <div style={tap.label}>Label</div>
 *   </motion.div>
 *
 * @param accentHSL - [h, s, l] tuple from series theme
 */
export function immersiveTapPillThemed(
  accentHSL: [number, number, number],
  variant: 'standard' | 'bold' = 'standard',
) {
  const isB = variant === 'bold';
  return {
    /** Static pill container style */
    container: {
      padding: '14px 22px',
      borderRadius: '9999px',
      cursor: 'pointer' as const,
      background: registryThemeColor(accentHSL, isB ? 0.08 : 0.06, isB ? 4 : 3),
      border: `1px solid ${registryThemeColor(accentHSL, isB ? 0.12 : 0.1, isB ? 8 : 6)}`,
    } as const,

    /** Static label style */
    label: {
      ...navicueType.choice,
      color: registryThemeColor(accentHSL, isB ? 0.5 : 0.45, 14),
    } as const,

    /** Default whileTap scale for motion.div */
    whileTap: { scale: 0.9 } as const,
  };
}

/**
 * Helper: create immersive HOLD BUTTON with circular geometry, progress ring,
 * palette-aware colors, and hold-state feedback.
 *
 * This is the RECOMMENDED way to create hold interactions in NaviCues.
 * Replaces the copy-paste pattern of manually assembling holdZone + holdProps +
 * inline SVG progress rings + scale animations + border color toggles.
 *
 * Usage with useHoldInteraction:
 *   const hold = useHoldInteraction({ maxDuration: 4000 });
 *   const btn = immersiveHoldButton(palette);
 *   <motion.div
 *     {...hold.holdProps}
 *     animate={hold.isHolding ? btn.holding : {}}
 *     transition={{ duration: 0.2 }}
 *     style={{ ...hold.holdProps.style, ...btn.base }}
 *   >
 *     <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
 *       <circle {...btn.progressRing.track} />
 *       <circle {...btn.progressRing.fill(hold.tension)} />
 *     </svg>
 *     <div style={btn.label}>hold</div>
 *   </motion.div>
 *
 * @param palette - NaviCuePalette for color derivation
 * @param size - diameter in px (default 90, seal ceremonies use 120)
 * @param glowRadius - box-shadow spread in px (default 24)
 */
export function immersiveHoldButton(
  palette: NaviCuePalette,
  size: number = 90,
  glowRadius: number = 24,
) {
  const r = (size / 2) - 5; // ring radius with padding
  const circumference = 2 * Math.PI * r;

  return {
    /** Base hold zone -- circular, palette-bordered, touch-optimized */
    base: {
      width: size,
      height: size,
      borderRadius: '50%',
      border: `1px solid ${palette.primaryGlow}`,
      background: palette.primaryFaint,
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      position: 'relative' as const,
      cursor: 'pointer',
      touchAction: 'none' as const,
      userSelect: 'none' as const,
      zIndex: 2,
    } as const,

    /** Holding state -- merge into motion animate prop while user is holding */
    holding: {
      scale: 0.93,
      borderColor: palette.accent,
      boxShadow: `0 0 ${glowRadius}px ${palette.primaryGlow}`,
    } as const,

    /** Completed state -- merge after hold completes */
    completed: {
      scale: 1,
      borderColor: palette.accent,
      boxShadow: `0 0 ${glowRadius * 1.5}px ${palette.accentGlow}`,
    } as const,

    /** SVG progress ring -- overlay circle that fills as tension rises */
    progressRing: {
      /** SVG container styles */
      svg: {
        position: 'absolute' as const,
        inset: 0,
        width: '100%',
        height: '100%',
      } as const,

      /** Background track circle (faint) */
      track: {
        cx: size / 2,
        cy: size / 2,
        r,
        fill: 'none' as const,
        stroke: palette.primary,
        strokeWidth: 1,
        opacity: 0.12,
      } as const,

      /** Progress fill circle -- call with tension (0-1) */
      fill: (tension: number) => ({
        cx: size / 2,
        cy: size / 2,
        r,
        fill: 'none' as const,
        stroke: palette.primary,
        strokeWidth: 1.5,
        strokeDasharray: `${tension * circumference} ${circumference}`,
        strokeLinecap: 'round' as const,
        opacity: 0.5,
        transform: `rotate(-90 ${size / 2} ${size / 2})`,
      }),
    },

    /** Label styles for the "hold" text hint */
    label: {
      ...navicueType.hint,
      color: palette.textFaint,
      position: 'relative' as const,
      zIndex: 1,
    } as const,
  };
}

/**
 * immersiveHoldPill -- pill-shaped hold button factory.
 *
 * Replaces the copy-paste pattern of pill-shaped hold buttons used in
 * Broadcast, Frequency, Glitch, LoopBreaker, TimeCapsule specimens.
 *
 * Usage:
 *   const pill = immersiveHoldPill(palette);
 *   <div {...hold.holdProps} style={{ ...hold.holdProps.style, ...pill.base(hold.tension) }}>
 *     <div style={pill.label}>hold to feel</div>
 *   </div>
 *
 * @param palette - NaviCuePalette for color derivation
 */
export function immersiveHoldPill(palette: NaviCuePalette) {
  return {
    /** Pill container -- call with tension (0-1) for reactive bg/border */
    base: (tension: number = 0) => ({
      padding: '14px 28px',
      borderRadius: 9999,
      background: palette.primaryFaint,
      border: `1px solid ${palette.primaryGlow}`,
      opacity: safeOpacity(0.7 + tension * 0.3),
      cursor: 'pointer' as const,
      touchAction: 'none' as const,
      userSelect: 'none' as const,
    }),

    /** Holding state -- merge into motion animate while user holds */
    holding: {
      scale: 0.96,
      borderColor: palette.accent,
    } as const,

    /** Label styles for the hold hint text */
    label: {
      ...navicueType.hint,
      color: palette.textFaint,
    } as const,
  };
}

/**
 * immersiveHoldPillThemed -- pill-shaped hold button for series-themed specimens.
 *
 * Replaces the copy-paste pattern used across ~9 specimens that use
 * themeColor(TH.accentHSL, ...) instead of palette-derived colors.
 * Designed for <motion.div> wrappers with hold.progress-reactive styles.
 *
 * Usage:
 *   const pill = immersiveHoldPillThemed(TH.accentHSL);
 *   <motion.div {...hold.holdProps} style={pill.container(hold.progress)}>
 *     <div style={pill.label(hold.progress)}>
 *       {hold.isHolding ? 'Doing...' : 'Hold to Do'}
 *     </div>
 *   </motion.div>
 *
 * @param accentHSL - [h, s, l] tuple from series theme
 */
export function immersiveHoldPillThemed(accentHSL: [number, number, number]) {
  return {
    /** Pill container -- call with progress (0-1) for reactive bg/border */
    container: (progress: number = 0) => ({
      padding: '14px 22px',
      borderRadius: '9999px',
      cursor: 'pointer' as const,
      background: registryThemeColor(accentHSL, 0.06 + progress * 0.04, 3),
      border: `1px solid ${registryThemeColor(accentHSL, 0.1 + progress * 0.06, 6)}`,
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      touchAction: 'none' as const,
    }),

    /** Label styles -- call with progress for reactive text color */
    label: (progress: number = 0) => ({
      ...navicueType.choice,
      color: registryThemeColor(accentHSL, 0.4 + progress * 0.15, 12),
    }),
  };
}

/**
 * immersiveHoldScene -- rectangular scene container for hold interactions.
 *
 * Replaces the copy-paste pattern of scene-hold containers used in
 * Bender, Maestro, Magnet, DreamWalker, Graviton scene specimens.
 *
 * Usage:
 *   const scene = immersiveHoldScene(palette, 200, 180);
 *   <div {...hold.holdProps} style={{ ...hold.holdProps.style, ...scene.base }}>
 *     <svg {...scene.svg}>
 *       ...scene content...
 *     </svg>
 *   </div>
 *
 * @param palette - NaviCuePalette for color derivation
 * @param w - width in px
 * @param h - height in px
 * @param roundness - border radius token ('sm' | 'md'), default 'md'
 */
export function immersiveHoldScene(
  palette: NaviCuePalette,
  w: number,
  h: number,
  roundness: 'sm' | 'md' = 'md',
) {
  const br = roundness === 'sm' ? radius.sm : radius.md;
  return {
    /** Scene container styles */
    base: {
      position: 'relative' as const,
      width: `${w}px`,
      height: `${h}px`,
      borderRadius: br,
      overflow: 'hidden' as const,
      background: palette.base,
      cursor: 'pointer' as const,
      touchAction: 'none' as const,
      userSelect: 'none' as const,
    } as const,

    /** SVG overlay -- spread onto the <svg> element */
    svg: {
      width: '100%' as const,
      height: '100%' as const,
      viewBox: `0 0 ${w} ${h}`,
      style: { position: 'absolute' as const, inset: 0 } as const,
    } as const,

    /** viewBox string for convenience */
    viewBox: `0 0 ${w} ${h}`,
  };
}

// =====================================================================
// COMPOSITED STYLES -- palette-aware style factories
// =====================================================================
// These are the ONLY way specimens should style recurring elements.
// They return complete CSSProperties objects ready to spread.
// A design change here cascades to EVERY specimen that uses the token.
//
// RULE: If you find yourself writing `...navicueType.hint, fontSize: X,
//       color: verse.palette.Y` in a specimen, STOP. There should be a
//       composited style for that pattern. If there isn't, add one HERE.
// =====================================================================

export const navicueStyles = {
  /**
   * Bottom-of-specimen KBE/mechanism attribution line.
   * Every specimen has exactly one. Previously hardcoded as:
   *   `...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10`
   *
   * @example <div style={navicueStyles.kbeLabel(palette)}>{done ? 'kbe' : 'hint'}</div>
   */
  kbeLabel: (palette: NaviCuePalette) => ({
    ...navicueType.kbeLabel,
    color: palette.textFaint,
  }),

  /**
   * Faint annotation -- inline descriptive text, status hints, small labels.
   * Previously: `...navicueType.hint, fontSize: 8/9, color: palette.textFaint, opacity: 0.4`
   *
   * @example <span style={navicueStyles.annotation(palette)}>waiting</span>
   */
  annotation: (palette: NaviCuePalette, opacity = 0.4) => ({
    ...navicueType.micro,
    color: palette.textFaint,
    opacity,
  }),

  /**
   * Accent-colored status/readout -- results, progress values, active states.
   * Previously: `...navicueType.hint, color: palette.accent, fontSize: 10/11`
   *
   * @example <span style={navicueStyles.accentReadout(palette)}>complete</span>
   */
  accentReadout: (palette: NaviCuePalette, opacity = 0.7) => ({
    ...navicueType.micro,
    color: palette.accent,
    opacity,
  }),

  /**
   * Shadow/danger annotation -- wrong choice, error, shadow labels.
   * Previously hardcoded as: `color: 'hsla(0, 30%, 50%, 0.5)'`
   * Now derived from palette.shadow (warm red-shifted from signature primary).
   *
   * @example <span style={navicueStyles.shadowAnnotation(palette)}>fear</span>
   */
  shadowAnnotation: (palette: NaviCuePalette, opacity = 0.5) => ({
    ...navicueType.micro,
    color: palette.shadow,
    opacity,
  }),

  /**
   * Interaction hint -- current-action prompt at hint scale.
   * Previously: `...navicueType.hint, color: palette.textFaint, fontSize: 11, opacity: 0.5`
   *
   * @example <span style={navicueStyles.interactionHint(palette)}>drag toward planet</span>
   */
  interactionHint: (palette: NaviCuePalette, opacity = 0.5) => ({
    ...navicueType.hint,
    color: palette.textFaint,
    opacity,
  }),

  /**
   * Accent interaction hint -- confirmation, success, active-state prompt.
   * Previously: `...navicueType.hint, color: palette.accent, fontSize: 11`
   *
   * @example <span style={navicueStyles.accentHint(palette)}>true north</span>
   */
  accentHint: (palette: NaviCuePalette, opacity = 0.8) => ({
    ...navicueType.hint,
    color: palette.accent,
    opacity,
  }),

  /**
   * Specimen interaction container -- the universal flex-column wrapper
   * used by every bespoke interaction.
   * Previously hardcoded as: `display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240`
   *
   * @param gap - spacing between children in px (default 16)
   * @example <div style={navicueStyles.interactionContainer()}>...</div>
   */
  interactionContainer: (gap = 16) => ({
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap,
    minHeight: 240,
  }),

  // ── Hero Scene System ───────────────────────────────────────────
  // The central visual element of each NaviCue. The soul of the
  // experience: the prism, the wave, the compass, the string.
  //
  // PROBLEM: Most specimens hardcode tiny fixed containers (160x80,
  // 140x120) that render as postage stamps on 375px phones. Strokes
  // at 1px and opacities at 0.15 become invisible at these sizes.
  //
  // SOLUTION: Responsive container + SVG viewBox. The container fills
  // available width (capped for desktop). The SVG's viewBox preserves
  // all internal coordinates, and strokes/circles/text scale up
  // proportionally. A 1px stroke at 160px becomes ~1.6px at 260px.
  // Zero coordinate changes needed in the SVG content.
  //
  // USAGE:
  //   <div style={navicueStyles.heroScene(palette)}>
  //     <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
  //       ...existing SVG content, unchanged...
  //     </svg>
  //   </div>
  //
  // For CSS-based scenes (non-SVG):
  //   <div style={navicueStyles.heroCssScene(palette, 1.5)}>
  //     ...divs with absolute positioning, use % instead of px...
  //   </div>
  //
  // The viewBox aspect ratio controls the rendered height.
  // A viewBox="0 0 160 80" (2:1) in a 300px wide container = 150px tall.
  // A viewBox="0 0 160 160" (1:1) in a 300px wide container = 300px tall.

  /**
   * Hero scene container -- the responsive wrapper for the central visual.
   * Replaces hardcoded `position: 'relative', width: 160, height: 80`.
   *
   * @param palette - for subtle ambient glow that ties scene to atmosphere
   * @param aspectRatio - width/height ratio (default 2 = landscape, 1 = square, 0.7 = portrait)
   */
  heroScene: (palette: NaviCuePalette, aspectRatio: number = 2) => ({
    position: 'relative' as const,
    width: 'clamp(200px, 70vw, 360px)',
    aspectRatio: `${aspectRatio}`,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 1,
    overflow: 'hidden' as const,
  }),

  /**
   * Hero scene SVG -- fills the scene container via viewBox scaling.
   * The viewBox should match the original fixed width/height coordinates.
   *
   * @example <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
   */
  heroSvg: {
    width: '100%',
    height: '100%',
    display: 'block' as const,
    overflow: 'visible' as const,
  } as const,

  /**
   * Hero scene for CSS-based (non-SVG) scenes that use absolute positioning.
   * Children should use percentage-based positioning instead of pixel values.
   * Container provides the same responsive sizing as heroScene.
   *
   * @param palette - for ambient glow
   * @param aspectRatio - width/height ratio (default 1.5)
   */
  heroCssScene: (palette: NaviCuePalette, aspectRatio: number = 1.5) => ({
    position: 'relative' as const,
    width: 'clamp(200px, 70vw, 360px)',
    aspectRatio: `${aspectRatio}`,
    zIndex: 1,
    overflow: 'hidden' as const,
  }),
};

// =====================================================================
// LAYOUT TOKENS
// =====================================================================

/**
 * Standard layout dimensions for NaviCue containers.
 */
export const navicueLayout = {
  /** Full-bleed immersive -- specimens 1-5 and foundational designs */
  immersive: {
    width: '100%',
    flex: '1',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative' as const,
    userSelect: 'none' as const,
    cursor: 'default',
  },
  /** Safe-centering wrapper -- most standard specimens */
  centered: {
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
    zIndex: 1,
  },
  /** Content constraint within immersive */
  content: {
    width: '100%',
    maxWidth: '640px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
    zIndex: 1,
    flex: 1,
    minHeight: 0,
  },

  // ── Lab-mode overrides ──────────────────────────────────────────
  // When NaviCueLabContext.isLabMode is true, these REPLACE the
  // production tokens above. This eliminates scattered ternaries.

  /** Lab-mode content constraint -- tighter padding for phone frame */
  contentLab: {
    width: '100%',
    maxWidth: '640px',
    padding: '12px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    position: 'relative' as const,
    zIndex: 1,
    flex: 1,
    minHeight: 0,
  },

  // ── Stage content (inside NaviCueVerse) ─────────────────────────
  // The Verse's stage wrapper. NO padding -- the Shell's content
  // wrapper owns all padding. This prevents the double-padding bug
  // that plagued S101-S104 (Shell 32+24 + Verse 32+24 = 64+48).

  /** Stage content -- production mode */
  stageContent: {
    position: 'relative' as const,
    zIndex: 1,
    width: '100%',
    maxWidth: 640,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
  },
  /** Stage content -- lab mode (no vh, flex-fills container) */
  stageContentLab: {
    position: 'relative' as const,
    zIndex: 1,
    width: '100%',
    maxWidth: 640,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 0,
  },
} as const;

// =====================================================================
// MOTION SAFETY HELPERS
// =====================================================================

/**
 * Strips undefined values from a Motion animate/initial object.
 * Prevents "You are trying to animate [prop] from undefined" warnings
 * that plagued ~33 files in S101-S104.
 *
 * Usage:
 *   <motion.div animate={safeAnimate({ opacity: isVisible ? 1 : 0, x: maybeUndefined })} />
 *
 * Any key whose value is `undefined` is omitted entirely so Motion
 * never sees a from-undefined transition.
 */
export function safeAnimate<T extends Record<string, unknown>>(
  props: T,
): { [K in keyof T]: Exclude<T[K], undefined> } {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (props[key] !== undefined) {
      result[key] = props[key];
    }
  }
  return result as any;
}

/**
 * Clamps a numeric animation value to a safe range.
 * Prevents NaN/Infinity from reaching Motion (causes "not animatable" warnings).
 */
export function safeNumber(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return value;
}

// =====================================================================
// COLOR TEMPERATURE APPLICATION
// =====================================================================

/**
 * Shifts a NaviCuePalette by a color temperature config.
 *
 * The compositor selects warm/cool/neutral/muted/vivid per specimen
 * via the chrono affinity matrix. This function applies those shifts
 * to every HSL-based color in the palette, creating genuinely different
 * warmth/coolness between morning, work, social, and night NaviCues.
 *
 * Without this, the palette is always the raw signature palette regardless
 * of chrono context -- one of the root causes of the "samey" feeling.
 *
 * Usage:
 *   const adjustedPalette = applyColorTemperature(palette, composition.colorConfig);
 */
export function applyColorTemperature(
  palette: NaviCuePalette,
  config: { hueShift: number; saturationMult: number; lightnessShift: number },
): NaviCuePalette {
  const shift = (color: string): string => {
    const parsed = parseHSLA(color);
    return hsla(
      (parsed.h + config.hueShift + 360) % 360,
      Math.min(100, Math.max(0, parsed.s * config.saturationMult)),
      Math.min(95, Math.max(5, parsed.l + config.lightnessShift)),
      parsed.a,
    );
  };

  return {
    base: palette.base,
    primary: shift(palette.primary),
    primaryGlow: shift(palette.primaryGlow),
    primaryFaint: shift(palette.primaryFaint),
    secondary: shift(palette.secondary),
    secondaryGlow: shift(palette.secondaryGlow),
    text: shift(palette.text),
    textFaint: shift(palette.textFaint),
    accent: shift(palette.accent),
    accentGlow: shift(palette.accentGlow),
  };
}

// =====================================================================
// CHRONO WORLD MODIFIERS
// =====================================================================

/**
 * Chrono world modifications per temporal context.
 * Applied to atmosphere and timing to create genuinely different "worlds"
 * for morning, work, social, and night NaviCues.
 *
 * From the Blueprint (Section XVI -- Temporal Worlds):
 *   Morning: warm clear, upward drift (steam), emerge text, -15% speed
 *   Work:    crisp minimal, sparse 15% faster, dissolve text, +25% speed
 *   Social:  subtle warmth, lateral drift, dissolve (gentle), normal speed
 *   Night:   deep indigo, 65% count barely there, burn_in text, -25% speed
 */
export interface ChronoModifiers {
  /** Particle count multiplier */
  particleCountMult: number;
  /** Animation speed multiplier */
  speedMult: number;
  /** Particle gravity bias override: -1 (up) to 1 (down) */
  gravityBias: number | null;
  /** Breath cycle duration in ms */
  breathCycleDuration: number;
}

export const CHRONO_MODIFIERS: Record<string, ChronoModifiers> = {
  morning: {
    particleCountMult: 1.0,
    speedMult: 0.85,       // -15% slower, contemplative
    gravityBias: -0.5,     // upward drift like steam
    breathCycleDuration: 6000,
  },
  work: {
    particleCountMult: 0.7, // sparse
    speedMult: 1.25,        // +25% faster, crisp
    gravityBias: null,      // use atmosphere mode default
    breathCycleDuration: 5000,
  },
  social: {
    particleCountMult: 1.0,
    speedMult: 1.0,         // normal
    gravityBias: 0,         // lateral (neutral)
    breathCycleDuration: 6000,
  },
  night: {
    particleCountMult: 0.65, // 65% count, barely there
    speedMult: 0.75,         // -25% slower
    gravityBias: null,       // use atmosphere mode default
    breathCycleDuration: 8000,
  },
};

// =====================================================================
// PARTICLE FIELD GENERATION
// =====================================================================

export interface ParticleConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  angle: number;
}

/**
 * Generate an array of particle configs for ambient atmosphere.
 * Deterministic based on count so renders are consistent.
 */
export function generateParticles(count: number, seed?: number): ParticleConfig[] {
  // Simple seeded random for consistency
  let s = seed || 42;
  const seededRandom = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom() * 100,
    y: seededRandom() * 100,
    size: 1 + seededRandom() * 2.5,
    duration: 6 + seededRandom() * 14,
    delay: seededRandom() * 6,
    drift: (seededRandom() - 0.5) * 40,
    angle: seededRandom() * 360,
  }));
}

// =====================================================================
// COLOR MATRIX MAP
// =====================================================================

/**
 * Maps the form × mechanism × kbe matrix to magic signature keys.
 * This is the master routing table for visual identity.
 * 
 * RULE: Same mechanism always maps to the same signature family,
 * with form providing the container archetype (layout/interaction)
 * and kbe providing the intensity shift.
 */
export const FORM_MECHANISM_TO_SIGNATURE: Record<string, MagicSignatureKey> = {
  // Metacognition family → witness_ritual (cool observation)
  'metacognition': 'witness_ritual',
  // Behavioral Activation family → sacred_ordinary (warm momentum)  
  'behavioral activation': 'sacred_ordinary',
  // Exposure family → sensory_cinema (deep ocean approach)
  'exposure': 'sensory_cinema',
  // Self-Compassion family → relational_ghost (tender rose)
  'self-compassion': 'relational_ghost',
  // Values Clarification family → koan_paradox (earth tension)
  'values clarification': 'koan_paradox',
  // Additional mechanisms
  'attention shift': 'pattern_glitch',
  'cognitive restructuring': 'poetic_precision',
  'somatic regulation': 'sensory_cinema',
  'somatic awareness': 'sensory_cinema',
  'self-advocacy': 'relational_ghost',
  'reparenting': 'relational_ghost',
  'connection': 'relational_ghost',
};

/**
 * Get the magic signature key for a given mechanism.
 */
export function getSignatureForMechanism(mechanism: string): MagicSignatureKey {
  const key = mechanism?.toLowerCase?.() || '';
  return FORM_MECHANISM_TO_SIGNATURE[key] || 'sacred_ordinary';
}

// =====================================================================
// SERIES → ATMOSPHERE ARCHETYPE MAPPING
// =====================================================================

/**
 * Maps each series to its recommended atmosphere archetype (NaviCueForm).
 * 
 * This is the routing table for the atmosphere rollout. When updating
 * specimens to use contextually relevant atmospheres, look up the series
 * prefix here to find the right `form` prop for NaviCueShell.
 * 
 * Usage: getSeriesAtmosphere('Sage') → 'Ember'
 * 
 * SERIES FAMILIES:
 * 
 * Integrate forms (use their native form):
 *   Mirror_*, Probe_*, Key_*, InventorySpark_*, Practice_*, PartsRollcall_*
 *   → Keep their existing form prop (Mirror, Probe, Key, etc.)
 *   IdentityKoan_* → IdentityKoan
 *   Exposure_*, Metacognition_*, SelfCompassion_*, ValuesClarification_*
 *   → IdentityKoan (these are IdentityKoan-form Integrate specimens)
 * 
 * Fire & ancestral wisdom → Ember:
 *   Shaman, Ancestor, AncestorII, Alchemist, AlchemistII, AlchemistIV,
 *   MagnumOpus, Elemental (fire-dominant)
 * 
 * Cosmic & quantum → Stellar:
 *   Astronaut, Stargazer, Observer, Schrodinger, Graviton
 * 
 * Nature & earth → Canopy:
 *   Gardener, Gaia, Wilding, Elementalist, Elemental (earth/water)
 * 
 * Disruption & chaos → Storm:
 *   Trickster, Glitch, LoopBreaker, Adaptive, Editor
 * 
 * Deep inner / subconscious → Ocean:
 *   Void, DreamWalker, Threshold, Shadow, Phenomenologist
 * 
 * Performance & narrative → Theater:
 *   Maestro, MythMaker, Biographer, Catalyst, Composer
 * 
 * Relational & care → Hearth:
 *   Guardian, Lover, Servant, ServantLeader, Diplomat, SocialPhysics,
 *   Mycelium, Tribalist, Interpreter
 * 
 * Systems & precision → Circuit:
 *   Hacker, Futurist, Engineer, Mentat, Cognitive, Grandmaster, Valuator
 * 
 * Transcendence & vastness → Cosmos:
 *   Infinite, Horizon, Ascendant, OmegaPoint, Source, Unity, Mastery,
 *   Ouroboros, Meaning, Synthesis, Weaver
 * 
 * Wisdom & contemplation → Practice (default -- spacious, neutral):
 *   Sage, Mystic, Stoic, Novice, Navigator, Architect, Visionary,
 *   Luminary, Mender, and any unmapped series
 * 
 * Specific specimens may override at the component level.
 */
export const SERIES_ATMOSPHERE_MAP: Record<string, NaviCueForm> = {
  // ── Ember: Fire & ancestral wisdom ──
  'Shaman': 'Ember',
  'Ancestor': 'Ember',
  'AncestorII': 'Ember',
  'Alchemist': 'Ember',
  'AlchemistII': 'Ember',
  'AlchemistIV': 'Ember',
  'MagnumOpus': 'Ember',

  // ── Stellar: Cosmic & quantum ──
  'Astronaut': 'Stellar',
  'Stargazer': 'Stellar',
  'Observer': 'Stellar',
  'Schrodinger': 'Stellar',
  'Graviton': 'Stellar',

  // ── Canopy: Nature & earth ──
  'Gardener': 'Canopy',
  'Gaia': 'Canopy',
  'Wilding': 'Canopy',
  'Elementalist': 'Canopy',

  // ── Storm: Disruption & chaos ──
  'Trickster': 'Storm',
  'Glitch': 'Storm',
  'LoopBreaker': 'Storm',
  'Adaptive': 'Storm',
  'Editor': 'Storm',

  // ── Ocean: Deep inner / subconscious ──
  'Void': 'Ocean',
  'DreamWalker': 'Ocean',
  'Threshold': 'Ocean',
  'Shadow': 'Ocean',
  'Phenomenologist': 'Ocean',
  'Resonator': 'Ocean',           // S103 -- Sound, vibration, depth

  // ── Theater: Performance & narrative ──
  'Maestro': 'Theater',
  'MythMaker': 'Theater',
  'Biographer': 'Theater',
  'Catalyst': 'Theater',
  'Composer': 'Theater',

  // ── Hearth: Relational & care ──
  'Guardian': 'Hearth',
  'Lover': 'Hearth',
  'Servant': 'Hearth',
  'ServantLeader': 'Hearth',
  'Diplomat': 'Hearth',
  'SocialPhysics': 'Hearth',
  'Mycelium': 'Hearth',
  'Tribalist': 'Hearth',
  'Interpreter': 'Hearth',

  // ── Circuit: Systems & precision ──
  'Hacker': 'Circuit',
  'Futurist': 'Circuit',
  'Engineer': 'Circuit',
  'Mentat': 'Circuit',
  'Cognitive': 'Circuit',
  'Grandmaster': 'Circuit',
  'Valuator': 'Circuit',

  // ── Cosmos: Transcendence & vastness ──
  'Infinite': 'Cosmos',
  'Horizon': 'Cosmos',
  'Ascendant': 'Cosmos',
  'OmegaPoint': 'Cosmos',
  'Source': 'Cosmos',
  'Unity': 'Cosmos',
  'Mastery': 'Cosmos',
  'Ouroboros': 'Cosmos',
  'Meaning': 'Cosmos',
  'Synthesis': 'Cosmos',
  'Weaver': 'Cosmos',

  // ── Elemental uses mixed -- default to Practice, override per-specimen ──
  'Elemental': 'Practice',

  // ── 11th Century: S101–S110 Reality-Actualization ──
  'Projector': 'Theater',         // S101 -- Projection, stage presence
  'Chronomancer': 'Cosmos',       // S102 -- Time, vast temporal expanse
  // Resonator (S103) is mapped to Ocean in the Ocean section above
  'Materialist': 'Ember',         // S104 -- Matter, construction, earth
  'Refractor': 'Stellar',         // S105 -- Light, optics (file prefix: Refractor_)
  'Engine': 'Circuit',            // S106 -- Thermodynamics, systems
  'CatalystChemistry': 'Glacier',  // S107 -- Chemistry, crystalline drift
  'QuantumArchitect': 'Tide',     // S108 -- Quantum, probability waves
  'Transmuter': 'Ember',          // S109 -- Alchemy, transformation
  'Cyberneticist': 'Circuit',     // S110 -- Feedback, cybernetic control
  'FieldArchitect': 'Stellar',    // S111 -- Magnetism, invisible fields, social physics
  'Kineticist': 'Storm',          // S112 -- Momentum, kinematics, Newton's laws
  'Crystal': 'Glacier',            // S113 -- Crystalline intelligence, clarity, pressure
  'Hydrodynamicist': 'Tide',       // S114 -- Fluid dynamics, flow, water wisdom
  'Aviator': 'Drift',              // S115 -- Aerodynamic efficiency, lift, Bernoulli
  'Tensegrity': 'Lattice',         // S116 -- Structural integrity, tension, geometry
  'Wayfinder': 'Compass',          // S117 -- Wayfinding cognition, navigation, stars
  'Receiver': 'Pulse',             // S118 -- Signal detection, frequency, reception
  'Vector': 'Drift',              // S119 -- Vector calculus, directional force, flow
  'Tuning': 'Echo',               // S120 -- Harmonic resonance, music, vibration

  // ── Practice (default): Wisdom & contemplation ──
  // Everything not listed above falls through to Practice via getSeriesAtmosphere()
};

/**
 * Get the recommended atmosphere archetype for a series.
 * 
 * @param seriesPrefix - Series name prefix (e.g., 'Sage', 'Shaman', 'Astronaut')
 * @returns NaviCueForm archetype for that series
 */
export function getSeriesAtmosphere(seriesPrefix: string): NaviCueForm {
  return SERIES_ATMOSPHERE_MAP[seriesPrefix] || 'Practice';
}

// =====================================================================
// COMPREHENSIVE PALETTE QUICKSTART
// =====================================================================

/**
 * One-call convenience: give me everything I need for a NaviCue.
 * 
 * Usage in a specimen:
 * ```
 * const { palette, atmosphere, motion } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Probe');
 * ```
 */
export function navicueQuickstart(
  signatureKey: MagicSignatureKey,
  mechanism?: string,
  kbe?: string,
  form?: NaviCueForm,
) {
  const palette = createNaviCuePalette(signatureKey, mechanism, kbe);
  const atmosphere = createAtmosphereConfig(palette, signatureKey, form);
  const motion = createMotionConfig(signatureKey);

  return { palette, atmosphere, motion, radius };
}

// =====================================================================
// SERIES_REGISTRY -- Single Color Authority for All Series Themes
// =====================================================================

/**
 * SERIES_REGISTRY: The canonical color data for every series theme.
 *
 * This replaces seriesThemes.tsx as the SINGLE AUTHORITY for series colors.
 * 69 entries covering Series 31-100 (the Gen 3 Extended Series + Ouroboros).
 *
 * Each entry stores HSL tuples [H, S, L] for programmatic color generation.
 * The old seriesThemes.tsx is now a thin re-export shim that reads from here.
 *
 * RULE: If you need a series color, it comes from here. Nowhere else.
 */
export interface SeriesRegistryEntry {
  id: string;
  name: string;
  primaryHSL: [number, number, number];
  accentHSL: [number, number, number];
  voidHSL: [number, number, number];
}

export const SERIES_REGISTRY: Record<string, SeriesRegistryEntry> = {
  bender:       { id: 'bender',       name: 'The Reality Bender',             primaryHSL: [220, 8, 45],   accentHSL: [280, 15, 50],  voidHSL: [220, 6, 6] },
  magnet:       { id: 'magnet',       name: 'The Magnet',                     primaryHSL: [270, 12, 22],  accentHSL: [42, 25, 40],   voidHSL: [270, 8, 5] },
  oracle:       { id: 'oracle',       name: 'The Oracle',                     primaryHSL: [250, 18, 28],  accentHSL: [35, 22, 38],   voidHSL: [250, 10, 5] },
  maestro:      { id: 'maestro',      name: 'The Maestro',                    primaryHSL: [0, 0, 8],      accentHSL: [45, 30, 35],   voidHSL: [0, 0, 4] },
  shaman:       { id: 'shaman',       name: 'The Shaman',                     primaryHSL: [28, 25, 25],   accentHSL: [120, 6, 30],   voidHSL: [28, 12, 5] },
  stargazer:    { id: 'stargazer',    name: 'The Stargazer',                  primaryHSL: [230, 20, 12],  accentHSL: [280, 18, 35],  voidHSL: [230, 15, 4] },
  mythmaker:    { id: 'mythmaker',    name: 'The Myth Maker',                 primaryHSL: [42, 22, 28],   accentHSL: [35, 18, 42],   voidHSL: [42, 10, 5] },
  shapeshifter: { id: 'shapeshifter', name: 'The Shape Shifter',              primaryHSL: [210, 6, 35],   accentHSL: [300, 12, 40],  voidHSL: [210, 4, 5] },
  dreamwalker:  { id: 'dreamwalker',  name: 'The Dream Walker',               primaryHSL: [245, 22, 20],  accentHSL: [185, 18, 35],  voidHSL: [245, 15, 4] },
  magnumopus:   { id: 'magnumopus',   name: 'The Magnum Opus',                primaryHSL: [30, 28, 25],   accentHSL: [48, 30, 38],   voidHSL: [30, 12, 4] },
  timeweaver:   { id: 'timeweaver',   name: 'The Time Weaver',                primaryHSL: [35, 20, 22],   accentHSL: [45, 22, 38],   voidHSL: [35, 10, 5] },
  prism:        { id: 'prism',        name: 'The Prism',                      primaryHSL: [220, 12, 25],  accentHSL: [280, 22, 42],  voidHSL: [220, 8, 3] },
  graviton:     { id: 'graviton',     name: 'The Graviton',                   primaryHSL: [220, 8, 18],   accentHSL: [200, 15, 30],  voidHSL: [220, 6, 3] },
  observer:     { id: 'observer',     name: 'The Observer',                   primaryHSL: [260, 12, 22],  accentHSL: [180, 18, 35],  voidHSL: [260, 8, 3] },
  timecapsule:  { id: 'timecapsule',  name: 'The Time Capsule',               primaryHSL: [35, 22, 24],   accentHSL: [42, 28, 40],   voidHSL: [35, 12, 4] },
  loopbreaker:  { id: 'loopbreaker',  name: 'The Loop Breaker',               primaryHSL: [210, 8, 32],   accentHSL: [140, 15, 32],  voidHSL: [210, 6, 4] },
  retrocausal:  { id: 'retrocausal',  name: 'The Retro-Causal',               primaryHSL: [30, 18, 26],   accentHSL: [205, 20, 35],  voidHSL: [30, 10, 4] },
  threshold:    { id: 'threshold',    name: 'The Threshold',                  primaryHSL: [270, 15, 22],  accentHSL: [285, 20, 38],  voidHSL: [270, 10, 3] },
  soma:         { id: 'soma',         name: 'The Soma',                       primaryHSL: [15, 22, 28],   accentHSL: [45, 18, 38],   voidHSL: [15, 10, 4] },
  frequency:    { id: 'frequency',    name: 'The Frequency',                  primaryHSL: [210, 12, 28],  accentHSL: [48, 22, 36],   voidHSL: [210, 8, 3] },
  tuner:        { id: 'tuner',        name: 'The Tuner',                      primaryHSL: [200, 10, 30],  accentHSL: [230, 25, 40],  voidHSL: [220, 10, 4] },
  broadcast:    { id: 'broadcast',    name: 'The Broadcast',                  primaryHSL: [25, 20, 25],   accentHSL: [340, 18, 38],  voidHSL: [25, 8, 4] },
  schrodinger:  { id: 'schrodinger',  name: 'The Schrodinger Box',            primaryHSL: [265, 14, 20],  accentHSL: [175, 22, 38],  voidHSL: [265, 10, 3] },
  glitch:       { id: 'glitch',       name: 'The Glitch',                     primaryHSL: [140, 10, 22],  accentHSL: [0, 35, 40],    voidHSL: [140, 6, 3] },
  construct:    { id: 'construct',    name: 'The Architect (Construct)',       primaryHSL: [30, 18, 24],   accentHSL: [25, 30, 42],   voidHSL: [30, 12, 4] },
  biographer:   { id: 'biographer',   name: 'The Biographer (Mythos)',         primaryHSL: [35, 14, 22],   accentHSL: [42, 28, 45],   voidHSL: [20, 10, 4] },
  optician:     { id: 'optician',     name: 'The Optician (Clarity)',          primaryHSL: [200, 16, 26],  accentHSL: [195, 22, 44],  voidHSL: [210, 8, 3] },
  interpreter:  { id: 'interpreter',  name: 'The Interpreter (Empathy)',       primaryHSL: [15, 18, 24],   accentHSL: [32, 26, 46],   voidHSL: [10, 10, 4] },
  socialphysics:{ id: 'socialphysics',name: 'The Diplomat (Social Physics)',   primaryHSL: [215, 14, 24],  accentHSL: [175, 20, 40],  voidHSL: [215, 10, 4] },
  tribalist:    { id: 'tribalist',    name: 'The Tribalist (Belonging)',       primaryHSL: [25, 22, 22],   accentHSL: [38, 28, 42],   voidHSL: [25, 10, 3] },
  valuator:     { id: 'valuator',     name: 'The Valuator (Worth)',            primaryHSL: [45, 18, 22],   accentHSL: [42, 28, 44],   voidHSL: [45, 10, 3] },
  editor:       { id: 'editor',       name: 'The Editor (Signal)',             primaryHSL: [220, 10, 28],  accentHSL: [200, 22, 40],  voidHSL: [220, 8, 3] },
  grandmaster:  { id: 'grandmaster',  name: 'The Grandmaster (Systems)',       primaryHSL: [230, 8, 18],   accentHSL: [48, 24, 40],   voidHSL: [230, 6, 3] },
  catalyst:     { id: 'catalyst',     name: 'The Catalyst (Influence)',        primaryHSL: [240, 12, 22],  accentHSL: [270, 18, 42],  voidHSL: [240, 8, 3] },
  kinetic:      { id: 'kinetic',      name: 'The Kinetic (Action)',            primaryHSL: [220, 10, 20],  accentHSL: [25, 30, 42],   voidHSL: [220, 8, 3] },
  adaptive:     { id: 'adaptive',     name: 'The Adaptive (Resilience)',       primaryHSL: [160, 14, 20],  accentHSL: [45, 22, 40],   voidHSL: [160, 8, 3] },
  shadow:       { id: 'shadow',       name: 'The Shadow Worker',              primaryHSL: [270, 12, 16],  accentHSL: [42, 25, 38],   voidHSL: [270, 8, 3] },
  ancestor:     { id: 'ancestor',     name: 'The Ancestor (Lineage)',          primaryHSL: [30, 20, 18],   accentHSL: [35, 25, 40],   voidHSL: [30, 10, 3] },
  trickster:    { id: 'trickster',    name: 'The Trickster (Play)',            primaryHSL: [48, 18, 20],   accentHSL: [340, 22, 42],  voidHSL: [48, 8, 3] },
  astronaut:    { id: 'astronaut',    name: 'The Astronaut (Awe)',             primaryHSL: [225, 16, 14],  accentHSL: [210, 20, 38],  voidHSL: [225, 10, 2] },
  wonderer:     { id: 'wonderer',     name: 'The Wonderer (Curiosity)',        primaryHSL: [38, 20, 22],   accentHSL: [275, 16, 40],  voidHSL: [38, 10, 3] },
  surfer:       { id: 'surfer',       name: 'The Surfer (Flow)',               primaryHSL: [195, 16, 18],  accentHSL: [170, 20, 36],  voidHSL: [195, 10, 3] },
  meaning:      { id: 'meaning',      name: 'The Meaning Maker (Purpose)',     primaryHSL: [35, 18, 20],   accentHSL: [45, 25, 38],   voidHSL: [35, 10, 3] },
  servant:      { id: 'servant',      name: 'The Servant (Contribution)',      primaryHSL: [145, 14, 18],  accentHSL: [42, 22, 40],   voidHSL: [145, 8, 3] },
  synthesis:    { id: 'synthesis',    name: 'The Alchemist III (Synthesis)',    primaryHSL: [30, 22, 22],   accentHSL: [48, 28, 40],   voidHSL: [30, 10, 3] },
  futureweaver: { id: 'futureweaver', name: 'The Future Weaver',               primaryHSL: [220, 14, 20],  accentHSL: [175, 20, 38],  voidHSL: [220, 8, 3] },
  composer:     { id: 'composer',     name: 'The Composer (Harmony)',          primaryHSL: [240, 10, 18],  accentHSL: [45, 24, 38],   voidHSL: [240, 8, 3] },
  zenith:       { id: 'zenith',       name: 'The Zenith (Peak)',               primaryHSL: [210, 12, 22],  accentHSL: [200, 18, 42],  voidHSL: [210, 8, 3] },
  multiverse:   { id: 'multiverse',   name: 'The Multiverse (Self-Concept)',   primaryHSL: [270, 14, 18],  accentHSL: [195, 20, 40],  voidHSL: [270, 8, 3] },
  ethicist:     { id: 'ethicist',     name: 'The Ethicist (Moral Architect)',  primaryHSL: [220, 8, 20],   accentHSL: [38, 22, 38],   voidHSL: [220, 6, 3] },
  elementalist: { id: 'elementalist', name: 'The Elementalist (Nature)',       primaryHSL: [145, 18, 18],  accentHSL: [28, 25, 38],   voidHSL: [145, 10, 3] },
  mentat:       { id: 'mentat',       name: 'The Mentat (Super-Cognition)',    primaryHSL: [220, 12, 16],  accentHSL: [180, 18, 36],  voidHSL: [220, 8, 3] },
  intuition:    { id: 'intuition',    name: 'The Oracle (Intuition)',          primaryHSL: [265, 16, 18],  accentHSL: [38, 25, 38],   voidHSL: [265, 10, 3] },
  engineer:     { id: 'engineer',     name: 'The Engineer (Systems)',          primaryHSL: [210, 12, 18],  accentHSL: [25, 22, 38],   voidHSL: [210, 8, 3] },
  alchemistiv:  { id: 'alchemistiv',  name: 'The Alchemist IV (Emotion)',      primaryHSL: [15, 20, 18],   accentHSL: [42, 28, 38],   voidHSL: [15, 10, 3] },
  cognitive:    { id: 'cognitive',    name: 'The Architect II (Cognitive)',     primaryHSL: [225, 14, 18],  accentHSL: [40, 22, 38],   voidHSL: [225, 8, 3] },
  sage:         { id: 'sage',         name: 'The Sage (Wisdom)',               primaryHSL: [30, 12, 16],   accentHSL: [38, 22, 36],   voidHSL: [30, 8, 3] },
  gaia:         { id: 'gaia',         name: 'The Gaia (Connection)',           primaryHSL: [155, 16, 16],  accentHSL: [200, 20, 38],  voidHSL: [155, 8, 3] },
  mystic:       { id: 'mystic',       name: 'The Mystic (Transcendence)',      primaryHSL: [270, 14, 14],  accentHSL: [42, 20, 36],   voidHSL: [270, 10, 3] },
  ascendant:    { id: 'ascendant',    name: 'The Ascendant (Integration)',     primaryHSL: [28, 16, 18],   accentHSL: [45, 24, 40],   voidHSL: [28, 8, 3] },
  gardener:     { id: 'gardener',     name: 'The Gardener II (Stewardship)',   primaryHSL: [140, 16, 16],  accentHSL: [38, 24, 38],   voidHSL: [140, 8, 3] },
  ancestorii:   { id: 'ancestorii',   name: 'The Ancestor II (Legacy)',        primaryHSL: [25, 18, 16],   accentHSL: [40, 24, 38],   voidHSL: [25, 8, 3] },
  mastery:      { id: 'mastery',      name: 'The Magnum Opus II (Mastery)',    primaryHSL: [35, 16, 14],   accentHSL: [42, 26, 38],   voidHSL: [35, 8, 3] },
  horizon:      { id: 'horizon',      name: 'The Infinite Player II',          primaryHSL: [210, 14, 16],  accentHSL: [185, 18, 36],  voidHSL: [210, 8, 3] },
  void:         { id: 'void',         name: 'The Zero Point (Void)',           primaryHSL: [0, 0, 8],      accentHSL: [260, 12, 28],  voidHSL: [0, 0, 2] },
  unity:        { id: 'unity',        name: 'The Omega (Unity)',               primaryHSL: [38, 18, 16],   accentHSL: [42, 28, 42],   voidHSL: [38, 8, 3] },
  ouroboros:    { id: 'ouroboros',     name: 'The Ouroboros (Eternal Return)',  primaryHSL: [35, 14, 12],   accentHSL: [38, 22, 38],   voidHSL: [35, 8, 2] },

  // ═══════════════════════════════════════════════════════════════════
  // SECOND MILLENNIUM -- 11th Century (Series 101-110)
  // Reality-Actualization arc: Projection > Steering
  // ═══════════════════════════════════════════════════════════════════

  /** S101 -- THE PROJECTOR. Warm projector-beam amber. Theater of the mind. */
  projector:       { id: 'projector',       name: 'The Projector (Projection)',        primaryHSL: [38, 24, 26],   accentHSL: [45, 30, 42],   voidHSL: [38, 10, 4] },
  /** S102 -- THE CHRONOMANCER. Deep temporal indigo. Time bends here. */
  chronomancer:    { id: 'chronomancer',    name: 'The Chronomancer (Time)',            primaryHSL: [255, 18, 20],  accentHSL: [230, 22, 40],  voidHSL: [255, 10, 3] },
  /** S103 -- THE RESONATOR. Deep ocean teal, sound, vibration, depth. */
  resonator:       { id: 'resonator',       name: 'The Resonator (Sound)',             primaryHSL: [190, 18, 22],  accentHSL: [160, 15, 35],  voidHSL: [190, 12, 4] },
  /** S104 -- THE MATERIALIST. Earth stone, grounded, heavy, real. */
  materialist:     { id: 'materialist',     name: 'The Materialist (Matter)',           primaryHSL: [28, 22, 24],   accentHSL: [32, 28, 42],   voidHSL: [28, 10, 4] },
  /** S105 -- THE REFRACTOR. Cool indigo-violet, light bent through glass. */
  refractor:       { id: 'refractor',       name: 'The Refractor (Optics)',             primaryHSL: [245, 16, 22],  accentHSL: [260, 22, 42],  voidHSL: [245, 10, 3] },
  /** S106 -- THE ENGINE. Steel blue-gray with thermal orange undertone. */
  engine:          { id: 'engine',          name: 'The Engine (Thermodynamics)',        primaryHSL: [205, 14, 22],  accentHSL: [18, 30, 40],   voidHSL: [205, 8, 3] },
  /** S107 -- THE CATALYST II. Emerald reaction glow -- transformation chemistry. */
  catalystii:      { id: 'catalystii',      name: 'The Catalyst II (Reaction)',         primaryHSL: [165, 20, 22],  accentHSL: [140, 24, 40],  voidHSL: [165, 10, 3] },
  /** S108 -- THE QUANTUM ARCHITECT. Violet probability cloud. */
  quantumarchitect:{ id: 'quantumarchitect',name: 'The Quantum Architect (Probability)',primaryHSL: [262, 18, 20],  accentHSL: [285, 22, 42],  voidHSL: [262, 10, 3] },
  /** S109 -- THE TRANSMUTER. Deep alchemical gold -- lead becoming gold. */
  transmuter:      { id: 'transmuter',      name: 'The Transmuter (Alchemy)',           primaryHSL: [32, 26, 22],   accentHSL: [42, 32, 44],   voidHSL: [32, 12, 3] },
  /** S110 -- THE CYBERNETICIST. Teal-green feedback loop. System alive. */
  cyberneticist:   { id: 'cyberneticist',   name: 'The Cyberneticist (Steering)',       primaryHSL: [175, 18, 20],  accentHSL: [165, 22, 38],  voidHSL: [175, 10, 3] },

  // ═══════════════════════════════════════════════════════════════════
  // SECOND MILLENNIUM -- 12th Century (Series 111-120)
  // Physics-Embodiment arc: Field -> Tuning
  // ═══════════════════════════════════════════════════════════════════

  /** S111 -- THE FIELD ARCHITECT. Electromagnetic blue-violet, invisible forces made visible. */
  fieldarchitect:    { id: 'fieldarchitect',    name: 'The Field Architect (Electromagnetism)', primaryHSL: [240, 14, 20],  accentHSL: [255, 20, 40],  voidHSL: [240, 8, 3] },
  /** S112 -- THE KINETICIST. Warm kinetic orange, momentum, force, impact. */
  kineticist:        { id: 'kineticist',        name: 'The Kineticist (Mechanics)',              primaryHSL: [15, 20, 22],   accentHSL: [25, 28, 42],   voidHSL: [15, 10, 3] },
  /** S113 -- THE CRYSTAL. Cool cyan, lattice symmetry, ordered beauty. */
  crystal:           { id: 'crystal',           name: 'The Crystal (Crystallography)',            primaryHSL: [185, 16, 20],  accentHSL: [190, 22, 40],  voidHSL: [185, 10, 3] },
  /** S114 -- THE HYDRODYNAMICIST. Deep ocean blue, pressure, flow, erosion. */
  hydrodynamicist:   { id: 'hydrodynamicist',   name: 'The Hydrodynamicist (Fluid Dynamics)',     primaryHSL: [215, 18, 20],  accentHSL: [205, 24, 40],  voidHSL: [215, 10, 3] },
  /** S115 -- THE AVIATOR. Steel blue, lift, drag, boundary layers. */
  aviator:           { id: 'aviator',           name: 'The Aviator (Aerodynamics)',               primaryHSL: [200, 14, 22],  accentHSL: [195, 20, 42],  voidHSL: [200, 8, 3] },
  /** S116 -- THE TENSEGRITY. Warm structural earth, tension and compression in balance. */
  tensegrity:        { id: 'tensegrity',        name: 'The Tensegrity (Structural Integrity)',    primaryHSL: [25, 18, 20],   accentHSL: [30, 24, 40],   voidHSL: [25, 10, 3] },
  /** S117 -- THE WAYFINDER. Teal ocean, star paths, swell reading, deep navigation. */
  wayfinder:         { id: 'wayfinder',         name: 'The Wayfinder (Navigation)',               primaryHSL: [180, 16, 20],  accentHSL: [175, 22, 40],  voidHSL: [180, 10, 3] },
  /** S118 -- THE RECEIVER. Electric teal-green, signal detection, noise floor. */
  receiver:          { id: 'receiver',          name: 'The Receiver (Signal Processing)',          primaryHSL: [170, 18, 20],  accentHSL: [165, 24, 40],  voidHSL: [170, 10, 3] },
  /** S119 -- THE VECTOR. Neutral cool blue, mathematical direction and magnitude. */
  vector:            { id: 'vector',            name: 'The Vector (Vector Mathematics)',           primaryHSL: [225, 12, 20],  accentHSL: [220, 20, 40],  voidHSL: [225, 8, 3] },
  /** S120 -- THE TUNING. Warm amber, harmonic series, resonance, temperament. */
  tuning:            { id: 'tuning',            name: 'The Tuning (Acoustic Harmonics)',           primaryHSL: [35, 20, 20],   accentHSL: [40, 26, 40],   voidHSL: [35, 10, 3] },
};

/**
 * Look up a series theme entry from the registry.
 */
export function getSeriesRegistryEntry(slug: string): SeriesRegistryEntry | undefined {
  return SERIES_REGISTRY[slug];
}

/**
 * Generate an HSLA string from HSL tuple with custom alpha and lightness offset.
 * Canonical replacement for seriesThemes.themeColor().
 */
export function registryThemeColor(
  hsl: [number, number, number],
  alpha: number,
  lightnessOffset = 0,
): string {
  return `hsla(${hsl[0]}, ${hsl[1]}%, ${Math.max(0, Math.min(100, hsl[2] + lightnessOffset))}%, ${safeAlpha(alpha)})`;
}

/**
 * Generate interaction feedback flash color from registry entry.
 * Canonical replacement for seriesThemes.flashColor().
 */
export function registryFlashColor(entry: SeriesRegistryEntry): string {
  return registryThemeColor(entry.accentHSL, 0.06, 10);
}

// =====================================================================
// SECTION 8: SPECIMEN TEMPLATE SPECIFICATION
// =====================================================================

/**
 * CANONICAL SPECIMEN STRUCTURE
 * ============================
 *
 * Every NaviCue specimen follows this exact anatomy.
 * This is the target pattern for the next 1,000 builds.
 *
 * LAYER ADOPTION TIERS:
 *
 *   REQUIRED (all new specimens):
 *     navicueQuickstart()       -> palette, atmosphere, motion, radius
 *     NaviCueShell              -> gradient background, atmosphere, centering
 *     navicueType.*             -> all typography
 *     navicueInteraction.*      -> button/input geometry
 *     navicueButtonStyle()      -> button colors from palette
 *     useNaviCueStages()        -> lifecycle (no manual timers for stage progression)
 *     NaviCueProps type         -> { data?, onComplete? }
 *
 *   RECOMMENDED (use when the mechanic calls for it):
 *     useHoldInteraction        -> Pattern A (hold-to-fill)
 *     useDragInteraction        -> Pattern B (drag-to-adjust)
 *     useTypeInteraction        -> Pattern C (type-to-express)
 *     useDrawInteraction        -> Pattern D (draw-to-reveal)
 *     useBreathEngine           -> any somatic mechanic
 *
 *   ADVANCED (seal specimens, complex narratives):
 *     composeMechanics()        -> heat-band-validated delivery spec
 *     useTextMaterializer       -> text arrival animation
 *     useReceiptCeremony        -> seal ceremony
 *
 *   DEPRECATED (do not use in new specimens):
 *     Manual timer boilerplate  -> use useNaviCueStages instead
 *     Direct @/design-tokens    -> use navicue-blueprint re-exports
 *     navicueTypography         -> use navicueType
 *     Custom stage type defs    -> import NaviCueStage from useNaviCueStages
 *     Bare 'monospace'          -> use fonts.mono
 *
 * CANONICAL FILE STRUCTURE:
 *
 * ```tsx
 * // === 1. HEADER DOCBLOCK ===
 * // Series name, specimen number, title, one-line essence, interaction pattern
 *
 * // === 2. IMPORTS (strict order) ===
 * import { useEffect } from 'react';                                      // React
 * import { motion, AnimatePresence } from 'motion/react';                 // Animation
 * import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';  // Tokens
 * import { NaviCueShell } from '../NaviCueShell';                         // Shell
 * import { SERIES_THEME, themeColor } from '../interactions/seriesThemes';// Series colors (Gen 3)
 * import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages'; // Lifecycle
 * import { useHoldInteraction } from '../interactions/useHoldInteraction'; // Interaction hook
 *
 * // === 3. MODULE-LEVEL SETUP (outside component) ===
 * const { palette, radius } = navicueQuickstart('signature', 'mechanism', 'kbe', 'form');
 *
 * // === 4. COMPONENT ===
 * export default function Series_DisplayName({ onComplete }: NaviCueProps) {
 *   const { stage, setStage, addTimer } = useNaviCueStages();
 *   // ... interaction hooks, state ...
 *
 *   return (
 *     <NaviCueShell signatureKey="..." mechanism="..." kbe="..." form="..." mode="immersive"
 *       isAfterglow={stage === 'afterglow'}>
 *       <AnimatePresence mode="wait">
 *         {stage === 'arriving' && ( <arriving content /> )}
 *         {stage === 'present'  && ( <invitation/prompt /> )}
 *         {stage === 'active'   && ( <interaction scene /> )}
 *         {stage === 'resonant' && ( <insight landing /> )}
 *         {stage === 'afterglow' && ( <poetic coda /> )}
 *       </AnimatePresence>
 *     </NaviCueShell>
 *   );
 * }
 * ```
 *
 * INTERACTION SCENE ANATOMY:
 *   The 'active' stage contains the bespoke content. It follows this structure:
 *
 *   <motion.div>  (stage container, flex column, centered)
 *     <div style={navicueType.prompt}>  (the prompt text)
 *     <div {...interactionProps}>        (the interactive element, e.g., SVG scene)
 *       <svg viewBox="...">             (SVG scene -- see SVG_SCENE_RULES below)
 *     </div>
 *     <div style={navicueType.hint}>    (interaction hint)
 *   </motion.div>
 */

// =====================================================================
// SECTION 9: SVG SCENE RULES
// =====================================================================

/**
 * SVG SCENE CONTAINER SPECIFICATION
 * ==================================
 *
 * Most NaviCue specimens include an SVG "scene" -- a visual metaphor
 * that the user interacts with (spacetime grid, compass, flame, etc.).
 * These scenes live INSIDE NaviCueShell's gradient atmosphere.
 *
 * THE FUNDAMENTAL RULE:
 *   The shell provides the world. The scene provides the object.
 *   The scene container must be TRANSPARENT or NEAR-TRANSPARENT
 *   so the shell's gradient atmosphere shows through.
 *
 * The "dark container" defect occurred because scene containers
 * were given opaque backgrounds (0.4-0.98), creating black rectangles
 * that obliterated the shell's atmosphere. This made every specimen
 * look the same -- a dark box on a dark background.
 */

export const SVG_SCENE_RULES = {
  /**
   * CONTAINER BACKGROUND OPACITY
   * Maximum opacity for the SVG container's background color.
   * Use palette.primaryFaint (0.06) or themeColor(hsl, alpha, offset).
   *
   * SAFE RANGE:   0.0 - 0.25  (transparent to barely visible tint)
   * BORDERLINE:   0.25 - 0.35 (noticeable but atmosphere still visible)
   * DEFECT:       0.35+       (atmosphere blocked -- NEVER do this)
   *
   * The container's role is to provide a subtle boundary or tint,
   * not to create a separate visual world inside the shell's world.
   */
  containerBackgroundMaxOpacity: 0.30,

  /**
   * INTERACTIVE ELEMENT MINIMUM OPACITY
   * The minimum opacity for any SVG element the user can see or interact with.
   *
   * Elements below this threshold are functionally invisible on most
   * displays and serve no purpose. The "ultra-faint" anti-pattern
   * (0.02-0.05 strokes) was widespread in the first 1,000 builds.
   *
   * Grid lines / structural:    0.06 minimum
   * Labels / text:              0.10 minimum (navicueType enforces 11px floor; this is the opacity floor)
   * Interactive elements:       0.12 minimum (must be clearly visible)
   * Active/highlighted:         0.20+ (must stand out from structural elements)
   */
  elementMinOpacity: {
    structural: 0.06,
    label: 0.10,
    interactive: 0.12,
    active: 0.20,
  },

  /**
   * STROKE WIDTH MINIMUM
   * The minimum strokeWidth for SVG lines and paths.
   *
   * At 0.3-0.4px, strokes are sub-pixel on most displays and
   * render as invisible or as rendering artifacts. Combined with
   * low opacity, they become completely invisible.
   */
  strokeWidthMin: 0.5,

  /**
   * VIEWBOX CONVENTIONS
   * Standard viewBox sizes for different scene types.
   *
   * Small inline scenes:    "0 0 200 140" or "0 0 220 160"
   * Standard scenes:        "0 0 260 200" or "0 0 280 220"
   * Wide panoramic scenes:  "0 0 320 180"
   * Square scenes:          "0 0 200 200"
   *
   * These are soft conventions, not hard rules. The important thing
   * is that the viewBox matches the container's aspect ratio.
   */
  viewBoxStandard: '0 0 260 200',
  viewBoxSmall: '0 0 200 140',
  viewBoxWide: '0 0 320 180',
  viewBoxSquare: '0 0 200 200',

  /**
   * CONTAINER SIZING
   * The SVG container should be constrained to avoid dominating the viewport.
   *
   * Width:  180-300px (never full-bleed inside the centered content area)
   * Height: determined by viewBox aspect ratio
   * Never use width="100%" on the container -- it makes scenes too large.
   */
  containerWidthMin: 180,
  containerWidthMax: 300,

  /**
   * COLOR DERIVATION
   * All colors in the SVG scene MUST derive from the palette or series theme.
   *
   * CORRECT:   stroke={palette.primary}
   * CORRECT:   fill={themeColor(TH.accentHSL, 0.15, 8)}
   * CORRECT:   stroke={palette.primaryGlow}
   * INCORRECT: stroke="rgba(255, 255, 255, 0.1)"
   * INCORRECT: fill="hsla(220, 15%, 30%, 0.8)"
   *
   * Exception: palette.text and palette.textFaint for labels within SVG.
   */
} as const;

// =====================================================================
// SECTION 10: ANTI-PATTERNS CATALOG
// =====================================================================

/**
 * ANTI-PATTERNS -- Documented Defects from the First 1,000 Builds
 * ================================================================
 *
 * These are systematic errors that occurred during batch production.
 * Each anti-pattern was found in 50+ files. They are documented here
 * so they are never repeated.
 *
 * AP-1: DARK CONTAINER ("The Black Box")
 * ----------------------------------------
 * DEFECT:  SVG scene container has background at 0.4-0.98 opacity
 * EFFECT:  Shell's gradient atmosphere is completely hidden behind
 *          an opaque rectangle. All specimens look identical -- dark
 *          box on dark background. The shell's atmosphere, particles,
 *          and glow orb are invisible in the scene area.
 * ROOT:    No max-opacity rule existed in the blueprint.
 * FIX:     Container background must be <= 0.30 opacity.
 *          Use palette.primaryFaint (0.06) or themeColor(hsl, 0.15-0.25).
 * FILES:   ~85 files across 14 series (Guardian through Wilding).
 *
 * AP-2: INVISIBLE ELEMENTS ("Ghost Strokes")
 * --------------------------------------------
 * DEFECT:  SVG strokes at 0.02-0.05 opacity with 0.3-0.4 strokeWidth
 * EFFECT:  Elements that should be visible (grid lines, paths, circles)
 *          are functionally invisible. The scene appears empty.
 * ROOT:    Aesthetic over-subtlety during batch generation.
 * FIX:     Minimum 0.06 opacity for structural, 0.12 for interactive.
 *          Minimum 0.5 strokeWidth.
 * OFTEN COEXISTS WITH: AP-1 (dark container makes faint elements
 *          doubly invisible).
 *
 * AP-3: SUB-FLOOR FONT SIZES
 * ---------------------------
 * DEFECT:  Font sizes below 11px (8px, 9px, 10px) in specimens
 * EFFECT:  Text is unreadable on mobile. Fails Apple HIG Caption 2.
 * ROOT:    Copy-paste from design tools that use pt, not px.
 * FIX:     NaviCueShell enforces 11px floor at render time (safety net).
 *          Source files should use navicueType tokens (never hardcode).
 * FILES:   ~200+ files (mechanical fix applied in QA sweep).
 *
 * AP-4: HARDCODED BUTTON PADDING
 * -------------------------------
 * DEFECT:  Buttons with padding: '6px 12px' or '8px 16px' (too small)
 * EFFECT:  Touch targets below 44px minimum. Fails Apple HIG.
 * ROOT:    Inlining styles instead of using navicueInteraction.button.
 * FIX:     Use navicueButtonStyle(palette) or navicueInteraction.button.
 *          Standard: 14px 24px. Small: 12px 18px. Nothing smaller.
 *
 * AP-5: SVG FONTSIZE ATTRIBUTES
 * ------------------------------
 * DEFECT:  <text fontSize="9"> or <text font-size="8px"> in SVG elements
 * EFFECT:  SVG text bypasses NaviCueShell's sanitizer (which only checks
 *          inline React styles, not SVG attributes). Sub-floor text persists.
 * ROOT:    SVG uses attributes, not CSS style objects.
 * FIX:     SVG text should use style={{ ...navicueType.micro }} or
 *          style={{ fontSize: navicueType.data.fontSize }}.
 *          Never use the fontSize attribute directly.
 *
 * AP-6: EM-DASH CHARACTERS
 * -------------------------
 * DEFECT:  U+2014 characters in text content
 * EFFECT:  Inconsistent with project style guide.
 * ROOT:    LLM generation defaults to typographic em-dashes.
 * FIX:     NaviCueShell sanitizes at render time (safety net).
 *          Source files should use '--' directly.
 *
 * AP-7: BARE MONOSPACE
 * ---------------------
 * DEFECT:  fontFamily: 'monospace' instead of fonts.mono
 * EFFECT:  Falls back to system default monospace (usually Courier),
 *          not the design system's curated stack (SF Mono, Monaco, etc.)
 * ROOT:    Copy-paste from generic code examples.
 * FIX:     NaviCueShell sanitizes at render time (safety net).
 *          Source files should use navicueType.code or navicueType.data.
 *
 * AP-8: MANUAL TIMER BOILERPLATE
 * --------------------------------
 * DEFECT:  Every file repeats 12 lines of timer setup:
 *            const [stage, setStage] = useState<Stage>('arriving');
 *            const timersRef = useRef<number[]>([]);
 *            const addTimer = (fn, ms) => { ... };
 *            useEffect(() => { addTimer(...); return () => ...; }, []);
 * EFFECT:  Drift in timer cleanup, inconsistent stage naming,
 *          duplicated code across 996 files.
 * ROOT:    useNaviCueStages was created after most files were built.
 * FIX:     Use useNaviCueStages(). It handles:
 *          - Stage state management
 *          - Timer setup + cleanup
 *          - Auto-advance: arriving -> present -> active
 *          Specimens only manage: active -> resonant -> afterglow
 *
 * AP-9: DUAL COLOR AUTHORITY
 * ---------------------------
 * DEFECT:  File imports BOTH palette (from quickstart) AND
 *          seriesThemes, then uses inconsistent colors from each.
 * EFFECT:  Some elements use palette colors, others use theme colors.
 *          The two systems can produce visually clashing results.
 * ROOT:    palette and seriesThemes evolved separately.
 * GUIDANCE: Gen 3 files use BOTH intentionally:
 *           - palette for text, buttons, semantic elements
 *           - seriesThemes for SVG scene elements (dual color system)
 *           This is the intended pattern for Gen 3.
 *           Gen 4+ (next 1,000) should evaluate whether SERIES_REGISTRY
 *           in this blueprint can fully replace seriesThemes.
 */

// =====================================================================
// SECTION 11: DELIVERY CHECKLIST
// =====================================================================

/**
 * PRE-COMMIT CHECKLIST FOR NAVICUE SPECIMENS
 * ============================================
 *
 * Run this checklist against every specimen before committing.
 * Each item maps to an anti-pattern above.
 *
 * This is the operational contract for batch production.
 * A specimen that fails any REQUIRED check is not shippable.
 */
export const DELIVERY_CHECKLIST = {
  /** DC-1 (REQUIRED): No SVG container background above 0.30 opacity */
  noOpaqueContainers: {
    check: 'Grep for background opacity in SVG containers',
    rule: 'Any background/fill on a scene container must be <= 0.30 alpha',
    antiPattern: 'AP-1',
  },

  /** DC-2 (REQUIRED): No invisible SVG elements */
  noGhostStrokes: {
    check: 'All SVG strokes/fills have opacity >= 0.06, strokeWidth >= 0.5',
    rule: 'Interactive elements >= 0.12 opacity. Active states >= 0.20',
    antiPattern: 'AP-2',
  },

  /** DC-3 (REQUIRED): No sub-floor font sizes */
  noSubFloorFonts: {
    check: 'No fontSize below 11px in either style objects or SVG attributes',
    rule: 'Use navicueType tokens. Shell enforces floor as safety net.',
    antiPattern: 'AP-3, AP-5',
  },

  /** DC-4 (REQUIRED): All buttons use system geometry */
  buttonGeometry: {
    check: 'All buttons use navicueButtonStyle() or navicueInteraction.button',
    rule: 'No hardcoded padding on buttons. Pill shape (9999px) always.',
    antiPattern: 'AP-4',
  },

  /** DC-5 (REQUIRED): No em-dashes in source */
  noEmDashes: {
    check: 'No U+2014 characters in .tsx files',
    rule: 'Use -- (double hyphen). Shell sanitizes as safety net.',
    antiPattern: 'AP-6',
  },

  /** DC-6 (REQUIRED): No bare monospace */
  noBareMonospace: {
    check: 'No fontFamily: "monospace" (use fonts.mono or navicueType.code)',
    rule: 'Shell sanitizes as safety net, but source should be correct.',
    antiPattern: 'AP-7',
  },

  /** DC-7 (REQUIRED for new builds): Use useNaviCueStages */
  useStagesHook: {
    check: 'Import useNaviCueStages, not manual timer boilerplate',
    rule: 'No manual timersRef pattern. Use addTimer from the hook.',
    antiPattern: 'AP-8',
  },

  /** DC-8 (REQUIRED): NaviCueShell wraps all content */
  shellWrapped: {
    check: 'Component returns <NaviCueShell ...>{content}</NaviCueShell>',
    rule: 'No specimen renders without a shell (except Gen 1 legacy).',
  },

  /** DC-9 (REQUIRED): Default export */
  defaultExport: {
    check: 'File uses export default function Series_DisplayName',
    rule: 'MasterRenderer expects default exports.',
  },

  /** DC-10 (RECOMMENDED): Colors from palette/theme only */
  noHardcodedColors: {
    check: 'No raw hsla(), rgba(), or hex colors',
    rule: 'Derive all colors from palette or themeColor(TH.*, alpha, offset)',
    antiPattern: 'AP-9',
  },

  /** DC-11 (RECOMMENDED): Interaction hooks for common patterns */
  useInteractionHooks: {
    check: 'Hold, drag, type, draw interactions use the shared hooks',
    rule: 'Reduces per-file complexity and ensures consistent UX.',
  },

  /** DC-12 (WATCH): Stage timing sanity */
  stageTiming: {
    check: 'arriving < 3s, present < 6s, resonant 3-8s, afterglow 3-6s',
    rule: 'Total specimen duration should be 15-45s. Never over 60s.',
  },
} as const;

// =====================================================================
// SECTION 12: GENERATION 4 DELIVERY SPEC
// =====================================================================

/**
 * GEN 4 DELIVERY SPECIFICATION
 * =============================
 *
 * The next 1,000 NaviCues should use the FULL STACK, not just the
 * foundation layer. Here is the target adoption profile:
 *
 * IMPORT BLOCK (every Gen 4 file):
 * ```tsx
 * import { useEffect } from 'react';
 * import { motion, AnimatePresence } from 'motion/react';
 * import { navicueQuickstart, navicueType, navicueButtonStyle } from '@/app/design-system/navicue-blueprint';
 * import { NaviCueShell } from '../NaviCueShell';
 * import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
 * // + interaction hook (useHoldInteraction, useDragInteraction, etc.)
 * // + seriesTheme if Gen 3 dual-color (SERIES_THEME, themeColor)
 * ```
 *
 * MODULE-LEVEL SETUP (every Gen 4 file):
 * ```tsx
 * const { palette, radius } = navicueQuickstart('signature', 'mechanism', 'kbe', 'form');
 * ```
 *
 * COMPONENT BODY (every Gen 4 file):
 * ```tsx
 * export default function Series_Name({ onComplete }: NaviCueProps) {
 *   const { stage, setStage, addTimer } = useNaviCueStages();
 *   // ... bespoke interaction logic ...
 *   return (
 *     <NaviCueShell ...props isAfterglow={stage === 'afterglow'}>
 *       <AnimatePresence mode="wait">
 *         {stage === 'arriving' && ...}
 *         {stage === 'present'  && ...}
 *         {stage === 'active'   && ...}
 *         {stage === 'resonant' && ...}
 *         {stage === 'afterglow' && ...}
 *       </AnimatePresence>
 *     </NaviCueShell>
 *   );
 * }
 * ```
 *
 * INTERACTION PATTERNS (pick one per specimen):
 *   Pattern A -- Hold:  useHoldInteraction({ maxDuration, onComplete })
 *   Pattern B -- Drag:  useDragInteraction({ axis, sticky, onRelease })
 *   Pattern C -- Type:  useTypeInteraction({ maxLength, onSubmit })
 *   Pattern D -- Draw:  useDrawInteraction({ onStroke, minStrokes })
 *   Pattern E -- Tap:   onClick handler (simplest; no hook needed)
 *   Pattern F -- Observe: Pure presence (breath-synced, no interaction)
 *
 * SVG SCENE TEMPLATE:
 * ```tsx
 * <div style={{
 *   width: '240px',
 *   borderRadius: radius.sm,
 *   overflow: 'hidden',
 *   background: themeColor(TH.voidHSL, 0.15, 0), // <= 0.30 opacity
 * }}>
 *   <svg width="100%" height="100%" viewBox="0 0 260 200">
 *     {/* Structural grid: opacity >= 0.06, strokeWidth >= 0.5 [end comment] }
 *     {/* Interactive elements: opacity >= 0.12 [end comment] }
 *     {/* Active/highlighted: opacity >= 0.20 [end comment] }
 *     {/* Labels: use style navicueType.micro, never fontSize attr [end comment] }
 *   </svg>
 * </div>
 * ```
 *
 * SEAL SPECIMENS (10th in each series):
 *   Seal specimens SHOULD use the full advanced stack:
 *   - composeMechanics() for heat-band validation
 *   - useBreathEngine() for somatic pulse
 *   - useTextMaterializer() for text arrival
 *   - useReceiptCeremony() for seal ceremony
 *   Reference: Mystic_TranscendenceSeal.tsx
 */