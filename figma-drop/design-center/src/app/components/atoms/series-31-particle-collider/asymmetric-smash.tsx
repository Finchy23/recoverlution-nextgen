/**
 * ATOM 304: THE ASYMMETRIC SMASH ENGINE · S31 · Position 4
 * Tiny dense dot shatters massive block — David vs Goliath.
 * INTERACTION: Flick dot upward → shatters block
 * RENDER: Canvas 2D · REDUCED MOTION: Static shattered
 */
import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, setupCanvas, advanceEntrance, drawAtmosphere, ALPHA, px, SIZE, GLOW, STROKE, FONT_SIZE, motionScale, type RGB } from '../atom-utils';

const BLOCK_W = 0.6; const BLOCK_H = 0.35; const DOT_SIZE = 0.012;
const FLICK_THRESHOLD = -5; const SHARD_COUNT = 20; const RESPAWN_DELAY = 100;

interface BlockShard { x: number; y: number; vx: number; vy: number; w: number; h: number; rot: number; rv: number; life: number; }

interface SmashState { entranceProgress: number; frameCount: number; primaryRgb: RGB; accentRgb: RGB;
  dotY: number; dotVy: number; fired: boolean; shattered: boolean; shards: BlockShard[];
  shatterAnim: number; completed: boolean; respawnTimer: number; }

function freshState(c: string, a: string): SmashState {
  return { entranceProgress: 0, frameCount: 0, primaryRgb: parseColor(c), accentRgb: parseColor(a),
    dotY: 0.85, dotVy: 0, fired: false, shattered: false, shards: [],
    shatterAnim: 0, completed: false, respawnTimer: 0 }; }

