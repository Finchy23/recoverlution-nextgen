/**
 * SURFACE ENGINE — Doctrine-Aligned
 *
 * Shared rendering core for the Canvas and Copy pages.
 * All types use the exact variable names from doctrine.ts.
 *
 * Interaction:   floating-particle-displacement | surface-refraction | viscous-drag | gyroscopic-parallax | haptic-entrainment | acoustic-flutter
 * Motion:        somatic-breath | viscous-unspooling | pendulum-settle | defocus-dissolve | cymatic-ripple | tectonic-drift
 * Atmosphere:    sanctuary | cryo-chamber | abyssal-void | bioluminescent-mesh | chiaroscuro-spotlight | twilight-shroud
 * Temperature:   band-0 .. band-4 (Safe & Social → Survival Mode)
 * Color:         neural-reset | amber-resonance | quiet-authority | sacred-ordinary | verdant-calm | void-presence | twilight-shift
 * Attenuation:   open | surface | floor | panel | fused | dark
 */

import React, { useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

export const BREATH_DURATION = 10.9; // 5.5 breaths per minute

// ═══════════════════════════════════════════════════
// EASING FUNCTIONS — named by feel in doctrine
// ═══════════════════════════════════════════════════

/** organic-arrive: Quick attack, long settle */
function easeOutCubic(t: number): number { return 1 - Math.pow(1 - t, 3); }
/** graceful-depart: Slow release, quick vanish */
function easeInCubic(t: number): number { return t * t * t; }
/** measured-confidence: Neither rushed nor hesitant */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
/** physical-weight: Overshoot then settle */
function springSettle(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}
/** geological-patience: Slow start, slow end */
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

// ═══════════════════════════════════════════════════
// PERCEPTUAL ALPHA — Runtime Visibility Guarantee
// ═══════════════════════════════════════════════════
//
// The raw multiplicative composition of independent modulators
// (element × breath × temp × attenuation × presence × life)
// produces sub-perceptual alphas via cascading fraction multiplication.
//
// pAlpha remaps the final composed value into perceptible range:
//   gain  — amplification of the raw signal
//   floor — minimum alpha once element is "alive" (raw > threshold)
//
// Design: every modulator remains independent and multiplicative
// (preserving infinite composition scope), but the RENDERED alpha is
// guaranteed to land within a band the human eye can actually resolve
// on modern high-contrast displays.
//
// The threshold at raw < 0.001 preserves clean fade-in/out at birth/death.

function pAlpha(raw: number, gain: number, floor: number): number {
  if (raw < 0.001) return 0;
  return Math.min(1, floor + raw * gain);
}

// ═══════════════════════════════════════════════════
// TRANSITION IDENTITIES — intrinsic per interaction
// ═══════════════════════════════════════════════════

export interface TransitionIdentity {
  enterMs: number;
  exitMs: number;
  enterCurve: (t: number) => number;
  exitCurve: (t: number) => number;
}

export const transitionIdentities: Record<InteractionType, TransitionIdentity> = {
  /** Particles scatter from center on enter, exhale outward on exit */
  'floating-particle-displacement': {
    enterMs: 800, exitMs: 600,
    enterCurve: easeOutCubic, exitCurve: easeInCubic,
  },
  /** Distortion field appears measured. Settles back to flat with a ring */
  'surface-refraction': {
    enterMs: 900, exitMs: 700,
    enterCurve: easeInOutCubic, exitCurve: easeOutCubic,
  },
  /** Resistance engages immediately. Releases smoothly */
  'viscous-drag': {
    enterMs: 1100, exitMs: 800,
    enterCurve: easeOutCubic, exitCurve: easeInCubic,
  },
  /** Depth separation establishes quickly. Planes collapse on exit */
  'gyroscopic-parallax': {
    enterMs: 1000, exitMs: 700,
    enterCurve: springSettle, exitCurve: easeInCubic,
  },
  /** First pulse arrives gently. Rhythm fades rather than stops */
  'haptic-entrainment': {
    enterMs: 700, exitMs: 1400,
    enterCurve: easeOutCubic, exitCurve: easeInOutSine,
  },
  /** Responds immediately to voice. Settles slowly when voice stops */
  'acoustic-flutter': {
    enterMs: 400, exitMs: 600,
    enterCurve: easeOutCubic, exitCurve: easeInCubic,
  },
};

// ═══════════════════════════════════════════════════
// LAYER DEFINITIONS — exact doctrine variable names
// ═══════════════════════════════════════════════════

export type InteractionType =
  | 'floating-particle-displacement'
  | 'surface-refraction'
  | 'viscous-drag'
  | 'gyroscopic-parallax'
  | 'haptic-entrainment'
  | 'acoustic-flutter';

export type MotionType =
  | 'somatic-breath'
  | 'viscous-unspooling'
  | 'pendulum-settle'
  | 'defocus-dissolve'
  | 'cymatic-ripple'
  | 'tectonic-drift';

export type ColorType =
  | 'neural-reset'
  | 'amber-resonance'
  | 'quiet-authority'
  | 'sacred-ordinary'
  | 'verdant-calm'
  | 'void-presence'
  | 'twilight-shift';

export type Device = 'phone' | 'desktop';

export const interactionList: { id: InteractionType; label: string }[] = [
  { id: 'floating-particle-displacement', label: 'Floating Particle' },
  { id: 'surface-refraction',             label: 'Surface Refraction' },
  { id: 'viscous-drag',                   label: 'Viscous Drag' },
  { id: 'gyroscopic-parallax',            label: 'Gyroscopic Parallax' },
  { id: 'haptic-entrainment',             label: 'Haptic Entrainment' },
  { id: 'acoustic-flutter',               label: 'Acoustic Flutter' },
];

export const motionList: { id: MotionType; label: string }[] = [
  { id: 'somatic-breath',      label: 'Somatic Breath' },
  { id: 'viscous-unspooling',  label: 'Viscous Unspooling' },
  { id: 'pendulum-settle',     label: 'Pendulum Settle' },
  { id: 'defocus-dissolve',    label: 'Defocus Dissolve' },
  { id: 'cymatic-ripple',      label: 'Cymatic Ripple' },
  { id: 'tectonic-drift',      label: 'Tectonic Drift' },
];

// ═══════════════════════════════════════════════════
// ATMOSPHERE — The Light & Depth
// Colors sourced from doctrine document
// ═══════════════════════════════════════════════════

export interface Atmosphere {
  id: string; label: string;
  deep: string; mid: string; accent: string;
  rgbFar: [number, number, number];
  rgbMid: [number, number, number];
  rgbNear: [number, number, number];
  fieldPosA: string; fieldPosB: string;
}

export const atmosphereList: Atmosphere[] = [
  {
    id: 'sanctuary', label: 'Sanctuary',
    deep: '#4A2810', mid: '#E8A64C', accent: '#FFD699',
    rgbFar: [74, 40, 16], rgbMid: [232, 166, 76], rgbNear: [255, 214, 153],
    fieldPosA: '30% 60%', fieldPosB: '75% 30%',
  },
  {
    id: 'cryo-chamber', label: 'Cryo-Chamber',
    deep: '#0A2030', mid: '#00CCE0', accent: '#40E0D0',
    rgbFar: [10, 32, 48], rgbMid: [0, 204, 224], rgbNear: [64, 224, 208],
    fieldPosA: '45% 40%', fieldPosB: '60% 65%',
  },
  {
    id: 'abyssal-void', label: 'Abyssal Void',
    deep: '#050408', mid: '#0F0D1A', accent: '#1A1826',
    rgbFar: [5, 4, 8], rgbMid: [15, 13, 26], rgbNear: [26, 24, 38],
    fieldPosA: '50% 50%', fieldPosB: '50% 50%',
  },
  {
    id: 'bioluminescent-mesh', label: 'Bioluminescent Mesh',
    deep: '#2A1F7A', mid: '#6B52FF', accent: '#A89BFF',
    rgbFar: [42, 31, 122], rgbMid: [107, 82, 255], rgbNear: [168, 155, 255],
    fieldPosA: '40% 35%', fieldPosB: '65% 70%',
  },
  {
    id: 'chiaroscuro-spotlight', label: 'Chiaroscuro',
    deep: '#0A0812', mid: '#D4C5B8', accent: '#F5E6D3',
    rgbFar: [10, 8, 18], rgbMid: [212, 197, 184], rgbNear: [245, 230, 211],
    fieldPosA: '50% 48%', fieldPosB: '50% 52%',
  },
  {
    id: 'twilight-shroud', label: 'Twilight Shroud',
    deep: '#1A1040', mid: '#A89BFF', accent: '#FFB677',
    rgbFar: [26, 16, 64], rgbMid: [168, 155, 255], rgbNear: [255, 182, 119],
    fieldPosA: '35% 55%', fieldPosB: '70% 35%',
  },
];

// ═══════════════════════════════════════════════════
// TEMPERATURE — Autonomic Heat Bands (0–4)
// ═══════════════════════════════════════════════════

export const temperatureList = [
  { id: 'band-0', label: 'Band 0: Safe & Social',           multiplier: 0.3 },
  { id: 'band-1', label: 'Band 1: Alert & Regulated',       multiplier: 0.7 },
  { id: 'band-2', label: 'Band 2: Early Dysregulation',     multiplier: 1.0 },
  { id: 'band-3', label: 'Band 3: Sympathetic Activation',  multiplier: 1.5 },
  { id: 'band-4', label: 'Band 4: Survival Mode',           multiplier: 2.2 },
];

// ═══════════════════════════════════════════════════
// COLOR — Chromatic Signatures (psychological frequency)
// Each shifts the atmosphere palette toward its hue
// ═══════════════════════════════════════════════════

export const colorList: { id: ColorType; label: string }[] = [
  { id: 'neural-reset',     label: 'Neural Reset' },
  { id: 'amber-resonance',  label: 'Amber Resonance' },
  { id: 'quiet-authority',  label: 'Quiet Authority' },
  { id: 'sacred-ordinary',  label: 'Sacred Ordinary' },
  { id: 'verdant-calm',     label: 'Verdant Calm' },
  { id: 'void-presence',    label: 'Void Presence' },
  { id: 'twilight-shift',   label: 'Twilight Shift' },
];

// ═══════════════════════════════════════════════════
// DYNAMIC ATTENUATION — The Law of Attentional Physics
// ═══════════════════════════════════════════════════

export type AttenuationMode = 'open' | 'surface' | 'floor' | 'panel' | 'fused' | 'dark';

export interface AttenuationLevel {
  id: AttenuationMode;
  label: string;
  description: string;
  blur: number;
  overlayOpacity: number;
  motionYield: number;
  intensityScale: number;
  bgEnergy: number;
}

export interface AttenuationTransition {
  durationMs: number;
  curve: (t: number) => number;
}

export const attenuationLevels: AttenuationLevel[] = [
  { id: 'open',    label: 'Open',    description: 'Home / Stream �� the canvas breathes fully',
    blur: 0, overlayOpacity: 0, motionYield: 0, intensityScale: 1, bgEnergy: 0.9 },
  { id: 'surface', label: 'Surface', description: 'Light content overlay — canvas softens',
    blur: 4, overlayOpacity: 0.15, motionYield: 0.25, intensityScale: 0.7, bgEnergy: 0.55 },
  { id: 'floor',   label: 'Floor',   description: 'Hero payload — canvas recedes behind the glass',
    blur: 8, overlayOpacity: 0.35, motionYield: 0.5, intensityScale: 0.35, bgEnergy: 0.3 },
  { id: 'panel',   label: 'Panel',   description: 'Read state — canvas becomes a static painting',
    blur: 24, overlayOpacity: 0.7, motionYield: 1.0, intensityScale: 0.05, bgEnergy: 0.1 },
  { id: 'fused',   label: 'Fused',   description: 'Action state — canvas links to foreground physics',
    blur: 0, overlayOpacity: 0.08, motionYield: 0.4, intensityScale: 0.5, bgEnergy: 0.5 },
  { id: 'dark',    label: 'Dark',    description: 'Talk state — canvas holds space, empathic glow only',
    blur: 0, overlayOpacity: 0.55, motionYield: 0.8, intensityScale: 0.15, bgEnergy: 0.2 },
];

export const attenuationTransitions: Record<AttenuationMode, AttenuationTransition> = {
  open:    { durationMs: 1200, curve: easeOutCubic },
  surface: { durationMs: 800,  curve: easeInOutCubic },
  floor:   { durationMs: 600,  curve: easeInOutCubic },
  panel:   { durationMs: 1000, curve: easeInOutSine },
  fused:   { durationMs: 400,  curve: easeOutCubic },
  dark:    { durationMs: 900,  curve: easeInOutSine },
};

// ═══════════════════════════════════════════════════
// COLOR TREATMENT — Chromatic Signature Application
//
// Each color signature tints the atmosphere palette
// toward its psychological frequency.
// ═══════════════════════════════════════════════════

// Target hue RGB for each chromatic signature
const colorTargets: Record<ColorType, [number, number, number]> = {
  'neural-reset':    [0, 204, 224],     // #00CCE0 — cyan clinical
  'amber-resonance': [232, 166, 76],    // #E8A64C — golden hold
  'quiet-authority': [107, 82, 255],    // #6B52FF — deep purple
  'sacred-ordinary': [212, 197, 184],   // #D4C5B8 — bone parchment
  'verdant-calm':    [37, 212, 148],    // #25D494 — embodying green
  'void-presence':   [15, 13, 26],      // near-black void
  'twilight-shift':  [168, 155, 255],   // #A89BFF — liminal purple
};

export function applyColorTreatment(
  atmo: Atmosphere, color: ColorType, t: number,
): { rgbFar: [number,number,number]; rgbMid: [number,number,number]; rgbNear: [number,number,number] } {
  const { rgbFar, rgbMid, rgbNear } = atmo;

  switch (color) {
    // Neural Reset: cool desaturation toward cyan
    case 'neural-reset': {
      const tgt = colorTargets['neural-reset'];
      return {
        rgbFar: tintToward(rgbFar, tgt, 0.35),
        rgbMid: tintToward(rgbMid, tgt, 0.25),
        rgbNear: tintToward(rgbNear, tgt, 0.15),
      };
    }
    // Amber Resonance: warm golden tint
    case 'amber-resonance': {
      const tgt = colorTargets['amber-resonance'];
      return {
        rgbFar: tintToward(rgbFar, tgt, 0.3),
        rgbMid: tintToward(rgbMid, tgt, 0.2),
        rgbNear: tintToward(rgbNear, tgt, 0.12),
      };
    }
    // Quiet Authority: deep purple depth
    case 'quiet-authority': {
      const tgt = colorTargets['quiet-authority'];
      return {
        rgbFar: tintToward(saturateRgb(rgbFar, 1.3), tgt, 0.3),
        rgbMid: tintToward(saturateRgb(rgbMid, 1.2), tgt, 0.2),
        rgbNear: tintToward(rgbNear, tgt, 0.1),
      };
    }
    // Sacred Ordinary: warm desaturation toward bone
    case 'sacred-ordinary': {
      const tgt = colorTargets['sacred-ordinary'];
      return {
        rgbFar: tintToward(desaturate(rgbFar, 0.5), tgt, 0.2),
        rgbMid: tintToward(desaturate(rgbMid, 0.4), tgt, 0.15),
        rgbNear: tintToward(desaturate(rgbNear, 0.3), tgt, 0.1),
      };
    }
    // Verdant Calm: parasympathetic green tint
    case 'verdant-calm': {
      const tgt = colorTargets['verdant-calm'];
      return {
        rgbFar: tintToward(rgbFar, tgt, 0.25),
        rgbMid: tintToward(rgbMid, tgt, 0.18),
        rgbNear: tintToward(rgbNear, tgt, 0.1),
      };
    }
    // Void Presence: extreme darken, faint violet undertone
    case 'void-presence': {
      const tgt = colorTargets['void-presence'];
      return {
        rgbFar: tintToward(darken(rgbFar, 0.7), tgt, 0.4),
        rgbMid: tintToward(darken(rgbMid, 0.6), tgt, 0.3),
        rgbNear: tintToward(darken(rgbNear, 0.5), tgt, 0.2),
      };
    }
    // Twilight Shift: slow hue rotation through purples/blues
    case 'twilight-shift': {
      const angle = (t * 0.3) % 360;
      return {
        rgbFar: hueShift(rgbFar, angle),
        rgbMid: hueShift(rgbMid, angle * 0.8),
        rgbNear: hueShift(rgbNear, angle * 0.6),
      };
    }
  }
}

function tintToward(rgb: [number,number,number], target: [number,number,number], amt: number): [number,number,number] {
  return [
    Math.round(rgb[0] + (target[0] - rgb[0]) * amt),
    Math.round(rgb[1] + (target[1] - rgb[1]) * amt),
    Math.round(rgb[2] + (target[2] - rgb[2]) * amt),
  ];
}

function darken(rgb: [number,number,number], amt: number): [number,number,number] {
  return [Math.round(rgb[0] * (1 - amt)), Math.round(rgb[1] * (1 - amt)), Math.round(rgb[2] * (1 - amt))];
}

function desaturate(rgb: [number,number,number], amt: number): [number,number,number] {
  const l = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
  return [Math.round(rgb[0] + (l - rgb[0]) * amt), Math.round(rgb[1] + (l - rgb[1]) * amt), Math.round(rgb[2] + (l - rgb[2]) * amt)];
}

function saturateRgb(rgb: [number,number,number], factor: number): [number,number,number] {
  const l = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;
  return [
    Math.round(Math.min(255, Math.max(0, l + (rgb[0] - l) * factor))),
    Math.round(Math.min(255, Math.max(0, l + (rgb[1] - l) * factor))),
    Math.round(Math.min(255, Math.max(0, l + (rgb[2] - l) * factor))),
  ];
}

function hueShift(rgb: [number,number,number], degrees: number): [number,number,number] {
  const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return rgb;
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = 0;
  if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (mx === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  h = ((h + degrees / 360) % 1 + 1) % 1;
  const h2r = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    return t < 1/6 ? p + (q-p)*6*t : t < 1/2 ? q : t < 2/3 ? p + (q-p)*(2/3-t)*6 : p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [Math.round(h2r(p,q,h+1/3)*255), Math.round(h2r(p,q,h)*255), Math.round(h2r(p,q,h-1/3)*255)];
}

// ═══════════════════════════════════════════════════
// COLOUR / DRAWING HELPERS
// ═══════════════════════════════════════════════════

export function rgba(rgb: [number, number, number], a: number): string {
  return `rgba(${rgb[0]|0},${rgb[1]|0},${rgb[2]|0},${Math.max(0, Math.min(1, a)).toFixed(4)})`;
}

export function hotRgb(rgb: [number, number, number], heat: number): [number, number, number] {
  const h = Math.min(1, Math.max(0, heat));
  return [
    rgb[0] + (255 - rgb[0]) * h * 0.2,
    rgb[1] + (255 - rgb[1]) * h * 0.2,
    rgb[2] + (255 - rgb[2]) * h * 0.2,
  ];
}

export function lerpRgb(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// ═══════════════════════════════════════════════════
// POST-PROCESSING — film grain
// ═══════════════════════════════════════════════════

let grainCanvas: HTMLCanvasElement | null = null;
const GRAIN_SIZE = 128;

function getGrainCanvas(): HTMLCanvasElement {
  if (grainCanvas) return grainCanvas;
  grainCanvas = document.createElement('canvas');
  grainCanvas.width = GRAIN_SIZE;
  grainCanvas.height = GRAIN_SIZE;
  const gctx = grainCanvas.getContext('2d')!;
  const img = gctx.createImageData(GRAIN_SIZE, GRAIN_SIZE);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  gctx.putImageData(img, 0, 0);
  return grainCanvas;
}

function applyPostProcessing(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const grain = getGrainCanvas();
  ctx.save();
  ctx.globalAlpha = 0.012;
  ctx.globalCompositeOperation = 'source-atop';
  const ox = (t * 7.3) % GRAIN_SIZE;
  const oy = (t * 11.1) % GRAIN_SIZE;
  for (let x = -GRAIN_SIZE; x < w + GRAIN_SIZE; x += GRAIN_SIZE) {
    for (let y = -GRAIN_SIZE; y < h + GRAIN_SIZE; y += GRAIN_SIZE) {
      ctx.drawImage(grain, x + ox, y + oy);
    }
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════
// STATE TYPES
// ═══════════════════════════════════════════════════

interface ParticleState {
  particles: {
    x: number; y: number; vx: number; vy: number;
    size: number; opacity: number; life: number; maxLife: number;
    plane: number; homeRadius: number; attractorIdx: number;
  }[];
  attractors: { x: number; y: number; theta: number; speed: number }[];
}

interface RippleState {
  rings: { cx: number; cy: number; radius: number; maxRadius: number; opacity: number; thickness: number }[];
  sources: { x: number; y: number; interval: number; timer: number }[];
}

interface ThreadState {
  threads: {
    points: { x: number; y: number; vx: number; vy: number; homeX: number; homeY: number }[];
    opacity: number; life: number; maxLife: number; plane: number;
  }[];
}

interface MembraneState {
  cols: number; rows: number;
  points: { x: number; y: number; restX: number; restY: number; vx: number; vy: number }[];
}

interface PulseState {
  foci: { x: number; y: number; phase: number; speed: number }[];
  ringCount: number;
}

interface FlutterState {
  nodes: {
    x: number; y: number; restX: number; restY: number;
    vx: number; vy: number; phase: number; freq: number;
    size: number; opacity: number;
  }[];
}

// ═══════════════════════════════════════════════════
// STATE INITIALISATION
// ═══════════════════════════════════════════════════

function initState(inter: InteractionType, motion: MotionType, w: number, h: number, tempMul: number): any {
  switch (inter) {
    case 'floating-particle-displacement': return initParticles(motion, w, h, tempMul);
    case 'surface-refraction':             return initRipple(motion, w, h);
    case 'viscous-drag':                   return initThreads(motion, w, h, tempMul);
    case 'gyroscopic-parallax':            return initMembrane(w, h);
    case 'haptic-entrainment':             return initPulse(motion, w, h);
    case 'acoustic-flutter':               return initFlutter(w, h, tempMul);
  }
}

function initParticles(motion: MotionType, w: number, h: number, tempMul: number): ParticleState {
  const countMul = motion === 'tectonic-drift' ? 0.3 : motion === 'cymatic-ripple' ? 2.0 : motion === 'pendulum-settle' ? 1.2 : 0.9;
  const sizeMul = motion === 'tectonic-drift' ? 2.2 : motion === 'cymatic-ripple' ? 0.5 : 1.0;
  const lifeMul = motion === 'tectonic-drift' ? 2.5 : motion === 'cymatic-ripple' ? 0.6 : 1.2;
  const planeCfg = [
    { count: 15, sizeRange: [3, 7],     opRange: [0.03, 0.08] },
    { count: 30, sizeRange: [1.5, 3.5], opRange: [0.05, 0.14] },
    { count: 25, sizeRange: [0.6, 2],   opRange: [0.10, 0.25] },
  ];
  const particles: ParticleState['particles'] = [];
  const cx = w / 2; const cy = h / 2;
  for (let plane = 0; plane < 3; plane++) {
    const cfg = planeCfg[plane];
    const count = Math.round(cfg.count * countMul * Math.max(tempMul, 0.5));
    for (let i = 0; i < count; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const size = (cfg.sizeRange[0] + Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0])) * sizeMul;
      const a = Math.random() * Math.PI * 2;
      const spd = (0.1 + Math.random() * 0.4) * [0.3, 0.7, 1.2][plane];
      particles.push({
        x: px, y: py, vx: Math.cos(a) * spd * 0.3, vy: Math.sin(a) * spd * 0.3,
        size, opacity: cfg.opRange[0] + Math.random() * (cfg.opRange[1] - cfg.opRange[0]),
        life: Math.random() * 600, maxLife: (400 + Math.random() * 500) * lifeMul,
        plane, homeRadius: Math.sqrt((px - cx) ** 2 + (py - cy) ** 2),
        attractorIdx: Math.floor(Math.random() * 3),
      });
    }
  }
  const attractors = [
    { x: w * 0.3, y: h * 0.3, theta: 0, speed: 0.008 + Math.random() * 0.006 },
    { x: w * 0.7, y: h * 0.6, theta: Math.PI * 0.7, speed: 0.006 + Math.random() * 0.008 },
    { x: w * 0.5, y: h * 0.8, theta: Math.PI * 1.4, speed: 0.007 + Math.random() * 0.005 },
  ];
  return { particles, attractors };
}

function initRipple(motion: MotionType, w: number, h: number): RippleState {
  const n = motion === 'tectonic-drift' ? 1 : motion === 'cymatic-ripple' ? 6 : motion === 'pendulum-settle' ? 4 : 2;
  const sources: RippleState['sources'] = [];
  for (let i = 0; i < n; i++) {
    sources.push({
      x: w * (0.2 + Math.random() * 0.6), y: h * (0.2 + Math.random() * 0.6),
      interval: motion === 'cymatic-ripple' ? 15 + Math.random() * 20 : motion === 'tectonic-drift' ? 120 + Math.random() * 80 : 40 + Math.random() * 40,
      timer: Math.random() * 60,
    });
  }
  return { rings: [], sources };
}

function initThreads(motion: MotionType, w: number, h: number, tempMul: number): ThreadState {
  const n = Math.round((motion === 'cymatic-ripple' ? 20 : motion === 'tectonic-drift' ? 5 : 12) * Math.max(tempMul, 0.5));
  const threads: ThreadState['threads'] = [];
  for (let i = 0; i < n; i++) {
    // More points for smoother curves, gentler offsets for organic flow
    const pc = 8 + Math.floor(Math.random() * 10);
    const points: ThreadState['threads'][0]['points'] = [];
    let px = Math.random() * w, py = Math.random() * h;
    // Pick a gentle flow direction for this filament
    const angle = Math.random() * Math.PI * 2;
    const segLen = 18 + Math.random() * 22; // shorter segments = smoother
    for (let j = 0; j < pc; j++) {
      points.push({ x: px, y: py, vx: 0, vy: 0, homeX: px, homeY: py });
      // Flow along the direction with gentle lateral drift
      const drift = (Math.random() - 0.5) * 0.6; // subtle perpendicular wander
      px += Math.cos(angle + drift) * segLen;
      py += Math.sin(angle + drift) * segLen;
    }
    threads.push({
      points, opacity: 0.08 + Math.random() * 0.2,
      life: Math.random() * 400, maxLife: 600 + Math.random() * 800,
      plane: Math.floor(Math.random() * 3),
    });
  }
  return { threads };
}

function initMembrane(w: number, h: number): MembraneState {
  const spacing = 22;
  const cols = Math.ceil(w / spacing) + 2;
  const rows = Math.ceil(h / spacing) + 2;
  const points: MembraneState['points'] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * spacing - spacing;
      const y = r * spacing - spacing;
      points.push({ x, y, restX: x, restY: y, vx: 0, vy: 0 });
    }
  }
  return { cols, rows, points };
}

function initPulse(motion: MotionType, w: number, h: number): PulseState {
  const n = motion === 'tectonic-drift' ? 1 : motion === 'cymatic-ripple' ? 5 : motion === 'pendulum-settle' ? 3 : 2;
  const foci: PulseState['foci'] = [];
  for (let i = 0; i < n; i++) {
    foci.push({
      x: w * (0.25 + Math.random() * 0.5), y: h * (0.25 + Math.random() * 0.5),
      phase: Math.random() * Math.PI * 2,
      speed: motion === 'cymatic-ripple' ? 0.08 + Math.random() * 0.04 : 0.02 + Math.random() * 0.015,
    });
  }
  return { foci, ringCount: motion === 'tectonic-drift' ? 3 : motion === 'cymatic-ripple' ? 8 : 5 };
}

function initFlutter(w: number, h: number, tempMul: number): FlutterState {
  const count = Math.round(40 * Math.max(tempMul, 0.5));
  const nodes: FlutterState['nodes'] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    nodes.push({
      x, y, restX: x, restY: y,
      vx: 0, vy: 0,
      phase: Math.random() * Math.PI * 2,
      freq: 0.02 + Math.random() * 0.06,
      size: 1 + Math.random() * 3,
      opacity: 0.05 + Math.random() * 0.15,
    });
  }
  return { nodes };
}

