/**
 * BREATH VOLUME — Active Resource Entrainment
 *
 * A Canvas 2D volumetric mass — a luminous, soft-edged sphere
 * that mathematically expands on the inhale and contracts on
 * the exhale at the therapeutic 5.5 BPM vagal rhythm.
 *
 * The user matches their breath to the volume. They are not
 * watching a timer or following text. They are breathing WITH
 * the glass. The device becomes an extension of the lungs.
 *
 * When the user's hold (press = inhale, release = exhale) aligns
 * with the sphere's cycle, the sphere's glow brightens and a
 * subtle coherence ring appears. Mismatched timing causes the
 * sphere to dim slightly — no punishment, just feedback.
 *
 * The sphere never judges. It just breathes.
 *
 * Canvas 2D: soft-edged radial gradient sphere with breath physics.
 * Runs inside the Resource container, replacing the static pulse
 * when the practice calls for active entrainment.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { hapticBreathPulse, hapticPressure } from '../surfaces/haptics';

const BREATH_CYCLE_MS = 10909; // 5.5 BPM
const INHALE_RATIO = 0.45;    // 45% inhale, 55% exhale (natural rhythm)

interface BreathVolumeProps {
  width: number;
  height: number;
  color: string;
  breath: number;
  active: boolean;
  /** Vertical center position (fraction 0-1, default 0.45) */
  yCenter?: number;
  /** Size multiplier (default 1) */
  scale?: number;
}

export function BreathVolume({
  width,
  height,
  color,
  breath,
  active,
  yCenter = 0.45,
  scale = 1,
}: BreathVolumeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const mountTimeRef = useRef(Date.now());
  const holdingRef = useRef(false);
  const coherenceRef = useRef(0); // 0-1 how aligned the user is
  const [coherence, setCoherence] = useState(0);

  const parseHex = (c: string) => {
    const h = c.replace('#', '').replace(/rgba?\([^)]+\)/, '');
    // Handle rgba format
    const rgbaMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) {
      return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
    }
    if (h.length >= 6) {
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    return [80, 180, 120];
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
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
    const cy = height * yCenter;
    const t = Date.now() * 0.001;
    const [r, g, b] = parseHex(color);

    // ── Breath cycle ──
    const elapsed = (Date.now() - mountTimeRef.current) % BREATH_CYCLE_MS;
    const cyclePhase = elapsed / BREATH_CYCLE_MS; // 0-1

    // Inhale phase: 0 → INHALE_RATIO (volume expands)
    // Exhale phase: INHALE_RATIO → 1 (volume contracts)
    let volumeFraction: number;
    if (cyclePhase < INHALE_RATIO) {
      // Inhale — ease in
      const t = cyclePhase / INHALE_RATIO;
      volumeFraction = Math.sin(t * Math.PI * 0.5); // 0 → 1 with ease
    } else {
      // Exhale — ease out
      const t = (cyclePhase - INHALE_RATIO) / (1 - INHALE_RATIO);
      volumeFraction = Math.cos(t * Math.PI * 0.5); // 1 → 0 with ease
    }

    // Check if user is in phase
    const isInhalePhase = cyclePhase < INHALE_RATIO;
    const userAligned = (isInhalePhase && holdingRef.current) ||
                        (!isInhalePhase && !holdingRef.current);

    // Update coherence
    if (userAligned) {
      coherenceRef.current = Math.min(1, coherenceRef.current + 0.004);
    } else {
      coherenceRef.current = Math.max(0, coherenceRef.current - 0.002);
    }
    setCoherence(coherenceRef.current);

    const coh = coherenceRef.current;
    const baseRadius = (30 + scale * 25) * (1 + volumeFraction * 0.6);

    // ── Outer atmospheric field ──
    const fieldRadius = baseRadius * 3;
    const fieldGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fieldRadius);
    fieldGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.02 + coh * 0.02 + volumeFraction * 0.015).toFixed(4)})`);
    fieldGrad.addColorStop(0.4, `rgba(${r},${g},${b},${(0.008 + coh * 0.01).toFixed(4)})`);
    fieldGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = fieldGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, fieldRadius, 0, Math.PI * 2);
    ctx.fill();

    // ── Main volume sphere ──
    const sphereGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius);
    sphereGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.06 + coh * 0.08 + volumeFraction * 0.04).toFixed(4)})`);
    sphereGrad.addColorStop(0.5, `rgba(${r},${g},${b},${(0.03 + coh * 0.04).toFixed(4)})`);
    sphereGrad.addColorStop(0.8, `rgba(${r},${g},${b},${(0.01 + coh * 0.02).toFixed(4)})`);
    sphereGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // ── Surface edge — subtle rim ──
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r},${g},${b},${(0.04 + coh * 0.06).toFixed(4)})`;
    ctx.lineWidth = 0.5 + coh * 0.5;
    ctx.stroke();

    // ── Coherence ring — appears when aligned ──
    if (coh > 0.2) {
      const cohRingRadius = baseRadius + 8 + Math.sin(t * 1.5) * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, cohRingRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${((coh - 0.2) * 0.08).toFixed(4)})`;
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }

    // ── Inner luminance — brightens with coherence ──
    if (coh > 0.3) {
      const innerSize = baseRadius * 0.3;
      const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerSize);
      const bright = Math.min(255, r + 60);
      const brightG = Math.min(255, g + 60);
      const brightB = Math.min(255, b + 60);
      innerGrad.addColorStop(0, `rgba(${bright},${brightG},${brightB},${((coh - 0.3) * 0.1).toFixed(4)})`);
      innerGrad.addColorStop(1, `rgba(${bright},${brightG},${brightB},0)`);
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, innerSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Phase indicator dots — inhale/exhale ──
    // Subtle dots below the sphere showing cycle position
    const indicatorY = cy + baseRadius + 20;
    const dotSpacing = 3;
    const totalDots = 8;
    for (let i = 0; i < totalDots; i++) {
      const dotPhase = i / totalDots;
      const dotX = cx + (i - totalDots / 2 + 0.5) * dotSpacing;
      const isActive = Math.abs(dotPhase - cyclePhase) < 0.08 ||
                       Math.abs(dotPhase - cyclePhase + 1) < 0.08 ||
                       Math.abs(dotPhase - cyclePhase - 1) < 0.08;
      const dotAlpha = isActive ? 0.12 + coh * 0.08 : 0.02;

      ctx.beginPath();
      ctx.arc(dotX, indicatorY, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${dotAlpha.toFixed(4)})`;
      ctx.fill();
    }

    // ── Breath particles — drift upward on exhale, inward on inhale ──
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + t * 0.1;
      const breathOffset = isInhalePhase ? -1 : 1; // inward on inhale, outward on exhale
      const dist = baseRadius + breathOffset * (5 + volumeFraction * 10) + Math.sin(t * 0.5 + i * 2.1) * 5;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;

      ctx.beginPath();
      ctx.arc(px, py, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${(0.03 + coh * 0.04).toFixed(4)})`;
      ctx.fill();
    }

    ctx.restore();

    // Haptic on breath transitions
    if (cyclePhase < 0.02 || (Math.abs(cyclePhase - INHALE_RATIO) < 0.02)) {
      hapticBreathPulse();
    }

    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath, active, yCenter, scale]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    mountTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, render]);

  // Pointer handlers — press = inhale, release = exhale
  const handlePointerDown = useCallback(() => {
    if (!active) return;
    holdingRef.current = true;
    hapticPressure(0.2);
  }, [active]);

  const handlePointerUp = useCallback(() => {
    holdingRef.current = false;
  }, []);

  if (!active) return null;

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
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </div>
  );
}
