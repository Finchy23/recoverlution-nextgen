/**
 * ATOM 038: THE FORMAT/RESET ENGINE (The Factory Wipe)
 * =====================================================
 * Series 4 — Via Negativa · Position 8
 *
 * The user does not need to psychoanalyze every bad day or
 * rumination loop. Sometimes they just need to format the
 * hard drive and restart. This atom is the courage to wipe.
 *
 * A glowing reset button pulses at the center of the viewport —
 * warm, alive, patiently waiting. The user holds it. A progress
 * ring fills over 3 terrifying seconds. The screen trembles as
 * the ring approaches completion. At 100%: a massive white
 * flashbang erupts from center to edges in 6 frames — pure
 * blinding light that wipes the entire visual field clean.
 *
 * Then: darkness. Pure void. For two full seconds, nothing.
 * Then: a faint cursor blinks. Once. Twice. Then a single
 * word fades in: "Ready." The system has rebooted. The old
 * data is gone. The disk is clean. You are free.
 *
 * PHYSICS:
 *   - Progress ring: arc from 0 to 2π over 180 frames
 *   - Tremor: screen-shake amplitude increases with progress
 *   - Flashbang: white rect alpha 0→1 in 4 frames, hold 6 frames
 *   - Void: 120 frames of absolute black
 *   - Reboot: cursor blink → "Ready." emergence
 *   - The courage is in the 3-second hold. That's the therapy.
 *
 * HAPTIC JOURNEY:
 *   Hold → hold_start (commitment)
 *   50% → step_advance (trembling intensifies)
 *   100% → seal_stamp (massive implosion flash)
 *   Reboot → entrance_land (gentle return to life)
 *
 * RENDER: Canvas 2D (requestAnimationFrame)
 * REDUCED MOTION: No tremor, gentler flash, faster sequence
 */

import { useRef, useEffect } from 'react';
import type { AtomProps } from '../types';
import { parseColor, lerpColor, rgba, easeOutExpo, type RGB } from '../atom-utils';
import { ENTRANCE_RATE_ENTER, ENTRANCE_RATE_ACTIVE } from '../atom-utils';

// =====================================================================
// CONSTANTS
// =====================================================================

/** Frames to fill the progress ring (3 seconds) */
const FILL_FRAMES = 180;
/** Flash duration (frames) */
const FLASH_ATTACK = 4;
const FLASH_HOLD = 6;
const FLASH_DECAY = 20;
/** Void duration after flash */
const VOID_FRAMES = 120;
/** Cursor blink rate (frames) */
const CURSOR_BLINK_RATE = 40;
/** "Ready." fade-in duration */
const READY_FADE = 120;
/** Button radius as fraction of minDim */
const BUTTON_RADIUS_FRAC = 0.06;
/** Progress ring radius */
const RING_RADIUS_FRAC = 0.09;
/** Ring width as fraction of minDim */
const RING_WIDTH_FRAC = 0.004;

// State machine
type ResetPhase = 'idle' | 'charging' | 'flash' | 'void' | 'reboot' | 'done';

// =====================================================================
// COLOR
// =====================================================================

// Palette
const BG_DARK: RGB = [6, 6, 7];
const BUTTON_CORE: RGB = [140, 120, 105];
const BUTTON_GLOW: RGB = [170, 145, 120];
const RING_TRACK: RGB = [40, 38, 36];
const RING_FILL: RGB = [180, 155, 130];
const FLASH_WHITE: RGB = [255, 252, 248];
const CURSOR_COLOR: RGB = [100, 95, 90];
const READY_COLOR: RGB = [120, 110, 100];

// =====================================================================
// COMPONENT
// =====================================================================

