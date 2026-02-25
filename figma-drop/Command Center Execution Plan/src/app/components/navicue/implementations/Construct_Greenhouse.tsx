/**
 * CONSTRUCT #9 — The Greenhouse / Incubation (Active Patience)
 * "You cannot force the bloom. Water it. Leave it alone. Trust the soil."
 * ARCHETYPE: Pattern A (Tap) — Tap to plant, tap to water, then wait
 * ENTRY: Ambient fade — glass room materializes slowly
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'planted' | 'watered' | 'resonant' | 'afterglow';

export default function Construct_Greenhouse({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [idea, setIdea] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 3000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const plant = () => {
    if (!idea.trim()) return;
    setStage('planted');
  };
  const water = () => {
    setStage('watered');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '160px', height: '110px', borderRadius: radius.xs,
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 4)}`,
              background: `linear-gradient(180deg, ${themeColor(TH.primaryHSL, 0.03, 2)}, ${themeColor(TH.primaryHSL, 0.06, 4)})` }}>
              <div style={{ margin: '8px', height: 'calc(100% - 16px)', borderRadius: '2px',
                border: `1px solid ${themeColor(TH.accentHSL, 0.03, 3)}` }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a glass room</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You cannot force the bloom. You can only protect the conditions. Plant a seed. An idea, a hope, a beginning.
            </div>
            <input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Plant a seed..."
              style={{ width: '200px', padding: '10px 14px', borderRadius: radius.md, textAlign: 'center',
                background: themeColor(TH.primaryHSL, 0.06, 3), border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                color: palette.text, fontSize: '12px', fontFamily: 'inherit', outline: 'none' }} />
            {idea.trim() && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={plant}
                style={{ padding: '8px 22px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>place the seed</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'planted' && (
          <motion.div key="pl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '50px', height: '20px', borderRadius: '0 0 25px 25px',
              background: themeColor(TH.primaryHSL, 0.12, 6),
              display: 'flex', justifyContent: 'center', paddingTop: '4px' }}>
              <div style={{ width: '4px', height: '10px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.12, 8) }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>
              "{idea}" is planted
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} onClick={water}
              style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>water it</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'watered' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '50px', height: '20px', borderRadius: '0 0 25px 25px',
              background: themeColor(TH.primaryHSL, 0.14, 8),
              display: 'flex', justifyContent: 'center', paddingTop: '4px' }}>
              <div style={{ width: '4px', height: '10px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.15, 10) }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              wait.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Active Patience. Distinguishing between action and outcome helps detach from immediate results while maintaining long-term commitment. You planted. You watered. Now trust the soil.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Trust the soil.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}