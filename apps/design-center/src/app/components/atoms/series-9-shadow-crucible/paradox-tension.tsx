/**
 * ATOM 085: THE PARADOX TENSION ENGINE
 * Series 9 — Shadow & Crucible · Position 5
 * Two contradictory nodes repel each other. Drag both into fusion.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, type RGB } from '../atom-utils';

const NODE_A: RGB = [180, 80, 80];
const NODE_B: RGB = [80, 80, 180];
const FUSED: RGB = [180, 140, 200];
const ARC_COLOR: RGB = [140, 100, 160];
const BG_BASE: RGB = [18, 16, 24];

const REPULSION_STRENGTH_RATIO = 0.00016; // multiplied by minDim^2
const FUSION_DIST_RATIO = 0.04;

export default function ParadoxTensionAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    entranceProgress: 0,
    ax: 0, ay: 0, bx: 0, by: 0,
    dragging: null as 'a' | 'b' | null,
    dragOffset: { x: 0, y: 0 },
    fused: false, fuseGlow: 0,
    resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const s = stateRef.current;
    s.ax = viewport.width * 0.3; s.ay = viewport.height * 0.5;
    s.bx = viewport.width * 0.7; s.by = viewport.height * 0.5;
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const s = stateRef.current;
      if (s.fused) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w;
      const py = (e.clientY - rect.top) / rect.height * h;
      const nodeR = minDim * 0.04;
      const dA = Math.sqrt((px - s.ax) ** 2 + (py - s.ay) ** 2);
      const dB = Math.sqrt((px - s.bx) ** 2 + (py - s.by) ** 2);
      if (dA < nodeR * 2) { s.dragging = 'a'; s.dragOffset = { x: px - s.ax, y: py - s.ay }; }
      else if (dB < nodeR * 2) { s.dragging = 'b'; s.dragOffset = { x: px - s.bx, y: py - s.by }; }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * w - s.dragOffset.x;
      const py = (e.clientY - rect.top) / rect.height * h - s.dragOffset.y;
      if (s.dragging === 'a') { s.ax = px; s.ay = py; }
      else { s.bx = px; s.by = py; }
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.dragging = null;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current;
      const p = propsRef.current;
      s.frame++;

      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress;
      const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      // Repulsion force (when not being dragged)
      if (!s.fused && !p.reducedMotion) {
        const dx = s.bx - s.ax;
        const dy = s.by - s.ay;
        const minGap = minDim * 0.02;
        const dist = Math.max(minGap, Math.sqrt(dx * dx + dy * dy));
        const nx = dx / dist;
        const ny = dy / dist;
        // Gentle repulsion that decays with distance
        const repStr = REPULSION_STRENGTH_RATIO * minDim * minDim;
        const softening = minDim * 0.2;
        const force = repStr / (dist * dist + softening * softening);
        if (s.dragging !== 'a') { s.ax -= nx * force; s.ay -= ny * force; }
        if (s.dragging !== 'b') { s.bx += nx * force; s.by += ny * force; }
        // Bounds
        const pad = minDim * 0.05;
        s.ax = Math.max(pad, Math.min(w - pad, s.ax));
        s.ay = Math.max(pad, Math.min(h - pad, s.ay));
        s.bx = Math.max(pad, Math.min(w - pad, s.bx));
        s.by = Math.max(pad, Math.min(h - pad, s.by));
      }

      // Check fusion
      const fdx = s.bx - s.ax;
      const fdy = s.by - s.ay;
      const fuseDist = Math.sqrt(fdx * fdx + fdy * fdy);
      if (!s.fused && fuseDist < minDim * FUSION_DIST_RATIO) {
        s.fused = true;
        const mx = (s.ax + s.bx) / 2;
        const my = (s.ay + s.by) / 2;
        s.ax = mx; s.ay = my; s.bx = mx; s.by = my;
        onHaptic('completion');
        s.resolved = true;
        onResolve?.();
      }

      if (s.fused) s.fuseGlow = Math.min(1, s.fuseGlow + 0.02);

      const dist = Math.sqrt((s.bx - s.ax) ** 2 + (s.by - s.ay) ** 2);
      const maxDist = Math.sqrt(w * w + h * h) * 0.5;
      onStateChange?.(s.fused ? 1 : 1 - Math.min(1, dist / maxDist));

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      const nodeR = minDim * 0.03;

      // Tension arc
      if (!s.fused) {
        const arcCol = lerpColor(ARC_COLOR, primaryRgb, 0.05);
        const tension = Math.max(0, 1 - dist / (minDim * 0.3));
        ctx.strokeStyle = rgba(arcCol, ELEMENT_ALPHA.secondary.max * ent * tension);
        ctx.lineWidth = minDim * (0.0012 + tension * 0.0024);
        ctx.beginPath();
        ctx.moveTo(s.ax, s.ay);
        ctx.quadraticCurveTo((s.ax + s.bx) / 2, Math.min(s.ay, s.by) - tension * minDim * 0.1, s.bx, s.by);
        ctx.stroke();
      }

      if (!s.fused) {
        // Node A
        ctx.fillStyle = rgba(lerpColor(NODE_A, primaryRgb, 0.05), ELEMENT_ALPHA.primary.max * ent);
        ctx.beginPath(); ctx.arc(s.ax, s.ay, nodeR, 0, Math.PI * 2); ctx.fill();
        // Node B
        ctx.fillStyle = rgba(lerpColor(NODE_B, primaryRgb, 0.05), ELEMENT_ALPHA.primary.max * ent);
        ctx.beginPath(); ctx.arc(s.bx, s.by, nodeR, 0, Math.PI * 2); ctx.fill();
      } else {
        // Fused node
        const fusedCol = lerpColor(FUSED, primaryRgb, 0.04);
        const glowR = nodeR * 3 * s.fuseGlow;
        const grad = ctx.createRadialGradient(s.ax, s.ay, 0, s.ax, s.ay, glowR);
        grad.addColorStop(0, rgba(fusedCol, ELEMENT_ALPHA.glow.max * ent * s.fuseGlow * 0.4));
        grad.addColorStop(1, rgba(fusedCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(s.ax, s.ay, glowR, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = rgba(fusedCol, ELEMENT_ALPHA.primary.max * ent);
        ctx.beginPath(); ctx.arc(s.ax, s.ay, nodeR * 1.3, 0, Math.PI * 2); ctx.fill();
      }

      if (!s.fused) {
        ctx.font = `${Math.round(minDim * 0.015)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = rgba(lerpColor(ARC_COLOR, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.7);
        ctx.fillText('drag both into one', cx, h * 0.9);
      }

      ctx.restore();
    };

    let raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport, onStateChange, onHaptic, onResolve]);

  return (
    <canvas ref={canvasRef}
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'grab' }}
    />
  );
}