// ═══════════════════════════════════════════════════
// FRAME DISPATCH
// ═══════════════════════════════════════════════════

function renderFrame(
  ctx: CanvasRenderingContext2D, inter: InteractionType, motion: MotionType,
  atmo: Atmosphere, colorType: ColorType, tempMul: number, breath: number, t: number,
  w: number, h: number, stateRef: React.MutableRefObject<any>,
  presence: number = 1,
  skipPostProcess: boolean = false,
) {
  const treated = applyColorTreatment(atmo, colorType, t);
  const coloredAtmo: Atmosphere = { ...atmo, ...treated };
  ctx.globalCompositeOperation = 'screen';

  switch (inter) {
    case 'floating-particle-displacement': renderParticles(ctx, motion, coloredAtmo, tempMul, breath, t, w, h, stateRef, presence); break;
    case 'surface-refraction':             renderRipple(ctx, motion, coloredAtmo, tempMul, breath, t, w, h, stateRef, presence); break;
    case 'viscous-drag':                   renderThreads(ctx, motion, coloredAtmo, tempMul, breath, t, w, h, stateRef, presence); break;
    case 'gyroscopic-parallax':            renderMembrane(ctx, motion, coloredAtmo, tempMul, breath, t, w, h, stateRef, presence); break;
    case 'haptic-entrainment':             renderPulse(ctx, motion, coloredAtmo, tempMul, breath, t, w, h, stateRef, presence); break;
    case 'acoustic-flutter':               renderFlutter(ctx, motion, coloredAtmo, tempMul, breath, t, w, h, stateRef, presence); break;
  }

  ctx.globalCompositeOperation = 'source-over';
  if (!skipPostProcess) applyPostProcessing(ctx, w, h, t);
}

