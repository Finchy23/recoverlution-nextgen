/**
 * ASTRONAUT #4 -- The Nature Bath
 * "Your eyes evolved for fractals, not pixels. Feed them green."
 * ARCHETYPE: Pattern C (Hold) -- "Don't touch the screen" for duration
 * ENTRY: Ambient fade -- forest canopy
 * STEALTH KBE: Completion of no-touch timer = Digital Detox (E)
 * WEB ADAPTATION: Phone stillness → countdown timer (resist touching)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Stellar');
type Stage = 'arriving' | 'bathing' | 'touched' | 'complete' | 'resonant' | 'afterglow';

const BATH_DURATION = 10; // seconds

export default function Astronaut_NatureBath({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [remaining, setRemaining] = useState(BATH_DURATION);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const ivRef = useRef<number>(0);

  useEffect(() => { t(() => startBath(), 2200); return () => { T.current.forEach(clearTimeout); clearInterval(ivRef.current); }; }, []);

  const startBath = () => {
    setStage('bathing');
    setRemaining(BATH_DURATION);
    ivRef.current = window.setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(ivRef.current);
          console.log(`[KBE:E] NatureBath digitalDetox=confirmed attentionRestoration=true`);
          setStage('complete');
          t(() => setStage('resonant'), 4000);
          t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const touchScreen = () => {
    if (stage !== 'bathing') return;
    clearInterval(ivRef.current);
    setStage('touched');
    t(() => startBath(), 2000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '50px', borderRadius: radius.sm,
              background: 'hsla(130, 12%, 14%, 0.06)',
              border: '1px solid hsla(130, 10%, 20%, 0.05)' }} />
        )}
        {stage === 'bathing' && (
          <motion.div key="ba" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={touchScreen}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
              maxWidth: '300px', cursor: 'default' }}>
            {/* Forest canopy visualization */}
            <div style={{ width: '160px', height: '100px', borderRadius: radius.sm, overflow: 'hidden',
              background: 'hsla(140, 10%, 8%, 0.04)', position: 'relative',
              border: '1px solid hsla(140, 8%, 15%, 0.05)' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ y: [0, 2, -1, 0], opacity: [0.08, 0.12, 0.08] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                  style={{ position: 'absolute',
                    left: `${i * 20}px`, top: `${5 + (i % 3) * 15}px`,
                    width: `${30 + (i % 3) * 10}px`, height: `${20 + (i % 2) * 10}px`,
                    borderRadius: '50%',
                    background: `hsla(${130 + i * 5}, ${8 + i}%, ${12 + i * 2}%, 0.06)` }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Don{"'"}t touch the screen. Just look. Breathe.
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), fontSize: '18px' }}>
              {remaining}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              feed your eyes green...
            </div>
          </motion.div>
        )}
        {stage === 'touched' && (
          <motion.div key="to" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), textAlign: 'center' }}>
            You touched. The forest noticed. Starting over...
          </motion.div>
        )}
        {stage === 'complete' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
              fontStyle: 'italic' }}>
            Bathed. Your eyes just drank the forest. Fractals fed, pixels forgotten.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Attention Restoration Theory. Your eyes evolved for fractals -- branching trees, flowing water, cloud patterns -- not rectangular pixels. Even 20 seconds of looking at natural fractals reduces cortisol and restores directed attention. The Japanese call it shinrin-yoku: forest bathing. The prescription is green.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Bathed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}