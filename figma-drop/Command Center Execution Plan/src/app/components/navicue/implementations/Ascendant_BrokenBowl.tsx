/**
 * ASCENDANT #6 -- The Broken Bowl (Kintsugi)
 * "The cracks are where the light gets in."
 * Pattern A (Tap) -- Bowl breaks; choose Repair (gold) or Discard
 * STEALTH KBE: Choosing Repair = Post-Traumatic Growth / Resilience Narrative (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Integrated Living', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'broken' | 'repaired' | 'resonant' | 'afterglow';

export default function Ascendant_BrokenBowl({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('broken'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: string) => {
    if (stage !== 'broken') return;
    setChoice(c);
    console.log(`[KBE:K] BrokenBowl choice="${c}" postTraumaticGrowth=${c === 'repair' ? 'confirmed' : 'challenged'} resilienceNarrative=${c === 'repair'}`);
    setStage('repaired');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '12px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'broken' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A beautiful bowl -- broken. Shards on the floor. What do you do?
            </div>
            {/* Broken bowl shards */}
            <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [-5 + i * 3, 5 - i * 2] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ width: '14px', height: '12px',
                    background: themeColor(TH.primaryHSL, 0.04, 2),
                    borderRadius: `${2 + i}px`, transform: `rotate(${i * 15 - 20}deg)` }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('repair')}
                style={{ padding: '14px 16px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Repair with Gold</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('discard')}
                style={{ padding: '14px 16px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Discard</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'repaired' && (
          <motion.div key="rp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'repair'
              ? 'Repaired with gold. Stronger and more beautiful than before. Kintsugi -- the Japanese art of repairing broken pottery with gold. You are not broken. You are broken open. The cracks are where the light gets in. Wear your scars like gold. The repair doesn\'t hide the break -- it honors it. The bowl\'s history is now visible, and that history is beautiful.'
              : 'Discarded. The pieces are gone. But the break still happened -- and the skill of repair remains unlearned. Kintsugi teaches: the break is not the end. It is the beginning of a more beautiful form. What if your next break could be repaired with gold?'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Kintsugi and post-traumatic growth. Kintsugi ({"金継ぎ"}, "golden joinery"): the Japanese art of repairing broken pottery with lacquer mixed with powdered gold. The philosophy: breakage is part of the history, not something to disguise. Tedeschi & Calhoun{"'"}s post-traumatic growth model: trauma survivors often report positive changes -- deeper relationships, new possibilities, increased personal strength, spiritual development, and enhanced appreciation for life. The gold is the growth.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Golden.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}