/**
 * READ CALIBRATION — The Ambient Aperture
 *
 * Three axis-colored dots at the top of the glass.
 * Barely there. Trace opacity. Part of the void.
 *
 * Tap a dot to cycle its axis. A whisper appears
 * momentarily showing the new value, then dissolves.
 *
 * The calibration is always set. It never asks.
 * It just tunes what comes next.
 *
 * FOCUS — where is it
 * LENS  — which voice
 * MODE  — how deep
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  room, font, tracking, typeSize, weight, opacity, timing, layer, glow,
} from '../design-system/surface-tokens';
import {
  type CalibrationState,
  FOCUS_AXIS,
  LENS_AXIS,
  MODE_AXIS,
  cycleAxis,
} from './read-calibration';

// ─── Single Axis Dot ───
// A tiny colored dot. Tap to cycle. A whisper materializes briefly.

interface AxisDotProps {
  color: string;
  label: string;
  breath: number;
  onCycle: () => void;
}

function AxisDot({ color, label, breath, onCycle }: AxisDotProps) {
  const [showWhisper, setShowWhisper] = useState(false);
  const [currentLabel, setCurrentLabel] = useState(label);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleTap = useCallback(() => {
    onCycle();
    setShowWhisper(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowWhisper(false), 1800);
  }, [onCycle]);

  // Update label when it changes from parent
  useEffect(() => {
    setCurrentLabel(label);
  }, [label]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const phase = breath * Math.PI * 2;
  const breathPulse = 1 + Math.sin(phase) * 0.15;

  return (
    <div className="relative flex flex-col items-center">
      {/* The dot */}
      <button
        onClick={handleTap}
        className="cursor-pointer"
        style={{
          background: 'none',
          border: 'none',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 5 * breathPulse,
            height: 5 * breathPulse,
            background: color,
            opacity: showWhisper ? opacity.spoken : opacity.trace,
            boxShadow: showWhisper ? glow.soft(color, '25') : 'none',
            transition: timing.t.fadeSlow,
          }}
        />
      </button>

      {/* Whisper — appears on tap, dissolves after 1.8s */}
      <AnimatePresence>
        {showWhisper && (
          <motion.span
            initial={{ opacity: 0, y: -2, x: '-50%' }}
            animate={{ opacity: opacity.quiet, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 2, x: '-50%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute whitespace-nowrap pointer-events-none"
            style={{
              top: '100%',
              left: '50%',
              fontFamily: font.serif,
              fontSize: typeSize.micro,
              fontWeight: weight.light,
              fontStyle: 'italic',
              letterSpacing: tracking.hair,
              color,
              marginTop: 2,
            }}
          >
            {currentLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ambient Calibration Layer ───
// Three dots. Top of the glass. Always there. Never intrusive.

interface ReadCalibrationProps {
  calibration: CalibrationState;
  breath: number;
  onCalibrationChange: (next: CalibrationState) => void;
}

export function ReadCalibration({
  calibration,
  breath,
  onCalibrationChange,
}: ReadCalibrationProps) {
  const focusOpt = FOCUS_AXIS.options.find(o => o.value === calibration.focus)!;
  const lensOpt = LENS_AXIS.options.find(o => o.value === calibration.lens)!;
  const modeOpt = MODE_AXIS.options.find(o => o.value === calibration.mode)!;

  return (
    <div
      className="absolute flex items-center gap-2"
      style={{
        top: 16,
        right: 20,
        zIndex: layer.lifted,
      }}
    >
      <AxisDot
        color={focusOpt.color}
        label={focusOpt.label}
        breath={breath}
        onCycle={() =>
          onCalibrationChange({
            ...calibration,
            focus: cycleAxis(calibration.focus, FOCUS_AXIS.options),
          })
        }
      />

      <AxisDot
        color={lensOpt.color}
        label={lensOpt.label}
        breath={breath}
        onCycle={() =>
          onCalibrationChange({
            ...calibration,
            lens: cycleAxis(calibration.lens, LENS_AXIS.options),
          })
        }
      />

      <AxisDot
        color={modeOpt.color}
        label={modeOpt.label}
        breath={breath}
        onCycle={() =>
          onCalibrationChange({
            ...calibration,
            mode: cycleAxis(calibration.mode, MODE_AXIS.options),
          })
        }
      />
    </div>
  );
}