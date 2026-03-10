/**
 * DESIGN CENTER TOKENS
 * ════════════════════
 * DC-specific constants that extend the core design-tokens.ts.
 * The core file defines visual primitives (colors, fonts, spacing).
 * This file defines Design Center layout and component constants.
 *
 * RULE: If a value appears in more than one file, it belongs here.
 * RULE: Every magic number has a name.
 * RULE: Every color derives from core tokens or data files.
 */

import { colors, surfaces, fonts, mobile, withAlpha, TRANSPARENT } from '@/design-tokens';

// ─── Color Utilities ────────────────────────────────────────
// Re-export withAlpha and TRANSPARENT from core design-tokens for backward compatibility.
// All new code should import directly from '@/design-tokens'.
export { withAlpha, TRANSPARENT };

// ─── Layout ─────────────────────────────────────────────────
// Shared dimensions used across the shell, nav, and lab pages.

export const layout = {
  /** Width of the glass side nav rail (desktop) */
  navRailWidth: 64,
  /** Height of the mobile bottom tab bar */
  mobileTabHeight: 64,
  /** Width of the device mirror panel (desktop) */
  devicePanelWidth: 320,
  /** Top bar height */
  topBarHeight: 52,
  /** Breakpoint below which we switch to mobile layout */
  mobileBreakpoint: mobile.breakpoints.mobile,
  /** Breakpoint below which device mirror hides */
  deviceBreakpoint: mobile.breakpoints.tablet,
} as const;

// ─── Device Frame ──────────────────────────────────────────
// Physical dimensions of the iPhone device mock.

export const deviceFrame = {
  /** Device width inside the mirror panel */
  width: 260,
  /** Device height inside the mirror panel */
  height: 530,
  /** Corner radius of the device body */
  borderRadius: 40,
  /** Hero device in the overview (slightly larger) */
  hero: {
    width: 290,
    height: 590,
    borderRadius: 42,
  },
  /** Composer device — the page hero, scaled up to fill center column */
  composer: {
    width: 320,
    height: 652,
    borderRadius: 44,
  },
  /** Dynamic Island dimensions */
  island: {
    width: 84,
    height: 24,
    borderRadius: 12,
    top: 10,
  },
  /** Hero Dynamic Island (proportional) */
  heroIsland: {
    width: 90,
    height: 25,
    borderRadius: 13,
    top: 11,
  },
  /** Composer Dynamic Island (proportional to composer frame) */
  composerIsland: {
    width: 96,
    height: 27,
    borderRadius: 14,
    top: 12,
  },
} as const;

// ── Glass Physics ──────────────────────────────────────────
// Glass surface presets, derived from core tokens + extended.

export const glass = {
  /** Surface presets — named levels with computed values */
  presets: {
    subtle: { alpha: 0.03, blur: 8, frost: 0, label: 'subtle' },
    light: { alpha: 0.06, blur: 12, frost: 0.1, label: 'light' },
    medium: { alpha: 0.08, blur: 16, frost: 0.2, label: 'medium' },
    strong: { alpha: 0.12, blur: 20, frost: 0.3, label: 'strong' },
    frosted: { alpha: 0.15, blur: 32, frost: 0.5, label: 'frosted' },
  },
  /** Generate a glass background from preset name */
  bg: (preset: 'subtle' | 'light' | 'medium' | 'strong' | 'frosted') => {
    const p = glass.presets[preset];
    return `rgba(255, 255, 255, ${p.alpha})`;
  },
  /** Generate backdrop-filter from preset name */
  backdrop: (preset: 'subtle' | 'light' | 'medium' | 'strong' | 'frosted') => {
    const p = glass.presets[preset];
    return `blur(${p.blur}px)`;
  },
  /** Standard glass border */
  border: surfaces.glass.border,
  /** Highlighted glass border */
  borderActive: withAlpha(colors.neutral.white, 0.08),
  /** Shell chrome surfaces */
  chrome: {
    navBackground: withAlpha(colors.neutral.black, 0.5),
    navBackdrop: 'blur(40px) saturate(180%)',
    topBarScrolled: withAlpha(colors.neutral.black, 0.7),
    mobileNav: withAlpha(colors.neutral.black, 0.85),
  },
} as const;

// ─── Signature Palette Derivation ───────────────────────────
// Maps each magic signature ID to its visual palette.
// These are the 8 canonical palettes used across the Design Center.
// Derived from the real magic signature data + design token base.

export interface SignaturePalette {
  id: string;
  name: string;
  emotionJob: string;
  /** Solid primary color */
  primary: string;
  /** Radial glow (low opacity for background orbs) */
  glow: string;
  /** Mid-opacity accent (particles, breath pulse) */
  accent: string;
  /** Ultra-low opacity glass tint */
  glass: string;
  /** Copy voice mode */
  copyMode: string;
  /** Voices that pair with this signature */
  voiceAffinity: string[];
}

