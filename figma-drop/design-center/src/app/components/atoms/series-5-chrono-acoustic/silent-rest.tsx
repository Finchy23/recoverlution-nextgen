/**
 * ATOM 050: THE SILENT REST ENGINE (The Pause)
 * ==============================================
 * Series 5 — Chrono-Acoustic · Position 10
 *
 * The ultimate acoustic realisation: the music is not the
 * notes — it is the space between them. The amateur fills
 * every silence. The master lets it breathe. This atom
 * trains the user to stop filling every void with noise.
 *
 * A sequence of beautiful visual "notes" plays — luminous
 * arcs that sweep across the canvas, each one a gift. Then:
 * silence. The screen holds a single resting marker. Nothing
 * happens. The urge to tap is overwhelming.
 *
 * The user must RESIST. If they tap during the rest, the
 * counter resets — no punishment, just a gentle restart.
 * They must hold absolutely still for 5 seconds of profound
 * silence. No tapping. No swiping. Just being.
 *
 * After 5 seconds of perfect stillness: the next note plays —
 * softer, more beautiful than any before it. The atom has
 * taught something no words could: the silence IS the music.
 *
 * VISUAL STATES:
 *   1. NOTE PHASE: luminous arcs play across the canvas
 *   2. REST PHASE: single pause marker, silence counter
 *   3. If user taps during rest: gentle pulse, counter resets
 *   4. After 5s stillness: final note, completion
 *
 * HAPTIC: note_play → entrance_land; tap during rest → tap (reset);
 *         5s stillness achieved → completion
 *
 * RENDER: Canvas 2D
 * REDUCED MOTION: Static arcs, no sweep animation
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo as easeOut, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

/* ── constants ──────────────────────────────────────────── */
const REST_DURATION_SEC = 5;
const REST_FRAMES = REST_DURATION_SEC * 60;
const NOTE_COUNT = 4;
const NOTE_PLAY_FRAMES = 80;
const NOTE_GAP_FRAMES = 30;
const ARC_RADIUS_FRAC = 0.2;

const BG: RGB = [4, 3, 5];
const NOTE_COLORS: RGB[] = [
  [160, 140, 110], [140, 130, 120], [150, 145, 115], [170, 155, 120],
];
const REST_MARKER: RGB = [100, 95, 85];
const REST_GLOW: RGB = [80, 75, 65];
const FINAL_NOTE: RGB = [180, 170, 135];
const RESET_PULSE: RGB = [130, 90, 80];
const LABEL: RGB = [65, 60, 55];

interface NoteArc {
  startAngle: number;
  sweep: number;
  radius: number;
  color: RGB;
  progress: number;
  alpha: number;
}

type AtomPhaseState = 'playing' | 'resting' | 'resolved';

