/**
 * ATOM 666: THE TRACTION LOSS ENGINE
 * =====================================
 * Series 67 — Harmonious Friction · Position 6
 *
 * Cure echo chamber hydroplaning. Drag rough dissent particles
 * onto the frictionless road — the node jolts but wheels bite
 * into grit, translating spinning into massive forward momentum.
 *
 * SIGNATURE TECHNIQUE: Directional friction — hydroplaning
 * visualization, RPM redline, grit deployment, traction bite
 * transition from spinning wheels to real forward movement.
 *
 * INTERACTION: Drag (grit particles onto road) → traction → momentum
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static gripped road
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE,
  PARTICLE_SIZE, motionScale, type RGB,
} from '../atom-utils';

const NODE_RADIUS      = 0.02;
const ROAD_Y           = 0.6;
const ROAD_HEIGHT      = 0.15;
const GRIT_COUNT       = 6;
const GRIT_NEEDED      = 5;
const GRIT_ZONE_Y      = 0.35;
const MOMENTUM_GAIN    = 0.008;
const RESPAWN_DELAY    = 100;

interface GritP {
  x: number; y: number; deployed: boolean; dragging: boolean;
}

interface TractionState {
  entranceProgress: number;
  frameCount: number;
  primaryRgb: RGB;
  accentRgb: RGB;
  nodeX: number;
  wheelSpin: number;            // RPM (visual only when hydroplaning)
  bgScroll: number;             // actual forward movement
  grits: GritP[];
  gritsDeployed: number;
  hasTraction: boolean;
  momentum: number;
  activeDrag: number | null;
  completed: boolean;
  respawnTimer: number;
}

function makeGrits(): GritP[] {
  return Array.from({ length: GRIT_COUNT }, (_, i) => ({
    x: 0.15 + i * 0.12, y: GRIT_ZONE_Y,
    deployed: false, dragging: false,
  }));
}

function freshState(c: string, a: string): TractionState {
  return {
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeX: 0.2, wheelSpin: 0.5, bgScroll: 0,
    grits: makeGrits(), gritsDeployed: 0,
    hasTraction: false, momentum: 0, activeDrag: null,
    completed: false, respawnTimer: 0,
  };
}

export default function TractionLossGritAtom({
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
      s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);
      const nodeR = px(NODE_RADIUS, minDim);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── PHYSICS ─────────────────────────────────────
      if (!p.reducedMotion && !s.completed) {
        s.hasTraction = s.gritsDeployed >= GRIT_NEEDED;

        if (s.hasTraction) {
          s.momentum = Math.min(1, s.momentum + MOMENTUM_GAIN);
          s.bgScroll += s.momentum * 0.005;
          s.wheelSpin = Math.max(0.1, s.wheelSpin - 0.005); // RPM drops to match speed
          cb.onStateChange?.(0.5 + s.momentum * 0.5);

          if (s.momentum >= 1 && !s.completed) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        } else {
          s.wheelSpin = 0.5 + Math.sin(s.frameCount * 0.05) * 0.1; // redlining
          s.bgScroll += 0.0001; // barely moving
        }
      }

      const roadTop = h * ROAD_Y;
      const roadH = h * ROAD_HEIGHT;

      // ── LAYER 2: Road surface ──────────────────────
      // Road body
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 1.5 * entrance);
      ctx.fillRect(0, roadTop, w, roadH);

      // Road markings (scrolling)
      const markSpacing = px(0.08, minDim);
      const markW = px(0.03, minDim);
      const markH = px(0.003, minDim);
      const offset = (s.bgScroll * w * 10) % markSpacing;
      for (let x = -offset; x < w; x += markSpacing) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
        ctx.fillRect(x, roadTop + roadH / 2 - markH / 2, markW, markH);
      }

      // Frictionless ice sheen (when no traction)
      if (!s.hasTraction) {
        const iceSheen = ctx.createLinearGradient(0, roadTop, 0, roadTop + roadH);
        iceSheen.addColorStop(0, rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance));
        iceSheen.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.background.min * 0.5 * entrance));
        iceSheen.addColorStop(1, rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance));
        ctx.fillStyle = iceSheen;
        ctx.fillRect(0, roadTop, w, roadH);
      }

      // ── LAYER 3: Grit patches on road ──────────────
      for (const g of s.grits) {
        if (!g.deployed) continue;
        const gx = g.x * w;
        const gy = (ROAD_Y + ROAD_HEIGHT * 0.5) * h;
        for (let i = 0; i < 8; i++) {
          const px2 = gx + (Math.random() - 0.5) * px(0.02, minDim);
          const py2 = gy + (Math.random() - 0.5) * px(0.01, minDim);
          ctx.beginPath();
          ctx.arc(px2, py2, px(PARTICLE_SIZE.xs, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
          ctx.fill();
        }
      }

      if (s.hasTraction) {
        const biteStartX = s.nodeX * w - px(0.08, minDim);
        const biteEndX = w * 0.88;
        const laneY1 = roadTop + roadH * 0.38;
        const laneY2 = roadTop + roadH * 0.62;

        [laneY1, laneY2].forEach((y, idx) => {
          ctx.beginPath();
          ctx.moveTo(biteStartX, y);
          ctx.lineTo(biteEndX, y);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.max * 0.16 * entrance * s.momentum);
          ctx.lineWidth = px(0.006, minDim);
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(biteStartX, y);
          ctx.lineTo(biteEndX, y);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.glow.max * 0.18 * entrance * s.momentum);
          ctx.lineWidth = px(0.0016, minDim);
          ctx.stroke();
        });
      }

      // ── LAYER 4: Draggable grit sources ────────────
      for (const g of s.grits) {
        if (g.deployed) continue;
        const gx = g.x * w;
        const gy = g.y * h;
        const gSize = px(0.015, minDim);
        ctx.beginPath();
        // Rough shape
        ctx.arc(gx, gy, gSize, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.4 * entrance);
        ctx.fill();
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // ── LAYER 5: Wheel spin visualization ──────────
      const wheelX = s.nodeX * w;
      const wheelY = roadTop;
      const wheelR = nodeR * 1.2;

      // Spinning lines
      for (let i = 0; i < 4; i++) {
        const wa = s.frameCount * s.wheelSpin * 0.3 + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(wheelX + Math.cos(wa) * wheelR * 0.3, wheelY + Math.sin(wa) * wheelR * 0.3);
        ctx.lineTo(wheelX + Math.cos(wa) * wheelR, wheelY + Math.sin(wa) * wheelR);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.4 * entrance * ms);
        ctx.lineWidth = px(STROKE.thin, minDim);
        ctx.stroke();
      }

      // Spray (hydroplaning)
      if (!s.hasTraction && s.frameCount % 3 === 0) {
        for (let i = 0; i < 3; i++) {
          const spx = wheelX - px(0.01, minDim) - Math.random() * px(0.03, minDim);
          const spy = wheelY + (Math.random() - 0.5) * px(0.01, minDim);
          ctx.beginPath();
          ctx.arc(spx, spy, px(PARTICLE_SIZE.xs, minDim), 0, Math.PI * 2);
          ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.3 * entrance * ms);
          ctx.fill();
        }
      }

      // ── LAYER 6: Node (vehicle) ────────────────────
      const nx = s.nodeX * w;
      const ny = roadTop - nodeR;

      const gr = px(0.06, minDim);
      const nGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, gr);
      nGlow.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.3 * entrance));
      nGlow.addColorStop(1, rgba(s.primaryRgb, 0));
      ctx.fillStyle = nGlow;
      ctx.fillRect(nx - gr, ny - gr, gr * 2, gr * 2);

      ctx.beginPath();
      ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * entrance);
      ctx.fill();

      // ── LAYER 7: RPM gauge ─────────────────────────
      const gaugeX = w - px(0.08, minDim);
      const gaugeY = px(0.08, minDim);
      const gaugeR = px(0.04, minDim);

      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, gaugeR, Math.PI * 0.7, Math.PI * 2.3);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
      ctx.lineWidth = px(STROKE.medium, minDim);
      ctx.stroke();

      const rpmAngle = Math.PI * 0.7 + s.wheelSpin * Math.PI * 1.6;
      ctx.beginPath();
      ctx.moveTo(gaugeX, gaugeY);
      ctx.lineTo(gaugeX + Math.cos(rpmAngle) * gaugeR * 0.8, gaugeY + Math.sin(rpmAngle) * gaugeR * 0.8);
      const rpmColor = s.wheelSpin > 0.4 && !s.hasTraction ? s.accentRgb : s.primaryRgb;
      ctx.strokeStyle = rgba(rpmColor, ALPHA.content.max * 0.5 * entrance);
      ctx.lineWidth = px(STROKE.light, minDim);
      ctx.stroke();

      const rpmFont = Math.max(6, px(FONT_SIZE.xs, minDim));
      ctx.font = `${rpmFont}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(rpmColor, ALPHA.text.max * 0.4 * entrance);
      ctx.fillText('RPM', gaugeX, gaugeY + gaugeR + px(0.015, minDim));

      // ── LAYER 8: HUD ───────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      if (s.hasTraction) {
        const momPct = Math.round(s.momentum * 100);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.45 * entrance);
        ctx.fillText(`MOMENTUM ${momPct}%`, cx, h - px(0.035, minDim));
      } else {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText(`HYDROPLANING · ${s.gritsDeployed}/${GRIT_NEEDED} GRIT`, cx, h - px(0.035, minDim));
      }

      if (p.reducedMotion) {
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.background.min * 2 * entrance);
        ctx.fillRect(0, roadTop, w, roadH);
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
      const s = stateRef.current;
      if (s.completed) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      for (let i = 0; i < s.grits.length; i++) {
        const g = s.grits[i];
        if (g.deployed) continue;
        const dist = Math.sqrt((mx - g.x) ** 2 + (my - g.y) ** 2);
        if (dist < 0.05) {
          g.dragging = true;
          s.activeDrag = i;
          canvas.setPointerCapture(e.pointerId);
          return;
        }
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.activeDrag === null) return;
      const rect = canvas.getBoundingClientRect();
      const g = s.grits[s.activeDrag];
      g.x = (e.clientX - rect.left) / rect.width;
      g.y = (e.clientY - rect.top) / rect.height;
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.activeDrag === null) return;
      const g = s.grits[s.activeDrag];
      g.dragging = false;
      // Check if dropped on road
      if (g.y > ROAD_Y - 0.05 && g.y < ROAD_Y + ROAD_HEIGHT + 0.05) {
        g.deployed = true;
        s.gritsDeployed++;
        cbRef.current.onHaptic('drag_snap');
        cbRef.current.onStateChange?.(s.gritsDeployed / GRIT_NEEDED * 0.5);
      } else {
        // Return to source
        g.x = 0.15 + s.activeDrag * 0.12;
        g.y = GRIT_ZONE_Y;
      }
      s.activeDrag = null;
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
