/**
 * MOTION COMPOSITION WORKSPACE
 * ============================
 * Layer 5: Temporal Bookends — Entrance Architectures, Exit Transitions,
 * Materializations, and Motion Curves.
 *
 * Layout (desktop):
 *   ┌───────────────┬──────────────┬──────────────────────┐
 *   │ MOTION CATALOG│   DEVICE     │  COMPOSITION         │
 *   │ 8 entrances   │   MIRROR     │  CONTROLS            │
 *   │ 4 exits       │  (preview)   │  entrance · exit ·   │
 *   │ 4 materials   │              │  curve · timing      │
 *   │ 3 curves      │              │                      │
 *   └───────────────┴──────────────┴──────────────────────┘
 *
 * Select an entrance. Pair with an exit. Watch it choreograph in context.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import {
  layout,
  withAlpha,
  atomsLayout,
  sectionAccents,
  workspaceSectionAccents,
} from '../design-center/dc-tokens';
import { useDeviceMirror, DeviceMirror } from '../design-center/components/DeviceMirror';
import { useBreathEngine } from '../design-center/hooks/useBreathEngine';
import type { BreathPattern } from '../design-center/hooks/useBreathEngine';

// ── NaviCue data ────────────────────────────────────────────
import {
  ENTRANCES,
  ENTRANCE_IDS,
  EXITS,
  EXIT_IDS,
  MATERIALIZATIONS,
  MOTION_CURVES,
  ENTRANCE_COPY,
  EXIT_COPY,
  VOICE_LANES,
  VOICE_LANE_IDS,
  COLOR_SIGNATURES,
  COLOR_SIGNATURE_IDS,
} from '@/navicue-data';

import type {
  EntranceArchitectureId,
  ExitTransitionId,
  MaterializationId,
  MotionCurveId,
  VoiceLaneId,
  ColorSignatureId,
} from '@/navicue-types';

// ── Scene Copy components (separate file) ───────────────────
import {
  SceneCopyCatalog,
  SceneCopyRenderer,
  SceneCopyControls,
  WorkspaceModeToggle,
  INITIAL_SCENE_COPY_STATE,
} from './SceneCopyComponents';
import type { SceneCopyState, WorkspaceMode } from './SceneCopyComponents';

// ── Atom data (used for series→atom selection) ──────────────
import { ATOM_CATALOG, ATOM_IDS } from '@/app/components/atoms';

// =====================================================================
// COMPOSITION STATE
// =====================================================================

// ── Section accent palette (derived from data layer color signatures) ──
const SECTION_ACCENTS = workspaceSectionAccents.motion;

interface MotionCompositionState {
  entranceId: EntranceArchitectureId;
  exitId: ExitTransitionId;
  materializationId: MaterializationId;
  motionCurve: MotionCurveId;
  voiceLane: VoiceLaneId;
  colorSignature: ColorSignatureId;
  breathPattern: BreathPattern;
  /** Whether we're currently playing the entrance preview */
  isPlaying: boolean;
  /** Current playback phase */
  playbackPhase: 'idle' | 'entrance' | 'active' | 'exit' | 'complete';
}

const INITIAL_STATE: MotionCompositionState = {
  entranceId: 'the-silence',
  exitId: 'dissolve',
  materializationId: 'emerge',
  motionCurve: 'arrival',
  voiceLane: 'narrator',
  colorSignature: 'quiet-authority',
  breathPattern: 'calm',
  isPlaying: false,
  playbackPhase: 'idle',
};

const BREATH_PATTERNS: { id: BreathPattern; label: string }[] = [
  { id: 'calm', label: 'Calm' },
  { id: 'simple', label: 'Simple' },
  { id: 'energize', label: 'Energize' },
  { id: 'box', label: 'Box' },
];

// =====================================================================
// ENTRANCE CATALOG (Left Panel)
// =====================================================================

type CatalogSection = 'entrances' | 'exits' | 'materializations' | 'curves';