export const SIGNATURE_PALETTES: SignaturePalette[] = [
  {
    id: 'sacred-ordinary',
    name: 'Sacred Ordinary',
    emotionJob: 'meaning in ordinary moments',
    primary: colors.signature.sacredOrdinary,
    glow: withAlpha(colors.signature.sacredOrdinary, 0.12),
    accent: withAlpha(colors.signature.sacredOrdinary, 0.35),
    glass: withAlpha(colors.signature.sacredOrdinary, 0.06),
    copyMode: 'warm, plain language',
    voiceAffinity: ['meaning_maker', 'warm_witness'],
  },
  {
    id: 'witness-ritual',
    name: 'Witness / Ritual',
    emotionJob: 'safety and continuity',
    primary: colors.signature.witnessRitual,
    glow: withAlpha(colors.signature.witnessRitual, 0.12),
    accent: withAlpha(colors.signature.witnessRitual, 0.35),
    glass: withAlpha(colors.signature.witnessRitual, 0.06),
    copyMode: 'grounded commitment',
    voiceAffinity: ['recovery_elder', 'warm_witness'],
  },
  {
    id: 'poetic-precision',
    name: 'Poetic Precision',
    emotionJob: 'insight with minimal words',
    primary: colors.brand.purple.light,
    glow: withAlpha(colors.brand.purple.light, 0.12),
    accent: withAlpha(colors.brand.purple.light, 0.35),
    glass: withAlpha(colors.brand.purple.light, 0.06),
    copyMode: 'concise, sharp',
    voiceAffinity: ['stoic_clarity', 'surgical_scientist'],
  },
  {
    id: 'koan-paradox',
    name: 'Koan / Paradox',
    emotionJob: 'pattern disruption through absurdity',
    primary: colors.signature.koanParadox,
    glow: withAlpha(colors.signature.koanParadox, 0.12),
    accent: withAlpha(colors.signature.koanParadox, 0.35),
    glass: withAlpha(colors.signature.koanParadox, 0.06),
    copyMode: 'disruptive, paradoxical',
    voiceAffinity: ['cosmic_jester', 'zen_elder'],
  },
  {
    id: 'sensory-cinema',
    name: 'Sensory Cinema',
    emotionJob: 'immersive somatic experience',
    primary: colors.accent.blue.primary,
    glow: withAlpha(colors.accent.blue.primary, 0.12),
    accent: withAlpha(colors.accent.blue.primary, 0.35),
    glass: withAlpha(colors.accent.blue.primary, 0.06),
    copyMode: 'evocative, sensory',
    voiceAffinity: ['somatic_guide'],
  },
  {
    id: 'quiet-authority',
    name: 'Quiet Authority',
    emotionJob: 'calm certainty and direction',
    primary: colors.accent.green.primary,
    glow: withAlpha(colors.accent.green.primary, 0.12),
    accent: withAlpha(colors.accent.green.primary, 0.35),
    glass: withAlpha(colors.accent.green.primary, 0.06),
    copyMode: 'assured, economical',
    voiceAffinity: ['calm_commander'],
  },
  {
    id: 'warm-provocation',
    name: 'Warm Provocation',
    emotionJob: 'loving challenge to the ego',
    primary: colors.signature.warmProvocation,
    glow: withAlpha(colors.signature.warmProvocation, 0.12),
    accent: withAlpha(colors.signature.warmProvocation, 0.35),
    glass: withAlpha(colors.signature.warmProvocation, 0.06),
    copyMode: 'challenging, warm',
    voiceAffinity: ['provocative_elder'],
  },
  {
    id: 'neural-reset',
    name: 'Neural Reset',
    emotionJob: 'downregulation and safety',
    primary: colors.accent.cyan.primary,
    glow: withAlpha(colors.accent.cyan.primary, 0.12),
    accent: withAlpha(colors.accent.cyan.primary, 0.35),
    glass: withAlpha(colors.accent.cyan.primary, 0.06),
    copyMode: 'minimal, spacious',
    voiceAffinity: ['somatic_guide', 'calm_commander'],
  },
];

function normalizeSignatureId(id: string): string {
  return id.replaceAll('_', '-');
}

/** Lookup a signature palette by ID */
export function getSignaturePalette(id: string): SignaturePalette | undefined {
  const normalizedId = normalizeSignatureId(id);
  return SIGNATURE_PALETTES.find((s) => s.id === normalizedId);
}

// ─── Specimen Copy ──────────────────────────────────────────
// Default NaviCue specimens for device mirror and previews.
// One per signature — the canonical example of each voice.

export interface SpecimenCopy {
  signatureId: string;
  copy: string;
  follow: string;
}

export const SPECIMEN_COPY: SpecimenCopy[] = [
  {
    signatureId: 'sacred-ordinary',
    copy: 'You already know.',
    follow: 'You just forgot you know.',
  },
  {
    signatureId: 'witness-ritual',
    copy: 'The mind is playing that old, loud song again.',
    follow: 'Step out of the theater for a moment.',
  },
  { signatureId: 'poetic-precision', copy: 'One breath.', follow: 'That is the entire practice.' },
  {
    signatureId: 'koan-paradox',
    copy: 'What if the thing you are resisting',
    follow: 'is the doorway?',
  },
  {
    signatureId: 'sensory-cinema',
    copy: 'The body remembers what the mind forgets.',
    follow: 'Let it speak.',
  },
  {
    signatureId: 'quiet-authority',
    copy: 'You do not need permission.',
    follow: 'You need direction.',
  },
  {
    signatureId: 'warm-provocation',
    copy: 'What are you protecting?',
    follow: 'And what does it cost?',
  },
  { signatureId: 'neural-reset', copy: 'Nothing needs to happen right now.', follow: 'Just this.' },
];

