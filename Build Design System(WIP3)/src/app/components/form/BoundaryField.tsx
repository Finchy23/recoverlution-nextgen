/**
 * BOUNDARY FIELD — The Energetic Perimeter
 *
 * For highly sensitive users who walk into rooms and immediately
 * absorb every frequency in the space. For those whose nervous
 * systems became antennas in childhood. For the enmeshed.
 *
 * The user presses their thumb into the center of the glass.
 * As they hold, a luminous boundary expands outward from the
 * touch point — an energetic perimeter being cast. The boundary
 * is not rigid. It breathes. It has depth. It is alive.
 *
 * External "noise" particles drift inward from the edges of
 * the screen. When they hit the boundary, they deflect and
 * dissolve. The user watches their perimeter hold.
 *
 * The longer they hold, the more the boundary stabilizes.
 * When they release, the boundary persists briefly (muscle memory),
 * then slowly dims. The practice: cast and hold, cast and hold.
 * Each time, the boundary holds longer after release.
 *
 * This is the energetic equivalent of a therapist saying:
 * "That feeling is not yours. You can give it back."
 *
 * Canvas 2D: expanding radial boundary with deflecting particles.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { hapticPressure, hapticResolve, hapticTick, hapticBreathPulse } from '../surfaces/haptics';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  deflected: boolean;
}

interface BoundaryFieldProps {
  width: number;
  height: number;
  color: string;
  breath: number;
  active: boolean;
  /** How many cast-and-hold cycles have been completed */
  onCastComplete?: (castDurationMs: number, holdCount: number) => void;
}

