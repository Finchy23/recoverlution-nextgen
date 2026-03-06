/**
 * SHOWCASE PAGE
 * =============
 *
 * The final proof-of-concept gallery: every built atom rendered
 * through the full 7-layer composition stack as a live NaviCue.
 *
 * ARCHITECTURE:
 *   - Groups atoms by series (20 series × 10 atoms)
 *   - Each card renders a live mini-compositor in "active" phase
 *   - IntersectionObserver gates rendering: only visible cards animate
 *   - Global voice lane + color signature + breath controls
 *   - Click any card → opens /player with that atom pre-selected
 *
 * PERFORMANCE:
 *   - Canvas atoms only mount when card enters viewport
 *   - Unmount when card exits viewport (with 200px margin)
 *   - Max concurrent renderers limited by viewport size
 *
 * ROUTE: /showcase (index)
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { colors, fonts, surfaces, withAlpha, TRANSPARENT } from '@/design-tokens';
import { workspaceNavAccents } from '../design-center/dc-tokens';
import type {
  VoiceLaneId,
  ColorSignatureId,
  BreathPatternId,
  NarrativeDensity,
} from '@/navicue-types';
import {
  VOICE_LANE_IDS,
  COLOR_SIGNATURES,
  COLOR_SIGNATURE_IDS,
} from '@/navicue-data';
import {
  ATOM_CATALOG,
  ATOM_IDS,
  ATOM_COMPONENTS,
  SERIES_CATALOG,
  SERIES_IDS,
  type AtomId,
  type SeriesId,
} from '@/app/components/atoms';
import { useBreathEngine } from '@/app/pages/design-center/hooks/useBreathEngine';
import type { BreathPattern } from '@/app/pages/design-center/hooks/useBreathEngine';

// ─── Constants ──────────────────────────────────────────────────

const ACCENT = workspaceNavAccents.showcase;
const CARD_WIDTH = 240;
const CARD_HEIGHT = 320;
const CARD_GAP = 16;

// Map series index to color signature for visual variety
const SERIES_COLOR_MAP: ColorSignatureId[] = [
  'amber-resonance',   // S1 Physics
  'twilight-shift',    // S2 Quantum
  'verdant-calm',      // S3 Biomimetic
  'void-presence',     // S4 Via Negativa
  'neural-reset',      // S5 Chrono-Acoustic
  'radiant-white',     // S6 Meta-Glitch
  'twilight-shift',    // S7 Retro-Causal
  'quiet-authority',   // S8 Kinematic
  'amber-resonance',   // S9 Shadow Crucible
  'sacred-ordinary',   // S10 Reality Bender
  'quiet-authority',   // S11 Epistemic
  'amber-resonance',   // S12 Friction
  'neural-reset',      // S13 Semantic
  'verdant-calm',      // S14 Social
  'twilight-shift',    // S15 Timecapsule
  'sacred-ordinary',   // S16 Soma
  'verdant-calm',      // S17 Diplomat
  'radiant-white',     // S18 Visionary
  'void-presence',     // S19 Mystic
  'quiet-authority',   // S20 Omega
];

// ─── Showcase Card ──────────────────────────────────────────────

function ShowcaseCard({
  atomId,
  voiceLane,
  colorSignature,
  breathPattern,
  breathAmplitude,
  onClick,
  onExpand,
}: {
  atomId: AtomId;
  voiceLane: VoiceLaneId;
  colorSignature: ColorSignatureId;
  breathPattern: BreathPatternId;
  breathAmplitude: number;
  onClick: () => void;
  onExpand: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const meta = ATOM_CATALOG[atomId];
  const AtomComponent = ATOM_COMPONENTS[atomId];
  const seriesMeta = meta ? SERIES_CATALOG[meta.series] : undefined;
  const sig = COLOR_SIGNATURES[colorSignature];

  // IntersectionObserver — only render atom when in viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px 0px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const amplitude = breathAmplitude;

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        background: surfaces.solid.base,
        border: `1px solid ${withAlpha(colors.neutral.white, isHovered ? 0.08 : 0.03)}`,
        transition: 'border-color 0.3s',
        flexShrink: 0,
      }}
    >
      {/* Atmosphere glow */}
      {isVisible && (
        <motion.div
          animate={{
            scale: 0.85 + amplitude * 0.15,
            opacity: 0.1 + amplitude * 0.08,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            width: CARD_WIDTH * 1.2,
            height: CARD_WIDTH * 1.2,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${sig.glow} 0%, ${TRANSPARENT} 60%)`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Live Atom Render */}
      {isVisible && AtomComponent && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <AtomComponent
            breathAmplitude={amplitude}
            reducedMotion={false}
            color={sig.primary}
            accentColor={sig.accent}
            viewport={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
            phase="active"
            composed={true}
            onHaptic={() => {}}
            onStateChange={() => {}}
            onResolve={() => {}}
          />
        </div>
      )}

      {/* Placeholder when not visible or no component */}
      {(!isVisible || !AtomComponent) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha(sig.primary, 0.15)} 0%, ${TRANSPARENT} 70%)`,
            }}
          />
        </div>
      )}

      {/* Bottom label scrim */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          padding: '32px 14px 14px',
          background: `linear-gradient(to top, ${withAlpha(colors.neutral.black, 0.7)} 0%, ${TRANSPARENT} 100%)`,
          pointerEvents: 'none',
        }}
      >
        {/* Atom number + name */}
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 8,
            color: withAlpha(sig.primary, 0.6),
            letterSpacing: '0.1em',
            marginBottom: 3,
          }}
        >
          {meta?.number ?? '?'} · {seriesMeta?.name ?? 'Unknown'}
        </div>
        <div
          style={{
            fontFamily: fonts.primary,
            fontSize: 12,
            color: colors.neutral.white,
            opacity: 0.85,
            letterSpacing: '-0.01em',
            lineHeight: 1.3,
          }}
        >
          {meta?.name ?? atomId}
        </div>

        {/* Gesture + status badges */}
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {meta?.renderMode && (
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 7,
                color: colors.neutral.white,
                opacity: 0.2,
                letterSpacing: '0.06em',
                padding: '2px 5px',
                borderRadius: 3,
                background: withAlpha(colors.neutral.white, 0.04),
              }}
            >
              {meta.renderMode}
            </span>
          )}
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 7,
              color: colors.neutral.white,
              opacity: 0.2,
              letterSpacing: '0.06em',
              padding: '2px 5px',
              borderRadius: 3,
              background: withAlpha(colors.neutral.white, 0.04),
            }}
          >
            {meta?.defaultScale ?? '?'}
          </span>
        </div>
      </div>

      {/* Hover overlay — two actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: withAlpha(colors.neutral.black, 0.3),
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              onClick={(e) => { e.stopPropagation(); onExpand(); }}
              style={{
                fontFamily: fonts.mono,
                fontSize: 9,
                color: ACCENT,
                opacity: 0.8,
                letterSpacing: '0.1em',
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${withAlpha(ACCENT, 0.3)}`,
                background: withAlpha(ACCENT, 0.08),
                cursor: 'pointer',
              }}
            >
              EXPAND
            </div>
            <div
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              style={{
                fontFamily: fonts.mono,
                fontSize: 8,
                color: colors.neutral.white,
                opacity: 0.4,
                letterSpacing: '0.08em',
                padding: '5px 12px',
                borderRadius: 6,
                border: `1px solid ${withAlpha(colors.neutral.white, 0.08)}`,
                background: withAlpha(colors.neutral.white, 0.03),
                cursor: 'pointer',
              }}
            >
              OPEN IN PLAYER
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Series Section ─────────────────────────────────────────────

function SeriesSection({
  seriesId,
  seriesIndex,
  atoms,
  voiceLane,
  colorSignature,
  breathPattern,
  breathAmplitude,
  onAtomClick,
  onAtomExpand,
}: {
  seriesId: SeriesId;
  seriesIndex: number;
  atoms: AtomId[];
  voiceLane: VoiceLaneId;
  colorSignature: ColorSignatureId | 'auto';
  breathPattern: BreathPatternId;
  breathAmplitude: number;
  onAtomClick: (atomId: AtomId) => void;
  onAtomExpand: (atomId: AtomId) => void;
}) {
  const series = SERIES_CATALOG[seriesId];
  const [collapsed, setCollapsed] = useState(false);

  const resolvedColor = colorSignature === 'auto'
    ? SERIES_COLOR_MAP[seriesIndex % SERIES_COLOR_MAP.length]
    : colorSignature;

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Series header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: collapsed ? 0 : 20,
          cursor: 'pointer',
          padding: '8px 0',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: series.colorIdentity,
            opacity: 0.6,
          }}
        />
        <div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              color: series.colorIdentity,
              opacity: 0.5,
              letterSpacing: '0.12em',
            }}
          >
            SERIES {series.number}
          </div>
          <div
            style={{
              fontFamily: fonts.primary,
              fontSize: 15,
              color: colors.neutral.white,
              opacity: 0.7,
              letterSpacing: '-0.01em',
            }}
          >
            {series.name}
          </div>
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 8,
            color: colors.neutral.white,
            opacity: 0.12,
            marginLeft: 'auto',
            letterSpacing: '0.06em',
          }}
        >
          {atoms.length} ATOMS · {collapsed ? 'EXPAND' : 'COLLAPSE'}
        </div>
      </div>

      {/* Cards grid */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: CARD_GAP,
              }}
            >
              {atoms.map(atomId => (
                <ShowcaseCard
                  key={atomId}
                  atomId={atomId}
                  voiceLane={voiceLane}
                  colorSignature={resolvedColor}
                  breathPattern={breathPattern}
                  breathAmplitude={breathAmplitude}
                  onClick={() => onAtomClick(atomId)}
                  onExpand={() => onAtomExpand(atomId)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Global Controls Bar ────────────────────────────────────────

function GlobalControls({
  voiceLane,
  onVoiceLaneChange,
  colorSignature,
  onColorSignatureChange,
  breathPattern,
  onBreathPatternChange,
  narrativeDensity,
  onNarrativeDensityChange,
  totalAtoms,
  builtAtoms,
  activeSeries,
  onActiveSeriesChange,
  seriesGroups,
}: {
  voiceLane: VoiceLaneId;
  onVoiceLaneChange: (v: VoiceLaneId) => void;
  colorSignature: ColorSignatureId | 'auto';
  onColorSignatureChange: (c: ColorSignatureId | 'auto') => void;
  breathPattern: BreathPatternId;
  onBreathPatternChange: (b: BreathPatternId) => void;
  narrativeDensity: NarrativeDensity;
  onNarrativeDensityChange: (d: NarrativeDensity) => void;
  totalAtoms: number;
  builtAtoms: number;
  activeSeries: SeriesId | null;
  onActiveSeriesChange: (s: SeriesId | null) => void;
  seriesGroups: { seriesId: SeriesId; atoms: AtomId[] }[];
}) {
  const pillStyle = (active: boolean, accent: string): React.CSSProperties => ({
    padding: '5px 10px',
    fontFamily: fonts.mono,
    fontSize: 8,
    color: active ? accent : colors.neutral.white,
    opacity: active ? 0.8 : 0.25,
    letterSpacing: '0.06em',
    background: active ? withAlpha(accent, 0.15) : withAlpha(colors.neutral.white, 0.02),
    border: `1px solid ${active ? withAlpha(accent, 0.2) : withAlpha(colors.neutral.white, 0.04)}`,
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase' as const,
  });

  return (
    <div
      style={{
        borderBottom: `1px solid ${withAlpha(colors.neutral.white, 0.03)}`,
        position: 'sticky',
        top: 48,
        zIndex: 40,
        background: withAlpha(surfaces.solid.base, 0.92),
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Top row — main controls */}
      <div
        style={{
          padding: '16px 24px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.12em' }}>
            ECOSYSTEM
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: ACCENT, opacity: 0.5 }}>
            {builtAtoms}/{totalAtoms}
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: withAlpha(colors.neutral.white, 0.04) }} />

        {/* Voice Lane */}
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.12em', marginBottom: 4 }}>
            VOICE LANE
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {VOICE_LANE_IDS.map(v => (
              <button
                key={v}
                onClick={() => onVoiceLaneChange(v)}
                style={pillStyle(voiceLane === v, workspaceNavAccents.voice)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: withAlpha(colors.neutral.white, 0.04) }} />

        {/* Color Signature */}
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.12em', marginBottom: 4 }}>
            COLOR
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              onClick={() => onColorSignatureChange('auto')}
              style={{
                ...pillStyle(colorSignature === 'auto', ACCENT),
                fontSize: 7,
              }}
            >
              AUTO
            </button>
            {COLOR_SIGNATURE_IDS.map(id => {
              const sig = COLOR_SIGNATURES[id];
              return (
                <button
                  key={id}
                  onClick={() => onColorSignatureChange(id)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    border: colorSignature === id
                      ? `2px solid ${withAlpha(colors.neutral.white, 0.4)}`
                      : `1px solid ${withAlpha(colors.neutral.white, 0.06)}`,
                    background: `radial-gradient(circle, ${sig.primary} 0%, ${surfaces.solid.base} 100%)`,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'border 0.2s',
                  }}
                  title={sig.name}
                />
              );
            })}
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: withAlpha(colors.neutral.white, 0.04) }} />

        {/* Breath */}
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.12em', marginBottom: 4 }}>
            BREATH
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['calm', 'simple', 'box', 'energize'] as BreathPatternId[]).map(b => (
              <button
                key={b}
                onClick={() => onBreathPatternChange(b)}
                style={pillStyle(breathPattern === b, workspaceNavAccents.motion)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: withAlpha(colors.neutral.white, 0.04) }} />

        {/* Narrative Density */}
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1, letterSpacing: '0.12em', marginBottom: 4 }}>
            DENSITY
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['full', 'core', 'minimal', 'silent'] as NarrativeDensity[]).map(d => (
              <button
                key={d}
                onClick={() => onNarrativeDensityChange(d)}
                style={pillStyle(narrativeDensity === d, workspaceNavAccents.voice)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row — series filter chips */}
      <div
        style={{
          padding: '6px 24px 12px',
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.08, letterSpacing: '0.1em', marginRight: 6 }}>
          SERIES
        </div>
        <button
          onClick={() => onActiveSeriesChange(null)}
          style={{
            ...pillStyle(activeSeries === null, ACCENT),
            padding: '3px 8px',
            fontSize: 7,
          }}
        >
          ALL
        </button>
        {seriesGroups.map((group, i) => {
          const series = SERIES_CATALOG[group.seriesId];
          const isActive = activeSeries === group.seriesId;
          return (
            <button
              key={group.seriesId}
              onClick={() => onActiveSeriesChange(isActive ? null : group.seriesId)}
              title={`S${series.number} ${series.name} (${group.atoms.length} atoms)`}
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                border: isActive
                  ? `2px solid ${withAlpha(colors.neutral.white, 0.5)}`
                  : `1px solid ${withAlpha(colors.neutral.white, 0.06)}`,
                background: isActive
                  ? series.colorIdentity
                  : withAlpha(series.colorIdentity, 0.25),
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s',
                transform: isActive ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          );
        })}
        {activeSeries && (
          <span style={{ fontFamily: fonts.mono, fontSize: 7, color: ACCENT, opacity: 0.4, marginLeft: 6, letterSpacing: '0.06em' }}>
            {SERIES_CATALOG[activeSeries].name.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Fullscreen Expand Overlay ──────────────────────────────────

function ExpandOverlay({
  atomId,
  colorSignature,
  breathAmplitude,
  onClose,
  onOpenInPlayer,
}: {
  atomId: AtomId;
  colorSignature: ColorSignatureId;
  breathAmplitude: number;
  onClose: () => void;
  onOpenInPlayer: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const meta = ATOM_CATALOG[atomId];
  const AtomComponent = ATOM_COMPONENTS[atomId];
  const seriesMeta = meta ? SERIES_CATALOG[meta.series] : undefined;
  const sig = COLOR_SIGNATURES[colorSignature];

  // Measure viewport
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewport({ width: rect.width, height: rect.height });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: withAlpha(colors.neutral.black, 0.85),
        backdropFilter: 'blur(24px)',
        cursor: 'pointer',
      }}
    >
      {/* Atmosphere glow */}
      <motion.div
        animate={{
          scale: 0.85 + breathAmplitude * 0.15,
          opacity: 0.08 + breathAmplitude * 0.06,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '45%',
          width: '60vmin',
          height: '60vmin',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${sig.glow} 0%, ${TRANSPARENT} 60%)`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Live atom — full viewport */}
      {viewport.width > 0 && AtomComponent && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'default',
          }}
        >
          <AtomComponent
            breathAmplitude={breathAmplitude}
            reducedMotion={false}
            color={sig.primary}
            accentColor={sig.accent}
            viewport={viewport}
            phase="active"
            composed={true}
            onHaptic={() => {}}
            onStateChange={() => {}}
            onResolve={() => {}}
          />
        </motion.div>
      )}

      {/* Top-left label */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        style={{
          position: 'absolute',
          top: 24,
          left: 28,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: 8, color: withAlpha(sig.primary, 0.5), letterSpacing: '0.1em', marginBottom: 2 }}>
          {meta?.number ?? '?'} · {seriesMeta?.name ?? 'Unknown'}
        </div>
        <div style={{ fontFamily: fonts.primary, fontSize: 18, color: colors.neutral.white, opacity: 0.7, letterSpacing: '-0.01em' }}>
          {meta?.name ?? atomId}
        </div>
      </motion.div>

      {/* Bottom controls */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 12,
          zIndex: 10,
        }}
      >
        <button
          onClick={onOpenInPlayer}
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            color: ACCENT,
            opacity: 0.8,
            letterSpacing: '0.1em',
            padding: '10px 24px',
            borderRadius: 10,
            border: `1px solid ${withAlpha(ACCENT, 0.3)}`,
            background: withAlpha(ACCENT, 0.1),
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          OPEN IN PLAYER
        </button>
        <button
          onClick={onClose}
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            color: colors.neutral.white,
            opacity: 0.35,
            letterSpacing: '0.1em',
            padding: '10px 20px',
            borderRadius: 10,
            border: `1px solid ${withAlpha(colors.neutral.white, 0.08)}`,
            background: withAlpha(colors.neutral.white, 0.03),
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ESC
        </button>
      </motion.div>

      {/* Top-right close X */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          zIndex: 10,
          fontFamily: fonts.mono,
          fontSize: 14,
          color: colors.neutral.white,
          opacity: 0.2,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 12px',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.5'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '0.2'; }}
      >
        ×
      </button>
    </motion.div>
  );
}

// ─── Main Showcase Page ─────────────────────────────────────────

export default function ShowcasePage() {
  const navigate = useNavigate();

  // Global config
  const [voiceLane, setVoiceLane] = useState<VoiceLaneId>('coach');
  const [colorSignature, setColorSignature] = useState<ColorSignatureId | 'auto'>('auto');
  const [breathPattern, setBreathPattern] = useState<BreathPatternId>('calm');
  const [narrativeDensity, setNarrativeDensity] = useState<NarrativeDensity>('core');
  const [activeSeries, setActiveSeries] = useState<SeriesId | null>(null);
  const [expandedAtom, setExpandedAtom] = useState<AtomId | null>(null);

  // Single breath engine for all cards — one rAF loop for the whole page
  const { amplitude: breathAmplitude } = useBreathEngine(breathPattern as BreathPattern);

  // Group atoms by series
  const seriesGroups = useMemo(() => {
    const groups: { seriesId: SeriesId; atoms: AtomId[] }[] = [];
    for (const seriesId of SERIES_IDS) {
      const atoms = ATOM_IDS.filter(id => {
        const meta = ATOM_CATALOG[id];
        return meta?.series === seriesId;
      });
      if (atoms.length > 0) {
        groups.push({ seriesId, atoms });
      }
    }
    return groups;
  }, []);

  // Filter by active series
  const filteredGroups = useMemo(() => {
    if (!activeSeries) return seriesGroups;
    return seriesGroups.filter(g => g.seriesId === activeSeries);
  }, [seriesGroups, activeSeries]);

  const totalAtoms = ATOM_IDS.length;
  const builtAtoms = ATOM_IDS.filter(id => ATOM_COMPONENTS[id]).length;

  const handleAtomClick = useCallback((atomId: AtomId) => {
    const resolvedColor = colorSignature === 'auto' ? 'quiet-authority' : colorSignature;
    navigate(`/player?atom=${atomId}&voice=${voiceLane}&color=${resolvedColor}&breath=${breathPattern}&density=${narrativeDensity}`);
  }, [navigate, voiceLane, colorSignature, breathPattern, narrativeDensity]);

  const handleAtomExpand = useCallback((atomId: AtomId) => {
    setExpandedAtom(atomId);
  }, []);

  const handleCloseExpand = useCallback(() => {
    setExpandedAtom(null);
  }, []);

  // Resolve color for expanded atom
  const expandedColor = useMemo((): ColorSignatureId => {
    if (!expandedAtom) return 'quiet-authority';
    if (colorSignature !== 'auto') return colorSignature;
    const meta = ATOM_CATALOG[expandedAtom];
    if (!meta) return 'quiet-authority';
    const seriesIdx = seriesGroups.findIndex(g => g.seriesId === meta.series);
    return SERIES_COLOR_MAP[seriesIdx >= 0 ? seriesIdx % SERIES_COLOR_MAP.length : 0];
  }, [expandedAtom, colorSignature, seriesGroups]);

  return (
    <div>
      {/* Global Controls */}
      <GlobalControls
        voiceLane={voiceLane}
        onVoiceLaneChange={setVoiceLane}
        colorSignature={colorSignature}
        onColorSignatureChange={setColorSignature}
        breathPattern={breathPattern}
        onBreathPatternChange={setBreathPattern}
        narrativeDensity={narrativeDensity}
        onNarrativeDensityChange={setNarrativeDensity}
        totalAtoms={totalAtoms}
        builtAtoms={builtAtoms}
        activeSeries={activeSeries}
        onActiveSeriesChange={setActiveSeries}
        seriesGroups={seriesGroups}
      />

      {/* Series Grid */}
      <div style={{ padding: '32px 24px 80px' }}>
        {filteredGroups.map((group, i) => {
          // Preserve original series index for color mapping
          const originalIdx = seriesGroups.findIndex(g => g.seriesId === group.seriesId);
          return (
            <SeriesSection
              key={group.seriesId}
              seriesId={group.seriesId}
              seriesIndex={originalIdx >= 0 ? originalIdx : i}
              atoms={group.atoms}
              voiceLane={voiceLane}
              colorSignature={colorSignature}
              breathPattern={breathPattern}
              breathAmplitude={breathAmplitude}
              onAtomClick={handleAtomClick}
              onAtomExpand={handleAtomExpand}
            />
          );
        })}
      </div>

      {/* Fullscreen expand overlay */}
      <AnimatePresence>
        {expandedAtom && (
          <ExpandOverlay
            key={expandedAtom}
            atomId={expandedAtom}
            colorSignature={expandedColor}
            breathAmplitude={breathAmplitude}
            onClose={handleCloseExpand}
            onOpenInPlayer={() => {
              handleCloseExpand();
              handleAtomClick(expandedAtom);
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <div
        style={{
          padding: '24px',
          borderTop: `1px solid ${withAlpha(colors.neutral.white, 0.03)}`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.06, letterSpacing: '0.12em' }}>
          RECOVERLUTION SHOWCASE v0.2.0 — {builtAtoms} LIVE ATOMS × {COLOR_SIGNATURE_IDS.length} SIGNATURES × {VOICE_LANE_IDS.length} VOICES
        </div>
      </div>
    </div>
  );
}