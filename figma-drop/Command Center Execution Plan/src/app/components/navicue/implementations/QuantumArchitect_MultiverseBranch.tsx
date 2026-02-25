/**
 * QUANTUM ARCHITECT #4 -- 1234. The Multiverse Branch
 * "Do not mourn the other life. Walk the Prime Path."
 * INTERACTION: Tap to choose a path -- the unchosen fades to ghost, then vanishes on commit
 * STEALTH KBE: Commitment -- Focus (B)
 *
 * COMPOSITOR: witness_ritual / Arc / social / believing / tap / 1234
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

export default function QuantumArchitect_MultiverseBranch({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1234,
        isSeal: false,
      }}
      arrivalText="A fork. Two futures."
      prompt="The other life exists in shadow. Do not mourn it. You are on the Prime Path now. Walk it."
      resonantText="Commitment. You chose and the ghost path faded. Focus is not about the path you took. It is about the paths you let dissolve. Every commitment is a small death that feeds a larger life."
      afterglowCoda="Walk the Prime Path."
      onComplete={onComplete}
    >
      {(verse) => <MultiverseBranchInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function MultiverseBranchInteraction({ verse }: { verse: any }) {
  const [chosen, setChosen] = useState<'none' | 'left' | 'right'>('none');
  const [committed, setCommitted] = useState(false);
  const [ghostFaded, setGhostFaded] = useState(false);
  const [done, setDone] = useState(false);

  const handleChoose = (side: 'left' | 'right') => {
    if (chosen !== 'none') return;
    setChosen(side);
  };

  const handleCommit = () => {
    if (committed) return;
    setCommitted(true);
    setTimeout(() => setGhostFaded(true), 1500);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 2500);
    }, 2500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 180;

  const leftPath = 'M 130,160 Q 80,120 60,70 Q 50,40 40,20';
  const rightPath = 'M 130,160 Q 180,120 200,70 Q 210,40 220,20';
  const primePath = chosen === 'left' ? leftPath : rightPath;
  const ghostPath = chosen === 'left' ? rightPath : leftPath;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Decision node */}
          <circle cx={130} cy={160} r={5}
            fill={verse.palette.primary}
            opacity={safeOpacity(0.3)} />
          <text x={130} y={178} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            now
          </text>

          {/* Left branch */}
          <motion.path
            d={leftPath}
            fill="none"
            stroke={
              chosen === 'left'
                ? verse.palette.accent
                : chosen === 'right'
                  ? verse.palette.primary
                  : verse.palette.primary
            }
            strokeWidth={chosen === 'left' ? 2 : 1}
            animate={{
              opacity: safeOpacity(
                chosen === 'none'
                  ? 0.25
                  : chosen === 'left'
                    ? 0.5
                    : ghostFaded
                      ? 0
                      : 0.08
              ),
            }}
            transition={{ duration: ghostFaded ? 1.5 : 0.5 }}
            strokeDasharray={chosen === 'right' ? '4 4' : 'none'}
          />

          {/* Right branch */}
          <motion.path
            d={rightPath}
            fill="none"
            stroke={
              chosen === 'right'
                ? verse.palette.accent
                : chosen === 'left'
                  ? verse.palette.primary
                  : verse.palette.primary
            }
            strokeWidth={chosen === 'right' ? 2 : 1}
            animate={{
              opacity: safeOpacity(
                chosen === 'none'
                  ? 0.25
                  : chosen === 'right'
                    ? 0.5
                    : ghostFaded
                      ? 0
                      : 0.08
              ),
            }}
            transition={{ duration: ghostFaded ? 1.5 : 0.5 }}
            strokeDasharray={chosen === 'left' ? '4 4' : 'none'}
          />

          {/* Branch labels */}
          {chosen === 'none' && (
            <>
              <motion.g
                style={{ cursor: 'pointer' }}
                onClick={() => handleChoose('left')}
              >
                <circle cx={40} cy={20} r={12}
                  fill={verse.palette.accent} opacity={safeOpacity(0.08)} />
                <text x={40} y={24} textAnchor="middle"
                  fill={verse.palette.textFaint} style={navicueType.micro}>
                  A
                </text>
              </motion.g>
              <motion.g
                style={{ cursor: 'pointer' }}
                onClick={() => handleChoose('right')}
              >
                <circle cx={220} cy={20} r={12}
                  fill={verse.palette.accent} opacity={safeOpacity(0.08)} />
                <text x={220} y={24} textAnchor="middle"
                  fill={verse.palette.textFaint} style={navicueType.micro}>
                  B
                </text>
              </motion.g>
            </>
          )}

          {/* Chosen destination glow */}
          {chosen !== 'none' && (
            <motion.circle
              cx={chosen === 'left' ? 40 : 220}
              cy={20}
              r={14}
              fill={verse.palette.accent}
              animate={{
                opacity: [safeOpacity(0.05), safeOpacity(0.12), safeOpacity(0.05)],
              }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
          )}

          {/* Ghost path label */}
          {chosen !== 'none' && !ghostFaded && (
            <motion.text
              x={chosen === 'left' ? 220 : 40}
              y={12}
              textAnchor="middle"
              fill={verse.palette.textFaint}
              style={navicueType.micro}
              animate={{
                opacity: committed ? [safeOpacity(0.3), 0] : safeOpacity(0.3),
              }}
              transition={committed ? { duration: 1.5 } : {}}
            >
              ghost path
            </motion.text>
          )}

          {/* Prime path label */}
          {committed && (
            <motion.text
              x={chosen === 'left' ? 40 : 220}
              y={12}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5 }}
            >
              prime path
            </motion.text>
          )}

          {/* Walking dot on prime path */}
          {committed && (
            <motion.circle
              r={4}
              fill={verse.palette.accent}
              opacity={safeOpacity(0.5)}
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              style={{
                offsetPath: `path('${primePath}')`,
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          )}
        </svg>
      </div>

      {/* Choose buttons */}
      {chosen === 'none' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            style={{ ...btn.base, padding: '10px 20px' }}
            whileTap={btn.active}
            onClick={() => handleChoose('left')}
          >
            path A
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '10px 20px' }}
            whileTap={btn.active}
            onClick={() => handleChoose('right')}
          >
            path B
          </motion.button>
        </div>
      )}

      {/* Commit button */}
      {chosen !== 'none' && !committed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleCommit}
        >
          commit. let the other go.
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the ghost path dissolved'
          : committed
            ? 'walking...'
            : chosen !== 'none'
              ? 'the other path is still there. let it go.'
              : 'two paths diverge'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          focus
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'commitment' : 'choose a path'}
      </div>
    </div>
  );
}
