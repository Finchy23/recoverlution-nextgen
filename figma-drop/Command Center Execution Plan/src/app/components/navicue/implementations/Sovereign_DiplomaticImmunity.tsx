/**
 * SOVEREIGN #7 -- 1377. The Diplomatic Immunity
 * "The laws of their opinion do not apply here."
 * INTERACTION: An insult arrives. Grant yourself immunity. It bounces off.
 * STEALTH KBE: Autonomy -- Emotional Sovereignty (B)
 *
 * COMPOSITOR: koan_paradox / Pulse / night / believing / tap / 1377
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

export default function Sovereign_DiplomaticImmunity({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1377,
        isSeal: false,
      }}
      arrivalText="An insult arrives."
      prompt="You are a Sovereign State. The laws of their opinion do not apply here unless you ratify them. Reject the treaty."
      resonantText="Autonomy. You granted yourself immunity and the insult bounced off. Emotional sovereignty: no external opinion has jurisdiction inside your borders unless you sign the treaty. Reject it."
      afterglowCoda="Reject the treaty."
      onComplete={onComplete}
    >
      {(verse) => <DiplomaticImmunityInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DiplomaticImmunityInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'incoming' | 'shield' | 'bounce' | 'immune'>('incoming');

  useEffect(() => {
    if (phase === 'incoming') {
      const t = setTimeout(() => {}, 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleImmunity = () => {
    if (phase !== 'incoming') return;
    setPhase('shield');
    setTimeout(() => {
      setPhase('bounce');
      setTimeout(() => {
        setPhase('immune');
        setTimeout(() => verse.advance(), 3000);
      }, 800);
    }, 1000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;

  const YOU_X = CX + 30;
  const INSULT_START = 20;
  const shielded = phase === 'shield' || phase === 'bounce' || phase === 'immune';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>jurisdiction</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'immune' ? verse.palette.accent
            : shielded ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'immune' ? 'sovereign'
            : phase === 'bounce' ? 'rejected'
              : shielded ? 'immunity granted'
                : 'vulnerable'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* You (sovereign state) */}
          <circle cx={YOU_X} cy={CY} r={18}
            fill={shielded ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(shielded ? 0.1 : 0.06)} />
          <circle cx={YOU_X} cy={CY} r={18}
            fill="none"
            stroke={shielded ? verse.palette.accent : verse.palette.primary}
            strokeWidth={1}
            opacity={safeOpacity(shielded ? 0.25 : 0.12)} />
          <text x={YOU_X} y={CY + 3} textAnchor="middle"
            fill={verse.palette.text} style={{ fontSize: '9px' }} opacity={0.25}>
            you
          </text>

          {/* Shield (immunity field) */}
          {shielded && (
            <motion.circle
              cx={YOU_X} cy={CY} r={30}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={1.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.25), scale: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Insult projectile */}
          <motion.g
            animate={{
              x: phase === 'bounce' ? -60
                : phase === 'immune' ? -100
                  : shielded ? YOU_X - INSULT_START - 32
                    : 0,
              opacity: phase === 'immune' ? 0 : 1,
            }}
            transition={{
              x: { duration: phase === 'bounce' ? 0.4 : 1.5 },
              opacity: { duration: 0.5 },
            }}
          >
            {/* Insult body */}
            <rect x={INSULT_START} y={CY - 10} width={50} height={20} rx={3}
              fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
            <rect x={INSULT_START} y={CY - 10} width={50} height={20} rx={3}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={0.8} opacity={safeOpacity(0.12)} />
            <text x={INSULT_START + 25} y={CY + 4} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '8px' }} opacity={0.25}>
              insult
            </text>

            {/* Direction arrow */}
            {phase === 'incoming' && (
              <motion.line
                x1={INSULT_START + 50} y1={CY}
                x2={INSULT_START + 62} y2={CY}
                stroke={verse.palette.shadow} strokeWidth={1}
                animate={{ opacity: [safeOpacity(0.1), safeOpacity(0.2), safeOpacity(0.1)] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            )}
          </motion.g>

          {/* Bounce sparks */}
          {phase === 'bounce' && (
            <motion.g
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {[0, 1, 2].map(i => {
                const angle = -Math.PI * 0.8 + i * 0.3;
                return (
                  <motion.line key={i}
                    x1={YOU_X - 30} y1={CY}
                    stroke={verse.palette.accent} strokeWidth={1}
                    initial={{
                      x2: YOU_X - 30,
                      y2: CY,
                    }}
                    animate={{
                      x2: YOU_X - 30 + Math.cos(angle) * 20,
                      y2: CY + Math.sin(angle) * 20,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                );
              })}
            </motion.g>
          )}

          {/* Treaty stamp (rejected) */}
          {phase === 'immune' && (
            <motion.g
              initial={{ opacity: 0, rotate: -15 }}
              animate={{ opacity: 0.4, rotate: 0 }}
              transition={{ delay: 0.3 }}
            >
              <rect x={CX - 45} y={H - 35} width={90} height={22} rx={3}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1.5} />
              <text x={CX} y={H - 20} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '9px', fontWeight: 500 }}>
                TREATY REJECTED
              </text>
            </motion.g>
          )}

          {/* Immunity label */}
          {shielded && (
            <text x={YOU_X} y={CY + 40} textAnchor="middle"
              fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.3}>
              diplomatic immunity
            </text>
          )}
        </svg>
      </div>

      {phase === 'incoming' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleImmunity}>
          grant immunity
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'immune' ? 'their laws do not apply here.'
          : phase === 'bounce' ? 'bounced.'
            : shielded ? 'immunity active...'
              : 'an insult incoming. it will land unless...'}
      </span>

      {phase === 'immune' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          emotional sovereignty
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'immune' ? 'autonomy' : 'reject the treaty'}
      </div>
    </div>
  );
}
