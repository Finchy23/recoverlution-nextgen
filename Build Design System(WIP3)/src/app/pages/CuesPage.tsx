/**
 * CUES — The Physics of Feeling
 *
 * The orchestration hub. CUE is the genus.
 * PULSE, TWIN, TRI, ARC are species.
 *
 * The opening layer is the music — the rhythmic scale
 * that transforms a sequence of scenes into a symphony.
 * Each sub-view shows the device mirror with the composition
 * playing, alongside a mechanics/variables panel that reveals
 * the atomic structure beneath.
 *
 * There is no time here. No progress. No destination.
 * Only this rhythm. Only this breath. Only now.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UniversalPlayer } from '../components/universal-player/UniversalPlayer';
import type { Device } from '../components/design-system/surface-engine';
import {
  room, font, colors, tracking, typeSize, leading, weight,
  opacity, timing, glaze, glow, radii,
} from '../components/design-system/surface-tokens';
import {
  type CompositionType,
  type Composition,
  type Beat,
  getCompositionMeta,
  ROLE_META,
  TRANSITION_META,
  getRoleMeta,
  getPostureMeta,
  CAPTURE_META,
  isOverlayCapture,
  getOverlayCaptures,
} from '../components/cues/composition-types';
import {
  getCompositionsByType,
} from '../components/cues/composition-library';
import { getAtomById } from '../components/atoms/atom-registry';
import type { CompositionSessionRecord } from '../components/cues/CompositionEngine';

// ─── Composition type tab data (derived from COMPOSITION_META) ───

const COMPOSITION_TYPES: CompositionType[] = ['pulse', 'twin', 'tri', 'arc'];

const RHYTHM_TABS = COMPOSITION_TYPES.map(type => {
  const meta = getCompositionMeta(type);
  return { type, label: meta.label, beats: meta.beatCount.replace(/\s*beats?/, '') };
});

/** Derive default selection from first composition in each type */
function getDefaultSelections(): Record<CompositionType, string> {
  const defaults = {} as Record<CompositionType, string>;
  for (const type of COMPOSITION_TYPES) {
    const comps = getCompositionsByType(type);
    defaults[type] = comps[0]?.id ?? '';
  }
  return defaults;
}

// ═══════════════════════════════════════════════════════
// BEAT VISUALIZER — shows atomic structure of a composition
// ═══════════════════════════════════════════════════════

