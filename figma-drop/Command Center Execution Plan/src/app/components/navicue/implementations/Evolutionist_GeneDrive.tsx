/**
 * EVOLUTIONIST #9 -- 1339. The Gene Drive
 * "One good habit, repeated enough, changes the whole lineage."
 * INTERACTION: Tap repeatedly to replicate a gene -- it spreads through the population
 * STEALTH KBE: Repetition -- Legacy (E)
 *
 * COMPOSITOR: witness_ritual / Circuit / night / embodying / tap / 1339
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

export default function Evolutionist_GeneDrive({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1339,
        isSeal: false,
      }}
      arrivalText="One gene. One carrier."
      prompt="One good habit, repeated enough, changes the whole lineage. Be the ancestor that changes the code."
      resonantText="Repetition. The gene spread through the entire population. Legacy is the gene drive of behavior: one good habit, practiced consistently, alters the trajectory of every generation that follows."
      afterglowCoda="Change the code."
      onComplete={onComplete}
    >
      {(verse) => <GeneDriveInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GeneDriveInteraction({ verse }: { verse: any }) {
  const [taps, setTaps] = useState(0);
  const [done, setDone] = useState(false);
  const TOTAL = 20;
  const TARGET = 8;

  const infected = Math.min(TOTAL, Math.floor((taps / TARGET) * TOTAL));

  const handleReplicate = () => {
    if (done) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= TARGET) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 160;

  // Population grid
  const cols = 5, rows = 4;
  const population = Array.from({ length: TOTAL }).map((_, i) => ({
    x: 30 + (i % cols) * 45,
    y: 20 + Math.floor(i / cols) * 35,
    hasGene: i < infected,
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>carriers</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {infected}/{TOTAL}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {population.map((p, i) => (
            <motion.g key={i}>
              {/* Cell body */}
              <motion.circle
                cx={p.x} cy={p.y} r={12}
                fill={p.hasGene ? verse.palette.accent : verse.palette.primary}
                animate={{
                  opacity: safeOpacity(p.hasGene ? 0.15 : 0.05),
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.circle
                cx={p.x} cy={p.y} r={12}
                fill="none"
                stroke={p.hasGene ? verse.palette.accent : verse.palette.primary}
                strokeWidth={0.8}
                animate={{
                  opacity: safeOpacity(p.hasGene ? 0.3 : 0.08),
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Gene marker (inner dot) */}
              {p.hasGene && (
                <motion.circle
                  cx={p.x} cy={p.y} r={4}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: safeOpacity(0.4), scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                />
              )}

              {/* Replication pulse */}
              {p.hasGene && i === infected - 1 && infected > 1 && (
                <motion.circle
                  cx={p.x} cy={p.y}
                  fill={verse.palette.accent}
                  initial={{ r: 4, opacity: 0.2 }}
                  animate={{ r: 20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </motion.g>
          ))}

          {/* Connection lines showing gene spread */}
          {infected > 1 && population.slice(0, infected).map((p, i) => {
            if (i === 0) return null;
            const prev = population[i - 1];
            return (
              <motion.line key={`spread-${i}`}
                x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
                stroke={verse.palette.accent}
                strokeWidth={0.3}
                strokeDasharray="2 3"
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.1) }}
                transition={{ delay: i * 0.02 }}
              />
            );
          })}

          {/* "100%" label when complete */}
          {done && (
            <motion.text
              x={W / 2} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              population changed
            </motion.text>
          )}
        </svg>
      </div>

      {!done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleReplicate}>
          replicate ({taps}/{TARGET})
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'one gene. whole lineage changed.'
          : infected > TOTAL * 0.5 ? 'the gene is spreading...'
            : infected > 0 ? 'repeat. the code propagates.'
              : 'one carrier. replicate the gene.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          legacy
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'repetition' : 'be the ancestor'}
      </div>
    </div>
  );
}
