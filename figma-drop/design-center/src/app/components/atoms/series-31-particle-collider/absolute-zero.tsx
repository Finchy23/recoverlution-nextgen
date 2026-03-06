/**
 * ATOM 310: THE ABSOLUTE ZERO ENGINE · S31 · Position 10 (Capstone)
 * Two nodes merge only at zero kinetic energy — perfect calm.
 * Aggression worsens vibration. Patience rewards with silent unity.
 * INTERACTION: Drag gently → zero-force contact → silent merge
 * RENDER: Canvas 2D · REDUCED MOTION: Static merged
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const VIBRATE_BASE = 0.005; const AGGRESSION_PENALTY = 0.01; const CALM_BONUS = 0.0002;
const MERGE_THRESHOLD = 0.001; const MERGE_DIST = 0.04; const RESPAWN_DELAY = 100;

interface ZeroState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  ax: number; ay: number; bx: number; by: number;
  vibration: number; dragging: 'A' | 'B' | null; lastMx: number; lastMy: number;
  merged: boolean; mergeAnim: number; completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): ZeroState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    ax: 0.35, ay: 0.5, bx: 0.65, by: 0.5,
    vibration: VIBRATE_BASE, dragging: null, lastMx: 0, lastMy: 0,
    merged: false, mergeAnim: 0, completed: false, respawnTimer: 0 }; }

export default function AbsoluteZeroAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress; const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      if (!p.reducedMotion && !s.completed) {
        // Vibration naturally decays
        s.vibration = Math.max(0, s.vibration - CALM_BONUS);

        // Breath coupling: breath helps calm
        const breath = p.breathAmplitude;
        if (breath > 0.3 && breath < 0.7) s.vibration = Math.max(0, s.vibration - CALM_BONUS * 2);

        const dist = Math.sqrt((s.ax - s.bx) ** 2 + (s.ay - s.by) ** 2);
        cb.onStateChange?.(Math.max(0, 1 - s.vibration / VIBRATE_BASE));

        // Check merge
        if (dist < MERGE_DIST && s.vibration < MERGE_THRESHOLD && !s.merged) {
          s.merged = true; cb.onHaptic('completion');
        }
        if (s.merged) {
          s.mergeAnim = Math.min(1, s.mergeAnim + 0.01);
          s.ax += (0.5 - s.ax) * 0.05; s.bx += (0.5 - s.bx) * 0.05;
          s.ay += (0.5 - s.ay) * 0.05; s.by += (0.5 - s.by) * 0.05;
          if (s.mergeAnim >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }

        if (s.vibration > VIBRATE_BASE * 0.5 && s.frameCount % 15 === 0) cb.onHaptic('error_boundary');
      }

      const nodeR = px(0.02, minDim);
      const vib = s.vibration * minDim * ms;

      // Vibration indicators
      if (s.vibration > MERGE_THRESHOLD * 2) {
        const vibR = px(0.15, minDim) * (s.vibration / VIBRATE_BASE);
        for (const [nx, ny] of [[s.ax, s.ay], [s.bx, s.by]]) {
          const vg = ctx.createRadialGradient(nx * w, ny * h, nodeR, nx * w, ny * h, vibR);
          vg.addColorStop(0, rgba(s.accentRgb, s.vibration / VIBRATE_BASE * ALPHA.glow.max * 0.1 * entrance));
          vg.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = vg; ctx.fillRect(nx * w - vibR, ny * h - vibR, vibR * 2, vibR * 2);
        }
      }

      // Nodes (with vibration jitter)
      if (!s.merged || s.mergeAnim < 0.8) {
        for (const [nx, ny, col] of [[s.ax, s.ay, s.accentRgb], [s.bx, s.by, s.primaryRgb]] as [number, number, RGB][]) {
          const jx = (Math.random() - 0.5) * vib; const jy = (Math.random() - 0.5) * vib;
          const px2 = nx * w + jx; const py2 = ny * h + jy;
          const ng = ctx.createRadialGradient(px2, py2, 0, px2, py2, nodeR * 2);
          ng.addColorStop(0, rgba(col, ALPHA.glow.max * 0.2 * entrance)); ng.addColorStop(1, rgba(col, 0));
          ctx.fillStyle = ng; ctx.fillRect(px2 - nodeR * 2, py2 - nodeR * 2, nodeR * 4, nodeR * 4);
          ctx.beginPath(); ctx.arc(px2, py2, nodeR * (1 - s.mergeAnim * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = rgba(col, ALPHA.content.max * (1 - s.mergeAnim) * entrance); ctx.fill();
        }
      }

      // Merged orb
      if (s.merged) {
        const mR = nodeR * (1 + s.mergeAnim);
        const mg = ctx.createRadialGradient(cx, cy, 0, cx, cy, mR * 3);
        mg.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), s.mergeAnim * ALPHA.glow.max * 0.4 * entrance));
        mg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = mg; ctx.fillRect(cx - mR * 3, cy - mR * 3, mR * 6, mR * 6);
        ctx.beginPath(); ctx.arc(cx, cy, mR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), s.mergeAnim * ALPHA.content.max * 0.5 * entrance);
        ctx.fill();
      }

      // Temperature indicator
      const tempY = h * 0.08; const tempW = px(0.15, minDim);
      const tempFill = 1 - Math.min(1, s.vibration / VIBRATE_BASE);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
      ctx.fillRect(cx - tempW / 2, tempY, tempW, px(0.005, minDim));
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
      ctx.fillRect(cx - tempW / 2, tempY, tempW * tempFill, px(0.005, minDim));

      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('ABSOLUTE ZERO', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('GUIDE GENTLY — NO FORCE', cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { const s = stateRef.current; if (s.merged) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      const distA = Math.sqrt((mx - s.ax) ** 2 + (my - s.ay) ** 2);
      const distB = Math.sqrt((mx - s.bx) ** 2 + (my - s.by) ** 2);
      s.dragging = distA < distB ? 'A' : 'B'; s.lastMx = mx; s.lastMy = my;
      canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width; const my = (e.clientY - rect.top) / rect.height;
      const speed = Math.sqrt((mx - s.lastMx) ** 2 + (my - s.lastMy) ** 2);
      // Fast movement = aggression = more vibration
      if (speed > 0.01) s.vibration = Math.min(VIBRATE_BASE * 2, s.vibration + speed * AGGRESSION_PENALTY);
      if (s.dragging === 'A') { s.ax = mx; s.ay = my; } else { s.bx = mx; s.by = my; }
      s.lastMx = mx; s.lastMy = my; };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = null; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'crosshair' }} /></div>);
}
