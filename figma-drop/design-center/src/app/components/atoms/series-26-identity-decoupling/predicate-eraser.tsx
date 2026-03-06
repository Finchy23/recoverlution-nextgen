/**
 * ATOM 253: THE PREDICATE ERASER ENGINE
 * ========================================
 * Series 26 — Identity Decoupling · Position 3
 *
 * Any word after "I AM" is a limitation. Draw across the predicate
 * text to dissolve it like sugar in water. "I AM" alone remains at
 * center, pulsing with warm heartbeat glow.
 *
 * SIGNATURE TECHNIQUE: Signed Distance Field Morphing
 *   - Predicate text characters rendered as SDF letter-shapes
 *   - Drawing near letters causes their SDF boundary to soften/blur
 *     until the distance field collapses and the letter dissolves
 *   - "I AM" text has a crystalline SDF edge that SHARPENS as
 *     predicates dissolve — identity clarifying through subtraction
 *   - SDF edge glow on "I AM" grows into a heartbeat-pulsed halo
 *
 * PHYSICS:
 *   - "I AM ________" displayed large, centered
 *   - Drawing near predicate → SDF collapse + particle dispersion
 *   - Each letter breaks into 4-5 sub-particles that drift + fade
 *   - "I AM" grows brighter, acquires heartbeat pulse
 *   - 8 render layers: atmosphere, heartbeat glow, ghost text,
 *     predicate text, eraser field, "I AM" body, specular, bloom
 *
 * INTERACTION:
 *   Draw/drag across predicate to erase (drag_snap, completion)
 *
 * RENDER: Canvas 2D with SDF text dissolution + heartbeat core
 * REDUCED MOTION: "I AM" alone, fully glowing
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import {
  parseColor, lerpColor, rgba,
  setupCanvas, advanceEntrance, drawAtmosphere,
  ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale,
  type RGB,
} from '../atom-utils';

// ═════════════════════════════════════════════════════════════════════
// PHYSICS CONSTANTS
// ═════════════════════════════════════════════════════════════════════

/** Predicates to erase — limiting identity labels */
const PREDICATES = ['anxious', 'broken', 'worthless', 'a failure', 'not enough', 'unlovable'];
/** Eraser proximity radius (fraction of viewport) */
const ERASER_RADIUS = 0.065;
/** Particle drift speed after dissolution */
const PARTICLE_DRIFT = 0.0035;
/** Particle opacity decay rate */
const PARTICLE_DECAY = 0.007;
/** Ghost text trail decay */
const GHOST_DECAY = 0.984;
/** Resting heart rate in BPM */
const HEARTBEAT_BPM = 68;
/** Heartbeat glow intensity multiplier */
const HEARTBEAT_INTENSITY = 0.4;
/** Core glow field radius */
const CORE_GLOW_R = 0.25;
/** Number of glow layers */
const GLOW_LAYERS = 6;
/** Sub-particles spawned per dissolved character */
const SUB_PARTICLES_PER_CHAR = 4;
/** SDF edge sharpness for "I AM" text */
const IAM_SDF_EDGE = 0.015;
/** Specular highlight size on "I AM" */
const SPECULAR_R = 0.03;

// ═════════════════════════════════════════════════════════════════════
// STATE INTERFACES
// ═════════════════════════════════════════════════════════════════════

interface TextParticle {
  x: number; y: number; vx: number; vy: number;
  char: string; alpha: number; size: number; rotation: number;
}

interface GhostText {
  text: string; x: number; y: number; alpha: number;
}

// ═════════════════════════════════════════════════════════════════════
// RENDER HELPERS
// ═════════════════════════════════════════════════════════════════════