/** Get specimen copy for a signature */
export function getSpecimenCopy(signatureId: string): SpecimenCopy {
  const normalizedId = normalizeSignatureId(signatureId);
  return SPECIMEN_COPY.find((s) => s.signatureId === normalizedId) ?? SPECIMEN_COPY[0];
}

// ─── Nav Section Colors ─────────────────────────────────────
// Accent colors for each Design Center section, derived from token base.

export const sectionAccents = {
  overview: colors.brand.purple.primary,
  sanctuary: colors.signature.sacredOrdinary,
  palette: colors.brand.purple.light,
  type: colors.neutral.white,
  glass: colors.accent.cyan.primary,
  motion: colors.status.amber.bright, // warm amber
  atmosphere: colors.ui.atmosphereBlue, // soft blue
  voice: colors.signature.warmProvocation, // warm gold
  anatomy: colors.accent.green.primary,
  interaction: colors.ui.receiptYellow, // receipt yellow
  gates: colors.ui.gateRose, // gate rose
  entrances: colors.brand.purple.light, // entrance purple (poetic precision)
  atoms: colors.brand.purple.primary, // atom violet — symphony primary
} as const;

// ─── Chrono Contexts ─────────────────────────────────────
// The 4 temporal worlds. Shared by PaletteLab, AtmosphereLab, AnatomyLab.

export interface ChronoContext {
  id: string;
  label: string;
  colorShift: string;
  glassStyle: string;
  particleNote: string;
  textMode: string;
  breathPattern: 'calm' | 'box' | 'simple' | 'energize';
  speedModifier: string;
}

export const CHRONO_CONTEXTS: ChronoContext[] = [
  {
    id: 'morning',
    label: 'Morning',
    colorShift: 'warmer, +saturation',
    glassStyle: 'warm, clear',
    particleNote: 'upward drift like steam',
    textMode: 'emerge',
    breathPattern: 'simple',
    speedModifier: '-15% (slower)',
  },
  {
    id: 'work',
    label: 'Work',
    colorShift: 'neutral-cool, desaturated',
    glassStyle: 'crisp, minimal frost',
    particleNote: 'sparse, 15% faster',
    textMode: 'dissolve',
    breathPattern: 'box',
    speedModifier: '+25% (faster)',
  },
  {
    id: 'social',
    label: 'Social',
    colorShift: '+rose/amber warmth',
    glassStyle: 'subtle warmth',
    particleNote: 'lateral drift',
    textMode: 'dissolve (gentle)',
    breathPattern: 'simple',
    speedModifier: 'normal',
  },
  {
    id: 'night',
    label: 'Night',
    colorShift: '-warmth, 85% saturation',
    glassStyle: 'deep indigo',
    particleNote: '65% count, barely there',
    textMode: 'burn_in',
    breathPattern: 'calm',
    speedModifier: '-25-30% (slower)',
  },
];

// ─── Anti-Shame Gate ────────────────────────────────────────
// Words that trigger shame-language detection.

export const SHAME_FLAGS = [
  'should',
  'stop',
  'try harder',
  "don't",
  'need to',
  'must',
  'wrong',
  'fail',
  'broken',
  'weak',
  'lazy',
  'just',
  'simply',
  'obviously',
  'clearly',
] as const;

// ─── Depth Layers (z-order reference) ───────────────────────
// The canonical depth ordering for glass surfaces.
// Imported by GlassLab but defined here as the shared truth.

export const DEPTH_LAYERS = [
  { label: 'gradient', z: 0 },
  { label: 'glow orb', z: 1 },
  { label: 'particles', z: 2 },
  { label: 'glass surface', z: 3 },
  { label: 'content', z: 4 },
  { label: 'interaction', z: 5 },
] as const;

// ─── 4 Gates ────────────────────────────────────────────────
// Quality gates every specimen passes before shipping.

export interface Gate {
  id: string;
  name: string;
  alias: string;
  question: string;
  rule: string;
  accent: string;
}

export const GATES: Gate[] = [
  {
    id: 'autonomic',
    name: 'The Autonomic Check',
    alias: 'Huberman Test',
    question: 'Does the cognitive load match the target Heat Band?',
    rule: 'High heat = purely somatic (< 20 words). Green = challenge thinking.',
    accent: colors.accent.cyan.primary,
  },
  {
    id: 'shame',
    name: 'The Anti-Shame Check',
    alias: 'Ram Dass Test',
    question: 'Is there any hidden judgment in this prompt?',
    rule: "No 'should', 'stop', 'try harder', 'don't'. Validates the defense, never pathologizes.",
    accent: sectionAccents.voice,
  },
  {
    id: 'friction',
    name: 'The Friction Check',
    alias: 'Steve Jobs Test',
    question: 'Is the receipt effortless for its context?',
    rule: 'Morning = audio. Work = tap. Night = short text. Never friction mismatched to moment.',
    accent: colors.brand.purple.light,
  },
  {
    id: 'source',
    name: 'The Source Code Check',
    alias: 'Clinical Test',
    question: 'Does this target the root schema?',
    rule: 'Must tie back to the schema catalog. No whack-a-mole with symptoms.',
    accent: colors.accent.green.primary,
  },
];

