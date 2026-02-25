/**
 * SCOUT #1 -- 1271. The Fog of War
 * "You only get enough light for the next step. Step to see."
 * INTERACTION: Tap to step into grey fog -- clarity circle opens around each step
 * STEALTH KBE: Action Bias -- Courage (E)
 *
 * COMPOSITOR: sensory_cinema / Drift / morning / embodying / tap / 1271
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Scout_FogOfWar({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1271,
        isSeal: false,
      }}
      arrivalText="Grey. Unknown."
      prompt="You want to see the whole path. You cannot. You only get enough light for the next step. Step to see."
      resonantText="Action bias. You stepped before you could see. And the fog parted. Courage is not the absence of uncertainty. It is the willingness to move into it with only enough light for one step."
      afterglowCoda="Step to see."
      onComplete={onComplete}
    >
      {(verse) => <FogOfWarInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FogOfWarInteraction({ verse }: { verse: any }) {
  const [steps, setSteps] = useState<Array<{ x: number; y: number }>>([]);
  const [done, setDone] = useState(false);

  const W = 260, H = 200;
  const TARGET_STEPS = 5;

  // Predefined path through the fog
  const pathPoints = [
    { x: 50, y: 160 },
    { x: 90, y: 130 },
    { x: 140, y: 110 },
    { x: 185, y: 85 },
    { x: 220, y: 50 },
  ];

  const handleStep = () => {
    if (done) return;
    const nextIdx = steps.length;
    if (nextIdx >= TARGET_STEPS) return;

    const next = [...steps, pathPoints[nextIdx]];
    setSteps(next);

    if (next.length >= TARGET_STEPS) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Visibility meter */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>visible</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'clear' : `${Math.round((steps.length / TARGET_STEPS) * 100)}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            {/* Fog mask: white = visible, black = fog */}
            <mask id="fog-mask-1271">
              <rect x={0} y={0} width={W} height={H} fill={done ? 'white' : '#222'} />
              {steps.map((s, i) => (
                <motion.circle
                  key={i}
                  cx={s.x} cy={s.y}
                  fill="white"
                  initial={{ r: 0 }}
                  animate={{ r: 35 + i * 5 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </mask>

            <radialGradient id="fog-grad-1271">
              <stop offset="0%" stopColor={verse.palette.primary} stopOpacity="0.06" />
              <stop offset="100%" stopColor={verse.palette.primary} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Fog layer */}
          <rect x={0} y={0} width={W} height={H}
            fill={verse.palette.primary} opacity={safeOpacity(0.08)} />

          {/* Terrain (hidden behind fog, revealed by steps) */}
          <g mask="url(#fog-mask-1271)">
            {/* Ground texture lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i}
                x1={10 + i * 22} y1={H - 5}
                x2={15 + i * 22} y2={H - 15 - Math.sin(i * 0.7) * 20}
                stroke={verse.palette.primary}
                strokeWidth={0.5}
                opacity={safeOpacity(0.1)} />
            ))}

            {/* Path line */}
            {steps.length > 0 && (
              <motion.path
                d={`M ${pathPoints[0].x},${pathPoints[0].y} ${pathPoints.slice(1, steps.length).map(p => `L ${p.x},${p.y}`).join(' ')}`}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={safeOpacity(0.25)}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Destination marker */}
            <motion.g animate={{ opacity: done ? 0.5 : 0 }}>
              <circle cx={220} cy={50} r={8}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
              <circle cx={220} cy={50} r={8}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.3)} />
            </motion.g>
          </g>

          {/* Step markers */}
          {steps.map((s, i) => (
            <motion.g key={i}>
              <motion.circle
                cx={s.x} cy={s.y} r={4}
                fill={verse.palette.accent}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: safeOpacity(0.3) }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
              {/* Clarity ripple */}
              <motion.circle
                cx={s.x} cy={s.y}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5}
                initial={{ r: 4, opacity: 0.4 }}
                animate={{ r: 35 + i * 5, opacity: 0 }}
                transition={{ duration: 1 }}
              />
            </motion.g>
          ))}

          {/* "Unknown" overlay text */}
          {steps.length === 0 && (
            <motion.text
              x={W / 2} y={H / 2}
              textAnchor="middle"
              fill={verse.palette.textFaint}
              style={navicueType.choice}
              animate={{ opacity: [0.15, 0.25, 0.15] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              unknown
            </motion.text>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleStep}
        >
          {steps.length === 0 ? 'take first step' : `step ${steps.length + 1}`}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'you stepped before you could see'
          : steps.length > 0 ? `${TARGET_STEPS - steps.length} steps remain`
            : 'the fog hides everything'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          courage
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'action bias' : 'step to see'}
      </div>
    </div>
  );
}
