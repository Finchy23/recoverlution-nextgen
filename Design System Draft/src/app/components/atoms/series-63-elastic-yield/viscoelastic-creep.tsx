/**
 * ATOM 624: THE VISCOELASTIC CREEP ENGINE
 * =========================================
 * Series 63 — Elastic Yield · Position 4
 *
 * Prove slow yielding is stronger than rigid holding. Stop fighting
 * the crushing weight. Let your node deform and flatten — expanded
 * surface area drops pressure per square inch to sustainable.
 *
 * SIGNATURE TECHNIQUE: Stress Tensor Visualization
 *   - Node surface shows Von Mises stress distribution as color map
 *   - Rigid state: stress concentrates at top (red hot contact point)
 *   - Yielding state: stress distributes evenly across widening surface (cool blue)
 *   - Pressure gauge shows stress-per-area dropping as surface expands
 *   - Grinding (rigid fighting) shows dangerous stress oscillation
 *
 * RENDER LAYERS (8):
 *   1. Atmosphere + compression vignette
 *   2. Stress field around crushing block (heat radiation)
 *   3. Crushing block shadow + body with depth gradient
 *   4. Node body with stress tensor coloring per-angle
 *   5. Contact zone stress overlay (where block meets node)
 *   6. Pressure per area visualization
 *   7. Grind shake particles / completion bloom
 *   8. Progress ring + pressure gauge
 *
 * PHYSICS:
 *   - Massive block crushes node from above
 *   - Hold = intentional slow deformation (viscoelastic creep)
 *   - Not holding = rigid fighting → grinding failure warnings
 *   - Deformation widens surface → mathematical pressure drop
 *   - Breath modulates node glow + deformation smoothness
 *
 * INTERACTION:
 *   Hold → intentional yield → pressure distributes
 *   (error_boundary, hold_start, step_advance, completion)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: Static flattened node with distributed stress, sustainable
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, STROKE, GLOW, FONT_SIZE, motionScale, type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// STRESS HELPER
// ═════════════════════════════════════════════════════════════════════

/** Map stress (0–1) to heat: blue → green → yellow → red → white */
function stressColor(s: number): RGB {
  if (s < 0.25) return lerpColor([50, 80, 200] as RGB, [60, 180, 130] as RGB, s / 0.25);
  if (s < 0.5) return lerpColor([60, 180, 130] as RGB, [220, 200, 50] as RGB, (s - 0.25) / 0.25);
  if (s < 0.75) return lerpColor([220, 200, 50] as RGB, [220, 80, 60] as RGB, (s - 0.5) / 0.25);
  return lerpColor([220, 80, 60] as RGB, [255, 240, 240] as RGB, (s - 0.75) / 0.25);
}

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Node base radius (hero element) */
const NODE_R = SIZE.md * 0.22;
/** Crushing block height */
const BLOCK_H = 0.025;
/** Crushing block width */
const BLOCK_W = 0.28;
/** Deformation rate per frame */
const DEFORM_RATE = 0.003;
/** Grind shake buildup rate */
const GRIND_RATE = 0.02;
/** Grind damping */
const GRIND_DAMP = 0.98;
/** Pressure relief threshold for completion */
const COMPLETION_DEFORM = 0.95;
/** Step advance tiers */
const STEP_TIERS = 5;
/** Contact zone stress particles */
const CONTACT_PARTICLES = 30;
/** Grind spark count */
const GRIND_SPARKS = 12;
/** Stress field glow layers */
const STRESS_GLOW_LAYERS = 4;
/** Progress ring radius */
const PROGRESS_RING_R = SIZE.md * 0.85;
/** Respawn delay */
const RESPAWN_DELAY = 100;
/** Breath deformation smoothness */
const BREATH_SMOOTH_K = 0.05;
/** Specular intensity */
const SPECULAR_K = 0.22;
/** Gauge position */
const GAUGE_Y_FRAC = 0.88;
/** Gauge width */
const GAUGE_W_FRAC = 0.3;

// ═════════════════════════════════════════════════════════════════════
// STATE
// ═════════════════════════════════════════════════════════════════════

interface GrindSpark {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number;
}

