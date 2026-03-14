/**
 * JOURNAL PAGE — The Breathing Blank Space
 *
 * When a prompt is selected, the glass opens a luminous void.
 * Not a text box. Not a form field. A breathing, empty page
 * waiting to be filled.
 *
 * The prompt hovers above like a gentle question.
 * Below it: emptiness. The cursor blinks in the dark.
 * The user types. The glass breathes with them.
 *
 * When they're done, the seal mechanic appears:
 * press and hold the luminous node to seal the entry.
 * The text physically sinks into the glass. Absorbed.
 * Gone. Part of the constellation now.
 *
 * Canvas 2D: breathing page border + seal node.
 * Text input: styled HTML textarea (crisp typography).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TalkPrompt } from './talk-types';
import { hapticPressure, hapticResolve, hapticBreathPulse, hapticTick } from '../surfaces/haptics';

import { room, font, tracking, typeSize, leading, weight, opacity, timing, glow, glaze, layer } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const HOLD_DURATION = 2500; // 2.5 seconds to seal

interface JournalPageProps {
  prompt: TalkPrompt;
  color: string;
  breath: number;
  visible: boolean;
  onSeal: (text: string) => void;
}

export function JournalPage({
  prompt,
  color,
  breath,
  visible,
  onSeal,
}: JournalPageProps) {
  const [text, setText] = useState('');
  const [sealProgress, setSealProgress] = useState(0);
  const [sealed, setSealed] = useState(false);
  const [sinkingText, setSinkingText] = useState(false);
  const holdingRef = useRef(false);
  const holdStartRef = useRef(0);
  const sealProgressRef = useRef(0);
  const rafRef = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Focus textarea on mount
  useEffect(() => {
    if (visible) {
      setText('');
      setSealed(false);
      setSealProgress(0);
      setSinkingText(false);
      sealProgressRef.current = 0;
      setTimeout(() => textareaRef.current?.focus(), 500);
    }
  }, [visible, prompt.id]);

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  // Canvas: breathing page edge + seal node
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const el = canvas.parentElement;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;

    const dpr = window.devicePixelRatio || 1;
    const cw = Math.round(w * dpr);
    const ch = Math.round(h * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const t = Date.now() * 0.001;
    const [r, g, b] = parseHex(color);
    const breathPhase = Math.sin(breath * Math.PI * 2);
    const p = sealProgressRef.current;

    // ── Page edge — faint luminous border that breathes ──
    if (text.length > 0 && !sealed) {
      const edgeAlpha = 0.015 + breathPhase * 0.005;
      const margin = w * 0.08;

      // Left edge
      const leftGrad = ctx.createLinearGradient(margin, 0, margin + 20, 0);
      leftGrad.addColorStop(0, `rgba(${r},${g},${b},${edgeAlpha.toFixed(4)})`);
      leftGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = leftGrad;
      ctx.fillRect(margin, h * 0.15, 20, h * 0.55);

      // Right edge
      const rightGrad = ctx.createLinearGradient(w - margin, 0, w - margin - 20, 0);
      rightGrad.addColorStop(0, `rgba(${r},${g},${b},${edgeAlpha.toFixed(4)})`);
      rightGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = rightGrad;
      ctx.fillRect(w - margin - 20, h * 0.15, 20, h * 0.55);
    }

    // ── Seal node (appears when text exists) ──
    // THE emotional center of the corridor.
    // This is not a button. It is the moment truth is committed.
    if (text.length > 0 && !sealed) {
      const sealY = h * 0.76;
      const cx = w / 2;

      // Outer atmospheric field — grows with progress
      const fieldRadius = 40 + p * 60 + breathPhase * 5;
      const fieldGrad = ctx.createRadialGradient(cx, sealY, 0, cx, sealY, fieldRadius);
      fieldGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.03 + p * 0.06).toFixed(4)})`);
      fieldGrad.addColorStop(0.4, `rgba(${r},${g},${b},${(0.015 + p * 0.03).toFixed(4)})`);
      fieldGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = fieldGrad;
      ctx.beginPath();
      ctx.arc(cx, sealY, fieldRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner glow — brighter, tighter
      const sealSize = 6 + p * 6 + breathPhase * 1.5;
      const innerGlow = 20 + p * 30;
      const sGrad = ctx.createRadialGradient(cx, sealY, 0, cx, sealY, innerGlow);
      sGrad.addColorStop(0, `rgba(${r},${g},${b},${(0.08 + p * 0.18).toFixed(4)})`);
      sGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(cx, sealY, innerGlow, 0, Math.PI * 2);
      ctx.fill();

      // Seal core — the luminous point
      ctx.beginPath();
      ctx.arc(cx, sealY, sealSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${(0.2 + p * 0.4).toFixed(3)})`;
      ctx.fill();

      // White hot center when pressing
      if (p > 0.3) {
        ctx.beginPath();
        ctx.arc(cx, sealY, sealSize * 0.4, 0, Math.PI * 2);
        const hotAlpha = (p - 0.3) * 0.5;
        const br = Math.min(255, r + 80);
        const bg = Math.min(255, g + 80);
        const bb = Math.min(255, b + 80);
        ctx.fillStyle = `rgba(${br},${bg},${bb},${hotAlpha.toFixed(3)})`;
        ctx.fill();
      }

      // Progress ring — prominent, visible from afar
      if (p > 0) {
        const ringRadius = 22 + p * 4;
        ctx.beginPath();
        ctx.arc(cx, sealY, ringRadius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
        ctx.strokeStyle = `rgba(${r},${g},${b},${(0.15 + p * 0.3).toFixed(3)})`;
        ctx.lineWidth = 1.2 + p * 0.8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Background track ring
        ctx.beginPath();
        ctx.arc(cx, sealY, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // ── Seal bloom — the completion ripple ──
    if (sealed) {
      const sealY = h * 0.76;
      const cx = w / 2;
      const elapsed = Date.now() - holdStartRef.current - HOLD_DURATION;
      const bloomT = Math.min(1, Math.max(0, elapsed / 1200));

      // Expanding ring
      const bloomRadius = 30 + bloomT * 80;
      const bloomAlpha = 0.15 * (1 - bloomT);
      if (bloomAlpha > 0.001) {
        ctx.beginPath();
        ctx.arc(cx, sealY, bloomRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${bloomAlpha.toFixed(4)})`;
        ctx.lineWidth = 1 - bloomT * 0.8;
        ctx.stroke();
      }

      // Fading core
      const coreAlpha = 0.5 * (1 - bloomT);
      if (coreAlpha > 0.001) {
        ctx.beginPath();
        ctx.arc(cx, sealY, 4 * (1 - bloomT * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${coreAlpha.toFixed(3)})`;
        ctx.fill();
      }
    }

    // ── Hold physics ──
    if (holdingRef.current && !sealed) {
      const elapsed = Date.now() - holdStartRef.current;
      const newProgress = Math.min(1, elapsed / HOLD_DURATION);
      sealProgressRef.current = newProgress;
      setSealProgress(newProgress);

      if (elapsed % 200 < 17) {
        hapticPressure(newProgress * 0.6);
      }

      if (newProgress >= 1) {
        holdingRef.current = false;
        setSealed(true);
        setSinkingText(true);
        hapticResolve();

        setTimeout(() => {
          onSeal(text);
        }, 1500);
        return;
      }
    } else if (!holdingRef.current && sealProgressRef.current > 0 && !sealed) {
      sealProgressRef.current = Math.max(0, sealProgressRef.current - 0.03);
      setSealProgress(sealProgressRef.current);
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [visible, color, breath, text, sealed, onSeal]);

  useEffect(() => {
    if (!visible) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, render]);

  const handleSealDown = useCallback(() => {
    if (text.length === 0 || sealed) return;
    holdingRef.current = true;
    holdStartRef.current = Date.now();
    hapticBreathPulse();
  }, [text, sealed]);

  const handleSealUp = useCallback(() => {
    holdingRef.current = false;
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0">
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: layer.base }}
      />

      {/* Prompt question — hovers above the page */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: '10%', left: '12%', right: '12%', textAlign: 'center', zIndex: layer.content }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: sinkingText ? 0 : 0.35, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(13px, 3.2vw, 17px)',
          fontWeight: weight.light,
          fontStyle: 'italic',
          color: room.fg,
          margin: 0,
          lineHeight: leading.open,
        }}>
          {prompt.text}
        </p>
      </motion.div>

      {/* Text input — the breathing blank space */}
      <motion.div
        className="absolute"
        style={{
          top: '22%',
          bottom: '25%',
          left: '10%',
          right: '10%',
          zIndex: layer.content,
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: sinkingText ? 0 : 1,
          scale: sinkingText ? 0.95 : 1,
          y: sinkingText ? 30 : 0,
        }}
        transition={{
          duration: sinkingText ? 1.5 : 1,
          ease: [0.16, 1, 0.3, 1],
          delay: sinkingText ? 0 : 0.3,
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            if (!sealed) {
              setText(e.target.value);
              if (e.target.value.length === 1) hapticTick();
            }
          }}
          disabled={sealed}
          placeholder="..."
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: SERIF,
            fontSize: 'clamp(15px, 3.8vw, 20px)',
            fontWeight: weight.light,
            lineHeight: leading.body,
            letterSpacing: tracking.body,
            color: glaze.bright,
            caretColor: color,
            padding: '0',
            overflow: 'auto',
            scrollbarWidth: 'none',
          }}
        />
      </motion.div>

      {/* Seal instruction */}
      <AnimatePresence>
        {text.length > 0 && !sealed && (
          <motion.div
            className="absolute"
            style={{
              bottom: '16%',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Seal touch target */}
            <div
              style={{
                display: 'inline-block',
                padding: '20px 40px',
                cursor: 'pointer',
                touchAction: 'none',
              }}
              onPointerDown={handleSealDown}
              onPointerUp={handleSealUp}
              onPointerCancel={handleSealUp}
            >
              <span style={{
                fontFamily: SANS,
                fontSize: typeSize.micro,
                fontWeight: weight.medium,
                letterSpacing: tracking.lift,
                textTransform: 'uppercase',
                color,
                opacity: sealProgress > 0 ? 0.04 : 0.1,
                transition: timing.t.fadeModerate,
              }}>
                HOLD TO SEAL
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sealed confirmation */}
      <AnimatePresence>
        {sealed && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: layer.overlay }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.5 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  background: color,
                  boxShadow: glow.mid(color),
                }}
              />
              <span style={{
                fontFamily: SERIF,
                fontSize: typeSize.note,
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: room.fg,
                opacity: opacity.present,
                transition: timing.t.fadeModerate,
              }}>
                Sealed.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}