// ─── Delivery Checklist ─────────────────────────────────────
// The 12-item spec-level checklist for production specimens.

export interface ChecklistItem {
  id: string;
  check: string;
  rule: string;
}

export const DELIVERY_CHECKLIST: ChecklistItem[] = [
  { id: 'DC-1', check: 'No opaque containers', rule: 'Container bg <= 0.30 alpha' },
  { id: 'DC-2', check: 'No ghost strokes', rule: 'SVG opacity >= 0.06, strokeWidth >= 0.5' },
  { id: 'DC-3', check: 'No sub-floor fonts', rule: 'Nothing below 11px' },
  { id: 'DC-4', check: 'System button geometry', rule: 'navicueButtonStyle() always' },
  { id: 'DC-5', check: 'No em-dashes', rule: "Use '--'" },
  { id: 'DC-6', check: 'No bare monospace', rule: 'Use fonts.mono' },
  { id: 'DC-7', check: 'useNaviCueStages', rule: 'No manual timer boilerplate' },
  { id: 'DC-8', check: 'Shell-wrapped', rule: 'NaviCueShell wraps everything' },
  { id: 'DC-9', check: 'Default export', rule: 'export default function' },
  { id: 'DC-10', check: 'No hardcoded colors', rule: 'All from palette/theme' },
  { id: 'DC-11', check: 'Interaction hooks', rule: 'Shared hooks for hold/drag/type/draw' },
  { id: 'DC-12', check: 'Stage timing sanity', rule: 'Total 15-45s, never >60s' },
];

// ─── Background Engine Visual Tokens ────────────────────────
// Visual identity for each background engine in the Design Center.
// Used by AtmosphereLab to render engine cards + device previews.
// Colors derived from signature palettes + section accents.

export interface EngineVisualToken {
  id: string;
  /** Accent color for the engine card glow */
  accent: string;
  /** Low-opacity glow for ambient orbs */
  glow: string;
  /** Icon character (emoji stand-in for the lab UI) */
  icon: string;
  /** CSS gradient for the device preview */
  previewGradient: string;
}

// Derive engine visuals from signature primaries via withAlpha
export const ENGINE_VISUALS: EngineVisualToken[] = [
  {
    id: 'particle-field',
    accent: withAlpha(colors.brand.purple.light, 0.4),
    glow: withAlpha(colors.brand.purple.light, 0.1),
    icon: '·',
    previewGradient: `radial-gradient(circle at 40% 60%, ${withAlpha(colors.brand.purple.light, 0.08)} 0%, transparent 60%)`,
  },
  {
    id: 'gradient-mesh',
    accent: withAlpha(colors.accent.cyan.primary, 0.4),
    glow: withAlpha(colors.accent.cyan.primary, 0.1),
    icon: '◌',
    previewGradient: `linear-gradient(180deg, transparent 0%, ${withAlpha(colors.accent.cyan.primary, 0.06)} 40%, transparent 100%)`,
  },
  {
    id: 'noise-fabric',
    accent: withAlpha(SIGNATURE_PALETTES[0].primary, 0.4),
    glow: withAlpha(SIGNATURE_PALETTES[0].primary, 0.1),
    icon: '↑',
    previewGradient: `radial-gradient(circle at 50% 50%, ${withAlpha(SIGNATURE_PALETTES[0].primary, 0.06)} 0%, transparent 70%)`,
  },
  {
    id: 'constellation',
    accent: withAlpha(colors.accent.blue.primary, 0.4),
    glow: withAlpha(colors.accent.blue.primary, 0.1),
    icon: '⁂',
    previewGradient: `radial-gradient(circle at 60% 40%, ${withAlpha(colors.accent.blue.primary, 0.06)} 0%, transparent 60%)`,
  },
  {
    id: 'liquid-pool',
    accent: withAlpha(colors.accent.cyan.primary, 0.4),
    glow: withAlpha(colors.accent.cyan.primary, 0.1),
    icon: '◎',
    previewGradient: `linear-gradient(180deg, transparent 30%, ${withAlpha(colors.accent.cyan.primary, 0.06)} 100%)`,
  },
  {
    id: 'void',
    accent: withAlpha(colors.neutral.white, 0.15),
    glow: withAlpha(colors.neutral.white, 0.03),
    icon: '⚡',
    previewGradient: `radial-gradient(circle at 50% 50%, ${withAlpha(colors.neutral.white, 0.015)} 0%, transparent 80%)`,
  },
];

/** Lookup engine visual token by ID */
export function getEngineVisual(id: string): EngineVisualToken | undefined {
  return ENGINE_VISUALS.find((e) => e.id === id);
}

// ─── Response Profile Visual Tokens ─────────────────────────
// Visual identity for each response profile in the Design Center.
// Response profiles define HOW the living atmosphere responds to
// the user's presence — the "kinetic empathy" layer.
//   Color Signature = palette
//   Visual Engine = visual vocabulary
//   Response Profile = PERSONALITY of the interaction

export interface ResponseVisualToken {
  id: string;
  /** Display name */
  name: string;
  /** Accent color for the response card */
  accent: string;
  /** Glow for ambient effects */
  glow: string;
  /** Metaphor — one-word essence */
  metaphor: string;
  /** What the user sees on touch */
  touchBehavior: string;
  /** Therapeutic purpose */
  clinicalUse: string;
  /** Best paired with these engine vibes */
  engineAffinity: string[];
  /** Best paired with these signature vibes */
  signatureAffinity: string[];
}

