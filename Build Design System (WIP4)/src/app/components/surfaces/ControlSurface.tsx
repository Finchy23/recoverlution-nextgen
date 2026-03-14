/**
 * CONTROL SURFACE — The Architecture of Proof
 *
 * Proof becomes graph geometry. K/B/E should be felt before it is read.
 * Support becomes proximity. Support rank and live cast speak before labels.
 *
 * Room Physics:
 *   Gravitational Proof — K.B.E. nodes exert gravitational pull
 *   Touch near a node pulls you toward it (cursor gravity)
 *   Holding a node triggers proof expansion (data radiates outward)
 *   Connecting two nodes reveals the pathway between stages
 *
 * Five-step transition (§2.5):
 *   Arrival     — cryo atmosphere, geometry space opens (0ms)
 *   Threshold   — K.B.E. nodes materialize with canopy (1000ms)
 *   Live State  — touch nodes, proof geometry reacts
 *   Shift       — a node resolves, pathway illuminates
 *   Seal        — proof is stamped, trace particle persists
 *
 * Death of the Box: K.B.E. nodes are refractive pools of light,
 * not bordered circles. Connection lines are luminous threads.
 * No bordered containers anywhere.
 *
 * Attenuation: surface (clean field for proof geometry)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { hapticTick, hapticPressure, hapticResolve, hapticSeal } from './haptics';
import { useTemperature, shouldShowCopy, governedDuration } from '../design-system/TemperatureGovernor';
import { useSurfaceArrival } from './useSurfaceArrival';
import { room, font, colors, tracking, typeSize, weight, opacity, timing, glow, glaze } from '../design-system/surface-tokens';
import { governedAcoustic } from './acoustics';

const HOLD_TO_PROVE_MS = 1600;

const KBE_NODES = [
  { id: 'K', name: 'Knowing', x: 30, y: 35, color: colors.brand.purple.mid, proofLabel: 'Recognition' },
  { id: 'B', name: 'Believing', x: 55, y: 58, color: colors.status.amber.mid, proofLabel: 'Conviction' },
  { id: 'E', name: 'Embodying', x: 72, y: 34, color: colors.accent.green.primary, proofLabel: 'Integration' },
] as const;

interface ControlSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

export function ControlSurface({ mode, breath, onResolve }: ControlSurfaceProps) {
  const [phase, setPhase] = useState<'arrival' | 'threshold' | 'live' | 'shift' | 'seal'>('arrival');
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [resolvedNode, setResolvedNode] = useState<number | null>(null);
  const holdStartRef = useRef(0);
  const rafRef = useRef(0);

  const { constraints } = useTemperature();
  const { arrived } = useSurfaceArrival(mode);
  const governedProveMs = governedDuration(HOLD_TO_PROVE_MS, constraints);

  useEffect(() => {
    setPhase('arrival');
    setResolved(false);
    setResolvedNode(null);
    setHoldProgress(0);
    setActiveNode(null);
  }, [mode.id]);

  useEffect(() => {
    if (arrived && phase === 'arrival') {
      setPhase('threshold');
    }
  }, [arrived, phase]);

  // Hold progress loop
  useEffect(() => {
    const tick = () => {
      if (holding && activeNode !== null && !resolved) {
        const elapsed = performance.now() - holdStartRef.current;
        const progress = Math.min(1, elapsed / governedProveMs);
        setHoldProgress(progress);
        if (progress > 0.2) {
          hapticPressure(progress);
          governedAcoustic(constraints.band, 'weight', progress);
        }
        if (progress >= 0.85) {
          hapticResolve();
          governedAcoustic(constraints.band, 'resolve');
          setResolved(true);
          setResolvedNode(activeNode);
          setHolding(false);
          setPhase('shift');
          setTimeout(() => {
            setPhase('seal');
            hapticSeal();
            governedAcoustic(constraints.band, 'seal');
            onResolve?.();
          }, governedDuration(1200, constraints));
          return;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [holding, activeNode, resolved, onResolve, constraints, governedProveMs]);

  const handleNodeDown = useCallback((index: number) => {
    if (resolved) return;
    if (phase === 'threshold' || phase === 'arrival') setPhase('live');
    setActiveNode(index);
    setHolding(true);
    holdStartRef.current = performance.now();
    hapticTick();
    governedAcoustic(constraints.band, 'tick');
  }, [phase, resolved, constraints]);

  const handlePointerUp = useCallback(() => {
    setHolding(false);
    if (!resolved) {
      setHoldProgress(0);
      setActiveNode(null);
    }
  }, [resolved]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center select-none"
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ cursor: 'default', touchAction: 'none' }}
    >
      {/* Canopy (room-owned copy) */}
      <AnimatePresence>
        {phase === 'threshold' && shouldShowCopy('canopy', constraints) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.present }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            transition={{ duration: 1.8 }}
            className="absolute"
            style={{
              top: '18%',
              fontFamily: font.serif,
              fontSize: typeSize.lede,
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              textAlign: 'center',
            }}
          >
            {mode.canopy}
          </motion.p>
        )}
      </AnimatePresence>

      {/* K.B.E. Neural Map — proof geometry */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
        style={{ width: '65%', maxWidth: 220, aspectRatio: '1 / 0.8' }}
      >
        {/* Connection threads — luminous lines, not bordered strokes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
          {/* K → B */}
          <line
            x1={KBE_NODES[0].x} y1={KBE_NODES[0].y}
            x2={KBE_NODES[1].x} y2={KBE_NODES[1].y}
            stroke={resolvedNode === 0 || resolvedNode === 1 ? KBE_NODES[resolvedNode].color : mode.color}
            strokeWidth="0.8"
            opacity={resolved && (resolvedNode === 0 || resolvedNode === 1) ? opacity.gentle : opacity.ghost}
            style={{ filter: resolved ? `drop-shadow(0 0 3px ${mode.color}40)` : 'none', transition: timing.t.easeSettle }}
          />
          {/* B → E */}
          <line
            x1={KBE_NODES[1].x} y1={KBE_NODES[1].y}
            x2={KBE_NODES[2].x} y2={KBE_NODES[2].y}
            stroke={resolvedNode === 1 || resolvedNode === 2 ? KBE_NODES[resolvedNode!].color : mode.color}
            strokeWidth="0.8"
            opacity={resolved && (resolvedNode === 1 || resolvedNode === 2) ? opacity.gentle : opacity.ghost}
            style={{ filter: resolved ? `drop-shadow(0 0 3px ${mode.color}40)` : 'none', transition: timing.t.easeSettle }}
          />
          {/* K → E (pathway) */}
          <line
            x1={KBE_NODES[0].x} y1={KBE_NODES[0].y}
            x2={KBE_NODES[2].x} y2={KBE_NODES[2].y}
            stroke={mode.color}
            strokeWidth="0.4"
            opacity={opacity.flicker}
            strokeDasharray="2 4"
          />
        </svg>

        {/* K.B.E. nodes — refractive pools, not bordered circles */}
        {KBE_NODES.map((node, i) => {
          const isActive = activeNode === i;
          const isResolved = resolvedNode === i;
          const nodeGlow = isActive ? 0.2 + holdProgress * 0.4 : isResolved ? 0.5 : 0.1;
          const nodeSize = isActive ? 16 + holdProgress * 8 : isResolved ? 20 : 14;
          const proofRadius = isActive ? holdProgress * 40 : isResolved ? 50 : 0;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: (mode.thresholdDelayMs / 1000) + i * 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute flex flex-col items-center"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onPointerDown={(e) => { e.stopPropagation(); handleNodeDown(i); }}
            >
              {/* Proof radiation — expands during hold */}
              {proofRadius > 2 && (
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: proofRadius * 2,
                    height: proofRadius * 2,
                    background: `radial-gradient(circle, ${node.color}${Math.round(nodeGlow * 15).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                    transition: `all ${timing.dur.brisk}`,
                  }}
                />
              )}

              {/* Core node — refractive pool, no border */}
              <div
                className="rounded-full flex items-center justify-center cursor-pointer relative"
                style={{
                  width: nodeSize,
                  height: nodeSize,
                  background: `radial-gradient(circle at 40% 40%, ${node.color}${Math.round(nodeGlow * 100).toString(16).padStart(2, '0')}, ${node.color}10 70%, transparent 100%)`,
                  boxShadow: `0 0 ${8 + (isActive ? holdProgress * 20 : 0) + breath * 6}px ${node.color}${Math.round(nodeGlow * 40).toString(16).padStart(2, '0')}`,
                  transition: timing.t.resizeBrisk,
                }}
              >
                <span style={{ fontSize: typeSize.micro, fontWeight: weight.semibold, color: node.color, opacity: isActive ? opacity.clear : opacity.body, transition: timing.t.fadeBrisk }}>
                  {node.id}
                </span>
              </div>

              {/* Node label — tracked typography */}
              <span style={{
                fontSize: typeSize.micro,
                fontWeight: weight.light,
                color: isActive || isResolved ? node.color : glaze.dim,
                marginTop: 4,
                fontFamily: font.serif,
                opacity: isActive ? opacity.clear : isResolved ? opacity.strong : opacity.body,
                transition: timing.t.easeRespond,
              }}>
                {node.name}
              </span>

              {/* Proof label — appears on resolve */}
              {isResolved && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: opacity.steady, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: typeSize.label,
                    fontWeight: weight.light,
                    fontStyle: 'italic',
                    color: node.color,
                    marginTop: 2,
                    fontFamily: font.serif,
                    letterSpacing: tracking.code,
                  }}
                >
                  {node.proofLabel}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Gesture (room-owned copy) — semantic particle */}
      <AnimatePresence>
        {(phase === 'threshold' || phase === 'arrival') && shouldShowCopy('gesture', constraints) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 2, delay: (mode.thresholdDelayMs / 1000) + 0.8 }}
            className="absolute flex items-center gap-2"
            style={{ bottom: '26%' }}
          >
            <span className="rounded-full" style={{ width: 3, height: 3, background: mode.color, boxShadow: glow.dot(mode.color, '50'), opacity: opacity.body }} />
            <span style={{ fontSize: typeSize.detail, fontWeight: weight.medium, letterSpacing: tracking.normal, textTransform: 'uppercase', color: mode.color, opacity: opacity.murmur }}>
              {mode.gesture}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seal receipt */}
      <AnimatePresence>
        {phase === 'seal' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: opacity.gentle, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute flex flex-col items-center gap-3"
          >
            <div className="rounded-full" style={{ width: 4, height: 4, background: resolvedNode !== null ? KBE_NODES[resolvedNode].color : mode.color, boxShadow: glow.warm(resolvedNode !== null ? KBE_NODES[resolvedNode].color : mode.color) }} />
            <span style={{ fontFamily: font.serif, fontSize: typeSize.small, fontWeight: weight.light, fontStyle: 'italic', color: room.fg, opacity: opacity.steady }}>
              The proof was seen.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}