/**
 * RIPPLE RADIUS — Ascertainment Block (Embodying 3B)
 *
 * The user taps the center of the dark glass and holds.
 * The longer they hold, the further the visual ripple expands.
 * Measures the perceived systemic impact of the insight —
 * is it a localized thought, or a full-body shift?
 *
 * Canvas 2D: concentric ripples expanding from touch point.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { hapticPressure, hapticResolve, hapticBreathPulse } from '../surfaces/haptics';

import { room, font, tracking, typeSize, weight, opacity } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface RippleRadiusProps {
  color: string;
  copy: string;
  prompt: string;
  instruction: string;
  breath: number;
  width: number;
  height: number;
  onComplete: (radius: number) => void;
}

export function RippleRadius({
  color,
  copy,
  prompt,
  instruction,
  breath,
  width,
  height,
  onComplete,
}: RippleRadiusProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [radius, setRadius] = useState(0); // 0-1
  const [holding, setHolding] = useState(false);
  const [released, setReleased] = useState(false);
  const holdStartRef = useRef(0);
  const rafRef = useRef(0);
  const radiusRef = useRef(0);
  const ripplesRef = useRef<{ radius: number; alpha: number; born: number }[]>([]);

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
    const cy = height * 0.45;
    const [r, g, b] = parseHex(color);
    const t = Date.now() * 0.001;
    const maxRadius = Math.min(width, height) * 0.45;

    // ── Hold expansion ──
    if (holding) {
      const elapsed = Date.now() - holdStartRef.current;
      const newRadius = Math.min(1, elapsed / 5000); // 5 seconds to full
      radiusRef.current = newRadius;
      setRadius(newRadius);

      // Haptic escalation
      if (elapsed % 300 < 17) {
        hapticPressure(newRadius * 0.7);
      }

      // Spawn ripples at intervals
      if (elapsed % 800 < 17) {
        ripplesRef.current.push({
          radius: newRadius * maxRadius,
          alpha: 0.15,
          born: t,
        });
      }
    }

    // ── Draw ripples ──
    const ripples = ripplesRef.current;
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      const age = t - rp.born;
      const expandedRadius = rp.radius + age * 30;
      rp.alpha -= 0.002;

      if (rp.alpha <= 0 || expandedRadius > maxRadius * 1.5) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, expandedRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${rp.alpha.toFixed(4)})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // ── Main expansion circle ──
    const currentRadius = radiusRef.current * maxRadius;
    if (currentRadius > 1) {
      // Fill
      const fillGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentRadius);
      fillGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.04 + radiusRef.current * 0.04).toFixed(4)})`);
      fillGrad.addColorStop(0.7, `rgba(${r},${g},${b},${(0.02 + radiusRef.current * 0.02).toFixed(4)})`);
      fillGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Edge ring
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.1 + radiusRef.current * 0.1).toFixed(4)})`;
      ctx.lineWidth = 0.5 + radiusRef.current;
      ctx.stroke();
    }

    // ── Center point ──
    const centerSize = 4 + Math.sin(t * 2) * (holding ? 2 : 1);
    const centerGlow = 15 + radiusRef.current * 20;

    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerGlow);
    glowGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.15 + radiusRef.current * 0.1).toFixed(4)})`);
    glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, centerGlow, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, centerSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(0.4 + radiusRef.current * 0.3).toFixed(3)})`;
    ctx.fill();

    ctx.restore();

    // ── Fade after release ──
    if (released) {
      radiusRef.current = Math.max(0, radiusRef.current - 0.003);
      if (radiusRef.current <= 0.01 && ripples.length === 0) {
        cancelAnimationFrame(rafRef.current);
        return;
      }
    }

    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath, holding, released]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerDown = useCallback(() => {
    if (released) return;
    setHolding(true);
    holdStartRef.current = Date.now();
    hapticBreathPulse();
  }, [released]);

  const handlePointerUp = useCallback(() => {
    if (!holding || released) return;
    setHolding(false);
    setReleased(true);
    const finalRadius = radiusRef.current;
    hapticResolve();
    setTimeout(() => onComplete(finalRadius), 1200);
  }, [holding, released, onComplete]);

  return (
    <div
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
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
        style={{ top: '10%', left: 0, right: 0, textAlign: 'center', opacity: opacity.steady }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(13px, 3.2vw, 17px)',
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

      {/* Radius indicator */}
      {radius > 0.05 && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: height * 0.72,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: opacity.quiet,
          }}
        >
          <span style={{
            fontFamily: font.mono,
            fontSize: typeSize.label,
            color,
          }}>
            {Math.round(radius * 100)}%
          </span>
        </div>
      )}

      {/* Instruction */}
      {!released && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: holding ? 0.03 : 0.08 }}
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