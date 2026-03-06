/**
 * ATOM 663: THE GRINDSTONE ENGINE
 * =================================
 * Series 67 — Harmonious Friction · Position 3
 *
 * Use criticism to sharpen. Hold the blunt node against the harsh
 * spinning grindstone — sparks and aggressive haptics. Hold until
 * excess geometry sheds revealing a razor-sharp edge.
 *
 * SIGNATURE TECHNIQUE: Directional friction — spinning abrasive
 * wheel, visible material removal, spark shower, progressive
 * sharpening geometry transformation.
 *
 * INTERACTION: Drag + Hold → grind against stone → sharpen
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static sharp edge
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const STONE_RADIUS     = 0.18;
const STONE_CX         = 0.4;
const STONE_CY         = 0.5;
const NODE_SIZE_INIT   = 0.05;
const NODE_SIZE_FINAL  = 0.025;
const GRIND_RATE       = 0.003;
const SPARK_SPAWN_RATE = 2;
const STONE_SPEED      = 0.04;
const GRIND_ZONE       = 0.06;
const RESPAWN_DELAY    = 100;

interface Spark {
  x: number; y: number; vx: number; vy: number; life: number;
}

interface GrindState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;
  nodeY: number;
  sharpness: number;           // 0 = blunt, 1 = razor
  stoneAngle: number;
  grinding: boolean;
  sparks: Spark[];
  dragging: boolean;
  completed: boolean;
  respawnTimer: number;
}

function freshState(c: string, a: string): GrindState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeX: 0.7, nodeY: 0.5, sharpness: 0, stoneAngle: 0,
    grinding: false, sparks: [], dragging: false,
    completed: false, respawnTimer: 0,
  };
}

export default function GrindstoneEdgeAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);
  const stateRef = useRef(freshState(color, accentColor));
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
      const breath = p.breathAmplitude;
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      const stoneX = STONE_CX * w;
      const stoneY = STONE_CY * h;
      const stoneR = px(STONE_RADIUS, minDim);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion) {
        s.stoneAngle += STONE_SPEED * ms;

        // Check grinding
        const dx = s.nodeX - STONE_CX;
        const dy = s.nodeY - STONE_CY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        s.grinding = dist < STONE_RADIUS + GRIND_ZONE && s.dragging && !s.completed;

        if (s.grinding) {
          s.sharpness = Math.min(1, s.sharpness + GRIND_RATE);
          cb.onStateChange?.(s.sharpness);

          // Sparks
          if (s.frameCount % SPARK_SPAWN_RATE === 0) {
            const contactAngle = Math.atan2(dy, dx);
            for (let i = 0; i < 3; i++) {
              const sparkAngle = contactAngle + (Math.random() - 0.5) * 1.2;
              s.sparks.push({
                x: s.nodeX, y: s.nodeY,
                vx: Math.cos(sparkAngle) * (0.004 + Math.random() * 0.006),
                vy: Math.sin(sparkAngle) * (0.004 + Math.random() * 0.006),
                life: 15 + Math.random() * 15,
              });
            }
          }

          if (s.frameCount % 4 === 0) cb.onHaptic('drag_snap');

          if (s.sharpness >= 1 && !s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        }

        // Spark physics
        for (const sp of s.sparks) { sp.x += sp.vx; sp.y += sp.vy; sp.vy += 0.0002; sp.life--; }
        s.sparks = s.sparks.filter(sp => sp.life > 0);
      }

      // ── LAYER 2: Grindstone body ───────────────────
      // Stone texture rings
      for (let i = 0; i < 4; i++) {
        const ringR = stoneR * (0.3 + i * 0.2);
        ctx.beginPath();
        ctx.arc(stoneX, stoneY, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * (0.2 + i * 0.05) * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // Stone body
      ctx.beginPath();
      ctx.arc(stoneX, stoneY, stoneR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.12 * entrance);
      ctx.fill();
      ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
      ctx.lineWidth = px(STROKE.bold, minDim);
      ctx.stroke();

      // Rotation marks
      for (let i = 0; i < 8; i++) {
        const markA = s.stoneAngle + (i / 8) * Math.PI * 2;
        const mx1 = stoneX + Math.cos(markA) * stoneR * 0.6;
        const my1 = stoneY + Math.sin(markA) * stoneR * 0.6;
        const mx2 = stoneX + Math.cos(markA) * stoneR * 0.9;
        const my2 = stoneY + Math.sin(markA) * stoneR * 0.9;
        ctx.beginPath();
        ctx.moveTo(mx1, my1);
        ctx.lineTo(mx2, my2);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
        ctx.lineWidth = px(STROKE.light, minDim);
        ctx.stroke();
      }

      // ── LAYER 3: Abrasive surface ──────────────────
      // Grit particles on stone
      for (let i = 0; i < 20; i++) {
        const ga = s.stoneAngle * 0.3 + i * 0.314;
        const gr2 = stoneR * (0.4 + (i % 5) * 0.12);
        const gx = stoneX + Math.cos(ga) * gr2;
        const gy = stoneY + Math.sin(ga) * gr2;
        ctx.beginPath();
        ctx.arc(gx, gy, px(PARTICLE_SIZE.xs, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
        ctx.fill();
      }

      // ── LAYER 4: Sparks ────────────────────────────
      const sparkColor: RGB = [255, 200, 80];
      for (const sp of s.sparks) {
        const spx = sp.x * w;
        const spy = sp.y * h;
        const spAlpha = (sp.life / 30) * ALPHA.content.max * 0.7 * entrance * ms;
        ctx.beginPath();
        ctx.arc(spx, spy, px(PARTICLE_SIZE.sm, minDim), 0, Math.PI * 2);
        ctx.fillStyle = rgba(sparkColor, spAlpha);
        ctx.fill();
      }

      // ── LAYER 5: Contact glow ──────────────────────
      if (s.grinding) {
        const nx2 = s.nodeX * w;
        const ny2 = s.nodeY * h;
        const contactGlow = ctx.createRadialGradient(nx2, ny2, 0, nx2, ny2, px(0.05, minDim));
        contactGlow.addColorStop(0, rgba(sparkColor, ALPHA.glow.max * 0.3 * entrance));
        contactGlow.addColorStop(1, rgba(sparkColor, 0));
        ctx.fillStyle = contactGlow;
        ctx.fillRect(nx2 - px(0.05, minDim), ny2 - px(0.05, minDim), px(0.1, minDim), px(0.1, minDim));
      }

      // ── LAYER 6: Node (morphing shape) ─────────────
      const nx = s.nodeX * w;
      const ny = s.nodeY * h;
      const currentSize = NODE_SIZE_INIT - (NODE_SIZE_INIT - NODE_SIZE_FINAL) * s.sharpness;
      const nodeR = px(currentSize, minDim);

      // Glow
      const gr = px(0.08, minDim);
      const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

      // Shape: blob → sharp diamond
      ctx.beginPath();
      if (s.sharpness < 0.5) {
        // Blob
        const blobR = nodeR * (1 + breath * 0.04);
        ctx.arc(nx, ny, blobR, 0, Math.PI * 2);
      } else {
        // Diamond (sharper with progress)
        const sharp = (s.sharpness - 0.5) * 2;
        const hw = nodeR * (1 - sharp * 0.4);
        const hh = nodeR * (1 + sharp * 0.8);
        ctx.moveTo(nx, ny - hh);
        ctx.lineTo(nx + hw, ny);
        ctx.lineTo(nx, ny + hh);
        ctx.lineTo(nx - hw, ny);
        ctx.closePath();
      }
      const nodeColor = lerpColor(s.primaryRgb, [255, 255, 255] as RGB, s.sharpness * 0.3);
      ctx.fillStyle = rgba(nodeColor, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 7: Sharpness meter ───────────────────
      const barW = px(SIZE.md * 0.7, minDim);
      const barH = px(0.008, minDim);
      const barX = w * 0.5 - barW / 2;
      const barY = h - px(0.06, minDim);

      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.5 * entrance);
      ctx.fillRect(barX, barY, barW * s.sharpness, barH);

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      const sharpPct = Math.round(s.sharpness * 100);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText(`EDGE ${sharpPct}%`, w * 0.5, barY - px(0.018, minDim));

      if (!s.dragging && s.sharpness < 0.1 && !s.completed) {
        const hFont = Math.max(7, px(FONT_SIZE.xs, minDim));
        ctx.font = `${hFont}px monospace`;
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance);
        ctx.fillText('DRAG TO GRINDSTONE', w * 0.5, barY - px(0.04, minDim));
      }

      if (p.reducedMotion) {
        ctx.beginPath();
        ctx.moveTo(nx, ny - nodeR);
        ctx.lineTo(nx + nodeR * 0.5, ny);
        ctx.lineTo(nx, ny + nodeR);
        ctx.lineTo(nx - nodeR * 0.5, ny);
        ctx.closePath();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
        ctx.fill();
      }

      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          Object.assign(s, freshState(color, accentColor));
          s.entranceProgress = 1;
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      stateRef.current.dragging = true;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging || s.completed) return;
      const rect = canvas.getBoundingClientRect();
      s.nodeX = (e.clientX - rect.left) / rect.width;
      s.nodeY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.dragging = false;
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
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} />
    </div>
  );
}