// Derive response visuals from signature/token primaries via withAlpha
export const RESPONSE_VISUALS: ResponseVisualToken[] = [
  {
    id: 'resonance',
    name: 'Resonance',
    accent: withAlpha(colors.accent.green.primary, 0.4),
    glow: withAlpha(colors.accent.green.primary, 0.1),
    metaphor: 'echo',
    touchBehavior: 'Expanding ring + inner glow burst — the environment mirrors the gesture',
    clinicalUse: 'Validation, mirroring, safety-building. For users who need to feel SEEN.',
    engineAffinity: ['void', 'graph'], // Synapse Pulse, Neural Web
    signatureAffinity: ['quiet-authority', 'sacred-ordinary'],
  },
  {
    id: 'contrast',
    name: 'Contrast',
    accent: withAlpha(SIGNATURE_PALETTES[3].primary, 0.4), // koan-paradox
    glow: withAlpha(SIGNATURE_PALETTES[3].primary, 0.1),
    metaphor: 'koan',
    touchBehavior:
      'Slow-expanding dark void — the opposite of light. Silence in response to noise.',
    clinicalUse: 'Pattern disruption, defamiliarization. For breaking rumination loops.',
    engineAffinity: ['noise', 'mesh'], // Ember Drift, Orbit Drift
    signatureAffinity: ['koan-paradox', 'warm-provocation'],
  },
  {
    id: 'witness',
    name: 'Witness',
    accent: withAlpha(SIGNATURE_PALETTES[1].primary, 0.4), // witness-ritual
    glow: withAlpha(SIGNATURE_PALETTES[1].primary, 0.1),
    metaphor: 'ghost',
    touchBehavior: 'Tiny 3px dot that barely appears and drifts away. Almost invisible.',
    clinicalUse: 'Low-arousal safety. For overwhelm states where stimulation is threatening.',
    engineAffinity: ['particle', 'fluid'], // Particle Field, Ripple Rings
    signatureAffinity: ['witness-ritual', 'neural-reset'],
  },
  {
    id: 'immersion',
    name: 'Immersion',
    accent: withAlpha(colors.accent.blue.primary, 0.4),
    glow: withAlpha(colors.accent.blue.primary, 0.1),
    metaphor: 'dissolve',
    touchBehavior:
      'Full-field radial glow from touch point — boundaries between user and environment dissolve.',
    clinicalUse: 'Somatic absorption, grounding, body-awareness. For dissociation recovery.',
    engineAffinity: ['mesh', 'graph'], // Orbit Drift, Neural Web
    signatureAffinity: ['sensory-cinema', 'poetic-precision'],
  },
];

/** Lookup response visual token by ID */
export function getResponseVisual(id: string): ResponseVisualToken | undefined {
  return RESPONSE_VISUALS.find((r) => r.id === id);
}

// ─── Layer Stack Accents ────────────────────────────────────
// Accent colors for each layer in the 8-layer NaviCue stack.
// Used by the Composer and AnatomyLab to color-code layers.
// Every color derives from design tokens via withAlpha().

type LayerKind =
  | 'canvas'
  | 'atmosphere'
  | 'background'
  | 'entrance'
  | 'hero'
  | 'voice'
  | 'receipt'
  | 'exit';

export const LAYER_ACCENTS: Record<LayerKind, string> = {
  canvas: withAlpha(colors.brand.purple.light, 0.4),
  atmosphere: withAlpha(sectionAccents.atmosphere, 0.4),
  background: withAlpha(colors.accent.cyan.primary, 0.4),
  entrance: withAlpha(colors.status.amber.bright, 0.4),
  hero: withAlpha(colors.brand.purple.primary, 0.5),
  voice: withAlpha(sectionAccents.voice, 0.4),
  receipt: withAlpha(colors.accent.green.primary, 0.4),
  exit: withAlpha(SIGNATURE_PALETTES[1].primary, 0.3), // witness-ritual
} as const;

// ─── Scrim & Overlay Tokens ─────────────────────────────────
// Shared overlay/scrim surfaces for label scrims, contrast touches, etc.

export const scrims = {
  /** Label scrim — fades content under readable text */
  labelBottom: `linear-gradient(to top, ${withAlpha(colors.neutral.black, 0.5)} 0%, transparent 100%)`,
  /** Contrast touch ripple — void darkness at touch point */
  contrastTouch: withAlpha(colors.neutral.black, 0.3),
  /** Option dropdown background */
  dropdownBg: surfaces.solid.elevated,
  /** Error/anti-pattern tint */
  errorTint: withAlpha(colors.status.red.mid, 0.04),
  /** Error/anti-pattern text */
  errorText: withAlpha(colors.status.red.mid, 0.4),
} as const;

// ─── Composer Layout ────────────────────────────────────────
// Layout constants specific to the Composer workspace.

