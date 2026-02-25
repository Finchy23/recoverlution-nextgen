/**
 * CONDUCTOR #7 -- 1217. The Parallel Circuit (Redundancy)
 * "Fragility is a series circuit. Resilience is parallel."
 * INTERACTION: Tap to rewire from series to parallel. One bulb blows, rest survive.
 * STEALTH KBE: Diversification -- Identity Complexity (B)
 *
 * COMPOSITOR: science_x_soul / Lattice / social / believing / tap / 1217
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const BULBS = ['work', 'health', 'joy', 'love'];

export default function Conductor_ParallelCircuit({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1217,
        isSeal: false,
      }}
      arrivalText="Four lights. One wire."
      prompt="Fragility is a series circuit. Resilience is parallel. If your job fails, does your joy go out? Rewire for independence."
      resonantText="Diversification. In series, one failure kills everything. In parallel, each light has its own path to the source. Identity complexity means no single point of failure."
      afterglowCoda="Rewire."
      onComplete={onComplete}
    >
      {(verse) => <ParallelInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ParallelInteraction({ verse }: { verse: any }) {
  const [mode, setMode] = useState<'series' | 'parallel'>('series');
  const [blownIdx, setBlownIdx] = useState(-1);
  const [done, setDone] = useState(false);

  // Blow a bulb after rewire to demonstrate
  useEffect(() => {
    if (mode !== 'parallel') return;
    const timer = setTimeout(() => {
      setBlownIdx(0); // "work" blows
      setDone(true);
      setTimeout(() => verse.advance(), 2800);
    }, 1500);
    return () => clearTimeout(timer);
  }, [mode, verse]);

  // In series mode, blow one to show cascade
  const [seriesBlow, setSeriesBlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSeriesBlow(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 120;

  const isAlive = (idx: number) => {
    if (mode === 'series') return !seriesBlow;
    return idx !== blownIdx;
  };

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Circuit visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {mode === 'series' ? (
            // Series circuit -- single line, bulbs in sequence
            <g>
              <line x1={10} y1={50} x2={SCENE_W - 10} y2={50}
                stroke={verse.palette.primary} strokeWidth={1}
                opacity={safeOpacity(seriesBlow ? 0.08 : 0.2)} />
              {BULBS.map((label, i) => {
                const cx = 40 + i * 55;
                const alive = isAlive(i);
                return (
                  <g key={label}>
                    <motion.circle
                      cx={cx} cy={40} r={12}
                      fill="none"
                      stroke={alive ? verse.palette.accent : verse.palette.shadow}
                      strokeWidth={1}
                      animate={{ opacity: safeOpacity(alive ? 0.4 : 0.12) }}
                    />
                    {alive && (
                      <motion.circle
                        cx={cx} cy={40} r={18}
                        fill={verse.palette.accent}
                        animate={{ opacity: [0.03, 0.06, 0.03] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                      />
                    )}
                    <text x={cx} y={72} textAnchor="middle"
                      fill={alive ? verse.palette.textFaint : verse.palette.shadow}
                      style={navicueType.micro}>
                      {label}
                    </text>
                    {!alive && i === 0 && (
                      <motion.text
                        x={cx} y={95} textAnchor="middle"
                        fill={verse.palette.shadow} style={navicueType.micro}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                      >
                        all dead
                      </motion.text>
                    )}
                  </g>
                );
              })}
            </g>
          ) : (
            // Parallel circuit -- each bulb has its own path
            <g>
              {/* Main bus bars */}
              <line x1={15} y1={15} x2={15} y2={SCENE_H - 15}
                stroke={verse.palette.primary} strokeWidth={1.5}
                opacity={safeOpacity(0.2)} />
              <line x1={SCENE_W - 15} y1={15} x2={SCENE_W - 15} y2={SCENE_H - 15}
                stroke={verse.palette.primary} strokeWidth={1.5}
                opacity={safeOpacity(0.2)} />

              {BULBS.map((label, i) => {
                const y = 20 + i * 25;
                const alive = isAlive(i);
                return (
                  <g key={label}>
                    {/* Individual branch wire */}
                    <line x1={15} y1={y} x2={SCENE_W - 15} y2={y}
                      stroke={alive ? verse.palette.primary : verse.palette.shadow}
                      strokeWidth={0.8}
                      opacity={safeOpacity(alive ? 0.15 : 0.06)}
                      strokeDasharray={alive ? 'none' : '3 3'}
                    />
                    {/* Bulb */}
                    <motion.circle
                      cx={SCENE_W / 2} cy={y} r={8}
                      fill="none"
                      stroke={alive ? verse.palette.accent : verse.palette.shadow}
                      strokeWidth={1}
                      animate={{ opacity: safeOpacity(alive ? 0.5 : 0.15) }}
                    />
                    {alive && (
                      <motion.circle
                        cx={SCENE_W / 2} cy={y} r={14}
                        fill={verse.palette.accent}
                        animate={{ opacity: [0.02, 0.05, 0.02] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                      />
                    )}
                    <text x={SCENE_W / 2 + 24} y={y + 4} textAnchor="start"
                      fill={alive ? verse.palette.textFaint : verse.palette.shadow}
                      style={navicueType.micro}>
                      {label}{!alive ? ' (blown)' : ''}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Mode label */}
      <motion.span
        animate={{ opacity: 0.6 }}
        style={{
          ...navicueType.data,
          color: mode === 'series' ? verse.palette.shadow : verse.palette.accent,
        }}
      >
        {mode === 'series' ? 'series circuit' : 'parallel circuit'}
      </motion.span>

      {/* Rewire button */}
      {mode === 'series' && seriesBlow && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={() => {
            setMode('parallel');
            setSeriesBlow(false);
            setBlownIdx(-1);
          }}
        >
          rewire to parallel
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'work blew. joy stayed on.'
          : mode === 'parallel'
            ? 'testing resilience...'
            : seriesBlow
              ? 'one failure killed everything'
              : 'all lights on...'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          identity complexity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'diversification' : 'rewire the circuit'}
      </div>
    </div>
  );
}
