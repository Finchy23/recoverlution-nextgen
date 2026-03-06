/**
 * ATOM 218: THE SOMATIC TRUST ENGINE · S22 · Position 8
 * Walk in physical darkness — feel the ground. Each step forward
 * reveals more light. Trust the body, not the anxious prediction.
 * INTERACTION: Tap (rhythmic steps) → darkness recedes → path revealed
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static lit path
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const STEPS_NEEDED = 12; const LIGHT_PER_STEP = 0.08; const STEP_COOLDOWN = 20;
const RESPAWN_DELAY = 100;

interface StepMark { x: number; y: number; glow: number; }

interface SomaticState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  steps: number; lightRadius: number; stepMarks: StepMark[]; nodeY: number;
  stepCooldown: number; completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): SomaticState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    steps: 0, lightRadius: 0.05, stepMarks: [], nodeY: 0.85,
    stepCooldown: 0, completed: false, respawnTimer: 0 }; }

export default function SomaticTrustAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      // Dark base atmosphere
      if (!p.composed) {
        const darkAlpha = Math.max(0, 1 - s.lightRadius * 2) * ALPHA.background.max * 0.3 * entrance;
        ctx.fillStyle = rgba(s.primaryRgb, darkAlpha * 0.1);
        ctx.fillRect(0, 0, w, h);
      }

      if (!p.reducedMotion) { s.stepCooldown = Math.max(0, s.stepCooldown - 1); }

      const nodeX = cx; const nodeY = s.nodeY * h;

      // Light circle around node
      const lightR = px(s.lightRadius, minDim);
      const light = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, lightR);
      light.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
      light.addColorStop(0.6, rgba(s.primaryRgb, ALPHA.glow.max * 0.1 * entrance));
      light.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = light; ctx.fillRect(nodeX - lightR, nodeY - lightR, lightR * 2, lightR * 2);

      // Path (ground line visible in light)
      const pathY = nodeY + px(0.02, minDim);
      ctx.beginPath(); ctx.moveTo(nodeX - lightR, pathY); ctx.lineTo(nodeX + lightR, pathY);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.2 * entrance * s.lightRadius * 3);
      ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();

      // Step marks
      for (const sm of s.stepMarks) {
        sm.glow *= 0.995;
        const smx = sm.x * w; const smy = sm.y * h;
        const smGlow = ctx.createRadialGradient(smx, smy, 0, smx, smy, px(0.015, minDim));
        smGlow.addColorStop(0, rgba(s.primaryRgb, sm.glow * ALPHA.glow.max * 0.2 * entrance));
        smGlow.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = smGlow; ctx.fillRect(smx - px(0.015, minDim), smy - px(0.015, minDim), px(0.03, minDim), px(0.03, minDim));
      }

      // Node
      const nodeR = px(0.02, minDim);
      ctx.beginPath(); ctx.arc(nodeX, nodeY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance); ctx.fill();

      // Step counter
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(`${s.steps}/${STEPS_NEEDED}`, cx, h - px(0.06, minDim));

      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('GROUNDED', cx, h - px(0.035, minDim)); }
      else { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText(s.stepCooldown > 0 ? '...' : 'TAP TO STEP', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion) { const fullLight = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.4);
        fullLight.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance)); fullLight.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fullLight; ctx.fillRect(0, 0, w, h); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = () => {
      const s = stateRef.current; if (s.completed || s.stepCooldown > 0) return;
      s.steps++; s.lightRadius = Math.min(0.5, s.lightRadius + LIGHT_PER_STEP);
      s.nodeY = Math.max(0.15, s.nodeY - 0.05);
      s.stepMarks.push({ x: 0.5, y: s.nodeY + 0.02, glow: 1 });
      s.stepCooldown = STEP_COOLDOWN;
      cbRef.current.onHaptic('step_advance');
      cbRef.current.onStateChange?.(s.steps / STEPS_NEEDED);
      if (s.steps >= STEPS_NEEDED) { s.completed = true; cbRef.current.onHaptic('completion'); cbRef.current.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
    };

    canvas.addEventListener('pointerdown', onDown);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
