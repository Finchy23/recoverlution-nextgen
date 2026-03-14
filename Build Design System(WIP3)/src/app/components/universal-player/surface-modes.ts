/**
 * SURFACE MODES — The Taxonomy of Becoming
 *
 * 4-letter motional words. No labels — they just are.
 *
 * Architecture:
 *   SYNC  → Default surface. The physics of feeling. Always home.
 *   FLOW  → Stream-resident. The architecture of becoming.
 *
 *   Anchor constellation (5 modes, 2 fork):
 *     TALK → The guided corridor
 *     PLAY → The soundtrack of becoming
 *     TUNE → The rhythm of regulation (RISE · HOLD · FLOW · MOVE · FUEL)
 *     KNOW → The sanctuary of understanding (forks → READ, SEEK, FORM)
 *     ECHO → The architecture of proof  (forks → PLOT, ∞MAP, LINK)
 *
 * SYNC is not in the constellation — it IS the glass.
 * FLOW is not in the constellation — it lives in the Stream.
 * KNOW and ECHO are parent modes that expand a second arc.
 */

import {
  roomRecipes,
  type RoomRecipe,
} from '../design-system/doctrine';
import type {
  InteractionType,
  MotionType,
  ColorType,
  AttenuationMode,
} from '../design-system/surface-engine';
import type { ArcPatternId } from '../design-system/SequenceThermodynamics';

// ─── Mode Definition ───

export interface SurfaceMode {
  /** Mode id — the 4-letter word */
  id: string;
  /** Human label (the 4-letter word, capitalised) */
  label: string;
  /** The emotional verb — what this mode does to you */
  verb: string;
  /** Room family */
  family: 'callable' | 'slow-depth' | 'intelligence';
  /** Hero color for the orb and tinting */
  color: string;
  /** The magic law — what makes or breaks this room */
  magicLaw: string;
  /** Stream content — ambient horizon text for this mode */
  streamFragments: string[];

  // ── Doctrine Layer Presets ──
  atmosphere: string;
  motion: MotionType;
  interaction: InteractionType;
  colorSignature: ColorType;
  attenuation: AttenuationMode;
  temperatureRange: [number, number];

  /** Source room recipes this mode draws from */
  sourceRooms: string[];

  // ── Copy Ownership (§7) ──
  canopy: string;
  gesture: string;
  copyDensity: 'whisper' | 'light' | 'moderate';

  // ── Sequence Thermodynamics (§11) ──
  arcPattern: ArcPatternId | null;

  // ── Transition Timing (§2.5) ──
  arrivalDelayMs: number;
  thresholdDelayMs: number;

  // ── Yield Guidance (§10.1) ──
  yieldGuidance: string;

  // ── Spatial Residence ──
  /** Where this mode lives in the architecture */
  residence: 'surface' | 'anchor' | 'stream';
  /** If this is a parent mode, its children ids */
  children?: string[];
  /** If this is a child mode, its parent id */
  parentId?: string;
}

// ─── Build modes from doctrine recipes ───

function recipeById(id: string): RoomRecipe {
  return roomRecipes.find(r => r.id === id)!;
}

// ═══════════════════════════════════════════════════
// THE DEFAULT SURFACE
// ═══════════════════════════════════════════════════

const sync: SurfaceMode = (() => {
  const r = recipeById('navicues');
  return {
    id: 'sync',
    label: 'Sync',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'Heart rate downshifting',
      'You showed up today',
      'Breathe with the glass',
      'The weight will move when you are ready',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['navicues'],
    canopy: 'The weight will move when you are ready.',
    gesture: 'Touch the glass.',
    copyDensity: 'whisper',
    arcPattern: 'containment-bloom',
    arrivalDelayMs: 0,
    thresholdDelayMs: 800,
    yieldGuidance: 'Harmonic fusion between background and hero mechanic.',
    residence: 'surface',
  };
})();

// ═══════════════════════════════════════════════════
// THE STREAM-RESIDENT MODE
// ═══════════════════════════════════════════════════

const flow: SurfaceMode = (() => {
  const r = recipeById('journeys');
  return {
    id: 'flow',
    label: 'Flow',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'The current knows where it goes',
      'Experience. Recognise. Align.',
      'A seed was planted yesterday',
      'Observe it in motion',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['journeys'],
    canopy: 'The current knows where it goes.',
    gesture: 'Observe.',
    copyDensity: 'light',
    arcPattern: 'descent-return',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1000,
    yieldGuidance: 'Path over time. Minimal scene bookkeeping.',
    residence: 'stream',
  };
})();

