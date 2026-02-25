/**
 * SYNTHESIS #8 — The Values Alloy
 * "Kindness without truth is weak. Truth without kindness is cruel. Alloy them."
 * ARCHETYPE: Pattern D (Type) — Create a personal code from alloy
 * ENTRY: Scene-first — two metals
 * STEALTH KBE: Saving a personal code = Moral Identity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'smelting' | 'alloyed' | 'resonant' | 'afterglow';

export default function Synthesis_ValuesAlloy({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [code, setCode] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'name your alloy...',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      setCode(value.trim());
      console.log(`[KBE:B] ValuesAlloy personalCode="${value.trim()}" moralIdentity=confirmed virtueEthics=true`);
      setStage('alloyed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('smelting'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '12px' }}>
            <div style={{ width: '14px', height: '18px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            <div style={{ width: '14px', height: '18px', borderRadius: '2px', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'smelting' && (
          <motion.div key="sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two metals. Kindness (soft) + Truth (hard). Alloy them into something strong enough to heal.
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ padding: '8px 12px', borderRadius: '6px',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Kindness ✦ Soft</span>
              </div>
              <span style={{ fontSize: '12px', color: palette.textFaint }}>+</span>
              <div style={{ padding: '8px 12px', borderRadius: '6px',
                background: themeColor(TH.accentHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>Truth ✦ Hard</span>
              </div>
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.2, 6), fontSize: '11px' }}>
              = Compassionate Candor
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Forge</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'alloyed' && (
          <motion.div key="al" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px 18px', borderRadius: radius.sm,
              background: `linear-gradient(135deg, ${themeColor(TH.primaryHSL, 0.04, 2)}, ${themeColor(TH.accentHSL, 0.06, 3)})`,
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <span style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.4, 14) }}>{code}</span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Your alloy. Strong enough to heal. Kindness without truth is people-pleasing. Truth without kindness is cruelty. Together, they forge something rare.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Virtue ethics. Kim Scott{"'"}s "Radical Candor" framework: Care Personally + Challenge Directly = growth. The alloy is ancient; Aristotle called it the "Golden Mean" between deficiency and excess. Your personal code is the alloy that defines how you show up in the world. Forge it deliberately.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Alloyed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}