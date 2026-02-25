/**
 * RETRO-CAUSAL #6 — The Forgiveness Filter
 * "It wasn't a monster. It was a hurt child in a big body."
 * ARCHETYPE: Pattern A (Tap ×2) — Tap to apply the childhood filter
 * ENTRY: Cold Open — "Child" appears, then the photo transforms
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_ForgivenessFilter({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [filterApplied, setFilterApplied] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const applyFilter = () => {
    if (stage !== 'active' || filterApplied) return;
    setFilterApplied(true);
    t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 4000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '24px', fontFamily: 'serif', letterSpacing: '0.15em', color: palette.text, textAlign: 'center' }}>
            child
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={applyFilter}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: filterApplied ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The person who hurt you. See them as a five-year-old. Scared, confused, doing the only thing they knew. Apply the childhood filter. You can forgive a child.
            </div>
            <motion.div style={{
              width: '120px', height: '150px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, filterApplied ? 0.08 : 0.05, filterApplied ? 8 : 3),
              border: `1px solid ${themeColor(TH.accentHSL, filterApplied ? 0.15 : 0.06, 5)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 1.5s ease',
            }}
              animate={{ scale: filterApplied ? [1, 0.95, 1] : 1 }}>
              <motion.div style={{
                width: filterApplied ? '24px' : '32px',
                height: filterApplied ? '24px' : '32px',
                borderRadius: '50%',
                background: themeColor(TH.accentHSL, filterApplied ? 0.12 : 0.06, filterApplied ? 10 : 5),
                transition: 'all 1.5s ease',
              }} />
              <motion.div style={{
                fontSize: filterApplied ? '8px' : '10px',
                fontFamily: 'monospace', color: palette.textFaint,
                opacity: 0.4, transition: 'all 1.5s ease',
              }}>
                {filterApplied ? 'age 5' : 'adult'}
              </motion.div>
            </motion.div>
            {!filterApplied && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>apply the filter</div>}
            {filterApplied && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8 }}
                style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
                just a scared child
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Filtered. The mental representation changed, from powerful aggressor to flawed human, from monster to hurt child in a large body. The physiological arousal dropped. Empathy-induced forgiveness: not condoning, but understanding. The child didn{'\u2019'}t know any better. Neither did the adult.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Softened.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}