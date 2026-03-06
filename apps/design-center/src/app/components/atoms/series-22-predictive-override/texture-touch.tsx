/**
 * ATOM 219: THE TEXTURE TOUCH ENGINE · S22 · Position 9
 * Route 100% processing to the fingertip. Drag across micro-textures —
 * ridges, bumps, grooves — feel each one. Rumination impossible.
 * INTERACTION: Drag (feel textures) → absorption → stillness
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static texture map
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const TEXTURE_ZONES = 5; const ZONE_HEIGHT = 0.14; const EXPLORE_THRESHOLD = 0.8;
const RESPAWN_DELAY = 100;

interface Zone { y: number; type: 'ridges' | 'bumps' | 'waves' | 'grid' | 'smooth'; explored: number; }

interface TextureState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  zones: Zone[]; dragging: boolean; touchX: number; touchY: number; absorption: number;
  completed: boolean; respawnTimer: number; }

function makeZones(): Zone[] {
  const types: Zone['type'][] = ['ridges', 'bumps', 'waves', 'grid', 'smooth'];
  return types.map((type, i) => ({ y: 0.1 + i * ZONE_HEIGHT + i * 0.02, type, explored: 0 }));
}

function freshState(c: string, a: string): TextureState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    zones: makeZones(), dragging: false, touchX: 0.5, touchY: 0.5, absorption: 0,
    completed: false, respawnTimer: 0 }; }

export default function TextureTouchAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.sm);

      // Check exploration
      const totalExplored = s.zones.reduce((sum, z) => sum + z.explored, 0) / TEXTURE_ZONES;
      s.absorption = totalExplored;
      cb.onStateChange?.(s.absorption);

      if (s.absorption >= EXPLORE_THRESHOLD && !s.completed) {
        s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY;
      }

      // Draw texture zones
      for (const zone of s.zones) {
        const zy = zone.y * h; const zh = ZONE_HEIGHT * h;
        const zoneAlpha = ALPHA.content.max * (0.15 + zone.explored * 0.15) * entrance;

        // Zone background
        ctx.fillStyle = rgba(s.primaryRgb, zoneAlpha * 0.3);
        ctx.fillRect(w * 0.1, zy, w * 0.8, zh);

        // Texture pattern
        const patternAlpha = ALPHA.content.max * 0.3 * entrance * ms;
        if (zone.type === 'ridges') {
          for (let x = w * 0.1; x < w * 0.9; x += px(0.012, minDim)) {
            ctx.beginPath(); ctx.moveTo(x, zy); ctx.lineTo(x, zy + zh);
            ctx.strokeStyle = rgba(s.primaryRgb, patternAlpha); ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
          }
        } else if (zone.type === 'bumps') {
          for (let x = w * 0.12; x < w * 0.88; x += px(0.02, minDim)) {
            for (let y = zy + px(0.01, minDim); y < zy + zh; y += px(0.02, minDim)) {
              ctx.beginPath(); ctx.arc(x, y, px(0.003, minDim), 0, Math.PI * 2);
              ctx.fillStyle = rgba(s.primaryRgb, patternAlpha); ctx.fill();
            }
          }
        } else if (zone.type === 'waves') {
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            for (let x = w * 0.1; x < w * 0.9; x += 3) {
              const wy = zy + zh * (0.2 + i * 0.2) + Math.sin(x * 0.02 + i) * px(0.008, minDim);
              if (x === w * 0.1) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
            }
            ctx.strokeStyle = rgba(s.primaryRgb, patternAlpha); ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
          }
        } else if (zone.type === 'grid') {
          const spacing = px(0.015, minDim);
          for (let x = w * 0.1; x < w * 0.9; x += spacing) {
            ctx.beginPath(); ctx.moveTo(x, zy); ctx.lineTo(x, zy + zh);
            ctx.strokeStyle = rgba(s.primaryRgb, patternAlpha * 0.5); ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
          }
          for (let y = zy; y < zy + zh; y += spacing) {
            ctx.beginPath(); ctx.moveTo(w * 0.1, y); ctx.lineTo(w * 0.9, y);
            ctx.strokeStyle = rgba(s.primaryRgb, patternAlpha * 0.5); ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
          }
        } else {
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.05 * entrance);
          ctx.fillRect(w * 0.1, zy, w * 0.8, zh);
        }

        // Explored glow
        if (zone.explored > 0) {
          const egAlpha = zone.explored * ALPHA.glow.max * 0.1 * entrance;
          ctx.fillStyle = rgba(s.primaryRgb, egAlpha);
          ctx.fillRect(w * 0.1, zy, w * 0.8, zh);
        }

        // Zone label
        const zFont = Math.max(6, px(FONT_SIZE.xs, minDim));
        ctx.font = `${zFont}px monospace`; ctx.textAlign = 'left';
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText(zone.type.toUpperCase(), w * 0.12, zy + zh - px(0.008, minDim));
      }

      // Touch indicator
      if (s.dragging) {
        const tx = s.touchX * w; const ty = s.touchY * h;
        const tGlow = ctx.createRadialGradient(tx, ty, 0, tx, ty, px(0.03, minDim));
        tGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
        tGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = tGlow; ctx.fillRect(tx - px(0.03, minDim), ty - px(0.03, minDim), px(0.06, minDim), px(0.06, minDim));
      }

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('ABSORBED', cx, h - px(0.025, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('DRAG ACROSS TEXTURES', cx, h - px(0.025, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const explore = (my: number) => {
      const s = stateRef.current;
      for (const zone of s.zones) {
        if (my >= zone.y && my <= zone.y + ZONE_HEIGHT) {
          zone.explored = Math.min(1, zone.explored + 0.02);
          if (s.frameCount % 3 === 0) cbRef.current.onHaptic('drag_snap');
        }
      }
    };

    const onDown = (e: PointerEvent) => { const s = stateRef.current; s.dragging = true;
      const rect = canvas.getBoundingClientRect(); s.touchX = (e.clientX - rect.left) / rect.width; s.touchY = (e.clientY - rect.top) / rect.height;
      explore(s.touchY); canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect(); s.touchX = (e.clientX - rect.left) / rect.width; s.touchY = (e.clientY - rect.top) / rect.height;
      explore(s.touchY); };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
