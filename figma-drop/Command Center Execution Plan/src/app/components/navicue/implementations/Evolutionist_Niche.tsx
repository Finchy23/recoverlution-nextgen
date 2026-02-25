/**
 * EVOLUTIONIST #3 -- 1333. The Niche (Specialization)
 * "Find the empty space. Dominate the niche. Be the best moss."
 * INTERACTION: Try tall tree (fail). Try moss (success).
 * STEALTH KBE: Differentiation -- Blue Ocean Strategy (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / work / knowing / tap / 1333
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

export default function Evolutionist_Niche({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1333,
        isSeal: false,
      }}
      arrivalText="A crowded forest. No light."
      prompt="Do not compete where you are weak. Find the empty space. Dominate the niche. Be the best moss in the world."
      resonantText="Differentiation. You found the niche where no one else could survive and dominated it. Blue Ocean Strategy: stop fighting in the red ocean of competition. Create your own space."
      afterglowCoda="Be the best moss."
      onComplete={onComplete}
    >
      {(verse) => <NicheInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NicheInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'forest' | 'trytree' | 'fail' | 'trymoss' | 'success'>('forest');

  const handleTryTree = () => {
    if (phase !== 'forest') return;
    setPhase('trytree');
    setTimeout(() => setPhase('fail'), 1500);
  };

  const handleTryMoss = () => {
    if (phase !== 'fail') return;
    setPhase('trymoss');
    setTimeout(() => {
      setPhase('success');
      setTimeout(() => verse.advance(), 3000);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 170;

  // Forest trees (tall, crowded)
  const trees = [
    { x: 35, h: 110 }, { x: 65, h: 120 }, { x: 95, h: 115 },
    { x: 125, h: 125 }, { x: 155, h: 118 }, { x: 185, h: 112 },
  ];

  // Ground level
  const GROUND = H - 15;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>strategy</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'success' ? verse.palette.accent
            : phase === 'fail' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'success' ? 'niche found'
            : phase === 'fail' ? 'outcompeted'
              : phase === 'trytree' ? 'growing...'
                : 'seeking'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Ground */}
          <line x1={10} y1={GROUND} x2={W - 10} y2={GROUND}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.1)} />

          {/* Existing tall trees */}
          {trees.map((tree, i) => (
            <g key={i}>
              {/* Trunk */}
              <rect x={tree.x - 3} y={GROUND - tree.h} width={6} height={tree.h} rx={1}
                fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
              {/* Canopy */}
              <circle cx={tree.x} cy={GROUND - tree.h - 10} r={15}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
            </g>
          ))}

          {/* Your tree attempt (between trees, crushed) */}
          {(phase === 'trytree' || phase === 'fail') && (
            <motion.g>
              <motion.rect
                x={78} y={GROUND} width={4} rx={1}
                fill={phase === 'fail' ? verse.palette.shadow : verse.palette.accent}
                initial={{ height: 0, y: GROUND }}
                animate={{
                  height: phase === 'fail' ? 15 : 40,
                  y: phase === 'fail' ? GROUND - 15 : GROUND - 40,
                  opacity: safeOpacity(phase === 'fail' ? 0.1 : 0.2),
                }}
                transition={{ duration: 0.8 }}
              />
              {phase === 'fail' && (
                <motion.text
                  x={80} y={GROUND - 22} textAnchor="middle"
                  fill={verse.palette.shadow} style={{ fontSize: '7px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                >
                  no light
                </motion.text>
              )}
            </motion.g>
          )}

          {/* Moss (on the ground/rocks, in the empty niche) */}
          {(phase === 'trymoss' || phase === 'success') && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Moss patches along the ground */}
              {[25, 50, 80, 110, 140, 170, 195].map((x, i) => (
                <motion.ellipse key={i}
                  cx={x} cy={GROUND - 2}
                  rx={8 + (i % 3) * 3} ry={3}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: safeOpacity(phase === 'success' ? 0.25 : 0.12),
                    scale: 1,
                  }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                />
              ))}

              {/* Rock with moss */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ellipse cx={W / 2} cy={GROUND - 5} rx={18} ry={8}
                  fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
                <ellipse cx={W / 2} cy={GROUND - 9} rx={15} ry={4}
                  fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              </motion.g>

              {/* Niche label */}
              {phase === 'success' && (
                <motion.text
                  x={W / 2} y={GROUND + 12} textAnchor="middle"
                  fill={verse.palette.accent} style={navicueType.micro}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.5 }}
                >
                  the floor is yours
                </motion.text>
              )}
            </motion.g>
          )}

          {/* Canopy darkness indicator */}
          <motion.rect x={10} y={10} width={W - 20} height={30} rx={4}
            fill={verse.palette.primary}
            animate={{ opacity: safeOpacity(0.03) }}
          />
          <text x={W / 2} y={28} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.15}>
            canopy (taken)
          </text>
        </svg>
      </div>

      {phase === 'forest' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleTryTree}>
          grow tall (compete)
        </motion.button>
      )}

      {phase === 'fail' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleTryMoss}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          be the moss (niche)
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'success' ? 'the floor was empty. you dominated it.'
          : phase === 'trymoss' ? 'finding the empty space...'
            : phase === 'fail' ? 'outcompeted. the canopy is taken.'
              : phase === 'trytree' ? 'growing... no light reaches you.'
                : 'a crowded forest. where do you fit?'}
      </span>

      {phase === 'success' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          blue ocean strategy
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'success' ? 'differentiation' : 'find the empty space'}
      </div>
    </div>
  );
}
