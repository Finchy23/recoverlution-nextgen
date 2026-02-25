/**
 * CONDUCTOR #9 -- 1219. The AC/DC (Rhythm)
 * "Nature oscillates. Pulse the energy to go the distance."
 * INTERACTION: Tap in rhythm with a wave to switch from DC to AC
 * STEALTH KBE: Oscillation -- Cyclical Efficiency (E)
 *
 * COMPOSITOR: witness_ritual / Pulse / morning / embodying / tap / 1219
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTap,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Conductor_ACDC({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1219,
        isSeal: false,
      }}
      arrivalText="A flat line. Direct current."
      prompt="Nature oscillates. Heartbeats, seasons, waves. Constant push is inefficient. Pulse the energy to go the distance."
      resonantText="Oscillation. DC pushes without rest. AC rides the wave. Cyclical efficiency means working with the rhythm, not against it. Push, rest, push, rest. The wave goes further than the line."
      afterglowCoda="Ride the wave."
      onComplete={onComplete}
    >
      {(verse) => <ACDCInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ACDCInteraction({ verse }: { verse: any }) {
  const [mode, setMode] = useState<'dc' | 'switching' | 'ac'>('dc');
  const [wavePhase, setWavePhase] = useState(0);
  const [syncTaps, setSyncTaps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [done, setDone] = useState(false);
  const lastTapRef = useRef(0);
  const TARGET_SYNCS = 6;

  // Wave animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWavePhase(prev => prev + 0.08);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Distance accumulation in AC mode
  useEffect(() => {
    if (mode !== 'ac') return;
    const interval = setInterval(() => {
      setDistance(prev => {
        const next = prev + 0.02;
        if (next >= 1) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => verse.advance(), 2500);
          return 1;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [mode, verse]);

  const handleTap = useCallback(() => {
    if (mode === 'dc') {
      setMode('switching');
      return;
    }
    if (mode !== 'switching' || done) return;

    // Check if tap aligns with wave peak (sin > 0.7)
    const waveVal = Math.sin(wavePhase);
    if (waveVal > 0.5) {
      setSyncTaps(prev => {
        const next = prev + 1;
        if (next >= TARGET_SYNCS) {
          setMode('ac');
        }
        return next;
      });
    }
    lastTapRef.current = Date.now();
  }, [mode, wavePhase, done]);

  const SCENE_W = 260;
  const SCENE_H = 100;
  const waveY = (x: number) => SCENE_H / 2 + Math.sin(x * 0.04 + wavePhase) * 25;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Waveform visualization */}
      <motion.div
        style={{
          ...immersiveTap(verse.palette).zone,
          width: SCENE_W,
          height: SCENE_H,
          position: 'relative',
          cursor: done ? 'default' : 'pointer',
        }}
        onClick={handleTap}
        whileTap={!done ? { scale: 0.98 } : {}}
      >
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* DC flat line (fades as you switch) */}
          <motion.line
            x1={10} y1={SCENE_H / 2}
            x2={SCENE_W - 10} y2={SCENE_H / 2}
            stroke={verse.palette.primary}
            strokeWidth={1.5}
            animate={{
              opacity: mode === 'dc'
                ? safeOpacity(0.4)
                : mode === 'switching'
                  ? safeOpacity(0.15)
                  : 0,
            }}
          />

          {/* AC sine wave */}
          {mode !== 'dc' && (
            <motion.path
              d={Array.from({ length: SCENE_W - 20 }, (_, i) => {
                const x = 10 + i;
                const y = waveY(x);
                return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={mode === 'ac' ? 2 : 1.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(mode === 'ac' ? 0.5 : 0.3) }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Tap markers on wave peaks */}
          {mode === 'switching' && syncTaps > 0 && Array.from({ length: Math.min(syncTaps, 6) }).map((_, i) => (
            <motion.circle
              key={i}
              cx={40 + i * 35}
              cy={SCENE_H / 2 - 25}
              r={3}
              fill={verse.palette.accent}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: safeOpacity(0.4), scale: 1 }}
            />
          ))}

          {/* Distance traveled (AC mode) */}
          {mode === 'ac' && (
            <motion.line
              x1={10} y1={SCENE_H - 8}
              x2={10 + distance * (SCENE_W - 20)} y2={SCENE_H - 8}
              stroke={verse.palette.accent}
              strokeWidth={2}
              strokeLinecap="round"
              animate={{ opacity: safeOpacity(0.4) }}
            />
          )}

          {/* Mode labels */}
          <text x={SCENE_W - 15} y={16} textAnchor="end"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            {mode === 'dc' ? 'DC' : mode === 'switching' ? 'syncing...' : 'AC'}
          </text>
        </svg>
      </motion.div>

      {/* Sync progress */}
      {mode === 'switching' && (
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: TARGET_SYNCS }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                background: i < syncTaps ? verse.palette.accent : verse.palette.primaryFaint,
                opacity: safeOpacity(i < syncTaps ? 0.6 : 0.2),
              }}
              style={{
                width: 8, height: 8, borderRadius: '50%',
              }}
            />
          ))}
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the wave goes further'
          : mode === 'ac'
            ? `distance: ${Math.round(distance * 100)}%`
            : mode === 'switching'
              ? 'tap on the wave peaks'
              : 'tap to switch from DC'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          cyclical efficiency
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'oscillation' : 'find the rhythm'}
      </div>
    </div>
  );
}