function MotionCatalog({
  state,
  onSelectEntrance,
  onSelectExit,
  onSelectMaterialization,
  onSelectCurve,
}: {
  state: MotionCompositionState;
  onSelectEntrance: (id: EntranceArchitectureId) => void;
  onSelectExit: (id: ExitTransitionId) => void;
  onSelectMaterialization: (id: MaterializationId) => void;
  onSelectCurve: (id: MotionCurveId) => void;
}) {
  const [expandedSection, setExpandedSection] = useState<CatalogSection>('entrances');

  const sections: { id: CatalogSection; label: string; count: number; color: string }[] = [
    { id: 'entrances', label: 'Entrance Architectures', count: ENTRANCE_IDS.length, color: SECTION_ACCENTS.entrance },
    { id: 'exits', label: 'Exit Transitions', count: EXIT_IDS.length, color: SECTION_ACCENTS.exit },
    { id: 'materializations', label: 'Materializations', count: 4, color: SECTION_ACCENTS.materialization },
    { id: 'curves', label: 'Motion Curves', count: 3, color: SECTION_ACCENTS.curve },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      {/* Header */}
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 9,
        color: colors.neutral.white,
        opacity: 0.15,
        letterSpacing: '0.12em',
        marginBottom: 6,
      }}>
        MOTION LIBRARY
      </div>
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 8,
        color: colors.neutral.white,
        opacity: 0.1,
        marginBottom: 16,
      }}>
        layer 5 temporal bookends
      </div>

      {/* Section accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map(section => {
          const isExpanded = expandedSection === section.id;

          return (
            <div key={section.id}>
              {/* Section header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? expandedSection : section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isExpanded ? withAlpha(section.color, 0.06) : 'rgba(0,0,0,0)',
                  textAlign: 'left',
                  transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: section.color,
                  opacity: isExpanded ? 0.7 : 0.25,
                  flexShrink: 0,
                  transition: 'opacity 0.3s',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: fonts.primary,
                    fontSize: 11,
                    color: isExpanded ? section.color : colors.neutral.white,
                    opacity: isExpanded ? 0.7 : 0.3,
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {section.label}
                  </div>
                </div>
                <div style={{
                  fontFamily: fonts.mono,
                  fontSize: 8,
                  color: colors.neutral.white,
                  opacity: 0.1,
                }}>
                  {section.count}
                </div>
              </button>

              {/* Items */}
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
                      {section.id === 'entrances' && ENTRANCE_IDS.map(id => {
                        const spec = ENTRANCES[id];
                        const isActive = state.entranceId === id;
                        return (
                          <CatalogItem
                            key={id}
                            label={formatId(id)}
                            sublabel={spec.requiresUserAction ? 'interactive' : `${spec.durationMs}ms`}
                            isActive={isActive}
                            color={section.color}
                            onClick={() => onSelectEntrance(id)}
                          />
                        );
                      })}
                      {section.id === 'exits' && EXIT_IDS.map(id => {
                        const spec = EXITS[id];
                        const isActive = state.exitId === id;
                        return (
                          <CatalogItem
                            key={id}
                            label={formatId(id)}
                            sublabel={spec.durationMs > 0 ? `${spec.durationMs}ms` : 'instant'}
                            isActive={isActive}
                            color={section.color}
                            onClick={() => onSelectExit(id)}
                          />
                        );
                      })}
                      {section.id === 'materializations' && (
                        ['emerge', 'dissolve', 'burn-in', 'immediate'] as MaterializationId[]
                      ).map(id => {
                        const spec = MATERIALIZATIONS[id];
                        const isActive = state.materializationId === id;
                        return (
                          <CatalogItem
                            key={id}
                            label={formatId(id)}
                            sublabel={spec.durationMs > 0 ? `${spec.durationMs}ms` : '0ms'}
                            isActive={isActive}
                            color={section.color}
                            onClick={() => onSelectMaterialization(id)}
                          />
                        );
                      })}
                      {section.id === 'curves' && (
                        ['arrival', 'departure', 'spring'] as MotionCurveId[]
                      ).map(id => {
                        const curve = MOTION_CURVES[id];
                        const isActive = state.motionCurve === id;
                        return (
                          <CatalogItem
                            key={id}
                            label={id}
                            sublabel={curve.cubicBezier.replace('cubic-bezier(', '').replace(')', '')}
                            isActive={isActive}
                            color={section.color}
                            onClick={() => onSelectCurve(id)}
                          />
                        );
                      })}
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

