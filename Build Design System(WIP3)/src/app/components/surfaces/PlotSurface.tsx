/**
 * PLOT SURFACE — The Coordinates
 *
 * The active biometric and subjective check-in.
 * Clarity, Energy, and Anchorage visualised through
 * fluid, volumetric data representation.
 *
 * Three Canvas 2D organic shapes breathe in the glass.
 * Each shape is a living volume — its size reflects the current reading.
 * The user holds a shape to set its value (no slider, no number input).
 * History trails glow beneath each shape as faint trajectories.
 *
 * Death of the Box: No progress bars. No number displays.
 * The volume IS the data. The shape IS the readout.
 *
 * "Carved into the glass" — the shapes don't sit ON the surface,
 * they are refractions WITHIN it.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { hapticSeal } from './haptics';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import { FORM_PRACTICES } from '../form/form-practices';
import { room, font, layout, tracking, typeSize, leading, weight, opacity, timing, void_, layer, signal } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const ORB_CLEARANCE = layout.orbClearance;

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
});

// ─── The Three Coordinates ───

interface Coordinate {
  id: string;
  label: string;
  whisper: string;
  color: string;
  value: number; // 0–1
}

const DEFAULT_COORDINATES: Coordinate[] = [
  {
    id: 'clarity',
    label: 'CLARITY',
    whisper: 'How clear is your thinking right now?',
    color: signal.clarity,
    value: 0.5,
  },
  {
    id: 'energy',
    label: 'ENERGY',
    whisper: 'How much energy do you have?',
    color: signal.energy,
    value: 0.5,
  },
  {
    id: 'anchorage',
    label: 'ANCHORAGE',
    whisper: 'How grounded do you feel?',
    color: signal.anchor,
    value: 0.5,
  },
];

interface PlotSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
  /** Navigate to another surface (FORM) */
  onNavigate?: (modeId: string) => void;
}

// ─── Organic blob path generator ───

