/**
 * DELIVERY WORKSPACE
 * ==================
 * The content mapping page — the bridge between atoms and voice.
 *
 * Shows all 200 atoms organized by series, each with:
 *   - Which of the 8 atomic voice slots the atom consumes
 *   - Default gesture (derived from atom surfaces)
 *   - Entrance/exit affinity
 *   - Vocal family mapping
 *   - Worked example status
 *
 * This is NOT the player — it's the tool for mapping IDs to content
 * profiles so they can be persisted to Supabase and refined.
 *
 * ZERO hardcoded hex values. All colors through tokens.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import { withAlpha, workspaceNavAccents } from '../design-center/dc-tokens';

import type {
  VocalFamilyId,
  AtomicVoiceSlot,
  GestureId,
  NarrativeDensity,
} from '@/navicue-types';

import {
  VOCAL_FAMILIES,
  VOCAL_FAMILY_IDS,
  VOICE_LANES,
  COLOR_SIGNATURES,
} from '@/navicue-data';

import type { AtomId, SeriesId, AtomMeta } from '@/app/components/atoms/types';
import {
  ATOM_CATALOG,
  ATOM_IDS,
  SERIES_CATALOG,
} from '@/app/components/atoms';

import { ATOM_CONTENT_PROFILES, getContentProfileStats } from '@/app/data/atom-content-profiles';
import { buildComposition, inputFromVocalFamily } from '@/app/data/composition-engine';
import { getAtomCopyProfile } from '@/app/data/atom-copy-profile';

// ── Constants ─────────────────────────────────────────────────

const ACCENT = workspaceNavAccents.delivery;

const ALL_VOICE_SLOTS: { id: AtomicVoiceSlot; label: string; short: string }[] = [
  { id: 'anchorPrompt', label: 'Anchor Prompt', short: 'AP' },
  { id: 'kineticPayload', label: 'Kinetic Payload', short: 'KP' },
  { id: 'reactiveFriction', label: 'Reactive Friction', short: 'RF' },
  { id: 'ambientSubtext', label: 'Ambient Subtext', short: 'AS' },
  { id: 'metacognitiveTag', label: 'Metacognitive Tag', short: 'MT' },
  { id: 'progressiveSequence', label: 'Progressive Sequence', short: 'PS' },
  { id: 'shadowNode', label: 'Shadow Node', short: 'SN' },
  { id: 'thresholdShift', label: 'Threshold Shift', short: 'TS' },
];

const GESTURE_LABELS: Record<GestureId, string> = {
  tap: 'Tap', hold: 'Hold', drag: 'Drag', swipe: 'Swipe', pinch: 'Pinch', breathe: 'Breathe',
};

const TIER_COLORS = {
  primary: colors.accent.green.primary,
  secondary: colors.brand.purple.light,
  tertiary: colors.accent.cyan.primary,
} as const;

// ── Helpers ───────────────────────────────────────────────────

/** Derive a default gesture from atom surfaces */
function deriveGesture(meta: AtomMeta): GestureId {
  const s = meta.surfaces;
  if (s.includes('holdable')) return 'hold';
  if (s.includes('draggable') || s.includes('drawable')) return 'drag';
  if (s.includes('swipeable')) return 'swipe';
  if (s.includes('pinchable')) return 'pinch';
  if (s.includes('breathable') && s.includes('observable')) return 'breathe';
  if (s.includes('tappable')) return 'tap';
  return 'tap';
}

/** Derive which voice slots an atom likely uses based on its properties */
function deriveVoiceSlots(meta: AtomMeta): AtomicVoiceSlot[] {
  const slots: AtomicVoiceSlot[] = ['anchorPrompt', 'metacognitiveTag'];

  if (meta.hasResolution) {
    slots.push('kineticPayload', 'thresholdShift');
  }

  if (meta.continuous && meta.surfaces.includes('draggable')) {
    slots.push('reactiveFriction');
  } else if (!meta.continuous && meta.surfaces.includes('tappable')) {
    slots.push('progressiveSequence');
  }

  slots.push('ambientSubtext');

  if (meta.hasResolution && meta.surfaces.includes('draggable')) {
    slots.push('shadowNode');
  }

  return slots;
}

/** Get series IDs in order */
function getSeriesIds(): SeriesId[] {
  return Object.keys(SERIES_CATALOG) as SeriesId[];
}

