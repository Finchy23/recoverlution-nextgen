/**
 * NETWORK #7 -- 1317. The Signal Boost
 * "Sometimes your job is to be the amplifier."
 * INTERACTION: Tap to boost a fading signal -- it reaches the far node
 * STEALTH KBE: Altruism -- Supportive Leadership (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / morning / believing / tap / 1317
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

export default function Network_SignalBoost({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1317,
        isSeal: false,
      }}
      arrivalText="A whisper. Fading."
      prompt="You do not always have to be the source. Sometimes your job is to be the amplifier. Boost the signal of the quiet genius."
      resonantText="Altruism. You amplified the whisper and it reached the world. Supportive leadership is the repeater station: not the origin, but the reason the signal survived."
      afterglowCoda="Amplify."
      onComplete={onComplete}
    >
      {(verse) => <SignalBoostInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SignalBoostInteraction({ verse }: { verse: any }) {
  const [boosted, setBoosted] = useState(false);
  const [done, setDone] = useState(false);

  const handleBoost = () => {
    if (boosted) return;
    setBoosted(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 260, H = 140;

  const source = { x: 25, y: H / 2 };
  const repeater = { x: W / 2, y: H / 2 };
  const dest = { x: 235, y: H / 2 };

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>signal</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.shadow,
        }}>
          {done ? 'amplified' : 'fading'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Signal path */}
          <line x1={source.x} y1={source.y} x2={dest.x} y2={dest.y}
            stroke={verse.palette.primary} strokeWidth={0.3}
            opacity={safeOpacity(0.06)} />

          {/* Fading wave (source to repeater) */}
          {!boosted && (
            <motion.g>
              {[0, 1, 2].map(i => (
                <motion.circle key={i}
                  cy={source.y} r={0}
                  fill="none" stroke={verse.palette.primary}
                  strokeWidth={0.5}
                  animate={{
                    cx: [source.x, repeater.x - 10],
                    r: [2, 8 - i * 2],
                    opacity: [safeOpacity(0.2 - i * 0.05), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </motion.g>
          )}

          {/* Boosted wave (repeater to destination) */}
          {boosted && (
            <motion.g>
              {/* Strong waves outward */}
              {[0, 1, 2, 3].map(i => (
                <motion.circle key={`boost-${i}`}
                  cy={repeater.y} r={0}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={1}
                  animate={{
                    cx: [repeater.x, dest.x + 10],
                    r: [3, 15],
                    opacity: [safeOpacity(0.3), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.3,
                  }}
                />
              ))}

              {/* Backward echo too */}
              {[0, 1].map(i => (
                <motion.circle key={`back-${i}`}
                  cy={repeater.y} r={0}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  animate={{
                    cx: [repeater.x, source.x - 5],
                    r: [2, 10],
                    opacity: [safeOpacity(0.1), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    delay: 0.5 + i * 0.4,
                  }}
                />
              ))}
            </motion.g>
          )}

          {/* Source node (quiet genius) */}
          <circle cx={source.x} cy={source.y} r={5}
            fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
          <text x={source.x} y={source.y + 18} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.25}>
            whisper
          </text>

          {/* Repeater (you) */}
          <motion.circle
            cx={repeater.x} cy={repeater.y} r={10}
            fill={boosted ? verse.palette.accent : verse.palette.accent}
            animate={{ opacity: safeOpacity(boosted ? 0.2 : 0.08) }}
          />
          <motion.circle
            cx={repeater.x} cy={repeater.y} r={10}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={boosted ? 1.5 : 0.8}
            animate={{ opacity: safeOpacity(boosted ? 0.45 : 0.2) }}
          />
          <text x={repeater.x} y={repeater.y + 22} textAnchor="middle"
            fill={verse.palette.accent} style={navicueType.micro}
            opacity={boosted ? 0.5 : 0.3}>
            you
          </text>

          {/* Boost pulse */}
          {boosted && (
            <motion.circle
              cx={repeater.x} cy={repeater.y}
              fill={verse.palette.accent}
              initial={{ r: 10, opacity: 0.3 }}
              animate={{ r: 35, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Destination node */}
          <motion.circle
            cx={dest.x} cy={dest.y} r={5}
            fill={boosted ? verse.palette.accent : verse.palette.primary}
            animate={{ opacity: safeOpacity(boosted ? 0.25 : 0.06) }}
            transition={{ delay: boosted ? 0.5 : 0 }}
          />
          <motion.text
            x={dest.x} y={dest.y + 18} textAnchor="middle"
            fill={boosted ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.micro}
            animate={{ opacity: boosted ? 0.5 : 0.2 }}
            transition={{ delay: boosted ? 0.5 : 0 }}
          >
            {boosted ? 'reached' : 'far'}
          </motion.text>

          {/* Signal strength meter */}
          <g>
            {[0, 1, 2, 3].map(i => (
              <motion.rect key={i}
                x={repeater.x - 12 + i * 7} y={repeater.y - 28}
                width={4} rx={1}
                fill={verse.palette.accent}
                animate={{
                  height: boosted ? 6 + i * 4 : 3 + i,
                  opacity: safeOpacity(boosted ? 0.35 : 0.1),
                  y: repeater.y - 28 - (boosted ? i * 2 : 0),
                }}
                transition={{ delay: boosted ? 0.1 + i * 0.05 : 0 }}
              />
            ))}
          </g>
        </svg>
      </div>

      {!boosted && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBoost}>
          amplify
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the whisper reached the world'
          : 'the signal is dying before it arrives'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          supportive leadership
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'altruism' : 'be the amplifier'}
      </div>
    </div>
  );
}
