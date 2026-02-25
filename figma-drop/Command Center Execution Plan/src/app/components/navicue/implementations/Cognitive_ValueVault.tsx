/**
 * ARCHITECT II #5 — The Value Vault
 * "These are non-negotiable. Never spend the principal."
 * Pattern A (Tap) — Open vault, select top 3 core values
 * STEALTH KBE: Selecting values = Psychological Anchor / Values Alignment (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Cognitive Structuring', 'knowing', 'Circuit');
type Stage = 'arriving' | 'open' | 'locked' | 'resonant' | 'afterglow';

const VALUES = ['Integrity', 'Courage', 'Curiosity', 'Compassion', 'Freedom', 'Justice', 'Growth', 'Connection'];

export default function Cognitive_ValueVault({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState<string[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('open'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const toggle = (v: string) => {
    if (stage !== 'open') return;
    const next = selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v].slice(-3);
    setSelected(next);
  };

  const lock = () => {
    if (stage !== 'open' || selected.length < 3) return;
    console.log(`[KBE:K] ValueVault values="${selected.join(',')}" valuesAlignment=confirmed psychologicalAnchor=true`);
    setStage('locked');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '2px',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'open' && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Vault open. Inside: your core values. Select your top 3 non-negotiables. These are the reserves. Never spend the principal.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center', maxWidth: '220px' }}>
              {VALUES.map(v => {
                const isSelected = selected.includes(v);
                return (
                  <motion.div key={v} whileTap={{ scale: 0.9 }} onClick={() => toggle(v)}
                    style={{ padding: '5px 10px', borderRadius: radius.sm, cursor: 'pointer',
                      background: isSelected ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.02, 1),
                      border: `1px solid ${isSelected ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                    <span style={{ fontSize: '11px', color: isSelected ? themeColor(TH.accentHSL, 0.4, 14) : palette.textFaint }}>
                      {isSelected ? '◆' : '◇'} {v}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={lock}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                opacity: selected.length >= 3 ? 1 : 0.4 }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Lock Vault</div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Select exactly 3</div>
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Vault locked. Your reserves: {selected.join(', ')}. These are non-negotiable. Everything else is currency to be traded — career, comfort, convenience. But these? These are the diamonds. Check the inventory regularly. When decisions get complicated, the vault simplifies: does this choice honor the reserves, or does it spend the principal?
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Values clarification. Schwartz{"'"}s Theory of Basic Human Values: values serve as guiding principles in life, operating as internal standards for self-evaluation. When behavior aligns with stated values, psychological well-being increases; when it diverges, anxiety and depression follow. ACT uses values as a "compass" — not a destination, but a direction. The vault metaphor: protect what matters most, and decisions simplify.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Secured.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}