/**
 * COMPOSITION PRESETS
 * ═══════════════════
 * Color stories, atmosphere presets, and background engines
 * for the Atoms Composition Workspace.
 *
 * Extracted from the old navicue-layer-system during cleanup.
 */

import { colors, withAlpha } from '@/design-tokens';
import type { BreathPatternId, ColorSignatureId, VisualEngineId } from '@/navicue-types';

// ─── Color Stories ──────────────────────────────────────────
// @deprecated — Use `ColorSignature` from navicue-types.ts and
// `COLOR_SIGNATURES` from navicue-data.ts. These are the legacy
// design-center palettes (6 entries) vs the canonical 8-palette system.

export interface ColorStory {
  id: string;
  name: string;
  primary: string;
  accent: string;
  glow: string;
  surface: string;
  secondary: string;
}

export const COLOR_STORIES: ColorStory[] = [
  {
    id: 'luminous-purple',
    name: 'Luminous Purple',
    primary: colors.brand.purple.primary,
    accent: withAlpha(colors.brand.purple.primary, 0.35),
    glow: withAlpha(colors.brand.purple.light, 0.12),
    surface: withAlpha(colors.brand.purple.primary, 0.06),
    secondary: withAlpha(colors.brand.purple.dark, 0.15),
  },
  {
    id: 'deep-cyan',
    name: 'Deep Cyan',
    primary: colors.accent.cyan.primary,
    accent: withAlpha(colors.accent.cyan.primary, 0.35),
    glow: withAlpha(colors.accent.cyan.primary, 0.12),
    surface: withAlpha(colors.accent.cyan.primary, 0.06),
    secondary: withAlpha(colors.accent.blue.primary, 0.12),
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber',
    primary: colors.signature.warmProvocation,
    accent: withAlpha(colors.signature.warmProvocation, 0.35),
    glow: withAlpha(colors.signature.warmProvocation, 0.12),
    surface: withAlpha(colors.signature.warmProvocation, 0.06),
    secondary: withAlpha(colors.signature.sacredOrdinary, 0.1),
  },
  {
    id: 'clinical-green',
    name: 'Clinical Green',
    primary: colors.accent.green.primary,
    accent: withAlpha(colors.accent.green.primary, 0.35),
    glow: withAlpha(colors.accent.green.primary, 0.12),
    surface: withAlpha(colors.accent.green.primary, 0.06),
    secondary: withAlpha(colors.accent.cyan.primary, 0.08),
  },
  {
    id: 'sacred-earth',
    name: 'Sacred Earth',
    primary: colors.signature.sacredOrdinary,
    accent: withAlpha(colors.signature.sacredOrdinary, 0.35),
    glow: withAlpha(colors.signature.sacredOrdinary, 0.12),
    surface: withAlpha(colors.signature.sacredOrdinary, 0.06),
    secondary: withAlpha(colors.signature.warmProvocation, 0.08),
  },
  {
    id: 'void-white',
    name: 'Void White',
    primary: colors.neutral.white,
    accent: withAlpha(colors.neutral.white, 0.15),
    glow: withAlpha(colors.neutral.white, 0.04),
    surface: withAlpha(colors.neutral.white, 0.02),
    secondary: withAlpha(colors.neutral.white, 0.01),
  },
];

// ─── Atmosphere Presets ─────────────────────────────────────
// Atmosphere presets are ORTHOGONAL to engines and colors.
// They control the FEEL — energy, pace, density, breath —
// without changing WHICH engine or WHICH color is active.
//
// Think of it like dynamics markings in music:
//   Color Signature = the key/tonality
//   Visual Engine   = the instrument
//   Response Profile = how the instrument responds to the player
//   Atmosphere Preset = the tempo, dynamics, expression
//     (pianissimo, allegro, legato — not changing the instrument)
//
// Selecting "Still Water" makes your Neural Web feel quieter.
// Selecting "Storm Front" makes your Ripple Rings feel intense.

export interface AtmospherePreset {
  id: string;
  name: string;
  /** One-line therapeutic rationale */
  intention: string;
  /** Clinical use case */
  clinicalUse: string;
  /** Breath pattern — the master timing (canonical type from navicue-types) */
  breathPattern: BreathPatternId;
  /** Engine params — the mood knobs (applied to ANY engine) */
  engineParams: {
    density: number;
    speed: number;
    complexity: number;
    reactivity: number;
    depth: number;
  };
}

