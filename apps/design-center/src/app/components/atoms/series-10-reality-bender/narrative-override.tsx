/**
 * ATOM 098: THE NARRATIVE OVERRIDE ENGINE
 * Series 10 — Reality Bender · Position 8
 * Drag to erase the dark script. Golden text bleeds through underneath.
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, ELEMENT_ALPHA, MASK_WHITE, type RGB } from '../atom-utils';

const DARK_INK: RGB = [50, 40, 60];
const GOLD_TEXT: RGB = [220, 190, 100];
const GOLD_GLOW: RGB = [240, 220, 140];
const ERASE_TRAIL: RGB = [180, 170, 160];
const BG_BASE: RGB = [18, 16, 24];

const DARK_LINES = [
  'you are not enough',
  'you always fail',
  'nobody believes in you',
  'it will never work',
];
const GOLD_LINES = [
  'I am the author',
  'I choose the story',
  'I write in gold',
  'the pen is mine',
];

export default function NarrativeOverrideAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    entranceProgress: 0, isDragging: false,
    lastX: 0, lastY: 0, coverage: 0, lastDetent: -1,
    resolved: false, frame: 0,
  });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  useEffect(() => {
    const mc = document.createElement('canvas');
    mc.width = Math.round(viewport.width);
    mc.height = Math.round(viewport.height);
    maskRef.current = mc;
    return () => { maskRef.current = null; };
  }, [viewport]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;

    const w = viewport.width;
    const h = viewport.height;
    const minDim = Math.min(w, h);

    const addErase = (x: number, y: number) => {
      const mc = maskRef.current; if (!mc) return;
      const mctx = mc.getContext('2d'); if (!mctx) return;
      mctx.fillStyle = MASK_WHITE;
      const r = minDim * 0.035;
      mctx.beginPath(); mctx.arc(x, y, r, 0, Math.PI * 2); mctx.fill();
    };

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * w;
      const y = (e.clientY - rect.top) / rect.height * h;
      stateRef.current.isDragging = true;
      stateRef.current.lastX = x;
      stateRef.current.lastY = y;
      addErase(x, y);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * w;
      const y = (e.clientY - rect.top) / rect.height * h;
      const dx = x - s.lastX, dy = y - s.lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const eraseR = minDim * 0.035;
      const steps = Math.max(1, Math.floor(dist / (eraseR * 0.4)));
      for (let i = 0; i <= steps; i++) {
        addErase(s.lastX + dx * (i / steps), s.lastY + dy * (i / steps));
      }
      s.lastX = x; s.lastY = y;
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
      stateRef.current.isDragging = false;
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let raf = 0;

    const render = () => {
      raf = requestAnimationFrame(render);
      const s = stateRef.current; const p = propsRef.current; s.frame++;
      const adv = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = adv.progress; const ent = adv.entrance;

      const primaryRgb = parseColor(p.color);
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);

      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), ent * 0.015));
      bgGrad.addColorStop(1, rgba(lerpColor(BG_BASE, primaryRgb, 0.03), 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Calculate coverage from mask
      const mc = maskRef.current;
      if (mc) {
        const mctx = mc.getContext('2d');
        if (mctx && s.frame % 15 === 0) {
          const textArea = { x: w * 0.1, y: h * 0.25, w: w * 0.8, h: h * 0.5 };
          let wiped = 0, total = 0;
          const step = 12;
          for (let y = textArea.y; y < textArea.y + textArea.h; y += step) {
            for (let x = textArea.x; x < textArea.x + textArea.w; x += step) {
              total++;
              const pixel = mctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
              if (pixel[0] > 128) wiped++;
            }
          }
          s.coverage = total > 0 ? wiped / total : 0;
        }
      }

      onStateChange?.(s.coverage);
      const detent = Math.floor(s.coverage * 4);
      if (detent !== s.lastDetent && detent > s.lastDetent) {
        s.lastDetent = detent; onHaptic('step_advance');
      }
      if (s.coverage > 0.6 && !s.resolved) {
        s.resolved = true; onHaptic('completion'); onResolve?.();
      }

      const fontSize = Math.round(minDim * 0.022);
      const lineH = fontSize * 2.2;
      const startY = cy - (DARK_LINES.length * lineH) / 2;

      // Gold text (underneath — always drawn)
      const goldCol = lerpColor(GOLD_TEXT, primaryRgb, 0.05);
      ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      for (let i = 0; i < GOLD_LINES.length; i++) {
        ctx.fillStyle = rgba(goldCol, ELEMENT_ALPHA.primary.max * ent * Math.min(1, s.coverage * 2));
        ctx.fillText(GOLD_LINES[i], cx, startY + i * lineH);
      }

      // Dark text (on top — erased by mask)
      const darkCol = lerpColor(DARK_INK, primaryRgb, 0.03);
      ctx.font = `400 ${fontSize}px system-ui, -apple-system, sans-serif`;
      for (let i = 0; i < DARK_LINES.length; i++) {
        ctx.fillStyle = rgba(darkCol, ELEMENT_ALPHA.primary.max * ent * Math.max(0, 1 - s.coverage * 1.5));
        ctx.fillText(DARK_LINES[i], cx, startY + i * lineH);
      }

      // Gold glow at high coverage
      if (s.coverage > 0.4) {
        const gCol = lerpColor(GOLD_GLOW, primaryRgb, 0.04);
        const gr = minDim * 0.2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
        grad.addColorStop(0, rgba(gCol, ELEMENT_ALPHA.glow.min * ent * (s.coverage - 0.4) * 1.5));
        grad.addColorStop(1, rgba(gCol, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, gr, 0, Math.PI * 2); ctx.fill();
      }

      if (s.coverage < 0.05) {
        ctx.font = `${Math.round(minDim * 0.014)}px system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = rgba(lerpColor(ERASE_TRAIL, primaryRgb, 0.06), ELEMENT_ALPHA.text.min * ent * 0.6);
        ctx.fillText('drag to erase the dark script', cx, h * 0.9);
      }
      ctx.restore();
    };
    raf = requestAnimationFrame(render);
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
      style={{ width: viewport.width, height: viewport.height, display: 'block', touchAction: 'none', cursor: 'crosshair' }}
    />
  );
}