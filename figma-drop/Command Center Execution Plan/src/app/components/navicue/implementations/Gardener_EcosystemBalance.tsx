/**
 * GARDENER II #9 — The Ecosystem Balance
 * "The problem is not the algae. Introduce the counter-balance."
 * Pattern A (Tap) — Pond with too much Algae (Ego); add Fish (Humility); water clears
 * STEALTH KBE: Identifying missing element = Holistic Awareness / Systemic Diagnosis (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Ecological Identity', 'knowing', 'Canopy');
type Stage = 'arriving' | 'murky' | 'balanced' | 'resonant' | 'afterglow';

const ELEMENTS = [
  { id: 'humility', label: 'Humility (Fish)', correct: true },
  { id: 'play', label: 'Play (Otter)', correct: true },
  { id: 'moreego', label: 'More Algae', correct: false },
  { id: 'anger', label: 'Anger (Acid)', correct: false },
];

export default function Gardener_EcosystemBalance({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('murky'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const add = (el: typeof ELEMENTS[0]) => {
    if (stage !== 'murky') return;
    setChoice(el.id);
    console.log(`[KBE:K] EcosystemBalance choice="${el.id}" holisticAwareness=${el.correct} systemicDiagnosis=${el.correct}`);
    setStage('balanced');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  const choiceEl = ELEMENTS.find(e => e.id === choice);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '16px', borderRadius: '50%',
              background: 'hsla(120, 15%, 20%, 0.04)' }} />
          </motion.div>
        )}
        {stage === 'murky' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A pond. Choked with algae (Ego). The water is murky. What does the system need?
            </div>
            <div style={{ width: '70px', height: '35px', borderRadius: '50%',
              background: 'hsla(120, 20%, 15%, 0.06)',
              border: '1px solid hsla(120, 15%, 20%, 0.06)' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {ELEMENTS.map(el => (
                <motion.div key={el.id} whileTap={{ scale: 0.9 }} onClick={() => add(el)}
                  style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.03, 1),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                  <span style={{ fontSize: '11px', color: palette.textFaint }}>{el.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choiceEl?.correct
              ? `Balanced. You added ${choiceEl.label}, the counter-balance. The water clears. The problem was never the algae itself. The problem was the lack of predators. In any system, imbalance is solved by adding what's missing, not by fighting what's present. Restoring the system restores the clarity.`
              : `You added ${choiceEl?.label}. The water stays murky. The system didn't need more of the same energy; it needed a counter-balance. In ecology, the cure for overgrowth is never more of the same. It's the introduction of the missing element. What's the fish in your life?`}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Systems thinking and leverage points. Donella Meadows{"'"} "Thinking in Systems": the most effective interventions in complex systems are often counter-intuitive, adding a balancing loop rather than amplifying the existing one. Trophic cascades: when wolves were reintroduced to Yellowstone, they changed the rivers by regulating elk behavior, allowing vegetation to recover along riverbanks. The solution to the algae problem is never "remove algae"; it{"'"} "add fish." The missing element is always more powerful than more of the same.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Clear.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}