/** Draw "I AM" with SDF-like crystalline edge glow */
function drawIamCore(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, minDim: number,
  color: RGB, intensity: number, entrance: number,
  heartbeatPhase: number, breathMod: number,
) {
  const heartbeat = Math.pow(Math.max(0, Math.sin(heartbeatPhase)), 4);
  const pulse = 1 + heartbeat * 0.08;
  const fontSize = px(FONT_SIZE.hero, minDim) * pulse * breathMod;

  // ── Heartbeat glow field ────────────────────────────────────
  for (let i = GLOW_LAYERS - 1; i >= 0; i--) {
    const gR = px(CORE_GLOW_R * (0.3 + intensity * 0.7 + i * 0.1), minDim) * breathMod;
    const gA = ALPHA.glow.max * (0.02 + intensity * 0.2) * entrance / (i + 1);
    const warmColor = lerpColor(color, [255, 235, 210] as RGB, intensity * 0.3);
    const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, gR);
    gg.addColorStop(0, rgba(warmColor, gA * (1 + heartbeat * 0.3)));
    gg.addColorStop(0.2, rgba(warmColor, gA * 0.5));
    gg.addColorStop(0.5, rgba(color, gA * 0.15));
    gg.addColorStop(0.8, rgba(color, gA * 0.03));
    gg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = gg;
    ctx.fillRect(cx - gR, cy - gR, gR * 2, gR * 2);
  }

  // ── SDF edge glow ring around text ───────────────��──────────
  const edgeR = fontSize * 1.5;
  const edgeGrad = ctx.createRadialGradient(cx, cy, edgeR * 0.6, cx, cy, edgeR);
  edgeGrad.addColorStop(0, rgba(color, 0));
  edgeGrad.addColorStop(0.7, rgba(color, ALPHA.glow.max * intensity * 0.12 * entrance));
  edgeGrad.addColorStop(0.85, rgba(color, ALPHA.glow.max * intensity * 0.2 * entrance * (1 + heartbeat * 0.2)));
  edgeGrad.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = edgeGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, edgeR, 0, Math.PI * 2);
  ctx.fill();

  // ── "I AM" text ─────────────────────────────────────────────
  ctx.font = `${fontSize}px "Georgia", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text shadow / glow
  const textA = ALPHA.content.max * (0.15 + intensity * 0.6) * entrance;
  ctx.fillStyle = rgba(color, textA * 0.4);
  ctx.fillText('I AM', cx + 1, cy + 1);

  // Main text
  ctx.fillStyle = rgba(color, textA);
  ctx.fillText('I AM', cx, cy);

  // ── Specular on text ────────────────────────────────────────
  const specX = cx - fontSize * 0.3;
  const specY = cy - fontSize * 0.25;
  const specR = px(SPECULAR_R, minDim) * intensity;
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, specR);
  specGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.15 * intensity * entrance));
  specGrad.addColorStop(1, rgba([255, 255, 255] as RGB, 0));
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specX, specY, specR, 0, Math.PI * 2);
  ctx.fill();
}

// ═════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════

export default function PredicateEraserAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, composed, onHaptic, onStateChange,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHaptic, onStateChange });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor, composed });

  useEffect(() => { callbacksRef.current = { onHaptic, onStateChange }; }, [onHaptic, onStateChange]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor, composed }; }, [breathAmplitude, reducedMotion, phase, color, accentColor, composed]);

  const stateRef = useRef({
    entranceProgress: 0, frameCount: 0,
    primaryRgb: parseColor(color), accentRgb: parseColor(accentColor),
    currentPredicate: 0,
    /** SDF dissolve progress for current predicate [0..1] */
    dissolveProgress: 0,
    particles: [] as TextParticle[],
    ghosts: [] as GhostText[],
    heartbeatPhase: 0,
    pointerX: -1, pointerY: -1,
    pointerActive: false,
    dragNotified: false,
    completed: false,
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
      const s = stateRef.current; const p = propsRef.current; const cb = callbacksRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      const ms = motionScale(p.reducedMotion);
      s.frameCount++;

      const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress;
      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance);

      if (p.reducedMotion || p.phase === 'resolve') {
        s.currentPredicate = PREDICATES.length;
        s.completed = true;
      }

      const breathMod = 1 + p.breathAmplitude * 0.04;
      const breathGlow = 1 + p.breathAmplitude * 0.12;

      // Heartbeat phase
      const heartbeatInterval = 60 / HEARTBEAT_BPM;
      s.heartbeatPhase += (Math.PI * 2) / (heartbeatInterval * 60) * ms;

      // Dissolve via pointer proximity
      if (s.pointerActive && s.currentPredicate < PREDICATES.length) {
        const predY = cy + px(0.06, minDim);
        const predText = PREDICATES[s.currentPredicate];
        const fontSize = px(FONT_SIZE.lg, minDim);
        ctx.font = `${fontSize}px "Georgia", serif`;
        const textW = ctx.measureText(predText).width;
        const predX = cx;
        const dist = Math.hypot(s.pointerX - predX / w, s.pointerY - predY / h);

        if (dist < ERASER_RADIUS) {
          s.dissolveProgress = Math.min(1, s.dissolveProgress + 0.015 * ms);

          // Spawn particles as text dissolves
          if (s.frameCount % 3 === 0 && s.dissolveProgress < 0.9) {
            const charIdx = Math.floor(s.dissolveProgress * predText.length);
            if (charIdx < predText.length) {
              for (let p2 = 0; p2 < SUB_PARTICLES_PER_CHAR; p2++) {
                const charX = (predX - textW / 2 + (charIdx + 0.5) * (textW / predText.length)) / w;
                s.particles.push({
                  x: charX, y: predY / h,
                  vx: (Math.random() - 0.5) * PARTICLE_DRIFT,
                  vy: (Math.random() - 0.5) * PARTICLE_DRIFT - 0.001,
                  char: predText[charIdx] || '·',
                  alpha: 0.6, size: fontSize * (0.5 + Math.random() * 0.5) / minDim,
                  rotation: (Math.random() - 0.5) * 0.3,
                });
              }
            }
          }

          if (s.dissolveProgress >= 1) {
            // Ghost trail of erased predicate
            s.ghosts.push({
              text: predText, x: cx / w, y: predY / h, alpha: 0.35,
            });
            s.currentPredicate++;
            s.dissolveProgress = 0;
            if (s.currentPredicate >= PREDICATES.length && !s.completed) {
              s.completed = true;
              cb.onHaptic('completion');
            } else {
              cb.onHaptic('drag_snap');
            }
          }
        }
      }

      // Particle physics
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx * ms; pt.y += pt.vy * ms;
        pt.rotation += 0.01 * ms;
        pt.alpha -= PARTICLE_DECAY * ms;
        if (pt.alpha <= 0) s.particles.splice(i, 1);
      }

      // Ghost decay
      for (let i = s.ghosts.length - 1; i >= 0; i--) {
        s.ghosts[i].alpha *= GHOST_DECAY;
        if (s.ghosts[i].alpha < 0.005) s.ghosts.splice(i, 1);
      }

      const erasedFrac = s.currentPredicate / PREDICATES.length;
      cb.onStateChange?.(erasedFrac);

      // ═══════════════════════════════════════════════════════
      // LAYER 1: "I AM" core with heartbeat glow
      // ═══════════════════════════════════════════════════════
      drawIamCore(ctx, cx, cy - px(0.02, minDim), minDim, s.primaryRgb, erasedFrac, entrance, s.heartbeatPhase, breathMod);

      // ═══════════════════════════════════════════════════════
      // LAYER 2: Ghost erased texts
      // ═══════════════════════════════════════════════════════
      for (const g of s.ghosts) {
        const fontSize = px(FONT_SIZE.md, minDim);
        ctx.font = `${fontSize}px "Georgia", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * g.alpha * 0.15 * entrance);
        ctx.fillText(g.text, g.x * w, g.y * h);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 3: Current predicate (dissolving)
      // ═══════════════════════════════════════════════════════
      if (s.currentPredicate < PREDICATES.length) {
        const predText = PREDICATES[s.currentPredicate];
        const predY = cy + px(0.06, minDim);
        const fontSize = px(FONT_SIZE.lg, minDim);
        ctx.font = `${fontSize}px "Georgia", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // SDF dissolve: text opacity decreases, edge softens
        const dissolveAlpha = ALPHA.content.max * 0.35 * (1 - s.dissolveProgress * 0.8) * entrance;

        // Render char by char for dissolve effect
        const metrics = ctx.measureText(predText);
        const totalW = metrics.width;
        let xPos = cx - totalW / 2;

        for (let ci = 0; ci < predText.length; ci++) {
          const charDissolve = ci / predText.length < s.dissolveProgress ? 1 : 0;
          const charW = ctx.measureText(predText[ci]).width;

          if (charDissolve < 1) {
            // Slight wobble for chars near dissolve front
            const nearFront = Math.abs(ci / predText.length - s.dissolveProgress) < 0.15;
            const wobbleY = nearFront ? Math.sin(s.frameCount * 0.1 + ci) * px(0.002, minDim) : 0;

            ctx.fillStyle = rgba(s.accentRgb, dissolveAlpha * (nearFront ? 0.6 : 1));
            ctx.textAlign = 'left';
            ctx.fillText(predText[ci], xPos, predY + wobbleY);
          }
          xPos += charW;
        }

        // ── Eraser proximity indicator ────────────────────────
        if (s.pointerActive) {
          const eraserR = px(ERASER_RADIUS, minDim);
          const eGrad = ctx.createRadialGradient(
            s.pointerX * w, s.pointerY * h, 0,
            s.pointerX * w, s.pointerY * h, eraserR,
          );
          eGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.08 * entrance));
          eGrad.addColorStop(0.5, rgba(s.primaryRgb, ALPHA.glow.max * 0.03 * entrance));
          eGrad.addColorStop(1, rgba(s.primaryRgb, 0));
          ctx.fillStyle = eGrad;
          ctx.beginPath();
          ctx.arc(s.pointerX * w, s.pointerY * h, eraserR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 4: Dissolving particles
      // ═══════════════════════════════════════════════════════
      for (const pt of s.particles) {
        const ptSize = px(pt.size, minDim);
        ctx.save();
        ctx.translate(pt.x * w, pt.y * h);
        ctx.rotate(pt.rotation);
        ctx.font = `${ptSize}px "Georgia", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * pt.alpha * 0.3 * entrance);
        ctx.fillText(pt.char, 0, 0);
        ctx.restore();

        // Particle glow
        const pgR = ptSize * 0.8;
        const pgGrad = ctx.createRadialGradient(pt.x * w, pt.y * h, 0, pt.x * w, pt.y * h, pgR);
        pgGrad.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * pt.alpha * 0.05 * entrance));
        pgGrad.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = pgGrad;
        ctx.fillRect(pt.x * w - pgR, pt.y * h - pgR, pgR * 2, pgR * 2);
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 5: Predicate counter dots
      // ═══════════════════════════════════════════════════════
      const dotY = cy + px(0.14, minDim);
      const dotSpacing = px(0.015, minDim);
      const dotR = px(0.003, minDim);
      for (let i = 0; i < PREDICATES.length; i++) {
        const dotX = cx + (i - (PREDICATES.length - 1) / 2) * dotSpacing;
        const erased = i < s.currentPredicate;
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(
          erased ? s.primaryRgb : s.accentRgb,
          ALPHA.content.max * (erased ? 0.25 : 0.08) * entrance,
        );
        ctx.fill();
      }

      // ═══════════════════════════════════════════════════════
      // LAYER 6: Completion bloom
      // ═══════════════════════════════════════════════════════
      if (s.completed) {
        const time = s.frameCount * 0.01;
        for (let i = 0; i < 4; i++) {
          const rPhase = (time * 0.02 + i * 0.25) % 1;
          const rR = px(0.04 + rPhase * 0.3, minDim);
          ctx.beginPath();
          ctx.arc(cx, cy - px(0.02, minDim), rR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.04 * (1 - rPhase) * entrance);
          ctx.lineWidth = px(STROKE.hairline, minDim);
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // ── Pointer events ───────────────────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      s.pointerActive = true;
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width;
      s.pointerY = (e.clientY - rect.top) / rect.height;
      if (!s.dragNotified) {
        s.dragNotified = true;
        callbacksRef.current.onHaptic('drag_snap');
      }
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.pointerActive) return;
      const rect = canvas.getBoundingClientRect();
      s.pointerX = (e.clientX - rect.left) / rect.width;
      s.pointerY = (e.clientY - rect.top) / rect.height;
    };
    const onUp = () => { stateRef.current.pointerActive = false; };

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
      <canvas ref={canvasRef} style={{
        display: 'block', width: '100%', height: '100%',
        touchAction: 'none', cursor: 'crosshair',
      }} />
    </div>
  );
}
