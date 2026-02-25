/**
 * QUANTUM ARCHITECT #1 -- 1231. The Superposition (Both/And)
 * "While the box is closed, every future is alive."
 * INTERACTION: Tap "Both" instead of forcing alive/dead -- box glows with possibility
 * STEALTH KBE: Uncertainty Tolerance -- Negative Capability (B)
 *
 * COMPOSITOR: science_x_soul / Pulse / night / believing / tap / 1231
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function QuantumArchitect_Superposition({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1231,
        isSeal: false,
      }}
      arrivalText="A closed box. What is inside?"
      prompt="Stop trying to force the outcome. While the box is closed, every future is alive. Rest in the potential."
      resonantText="Uncertainty tolerance. You chose not to collapse the possibility. Negative capability is the strength to hold ambiguity without reaching for resolution. The box glows because you let it."
      afterglowCoda="Rest in the potential."
      onComplete={onComplete}
    >
      {(verse) => <SuperpositionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SuperpositionInteraction({ verse }: { verse: any }) {
  const [choice, setChoice] = useState<'none' | 'alive' | 'dead' | 'both'>('none');
  const [done, setDone] = useState(false);

  const handleChoice = (c: 'alive' | 'dead' | 'both') => {
    if (choice !== 'none') return;
    setChoice(c);
    if (c === 'both') {
      setTimeout(() => {
        setDone(true);
        setTimeout(() => verse.advance(), 3000);
      }, 1200);
    } else {
      // Collapse -- show the cost, then reset
      setTimeout(() => setChoice('none'), 2000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const btnFaint = immersiveTapButton(verse.palette, 'faint');
  const SCENE_W = 180;
  const SCENE_H = 140;

  const isBoth = choice === 'both';
  const isCollapsed = choice === 'alive' || choice === 'dead';

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Box visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Box body */}
          <motion.rect
            x={40} y={30} width={100} height={80} rx={6}
            fill={verse.palette.accent}
            stroke={verse.palette.accent}
            strokeWidth={1}
            animate={{
              opacity: isBoth
                ? safeOpacity(0.2)
                : isCollapsed
                  ? safeOpacity(0.05)
                  : safeOpacity(0.08),
              strokeOpacity: isBoth ? 0.5 : 0.2,
            }}
            transition={{ duration: 0.8 }}
          />

          {/* Lid */}
          <motion.path
            d="M 35,30 L 90,15 L 145,30"
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={1}
            animate={{
              opacity: isCollapsed ? safeOpacity(0.1) : safeOpacity(0.3),
            }}
          />

          {/* Superposition glow (both state) */}
          {isBoth && (
            <motion.g>
              <motion.rect
                x={40} y={30} width={100} height={80} rx={6}
                fill={verse.palette.accent}
                animate={{
                  opacity: [safeOpacity(0.05), safeOpacity(0.15), safeOpacity(0.05)],
                }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              />
              {/* Superposition wave inside */}
              <motion.path
                d="M 55,70 Q 70,50 90,70 Q 110,90 125,70"
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1}
                animate={{
                  d: [
                    'M 55,70 Q 70,50 90,70 Q 110,90 125,70',
                    'M 55,70 Q 70,85 90,70 Q 110,55 125,70',
                    'M 55,70 Q 70,50 90,70 Q 110,90 125,70',
                  ],
                  opacity: [safeOpacity(0.2), safeOpacity(0.4), safeOpacity(0.2)],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.g>
          )}

          {/* Question mark (before choice) */}
          {choice === 'none' && (
            <motion.text
              x={90} y={78} textAnchor="middle"
              fill={verse.palette.textFaint}
              style={{ ...navicueType.choice, fontSize: 22 }}
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ?
            </motion.text>
          )}

          {/* Collapsed state labels */}
          {isCollapsed && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
            >
              <text x={90} y={72} textAnchor="middle"
                fill={verse.palette.shadow} style={navicueType.micro}>
                {choice === 'alive' ? 'alive' : 'dead'}
              </text>
              <text x={90} y={88} textAnchor="middle"
                fill={verse.palette.shadow} style={navicueType.micro}>
                collapsed. try again.
              </text>
            </motion.g>
          )}

          {/* "Possibility" label when both */}
          {isBoth && (
            <motion.text
              x={90} y={75} textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.5 }}
            >
              possibility
            </motion.text>
          )}
        </svg>
      </div>

      {/* Choice buttons */}
      {choice === 'none' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{ ...btnFaint.base, padding: '10px 16px' }}
            whileTap={btnFaint.active}
            onClick={() => handleChoice('alive')}
          >
            alive
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '10px 16px' }}
            whileTap={btn.active}
            onClick={() => handleChoice('both')}
          >
            both
          </motion.button>
          <motion.button
            style={{ ...btnFaint.base, padding: '10px 16px' }}
            whileTap={btnFaint.active}
            onClick={() => handleChoice('dead')}
          >
            dead
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'every future is alive'
          : isCollapsed
            ? 'you forced an answer. the potential collapsed.'
            : isBoth
              ? 'the box glows'
              : 'the cat is alive and dead'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          negative capability
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'uncertainty tolerance' : 'what is in the box?'}
      </div>
    </div>
  );
}
