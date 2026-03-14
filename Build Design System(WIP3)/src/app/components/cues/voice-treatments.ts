/**
 * VOICE TREATMENTS — The Typographic Palette
 *
 * Each atom has a unique typographic personality — a "treatment"
 * that determines how its copy appears on the glass.
 *
 * Without this, every scene sounds the same: centered italic serif.
 * With it, the system has genuine range. A composition can pull
 * from whispers, monoliths, fragments, and observations —
 * and they all fit because they all speak from the same glass.
 *
 * ═══════════════════════════════════════════════════════
 * THE EIGHT VOICES
 * ═══════════════════════════════════════════════════════
 *
 * KOAN        — Centered contemplative. Spacious. A question held.
 * WHISPER     — Peripheral, subliminal. Almost not there.
 * MONOLITH    — Large, stark, singular. One phrase fills the space.
 * SCATTERED   — Fragmented across the glass. Dreamlike.
 * SOMATIC     — Left-anchored, instructional. The body speaks.
 * ATMOSPHERIC — Text as texture. Ultra-large, ultra-light. Environment.
 * CLINICAL    — Small, precise, data-like. Observational.
 * ORGANIC     — Natural reading flow. Like opening a book.
 *
 * ════════��══════════════════════════════════════════════
 * THE ATOM MAP
 * ═══════════════════════════════════════════════════════
 *
 * The treatment is determined by the atom, not the composition.
 * This means the same atom always speaks in its own voice,
 * regardless of which composition it appears in.
 * The composition's rhythm comes from sequencing different voices.
 */

import {
  font, weight, tracking, leading, typeSize, opacity, room,
} from '../design-system/surface-tokens';

// ─── CSS Shorthand ───

type CSSProps = Record<string, string | number | undefined>;

// ─── Treatment Types ───

export type CopyTreatment =
  | 'koan'         // Centered contemplative — questions held in space
  | 'whisper'      // Peripheral subliminal — almost not there
  | 'monolith'     // Large stark singular — one phrase, the whole glass
  | 'scattered'    // Fragmented dreamlike — words at different positions
  | 'somatic'      // Left-anchored embodied — the body speaks
  | 'atmospheric'  // Text as environment — ultra-light, ultra-large
  | 'clinical'     // Small precise data-like — observational
  | 'organic';     // Natural reading flow — like opening a book

// ─── Treatment Metadata ───

export interface TreatmentMeta {
  id: CopyTreatment;
  label: string;
  essence: string;
  character: string;
  color: string;
}

export const TREATMENT_META: TreatmentMeta[] = [
  {
    id: 'koan',
    label: 'Koan',
    essence: 'A question held in space.',
    character: 'Centered, contemplative, spacious. The classic glass voice. Serif italic, generous leading. The text floats in the center of the viewport with nothing around it. Just the question and the dark.',
    color: '#A89070',
  },
  {
    id: 'whisper',
    label: 'Whisper',
    essence: 'Almost not there.',
    character: 'Peripheral, subliminal. Text appears at the edges of the viewport at near invisible opacity. The person may not consciously read it. The nervous system registers it anyway.',
    color: '#504B46',
  },
  {
    id: 'monolith',
    label: 'Monolith',
    essence: 'One phrase fills the glass.',
    character: 'Large, stark, singular. The text takes up most of the viewport width. Light weight, tight leading. There is nowhere else to look. The simplicity is the point.',
    color: '#5A4A28',
  },
  {
    id: 'scattered',
    label: 'Scattered',
    essence: 'Words at different positions.',
    character: 'Fragmented, dreamlike. The canopy text splits into separate phrases at different positions and opacities on the glass. Nothing is centered. Nothing is aligned. The reading path is the person\'s own.',
    color: '#5A46B4',
  },
  {
    id: 'somatic',
    label: 'Somatic',
    essence: 'The body speaks.',
    character: 'Left anchored, instructional, grounded. Text aligns to the left third of the viewport. The left edge creates a vertical anchor. A spine. Reading flows down naturally. The voice is embodied, not ethereal.',
    color: '#6488C0',
  },
  {
    id: 'atmospheric',
    label: 'Atmospheric',
    essence: 'Text as environment.',
    character: 'Ultra large, ultra light weight, extreme letter spacing, near invisible opacity. The canopy text becomes part of the visual field. Texture, not content. Only the gesture is legible. The rest is felt.',
    color: '#5A3C78',
  },
  {
    id: 'clinical',
    label: 'Clinical',
    essence: 'Observation, not instruction.',
    character: 'Small, precise, monospace. Anchored to the top left. The voice of a field note. Observational, not emotional. Tight leading, compact. The text watches alongside you.',
    color: '#3A2A64',
  },
  {
    id: 'organic',
    label: 'Organic',
    essence: 'Like opening a book.',
    character: 'Serif at reading size, natural left alignment with ragged edge. Body line height. The voice of prose. Warm, unhurried, conversational. Not centered, not designed. Just words.',
    color: '#2A5A2A',
  },
];