function CatalogItem({
  label,
  sublabel,
  isActive,
  color,
  onClick,
}: {
  label: string;
  sublabel: string;
  isActive: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
        borderRadius: 6,
        border: 'none',
        cursor: 'pointer',
        background: isActive ? withAlpha(color, 0.08) : 'rgba(0,0,0,0)',
        textAlign: 'left',
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: isActive ? color : surfaces.glass.border,
        opacity: isActive ? 0.8 : 0.15,
        flexShrink: 0,
      }} />
      <div style={{
        fontFamily: fonts.primary,
        fontSize: 10,
        color: isActive ? color : colors.neutral.white,
        opacity: isActive ? 0.7 : 0.3,
        transition: 'all 0.2s',
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: fonts.mono,
        fontSize: 7,
        color: colors.neutral.white,
        opacity: 0.08,
      }}>
        {sublabel}
      </div>
    </button>
  );
}

// =====================================================================
// DEVICE SCENE RENDERER — entrance/exit preview inside the phone
// =====================================================================

function MotionSceneRenderer({
  state,
  breathAmplitude,
}: {
  state: MotionCompositionState;
  breathAmplitude: number;
}) {
  const entrance = ENTRANCES[state.entranceId];
  const exit = EXITS[state.exitId];
  const materialization = MATERIALIZATIONS[state.materializationId];
  const curve = MOTION_CURVES[state.motionCurve];
  const colorSig = COLOR_SIGNATURES[state.colorSignature];
  const voiceLane = VOICE_LANES[state.voiceLane];

  // Resolve entrance copy for current voice
  const entranceCopyData = ENTRANCE_COPY[state.entranceId]?.[state.voiceLane];
  const exitCopyText = EXIT_COPY[state.exitId]?.[state.voiceLane] ?? '';

  // Playback animation state
  const [phase, setPhase] = useState<'void' | 'atmosphere' | 'signal' | 'reveal' | 'active' | 'exit-anim' | 'receipt'>('void');
  const [phaseIndex, setPhaseIndex] = useState(0);

  // Auto-play entrance sequence when playing
  useEffect(() => {
    if (!state.isPlaying) {
      setPhase('void');
      setPhaseIndex(0);
      return;
    }

    const sequence = entrance.phaseSequence;
    let idx = 0;
    setPhaseIndex(0);
    setPhase(sequence[0] as typeof phase);

    const stepDuration = entrance.durationMs > 0
      ? entrance.durationMs / sequence.length
      : 800; // fallback for 0-duration entrances

    const interval = setInterval(() => {
      idx++;
      if (idx < sequence.length) {
        setPhaseIndex(idx);
        setPhase(sequence[idx] as typeof phase);
      } else if (idx === sequence.length) {
        setPhase('active');
      } else if (idx === sequence.length + 3) {
        // Hold active for ~3 beats, then exit
        setPhase('exit-anim');
      } else if (idx === sequence.length + 5) {
        setPhase('receipt');
      } else if (idx > sequence.length + 7) {
        clearInterval(interval);
      }
    }, stepDuration > 0 ? stepDuration : 800);

    return () => clearInterval(interval);
  }, [state.isPlaying, state.entranceId, entrance]);

  // Derive opacity / blur from phase
  const isVisible = phase !== 'void';
  const isAtmosphere = phase === 'atmosphere' || phase === 'active' || phase === 'signal' || phase === 'reveal';
  const isSignal = phase === 'signal' || phase === 'reveal' || phase === 'active';
  const isReveal = phase === 'reveal' || phase === 'active';
  const isExit = phase === 'exit-anim' || phase === 'receipt';

  const matDuration = materialization.durationMs;
  const easingStr = curve.cubicBezier;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: surfaces.solid.base }}>
      {/* Atmosphere layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${colorSig.surface} 0%, transparent 70%)`,
          opacity: isAtmosphere ? 0.6 + breathAmplitude * 0.3 : 0,
          transition: `opacity ${matDuration}ms ${easingStr}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '70%',
          height: '50%',
          top: '15%',
          left: '15%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colorSig.glow} 0%, transparent 60%)`,
          opacity: isAtmosphere ? 0.4 + breathAmplitude * 0.2 : 0,
          transition: `opacity ${matDuration * 1.5}ms ${easingStr}`,
        }}
      />

      {/* Signal: entrance copy */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          zIndex: 5,
        }}
      >
        {/* Entrance text */}
        <div
          style={{
            fontFamily: voiceLane.typographyAffinity === 'mono' ? fonts.mono : fonts.secondary,
            fontSize: voiceLane.typographyAffinity === 'mono' ? 13 : 17,
            color: colorSig.primary,
            opacity: isSignal && !isExit ? 0.8 : 0,
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: 220,
            letterSpacing: voiceLane.typographyAffinity === 'mono' ? '0.06em' : '0.01em',
            transition: `opacity ${matDuration}ms ${easingStr}`,
            filter: phase === 'signal' && state.materializationId === 'burn-in'
              ? `brightness(${materialization.animation.brightnessSpike ?? 1})`
              : 'none',
          }}
        >
          {entranceCopyData?.text ?? `[${state.voiceLane} × ${formatId(state.entranceId)}]`}
        </div>

        {/* Follow text for multi-beat entrances */}
        {entranceCopyData?.followText && (
          <div
            style={{
              fontFamily: fonts.secondary,
              fontSize: 14,
              color: colorSig.primary,
              opacity: isReveal && !isExit ? 0.5 : 0,
              textAlign: 'center',
              marginTop: 12,
              transition: `opacity ${matDuration * 1.2}ms ${easingStr}`,
            }}
          >
            {entranceCopyData.followText}
          </div>
        )}

        {/* Active indicator */}
        {phase === 'active' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 0.6, ease: curve.motionEasing as unknown as number[] }}
            style={{
              marginTop: 24,
              fontFamily: fonts.mono,
              fontSize: 8,
              color: colors.neutral.white,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            hero physics active
          </motion.div>
        )}

        {/* Exit receipt */}
        {isExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'receipt' ? 0.7 : 0.3 }}
            transition={{ duration: exit.durationMs / 1000, ease: curve.motionEasing as unknown as number[] }}
            style={{
              fontFamily: fonts.secondary,
              fontSize: 15,
              color: colorSig.primary,
              textAlign: 'center',
              maxWidth: 200,
              lineHeight: 1.5,
            }}
          >
            {exitCopyText}
          </motion.div>
        )}
      </div>

      {/* Phase indicator HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          zIndex: 10,
        }}
      >
        {entrance.phaseSequence.map((p, i) => (
          <div
            key={`${p}-${i}`}
            style={{
              width: 16,
              height: 3,
              borderRadius: 2,
              background: i <= phaseIndex && state.isPlaying
                ? colorSig.primary
                : withAlpha(colors.neutral.white, 0.08),
              opacity: i <= phaseIndex && state.isPlaying ? 0.6 : 1,
              transition: 'all 0.4s ease',
            }}
          />
        ))}
      </div>

      {/* Metacognitive tag */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          fontFamily: fonts.mono,
          fontSize: 7,
          color: colors.neutral.white,
          opacity: isVisible ? 0.12 : 0,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          zIndex: 10,
          transition: 'opacity 0.8s ease',
        }}
      >
        {formatId(state.entranceId)}
      </div>
    </div>
  );
}

