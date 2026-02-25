/**
 * EDITOR #5 -- 1255. The B-Roll (Context)
 * "Look at the B-Roll. You were fighting a battle no one saw."
 * INTERACTION: Tap to add context clips around the failure, reframing it
 * STEALTH KBE: Contextualization -- Self-Forgiveness (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / night / knowing / tap / 1255
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

const B_ROLL_CLIPS = [
  { id: 'sick', label: 'I was sick' },
  { id: 'tired', label: 'I was tired' },
  { id: 'tried', label: 'I tried anyway' },
];

export default function Editor_BRoll({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1255,
        isSeal: false,
      }}
      arrivalText='Main shot: "I failed."'
      prompt="You are judging the highlight reel. Look at the B-Roll. Look at the context. You were fighting a battle no one saw."
      resonantText="Contextualization. The failure was real. But so was the sickness, the exhaustion, the effort. Self-forgiveness is adding the B-Roll that the highlight reel left out."
      afterglowCoda="Add the context."
      onComplete={onComplete}
    >
      {(verse) => <BRollInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BRollInteraction({ verse }: { verse: any }) {
  const [added, setAdded] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleAdd = (id: string) => {
    if (added.includes(id) || done) return;
    const next = [...added, id];
    setAdded(next);
    if (next.length >= B_ROLL_CLIPS.length) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 280;
  const SCENE_H = 100;

  // Main shot + b-roll layout
  const totalClips = 1 + added.length;
  const clipWidth = Math.max(40, (SCENE_W - 40) / (1 + B_ROLL_CLIPS.length) - 4);
  const clipH = 55;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Edit timeline label */}
      <motion.span
        style={{ ...navicueType.micro, color: verse.palette.textFaint }}
        animate={{ opacity: 0.4 }}
      >
        {done ? 'full context' : `main shot only / ${added.length} b-roll added`}
      </motion.span>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Timeline ruler */}
          <line x1={10} y1={SCENE_H - 10} x2={SCENE_W - 10} y2={SCENE_H - 10}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.1)} />

          {/* Main shot: "I failed" */}
          <motion.g animate={{
            x: done ? 0 : 0,
          }}>
            <rect x={15} y={15} width={clipWidth} height={clipH} rx={4}
              fill={verse.palette.primary}
              opacity={safeOpacity(done ? 0.04 : 0.08)} />
            <rect x={15} y={15} width={clipWidth} height={clipH} rx={4}
              fill="none" stroke={done ? verse.palette.primary : verse.palette.shadow}
              strokeWidth={done ? 0.5 : 1}
              opacity={safeOpacity(done ? 0.1 : 0.2)} />
            <text x={15 + clipWidth / 2} y={15 + clipH / 2 + 4}
              textAnchor="middle"
              fill={done ? verse.palette.textFaint : verse.palette.shadow}
              style={navicueType.micro}>
              I failed
            </text>
            <text x={15 + clipWidth / 2} y={15 + clipH - 5}
              textAnchor="middle"
              fill={verse.palette.textFaint}
              style={{ ...navicueType.micro, fontSize: 11 }}
              opacity={0.3}>
              main
            </text>
          </motion.g>

          {/* B-roll clips (appear as added) */}
          {B_ROLL_CLIPS.map((clip, i) => {
            const isAdded = added.includes(clip.id);
            const x = 15 + (i + 1) * (clipWidth + 4);
            return (
              <motion.g
                key={clip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isAdded ? 1 : 0,
                  y: isAdded ? 0 : 10,
                }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <rect x={x} y={15} width={clipWidth} height={clipH} rx={4}
                  fill={verse.palette.accent}
                  opacity={safeOpacity(0.06)} />
                <rect x={x} y={15} width={clipWidth} height={clipH} rx={4}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5} opacity={safeOpacity(0.2)} />
                <text x={x + clipWidth / 2} y={15 + clipH / 2 + 4}
                  textAnchor="middle"
                  fill={verse.palette.accent}
                  style={navicueType.micro}>
                  {clip.label}
                </text>
                <text x={x + clipWidth / 2} y={15 + clipH - 5}
                  textAnchor="middle"
                  fill={verse.palette.textFaint}
                  style={{ ...navicueType.micro, fontSize: 11 }}
                  opacity={0.3}>
                  b-roll
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Add B-Roll buttons */}
      {!done && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {B_ROLL_CLIPS.filter(c => !added.includes(c.id)).map(clip => (
            <motion.button
              key={clip.id}
              style={{ ...btn.base, padding: '8px 14px' }}
              whileTap={btn.active}
              onClick={() => handleAdd(clip.id)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              + {clip.label}
            </motion.button>
          ))}
        </div>
      )}

      {/* Result */}
      {done && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ ...navicueType.choice, color: verse.palette.accent }}
        >
          "I did my best."
        </motion.span>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the full story changes everything'
          : 'add the footage the highlight reel left out'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          self-forgiveness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'contextualization' : 'add the b-roll'}
      </div>
    </div>
  );
}
