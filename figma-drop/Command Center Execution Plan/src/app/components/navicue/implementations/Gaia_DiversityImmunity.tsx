/**
 * GAIA #7 — The Diversity Immunity
 * "Sameness is weakness. Diversity is immunity."
 * Pattern A (Tap) — Choose monoculture or diverse forest; see bug outcome
 * STEALTH KBE: Choosing diverse forest = Diversity Valuation / Heterogeneity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'believing', 'Canopy');
type Stage = 'arriving' | 'choosing' | 'outcome' | 'resonant' | 'afterglow';

export default function Gaia_DiversityImmunity({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('choosing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: string) => {
    if (stage !== 'choosing') return;
    setChoice(c);
    console.log(`[KBE:B] DiversityImmunity choice="${c}" diversityValuation=${c === 'diverse' ? 'confirmed' : 'challenged'} heterogeneity=${c === 'diverse'}`);
    setStage('outcome');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: '3px', height: `${8 + i * 2}px`, borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'choosing' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A pest is coming. Which system survives?
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Monoculture */}
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('mono')}
                style={{ padding: '14px', borderRadius: '10px', cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.025, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '80px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ width: '3px', height: '14px', borderRadius: '1px',
                      background: themeColor(TH.primaryHSL, 0.04, 2) }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Monoculture</span>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>All the same</span>
              </motion.div>
              {/* Diverse */}
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('diverse')}
                style={{ padding: '14px', borderRadius: '10px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '80px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[8, 14, 10, 16, 12].map((h, i) => (
                    <div key={i} style={{ width: '3px', height: `${h}px`, borderRadius: '1px',
                      background: themeColor(TH.accentHSL, 0.04 + i * 0.005, 2 + i) }} />
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>Diverse Forest</span>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>All different</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'outcome' && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'diverse'
              ? 'The diverse forest survives. The pest attacks one species but the others resist. The system holds. Sameness is weakness. Diversity is immunity. Do not fear the stranger — the difference saves the system. In ecology, in teams, in ideas: heterogeneity creates resilience.'
              : 'The monoculture collapses. The pest eats every identical plant. No resistance. No variation. No immunity. Sameness is weakness — a single vulnerability destroys the entire system. Diversity is not a luxury. It is survival architecture.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Ecological resilience. C.S. Holling{"'"}s resilience theory: diverse systems absorb perturbation better than homogeneous ones. The Irish Potato Famine (1845): a monoculture of one potato variety was devastated by a single pathogen. In contrast, tropical rainforests — the most biodiverse ecosystems — are the most resilient. Scott Page{"'"}s "diversity bonus": diverse groups outperform homogeneous expert groups on complex problems. Diversity is not charity. It is insurance.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Resilient.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}