function blobPath(
  cx: number,
  cy: number,
  radius: number,
  breath: number,
  seed: number,
  segments = 8,
): string {
  const points: [number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const wobble = Math.sin(breath * Math.PI * 2 + angle * 3 + seed) * 0.12
      + Math.sin(breath * Math.PI * 4 + angle * 2 + seed * 1.7) * 0.06;
    const r = radius * (1 + wobble);
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }

  // Smooth closed path with cubic bezier
  let d = `M ${points[0][0]},${points[0][1]} `;
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const next = points[(i + 1) % points.length];
    const prev = points[(i - 1 + points.length) % points.length];
    const nextNext = points[(i + 2) % points.length];

    const cp1x = curr[0] + (next[0] - prev[0]) / 6;
    const cp1y = curr[1] + (next[1] - prev[1]) / 6;
    const cp2x = next[0] - (nextNext[0] - curr[0]) / 6;
    const cp2y = next[1] - (nextNext[1] - curr[1]) / 6;

    d += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next[0]},${next[1]} `;
  }
  d += 'Z';
  return d;
}

// ─── Canvas renderer ───

function drawPlotCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  coordinates: Coordinate[],
  breath: number,
  activeIdx: number | null,
  holdProgress: number,
  showTrajectory: boolean,
  history: { coordinates: { id: string; value: number }[]; timestamp: number }[],
  comparisonPoints: [number | null, number | null],
) {
  ctx.clearRect(0, 0, width, height);

  const centerY = height * 0.42;
  const spacing = width / (coordinates.length + 1);

  coordinates.forEach((coord, i) => {
    const cx = spacing * (i + 1);
    const cy = centerY + Math.sin(breath * Math.PI * 2 + i * 1.3) * 4;
    const baseRadius = 20 + coord.value * 45;
    const isActive = activeIdx === i;

    // History trail — trajectory visualization
    if (showTrajectory && history.length > 1) {
      // Draw trajectory line below the blob showing value over time
      const trajectoryY = centerY + 85; // Below the blob labels
      const trajectoryHeight = 40;
      const trajectoryWidth = 60;
      const startX = cx - trajectoryWidth / 2;

      // Draw the trajectory path for this coordinate
      ctx.beginPath();
      const validHistory = history.filter(h => h.coordinates && h.coordinates[i]);
      if (validHistory.length > 1) {
        validHistory.forEach((entry, j) => {
          const hx = startX + (j / (validHistory.length - 1)) * trajectoryWidth;
          const hy = trajectoryY + trajectoryHeight - entry.coordinates[i].value * trajectoryHeight;
          if (j === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        });

        ctx.strokeStyle = coord.color + '08';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Glow at the end point (current)
        const lastEntry = validHistory[validHistory.length - 1];
        const lastX = startX + trajectoryWidth;
        const lastY = trajectoryY + trajectoryHeight - lastEntry.coordinates[i].value * trajectoryHeight;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = coord.color + '15';
        ctx.fill();

        // Ghost range — min/max band
        let minVal = 1, maxVal = 0;
        validHistory.forEach(entry => {
          const v = entry.coordinates[i].value;
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        });

        const bandTop = trajectoryY + trajectoryHeight - maxVal * trajectoryHeight;
        const bandBottom = trajectoryY + trajectoryHeight - minVal * trajectoryHeight;
        const bandGrad = ctx.createLinearGradient(0, bandTop, 0, bandBottom);
        bandGrad.addColorStop(0, coord.color + '03');
        bandGrad.addColorStop(0.5, coord.color + '02');
        bandGrad.addColorStop(1, coord.color + '01');
        ctx.fillStyle = bandGrad;
        ctx.fillRect(startX, bandTop, trajectoryWidth, bandBottom - bandTop);
      }
    }

    // Main blob
    const activeScale = isActive ? 1 + holdProgress * 0.3 : 1;
    const radius = baseRadius * activeScale;

    // Glow
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2);
    gradient.addColorStop(0, coord.color + '08');
    gradient.addColorStop(0.5, coord.color + '03');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Organic shape
    const path = new Path2D(
      blobPath(cx, cy, radius, breath, i * 77, 8)
    );

    // Fill with refracted glass effect
    const blobGrad = ctx.createRadialGradient(
      cx - radius * 0.3, cy - radius * 0.3, 0,
      cx, cy, radius
    );
    const fillAlpha = isActive ? 0.12 + holdProgress * 0.08 : 0.06 + coord.value * 0.04;
    blobGrad.addColorStop(0, coord.color + Math.round(fillAlpha * 2 * 255).toString(16).padStart(2, '0'));
    blobGrad.addColorStop(0.7, coord.color + Math.round(fillAlpha * 255).toString(16).padStart(2, '0'));
    blobGrad.addColorStop(1, coord.color + '02');

    ctx.fillStyle = blobGrad;
    ctx.fill(path);

    // Edge — barely visible
    ctx.strokeStyle = coord.color + (isActive ? '18' : '08');
    ctx.lineWidth = 0.5;
    ctx.stroke(path);

    // Center dot — the heartbeat
    const dotSize = 1.5 + Math.sin(breath * Math.PI * 2) * 0.3;
    ctx.beginPath();
    ctx.arc(cx, cy, dotSize, 0, Math.PI * 2);
    ctx.fillStyle = coord.color + (isActive ? '40' : '20');
    ctx.fill();

    // Hold indicator ring
    if (isActive && holdProgress > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 6, -Math.PI / 2, -Math.PI / 2 + holdProgress * Math.PI * 2);
      ctx.strokeStyle = coord.color + '25';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Comparison points
    if (comparisonPoints[0] !== null && comparisonPoints[1] !== null) {
      const [startIdx, endIdx] = comparisonPoints;
      if (startIdx <= i && i <= endIdx) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
        ctx.strokeStyle = coord.color + '30';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });
}

export function PlotSurface({ mode, breath, onResolve, onNavigate }: PlotSurfaceProps) {
  const userId = useIndividualId();
  const resilience = useResilience();
  const [coordinates, setCoordinates] = useState<Coordinate[]>(DEFAULT_COORDINATES);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [checkInPhase, setCheckInPhase] = useState<'idle' | 'adjusting' | 'sealed'>('idle');
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });
  const [history, setHistory] = useState<{ coordinates: { id: string; value: number }[]; timestamp: number }[]>([]);
  const [showTrajectory, setShowTrajectory] = useState(false);
  const [comparisonPoints, setComparisonPoints] = useState<[number | null, number | null]>([null, null]);
  const [formNudge, setFormNudge] = useState<{ practice: string; reason: string; id: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchYRef = useRef(0);
  const { arrived, delay } = useSurfaceArrival(mode);

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

  // Load previous check-in + history
  useEffect(() => {
    // Load current
    fetch(`${BASE}/plot/coordinates/${userId}`, { headers: headers() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.found && data.coordinates) {
          setCoordinates(data.coordinates);
          setLastCheckIn(data.timestamp);
        }
      })
      .catch(err => console.error('[PLOT load]', err));

    // Load history
    fetch(`${BASE}/plot/history/${userId}`, { headers: headers() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.readings && data.readings.length > 0) {
          setHistory(data.readings);
          setShowTrajectory(true);
        }
      })
      .catch(err => console.error('[PLOT history load]', err));
  }, []);

  // Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    drawPlotCanvas(ctx, viewport.width, viewport.height, coordinates, breath, activeIdx, holdProgress, showTrajectory, history, comparisonPoints);
  }, [viewport, coordinates, breath, activeIdx, holdProgress, showTrajectory, history, comparisonPoints]);

  // Touch handlers — hold a blob to adjust its value via vertical drag
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const spacing = viewport.width / (coordinates.length + 1);
    const centerY = viewport.height * 0.42;

    // Check if tap is in the trajectory zone (below blobs)
    const trajectoryY = centerY + 85;
    if (showTrajectory && history.length > 1 && y > trajectoryY - 5 && y < trajectoryY + 50) {
      // Find which coordinate's trajectory was tapped
      for (let i = 0; i < coordinates.length; i++) {
        const cx = spacing * (i + 1);
        const trajectoryWidth = 60;
        const startX = cx - trajectoryWidth / 2;

        if (x >= startX && x <= startX + trajectoryWidth) {
          // Map x position to history index
          const ratio = (x - startX) / trajectoryWidth;
          const histIdx = Math.round(ratio * (history.length - 1));

          if (comparisonPoints[0] === null) {
            // First point selected
            setComparisonPoints([histIdx, null]);
          } else if (comparisonPoints[1] === null) {
            // Second point selected — show comparison
            const [first] = comparisonPoints;
            setComparisonPoints([first, histIdx]);
          } else {
            // Both already set — clear and start over
            setComparisonPoints([histIdx, null]);
          }
          return;
        }
      }
    }

    // Find which blob was tapped
    for (let i = 0; i < coordinates.length; i++) {
      const cx = spacing * (i + 1);
      const radius = 20 + coordinates[i].value * 45;
      const dist = Math.sqrt((x - cx) ** 2 + (y - centerY) ** 2);

      if (dist < radius + 20) {
        setActiveIdx(i);
        touchYRef.current = y;
        setCheckInPhase('adjusting');
        return;
      }
    }
  }, [viewport, coordinates, showTrajectory, history, comparisonPoints]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (activeIdx === null) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    const deltaY = touchYRef.current - y; // Up = positive = more
    const sensitivity = 0.004;
    const newValue = Math.max(0, Math.min(1, coordinates[activeIdx].value + deltaY * sensitivity));

    touchYRef.current = y;
    setCoordinates(prev => prev.map((c, i) =>
      i === activeIdx ? { ...c, value: newValue } : c
    ));
  }, [activeIdx, coordinates]);

  const handlePointerUp = useCallback(() => {
    if (activeIdx !== null) {
      hapticSeal();
      setCheckInPhase('sealed');

      // Save to KV via PLOT API
      fetch(`${BASE}/plot/coordinates`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ userId, coordinates }),
      })
        .then(r => r.json())
        .then(data => {
          if (data?.stored) {
            setLastCheckIn(data.timestamp);
            console.log('[PLOT] Coordinates saved');
          }
        })
        .catch(err => console.error('[PLOT save]', err));

      // ── PLOT → FORM: Critical coordinate detection ──
      // When any coordinate is below 0.2, suggest a FORM practice
      const critical = coordinates.find(c => c.value < 0.2);
      if (critical && onNavigate) {
        const coordPracticeMap: Record<string, { pillar: string; reason: string }> = {
          clarity:   { pillar: 'rewire',   reason: 'The fog is heavy. Defusion may help.' },
          energy:    { pillar: 'bridge',   reason: 'The energy is low. The rhythm carries you.' },
          anchorage: { pillar: 'baseline', reason: 'The ground is far away. The body needs an anchor.' },
        };
        const mapping = coordPracticeMap[critical.id];
        if (mapping) {
          const matched = FORM_PRACTICES.find(p => p.pillar === mapping.pillar);
          if (matched) {
            // Delay the nudge so the seal confirmation shows first
            setTimeout(() => {
              setFormNudge({ practice: matched.name, reason: mapping.reason, id: matched.id });
              console.log(`[PLOT→FORM] Critical coordinate ${critical.id} (${(critical.value * 100).toFixed(0)}%) — suggesting: ${matched.name}`);
            }, 2200);
          }
        }
      }

      setTimeout(() => {
        setCheckInPhase('idle');
      }, 2000);
    }
    setActiveIdx(null);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, [activeIdx, coordinates, onNavigate]);

  // Time since last check-in
  const timeSince = lastCheckIn
    ? formatTimeSince(lastCheckIn)
    : null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{ touchAction: 'none', cursor: 'default' }}
    >
      {/* Dark glass base */}
      <div className="absolute inset-0" style={{ background: room.void }} />

      {/* Atmospheric glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 42%, ${mode.color}03 0%, transparent 70%)`,
          transition: timing.t.atmosphereEase,
        }}
      />

      {/* Canvas — the volumetric shapes */}
      <AnimatePresence>
        {arrived && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('atmosphere'), ease: SURFACE_EASE as any }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ touchAction: 'none' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Labels beneath each blob */}
      <AnimatePresence>
        {arrived && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: layer.content,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('content'), ease: SURFACE_EASE as any }}
          >
            {coordinates.map((coord, i) => {
              const spacing = viewport.width / (coordinates.length + 1);
              const cx = spacing * (i + 1);
              const isActive = activeIdx === i;

              return (
                <div
                  key={coord.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: cx - 50,
                    width: 100,
                    top: viewport.height * 0.42 + 70 + coord.value * 30,
                    textAlign: 'center',
                  }}
                >
                  <span style={{
                    fontFamily: SANS,
                    fontSize: typeSize.label,
                    fontWeight: weight.regular,
                    color: coord.color,
                    marginTop: 4,
                  }}>
                    {coord.label}
                  </span>

                  {/* Value indicator — appears during adjustment */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: opacity.present, y: 0 }}
                        exit={{ opacity: 0, y: 3 }}
                        style={{
                          fontFamily: SANS,
                          fontSize: typeSize.label,
                          fontWeight: weight.regular,
                          color: coord.color,
                          marginTop: 4,
                        }}
                      >
                        {Math.round(coord.value * 100)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active coordinate whisper */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: viewport.height * 0.15,
              left: '10%',
              right: '10%',
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: SURFACE_EASE as any }}
          >
            <p style={{
              fontFamily: SERIF,
              fontSize: 'clamp(12px, 3vw, 15px)',
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              opacity: opacity.gentle,
              lineHeight: leading.body,
            }}>
              {coordinates[activeIdx].whisper}
            </p>
            <p style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.regular,
              letterSpacing: tracking.snug,
              color: room.fg,
              opacity: opacity.ghost,
              marginTop: 8,
              textTransform: 'uppercase',
            }}>
              DRAG VERTICALLY TO ADJUST
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eyebrow */}
      <AnimatePresence>
        {arrived && checkInPhase === 'idle' && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: '6%',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.ambient }}
            exit={{ opacity: 0 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('eyebrow'), ease: SURFACE_EASE as any }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.wide,
              textTransform: 'uppercase',
              color: mode.color,
              opacity: opacity.quiet,
            }}>
              PLOT
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seal confirmation */}
      <AnimatePresence>
        {checkInPhase === 'sealed' && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: '6%',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.ambient }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.wide,
              textTransform: 'uppercase',
              color: mode.color,
            }}>
              COORDINATES UPDATED
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Temporal Comparison Overlay — "Then vs Now" ── */}
      <AnimatePresence>
        {comparisonPoints[0] !== null && comparisonPoints[1] !== null && history.length > 1 && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: viewport.height * 0.12,
              left: '5%',
              right: '5%',
              textAlign: 'center',
              zIndex: layer.overlay,
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.8, ease: SURFACE_EASE as any }}
          >
            {(() => {
              const [aIdx, bIdx] = comparisonPoints as [number, number];
              const a = history[Math.min(aIdx, history.length - 1)];
              const b = history[Math.min(bIdx, history.length - 1)];
              if (!a?.coordinates || !b?.coordinates) return null;

              const timeA = formatTimeSince(a.timestamp);
              const timeB = formatTimeSince(b.timestamp);

              return (
                <div className="flex flex-col items-center gap-3">
                  <span style={{
                    fontFamily: SANS,
                    fontSize: typeSize.trace,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.wide,
                    textTransform: 'uppercase',
                    color: mode.color,
                    opacity: opacity.ambient,
                  }}>
                    THEN · {timeA} — NOW · {timeB}
                  </span>

                  <div className="flex gap-6 justify-center">
                    {coordinates.map((coord, i) => {
                      const valA = a.coordinates[i]?.value ?? 0;
                      const valB = b.coordinates[i]?.value ?? 0;
                      const delta = valB - valA;
                      const arrow = delta > 0.05 ? '↑' : delta < -0.05 ? '↓' : '·';
                      const deltaColor = delta > 0.05 ? signal.anchor : delta < -0.05 ? signal.friction : room.fg;

                      return (
                        <div key={coord.id} className="flex flex-col items-center gap-1">
                          <span style={{
                            fontFamily: SANS,
                            fontSize: typeSize.sub,
                            fontWeight: weight.medium,
                            letterSpacing: tracking.normal,
                            color: coord.color,
                            opacity: opacity.ambient,
                          }}>
                            {coord.label}
                          </span>
                          <div className="flex items-center gap-1">
                            <span style={{
                              fontFamily: SANS,
                              fontSize: typeSize.label,
                              fontWeight: weight.regular,
                              color: room.fg,
                              opacity: opacity.quiet,
                            }}>
                              {Math.round(valA * 100)}
                            </span>
                            <span style={{
                              fontFamily: SANS,
                              fontSize: typeSize.caption,
                              color: deltaColor,
                              opacity: opacity.present,
                            }}>
                              {arrow}
                            </span>
                            <span style={{
                              fontFamily: SANS,
                              fontSize: typeSize.label,
                              fontWeight: weight.regular,
                              color: room.fg,
                              opacity: opacity.present,
                            }}>
                              {Math.round(valB * 100)}
                            </span>
                          </div>
                          <span style={{
                            fontFamily: SANS,
                            fontSize: typeSize.whisper,
                            fontWeight: weight.medium,
                            color: deltaColor,
                            opacity: opacity.quiet,
                          }}>
                            {delta > 0 ? '+' : ''}{Math.round(delta * 100)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <span style={{
                    fontFamily: SANS,
                    fontSize: typeSize.sub,
                    fontWeight: weight.regular,
                    letterSpacing: tracking.snug,
                    color: room.fg,
                    opacity: opacity.flicker,
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}>
                    TAP TRAJECTORY TO RESET
                  </span>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* First comparison point indicator */}
      <AnimatePresence>
        {comparisonPoints[0] !== null && comparisonPoints[1] === null && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: viewport.height * 0.14,
              left: '10%',
              right: '10%',
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.trace }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.trace,
              fontWeight: weight.medium,
              letterSpacing: tracking.normal,
              textTransform: 'uppercase',
              color: room.fg,
            }}>
              FIRST POINT SELECTED · TAP SECOND POINT
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last check-in timestamp */}
      {arrived && timeSince && checkInPhase === 'idle' && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: ORB_CLEARANCE + 16,
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: layer.raised,
          }}
        >
          <span style={{
            fontFamily: SANS,
            fontSize: typeSize.whisper,
            fontWeight: weight.regular,
            letterSpacing: tracking.snug,
            color: room.fg,
            opacity: opacity.flicker,
            textTransform: 'uppercase',
          }}>
            LAST READING · {timeSince}
          </span>
        </div>
      )}

      {/* ── PLOT → FORM Nudge — critical coordinate suggestion ── */}
      <AnimatePresence>
        {formNudge && (
          <motion.div
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              bottom: ORB_CLEARANCE + 40,
              left: '10%',
              right: '10%',
              textAlign: 'center',
              zIndex: layer.float,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => {
              if (onNavigate) {
                console.log(`[PLOT→FORM] Navigating to practice: ${formNudge.practice}`);
                onNavigate('form');
              }
              setFormNudge(null);
            }}
          >
            <span style={{
              fontFamily: SERIF,
              fontSize: typeSize.detail,
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              opacity: opacity.present,
              display: 'block',
              lineHeight: leading.body,
            }}>
              {formNudge.reason}
            </span>
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.trace,
              fontWeight: weight.medium,
              letterSpacing: tracking.normal,
              textTransform: 'uppercase',
              color: mode.color,
              opacity: opacity.murmur,
              marginTop: 6,
              display: 'block',
            }}>
              FORM → {formNudge.practice.toUpperCase()}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="plot" />

      {/* Orb clearance */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: ORB_CLEARANCE,
          background: `linear-gradient(to top, ${void_.haze} 0%, transparent 100%)`,
          zIndex: layer.scrim,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ─── Time formatting ───

function formatTimeSince(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'JUST NOW';
  if (mins < 60) return `${mins}M AGO`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}