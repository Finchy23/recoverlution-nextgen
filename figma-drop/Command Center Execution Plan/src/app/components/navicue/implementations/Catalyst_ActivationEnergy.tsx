/**
 * CATALYST #1 -- The Activation Energy (The Spark)
 * "Every reaction needs a spark. Be the first to move."
 * ARCHETYPE: Pattern A (Tap) -- Tap to deliver the first micro-action
 * ENTRY: Cold open -- a room of potential energy, nothing moving
 * STEALTH KBE: Initiating the micro-action = Social Initiative (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CATALYST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Theater');
type Stage = 'arriving' | 'active' | 'sparked' | 'resonant' | 'afterglow';

const SPARKS = [
  { label: 'Ask a question', desc: 'curiosity lowers the barrier' },
  { label: 'Offer first', desc: 'generosity before request' },
  { label: 'Name the elephant', desc: 'honesty as accelerant' },
];

export default function Catalyst_ActivationEnergy({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const ignite = (idx: number) => {
    if (stage !== 'active') return;
    setChosen(idx);
    console.log(`[KBE:E] ActivationEnergy spark=${SPARKS[idx].label} socialInitiative=confirmed`);
    setStage('sparked');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="ar" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}>
            <div
              style={{ width: '120px', height: '60px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.03, 2),
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...navicueType.hint, color: palette.textFaint }}>still room</span>
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Nothing is moving. Every reaction needs a spark. Be the first to move.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {SPARKS.map((s, i) => (
                <motion.div key={i} whileTap={{ scale: 0.97 }}
                  onClick={() => ignite(i)}
                  style={{ padding: '14px 18px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.04, 2),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                    display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ ...navicueType.choice, color: palette.text, fontSize: '12px' }}>
                    {s.label}
                  </div>
                  <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '10px' }}>
                    {s.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'sparked' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}
              style={{ width: '120px', height: '60px', borderRadius: radius.sm,
                background: `linear-gradient(135deg, ${themeColor(TH.accentHSL, 0.06, 4)}, ${themeColor(TH.primaryHSL, 0.03, 2)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10) }}>activated</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The room started moving. One micro-action broke the stillness.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Social initiative. Inertia is the default. The activation energy is not grand. It is the first question, the first offer, the first honest word. One spark lowers the barrier for everyone else.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Be the spark.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