function BeatNode({ beat, isLast }: { beat: Beat; isLast: boolean }) {
  const atom = getAtomById(beat.atomId);
  const roleMeta = getRoleMeta(beat.role);
  const captureMode = beat.capture ?? 'none';
  const hasOverlay = isOverlayCapture(captureMode);
  const captureMeta = CAPTURE_META.find(c => c.mode === captureMode);
  const transition = beat.transitionOut
    ? TRANSITION_META.find(t => t.type === beat.transitionOut)
    : null;

  return (
    <div className="flex items-start gap-3">
      {/* Beat dot + line */}
      <div className="flex flex-col items-center" style={{ minWidth: 14 }}>
        <div
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            background: roleMeta.color,
            boxShadow: glow.soft(roleMeta.color, '30'),
            marginTop: 2,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              minHeight: 28,
              background: transition
                ? `linear-gradient(180deg, ${roleMeta.color}30, ${glaze.frost})`
                : glaze.frost,
            }}
          />
        )}
      </div>

      {/* Beat content */}
      <div className="flex-1 pb-3" style={{ minWidth: 0 }}>
        {/* Role label */}
        <div className="flex items-center gap-2 mb-0.5">
          <span
            style={{
              fontFamily: font.sans,
              fontSize: typeSize.label,
              fontWeight: weight.medium,
              letterSpacing: tracking.spread,
              textTransform: 'uppercase',
              color: roleMeta.color,
            }}
          >
            {roleMeta.label}
          </span>
          <span
            style={{
              fontFamily: font.mono,
              fontSize: typeSize.label,
              color: glaze.smoke,
              letterSpacing: tracking.code,
            }}
          >
            {roleMeta.verb.toLowerCase()}
          </span>
          {/* Capture mode badge */}
          {captureMode !== 'none' && (
            <span
              style={{
                fontFamily: font.mono,
                fontSize: typeSize.whisper,
                fontWeight: weight.medium,
                letterSpacing: tracking.code,
                textTransform: 'uppercase',
                color: hasOverlay ? colors.accent.cyan.primary : glaze.silver,
                opacity: hasOverlay ? opacity.strong : opacity.spoken,
              }}
            >
              {captureMode}
            </span>
          )}
        </div>

        {/* Atom name */}
        <div className="flex items-center gap-2">
          {atom && (
            <div
              className="rounded-full"
              style={{
                width: 4,
                height: 4,
                background: atom.color,
                boxShadow: glow.dot(atom.color, '40'),
              }}
            />
          )}
          <span
            style={{
              fontFamily: font.serif,
              fontSize: typeSize.small,
              fontWeight: weight.regular,
              color: room.fg,
              opacity: opacity.bright,
            }}
          >
            {atom?.name ?? beat.atomId}
          </span>
          <span
            style={{
              fontFamily: font.mono,
              fontSize: typeSize.label,
              color: glaze.dim,
              letterSpacing: tracking.code,
            }}
          >
            {(beat.durationMs / 1000).toFixed(0)}s
          </span>
        </div>

        {/* Sync copy preview */}
        <p
          style={{
            fontFamily: font.serif,
            fontSize: typeSize.caption,
            fontStyle: 'italic',
            color: room.fg,
            opacity: opacity.spoken,
            lineHeight: leading.natural,
            marginTop: 2,
            maxWidth: '20rem',
          }}
        >
          {beat.sync.canopy}
        </p>

        {/* Capture options preview (for overlay captures) */}
        {hasOverlay && beat.captureOptions && (
          <div
            className="flex items-center gap-2 mt-1"
            style={{ opacity: opacity.strong }}
          >
            {beat.captureOptions.options ? (
              beat.captureOptions.options.map(opt => (
                <span
                  key={opt}
                  style={{
                    fontFamily: font.serif,
                    fontSize: typeSize.whisper,
                    fontStyle: 'italic',
                    color: colors.accent.cyan.primary,
                    opacity: opacity.bright,
                  }}
                >
                  {opt}
                </span>
              ))
            ) : beat.captureOptions.prompt ? (
              <span
                style={{
                  fontFamily: font.serif,
                  fontSize: typeSize.whisper,
                  fontStyle: 'italic',
                  color: glaze.silver,
                  opacity: opacity.spoken,
                }}
              >
                {beat.captureOptions.prompt}
              </span>
            ) : null}
          </div>
        )}

        {/* Transition indicator */}
        {transition && (
          <div
            className="flex items-center gap-1.5 mt-1.5"
            style={{ opacity: opacity.steady }}
          >
            <span
              style={{
                fontFamily: font.sans,
                fontSize: typeSize.whisper,
                fontWeight: weight.medium,
                letterSpacing: tracking.wide,
                textTransform: 'uppercase',
                color: glaze.silver,
              }}
            >
              {transition.label}
            </span>
            <span
              style={{
                fontFamily: font.mono,
                fontSize: typeSize.whisper,
                color: glaze.dim,
              }}
            >
              {transition.durationMs}ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MECHANICS PANEL — variables & structure
// ═══════════════════════════════════════════════════════

function MechanicsPanel({ composition }: { composition: Composition }) {
  const meta = getCompositionMeta(composition.type);
  const totalDuration = composition.beats.reduce((sum, b) => sum + b.durationMs, 0);
  const transitions = composition.beats.filter(b => b.transitionOut).map(b => b.transitionOut!);
  const transitionDuration = transitions.reduce((sum, t) => {
    const tm = TRANSITION_META.find(m => m.type === t);
    return sum + (tm?.durationMs ?? 0);
  }, 0);

  // Unique roles used
  const roles = [...new Set(composition.beats.map(b => b.role))];
  // Unique atoms used
  const atoms = [...new Set(composition.beats.map(b => b.atomId))];
  // Posture
  const postureMeta = getPostureMeta(composition.posture);
  // Unique capture modes
  const captures = [...new Set(composition.beats.map(b => b.capture ?? 'none'))];
  // Overlay captures (the soft asks)
  const overlayBeats = getOverlayCaptures(composition);

  return (
    <div className="space-y-4">
      {/* Composition header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            style={{
              fontFamily: font.sans,
              fontSize: typeSize.label,
              fontWeight: weight.medium,
              letterSpacing: tracking.spread,
              textTransform: 'uppercase',
              color: colors.accent.cyan.primary,
              opacity: opacity.strong,
            }}
          >
            {meta.label}
          </span>
          <span
            style={{
              fontFamily: font.mono,
              fontSize: typeSize.label,
              color: glaze.dim,
              letterSpacing: tracking.code,
            }}
          >
            {composition.beats.length} {composition.beats.length === 1 ? 'beat' : 'beats'}
          </span>
        </div>
        <h3
          style={{
            fontFamily: font.serif,
            fontSize: typeSize.prose,
            fontWeight: weight.regular,
            color: room.fg,
            opacity: opacity.clear,
            margin: 0,
            lineHeight: leading.compact,
          }}
        >
          {composition.name}
        </h3>
        <p
          style={{
            fontFamily: font.serif,
            fontSize: typeSize.small,
            fontStyle: 'italic',
            color: room.fg,
            opacity: opacity.spoken,
            margin: 0,
            marginTop: 2,
            lineHeight: leading.relaxed,
          }}
        >
          {composition.essence}
        </p>
      </div>

      {/* Variables readout */}
      <div
        className="flex flex-wrap gap-x-5 gap-y-1"
        style={{
          paddingTop: 8,
          borderTop: `1px solid ${glaze.thin}`,
        }}
      >
        {([
          { label: 'duration', value: `${(totalDuration / 1000).toFixed(0)}s` },
          { label: 'posture', value: postureMeta.label.toLowerCase(), color: postureMeta.color },
          { label: 'transitions', value: transitions.length > 0 ? transitions.join(' ') : 'none' },
          { label: 'capture', value: captures.join(' ') },
          { label: 'roles', value: roles.length.toString() },
          { label: 'atoms', value: atoms.length.toString() },
        ] as { label: string; value: string; color?: string }[]).filter(v => v.value).map(v => (
          <span
            key={v.label}
            style={{
              fontFamily: font.mono,
              fontSize: typeSize.label,
              color: glaze.dim,
              letterSpacing: tracking.code,
            }}
          >
            <span style={{ color: glaze.smoke }}>{v.label}</span>{' '}
            <span style={{ color: v.color ?? colors.accent.cyan.primary, opacity: opacity.strong }}>{v.value}</span>
          </span>
        ))}
      </div>

      {/* Beat sequence */}
      <div
        style={{
          paddingTop: 8,
          borderTop: `1px solid ${glaze.thin}`,
        }}
      >
        <span
          style={{
            fontFamily: font.sans,
            fontSize: typeSize.label,
            fontWeight: weight.medium,
            letterSpacing: tracking.spread,
            textTransform: 'uppercase',
            color: glaze.smoke,
            display: 'block',
            marginBottom: 8,
          }}
        >
          Beat Sequence
        </span>
        {composition.beats.map((beat, i) => (
          <BeatNode
            key={beat.position}
            beat={beat}
            isLast={i === composition.beats.length - 1}
          />
        ))}
      </div>

      {/* Role affinities used */}
      <div
        style={{
          paddingTop: 8,
          borderTop: `1px solid ${glaze.thin}`,
        }}
      >
        <span
          style={{
            fontFamily: font.sans,
            fontSize: typeSize.label,
            fontWeight: weight.medium,
            letterSpacing: tracking.spread,
            textTransform: 'uppercase',
            color: glaze.smoke,
            display: 'block',
            marginBottom: 6,
          }}
        >
          Role Palette
        </span>
        <div className="flex flex-wrap gap-2">
          {ROLE_META.map(rm => {
            const active = roles.includes(rm.role);
            return (
              <div
                key={rm.role}
                className="flex items-center gap-1.5"
                style={{
                  opacity: active ? 1 : opacity.ambient,
                  transition: timing.t.easeRespond,
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: 4,
                    height: 4,
                    background: rm.color,
                    opacity: active ? 1 : opacity.spoken,
                  }}
                />
                <span
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.label,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.label,
                    textTransform: 'uppercase',
                    color: active ? rm.color : glaze.dim,
                  }}
                >
                  {rm.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Soft Capture — overlay captures only */}
      {overlayBeats.length > 0 && (
        <div
          style={{
            paddingTop: 8,
            borderTop: `1px solid ${glaze.thin}`,
          }}
        >
          <span
            style={{
              fontFamily: font.sans,
              fontSize: typeSize.label,
              fontWeight: weight.medium,
              letterSpacing: tracking.spread,
              textTransform: 'uppercase',
              color: glaze.smoke,
              display: 'block',
              marginBottom: 6,
            }}
          >
            Soft Capture
          </span>
          <div className="space-y-2">
            {overlayBeats.map(beat => {
              const capMeta = CAPTURE_META.find(c => c.mode === beat.capture);
              return (
                <div
                  key={`capture-${beat.position}`}
                  className="flex items-start gap-2"
                >
                  <span
                    style={{
                      fontFamily: font.mono,
                      fontSize: typeSize.whisper,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.code,
                      textTransform: 'uppercase',
                      color: colors.accent.cyan.primary,
                      opacity: opacity.strong,
                      whiteSpace: 'nowrap',
                      marginTop: 1,
                    }}
                  >
                    beat {beat.position + 1}
                  </span>
                  <div>
                    <span
                      style={{
                        fontFamily: font.mono,
                        fontSize: typeSize.label,
                        fontWeight: weight.medium,
                        letterSpacing: tracking.code,
                        textTransform: 'uppercase',
                        color: colors.accent.cyan.primary,
                      }}
                    >
                      {beat.capture}
                    </span>
                    {capMeta && (
                      <span
                        style={{
                          fontFamily: font.serif,
                          fontSize: typeSize.whisper,
                          fontStyle: 'italic',
                          color: glaze.silver,
                          marginLeft: 6,
                        }}
                      >
                        {capMeta.essence}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// COMPOSITION SELECTOR — list of compositions per type
// ═══════════════════════════════════════════════════════

function CompositionSelector({
  compositions,
  selected,
  onSelect,
}: {
  compositions: Composition[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {compositions.map(c => {
        const active = c.id === selected;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              fontFamily: font.serif,
              fontSize: typeSize.small,
              fontWeight: active ? weight.medium : weight.regular,
              color: active ? room.fg : glaze.silver,
              background: active ? glaze.thin : 'none',
              border: `1px solid ${active ? glaze.frost : 'transparent'}`,
              borderRadius: radii.pill,
              padding: '3px 10px',
              cursor: 'pointer',
              transition: timing.t.easeRespond,
              opacity: active ? 1 : opacity.bright,
            }}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CUES PAGE — The Orchestration Hub
// ═══════════════════════════════════════════════════════

export function CuesPage() {
  const [device, setDevice] = useState<Device>('phone');
  const [activeType, setActiveType] = useState<CompositionType>('pulse');
  const [selectedCompositionIds, setSelectedCompositionIds] = useState<Record<CompositionType, string>>(getDefaultSelections());
  const [playingComposition, setPlayingComposition] = useState<Composition | null>(null);
  const [lastRecord, setLastRecord] = useState<CompositionSessionRecord | null>(null);

  const meta = getCompositionMeta(activeType);
  const compositions = useMemo(() => getCompositionsByType(activeType), [activeType]);
  const selectedId = selectedCompositionIds[activeType];
  const selectedComposition = useMemo(
    () => compositions.find(c => c.id === selectedId) ?? compositions[0],
    [compositions, selectedId],
  );

  const handleSelectComposition = (id: string) => {
    setSelectedCompositionIds(prev => ({ ...prev, [activeType]: id }));
    // If currently playing, switch to the newly selected composition
    if (playingComposition) {
      const newComp = compositions.find(c => c.id === id);
      if (newComp) {
        setLastRecord(null);
        setPlayingComposition(newComp);
      }
    }
  };

  const handlePlay = () => {
    if (selectedComposition) {
      setLastRecord(null);
      setPlayingComposition(selectedComposition);
    }
  };

  const handleStop = () => {
    setPlayingComposition(null);
  };

  const handleCompositionComplete = (record: CompositionSessionRecord) => {
    setLastRecord(record);
    // Don't auto-clear — let the user see the completion state
  };

  const isPlaying = playingComposition !== null;

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100vh',
        paddingTop: 56,
        background: room.void,
        overflow: 'hidden',
      }}
    >
      {/* ── Top bar: Rhythm tabs ── */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-3"
        style={{ borderBottom: `1px solid ${glaze.thin}` }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {RHYTHM_TABS.map(tab => {
            const active = tab.type === activeType;
            return (
              <button
                key={tab.type}
                onClick={() => {
                  setActiveType(tab.type);
                  setPlayingComposition(null);
                  setLastRecord(null);
                }}
                className="relative flex items-center gap-1.5"
                style={{
                  fontFamily: font.sans,
                  fontSize: typeSize.detail,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.shelf,
                  textTransform: 'uppercase',
                  color: active ? room.fg : glaze.silver,
                  background: active ? glaze.thin : 'none',
                  border: 'none',
                  borderRadius: radii.pill,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  transition: timing.t.easeRespond,
                }}
              >
                {/* Beat count indicator */}
                <span
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 14,
                    height: 14,
                    fontSize: typeSize.whisper,
                    fontFamily: font.mono,
                    fontWeight: weight.medium,
                    color: active ? colors.accent.cyan.primary : glaze.dim,
                    border: `1px solid ${active ? colors.accent.cyan.primary + '40' : glaze.frost}`,
                    transition: timing.t.easeRespond,
                  }}
                >
                  {tab.beats}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-4">
          {(['phone', 'desktop'] as Device[]).map(d => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              style={{
                fontFamily: font.sans,
                fontSize: typeSize.label,
                fontWeight: weight.medium,
                letterSpacing: tracking.shelf,
                textTransform: 'uppercase',
                color: device === d ? glaze.milk : glaze.dim,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: timing.t.color,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content: Player + Mechanics ── */}
      <div className="flex-1 min-h-0 flex">

        {/* Left: Device mirror */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-4 pt-2 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full flex items-center justify-center"
            >
              <UniversalPlayer
                key={`${activeType}-player`}
                initialMode="sync"
                device={device}
                composition={playingComposition ?? undefined}
                onCompositionComplete={handleCompositionComplete}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Mechanics panel */}
        <div
          className="shrink-0 overflow-y-auto"
          style={{
            width: 320,
            borderLeft: `1px solid ${glaze.thin}`,
            padding: '16px 20px',
            background: room.void,
          }}
        >
          {/* Composition type header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Essence */}
              <div className="mb-4">
                <span
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.label,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.spread,
                    textTransform: 'uppercase',
                    color: colors.accent.cyan.primary,
                    opacity: opacity.strong,
                  }}
                >
                  {meta.beatCount}
                </span>
                <h2
                  style={{
                    fontFamily: font.serif,
                    fontSize: typeSize.title,
                    fontWeight: weight.light,
                    color: room.fg,
                    opacity: opacity.clear,
                    margin: 0,
                    lineHeight: leading.tight,
                  }}
                >
                  {meta.essence}
                </h2>
                <p
                  style={{
                    fontFamily: font.serif,
                    fontSize: typeSize.small,
                    fontStyle: 'italic',
                    color: room.fg,
                    opacity: opacity.voice,
                    lineHeight: leading.relaxed,
                    marginTop: 6,
                    maxWidth: '28rem',
                  }}
                >
                  {meta.philosophy}
                </p>
              </div>

              {/* Composition selector */}
              <div className="mb-4">
                <span
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.label,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.spread,
                    textTransform: 'uppercase',
                    color: glaze.smoke,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Compositions
                </span>
                <CompositionSelector
                  compositions={compositions}
                  selected={selectedId}
                  onSelect={handleSelectComposition}
                />
              </div>

              {/* Play / Stop control */}
              <div className="mb-4 flex items-center gap-3">
                <button
                  onClick={isPlaying ? handleStop : handlePlay}
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.detail,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.spread,
                    textTransform: 'uppercase',
                    color: isPlaying ? room.fg : colors.accent.cyan.primary,
                    background: isPlaying
                      ? colors.accent.cyan.primary + '15'
                      : colors.accent.cyan.primary + '0A',
                    border: `1px solid ${isPlaying
                      ? colors.accent.cyan.primary + '40'
                      : colors.accent.cyan.primary + '25'}`,
                    borderRadius: radii.pill,
                    padding: '6px 16px',
                    cursor: 'pointer',
                    transition: timing.t.easeRespond,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {/* Play/Stop icon */}
                  <div
                    style={{
                      width: isPlaying ? 8 : 0,
                      height: isPlaying ? 8 : 0,
                      borderRadius: isPlaying ? 1 : 0,
                      borderLeft: isPlaying ? 'none' : `6px solid ${colors.accent.cyan.primary}`,
                      borderTop: isPlaying ? 'none' : '4px solid transparent',
                      borderBottom: isPlaying ? 'none' : '4px solid transparent',
                      background: isPlaying ? colors.accent.cyan.primary : 'transparent',
                      transition: timing.t.easeRespond,
                    }}
                  />
                  {isPlaying ? 'Stop' : 'Play'}
                </button>

                {/* Playing indicator */}
                {isPlaying && playingComposition && (
                  <span
                    style={{
                      fontFamily: font.serif,
                      fontSize: typeSize.small,
                      fontStyle: 'italic',
                      color: colors.accent.cyan.primary,
                      opacity: opacity.strong,
                    }}
                  >
                    {playingComposition.name}
                  </span>
                )}

                {/* Completion indicator */}
                {lastRecord && !isPlaying && (
                  <span
                    style={{
                      fontFamily: font.mono,
                      fontSize: typeSize.label,
                      color: colors.status.green.bright,
                      letterSpacing: tracking.code,
                      opacity: opacity.strong,
                    }}
                  >
                    {lastRecord.completedFully ? 'complete' : 'exited'}{' '}
                    {lastRecord.captures.filter(c => c.mode !== 'none' && c.mode !== 'gesture').length} captures
                  </span>
                )}
              </div>

              {/* Selected composition mechanics */}
              {selectedComposition && (
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: `1px solid ${glaze.thin}`,
                  }}
                >
                  <MechanicsPanel composition={selectedComposition} />
                </div>
              )}

              {/* Invitation — the poetic close */}
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 12,
                  borderTop: `1px solid ${glaze.thin}`,
                }}
              >
                <span
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.label,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.spread,
                    textTransform: 'uppercase',
                    color: glaze.smoke,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Invitation
                </span>
                <p
                  style={{
                    fontFamily: font.serif,
                    fontSize: typeSize.reading,
                    fontStyle: 'italic',
                    fontWeight: weight.light,
                    color: room.fg,
                    opacity: opacity.steady,
                    lineHeight: leading.generous,
                    margin: 0,
                  }}
                >
                  {meta.invitation}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}