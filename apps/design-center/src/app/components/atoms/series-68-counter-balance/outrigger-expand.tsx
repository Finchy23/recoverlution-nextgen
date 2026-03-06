/**
 * ATOM 676: THE OUTRIGGER ENGINE · Series 68 · Position 6
 * Expand base before taking on weight. Swipe outward to deploy
 * structural outriggers — widened footprint regains buoyancy.
 *
 * INTERACTION: Swipe (outward) → deploy outriggers → stable
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static outriggers
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const NODE_RADIUS = 0.02; const WATER_Y = 0.55; const SINK_RATE = 0.0008;
const OUTRIGGER_DEPLOY = 0.15; const SWIPE_THRESHOLD = 0.06; const BUOYANCY_RATE = 0.001;
const RESPAWN_DELAY = 100;

interface OutState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  nodeY: number; sinking: boolean; outriggersDeployed: boolean; outriggerWidth: number;
  buoyancy: number; dragging: boolean; startX: number; completed: boolean; respawnTimer: number; payloadDropped: boolean; }

function freshState(c: string, a: string): OutState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeY: 0.5, sinking: false, outriggersDeployed: false, outriggerWidth: 0,
    buoyancy: 0, dragging: false, startX: 0, completed: false, respawnTimer: 0, payloadDropped: false }; }

export default function OutriggerExpandAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
      const nodeR = px(NODE_RADIUS, minDim); const waterY = h * WATER_Y;

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      if (!p.reducedMotion && !s.completed) {
        // Payload drops after 30 frames
        if (s.frameCount > 30 && !s.payloadDropped) { s.payloadDropped = true; s.sinking = true; cb.onHaptic('error_boundary'); }
        if (s.sinking && !s.outriggersDeployed) { s.nodeY += SINK_RATE; }
        if (s.outriggersDeployed) {
          s.outriggerWidth = Math.min(OUTRIGGER_DEPLOY, s.outriggerWidth + 0.002);
          s.buoyancy = Math.min(1, s.buoyancy + BUOYANCY_RATE);
          s.nodeY += (0.5 - s.nodeY) * 0.02;
          s.sinking = false;
          cb.onStateChange?.(0.3 + s.buoyancy * 0.7);
          if (s.buoyancy >= 1) { s.completed = true; cb.onHaptic('completion'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        } else { cb.onStateChange?.(Math.max(0, 0.3 - (s.nodeY - 0.5) * 3)); }
      }

      const ny = s.nodeY * h;

      // Water
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
      waterGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance));
      waterGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.background.min * 4 * entrance));
      ctx.fillStyle = waterGrad; ctx.fillRect(0, waterY, w, h - waterY);

      // Water surface line
      ctx.beginPath(); ctx.moveTo(0, waterY); ctx.lineTo(w, waterY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim); ctx.stroke();

      // Outriggers
      if (s.outriggerWidth > 0) {
        const orW = px(s.outriggerWidth, minDim);
        ctx.beginPath(); ctx.moveTo(cx - nodeR, ny); ctx.lineTo(cx - nodeR - orW, ny + px(0.01, minDim));
        ctx.moveTo(cx + nodeR, ny); ctx.lineTo(cx + nodeR + orW, ny + px(0.01, minDim));
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim); ctx.stroke();
        // Floats
        for (const dir of [-1, 1]) {
          ctx.beginPath(); ctx.arc(cx + dir * (nodeR + orW), ny + px(0.01, minDim), px(0.008, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.3 * entrance); ctx.fill();
        }
      }

      // Payload on top
      if (s.payloadDropped) {
        ctx.beginPath(); ctx.arc(cx, ny - nodeR - px(0.02, minDim), px(0.015, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance); ctx.fill();
      }

      // Node
      const gr = px(0.06, minDim);
      const nGlow = ctx.createRadialGradient(cx, ny, 0, cx, ny, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow; ctx.fillRect(cx - gr, ny - gr, gr * 2, gr * 2);
      ctx.beginPath(); ctx.arc(cx, ny, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance); ctx.fill();

      // HUD
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.sinking) { ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.4 * entrance); ctx.fillText('SINKING', cx, h - px(0.035, minDim)); }
      else if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('STABLE', cx, h - px(0.035, minDim)); }
      else if (!s.outriggersDeployed && s.payloadDropped) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.25 * entrance); ctx.fillText('SWIPE OUTWARD', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { ctx.beginPath(); ctx.arc(cx, cy, nodeR, 0, Math.PI * 2); ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance); ctx.fill(); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { const s = stateRef.current; if (s.completed || s.outriggersDeployed) return;
      s.dragging = true; const rect = canvas.getBoundingClientRect(); s.startX = (e.clientX - rect.left) / rect.width; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width;
      if (Math.abs(mx - s.startX) > SWIPE_THRESHOLD) { s.outriggersDeployed = true; s.dragging = false; cbRef.current.onHaptic('swipe_commit'); } };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
