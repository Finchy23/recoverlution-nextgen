/**
 * POLITICIAN #4 -- 1354. The Strange Bedfellow
 * "There are no permanent friends. Only permanent interests."
 * INTERACTION: Your enemy. Shared threat. Shake hands. Ally for a day.
 * STEALTH KBE: Interest Alignment -- Strategic Flexibility (K)
 *
 * COMPOSITOR: koan_paradox / Arc / work / knowing / tap / 1354
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

export default function Politician_StrangeBedfellow({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1354,
        isSeal: false,
      }}
      arrivalText="Your enemy. Across the table."
      prompt="There are no permanent friends. There are no permanent enemies. There are only permanent interests. Shake the hand."
      resonantText="Interest alignment. You shook the hand of your enemy because the threat was bigger than the grudge. Strategic flexibility: the most dangerous leader is the one who cannot ally with yesterday's adversary."
      afterglowCoda="Shake the hand."
      onComplete={onComplete}
    >
      {(verse) => <StrangeBedfellowInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function StrangeBedfellowInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'enemies' | 'threat' | 'handshake' | 'allied'>('enemies');

  useEffect(() => {
    if (phase === 'enemies') {
      const t = setTimeout(() => setPhase('threat'), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleShake = () => {
    if (phase !== 'threat') return;
    setPhase('handshake');
    setTimeout(() => {
      setPhase('allied');
      setTimeout(() => verse.advance(), 3000);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2, CY = H / 2;
  const YOU_X = 55, ENEMY_X = 165;
  const THREAT_Y = 25;

  const allied = phase === 'handshake' || phase === 'allied';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>relation</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'allied' ? verse.palette.accent
            : phase === 'threat' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'allied' ? 'allied'
            : phase === 'handshake' ? 'aligning...'
              : phase === 'threat' ? 'shared threat'
                : 'enemies'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Shared threat (looming from above) */}
          {(phase === 'threat' || allied) && (
            <motion.g
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: allied ? 0.05 : 1,
                y: 0,
              }}
              transition={{ duration: 0.5 }}
            >
              <rect x={CX - 45} y={THREAT_Y - 5} width={90} height={25} rx={3}
                fill={verse.palette.shadow} opacity={safeOpacity(0.06)} />
              <text x={CX} y={THREAT_Y + 12} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '8px' }} opacity={0.3}>
                shared threat
              </text>
              {/* Arrows pointing down at both */}
              <line x1={CX - 20} y1={THREAT_Y + 20} x2={YOU_X + 10} y2={CY - 15}
                stroke={verse.palette.shadow} strokeWidth={0.5}
                strokeDasharray="3 3" opacity={safeOpacity(0.1)} />
              <line x1={CX + 20} y1={THREAT_Y + 20} x2={ENEMY_X - 10} y2={CY - 15}
                stroke={verse.palette.shadow} strokeWidth={0.5}
                strokeDasharray="3 3" opacity={safeOpacity(0.1)} />
            </motion.g>
          )}

          {/* You */}
          <motion.g
            animate={{ x: allied ? 15 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx={YOU_X} cy={CY} r={18}
              fill={allied ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(allied ? 0.1 : 0.06)} />
            <circle cx={YOU_X} cy={CY} r={18}
              fill="none"
              stroke={allied ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1}
              opacity={safeOpacity(allied ? 0.25 : 0.15)} />
            <text x={YOU_X} y={CY + 3} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '9px' }} opacity={0.25}>
              you
            </text>
          </motion.g>

          {/* Enemy */}
          <motion.g
            animate={{ x: allied ? -15 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx={ENEMY_X} cy={CY} r={18}
              fill={allied ? verse.palette.accent : verse.palette.shadow}
              opacity={safeOpacity(allied ? 0.1 : 0.06)} />
            <circle cx={ENEMY_X} cy={CY} r={18}
              fill="none"
              stroke={allied ? verse.palette.accent : verse.palette.shadow}
              strokeWidth={1}
              opacity={safeOpacity(allied ? 0.25 : 0.15)} />
            <text x={ENEMY_X} y={CY + 3} textAnchor="middle"
              fill={phase === 'enemies' ? verse.palette.shadow : verse.palette.text}
              style={{ fontSize: '9px' }} opacity={0.25}>
              {allied ? 'ally' : 'enemy'}
            </text>
          </motion.g>

          {/* Hostility line (before alliance) */}
          {!allied && (
            <line x1={YOU_X + 18} y1={CY} x2={ENEMY_X - 18} y2={CY}
              stroke={verse.palette.shadow} strokeWidth={0.5}
              strokeDasharray="2 3" opacity={safeOpacity(0.1)} />
          )}

          {/* Handshake (alliance line) */}
          {allied && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <line x1={YOU_X + 33} y1={CY} x2={ENEMY_X - 33} y2={CY}
                stroke={verse.palette.accent} strokeWidth={1.5}
                opacity={safeOpacity(0.3)} />
              {/* Handshake icon (two small lines meeting) */}
              <line x1={CX - 8} y1={CY - 3} x2={CX} y2={CY + 1}
                stroke={verse.palette.accent} strokeWidth={1.5}
                strokeLinecap="round" opacity={safeOpacity(0.4)} />
              <line x1={CX + 8} y1={CY - 3} x2={CX} y2={CY + 1}
                stroke={verse.palette.accent} strokeWidth={1.5}
                strokeLinecap="round" opacity={safeOpacity(0.4)} />
            </motion.g>
          )}

          {/* Alliance label */}
          {phase === 'allied' && (
            <motion.text
              x={CX} y={H - 8} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              ally for a day
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'threat' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleShake}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          shake the hand
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'allied' ? 'no permanent friends. only permanent interests.'
          : phase === 'handshake' ? 'shaking hands...'
            : phase === 'threat' ? 'a shared threat. bigger than the grudge.'
              : 'your enemy. across the table.'}
      </span>

      {phase === 'allied' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          strategic flexibility
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'allied' ? 'interest alignment' : 'permanent interests'}
      </div>
    </div>
  );
}
