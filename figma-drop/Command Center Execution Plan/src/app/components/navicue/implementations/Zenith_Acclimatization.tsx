/**
 * ZENITH #1 — The Acclimatization
 * "Ambition causes altitude sickness. Pause. Let your blood catch up."
 * ARCHETYPE: Pattern C (Hold) — Stop interacting for 3 seconds to clear hypoxia blur
 * ENTRY: Scene-first — blurred screen
 * STEALTH KBE: Compliance with pause = Patience / Pacing (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'blurred' | 'cleared' | 'resonant' | 'afterglow';

export default function Zenith_Acclimatization({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [blur, setBlur] = useState(6);
  const lastActivity = useRef(Date.now());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('blurred'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'blurred') return;
    const iv = setInterval(() => {
      const idle = Date.now() - lastActivity.current;
      if (idle >= 3000) {
        setBlur(0);
        console.log(`[KBE:E] Acclimatization patience=confirmed pacing=true idleMs=${idle}`);
        setStage('cleared');
        t(() => setStage('resonant'), 5000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
      } else {
        setBlur(Math.max(0, 6 - (idle / 3000) * 6));
      }
    }, 200);
    return () => clearInterval(iv);
  }, [stage]);

  const handleActivity = () => { if (stage === 'blurred') lastActivity.current = Date.now(); };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <div onClick={handleActivity} onMouseMove={handleActivity} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AnimatePresence mode="wait">
          {stage === 'arriving' && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
              style={{ filter: 'blur(4px)' }}>
              <div style={{ width: '30px', height: '40px', background: themeColor(TH.primaryHSL, 0.04, 2),
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            </motion.div>
          )}
          {stage === 'blurred' && (
            <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                filter: `blur(${blur}px)`, transition: 'filter 0.3s' }}>
              <div style={{ width: '80px', height: '60px', position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%',
                  height: '100%', background: themeColor(TH.primaryHSL, 0.04, 2),
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.15, 8) }} />
              </div>
              <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px' }}>
                Too fast. The screen blurs. Stop. Breathe. Let the vision clear.
              </div>
              <div style={{ ...navicueType.hint, color: 'hsla(0, 12%, 35%, 0.2)' }}>
                Stop all interaction for 3 seconds
              </div>
            </motion.div>
          )}
          {stage === 'cleared' && (
            <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Clear. The vision returns. Climb high, sleep low. Ambition without acclimatization causes altitude sickness. You paused. Your blood caught up to your dreams. That{"'"}s discipline, not weakness.
            </motion.div>
          )}
          {stage === 'resonant' && (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
              style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
              Pacing. Ed Viesturs, the first American to climb all fourteen 8,000m peaks: "Getting to the top is optional. Getting down is mandatory." The acclimatization principle: rapid ascent without rest triggers HACE (cerebral edema). In life, rapid success without integration triggers burnout. Pause at each camp. Let the body adapt. The summit will still be there.
            </motion.div>
          )}
          {stage === 'afterglow' && (
            <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
              <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Acclimatized.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NaviCueShell>
  );
}
