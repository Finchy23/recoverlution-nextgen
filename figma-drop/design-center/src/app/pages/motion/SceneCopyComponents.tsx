/**
 * SCENE COPY COMPONENTS
 * =====================
 * Atomic voice copy review layer for the Motion workspace.
 * Browse all 200 atoms × 5 voice lanes — see anchor, kinetic payload,
 * mid-interaction, gesture CTA, threshold shift, and shadow node
 * rendered in the phone preview without loading actual atom components.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import { withAlpha } from '../design-center/dc-tokens';
import {
  VOICE_LANES,
  VOICE_LANE_IDS,
  COLOR_SIGNATURES,
  COLOR_SIGNATURE_IDS,
} from '@/navicue-data';
import type { VoiceLaneId, ColorSignatureId } from '@/navicue-types';

import { getAtomicVoiceCopy } from '../voice/atomic-voice-copy';
import {
  ATOM_CATALOG,
  ATOM_IDS,
  SERIES_CATALOG,
  SERIES_IDS,
  SERIES_COLORS,
} from '@/app/components/atoms';
import type { AtomId, SeriesId, AtomMeta } from '@/app/components/atoms';

// ── Exit Trigger system ─────────────────────────────────────
import {
  getExitTriggerType,
  getExitTriggerInfo,
} from './exit-triggers';

// ── Constants ───────────────────────────────────────────────
const SCENE_COPY_ACCENT = colors.accent.green.primary;

function getAtomsForSeries(seriesId: SeriesId): AtomMeta[] {
  return ATOM_IDS
    .map(id => ATOM_CATALOG[id])
    .filter(a => a && a.series === seriesId);
}

// =====================================================================
// STATE
// =====================================================================

export interface SceneCopyState {
  seriesId: SeriesId;
  atomId: AtomId;
  voiceLane: VoiceLaneId;
  colorSignature: ColorSignatureId;
  scenePhase: 'idle' | 'entering' | 'active' | 'mid-interaction' | 'cta' | 'exit';
  isPlaying: boolean;
}

export const INITIAL_SCENE_COPY_STATE: SceneCopyState = {
  seriesId: 'epistemic-constructs',
  atomId: 'centrifuge-engine',
  voiceLane: 'narrator',
  colorSignature: 'quiet-authority',
  scenePhase: 'idle',
  isPlaying: false,
};

// ── Tiny helpers ────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: fonts.mono, fontSize: 8,
      color: colors.neutral.white, opacity: 0.15,
      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function CopySlotRow({ label, value, color, isMono, isItalic }: {
  label: string; value: string; color: string; isMono?: boolean; isItalic?: boolean;
}) {
  return (
    <div>
      <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
      <div style={{
        fontFamily: isMono ? fonts.mono : fonts.primary,
        fontSize: isMono ? 10 : 11,
        color, opacity: 0.4, lineHeight: 1.5,
        fontStyle: isItalic ? 'italic' : 'normal',
        letterSpacing: isMono ? '0.06em' : 'normal',
      }}>
        {value}
      </div>
    </div>
  );
}

function formatId(id: string): string {
  return id.replace(/^the-/, 'The ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// =====================================================================
// CATALOG (Left Panel) — browse series → atoms
// =====================================================================

function CatalogItem({ label, sublabel, isActive, color, onClick }: {
  label: string; sublabel: string; isActive: boolean; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 8px', borderRadius: 6, border: 'none',
        cursor: 'pointer', textAlign: 'left',
        background: isActive ? withAlpha(color, 0.08) : 'rgba(0,0,0,0)',
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 4, height: 4, borderRadius: '50%',
        background: isActive ? color : surfaces.glass.border,
        opacity: isActive ? 0.8 : 0.15, flexShrink: 0,
      }} />
      <div style={{
        fontFamily: fonts.primary, fontSize: 10,
        color: isActive ? color : colors.neutral.white,
        opacity: isActive ? 0.7 : 0.3, transition: 'all 0.2s',
        flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {label}
      </div>
      <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.08 }}>
        {sublabel}
      </div>
    </button>
  );
}

export function SceneCopyCatalog({
  state,
  onSelectSeries,
  onSelectAtom,
}: {
  state: SceneCopyState;
  onSelectSeries: (id: SeriesId) => void;
  onSelectAtom: (id: AtomId) => void;
}) {
  const [expandedSeries, setExpandedSeries] = useState<SeriesId>(state.seriesId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      <div style={{
        fontFamily: fonts.mono, fontSize: 9,
        color: SCENE_COPY_ACCENT, opacity: 0.4,
        letterSpacing: '0.12em', marginBottom: 6,
      }}>
        SCENE COPY
      </div>
      <div style={{
        fontFamily: fonts.mono, fontSize: 8,
        color: colors.neutral.white, opacity: 0.1, marginBottom: 16,
      }}>
        atomic voice — 20 series — 5 lanes
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SERIES_IDS.map((sId, idx) => {
          const series = SERIES_CATALOG[sId];
          const seriesColor = SERIES_COLORS[sId];
          const atoms = getAtomsForSeries(sId);
          const isExpanded = expandedSeries === sId;

          return (
            <div key={sId}>
              <button
                onClick={() => { setExpandedSeries(sId); onSelectSeries(sId); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  background: isExpanded ? withAlpha(seriesColor, 0.06) : 'rgba(0,0,0,0)',
                  transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: seriesColor, opacity: isExpanded ? 0.7 : 0.2, flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: fonts.primary, fontSize: 10,
                    color: isExpanded ? seriesColor : colors.neutral.white,
                    opacity: isExpanded ? 0.7 : 0.25,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    transition: 'all 0.3s',
                  }}>
                    S{idx + 1}: {series.subtitle}
                  </div>
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.08 }}>
                  {atoms.length}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '4px 0 8px 14px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {atoms.map(atom => (
                        <CatalogItem
                          key={atom.id}
                          label={atom.name.replace(/^The /, '')}
                          sublabel={`#${atom.number}`}
                          isActive={state.atomId === atom.id}
                          color={seriesColor}
                          onClick={() => onSelectAtom(atom.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// =====================================================================
// DEVICE RENDERER — voice copy scene inside the phone
// =====================================================================

export function SceneCopyRenderer({
  state,
  breathAmplitude,
}: {
  state: SceneCopyState;
  breathAmplitude: number;
}) {
  const colorSig = COLOR_SIGNATURES[state.colorSignature];
  const voiceLane = VOICE_LANES[state.voiceLane];
  const copy = getAtomicVoiceCopy(state.atomId, state.voiceLane);
  const atomMeta = ATOM_CATALOG[state.atomId];
  const seriesColor = atomMeta ? SERIES_COLORS[atomMeta.series] : SCENE_COPY_ACCENT;

  const [phase, setPhase] = useState<SceneCopyState['scenePhase']>('idle');

  // ── Resolve exit trigger type for this atom ──
  const triggerType = getExitTriggerType(state.atomId);
  const triggerInfo = getExitTriggerInfo(state.atomId);

  useEffect(() => {
    if (!state.isPlaying) { setPhase('idle'); return; }
    const phases: SceneCopyState['scenePhase'][] = ['entering', 'active', 'mid-interaction', 'cta', 'exit'];
    const durations = [1200, 2000, 2500, 2000, 1500];

    setPhase('entering');
    const timers: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;
    for (let i = 0; i < phases.length; i++) {
      cumulative += durations[i];
      const nextPhase = phases[i + 1];
      if (nextPhase) {
        timers.push(setTimeout(() => setPhase(nextPhase), cumulative));
      }
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [state.isPlaying, state.atomId, state.voiceLane]);

  const isVisible = phase !== 'idle';
  const isActive = phase === 'active' || phase === 'mid-interaction' || phase === 'cta';
  const isMid = phase === 'mid-interaction';
  const isCta = phase === 'cta';
  const isExiting = phase === 'exit';
  const isMono = voiceLane.typographyAffinity === 'mono';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: surfaces.solid.base }}>
      {/* Atmosphere glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 35%, ${colorSig.surface} 0%, rgba(0,0,0,0) 70%)`,
        opacity: isVisible ? 0.5 + breathAmplitude * 0.25 : 0,
        transition: 'opacity 1s ease',
      }} />

      {/* Metacognitive tag — top right HUD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.2 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute', top: 16, right: 14,
          fontFamily: fonts.mono, fontSize: 7,
          color: seriesColor, letterSpacing: '0.1em', zIndex: 10,
        }}
      >
        {copy.metacognitiveTag}
      </motion.div>

      {/* Ambient subtext — peripheral bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible && !isExiting ? 0.12 : 0 }}
        transition={{ duration: 1.2 }}
        style={{
          position: 'absolute', bottom: 11, left: 0, right: 0,
          textAlign: 'center', fontFamily: fonts.secondary,
          fontSize: 8, fontStyle: 'italic',
          color: colors.neutral.white, letterSpacing: '0.04em', zIndex: 10,
        }}
      >
        {copy.ambientSubtext}
      </motion.div>

      {/* Main copy stack */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 28px', zIndex: 5,
      }}>
        {/* Anchor prompt — 18% */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isVisible && !isExiting ? 0.65 : 0, y: isVisible ? 0 : 12 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            position: 'absolute', top: '18%', left: 28, right: 28,
            fontFamily: isMono ? fonts.mono : fonts.secondary,
            fontSize: isMono ? 11 : 14,
            color: colorSig.primary, textAlign: 'center',
            lineHeight: 1.6, letterSpacing: isMono ? '0.05em' : '0.01em',
          }}
        >
          {copy.anchorPrompt}
        </motion.div>

        {/* Kinetic payload — hero at 28%, 16px */}
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div
              key="kinetic"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 0.85, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute', top: '28%', left: 20, right: 20,
                fontFamily: fonts.mono, fontSize: 16,
                color: colorSig.primary, textAlign: 'center',
                letterSpacing: '0.18em', fontWeight: 600,
              }}
            >
              {copy.kineticPayload}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mid-interaction — 48% */}
        <AnimatePresence>
          {(isMid || isCta) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', top: '48%', left: 28, right: 28, textAlign: 'center' }}
            >
              {copy.midInteraction.type === 'friction' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  {[copy.midInteraction.start, copy.midInteraction.mid, copy.midInteraction.max].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isMid ? (i === 0 ? 0.6 : i === 1 ? 0.35 : 0.2) : 0.5 }}
                      transition={{ duration: 0.4, delay: i * 0.3 }}
                      style={{ fontFamily: fonts.mono, fontSize: 10, color: colorSig.primary, letterSpacing: '0.06em' }}
                    >
                      {step}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {copy.midInteraction.steps.map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.15 }}
                      style={{
                        fontFamily: fonts.primary, fontSize: 10, color: colorSig.primary,
                        padding: '3px 8px', borderRadius: 4,
                        background: withAlpha(colorSig.primary, 0.06),
                      }}
                    >
                      {step}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Threshold shift — 62% */}
        <AnimatePresence>
          {(isCta || isExiting) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute', top: '62%', left: 28, right: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}
            >
              <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.35, letterSpacing: '0.08em' }}>
                {copy.thresholdShift.before}
              </div>
              <div style={{ width: 16, height: 1, background: withAlpha(colorSig.primary, 0.3) }} />
              <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colorSig.primary, opacity: 0.6, letterSpacing: '0.08em' }}>
                {copy.thresholdShift.after}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exit trigger at 76% — branched by trigger type */}
        <AnimatePresence>
          {isCta && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              style={{ position: 'absolute', top: '76%', left: 28, right: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              {triggerType === 'scene-cta' ? (
                /* SCENE CTA — explicit button for atoms without completion */
                <div style={{
                  fontFamily: fonts.mono, fontSize: 10,
                  color: colorSig.primary, letterSpacing: '0.14em',
                  padding: '8px 20px', borderRadius: 8,
                  border: `1px solid ${withAlpha(colorSig.primary, 0.25)}`,
                  background: withAlpha(colorSig.primary, 0.06),
                  textAlign: 'center',
                }}>
                  {triggerInfo.label}
                </div>
              ) : (
                /* IN-ATOM ACTION — completion receipt indicator */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    border: `1px solid ${withAlpha(colorSig.primary, 0.3)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: colorSig.primary, opacity: 0.6,
                    }} />
                  </div>
                  <div style={{
                    fontFamily: fonts.mono, fontSize: 8,
                    color: colorSig.primary, opacity: 0.5,
                    letterSpacing: '0.1em',
                  }}>
                    {triggerInfo.label}
                  </div>
                </div>
              )}
              {/* Trigger type micro-label */}
              <div style={{
                fontFamily: fonts.mono, fontSize: 6,
                color: colors.neutral.white, opacity: 0.12,
                letterSpacing: '0.08em',
              }}>
                {triggerType === 'scene-cta' ? 'SCENE CTA' : 'IN-ATOM ACTION'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shadow node */}
        {copy.shadowNode && (isCta || isExiting) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            style={{
              position: 'absolute', top: '86%', left: 28, right: 28,
              fontFamily: fonts.secondary, fontSize: 8, fontStyle: 'italic',
              color: colors.neutral.white, textAlign: 'center', lineHeight: 1.5,
            }}
          >
            {copy.shadowNode}
          </motion.div>
        )}
      </div>

      {/* Phase progress dots */}
      <div style={{
        position: 'absolute', bottom: 24, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 6, zIndex: 10,
      }}>
        {(['entering', 'active', 'mid-interaction', 'cta', 'exit'] as const).map((p, i) => {
          const phaseOrder: Record<string, number> = { idle: -1, entering: 0, active: 1, 'mid-interaction': 2, cta: 3, exit: 4 };
          const current = phaseOrder[phase] ?? -1;
          return (
            <div
              key={p}
              style={{
                width: 14, height: 3, borderRadius: 2,
                background: current >= i ? colorSig.primary : withAlpha(colors.neutral.white, 0.06),
                opacity: current >= i ? 0.6 : 1,
                transition: 'all 0.4s ease',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// CONTROLS (Right Panel) — voice lane, color, copy slot breakdown
// =====================================================================

export function SceneCopyControls({
  state,
  onChange,
  onPlay,
}: {
  state: SceneCopyState;
  onChange: (s: SceneCopyState) => void;
  onPlay: () => void;
}) {
  const copy = getAtomicVoiceCopy(state.atomId, state.voiceLane);
  const atomMeta = ATOM_CATALOG[state.atomId];
  const seriesColor = atomMeta ? SERIES_COLORS[atomMeta.series] : SCENE_COPY_ACCENT;
  const colorSig = COLOR_SIGNATURES[state.colorSignature];

  // ── Resolve exit trigger ──
  const triggerType = getExitTriggerType(state.atomId);
  const triggerInfo = getExitTriggerInfo(state.atomId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      {/* Play */}
      <button
        onClick={onPlay}
        style={{
          width: '100%', padding: '10px 0', borderRadius: 8,
          border: `1px solid ${withAlpha(SCENE_COPY_ACCENT, 0.2)}`,
          background: state.isPlaying ? withAlpha(SCENE_COPY_ACCENT, 0.1) : 'rgba(0,0,0,0)',
          color: SCENE_COPY_ACCENT, fontFamily: fonts.mono,
          fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all 0.3s', opacity: 0.7,
        }}
      >
        {state.isPlaying ? 'playing scene...' : 'play scene copy'}
      </button>

      {/* Active atom */}
      <div>
        <SectionLabel>active atom</SectionLabel>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.atomId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ fontFamily: fonts.secondary, fontSize: 14, color: seriesColor, opacity: 0.75, marginBottom: 2 }}>
              {atomMeta?.name ?? formatId(state.atomId)}
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.15, marginTop: 2 }}>
              #{atomMeta?.number} — {atomMeta?.series ? SERIES_CATALOG[atomMeta.series]?.subtitle : ''}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Voice lane */}
      <div>
        <SectionLabel>voice lane</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {VOICE_LANE_IDS.map(v => {
            const isActive = state.voiceLane === v;
            return (
              <button
                key={v}
                onClick={() => onChange({ ...state, voiceLane: v, isPlaying: false })}
                style={{
                  padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontFamily: fonts.primary, fontSize: 10,
                  color: isActive ? SCENE_COPY_ACCENT : colors.neutral.white,
                  opacity: isActive ? 0.65 : 0.25,
                  background: isActive ? withAlpha(SCENE_COPY_ACCENT, 0.08) : 'rgba(0,0,0,0)',
                  transition: 'all 0.3s',
                }}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color signature */}
      <div>
        <SectionLabel>color signature</SectionLabel>
        <div style={{ display: 'grid', gap: 3 }}>
          {COLOR_SIGNATURE_IDS.map(csId => {
            const cs = COLOR_SIGNATURES[csId];
            const isActive = state.colorSignature === csId;
            return (
              <button
                key={csId}
                onClick={() => onChange({ ...state, colorSignature: csId })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 10px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                  background: isActive ? surfaces.glass.light : 'rgba(0,0,0,0)',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: 3, background: cs.primary, flexShrink: 0 }} />
                <div style={{ fontFamily: fonts.primary, fontSize: 10, color: colors.neutral.white, opacity: isActive ? 0.6 : 0.25, transition: 'opacity 0.2s' }}>
                  {cs.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Copy slot breakdown */}
      <div>
        <SectionLabel>copy slots</SectionLabel>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${state.atomId}-${state.voiceLane}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <CopySlotRow label="metacognitive tag" value={copy.metacognitiveTag} color={seriesColor} />
            <CopySlotRow label="anchor prompt" value={copy.anchorPrompt} color={colorSig.primary} />
            <CopySlotRow label="kinetic payload" value={copy.kineticPayload} color={colorSig.primary} isMono />
            <CopySlotRow
              label="mid-interaction"
              value={copy.midInteraction.type === 'friction'
                ? `${copy.midInteraction.start} \u2192 ${copy.midInteraction.mid} \u2192 ${copy.midInteraction.max}`
                : copy.midInteraction.steps.join(' \u2192 ')}
              color={colors.neutral.white}
            />
            <CopySlotRow label="voice gesture label" value={copy.gestureLabel} color={colors.neutral.white} isMono />
            <CopySlotRow label="threshold" value={`${copy.thresholdShift.before} \u2192 ${copy.thresholdShift.after}`} color={colors.neutral.white} />
            <CopySlotRow label="ambient" value={copy.ambientSubtext} color={colors.neutral.white} isItalic />
            {copy.shadowNode && <CopySlotRow label="shadow node" value={copy.shadowNode} color={colors.neutral.white} isItalic />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit trigger — independent from voice copy */}
      <div>
        <SectionLabel>exit trigger</SectionLabel>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.atomId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {/* Trigger type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                padding: '3px 8px', borderRadius: 4,
                background: withAlpha(
                  triggerType === 'in-atom-action' ? colors.brand.purple.light : SCENE_COPY_ACCENT,
                  0.1,
                ),
                fontFamily: fonts.mono, fontSize: 9,
                color: triggerType === 'in-atom-action' ? colors.brand.purple.light : SCENE_COPY_ACCENT,
                opacity: 0.7, letterSpacing: '0.06em',
              }}>
                {triggerType === 'in-atom-action' ? 'IN-ATOM ACTION' : 'SCENE CTA'}
              </div>
            </div>

            {/* Trigger label */}
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.04em', marginBottom: 2 }}>
                {triggerType === 'scene-cta' ? 'cta label' : 'completion receipt'}
              </div>
              <div style={{
                fontFamily: fonts.mono, fontSize: 12,
                color: triggerType === 'in-atom-action' ? colors.brand.purple.light : SCENE_COPY_ACCENT,
                opacity: 0.6, letterSpacing: '0.1em',
              }}>
                {triggerInfo.label}
              </div>
            </div>

            {/* Description */}
            <div style={{
              fontFamily: fonts.primary, fontSize: 10,
              color: colors.neutral.white, opacity: 0.18,
              lineHeight: 1.5,
            }}>
              {triggerInfo.description}
            </div>

            {/* hasResolution source indicator */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{
                fontFamily: fonts.mono, fontSize: 7,
                color: colors.neutral.white, opacity: 0.08,
              }}>
                hasResolution: {atomMeta?.hasResolution ? 'true' : 'false'}
              </div>
              <div style={{
                fontFamily: fonts.mono, fontSize: 7,
                color: colors.neutral.white, opacity: 0.08,
              }}>
                surfaces: {atomMeta?.surfaces.join(', ')}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// =====================================================================
// MODE TOGGLE
// =====================================================================

export type WorkspaceMode = 'motion' | 'scene-copy';

export function WorkspaceModeToggle({ mode, onToggle }: { mode: WorkspaceMode; onToggle: (m: WorkspaceMode) => void }) {
  const ENTRANCE_ACCENT = colors.brand.purple.light;
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3, borderRadius: 8,
      background: withAlpha(colors.neutral.white, 0.03),
    }}>
      {([
        { id: 'motion' as const, label: 'Entrance / Exit' },
        { id: 'scene-copy' as const, label: 'Scene Copy' },
      ]).map(tab => {
        const isActive = mode === tab.id;
        const accent = tab.id === 'motion' ? ENTRANCE_ACCENT : SCENE_COPY_ACCENT;
        return (
          <button
            key={tab.id}
            onClick={() => onToggle(tab.id)}
            style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.06em',
              color: isActive ? accent : colors.neutral.white,
              opacity: isActive ? 0.7 : 0.2,
              background: isActive ? withAlpha(accent, 0.08) : 'rgba(0,0,0,0)',
              transition: 'all 0.3s',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}