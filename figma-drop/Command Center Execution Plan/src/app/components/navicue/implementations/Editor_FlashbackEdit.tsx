/**
 * EDITOR #3 -- 1253. The Flashback Edit
 * "Re-cut the scene. Highlight the survivor."
 * INTERACTION: Tap to zoom into the strength moment within a rejection memory
 * STEALTH KBE: Narrative Agency -- Empowerment (K)
 *
 * COMPOSITOR: witness_ritual / Pulse / night / knowing / tap / 1253
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

const TIMELINE_FRAMES = [
  { id: 'approach', label: 'approached', type: 'neutral' },
  { id: 'asked', label: 'asked', type: 'neutral' },
  { id: 'rejected', label: 'rejected', type: 'pain' },
  { id: 'stood', label: 'stood up', type: 'strength' },
  { id: 'walked', label: 'walked away', type: 'strength' },
  { id: 'survived', label: 'survived', type: 'strength' },
];

export default function Editor_FlashbackEdit({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1253,
        isSeal: false,
      }}
      arrivalText='Memory: "Rejection."'
      prompt="You are highlighting the victim. Re-cut the scene. Highlight the survivor. It is the same footage, different story."
      resonantText="Narrative agency. You zoomed past the wound and found the moment you stood up. Empowerment is not erasing the pain. It is editing which part of the footage gets the close-up."
      afterglowCoda="Highlight the survivor."
      onComplete={onComplete}
    >
      {(verse) => <FlashbackEditInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FlashbackEditInteraction({ verse }: { verse: any }) {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleHighlight = (id: string) => {
    if (highlighted) return;
    const frame = TIMELINE_FRAMES.find(f => f.id === id);
    if (!frame) return;

    setHighlighted(id);

    if (frame.type === 'strength') {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    } else {
      // Wrong highlight -- reset
      setTimeout(() => setHighlighted(null), 1500);
    }
  };

  const SCENE_W = 280;
  const SCENE_H = 130;
  const FRAME_W = 38;
  const GAP = 6;
  const startX = (SCENE_W - (TIMELINE_FRAMES.length * (FRAME_W + GAP) - GAP)) / 2;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Film strip header */}
      <motion.span
        style={{ ...navicueType.micro, color: verse.palette.textFaint }}
        animate={{ opacity: 0.4 }}
      >
        {done ? 'director\'s highlight' : 'original highlight: rejection'}
      </motion.span>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Film strip sprocket holes */}
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={`top-${i}`}
              x={10 + i * 20} y={8} width={6} height={4} rx={1}
              fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={`bot-${i}`}
              x={10 + i * 20} y={SCENE_H - 12} width={6} height={4} rx={1}
              fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
          ))}

          {/* Timeline frames */}
          {TIMELINE_FRAMES.map((frame, i) => {
            const x = startX + i * (FRAME_W + GAP);
            const isHighlighted = highlighted === frame.id;
            const isStrength = frame.type === 'strength';
            const isPain = frame.type === 'pain';
            const isDimmed = done && !isStrength;

            // Original highlight is on "rejected"
            const isOriginalHighlight = !highlighted && isPain;

            return (
              <motion.g
                key={frame.id}
                style={{ cursor: highlighted ? 'default' : 'pointer' }}
                onClick={() => handleHighlight(frame.id)}
              >
                {/* Frame border */}
                <motion.rect
                  x={x} y={20}
                  width={FRAME_W} height={SCENE_H - 40}
                  rx={3}
                  fill={
                    isHighlighted
                      ? isStrength
                        ? verse.palette.accent
                        : verse.palette.shadow
                      : verse.palette.primary
                  }
                  animate={{
                    opacity: safeOpacity(
                      isHighlighted ? 0.15
                        : isDimmed ? 0.02
                          : isOriginalHighlight ? 0.08
                            : 0.04
                    ),
                  }}
                  transition={{ duration: 0.4 }}
                />
                <motion.rect
                  x={x} y={20}
                  width={FRAME_W} height={SCENE_H - 40}
                  rx={3}
                  fill="none"
                  stroke={
                    isHighlighted
                      ? isStrength ? verse.palette.accent : verse.palette.shadow
                      : isOriginalHighlight
                        ? verse.palette.shadow
                        : verse.palette.primary
                  }
                  strokeWidth={isHighlighted || isOriginalHighlight ? 1.5 : 0.5}
                  animate={{
                    opacity: safeOpacity(
                      isHighlighted ? 0.5
                        : isDimmed ? 0.05
                          : isOriginalHighlight ? 0.3
                            : 0.12
                    ),
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Frame label */}
                <motion.text
                  x={x + FRAME_W / 2}
                  y={SCENE_H / 2 + 4}
                  textAnchor="middle"
                  fill={
                    isHighlighted
                      ? isStrength ? verse.palette.accent : verse.palette.shadow
                      : verse.palette.textFaint
                  }
                  style={{ ...navicueType.micro, fontSize: 11 }}
                  animate={{
                    opacity: isDimmed ? 0.15 : isHighlighted ? 0.8 : 0.4,
                  }}
                >
                  {frame.label}
                </motion.text>

                {/* Zoom indicator for strength frames */}
                {done && isStrength && (
                  <motion.rect
                    x={x - 2} y={18}
                    width={FRAME_W + 4} height={SCENE_H - 36}
                    rx={4}
                    fill="none"
                    stroke={verse.palette.accent}
                    strokeWidth={1}
                    strokeDasharray="3 2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.3) }}
                    transition={{ delay: i * 0.1 }}
                  />
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Wrong choice feedback */}
      {highlighted && !done && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          style={{ ...navicueType.micro, color: verse.palette.shadow }}
        >
          still highlighting the wound. find the strength.
        </motion.span>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'same footage. survivor highlighted.'
          : 'tap the frame that shows your strength'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          empowerment
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'narrative agency' : 're-edit the memory'}
      </div>
    </div>
  );
}