export const ATMOSPHERE_PRESETS: AtmospherePreset[] = [
  {
    id: 'still-water',
    name: 'Still Water',
    intention: 'The quietest possible atmosphere. Almost nothing moves.',
    clinicalUse: 'Overwhelm states, high-arousal grounding, panic recovery',
    breathPattern: 'calm',
    engineParams: { density: 0.2, speed: 0.15, complexity: 0.3, reactivity: 0.15, depth: 0.7 },
  },
  {
    id: 'deep-breath',
    name: 'Deep Breath',
    intention: 'Slow, contemplative, meditative. Things drift like thoughts.',
    clinicalUse: 'Pre-sleep, meditation, existential processing, body scan',
    breathPattern: 'box',
    engineParams: { density: 0.35, speed: 0.2, complexity: 0.4, reactivity: 0.3, depth: 0.8 },
  },
  {
    id: 'gentle-current',
    name: 'Gentle Current',
    intention: 'The comfortable default. Present but not demanding.',
    clinicalUse: 'General sessions, warm-up, rapport-building, baseline',
    breathPattern: 'calm',
    engineParams: { density: 0.5, speed: 0.35, complexity: 0.5, reactivity: 0.5, depth: 0.5 },
  },
  {
    id: 'ember-glow',
    name: 'Ember Glow',
    intention: 'Warm energy. Things feel alive but unhurried.',
    clinicalUse: 'Engagement, curiosity cultivation, re-connection, activation',
    breathPattern: 'simple',
    engineParams: { density: 0.6, speed: 0.4, complexity: 0.6, reactivity: 0.65, depth: 0.5 },
  },
  {
    id: 'electric-focus',
    name: 'Electric Focus',
    intention: 'Alert and structured. Complexity serves clarity.',
    clinicalUse: 'Work sessions, ADHD support, cognitive engagement, schema work',
    breathPattern: 'box',
    engineParams: { density: 0.55, speed: 0.5, complexity: 0.75, reactivity: 0.6, depth: 0.4 },
  },
  {
    id: 'storm-front',
    name: 'Storm Front',
    intention: 'Maximum intensity. The environment is fully alive.',
    clinicalUse: 'Pattern disruption, catharsis, ego challenge, high-energy ceremony',
    breathPattern: 'energize',
    engineParams: { density: 0.85, speed: 0.7, complexity: 0.8, reactivity: 0.85, depth: 0.3 },
  },
];

// ─── Background Engines ─────────────────────────────────────
// @deprecated — Use `VisualEngineId` from navicue-types.ts. These short
// physics labels map to canonical engine IDs as follows:
//   particle → particle-field | mesh → gradient-mesh | noise → noise-fabric
//   graph → constellation | fluid → liquid-pool | void → void

export type EnginePhysics = 'particle' | 'mesh' | 'noise' | 'graph' | 'fluid' | 'void';

/** Maps legacy EnginePhysics shorthand → canonical VisualEngineId */
export const ENGINE_PHYSICS_TO_VISUAL_ENGINE: Record<EnginePhysics, VisualEngineId> = {
  particle: 'particle-field',
  mesh: 'gradient-mesh',
  noise: 'noise-fabric',
  graph: 'constellation',
  fluid: 'liquid-pool',
  void: 'void',
};

export interface BackgroundEngine {
  id: string;
  name: 'Particle Field' | 'Orbit Drift' | 'Ember Drift' | 'Neural Web' | 'Ripple Rings' | 'Synapse Pulse';
  physics: EnginePhysics;
  params: {
    density: number;
    speed: number;
    complexity: number;
    reactivity: number;
    depth: number;
  };
}

export const BACKGROUND_ENGINES: BackgroundEngine[] = [
  {
    id: 'particle-field',
    name: 'Particle Field',
    physics: 'particle',
    params: { density: 1.0, speed: 0.5, complexity: 0.5, reactivity: 0.6, depth: 0.5 },
  },
  {
    id: 'gradient-mesh',
    name: 'Orbit Drift',
    physics: 'mesh',
    params: { density: 0.6, speed: 0.3, complexity: 0.7, reactivity: 0.5, depth: 0.6 },
  },
  {
    id: 'noise-fabric',
    name: 'Ember Drift',
    physics: 'noise',
    params: { density: 0.6, speed: 0.3, complexity: 0.5, reactivity: 0.6, depth: 0.5 },
  },
  {
    id: 'constellation',
    name: 'Neural Web',
    physics: 'graph',
    params: { density: 0.7, speed: 0.5, complexity: 0.8, reactivity: 0.7, depth: 0.4 },
  },
  {
    id: 'liquid-pool',
    name: 'Ripple Rings',
    physics: 'fluid',
    params: { density: 0.6, speed: 0.4, complexity: 0.8, reactivity: 0.7, depth: 0.7 },
  },
  {
    id: 'void',
    name: 'Synapse Pulse',
    physics: 'void',
    params: { density: 0.5, speed: 0.3, complexity: 0.6, reactivity: 0.5, depth: 0.5 },
  },
];