export function BoundaryField({
  width,
  height,
  color,
  breath,
  active,
  onCastComplete,
}: BoundaryFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const holdingRef = useRef(false);
  const holdStartRef = useRef(0);
  const holdCountRef = useRef(0);
  const boundaryRadiusRef = useRef(0); // current boundary radius
  const maxBoundaryRef = useRef(0); // maximum achieved
  const persistenceRef = useRef(0); // 0-1 how long boundary persists after release
  const particlesRef = useRef<Particle[]>([]);
  const [casting, setCasting] = useState(false);
  const deflectCountRef = useRef(0);

  const parseHex = (c: string) => {
    const rgbaMatch = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
    const h = c.replace('#', '');
    if (h.length >= 6) return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    return [100, 180, 160];
  };

  // Spawn external noise particles
  const spawnParticle = useCallback(() => {
    const edge = Math.random() * 4;
    let x: number, y: number, vx: number, vy: number;
    const speed = 0.3 + Math.random() * 0.5;

    if (edge < 1) { // top
      x = Math.random() * width;
      y = -5;
      vx = (Math.random() - 0.5) * 0.5;
      vy = speed;
    } else if (edge < 2) { // right
      x = width + 5;
      y = Math.random() * height;
      vx = -speed;
      vy = (Math.random() - 0.5) * 0.5;
    } else if (edge < 3) { // bottom
      x = Math.random() * width;
      y = height + 5;
      vx = (Math.random() - 0.5) * 0.5;
      vy = -speed;
    } else { // left
      x = -5;
      y = Math.random() * height;
      vx = speed;
      vy = (Math.random() - 0.5) * 0.5;
    }

    particlesRef.current.push({
      x, y, vx, vy,
      size: 0.8 + Math.random() * 1.2,
      alpha: 0.03 + Math.random() * 0.05,
      deflected: false,
    });
  }, [width, height]);

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
    const cy = height * 0.45;
    const t = Date.now() * 0.001;
    const [r, g, b] = parseHex(color);
    const breathPhase = Math.sin(breath * Math.PI * 2);
    const maxRadius = Math.min(width, height) * 0.38;

    // ── Boundary expansion ──
    if (holdingRef.current) {
      const elapsed = Date.now() - holdStartRef.current;
      const targetRadius = Math.min(maxRadius, elapsed * 0.04); // Expands ~40px/sec
      // Smooth approach
      boundaryRadiusRef.current += (targetRadius - boundaryRadiusRef.current) * 0.05;
      maxBoundaryRef.current = Math.max(maxBoundaryRef.current, boundaryRadiusRef.current);

      // Build persistence with each hold
      persistenceRef.current = Math.min(1, persistenceRef.current + 0.001);

      // Haptic at size thresholds
      if (boundaryRadiusRef.current > maxRadius * 0.3 && boundaryRadiusRef.current < maxRadius * 0.32) hapticTick();
      if (boundaryRadiusRef.current > maxRadius * 0.6 && boundaryRadiusRef.current < maxRadius * 0.62) hapticPressure(0.4);
      if (boundaryRadiusRef.current > maxRadius * 0.9 && boundaryRadiusRef.current < maxRadius * 0.92) hapticPressure(0.7);
    } else {
      // Decay — slower with more persistence built
      const decayRate = 0.003 * (1 - persistenceRef.current * 0.7);
      boundaryRadiusRef.current = Math.max(0, boundaryRadiusRef.current - decayRate * boundaryRadiusRef.current);
    }

    const bRadius = boundaryRadiusRef.current;
    const breathMod = 1 + breathPhase * 0.03;

    // ── Draw boundary field ──
    if (bRadius > 5) {
      const effectiveRadius = bRadius * breathMod;

      // Outer boundary edge
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.06 + (bRadius / maxRadius) * 0.1).toFixed(4)})`;
      ctx.lineWidth = 1 + (bRadius / maxRadius) * 0.5;
      ctx.stroke();

      // Inner boundary glow
      const bGrad = ctx.createRadialGradient(cx, cy, effectiveRadius * 0.6, cx, cy, effectiveRadius);
      bGrad.addColorStop(0, `rgba(${r},${g},${b},0)`);
      bGrad.addColorStop(0.7, `rgba(${r},${g},${b},${(0.01 + (bRadius / maxRadius) * 0.02).toFixed(4)})`);
      bGrad.addColorStop(1, `rgba(${r},${g},${b},${(0.03 + (bRadius / maxRadius) * 0.04).toFixed(4)})`);
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
      ctx.fill();

      // Breathing membrane lines — concentric rings within boundary
      const ringCount = 3;
      for (let i = 1; i <= ringCount; i++) {
        const ringFraction = i / (ringCount + 1);
        const ringR = effectiveRadius * ringFraction;
        const ringWave = Math.sin(t * 0.8 + i * 1.3) * 3;

        ctx.beginPath();
        ctx.arc(cx, cy, ringR + ringWave, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${(0.015 * (1 - ringFraction * 0.5)).toFixed(4)})`;
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    }

    // ── Center node ──
    const nodeSize = 3 + (holdingRef.current ? 3 : 0) + breathPhase * 1;
    const nodeGlow = 12 + (bRadius / maxRadius) * 15;

    const nGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nodeGlow);
    nGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.1 + (bRadius / maxRadius) * 0.1).toFixed(4)})`);
    nGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = nGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, nodeGlow, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, nodeSize, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(0.2 + (bRadius / maxRadius) * 0.3).toFixed(3)})`;
    ctx.fill();

    // ── Spawn noise particles ──
    if (Math.random() < 0.1) {
      spawnParticle();
    }

    // Limit particles
    if (particlesRef.current.length > 40) {
      particlesRef.current.splice(0, particlesRef.current.length - 40);
    }

    // ── Update and draw noise particles ──
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Check collision with boundary
      if (bRadius > 10 && !p.deflected) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < bRadius * breathMod + 5) {
          // Deflect!
          p.deflected = true;
          const angle = Math.atan2(dy, dx);
          const deflectSpeed = 1.5 + Math.random() * 1;
          p.vx = Math.cos(angle) * deflectSpeed;
          p.vy = Math.sin(angle) * deflectSpeed;
          p.alpha *= 0.6; // Dim on impact
          deflectCountRef.current += 1;

          // Haptic on deflection
          if (deflectCountRef.current % 3 === 0) {
            hapticTick();
          }
        }
      }

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Fade deflected particles faster
      if (p.deflected) {
        p.alpha -= 0.003;
      }

      // Remove off-screen or faded
      if (p.alpha <= 0 ||
          p.x < -20 || p.x > width + 20 ||
          p.y < -20 || p.y > height + 20) {
        particles.splice(i, 1);
        continue;
      }

      // Draw
      const pColor = p.deflected
        ? `rgba(${r},${g},${b},${(p.alpha * 0.5).toFixed(4)})` // deflected take boundary color
        : `rgba(180,150,150,${p.alpha.toFixed(4)})`; // incoming are muted

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = pColor;
      ctx.fill();
    }

    // ── Deflection impact flashes — on the boundary edge ──
    // (tiny bright spots where particles hit)

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [width, height, color, breath, active, spawnParticle]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
      return;
    }
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, render]);

  const handlePointerDown = useCallback(() => {
    if (!active) return;
    holdingRef.current = true;
    holdStartRef.current = Date.now();
    setCasting(true);
    hapticPressure(0.3);
  }, [active]);

  const handlePointerUp = useCallback(() => {
    if (!holdingRef.current) return;
    const holdDuration = Date.now() - holdStartRef.current;
    holdingRef.current = false;
    setCasting(false);
    holdCountRef.current += 1;

    if (boundaryRadiusRef.current > 30) {
      hapticResolve();
      onCastComplete?.(holdDuration, holdCountRef.current);
    }
  }, [onCastComplete]);

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