export const composerLayout = {
  /** Layer stack panel width (desktop) */
  stackPanelWidth: 280,
  /** Detail panel width (desktop) */
  detailPanelWidth: 320,
  /** Breakpoint below which Composer goes single-column */
  mobileBreakpoint: 900,
  /** Brand glow for Composer logo mark */
  logoGradient: `linear-gradient(135deg, ${withAlpha(colors.brand.purple.primary, 0.25)} 0%, ${withAlpha(colors.accent.green.primary, 0.15)} 50%, ${withAlpha(colors.accent.cyan.primary, 0.15)} 100%)`,
  /** Subtle brand pill for nav links */
  brandPill: {
    bg: withAlpha(colors.brand.purple.primary, 0.08),
    bgHover: withAlpha(colors.brand.purple.primary, 0.15),
  },
} as const;

// ─── Workspace Section Accents ──────────────────────────────
// Per-workspace section accent palettes. Each workspace has its
// own semantic groupings (e.g. Motion has "entrance", "exit", "curve"),
// but all colors derive from design tokens. Centralized here so
// workspaces don't duplicate definitions.

export const workspaceSectionAccents = {
  /** Motion workspace sections */
  motion: {
    entrance: colors.brand.purple.light, // twilight shift
    exit: sectionAccents.gates, // rose — gate rose
    materialization: colors.accent.cyan.primary, // neural reset
    curve: sectionAccents.voice, // amber — voice gold
    voice: colors.accent.green.primary, // verdant calm
  },
  /** Voice workspace sections */
  voice: {
    voice: colors.accent.green.primary, // verdant green
    gesture: sectionAccents.voice, // warm gold
    entrance: colors.brand.purple.light, // twilight shift
    exit: sectionAccents.gates, // gate rose
    atom: colors.accent.cyan.primary, // neural reset
  },
  /** Surfaces workspace sections */
  surfaces: {
    signature: sectionAccents.atmosphere, // soft blue
    engine: colors.accent.cyan.primary, // neural reset
    response: colors.accent.green.primary, // verdant calm
    atmosphere: sectionAccents.voice, // warm gold
  },
} as const;

// ─── Workspace Nav Accents ──────────────────────────────────
// Top-level accent color for each workspace in the nav rail.

export const workspaceNavAccents = {
  /** Voice workspace — verdant green (recovery green primary) */
  voice: colors.accent.green.primary,
  /** Atoms workspace — warm gold (series 10 identity) */
  atoms: colors.ui.seriesGold,
  /** Surfaces workspace — soft blue (atmosphere) */
  surfaces: sectionAccents.atmosphere,
  /** Motion workspace — twilight purple */
  motion: colors.brand.purple.light,
  /** Delivery workspace — amber resonance (warm, shipping, content mapping) */
  delivery: colors.status.amber.bright,
  /** Player — the showcase surface (brand purple, full immersion) */
  player: colors.brand.purple.primary,
  /** Showcase — full ecosystem gallery (cyan neural reset — overview of everything) */
  showcase: colors.accent.cyan.primary,
} as const;

// ─── Atoms Workspace Layout ───────────────────────────────
// Layout constants for the Atoms Library workspace.

export const atomsLayout = {
  /** Atom catalog panel width (left — series accordion) */
  catalogPanelWidth: 240,
  /** Composition controls panel width (right) */
  controlsPanelWidth: 280,
  /** Breakpoint below which Atoms workspace goes single-column */
  mobileBreakpoint: 900,
  /** Placeholder blueprint ring — base diameter before breath */
  blueprintRingBase: 80,
  /** Placeholder blueprint ring — breath expansion range */
  blueprintRingBreathRange: 20,
  /** Placeholder blueprint dot — base size before breath */
  blueprintDotBase: 6,
  /** Placeholder blueprint dot — breath expansion range */
  blueprintDotBreathRange: 4,
  /** Placeholder blueprint glow — base blur radius */
  blueprintGlowBase: 12,
  /** Placeholder blueprint glow — breath expansion range */
  blueprintGlowBreathRange: 8,
} as const;

// ─── Symphony Layout ────────────────────────────────────────
// Layout constants for the Symphony workspace (NaviCue orchestrator).

export const symphonyLayout = {
  /** Score panel width (left — the flowing movement river) */
  scorePanelWidth: 260,
  /** Mechanics panel width (right — the living system view) */
  mechanicsPanelWidth: 320,
  /** Breakpoint below which Symphony goes single-column */
  mobileBreakpoint: 900,
  /** Brand glow for Symphony logo mark */
  logoGradient: `linear-gradient(135deg, ${withAlpha(colors.accent.cyan.primary, 0.25)} 0%, ${withAlpha(colors.brand.purple.primary, 0.2)} 50%, ${withAlpha(colors.signature.warmProvocation, 0.15)} 100%)`,
} as const;

// ─── Symphony Visual Tokens ─────────────────────────────────
// Visual tokens specific to the Symphony runtime experience.
// These extend the core tokens into the experiential/temporal domain.