export default function FormatResetAtom({
  breathAmplitude,
  reducedMotion,
  color,
  accentColor,
  viewport,
  phase,
  onHaptic,
  onStateChange,
  onResolve,
}: AtomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onHaptic, onStateChange, onResolve });
  const propsRef = useRef({ breathAmplitude, reducedMotion, phase, color, accentColor });

  useEffect(() => { cbRef.current = { onHaptic, onStateChange, onResolve }; },
    [onHaptic, onStateChange, onResolve]);
  useEffect(() => { propsRef.current = { breathAmplitude, reducedMotion, phase, color, accentColor }; },
    [breathAmplitude, reducedMotion, phase, color, accentColor]);

  const stateRef = useRef({
    resetPhase: 'idle' as ResetPhase,
    chargeProgress: 0,    // 0–1
    isHolding: false,
    halfFired: false,
    // Flash/void/reboot timing
    phaseFrameCount: 0,
    flashAlpha: 0,
    cursorVisible: true,
    cursorBlinkCount: 0,
    readyAlpha: 0,
    // Animation
    entranceProgress: 0,
    frameCount: 0,
    primaryRgb: parseColor(color),
    accentRgb: parseColor(accentColor),
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
    const cx = w / 2;
    const cy = h / 2;
    const btnR = minDim * BUTTON_RADIUS_FRAC;
    const ringR = minDim * RING_RADIUS_FRAC;

    // ── Native pointer handlers ─────────────────────────
    const onDown = (e: PointerEvent) => {
      const s = stateRef.current;
      if (s.resetPhase !== 'idle') return;
      s.isHolding = true;
      s.resetPhase = 'charging';
      s.chargeProgress = 0;
      s.halfFired = false;
      cbRef.current.onHaptic('hold_start');
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      const s = stateRef.current;
      s.isHolding = false;
      if (s.resetPhase === 'charging') {
        s.resetPhase = 'idle';
        s.chargeProgress = 0;
      }
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const render = () => {
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

      // ── Entrance ──────────────────────────────────────
      if (s.entranceProgress < 1) {
        const rate = p.phase === 'enter' ? ENTRANCE_RATE_ENTER : ENTRANCE_RATE_ACTIVE;
        s.entranceProgress = Math.min(1, s.entranceProgress + rate);
      }
      const entrance = easeOutExpo(s.entranceProgress);

      // ── State machine ─────────────────────────────────
      if (s.resetPhase === 'charging' && s.isHolding) {
        s.chargeProgress = Math.min(1, s.chargeProgress + 1 / FILL_FRAMES);

        if (s.chargeProgress >= 0.5 && !s.halfFired) {
          s.halfFired = true;
          cb.onHaptic('step_advance');
        }

        if (s.chargeProgress >= 1) {
          s.resetPhase = 'flash';
          s.phaseFrameCount = 0;
          s.flashAlpha = 0;
          cb.onHaptic('seal_stamp');
          cb.onResolve?.();
        }
      }

      if (s.resetPhase === 'flash') {
        s.phaseFrameCount++;
        if (s.phaseFrameCount <= FLASH_ATTACK) {
          s.flashAlpha = s.phaseFrameCount / FLASH_ATTACK;
        } else if (s.phaseFrameCount <= FLASH_ATTACK + FLASH_HOLD) {
          s.flashAlpha = 1;
        } else if (s.phaseFrameCount <= FLASH_ATTACK + FLASH_HOLD + FLASH_DECAY) {
          const decayT = (s.phaseFrameCount - FLASH_ATTACK - FLASH_HOLD) / FLASH_DECAY;
          s.flashAlpha = 1 - decayT;
        } else {
          s.resetPhase = 'void';
          s.phaseFrameCount = 0;
          s.flashAlpha = 0;
        }
      }

      if (s.resetPhase === 'void') {
        s.phaseFrameCount++;
        if (s.phaseFrameCount >= VOID_FRAMES) {
          s.resetPhase = 'reboot';
          s.phaseFrameCount = 0;
          s.cursorBlinkCount = 0;
          s.readyAlpha = 0;
          cb.onHaptic('entrance_land');
        }
      }

      if (s.resetPhase === 'reboot') {
        s.phaseFrameCount++;
        // Cursor blink for first 3 cycles, then "Ready." fades in
        if (s.phaseFrameCount % CURSOR_BLINK_RATE === 0) {
          s.cursorVisible = !s.cursorVisible;
          s.cursorBlinkCount++;
        }
        if (s.cursorBlinkCount >= 4) {
          s.readyAlpha = Math.min(0.1, s.readyAlpha + 0.1 / READY_FADE);
          if (s.readyAlpha >= 0.095) {
            s.resetPhase = 'done';
          }
        }
      }

      // Report state
      const stateVal = s.resetPhase === 'idle' ? 0 :
        s.resetPhase === 'charging' ? s.chargeProgress * 0.5 :
        s.resetPhase === 'flash' ? 0.6 :
        s.resetPhase === 'void' ? 0.7 :
        s.resetPhase === 'reboot' ? 0.85 : 1;
      cb.onStateChange?.(stateVal);

      // ══════════════════════════════════════════════════
      // BACKGROUND
      // ══════════════════════════════════════════════════

      const bgColor = lerpColor(BG_DARK, s.primaryRgb, 0.005);
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, minDim * 0.45);
      bgGrad.addColorStop(0, rgba(bgColor, entrance * 0.03));
      bgGrad.addColorStop(0.6, rgba(bgColor, entrance * 0.015));
      bgGrad.addColorStop(1, rgba(bgColor, 0));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // ── Tremor (during charging) ──────────────────────
      let shakeX = 0;
      let shakeY = 0;
      if (s.resetPhase === 'charging' && !p.reducedMotion) {
        const tremor = s.chargeProgress * s.chargeProgress * minDim * 0.006;
        shakeX = (Math.random() - 0.5) * tremor;
        shakeY = (Math.random() - 0.5) * tremor;
        ctx.translate(shakeX, shakeY);
      }

      // ══════════════════════════════════════════════════
      // IDLE / CHARGING: Button + Ring
      // ══════════════════════════════════════════════════

      if (s.resetPhase === 'idle' || s.resetPhase === 'charging') {
        // Button glow
        const pulseT = p.reducedMotion ? 0.7 : 0.5 + 0.5 * Math.sin(s.frameCount * 0.02);
        const glowR = btnR * (2.5 + s.chargeProgress);
        const glowColor = lerpColor(BUTTON_GLOW, s.accentRgb, 0.08);
        const glowAlpha = (0.02 + s.chargeProgress * 0.02) * pulseT * entrance;
        const glowGrad = ctx.createRadialGradient(cx, cy, btnR * 0.3, cx, cy, glowR);
        glowGrad.addColorStop(0, rgba(glowColor, glowAlpha));
        glowGrad.addColorStop(0.4, rgba(glowColor, glowAlpha * 0.3));
        glowGrad.addColorStop(1, rgba(glowColor, 0));
        ctx.fillStyle = glowGrad;
        ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

        // Progress ring track
        const trackColor = lerpColor(RING_TRACK, s.primaryRgb, 0.04);
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(trackColor, 0.04 * entrance);
        ctx.lineWidth = minDim * RING_WIDTH_FRAC;
        ctx.stroke();

        // Progress ring fill
        if (s.chargeProgress > 0) {
          const fillAngle = s.chargeProgress * Math.PI * 2;
          const fillColor = lerpColor(RING_FILL, s.accentRgb, 0.1);
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + fillAngle);
          ctx.strokeStyle = rgba(fillColor, (0.1 + s.chargeProgress * 0.15) * entrance);
          ctx.lineWidth = minDim * RING_WIDTH_FRAC;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Button body
        const btnGrad = ctx.createRadialGradient(
          cx - btnR * 0.15, cy - btnR * 0.15, btnR * 0.05,
          cx, cy, btnR,
        );
        const btnCoreColor = lerpColor(BUTTON_CORE, s.accentRgb, 0.06);
        const intensify = 1 + s.chargeProgress * 0.5;
        btnGrad.addColorStop(0, rgba(btnCoreColor, 0.12 * entrance * intensify));
        btnGrad.addColorStop(0.6, rgba(btnCoreColor, 0.06 * entrance * intensify));
        btnGrad.addColorStop(1, rgba(btnCoreColor, 0.01 * entrance));

        ctx.beginPath();
        ctx.arc(cx, cy, btnR, 0, Math.PI * 2);
        ctx.fillStyle = btnGrad;
        ctx.fill();

        // Button edge
        ctx.strokeStyle = rgba(lerpColor(BUTTON_CORE, s.primaryRgb, 0.08), 0.06 * entrance * intensify);
        ctx.lineWidth = minDim * 0.002;
        ctx.stroke();

        // Power symbol (⏻ simplified)
        const symSize = btnR * 0.35;
        const symColor = lerpColor(BUTTON_CORE, s.accentRgb, 0.05);
        const symAlpha = (0.1 + s.chargeProgress * 0.1) * entrance;
        ctx.strokeStyle = rgba(symColor, symAlpha);
        ctx.lineWidth = minDim * 0.002;
        ctx.lineCap = 'round';
        // Arc (bottom 270°)
        ctx.beginPath();
        ctx.arc(cx, cy, symSize, -Math.PI * 0.35, Math.PI + Math.PI * 0.35);
        ctx.stroke();
        // Vertical line (top)
        ctx.beginPath();
        ctx.moveTo(cx, cy - symSize * 1.1);
        ctx.lineTo(cx, cy - symSize * 0.2);
        ctx.stroke();
      }

      // ══════════════════════════════════════════════════
      // FLASH
      // ══════════════════════════════════════════════════

      if (s.resetPhase === 'flash' && s.flashAlpha > 0) {
        const flashColor = lerpColor(FLASH_WHITE, s.primaryRgb, 0.02);
        const flashA = p.reducedMotion ? s.flashAlpha * 0.6 : s.flashAlpha;
        ctx.fillStyle = rgba(flashColor, flashA);
        ctx.fillRect(-10, -10, w + 20, h + 20);
      }

      // ══════════════════════════════════════════════════
      // VOID — nothing. Absolutely nothing. That IS the state.
      // ══════════════════════════════════════════════════

      // (Background already drawn — pure dark. Nothing else renders.)

      // ══════════════════════════════════════════════════
      // REBOOT / DONE
      // ══════════════════════════════════════════════════

      if (s.resetPhase === 'reboot' || s.resetPhase === 'done') {
        // Cursor blink
        if (s.cursorBlinkCount < 4 && s.cursorVisible) {
          const cursorH = minDim * 0.018;
          const cursorW = minDim * 0.002;
          const cursorX = cx;
          const cursorY = cy;
          const curColor = lerpColor(CURSOR_COLOR, s.primaryRgb, 0.06);
          ctx.fillStyle = rgba(curColor, 0.08 * entrance);
          ctx.fillRect(cursorX, cursorY - cursorH / 2, cursorW, cursorH);
        }

        // "Ready." text
        if (s.readyAlpha > 0) {
          const readyColor = lerpColor(READY_COLOR, s.accentRgb, 0.08);
          const fontSize = Math.round(minDim * 0.028);
          ctx.font = `300 ${fontSize}px Georgia, "Times New Roman", serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = rgba(readyColor, s.readyAlpha * entrance);
          ctx.fillText('Ready.', cx, cy);
        }
      }

      // Undo tremor translation
      if (shakeX !== 0 || shakeY !== 0) {
        ctx.translate(-shakeX, -shakeY);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    };
  }, [viewport.width, viewport.height]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'default',
        }}
      />
    </div>
  );
}