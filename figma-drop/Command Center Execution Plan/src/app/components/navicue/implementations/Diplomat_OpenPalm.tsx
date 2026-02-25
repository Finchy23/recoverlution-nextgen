/**
 * DIPLOMAT #7 -- 1267. The Open Palm (Disarm)
 * "A fist cannot receive. Open the hand."
 * INTERACTION: Tap the fist to open it -- a bird lands on the palm
 * STEALTH KBE: Vulnerability -- Trust (E)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / morning / embodying / tap / 1267
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

export default function Diplomat_OpenPalm({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1267,
        isSeal: false,
      }}
      arrivalText="A fist. Tight."
      prompt="A fist cannot receive. It can only strike. Open the hand. Vulnerability is not weakness. It is the only way to touch the world."
      resonantText="Vulnerability. You opened the fist and the bird landed. Trust is not naivety. It is the calculated decision that an open hand receives more than a closed one. The bird only comes to the still palm."
      afterglowCoda="Open the hand."
      onComplete={onComplete}
    >
      {(verse) => <OpenPalmInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OpenPalmInteraction({ verse }: { verse: any }) {
  const [opened, setOpened] = useState(false);
  const [birdLanded, setBirdLanded] = useState(false);
  const [done, setDone] = useState(false);

  const handleOpen = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => {
      setBirdLanded(true);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 200;
  const CX = W / 2, PALM_Y = 130;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {opened ? (
            /* OPEN PALM */
            <motion.g
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Palm base */}
              <path
                d={`M ${CX - 35},${PALM_Y + 20} Q ${CX - 40},${PALM_Y - 5} ${CX - 25},${PALM_Y - 25}
                    L ${CX + 25},${PALM_Y - 25}
                    Q ${CX + 40},${PALM_Y - 5} ${CX + 35},${PALM_Y + 20} Z`}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.08)}
              />
              <path
                d={`M ${CX - 35},${PALM_Y + 20} Q ${CX - 40},${PALM_Y - 5} ${CX - 25},${PALM_Y - 25}
                    L ${CX + 25},${PALM_Y - 25}
                    Q ${CX + 40},${PALM_Y - 5} ${CX + 35},${PALM_Y + 20} Z`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.8} opacity={safeOpacity(0.25)}
              />

              {/* Fingers (spread open) */}
              {[
                `M ${CX - 25},${PALM_Y - 25} Q ${CX - 35},${PALM_Y - 55} ${CX - 28},${PALM_Y - 70}`,
                `M ${CX - 12},${PALM_Y - 25} Q ${CX - 15},${PALM_Y - 60} ${CX - 10},${PALM_Y - 78}`,
                `M ${CX},${PALM_Y - 25} Q ${CX},${PALM_Y - 62} ${CX + 2},${PALM_Y - 80}`,
                `M ${CX + 12},${PALM_Y - 25} Q ${CX + 15},${PALM_Y - 58} ${CX + 12},${PALM_Y - 75}`,
                `M ${CX + 25},${PALM_Y - 25} Q ${CX + 40},${PALM_Y - 40} ${CX + 42},${PALM_Y - 50}`,
              ].map((d, i) => (
                <motion.path key={i} d={d}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.8} strokeLinecap="round"
                  opacity={safeOpacity(0.25)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                />
              ))}

              {/* Fingertip dots */}
              {[
                [CX - 28, PALM_Y - 70],
                [CX - 10, PALM_Y - 78],
                [CX + 2, PALM_Y - 80],
                [CX + 12, PALM_Y - 75],
                [CX + 42, PALM_Y - 50],
              ].map(([x, y], i) => (
                <motion.circle key={`tip-${i}`}
                  cx={x} cy={y} r={3}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.1) }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                />
              ))}
            </motion.g>
          ) : (
            /* CLOSED FIST */
            <motion.g
              exit={{ opacity: 0 }}
            >
              {/* Fist shape */}
              <path
                d={`M ${CX - 25},${PALM_Y - 15} Q ${CX - 28},${PALM_Y - 40} ${CX - 15},${PALM_Y - 50}
                    L ${CX + 15},${PALM_Y - 50}
                    Q ${CX + 28},${PALM_Y - 40} ${CX + 25},${PALM_Y - 15}
                    Q ${CX + 20},${PALM_Y + 5} ${CX},${PALM_Y + 10}
                    Q ${CX - 20},${PALM_Y + 5} ${CX - 25},${PALM_Y - 15} Z`}
                fill={verse.palette.primary}
                opacity={safeOpacity(0.08)}
              />
              <path
                d={`M ${CX - 25},${PALM_Y - 15} Q ${CX - 28},${PALM_Y - 40} ${CX - 15},${PALM_Y - 50}
                    L ${CX + 15},${PALM_Y - 50}
                    Q ${CX + 28},${PALM_Y - 40} ${CX + 25},${PALM_Y - 15}
                    Q ${CX + 20},${PALM_Y + 5} ${CX},${PALM_Y + 10}
                    Q ${CX - 20},${PALM_Y + 5} ${CX - 25},${PALM_Y - 15} Z`}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={1} opacity={safeOpacity(0.2)}
              />

              {/* Knuckle lines */}
              {[-12, -4, 4, 12].map((dx, i) => (
                <line key={i}
                  x1={CX + dx} y1={PALM_Y - 48}
                  x2={CX + dx} y2={PALM_Y - 38}
                  stroke={verse.palette.primary} strokeWidth={0.5}
                  opacity={safeOpacity(0.12)} />
              ))}

              {/* Tension lines */}
              <motion.g
                animate={{ opacity: [safeOpacity(0.08), safeOpacity(0.15), safeOpacity(0.08)] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {[0, 1, 2].map(i => (
                  <line key={i}
                    x1={CX - 35 - i * 5} y1={PALM_Y - 30 - i * 10}
                    x2={CX - 30 - i * 5} y2={PALM_Y - 35 - i * 10}
                    stroke={verse.palette.shadow} strokeWidth={1} />
                ))}
                {[0, 1, 2].map(i => (
                  <line key={`r-${i}`}
                    x1={CX + 35 + i * 5} y1={PALM_Y - 30 - i * 10}
                    x2={CX + 30 + i * 5} y2={PALM_Y - 35 - i * 10}
                    stroke={verse.palette.shadow} strokeWidth={1} />
                ))}
              </motion.g>
            </motion.g>
          )}

          {/* Bird */}
          {birdLanded && (
            <motion.g
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Bird body */}
              <ellipse cx={CX + 5} cy={PALM_Y - 35} rx={8} ry={5}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              {/* Head */}
              <circle cx={CX + 12} cy={PALM_Y - 40} r={4}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              {/* Beak */}
              <path d={`M ${CX + 16},${PALM_Y - 40} L ${CX + 20},${PALM_Y - 39} L ${CX + 16},${PALM_Y - 38}`}
                fill={verse.palette.accent} opacity={safeOpacity(0.25)} />
              {/* Wing */}
              <motion.path
                d={`M ${CX + 2},${PALM_Y - 37} Q ${CX - 5},${PALM_Y - 48} ${CX + 5},${PALM_Y - 45}`}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.8} opacity={safeOpacity(0.2)}
              />
              {/* Tail */}
              <path d={`M ${CX - 3},${PALM_Y - 33} L ${CX - 10},${PALM_Y - 36} L ${CX - 3},${PALM_Y - 37}`}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
              {/* Feet */}
              <line x1={CX + 3} y1={PALM_Y - 30} x2={CX + 3} y2={PALM_Y - 26}
                stroke={verse.palette.accent} strokeWidth={0.5} opacity={safeOpacity(0.2)} />
              <line x1={CX + 8} y1={PALM_Y - 30} x2={CX + 8} y2={PALM_Y - 26}
                stroke={verse.palette.accent} strokeWidth={0.5} opacity={safeOpacity(0.2)} />
            </motion.g>
          )}
        </svg>
      </div>

      {!opened && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleOpen}>
          open the hand
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the bird came to the open palm'
          : opened ? 'waiting...'
            : 'a fist cannot receive'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          trust
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'vulnerability' : 'open the hand'}
      </div>
    </div>
  );
}