export const symphonyVisuals = {
  /** Glass surface tokens for the coda receipt */
  coda: {
    surfaceBg: withAlpha(colors.neutral.white, 0.04),
    surfaceBorder: withAlpha(colors.neutral.white, 0.06),
    surfaceRadius: 20,
    surfaceBlur: 'blur(24px)',
    surfaceMaxWidth: 360,
  },
  /** Interlude visual tokens */
  interlude: {
    /** Background opacity during void */
    voidOpacity: 0.85,
    /** Voice text color */
    voiceColor: colors.neutral.white,
    /** Content max width (px) */
    contentMaxWidth: 320,
    /** Content padding */
    contentPadding: '0 24px',
    /** Voice entry duration (ms) */
    voiceEntryMs: 800,
  },
  /** Overture visual tokens */
  overture: {
    /** Title typography -- uses secondary (serif) font at narrative weight */
    titleFontFamily: fonts.secondary,
    /** Title font size (px) */
    titleFontSize: 24,
    /** Title letter spacing */
    titleLetterSpacing: '-0.02em',
    /** Title line height */
    titleLineHeight: 1.3,
    /** Title color */
    titleColor: colors.neutral.white,
    /** Title max width (px) */
    titleMaxWidth: 320,
    /** Title padding */
    titlePadding: '0 24px',
    /** Intention typography -- whisper */
    intentionFontFamily: fonts.primary,
    intentionOpacity: 0.2,
    intentionLetterSpacing: '0.04em',
    /** Intention font size (px) */
    intentionFontSize: 12,
    /** Intention color */
    intentionColor: colors.neutral.white,
    /** Intention margin top (px) */
    intentionMarginTop: 16,
    /** Intention entry Y-offset (px) */
    intentionEntryY: 8,
    /** Intention entry delay offset after titleDelay (ms) */
    intentionDelayOffsetMs: 800,
    /** Intention entry duration (ms) */
    intentionEntryMs: 1200,
    /** Container entry duration (ms) */
    containerEntryMs: 1200,
    /** Container entry ease */
    containerEntryEase: [0.22, 1, 0.36, 1] as readonly number[],
    /** Ambient glow size (% of container) */
    glowSizePercent: '60%',
    /** Ambient glow blur (px) */
    glowBlurPx: 40,
    /** Ambient glow initial scale */
    glowInitialScale: 0.8,
    /** Ambient glow target opacity */
    glowTargetOpacity: 0.15,
    /** Ambient glow animation duration (ms) */
    glowDurationMs: 3000,
  },
  /** Movement river tokens */
  river: {
    /** Dot size (px) for movement state indicators */
    dotSize: 6,
    /** Active movement background */
    activeBg: withAlpha(colors.neutral.white, 0.02),
    /** Active movement border */
    activeBorder: withAlpha(colors.neutral.white, 0.03),
    /** Past movement opacity */
    pastOpacity: 0.5,
    /** Future movement opacity */
    futureOpacity: 0.15,
    /** Residue text opacity */
    residueOpacity: 0.12,
  },
  /** Resonance trail visual tokens */
  trail: {
    /** Circle mark */
    circleFill: (color: string) => withAlpha(color, 0.4),
    /** Diamond mark rotation */
    diamondRotation: 45,
    /** Ring stroke width */
    ringStrokeWidth: 1.5,
    /** Scatter dot count */
    scatterDotCount: 5,
  },
  /** Breathline visual tokens */
  breathline: {
    /** Gradient template (interpolated with palette colors) */
    gradient: (color: string) =>
      `linear-gradient(90deg, transparent, ${withAlpha(color, 0.5)}, transparent)`,
  },
  /** Adaptation indicator tokens */
  adaptation: {
    green: { label: 'full spectacle', accent: colors.accent.green.primary },
    amber: { label: 'simplified', accent: colors.status.amber.bright },
    red: { label: 'safety mode', accent: colors.status.red.mid },
  },
} as const;

// ─── Color Harmony Matrix ───────────────────────────────────
// The marriage system: given a hero (background/primary) color,
// derive the harmonized companion colors for every other layer.
//
// ARCHITECTURE:
//   Hero Color (Layer 1)  = the dominant signature / background
//   Secondary Accent      = complementary hue for UI chrome
//   Tertiary Accent       = contrast spark for gates/warnings
//   Glass Tint            = ultra-low opacity version of hero
//   Glow Color            = mid-opacity for ambient orbs
//   Text Accent           = legible accent for highlighted text
//   Border Accent         = subtle border highlight
//   Companion Signature   = the "pair" signature that completes the emotion
//
// RULE: Warm heroes get cool companions. Cool heroes get warm companions.
// RULE: High-arousal heroes get low-arousal companions. And vice versa.
// RULE: Every derivation uses withAlpha — no new hex values.

export interface ColorHarmonyFamily {
  /** The hero/primary color this family is derived from */
  hero: string;
  /** Human-readable name */
  name: string;
  /** Temperature: warm, cool, or neutral */
  temperature: 'warm' | 'cool' | 'neutral';
  /** Derived layers */
  secondary: string; // complementary accent
  tertiary: string; // contrast spark
  glassTint: string; // ultra-low bg tint
  glow: string; // ambient orb glow
  textAccent: string; // legible highlighted text
  borderAccent: string; // subtle border
  companionId: string; // paired signature ID
}