/* ── component ──────────────────────────────────────────── */
export default function SilentRestAtom({
  breathAmplitude, reducedMotion, color, accentColor,
  viewport, phase, onHaptic, onStateChange, onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; }, [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; }, [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    phaseState: 'playing' as AtomPhaseState,
    noteIndex: 0,
    noteFrame: 0,
    arcs: [] as NoteArc[],
    restFrame: 0,
    resetPulse: 0,
    resolved: false,
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
    noteFired: false,
    finalNoteAlpha: 0,
  });

  useEffect(() => {
    const s = stateRef.current;
    s.primaryRgb = parseColor(color);
    s.accentRgb = parseColor(accentColor);
  }, [color, accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = viewport.width;
    const h = viewport.height;
    const s = stateRef.current;
    const minDim = Math.min(w, h);
    const dpr = window.devicePixelRatio || 1;

    /* ── native pointer handlers ─────────────────────────── */
    const onDown = (e: PointerEvent) => {
      const st = stateRef.current;
      if (st.phaseState === 'resting') {
        st.restFrame = 0;
        st.resetPulse = st.frameCount;
        cbRef.current.onHaptic('tap');
      }
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    /* ── render loop ─────────────────────────────────────── */
    const tick = () => {
      const p = propsRef.current;
      const cb = cbRef.current;
      const cw = Math.round(w * dpr);
      const ch = Math.round(h * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      s.frameCount++;

      if (s.entranceProgress < 1) {
        s.entranceProgress = Math.min(
          1,
          s.entranceProgress + (p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE),
        );
      }
      const ent = easeOut(s.entranceProgress);

      /* ── phase state machine ───────────────────────────── */
      if (s.phaseState === 'playing') {
        s.noteFrame++;
        const totalNoteFrames = NOTE_PLAY_FRAMES + NOTE_GAP_FRAMES;

        if (s.noteFrame === 1 && !s.noteFired) {
          s.noteFired = true;
          cb.onHaptic('entrance_land');
        }

        if (s.noteFrame <= NOTE_PLAY_FRAMES) {
          const progress = s.noteFrame / NOTE_PLAY_FRAMES;
          const noteColor = NOTE_COLORS[s.noteIndex % NOTE_COLORS.length];
          if (s.arcs.length <= s.noteIndex) {
            const startAngle = -Math.PI / 2 + s.noteIndex * (Math.PI * 2 / NOTE_COUNT) * 0.7;
            s.arcs.push({
              startAngle,
              sweep: Math.PI * (0.4 + Math.random() * 0.3),
              radius: minDim * ARC_RADIUS_FRAC * (0.8 + s.noteIndex * 0.15),
              color: noteColor,
              progress: 0,
              alpha: 0.08,
            });
          }
          s.arcs[s.noteIndex].progress = easeOut(progress);
        }

        if (s.noteFrame >= totalNoteFrames) {
          s.noteFrame = 0;
          s.noteIndex++;
          s.noteFired = false;
          if (s.noteIndex >= NOTE_COUNT) {
            s.phaseState = 'resting';
            s.restFrame = 0;
          }
        }
      } else if (s.phaseState === 'resting') {
        s.restFrame++;
        if (s.restFrame >= REST_FRAMES && !s.resolved) {
          s.resolved = true;
          s.phaseState = 'resolved';
          cb.onHaptic('completion');
          cb.onResolve?.();
        }
      } else if (s.phaseState === 'resolved') {
        s.finalNoteAlpha = Math.min(1, s.finalNoteAlpha + 0.008);
      }

      /* ── state metric ──────────────────────────────────── */
      if (s.phaseState === 'playing') {
        cb.onStateChange?.(s.noteIndex / NOTE_COUNT * 0.3);
      } else if (s.phaseState === 'resting') {
        cb.onStateChange?.(0.3 + (s.restFrame / REST_FRAMES) * 0.6);
      } else {
        cb.onStateChange?.(1);
      }

      /* ── background ────────────────────────────────────── */
      const bg = lerpColor(BG, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bg, ent * 0.03));
      bgGrad.addColorStop(0.6, rgba(bg, ent * 0.015));
      bgGrad.addColorStop(1, rgba(bg, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      /* ── note arcs ─────────────────────────────────────── */
      for (const arc of s.arcs) {
        const ac = lerpColor(lerpColor(arc.color, s.primaryRgb, 0.04), s.accentRgb, 0.06);
        const fadeInRest =
          s.phaseState === 'resting' || s.phaseState === 'resolved'
            ? Math.max(0.3, 1 - s.restFrame * 0.003)
            : 1;
        const aAlpha = arc.alpha * arc.progress * ent * fadeInRest;
        if (aAlpha < 0.002) continue;

        const endAngle = arc.startAngle + arc.sweep * arc.progress;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, arc.radius, arc.startAngle, endAngle);
        ctx.strokeStyle = rgba(ac, aAlpha);
        ctx.lineWidth = minDim * 0.0024;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.strokeStyle = rgba(ac, aAlpha * 0.15);
        ctx.lineWidth = minDim * 0.01;
        ctx.stroke();
      }

      /* ── rest phase visuals ────────────────────────────── */
      if (s.phaseState === 'resting' || s.phaseState === 'resolved') {
        const restProgress = Math.min(1, s.restFrame / REST_FRAMES);
        const restCol = lerpColor(REST_MARKER, s.primaryRgb, 0.05);
        const markerW = minDim * 0.04;
        const markerAlpha = 0.08 * ent;

        const breathMod = p.reducedMotion ? 0 : p.breathAmplitude * 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 - markerW / 2, h / 2 + breathMod);
        ctx.lineTo(w / 2 + markerW / 2, h / 2 + breathMod);
        ctx.strokeStyle = rgba(restCol, markerAlpha);
        ctx.lineWidth = minDim * 0.003;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (restProgress > 0.1) {
          const rGlowR = minDim * 0.05 + restProgress * minDim * 0.15;
          const rGlowCol = lerpColor(REST_GLOW, s.accentRgb, 0.06);
          const rGlowAlpha = restProgress * 0.02 * ent;
          const rg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, rGlowR);
          rg.addColorStop(0, rgba(rGlowCol, rGlowAlpha));
          rg.addColorStop(0.5, rgba(rGlowCol, rGlowAlpha * 0.3));
          rg.addColorStop(1, rgba(rGlowCol, 0));
          ctx.fillStyle = rg;
          ctx.fillRect(0, 0, w, h);
        }

        if (!s.resolved) {
          const progArcR = minDim * 0.12;
          const progEndAngle = -Math.PI / 2 + restProgress * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, progArcR, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(restCol, 0.012 * ent);
          ctx.lineWidth = minDim * 0.0008;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, progArcR, -Math.PI / 2, progEndAngle);
          ctx.strokeStyle = rgba(lerpColor(restCol, s.accentRgb, 0.06), 0.04 * ent);
          ctx.lineWidth = minDim * 0.0016;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        if (s.resetPulse > 0) {
          const elapsed = s.frameCount - s.resetPulse;
          if (elapsed < 60) {
            const t = elapsed / 60;
            const pulseR = minDim * 0.02 + t * minDim * 0.15;
            const pulseAlpha = (1 - t) * (1 - t) * 0.04 * ent;
            const pulseCol = lerpColor(RESET_PULSE, s.primaryRgb, 0.06);
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = rgba(pulseCol, pulseAlpha);
            ctx.lineWidth = minDim * 0.0008;
            ctx.stroke();
          }
        }
      }

      /* ── final note (post-resolution) ──────────────────── */
      if (s.phaseState === 'resolved' && s.finalNoteAlpha > 0) {
        const fnc = lerpColor(FINAL_NOTE, s.accentRgb, 0.08);
        const fAlpha = s.finalNoteAlpha * 0.1 * ent;
        const fR = minDim * ARC_RADIUS_FRAC * 1.5;
        const fSweep = Math.PI * 0.6;
        const fStart = -Math.PI / 2 - fSweep / 2;
        const fProgress = easeOut(s.finalNoteAlpha);

        ctx.beginPath();
        ctx.arc(w / 2, h / 2, fR, fStart, fStart + fSweep * fProgress);
        ctx.strokeStyle = rgba(fnc, fAlpha);
        ctx.lineWidth = minDim * 0.0016;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.strokeStyle = rgba(fnc, fAlpha * 0.2);
        ctx.lineWidth = minDim * 0.0008;
        ctx.stroke();
      }

      /* ── labels ────────────────────────────────────────── */
      const lbl = lerpColor(LABEL, s.primaryRgb, 0.04);
      const fs = Math.round(minDim * 0.014);
      ctx.font = `300 ${fs}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (s.phaseState === 'resting' && !s.resolved) {
        const secLeft = Math.ceil((REST_FRAMES - s.restFrame) / 60);
        if (secLeft > 0 && secLeft <= REST_DURATION_SEC) {
          ctx.fillStyle = rgba(lbl, 0.02 * ent);
          ctx.fillText('rest', w / 2, h / 2 + minDim * 0.22);
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', cursor: 'default' }}
      />
    </div>
  );
}