// ═══════════════════════════════��══════════════════
// ANCHOR CONSTELLATION — Primary modes
// ═══════════════════════════════════════════════════

const talk: SurfaceMode = (() => {
  const r = recipeById('talk');
  return {
    id: 'talk',
    label: 'Talk',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'Your story matters',
      'The corridor is open',
      'Drop the weight here',
      'We listen to understand',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['talk'],
    canopy: 'What are you carrying right now?',
    gesture: 'Speak. Or stay.',
    copyDensity: 'light',
    arcPattern: 'descent-return',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1200,
    yieldGuidance: 'Darkened, listening background with minimal distraction.',
    residence: 'anchor',
  };
})();

const play: SurfaceMode = (() => {
  const r = recipeById('play');
  return {
    id: 'play',
    label: 'Play',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'The beat carries the body',
      'Change the rhythm',
      'We mix the moment',
      'The voice delivers the truth',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['play'],
    canopy: 'The moment already has a frequency.',
    gesture: 'Feel the room.',
    copyDensity: 'whisper',
    arcPattern: 'breathing-wave',
    arrivalDelayMs: 0,
    thresholdDelayMs: 600,
    yieldGuidance: 'Fused energy — canvas links to sonic field.',
    residence: 'anchor',
  };
})();

const tune: SurfaceMode = (() => {
  const r = recipeById('studio');
  return {
    id: 'tune',
    label: 'Tune',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'Your biology asked for this',
      'Shift the state',
      'The body remembers',
      'Rhythm before reason',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['studio'],
    canopy: 'The practice your body asked for.',
    gesture: 'Step inside.',
    copyDensity: 'whisper',
    arcPattern: 'plateau-release',
    arrivalDelayMs: 0,
    thresholdDelayMs: 800,
    yieldGuidance: 'Surface attenuation — canvas softens for immersion.',
    residence: 'anchor',
  };
})();

// ═══════════════════════════════════════════════════
// KNOW — The Sanctuary of Understanding (parent, forks)
// ═══════════════════════════════════════════════════

