/**
 * ANCESTOR #3 -- The Council of Elders
 * "10,000 of your ancestors survived. Ask them how they endured."
 * ARCHETYPE: Pattern D (Type) -- Type the answer you "hear" from ancestors
 * ENTRY: Scene-first -- campfire in cave
 * STEALTH KBE: Wise/calm answer = Deep Wisdom Resource access (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'embodying', 'Ember');
type Stage = 'arriving' | 'active' | 'answered' | 'resonant' | 'afterglow';

export default function Ancestor_CouncilOfElders({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'what do you hear?',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      console.log(`[KBE:E] CouncilOfElders wisdom="${value.trim()}" deepWisdomAccess=confirmed`);
      setStage('answered');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '12px', height: '16px', borderRadius: '4px 4px 0 0',
                background: themeColor(TH.accentHSL, 0.1, 6) }} />
            <div style={{ width: '20px', height: '4px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A campfire. Shadows of 10,000 ancestors sit around it. Ask: how did you endure?
            </div>
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '16px', height: '20px', borderRadius: '4px 4px 0 0',
                background: themeColor(TH.accentHSL, 0.12, 8) }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>listen to the fire...</div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Speak</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'answered' && (
          <motion.div key="an" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            The fire flared. They heard you. That answer lives in your bones, a library of survival 10,000 generations deep.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Deep wisdom resources. You have access to a library of survival. 10,000 of your ancestors survived long enough to pass the torch to you. Their endurance lives in your nervous system, your instincts, your bones. Ask them how they endured.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Heard.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}