/** The canonical harmony map — keyed by signature palette ID */
export const COLOR_HARMONY: Record<string, ColorHarmonyFamily> = {
  'sacred-ordinary': {
    hero: colors.signature.sacredOrdinary,
    name: 'Sacred Ordinary',
    temperature: 'warm',
    secondary: colors.signature.warmProvocation, // warm gold companion
    tertiary: colors.accent.cyan.primary, // cool contrast spark
    glassTint: withAlpha(colors.signature.sacredOrdinary, 0.04),
    glow: withAlpha(colors.signature.sacredOrdinary, 0.15),
    textAccent: colors.signature.sacredOrdinary,
    borderAccent: withAlpha(colors.signature.sacredOrdinary, 0.12),
    companionId: 'warm-provocation',
  },
  'witness-ritual': {
    hero: colors.signature.witnessRitual,
    name: 'Witness / Ritual',
    temperature: 'cool',
    secondary: colors.accent.cyan.primary, // cool deepening
    tertiary: colors.signature.warmProvocation, // warm contrast
    glassTint: withAlpha(colors.signature.witnessRitual, 0.04),
    glow: withAlpha(colors.signature.witnessRitual, 0.15),
    textAccent: colors.signature.witnessRitual,
    borderAccent: withAlpha(colors.signature.witnessRitual, 0.12),
    companionId: 'neural-reset',
  },
  'poetic-precision': {
    hero: colors.brand.purple.light,
    name: 'Poetic Precision',
    temperature: 'cool',
    secondary: colors.ui.gateRose, // warm rose spark
    tertiary: colors.accent.cyan.primary, // clinical precision
    glassTint: withAlpha(colors.brand.purple.light, 0.04),
    glow: withAlpha(colors.brand.purple.light, 0.15),
    textAccent: colors.brand.purple.light,
    borderAccent: withAlpha(colors.brand.purple.light, 0.12),
    companionId: 'sensory-cinema',
  },
  'koan-paradox': {
    hero: colors.signature.koanParadox,
    name: 'Koan / Paradox',
    temperature: 'cool',
    secondary: colors.signature.warmProvocation, // warm provocation
    tertiary: colors.accent.green.primary, // grounding green
    glassTint: withAlpha(colors.signature.koanParadox, 0.04),
    glow: withAlpha(colors.signature.koanParadox, 0.15),
    textAccent: colors.signature.koanParadox,
    borderAccent: withAlpha(colors.signature.koanParadox, 0.12),
    companionId: 'warm-provocation',
  },
  'sensory-cinema': {
    hero: colors.accent.blue.primary,
    name: 'Sensory Cinema',
    temperature: 'cool',
    secondary: colors.signature.sacredOrdinary, // warm stone grounding
    tertiary: colors.ui.gateRose, // somatic rose
    glassTint: withAlpha(colors.accent.blue.primary, 0.04),
    glow: withAlpha(colors.accent.blue.primary, 0.15),
    textAccent: colors.accent.blue.light,
    borderAccent: withAlpha(colors.accent.blue.primary, 0.12),
    companionId: 'poetic-precision',
  },
  'quiet-authority': {
    hero: colors.accent.green.primary,
    name: 'Quiet Authority',
    temperature: 'cool',
    secondary: colors.brand.purple.light, // light purple for structure
    tertiary: colors.signature.warmProvocation, // warm challenge
    glassTint: withAlpha(colors.accent.green.primary, 0.04),
    glow: withAlpha(colors.accent.green.primary, 0.15),
    textAccent: colors.accent.green.light,
    borderAccent: withAlpha(colors.accent.green.primary, 0.12),
    companionId: 'sacred-ordinary',
  },
  'warm-provocation': {
    hero: colors.signature.warmProvocation,
    name: 'Warm Provocation',
    temperature: 'warm',
    secondary: colors.signature.sacredOrdinary, // grounding warmth
    tertiary: colors.brand.purple.primary, // cool authority
    glassTint: withAlpha(colors.signature.warmProvocation, 0.04),
    glow: withAlpha(colors.signature.warmProvocation, 0.15),
    textAccent: colors.signature.warmProvocation,
    borderAccent: withAlpha(colors.signature.warmProvocation, 0.12),
    companionId: 'koan-paradox',
  },
  'neural-reset': {
    hero: colors.accent.cyan.primary,
    name: 'Neural Reset',
    temperature: 'cool',
    secondary: colors.accent.blue.primary, // deeper blue grounding
    tertiary: colors.signature.sacredOrdinary, // warm safety
    glassTint: withAlpha(colors.accent.cyan.primary, 0.04),
    glow: withAlpha(colors.accent.cyan.primary, 0.15),
    textAccent: colors.accent.cyan.light,
    borderAccent: withAlpha(colors.accent.cyan.primary, 0.12),
    companionId: 'witness-ritual',
  },
} as const;

/** Lookup a color harmony family by signature ID */
export function getColorHarmony(signatureId: string): ColorHarmonyFamily | undefined {
  const normalizedId = normalizeSignatureId(signatureId);
  return COLOR_HARMONY[normalizedId];
}

/**
 * Derive a full color family from any arbitrary hero hex color.
 * Uses the closest signature match or falls back to generic warm/cool derivation.
 * Useful for runtime/dynamic compositions where the hero isn't a known signature.
 */
export function deriveColorFamily(heroHex: string): {
  glassTint: string;
  glow: string;
  accent: string;
  border: string;
  surface: string;
} {
  return {
    glassTint: withAlpha(heroHex, 0.04),
    glow: withAlpha(heroHex, 0.15),
    accent: withAlpha(heroHex, 0.35),
    border: withAlpha(heroHex, 0.12),
    surface: withAlpha(heroHex, 0.06),
  };
}
