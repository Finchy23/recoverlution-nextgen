/**
 * EVOLUTIONIST #1 -- 1331. The Mutation (Novelty)
 * "The weirdo is the backup plan for the future."
 * INTERACTION: Field of grey circles. One turns red. Environment shifts. Grey die. Red thrives.
 * STEALTH KBE: Uniqueness -- Diversity (B)
 *
 * COMPOSITOR: koan_paradox / Drift / morning / believing / tap / 1331
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Evolutionist_Mutation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1331,
        isSeal: false,
      }}
      arrivalText="A field of grey. All the same."
      prompt="The weirdo is the backup plan for the future. Do not suppress your oddity. It might be the adaptation that saves you."
      resonantText="Uniqueness. The mutant survived. Diversity is not a defect but an insurance policy against an unknown future. The grey were optimized for yesterday. The red was ready for tomorrow."
      afterglowCoda="Protect the mutation."
      onComplete={onComplete}
    >
      {(verse) => <MutationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function MutationInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'field' | 'mutant' | 'shift' | 'selection' | 'thrives'>('field');
  const MUTANT_IDX = 12;

  const handleProtect = () => {
    if (phase !== 'mutant') return;
    setPhase('shift');
    setTimeout(() => {
      setPhase('selection');
      setTimeout(() => {
        setPhase('thrives');
        setTimeout(() => verse.advance(), 3000);
      }, 1500);
    }, 1200);
  };

  useEffect(() => {
    if (phase === 'field') {
      const t = setTimeout(() => setPhase('mutant'), 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 160;

  // Grid of circles
  const cols = 6, rows = 4;
  const circles = Array.from({ length: cols * rows }).map((_, i) => ({
    x: 25 + (i % cols) * 35,
    y: 20 + Math.floor(i / cols) * 35,
    isMutant: i === MUTANT_IDX,
  }));

  const envShifted = phase === 'shift' || phase === 'selection' || phase === 'thrives';
  const greyDead = phase === 'selection' || phase === 'thrives';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>population</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'thrives' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'thrives' ? 'adapted' : phase === 'selection' ? 'selecting...' : greyDead ? 'shifting' : 'uniform'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Environment background tint */}
          {envShifted && (
            <motion.rect x={0} y={0} width={W} height={H} rx={6}
              fill={verse.palette.accent}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.04) }}
              transition={{ duration: 1 }}
            />
          )}

          {circles.map((c, i) => {
            const isMutant = c.isMutant;
            const showMutant = phase !== 'field';
            const dead = greyDead && !isMutant;

            return (
              <motion.g key={i}>
                <motion.circle
                  cx={c.x} cy={c.y}
                  r={dead ? 4 : 10}
                  fill={isMutant && showMutant ? verse.palette.accent : verse.palette.primary}
                  animate={{
                    opacity: safeOpacity(
                      dead ? 0.03
                        : isMutant && phase === 'thrives' ? 0.35
                          : isMutant && showMutant ? 0.2
                            : 0.08
                    ),
                    r: dead ? 3 : phase === 'thrives' && isMutant ? 14 : 10,
                  }}
                  transition={{ duration: 0.5, delay: dead ? i * 0.03 : 0 }}
                />
                {isMutant && showMutant && (
                  <motion.circle
                    cx={c.x} cy={c.y} r={10}
                    fill="none"
                    stroke={verse.palette.accent}
                    strokeWidth={0.8}
                    animate={{
                      opacity: safeOpacity(phase === 'thrives' ? 0.5 : 0.25),
                      r: phase === 'thrives' ? 14 : 10,
                    }}
                  />
                )}

                {/* Dead X marks */}
                {dead && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <line x1={c.x - 3} y1={c.y - 3} x2={c.x + 3} y2={c.y + 3}
                      stroke={verse.palette.shadow} strokeWidth={0.5} />
                    <line x1={c.x + 3} y1={c.y - 3} x2={c.x - 3} y2={c.y + 3}
                      stroke={verse.palette.shadow} strokeWidth={0.5} />
                  </motion.g>
                )}
              </motion.g>
            );
          })}

          {/* Mutant label */}
          {phase === 'mutant' && (
            <motion.text
              x={circles[MUTANT_IDX].x} y={circles[MUTANT_IDX].y + 22}
              textAnchor="middle" fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            >
              different
            </motion.text>
          )}

          {/* Thriving pulse */}
          {phase === 'thrives' && (
            <motion.circle
              cx={circles[MUTANT_IDX].x} cy={circles[MUTANT_IDX].y}
              fill={verse.palette.accent}
              initial={{ r: 14, opacity: 0.2 }}
              animate={{ r: 35, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </svg>
      </div>

      {phase === 'mutant' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleProtect}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          protect the mutation
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'thrives' ? 'the mutant thrives. the grey are gone.'
          : phase === 'selection' ? 'environment changed. grey cannot adapt.'
            : phase === 'shift' ? 'the environment is shifting...'
              : phase === 'mutant' ? 'one is different. it looks wrong.'
                : 'all the same. all grey.'}
      </span>

      {phase === 'thrives' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          diversity
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'thrives' ? 'uniqueness' : 'the oddity is the insurance'}
      </div>
    </div>
  );
}
