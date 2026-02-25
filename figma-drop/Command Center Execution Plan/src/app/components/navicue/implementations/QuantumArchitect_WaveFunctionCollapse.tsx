/**
 * QUANTUM ARCHITECT #7 -- 1237. The Wave Function Collapse
 * "You get what you focus on."
 * INTERACTION: Blurry field -- tap a detail to sharpen it, the rest blurs more. Choose wisely.
 * STEALTH KBE: Attentional Control -- Optimism Bias (K)
 *
 * COMPOSITOR: koan_paradox / Pulse / morning / knowing / tap / 1237
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const DETAILS = [
  { id: 'fear', label: 'fear', x: 55, y: 45, valence: 'negative' },
  { id: 'loss', label: 'loss', x: 180, y: 40, valence: 'negative' },
  { id: 'opportunity', label: 'opportunity', x: 120, y: 70, valence: 'positive' },
  { id: 'failure', label: 'failure', x: 65, y: 100, valence: 'negative' },
  { id: 'growth', label: 'growth', x: 200, y: 95, valence: 'positive' },
];

export default function QuantumArchitect_WaveFunctionCollapse({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1237,
        isSeal: false,
      }}
      arrivalText="A blurry future."
      prompt="You get what you focus on. You collapsed the wave into fear. Reset. Collapse the wave into opportunity."
      resonantText="Attentional control. The future was not predetermined. It was a wave of all possibilities. You sharpened what you focused on. Optimism bias is not delusion. It is choice of collapse."
      afterglowCoda="Collapse the wave."
      onComplete={onComplete}
    >
      {(verse) => <WaveFunctionCollapseInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function WaveFunctionCollapseInteraction({ verse }: { verse: any }) {
  const [focused, setFocused] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const handleFocus = (id: string) => {
    if (focused) return;
    const detail = DETAILS.find(d => d.id === id);
    if (!detail) return;

    setFocused(id);

    if (detail.valence === 'positive') {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    } else {
      // Wrong focus -- show the cost, then reset
      setTimeout(() => {
        setFocused(null);
        setAttempt(prev => prev + 1);
      }, 2000);
    }
  };

  const SCENE_W = 260;
  const SCENE_H = 140;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Blur field */}
          <defs>
            <filter id={`blur-wave-${attempt}`}>
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id="sharp-wave">
              <feGaussianBlur stdDeviation="0" />
            </filter>
          </defs>

          {/* Background wave interference */}
          {!focused && Array.from({ length: 8 }).map((_, i) => (
            <motion.line
              key={i}
              x1={20 + i * 30} y1={20}
              x2={30 + i * 30} y2={120}
              stroke={verse.palette.primary}
              strokeWidth={1}
              animate={{
                opacity: [safeOpacity(0.04), safeOpacity(0.08), safeOpacity(0.04)],
                x1: [20 + i * 30, 25 + i * 30, 20 + i * 30],
              }}
              transition={{ repeat: Infinity, duration: 2 + i * 0.3 }}
            />
          ))}

          {/* Detail nodes */}
          {DETAILS.map(detail => {
            const isFocused = focused === detail.id;
            const isBlurred = focused !== null && !isFocused;
            const isPositive = detail.valence === 'positive';

            return (
              <motion.g
                key={detail.id}
                style={{ cursor: focused ? 'default' : 'pointer' }}
                onClick={() => handleFocus(detail.id)}
              >
                {/* Node glow/blur */}
                <motion.circle
                  cx={detail.x} cy={detail.y}
                  r={isFocused ? 22 : 18}
                  fill={
                    isFocused
                      ? isPositive
                        ? verse.palette.accent
                        : verse.palette.shadow
                      : verse.palette.primary
                  }
                  animate={{
                    opacity: safeOpacity(
                      isFocused
                        ? 0.2
                        : isBlurred
                          ? 0.02
                          : 0.06
                    ),
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Border */}
                <motion.circle
                  cx={detail.x} cy={detail.y}
                  r={isFocused ? 22 : 18}
                  fill="none"
                  stroke={
                    isFocused
                      ? isPositive
                        ? verse.palette.accent
                        : verse.palette.shadow
                      : verse.palette.primary
                  }
                  strokeWidth={isFocused ? 1.5 : 0.5}
                  animate={{
                    opacity: safeOpacity(
                      isFocused ? 0.5 : isBlurred ? 0.05 : 0.15
                    ),
                  }}
                  transition={{ duration: 0.5 }}
                />

                {/* Label */}
                <motion.text
                  x={detail.x} y={detail.y + 4}
                  textAnchor="middle"
                  fill={
                    isFocused
                      ? isPositive
                        ? verse.palette.accent
                        : verse.palette.shadow
                      : verse.palette.textFaint
                  }
                  style={navicueType.micro}
                  animate={{
                    opacity: isFocused ? 0.8 : isBlurred ? 0.1 : 0.4,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {detail.label}
                </motion.text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Feedback */}
      {focused && !done && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          style={{ ...navicueType.hint, color: verse.palette.shadow }}
        >
          you collapsed the wave into {focused}. reset.
        </motion.span>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the wave collapsed into possibility'
          : focused
            ? 'wrong collapse. try again.'
            : attempt > 0
              ? 'choose what you want to see'
              : 'tap a detail to sharpen it'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          optimism bias
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'attentional control' : 'what do you focus on?'}
      </div>
    </div>
  );
}