// ═════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function ViscoelasticCreepAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });
  useEffect(() => { cbRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    holding: false,
    deform: 0,
    pressure: 1,
    grindShake: 0,
    completed: false,
    respawnTimer: 0,
    lastTier: 0,
    sparks: [] as GrindSpark[],
    errorNotified: false,
  });

  useEffect(() => {
    stateRef.current.primaryRgb = parseColor(color);
    stateRef.current.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let animId: number;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const breath = p.breathAmplitude; s.frameCount++;
      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      const ms = motionScale(p.reducedMotion);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 1: Atmosphere + compression vignette
      // ════════════════════════════════════════════════════
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      // Compression vignette (darkens as pressure is high)
      const vigAlpha = 0.03 * s.pressure * entrance;
      const vigR = Math.max(w, h) * 0.7;
      const vig = ctx.createRadialGradient(cx, cy, minDim * 0.1, cx, cy, vigR);
      vig.addColorStop(0, rgba([0, 0, 0] as RGB, 0));
      vig.addColorStop(0.6, rgba([0, 0, 0] as RGB, 0));
      vig.addColorStop(1, rgba([0, 0, 0] as RGB, vigAlpha));
      ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);

      const baseR = px(NODE_R, minDim);
      const blockHpx = px(BLOCK_H, minDim);
      const blockWpx = px(BLOCK_W, minDim);

      // ── Reduced motion ─────────────────────────────────
      if (p.reducedMotion) {
        // Static deformed node with distributed stress
        const radX = baseR * 3; const radY = baseR * 0.3;
        ctx.beginPath(); ctx.ellipse(cx, cy, radX, radY, 0, 0, Math.PI * 2);
        const sc = stressColor(0.15);
        ctx.fillStyle = rgba(sc, ALPHA.content.max * 0.25 * entrance);
        ctx.fill();
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.15 * entrance);
        ctx.fillRect(cx - blockWpx / 2, cy - radY - blockHpx * 2, blockWpx, blockHpx * 2);
        ctx.restore(); animId = requestAnimationFrame(render); return;
      }

      // ── Deformation physics ────────────────────────────
      if (!s.completed) {
        if (s.holding) {
          s.deform = Math.min(1, s.deform + DEFORM_RATE * (1 + breath * BREATH_SMOOTH_K));
          s.pressure = Math.max(0.08, 1 - s.deform * 0.92);
          s.grindShake = Math.max(0, s.grindShake - 0.03);
          cb.onStateChange?.(s.deform);
          const tier = Math.floor(s.deform * STEP_TIERS);
          if (tier > s.lastTier) { cb.onHaptic('step_advance'); s.lastTier = tier; }
          if (s.deform >= COMPLETION_DEFORM) {
            s.completed = true;
            cb.onHaptic('completion');
            cb.onStateChange?.(1);
            s.respawnTimer = RESPAWN_DELAY;
          }
        } else {
          s.grindShake = Math.min(1, s.grindShake + GRIND_RATE);
          // Spawn grind sparks
          if (s.grindShake > 0.3 && s.sparks.length < GRIND_SPARKS && s.frameCount % 4 === 0) {
            const contactX = cx + (Math.random() - 0.5) * baseR * (1 + s.deform);
            s.sparks.push({
              x: contactX, y: cy - baseR * (1 - s.deform * 0.7),
              vx: (Math.random() - 0.5) * 3, vy: -1 - Math.random() * 2,
              life: 20 + Math.random() * 15, maxLife: 35,
            });
          }
          if (s.grindShake > 0.7 && !s.errorNotified) {
            s.errorNotified = true;
            cb.onHaptic('error_boundary');
            setTimeout(() => { stateRef.current.errorNotified = false; }, 800);
          }
        }
      }

      if (s.grindShake > 0 && !s.holding) s.grindShake *= GRIND_DAMP;
      const shakeX = s.grindShake * Math.sin(s.frameCount * 1.5) * px(0.005, minDim) * ms;
      const shakeY = s.grindShake * Math.cos(s.frameCount * 2.1) * px(0.002, minDim) * ms;

      // Update sparks
      for (const sp of s.sparks) {
        sp.x += sp.vx * ms; sp.y += sp.vy * ms; sp.vy += 0.08; sp.life--;
      }
      s.sparks = s.sparks.filter(sp => sp.life > 0);

      // Deformation geometry
      const radX = baseR * (1 + s.deform * 2.5);
      const radY = baseR * (1 - s.deform * 0.7);
      const nodeColor = lerpColor(s.accentRgb, s.primaryRgb, s.deform);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 2: Stress field heat radiation
      // ════════════════════════════════════════════════════
      const contactStress = s.holding ? (1 - s.deform) * 0.7 : s.pressure * 0.9;
      for (let gi = STRESS_GLOW_LAYERS - 1; gi >= 0; gi--) {
        const gR = baseR * (1.5 + gi * 0.5) * (1 + s.pressure * 0.5);
        const gA = ALPHA.glow.max * 0.03 * contactStress * entrance / (gi + 1);
        const sc = stressColor(contactStress * 0.8);
        const sg = ctx.createRadialGradient(cx, cy - radY * 0.5, 0, cx, cy - radY * 0.5, gR);
        sg.addColorStop(0, rgba(sc, gA));
        sg.addColorStop(0.4, rgba(lerpColor(sc, s.primaryRgb, 0.5), gA * 0.4));
        sg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = sg;
        ctx.fillRect(cx - gR, cy - radY * 0.5 - gR, gR * 2, gR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 3: Crushing block with depth
      // ════════════════════════════════════════════════════
      const blockY = cy - radY - blockHpx * 0.5;
      // Block shadow
      ctx.fillStyle = rgba([0, 0, 0] as RGB, 0.04 * entrance);
      ctx.fillRect(cx - blockWpx / 2 + 2 + shakeX, blockY - blockHpx + 3, blockWpx, blockHpx * 2);

      // Block body with gradient
      const blockGrad = ctx.createLinearGradient(0, blockY - blockHpx, 0, blockY + blockHpx);
      blockGrad.addColorStop(0, rgba(lerpColor(s.accentRgb, [0, 0, 0] as RGB, 0.2), ALPHA.content.max * 0.35 * entrance));
      blockGrad.addColorStop(0.3, rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance));
      blockGrad.addColorStop(0.7, rgba(lerpColor(s.accentRgb, [255, 255, 255] as RGB, 0.1), ALPHA.content.max * 0.28 * entrance));
      blockGrad.addColorStop(1, rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance));
      ctx.fillStyle = blockGrad;
      ctx.fillRect(cx - blockWpx / 2 + shakeX, blockY - blockHpx, blockWpx, blockHpx * 2);

      // Block specular
      ctx.fillStyle = rgba([255, 255, 255] as RGB, 0.06 * entrance);
      ctx.fillRect(cx - blockWpx / 2 + shakeX + blockWpx * 0.1, blockY - blockHpx + 1, blockWpx * 0.6, 2);

      // ════════════════════════════════════════════════════
      // RENDER LAYER 4: Node with per-angle stress coloring
      // ════════════════════════════════════════════════════
      // Node shadow
      ctx.beginPath();
      ctx.ellipse(cx + 2, cy + radY * 0.4, radX * 0.8, radY * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba([0, 0, 0] as RGB, 0.025 * entrance);
      ctx.fill();

      // Draw node as multiple angular segments with stress coloring
      const segments = 36;
      for (let i = 0; i < segments; i++) {
        const a0 = (i / segments) * Math.PI * 2;
        const a1 = ((i + 1) / segments) * Math.PI * 2;
        const midAngle = (a0 + a1) / 2;
        // Stress is highest at top (contact with block), lowest at sides
        const verticalFactor = Math.max(0, -Math.sin(midAngle)); // 1 at top, 0 at sides
        const segStress = s.pressure * verticalFactor * (1 - s.deform * 0.6);
        const sc = stressColor(segStress);
        const segA = ALPHA.content.max * (0.15 + (1 - segStress) * 0.2) * entrance;

        ctx.beginPath();
        ctx.moveTo(cx + shakeX, cy);
        ctx.ellipse(cx + shakeX, cy, radX, radY * (1 + breath * 0.04), 0, a0, a1);
        ctx.closePath();
        ctx.fillStyle = rgba(lerpColor(sc, nodeColor, 0.4), segA);
        ctx.fill();
      }

      // Node highlight (specular)
      ctx.beginPath();
      ctx.ellipse(cx + shakeX - radX * 0.15, cy - radY * 0.2, radX * 0.25, radY * 0.12, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba([255, 255, 255] as RGB, SPECULAR_K * 0.5 * entrance);
      ctx.fill();

      // ════════════════════════════════════════════════════
      // RENDER LAYER 5: Contact zone stress overlay
      // ════════════════════════════════════════════════════
      // Contact line between block and node showing stress distribution
      const contactWidth = radX * 2;
      const contactY = cy - radY;
      const contactSegments = 20;
      for (let ci = 0; ci < contactSegments; ci++) {
        const t = ci / contactSegments;
        const cxPos = cx - contactWidth / 2 + t * contactWidth + shakeX;
        // Stress peaks at center of contact
        const contactStressHere = s.pressure * Math.sin(t * Math.PI) * (1 - s.deform * 0.5);
        const cc = stressColor(contactStressHere);
        const dotR = px(0.002, minDim) * (0.5 + contactStressHere);
        ctx.beginPath(); ctx.arc(cxPos, contactY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(cc, ALPHA.content.max * 0.15 * contactStressHere * entrance);
        ctx.fill();
      }

      // Stress arrows showing pressure direction
      if (s.pressure > 0.3) {
        for (let ai = 0; ai < 5; ai++) {
          const t = (ai + 0.5) / 5;
          const ax = cx - radX + t * radX * 2 + shakeX;
          const arrowStress = s.pressure * Math.sin(t * Math.PI);
          const aLen = minDim * 0.01 * arrowStress;
          const ac = stressColor(arrowStress * 0.7);
          ctx.beginPath(); ctx.moveTo(ax, contactY - px(0.005, minDim));
          ctx.lineTo(ax, contactY - px(0.005, minDim) - aLen);
          ctx.strokeStyle = rgba(ac, ALPHA.content.max * 0.08 * arrowStress * entrance);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
        }
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 7: Grind sparks / completion bloom
      // ════════════════════════════════════════════════════
      for (const sp of s.sparks) {
        const spAlpha = (sp.life / sp.maxLife) * ALPHA.content.max * 0.25 * entrance;
        const spStress = 0.7 + (1 - sp.life / sp.maxLife) * 0.3;
        const sc = stressColor(spStress);
        const spR = px(0.002, minDim) * (sp.life / sp.maxLife);
        ctx.beginPath(); ctx.arc(sp.x, sp.y, spR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(sc, spAlpha); ctx.fill();
      }

      // Completion bloom
      if (s.completed) {
        const bloomT = Math.min(1, (RESPAWN_DELAY - s.respawnTimer) / 40);
        const bloomR = radX * 2 * (1 + bloomT * 0.5);
        const bloomA = ALPHA.glow.max * 0.06 * bloomT * entrance;
        const bloom = ctx.createRadialGradient(cx, cy, radX * 0.3, cx, cy, bloomR);
        bloom.addColorStop(0, rgba(lerpColor(s.primaryRgb, [255, 255, 255] as RGB, 0.2), bloomA));
        bloom.addColorStop(0.4, rgba(s.primaryRgb, bloomA * 0.5));
        bloom.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bloom; ctx.fillRect(cx - bloomR, cy - bloomR, bloomR * 2, bloomR * 2);
      }

      // ════════════════════════════════════════════════════
      // RENDER LAYER 8: Progress ring + pressure gauge
      // ════════════════════════════════════════════════════
      // Progress ring
      const ringR = px(PROGRESS_RING_R, minDim);
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.015 * entrance);
      ctx.lineWidth = px(STROKE.hairline, minDim); ctx.stroke();
      const prog = s.completed ? 1 : s.deform;
      if (prog > 0.01) {
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
        ctx.lineWidth = px(STROKE.medium, minDim); ctx.stroke();
      }

      // Pressure gauge
      const gaugeY = h * GAUGE_Y_FRAC;
      const gaugeW = minDim * GAUGE_W_FRAC;
      const gaugeX = cx - gaugeW / 2;
      const gaugeH = px(STROKE.light, minDim);

      // Gauge track
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.atmosphere.min * 0.5 * entrance);
      ctx.fillRect(gaugeX, gaugeY - gaugeH / 2, gaugeW, gaugeH);

      // Gauge fill with stress gradient
      const gFill = ctx.createLinearGradient(gaugeX, 0, gaugeX + gaugeW * s.pressure, 0);
      const pressureStress = s.pressure * 0.8;
      gFill.addColorStop(0, rgba(stressColor(0.1), ALPHA.content.max * 0.12 * entrance));
      gFill.addColorStop(1, rgba(stressColor(pressureStress), ALPHA.content.max * 0.2 * entrance));
      ctx.fillStyle = gFill;
      ctx.fillRect(gaugeX, gaugeY - gaugeH, gaugeW * s.pressure, gaugeH * 2);

      // Labels
      ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.06 * entrance);
      ctx.font = `${px(FONT_SIZE.xs, minDim)}px system-ui`;
      ctx.textAlign = 'left';
      ctx.fillText('PRESSURE / AREA', gaugeX, gaugeY + px(0.02, minDim));

      // ── Respawn ────────────────────────────────────
      if (s.completed && p.phase !== 'resolve') {
        s.respawnTimer--;
        if (s.respawnTimer <= 0) {
          s.deform = 0; s.pressure = 1; s.grindShake = 0;
          s.completed = false; s.lastTier = 0; s.sparks = [];
        }
      }

      ctx.restore(); animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      stateRef.current.holding = true;
      stateRef.current.grindShake = 0;
      canvas.setPointerCapture(e.pointerId);
      cbRef.current.onHaptic('hold_start');
    };
    const onUp = (e: PointerEvent) => {
      stateRef.current.holding = false;
      canvas.releasePointerCapture(e.pointerId);
      if (!stateRef.current.completed) cbRef.current.onHaptic('error_boundary');
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
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
