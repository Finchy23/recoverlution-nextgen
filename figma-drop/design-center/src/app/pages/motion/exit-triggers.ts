/**
 * EXIT TRIGGER SYSTEM
 * ===================
 * Standalone data layer for scene exit triggers, decoupled from voice copy.
 *
 * ARCHITECTURE:
 *   Every atom has exactly one of two exit trigger types:
 *
 *   1. IN-ATOM ACTION  — The atom has a completion sequence. The user
 *      interacts with it, the atom fires `onResolve()`, and the
 *      orchestrator listens for that signal to trigger the exit.
 *      These atoms have `hasResolution: true` in their AtomMeta.
 *      The scene shows a completion indicator, NOT a CTA button.
 *
 *   2. SCENE CTA  — The atom has no inherent completion. It's
 *      continuous, observable, or open-ended. The scene must present
 *      an explicit CTA button so the user can advance.
 *      These atoms have `hasResolution: false` in their AtomMeta.
 *
 * CTAs are built independently here — they are NOT derived from
 * voice copy `gestureLabel` (which is a voice-lane-specific
 * descriptive label, not a functional exit button).
 *
 * RULES:
 *   - CTA text is voice-agnostic (same CTA regardless of voice lane)
 *   - CTA text is short: max 4 words, imperative verb form
 *   - Each series has a default CTA; atoms can override
 *   - In-atom-action atoms get a completion receipt label instead
 */

import type { AtomId, SeriesId, ExitTriggerType } from '@/app/components/atoms/types';
import { ATOM_CATALOG, ATOM_IDS } from '@/app/components/atoms';

// =====================================================================
// TRIGGER TYPE RESOLUTION
// =====================================================================
// Derived from AtomMeta.hasResolution — the single source of truth.
// No duplication of data.

export function getExitTriggerType(atomId: AtomId): ExitTriggerType {
  const meta = ATOM_CATALOG[atomId];
  if (!meta) return 'scene-cta';
  return meta.hasResolution ? 'in-atom-action' : 'scene-cta';
}

// =====================================================================
// SCENE CTA DATA
// =====================================================================
// For atoms that need a CTA, this is the button text.
// Series-level defaults with atom-level overrides.

/** Series-level default CTAs — the baseline for all atoms in that series */
const SERIES_CTA_DEFAULTS: Record<SeriesId, string> = {
  'physics-engines':       'RELEASE',
  'quantum-mechanics':     'COLLAPSE',
  'biomimetic-algorithms': 'LET GROW',
  'via-negativa':          'LET GO',
  'chrono-acoustic':       'LISTEN THROUGH',
  'meta-system-glitch':    'BREAK FREE',
  'retro-causal':          'REWRITE',
  'kinematic-topology':    'SHIFT VIEW',
  'shadow-crucible':       'FACE IT',
  'reality-bender':        'BEND',
  // ── Collection 2 ──
  'epistemic-constructs':  'SEE CLEARLY',
  'friction-mechanics':    'MOVE',
  'semantic-translators':  'TRANSLATE',
  'social-physics':        'CONNECT',
  'time-capsule':          'SEAL IT',
  'soma-perception':       'FEEL IT',
  'diplomat-empathy':      'BRIDGE',
  'visionary-strategist':  'BUILD',
  'mystic-infinite':       'DISSOLVE',
  'omega-integration':     'INTEGRATE',
};

/** Atom-level CTA overrides — only for atoms that need something specific */
const ATOM_CTA_OVERRIDES: Partial<Record<AtomId, string>> = {
  // ── Series 1 ──
  'chrono-kinetic':           'RELEASE TIME',
  'somatic-resonance':        'GROUND',
  'equilibrium':              'BALANCE',
  'thermodynamic':            'COOL DOWN',
  // ── Series 2 ──
  'uncertainty-blur':         'ACCEPT',
  'zero-point-field':         'REST HERE',
  // ── Series 3 ──
  'dormancy':                 'AWAKEN',
  'boids-flocking':           'FLY',
  // ── Series 4 ──
  'sensory-deprivation':      'RETURN',
  'apneic-pause':             'BREATHE',
  'dark-matter':              'EMERGE',
  // ── Series 5 ──
  'vagal-hum':                'HUM THROUGH',
  'brown-noise':              'QUIET',
  'silent-rest':              'REST',
  // ── Series 6 ──
  'fourth-wall-break':        'SEE THROUGH',
  'kernel-panic':             'REBOOT',
  'attention-paywall':        'PAY ATTENTION',
  // ── Series 7 ──
  'forgiveness-filter':       'FORGIVE',
  'ancestral-cut':            'RELEASE LINE',
  // ── Series 8 ──
  'overview-effect':          'ZOOM OUT',
  'vastness-expansion':       'EXPAND',
  'stardust-dissolve':        'DISSOLVE',
  // ── Series 9 ──
  'shadow-hug':               'EMBRACE',
  'inner-child':              'HOLD',
  'phoenix-ash':              'RISE',
  // ── Series 10 ──
  'atmosphere-weather':       'WEATHER IT',
  'pure-yes':                 'YES',
  // ── Series 11 ──
  'centrifuge-engine':        'SPIN CLEAR',
  'blind-spot':               'LOOK AGAIN',
  // ── Series 12 ──
  'inertia-break':            'START',
  'flywheel':                 'KEEP GOING',
  // ── Series 13 ──
  'yet-append':               'ADD YET',
  'silent-mirror':            'REFLECT',
  // ── Series 14 ──
  'forcefield':               'HOLD BOUNDARY',
  'lighthouse':               'SHINE',
  // ── Series 15 ──
  'rage-vault':               'LOCK IT',
  'ten-year-echo':            'SEND FORWARD',
  // ── Series 16 ──
  'skin-map':                 'MAP IT',
  'gut-signal':               'TRUST IT',
  // ── Series 17 ──
  'perspective-swap':         'SWAP',
  'de-escalation':            'SOFTEN',
  // ── Series 18 ──
  'deep-work':                'FOCUS',
  'courage-map':              'STEP FORWARD',
  // ── Series 19 ──
  'cosmic-joke':              'LAUGH',
  'beginners-mind':           'BEGIN AGAIN',
  'wonder-walk':              'WANDER',
  // ── Series 20 ──
  'mirror-of-truth':          'ACCEPT TRUTH',
  'final-exhale':             'EXHALE',
  'atlas-seal':               'SEAL',
};

