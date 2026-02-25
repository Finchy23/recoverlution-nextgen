/**
 * MULTIVERSE #7 — The Shapeshifter
 * "Rigidity is death. Fluidity is life. Shift your form."
 * ARCHETYPE: Pattern A (Tap) — Match the prompted shape
 * ENTRY: Scene-first — morphing blob
 * STEALTH KBE: Matching shape prompt = Somatic Flexibility / Adaptive Response (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'morphing' | 'adapted' | 'resonant' | 'afterglow';

const FORMS = [
  { name: 'Rock', desc: 'Grounding', shape: '10px', prompt: 'Be solid.' },
  { name: 'Water', desc: 'Flow', shape: '50%', prompt: 'Be fluid.' },
  { name: 'Fire', desc: 'Action', shape: '50% 0 50% 50%', prompt: 'Be fierce.' },
];

export default function Multiverse_Shapeshifter({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [formIdx, setFormIdx] = useState(0);
  const [matched, setMatched] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('morphing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const matchForm = () => {
    if (stage !== 'morphing') return;
    const next = matched + 1;
    setMatched(next);
    if (next >= 3) {
      console.log(`[KBE:E] Shapeshifter somaticFlexibility=confirmed adaptiveResponse=true`);
      setStage('adapted');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    } else {
      setFormIdx(next);
    }
  };

  const form = FORMS[formIdx];

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ borderRadius: ['10px', '50%', '10px'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '20px', height: '20px', background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'morphing' && (
          <motion.div key="mo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {form.prompt} Adapt your form.
            </div>
            <motion.div key={formIdx} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              style={{ width: '50px', height: '50px', borderRadius: form.shape,
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `2px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>{form.name}</span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={matchForm}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Shift → {form.desc}</span>
            </motion.div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {FORMS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: i < matched
                    ? themeColor(TH.accentHSL, 0.15, 8)
                    : themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'adapted' && (
          <motion.div key="ad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            All forms embodied. Rock, Water, Fire — you shifted through each. Rigidity is death. Fluidity is life. The shapeshifter doesn{"'"}t lose identity by changing form — they reveal the fullness of it. Adapt.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Adaptive response. Bruce Lee: "Be water, my friend." Psychological flexibility (Steven Hayes, ACT) is the ability to shift behavioral strategies based on context. Rigid patterns are efficient but fragile. Adaptive organisms can be rock when stability is needed, water when flow is required, fire when action is called for. The shape serves the situation.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Shifted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}