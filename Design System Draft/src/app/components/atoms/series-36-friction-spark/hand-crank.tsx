/**
 * ATOM 353: THE HAND CRANK ENGINE
 * ================================
 * Series 36 — Friction Spark · Position 3
 *
 * Cure the crushing weight of initial resistance.
 * Heavy rusted circular dial. Circular finger drag to turn.
 * After 3 agonizing rotations rust shatters — dial spins freely.
 *
 * RENDER: Canvas 2D
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, motionScale,
} from '../atom-utils';

const DIAL_RADIUS = 0.18;
const HANDLE_OFFSET = 0.14;
const ROTATIONS_NEEDED = 3;
const RUST_PARTICLE_COUNT = 30;

export default function HandCrankAtom({
  breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    angle: 0, totalRotation: 0,
    dragging: false, lastAngle: 0,
    freed: false, freeAnim: 0, freeSpinSpeed: 0, completed: false,
    rustFragments: [] as { x: number; y: number; vx: number; vy: number; life: number; size: number }[],
    grindShake: 0,
  });
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion); s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);
      if (p.phase === 'resolve') s.totalRotation = ROTATIONS_NEEDED * Math.PI * 2;

      const rotationProg = Math.min(1, s.totalRotation / (ROTATIONS_NEEDED * Math.PI * 2));

      // Free check
      if (rotationProg >= 1 && !s.freed) {
        s.freed = true; s.freeSpinSpeed = 0.08;
        cb.onHaptic('completion');
        // Spawn rust fragments
        for (let i = 0; i < RUST_PARTICLE_COUNT; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = DIAL_RADIUS + Math.random() * 0.05;
          s.rustFragments.push({
            x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r,
            vx: Math.cos(a) * (0.003 + Math.random() * 0.005),
            vy: Math.sin(a) * (0.003 + Math.random() * 0.005),
            life: 1, size: 0.003 + Math.random() * 0.006,
          });
        }
      }

      // Free spin
      if (s.freed) {
        s.freeAnim = Math.min(1, s.freeAnim + 0.008 * ms);
        s.angle += s.freeSpinSpeed * ms;
        s.freeSpinSpeed *= 0.998; // Gentle decel to permanent smooth spin
        s.freeSpinSpeed = Math.max(0.01, s.freeSpinSpeed);
      }
      if (s.grindShake > 0) s.grindShake--;

      cb.onStateChange?.(s.freed ? 0.5 + s.freeAnim * 0.5 : rotationProg * 0.5);

      const dialR = minDim * DIAL_RADIUS;
      const handleR = minDim * HANDLE_OFFSET;
      const shakeX = s.grindShake > 0 ? Math.sin(s.grindShake * 2) * px(0.003, minDim) : 0;

      // ── Dial shadow ─────────────────────────────────
      const sg = ctx.createRadialGradient(cx, cy, dialR * 0.5, cx, cy, dialR * 1.8);
      sg.addColorStop(0, rgba(s.accentRgb, ALPHA.glow.max * 0.1 * entrance));
      sg.addColorStop(1, rgba(s.accentRgb, 0));
      ctx.fillStyle = sg; ctx.fillRect(cx - dialR * 2, cy - dialR * 2, dialR * 4, dialR * 4);

      // ── Rust layer (fades with rotation) ────────────
      if (!s.freed) {
        const rustAlpha = (1 - rotationProg) * 0.2;
        ctx.beginPath(); ctx.arc(cx + shakeX, cy, dialR * 1.05, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * rustAlpha * entrance); ctx.fill();
        // Rust speckles
        for (let i = 0; i < 20; i++) {
          const ra = (i / 20) * Math.PI * 2;
          const rr = dialR * (0.7 + Math.random() * 0.3);
          const rx = cx + Math.cos(ra) * rr + shakeX;
          const ry = cy + Math.sin(ra) * rr;
          ctx.beginPath(); ctx.arc(rx, ry, px(0.002, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * (1 - rotationProg) * 0.15 * entrance);
          ctx.fill();
        }
      }

      // ── Dial body ───────────────────────────────────
      ctx.beginPath(); ctx.arc(cx + shakeX, cy, dialR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.freed ? s.primaryRgb : s.accentRgb,
        ALPHA.content.max * (s.freed ? 0.4 + s.freeAnim * 0.2 : 0.3) * entrance);
      ctx.lineWidth = px(0.003, minDim); ctx.stroke();

      // Center hub
      ctx.beginPath(); ctx.arc(cx + shakeX, cy, px(0.015, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.freed ? s.primaryRgb : s.accentRgb,
        ALPHA.content.max * 0.4 * entrance); ctx.fill();

      // ── Handle ──────────────────────────────────────
      const hx = cx + Math.cos(s.angle) * handleR + shakeX;
      const hy = cy + Math.sin(s.angle) * handleR;
      // Handle arm
      ctx.beginPath(); ctx.moveTo(cx + shakeX, cy); ctx.lineTo(hx, hy);
      ctx.strokeStyle = rgba(s.freed ? s.primaryRgb : s.accentRgb,
        ALPHA.content.max * 0.35 * entrance);
      ctx.lineWidth = px(0.002, minDim); ctx.stroke();
      // Handle grip
      const gripR = px(0.02, minDim);
      if (s.freed) {
        const gg = ctx.createRadialGradient(hx, hy, 0, hx, hy, gripR * 3);
        gg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * s.freeAnim * entrance));
        gg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = gg; ctx.fillRect(hx - gripR * 3, hy - gripR * 3, gripR * 6, gripR * 6);
      }
      ctx.beginPath(); ctx.arc(hx, hy, gripR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.freed ? s.primaryRgb : s.accentRgb,
        ALPHA.content.max * 0.5 * entrance); ctx.fill();

      // ── Rust fragments ──────────────────────────────
      for (let i = s.rustFragments.length - 1; i >= 0; i--) {
        const rf = s.rustFragments[i];
        rf.x += rf.vx * ms; rf.y += rf.vy * ms;
        rf.vy += 0.0001 * ms; rf.life -= 0.008;
        if (rf.life <= 0) { s.rustFragments.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(rf.x * w, rf.y * h, px(rf.size * rf.life, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * rf.life * entrance); ctx.fill();
      }

      // ── Free spin glow ──────────────────────────────
      if (s.freed) {
        const gR = dialR * 1.5 * s.freeAnim;
        const fg = ctx.createRadialGradient(cx, cy, dialR * 0.3, cx, cy, gR);
        fg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * s.freeAnim * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg; ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.freed) return;
      const rect = canvas.getBoundingClientRect();
      s.dragging = true;
      s.lastAngle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const angle = Math.atan2(e.clientY - rect.top - rect.height / 2, e.clientX - rect.left - rect.width / 2);
      let delta = angle - s.lastAngle;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      // Resistance that decreases with progress
      const resistance = 0.3 + (1 - Math.min(1, s.totalRotation / (ROTATIONS_NEEDED * Math.PI * 2))) * 0.7;
      s.angle += delta * resistance;
      s.totalRotation += Math.abs(delta);
      s.lastAngle = angle;
      s.grindShake = 3;
      if (Math.abs(delta) > 0.05) callbacksRef.current.onHaptic('drag_snap');
    };
    const onUp = () => { stateRef.current.dragging = false; };
    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
