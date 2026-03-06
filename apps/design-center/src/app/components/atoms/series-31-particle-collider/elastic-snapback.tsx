/**
 * ATOM 307: THE ELASTIC SNAP-BACK ENGINE · S31 · Position 7
 * Elastic tether always returns you to center. Drag away → snap back.
 * INTERACTION: Drag off-screen → screen shakes → release → snap to center
 * RENDER: Canvas 2D · REDUCED MOTION: Static center
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const TETHER_K = 0.08; const TETHER_DAMP = 0.9; const SNAP_THRESHOLD = 0.3; const RESPAWN_DELAY = 100;

interface SnapState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  nodeX: number; nodeY: number; vx: number; vy: number;
  dragging: boolean; maxStretch: number; snapped: boolean; snapAnim: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): SnapState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeX: 0.5, nodeY: 0.5, vx: 0, vy: 0,
    dragging: false, maxStretch: 0, snapped: false, snapAnim: 0,
    completed: false, respawnTimer: 0 }; }

export default function ElasticSnapbackAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
        if (!s.dragging) {
          s.vx += (0.5 - s.nodeX) * TETHER_K; s.vy += (0.5 - s.nodeY) * TETHER_K;
          s.vx *= TETHER_DAMP; s.vy *= TETHER_DAMP;
          s.nodeX += s.vx; s.nodeY += s.vy;
        }

        const dist = Math.sqrt((s.nodeX - 0.5) ** 2 + (s.nodeY - 0.5) ** 2);
        s.maxStretch = Math.max(s.maxStretch, dist);

        if (s.maxStretch > SNAP_THRESHOLD && dist < 0.03 && !s.snapped && !s.dragging) {
          s.snapped = true; cb.onHaptic('completion');
        }
        if (s.snapped) {
          s.snapAnim = Math.min(1, s.snapAnim + 0.012);
          cb.onStateChange?.(s.snapAnim);
          if (s.snapAnim >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }

        if (s.dragging && dist > 0.15 && s.frameCount % 10 === 0) cb.onHaptic('error_boundary');
      }

      const nx = s.nodeX * w; const ny = s.nodeY * h;
      const dist = Math.sqrt((s.nodeX - 0.5) ** 2 + (s.nodeY - 0.5) ** 2);

      // Tether line
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
      const tetherAlpha = Math.min(1, dist * 5) * ALPHA.content.max * 0.3 * entrance;
      ctx.strokeStyle = rgba(s.accentRgb, tetherAlpha);
      ctx.lineWidth = px(STROKE.light + dist * 0.01, minDim); ctx.stroke();

      // Tension glow along tether
      if (dist > 0.1) {
        const tmx = (cx + nx) / 2; const tmy = (cy + ny) / 2;
        const tg = ctx.createRadialGradient(tmx, tmy, 0, tmx, tmy, px(0.04, minDim));
        tg.addColorStop(0, rgba(s.accentRgb, dist * ALPHA.glow.max * 0.2 * entrance));
        tg.addColorStop(1, rgba(s.accentRgb, 0));
        ctx.fillStyle = tg; ctx.fillRect(tmx - px(0.04, minDim), tmy - px(0.04, minDim), px(0.08, minDim), px(0.08, minDim));
      }

      // Center anchor
      ctx.beginPath(); ctx.arc(cx, cy, px(0.008, minDim), 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance); ctx.fill();

      // Node
      const nodeR = px(0.025, minDim);
      const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nodeR * 2.5);
      ng.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      ng.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = ng; ctx.fillRect(nx - nodeR * 2.5, ny - nodeR * 2.5, nodeR * 5, nodeR * 5);
      ctx.beginPath(); ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.6 * entrance); ctx.fill();

      // Snap bloom
      if (s.snapped) {
        const bloomR = minDim * 0.3 * s.snapAnim;
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        bg.addColorStop(0, rgba(s.primaryRgb, (1 - s.snapAnim) * ALPHA.glow.max * 0.4 * entrance));
        bg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bg; ctx.fillRect(cx - bloomR, cy - bloomR, bloomR * 2, bloomR * 2);
      }

      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('CENTERED', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('DRAG AWAY — THEN RELEASE', cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); cbRef.current.onHaptic('drag_snap'); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging || s.snapped) return;
      const rect = canvas.getBoundingClientRect();
      s.nodeX = (e.clientX - rect.left) / rect.width; s.nodeY = (e.clientY - rect.top) / rect.height; };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