// ═══════════════════════════════════════════════════
// MOTION HELPERS — resolve motion type to behavior
// ═══════════════════════════════════════════════════
// Maps doctrine motion names to their behavioral role in physics:
//   tectonic-drift    = near-stillness
//   somatic-breath    = 5.5bpm expand/contract
//   viscous-unspooling = continuous directional flow
//   pendulum-settle   = seeking attractors with spring overshoot
//   cymatic-ripple    = radiating concentric energy
//   defocus-dissolve  = depth-plane shifting (blur simulation)

// ═══════════════════════════════════════════════════
// 1. FLOATING PARTICLE DISPLACEMENT
// ═══════════════════════════════════════════════════

const PLANE_HALO = [8, 5, 3];
const PLANE_SPEED = [0.3, 0.7, 1.2];

function renderParticles(
  ctx: CanvasRenderingContext2D, motion: MotionType, atmo: Atmosphere,
  tempMul: number, breath: number, t: number, w: number, h: number,
  stateRef: React.MutableRefObject<any>, presence: number = 1,
) {
  const state = stateRef.current as ParticleState;
  if (!state || presence < 0.001) return;
  const cx = w / 2; const cy = h / 2;

  if (motion === 'pendulum-settle') {
    for (const a of state.attractors) {
      a.theta += a.speed;
      a.x = w * 0.5 + Math.cos(a.theta) * w * 0.28 + Math.sin(a.theta * 0.7) * w * 0.1;
      a.y = h * 0.5 + Math.sin(a.theta * 0.8) * h * 0.25 + Math.cos(a.theta * 1.3) * h * 0.08;
    }
  }

  for (const p of state.particles) {
    p.life++;
    const lp = p.life / p.maxLife;
    let alpha = lp < 0.1 ? lp / 0.1 * lp / 0.1 : lp > 0.85 ? ((1 - lp) / 0.15) ** 2 : 1;
    alpha *= p.opacity * (0.5 + breath * 0.5) * tempMul * Math.sqrt(presence);

    const spd = PLANE_SPEED[p.plane];
    switch (motion) {
      case 'tectonic-drift':
        p.vx += (Math.random() - 0.5) * 0.003; p.vy += (Math.random() - 0.5) * 0.003;
        p.vx *= 0.92; p.vy *= 0.92; break;
      case 'somatic-breath': {
        const dx = p.x - cx; const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const target = p.homeRadius * (0.55 + breath * 0.9);
        const force = (target - dist) * 0.006;
        p.vx += (dx / dist) * force + (-dy / dist) * 0.015 * spd;
        p.vy += (dy / dist) * force + (dx / dist) * 0.015 * spd;
        p.vx *= 0.965; p.vy *= 0.965; break;
      }
      case 'viscous-unspooling': {
        const wind = Math.sin(t * 0.0003) * 0.3 - 0.2;
        p.vx += Math.cos(wind) * 0.05 * spd; p.vy += Math.sin(wind) * 0.015 * spd;
        p.vy += Math.sin(p.x * 0.008 + t * 0.0008) * 0.008;
        p.vx *= 0.987; p.vy *= 0.975;
        if (p.x > w + 30) { p.x = -20; p.y = Math.random() * h; } break;
      }
      case 'pendulum-settle': {
        const tgt = state.attractors[p.attractorIdx];
        if (tgt) {
          const dx = tgt.x - p.x; const dy = tgt.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const pull = Math.min(dist * 0.00012, 0.06);
          p.vx += (dx / dist) * pull * 10; p.vy += (dy / dist) * pull * 10;
          if (dist < 35) { p.vx -= (dx / dist) * 0.025; p.vy -= (dy / dist) * 0.025; }
        }
        p.vx += (Math.random() - 0.5) * 0.03; p.vy += (Math.random() - 0.5) * 0.03;
        p.vx *= 0.975; p.vy *= 0.975; break;
      }
      case 'defocus-dissolve': {
        // Slow drift + oscillating opacity per plane (rack-focus sim)
        p.vx += (Math.random() - 0.5) * 0.005; p.vy += (Math.random() - 0.5) * 0.005;
        p.vx *= 0.95; p.vy *= 0.95;
        const focusPlane = Math.floor((Math.sin(t * 0.002) + 1) * 1.5);
        const planeDist = Math.abs(p.plane - focusPlane);
        alpha *= planeDist === 0 ? 1.0 : planeDist === 1 ? 0.3 : 0.08;
        break;
      }
      case 'cymatic-ripple':
        p.vx += (Math.random() - 0.5) * 0.35; p.vy += (Math.random() - 0.5) * 0.35;
        if (Math.random() < 0.004) { const a = Math.random() * Math.PI * 2; p.vx += Math.cos(a) * 2; p.vy += Math.sin(a) * 2; }
        p.vy -= 0.008; p.vx *= 0.994; p.vy *= 0.994; break;
    }
    p.x += p.vx; p.y += p.vy;

    if (motion !== 'viscous-unspooling') { if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20; }
    if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;

    if (p.life >= p.maxLife) {
      p.x = Math.random() * w; p.y = Math.random() * h;
      p.life = 0; p.maxLife = 400 + Math.random() * 500;
      p.homeRadius = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
      continue;
    }
    if (alpha < 0.002) continue;

    const px = cx + (p.x - cx) * presence;
    const py = cy + (p.y - cy) * presence;
    const baseRgb = p.plane === 0 ? atmo.rgbFar : p.plane === 1 ? atmo.rgbMid : atmo.rgbNear;
    const bSize = p.size * (1 + breath * (motion === 'somatic-breath' ? 0.35 : 0.1)) * (0.3 + presence * 0.7);
    const haloR = bSize * PLANE_HALO[p.plane];

    const hA = pAlpha(alpha, 3, 0.01);
    if (hA > 0.002) {
      const g = ctx.createRadialGradient(px, py, 0, px, py, haloR);
      g.addColorStop(0, rgba(baseRgb, hA));
      g.addColorStop(0.15, rgba(baseRgb, hA * 0.5));
      g.addColorStop(0.4, rgba(baseRgb, hA * 0.12));
      g.addColorStop(1, rgba(baseRgb, 0));
      ctx.beginPath(); ctx.arc(px, py, haloR, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }

    const glowR = bSize * 2.5;
    const gA = pAlpha(alpha, 4, 0.025);
    if (gA > 0.003) {
      const g2 = ctx.createRadialGradient(px, py, 0, px, py, glowR);
      g2.addColorStop(0, rgba(baseRgb, gA));
      g2.addColorStop(0.3, rgba(baseRgb, gA * 0.4));
      g2.addColorStop(1, rgba(baseRgb, 0));
      ctx.beginPath(); ctx.arc(px, py, glowR, 0, Math.PI * 2);
      ctx.fillStyle = g2; ctx.fill();
    }

    const coreAlpha = pAlpha(alpha, 2.5, 0.06);
    const coreRgb = hotRgb(baseRgb, coreAlpha * 0.8);
    ctx.beginPath(); ctx.arc(px, py, bSize * 0.8, 0, Math.PI * 2);
    ctx.fillStyle = rgba(coreRgb, coreAlpha);
    ctx.fill();

    if (p.plane === 2 && alpha > 0.05) {
      ctx.beginPath(); ctx.arc(px, py, bSize * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(hotRgb(baseRgb, 0.6), pAlpha(alpha, 2, 0.04));
      ctx.fill();
    }
  }
}

// ═══════════════════════════════════════════════════
// 2. SURFACE REFRACTION (concentric ring distortion)
// ═══════════════════════════════════════════════════

function renderRipple(
  ctx: CanvasRenderingContext2D, motion: MotionType, atmo: Atmosphere,
  tempMul: number, breath: number, t: number, w: number, h: number,
  stateRef: React.MutableRefObject<any>, presence: number = 1,
) {
  const state = stateRef.current as RippleState;
  if (!state || presence < 0.001) return;

  const baseMaxRadius = Math.max(w, h) * (motion === 'cymatic-ripple' ? 0.5 : 0.75);
  const maxRadius = baseMaxRadius * (0.2 + presence * 0.8);
  const exitAccel = presence < 1 ? 1 + (1 - presence) * 3 : 1;
  const speed = (motion === 'tectonic-drift' ? 0.35 : motion === 'cymatic-ripple' ? 2.2 : motion === 'viscous-unspooling' ? 1.4 : 0.7) * exitAccel;

  if (motion === 'pendulum-settle') {
    for (const s of state.sources) {
      s.x += Math.sin(t * 0.005 + s.interval) * 0.7;
      s.y += Math.cos(t * 0.004 + s.interval * 1.3) * 0.5;
      s.x = ((s.x % w) + w) % w; s.y = ((s.y % h) + h) % h;
    }
  }
  if (motion === 'viscous-unspooling') {
    for (const s of state.sources) { s.x += 0.25; if (s.x > w + 50) s.x = -50; }
  }

  const scx = w / 2; const scy = h / 2;
  for (const s of state.sources) {
    s.timer++;
    const interval = motion === 'somatic-breath' ? (breath < 0.3 ? s.interval * 0.4 : s.interval * 2.5) : s.interval;
    if (s.timer >= interval && presence > 0.3) {
      s.timer = 0;
      const sx = scx + (s.x - scx) * presence + (Math.random() - 0.5) * 6;
      const sy = scy + (s.y - scy) * presence + (Math.random() - 0.5) * 6;
      state.rings.push({
        cx: sx, cy: sy, radius: 0, maxRadius,
        opacity: (0.12 + Math.random() * 0.1) * tempMul * presence,
        thickness: 0.4 + Math.random() * 1.0,
      });
    }
  }

  const breathMod = motion === 'somatic-breath' ? 0.4 + breath * 1.2 : 1;

  for (let i = state.rings.length - 1; i >= 0; i--) {
    const r = state.rings[i];
    r.radius += speed * breathMod;
    const progress = r.radius / r.maxRadius;
    if (progress >= 1) { state.rings.splice(i, 1); continue; }

    let alpha = Math.exp(-progress * 3.5) * r.opacity * (0.4 + breath * 0.6) * presence;
    if (alpha < 0.002) continue;

    const colorT = progress;
    const baseRgb = colorT < 0.25 ? atmo.rgbNear : colorT < 0.55 ? lerpRgb(atmo.rgbNear, atmo.rgbMid, (colorT - 0.25) / 0.3) : atmo.rgbFar;
    const thickness = r.thickness * (1 - progress * 0.4) * (1 + breath * 0.15);

    const outerA = pAlpha(alpha, 3, 0.01);
    if (outerA > 0.005) {
      ctx.beginPath(); ctx.arc(r.cx, r.cy, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(baseRgb, outerA);
      ctx.lineWidth = thickness * 12; ctx.stroke();
    }
    const midA = pAlpha(alpha, 4, 0.03);
    ctx.beginPath(); ctx.arc(r.cx, r.cy, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(baseRgb, midA);
    ctx.lineWidth = thickness * 3; ctx.stroke();

    const edgeA = pAlpha(alpha, 3.5, 0.05);
    const edgeRgb = hotRgb(baseRgb, edgeA * 0.5);
    ctx.beginPath(); ctx.arc(r.cx, r.cy, r.radius, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(edgeRgb, edgeA);
    ctx.lineWidth = Math.max(0.3, thickness * 0.5); ctx.stroke();

    if (progress < 0.08) {
      const fillA = pAlpha(((1 - progress / 0.08) ** 3) * 0.04 * tempMul, 4, 0.02);
      const cg = ctx.createRadialGradient(r.cx, r.cy, 0, r.cx, r.cy, r.radius);
      cg.addColorStop(0, rgba(hotRgb(atmo.rgbNear, 0.2), fillA));
      cg.addColorStop(1, rgba(atmo.rgbNear, 0));
      ctx.beginPath(); ctx.arc(r.cx, r.cy, r.radius, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
    }
  }
  if (state.rings.length > 80) state.rings.splice(0, state.rings.length - 80);
}

// ═══════════════════════════════════════════════════
// 3. VISCOUS DRAG (connecting filaments with resistance)
// ═══════════════════════════════════════════════════

function drawSmoothCurve(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  if (pts.length === 2) { ctx.lineTo(pts[1].x, pts[1].y); return; }
  for (let i = 1; i < pts.length - 1; i++) {
    const cpx = (pts[i].x + pts[i + 1].x) / 2;
    const cpy = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy);
  }
  ctx.quadraticCurveTo(pts[pts.length - 2].x, pts[pts.length - 2].y, pts[pts.length - 1].x, pts[pts.length - 1].y);
}

function renderThreads(
  ctx: CanvasRenderingContext2D, motion: MotionType, atmo: Atmosphere,
  tempMul: number, breath: number, t: number, w: number, h: number,
  stateRef: React.MutableRefObject<any>, presence: number = 1,
) {
  const state = stateRef.current as ThreadState;
  if (!state || presence < 0.001) return;
  const cx = w / 2; const cy = h / 2;

  for (const thread of state.threads) {
    thread.life++;
    const lp = thread.life / thread.maxLife;
    let alpha = lp < 0.15 ? (lp / 0.15) ** 1.5 : lp > 0.8 ? ((1 - lp) / 0.2) ** 1.5 : 1;
    alpha *= thread.opacity * (0.4 + breath * 0.6) * tempMul * presence;

    for (const pt of thread.points) {
      switch (motion) {
        case 'tectonic-drift':
          pt.vx += (Math.random() - 0.5) * 0.008; pt.vy += (Math.random() - 0.5) * 0.008;
          pt.vx += (pt.homeX - pt.x) * 0.002; pt.vy += (pt.homeY - pt.y) * 0.002;
          pt.vx *= 0.92; pt.vy *= 0.92; break;
        case 'somatic-breath': {
          const dx = pt.x - cx; const dy = pt.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          pt.vx += (dx / dist) * (breath - 0.5) * 0.12;
          pt.vy += (dy / dist) * (breath - 0.5) * 0.12;
          pt.vx *= 0.955; pt.vy *= 0.955; break;
        }
        case 'viscous-unspooling':
          pt.vx += 0.025; pt.vy += Math.sin(pt.x * 0.006 + t * 0.0015) * 0.012;
          pt.vx *= 0.982; pt.vy *= 0.975; break;
        case 'pendulum-settle': {
          const tx = cx + Math.cos(t * 0.003) * w * 0.18;
          const ty = cy + Math.sin(t * 0.004) * h * 0.15;
          const dx = tx - pt.x; const dy = ty - pt.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          pt.vx += (dx / dist) * 0.035; pt.vy += (dy / dist) * 0.035;
          pt.vx *= 0.972; pt.vy *= 0.972; break;
        }
        case 'defocus-dissolve':
          pt.vx += (Math.random() - 0.5) * 0.006; pt.vy += (Math.random() - 0.5) * 0.006;
          pt.vx += (pt.homeX - pt.x) * 0.003; pt.vy += (pt.homeY - pt.y) * 0.003;
          pt.vx *= 0.93; pt.vy *= 0.93; break;
        case 'cymatic-ripple':
          pt.vx += (Math.random() - 0.5) * 0.25; pt.vy += (Math.random() - 0.5) * 0.25;
          pt.vx *= 0.965; pt.vy *= 0.965; break;
      }
      pt.x += pt.vx; pt.y += pt.vy;
      if (pt.x < -40) pt.x += w + 80; if (pt.x > w + 40) pt.x -= w + 80;
      if (pt.y < -40) pt.y += h + 80; if (pt.y > h + 40) pt.y -= h + 80;
    }

    if (thread.life >= thread.maxLife) {
      thread.life = 0; thread.maxLife = 600 + Math.random() * 800;
      let px = Math.random() * w, py = Math.random() * h;
      const angle = Math.random() * Math.PI * 2;
      const segLen = 18 + Math.random() * 22;
      for (const pt of thread.points) {
        pt.x = px; pt.y = py; pt.homeX = px; pt.homeY = py; pt.vx = 0; pt.vy = 0;
        const drift = (Math.random() - 0.5) * 0.6;
        px += Math.cos(angle + drift) * segLen;
        py += Math.sin(angle + drift) * segLen;
      }
      continue;
    }
    if (alpha < 0.002) continue;

    const baseRgb = thread.plane === 0 ? atmo.rgbFar : thread.plane === 1 ? atmo.rgbMid : atmo.rgbNear;
    const allPts = thread.points;
    const visibleCount = Math.max(2, Math.ceil(allPts.length * presence));
    const pts: { x: number; y: number }[] = [];
    const origin = allPts[0];
    for (let i = 0; i < allPts.length; i++) {
      if (i < visibleCount) {
        const retract = presence < 1 ? (1 - presence) * 0.6 : 0;
        pts.push({ x: allPts[i].x + (origin.x - allPts[i].x) * retract, y: allPts[i].y + (origin.y - allPts[i].y) * retract });
      } else {
        const frontier = allPts[visibleCount - 1];
        const growthFrac = (presence * allPts.length - (visibleCount - 1));
        pts.push({ x: frontier.x + (allPts[i].x - frontier.x) * Math.max(0, growthFrac), y: frontier.y + (allPts[i].y - frontier.y) * Math.max(0, growthFrac) });
      }
    }

    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // Soft ambient glow
    const ambientA = pAlpha(alpha, 5, 0.008);
    drawSmoothCurve(ctx, pts);
    ctx.strokeStyle = rgba(baseRgb, ambientA);
    ctx.lineWidth = 5 + breath * 3; ctx.stroke();

    // Mid body — the visible filament
    const bodyA = pAlpha(alpha, 4, 0.03);
    drawSmoothCurve(ctx, pts);
    ctx.strokeStyle = rgba(baseRgb, bodyA);
    ctx.lineWidth = 1.8 + breath * 0.8; ctx.stroke();

    // Bright core
    const threadCoreA = pAlpha(alpha, 3, 0.06);
    drawSmoothCurve(ctx, pts);
    const coreRgb = hotRgb(baseRgb, threadCoreA * 0.6);
    ctx.strokeStyle = rgba(coreRgb, threadCoreA);
    ctx.lineWidth = 0.5 + breath * 0.15; ctx.stroke();

    for (let i = 0; i < pts.length; i++) {
      const nodePresence = i < visibleCount ? 1 : 0;
      if (nodePresence < 0.01) continue;
      const pt = pts[i];
      const nodeRaw = alpha * (i === 0 || i === allPts.length - 1 ? 0.6 : 0.3) * nodePresence;
      const nodeAlpha = pAlpha(nodeRaw, 3.5, 0.03);
      const nr = 2 + breath * 1.2;
      const ng = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, nr * 3);
      ng.addColorStop(0, rgba(hotRgb(baseRgb, 0.6), nodeAlpha * 0.6));
      ng.addColorStop(0.3, rgba(baseRgb, nodeAlpha * 0.2));
      ng.addColorStop(1, rgba(baseRgb, 0));
      ctx.beginPath(); ctx.arc(pt.x, pt.y, nr * 3, 0, Math.PI * 2); ctx.fillStyle = ng; ctx.fill();
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = rgba(hotRgb(baseRgb, 0.8), nodeAlpha); ctx.fill();
    }
  }

  // Inter-thread connections
  const ends: { x: number; y: number; rgb: [number, number, number]; a: number }[] = [];
  for (const th of state.threads) {
    const lp = th.life / th.maxLife;
    let a = lp < 0.15 ? (lp / 0.15) ** 1.5 : lp > 0.8 ? ((1 - lp) / 0.2) ** 1.5 : 1;
    a *= th.opacity * tempMul * 0.25 * presence;
    if (a < 0.001) continue;
    const rgb = th.plane === 0 ? atmo.rgbFar : th.plane === 1 ? atmo.rgbMid : atmo.rgbNear;
    ends.push({ x: th.points[0].x, y: th.points[0].y, rgb, a });
    ends.push({ x: th.points[th.points.length - 1].x, y: th.points[th.points.length - 1].y, rgb, a });
  }
  const cd = motion === 'pendulum-settle' ? 150 : 90;
  for (let i = 0; i < ends.length; i++) {
    for (let j = i + 1; j < ends.length; j++) {
      const dx = ends[i].x - ends[j].x; const dy = ends[i].y - ends[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < cd) {
        const connRaw = Math.min(ends[i].a, ends[j].a) * ((1 - dist / cd) ** 2) * (0.5 + breath * 0.5);
        const connA = pAlpha(connRaw, 5, 0.008);
        if (connA < 0.002) continue;
        const rgb = lerpRgb(ends[i].rgb, ends[j].rgb, 0.5);
        ctx.beginPath(); ctx.moveTo(ends[i].x, ends[i].y); ctx.lineTo(ends[j].x, ends[j].y);
        ctx.strokeStyle = rgba(rgb, connA); ctx.lineWidth = 0.4; ctx.stroke();
      }
    }
  }
}

// ═══════════════════════════════════════════════════
// 4. GYROSCOPIC PARALLAX (depth-responsive mesh)
// ═══════════════════════════════════════════════════

function renderMembrane(
  ctx: CanvasRenderingContext2D, motion: MotionType, atmo: Atmosphere,
  tempMul: number, breath: number, t: number, w: number, h: number,
  stateRef: React.MutableRefObject<any>, presence: number = 1,
) {
  const state = stateRef.current as MembraneState;
  if (!state || presence < 0.001) return;
  const { cols, rows, points } = state;
  const cx = w / 2; const cy = h / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pt = points[r * cols + c];
      pt.vx += (pt.restX - pt.x) * 0.025;
      pt.vy += (pt.restY - pt.y) * 0.025;

      let nx = 0, ny = 0, nc = 0;
      if (c > 0) { const n = points[r * cols + c - 1]; nx += n.x - n.restX; ny += n.y - n.restY; nc++; }
      if (c < cols - 1) { const n = points[r * cols + c + 1]; nx += n.x - n.restX; ny += n.y - n.restY; nc++; }
      if (r > 0) { const n = points[(r - 1) * cols + c]; nx += n.x - n.restX; ny += n.y - n.restY; nc++; }
      if (r < rows - 1) { const n = points[(r + 1) * cols + c]; nx += n.x - n.restX; ny += n.y - n.restY; nc++; }
      if (nc > 0) {
        pt.vx += (nx / nc - (pt.x - pt.restX)) * 0.008;
        pt.vy += (ny / nc - (pt.y - pt.restY)) * 0.008;
      }

      switch (motion) {
        case 'tectonic-drift':
          pt.vy += Math.sin(pt.restX * 0.02 + t * 0.004) * 0.0015;
          pt.vx += Math.cos(pt.restY * 0.018 + t * 0.003) * 0.001;
          pt.vx *= 0.93; pt.vy *= 0.93; break;
        case 'somatic-breath': {
          const dx = pt.restX - cx; const dy = pt.restY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          pt.vx += (dx / dist) * (breath - 0.5) * 0.06;
          pt.vy += (dy / dist) * (breath - 0.5) * 0.06;
          pt.vx *= 0.945; pt.vy *= 0.945; break;
        }
        case 'viscous-unspooling': {
          const phase = pt.restX * 0.012 - t * 0.025;
          pt.vy += Math.sin(phase) * 0.08;
          pt.vx += Math.cos(phase * 0.3) * 0.01;
          pt.vx *= 0.935; pt.vy *= 0.935; break;
        }
        case 'pendulum-settle': {
          for (let f = 0; f < 2; f++) {
            const fx = cx + Math.cos(t * 0.006 + f * Math.PI) * w * 0.22;
            const fy = cy + Math.sin(t * 0.004 + f * Math.PI) * h * 0.18;
            const dx = pt.x - fx; const dy = pt.y - fy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < 140) {
              const push = ((140 - dist) / 140) ** 2 * 0.3;
              pt.vx += (dx / dist) * push; pt.vy += (dy / dist) * push;
            }
          }
          pt.vx *= 0.94; pt.vy *= 0.94; break;
        }
        case 'defocus-dissolve':
          pt.vy += Math.sin(pt.restX * 0.015 + t * 0.002) * 0.001;
          pt.vx += Math.cos(pt.restY * 0.012 + t * 0.0015) * 0.0008;
          pt.vx *= 0.94; pt.vy *= 0.94; break;
        case 'cymatic-ripple':
          pt.vx += (Math.random() - 0.5) * 0.12;
          pt.vy += (Math.random() - 0.5) * 0.12;
          pt.vy += Math.sin(pt.restX * 0.025 + t * 0.04) * 0.06;
          pt.vx *= 0.935; pt.vy *= 0.935; break;
      }
      pt.x += pt.vx; pt.y += pt.vy;
    }
  }

  const maxDist = Math.sqrt(cx * cx + cy * cy);
  const mp = (physX: number, physY: number) => ({
    x: cx + (physX - cx) * presence,
    y: cy + (physY - cy) * presence,
  });

  // Horizontal lines
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const p1raw = points[r * cols + c]; const p2raw = points[r * cols + c + 1];
      const p1 = mp(p1raw.x, p1raw.y); const p2 = mp(p2raw.x, p2raw.y);
      const d1 = Math.sqrt((p1raw.x - p1raw.restX) ** 2 + (p1raw.y - p1raw.restY) ** 2);
      const d2 = Math.sqrt((p2raw.x - p2raw.restX) ** 2 + (p2raw.y - p2raw.restY) ** 2);
      const disp = (d1 + d2) / 2;
      const midX = (p1raw.restX + p2raw.restX) / 2; const midY = (p1raw.restY + p2raw.restY) / 2;
      const distC = Math.sqrt((midX - cx) ** 2 + (midY - cy) ** 2);
      const fade = 1 - (distC / maxDist) * 0.6;
      const baseA = 0.01 + disp * 0.015;
      const caustic = Math.min(1, disp * 0.08);
      const alpha = baseA * fade * tempMul * (0.4 + breath * 0.6) * presence;
      if (alpha < 0.002) continue;
      const colorT = distC / maxDist;
      const baseRgb = colorT < 0.3 ? atmo.rgbNear : colorT < 0.6 ? lerpRgb(atmo.rgbNear, atmo.rgbMid, (colorT - 0.3) / 0.3) : atmo.rgbFar;
      const rgb = hotRgb(baseRgb, caustic * 0.4);
      const lineGlowA = pAlpha(alpha, 4, 0.01);
      if (lineGlowA > 0.005) {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = rgba(baseRgb, lineGlowA); ctx.lineWidth = 4 + caustic * 3; ctx.lineCap = 'round'; ctx.stroke();
      }
      const lineCoreA = pAlpha(alpha, 4, 0.04);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = rgba(rgb, lineCoreA); ctx.lineWidth = 0.3 + caustic * 0.5; ctx.stroke();
    }
  }

  // Vertical lines
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols; c++) {
      const p1raw = points[r * cols + c]; const p2raw = points[(r + 1) * cols + c];
      const p1 = mp(p1raw.x, p1raw.y); const p2 = mp(p2raw.x, p2raw.y);
      const d1 = Math.sqrt((p1raw.x - p1raw.restX) ** 2 + (p1raw.y - p1raw.restY) ** 2);
      const d2 = Math.sqrt((p2raw.x - p2raw.restX) ** 2 + (p2raw.y - p2raw.restY) ** 2);
      const disp = (d1 + d2) / 2;
      const midX = (p1raw.restX + p2raw.restX) / 2; const midY = (p1raw.restY + p2raw.restY) / 2;
      const distC = Math.sqrt((midX - cx) ** 2 + (midY - cy) ** 2);
      const fade = 1 - (distC / maxDist) * 0.6;
      const baseA = 0.01 + disp * 0.015;
      const caustic = Math.min(1, disp * 0.08);
      const alpha = baseA * fade * tempMul * (0.4 + breath * 0.6) * presence;
      if (alpha < 0.001) continue;
      const colorT = distC / maxDist;
      const baseRgb = colorT < 0.3 ? atmo.rgbNear : colorT < 0.6 ? lerpRgb(atmo.rgbNear, atmo.rgbMid, (colorT - 0.3) / 0.3) : atmo.rgbFar;
      const rgb = hotRgb(baseRgb, caustic * 0.4);
      const vLineGlowA = pAlpha(alpha, 4, 0.01);
      if (vLineGlowA > 0.005) {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = rgba(baseRgb, vLineGlowA); ctx.lineWidth = 4 + caustic * 3; ctx.lineCap = 'round'; ctx.stroke();
      }
      const vLineCoreA = pAlpha(alpha, 4, 0.04);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = rgba(rgb, vLineCoreA); ctx.lineWidth = 0.3 + caustic * 0.5; ctx.stroke();
    }
  }

  // Node highlights
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const ptRaw = points[r * cols + c]; const pt = mp(ptRaw.x, ptRaw.y);
      const disp = Math.sqrt((ptRaw.x - ptRaw.restX) ** 2 + (ptRaw.y - ptRaw.restY) ** 2);
      if (disp < 2) continue;
      const distC = Math.sqrt((ptRaw.restX - cx) ** 2 + (ptRaw.restY - cy) ** 2);
      const fade = 1 - (distC / maxDist) * 0.6;
      const nodeRaw = Math.min(1, disp * 0.03) * fade * tempMul * (0.3 + breath * 0.7) * presence;
      const nodeA = pAlpha(nodeRaw, 3.5, 0.03);
      if (nodeA < 0.005) continue;
      const nr = 1.5 + disp * 0.3;
      const colorT = distC / maxDist;
      const rgb = colorT < 0.4 ? atmo.rgbNear : atmo.rgbMid;
      const hot = hotRgb(rgb, Math.min(1, disp * 0.06));
      const ng = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, nr * 4);
      ng.addColorStop(0, rgba(hot, nodeA * 0.5));
      ng.addColorStop(0.2, rgba(rgb, nodeA * 0.15));
      ng.addColorStop(1, rgba(rgb, 0));
      ctx.beginPath(); ctx.arc(pt.x, pt.y, nr * 4, 0, Math.PI * 2);
      ctx.fillStyle = ng; ctx.fill();
    }
  }
}

