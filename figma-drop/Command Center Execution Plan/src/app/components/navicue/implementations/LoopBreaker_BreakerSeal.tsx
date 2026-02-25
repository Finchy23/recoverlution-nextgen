/**
 * LOOP BREAKER #10 — The Breaker Seal
 * "The cycle is broken. You are free."
 * ARCHETYPE: Pattern A (Tap) — Tap to snap the chain link
 * ENTRY: Ambient Fade — chain + tension + glow all arrive together
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function LoopBreaker_BreakerSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [snapped, setSnapped] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const snap = () => {
    if (stage !== 'active' || snapped) return;
    setSnapped(true);
    t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="200" height="80" viewBox="0 0 200 80">
              {/* Chain links */}
              {[0, 1, 2, 3, 4].map(i => (
                <motion.ellipse key={i} cx={30 + i * 35} cy="40" rx="16" ry="12" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.08 + i * 0.01, 5)} strokeWidth="2"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.15 }} />
              ))}
              {/* Tension glow on middle link */}
              <motion.ellipse cx="100" cy="40" rx="16" ry="12" fill="none"
                stroke={themeColor(TH.accentHSL, 0.1, 10)} strokeWidth="1"
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity }} />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>under tension</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={snap}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: snapped ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              I am someone who breaks the chain.
            </div>
            <svg width="200" height="80" viewBox="0 0 200 80">
              {[0, 1, 2, 3, 4].map(i => {
                const broken = snapped && i === 2;
                const xOff = snapped && i > 2 ? 15 : snapped && i < 2 ? -15 : 0;
                return (
                  <motion.ellipse key={i}
                    cx={30 + i * 35}
                    cy="40" rx="16" ry="12" fill="none"
                    stroke={broken ? 'transparent' : themeColor(TH.primaryHSL, 0.1, 8)}
                    strokeWidth="2"
                    initial={{ x: 0, opacity: 1 }}
                    animate={{ x: xOff, opacity: broken ? 0 : 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }} />
                );
              })}
              {/* Snap flash */}
              {snapped && (
                <motion.circle cx="100" cy="40" r="4"
                  fill={themeColor(TH.accentHSL, 0.4, 15)}
                  initial={{ scale: 0 }} animate={{ scale: [0, 3, 0] }}
                  transition={{ duration: 0.8 }} />
              )}
            </svg>
            {!snapped && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>break it</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Snapped. The conditioned response weakened, then extinguished. Not through force, through patience, through counting, through friction, through spiraling upward one floor at a time. You are the breaker of your own cycles. The chain is open.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Free.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}