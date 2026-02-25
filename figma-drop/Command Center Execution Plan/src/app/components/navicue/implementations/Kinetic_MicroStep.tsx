/**
 * KINETIC #2 — The Micro-Step (The Zeno)
 * "The mile is impossible. The inch is easy. Shrink until too small to fail."
 * ARCHETYPE: Pattern D (Type) — Type smallest next step; rejects projects, accepts actions
 * ENTRY: Cold open — uncrossable gap
 * STEALTH KBE: Typing an action vs project = Operationalizing (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'active' | 'accepted' | 'resonant' | 'afterglow';

const PROJECTS = ['write book', 'get fit', 'learn guitar', 'change career', 'be happy', 'fix everything'];

export default function Kinetic_MicroStep({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rejected, setRejected] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'smallest next step...',
    onAccept: (value: string) => {
      const isProject = PROJECTS.some(p => value.toLowerCase().includes(p));
      if (isProject || value.length > 30) {
        setRejected(true);
        return;
      }
      console.log(`[KBE:K] MicroStep step="${value}" operationalizing=confirmed`);
      setStage('accepted');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: (v: string) => { if (rejected) setRejected(false); },
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '30px', height: '4px', background: themeColor(TH.primaryHSL, 0.1, 6) }} />
            <div style={{ width: '30px', height: '30px', background: 'transparent',
              borderBottom: `2px dashed ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
            <div style={{ width: '30px', height: '4px', background: themeColor(TH.primaryHSL, 0.1, 6) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Shrink the target until it{"'"}s too small to fail.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              What is the smallest next step?
            </div>
            <div style={{ width: '100%' }}>
              <input {...typeInt.inputProps}
                style={{ width: '100%', padding: '14px 14px', borderRadius: radius.md,
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${rejected ? 'hsla(0, 30%, 40%, 0.2)' : themeColor(TH.primaryHSL, 0.08, 5)}`,
                  color: palette.text, fontSize: '13px', outline: 'none',
                  fontFamily: 'inherit' }} />
            </div>
            {rejected && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...navicueType.hint, color: 'hsla(0, 30%, 42%, 0.5)', textAlign: 'center' }}>
                Too big. Smaller. What{"'"}s the first physical action?
              </motion.div>
            )}
            <motion.div whileTap={{ scale: 0.95 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Cross the inch</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'accepted' && (
          <motion.div key="acc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              That{"'"}s an inch. That{"'"}s crossable. The mile is just a thousand of these.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Operationalizing. The mile is impossible. The inch is easy. Shrink the target until it{"'"}s too small to fail: "open the laptop" not "write the book." Execution starts at the level of the verb, not the noun.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>One inch.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}