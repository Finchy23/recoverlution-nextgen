/**
 * TUNE SURFACE — The Discovery Tuner
 *
 * Not a library. Not a player. A frequency dial.
 *
 * The system serves up your next move. One practice fills the glass.
 * If it doesn't resonate, swipe or click the edge arrows — the next
 * one is closer. When it lands, tap ENTER. The glass breaks. You're inside.
 *
 * There is no catalog. No browse. No "150 videos available."
 * The illusion is infinite. The journey is guided.
 *
 * Spatial hierarchy (bottom → top):
 *   ORB CLEARANCE (0–110px)  — sacred orb territory, untouchable
 *   LANE CONSTELLATION       — five modality focal points, in the flow
 *   PRACTICE BLOCK            — eyebrow → headline → whisper → ENTER
 *   TUNE ARROWS               — peripheral, at viewport edges, vertically centered
 *   SIGNATURE ANIMATION       — full-viewport canvas behind everything
 *
 * Copy guardrails (see copy-guardrails.ts):
 *   Eyebrow: 4-char modality · Headline: max 28 chars · Description: max 80 chars
 *   No numbers. No time. No metrics. No library exposure.
 *
 * Data: content-runtime → useContentVideos (rail) + useJWMedia (detail)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useTemperature } from '../design-system/TemperatureGovernor';
import { useSurfaceArrival, STAGGER, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { useContentVideos, type ModalityId, type VideoPractice } from '../runtime/useContentVideos';
import { useJWMedia } from '../runtime/useJWMedia';
import { VideoShell, type VideoShellHandle } from './VideoShell';
import { ModalitySignature } from './ModalitySignature';
import { clampHeadline, clampDescription, sanitize, TYPOGRAPHY } from './copy-guardrails';
import { room, font, colors, tracking, typeSize, weight, opacity, timing, glow, radii, glaze, void_, refract, layer, signal, layout } from '../design-system/surface-tokens';

// ─── Modality identity ───

interface Modality {
  id: ModalityId;
  label: string;
  color: string;
}

const MODALITIES: Modality[] = [
  { id: 'breathwork',  label: 'RISE', color: colors.accent.cyan.primary },
  { id: 'meditation',  label: 'HOLD', color: signal.drift },
  { id: 'yoga',        label: 'FLOW', color: colors.status.green.bright },
  { id: 'fitness',     label: 'MOVE', color: colors.status.amber.bright },
  { id: 'nourishment', label: 'FUEL', color: room.fg },
];

function getModality(id: ModalityId): Modality {
  return MODALITIES.find(m => m.id === id) || MODALITIES[2];
}

// ─── Constants ───
const ORB_CLEARANCE = layout.orbClearance; // px — sacred orb territory

// ─── Surface states ──
type TunePhase = 'arrival' | 'surface' | 'dissolving' | 'immersion' | 'resurfacing';

// ─── Props ───
interface TuneSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

// ─── Session-stable shuffle ───
function shufflePractices(practices: VideoPractice[]): VideoPractice[] {
  const arr = [...practices];
  let seed = Date.now() % 10000;
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Component ───

export function TuneSurface({ mode, breath, onResolve }: TuneSurfaceProps) {
  const [phase, setPhase] = useState<TunePhase>('arrival');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [laneFilter, setLaneFilter] = useState<ModalityId | null>(null);
  const [anchored, setAnchored] = useState<Set<string>>(new Set());
  const [showAnchored, setShowAnchored] = useState(false);
  const videoShellRef = useRef<VideoShellHandle>(null);
  const dissolveTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const resurfaceTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  const { constraints } = useTemperature();
  const { arrived, delay } = useSurfaceArrival(mode);

  // ── Data ──
  const { practices: rawPractices, loading } = useContentVideos(200);

  const discoveryPool = useMemo(() => {
    let pool = shufflePractices(rawPractices);
    if (laneFilter) pool = pool.filter(p => p.modality === laneFilter);
    if (showAnchored) pool = pool.filter(p => anchored.has(p.id));
    return pool;
  }, [rawPractices, laneFilter, showAnchored, anchored]);

  const safeIndex = discoveryPool.length > 0 ? currentIndex % discoveryPool.length : 0;
  const activePractice = discoveryPool[safeIndex] || rawPractices[0];
  const currentMod = activePractice ? getModality(activePractice.modality) : MODALITIES[2];
  const isAnchored = activePractice ? anchored.has(activePractice.id) : false;

  // ── Video detail ──
  const shouldFetchDetail = (phase === 'dissolving' || phase === 'immersion' || phase === 'resurfacing') && !!activePractice?.jwMediaId;
  const { media: jwMedia } = useJWMedia({
    mediaId: activePractice?.jwMediaId || null,
    enabled: shouldFetchDetail,
  });

  // ── Phase transitions — unified arrival via useSurfaceArrival ──
  useEffect(() => {
    setPhase('arrival');
  }, [mode.id]);

  useEffect(() => {
    if (arrived && phase === 'arrival') {
      setPhase('surface');
    }
  }, [arrived, phase]);

  useEffect(() => {
    return () => {
      if (dissolveTimer.current) clearTimeout(dissolveTimer.current);
      if (resurfaceTimer.current) clearTimeout(resurfaceTimer.current);
    };
  }, []);

  useEffect(() => { setCurrentIndex(0); }, [laneFilter, showAnchored]);

  // ── Actions ──
  const tune = useCallback((dir: 1 | -1) => {
    if (discoveryPool.length === 0) return;
    setCurrentIndex(prev => {
      const next = prev + dir;
      if (next < 0) return discoveryPool.length - 1;
      if (next >= discoveryPool.length) return 0;
      return next;
    });
  }, [discoveryPool.length]);

  const breakGlass = useCallback(() => {
    setPhase('dissolving');
    dissolveTimer.current = setTimeout(() => setPhase('immersion'), 1200);
  }, []);

  const resurface = useCallback(() => {
    setPhase('resurfacing');
    resurfaceTimer.current = setTimeout(() => setPhase('surface'), 1400);
  }, []);

  const toggleAnchor = useCallback((id: string) => {
    setAnchored(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Touch tuning ──
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    const dt = Date.now() - touchStartTime.current;
    if (Math.abs(dy) > 40 && Math.abs(dy) / dt > 0.15) {
      tune(dy > 0 ? 1 : -1);
    }
  }, [tune]);

  // ── Derived ──
  const showSurface = phase !== 'immersion';
  const surfaceInteractive = phase === 'surface';

  // ── Loading ──
  if (loading && !activePractice) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="rounded-full"
          style={{ width: 6, height: 6, background: `radial-gradient(circle, ${currentMod.color}40, transparent)` }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      onTouchStart={surfaceInteractive ? handleTouchStart : undefined}
      onTouchEnd={surfaceInteractive ? handleTouchEnd : undefined}
    >
      {/* ═══ IMMERSION — Video fills the glass ═══ */}
      <VideoShell
        ref={videoShellRef}
        media={jwMedia}
        fallbackPoster={activePractice?.posterUrl}
        color={currentMod.color}
        active={phase === 'dissolving' || phase === 'immersion' || phase === 'resurfacing'}
        resurfacing={phase === 'resurfacing'}
        title={activePractice?.title || ''}
        breath={breath}
        modalityLabel={currentMod.label}
        onExit={resurface}
        onComplete={resurface}
      />

      {/* ═══ SURFACE — The Discovery Glass ═══ */}
      <AnimatePresence>
        {showSurface && activePractice && (
          <motion.div
            key="surface-layer"
            className="absolute inset-0"
            initial={phase === 'resurfacing' ? { opacity: 0, filter: refract.haze } : { opacity: 1 }}
            animate={{
              opacity: phase === 'dissolving' ? 0 : 1,
              filter: phase === 'dissolving' ? refract.medium : refract.clear,
            }}
            exit={{ opacity: 0, filter: refract.medium }}
            transition={{
              duration: phase === 'dissolving' ? 1.2 : phase === 'resurfacing' ? 1.4 : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* ── Background: Signature Animation ── */}
            <div className="absolute inset-0">
              <div className="absolute inset-0" style={{ background: room.void }} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePractice.modality + '-' + safeIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ModalitySignature modality={activePractice.modality} intensity={0.7} />
                </motion.div>
              </AnimatePresence>

              {/* Depth vignette */}
              <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, ${void_.shade} 100%)` }}
              />
              {/* Bottom depth — orb territory */}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to bottom, transparent 60%, ${void_.deep} 85%, ${void_.curtain} 100%)` }}
              />
            </div>

            {/* ── Tune Arrows — absolutely positioned to surface edges ── */}
            {surfaceInteractive && discoveryPool.length > 1 && (
              <>
                <motion.button
                  className="absolute cursor-pointer"
                  style={{
                    left: 8, top: '40%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    padding: '24px 12px', zIndex: layer.scrim,
                  }}
                  onClick={(e) => { e.stopPropagation(); tune(-1); }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay('peripherals'), duration: SURFACE_DURATION }}
                  whileHover={{ opacity: opacity.body, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="10" height="20" viewBox="0 0 10 20" fill="none">
                    <path d="M8 2L2 10L8 18" stroke={room.fg} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity={opacity.quiet} />
                  </svg>
                </motion.button>

                <motion.button
                  className="absolute cursor-pointer"
                  style={{
                    right: 8, top: '40%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    padding: '24px 12px', zIndex: layer.scrim,
                  }}
                  onClick={(e) => { e.stopPropagation(); tune(1); }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay('peripherals'), duration: SURFACE_DURATION }}
                  whileHover={{ opacity: opacity.body, x: 2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="10" height="20" viewBox="0 0 10 20" fill="none">
                    <path d="M2 2L8 10L2 18" stroke={room.fg} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity={opacity.quiet} />
                  </svg>
                </motion.button>
              </>
            )}

            {/* ── Content Column — flows from bottom, respects orb ── */}
            <div
              className="absolute inset-0 flex flex-col justify-end"
              style={{ zIndex: layer.raised, pointerEvents: surfaceInteractive ? 'auto' : 'none' }}
            >
              {/* Arrival canopy */}
              <AnimatePresence>
                {phase === 'arrival' && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.6 } }}
                    style={{ pointerEvents: 'none' }}
                  >
                    <p style={{
                      ...TYPOGRAPHY.description,
                      color: room.fg,
                      opacity: opacity.spoken,
                      textAlign: 'center',
                      maxWidth: '240px',
                    }}>
                      {mode.canopy}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Practice Block ── */}
              <AnimatePresence>
                {surfaceInteractive && (
                  <motion.div
                    className="relative px-7"
                    style={{ marginBottom: 24 }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20, transition: { duration: 0.4 } }}
                    transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Eyebrow */}
                    <motion.div
                      className="flex items-center gap-2.5 mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: delay('eyebrow'), duration: SURFACE_DURATION }}
                    >
                      <div
                        className="rounded-full"
                        style={{
                          width: 4, height: 4,
                          background: currentMod.color,
                          boxShadow: glow.mid(currentMod.color, '40'),
                          opacity: opacity.strong,
                        }}
                      />
                      <span style={{ ...TYPOGRAPHY.eyebrow, color: currentMod.color, opacity: opacity.voice }}>
                        {currentMod.label}
                      </span>
                    </motion.div>

                    {/* Headline */}
                    <AnimatePresence mode="wait">
                      <motion.h2
                        key={activePractice.id}
                        style={{ ...TYPOGRAPHY.headline, color: room.fg, opacity: opacity.clear, margin: 0 }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: opacity.clear, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {clampHeadline(sanitize(activePractice.title))}
                      </motion.h2>
                    </AnimatePresence>

                    {/* Description whisper */}
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={activePractice.id + '-d'}
                        style={{
                          ...TYPOGRAPHY.description,
                          color: room.fg, opacity: opacity.gentle,
                          marginTop: 8, maxWidth: '85%',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: opacity.gentle }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        {clampDescription(sanitize(activePractice.subtitle))}
                      </motion.p>
                    </AnimatePresence>

                    {/* Gesture — break the glass */}
                    <motion.div
                      className="mt-5 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); breakGlass(); }}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ width: 'fit-content' }}
                    >
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: 16, height: 1,
                          background: `linear-gradient(90deg, transparent, ${currentMod.color}25)`,
                        }} />
                        <span style={{
                          ...TYPOGRAPHY.gesture,
                          color: currentMod.color, opacity: opacity.haze,
                          textTransform: 'uppercase',
                        }}>
                          ENTER
                        </span>
                      </div>
                    </motion.div>

                    {/* Anchor + Saved — top right of this block */}
                    <div className="absolute flex items-center gap-2" style={{ right: 0, top: 0 }}>
                      {anchored.size > 0 && (
                        <motion.button
                          className="cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setShowAnchored(!showAnchored); }}
                          style={{ background: 'none', border: 'none', padding: '4px 2px' }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span style={{
                            ...TYPOGRAPHY.gesture,
                            color: showAnchored ? room.fg : glaze.sheen,
                            opacity: showAnchored ? opacity.steady : opacity.spoken,
                          }}>
                            SAVED
                          </span>
                        </motion.button>
                      )}
                      <motion.button
                        className="cursor-pointer"
                        style={{ background: 'none', border: 'none', padding: 6 }}
                        onClick={(e) => { e.stopPropagation(); if (activePractice) toggleAnchor(activePractice.id); }}
                        whileTap={{ scale: 0.85 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay('peripherals') }}
                      >
                        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                          {isAnchored ? (
                            <path d="M9 2L11.5 7L17 7.5L13 11.5L14 17L9 14L4 17L5 11.5L1 7.5L6.5 7L9 2Z"
                              fill={currentMod.color} opacity={opacity.steady} />
                          ) : (
                            <path d="M9 2L11.5 7L17 7.5L13 11.5L14 17L9 14L4 17L5 11.5L1 7.5L6.5 7L9 2Z"
                              stroke={currentMod.color} strokeWidth="0.8" opacity={opacity.ambient} fill="none" />
                          )}
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Lane Constellation — in the flow, above orb clearance ── */}
              <AnimatePresence>
                {surfaceInteractive && (
                  <motion.div
                    style={{ paddingBottom: ORB_CLEARANCE, paddingTop: 0 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8, transition: { duration: 0.4 } }}
                    transition={{ delay: delay('controls'), duration: SURFACE_DURATION, ease: SURFACE_EASE as unknown as number[] }}
                  >
                    <div className="flex items-center justify-center gap-5 px-6">
                      {MODALITIES.map((mod, i) => {
                        const isActive = laneFilter === mod.id;
                        const isCurrentLane = activePractice?.modality === mod.id && !laneFilter;

                        return (
                          <motion.button
                            key={mod.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLaneFilter(prev => prev === mod.id ? null : mod.id);
                              setShowAnchored(false);
                            }}
                            className="flex flex-col items-center gap-1.5 cursor-pointer relative"
                            style={{ background: 'none', border: 'none', padding: '4px 2px' }}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: delay('controls') + i * 0.06, duration: SURFACE_DURATION * 0.6 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.92 }}
                          >
                            {/* Refractive haze */}
                            <div
                              className="absolute rounded-full"
                              style={{
                                width: isActive ? 32 : 20,
                                height: isActive ? 32 : 20,
                                top: '15%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: `radial-gradient(circle, ${mod.color}${isActive ? '14' : isCurrentLane ? '0a' : '05'} 0%, transparent 70%)`,
                                transition: timing.t.colorOpacity,
                              }}
                            />

                            {/* Focal core */}
                            <div
                              className="rounded-full"
                              style={{
                                width: isActive ? 6 : isCurrentLane ? 5 : 3,
                                height: isActive ? 6 : isCurrentLane ? 5 : 3,
                                background: `radial-gradient(circle at 40% 38%, ${mod.color}${isActive ? '55' : isCurrentLane ? '40' : '20'}, ${mod.color}10 70%, transparent 100%)`,
                                boxShadow: isActive
                                  ? glow.halo(mod.color, 10, 20, '35', '12')
                                  : isCurrentLane ? glow.dot(mod.color, '20') : 'none',
                                transition: timing.t.settle,
                              }}
                            />

                            {/* Label */}
                            <span style={{
                              fontFamily: font.sans,
                              fontSize: typeSize.micro, fontWeight: weight.medium,
                              letterSpacing: tracking.spread,
                              color: isActive || isCurrentLane ? mod.color : glaze.dim,
                              opacity: isActive ? opacity.strong : isCurrentLane ? opacity.voice : opacity.gentle,
                              transition: timing.t.colorOpacity,
                              whiteSpace: 'nowrap',
                            }}>
                              {mod.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}