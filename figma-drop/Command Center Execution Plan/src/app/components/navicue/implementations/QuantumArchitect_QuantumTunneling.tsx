/**
 * QUANTUM ARCHITECT #5 -- 1235. The Quantum Tunneling
 * "Do not climb. Tune your frequency to the other side."
 * INTERACTION: Hold to vibrate -- particle phases through the solid wall
 * STEALTH KBE: Flow State -- Flow Entry (E)
 *
 * COMPOSITOR: sensory_cinema / Pulse / work / embodying / hold / 1235
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

export default function QuantumArchitect_QuantumTunneling({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1235,
        isSeal: false,
      }}
      arrivalText="A wall. Impossible."
      prompt="The barrier is solid to the solid mind. It is permeable to the energy mind. Do not climb. Tune your frequency to the other side."
      resonantText="Flow state. You did not break through. You passed through. Flow entry is not force. It is frequency alignment. The wall was always permeable to the right vibration."
      afterglowCoda="Tune your frequency."
      onComplete={onComplete}
    >
      {(verse) => <QuantumTunnelingInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function QuantumTunnelingInteraction({ verse }: { verse: any }) {
  const [tunneled, setTunneled] = useState(false);
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setTunneled(true);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    },
  });

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const SCENE_W = 260;
  const SCENE_H = 130;

  const vibIntensity = hold.tension;
  const WALL_X = 130;
  const PARTICLE_START_X = 60;
  const PARTICLE_END_X = 200;

  // Particle position: starts left, tunnels to right
  const particleX = tunneled
    ? PARTICLE_END_X
    : PARTICLE_START_X + vibIntensity * (WALL_X - PARTICLE_START_X - 5);

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Wall */}
          <motion.rect
            x={WALL_X - 6} y={15}
            width={12} height={SCENE_H - 30} rx={2}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(
                tunneled ? 0.08 : 0.25 - vibIntensity * 0.1
              ),
            }}
          />

          {/* Wall label */}
          <text x={WALL_X} y={SCENE_H - 5} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            barrier
          </text>

          {/* Particle (left side, vibrating) */}
          {!tunneled && (
            <motion.g>
              {/* Vibration envelope */}
              {hold.isHolding && vibIntensity > 0.1 && (
                <motion.circle
                  cx={particleX} cy={SCENE_H / 2}
                  r={8 + vibIntensity * 12}
                  fill={verse.palette.accent}
                  animate={{
                    opacity: [safeOpacity(0.03), safeOpacity(0.08), safeOpacity(0.03)],
                  }}
                  transition={{ repeat: Infinity, duration: 0.15 + (1 - vibIntensity) * 0.5 }}
                />
              )}

              {/* Main particle */}
              <motion.circle
                cx={particleX} cy={SCENE_H / 2}
                r={7}
                fill={verse.palette.accent}
                animate={{
                  opacity: safeOpacity(0.4 + vibIntensity * 0.2),
                  x: hold.isHolding
                    ? [0, -vibIntensity * 4, vibIntensity * 4, 0]
                    : 0,
                  y: hold.isHolding
                    ? [0, vibIntensity * 3, -vibIntensity * 3, 0]
                    : 0,
                }}
                transition={hold.isHolding
                  ? { repeat: Infinity, duration: 0.08 + (1 - vibIntensity) * 0.2 }
                  : { duration: 0.3 }
                }
              />

              {/* Wave function leaking through wall */}
              {vibIntensity > 0.4 && (
                <motion.circle
                  cx={WALL_X + 15 + vibIntensity * 20}
                  cy={SCENE_H / 2}
                  r={4}
                  fill={verse.palette.accent}
                  animate={{
                    opacity: [0, safeOpacity(vibIntensity * 0.15), 0],
                  }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
              )}
            </motion.g>
          )}

          {/* Tunneled particle (right side) */}
          {tunneled && (
            <motion.g>
              <motion.circle
                cy={SCENE_H / 2}
                r={7}
                fill={verse.palette.accent}
                initial={{ cx: WALL_X, opacity: 0 }}
                animate={{ cx: PARTICLE_END_X, opacity: safeOpacity(0.5) }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Glow */}
              <motion.circle
                cx={PARTICLE_END_X} cy={SCENE_H / 2}
                r={25}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, safeOpacity(0.08), 0] }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </motion.g>
          )}

          {/* Labels */}
          <text x={PARTICLE_START_X} y={SCENE_H / 2 + 25} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            {tunneled ? '' : 'you'}
          </text>
          <text x={PARTICLE_END_X} y={SCENE_H / 2 + 25} textAnchor="middle"
            fill={verse.palette.accent} style={navicueType.micro}>
            {tunneled ? 'through' : 'other side'}
          </text>

          {/* Frequency label */}
          {hold.isHolding && (
            <motion.text
              x={particleX} y={SCENE_H / 2 - 22}
              textAnchor="middle"
              fill={verse.palette.textFaint}
              style={navicueType.micro}
              animate={{ opacity: safeOpacity(0.4) }}
            >
              {vibIntensity < 0.3
                ? 'low frequency'
                : vibIntensity < 0.7
                  ? 'rising...'
                  : 'resonance'}
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
            {hold.isHolding ? 'vibrating...' : 'hold to vibrate'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'you passed through'
          : hold.isHolding
            ? vibIntensity > 0.7
              ? 'phasing...'
              : 'tune your frequency'
            : 'the wall is solid to the solid mind'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          flow entry
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'flow state' : 'tune the frequency'}
      </div>
    </div>
  );
}
