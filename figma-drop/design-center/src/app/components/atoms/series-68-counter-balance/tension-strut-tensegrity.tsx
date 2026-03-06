/**
 * ATOM 679: THE TENSION STRUT ENGINE · Series 68 · Position 9
 * Place a rigid strut between two opposing pulling forces — tensions
 * lock into perfect unshakeable tensegrity architecture.
 *
 * INTERACTION: Drag (place strut between forces) → tensegrity lock
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static tensegrity
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const FORCE_A_X = 0.15; const FORCE_B_X = 0.85; const CORE_Y = 0.5;
const NODE_RADIUS = 0.02; const STRUT_SNAP_DIST = 0.1; const LOCK_DURATION = 90;
const STRETCH_RATE = 0.0003; const RESPAWN_DELAY = 100;

interface TensState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  coreX: number; stretch: number; strutPlaced: boolean; locked: boolean; lockTimer: number;
  strutX: number; strutY: number; dragging: boolean; dragX: number; dragY: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): TensState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    coreX: 0.5, stretch: 0, strutPlaced: false, locked: false, lockTimer: 0,
    strutX: 0.5, strutY: 0.25, dragging: false, dragX: 0.5, dragY: 0.25,
    completed: false, respawnTimer: 0 }; }

export default function TensionStrutTensegrityAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
      const nodeR = px(NODE_RADIUS, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      if (!p.reducedMotion && !s.completed) {
        if (!s.strutPlaced) {
          s.stretch = Math.min(0.15, s.stretch + STRETCH_RATE);
          s.coreX = 0.5 + Math.sin(s.frameCount * 0.03) * s.stretch;
          if (s.frameCount % 8 === 0 && s.stretch > 0.05) cb.onHaptic('hold_start');
        } else if (!s.locked) {
          s.coreX += (0.5 - s.coreX) * 0.05;
          s.lockTimer++;
          cb.onStateChange?.(0.5 + s.lockTimer / LOCK_DURATION * 0.5);
          if (s.lockTimer >= LOCK_DURATION) { s.locked = true; s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }
      }

      const coreNx = s.coreX * w; const coreNy = CORE_Y * h;
      const forceAx = FORCE_A_X * w; const forceBx = FORCE_B_X * w;

      // Tension lines from forces to core
      for (const fx of [forceAx, forceBx]) {
        ctx.beginPath(); ctx.moveTo(fx, coreNy); ctx.lineTo(coreNx, coreNy);
        const tensionAlpha = s.strutPlaced ? 0.2 : (0.2 + s.stretch * 2);
        ctx.strokeStyle = rgba(s.accentRgb, tensionAlpha * ALPHA.content.max * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      // Force nodes
      for (const [fx, label] of [[forceAx, '←'], [forceBx, '→']] as [number, string][]) {
        ctx.beginPath(); ctx.arc(fx, coreNy, px(0.025, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance); ctx.fill();
        const fFont = Math.max(8, px(FONT_SIZE.sm, minDim));
        ctx.font = `${fFont}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.4 * entrance); ctx.fillText(label, fx, coreNy);
        ctx.textBaseline = 'alphabetic';
      }

      // Strut (draggable or placed)
      const strutDrawX = s.dragging ? s.dragX * w : (s.strutPlaced ? cx : s.strutX * w);
      const strutDrawY = s.dragging ? s.dragY * h : (s.strutPlaced ? coreNy : s.strutY * h);
      const strutLen = px(0.25, minDim);

      ctx.beginPath();
      ctx.moveTo(strutDrawX - strutLen / 2, strutDrawY);
      ctx.lineTo(strutDrawX + strutLen / 2, strutDrawY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * (s.strutPlaced ? 0.6 : 0.3) * entrance);
      ctx.lineWidth = px(s.strutPlaced ? STROKE.bold : STROKE.medium, minDim); ctx.stroke();

      // Strut end caps
      for (const dx of [-strutLen / 2, strutLen / 2]) {
        ctx.beginPath(); ctx.arc(strutDrawX + dx, strutDrawY, px(0.005, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.fill();
      }

      // Tensegrity glow when locked
      if (s.locked) {
        const tGlow = ctx.createRadialGradient(cx, coreNy, 0, cx, coreNy, px(0.2, minDim));
        tGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.2 * entrance));
        tGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = tGlow; ctx.fillRect(cx - px(0.2, minDim), coreNy - px(0.2, minDim), px(0.4, minDim), px(0.4, minDim));
      }

      // Core node
      const gr = px(0.07, minDim);
      const nGlow = ctx.createRadialGradient(coreNx, coreNy, 0, coreNx, coreNy, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow; ctx.fillRect(coreNx - gr, coreNy - gr, gr * 2, gr * 2);
      ctx.beginPath(); ctx.arc(coreNx, coreNy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance); ctx.fill();

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.locked) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('TENSEGRITY', cx, h - px(0.035, minDim)); }
      else if (!s.strutPlaced) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance); ctx.fillText('DRAG STRUT TO CENTER', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { ctx.beginPath(); ctx.moveTo(cx - strutLen / 2, cy); ctx.lineTo(cx + strutLen / 2, cy);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance); ctx.lineWidth = px(STROKE.bold, minDim); ctx.stroke(); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.completed || s.strutPlaced) return;
      s.dragging = true; const rect = canvas.getBoundingClientRect();
      s.dragX = (e.clientX - rect.left) / rect.width; s.dragY = (e.clientY - rect.top) / rect.height;
      canvas.setPointerCapture(e.pointerId); cbRef.current.onHaptic('hold_start');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      s.dragX = (e.clientX - rect.left) / rect.width; s.dragY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragging) {
        const dist = Math.sqrt((s.dragX - 0.5) ** 2 + (s.dragY - CORE_Y) ** 2);
        if (dist < STRUT_SNAP_DIST) { s.strutPlaced = true; cbRef.current.onHaptic('drag_snap'); cbRef.current.onStateChange?.(0.5); }
        s.dragging = false;
      }
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