// =====================================================================
// COMPOSITION CONTROLS (Right Panel)
// =====================================================================

function MotionControls({
  state,
  onChange,
  onPlay,
}: {
  state: MotionCompositionState;
  onChange: (s: MotionCompositionState) => void;
  onPlay: () => void;
}) {
  const entrance = ENTRANCES[state.entranceId];
  const exit = EXITS[state.exitId];
  const materialization = MATERIALIZATIONS[state.materializationId];
  const curve = MOTION_CURVES[state.motionCurve];
  const colorSig = COLOR_SIGNATURES[state.colorSignature];

  // Resolve available voice pairings for this entrance
  const availableVoices = VOICE_LANE_IDS.filter(
    v => ENTRANCE_COPY[state.entranceId]?.[v] !== undefined,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      {/* ── Play Button ─────────────────────── */}
      <button
        onClick={onPlay}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 8,
          border: `1px solid ${withAlpha(colorSig.primary, 0.2)}`,
          background: state.isPlaying
            ? withAlpha(colorSig.primary, 0.1)
            : 'rgba(0,0,0,0)',
          color: colorSig.primary,
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s',
          opacity: 0.7,
        }}
      >
        {state.isPlaying ? 'playing...' : 'play sequence'}
      </button>

      {/* ── Entrance Info ──────────────────── */}
      <div>
        <SectionLabel>active entrance</SectionLabel>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.entranceId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              fontFamily: fonts.secondary,
              fontSize: 15,
              color: SECTION_ACCENTS.entrance,
              opacity: 0.75,
              marginBottom: 2,
            }}>
              {formatId(state.entranceId)}
            </div>
            <div style={{
              fontFamily: fonts.primary,
              fontSize: 10,
              color: colors.neutral.white,
              opacity: 0.22,
              lineHeight: 1.5,
              marginTop: 4,
            }}>
              {entrance.vibe}
            </div>
            <div style={{
              display: 'flex',
              gap: 4,
              marginTop: 8,
              flexWrap: 'wrap',
            }}>
              {entrance.phaseSequence.map((p, i) => (
                <span key={`${p}-${i}`} style={{
                  fontFamily: fonts.mono,
                  fontSize: 7,
                  color: SECTION_ACCENTS.entrance,
                  opacity: 0.3,
                  padding: '2px 6px',
                  borderRadius: 3,
                  background: withAlpha(SECTION_ACCENTS.entrance, 0.05),
                }}>
                  {p}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Voice Lane ─────────────────────── */}
      <div>
        <SectionLabel>voice lane</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {VOICE_LANE_IDS.map(v => {
            const isAvailable = availableVoices.includes(v);
            const isActive = state.voiceLane === v;
            return (
              <button
                key={v}
                onClick={() => onChange({ ...state, voiceLane: v })}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: fonts.primary,
                  fontSize: 10,
                  color: isActive ? SECTION_ACCENTS.voice : colors.neutral.white,
                  opacity: isActive ? 0.65 : isAvailable ? 0.3 : 0.12,
                  background: isActive ? withAlpha(SECTION_ACCENTS.voice, 0.08) : 'rgba(0,0,0,0)',
                  transition: 'all 0.3s',
                }}
              >
                {v}
                {isAvailable && !isActive && (
                  <span style={{ marginLeft: 4, fontSize: 6, opacity: 0.5 }}>*</span>
                )}
              </button>
            );
          })}
        </div>
        {availableVoices.length > 0 && (
          <div style={{
            fontFamily: fonts.mono,
            fontSize: 7,
            color: colors.neutral.white,
            opacity: 0.1,
            marginTop: 4,
          }}>
            * has authored copy for this entrance
          </div>
        )}
      </div>

      {/* ── Color Signature ────────────────── */}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive ? surfaces.glass.light : 'rgba(0,0,0,0)',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: cs.primary,
                  flexShrink: 0,
                }} />
                <div style={{
                  fontFamily: fonts.primary,
                  fontSize: 10,
                  color: colors.neutral.white,
                  opacity: isActive ? 0.6 : 0.25,
                  transition: 'opacity 0.2s',
                }}>
                  {cs.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Breath ─────────────────────────── */}
      <div>
        <SectionLabel>breath</SectionLabel>
        <div style={{ display: 'flex', gap: 4 }}>
          {BREATH_PATTERNS.map(bp => (
            <button
              key={bp.id}
              onClick={() => onChange({ ...state, breathPattern: bp.id })}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontFamily: fonts.primary,
                fontSize: 10,
                color: colors.neutral.white,
                opacity: state.breathPattern === bp.id ? 0.65 : 0.2,
                background: state.breathPattern === bp.id ? surfaces.glass.light : 'rgba(0,0,0,0)',
                transition: 'all 0.3s',
              }}
            >
              {bp.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contract / Specs ───────────────── */}
      <div>
        <SectionLabel>entrance contract</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <PropStat label="duration" value={entrance.durationMs > 0 ? `${entrance.durationMs}ms` : 'instant'} />
          <PropStat label="interactive" value={entrance.requiresUserAction ? 'yes' : 'no'} />
          <PropStat label="phases" value={`${entrance.phaseSequence.length}`} />
          <PropStat label="materialization" value={formatId(state.materializationId)} />
        </div>
      </div>

      <div>
        <SectionLabel>exit contract</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <PropStat label="duration" value={exit.durationMs > 0 ? `${exit.durationMs}ms` : 'instant'} />
          <PropStat label="final state" value={exit.finalState} />
        </div>
      </div>

      <div>
        <SectionLabel>motion curve</SectionLabel>
        <div style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          color: SECTION_ACCENTS.curve,
          opacity: 0.35,
          marginBottom: 4,
        }}>
          {curve.cubicBezier}
        </div>
        <div style={{
          fontFamily: fonts.primary,
          fontSize: 10,
          color: colors.neutral.white,
          opacity: 0.18,
          lineHeight: 1.5,
        }}>
          {curve.feel}
        </div>
      </div>

      <div>
        <SectionLabel>materialization</SectionLabel>
        <div style={{
          fontFamily: fonts.primary,
          fontSize: 10,
          color: colors.neutral.white,
          opacity: 0.18,
          lineHeight: 1.5,
        }}>
          {materialization.feel}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
          <PropStat label="duration" value={materialization.durationMs > 0 ? `${materialization.durationMs}ms` : '0ms'} />
          <PropStat label="opacity" value={`${materialization.animation.opacityFrom} → ${materialization.animation.opacityTo}`} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Shared tiny components ──────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: fonts.mono,
      fontSize: 8,
      color: colors.neutral.white,
      opacity: 0.15,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function PropStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.04em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: fonts.primary, fontSize: 11, color: colors.neutral.white, opacity: 0.35 }}>{value}</div>
    </div>
  );
}

