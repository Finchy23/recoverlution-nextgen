/**
 * ANCESTOR #5 -- The Gift Inheritance
 * "Trauma is not the only inheritance. You also inherited their grit, their song."
 * ARCHETYPE: Pattern A (Tap) -- Select a positive trait shared with ancestor
 * ENTRY: Scene-first -- treasure chest
 * STEALTH KBE: Selecting positive trait = Positive Identity Construction (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Ember');
type Stage = 'arriving' | 'active' | 'claimed' | 'resonant' | 'afterglow';

const GIFTS = ['Grit', 'Humor', 'Hands that build', 'A singing voice', 'Stubbornness that saves'];

export default function Ancestor_GiftInheritance({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [gift, setGift] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const claim = (g: string) => {
    if (stage !== 'active') return;
    setGift(g);
    console.log(`[KBE:K] GiftInheritance gift="${g}" positiveIdentityConstruction=confirmed`);
    setStage('claimed');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '40px', height: '28px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.accentHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A treasure chest. Inside: a talent you didn{"'"}t know you had. Which gift did they leave you?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {GIFTS.map(g => (
                <motion.div key={g} whileTap={{ scale: 0.95 }} onClick={() => claim(g)}
                  style={{ padding: '14px 16px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.04, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
                  <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 10), fontSize: '11px' }}>{g}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'claimed' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Claimed: {gift}. Grandmother{"'"}s gift, living in your hands. Trauma is not the only inheritance.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Positive identity construction. Trauma is not the only inheritance. You also inherited their grit, their song, their hands. Claim the gift. It{"'"}s been waiting in the chest for you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Inherited.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}