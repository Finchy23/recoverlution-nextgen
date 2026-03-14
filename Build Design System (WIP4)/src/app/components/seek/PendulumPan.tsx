/**
 * PENDULUM PAN — Transfer Block 2B
 *
 * The text is split into two truths: The Trigger vs The Truth.
 * The user drags left/right, physically shifting the light source
 * to read one side then the other. Trains the brain to hold
 * two opposing truths simultaneously.
 *
 * Silent Telemetry: measures time spent on each side,
 * which truth receives more attention.
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hapticTick, hapticThreshold } from '../surfaces/haptics';

import { room, font, tracking, typeSize, leading, weight, opacity, timing } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface PendulumPanProps {
  /** Left truth — the trigger / old pattern */
  copy: string;
  /** Right truth — the reframe / new understanding */
  dualCopy: string;
  color: string;
  breath: number;
  instruction: string;
  width: number;
  height: number;
  onComplete: (leftMs: number, rightMs: number) => void;
}

export function PendulumPan({
  copy,
  dualCopy,
  color,
  breath,
  instruction,
  width,
  height,
  onComplete,
}: PendulumPanProps) {
  // -1 = full left, 0 = center, 1 = full right
  const [panPosition, setPanPosition] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leftVisited, setLeftVisited] = useState(false);
  const [rightVisited, setRightVisited] = useState(false);
  const [complete, setComplete] = useState(false);

  const startXRef = useRef(0);
  const startPanRef = useRef(0);
  const leftTimeRef = useRef(0);
  const rightTimeRef = useRef(0);
  const lastSideRef = useRef<'left' | 'right' | 'center'>('center');
  const sideStartRef = useRef(Date.now());

  // Track time on each side
  const updateSideTime = useCallback((newSide: 'left' | 'right' | 'center') => {
    const now = Date.now();
    const elapsed = now - sideStartRef.current;
    if (lastSideRef.current === 'left') leftTimeRef.current += elapsed;
    if (lastSideRef.current === 'right') rightTimeRef.current += elapsed;
    lastSideRef.current = newSide;
    sideStartRef.current = now;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (complete) return;
    setDragging(true);
    startXRef.current = e.clientX;
    startPanRef.current = panPosition;
  }, [complete, panPosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || complete) return;
    const delta = e.clientX - startXRef.current;
    const normalized = startPanRef.current + (delta / (width * 0.4));
    const clamped = Math.max(-1, Math.min(1, normalized));
    setPanPosition(clamped);

    // Track side visits
    if (clamped < -0.4 && !leftVisited) {
      setLeftVisited(true);
      hapticTick();
      updateSideTime('left');
    }
    if (clamped > 0.4 && !rightVisited) {
      setRightVisited(true);
      hapticTick();
      updateSideTime('right');
    }

    // Update side tracking
    const side = clamped < -0.2 ? 'left' : clamped > 0.2 ? 'right' : 'center';
    if (side !== lastSideRef.current) {
      updateSideTime(side);
    }

    // Complete when both sides visited
    if (leftVisited && rightVisited && !complete) {
      // Check if they've now returned to center
      if (Math.abs(clamped) < 0.15) {
        setComplete(true);
        hapticThreshold();
        updateSideTime('center');
        setTimeout(() => {
          onComplete(leftTimeRef.current, rightTimeRef.current);
        }, 1000);
      }
    }
  }, [dragging, complete, width, leftVisited, rightVisited, updateSideTime, onComplete]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    // Gentle spring toward center
    if (!complete) {
      setPanPosition(prev => prev * 0.5);
    }
  }, [complete]);

  const breathPulse = Math.sin(breath * Math.PI * 2);

  // Calculate visual properties based on pan position
  const leftOpacity = Math.max(0.06, 0.15 + (-panPosition) * 0.5);
  const rightOpacity = Math.max(0.06, 0.15 + panPosition * 0.5);
  const leftBlur = Math.max(0, panPosition * 6);
  const rightBlur = Math.max(0, -panPosition * 6);

  return (
    <div
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Light source — follows the pan */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '35%',
          left: `${50 + panPosition * 30}%`,
          width: 200,
          height: 200,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
          transition: dragging ? 'none' : `left ${timing.dur.moderate} ${timing.curve}`,
        }}
      />

      {/* Center divider — a faint vertical filament */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '25%',
          bottom: '35%',
          left: '50%',
          width: '0.5px',
          background: `linear-gradient(to bottom, transparent, ${color}08, transparent)`,
          opacity: opacity.body + Math.abs(panPosition) * 0.5,
        }}
      />

      {/* Left truth — The Trigger */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          opacity: leftOpacity,
          filter: `blur(${leftBlur}px)`,
          x: panPosition * -20,
        }}
        transition={{ duration: dragging ? 0.05 : 0.5 }}
        style={{
          top: '50%',
          left: '5%',
          right: '55%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          padding: '0 5%',
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(14px, 3.5vw, 18px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          lineHeight: leading.relaxed,
          color: room.fg,
          margin: 0,
        }}>
          {copy}
        </p>
        {leftVisited && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.ambient }}
            style={{ marginTop: 12 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.whisper,
              fontWeight: weight.medium,
              letterSpacing: tracking.spread,
              textTransform: 'uppercase',
              color: room.fg,
              opacity: opacity.ambient,
            }}>
              LEFT
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Right truth — The Truth */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          opacity: rightOpacity,
          filter: `blur(${rightBlur}px)`,
          x: panPosition * 20,
        }}
        transition={{ duration: dragging ? 0.05 : 0.5 }}
        style={{
          top: '50%',
          left: '55%',
          right: '5%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          padding: '0 5%',
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(14px, 3.5vw, 18px)',
          fontWeight: weight.light,
          lineHeight: leading.relaxed,
          color: room.fg,
          margin: 0,
        }}>
          {dualCopy}
        </p>
        {rightVisited && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.ambient }}
            style={{ marginTop: 12 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.whisper,
              fontWeight: weight.medium,
              letterSpacing: tracking.spread,
              textTransform: 'uppercase',
              color: room.fg,
              opacity: opacity.ambient,
            }}>
              RIGHT
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Completion prompt */}
      <AnimatePresence>
        {leftVisited && rightVisited && !complete && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ bottom: 160, left: 0, right: 0, textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.murmur }}
            exit={{ opacity: 0 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.lift,
              textTransform: 'uppercase',
              color,
            }}>
              RETURN TO CENTER
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instruction */}
      <AnimatePresence>
        {!leftVisited && !rightVisited && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.trace }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.lift,
              textTransform: 'uppercase',
              color,
            }}>
              {instruction}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}