export function getTreatmentMeta(id: CopyTreatment): TreatmentMeta {
  return TREATMENT_META.find(t => t.id === id)!;
}

// ─── Atom → Treatment Map ───

export const ATOM_TREATMENT_MAP: Record<string, CopyTreatment> = {
  // KOAN — centered contemplative
  'still-point':       'koan',
  'tidal-breath':      'koan',

  // WHISPER — peripheral subliminal
  'dark-matter':       'whisper',
  'pendulum-rest':     'whisper',

  // MONOLITH — large stark singular
  'threshold':         'monolith',
  'weight-release':    'monolith',

  // SCATTERED — fragmented dreamlike
  'dissolve':          'scattered',
  'wave-collapse':     'scattered',

  // SOMATIC — left-anchored embodied
  'somatic-resonance': 'somatic',
  'mirror-breath':     'somatic',

  // ATMOSPHERIC — text as environment
  'cymatic-coherence': 'atmospheric',
  'phoenix-ash':       'atmospheric',

  // CLINICAL — small precise observational
  'signal-fire':       'clinical',
  'ember-grid':        'clinical',

  // ORGANIC — natural reading flow
  'root-pulse':        'organic',
  'mycelial-routing':  'organic',
  'future-memory':     'organic',
};

export function getAtomTreatment(atomId: string): CopyTreatment {
  return ATOM_TREATMENT_MAP[atomId] ?? 'koan';
}

// ─── Typography Per Treatment ───

export interface TreatmentTypography {
  canopy: CSSProps;
  gesture: CSSProps;
  receipt: CSSProps;
}

/** Position config for each copy layer */
export interface TreatmentLayout {
  canopy: CSSProps;
  gesture: CSSProps;
  receipt: CSSProps;
}