// ── Components ───────────────────────────────────────────────

function VoiceSlotGrid({ slots }: { slots: AtomicVoiceSlot[] }) {
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {ALL_VOICE_SLOTS.map(slot => {
        const active = slots.includes(slot.id);
        return (
          <div
            key={slot.id}
            title={slot.label}
            style={{
              width: 22,
              height: 18,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontFamily: fonts.mono,
              letterSpacing: '0.02em',
              background: active ? withAlpha(ACCENT, 0.15) : withAlpha(colors.neutral.white, 0.03),
              color: active ? ACCENT : withAlpha(colors.neutral.white, 0.15),
              border: `1px solid ${active ? withAlpha(ACCENT, 0.2) : 'rgba(0,0,0,0)'}`,
              transition: 'all 0.2s',
            }}
          >
            {slot.short}
          </div>
        );
      })}
    </div>
  );
}

function FamilyTag({ familyId }: { familyId: VocalFamilyId }) {
  const family = VOCAL_FAMILIES[familyId];
  const tierColor = TIER_COLORS[family.tier];
  return (
    <span
      title={family.goal}
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: 9,
        fontFamily: fonts.mono,
        letterSpacing: '0.03em',
        background: withAlpha(tierColor, 0.1),
        color: withAlpha(tierColor, 0.7),
        border: `1px solid ${withAlpha(tierColor, 0.12)}`,
        whiteSpace: 'nowrap',
      }}
    >
      {family.number}. {family.name}
    </span>
  );
}

function AtomRow({
  atom,
  isSelected,
  onSelect,
}: {
  atom: AtomMeta;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const gesture = deriveGesture(atom);
  const voiceSlots = deriveVoiceSlots(atom);
  const isBuilt = atom.status === 'complete';

  return (
    <motion.div
      layout
      onClick={onSelect}
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        cursor: 'pointer',
        background: isSelected ? withAlpha(ACCENT, 0.06) : 'rgba(0,0,0,0)',
        border: `1px solid ${isSelected ? withAlpha(ACCENT, 0.12) : 'rgba(0,0,0,0)'}`,
        transition: 'background 0.2s, border-color 0.2s',
      }}
      whileHover={{ background: withAlpha(ACCENT, 0.04) }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        {/* Number */}
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: withAlpha(colors.neutral.white, 0.3),
            minWidth: 24,
          }}
        >
          {atom.number}
        </span>

        {/* Name */}
        <span
          style={{
            fontFamily: fonts.primary,
            fontSize: 12,
            color: isSelected ? colors.neutral.white : withAlpha(colors.neutral.white, 0.6),
            flex: 1,
          }}
        >
          {atom.name}
        </span>

        {/* Status dot */}
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: isBuilt
              ? withAlpha(colors.accent.green.primary, 0.5)
              : withAlpha(colors.neutral.white, 0.1),
          }}
          title={isBuilt ? 'Component built' : 'Blueprint only'}
        />

        {/* Gesture badge */}
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            color: withAlpha(colors.neutral.white, 0.3),
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {GESTURE_LABELS[gesture]}
        </span>
      </div>

      {/* Voice slots grid */}
      <VoiceSlotGrid slots={voiceSlots} />
    </motion.div>
  );
}

