/**
 * WAYFINDER #9 -- 1169. The Land Scent
 * "Follow the feeling."
 * INTERACTION: Cannot see land. Smell indicators rise. Soil. Fire. Flower. Turn toward scent.
 * STEALTH KBE: Intuition -- multisensory integration (E)
 *
 * COMPOSITOR: witness_ritual / Compass / morning / embodying / tap / 1169
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const SCENTS = [
  { name: 'soil', intensity: 0.3 },
  { name: 'fire', intensity: 0.5 },
  { name: 'flower', intensity: 0.8 },
];

export default function Wayfinder_LandScent({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Compass',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1169,
        isSeal: false,
      }}
      arrivalText="You cannot see land."
      prompt="The nose remembers what the eyes forget. The scent of home travels further than the sight of it. Follow the feeling."
      resonantText="Intuition. You could not see the shore but you could smell it. Soil, then fire, then flowers. Each invisible signal drew you closer. Multisensory integration: trust what the eyes cannot show."
      afterglowCoda="Home."
      onComplete={onComplete}
    >
      {(verse) => <LandScentInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LandScentInteraction({ verse }: { verse: any }) {
  const [scentIdx, setScentIdx] = useState(0);
  const [turned, setTurned] = useState(false);
  const [done, setDone] = useState(false);
  const [scentVisible, setScentVisible] = useState(false);

  // Show scent indicators sequentially
  useEffect(() => {
    if (done) return;
    const timeout = setTimeout(() => {
      setScentVisible(true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [scentIdx, done]);

  const turnToward = useCallback(() => {
    if (done || !scentVisible) return;
    setTurned(true);
    setScentVisible(false);
    setTimeout(() => {
      setTurned(false);
      setScentIdx(prev => {
        const next = prev + 1;
        if (next >= SCENTS.length) {
          setDone(true);
          setTimeout(() => verse.advance(), 2200);
          return prev;
        }
        return next;
      });
    }, 800);
  }, [done, scentVisible, verse]);

  const currentScent = SCENTS[Math.min(scentIdx, SCENTS.length - 1)];
  const pct = done ? 1 : scentIdx / SCENTS.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 100)}>
        {/* Ocean (no visible land) */}
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          <line x1={0} y1={55} x2={160} y2={55}
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.1} />

          {/* Scent particles rising */}
          <AnimatePresence>
            {scentVisible && !done && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.circle key={`scent-${scentIdx}-${i}`}
                    cx={100 + (i - 2) * 8}
                    initial={{ cy: 55, opacity: 0, r: 1 }}
                    animate={{
                      cy: [55, 35, 15],
                      opacity: [0, currentScent.intensity * 0.5, 0],
                      r: [1, 2, 3],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                    fill={done ? verse.palette.accent : 'hsla(90, 25%, 50%, 0.4)'}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* Scent label */}
          {scentVisible && !done && (
            <motion.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              x={100} y={65}
              textAnchor="middle"
              style={{ ...navicueType.micro, fontSize: 9 }}
              fill={verse.palette.textFaint}
            >
              {currentScent.name}
            </motion.text>
          )}

          {/* Direction indicator */}
          {turned && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              d="M 80 50 L 95 48 L 93 52 Z"
              fill={verse.palette.accent}
            />
          )}

          {/* Land appears at end */}
          {done && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              d="M 90 53 Q 110 42 130 48 Q 145 44 155 53"
              fill="none" stroke={verse.palette.accent} strokeWidth={1.5}
            />
          )}
        </svg>

        {/* Progress dots */}
        <div style={{
          position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6,
        }}>
          {SCENTS.map((s, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: i < scentIdx || done
                  ? verse.palette.accent
                  : i === scentIdx && scentVisible
                  ? 'hsla(90, 25%, 50%, 0.4)'
                  : verse.palette.primaryGlow,
                opacity: i < scentIdx || done ? 0.5 : 0.2,
              }} />
              <span style={{
                ...navicueType.micro,
                color: i < scentIdx || done ? verse.palette.accent : verse.palette.textFaint,
                opacity: 0.3,
              }}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      {!done && scentVisible ? (
        <motion.button onClick={turnToward}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          turn toward {currentScent.name}
        </motion.button>
      ) : !done ? (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.3 }}>
          waiting for a sign...
        </span>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          home
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'multisensory integration' : 'follow the feeling'}
      </div>
    </div>
  );
}