export function getTreatmentTypography(treatment: CopyTreatment): TreatmentTypography {
  switch (treatment) {
    case 'koan':
      return {
        canopy: {
          fontFamily: font.serif,
          fontSize: 'clamp(18px, 5vw, 26px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          lineHeight: leading.generous,
          letterSpacing: tracking.hair,
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.voice,
        },
        gesture: {
          fontFamily: font.sans,
          fontSize: typeSize.detail,
          fontWeight: weight.medium,
          letterSpacing: tracking.normal,
          textTransform: 'uppercase',
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.steady,
        },
        receipt: {
          fontFamily: font.serif,
          fontSize: typeSize.reading,
          fontWeight: weight.light,
          fontStyle: 'italic',
          letterSpacing: tracking.hair,
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.spoken,
        },
      };

    case 'whisper':
      return {
        canopy: {
          fontFamily: font.sans,
          fontSize: typeSize.caption,
          fontWeight: weight.regular,
          letterSpacing: tracking.wide,
          textTransform: 'uppercase',
          lineHeight: leading.relaxed,
          color: room.fg,
          textAlign: 'right',
          opacity: opacity.ambient,
        },
        gesture: {
          fontFamily: font.sans,
          fontSize: typeSize.label,
          fontWeight: weight.medium,
          letterSpacing: tracking.breath,
          textTransform: 'uppercase',
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.gentle,
        },
        receipt: {
          fontFamily: font.serif,
          fontSize: typeSize.caption,
          fontWeight: weight.light,
          fontStyle: 'italic',
          letterSpacing: tracking.wide,
          color: room.fg,
          textAlign: 'right',
          opacity: opacity.emerging,
        },
      };

    case 'monolith':
      return {
        canopy: {
          fontFamily: font.serif,
          fontSize: 'clamp(24px, 7vw, 38px)',
          fontWeight: weight.light,
          lineHeight: leading.tight,
          letterSpacing: tracking.tight_neg,
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.clear,
        },
        gesture: {
          fontFamily: font.sans,
          fontSize: typeSize.note,
          fontWeight: weight.medium,
          letterSpacing: tracking.spread,
          textTransform: 'uppercase',
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.steady,
        },
        receipt: {
          fontFamily: font.serif,
          fontSize: 'clamp(18px, 5vw, 28px)',
          fontWeight: weight.light,
          lineHeight: leading.snug,
          letterSpacing: tracking.data,
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.strong,
        },
      };

    case 'scattered':
      return {
        canopy: {
          fontFamily: font.serif,
          fontSize: 'clamp(14px, 3.8vw, 20px)',
          fontWeight: weight.regular,
          lineHeight: leading.relaxed,
          letterSpacing: tracking.hair,
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.voice,
        },
        gesture: {
          fontFamily: font.sans,
          fontSize: typeSize.label,
          fontWeight: weight.medium,
          letterSpacing: tracking.normal,
          textTransform: 'uppercase',
          color: room.fg,
          textAlign: 'right',
          opacity: opacity.steady,
        },
        receipt: {
          fontFamily: font.serif,
          fontSize: typeSize.small,
          fontWeight: weight.light,
          fontStyle: 'italic',
          letterSpacing: tracking.body,
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.spoken,
        },
      };

    case 'somatic':
      return {
        canopy: {
          fontFamily: font.serif,
          fontSize: 'clamp(16px, 4.2vw, 22px)',
          fontWeight: weight.regular,
          lineHeight: leading.body,
          letterSpacing: tracking.body,
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.body,
        },
        gesture: {
          fontFamily: font.sans,
          fontSize: typeSize.note,
          fontWeight: weight.medium,
          letterSpacing: tracking.shelf,
          textTransform: 'uppercase',
          color: room.fg,
          textAlign: 'left',
          paddingLeft: '2%',
          opacity: opacity.steady,
        },
        receipt: {
          fontFamily: font.serif,
          fontSize: typeSize.lede,
          fontWeight: weight.light,
          fontStyle: 'italic',
          letterSpacing: tracking.hair,
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.spoken,
        },
      };

    case 'atmospheric':
      return {
        canopy: {
          fontFamily: font.serif,
          fontSize: 'clamp(24px, 7vw, 42px)',
          fontWeight: weight.light,
          lineHeight: leading.tight,
          letterSpacing: tracking.wide,
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.trace,
          textTransform: 'uppercase',
          wordBreak: 'break-word' as const,
        },
        gesture: {
          fontFamily: font.sans,
          fontSize: typeSize.caption,
          fontWeight: weight.medium,
          letterSpacing: tracking.normal,
          textTransform: 'uppercase',
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.steady,
        },
        receipt: {
          fontFamily: font.serif,
          fontSize: 'clamp(18px, 5.5vw, 32px)',
          fontWeight: weight.light,
          lineHeight: leading.snug,
          letterSpacing: tracking.spread,
          color: room.fg,
          textAlign: 'center',
          opacity: opacity.murmur,
          textTransform: 'uppercase',
        },
      };

    case 'clinical':
      return {
        canopy: {
          fontFamily: font.mono,
          fontSize: typeSize.note,
          fontWeight: weight.regular,
          lineHeight: leading.firm,
          letterSpacing: tracking.code,
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.body,
        },
        gesture: {
          fontFamily: font.mono,
          fontSize: typeSize.caption,
          fontWeight: weight.medium,
          letterSpacing: tracking.data,
          textTransform: 'uppercase',
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.steady,
        },
        receipt: {
          fontFamily: font.mono,
          fontSize: typeSize.note,
          fontWeight: weight.regular,
          letterSpacing: tracking.code,
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.spoken,
        },
      };

    case 'organic':
      return {
        canopy: {
          fontFamily: font.serif,
          fontSize: 'clamp(15px, 4vw, 19px)',
          fontWeight: weight.regular,
          lineHeight: leading.reading,
          letterSpacing: tracking.body,
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.warm,
        },
        gesture: {
          fontFamily: font.sans,
          fontSize: typeSize.small,
          fontWeight: weight.regular,
          letterSpacing: tracking.label,
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.steady,
        },
        receipt: {
          fontFamily: font.serif,
          fontSize: typeSize.prose,
          fontWeight: weight.light,
          fontStyle: 'italic',
          lineHeight: leading.body,
          letterSpacing: tracking.hair,
          color: room.fg,
          textAlign: 'left',
          opacity: opacity.spoken,
        },
      };
  }
}

