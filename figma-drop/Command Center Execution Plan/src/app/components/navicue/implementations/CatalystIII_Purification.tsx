/**
 * CATALYST III #7 -- 1227. The Purification (Distill)
 * "The mud stays behind. The spirit rises."
 * INTERACTION: Hold to boil -- steam rises, catch the vapor for pure water
 * STEALTH KBE: Essentialism -- Positive Extraction (B)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / night / believing / hold / 1227
 */
import { useState, useEffect } from 'react';
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

export default function CatalystIII_Purification({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1227,
        isSeal: false,
      }}
      arrivalText="Muddy water."
      prompt="The mud stays behind. The spirit rises. Heat the situation until only the truth remains. Catch the vapor."
      resonantText="Essentialism. The water was never dirty. It was carrying things that were not water. Positive extraction. Boil away the drama. Catch the lesson."
      afterglowCoda="Catch the vapor."
      onComplete={onComplete}
    >
      {(verse) => <PurificationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PurificationInteraction({ verse }: { verse: any }) {
  const [boilProgress, setBoilProgress] = useState(0);
  const [steamCaught, setSteamCaught] = useState(false);
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setSteamCaught(true);
      setDone(true);
      setTimeout(() => verse.advance(), 2800);
    },
  });

  // Track boil progress with hold
  useEffect(() => {
    if (hold.isHolding) {
      setBoilProgress(hold.tension);
    }
  }, [hold.tension, hold.isHolding]);

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const SCENE_W = 240;
  const SCENE_H = 150;

  const mudOpacity = safeOpacity(0.15 * (1 - boilProgress * 0.8));
  const steamOpacity = safeOpacity(boilProgress * 0.25);

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Vessel (left) -- muddy water */}
          <rect x={20} y={50} width={70} height={80} rx={4}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1} opacity={safeOpacity(0.2)} />

          {/* Muddy water level (drops as boiling) */}
          <motion.rect
            x={22} y={55 + boilProgress * 30}
            width={66}
            height={73 - boilProgress * 30}
            rx={2}
            fill={verse.palette.primary}
            animate={{ opacity: mudOpacity }}
          />

          {/* Bubbles while boiling */}
          {hold.isHolding && Array.from({ length: 4 }).map((_, i) => (
            <motion.circle
              key={i}
              cx={35 + i * 15}
              r={2}
              fill={verse.palette.accent}
              animate={{
                cy: [120, 55 + boilProgress * 30],
                opacity: [0, safeOpacity(0.2), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.6 + Math.random() * 0.4,
                delay: i * 0.15,
              }}
            />
          ))}

          {/* Mud residue at bottom */}
          <motion.rect
            x={25} y={122}
            width={60}
            height={5}
            rx={2}
            fill={verse.palette.shadow}
            animate={{ opacity: safeOpacity(boilProgress * 0.2) }}
          />
          {boilProgress > 0.3 && (
            <text x={55} y={145} textAnchor="middle"
              fill={verse.palette.shadow} style={navicueType.micro}>
              mud (drama)
            </text>
          )}

          {/* Steam rising */}
          {boilProgress > 0.1 && Array.from({ length: 5 }).map((_, i) => (
            <motion.path
              key={`steam-${i}`}
              d={`M${40 + i * 10},${50} Q${45 + i * 10},${35} ${40 + i * 10},${20}`}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.6}
              animate={{
                opacity: [0, steamOpacity, 0],
                y: [0, -10],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.2,
              }}
            />
          ))}

          {/* Condensation tube */}
          <motion.path
            d="M 55,20 Q 55,5 120,5 Q 180,5 180,20"
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={1}
            animate={{ opacity: safeOpacity(0.15 + boilProgress * 0.1) }}
          />

          {/* Collection vessel (right) */}
          <rect x={150} y={20} width={60} height={50} rx={4}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={1} opacity={safeOpacity(0.2)} />

          {/* Pure water collecting */}
          {boilProgress > 0.2 && (
            <motion.rect
              x={152}
              width={56}
              rx={2}
              fill={verse.palette.accent}
              animate={{
                y: 68 - boilProgress * 40,
                height: boilProgress * 40,
                opacity: safeOpacity(boilProgress * 0.15),
              }}
            />
          )}

          {/* Drip into collection */}
          {hold.isHolding && boilProgress > 0.2 && (
            <motion.circle
              cx={180} r={1.5}
              fill={verse.palette.accent}
              animate={{
                cy: [18, 68 - boilProgress * 40],
                opacity: [safeOpacity(0.3), 0],
              }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
          )}

          {/* Labels */}
          {steamCaught && (
            <motion.text
              x={180} y={85} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            >
              pure (lesson)
            </motion.text>
          )}
        </svg>
      </div>

      {/* Hold zone */}
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
            {hold.isHolding ? 'boiling...' : 'hold to boil'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the spirit rises. the mud stays.'
          : hold.isHolding
            ? `distilling... ${Math.round(boilProgress * 100)}%`
            : 'heat until only truth remains'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          positive extraction
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'essentialism' : 'distill the truth'}
      </div>
    </div>
  );
}
