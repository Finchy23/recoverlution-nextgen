/**
 * CHRONOMANCER #9 -- 1019. The Eternal Now
 * "Yesterday is a memory. Tomorrow is a dream. The only place you can breathe is here."
 * INTERACTION: Observe. Past (left) and Future (right) gradually blur.
 * Only the center strip stays sharp. A presence indicator grows as
 * the user stays centered, rewarding stillness with clarity.
 * STEALTH KBE: E (Embodying) -- Presence / Mindfulness
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Chronomancer_EternalNow({ onComplete }: Props) {
  const [presence, setPresence] = useState(0);
  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);

  // Slowly build presence over time (observing = being present)
  useEffect(() => {
    const interval = setInterval(() => {
      setPresence(p => {
        const next = Math.min(1, p + 0.015);
        if (next >= 1 && !advancedRef.current) {
          advancedRef.current = true;
          setTimeout(() => advanceRef.current?.(), 3000);
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const blurAmount = 3 + (1 - presence) * 5; // More presence = less edge blur
  const centerWidth = 30 + presence * 40; // Center strip widens with presence

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'observe',
        specimenSeed: 1019,
        isSeal: false,
      }}
      arrivalText="Time stretches..."
      prompt="The past blurs left. The future blurs right. Stay here."
      resonantText="The only place you can breathe is here."
      afterglowCoda="Now."
      onComplete={onComplete}
      mechanism="Present-Moment Awareness"
    >
      {(verse) => {
        advanceRef.current = verse.advance;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}>
            {/* Temporal field */}
            <div style={navicueStyles.heroScene(verse.palette, 300 / 160)}>
              <svg viewBox="0 0 300 160" style={navicueStyles.heroSvg}>
                {/* Past zone (left) */}
                <motion.rect
                  animate={{ filter: `blur(${blurAmount}px)` }}
                  style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${(100 - centerWidth) / 2}%`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.3 }}>
                    yesterday
                  </div>
                </motion.rect>

                {/* Future zone (right) */}
                <motion.rect
                  animate={{ filter: `blur(${blurAmount}px)` }}
                  style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    width: `${(100 - centerWidth) / 2}%`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.3 }}>
                    tomorrow
                  </div>
                </motion.rect>

                {/* Center strip (sharp) */}
                <motion.rect
                  animate={{ width: `${centerWidth}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    left: `${(100 - centerWidth) / 2}%`,
                    top: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    borderLeft: `1px solid ${verse.palette.primaryGlow}`,
                    borderRight: `1px solid ${verse.palette.primaryGlow}`,
                  }}
                >
                  <svg viewBox="0 0 100 100" width={80} height={80}>
                    {/* Breath circle */}
                    <motion.circle
                      cx={50} cy={50}
                      fill="none"
                      stroke={verse.palette.accent}
                      strokeWidth={0.6}
                      animate={{
                        r: [18 + presence * 8, 22 + presence * 10, 18 + presence * 8],
                        opacity: [0.1, 0.2 + presence * 0.1, 0.1],
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Inner glow */}
                    <motion.circle
                      cx={50} cy={50}
                      r={6 + presence * 4}
                      fill={verse.palette.primaryGlow}
                      animate={{ opacity: [0.03, 0.08 + presence * 0.05, 0.03] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </svg>

                  <motion.div
                    animate={{ opacity: 0.15 + presence * 0.35 }}
                    style={{ ...navicueType.data, color: verse.palette.text, marginTop: 8 }}
                  >
                    here
                  </motion.div>
                </motion.rect>
              </svg>
            </div>

            {/* Presence meter */}
            <div style={{ width: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: '100%', height: 3, borderRadius: 1.5,
                background: verse.palette.primaryFaint,
                overflow: 'hidden',
              }}>
                <motion.div
                  animate={{ width: `${presence * 100}%` }}
                  transition={{ duration: 0.3 }}
                  style={{
                    height: '100%', borderRadius: 1.5,
                    background: verse.palette.accent,
                    opacity: 0.3,
                  }}
                />
              </div>
              <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
                {presence < 1 ? `${Math.round(presence * 100)}% present` : 'Fully present.'}
              </div>
            </div>
          </div>
        );
      }}
    </NaviCueVerse>
  );
}