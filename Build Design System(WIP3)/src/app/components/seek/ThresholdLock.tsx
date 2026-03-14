/**
 * THRESHOLD LOCK — Entry Block 1A
 *
 * A single glowing node. The user must press and hold for 3 seconds.
 * The environment slowly illuminates around their thumb, building
 * deep haptic resonance. Deliberate consent before the deep end.
 *
 * Silent Telemetry: measures entry friction — time between
 * screen appearance and hold initiation.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { hapticPressure, hapticResolve, hapticBreathPulse } from '../surfaces/haptics';

const HOLD_DURATION = 3000;
import { room, font, tracking, typeSize, leading, weight, opacity, timing } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface ThresholdLockProps {
  width: number;
  height: number;
  title: string;
  essence: string;
  color: string;
  breath: number;
  instruction: string;
  onUnlock: (entryFrictionMs: number) => void;
}

export function ThresholdLock({
  width,
  height,
  title,
  essence,
  color,
  breath,
  instruction,
  onUnlock,
}: ThresholdLockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const holdingRef = useRef(false);
  const holdStartRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const progressRef = useRef(0);

  // Parse color
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
    const cy = height * 0.42;
    const t = Date.now() * 0.001;
    const p = progressRef.current;
    const [r, g, b] = parseHex(color);

    // Breath modulation
    const breathPhase = Math.sin(breath * Math.PI * 2);
    const breathPulse = 0.5 + breathPhase * 0.15;

    // ── Outer illumination field — grows with progress ──
    if (p > 0) {
      const fieldRadius = 40 + p * 200;
      const fieldGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fieldRadius);
      fieldGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.06 * p).toFixed(4)})`);
      fieldGrad.addColorStop(0.5, `rgba(${r},${g},${b},${(0.03 * p).toFixed(4)})`);
      fieldGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = fieldGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, fieldRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Progress ring ──
    if (p > 0 && p < 1) {
      const ringRadius = 24;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.15 + p * 0.2).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── Central node ──
    const nodeSize = 6 + breathPulse * 2 + p * 4;
    const nodeGlow = 20 + p * 40;

    // Glow
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nodeGlow);
    glowGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.12 + p * 0.15 + breathPulse * 0.03).toFixed(4)})`);
    glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, nodeGlow, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(cx, cy, nodeSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(0.35 + p * 0.45 + breathPulse * 0.05).toFixed(3)})`;
    ctx.fill();

    // Inner bright core
    ctx.beginPath();
    ctx.arc(cx, cy, nodeSize * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)},${(0.2 + p * 0.5).toFixed(3)})`;
    ctx.fill();

    // ── Scattered particles — appear during hold ──
    if (p > 0.1) {
      const particleCount = Math.floor(p * 12);
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + t * 0.3;
        const dist = 35 + Math.sin(t * 0.7 + i * 2.1) * 15 + p * 20;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const pSize = 1 + Math.sin(t + i) * 0.5;
        const pAlpha = p * 0.15 * (0.5 + Math.sin(t * 1.3 + i * 1.7) * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${pAlpha.toFixed(4)})`;
        ctx.fill();
      }
    }

    ctx.restore();

    // ── Hold physics ──
    if (holdingRef.current && !unlocked) {
      const elapsed = Date.now() - holdStartRef.current;
      const newProgress = Math.min(1, elapsed / HOLD_DURATION);
      progressRef.current = newProgress;
      setProgress(newProgress);

      // Haptic escalation
      if (elapsed % 200 < 17) {
        hapticPressure(newProgress);
      }

      if (newProgress >= 1) {
        holdingRef.current = false;
        setUnlocked(true);
        hapticResolve();
        const friction = holdStartRef.current - mountTimeRef.current;
        onUnlock(friction);
        return;
      }
    } else if (!holdingRef.current && progressRef.current > 0 && !unlocked) {
      // Spring back
      progressRef.current = Math.max(0, progressRef.current - 0.02);
      setProgress(progressRef.current);
    }

    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath, unlocked, onUnlock]);

  useEffect(() => {
    mountTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerDown = useCallback(() => {
    if (unlocked) return;
    holdingRef.current = true;
    holdStartRef.current = Date.now();
    hapticBreathPulse();
  }, [unlocked]);

  const handlePointerUp = useCallback(() => {
    holdingRef.current = false;
  }, []);

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
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Title — below the node */}
      <div
        className="absolute flex flex-col items-center gap-3 pointer-events-none"
        style={{
          top: height * 0.55,
          left: 0,
          right: 0,
          opacity: unlocked ? 0 : 0.7 + progress * 0.3,
          transition: unlocked ? 'opacity 0.8s ease' : 'none',
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(18px, 4.5vw, 24px)',
          fontWeight: weight.light,
          color: room.fg,
          textAlign: 'center',
          margin: 0,
          maxWidth: '75%',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: leading.compact,
        }}>
          {title}
        </p>
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(10px, 2.5vw, 13px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          color: room.fg,
          opacity: opacity.spoken,
          textAlign: 'center',
          margin: 0,
          maxWidth: '70%',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: leading.body,
        }}>
          {essence}
        </p>
      </div>

      {/* Instruction */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 130,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: unlocked ? 0 : (progress > 0 ? 0.04 : 0.1),
          transition: timing.t.fadeSlow,
        }}
      >
        <span style={{
          fontFamily: SANS,
          fontSize: typeSize.micro,
          fontWeight: weight.medium,
          letterSpacing: tracking.lift,
          textTransform: 'uppercase',
          color: color,
          opacity: opacity.spoken,
          textAlign: 'center',
        }}>
          {instruction}
        </span>
      </div>
    </div>
  );
}