/**
 * STRATEGIST #3 -- 1303. The Tit-for-Tat (Reciprocity)
 * "Mirror the move. Forgive quickly, but enforce the boundary."
 * INTERACTION: Prisoner's Dilemma rounds -- cooperate or defect in response
 * STEALTH KBE: Boundary Enforcement -- Rational Reciprocity (K)
 *
 * COMPOSITOR: pattern_glitch / Circuit / work / knowing / tap / 1303
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

type Move = 'cooperate' | 'defect';
interface Round {
  opponent: Move;
  you?: Move;
  result?: string;
  score?: number;
}

const ROUNDS: Round[] = [
  { opponent: 'defect' },
  { opponent: 'defect' },
  { opponent: 'cooperate' },
];

export default function Strategist_TitForTat({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1303,
        isSeal: false,
      }}
      arrivalText="A game. Two players. Trust or betray."
      prompt="Blind trust is naive. Blind aggression is destructive. Mirror the move. Forgive quickly, but enforce the boundary."
      resonantText="Boundary enforcement. You mirrored defection with defection, then met cooperation with cooperation. Rational reciprocity is the algorithm that wins: be kind first, punish betrayal, forgive fast."
      afterglowCoda="Enforce the boundary."
      onComplete={onComplete}
    >
      {(verse) => <TitForTatInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TitForTatInteraction({ verse }: { verse: any }) {
  const [rounds, setRounds] = useState<Round[]>(ROUNDS.map(r => ({ ...r })));
  const [currentRound, setCurrentRound] = useState(0);
  const [done, setDone] = useState(false);

  const handlePlay = (move: Move) => {
    if (done || currentRound >= rounds.length) return;
    const updated = [...rounds];
    const opp = updated[currentRound].opponent;
    updated[currentRound].you = move;

    if (move === 'cooperate' && opp === 'cooperate') {
      updated[currentRound].result = 'mutual gain';
      updated[currentRound].score = 3;
    } else if (move === 'defect' && opp === 'defect') {
      updated[currentRound].result = 'mutual loss';
      updated[currentRound].score = 1;
    } else if (move === 'cooperate' && opp === 'defect') {
      updated[currentRound].result = 'exploited';
      updated[currentRound].score = 0;
    } else {
      updated[currentRound].result = 'you exploit';
      updated[currentRound].score = 5;
    }

    setRounds(updated);
    const next = currentRound + 1;
    if (next >= rounds.length) {
      setDone(true);
      setTimeout(() => verse.advance(), 3500);
    } else {
      setTimeout(() => setCurrentRound(next), 800);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const totalScore = rounds.reduce((s, r) => s + (r.score || 0), 0);

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Score */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>score</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {totalScore}
        </motion.span>
      </div>

      {/* Round history */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 240 }}>
        {rounds.map((round, i) => (
          <motion.div key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 6,
              background: verse.palette.primary,
              opacity: i <= currentRound ? 1 : 0.4,
            }}
            initial={false}
            animate={{
              backgroundColor: round.you
                ? (round.result === 'mutual gain' ? verse.palette.accent
                  : round.result === 'exploited' ? verse.palette.shadow
                    : verse.palette.primary)
                : verse.palette.primary,
              opacity: i <= currentRound ? 1 : 0.4,
            }}
          >
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint, width: 18 }}>
              {i + 1}
            </span>

            {/* Opponent move */}
            <div style={{
              ...navicueType.micro,
              color: round.opponent === 'defect' ? verse.palette.shadow : verse.palette.accent,
              opacity: i <= currentRound ? 0.6 : 0.2,
              width: 50,
            }}>
              {i <= currentRound ? round.opponent : '?'}
            </div>

            {/* Your move */}
            <div style={{
              ...navicueType.micro,
              color: round.you === 'defect' ? verse.palette.shadow
                : round.you === 'cooperate' ? verse.palette.accent
                  : verse.palette.textFaint,
              opacity: round.you ? 0.6 : 0.2,
              width: 50,
            }}>
              {round.you || (i === currentRound ? 'your turn' : '...')}
            </div>

            {/* Result */}
            <div style={{
              ...navicueType.micro,
              color: verse.palette.textFaint,
              opacity: 0.4, flex: 1, textAlign: 'right',
            }}>
              {round.result || ''}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current round indicator */}
      {!done && currentRound < rounds.length && (
        <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
            opponent plays:
          </span>
          <span style={{
            ...navicueType.data,
            color: rounds[currentRound].opponent === 'defect'
              ? verse.palette.shadow : verse.palette.accent,
          }}>
            {rounds[currentRound].opponent}
          </span>
        </div>
      )}

      {/* Action buttons */}
      {!done && currentRound < rounds.length && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{ ...btn.base, padding: '8px 16px' }}
            whileTap={btn.active}
            onClick={() => handlePlay('cooperate')}
          >
            cooperate
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '8px 16px' }}
            whileTap={btn.active}
            onClick={() => handlePlay('defect')}
          >
            defect
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'mirror. punish. forgive.'
          : `round ${currentRound + 1} of ${rounds.length}`}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          rational reciprocity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'boundary enforcement' : 'mirror the move'}
      </div>
    </div>
  );
}
