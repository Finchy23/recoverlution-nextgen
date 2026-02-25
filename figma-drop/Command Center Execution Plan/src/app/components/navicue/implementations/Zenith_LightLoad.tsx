/**
 * ZENITH #3 — The Light Load (Ultralight)
 * "Ounces equal pounds. Drop the 'Nice to haves'."
 * ARCHETYPE: Pattern A (Tap) — Discard items from heavy pack
 * ENTRY: Scene-first — overloaded pack
 * STEALTH KBE: Discarding high-value non-essentials = Essentialism / Prioritization (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'heavy' | 'light' | 'resonant' | 'afterglow';

const ITEMS = [
  { label: 'Core Mission', essential: true },
  { label: 'Good Idea A', essential: false },
  { label: 'Key Skill', essential: true },
  { label: 'Nice-to-Have', essential: false },
  { label: 'Side Project', essential: false },
];

export default function Zenith_LightLoad({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dropped, setDropped] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('heavy'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const drop = (idx: number) => {
    if (stage !== 'heavy' || ITEMS[idx].essential) return;
    const next = new Set(dropped);
    next.add(idx);
    setDropped(next);
    const nonEssentialCount = ITEMS.filter(i => !i.essential).length;
    if (next.size >= nonEssentialCount - 0) {
      console.log(`[KBE:K] LightLoad essentialism=confirmed prioritization=true dropped=${next.size}`);
      setStage('light');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '20px', height: '24px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
        )}
        {stage === 'heavy' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your pack is too heavy. Drop the non-essentials. Keep the musts.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {ITEMS.map((item, idx) => (
                <motion.div key={idx}
                  animate={dropped.has(idx) ? { opacity: 0.15, x: 20 } : {}}
                  whileTap={!item.essential && !dropped.has(idx) ? { scale: 0.95 } : {}}
                  onClick={() => drop(idx)}
                  style={{ display: 'flex', gap: '8px', alignItems: 'center',
                    padding: '6px 10px', borderRadius: '6px',
                    cursor: item.essential ? 'default' : 'pointer',
                    background: item.essential
                      ? themeColor(TH.accentHSL, 0.04, 2)
                      : themeColor(TH.primaryHSL, 0.02, 1),
                    border: `1px solid ${item.essential
                      ? themeColor(TH.accentHSL, 0.08, 5)
                      : themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%',
                    background: item.essential
                      ? themeColor(TH.accentHSL, 0.15, 8)
                      : themeColor(TH.primaryHSL, 0.06, 3) }} />
                  <span style={{ fontSize: '10px',
                    color: item.essential ? themeColor(TH.accentHSL, 0.3, 10) : palette.textFaint,
                    textDecoration: dropped.has(idx) ? 'line-through' : 'none' }}>{item.label}</span>
                  {!item.essential && !dropped.has(idx) && (
                    <span style={{ fontSize: '11px', color: palette.textFaint, marginLeft: 'auto' }}>✕</span>
                  )}
                  {item.essential && (
                    <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.15, 6), marginLeft: 'auto' }}>MUST</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'light' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Ultralight. The pack is light. You can breathe. Ounces equal pounds, pounds equal pain. You cannot carry everything to the summit; only the essentials survive altitude. Drop the "Nice to haves." Keep the "Musts."
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Prioritization. Steve Jobs returned to Apple and killed 70% of products, focusing on four quadrants. Ultralight backpackers weigh every gram because at altitude, extra weight kills. Strategic subtraction, the discipline of dropping good ideas to keep great ones, is what separates amateurs from masters.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Light.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}