function formatId(id: string): string {
  return id.replace(/^the-/, 'The ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// =====================================================================
// MAIN WORKSPACE
// =====================================================================

export default function MotionWorkspace() {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('motion');
  const [state, setState] = useState<MotionCompositionState>(INITIAL_STATE);
  const [sceneCopyState, setSceneCopyState] = useState<SceneCopyState>(INITIAL_SCENE_COPY_STATE);
  const [isMobile, setIsMobile] = useState(false);
  const { setContent } = useDeviceMirror();
  const breathPattern = workspaceMode === 'motion' ? state.breathPattern : 'calm';
  const { amplitude } = useBreathEngine(breathPattern);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < atomsLayout.mobileBreakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handlePlay = useCallback(() => {
    setState(s => ({ ...s, isPlaying: false }));
    setTimeout(() => setState(s => ({ ...s, isPlaying: true })), 50);
  }, []);

  const handleSceneCopyPlay = useCallback(() => {
    setSceneCopyState(s => ({ ...s, isPlaying: false }));
    setTimeout(() => setSceneCopyState(s => ({ ...s, isPlaying: true })), 50);
  }, []);

  // Push scene into DeviceMirror — switches based on workspace mode
  useEffect(() => {
    if (workspaceMode === 'motion') {
      const colorSig = COLOR_SIGNATURES[state.colorSignature];
      setContent({
        accent: colorSig.accent,
        glow: colorSig.glow,
        breathPattern: state.breathPattern,
        customRenderer: (
          <MotionSceneRenderer state={state} breathAmplitude={amplitude} />
        ),
      });
    } else {
      const colorSig = COLOR_SIGNATURES[sceneCopyState.colorSignature];
      setContent({
        accent: colorSig.accent,
        glow: colorSig.glow,
        breathPattern: 'calm',
        customRenderer: (
          <SceneCopyRenderer state={sceneCopyState} breathAmplitude={amplitude} />
        ),
      });
    }
  }, [workspaceMode, state, sceneCopyState, amplitude, setContent]);

  // ── Mode toggle bar (above the 3-column grid) ─────────────
  const modeToggleBar = (
    <div style={{
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: `1px solid ${surfaces.glass.subtle}`,
    }}>
      <WorkspaceModeToggle mode={workspaceMode} onToggle={setWorkspaceMode} />
    </div>
  );

  if (!isMobile) {
    return (
      <div style={{ minHeight: `calc(100vh - ${layout.topBarHeight}px)` }}>
        {modeToggleBar}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `${atomsLayout.catalogPanelWidth}px 1fr ${atomsLayout.controlsPanelWidth}px`,
          gap: 0,
          minHeight: `calc(100vh - ${layout.topBarHeight}px - 44px)`,
        }}>
          {/* Left panel */}
          <div style={{
            padding: '20px 16px',
            borderRight: `1px solid ${surfaces.glass.subtle}`,
            background: withAlpha(surfaces.solid.base, 0.4),
            overflowY: 'auto',
          }}>
            {workspaceMode === 'motion' ? (
              <MotionCatalog
                state={state}
                onSelectEntrance={id => setState(s => ({ ...s, entranceId: id, isPlaying: false }))}
                onSelectExit={id => setState(s => ({ ...s, exitId: id, isPlaying: false }))}
                onSelectMaterialization={id => setState(s => ({ ...s, materializationId: id }))}
                onSelectCurve={id => setState(s => ({ ...s, motionCurve: id }))}
              />
            ) : (
              <SceneCopyCatalog
                state={sceneCopyState}
                onSelectSeries={id => {
                  const atoms = ATOM_IDS.filter(aId => ATOM_CATALOG[aId]?.series === id);
                  setSceneCopyState(s => ({ ...s, seriesId: id, atomId: atoms[0] ?? s.atomId, isPlaying: false }));
                }}
                onSelectAtom={id => setSceneCopyState(s => ({ ...s, atomId: id, isPlaying: false }))}
              />
            )}
          </div>

          {/* Center: DeviceMirror */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
            <DeviceMirror />
          </div>

          {/* Right panel */}
          <div style={{
            padding: '20px 16px',
            borderLeft: `1px solid ${surfaces.glass.subtle}`,
            background: withAlpha(surfaces.solid.base, 0.4),
            overflowY: 'auto',
          }}>
            {workspaceMode === 'motion' ? (
              <MotionControls state={state} onChange={setState} onPlay={handlePlay} />
            ) : (
              <SceneCopyControls state={sceneCopyState} onChange={setSceneCopyState} onPlay={handleSceneCopyPlay} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Mobile: stacked
  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <WorkspaceModeToggle mode={workspaceMode} onToggle={setWorkspaceMode} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <DeviceMirror />
      </div>
      {workspaceMode === 'motion' ? (
        <>
          <MotionCatalog
            state={state}
            onSelectEntrance={id => setState(s => ({ ...s, entranceId: id, isPlaying: false }))}
            onSelectExit={id => setState(s => ({ ...s, exitId: id, isPlaying: false }))}
            onSelectMaterialization={id => setState(s => ({ ...s, materializationId: id }))}
            onSelectCurve={id => setState(s => ({ ...s, motionCurve: id }))}
          />
          <div style={{ marginTop: 24 }}>
            <MotionControls state={state} onChange={setState} onPlay={handlePlay} />
          </div>
        </>
      ) : (
        <>
          <SceneCopyCatalog
            state={sceneCopyState}
            onSelectSeries={id => {
              const atoms = ATOM_IDS.filter(aId => ATOM_CATALOG[aId]?.series === id);
              setSceneCopyState(s => ({ ...s, seriesId: id, atomId: atoms[0] ?? s.atomId, isPlaying: false }));
            }}
            onSelectAtom={id => setSceneCopyState(s => ({ ...s, atomId: id, isPlaying: false }))}
          />
          <div style={{ marginTop: 24 }}>
            <SceneCopyControls state={sceneCopyState} onChange={setSceneCopyState} onPlay={handleSceneCopyPlay} />
          </div>
        </>
      )}
    </div>
  );
}