/**
 * FOCUS PULL — Ascertainment Block (Knowing 3B)
 *
 * A blurred digital mass. The user slides a tension bar
 * to sharpen it into a pristine, focused form.
 * Measures structural understanding — clarity of the concept.
 *
 * Canvas 2D: renders a blurred→sharp morphing sphere.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { hapticPressure, hapticResolve } from '../surfaces/haptics';
import { room, font, tracking, typeSize, leading, weight, opacity } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface FocusPullProps {
  color: string;
  prompt: string;
  copy: string;
  instruction: string;
  breath: number;
  width: number;
  height: number;
  onComplete: (score: number) => void;
}

export function FocusPull({
  color,
  prompt,
  copy,
  instruction,
  breath,
  width,
  height,
  onComplete,
}: FocusPullProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clarity, setClarity] = useState(0); // 0 = blurred, 1 = sharp
  const [dragging, setDragging] = useState(false);
  const [locked, setLocked] = useState(false);
  const startYRef = useRef(0);
  const startClarityRef = useRef(0);
  const rafRef = useRef(0);

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

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
    const cy = height * 0.4;
    const [r, g, b] = parseHex(color);
    const t = Date.now() * 0.001;
    const breathPulse = Math.sin(breath * Math.PI * 2);

    // The mass — transitions from scattered/blurred to focused sphere
    const scatter = 1 - clarity;
    const sphereRadius = 25 + clarity * 10 + breathPulse * 2;

    // Scattered particles (low clarity)
    if (scatter > 0.01) {
      const particleCount = 40;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + t * (0.1 + scatter * 0.3);
        const maxDist = 30 + scatter * 80;
        const dist = (sphereRadius * 0.3) + Math.sin(t * 0.5 + i * 0.7) * maxDist * scatter;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist * 0.8;
        const pSize = 1 + scatter * 2 + Math.sin(t + i) * scatter;
        const pAlpha = scatter * (0.08 + Math.sin(t * 1.1 + i * 2.3) * 0.04);

        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, pSize), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${pAlpha.toFixed(4)})`;
        ctx.fill();
      }
    }

    // Core sphere (high clarity)
    if (clarity > 0.05) {
      // Outer glow
      const glowSize = sphereRadius * 2.5;
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
      glowGrad.addColorStop(0, `rgba(${r},${g},${b},${(clarity * 0.08).toFixed(4)})`);
      glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Main sphere
      const sphereGrad = ctx.createRadialGradient(
        cx - sphereRadius * 0.2, cy - sphereRadius * 0.2, 0,
        cx, cy, sphereRadius,
      );
      sphereGrad.addColorStop(0, `rgba(${Math.min(255, r + 40)},${Math.min(255, g + 40)},${Math.min(255, b + 40)},${(clarity * 0.3).toFixed(3)})`);
      sphereGrad.addColorStop(0.7, `rgba(${r},${g},${b},${(clarity * 0.15).toFixed(3)})`);
      sphereGrad.addColorStop(1, `rgba(${r},${g},${b},${(clarity * 0.05).toFixed(3)})`);
      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius, 0, Math.PI * 2);
      ctx.fill();

      // Edge ring
      if (clarity > 0.5) {
        ctx.beginPath();
        ctx.arc(cx, cy, sphereRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${((clarity - 0.5) * 0.2).toFixed(4)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath, clarity]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (locked) return;
    setDragging(true);
    startYRef.current = e.clientY;
    startClarityRef.current = clarity;
  }, [locked, clarity]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || locked) return;
    // Upward drag increases clarity
    const delta = startYRef.current - e.clientY;
    const newClarity = Math.max(0, Math.min(1, startClarityRef.current + delta / (height * 0.35)));
    setClarity(newClarity);

    if (newClarity > 0.1) hapticPressure(newClarity * 0.5);

    // Lock at full clarity
    if (newClarity >= 0.98) {
      setLocked(true);
      setClarity(1);
      hapticResolve();
      setTimeout(() => onComplete(newClarity), 800);
    }
  }, [dragging, locked, height, onComplete]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
    if (!locked) {
      // Spring back slightly
      setClarity(prev => Math.max(0, prev - 0.1));
    }
  }, [locked]);

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
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Copy */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: opacity.steady,
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(12px, 3vw, 16px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          color: room.fg,
          margin: 0,
          maxWidth: '70%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {copy}
        </p>
      </div>

      {/* Prompt — emerges with clarity */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          top: height * 0.58,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
        animate={{
          opacity: clarity > 0.5 ? (clarity - 0.5) * 0.6 : 0,
          filter: `blur(${Math.max(0, (1 - clarity) * 4)}px)`,
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(11px, 2.8vw, 14px)',
          fontWeight: weight.light,
          color: color,
          margin: 0,
          maxWidth: '75%',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: leading.body,
        }}>
          {prompt}
        </p>
      </motion.div>

      {/* Instruction */}
      {!locked && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity.steady }}
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