// ═══════════════════════════════════════════════════
// 5. HAPTIC ENTRAINMENT (rhythmic pulse from foci)
// ════════════════════════════════════════════���══════

function renderPulse(
  ctx: CanvasRenderingContext2D, motion: MotionType, atmo: Atmosphere,
  tempMul: number, breath: number, t: number, w: number, h: number,
  stateRef: React.MutableRefObject<any>, presence: number = 1,
) {
  const state = stateRef.current as PulseState;
  if (!state || presence < 0.001) return;
  const maxR = Math.max(w, h) * 0.65 * (0.3 + presence * 0.7);
  const cx = w / 2; const cy = h / 2;
  const speedMul = (motion === 'tectonic-drift' ? 0.5 : motion === 'cymatic-ripple' ? 2.5 : 1) * (0.2 + presence * 0.8);

  for (const f of state.foci) {
    switch (motion) {
      case 'tectonic-drift': f.x += (cx - f.x) * 0.01; f.y += (cy - f.y) * 0.01; break;
      case 'somatic-breath':
        f.x = cx + Math.cos(f.phase) * 15 * breath;
        f.y = cy + Math.sin(f.phase) * 10 * breath; break;
      case 'viscous-unspooling':
        f.x += 0.4; f.y += Math.sin(t * 0.006 + f.phase) * 0.25;
        if (f.x > w + 60) f.x = -60; break;
      case 'pendulum-settle':
        f.x = cx + Math.cos(t * f.speed + f.phase) * w * 0.22;
        f.y = cy + Math.sin(t * f.speed * 0.7 + f.phase) * h * 0.18; break;
      case 'defocus-dissolve':
        f.x += (cx - f.x) * 0.005; f.y += (cy - f.y) * 0.005; break;
      case 'cymatic-ripple':
        f.x += (Math.random() - 0.5) * 3.5; f.y += (Math.random() - 0.5) * 3.5;
        f.x = Math.max(0, Math.min(w, f.x)); f.y = Math.max(0, Math.min(h, f.y)); break;
    }
    f.phase += f.speed;

    const fx = cx + (f.x - cx) * presence;
    const fy = cy + (f.y - cy) * presence;

    for (let ring = 0; ring < state.ringCount; ring++) {
      let ringPhase: number;
      if (motion === 'somatic-breath') {
        ringPhase = (breath + ring / state.ringCount) % 1;
      } else {
        ringPhase = ((t * speedMul * 0.007 + ring / state.ringCount + f.phase * 0.1) % 1);
      }

      const radius = ringPhase * maxR;
      if (radius < 1) continue;

      let alpha = Math.exp(-ringPhase * 4) * 0.15 * tempMul * (0.3 + breath * 0.7) * presence;
      if (alpha < 0.002) continue;

      const colorT = ringPhase;
      const baseRgb = colorT < 0.2 ? atmo.rgbNear
        : colorT < 0.5 ? lerpRgb(atmo.rgbNear, atmo.rgbMid, (colorT - 0.2) / 0.3)
        : atmo.rgbFar;
      const thickness = Math.max(0.3, (1 - ringPhase) * 2.5);

      const pOuterA = pAlpha(alpha, 3, 0.01);
      if (pOuterA > 0.005) {
        ctx.beginPath(); ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(baseRgb, pOuterA); ctx.lineWidth = thickness * 16; ctx.stroke();
      }
      const pMidA = pAlpha(alpha, 4, 0.025);
      ctx.beginPath(); ctx.arc(fx, fy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(baseRgb, pMidA); ctx.lineWidth = thickness * 3.5; ctx.stroke();

      const pEdgeA = pAlpha(alpha, 3.5, 0.05);
      const edgeRgb = hotRgb(baseRgb, pEdgeA * 0.4);
      ctx.beginPath(); ctx.arc(fx, fy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(edgeRgb, pEdgeA);
      ctx.lineWidth = Math.max(0.3, thickness * 0.4); ctx.stroke();

      if (ring === 0 && ringPhase < 0.06) {
        const flashRaw = ((1 - ringPhase / 0.06) ** 3) * 0.04 * tempMul;
        const flashA = pAlpha(flashRaw, 4, 0.02);
        const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, radius * 1.2);
        fg.addColorStop(0, rgba(hotRgb(atmo.rgbNear, 0.3), flashA));
        fg.addColorStop(0.5, rgba(atmo.rgbNear, flashA * 0.15));
        fg.addColorStop(1, rgba(atmo.rgbNear, 0));
        ctx.beginPath(); ctx.arc(fx, fy, radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = fg; ctx.fill();
      }
    }

    const focusRaw = 0.07 * tempMul * (0.4 + breath * 0.6) * presence;
    const fAlpha = pAlpha(focusRaw, 3, 0.04);
    const fr = 5 + breath * 2.5;
    const fg2 = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr * 5);
    fg2.addColorStop(0, rgba(hotRgb(atmo.rgbNear, 0.3), fAlpha));
    fg2.addColorStop(0.15, rgba(atmo.rgbNear, fAlpha * 0.35));
    fg2.addColorStop(0.5, rgba(atmo.rgbMid, fAlpha * 0.08));
    fg2.addColorStop(1, rgba(atmo.rgbFar, 0));
    ctx.beginPath(); ctx.arc(fx, fy, fr * 5, 0, Math.PI * 2);
    ctx.fillStyle = fg2; ctx.fill();
    ctx.beginPath(); ctx.arc(fx, fy, 1, 0, Math.PI * 2);
    ctx.fillStyle = rgba(hotRgb(atmo.rgbNear, 0.5), pAlpha(focusRaw, 2, 0.06));
    ctx.fill();
  }
}

// ═══════════════════════════════════════════════════
// 6. ACOUSTIC FLUTTER (responsive flickering nodes)
//    "Breathing onto a spider web" — nodes flutter
//    asynchronously as if responding to invisible sound
// ═══════════════════════════════════════════════════

function renderFlutter(
  ctx: CanvasRenderingContext2D, motion: MotionType, atmo: Atmosphere,
  tempMul: number, breath: number, t: number, w: number, h: number,
  stateRef: React.MutableRefObject<any>, presence: number = 1,
) {
  const state = stateRef.current as FlutterState;
  if (!state || presence < 0.001) return;
  const cx = w / 2; const cy = h / 2;

  // Simulate audio-responsive flutter via noise
  const audioSim = Math.sin(t * 0.03) * 0.5 + Math.sin(t * 0.07 + 1.3) * 0.3 + Math.sin(t * 0.13 + 2.7) * 0.2;
  const flutterIntensity = 0.3 + Math.abs(audioSim) * 0.7;

  for (const node of state.nodes) {
    // Flutter: irregular oscillation around rest position
    node.phase += node.freq * (0.5 + flutterIntensity);
    const flutter = Math.sin(node.phase) * flutterIntensity;

    switch (motion) {
      case 'tectonic-drift':
        node.vx += (node.restX - node.x) * 0.01 + flutter * 0.3;
        node.vy += (node.restY - node.y) * 0.01 + Math.cos(node.phase * 0.7) * flutter * 0.2;
        node.vx *= 0.95; node.vy *= 0.95; break;
      case 'somatic-breath': {
        const dx = node.restX - cx; const dy = node.restY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        node.vx += (dx / dist) * (breath - 0.5) * 0.08 + flutter * 0.5;
        node.vy += (dy / dist) * (breath - 0.5) * 0.08 + Math.cos(node.phase) * flutter * 0.4;
        node.vx += (node.restX - node.x) * 0.008;
        node.vy += (node.restY - node.y) * 0.008;
        node.vx *= 0.94; node.vy *= 0.94; break;
      }
      case 'viscous-unspooling':
        node.vx += 0.015 + flutter * 0.4;
        node.vy += Math.sin(node.x * 0.005 + t * 0.001) * 0.01 + Math.cos(node.phase) * flutter * 0.3;
        node.vx *= 0.985; node.vy *= 0.975;
        if (node.x > w + 20) { node.x = -10; node.restX = node.x; } break;
      case 'pendulum-settle': {
        const tx = cx + Math.cos(t * 0.004) * w * 0.15;
        const ty = cy + Math.sin(t * 0.005) * h * 0.12;
        const dx = tx - node.x; const dy = ty - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        node.vx += (dx / dist) * 0.02 + flutter * 0.6;
        node.vy += (dy / dist) * 0.02 + Math.cos(node.phase) * flutter * 0.5;
        node.vx *= 0.97; node.vy *= 0.97; break;
      }
      case 'defocus-dissolve':
        node.vx += (node.restX - node.x) * 0.005 + flutter * 0.15;
        node.vy += (node.restY - node.y) * 0.005 + Math.cos(node.phase) * flutter * 0.1;
        node.vx *= 0.96; node.vy *= 0.96; break;
      case 'cymatic-ripple':
        node.vx += (Math.random() - 0.5) * 0.3 + flutter * 1.2;
        node.vy += (Math.random() - 0.5) * 0.3 + Math.cos(node.phase) * flutter * 0.8;
        node.vx *= 0.97; node.vy *= 0.97; break;
    }
    node.x += node.vx; node.y += node.vy;

    if (node.x < -20) node.x = w + 20; if (node.x > w + 20) node.x = -20;
    if (node.y < -20) node.y = h + 20; if (node.y > h + 20) node.y = -20;

    // Render: flickering bioluminescent node
    const flutterRaw = node.opacity * (0.4 + Math.abs(flutter) * 0.6) * tempMul * (0.3 + breath * 0.7) * presence;
    if (flutterRaw < 0.001) continue;

    const px = cx + (node.x - cx) * presence;
    const py = cy + (node.y - cy) * presence;
    const baseRgb = flutterRaw > 0.04 ? atmo.rgbNear : atmo.rgbMid;
    const bSize = node.size * (0.6 + Math.abs(flutter) * 0.8) * (0.3 + presence * 0.7);

    // Halo
    const haloR = bSize * 6;
    const fHaloA = pAlpha(flutterRaw, 3, 0.015);
    if (fHaloA > 0.002) {
      const g = ctx.createRadialGradient(px, py, 0, px, py, haloR);
      g.addColorStop(0, rgba(baseRgb, fHaloA));
      g.addColorStop(0.3, rgba(baseRgb, fHaloA * 0.35));
      g.addColorStop(1, rgba(baseRgb, 0));
      ctx.beginPath(); ctx.arc(px, py, haloR, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
    }

    // Core
    const fCoreA = pAlpha(flutterRaw, 3, 0.08);
    ctx.beginPath(); ctx.arc(px, py, bSize * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = rgba(hotRgb(baseRgb, fCoreA * 0.6), fCoreA);
    ctx.fill();
  }

  // Faint connections between nearby flickering nodes
  for (let i = 0; i < state.nodes.length; i++) {
    for (let j = i + 1; j < Math.min(i + 8, state.nodes.length); j++) {
      const a = state.nodes[i]; const b = state.nodes[j];
      const dx = a.x - b.x; const dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        const connRaw = ((1 - dist / 80) ** 2) * 0.04 * tempMul * (0.3 + breath * 0.7) * presence * flutterIntensity;
        const connAlpha = pAlpha(connRaw, 5, 0.006);
        if (connAlpha < 0.002) continue;
        const px1 = cx + (a.x - cx) * presence;
        const py1 = cy + (a.y - cy) * presence;
        const px2 = cx + (b.x - cx) * presence;
        const py2 = cy + (b.y - cy) * presence;
        ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2);
        ctx.strokeStyle = rgba(atmo.rgbMid, connAlpha); ctx.lineWidth = 0.3; ctx.stroke();
      }
    }
  }
}

// ═══════════════════════════════════════════════════
// CANVAS HOOK
// ═══════════════════════════════════════════════════

interface TransitionSlot {
  interaction: InteractionType;
  state: any;
  presence: number;
  startMs: number;
  durationMs: number;
  curve: (t: number) => number;
  direction: 'enter' | 'exit';
}

export function useCanvasRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  interaction: InteractionType,
  motion: MotionType,
  atmosphere: Atmosphere,
  colorType: ColorType,
  tempMul: number,
  breathRef: React.RefObject<number>,
  reducedMotion: boolean | null,
  motionYield: number = 0,
  intensityScale: number = 1,
) {
  const paramsRef = useRef({ interaction, motion, atmosphere, colorType, tempMul, motionYield, intensityScale });
  const activeInterRef = useRef(interaction);
  const activeStateRef = useRef<any>(null);
  const exitSlotRef = useRef<TransitionSlot | null>(null);
  const enterSlotRef = useRef<TransitionSlot | null>(null);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const timeRef = useRef(0);

  paramsRef.current = { interaction, motion, atmosphere, colorType, tempMul, motionYield, intensityScale };

  useEffect(() => {
    const prev = activeInterRef.current;
    if (prev === interaction) return;
    const { w, h } = sizeRef.current;
    const W = w || 800; const H = h || 600;
    const now = performance.now();

    const exitId = transitionIdentities[prev];
    exitSlotRef.current = {
      interaction: prev, state: { current: activeStateRef.current },
      presence: 1, startMs: now, durationMs: exitId.exitMs, curve: exitId.exitCurve, direction: 'exit',
    };

    const enterId = transitionIdentities[interaction];
    const newState = initState(interaction, motion, W, H, tempMul);
    activeStateRef.current = newState;
    activeInterRef.current = interaction;

    enterSlotRef.current = {
      interaction, state: { current: newState },
      presence: 0, startMs: now, durationMs: enterId.enterMs, curve: enterId.enterCurve, direction: 'enter',
    };
  }, [interaction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const { w, h } = sizeRef.current;
    const W = w || 800; const H = h || 600;
    activeStateRef.current = initState(paramsRef.current.interaction, paramsRef.current.motion, W, H, paramsRef.current.tempMul);

    if (reducedMotion) {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, 1 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(paramsRef.current.atmosphere.rgbMid, 0.12);
        ctx.fill();
      }
      return () => ro.disconnect();
    }

    const tick = () => {
      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) { rafRef.current = requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, w, h);
      const { motion: mot, atmosphere: atmo, colorType: col, tempMul: temp,
              motionYield: myield, intensityScale: iscale } = paramsRef.current;
      const timeStep = 1 - myield;
      timeRef.current += timeStep;
      const breath = breathRef.current ?? 0.5;
      const attenuatedTemp = temp * iscale;
      const now = performance.now();

      const exitSlot = exitSlotRef.current;
      if (exitSlot) {
        const elapsed = now - exitSlot.startMs;
        const raw = Math.min(1, elapsed / exitSlot.durationMs);
        exitSlot.presence = 1 - exitSlot.curve(raw);
        if (raw >= 1) exitSlotRef.current = null;
      }

      const enterSlot = enterSlotRef.current;
      if (enterSlot) {
        const elapsed = now - enterSlot.startMs;
        const raw = Math.min(1, elapsed / enterSlot.durationMs);
        enterSlot.presence = enterSlot.curve(raw);
        if (raw >= 1) enterSlotRef.current = null;
      }

      if (exitSlot && exitSlot.presence > 0.001) {
        renderFrame(ctx, exitSlot.interaction, mot, atmo, col, attenuatedTemp, breath,
          timeRef.current, w, h, exitSlot.state as React.MutableRefObject<any>, exitSlot.presence, true);
      }

      const activePresence = enterSlot ? enterSlot.presence : 1;
      renderFrame(ctx, activeInterRef.current, mot, atmo, col, attenuatedTemp, breath,
        timeRef.current, w, h, { current: activeStateRef.current } as React.MutableRefObject<any>, activePresence);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [canvasRef, reducedMotion]);

  useEffect(() => {
    if (enterSlotRef.current || exitSlotRef.current) return;
    const { w, h } = sizeRef.current;
    const W = w || 800; const H = h || 600;
    activeStateRef.current = initState(interaction, motion, W, H, tempMul);
  }, [motion, tempMul]);
}