function AtomDetailPanel({ atomId }: { atomId: AtomId }) {
  const atom = ATOM_CATALOG[atomId];
  const series = SERIES_CATALOG[atom.series];
  const gesture = deriveGesture(atom);
  const voiceSlots = deriveVoiceSlots(atom);

  // Precomputed content profile (from atom-content-profiles.ts)
  const contentProfile = ATOM_CONTENT_PROFILES[atomId];
  // Copy profile (spatial/word-budget constraints)
  const copyProfile = getAtomCopyProfile(atomId);
  // Composition preview
  const [compositionPreview, setCompositionPreview] = useState<string | null>(null);
  // Narrative density override for composition tests
  const [narrativeDensity, setNarrativeDensity] = useState<NarrativeDensity>('core');

  // Determine which vocal families this atom maps well to
  const affineFamilies = useMemo(() => {
    return contentProfile.vocalFamilyAffinity as VocalFamilyId[];
  }, [contentProfile]);

  const handleTestComposition = (familyId: VocalFamilyId) => {
    try {
      const input = inputFromVocalFamily(familyId, atomId, { narrativeDensity });
      const comp = buildComposition(input);
      setCompositionPreview(JSON.stringify({
        id: comp.id,
        layers: {
          diagnostic: comp.diagnosticCore.schemaTarget,
          atmosphere: `${comp.livingAtmosphere.colorSignature} + ${comp.livingAtmosphere.visualEngine}`,
          pulse: comp.pulseMotion.breathPattern,
          persona: comp.persona.voiceLane,
          bookends: `${comp.temporalBookends.entrance} → ${comp.temporalBookends.exit}`,
          hero: `${comp.heroPhysics.atomId} (${comp.heroPhysics.primaryGesture})`,
          voice: comp.atomicVoice.anchorPrompt?.text?.slice(0, 40) ?? '[empty]',
        },
        entranceCopy: comp.entranceCopy?.text?.slice(0, 50) ?? '[none]',
        exitReceipt: comp.exitReceipt?.slice(0, 50) ?? '[none]',
        narrative: comp.narrative ? {
          density: comp.narrative.density,
          collapseModel: comp.narrative.collapseModel,
          hook: comp.narrative.inboundHook?.text?.slice(0, 40) ?? '[none]',
          canopy: comp.narrative.narrativeCanopy?.text?.slice(0, 60) ?? '[none]',
          pill: comp.narrative.semanticPill ? `${comp.narrative.semanticPill.before} → ${comp.narrative.semanticPill.after}` : '[none]',
          ambient: comp.narrative.ambientSubtext?.text ?? '[none]',
          receipt: comp.narrative.outboundReceipt?.text?.slice(0, 40) ?? '[none]',
        } : '[not generated]',
      }, null, 2));
    } catch {
      setCompositionPreview('Error building composition — check console');
    }
  };

  return (
    <motion.div
      key={atomId}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: withAlpha(ACCENT, 0.6),
              letterSpacing: '0.04em',
            }}
          >
            ATOM {atom.number}
          </span>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              color: withAlpha(colors.neutral.white, 0.2),
              letterSpacing: '0.04em',
            }}
          >
            {series.name}
          </span>
        </div>
        <h2
          style={{
            fontFamily: fonts.secondary,
            fontSize: 20,
            color: colors.neutral.white,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {atom.name}
        </h2>
        <p
          style={{
            fontFamily: fonts.primary,
            fontSize: 12,
            color: withAlpha(colors.neutral.white, 0.4),
            margin: '8px 0 0',
            lineHeight: 1.5,
          }}
        >
          {atom.intent}
        </p>
      </div>

      {/* Content Profile */}
      <Section title="CONTENT PROFILE" accent={ACCENT}>
        {/* Voice Slots */}
        <Label>Voice Slots ({voiceSlots.length} of 8)</Label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {ALL_VOICE_SLOTS.map(slot => {
            const active = voiceSlots.includes(slot.id);
            return (
              <div
                key={slot.id}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontFamily: fonts.mono,
                  background: active ? withAlpha(ACCENT, 0.12) : withAlpha(colors.neutral.white, 0.03),
                  color: active ? ACCENT : withAlpha(colors.neutral.white, 0.15),
                  border: `1px solid ${active ? withAlpha(ACCENT, 0.15) : 'rgba(0,0,0,0)'}`,
                }}
              >
                {slot.label}
              </div>
            );
          })}
        </div>

        {/* Mid-Interaction Mode */}
        <Label>Mid-Interaction Mode</Label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['friction', 'sequence', 'none'] as const).map(mode => {
            const isActive =
              mode === 'friction' ? voiceSlots.includes('reactiveFriction') :
              mode === 'sequence' ? voiceSlots.includes('progressiveSequence') :
              !voiceSlots.includes('reactiveFriction') && !voiceSlots.includes('progressiveSequence');
            return (
              <span
                key={mode}
                style={{
                  padding: '3px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontFamily: fonts.mono,
                  background: isActive ? withAlpha(ACCENT, 0.1) : 'rgba(0,0,0,0)',
                  color: isActive ? ACCENT : withAlpha(colors.neutral.white, 0.2),
                  border: `1px solid ${isActive ? withAlpha(ACCENT, 0.12) : withAlpha(colors.neutral.white, 0.05)}`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {mode}
              </span>
            );
          })}
        </div>

        {/* Primary Gesture */}
        <Label>Primary Gesture</Label>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 12,
            color: ACCENT,
            letterSpacing: '0.03em',
          }}
        >
          {GESTURE_LABELS[gesture]}
        </span>
        <span
          style={{
            fontFamily: fonts.primary,
            fontSize: 10,
            color: withAlpha(colors.neutral.white, 0.25),
            marginLeft: 8,
          }}
        >
          (from: {atom.surfaces.join(', ')})
        </span>
      </Section>

      {/* Entrance/Exit Affinity (from precomputed AtomContentProfile) */}
      <Section title="ENTRANCE / EXIT AFFINITY" accent={withAlpha(ACCENT, 0.7)}>
        <Label>Entrance Affinity</Label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {contentProfile.entranceAffinity.map(eId => (
            <span key={eId} style={{
              padding: '2px 6px', borderRadius: 3, fontSize: 9, fontFamily: fonts.mono,
              background: withAlpha(ACCENT, 0.06), color: withAlpha(ACCENT, 0.6),
              letterSpacing: '0.02em',
            }}>
              {eId.replace(/^the-/, '').replace(/-/g, ' ')}
            </span>
          ))}
        </div>
        <Label>Exit Affinity</Label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {contentProfile.exitAffinity.map(xId => (
            <span key={xId} style={{
              padding: '2px 6px', borderRadius: 3, fontSize: 9, fontFamily: fonts.mono,
              background: withAlpha(colors.neutral.white, 0.03), color: withAlpha(colors.neutral.white, 0.35),
              letterSpacing: '0.02em',
            }}>
              {xId}
            </span>
          ))}
        </div>
      </Section>

      {/* Copy Profile (from atom-copy-profile.ts) */}
      <Section title="COPY PROFILE" accent={withAlpha(ACCENT, 0.5)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.12), letterSpacing: '0.04em', marginBottom: 2 }}>anchor zone</div>
            <div style={{ fontFamily: fonts.primary, fontSize: 10, color: withAlpha(colors.neutral.white, 0.35) }}>{copyProfile.anchorZone}</div>
          </div>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.12), letterSpacing: '0.04em', marginBottom: 2 }}>kinetic zone</div>
            <div style={{ fontFamily: fonts.primary, fontSize: 10, color: withAlpha(colors.neutral.white, 0.35) }}>{copyProfile.kineticZone}</div>
          </div>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.12), letterSpacing: '0.04em', marginBottom: 2 }}>anchor words</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: ACCENT, opacity: 0.6 }}>{copyProfile.anchorWordBudget}</div>
          </div>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.12), letterSpacing: '0.04em', marginBottom: 2 }}>kinetic words</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: ACCENT, opacity: 0.6 }}>{copyProfile.kineticWordBudget}</div>
          </div>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.12), letterSpacing: '0.04em', marginBottom: 2 }}>copy weight</div>
            <div style={{ fontFamily: fonts.primary, fontSize: 10, color: withAlpha(colors.neutral.white, 0.35) }}>{copyProfile.copyWeight}</div>
          </div>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 7, color: withAlpha(colors.neutral.white, 0.12), letterSpacing: '0.04em', marginBottom: 2 }}>CTA mode</div>
            <div style={{ fontFamily: fonts.primary, fontSize: 10, color: withAlpha(colors.neutral.white, 0.35) }}>{copyProfile.ctaMode}</div>
          </div>
        </div>
        <div style={{ fontFamily: fonts.primary, fontSize: 9, color: withAlpha(colors.neutral.white, 0.18), lineHeight: 1.4 }}>
          {copyProfile.spatialHint}
        </div>
      </Section>

      {/* Composition Engine Test */}
      <Section title="COMPOSITION ENGINE" accent={colors.accent.cyan.primary}>
        <p style={{ fontFamily: fonts.primary, fontSize: 10, color: withAlpha(colors.neutral.white, 0.25), margin: '0 0 8px' }}>
          Click a vocal family to test buildComposition():
        </p>
        {/* Narrative Density Toggle */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 8, color: withAlpha(colors.neutral.white, 0.2), letterSpacing: '0.08em' }}>
            DENSITY
          </span>
          {(['full', 'core', 'minimal', 'silent'] as NarrativeDensity[]).map(d => (
            <button
              key={d}
              onClick={() => setNarrativeDensity(d)}
              style={{
                padding: '2px 6px', borderRadius: 3, fontSize: 8, fontFamily: fonts.mono,
                letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                background: narrativeDensity === d ? withAlpha(ACCENT, 0.2) : withAlpha(colors.neutral.white, 0.03),
                color: narrativeDensity === d ? withAlpha(ACCENT, 0.8) : withAlpha(colors.neutral.white, 0.2),
                border: `1px solid ${narrativeDensity === d ? withAlpha(ACCENT, 0.25) : withAlpha(colors.neutral.white, 0.05)}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
          {(affineFamilies.length > 0 ? affineFamilies : VOCAL_FAMILY_IDS.slice(0, 3)).map(fId => (
            <button
              key={fId}
              onClick={() => handleTestComposition(fId)}
              style={{
                padding: '3px 8px', borderRadius: 4, fontSize: 9, fontFamily: fonts.mono,
                background: withAlpha(colors.accent.cyan.primary, 0.08),
                color: withAlpha(colors.accent.cyan.primary, 0.6),
                border: `1px solid ${withAlpha(colors.accent.cyan.primary, 0.12)}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {VOCAL_FAMILIES[fId].name}
            </button>
          ))}
        </div>
        {compositionPreview && (
          <motion.pre
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              fontFamily: fonts.mono, fontSize: 8, lineHeight: 1.5,
              color: withAlpha(colors.accent.cyan.primary, 0.4),
              background: withAlpha(colors.neutral.black, 0.3),
              padding: 10, borderRadius: 6, overflow: 'auto', maxHeight: 200,
              border: `1px solid ${withAlpha(colors.accent.cyan.primary, 0.08)}`,
            }}
          >
            {compositionPreview}
          </motion.pre>
        )}
      </Section>

      {/* Atom Physics */}
      <Section title="PHYSICS" accent={withAlpha(colors.neutral.white, 0.15)}>
        <p
          style={{
            fontFamily: fonts.primary,
            fontSize: 11,
            color: withAlpha(colors.neutral.white, 0.35),
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {atom.physics}
        </p>
      </Section>

      {/* Implementation Status */}
      <Section title="STATUS" accent={withAlpha(colors.neutral.white, 0.15)}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              color: atom.status === 'complete'
                ? colors.accent.green.primary
                : withAlpha(colors.neutral.white, 0.3),
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {atom.status}
          </span>
          {atom.implementations.length > 0 && (
            <span
              style={{
                fontFamily: fonts.primary,
                fontSize: 10,
                color: withAlpha(colors.neutral.white, 0.2),
              }}
            >
              Variants: {atom.implementations.join(', ')}
            </span>
          )}
        </div>
      </Section>
    </motion.div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 3,
            height: 12,
            borderRadius: 2,
            background: accent,
          }}
        />
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            color: withAlpha(colors.neutral.white, 0.3),
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: fonts.primary,
        fontSize: 10,
        color: withAlpha(colors.neutral.white, 0.25),
        marginBottom: 4,
        letterSpacing: '0.02em',
      }}
    >
      {children}
    </div>
  );
}