/**
 * Get the CTA label for an atom that needs a scene CTA.
 * Returns the atom-specific override, or the series default.
 */
export function getSceneCTA(atomId: AtomId): string {
  const override = ATOM_CTA_OVERRIDES[atomId];
  if (override) return override;
  const meta = ATOM_CATALOG[atomId];
  if (!meta) return 'CONTINUE';
  return SERIES_CTA_DEFAULTS[meta.series] ?? 'CONTINUE';
}

// =====================================================================
// IN-ATOM ACTION COMPLETION LABELS
// =====================================================================
// For atoms with in-atom action triggers, these are the receipt labels
// shown when the atom fires onResolve().

const SERIES_COMPLETION_DEFAULTS: Record<SeriesId, string> = {
  'physics-engines':       'RESOLVED',
  'quantum-mechanics':     'COLLAPSED',
  'biomimetic-algorithms': 'GROWN',
  'via-negativa':          'CLEARED',
  'chrono-acoustic':       'TUNED',
  'meta-system-glitch':    'DISRUPTED',
  'retro-causal':          'REWRITTEN',
  'kinematic-topology':    'SHIFTED',
  'shadow-crucible':       'TRANSMUTED',
  'reality-bender':        'BENT',
  // ── Collection 2 ──
  'epistemic-constructs':  'CLARIFIED',
  'friction-mechanics':    'MOVED',
  'semantic-translators':  'TRANSLATED',
  'social-physics':        'CONNECTED',
  'time-capsule':          'SEALED',
  'soma-perception':       'FELT',
  'diplomat-empathy':      'BRIDGED',
  'visionary-strategist':  'BUILT',
  'mystic-infinite':       'DISSOLVED',
  'omega-integration':     'INTEGRATED',
};

/**
 * Get the completion receipt label for an in-atom-action atom.
 */
export function getCompletionLabel(atomId: AtomId): string {
  const meta = ATOM_CATALOG[atomId];
  if (!meta) return 'COMPLETE';
  return SERIES_COMPLETION_DEFAULTS[meta.series] ?? 'COMPLETE';
}

// =====================================================================
// FULL TRIGGER INFO — convenience accessor
// =====================================================================

export interface ExitTriggerInfo {
  type: ExitTriggerType;
  /** For scene-cta: the CTA button label. For in-atom-action: the completion receipt. */
  label: string;
  /** Human-readable description of the trigger mechanism */
  description: string;
}

export function getExitTriggerInfo(atomId: AtomId): ExitTriggerInfo {
  const type = getExitTriggerType(atomId);
  const meta = ATOM_CATALOG[atomId];

  if (type === 'in-atom-action') {
    return {
      type,
      label: getCompletionLabel(atomId),
      description: meta
        ? `User completes the ${meta.name.replace(/^The /, '')} interaction sequence. Atom fires onResolve() to trigger exit.`
        : 'Atom fires onResolve() on completion.',
    };
  }

  return {
    type,
    label: getSceneCTA(atomId),
    description: meta
      ? `No completion arc — scene presents "${getSceneCTA(atomId)}" CTA. ${meta.surfaces.includes('observable') ? 'Time-based progression.' : 'Open-ended interaction.'}`
      : 'Scene presents a CTA button for advancement.',
  };
}

// =====================================================================
// STATS — useful for workspace display
// =====================================================================

export function getExitTriggerStats(): { inAtomAction: number; sceneCta: number } {
  let inAtomAction = 0;
  let sceneCta = 0;
  for (const id of ATOM_IDS) {
    if (getExitTriggerType(id) === 'in-atom-action') inAtomAction++;
    else sceneCta++;
  }
  return { inAtomAction, sceneCta };
}
