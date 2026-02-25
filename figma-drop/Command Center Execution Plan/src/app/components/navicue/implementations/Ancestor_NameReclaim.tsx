/**
 * ANCESTOR #6 -- The Name Reclaim
 * "Your name was given. Now earn it. Fill it with your own meaning."
 * ARCHETYPE: Pattern D (Type) -- Type a definition of your name
 * ENTRY: Scene-first -- name written in sand
 * STEALTH KBE: Completing definition = Self-Definition (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Ember');
type Stage = 'arriving' | 'washing' | 'active' | 'carved' | 'resonant' | 'afterglow';

export default function Ancestor_NameReclaim({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'what does your name stand for now?',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      console.log(`[KBE:B] NameReclaim definition="${value.trim()}" selfDefinition=confirmed`);
      setStage('carved');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => {
    t(() => setStage('washing'), 1500);
    t(() => setStage('active'), 3500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.15, 6), letterSpacing: '0.2em' }}>
            YOUR NAME
          </motion.div>
        )}
        {stage === 'washing' && (
          <motion.div key="w" initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.15, 6), letterSpacing: '0.2em' }}>
            YOUR NAME
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The tide washed it away. Write it in stone. What does your name stand for now?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Carve in stone</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'carved' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Carved. No tide can wash this away. You earned the name. It{"'"}s yours now.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-definition. Your name was given to you. But now you must earn it, fill the name with your own meaning. Written in sand, it washes away. Written in stone, it endures. What does your name stand for now?
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Named.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}