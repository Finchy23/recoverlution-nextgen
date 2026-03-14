/**
 * GRAVITY DRAG — Ascertainment Block (Believing 3A)
 *
 * A digital mass sits at the bottom. The user drags it upward
 * into the Integration Zone. The engine assigns dynamic gravity.
 * The user dictates the "weight" of the truth.
 *
 * Heavy = ego still fighting the paradigm shift.
 * Light = integration is flowing.
 *
 * Canvas 2D: gravitational mass with physics.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { hapticPressure, hapticThreshold, hapticResolve } from '../surfaces/haptics';

import { room, font, tracking, typeSize, weight, opacity } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface GravityDragProps {
  color: string;
  copy: string;
  prompt: string;
  instruction: string;
  breath: number;
  width: number;
  height: number;
  onComplete: (believingScore: number) => void;
}

export function GravityDrag({
  color,
  copy,
  prompt,
  instruction,
  breath,
  width,
  height,
  onComplete,
}: GravityDragProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [massY, setMassY] = useState(0.85); // 0 = top, 1 = bottom
  const [dragging, setDragging] = useState(false);
  const [released, setReleased] = useState(false);
  const [settled, setSettled] = useState(false);
  const startYRef = useRef(0);
  const startMassRef = useRef(0.85);
  const velocityRef = useRef(0);
  const rafRef = useRef(0);
  const massYRef = useRef(0.85);

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  // Integration zone = top 30%
  const integrationThreshold = 0.35;
  const isInZone = massY < integrationThreshold;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = Math.round(width * dpr);
    const ch = Math.round(height * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const my = massYRef.current * height;
    const [r, g, b] = parseHex(color);
    const t = Date.now() * 0.001;
    const breathPulse = Math.sin(breath * Math.PI * 2);

    // ── Integration zone indicator ──
    const zoneY = integrationThreshold * height;
    const zoneGrad = ctx.createLinearGradient(0, 0, 0, zoneY);
    zoneGrad.addColorStop(0, `rgba(${r},${g},${b},0.02)`);
    zoneGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = zoneGrad;
    ctx.fillRect(0, 0, width, zoneY);

    // Zone line
    ctx.beginPath();
    ctx.moveTo(width * 0.2, zoneY);
    ctx.lineTo(width * 0.8, zoneY);
    ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── The mass ──
    const massSize = 18 + breathPulse * 2;
    const weight = massYRef.current; // 0 = light (top), 1 = heavy (bottom)

    // Mass trail — shows weight through density
    if (dragging) {
      const trailLength = 40 + weight * 30;
      const trailGrad = ctx.createLinearGradient(cx, my - trailLength, cx, my);
      trailGrad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      trailGrad.addColorStop(1, `rgba(${r},${g},${b},${(0.04 + weight * 0.04).toFixed(4)})`);
      ctx.fillStyle = trailGrad;
      ctx.fillRect(cx - 1, my - trailLength, 2, trailLength);
    }

    // Outer field
    const fieldSize = massSize * (3 + weight * 2);
    const fieldGrad = ctx.createRadialGradient(cx, my, 0, cx, my, fieldSize);
    fieldGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.06 + weight * 0.05).toFixed(4)})`);
    fieldGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = fieldGrad;
    ctx.beginPath();
    ctx.arc(cx, my, fieldSize, 0, Math.PI * 2);
    ctx.fill();

    // Core mass
    const coreGrad = ctx.createRadialGradient(
      cx - massSize * 0.15, my - massSize * 0.15, 0,
      cx, my, massSize,
    );
    coreGrad.addColorStop(0, `rgba(${Math.min(255, r + 30)},${Math.min(255, g + 30)},${Math.min(255, b + 30)},${(0.25 + (1 - weight) * 0.25).toFixed(3)})`);
    coreGrad.addColorStop(0.6, `rgba(${r},${g},${b},${(0.12 + weight * 0.08).toFixed(3)})`);
    coreGrad.addColorStop(1, `rgba(${r},${g},${b},0.02)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, my, massSize, 0, Math.PI * 2);
    ctx.fill();

    // Weight indicator — denser ring for heavier mass
    if (weight > 0.3) {
      ctx.beginPath();
      ctx.arc(cx, my, massSize + 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${((weight - 0.3) * 0.1).toFixed(4)})`;
      ctx.lineWidth = weight * 1.5;
      ctx.stroke();
    }

    ctx.restore();

    // ── Gravity physics (when released) ──
    if (released && !settled) {
      // Gravity pulls down, but the user's last position determines where it settles
      const targetY = massYRef.current; // Settles where released
      velocityRef.current *= 0.92; // Damping
      massYRef.current += velocityRef.current;

      // Clamp
      if (massYRef.current > 0.85) {
        massYRef.current = 0.85;
        velocityRef.current = 0;
      }

      if (Math.abs(velocityRef.current) < 0.001) {
        setSettled(true);
        const score = 1 - massYRef.current; // Higher = lighter = more integrated
        hapticResolve();
        setTimeout(() => onComplete(score), 600);
      }

      setMassY(massYRef.current);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath, dragging, released, settled, onComplete]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (released) return;
    setDragging(true);
    startYRef.current = e.clientY;
    startMassRef.current = massYRef.current;
  }, [released]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || released) return;
    const delta = e.clientY - startYRef.current;
    const newY = Math.max(0.08, Math.min(0.85, startMassRef.current + delta / height));
    massYRef.current = newY;
    setMassY(newY);

    hapticPressure((1 - newY) * 0.6);

    if (newY < integrationThreshold && !isInZone) {
      hapticThreshold();
    }
  }, [dragging, released, height, isInZone]);

  const handlePointerUp = useCallback(() => {
    if (!dragging || released) return;
    setDragging(false);
    setReleased(true);
    velocityRef.current = 0.002; // Tiny downward gravity
  }, [dragging, released]);

  return (
    <div
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Copy */}
      <div
        className="absolute pointer-events-none"
        style={{ top: '8%', left: 0, right: 0, textAlign: 'center', opacity: opacity.steady }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(13px, 3.2vw, 17px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          color: room.fg,
          margin: 0,
        }}>
          {copy}
        </p>
      </div>

      {/* Zone label */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: '5%', left: 0, right: 0, textAlign: 'center' }}
        animate={{ opacity: isInZone ? 0.15 : 0.04 }}
      >
        <span style={{
          fontFamily: SANS,
          fontSize: typeSize.whisper,
          fontWeight: weight.medium,
          letterSpacing: tracking.normal,
          textTransform: 'uppercase',
          color,
        }}>
          INTEGRATION
        </span>
      </motion.div>

      {/* Instruction */}
      {!released && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity.trace }}
          transition={{ delay: 0.5, duration: 1 }}
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
    </div>
  );
}