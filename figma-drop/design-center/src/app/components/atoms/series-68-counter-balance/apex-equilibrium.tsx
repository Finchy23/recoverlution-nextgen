/**
 * ATOM 680: THE APEX EQUILIBRIUM ENGINE · Series 68 · Position 10 (Apex)
 * Slide your core on the needlepoint fulcrum as random heavy blocks
 * crash. Maintain absolute razor-flat equilibrium through dynamic
 * micro-shifting.
 *
 * INTERACTION: Drag (micro-shift on fulcrum) → survive impacts → balance
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static balanced fulcrum
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const FULCRUM_Y = 0.55; const BEAM_WIDTH = 0.7; const NODE_RADIUS = 0.02;
const BLOCK_INTERVAL = 50; const SURVIVE_BLOCKS = 10; const TILT_THRESHOLD = 0.25;
const RESPAWN_DELAY = 110;

interface FallingBlock { x: number; y: number; weight: number; side: number; landed: boolean; }

interface EqState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  coreX: number; beamTilt: number; tiltVel: number; blocks: FallingBlock[];
  blockTimer: number; survived: number; dragging: boolean;
  leftWeight: number; rightWeight: number;
  completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): EqState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    coreX: 0.5, beamTilt: 0, tiltVel: 0, blocks: [], blockTimer: 30, survived: 0,
    dragging: false, leftWeight: 0, rightWeight: 0,
    completed: false, respawnTimer: 0 }; }

export default function ApexEquilibriumAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
      const nodeR = px(NODE_RADIUS, minDim); const beamW = px(BEAM_WIDTH, minDim);
      const fulcrumY = h * FULCRUM_Y;

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.lg);

      if (!p.reducedMotion && !s.completed) {
        // Spawn blocks
        s.blockTimer--;
        if (s.blockTimer <= 0 && s.blocks.filter(b => !b.landed).length < 3) {
          const side = Math.random() > 0.5 ? 1 : -1;
          const weight = 0.5 + Math.random() * 1.5;
          s.blocks.push({ x: 0.5 + side * (0.15 + Math.random() * 0.2), y: 0, weight, side, landed: false });
          s.blockTimer = BLOCK_INTERVAL + Math.floor(Math.random() * 30);
        }

        // Block physics
        for (const b of s.blocks) {
          if (b.landed) continue;
          b.y += 0.005;
          if (b.y >= FULCRUM_Y - 0.05) {
            b.landed = true;
            if (b.x < 0.5) s.leftWeight += b.weight; else s.rightWeight += b.weight;
            cb.onHaptic('drag_snap');
            s.survived++;
            cb.onStateChange?.(Math.min(1, s.survived / SURVIVE_BLOCKS));
          }
        }

        // Tilt from weight difference + core position
        const coreOffset = (s.coreX - 0.5) * 3; // core weight acts as counterbalance
        const weightDiff = (s.rightWeight - s.leftWeight) * 0.005;
        s.tiltVel += (weightDiff - coreOffset * 0.003);
        s.tiltVel *= 0.95;
        s.beamTilt += s.tiltVel;

        // Capsize check
        if (Math.abs(s.beamTilt) > TILT_THRESHOLD) {
          cb.onHaptic('error_boundary');
          s.beamTilt *= 0.8;
        }

        if (s.survived >= SURVIVE_BLOCKS) {
          s.completed = true; cb.onHaptic('seal_stamp'); cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY;
        }
      }

      // Fulcrum
      ctx.beginPath(); ctx.moveTo(cx, fulcrumY); ctx.lineTo(cx - px(0.012, minDim), fulcrumY + px(0.025, minDim));
      ctx.lineTo(cx + px(0.012, minDim), fulcrumY + px(0.025, minDim)); ctx.closePath();
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.4 * entrance); ctx.fill();

      // Beam
      ctx.save(); ctx.translate(cx, fulcrumY); ctx.rotate(s.beamTilt);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
      ctx.fillRect(-beamW / 2, -px(0.005, minDim), beamW, px(0.01, minDim));
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.35 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.strokeRect(-beamW / 2, -px(0.005, minDim), beamW, px(0.01, minDim));
      ctx.restore();

      // Falling & landed blocks
      for (const b of s.blocks) {
        const bx = b.x * w; const by = (b.landed ? fulcrumY - px(0.02, minDim) : b.y * h);
        const bSize = px(0.008 + b.weight * 0.008, minDim);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance * ms);
        ctx.fillRect(bx - bSize / 2, by - bSize / 2, bSize, bSize);
      }

      // Core node on beam
      const coreBeamX = cx + (s.coreX - 0.5) * beamW;
      const coreBeamY = fulcrumY + (s.coreX - 0.5) * beamW * Math.sin(s.beamTilt);

      const gr = px(0.08, minDim);
      const nGlow = ctx.createRadialGradient(coreBeamX, coreBeamY - nodeR, 0, coreBeamX, coreBeamY - nodeR, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow; ctx.fillRect(coreBeamX - gr, coreBeamY - nodeR - gr, gr * 2, gr * 2);

      ctx.beginPath(); ctx.arc(coreBeamX, coreBeamY - nodeR, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance); ctx.fill();

      // Tilt gauge
      const tiltDeg = Math.round(s.beamTilt * 180 / Math.PI);
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(Math.abs(tiltDeg) > 10 ? s.accentRgb : s.primaryRgb, ALPHA.text.max * 0.35 * entrance);
      ctx.fillText(`${tiltDeg}°`, cx, h - px(0.06, minDim));

      // Score
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(`${s.survived}/${SURVIVE_BLOCKS}`, cx, h - px(0.035, minDim));

      if (!s.completed && !s.dragging) {
        const hFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('SLIDE TO COUNTERBALANCE', cx, px(0.04, minDim));
      }

      if (p.reducedMotion) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.25 * entrance);
        ctx.fillRect(cx - beamW / 2, fulcrumY - px(0.005, minDim), beamW, px(0.01, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { stateRef.current.dragging = true; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      s.coreX = Math.max(0.2, Math.min(0.8, (e.clientX - rect.left) / rect.width));
    };
    const onUp = (e: PointerEvent) => { stateRef.current.dragging = false; canvas.releasePointerCapture(e.pointerId); };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
