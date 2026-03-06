/**
 * ATOM 301: THE SYNTHESIS STRIKE ENGINE · S31 · Position 1
 * Smash two opposing beliefs together to reveal a unified core.
 * Drag nodes apart, release to trigger violent snap-back collision.
 *
 * SIGNATURE TECHNIQUE: High-energy collision — elastic spring tension,
 * shell-shattering impact, crystalline core revelation with shrapnel.
 *
 * INTERACTION: Drag apart → release → collision → core revealed
 * RENDER: Canvas 2D (8 layers) · REDUCED MOTION: Static core
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

/** Spring force constant */
const SPRING_K = 0.003;
/** Velocity damping */
const DAMPING = 0.96;
/** Collision speed threshold for shell break */
const IMPACT_THRESHOLD = 0.015;
/** Shrapnel count on impact */
const SHRAPNEL_COUNT = 24;
/** Core reveal duration frames */
const CORE_REVEAL = 80;
const RESPAWN_DELAY = 100;

interface Shrapnel { x: number; y: number; vx: number; vy: number; size: number; life: number; }

interface StrikeState {
  entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  nodeAx: number; nodeBx: number; nodeAv: number; nodeBv: number;
  dragging: 'A' | 'B' | null; dragX: number;
  released: boolean; impacted: boolean; coreReveal: number;
  shrapnel: Shrapnel[]; completed: boolean; respawnTimer: number;
}

function freshState(c: string, a: string): StrikeState {
  return {
    entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    nodeAx: 0.3, nodeBx: 0.7, nodeAv: 0, nodeBv: 0,
    dragging: null, dragX: 0,
    released: false, impacted: false, coreReveal: 0,
    shrapnel: [], completed: false, respawnTimer: 0,
  };
}