export default function AsymmetricSmashAtom({ breathAmplitude, reducedMotion, color, accentColor, viewport, phase, composed, onHaptic, onStateChange }: AtomProps) {
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
    let animId: number; let lastPointerY = 0; let pointerDown = false;

    const render = () => {
      const s = stateRef.current; const p = propsRef.current; const cb = cbRef.current;
      const { w, h, cx, cy, minDim } = setupCanvas(canvas, ctx, viewport.width, viewport.height);
      s.frameCount++; const { progress, entrance } = advanceEntrance(s.entranceProgress, p.phase);
      s.entranceProgress = progress; const ms = motionScale(p.reducedMotion);

      if (!p.composed) drawAtmosphere(ctx, cx, cy, w, h, minDim, s.primaryRgb, entrance, GLOW.md);

      if (!p.reducedMotion && !s.completed) {
        if (s.fired && !s.shattered) {
          s.dotY += s.dotVy * 0.016; s.dotVy -= 0.5;
          const blockBottom = 0.15 + BLOCK_H;
          if (s.dotY <= blockBottom) {
            s.shattered = true; cb.onHaptic('completion');
            for (let i = 0; i < SHARD_COUNT; i++) {
              const angle = Math.random() * Math.PI * 2; const speed = 1 + Math.random() * 3;
              s.shards.push({ x: cx / w, y: blockBottom - 0.05, vx: Math.cos(angle) * speed * 0.003,
                vy: Math.sin(angle) * speed * 0.003 - 0.002,
                w: 0.02 + Math.random() * 0.05, h: 0.02 + Math.random() * 0.04,
                rot: Math.random() * Math.PI, rv: (Math.random() - 0.5) * 0.1, life: 80 + Math.random() * 40 });
            }
          }
        }
        if (s.shattered) {
          s.shatterAnim = Math.min(1, s.shatterAnim + 0.01);
          for (const sh of s.shards) { sh.x += sh.vx; sh.y += sh.vy; sh.vy += 0.0001; sh.rot += sh.rv; sh.life--; }
          s.shards = s.shards.filter(sh => sh.life > 0);
          cb.onStateChange?.(s.shatterAnim);
          if (s.shatterAnim >= 1) { s.completed = true; cb.onStateChange?.(1); s.respawnTimer = RESPAWN_DELAY; }
        }
      }

      const blockX = (0.5 - BLOCK_W / 2) * w; const blockY = 0.15 * h;
      const bw = BLOCK_W * w; const bh = BLOCK_H * h;

      // Massive block
      if (!s.shattered) {
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.content.max * 0.2 * entrance);
        ctx.fillRect(blockX, blockY, bw, bh);
        ctx.strokeStyle = rgba(s.accentRgb, ALPHA.content.max * 0.3 * entrance);
        ctx.lineWidth = px(STROKE.bold, minDim); ctx.strokeRect(blockX, blockY, bw, bh);
        const bFont = Math.max(10, px(FONT_SIZE.lg, minDim)); ctx.font = `${bFont}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = rgba(s.accentRgb, ALPHA.text.max * 0.3 * entrance);
        ctx.fillText('IMPOSSIBLE', cx, blockY + bh / 2); ctx.textBaseline = 'alphabetic';
      }

      // Shards
      for (const sh of s.shards) {
        ctx.save(); ctx.translate(sh.x * w, sh.y * h); ctx.rotate(sh.rot);
        ctx.fillStyle = rgba(s.accentRgb, (sh.life / 120) * ALPHA.content.max * 0.3 * entrance);
        ctx.fillRect(-sh.w * w / 2, -sh.h * h / 2, sh.w * w, sh.h * h); ctx.restore();
      }

      // Dot (dense bullet)
      if (!s.shattered) {
        const dotR = px(DOT_SIZE, minDim); const dx = cx; const dy = s.dotY * h;
        const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, dotR * 3);
        dg.addColorStop(0, rgba(s.primaryRgb, ALPHA.glow.max * 0.4 * entrance));
        dg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = dg; ctx.fillRect(dx - dotR * 3, dy - dotR * 3, dotR * 6, dotR * 6);
        ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
        ctx.fillStyle = rgba(s.primaryRgb, ALPHA.content.max * 0.8 * entrance); ctx.fill();
      }

      // Impact light
      if (s.shattered && s.shatterAnim < 0.5) {
        const flashR = minDim * 0.3 * s.shatterAnim * 2;
        const fg = ctx.createRadialGradient(cx, blockY + bh, 0, cx, blockY + bh, flashR);
        fg.addColorStop(0, rgba(s.primaryRgb, (1 - s.shatterAnim * 2) * ALPHA.glow.max * 0.4 * entrance));
        fg.addColorStop(1, rgba(s.primaryRgb, 0));
        ctx.fillStyle = fg; ctx.fillRect(cx - flashR, blockY + bh - flashR, flashR * 2, flashR * 2);
      }

      const fontSize = Math.max(8, px(FONT_SIZE.sm, minDim)); ctx.font = `${fontSize}px monospace`; ctx.textAlign = 'center';
      if (s.completed) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.5 * entrance); ctx.fillText('SHATTERED', cx, h - px(0.035, minDim)); }
      else if (!s.fired) { ctx.fillStyle = rgba(s.primaryRgb, ALPHA.text.max * 0.2 * entrance); ctx.fillText('FLICK UP TO FIRE', cx, h - px(0.035, minDim)); }

      if (s.completed && p.phase !== 'resolve') { s.respawnTimer--; if (s.respawnTimer <= 0) { Object.assign(s, freshState(color, accentColor)); s.entranceProgress = 1; } }
      ctx.restore(); animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    const onDown = (e: PointerEvent) => { pointerDown = true; lastPointerY = e.clientY; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { if (!pointerDown) return; lastPointerY = e.clientY; };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current; if (!s.fired && !s.completed) {
        const vy = lastPointerY - e.clientY;
        if (vy > Math.abs(FLICK_THRESHOLD)) { s.fired = true; s.dotVy = -vy * 0.5; cbRef.current.onHaptic('swipe_commit'); }
      }
      pointerDown = false; canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown); canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp); canvas.addEventListener('pointercancel', onUp);
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp); };
  }, [viewport.width, viewport.height]);

  return (<div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}><canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }} /></div>);
}
