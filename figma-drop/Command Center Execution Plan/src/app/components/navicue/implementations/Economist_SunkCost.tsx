/**
 * ECONOMIST #2 -- 1342. The Sunk Cost
 * "Do not throw good time after bad money."
 * INTERACTION: Bad movie. Paid $20. Stay or leave?
 * STEALTH KBE: Cutting Losses -- Rational Choice (B)
 *
 * COMPOSITOR: witness_ritual / Pulse / night / believing / tap / 1342
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

export default function Economist_SunkCost({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1342,
        isSeal: false,
      }}
      arrivalText="A bad movie. You paid $20."
      prompt="The money is gone. Your time is still yours. Do not throw good time after bad money. Walk out."
      resonantText="Cutting losses. You walked out and reclaimed your time. Rational choice: the $20 is gone whether you stay or leave. The only variable is your remaining hours. Spend them well."
      afterglowCoda="Walk out."
      onComplete={onComplete}
    >
      {(verse) => <SunkCostInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SunkCostInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'watching' | 'decision' | 'left' | 'relief'>('watching');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (phase !== 'watching') return;
    const interval = setInterval(() => {
      setElapsed(e => {
        if (e >= 45) {
          setPhase('decision');
          clearInterval(interval);
        }
        return e + 1;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  const handleLeave = () => {
    if (phase !== 'decision') return;
    setPhase('left');
    setTimeout(() => {
      setPhase('relief');
      setTimeout(() => verse.advance(), 3000);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 140;
  const CX = W / 2;

  // Movie screen
  const SCREEN_W = 140, SCREEN_H = 70;
  const SCREEN_X = CX - SCREEN_W / 2;
  const SCREEN_Y = 15;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>spent</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'relief' ? verse.palette.accent : verse.palette.shadow,
        }}>
          {phase === 'relief' ? 'time saved' : `$20 + ${elapsed} min`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Movie screen */}
          <motion.rect
            x={SCREEN_X} y={SCREEN_Y} width={SCREEN_W} height={SCREEN_H} rx={3}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(
                phase === 'left' || phase === 'relief' ? 0.02 : 0.06
              ),
            }}
            transition={{ duration: 0.4 }}
          />
          <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_W} height={SCREEN_H} rx={3}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.1)} />

          {/* Static/noise on screen (bad movie) */}
          {phase === 'watching' || phase === 'decision' ? (
            <g>
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.rect key={i}
                  x={SCREEN_X + 5 + (i % 5) * 26}
                  y={SCREEN_Y + 5 + Math.floor(i / 5) * 22}
                  width={20} height={16} rx={1}
                  fill={verse.palette.primary}
                  animate={{
                    opacity: [safeOpacity(0.02), safeOpacity(0.05), safeOpacity(0.02)],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.4 + (i * 0.1),
                    delay: i * 0.05,
                  }}
                />
              ))}
              <text x={CX} y={SCREEN_Y + SCREEN_H / 2 + 4} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '9px' }} opacity={0.25}>
                terrible
              </text>
            </g>
          ) : null}

          {/* Ticket stub (sunk cost) */}
          <g>
            <rect x={CX - 22} y={SCREEN_Y + SCREEN_H + 8}
              width={44} height={18} rx={2}
              fill={verse.palette.primary} opacity={safeOpacity(0.05)} />
            <text x={CX} y={SCREEN_Y + SCREEN_H + 20} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '8px' }}
              opacity={phase === 'relief' ? 0.15 : 0.3}>
              $20 ticket
            </text>
            {/* Strikethrough when leaving */}
            {(phase === 'left' || phase === 'relief') && (
              <motion.line
                x1={CX - 20} y1={SCREEN_Y + SCREEN_H + 17}
                x2={CX + 20} y2={SCREEN_Y + SCREEN_H + 17}
                stroke={verse.palette.accent} strokeWidth={1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: safeOpacity(0.3) }}
                transition={{ duration: 0.3 }}
              />
            )}
          </g>

          {/* Time reclaimed (after leaving) */}
          {phase === 'relief' && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <text x={CX} y={SCREEN_Y + SCREEN_H / 2} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.choice}
                opacity={0.5}>
                90 min reclaimed
              </text>
            </motion.g>
          )}

          {/* Exit indicator */}
          {(phase === 'left' || phase === 'relief') && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
            >
              <line x1={W - 20} y1={SCREEN_Y + SCREEN_H / 2 - 5}
                x2={W - 10} y2={SCREEN_Y + SCREEN_H / 2}
                stroke={verse.palette.accent} strokeWidth={1} />
              <line x1={W - 20} y1={SCREEN_Y + SCREEN_H / 2 + 5}
                x2={W - 10} y2={SCREEN_Y + SCREEN_H / 2}
                stroke={verse.palette.accent} strokeWidth={1} />
              <text x={W - 15} y={SCREEN_Y + SCREEN_H / 2 + 15}
                textAnchor="middle" fill={verse.palette.accent}
                style={{ fontSize: '7px' }} opacity={0.3}>
                exit
              </text>
            </motion.g>
          )}

          {/* Time drain indicator */}
          {phase === 'decision' && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '8px' }}
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              still draining...
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'decision' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleLeave}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          walk out
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'relief' ? 'the money is gone. the time was saved.'
          : phase === 'left' ? 'you walked out.'
            : phase === 'decision' ? 'the $20 is spent either way. your time is not.'
              : 'watching... this is terrible.'}
      </span>

      {phase === 'relief' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          rational choice
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'relief' ? 'cutting losses' : 'do not throw good time after bad money'}
      </div>
    </div>
  );
}