// ── Vocal Families Panel ──────────────────────────────────────

function VocalFamiliesPanel() {
  return (
    <div style={{ padding: '16px 12px' }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          color: withAlpha(colors.neutral.white, 0.3),
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        30 VOCAL FAMILIES
      </div>

      {(['primary', 'secondary', 'tertiary'] as const).map(tier => {
        const tierFamilies = VOCAL_FAMILY_IDS.filter(id => VOCAL_FAMILIES[id].tier === tier);
        const tierColor = TIER_COLORS[tier];
        return (
          <div key={tier} style={{ marginBottom: 16 }}>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 8,
                color: withAlpha(tierColor, 0.5),
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {tier}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tierFamilies.map(fId => {
                const f = VOCAL_FAMILIES[fId];
                const voiceLane = VOICE_LANES[f.voiceAnchor];
                return (
                  <div
                    key={fId}
                    title={f.goal}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'default',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = withAlpha(tierColor, 0.04))}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                  >
                    <span
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 9,
                        color: withAlpha(tierColor, 0.4),
                        minWidth: 16,
                      }}
                    >
                      {f.number}
                    </span>
                    <span
                      style={{
                        fontFamily: fonts.primary,
                        fontSize: 11,
                        color: withAlpha(colors.neutral.white, 0.5),
                        flex: 1,
                      }}
                    >
                      {f.name}
                    </span>
                    <span
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 8,
                        color: withAlpha(colors.neutral.white, 0.2),
                        letterSpacing: '0.04em',
                      }}
                    >
                      {voiceLane.id.slice(0, 4).toUpperCase()}
                    </span>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: COLOR_SIGNATURES[f.colorSignature].primary,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Workspace ────────────────────────────────────────────

export default function DeliveryWorkspace() {
  const [selectedAtom, setSelectedAtom] = useState<AtomId>(ATOM_IDS[0]);
  const [expandedSeries, setExpandedSeries] = useState<SeriesId | null>(
    () => ATOM_CATALOG[ATOM_IDS[0]]?.series ?? null,
  );

  const seriesIds = useMemo(() => getSeriesIds(), []);

  // Stats
  const totalAtoms = ATOM_IDS.length;
  const builtAtoms = ATOM_IDS.filter(id => ATOM_CATALOG[id].status === 'complete').length;

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 52px)',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: Atom List */}
      <div
        style={{
          width: 320,
          minWidth: 320,
          borderRight: `1px solid ${surfaces.glass.subtle}`,
          overflow: 'auto',
          padding: '16px 8px',
        }}
      >
        {/* Stats bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 8px 12px',
            borderBottom: `1px solid ${surfaces.glass.subtle}`,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              color: withAlpha(colors.neutral.white, 0.3),
              letterSpacing: '0.06em',
            }}
          >
            {totalAtoms} ATOMS
          </span>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              color: withAlpha(colors.accent.green.primary, 0.4),
              letterSpacing: '0.06em',
            }}
          >
            {builtAtoms} BUILT
          </span>
        </div>

        {/* Series accordion */}
        {seriesIds.map(seriesId => {
          const series = SERIES_CATALOG[seriesId];
          const isExpanded = expandedSeries === seriesId;
          const seriesAtoms = ATOM_IDS.filter(id => ATOM_CATALOG[id].series === seriesId);
          const hasSelected = ATOM_CATALOG[selectedAtom]?.series === seriesId;

          return (
            <div key={seriesId} style={{ marginBottom: 4 }}>
              {/* Series header */}
              <div
                onClick={() => setExpandedSeries(isExpanded ? null : seriesId)}
                style={{
                  padding: '6px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: hasSelected && !isExpanded ? withAlpha(ACCENT, 0.04) : 'rgba(0,0,0,0)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  if (!hasSelected || isExpanded) {
                    e.currentTarget.style.background = withAlpha(colors.neutral.white, 0.02);
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = hasSelected && !isExpanded
                    ? withAlpha(ACCENT, 0.04) : 'rgba(0,0,0,0)';
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 9,
                    color: withAlpha(ACCENT, 0.4),
                    minWidth: 16,
                  }}
                >
                  {series.number}
                </span>
                <span
                  style={{
                    fontFamily: fonts.primary,
                    fontSize: 11,
                    color: isExpanded
                      ? withAlpha(colors.neutral.white, 0.7)
                      : withAlpha(colors.neutral.white, 0.35),
                    flex: 1,
                  }}
                >
                  {series.subtitle}
                </span>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 8,
                    color: withAlpha(colors.neutral.white, 0.15),
                  }}
                >
                  {seriesAtoms.length}
                </span>
                <span
                  style={{
                    fontSize: 8,
                    color: withAlpha(colors.neutral.white, 0.2),
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  {'›'}
                </span>
              </div>

              {/* Atom list */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden', paddingLeft: 4 }}
                  >
                    {seriesAtoms.map(atomId => (
                      <AtomRow
                        key={atomId}
                        atom={ATOM_CATALOG[atomId]}
                        isSelected={selectedAtom === atomId}
                        onSelect={() => setSelectedAtom(atomId)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* CENTER: Detail Panel */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          borderRight: `1px solid ${surfaces.glass.subtle}`,
        }}
      >
        <AnimatePresence mode="wait">
          <AtomDetailPanel key={selectedAtom} atomId={selectedAtom} />
        </AnimatePresence>
      </div>

      {/* RIGHT: Vocal Families */}
      <div
        style={{
          width: 260,
          minWidth: 260,
          overflow: 'auto',
        }}
      >
        <VocalFamiliesPanel />
      </div>
    </div>
  );
}