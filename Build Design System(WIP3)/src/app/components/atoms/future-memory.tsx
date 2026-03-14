/**
 * ATOM: FUTURE MEMORY — Sovereignty / Construction
 * Series 10 — Reality Bender · Authorship and construction
 *
 * Luminous geometric fragments slowly assemble into a coherent form.
 * The user draws with their finger — each stroke becomes a persistent
 * light trail that the geometry aligns to. Breath solidifies the vision.
 * You are building the architecture of who you are becoming.
 *
 * INTERACTION: Draw (light trails) · Breath (solidification)
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from './types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB, ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from './atom-utils';

const FRAGMENT_COUNT = 60;
const TRAIL_MAX = 200;

interface Fragment {
  x: number; y: number; vx: number; vy: number;
  angle: number; angularVel: number;
  size: number; brightness: number;
  sides: number; // 3-6 polygon sides
  solidification: number; // 0 = drifting, 1 = locked
}

interface TrailPoint {
  x: number; y: number; age: number;
}

const VOID_BLUE: RGB = [30, 25, 60];
const LIGHT_GOLD: RGB = [220, 200, 140];
const SOLID_WHITE: RGB = [200, 210, 230];

function createFragments(w: number, h: number): Fragment[] {
  return Array.from({ length: FRAGMENT_COUNT }, () => ({
    x: w * 0.1 + Math.random() * w * 0.8,
    y: h * 0.1 + Math.random() * h * 0.8,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    angle: Math.random() * Math.PI * 2,
    angularVel: (Math.random() - 0.5) * 0.01,
    size: 3 + Math.random() * 8,
    brightness: 0.2 + Math.random() * 0.6,
    sides: 3 + Math.floor(Math.random() * 4),
    solidification: 0,
  }));
}

function drawPolygon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sides: number, angle: number) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = angle + (i / sides) * Math.PI * 2;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export default function FutureMemoryAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    fragments: [] as Fragment[],
    trail: [] as TrailPoint[],
    isDrawing: false, smoothBreath: 0,
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    initialized: false,
  });

  useEffect(() => { const s = stateRef.current; s.primaryRgb = parseColor(color); s.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const w = viewport.width, h = viewport.height, s = stateRef.current;
    const minDim = Math.min(w, h);

    if (!s.initialized) { s.fragments = createFragments(w, h); s.initialized = true; }

    const addTrail = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const tx = (e.clientX - rect.left) / rect.width * w;
      const ty = (e.clientY - rect.top) / rect.height * h;
      s.trail.push({ x: tx, y: ty, age: 0 });
      if (s.trail.length > TRAIL_MAX) s.trail.shift();
    };

    const onDown = (e: PointerEvent) => {
      s.isDrawing = true; addTrail(e);
      cbRef.current.onHaptic('hold_start'); canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => { if (s.isDrawing) addTrail(e); };
    const onUp = (e: PointerEvent) => { s.isDrawing = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
      const p = propsRef.current, cb = cbRef.current;
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, w, h); s.frameCount++;

      if (s.entranceProgress < 1) s.entranceProgress = Math.min(1, s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE));
      const entrance = easeOutExpo(s.entranceProgress);

      s.smoothBreath += (p.breathAmplitude - s.smoothBreath) * 0.08;

      // Age trail
      for (const t of s.trail) t.age += 0.003;
      // Remove old trail
      while (s.trail.length > 0 && s.trail[0].age > 1) s.trail.shift();

      // Fragment physics — attracted to nearest trail points
      let totalSolid = 0;
      for (const frag of s.fragments) {
        // Find nearest trail point
        let nearDist = Infinity, nearX = frag.x, nearY = frag.y;
        for (const t of s.trail) {
          const d = Math.hypot(t.x - frag.x, t.y - frag.y);
          if (d < nearDist) { nearDist = d; nearX = t.x; nearY = t.y; }
        }

        // Attraction to trail
        if (nearDist < minDim * 0.2 && s.trail.length > 3) {
          const pull = 0.005 + s.smoothBreath * 0.01;
          frag.vx += (nearX - frag.x) * pull;
          frag.vy += (nearY - frag.y) * pull;
          frag.solidification = Math.min(1, frag.solidification + s.smoothBreath * 0.005);
        } else {
          frag.solidification = Math.max(0, frag.solidification - 0.002);
        }

        // Drift
        if (!p.reducedMotion) {
          frag.vx += (Math.random() - 0.5) * 0.03 * (1 - frag.solidification);
          frag.vy += (Math.random() - 0.5) * 0.03 * (1 - frag.solidification);
        }

        frag.vx *= 0.96; frag.vy *= 0.96;
        frag.x += frag.vx; frag.y += frag.vy;

        // Rotation slows with solidification
        frag.angle += frag.angularVel * (1 - frag.solidification * 0.8);

        // Soft bounds
        if (frag.x < 10) frag.vx += 0.1; if (frag.x > w - 10) frag.vx -= 0.1;
        if (frag.y < 10) frag.vy += 0.1; if (frag.y > h - 10) frag.vy -= 0.1;

        totalSolid += frag.solidification;
      }
      cb.onStateChange?.(totalSolid / FRAGMENT_COUNT);

      // Background
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.5);
      bgGrad.addColorStop(0, rgba(lerpColor(VOID_BLUE, s.primaryRgb, 0.03), entrance * 0.025));
      bgGrad.addColorStop(1, rgba([4, 3, 10], 0));
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

      // Trail
      if (s.trail.length > 1) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 1; i < s.trail.length; i++) {
          const t = s.trail[i], prev = s.trail[i - 1];
          const alpha = (1 - t.age) * 0.15 * entrance;
          if (alpha < 0.003) continue;
          ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(t.x, t.y);
          ctx.strokeStyle = rgba(lerpColor(LIGHT_GOLD, s.accentRgb, 0.2), alpha);
          ctx.lineWidth = minDim * (0.002 + (1 - t.age) * 0.003); ctx.stroke();
        }
      }

      // Fragments
      for (const frag of s.fragments) {
        const solid = frag.solidification;
        const shimmer = p.reducedMotion ? 0.8 : 0.6 + 0.4 * Math.sin(s.frameCount * 0.015 + frag.angle);
        const fColor = lerpColor(
          lerpColor(VOID_BLUE, s.primaryRgb, 0.08),
          lerpColor(SOLID_WHITE, s.accentRgb, 0.1),
          solid,
        );
        const alpha = frag.brightness * shimmer * entrance * (0.05 + solid * 0.3);
        if (alpha < 0.003) continue;

        // Glow when solidifying
        if (solid > 0.3) {
          const glowR = frag.size * (2 + solid * 2);
          const gGrad = ctx.createRadialGradient(frag.x, frag.y, 0, frag.x, frag.y, glowR);
          gGrad.addColorStop(0, rgba(LIGHT_GOLD, alpha * 0.08 * solid));
          gGrad.addColorStop(1, rgba(LIGHT_GOLD, 0));
          ctx.fillStyle = gGrad; ctx.fillRect(frag.x - glowR, frag.y - glowR, glowR * 2, glowR * 2);
        }

        // Draw polygon
        drawPolygon(ctx, frag.x, frag.y, frag.size * (0.6 + solid * 0.4), frag.sides, frag.angle);
        ctx.fillStyle = rgba(fColor, alpha * 0.3);
        ctx.fill();
        ctx.strokeStyle = rgba(fColor, alpha);
        ctx.lineWidth = minDim * (0.001 + solid * 0.001);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} />
    </div>
  );
}
