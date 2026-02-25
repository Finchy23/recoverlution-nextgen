/**
 * ADAPTIVE #7 -- The Scar Tissue
 * "Where you were cut, you are now armor."
 * ARCHETYPE: Pattern D (Type) -- Type what you learned from the wound
 * ENTRY: Cold open -- cut healing
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Storm');
type Stage = 'arriving' | 'active' | 'healed' | 'resonant' | 'afterglow';

export default function Adaptive_ScarTissue({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [answer, setAnswer] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'what did you learn?',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      setAnswer(value);
      console.log(`[KBE:K] ScarTissue meaningMaking=confirmed`);
      setStage('healed');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '4px', borderRadius: '2px',
              background: 'hsla(0, 25%, 35%, 0.12)' }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The wound healed. What did you learn?
            </div>
            <div style={{ position: 'relative', width: '80px', height: '30px' }}>
              <div style={{ position: 'absolute', top: '13px', width: '80px', height: '4px',
                background: 'hsla(0, 20%, 30%, 0.08)', borderRadius: '2px' }} />
              <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', top: '12px', width: '80px', height: '6px',
                  background: themeColor(TH.accentHSL, 0.06, 4), borderRadius: '3px' }} />
            </div>
            <div style={{ width: '100%' }}>
              <input {...typeInt.inputProps}
                style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                  color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Seal</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'healed' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '80px', height: '8px', borderRadius: radius.xs,
              background: themeColor(TH.accentHSL, 0.1, 6),
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }} />
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Callus formed. Thicker and tougher than before. This is your armor now.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Meaning making. Where you were cut, you are now armor. Don{"'"}t regret the wound. It{"'"}s the only place they cannot hurt you again. Articulating the lesson transforms pain into knowledge and scar into shield.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Scarred.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}