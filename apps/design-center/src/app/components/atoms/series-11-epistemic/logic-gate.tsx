/**
 * ATOM 103: THE LOGIC GATE ENGINE
 * ================================
 * Series 11 — Epistemic Constructs · Position 3
 *
 * Anxiety is an open loop ("What if I fail?").
 * Peace is a closed circuit ("Then I will try again").
 * The user drags a wire to close the sparking gap.
 *
 * PHYSICS: Electrical pathfinding, snap-to-grid, current illumination
 * INTERACTION: Drag wire from left terminal to right terminal
 * RENDER: Canvas 2D
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba, easeOutCubic, setupCanvas, advanceEntrance,
  ELEMENT_ALPHA, EMPHASIS_ALPHA, motionScale,
  type RGB,
} from '../atom-utils';

// Spark particle
interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
}

function spawnSpark(x: number, y: number, minDim: number): Spark {
  const angle = Math.random() * Math.PI * 2;
  const speed = minDim * (0.002 + Math.random() * 0.006);
  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    maxLife: 20 + Math.random() * 30,
    size: minDim * (0.001 + Math.random() * 0.003),
  };
}

export default function LogicGateAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    // Wire drag state
    isDragging: false,
    wireEndX: 0,
    wireEndY: 0,
    // Connection state: 0 = open, 1 = connected
    connected: false,
    connectionAnim: 0,
    sparks: [] as Spark[],
    pulsePhase: 0,
    completionFired: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

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
      const ms = motionScale(p.reducedMotion);
      const breath = p.breathAmplitude;
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;

      const baseC = s.primaryRgb;
      const accentC = s.accentRgb;
      const goldC: RGB = lerpColor(accentC, [255, 220, 100], 0.5);

      // Terminal positions
      const gapW = minDim * 0.12;
      const termY = cy;
      const leftTermX = cx - gapW;
      const rightTermX = cx + gapW;
      const termR = minDim * 0.025;

      // Circuit path (horizontal lines extending from terminals)
      const circuitLen = minDim * 0.32;

      // Background glow
      const glowR = minDim * (0.35 + breath * 0.03 * ms) * entrance;
      const glowC = lerpColor(baseC, goldC, s.connected ? 0.6 : 0.2);
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      bgGrad.addColorStop(0, rgba(glowC, ELEMENT_ALPHA.glow.max * entrance * (s.connected ? 1.5 : 1)));
      bgGrad.addColorStop(0.6, rgba(glowC, ELEMENT_ALPHA.glow.min * entrance));
      bgGrad.addColorStop(1, rgba(glowC, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw circuit lines
      const lineAlpha = ELEMENT_ALPHA.primary.max * entrance;
      const circuitColor = s.connected ? goldC : baseC;
      ctx.strokeStyle = rgba(circuitColor, lineAlpha);
      ctx.lineWidth = minDim * 0.0016;
      ctx.lineCap = 'round';

      // Left circuit line
      ctx.beginPath();
      ctx.moveTo(leftTermX - circuitLen, termY);
      ctx.lineTo(leftTermX - termR, termY);
      ctx.stroke();

      // Right circuit line
      ctx.beginPath();
      ctx.moveTo(rightTermX + termR, termY);
      ctx.lineTo(rightTermX + circuitLen, termY);
      ctx.stroke();

      // Terminals (circles)
      for (const tx of [leftTermX, rightTermX]) {
        ctx.beginPath();
        ctx.arc(tx, termY, termR * entrance, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(circuitColor, lineAlpha);
        ctx.lineWidth = minDim * 0.001;
        ctx.stroke();
        ctx.fillStyle = rgba(circuitColor, ELEMENT_ALPHA.secondary.max * entrance);
        ctx.fill();
      }

      // Labels
      const fontSize = Math.max(9, minDim * 0.018);
      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = rgba(baseC, ELEMENT_ALPHA.text.min * entrance);
      ctx.fillText('What If...', leftTermX, termY + termR + minDim * 0.02);
      ctx.fillText('Then...', rightTermX, termY + termR + minDim * 0.02);

      // Wire being dragged
      if (s.isDragging && !s.connected) {
        ctx.beginPath();
        ctx.moveTo(leftTermX, termY);
        const cpx = (leftTermX + s.wireEndX) / 2;
        const cpy = Math.max(termY, s.wireEndY) + minDim * 0.04;
        ctx.quadraticCurveTo(cpx, cpy, s.wireEndX, s.wireEndY);
        ctx.strokeStyle = rgba(goldC, ELEMENT_ALPHA.primary.max * 1.5 * entrance);
        ctx.lineWidth = minDim * 0.0012;
        ctx.stroke();
      }

      // Connection animation
      if (s.connected) {
        s.connectionAnim = Math.min(1, s.connectionAnim + 0.03);
        const ca = easeOutCubic(s.connectionAnim);

        // Draw the connecting wire (catenary curve)
        ctx.beginPath();
        ctx.moveTo(leftTermX, termY);
        const cpx2 = cx;
        const cpy2 = termY + minDim * 0.03 * (1 - ca * 0.8);
        ctx.quadraticCurveTo(cpx2, cpy2, rightTermX, termY);
        ctx.strokeStyle = rgba(goldC, EMPHASIS_ALPHA.focal.max * entrance);
        ctx.lineWidth = minDim * 0.0012;
        ctx.stroke();

        // Flowing pulse
        if (!p.reducedMotion) {
          s.pulsePhase += 0.04;
          const numPulses = 5;
          for (let i = 0; i < numPulses; i++) {
            const t = ((s.pulsePhase + i / numPulses) % 1);
            const px = leftTermX + (rightTermX - leftTermX) * t;
            const py = termY + Math.sin(t * Math.PI) * minDim * 0.03 * (1 - ca * 0.8);
            const pr = minDim * (0.004 + breath * 0.001) * ca;
            const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, pr);
            pulseGrad.addColorStop(0, rgba(goldC, 0.3 * ca * entrance));
            pulseGrad.addColorStop(1, rgba(goldC, 0));
            ctx.fillStyle = pulseGrad;
            ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
          }
        }

        // Completion
        if (s.connectionAnim >= 1 && !s.completionFired) {
          s.completionFired = true;
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      }

      // Sparks at the gap (only while open)
      if (!s.connected && !p.reducedMotion) {
        if (s.frameCount % 3 === 0) {
          const sx = cx + (Math.random() - 0.5) * gapW * 0.5;
          s.sparks.push(spawnSpark(sx, termY, minDim));
        }

        for (let i = s.sparks.length - 1; i >= 0; i--) {
          const sp = s.sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += minDim * 0.0001;
          sp.life -= 1 / sp.maxLife;
          if (sp.life <= 0) { s.sparks.splice(i, 1); continue; }

          ctx.fillStyle = rgba(goldC, sp.life * EMPHASIS_ALPHA.focal.max * entrance);
          ctx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
        }
      }

      cb.onStateChange?.(s.connected ? 1 : 0);
      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Native pointer events
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.connected) return;
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width * viewport.width;
      const py = (e.clientY - rect.top) / rect.height * viewport.height;
      const minDim = Math.min(viewport.width, viewport.height);
      const leftTermX = viewport.width / 2 - minDim * 0.12;
      const termY = viewport.height / 2;
      const termR = minDim * 0.04;
      const dx = px - leftTermX;
      const dy = py - termY;
      if (dx * dx + dy * dy < termR * termR * 4) {
        s.isDragging = true;
        s.wireEndX = px;
        s.wireEndY = py;
        canvas.setPointerCapture(e.pointerId);
        cbRef.current.onHaptic('tap');
      }
    };

    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      s.wireEndX = (e.clientX - rect.left) / rect.width * viewport.width;
      s.wireEndY = (e.clientY - rect.top) / rect.height * viewport.height;
    };

    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.isDragging) return;
      s.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);

      // Check if near right terminal
      const minDim = Math.min(viewport.width, viewport.height);
      const rightTermX = viewport.width / 2 + minDim * 0.12;
      const termY = viewport.height / 2;
      const snapR = minDim * 0.06;
      const dx = s.wireEndX - rightTermX;
      const dy = s.wireEndY - termY;
      if (dx * dx + dy * dy < snapR * snapR) {
        s.connected = true;
        s.sparks = [];
        cbRef.current.onHaptic('drag_snap');
      }
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