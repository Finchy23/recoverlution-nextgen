/**
 * WARRIOR II #4 -- 1364. The Spy (Intel)
 * "Foreknowledge must be obtained from people."
 * INTERACTION: Dark enemy camp. Send spy. See their plan. Counter it.
 * STEALTH KBE: Empathy -- Intel Gathering (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / knowing / tap / 1364
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

export default function WarriorII_Spy({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1364,
        isSeal: false,
      }}
      arrivalText="Enemy camp. Dark."
      prompt="Foreknowledge cannot be gotten from ghosts and spirits. It must be obtained from people. Know the enemy's mind."
      resonantText="Empathy. You sent the spy and saw their plan before they executed it. Intel gathering: the general who knows the enemy's mind wins before the battle. Understanding is the ultimate weapon."
      afterglowCoda="Know the enemy's mind."
      onComplete={onComplete}
    >
      {(verse) => <SpyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SpyInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'dark' | 'sending' | 'intel' | 'counter'>('dark');

  const handleSend = () => {
    if (phase !== 'dark') return;
    setPhase('sending');
    setTimeout(() => {
      setPhase('intel');
    }, 1500);
  };

  const handleCounter = () => {
    if (phase !== 'intel') return;
    setPhase('counter');
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  // Camp (right side, dark)
  const CAMP_X = 130, CAMP_Y = 30, CAMP_W = 75, CAMP_H = 80;
  // Your side (left)
  const YOUR_X = 30;

  const revealed = phase === 'intel' || phase === 'counter';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>intel</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'counter' ? verse.palette.accent
            : revealed ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'counter' ? 'countered'
            : revealed ? 'plan visible'
              : phase === 'sending' ? 'infiltrating...'
                : 'blind'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Your position */}
          <g>
            <circle cx={YOUR_X} cy={H / 2} r={10}
              fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
            <text x={YOUR_X} y={H / 2 + 20} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              you
            </text>
          </g>

          {/* Enemy camp (dark overlay that lifts) */}
          <rect x={CAMP_X} y={CAMP_Y} width={CAMP_W} height={CAMP_H} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <rect x={CAMP_X} y={CAMP_Y} width={CAMP_W} height={CAMP_H} rx={4}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.8} opacity={safeOpacity(0.12)} />

          {/* Darkness overlay */}
          <motion.rect
            x={CAMP_X} y={CAMP_Y} width={CAMP_W} height={CAMP_H} rx={4}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(revealed ? 0 : 0.08),
            }}
            transition={{ duration: 0.8 }}
          />

          {/* Hidden plan (revealed by spy) */}
          {revealed && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Attack arrows showing their plan */}
              <line x1={CAMP_X + 15} y1={CAMP_Y + 25}
                x2={CAMP_X + 15} y2={CAMP_Y + 55}
                stroke={verse.palette.shadow} strokeWidth={1}
                opacity={safeOpacity(0.15)} />
              <line x1={CAMP_X + 35} y1={CAMP_Y + 20}
                x2={CAMP_X + 15} y2={CAMP_Y + 40}
                stroke={verse.palette.shadow} strokeWidth={1}
                opacity={safeOpacity(0.15)} />
              <line x1={CAMP_X + 55} y1={CAMP_Y + 25}
                x2={CAMP_X + 35} y2={CAMP_Y + 45}
                stroke={verse.palette.shadow} strokeWidth={1}
                opacity={safeOpacity(0.15)} />

              {/* Plan label */}
              <text x={CAMP_X + CAMP_W / 2} y={CAMP_Y + CAMP_H + 12}
                textAnchor="middle" fill={verse.palette.text}
                style={{ fontSize: '7px' }} opacity={0.3}>
                their plan: pincer attack
              </text>

              {/* Enemy unit dots */}
              {[
                [CAMP_X + 15, CAMP_Y + 20],
                [CAMP_X + 35, CAMP_Y + 15],
                [CAMP_X + 55, CAMP_Y + 20],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={5}
                  fill={verse.palette.shadow} opacity={safeOpacity(0.1)} />
              ))}
            </motion.g>
          )}

          {/* Spy agent (moving from you to camp) */}
          {phase === 'sending' && (
            <motion.circle
              cy={H / 2} r={4}
              fill={verse.palette.accent}
              initial={{ cx: YOUR_X + 15, opacity: safeOpacity(0.3) }}
              animate={{ cx: CAMP_X - 5, opacity: safeOpacity(0.05) }}
              transition={{ duration: 1.2 }}
            />
          )}

          {/* Intel line (spy to you) */}
          {revealed && (
            <motion.line
              x1={YOUR_X + 10} y1={H / 2}
              x2={CAMP_X} y2={CAMP_Y + CAMP_H / 2}
              stroke={verse.palette.accent} strokeWidth={0.5}
              strokeDasharray="4 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.15) }}
            />
          )}

          {/* Counter indicator */}
          {phase === 'counter' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Counter arrows (your adjusted plan) */}
              <line x1={YOUR_X + 10} y1={H / 2 - 15}
                x2={CAMP_X - 5} y2={CAMP_Y + 10}
                stroke={verse.palette.accent} strokeWidth={1}
                strokeDasharray="6 3" opacity={safeOpacity(0.2)} />
              <line x1={YOUR_X + 10} y1={H / 2 + 15}
                x2={CAMP_X - 5} y2={CAMP_Y + CAMP_H - 10}
                stroke={verse.palette.accent} strokeWidth={1}
                strokeDasharray="6 3" opacity={safeOpacity(0.2)} />

              <text x={80} y={H / 2 - 25} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.4}>
                counter-plan
              </text>

              <text x={CX} y={H - 5} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                you see their mind
              </text>
            </motion.g>
          )}

          {/* Dark label */}
          {phase === 'dark' && (
            <text x={CAMP_X + CAMP_W / 2} y={CAMP_Y + CAMP_H / 2 + 3}
              textAnchor="middle" fill={verse.palette.textFaint}
              style={{ fontSize: '8px' }} opacity={0.15}>
              unknown
            </text>
          )}
        </svg>
      </div>

      {phase === 'dark' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleSend}>
          send the spy
        </motion.button>
      )}

      {phase === 'intel' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleCounter}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          counter their plan
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'counter' ? 'you know their mind. the battle is already won.'
          : revealed ? 'their plan is visible. pincer attack.'
            : phase === 'sending' ? 'the spy infiltrates...'
              : 'the camp is dark. you are blind.'}
      </span>

      {phase === 'counter' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          intel gathering
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'counter' ? 'empathy' : 'know the enemy'}
      </div>
    </div>
  );
}
