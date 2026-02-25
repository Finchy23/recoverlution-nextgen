/**
 * GLITCH #6 — The Fake Notification
 * "See how your heart jumped? You are addicted to the alarm. The tiger is not real."
 * ARCHETYPE: Pattern A (Tap) — Red badge appears, tap reveals the joke
 * ENTRY: Reverse Reveal — the relief comes before the lesson
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'badge' | 'reveal' | 'resonant' | 'afterglow';

export default function Glitch_FakeNotification({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('badge'), 1500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tapBadge = () => {
    if (stage !== 'badge') return;
    setStage('reveal');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint }}>waiting...</motion.div>
        )}
        {stage === 'badge' && (
          <motion.div key="b" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div onClick={tapBadge}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ position: 'relative', width: '60px', height: '60px', borderRadius: radius.lg,
                background: themeColor(TH.primaryHSL, 0.1, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '18px', opacity: 0.12 }}>{'\u26a0'}</div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
                style={{ position: 'absolute', top: '-6px', right: '-6px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.7, 10),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: '#fff' }}>
                1
              </motion.div>
            </motion.div>
            <div style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.08em',
              color: themeColor(TH.accentHSL, 0.3, 10) }}>1 New Crisis</div>
          </motion.div>
        )}
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Just kidding.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
              It's a beautiful day.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
              style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.2, 8), textAlign: 'center', maxWidth: '260px' }}>
              See how your heart jumped? The badge was a lie. But the cortisol was real. You are addicted to the alarm.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            False alarm extinction. Exposing you to the signal of a threat without the presence of a threat helps extinguish the conditioned stress response. The tiger is not real. Relax.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>No tigers.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}