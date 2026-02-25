/**
 * MAGNUM OPUS II #9 — The Silent Nod
 * "You do not need my words anymore. Go."
 * Pattern A (Tap) — Master nods; you accept and turn away
 * STEALTH KBE: Walking away from mentor = Self-Sufficiency / Graduation (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'believing', 'Cosmos');
type Stage = 'arriving' | 'master' | 'nodded' | 'resonant' | 'afterglow';

export default function Mastery_SilentNod({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('master'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const acceptNod = () => {
    if (stage !== 'master') return;
    console.log(`[KBE:B] SilentNod accepted=true selfSufficiency=true graduation=true`);
    setStage('nodded');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.05, 3) }} />
          </motion.div>
        )}
        {stage === 'master' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <motion.div animate={{ y: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '8px', color: palette.textFaint }}>&#x1F9D8;</div>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A Master. They do not speak. They just nod at you. Respect.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={acceptNod}
              style={{ padding: '10px 22px', borderRadius: '18px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Accept the nod. Walk away.</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'nodded' && (
          <motion.div key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            You accepted the nod and turned away. You do not need their words anymore. You have the skill. You have the eye. The greatest gift a mentor gives is the permission to leave. True mastery is when the student surpasses the teacher and both are grateful.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Vygotsky{"'"}s Zone of Proximal Development: the scaffold (mentor) is only useful during the learning phase. Once competence is internalized, the scaffold must be removed or it becomes a cage. The silent nod says: "You{"'"}re ready. Go."
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Graduated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}