/**
 * EDITOR #7 -- 1257. The Character Arc
 * "The weakness in Act 1 is the strength in Act 3."
 * INTERACTION: Tap to edit the character stat from "Coward" to "Brave in training"
 * STEALTH KBE: Growth Mindset -- Developmental Thinking (K)
 *
 * COMPOSITOR: poetic_precision / Arc / morning / knowing / tap / 1257
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

const STATS = [
  { trait: 'courage', old: 'coward', arc: 'brave in training', act: 1 },
  { trait: 'trust', old: 'guarded', arc: 'learning to open', act: 1 },
  { trait: 'voice', old: 'silent', arc: 'finding words', act: 1 },
];

export default function Editor_CharacterArc({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1257,
        isSeal: false,
      }}
      arrivalText="Character Sheet. Fixed stats."
      prompt="You are not a fixed character. You are in an arc. The weakness in Act 1 is the strength in Act 3. Play the arc."
      resonantText="Growth mindset. You crossed out the fixed label and wrote the arc. Developmental thinking sees every trait as a chapter, not a conclusion. Coward in Act 1 is always the hero in Act 3."
      afterglowCoda="Play the arc."
      onComplete={onComplete}
    >
      {(verse) => <CharacterArcInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CharacterArcInteraction({ verse }: { verse: any }) {
  const [edited, setEdited] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const handleEdit = (trait: string) => {
    if (edited.includes(trait) || done) return;
    const next = [...edited, trait];
    setEdited(next);
    if (next.length >= STATS.length) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const SCENE_W = 260;
  const ROW_H = 36;
  const SCENE_H = STATS.length * ROW_H + 30;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Character sheet header */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 4,
        border: `1px solid ${verse.palette.primary}15`,
      }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.4 }}>
          character sheet
        </span>
        <span style={{ ...navicueType.micro, color: verse.palette.accent, opacity: done ? 0.6 : 0 }}>
          {done && 'updated'}
        </span>
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {STATS.map((stat, i) => {
            const y = 15 + i * ROW_H;
            const isEdited = edited.includes(stat.trait);

            return (
              <motion.g
                key={stat.trait}
                style={{ cursor: isEdited ? 'default' : 'pointer' }}
                onClick={() => handleEdit(stat.trait)}
              >
                {/* Row background */}
                <rect x={10} y={y} width={SCENE_W - 20} height={ROW_H - 4} rx={4}
                  fill={verse.palette.primary}
                  opacity={safeOpacity(i % 2 === 0 ? 0.03 : 0.01)} />

                {/* Trait name */}
                <text x={25} y={y + ROW_H / 2 + 1} dominantBaseline="middle"
                  fill={verse.palette.textFaint}
                  style={navicueType.micro}>
                  {stat.trait}
                </text>

                {/* Old value (crossed out if edited) */}
                <motion.text
                  x={100} y={y + ROW_H / 2 + 1} dominantBaseline="middle"
                  fill={verse.palette.shadow}
                  style={navicueType.micro}
                  animate={{
                    opacity: isEdited ? 0.2 : 0.5,
                    textDecoration: isEdited ? 'line-through' : 'none',
                  }}
                >
                  {stat.old}
                </motion.text>

                {/* Arrow */}
                {isEdited && (
                  <motion.text
                    x={155} y={y + ROW_H / 2 + 1} dominantBaseline="middle"
                    fill={verse.palette.textFaint}
                    style={navicueType.micro}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                  >
                    {'\u2192'}
                  </motion.text>
                )}

                {/* New value (arc) */}
                {isEdited && (
                  <motion.text
                    x={170} y={y + ROW_H / 2 + 1} dominantBaseline="middle"
                    fill={verse.palette.accent}
                    style={navicueType.micro}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 0.7, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.arc}
                  </motion.text>
                )}

                {/* Edit icon (pencil hint) */}
                {!isEdited && (
                  <motion.g
                    animate={{ opacity: [0.15, 0.3, 0.15] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <line x1={SCENE_W - 30} y1={y + 10}
                      x2={SCENE_W - 22} y2={y + ROW_H - 14}
                      stroke={verse.palette.textFaint} strokeWidth={1} />
                  </motion.g>
                )}
              </motion.g>
            );
          })}

          {/* Act progression bar */}
          <motion.g>
            <text x={25} y={SCENE_H - 5} fill={verse.palette.textFaint}
              style={navicueType.micro} opacity={0.3}>
              act 1
            </text>
            <rect x={55} y={SCENE_H - 10} width={150} height={3} rx={1.5}
              fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
            <motion.rect
              x={55} y={SCENE_H - 10} height={3} rx={1.5}
              fill={verse.palette.accent}
              animate={{
                width: (edited.length / STATS.length) * 150,
                opacity: safeOpacity(0.3),
              }}
            />
            <text x={215} y={SCENE_H - 5} fill={verse.palette.accent}
              style={navicueType.micro}
              opacity={done ? 0.5 : 0.2}>
              act 3
            </text>
          </motion.g>
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'every flaw is Act 1 of a hero'
          : `tap a trait to rewrite it / ${STATS.length - edited.length} remaining`}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          developmental thinking
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'growth mindset' : 'edit the character sheet'}
      </div>
    </div>
  );
}