export function getTreatmentLayout(treatment: CopyTreatment): TreatmentLayout {
  switch (treatment) {
    case 'koan':
      return {
        canopy: {
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          padding: '0 10%',
          paddingBottom: '18%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        gesture: {
          position: 'absolute',
          bottom: '24%', left: 0, right: 0,
          padding: '0 10%',
          display: 'flex', justifyContent: 'center',
        },
        receipt: {
          position: 'absolute',
          bottom: '12%', left: 0, right: 0,
          padding: '0 10%',
          display: 'flex', justifyContent: 'center',
        },
      };
    case 'whisper':
      return {
        canopy: {
          position: 'absolute',
          top: '12%', right: '8%',
          maxWidth: '50%',
          padding: 0,
        },
        gesture: {
          position: 'absolute',
          bottom: '28%', left: '8%',
          maxWidth: '45%',
          padding: 0,
        },
        receipt: {
          position: 'absolute',
          bottom: '12%', right: '8%',
          maxWidth: '50%',
          padding: 0,
        },
      };
    case 'monolith':
      return {
        canopy: {
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          padding: '0 5%',
          paddingBottom: '22%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        gesture: {
          position: 'absolute',
          bottom: '16%', left: 0, right: 0,
          padding: '0 5%',
          display: 'flex', justifyContent: 'center',
        },
        receipt: {
          position: 'absolute',
          bottom: '6%', left: 0, right: 0,
          padding: '0 5%',
          display: 'flex', justifyContent: 'center',
        },
      };
    case 'scattered':
      return {
        canopy: {
          position: 'absolute',
          top: '18%', left: '8%',
          maxWidth: '55%',
          padding: 0,
        },
        gesture: {
          position: 'absolute',
          top: '50%', right: '8%',
          maxWidth: '45%',
          padding: 0,
        },
        receipt: {
          position: 'absolute',
          bottom: '18%', left: '15%', right: '15%',
          padding: 0,
          display: 'flex', justifyContent: 'center',
        },
      };
    case 'somatic':
      return {
        canopy: {
          position: 'absolute',
          top: '22%', left: '10%',
          maxWidth: '70%',
          padding: 0,
        },
        gesture: {
          position: 'absolute',
          top: '52%', left: '10%',
          maxWidth: '60%',
          padding: 0,
        },
        receipt: {
          position: 'absolute',
          bottom: '20%', left: '10%',
          maxWidth: '65%',
          padding: 0,
        },
      };
    case 'atmospheric':
      return {
        canopy: {
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          padding: '0 6%',
          paddingBottom: '24%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        gesture: {
          position: 'absolute',
          bottom: '18%', left: 0, right: 0,
          padding: '0 10%',
          display: 'flex', justifyContent: 'center',
        },
        receipt: {
          position: 'absolute',
          bottom: '5%', left: 0, right: 0,
          padding: '0 8%',
          display: 'flex', justifyContent: 'center',
        },
      };
    case 'clinical':
      return {
        canopy: {
          position: 'absolute',
          top: '14%', left: '10%',
          maxWidth: '70%',
          padding: 0,
        },
        gesture: {
          position: 'absolute',
          top: '48%', left: '10%',
          maxWidth: '60%',
          padding: 0,
        },
        receipt: {
          position: 'absolute',
          bottom: '20%', left: '10%',
          maxWidth: '65%',
          padding: 0,
        },
      };
    case 'organic':
      return {
        canopy: {
          position: 'absolute',
          top: '20%', left: '12%',
          maxWidth: '72%',
          padding: 0,
        },
        gesture: {
          position: 'absolute',
          top: '52%', left: '12%',
          maxWidth: '60%',
          padding: 0,
        },
        receipt: {
          position: 'absolute',
          bottom: '18%', left: '12%',
          maxWidth: '65%',
          padding: 0,
        },
      };
  }
}

// ─── All treatments ───

export const ALL_TREATMENTS: CopyTreatment[] = [
  'koan', 'whisper', 'monolith', 'scattered',
  'somatic', 'atmospheric', 'clinical', 'organic',
];

/** Get atoms that use a given treatment */
export function getAtomsForTreatment(treatment: CopyTreatment): string[] {
  return Object.entries(ATOM_TREATMENT_MAP)
    .filter(([, t]) => t === treatment)
    .map(([atomId]) => atomId);
}