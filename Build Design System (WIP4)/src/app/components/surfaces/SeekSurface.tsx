/**
 * SEEK SURFACE — The Parallax Documentary
 *
 * The spatial anatomy of truth. You do not read your way
 * out of the illusion; you physically deconstruct it.
 *
 * The glass goes dark. Three ambient dots at the base
 * calibrate the physics engine: Focus, Depth, Frame.
 *
 * A monolith materializes. The user drags across the glass
 * to control the FRAME deconstruction. Floating typography
 * emerges in the negative space, explaining the mechanics.
 *
 * FRAME TYPES:
 *   Layers — swipe to peel armored shells, reveal the core
 *   Shift  — drag to rotate a wall, expose the hollow
 *   Thread — pull to untangle a knot chronologically
 *
 * You cannot be terrified of an object once you understand
 * how it is built.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  room, font, typeSize, leading, weight, tracking,
  opacity, timing, layer, glow, refract, radii,
  glowRadial, glass, void_,
} from '../design-system/surface-tokens';
import { useSurfaceArrival, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import {
  type SeekCalibrationState,
  DEFAULT_SEEK_CALIBRATION,
  findDocumentary,
  getSeekColor,
  type SeekDocumentary,
} from './seek-calibration';
import { SeekCalibration } from './SeekCalibration';
import type { SurfaceMode } from '../universal-player/surface-modes';

// ─── Constants ───

const ORB_CLEARANCE = 110;
const REVEAL_THRESHOLD = 0.15; // progress per reveal line

interface SeekSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
}

export function SeekSurface({ mode, breath }: SeekSurfaceProps) {
  const { arrived, delay } = useSurfaceArrival('seek');

  // ── Calibration state ──
  const [calibration, setCalibration] = useState<SeekCalibrationState>(
    () => ({ ...DEFAULT_SEEK_CALIBRATION })
  );

  // ── Documentary matched to calibration ──
  const doc = useMemo(() => findDocumentary(calibration), [calibration]);

  // ── Interaction state ──
  const [phase, setPhase] = useState<'calibrating' | 'monolith' | 'unspooling' | 'truth'>('calibrating');
  const [progress, setProgress] = useState(0); // 0..1
  const [lastDocId, setLastDocId] = useState(doc.id);
  const dragRef = useRef<{ startX: number; startProgress: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset when documentary changes
  useEffect(() => {
    if (doc.id !== lastDocId) {
      setPhase('calibrating');
      setProgress(0);
      setLastDocId(doc.id);
      // Auto-transition to monolith after brief pause
      const t = setTimeout(() => setPhase('monolith'), 600);
      return () => clearTimeout(t);
    }
  }, [doc.id, lastDocId]);

  // Auto-enter monolith on first arrival
  useEffect(() => {
    if (arrived && phase === 'calibrating') {
      const t = setTimeout(() => setPhase('monolith'), 1800);
      return () => clearTimeout(t);
    }
  }, [arrived, phase]);

  // ── Calibration change ──
  const handleCalibrationChange = useCallback((next: SeekCalibrationState) => {
    setCalibration(next);
  }, []);

  // ── Drag / Touch interaction ──
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase !== 'monolith' && phase !== 'unspooling') return;
    dragRef.current = { startX: e.clientX, startProgress: progress };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    if (phase === 'monolith') setPhase('unspooling');
  }, [phase, progress]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const dx = e.clientX - dragRef.current.startX;
    const range = container.clientWidth * 0.6;
    const newProgress = Math.max(0, Math.min(1, dragRef.current.startProgress + dx / range));
    setProgress(newProgress);

    if (newProgress >= 0.98 && phase !== 'truth') {
      setPhase('truth');
    }
  }, [phase]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // ── Derived values ──
  const accentColor = getSeekColor(calibration);
  const revealCount = Math.floor(progress / REVEAL_THRESHOLD);
  const visibleReveals = doc.reveals.slice(0, Math.min(revealCount, doc.reveals.length));

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{ background: room.void, cursor: phase === 'monolith' || phase === 'unspooling' ? 'grab' : 'default' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ═══ ATMOSPHERIC GLOW ═══ */}
      {arrived && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay('atmosphere'), duration: 2 }}
          style={{
            background: glowRadial(accentColor, '03', '80%', '60%', '40%'),
          }}
        />
      )}

      {/* ═══ THE MONOLITH ═══ */}
      <AnimatePresence>
        {(phase === 'monolith' || phase === 'unspooling' || phase === 'truth') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, ease: SURFACE_EASE }}
          >
            {/* The 3D Object */}
            <div
              style={{
                perspective: '800px',
                perspectiveOrigin: '50% 50%',
              }}
            >
              <MonolithObject
                doc={doc}
                progress={progress}
                breath={breath}
                accentColor={accentColor}
              />
            </div>

            {/* Hook text — fades as interaction begins */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: phase === 'monolith'
                  ? opacity.voice
                  : Math.max(0, opacity.voice * (1 - progress * 3)),
                y: 0,
              }}
              transition={{ delay: 0.6, duration: 1.2, ease: SURFACE_EASE }}
              className="absolute pointer-events-none"
              style={{
                bottom: '32%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: font.serif,
                fontSize: typeSize.lede,
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: room.fg,
                textAlign: 'center',
                maxWidth: '260px',
                lineHeight: leading.relaxed,
                letterSpacing: tracking.hair,
              }}
            >
              {doc.hook}
            </motion.p>

            {/* Monolith title */}
            <motion.h2
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: opacity.clear, y: 0 }}
              transition={{ delay: 0.3, duration: 1.4, ease: SURFACE_EASE }}
              className="absolute pointer-events-none"
              style={{
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: font.serif,
                fontSize: typeSize.pull,
                fontWeight: weight.light,
                color: room.fg,
                textAlign: 'center',
                maxWidth: '280px',
                lineHeight: leading.snug,
                letterSpacing: tracking.body,
              }}
            >
              {doc.monolith}
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ REVEAL LINES ═══ */}
      <AnimatePresence>
        {phase === 'unspooling' && visibleReveals.map((line, i) => (
          <motion.p
            key={`reveal-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: opacity.body, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: SURFACE_EASE }}
            className="absolute pointer-events-none"
            style={{
              // Stagger reveals vertically on the right side
              right: '10%',
              top: `${28 + i * 8}%`,
              fontFamily: font.serif,
              fontSize: typeSize.reading,
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              textAlign: 'right',
              maxWidth: '220px',
              lineHeight: leading.generous,
              letterSpacing: tracking.hair,
            }}
          >
            {line}
          </motion.p>
        ))}
      </AnimatePresence>

      {/* ═══ THE TRUTH ═══ */}
      <AnimatePresence>
        {phase === 'truth' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: SURFACE_EASE }}
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: opacity.clear, y: 0 }}
              transition={{ delay: 0.6, duration: 1.8, ease: SURFACE_EASE }}
              style={{
                fontFamily: font.serif,
                fontSize: typeSize.prose,
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: accentColor,
                textAlign: 'center',
                maxWidth: '280px',
                lineHeight: leading.generous,
                letterSpacing: tracking.body,
              }}
            >
              {doc.truth}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ INTERACTION HINT ═══ */}
      <AnimatePresence>
        {phase === 'monolith' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.trace }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2.4, duration: 1.2 }}
            className="absolute pointer-events-none"
            style={{
              bottom: '18%',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: font.sans,
              fontSize: typeSize.whisper,
              fontWeight: weight.light,
              letterSpacing: tracking.wide,
              textTransform: 'uppercase' as const,
              color: room.fg,
            }}
          >
            drag to deconstruct
          </motion.p>
        )}
      </AnimatePresence>

      {/* ═══ PROGRESS FILAMENT ═══ */}
      {(phase === 'unspooling' || phase === 'truth') && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: ORB_CLEARANCE + 40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40%',
            height: 1,
            background: glass(accentColor, 0.06),
            borderRadius: radii.bar,
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: glass(accentColor, 0.25),
              borderRadius: radii.bar,
              transition: timing.t.easeRespond,
            }}
          />
          {/* Leading dot */}
          <div
            style={{
              position: 'absolute',
              top: -1.5,
              left: `${progress * 100}%`,
              width: 4,
              height: 4,
              borderRadius: radii.circle,
              background: accentColor,
              opacity: opacity.steady,
              boxShadow: glow.dot(accentColor, '30'),
              transition: timing.t.easeRespond,
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      )}

      {/* ═══ AMBIENT CALIBRATION DOTS ═══ */}
      {arrived && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay('peripherals') + 0.3, duration: 1.2 }}
        >
          <SeekCalibration
            calibration={calibration}
            breath={breath}
            onCalibrationChange={handleCalibrationChange}
          />
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// THE MONOLITH OBJECT
// A 3D form that transforms based on the FRAME type.
// ═══════════════════════════════════════════════════

interface MonolithProps {
  doc: SeekDocumentary;
  progress: number;
  breath: number;
  accentColor: string;
}

function MonolithObject({ doc, progress, breath, accentColor }: MonolithProps) {
  const breathPhase = breath * Math.PI * 2;
  const breathScale = 1 + Math.sin(breathPhase) * 0.01;
  const frame = doc.coordinate.frame;

  // ── SHIFT: Rotate to reveal the hollow ──
  if (frame === 'shift') {
    const rotateY = progress * 90; // 0° to 90°
    const scaleZ = 1 - progress * 0.95; // Compress depth to reveal 2D nature
    const shadowOpacity = Math.max(0, 0.3 - progress * 0.4);

    return (
      <div
        style={{
          width: 120,
          height: 160,
          transformStyle: 'preserve-3d',
          transform: `
            scale(${breathScale})
            rotateY(${rotateY}deg)
            scaleZ(${scaleZ})
          `,
          transition: progress === 0 ? timing.t.easeSettle : undefined,
        }}
      >
        {/* Front face */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${glass(accentColor, 0.12)}, ${glass(accentColor, 0.04)})`,
            border: `1px solid ${glass(accentColor, 0.1)}`,
            borderRadius: 3,
            boxShadow: `
              ${glow.atmosphere(accentColor)},
              20px 0 40px ${glass('#000', shadowOpacity)}
            `,
          }}
        />
        {/* Edge — reveals thinness */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: -2,
            width: 2,
            height: '100%',
            background: glass(accentColor, 0.08),
            transformOrigin: 'left center',
            transform: 'rotateY(90deg)',
          }}
        />
      </div>
    );
  }

  // ── LAYERS: Concentric shells that peel away ──
  if (frame === 'layers') {
    const layerCount = 5;
    const peeled = Math.floor(progress * layerCount);

    return (
      <div
        style={{
          position: 'relative',
          width: 160,
          height: 160,
          transform: `scale(${breathScale})`,
        }}
      >
        {Array.from({ length: layerCount }).map((_, i) => {
          const idx = layerCount - 1 - i; // outermost first
          const size = 160 - idx * 22;
          const isPeeled = idx < peeled;
          const isCore = idx === layerCount - 1;
          const layerOpacity = isPeeled ? 0 : isCore ? 0.25 : 0.08 + idx * 0.02;
          const layerScale = isPeeled ? 1.3 + (peeled - idx) * 0.15 : 1;

          return (
            <motion.div
              key={idx}
              animate={{
                opacity: layerOpacity,
                scale: layerScale,
              }}
              transition={{ duration: 0.6, ease: SURFACE_EASE }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: size,
                height: size,
                borderRadius: radii.circle,
                border: `1px solid ${glass(accentColor, isCore ? 0.3 : 0.08)}`,
                background: isCore
                  ? `radial-gradient(circle, ${glass(accentColor, 0.15)}, transparent 70%)`
                  : 'transparent',
                transform: 'translate(-50%, -50%)',
                boxShadow: isCore ? glow.atmosphere(accentColor) : 'none',
              }}
            />
          );
        })}
      </div>
    );
  }

  // ── THREAD: A knot that untangles ──
  if (frame === 'thread') {
    return (
      <div
        style={{
          position: 'relative',
          width: 200,
          height: 200,
          transform: `scale(${breathScale})`,
        }}
      >
        <svg
          viewBox="0 0 200 200"
          width="200"
          height="200"
          style={{ overflow: 'visible' }}
        >
          {/* The tangled threads — become straight as progress increases */}
          {[0, 1, 2, 3, 4].map(i => {
            const tangleFactor = 1 - progress;
            const baseY = 60 + i * 20;
            const cx1 = 50 + Math.sin(i * 1.8) * 40 * tangleFactor;
            const cy1 = baseY + Math.cos(i * 2.3) * 30 * tangleFactor;
            const cx2 = 150 + Math.cos(i * 1.5) * 40 * tangleFactor;
            const cy2 = baseY + Math.sin(i * 2.7) * 30 * tangleFactor;

            const startX = 10;
            const startY = progress > 0.1 ? 60 + i * 20 : 100 + Math.sin(i * 3) * 20 * tangleFactor;
            const endX = 190;
            const endY = progress > 0.1 ? 60 + i * 20 : 100 + Math.cos(i * 2) * 20 * tangleFactor;

            const d = `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;
            const lineProgress = Math.max(0, Math.min(1, (progress - i * 0.12) * 2.5));

            return (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke={accentColor}
                strokeWidth={1}
                strokeLinecap="round"
                initial={false}
                animate={{
                  opacity: 0.1 + lineProgress * 0.2,
                  strokeDasharray: lineProgress > 0.9 ? 'none' : '4 8',
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Central knot — dissolves */}
          <motion.circle
            cx="100"
            cy="100"
            r={12}
            fill="none"
            stroke={accentColor}
            strokeWidth={1}
            animate={{
              opacity: Math.max(0, 0.2 - progress * 0.3),
              r: 12 + progress * 30,
            }}
            transition={{ duration: 0.3 }}
          />
        </svg>
      </div>
    );
  }

  // Fallback
  return null;
}
