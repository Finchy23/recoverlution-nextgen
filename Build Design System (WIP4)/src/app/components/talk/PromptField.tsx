/**
 * PROMPT FIELD — The Luminous Doorways
 *
 * 2-3 prompt nodes float in the dark glass like stars.
 * Each is a question. An invitation. A path.
 *
 * They drift gently — alive, not static.
 * When the user taps one, it brightens and expands.
 * The others fade and dissolve. The page opens.
 *
 * Canvas 2D: floating prompt nodes with soft glow and drift.
 * Text rendered in HTML overlay for crisp typography.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { TalkPrompt } from './talk-types';
import { LANES } from './talk-types';
import { hapticTick, hapticBreathPulse } from '../surfaces/haptics';

import { room, font, tracking, typeSize, leading, weight } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface PromptFieldProps {
  prompts: TalkPrompt[];
  color: string;
  breath: number;
  onSelect: (prompt: TalkPrompt) => void;
  visible: boolean;
}

export function PromptField({
  prompts,
  color,
  breath,
  onSelect,
  visible,
}: PromptFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });

  // Track viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setViewport({ width, height });
    });
    ro.observe(el);
    setViewport({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Reset selection when prompts change
  useEffect(() => {
    setSelectedId(null);
  }, [prompts]);

  const parseHex = (c: string) => {
    const h = c.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };

  // Canvas: render glow nodes behind the text
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = viewport.width;
    const h = viewport.height;
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

    // Draw glow nodes for each prompt
    const count = prompts.length;
    for (let i = 0; i < count; i++) {
      const prompt = prompts[i];
      const isSelected = selectedId === prompt.id;
      const isOther = selectedId !== null && !isSelected;

      // Position: vertically distributed with gentle drift
      const baseY = h * (0.25 + (i / Math.max(1, count - 1)) * 0.4);
      const driftX = Math.sin(t * 0.3 + i * 2.1) * 8;
      const driftY = Math.cos(t * 0.25 + i * 1.7) * 5;
      const cx = w / 2 + driftX;
      const cy = baseY + driftY;

      if (isOther) continue; // Don't render unselected prompts

      const breathPhase = Math.sin(breath * Math.PI * 2 + i * 0.5);
      const nodeRadius = isSelected ? 35 : (18 + breathPhase * 4);
      const nodeAlpha = isSelected ? 0.12 : (0.04 + breathPhase * 0.015);

      // Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nodeRadius);
      glowGrad.addColorStop(0, `rgba(${r},${g},${b},${nodeAlpha.toFixed(4)})`);
      glowGrad.addColorStop(0.5, `rgba(${r},${g},${b},${(nodeAlpha * 0.4).toFixed(4)})`);
      glowGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      const dotSize = isSelected ? 3 : 2;
      ctx.beginPath();
      ctx.arc(cx, cy, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${isSelected ? 0.4 : 0.12})`;
      ctx.fill();
    }

    ctx.restore();
    rafRef.current = requestAnimationFrame(render);
  }, [viewport, prompts, color, breath, visible, selectedId]);

  useEffect(() => {
    if (!visible) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, render]);

  const handleSelect = useCallback((prompt: TalkPrompt) => {
    if (selectedId) return;
    setSelectedId(prompt.id);
    hapticTick();

    // Delay to let the animation breathe
    setTimeout(() => {
      hapticBreathPulse();
      onSelect(prompt);
    }, 800);
  }, [selectedId, onSelect]);

  if (!visible) return null;

  const count = prompts.length;

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* Canvas glow layer */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Text overlay */}
      <AnimatePresence>
        {prompts.map((prompt, i) => {
          const isSelected = selectedId === prompt.id;
          const isOther = selectedId !== null && !isSelected;
          const baseY = 25 + (i / Math.max(1, count - 1)) * 40;

          return (
            <motion.div
              key={prompt.id}
              className="absolute cursor-pointer"
              style={{
                top: `${baseY}%`,
                left: '10%',
                right: '10%',
                textAlign: 'center',
                transform: 'translateY(-50%)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isOther ? 0 : (isSelected ? 0.7 : 0.35),
                y: 0,
                scale: isSelected ? 1.05 : 1,
              }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                delay: isOther ? 0 : 0.3 + i * 0.15,
                duration: isOther ? 0.4 : 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => handleSelect(prompt)}
            >
              <p style={{
                fontFamily: SERIF,
                fontSize: 'clamp(14px, 3.5vw, 19px)',
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: room.fg,
                margin: 0,
                lineHeight: leading.body,
                maxWidth: '85%',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                {prompt.text}
              </p>

              {/* Lane indicator — barely visible */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isSelected ? 0.12 : 0.05 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                style={{
                  display: 'block',
                  marginTop: 8,
                  fontFamily: SANS,
                  fontSize: typeSize.whisper,
                  fontWeight: weight.medium,
                  letterSpacing: tracking.normal,
                  textTransform: 'uppercase',
                  color,
                }}
              >
                {LANES[prompt.lane].name}
              </motion.span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}