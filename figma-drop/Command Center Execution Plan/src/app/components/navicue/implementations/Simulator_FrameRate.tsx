/**
 * SIMULATOR #3 -- 1243. The Frame Rate (Processing Speed)
 * "Slow the game down. Increase your internal frame rate."
 * INTERACTION: Hold to breathe slowly -- chaos on screen decelerates to match
 * STEALTH KBE: Time Dilation -- Somatic Regulation (E)
 *
 * COMPOSITOR: sensory_cinema / Pulse / work / embodying / hold / 1243
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveHoldButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export default function Simulator_FrameRate({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1243,
        isSeal: false,
      }}
      arrivalText="Everything is moving too fast."
      prompt="Life is moving too fast for your current processor. Slow the game down. Breathe. Increase your internal frame rate to catch the moment."
      resonantText="Time dilation. You slowed your breath and the world slowed with you. Somatic regulation is the frame rate upgrade. When your body calms, your perception sharpens."
      afterglowCoda="Increase the frame rate."
      onComplete={onComplete}
    >
      {(verse) => <FrameRateInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FrameRateInteraction({ verse }: { verse: any }) {
  const rand = useRef(seededRandom(1243)).current;
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    },
  });

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const SCENE_W = 260;
  const SCENE_H = 120;

  // Chaos objects -- speed decreases with hold tension
  const objects = useRef(
    Array.from({ length: 12 }, () => ({
      y: 20 + rand() * (SCENE_H - 40),
      size: 4 + rand() * 8,
      baseSpeed: 0.5 + rand() * 1.5,
    }))
  ).current;

  const speedFactor = done ? 0.05 : 1 - hold.tension * 0.9;
  const fps = done ? 120 : Math.round(15 + hold.tension * 105);

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* FPS counter */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>fps</span>
        <motion.span
          style={{
            ...navicueType.data,
            color: fps > 60 ? verse.palette.accent : verse.palette.text,
          }}
        >
          {fps}
        </motion.span>
        {hold.isHolding && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            style={{ ...navicueType.micro, color: verse.palette.textFaint }}
          >
            {speedFactor > 0.5 ? 'lagging' : speedFactor > 0.2 ? 'stabilizing' : 'smooth'}
          </motion.span>
        )}
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H, overflow: 'hidden' }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Scan lines (low fps) */}
          {speedFactor > 0.3 && Array.from({ length: 6 }).map((_, i) => (
            <motion.line
              key={`scan-${i}`}
              x1={0} y1={i * 20 + 10} x2={SCENE_W} y2={i * 20 + 10}
              stroke={verse.palette.primary}
              strokeWidth={1}
              animate={{
                opacity: [0, safeOpacity(speedFactor * 0.1), 0],
              }}
              transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.05 }}
            />
          ))}

          {/* Moving objects -- speed varies with breath */}
          {objects.map((obj, i) => (
            <motion.rect
              key={i}
              y={obj.y}
              width={obj.size}
              height={obj.size}
              rx={done ? obj.size / 2 : 1}
              fill={verse.palette.accent}
              animate={{
                x: [0 - obj.size, SCENE_W + obj.size],
                opacity: safeOpacity(done ? 0.35 : 0.12 + hold.tension * 0.15),
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  duration: (2 / obj.baseSpeed) / speedFactor,
                  delay: (i / objects.length) * (2 / obj.baseSpeed) / speedFactor,
                  ease: 'linear',
                },
                opacity: { duration: 0.3 },
              }}
            />
          ))}

          {/* "Catch" target (appears when slowed enough) */}
          {(hold.tension > 0.7 || done) && (
            <motion.g>
              <motion.circle
                cx={SCENE_W / 2} cy={SCENE_H / 2}
                r={15}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1}
                strokeDasharray="4 3"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: safeOpacity(0.4),
                  scale: 1,
                }}
                transition={{ duration: 0.5 }}
              />
              <motion.text
                x={SCENE_W / 2} y={SCENE_H / 2 + 4}
                textAnchor="middle"
                fill={verse.palette.accent}
                style={navicueType.micro}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.3 }}
              >
                now
              </motion.text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Hold button */}
      {!done && (
        <motion.div
          {...hold.holdProps}
          animate={hold.isHolding ? btn.holding : {}}
          transition={{ duration: 0.2 }}
          style={{ ...hold.holdProps.style, ...btn.base }}
        >
          <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
            <circle {...btn.progressRing.track} />
            <circle {...btn.progressRing.fill(hold.tension)} />
          </svg>
          <div style={btn.label}>
            {hold.isHolding ? 'slowing...' : 'hold to breathe'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'you can see the moment now'
          : hold.isHolding
            ? hold.tension > 0.6
              ? 'time is stretching...'
              : 'the world is decelerating'
            : 'everything is a blur'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          somatic regulation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'time dilation' : 'slow the frame rate'}
      </div>
    </div>
  );
}