const know: SurfaceMode = (() => {
  const r = recipeById('read'); // KNOW inherits READ's atmospheric DNA as its resting state
  return {
    id: 'know',
    label: 'Know',
    verb: 'arrival becomes understanding',
    family: 'slow-depth',
    color: '#F9F8FF',
    magicLaw: 'The sanctuary of the mind. Understand the architecture of your own becoming.',
    streamFragments: [
      'Understand the machine',
      'The calm line through the noise',
      'Step out of the noise',
      'The sanctuary is open',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['read'],
    canopy: 'Understand the machine.',
    gesture: 'Enter.',
    copyDensity: 'whisper',
    arcPattern: 'plateau-release',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1200,
    yieldGuidance: 'Maximum attenuation. Deep breath cycle. Almost no canvas energy.',
    residence: 'anchor',
    children: ['read', 'seek', 'form'],
  };
})();

const read: SurfaceMode = (() => {
  const r = recipeById('read');
  return {
    id: 'read',
    label: 'Read',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'The calm line through the noise',
      'Turn the page',
      'Understand the machine',
      'One beautiful page at a time',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['read'],
    canopy: 'A ghost only has power when it lives in the shadows.',
    gesture: 'Descend.',
    copyDensity: 'moderate',
    arcPattern: 'plateau-release',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1000,
    yieldGuidance: 'Maximum attenuation. Almost no canvas energy.',
    residence: 'anchor',
    parentId: 'know',
  };
})();

const seek: SurfaceMode = (() => {
  const r = recipeById('insights');
  return {
    id: 'seek',
    label: 'Seek',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'Descend into the root',
      'The abstract becomes tangible',
      'Touch the anchor',
      'The body remembers what the mind understands',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['insights'],
    canopy: 'The abstract becomes tangible.',
    gesture: 'Descend.',
    copyDensity: 'moderate',
    arcPattern: 'descent-return',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1000,
    yieldGuidance: 'Panel attenuation — documentary depth. Somatic lock points.',
    residence: 'anchor',
    parentId: 'know',
  };
})();

const form: SurfaceMode = (() => {
  const r = recipeById('practices');
  return {
    id: 'form',
    label: 'Form',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'The body takes over',
      'Transmute the weight',
      'The instrument is you',
      'Change the state of the matter',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['practices'],
    canopy: 'The reading must stop. The body takes over.',
    gesture: 'Begin.',
    copyDensity: 'whisper',
    arcPattern: 'plateau-release',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1000,
    yieldGuidance: 'Somatic immersion — haptic entrainment, WebGL, breath pacing.',
    residence: 'anchor',
    parentId: 'know',
  };
})();

// ═══════════════════════════════════════════════════
// ECHO — The Architecture of Proof (parent, forks)
// ══════════════════════════════════════════════════

const echo: SurfaceMode = (() => {
  const r = recipeById('signal');
  return {
    id: 'echo',
    label: 'Echo',
    verb: 'belief becomes proof',
    family: 'intelligence',
    color: r.color,
    magicLaw: 'Belief is fragile. Proof isn\'t. The grounding reality of the Universal Player.',
    streamFragments: [
      'Change is visible',
      'The architecture of proof',
      'Your data tells the truth',
      'Support is near',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['signal'],
    canopy: 'The architecture of your own becoming.',
    gesture: 'Observe.',
    copyDensity: 'light',
    arcPattern: 'descent-return',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1000,
    yieldGuidance: 'Surface attenuation — clean field for proof geometry.',
    residence: 'anchor',
    children: ['plot', 'map', 'link'],
  };
})();

const plot: SurfaceMode = (() => {
  const r = recipeById('signal');
  return {
    id: 'plot',
    label: 'Plot',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'Clarity, Energy, Anchorage',
      'The coordinates of your becoming',
      'Proof before belief',
      'The data does not lie',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['signal'],
    canopy: 'The coordinates of your becoming.',
    gesture: 'Observe.',
    copyDensity: 'light',
    arcPattern: 'descent-return',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1000,
    yieldGuidance: 'Surface attenuation — clean field for proof geometry.',
    residence: 'anchor',
    parentId: 'echo',
  };
})();

const map: SurfaceMode = (() => {
  const r = recipeById('map');
  return {
    id: 'map',
    label: '∞Map',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'The constellation shifts',
      'Friction becomes architecture',
      'Pathways are rewriting',
      'The mind is a landscape',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['map'],
    canopy: 'The constellation of your mind.',
    gesture: 'Navigate.',
    copyDensity: 'light',
    arcPattern: 'descent-return',
    arrivalDelayMs: 0,
    thresholdDelayMs: 1200,
    yieldGuidance: 'Floor attenuation — spatial 3D navigation needs clean depth.',
    residence: 'anchor',
    parentId: 'echo',
  };
})();

const link: SurfaceMode = (() => {
  const r = recipeById('navigate');
  return {
    id: 'link',
    label: 'Link',
    verb: r.verb,
    family: r.family,
    color: r.color,
    magicLaw: r.magicLaw,
    streamFragments: [
      'Support becomes proximity',
      'The bridge is symbiotic',
      'Infrastructure is care',
      'The system knows what matters',
    ],
    atmosphere: r.defaultAtmosphere,
    motion: r.defaultMotion as MotionType,
    interaction: r.defaultInteraction as InteractionType,
    colorSignature: r.defaultColor as ColorType,
    attenuation: r.defaultAttenuation,
    temperatureRange: r.temperatureRange,
    sourceRooms: ['navigate'],
    canopy: 'The infrastructure of care.',
    gesture: 'Connect.',
    copyDensity: 'light',
    arcPattern: null,
    arrivalDelayMs: 0,
    thresholdDelayMs: 800,
    yieldGuidance: 'Surface attenuation — minimalist elegance for logistics.',
    residence: 'anchor',
    parentId: 'echo',
  };
})();

// ═══════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════

/** All modes — the complete registry */
export const allModes: SurfaceMode[] = [
  sync, flow,
  talk, play, tune,
  know, read, seek, form,
  echo, plot, map, link,
];

/** The default surface mode — always home */
export const defaultMode = sync;

/** Stream-resident mode */
export const flowMode = flow;

/** Anchor constellation — top-level modes visible in the radial */
export const anchorModes: SurfaceMode[] = [talk, play, tune, know, echo];

/** Get children of a parent mode */
export function getChildren(parentId: string): SurfaceMode[] {
  return allModes.filter(m => m.parentId === parentId);
}

/** Get a mode by id */
export function getModeById(id: string): SurfaceMode {
  return allModes.find(m => m.id === id) || defaultMode;
}

/** Is this a parent mode that forks? */
export function isParentMode(id: string): boolean {
  const mode = getModeById(id);
  return !!(mode.children && mode.children.length > 0);
}

// ── Legacy compat ──
// surfaceModes is now anchorModes + sync for components that still reference it
export const surfaceModes = allModes;