/**
 * VALUATOR #2 — The Sunk Cost Cut
 * "Do not spend the future trying to save the past. Cut the loss."
 * ARCHETYPE: Pattern A (Tap) — Slice rope 3 times with decisive taps
 * ENTRY: Scene-first — heavy rope tied to rock
 * STEALTH KBE: Speed/decisiveness of cuts = Embodiment of letting go (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'active' | 'cut' | 'resonant' | 'afterglow';

export default function Valuator_SunkCostCut({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cuts, setCuts] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const cutTimes = useRef<number[]>([]);

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const slice = () => {
    if (stage !== 'active') return;
    cutTimes.current.push(Date.now());
    const next = cuts + 1;
    setCuts(next);
    if (next >= 3) {
      const avgGap = cutTimes.current.length > 1
        ? (cutTimes.current[cutTimes.current.length - 1] - cutTimes.current[0]) / (cutTimes.current.length - 1)
        : 0;
      console.log(`[KBE:E] SunkCostCut avgGapMs=${Math.round(avgGap)} decisive=${avgGap < 1500}`);
      setStage('cut');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  const ropeWidth = Math.max(1, 3 - cuts);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '50px', background: themeColor(TH.primaryHSL, 0.12, 6) }} />
            <div style={{ width: '30px', height: '30px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Cut the loss. Let the rock fall.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: `${ropeWidth}px`, height: '40px',
                background: themeColor(TH.primaryHSL, 0.15 - cuts * 0.03, 8), transition: 'width 0.2s' }} />
              <div style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.2, 8), padding: '2px 6px',
                background: themeColor(TH.primaryHSL, 0.04, 2), borderRadius: '3px' }}>Bad Investment</div>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < cuts ? themeColor(TH.accentHSL, 0.3, 10) : themeColor(TH.primaryHSL, 0.06, 4) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={slice}
              style={{ padding: '14px 26px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Cut ({3 - cuts})</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'cut' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ y: 0 }} animate={{ y: 80, opacity: 0 }} transition={{ duration: 1.5 }}
              style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The rock fell. The rope is gone. You are lighter.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Sunk cost fallacy. The time you spent is gone: a sunk cost. Decisive cutting measures your ability to separate past investment from future potential. Do not spend the future trying to save the past.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Cut.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}