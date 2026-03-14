/**
 * SEEK CALIBRATION — The Spatial Aperture
 *
 * Three axis-colored dots at the base of the dark glass.
 * Barely there. Trace opacity. Part of the void.
 *
 * Tap a dot to cycle its axis. A whisper appears
 * momentarily showing the new value, then dissolves.
 *
 * FOCUS — where is the illusion
 * DEPTH — how far back
 * FRAME — how to break it
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  font, tracking, typeSize, weight, opacity, timing, layer, glow,
} from '../design-system/surface-tokens';
import {
  type SeekCalibrationState,
  SEEK_FOCUS_AXIS,
  SEEK_DEPTH_AXIS,
  SEEK_FRAME_AXIS,
  cycleAxis,
} from './seek-calibration';

// ─── Single Axis Dot ───

interface AxisDotProps {
  color: string;
  label: string;
  breath: number;
  onCycle: () => void;
}

function AxisDot({ color, label, breath, onCycle }: AxisDotProps) {
  const [showWhisper, setShowWhisper] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleTap = useCallback(() => {
    onCycle();
    setShowWhisper(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowWhisper(false), 1800);
  }, [onCycle]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const phase = breath * Math.PI * 2;
  const breathPulse = 1 + Math.sin(phase) * 0.15;

  return (
    <div className="relative flex flex-col items-center">
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

      {/* Whisper — appears above the dot, dissolves after 1.8s */}
      <AnimatePresence>
        {showWhisper && (
          <motion.span
            initial={{ opacity: 0, y: 4, x: '-50%' }}
            animate={{ opacity: opacity.quiet, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 4, x: '-50%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute whitespace-nowrap pointer-events-none"
            style={{
              bottom: '100%',
              left: '50%',
              fontFamily: font.serif,
              fontSize: typeSize.micro,
              fontWeight: weight.light,
              fontStyle: 'italic',
              letterSpacing: tracking.hair,
              color,
              marginBottom: 2,
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ambient Calibration Layer ───

interface SeekCalibrationProps {
  calibration: SeekCalibrationState;
  breath: number;
  onCalibrationChange: (next: SeekCalibrationState) => void;
}

export function SeekCalibration({
  calibration,
  breath,
  onCalibrationChange,
}: SeekCalibrationProps) {
  const focusOpt = SEEK_FOCUS_AXIS.options.find(o => o.value === calibration.focus)!;
  const depthOpt = SEEK_DEPTH_AXIS.options.find(o => o.value === calibration.depth)!;
  const frameOpt = SEEK_FRAME_AXIS.options.find(o => o.value === calibration.frame)!;

  return (
    <div
      className="absolute flex items-center gap-2"
      style={{
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
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
            focus: cycleAxis(calibration.focus, SEEK_FOCUS_AXIS.options),
          })
        }
      />

      <AxisDot
        color={depthOpt.color}
        label={depthOpt.label}
        breath={breath}
        onCycle={() =>
          onCalibrationChange({
            ...calibration,
            depth: cycleAxis(calibration.depth, SEEK_DEPTH_AXIS.options),
          })
        }
      />

      <AxisDot
        color={frameOpt.color}
        label={frameOpt.label}
        breath={breath}
        onCycle={() =>
          onCalibrationChange({
            ...calibration,
            frame: cycleAxis(calibration.frame, SEEK_FRAME_AXIS.options),
          })
        }
      />
    </div>
  );
}
