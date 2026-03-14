/**
 * THE SOMATIC THRESHOLD — §6.X Haptic Threshold
 *
 * "A control is just typography floating in the void.
 *  Holding it increases localized glass refraction and
 *  haptic tension until it 'snaps'."
 *
 * This is the Death of the Box applied to controls:
 *   - No background
 *   - No border
 *   - No pill
 *   - No button shape
 *
 * The control reveals itself through pressure response:
 *   1. Typography floats in the void (idle)
 *   2. Touch begins — refraction field appears around the text
 *   3. Hold deepens — refraction intensifies, glow builds, haptic pressure
 *   4. Threshold reached — snap! The action fires.
 *   5. Receipt — the text briefly illuminates then returns to void
 *
 * The semantic particle dot leads the label, confirming
 * this is an interactive element without drawing a container.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hapticTick, hapticResolve, hapticSeal } from '../surfaces/haptics';
import { font, room, colors, tracking, typeSize, weight, opacity, glaze } from '../design-system/surface-tokens';
import { useTemperature, shouldShowCopy } from '../design-system/TemperatureGovernor';

const DEFAULT_HOLD_MS = 600;

interface SomaticThresholdProps {
  /** The label text — just typography, no container */
  label: string;
  /** The color of the refractive field and semantic particle */
  color?: string;
  /** Called when the threshold snaps */
  onResolve?: () => void;
  /** Hold duration in ms before snap (default 600) */
  holdMs?: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether the control is currently active/selected */
  active?: boolean;
  /** Disable the control */
  disabled?: boolean;
  /** Optional secondary label (appears after resolve) */
  receipt?: string;
}

export function SomaticThreshold({
  label,
  color = colors.brand.purple.mid,
  onResolve,
  holdMs = DEFAULT_HOLD_MS,
  size = 'medium',
  active = false,
  disabled = false,
  receipt,
}: SomaticThresholdProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1
  const [resolved, setResolved] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const holdStartRef = useRef(0);
  const rafRef = useRef(0);

  const { constraints } = useTemperature();

  // Physics loop
  useEffect(() => {
    const tick = () => {
      if (holding && !resolved) {
        const elapsed = performance.now() - holdStartRef.current;
        const p = Math.min(1, elapsed / holdMs);
        setProgress(p);

        // Haptic + acoustic pressure at intervals
        if (p > 0.15 && p < 0.85) {
          hapticPressure(p);
          acousticWeight(p);
        }

        // Threshold snap
        if (p >= 0.85) {
          hapticResolve();
          acousticResolve();
          setResolved(true);
          setHolding(false);
          onResolve?.();

          // Show receipt briefly
          if (receipt) {
            setShowReceipt(true);
            setTimeout(() => setShowReceipt(false), 1800);
          }

          // Reset after animation
          setTimeout(() => {
            setResolved(false);
            setProgress(0);
          }, 800);
          return;
        }
      } else if (!holding && !resolved) {
        // Decay
        setProgress(prev => Math.max(0, prev - 0.06));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [holding, resolved, holdMs, onResolve, receipt]);

  const handlePointerDown = useCallback(() => {
    if (disabled || resolved) return;
    setHolding(true);
    holdStartRef.current = performance.now();
    hapticTick();
    acousticTick();
  }, [disabled, resolved]);

  const handlePointerUp = useCallback(() => {
    setHolding(false);
  }, []);

  // Size variants
  const sizeConfig = {
    small: { fontSize: typeSize.detail, letterSpacing: tracking.snug, dotSize: 2, glowRadius: 20 },
    medium: { fontSize: typeSize.note, letterSpacing: tracking.tight, dotSize: 3, glowRadius: 30 },
    large: { fontSize: typeSize.lede, letterSpacing: tracking.label, dotSize: 4, glowRadius: 40 },
  }[size];

  // Derived visual values
  const refractionIntensity = progress * 0.15; // Max 15% glow
  const dotGlow = active ? 0.8 : 0.3 + progress * 0.5;
  const dotSize = sizeConfig.dotSize + (active ? 1 : 0) + progress * 2;
  const labelOpacity = disabled ? 0.15 : active ? 0.7 : 0.3 + progress * 0.3;

  // Temperature governance: at high bands, threshold becomes a simple tap
  const effectiveHoldMs = constraints.band >= 3 ? 100 : holdMs;

  return (
    <div
      className="relative inline-flex items-center gap-2 select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        touchAction: 'none',
        opacity: disabled ? 0.3 : 1,
      }}
    >
      {/* Refractive field — the borderless pool of sub-surface light */}
      {progress > 0.02 && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: sizeConfig.glowRadius + progress * sizeConfig.glowRadius,
            height: sizeConfig.glowRadius * 0.6 + progress * sizeConfig.glowRadius * 0.4,
            background: `radial-gradient(ellipse, ${color}${Math.round(refractionIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Resolve flash */}
      <AnimatePresence>
        {resolved && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            initial={{ opacity: opacity.body, scale: 0.5 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: sizeConfig.glowRadius * 2,
              height: sizeConfig.glowRadius,
              background: `radial-gradient(ellipse, ${color}20 0%, transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Semantic particle — the leading dot */}
      <div
        className="rounded-full flex-shrink-0"
        style={{
          width: dotSize,
          height: dotSize,
          background: color,
          opacity: dotGlow,
          boxShadow: progress > 0.1 || active
            ? `0 0 ${6 + progress * 10}px ${color}${Math.round(dotGlow * 80).toString(16).padStart(2, '0')}`
            : 'none',
          transition: progress > 0 ? 'none' : 'all 0.4s',
        }}
      />

      {/* Typography — floating in the void */}
      <span
        style={{
          fontSize: sizeConfig.fontSize,
          fontWeight: weight.medium,
          letterSpacing: sizeConfig.letterSpacing,
          textTransform: 'uppercase',
          color: active || progress > 0.3 ? color : glaze.half,
          opacity: labelOpacity,
          transition: progress > 0 ? 'color 0.2s' : 'all 0.4s',
          // Subtle scale on resolve
          transform: resolved ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {label}
      </span>

      {/* Receipt text — appears after resolve, then fades */}
      <AnimatePresence>
        {showReceipt && receipt && (
          <motion.span
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: opacity.steady, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: font.serif,
              fontSize: typeSize.caption,
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              marginLeft: 4,
            }}
          >
            {receipt}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}