export default function SynthesisStrikeAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      // ── SPRING PHYSICS ──────────────────────────────────
      if (!p.reducedMotion && s.released && !s.impacted) {
        const mid = 0.5;
        const forceA = (mid - s.nodeAx) * SPRING_K;
        const forceB = (mid - s.nodeBx) * SPRING_K;
        s.nodeAv = (s.nodeAv + forceA) * DAMPING;
        s.nodeBv = (s.nodeBv + forceB) * DAMPING;
        s.nodeAx += s.nodeAv;
        s.nodeBx += s.nodeBv;

        // Check collision
        if (Math.abs(s.nodeAx - s.nodeBx) < 0.04) {
          const impactV = Math.abs(s.nodeAv) + Math.abs(s.nodeBv);
          if (impactV > IMPACT_THRESHOLD) {
            s.impacted = true;
            s.nodeAx = 0.5; s.nodeBx = 0.5;
            cb.onHaptic('completion');
            // Spawn shrapnel
            for (let i = 0; i < SHRAPNEL_COUNT; i++) {
              const angle = (i / SHRAPNEL_COUNT) * Math.PI * 2 + Math.random() * 0.3;
              const speed = 0.005 + Math.random() * 0.01;
              s.shrapnel.push({
                x: 0.5, y: 0.5, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                size: 0.003 + Math.random() * 0.006, life: 60 + Math.random() * 40,
              });
            }
          }
        }
      }

      // Core reveal
      if (s.impacted && !s.completed) {
        s.coreReveal = Math.min(1, s.coreReveal + 1 / CORE_REVEAL);
        cb.onStateChange?.(s.coreReveal);
        if (s.coreReveal >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
      }

      // Shrapnel update
      for (const sh of s.shrapnel) {
        sh.x += sh.vx * ms; sh.y += sh.vy * ms; sh.life -= ms;
      }
      s.shrapnel = s.shrapnel.filter(sh => sh.life > 0);

      const nodeR = px(SIZE.md * 0.35, minDim);

      // ── LAYER 2: Spring tension line ────────────────────
      if (!s.impacted) {
        const tension = Math.abs(s.nodeAx - s.nodeBx) - 0.1;
        if (tension > 0) {
          ctx.beginPath(); ctx.moveTo(s.nodeAx * w, cy); ctx.lineTo(s.nodeBx * w, cy);
          const tensionAlpha = Math.min(1, tension * 5) * ALPHA.content.max * 0.2 * entrance;
          ctx.strokeStyle = rgba(s.accentRgb, tensionAlpha);
          ctx.lineWidth = px(STROKE.thin, minDim); ctx.stroke();
          // Tension glow
          const tmx = (s.nodeAx + s.nodeBx) / 2 * w;
          const tGlow = ctx.createRadialGradient(tmx, cy, 0, tmx, cy, px(0.05, minDim));
          tGlow.addColorStop(0, rgba(s.accentRgb, tensionAlpha * 0.3)); tGlow.addColorStop(1, rgba(s.accentRgb, 0));
          ctx.fillStyle = tGlow; ctx.fillRect(tmx - px(0.05, minDim), cy - px(0.05, minDim), px(0.1, minDim), px(0.1, minDim));
        }
      }

      // ── LAYER 3-4: Nodes (shells) ──────────────────────
      if (!s.impacted) {
        for (const [nx, nodeColor, label] of [[s.nodeAx, s.accentRgb, 'A'], [s.nodeBx, s.primaryRgb, 'B']] as [number, RGB, string][]) {
          const nxp = nx * w;
          // Outer glow
          const ogR = nodeR * 2; const og = ctx.createRadialGradient(nxp, cy, 0, nxp, cy, ogR);
          og.addColorStop(0, rgba(nodeColor, ALPHA.glow.max * 0.2 * entrance)); og.addColorStop(1, rgba(nodeColor, 0));
          ctx.fillStyle = og; ctx.fillRect(nxp - ogR, cy - ogR, ogR * 2, ogR * 2);
          // Shell
          ctx.beginPath(); ctx.arc(nxp, cy, nodeR, 0, Math.PI * 2);
          const shellGrad = ctx.createRadialGradient(nxp - nodeR * 0.3, cy - nodeR * 0.3, 0, nxp, cy, nodeR);
          shellGrad.addColorStop(0, rgba(nodeColor, ALPHA.content.max * 0.5 * entrance));
          shellGrad.addColorStop(0.7, rgba(nodeColor, ALPHA.content.max * 0.25 * entrance));
          shellGrad.addColorStop(1, rgba(nodeColor, ALPHA.content.max * 0.1 * entrance));
          ctx.fillStyle = shellGrad; ctx.fill();
          // Specular
          ctx.beginPath(); ctx.arc(nxp - nodeR * 0.25, cy - nodeR * 0.25, nodeR * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.25 * entrance); ctx.fill();
        }
      }

      // ── LAYER 5-6: Shrapnel ────────────────────────────
      for (const sh of s.shrapnel) {
        const sx = sh.x * w; const sy = sh.y * h; const sr = px(sh.size, minDim);
        const sa = (sh.life / 100) * ALPHA.content.max * 0.5 * entrance;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = rgba(lerpColor(s.primaryRgb, s.accentRgb, Math.random()), sa); ctx.fill();
      }

      // ── LAYER 7: Core revelation ───────────────────────
      if (s.impacted) {
        const coreR = nodeR * 0.7 * s.coreReveal;
        // Core bloom
        const bloomR = coreR * 4; const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, bloomR);
        bloom.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), ALPHA.glow.max * 0.4 * s.coreReveal * entrance));
        bloom.addColorStop(0.3, rgba(s.primaryRgb, ALPHA.glow.max * 0.15 * s.coreReveal * entrance));
        bloom.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = bloom; ctx.fillRect(cx - bloomR, cy - bloomR, bloomR * 2, bloomR * 2);
        // Core body
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        coreGrad.addColorStop(0, rgba([255, 255, 255] as RGB, ALPHA.content.max * 0.6 * s.coreReveal * entrance));
        coreGrad.addColorStop(0.5, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), ALPHA.content.max * 0.4 * s.coreReveal * entrance));
        coreGrad.addColorStop(1, rgba(s.primaryRgb, ALPHA.content.max * 0.1 * s.coreReveal * entrance));
        ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad; ctx.fill();
      }

      // ── LAYER 8: HUD ──────────────────────────────────
      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim));
      ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('UNIFIED CORE', cx, h - px(0.035, minDim)); }
      else if (!s.released) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('DRAG NODES APART', cx, h - px(0.035, minDim)); }
      else if (!s.impacted) { ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.3 * entrance); ctx.fillText('COLLISION IMMINENT', cx, h - px(0.035, minDim)); }

      if (p.reducedMotion && !s.impacted) {
        const coreR2 = nodeR * 0.5; const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR2);
        cg.addColorStop(0, rgba(lerpColor(s.primaryRgb, s.accentRgb, 0.5), ALPHA.content.max * 0.4 * entrance));
        cg.addColorStop(1, rgba(s.primaryRgb, 0)); ctx.fillStyle = cg;
        ctx.fillRect(cx - coreR2, cy - coreR2, coreR2 * 2, coreR2 * 2);
      }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }

      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => {
      const s = stateRef.current; if (s.completed || s.released) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width;
      const distA = Math.abs(mx - s.nodeAx); const distB = Math.abs(mx - s.nodeBx);
      s.dragging = distA < distB ? 'A' : 'B'; s.dragX = mx;
      canvas.setPointerCapture(e.pointerId); cbRef.current.onHaptic('drag_snap');
    };
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.dragging) return;
      const rect = canvas.getBoundingClientRect(); const mx = (e.clientX - rect.left) / rect.width;
      if (s.dragging === 'A') s.nodeAx = Math.max(0.05, Math.min(0.45, mx));
      else s.nodeBx = Math.max(0.55, Math.min(0.95, mx));
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.dragging && !s.released) {
        const separation = s.nodeBx - s.nodeAx;
        if (separation > 0.5) { s.released = true; cbRef.current.onHaptic('swipe_commit'); }
      }
      s.dragging = null; canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} /></div>);
}
