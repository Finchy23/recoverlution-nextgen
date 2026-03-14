/**
 * INSIGHT SURFACE — The Anatomy of Truth (SEEK)
 *
 * The cinematic chassis. A scene-driven discovery engine that takes
 * massive, abstract, lifelong pain and breaks it into micro-intense
 * learning arcs. Fuses narrative with physics. Measures the shift
 * through silent telemetry — no questionnaires, no multiple choice.
 *
 * When the user enters SEEK from KNOW, they first see the insight
 * browser — a selection of available ghosts to illuminate. Selecting
 * one enters the cinematic arc: Entry → Transfer → Ascertainment.
 *
 * The engine renders the arc. The blocks are the wheels.
 * The insight is the destination.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival, STAGGER, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { SeekEngine } from '../seek/SeekEngine';
import { SEEK_INSIGHTS } from '../seek/seek-insights';
import type { SeekInsight, SeekTelemetry } from '../seek/seek-types';
import { useSeekTelemetry } from '../runtime/useSeekTelemetry';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import { room, font, typeSize, tracking, opacity as op, leading, weight, timing, glaze, layer, layout } from '../design-system/surface-tokens';

const ORB_CLEARANCE = layout.orbClearance;
const SANS = font.sans;

interface InsightSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

export function InsightSurface({ mode, breath, onResolve }: InsightSurfaceProps) {
  const userId = useIndividualId();
  const resilience = useResilience();
  const [selectedInsight, setSelectedInsight] = useState<SeekInsight | null>(null);
  const [browsing, setBrowsing] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [kbeConfirmation, setKbeConfirmation] = useState<{ knowing: number; believing: number } | null>(null);
  const { arrived, delay } = useSurfaceArrival(mode);
  const { send: sendTelemetry } = useSeekTelemetry(userId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });

  // Viewport tracking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setViewport({ width, height });
    });
    ro.observe(el);
    setViewport({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  const handleSelectInsight = useCallback((insight: SeekInsight) => {
    setSelectedInsight(insight);
    setBrowsing(false);
  }, []);

  const handleComplete = useCallback((telemetry: SeekTelemetry) => {
    console.log('[SEEK] Arc complete — telemetry:', telemetry);
    sendTelemetry(telemetry);

    // ── SEEK → ∞MAP: Show K.B.E. bump confirmation ──
    setKbeConfirmation({
      knowing: telemetry.knowingScore,
      believing: telemetry.believingScore,
    });
    console.log(`[SEEK→∞MAP] K.B.E. bump: K=${telemetry.knowingScore.toFixed(2)} B=${telemetry.believingScore.toFixed(2)} for ${telemetry.insightId}`);

    // Auto-dismiss after 4 seconds
    setTimeout(() => setKbeConfirmation(null), 4000);
  }, [sendTelemetry]);

  const handleExit = useCallback(() => {
    setSelectedInsight(null);
    setBrowsing(true);
  }, []);

  const breathScale = 1 + Math.sin(breath * Math.PI * 2) * 0.008;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden select-none">
      {/* ═══ INSIGHT BROWSER ═══ */}
      <AnimatePresence>
        {browsing && arrived && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            transition={{ duration: 1 }}
          >
            {/* Background */}
            <div className="absolute inset-0" style={{ background: room.void }} />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${mode.color}04 0%, transparent 70%)`,
                transform: `scale(${breathScale})`,
              }}
            />

            {/* Header */}
            <div
              className="relative pt-[8%] pb-[3%] px-[10%]"
              style={{ zIndex: layer.base }}
            >
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: op.ambient, y: 0 }}
                transition={{ delay: delay('content'), duration: 1 }}
                style={{
                  fontFamily: SANS,
                  fontSize: typeSize.micro,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.wide,
                  textTransform: 'uppercase',
                  color: mode.color,
                }}
              >
                SEEK
              </motion.span>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: op.spoken, y: 0 }}
                transition={{ delay: delay('content') + 0.2, duration: 1.2, ease: SURFACE_EASE as unknown as number[] }}
                style={{
                  fontFamily: font.serif,
                  fontSize: 'clamp(16px, 4vw, 22px)',
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: room.fg,
                  marginTop: 8,
                  lineHeight: leading.firm,
                }}
              >
                Step into the arc.
              </motion.p>
            </div>

            {/* Insight list */}
            <div
              className="relative overflow-y-auto px-[8%] pb-[15%]"
              style={{
                zIndex: layer.base,
                height: `calc(100% - 100px)`,
                scrollbarWidth: 'none',
              }}
            >
              {SEEK_INSIGHTS.map((insight, i) => {
                const isHovered = hoveredId === insight.id;

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: delay('content') + 0.4 + i * 0.15,
                      duration: 1,
                      ease: SURFACE_EASE as unknown as number[],
                    }}
                    onPointerEnter={() => setHoveredId(insight.id)}
                    onPointerLeave={() => setHoveredId(null)}
                    onClick={() => handleSelectInsight(insight)}
                    style={{
                      cursor: 'pointer',
                      padding: '20px 0',
                      position: 'relative',
                    }}
                  >
                    {/* Hover refraction */}
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        inset: '-8px -16px',
                        background: isHovered
                          ? `radial-gradient(ellipse 100% 80% at 30% 50%, ${insight.color}06 0%, transparent 70%)`
                          : 'none',
                        transition: timing.t.bgSettle,
                      }}
                    />

                    {/* Separator */}
                    {i > 0 && (
                      <div
                        className="absolute top-0 left-0 right-0"
                        style={{
                          height: '0.5px',
                          background: `linear-gradient(90deg, transparent 0%, ${isHovered ? glaze.frost : glaze.faint} 30%, ${isHovered ? glaze.frost : glaze.faint} 70%, transparent 100%)`,
                          transition: timing.t.bgShift,
                        }}
                      />
                    )}

                    <div className="relative">
                      {/* Ghost title */}
                      <p style={{
                        fontFamily: font.serif,
                        fontSize: 'clamp(16px, 4vw, 20px)',
                        fontWeight: weight.light,
                        color: room.fg,
                        opacity: isHovered ? op.strong : op.steady,
                        margin: 0,
                        lineHeight: leading.firm,
                        transition: timing.t.fadeMid,
                      }}>
                        {insight.title}
                      </p>

                      {/* Schema */}
                      <p style={{
                        fontFamily: SANS,
                        fontSize: typeSize.label,
                        fontWeight: weight.medium,
                        letterSpacing: tracking.snug,
                        textTransform: 'uppercase',
                        color: insight.color,
                        opacity: isHovered ? op.spoken : op.quiet,
                        marginTop: 6,
                        transition: timing.t.fadeMid,
                      }}>
                        {insight.schema}
                      </p>

                      {/* Essence */}
                      <p style={{
                        fontFamily: font.serif,
                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                        fontWeight: weight.light,
                        fontStyle: 'italic',
                        color: room.fg,
                        opacity: isHovered ? op.gentle : op.quiet,
                        marginTop: 6,
                        lineHeight: leading.compact,
                        transition: timing.t.fadeMid,
                      }}>
                        {insight.essence}
                      </p>

                      {/* Scene count */}
                      <div className="flex items-center gap-3" style={{ marginTop: 8 }}>
                        <span style={{
                          fontFamily: font.mono,
                          fontSize: typeSize.micro,
                          color: glaze.haze,
                        }}>
                          {insight.scenes.length} scenes
                        </span>
                        {/* Phase indicators */}
                        <div className="flex items-center gap-1">
                          {['entry', 'transfer', 'ascertain'].map((p) => {
                            const count = insight.scenes.filter(s => s.phase === p).length;
                            return (
                              <span
                                key={p}
                                style={{
                                  fontFamily: SANS,
                                  fontSize: typeSize.trace,
                                  fontWeight: weight.medium,
                                  letterSpacing: tracking.label,
                                  textTransform: 'uppercase',
                                  color: isHovered ? insight.color : glaze.frost,
                                  opacity: isHovered ? op.spoken : 1,
                                  transition: timing.t.colorShift,
                                }}
                              >
                                {p[0].toUpperCase()}{count}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom fade */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: ORB_CLEARANCE + 40,
                background: `linear-gradient(to top, ${room.void} 30%, transparent 100%)`,
                zIndex: layer.content,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SEEK ENGINE — Active Arc ═══ */}
      <AnimatePresence>
        {!browsing && selectedInsight && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <SeekEngine
              insight={selectedInsight}
              breath={breath}
              viewport={viewport}
              onComplete={handleComplete}
              onExit={handleExit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ K.B.E. BUMP CONFIRMATION — SEEK → ∞MAP ═══ */}
      <AnimatePresence>
        {kbeConfirmation && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: '8%',
              left: '15%',
              right: '15%',
              textAlign: 'center',
              zIndex: layer.cue,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.trace,
              fontWeight: weight.medium,
              letterSpacing: tracking.wide,
              textTransform: 'uppercase',
              color: mode.color,
              opacity: op.ambient,
              display: 'block',
            }}>
              ∞MAP · K.B.E. UPDATED
            </span>
            <div className="flex justify-center gap-4 mt-2">
              <span style={{
                fontFamily: SANS,
                fontSize: typeSize.micro,
                fontWeight: weight.regular,
                color: room.fg,
                opacity: op.murmur,
              }}>
                K {Math.round(kbeConfirmation.knowing * 100)}
              </span>
              <span style={{
                fontFamily: SANS,
                fontSize: typeSize.micro,
                fontWeight: weight.regular,
                color: room.fg,
                opacity: op.murmur,
              }}>
                B {Math.round(kbeConfirmation.believing * 100)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="seek" />
    </div>
  );
}