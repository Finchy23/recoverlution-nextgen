/**
 * EDITOR #10 -- 1260. The Editor Seal (The Proof)
 * "You hold the scissors. You hold the tape."
 * INTERACTION: Observe -- film splicer joining two pieces of film, cut becomes invisible
 * STEALTH KBE: Narrative Therapy -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1260
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Editor_EditorSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1260,
        isSeal: true,
      }}
      arrivalText="A film splicer. Two strips of film."
      prompt="You hold the scissors. You hold the tape."
      resonantText="Narrative therapy. We live our lives according to the stories we tell ourselves. Rewriting the story literally rewires the brain's emotional response to the past. The splice is invisible because the new story becomes the only story."
      afterglowCoda="Rewrite the story."
      onComplete={onComplete}
    >
      {(verse) => <EditorSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EditorSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);  // Film strips appear
    const t2 = setTimeout(() => setPhase(2), 4000);  // Scissors cut
    const t3 = setTimeout(() => setPhase(3), 6500);  // Splice / join
    const t4 = setTimeout(() => setPhase(4), 9000);  // Cut becomes invisible
    const t5 = setTimeout(() => {
      setPhase(5);
      setTimeout(() => verse.advance(), 3500);
    }, 11000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [verse]);

  const SCENE_W = 280;
  const SCENE_H = 200;
  const CX = SCENE_W / 2;
  const STRIP_Y = 90;
  const STRIP_H = 20;

  // Film strip frame markers
  const frameCount = 16;
  const frameW = (SCENE_W - 40) / frameCount;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Film splicer body */}
          {phase >= 0 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Base plate */}
              <rect x={CX - 60} y={55} width={120} height={80} rx={8}
                fill={verse.palette.primary}
                opacity={safeOpacity(0.04)} />
              <rect x={CX - 60} y={55} width={120} height={80} rx={8}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.1)} />

              {/* Reels */}
              <circle cx={CX - 35} cy={75} r={12}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.15)} />
              <circle cx={CX - 35} cy={75} r={3}
                fill={verse.palette.primary}
                opacity={safeOpacity(0.1)} />
              <circle cx={CX + 35} cy={75} r={12}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.15)} />
              <circle cx={CX + 35} cy={75} r={3}
                fill={verse.palette.primary}
                opacity={safeOpacity(0.1)} />
            </motion.g>
          )}

          {/* Film strips */}
          {phase >= 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Sprocket holes (top row) */}
              {Array.from({ length: frameCount }).map((_, i) => (
                <rect key={`st-${i}`}
                  x={20 + i * frameW + frameW / 2 - 2}
                  y={STRIP_Y - 4}
                  width={4} height={3} rx={0.5}
                  fill={verse.palette.primary}
                  opacity={safeOpacity(0.08)} />
              ))}

              {/* Main film strip -- left piece */}
              <motion.rect
                y={STRIP_Y} height={STRIP_H} rx={1}
                fill={verse.palette.primary}
                animate={{
                  x: phase >= 3 ? 20 : 20,
                  width: phase >= 2 ? CX - 22 : SCENE_W - 40,
                  opacity: safeOpacity(0.06),
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Main film strip -- right piece (after cut) */}
              {phase >= 2 && (
                <motion.rect
                  y={STRIP_Y} height={STRIP_H} rx={1}
                  fill={verse.palette.accent}
                  initial={{ x: CX + 2, width: SCENE_W - CX - 22, opacity: 0 }}
                  animate={{
                    x: phase >= 3 ? CX : CX + 2,
                    width: SCENE_W - CX - 22,
                    opacity: safeOpacity(0.06),
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Sprocket holes (bottom row) */}
              {Array.from({ length: frameCount }).map((_, i) => (
                <rect key={`sb-${i}`}
                  x={20 + i * frameW + frameW / 2 - 2}
                  y={STRIP_Y + STRIP_H + 1}
                  width={4} height={3} rx={0.5}
                  fill={verse.palette.primary}
                  opacity={safeOpacity(0.08)} />
              ))}

              {/* Frame content indicators */}
              {Array.from({ length: frameCount }).map((_, i) => {
                const isRightSide = i >= frameCount / 2;
                return (
                  <rect key={`fc-${i}`}
                    x={22 + i * frameW}
                    y={STRIP_Y + 4}
                    width={frameW - 4}
                    height={STRIP_H - 8}
                    rx={1}
                    fill={phase >= 3 && isRightSide ? verse.palette.accent : verse.palette.primary}
                    opacity={safeOpacity(0.04)} />
                );
              })}
            </motion.g>
          )}

          {/* Scissors (phase 2) */}
          {phase === 2 && (
            <motion.g
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Scissors icon */}
              <line x1={CX - 5} y1={STRIP_Y - 15}
                x2={CX + 3} y2={STRIP_Y + 5}
                stroke={verse.palette.text} strokeWidth={1.5} />
              <line x1={CX + 5} y1={STRIP_Y - 15}
                x2={CX - 3} y2={STRIP_Y + 5}
                stroke={verse.palette.text} strokeWidth={1.5} />
              <circle cx={CX - 6} cy={STRIP_Y - 17} r={3}
                fill="none" stroke={verse.palette.text} strokeWidth={1} />
              <circle cx={CX + 6} cy={STRIP_Y - 17} r={3}
                fill="none" stroke={verse.palette.text} strokeWidth={1} />
            </motion.g>
          )}

          {/* Cut line (phase 2-3) */}
          {phase >= 2 && phase < 4 && (
            <motion.line
              x1={CX} y1={STRIP_Y - 2}
              x2={CX} y2={STRIP_Y + STRIP_H + 2}
              stroke={verse.palette.accent}
              strokeWidth={1}
              animate={{
                opacity: safeOpacity(phase === 3 ? 0.15 : 0.4),
              }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Splice tape (phase 3) */}
          {phase >= 3 && (
            <motion.rect
              x={CX - 8} y={STRIP_Y - 2}
              width={16} height={STRIP_H + 4} rx={2}
              fill={verse.palette.accent}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: safeOpacity(phase >= 4 ? 0.02 : 0.1),
                scaleX: 1,
              }}
              transition={{ duration: 0.5 }}
              style={{ transformOrigin: `${CX}px ${STRIP_Y + STRIP_H / 2}px` }}
            />
          )}

          {/* Invisible cut (phase 4+) -- the splice disappears */}
          {phase >= 4 && (
            <motion.g>
              {/* Unified film strip (seamless) */}
              <motion.rect
                x={20} y={STRIP_Y}
                width={SCENE_W - 40} height={STRIP_H} rx={1}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.06) }}
                transition={{ duration: 1 }}
              />
            </motion.g>
          )}

          {/* Seal ring */}
          {phase >= 5 && (
            <motion.circle
              cx={CX} cy={SCENE_H / 2}
              r={85}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.15), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Phase labels */}
          <motion.text
            x={CX} y={155}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'the splicer'}
            {phase === 1 && 'two strips of film'}
            {phase === 2 && 'the cut'}
            {phase === 3 && 'the splice'}
            {phase === 4 && 'the cut becomes invisible'}
            {phase >= 5 && 'you hold the scissors. you hold the tape.'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'narrative therapy' : 'observe'}
      </div>
    </div>
  );
}
