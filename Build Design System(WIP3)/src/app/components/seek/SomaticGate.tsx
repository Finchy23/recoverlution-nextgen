/**
 * SOMATIC GATE — The Inline Physics Lock
 *
 * "You cannot just read about this. You must pass through it."
 *
 * Between transfer scenes, the narrative intentionally locks.
 * A physics atom from the SYNC library appears inline.
 * The user must physically resolve it to earn the next scene.
 *
 * This is not a test. It is a rest stop. The nervous system
 * must catch up with the intellect. The body must process
 * what the mind just received.
 *
 * The gate presents a small, contained atom interaction:
 * a node that must be held until it resolves, a tension
 * that must be eased, a breath that must be matched.
 *
 * When the atom resolves (phase → 'resolve'), the gate opens.
 *
 * Canvas 2D: breathing node with hold-to-resolve mechanic.
 * Simple. Not flashy. A deliberate pause in the cinematic arc.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hapticPressure, hapticResolve, hapticBreathPulse } from '../surfaces/haptics';

const HOLD_DURATION = 4000; // 4 seconds of sustained hold
import { room, font, tracking, typeSize, leading, weight, timing } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface SomaticGateProps {
  color: string;
  copy: string;
  instruction: string;
  breath: number;
  width: number;
  height: number;
  /** Gate variant — determines the visual physics */
  variant?: 'hold' | 'breathe' | 'still';
  onGateOpen: (holdDurationMs: number) => void;
}

export function SomaticGate({
  color,
  copy,
  instruction,
  breath,
  width,
  height,
  variant = 'hold',
  onGateOpen,
}: SomaticGateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const holdingRef = useRef(false);
  const holdStartRef = useRef(0);
  const totalHeldRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [opened, setOpened] = useState(false);
  const openedRef = useRef(false);
  const progressRef = useRef(0);
  // Track turbulence that calms as the user holds
  const turbulenceRef = useRef(1); // 1 = chaotic, 0 = calm

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
    const t = Date.now() * 0.001;
    const [r, g, b] = parseHex(color);
    const p = progressRef.current;
    const turb = turbulenceRef.current;

    // ── Hold physics ──
    if (holdingRef.current && !openedRef.current) {
      const elapsed = Date.now() - holdStartRef.current;
      const newProgress = Math.min(1, (totalHeldRef.current + elapsed) / HOLD_DURATION);
      progressRef.current = newProgress;
      setProgress(newProgress);

      // Turbulence calms as user holds
      turbulenceRef.current = Math.max(0, 1 - newProgress);

      // Haptic escalation
      if (elapsed % 250 < 17) {
        hapticPressure(newProgress * 0.4);
      }

      if (newProgress >= 1) {
        holdingRef.current = false;
        openedRef.current = true;
        setOpened(true);
        hapticResolve();
        const totalMs = totalHeldRef.current + elapsed;
        setTimeout(() => onGateOpen(totalMs), 800);
      }
    } else if (!holdingRef.current && !openedRef.current) {
      // Turbulence grows back when not holding
      turbulenceRef.current = Math.min(1, turbulenceRef.current + 0.003);
      // Progress decays slowly
      if (progressRef.current > 0) {
        progressRef.current = Math.max(0, progressRef.current - 0.002);
        setProgress(progressRef.current);
      }
    }

    const breathPhase = Math.sin(breath * Math.PI * 2);

    // ── Turbulent orbiting nodes — calm as gate resolves ──
    const nodeCount = 6;
    for (let i = 0; i < nodeCount; i++) {
      const baseAngle = (i / nodeCount) * Math.PI * 2;
      // Turbulent: fast, erratic orbit. Calm: slow, unified orbit
      const speed = 0.8 * turb + 0.1;
      const erratic = Math.sin(t * 3 + i * 2.7) * turb * 20;
      const orbitRadius = 30 + turb * 25 + erratic;
      const angle = baseAngle + t * speed + Math.sin(t * 1.5 + i) * turb * 0.5;

      const nx = cx + Math.cos(angle) * orbitRadius;
      const ny = cy + Math.sin(angle) * orbitRadius;
      const nodeSize = 1.5 + (1 - turb) * 1;
      const nodeAlpha = 0.06 + (1 - turb) * 0.08;

      // Node glow
      const nGlow = 6 + (1 - turb) * 8;
      const nGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nGlow);
      nGrad.addColorStop(0, `rgba(${r},${g},${b},${(nodeAlpha * 0.5).toFixed(4)})`);
      nGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = nGrad;
      ctx.beginPath();
      ctx.arc(nx, ny, nGlow, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${nodeAlpha.toFixed(4)})`;
      ctx.fill();

      // Connection lines to center — strengthen as calm grows
      if (1 - turb > 0.1) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = `rgba(${r},${g},${b},${((1 - turb) * 0.03).toFixed(4)})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }

    // ── Central gate node ──
    const coreSize = 4 + (1 - turb) * 4 + breathPhase * (1 + (1 - turb));
    const coreGlow = 15 + (1 - turb) * 30;

    // Glow
    const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreGlow);
    cGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.08 + (1 - turb) * 0.12).toFixed(4)})`);
    cGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreGlow, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(0.15 + (1 - turb) * 0.35).toFixed(3)})`;
    ctx.fill();

    // Inner bright core
    if (p > 0.3) {
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize * 0.4, 0, Math.PI * 2);
      const bright = Math.min(255, r + 60);
      const brightG = Math.min(255, g + 60);
      const brightB = Math.min(255, b + 60);
      ctx.fillStyle = `rgba(${bright},${brightG},${brightB},${((p - 0.3) * 0.5).toFixed(3)})`;
      ctx.fill();
    }

    // ── Progress ring ──
    if (p > 0 && p < 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.1 + p * 0.15).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // ── Opened: expansion burst ──
    if (openedRef.current) {
      const openAge = t - (holdStartRef.current * 0.001 || t);
      const burstRadius = openAge * 60;
      const burstAlpha = Math.max(0, 0.2 - openAge * 0.04);

      if (burstAlpha > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, burstRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${burstAlpha.toFixed(4)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    ctx.restore();

    if (!openedRef.current || (Date.now() - holdStartRef.current) < 3000) {
      rafRef.current = requestAnimationFrame(render);
    }
  }, [width, height, color, breath, onGateOpen]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  const handlePointerDown = useCallback(() => {
    if (openedRef.current) return;
    holdingRef.current = true;
    holdStartRef.current = Date.now();
    hapticBreathPulse();
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!holdingRef.current || openedRef.current) return;
    // Accumulate held time so user can pause and resume
    totalHeldRef.current += Date.now() - holdStartRef.current;
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
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Gate copy */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: height * 0.65,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: opened ? 0 : 0.25 + progress * 0.15,
          transition: opened ? 'opacity 0.8s ease' : 'none',
        }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(10px, 2.5vw, 13px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          color: room.fg,
          margin: 0,
          maxWidth: '65%',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: leading.body,
        }}>
          {copy}
        </p>
      </div>

      {/* Instruction */}
      {!opened && (
        <motion.div
          className="absolute pointer-events-none"
          style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 0 ? 0.04 : 0.1 }}
          transition={{ delay: 1, duration: 1 }}
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

      {/* Gate label */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '5%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: opened ? 0 : 0.04,
          transition: timing.t.fadeSettle,
        }}
      >
        <span style={{
          fontFamily: SANS,
          fontSize: typeSize.whisper,
          fontWeight: weight.medium,
          letterSpacing: tracking.breath,
          textTransform: 'uppercase',
          color: room.fg,
        }}>
          SOMATIC GATE
        </span>
      </div>
    </div>
  );
}