/**
 * ANCESTOR II #6 -- The Library Contribution
 * "Your story is a chapter in the human anthology."
 * Pattern A (Tap) -- Place your book on the shelf among millions
 * STEALTH KBE: Placing book without trying to stand out = Egolessness / Humility (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'holding' | 'placed' | 'resonant' | 'afterglow';

export default function AncestorII_LibraryContribution({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('holding'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const place = () => {
    if (stage !== 'holding') return;
    console.log(`[KBE:K] LibraryContribution humility=confirmed egolessness=true partOfWhole=true`);
    setStage('placed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '10px', borderRadius: '1px',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'holding' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A vast library. Millions of volumes. You hold one book: "My Life." Place it on the shelf. Add your verse.
            </div>
            {/* Bookshelf */}
            <div style={{ display: 'flex', gap: '1px', padding: '4px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ width: '4px', height: '16px', borderRadius: '0.5px',
                  background: themeColor(TH.primaryHSL, 0.03 + Math.random() * 0.02, 1 + Math.random() * 2) }} />
              ))}
              <div style={{ width: '4px', height: '16px', borderRadius: '0.5px',
                background: 'transparent', border: `1px dashed ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`b${i}`} style={{ width: '4px', height: '16px', borderRadius: '0.5px',
                  background: themeColor(TH.primaryHSL, 0.03 + Math.random() * 0.02, 1 + Math.random() * 2) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={place}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Place on Shelf</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'placed' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Placed. One book among millions. Your story is a chapter in the human anthology. It matters, but it is not the whole book. "O Me! O Life! ... the powerful play goes on, and you may contribute a verse." (Walt Whitman). Add your verse.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Humility and contribution. The Library of Babel (Borges): every possible book exists in an infinite library. Your book is unique and contains something no other volume does, but it is one among infinity. Research on intellectual humility (Leary, 2017): individuals who hold their own views with less certainty show greater learning, cooperation, and openness. The Stoic concept of cosmopolitanism: you are a citizen of the universe, one node in an infinite network. Your verse matters precisely because it{"'"}s unique, not because it{"'"}s the loudest.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Shelved.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}