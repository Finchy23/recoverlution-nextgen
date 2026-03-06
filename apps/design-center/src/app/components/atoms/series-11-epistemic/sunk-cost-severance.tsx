/**
 * ATOM 106: THE SUNK-COST SEVERANCE ENGINE
 * ==========================================
 * Series 11 — Epistemic Constructs · Position 6
 *
 * A heavy rusted payload drags the camera down. Swipe
 * to snap tension cables. Camera soars upward into bright sky.
 *
 * PHYSICS: Snapping tension cables, rapid buoyant ascent, mass deletion
 * INTERACTION: Swipe across cables to sever them
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic,
  setupCanvas, advanceEntrance,
  ELEMENT_ALPHA,
  EMPHASIS_ALPHA,
  motionScale,
  type RGB,
} from '../atom-utils';

const CABLE_COUNT = 5;

export default function SunkCostSeveranceAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    cablesCut: new Array(CABLE_COUNT).fill(false) as boolean[],
    cableSnapAnims: new Array(CABLE_COUNT).fill(0) as number[],
    ascentProgress: 0,
    payloadY: 0,
    completionFired: false,
    pointerDown: false, lastX: 0, lastY: 0,
  });

  useEffect(() => { stateRef.current.primaryRgb = parseColor(color); stateRef.current.accentRgb = parseColor(accentColor); }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current;
      const p = propsRef.current;
      const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;
      const allCut = s.cablesCut.every(c => c);

      // Ascent animation
      if (allCut && !p.reducedMotion) {
        s.ascentProgress = Math.min(1, s.ascentProgress + 0.015);
        s.payloadY += minDim * 0.008;
      }

      // Cable snap animations
      for (let i = 0; i < CABLE_COUNT; i++) {
        if (s.cablesCut[i] && s.cableSnapAnims[i] < 1) {
          s.cableSnapAnims[i] = Math.min(1, s.cableSnapAnims[i] + 0.06);
        }
      }

      const ascent = easeOutCubic(s.ascentProgress);

      // Background: shifts from dark to bright sky with ascent
      const skyColor: RGB = lerpColor(baseC, accentC, ascent * 0.6);
      const glowR = minDim * (0.3 + ascent * 0.3 + p.breathAmplitude * 0.03 * ms) * entrance;
      const bgGrad = ctx.createRadialGradient(cx, cy - ascent * minDim * 0.2, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(skyColor, (ELEMENT_ALPHA.glow.max + ascent * 0.1) * entrance));
      bgGrad.addColorStop(1, rgba(skyColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // User's node (rises with ascent)
      const nodeY = cy - ascent * minDim * 0.25;
      const nodeR = minDim * (0.03 + ascent * 0.01);
      ctx.beginPath();
      ctx.arc(cx, nodeY, nodeR * entrance, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
      ctx.fill();

      // Payload (drops with ascent)
      const payloadBaseY = cy + minDim * 0.2;
      const payloadActualY = payloadBaseY + s.payloadY;
      const payloadR = minDim * 0.06;

      if (s.ascentProgress < 0.8) {
        const payloadAlpha = (1 - s.ascentProgress * 1.2) * ELEMENT_ALPHA.primary.max * entrance;
        ctx.beginPath();
        ctx.arc(cx, payloadActualY, payloadR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(baseC, [80, 50, 30], 0.3), Math.max(0, payloadAlpha));
        ctx.fill();
        ctx.strokeStyle = rgba(baseC, Math.max(0, payloadAlpha * 0.5));
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
      }

      // Cables
      const cableSpread = minDim * 0.18;
      for (let i = 0; i < CABLE_COUNT; i++) {
        if (s.cablesCut[i] && s.cableSnapAnims[i] >= 1) continue;
        const t = (i / (CABLE_COUNT - 1)) - 0.5; // -0.5 to 0.5
        const topX = cx + t * cableSpread * 0.6;
        const botX = cx + t * cableSpread;
        const snapA = s.cableSnapAnims[i];
        const alpha = (1 - snapA) * ELEMENT_ALPHA.primary.max * entrance;

        if (s.cablesCut[i]) {
          // Snapped cable — recoil
          const recoil = Math.sin(snapA * Math.PI * 3) * minDim * 0.02 * (1 - snapA);
          ctx.beginPath();
          ctx.moveTo(topX + recoil, nodeY + nodeR);
          ctx.lineTo(topX, nodeY + nodeR + minDim * 0.05);
          ctx.strokeStyle = rgba(baseC, alpha);
          ctx.lineWidth = minDim * 0.001;
          ctx.stroke();
        } else {
          // Intact cable
          ctx.beginPath();
          ctx.moveTo(topX, nodeY + nodeR);
          ctx.quadraticCurveTo(
            (topX + botX) / 2,
            (nodeY + payloadActualY) / 2 + minDim * 0.02,
            botX, payloadActualY - payloadR
          );
          ctx.strokeStyle = rgba(baseC, ELEMENT_ALPHA.primary.max * entrance);
          ctx.lineWidth = minDim * 0.001;
          ctx.stroke();

          // Cable hit zone marker
          const markerY = (nodeY + payloadActualY) / 2;
          ctx.beginPath();
          ctx.arc((topX + botX) / 2, markerY, minDim * 0.005, 0, Math.PI * 2);
          ctx.fillStyle = rgba(accentC, EMPHASIS_ALPHA.focal.max * entrance);
          ctx.fill();
        }
      }

      // Completion
      if (allCut && s.ascentProgress >= 1 && !s.completionFired) {
        s.completionFired = true;
        cb.onHaptic('completion');
        cb.onResolve?.();
      }

      cb.onStateChange?.(s.cablesCut.filter(c => c).length / CABLE_COUNT);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const hitCable = (x: number, y: number, px: number, py: number) => {
      const s = stateRef.current;
      const minDim2 = Math.min(viewport.width, viewport.height);
      const nodeY = viewport.height / 2 - easeOutCubic(s.ascentProgress) * minDim2 * 0.25;
      const payloadBaseY = viewport.height / 2 + minDim2 * 0.2 + s.payloadY;
      const cableSpread = minDim2 * 0.18;

      for (let i = 0; i < CABLE_COUNT; i++) {
        if (s.cablesCut[i]) continue;
        const t = (i / (CABLE_COUNT - 1)) - 0.5;
        const cableX = viewport.width / 2 + t * cableSpread * 0.8;
        const cableMidY = (nodeY + payloadBaseY) / 2;
        const hitR = minDim2 * 0.04;

        // Check if swipe crosses near cable midpoint
        const dx = Math.min(Math.abs(x - cableX), Math.abs(px - cableX));
        const dy = Math.min(Math.abs(y - cableMidY), Math.abs(py - cableMidY));
        if (dx < hitR && dy < hitR * 2) {
          s.cablesCut[i] = true;
          cbRef.current.onHaptic('swipe_commit');
          return;
        }
      }
    };

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const s = stateRef.current;
      s.pointerDown = true;
      s.lastX = (e.clientX - rect.left) / rect.width * viewport.width;
      s.lastY = (e.clientY - rect.top) / rect.height * viewport.height;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointerDown) return;
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width * viewport.width;
      const ny = (e.clientY - rect.top) / rect.height * viewport.height;
      hitCable(nx, ny, s.lastX, s.lastY);
      s.lastX = nx; s.lastY = ny;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.pointerDown = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} />
    </div>
  );
}