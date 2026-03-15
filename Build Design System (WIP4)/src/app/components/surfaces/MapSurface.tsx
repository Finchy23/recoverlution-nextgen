/**
 * ∞MAP SURFACE — The Neural Clusters
 * (The Clinical Architecture of the Mind)
 *
 * Six territories. Six constellations.
 * One fills the glass at a time.
 * Swipe to traverse the landscape.
 *
 * The node IS the surface. No copy competes.
 * Tap the constellation to descend: whisper,
 * hardware, tags surface as progressive disclosure.
 *
 * A breadcrumb of six dots at the top
 * traces where you are in the field.
 *
 * No reds. No danger signaling.
 * Integration shows as luminance within the cluster's
 * own color. Dim is early. Bright is embodied.
 *
 * Architecture of Resonance:
 * constellation meets neuroscience meets innovation.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { FORM_PRACTICES } from '../form/form-practices';
import { CLUSTERS, type MindblockDot, type NeuralCluster } from '../runtime/map-model';
import { useMapConstellation } from '../runtime/useMapConstellation';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import {
  room, font, layout, tracking, typeSize, leading, weight,
  opacity, timing, void_, layer, signal,
} from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const ORB_CLEARANCE = layout.orbClearance;

// ═══════════════════════════════════════════════════
// BREADCRUMB — The six-node horizon trace
// ═══════════════════════════════════════════════════

interface BreadcrumbProps {
  activeIdx: number;
  breath: number;
}

function ClusterBreadcrumb({ activeIdx, breath }: BreadcrumbProps) {
  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        top: '5%', left: 0, right: 0,
        zIndex: layer.raised,
        gap: 0,
      }}
    >
      {CLUSTERS.map((c, i) => {
        const isActive = i === activeIdx;
        const breathPulse = Math.sin(breath * Math.PI * 2 + i * 0.5) * 0.1;

        return (
          <div key={c.id} className="flex items-center">
            {/* Connecting filament */}
            {i > 0 && (
              <motion.div
                style={{
                  width: 18,
                  height: 1,
                  background: i <= activeIdx
                    ? CLUSTERS[i - 1].color
                    : room.fg,
                  marginLeft: -1,
                  marginRight: -1,
                }}
                animate={{
                  opacity: i === activeIdx || i === activeIdx + 1
                    ? 0.15
                    : 0.04,
                }}
                transition={{ duration: 0.6 }}
              />
            )}

            {/* Node dot */}
            <motion.div
              style={{
                width: isActive ? 6 : 4,
                height: isActive ? 6 : 4,
                borderRadius: '50%',
                background: c.color,
                position: 'relative',
              }}
              animate={{
                opacity: isActive ? 0.7 + breathPulse : 0.12,
                scale: isActive ? 1 : 0.85,
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Active glow ring */}
              {isActive && (
                <motion.div
                  className="absolute"
                  style={{
                    inset: -4,
                    borderRadius: '50%',
                    border: `1px solid ${c.color}`,
                  }}
                  animate={{
                    opacity: [0.08, 0.18, 0.08],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// FULL-SCREEN CONSTELLATION — one cluster fills the view
// ═══════════════════════════════════════════════════

interface ConstellationProps {
  cluster: NeuralCluster;
  dots: MindblockDot[];
  breath: number;
  expanded: boolean;
  onTap: () => void;
  viewport: { width: number; height: number };
}

function Constellation({ cluster, dots, breath, expanded, onTap, viewport }: ConstellationProps) {
  // Center the constellation in the available vertical space
  const centerY = (viewport.height - ORB_CLEARANCE) * 0.44;
  const centerX = viewport.width / 2;

  // Scale dots based on viewport (larger on bigger screens)
  const scale = Math.min(1, viewport.width / 375) * Math.min(1, (viewport.height - ORB_CLEARANCE) / 600);
  const dotScale = 0.9 + scale * 0.4;

  return (
    <div
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onClick={onTap}
    >
      {/* ── Atmospheric glow behind the cluster ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 280 * dotScale,
          height: 280 * dotScale,
          borderRadius: '50%',
          left: centerX - 140 * dotScale,
          top: centerY - 140 * dotScale,
          background: `radial-gradient(circle at 50% 50%, ${cluster.color}08 0%, ${cluster.color}03 40%, transparent 70%)`,
        }}
        animate={{
          scale: expanded ? 1.2 : 0.95 + Math.sin(breath * Math.PI * 2) * 0.04,
          opacity: expanded ? 1.3 : 1,
        }}
        transition={{ duration: expanded ? 0.6 : 5, ease: 'easeInOut' }}
      />

      {/* ── Second atmospheric ring — depth ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 400 * dotScale,
          height: 400 * dotScale,
          borderRadius: '50%',
          left: centerX - 200 * dotScale,
          top: centerY - 200 * dotScale,
          background: `radial-gradient(circle at 50% 50%, ${cluster.color}04 0%, transparent 60%)`,
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── The dots ── */}
      {dots.map((dot, di) => {
        const breathCycle = breath * Math.PI * 2;
        const driftX = Math.sin(breathCycle + dot.phase) * (1 - dot.depth) * 2;
        const driftY = Math.cos(breathCycle * 0.7 + dot.phase + 1) * (1 - dot.depth) * 1.5;

        // No reds: integration shows as luminance within the cluster's own color
        // Dim = early, bright = embodied, glow = deeply integrated
        const luminance = 0.08 + dot.integration * 0.55;
        const hasGlow = dot.integration > 0.5;
        const isIntegrated = dot.integration > 0.7;

        const dotColor = isIntegrated ? signal.anchor : cluster.color;

        const x = centerX + dot.offsetX * dotScale;
        const y = centerY + dot.offsetY * dotScale;

        return (
          <motion.div
            key={dot.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: dot.radius * 2 * dotScale,
              height: dot.radius * 2 * dotScale,
              left: x - dot.radius * dotScale,
              top: y - dot.radius * dotScale,
              background: dotColor,
              boxShadow: hasGlow
                ? `0 0 ${6 + dot.integration * 8}px ${dotColor}25, 0 0 ${2 + dot.integration * 3}px ${dotColor}15`
                : 'none',
            }}
            animate={{
              opacity: luminance,
              x: driftX,
              y: driftY,
              scale: expanded ? 1.1 + dot.integration * 0.15 : 1,
            }}
            transition={{
              duration: expanded ? 0.5 : 4,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* ── Inter-dot threads — very faint neural pathways ── */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={viewport.width}
        height={viewport.height}
        style={{ overflow: 'visible' }}
      >
        {dots.slice(0, -1).map((dot, i) => {
          const next = dots[(i + 1) % dots.length];
          if (!next) return null;
          const combined = (dot.integration + next.integration) / 2;
          if (combined < 0.03) return null;

          return (
            <line
              key={`t-${i}`}
              x1={centerX + dot.offsetX * dotScale}
              y1={centerY + dot.offsetY * dotScale}
              x2={centerX + next.offsetX * dotScale}
              y2={centerY + next.offsetY * dotScale}
              stroke={cluster.color}
              strokeWidth={0.4 + combined * 0.3}
              strokeOpacity={0.03 + combined * 0.04}
            />
          );
        })}
      </svg>

      {/* ── Cluster name — quiet, below the constellation ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: 0, right: 0,
          top: centerY + 90 * dotScale,
          textAlign: 'center',
        }}
        animate={{
          opacity: expanded ? 0.5 : 0.2,
          y: expanded ? 8 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span style={{
          fontFamily: SANS,
          fontSize: typeSize.whisper,
          fontWeight: weight.medium,
          letterSpacing: tracking.wide,
          textTransform: 'uppercase',
          color: cluster.color,
        }}>
          {cluster.name}
        </span>
      </motion.div>

      {/* ── Hardware trace — ghost whisper below name ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: 0, right: 0,
          top: centerY + 90 * dotScale + 22,
          textAlign: 'center',
        }}
        animate={{
          opacity: expanded ? opacity.trace : 0,
          y: expanded ? 8 : -2,
        }}
        transition={{ duration: 0.6, delay: expanded ? 0.15 : 0 }}
      >
        <span style={{
          fontFamily: SANS,
          fontSize: typeSize.trace,
          fontWeight: weight.regular,
          letterSpacing: tracking.snug,
          color: cluster.color,
        }}>
          {cluster.hardware}
        </span>
      </motion.div>

      {/* ── Expanded: Whisper ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: '10%', right: '10%',
              top: centerY + 90 * dotScale + 48,
              textAlign: 'center',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: opacity.spoken, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{
              fontFamily: SERIF,
              fontSize: 'clamp(13px, 3.4vw, 17px)',
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              lineHeight: leading.breath,
            }}>
              {cluster.whisper}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Expanded: Tags ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="absolute pointer-events-none flex justify-center gap-3 flex-wrap"
            style={{
              left: '8%', right: '8%',
              top: centerY + 90 * dotScale + 100,
              textAlign: 'center',
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {cluster.tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontFamily: SANS,
                  fontSize: typeSize.trace,
                  fontWeight: weight.regular,
                  letterSpacing: tracking.snug,
                  color: cluster.color,
                  opacity: opacity.quiet,
                  textTransform: 'uppercase',
                }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAP SURFACE — Main Component
// ═══════════════════════════════════════════════════

interface MapSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
  onNavigate?: (modeId: string) => void;
}

export function MapSurface({ mode, breath, onNavigate }: MapSurfaceProps) {
  const resilience = useResilience();
  const [{ clusterDots, loaded }, { seedTalkExploration }] = useMapConstellation();
  const [activeIdx, setActiveIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });
  const [transitioning, setTransitioning] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const { arrived, delay } = useSurfaceArrival(mode);

  // ── Viewport ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setViewport({ width, height });
    });
    ro.observe(el);
    setViewport({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // ── Navigation ──
  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= CLUSTERS.length || idx === activeIdx || transitioning) return;
    setSlideDir(idx > activeIdx ? 'left' : 'right');
    setExpanded(false);
    setTransitioning(true);
    setTimeout(() => {
      setActiveIdx(idx);
      setTimeout(() => setTransitioning(false), 50);
    }, 280);
  }, [activeIdx, transitioning]);

  // ── Swipe detection ──
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const start = dragStartRef.current;
    if (!start) return;
    dragStartRef.current = null;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = Date.now() - start.time;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Swipe threshold: at least 40px horizontal, mostly horizontal, under 500ms
    if (absDx > 40 && absDx > absDy * 1.2 && dt < 500) {
      if (dx < 0) {
        // Swipe left → next
        goTo(activeIdx + 1);
      } else {
        // Swipe right → prev
        goTo(activeIdx - 1);
      }
      return;
    }

    // If minimal movement, treat as tap
    if (absDx < 10 && absDy < 10) {
      setExpanded(prev => !prev);
    }
  }, [activeIdx, goTo]);

  const current = CLUSTERS[activeIdx];
  const currentDots = clusterDots.get(current.id) || [];

  // ── Bridge nudge data ──
  const avgIntegration = currentDots.length > 0
    ? currentDots.reduce((a, d) => a + d.integration, 0) / currentDots.length
    : 0;

  const practice = FORM_PRACTICES.find(p => {
    const chapterPracticeMap: Record<string, string> = {
      'CALM': 'baseline', 'WIRE': 'rewire', 'BOND': 'bridge',
      'ROOT': 'baseline', 'EDGE': 'rewire', 'SELF': 'bridge',
    };
    return p.pillar === chapterPracticeMap[current.chapterWord];
  });

  // Slide animation variants
  const slideVariants = {
    enter: (dir: string) => ({
      opacity: 0,
      x: dir === 'left' ? 60 : -60,
      scale: 0.96,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: (dir: string) => ({
      opacity: 0,
      x: dir === 'left' ? -60 : 60,
      scale: 0.96,
    }),
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{ touchAction: 'none', cursor: 'default' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragStartRef.current = null; }}
    >
      {/* ── Void ── */}
      <div className="absolute inset-0" style={{ background: room.void }} />

      {/* ── Glass depth ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 75% 60% at 50% 45%, ${room.deep}80 0%, ${room.void} 100%)`,
        }}
      />

      {/* ── Active cluster atmosphere — color bleeds into the glass ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id + '-atmo'}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 55% 50% at 50% 42%, ${current.color} 0%, transparent 70%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 + Math.sin(breath * Math.PI * 2) * 0.01 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* ── Breadcrumb ── */}
      {arrived && loaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: SURFACE_DURATION, delay: delay('eyebrow'), ease: SURFACE_EASE as any }}
        >
          <ClusterBreadcrumb activeIdx={activeIdx} breath={breath} />
        </motion.div>
      )}

      {/* ── The Constellation — full screen, one at a time ── */}
      <AnimatePresence mode="wait" custom={slideDir}>
        {arrived && loaded && !transitioning && (
          <motion.div
            key={current.id}
            className="absolute inset-0"
            custom={slideDir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Constellation
              cluster={current}
              dots={currentDots}
              breath={breath}
              expanded={expanded}
              onTap={() => setExpanded(prev => !prev)}
              viewport={viewport}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bridge nudge — bottom, only when expanded ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="absolute pointer-events-auto"
            style={{
              bottom: ORB_CLEARANCE + 20,
              left: '10%', right: '10%',
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {avgIntegration < 0.3 ? (
              <div
                className="cursor-pointer"
                style={{ opacity: opacity.ambient }}
                onClick={() => onNavigate?.('know')}
              >
                <span style={{
                  fontFamily: SERIF,
                  fontSize: typeSize.label,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: current.color,
                  display: 'block', marginBottom: 3,
                }}>
                  There is something here worth understanding
                </span>
                <span style={{
                  fontFamily: SANS,
                  fontSize: typeSize.trace,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.normal,
                  color: room.fg,
                  opacity: opacity.trace,
                }}>
                  KNOW → {current.chapterWord}
                </span>
              </div>
            ) : avgIntegration < 0.7 && practice ? (
              <div
                className="cursor-pointer"
                style={{ opacity: opacity.ambient }}
                onClick={() => onNavigate?.('hone')}
              >
                <span style={{
                  fontFamily: SERIF,
                  fontSize: typeSize.label,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: current.color,
                  display: 'block', marginBottom: 3,
                }}>
                  The knowing is ready for the body
                </span>
                <span style={{
                  fontFamily: SANS,
                  fontSize: typeSize.trace,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.normal,
                  color: room.fg,
                  opacity: opacity.trace,
                }}>
                  HONE → {practice.name.toUpperCase()}
                </span>
              </div>
            ) : avgIntegration >= 0.7 ? (
              <div style={{ opacity: opacity.trace }}>
                <span style={{
                  fontFamily: SERIF,
                  fontSize: typeSize.label,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: signal.anchor,
                }}>
                  This territory is integrating
                </span>
              </div>
            ) : (
              <div
                className="cursor-pointer"
                style={{ opacity: opacity.trace }}
                onClick={() => {
                  void seedTalkExploration(current).catch((error) => {
                    console.error('[∞MAP→TALK] Seed persist failed:', error);
                  });
                  onNavigate?.('talk');
                }}
              >
                <span style={{
                  fontFamily: SANS,
                  fontSize: typeSize.trace,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.normal,
                  color: room.fg,
                }}>
                  TALK → EXPLORE THIS
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─�� Swipe hint — only when first arriving, fades after ── */}
      <AnimatePresence>
        {arrived && loaded && !expanded && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              bottom: ORB_CLEARANCE + 20,
              left: 0, right: 0,
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.ghost }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, delay: delay('peripherals'), ease: SURFACE_EASE as any }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.trace,
              fontWeight: weight.regular,
              letterSpacing: tracking.snug,
              color: room.fg,
            }}>
              {activeIdx === 0 ? 'swipe to traverse' : `${activeIdx + 1} of ${CLUSTERS.length}`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="map" />

      {/* ── Orb clearance ── */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: ORB_CLEARANCE,
          background: `linear-gradient(to top, ${void_.haze} 0%, transparent 100%)`,
          zIndex: layer.overlay,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
