/**
 * EVOLUTIONIST #7 -- 1337. The Sexual Selection (Display)
 * "Beauty is a valid survival strategy."
 * INTERACTION: Dull tail (no mate). Tap to display (bright tail, mate found).
 * STEALTH KBE: Expression -- Signaling Theory (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / morning / believing / tap / 1337
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

export default function Evolutionist_SexualSelection({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1337,
        isSeal: false,
      }}
      arrivalText="Dull feathers. Invisible."
      prompt="It is not enough to be fit. You must display fitness. Show your colors. Beauty is a valid survival strategy."
      resonantText="Expression. You displayed your tail and you were seen. Signaling theory: quality without signal is invisible. The peacock's tail is not vanity. It is proof of vitality."
      afterglowCoda="Show your colors."
      onComplete={onComplete}
    >
      {(verse) => <SexualSelectionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SexualSelectionInteraction({ verse }: { verse: any }) {
  const [displayed, setDisplayed] = useState(false);
  const [done, setDone] = useState(false);

  const handleDisplay = () => {
    if (displayed) return;
    setDisplayed(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 180;
  const CX = W / 2, BIRD_Y = H / 2 + 10;

  // Tail feathers (fan shape)
  const FEATHER_COUNT = 9;
  const feathers = Array.from({ length: FEATHER_COUNT }).map((_, i) => {
    const angle = ((i / (FEATHER_COUNT - 1)) * 140 - 70) * (Math.PI / 180);
    const len = displayed ? 55 + (i % 3) * 8 : 20;
    return {
      angle,
      len,
      endX: CX + Math.sin(angle) * len,
      endY: BIRD_Y - 10 - Math.cos(angle) * len,
    };
  });

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>signal</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.shadow,
        }}>
          {done ? 'seen' : displayed ? 'displaying...' : 'invisible'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Tail feathers */}
          {feathers.map((f, i) => (
            <motion.g key={i}>
              {/* Feather shaft */}
              <motion.line
                x1={CX} y1={BIRD_Y - 10}
                stroke={displayed ? verse.palette.accent : verse.palette.primary}
                strokeWidth={displayed ? 1.5 : 0.5}
                animate={{
                  x2: f.endX,
                  y2: f.endY,
                  opacity: safeOpacity(displayed ? 0.3 : 0.08),
                }}
                transition={{ duration: 0.6, delay: i * 0.04 }}
              />

              {/* Eye spot at tip */}
              {displayed && (
                <motion.circle
                  r={4}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    cx: f.endX,
                    cy: f.endY,
                    opacity: safeOpacity(0.25),
                    scale: 1,
                  }}
                  transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
                />
              )}
              {displayed && (
                <motion.circle
                  r={2}
                  fill={verse.palette.text}
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: f.endX,
                    cy: f.endY,
                    opacity: safeOpacity(0.1),
                  }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                />
              )}
            </motion.g>
          ))}

          {/* Bird body */}
          <ellipse cx={CX} cy={BIRD_Y} rx={12} ry={9}
            fill={displayed ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(displayed ? 0.15 : 0.08)} />

          {/* Head */}
          <circle cx={CX} cy={BIRD_Y - 15} r={7}
            fill={displayed ? verse.palette.accent : verse.palette.primary}
            opacity={safeOpacity(displayed ? 0.15 : 0.08)} />

          {/* Crest */}
          <motion.line
            x1={CX} y1={BIRD_Y - 22}
            x2={CX + 3} y2={BIRD_Y - 30}
            stroke={displayed ? verse.palette.accent : verse.palette.primary}
            strokeWidth={1.5}
            strokeLinecap="round"
            animate={{ opacity: safeOpacity(displayed ? 0.3 : 0.1) }}
          />

          {/* Eye */}
          <circle cx={CX - 3} cy={BIRD_Y - 16} r={1.5}
            fill={verse.palette.text} opacity={safeOpacity(0.15)} />

          {/* Legs */}
          <line x1={CX - 4} y1={BIRD_Y + 9} x2={CX - 6} y2={BIRD_Y + 22}
            stroke={verse.palette.primary} strokeWidth={1.5}
            opacity={safeOpacity(0.1)} />
          <line x1={CX + 4} y1={BIRD_Y + 9} x2={CX + 6} y2={BIRD_Y + 22}
            stroke={verse.palette.primary} strokeWidth={1.5}
            opacity={safeOpacity(0.1)} />

          {/* Mate (appears when displayed) */}
          {done && (
            <motion.g
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <ellipse cx={CX + 60} cy={BIRD_Y + 5} rx={9} ry={7}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.15)} />
              <circle cx={CX + 60} cy={BIRD_Y - 6} r={5}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.15)} />
              <circle cx={CX + 58} cy={BIRD_Y - 7} r={1}
                fill={verse.palette.text} opacity={safeOpacity(0.15)} />
              <text x={CX + 60} y={BIRD_Y + 25} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }} opacity={0.4}>
                mate found
              </text>
            </motion.g>
          )}

          {/* Display shimmer */}
          {displayed && (
            <motion.circle cx={CX} cy={BIRD_Y - 10}
              fill={verse.palette.accent}
              initial={{ r: 10, opacity: 0.15 }}
              animate={{ r: 70, opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}
        </svg>
      </div>

      {!displayed && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleDisplay}>
          display
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'quality with signal. you were seen.'
          : displayed ? 'showing your colors...'
            : 'fit but invisible. no signal.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          signaling theory
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'expression' : 'show your colors'}
      </div>
    </div>
  );
}
