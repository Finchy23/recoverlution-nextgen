/**
 * ANCHOR #3 -- 1293. The Gyroscope (Dynamic Stability)
 * "Keep your purpose spinning, and the world cannot knock you over."
 * INTERACTION: Tap to spin the top -- faster spin = more stability against pushes
 * STEALTH KBE: Momentum -- Active Stability (E)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / embodying / tap / 1293
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Anchor_Gyroscope({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1293,
        isSeal: false,
      }}
      arrivalText="A top. Still."
      prompt="Stability is not stillness. It is motion. Keep your purpose spinning, and the world cannot knock you over."
      resonantText="Momentum. The faster the top spun, the more it resisted the push. Active stability is the paradox of motion: the thing that moves with purpose is harder to topple than the thing that stands still."
      afterglowCoda="Spin to stand."
      onComplete={onComplete}
    >
      {(verse) => <GyroscopeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GyroscopeInteraction({ verse }: { verse: any }) {
  const [spins, setSpins] = useState(0);
  const [pushed, setPushed] = useState(false);
  const [done, setDone] = useState(false);
  const [wobble, setWobble] = useState(0);
  const TARGET_SPINS = 4;

  const handleSpin = () => {
    if (spins >= TARGET_SPINS || pushed) return;
    const next = spins + 1;
    setSpins(next);
    if (next >= TARGET_SPINS) {
      // Auto-push after reaching max spin
      setTimeout(() => {
        setPushed(true);
        setWobble(3); // small wobble because high spin
        setTimeout(() => {
          setWobble(0);
          setDone(true);
          setTimeout(() => verse.advance(), 2800);
        }, 1000);
      }, 800);
    }
  };

  const W = 200, H = 200;
  const CX = W / 2, CY = 100;
  const spinSpeed = spins > 0 ? 3 / spins : 0; // faster with more spins

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* RPM readout */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>spin</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'stable' : spins === 0 ? 'still' : `${spins}/${TARGET_SPINS}`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Floor shadow */}
          <ellipse cx={CX} cy={170} rx={30 + spins * 5} ry={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />

          {/* Top body */}
          <motion.g
            animate={{
              rotate: pushed ? wobble : 0,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ transformOrigin: `${CX}px 165px` }}
          >
            {/* Stem */}
            <line x1={CX} y1={CY - 30} x2={CX} y2={CY + 5}
              stroke={verse.palette.primary} strokeWidth={2}
              opacity={safeOpacity(0.2)} strokeLinecap="round" />

            {/* Spinning disc */}
            <motion.g
              animate={spins > 0 ? { rotate: 360 } : {}}
              transition={spins > 0 ? {
                repeat: Infinity,
                duration: spinSpeed,
                ease: 'linear',
              } : {}}
              style={{ transformOrigin: `${CX}px ${CY + 5}px` }}
            >
              <ellipse cx={CX} cy={CY + 5} rx={35} ry={10}
                fill={spins > 0 ? verse.palette.accent : verse.palette.primary}
                opacity={safeOpacity(spins > 0 ? 0.12 : 0.06)} />
              <ellipse cx={CX} cy={CY + 5} rx={35} ry={10}
                fill="none"
                stroke={spins > 0 ? verse.palette.accent : verse.palette.primary}
                strokeWidth={1}
                opacity={safeOpacity(spins > 0 ? 0.3 : 0.15)} />

              {/* Disc markings (visible when spinning) */}
              {spins > 0 && [0, 90, 180, 270].map(angle => {
                const rad = angle * Math.PI / 180;
                return (
                  <circle key={angle}
                    cx={CX + 28 * Math.cos(rad)}
                    cy={CY + 5 + 8 * Math.sin(rad)}
                    r={2}
                    fill={verse.palette.accent}
                    opacity={safeOpacity(0.2)} />
                );
              })}
            </motion.g>

            {/* Point */}
            <line x1={CX} y1={CY + 15} x2={CX} y2={165}
              stroke={verse.palette.primary} strokeWidth={1.5}
              opacity={safeOpacity(0.2)} strokeLinecap="round" />
          </motion.g>

          {/* Push arrow (when pushing) */}
          {pushed && !done && (
            <motion.g
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: safeOpacity(0.3), x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <line x1={25} y1={CY} x2={55} y2={CY}
                stroke={verse.palette.shadow} strokeWidth={2} />
              <path d={`M 50,${CY - 5} L 58,${CY} L 50,${CY + 5}`}
                fill={verse.palette.shadow} opacity={0.3} />
              <text x={20} y={CY - 10}
                fill={verse.palette.shadow} style={navicueType.micro} opacity={0.3}>
                push
              </text>
            </motion.g>
          )}

          {/* Stability aura */}
          {done && (
            <motion.ellipse
              cx={CX} cy={CY + 5} rx={45} ry={15}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.06) }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Motion blur rings (high spin) */}
          {spins >= 3 && (
            <motion.g
              animate={{ opacity: [safeOpacity(0.05), safeOpacity(0.1), safeOpacity(0.05)] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <ellipse cx={CX} cy={CY + 5} rx={38} ry={12}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.3} />
              <ellipse cx={CX} cy={CY + 5} rx={32} ry={9}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.3} />
            </motion.g>
          )}
        </svg>
      </div>

      {spins < TARGET_SPINS && !pushed && (
        <motion.button style={btn()} whileTap={btn().active} onClick={handleSpin}>
          {spins === 0 ? 'spin' : 'spin faster'}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the push could not topple it'
          : pushed ? 'resisting...'
            : spins > 0 ? `spinning... ${TARGET_SPINS - spins} more`
              : 'stability is not stillness'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          active stability
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'momentum' : 'spin to stand'}
      </div>
    </div>
  );

  function btn() {
    return immersiveTapButton(verse.palette, 'accent');
  }
}
