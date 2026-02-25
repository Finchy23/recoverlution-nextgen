/**
 * CATALYST #8 — The Future Pace
 * "They cannot move because they cannot see the destination. Paint the picture."
 * ARCHETYPE: Pattern A (Tap) — Select sensory details to populate a success vision
 * ENTRY: Ambient fade — fog
 * STEALTH KBE: Richness of detail selected = Persuasive Visualization (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CATALYST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'active' | 'painted' | 'resonant' | 'afterglow';
const DETAILS = [
  { label: 'Applause', sense: 'sound' },
  { label: 'Warm light', sense: 'sight' },
  { label: 'Deep breath', sense: 'body' },
  { label: 'A smile', sense: 'sight' },
];

export default function Catalyst_FuturePace({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const select = (idx: number) => {
    if (stage !== 'active') return;
    const next = new Set(selected);
    next.add(idx);
    setSelected(next);
    if (next.size >= DETAILS.length) {
      console.log(`[KBE:B] FuturePace detailsSelected=${next.size} persuasiveVisualization=confirmed`);
      setStage('painted');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="ar" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}>
            <div
            style={{ width: '120px', height: '60px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.03, 2),
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...navicueType.hint, color: palette.textFaint }}>fog</span>
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Paint the picture. What does winning feel like?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {DETAILS.map((d, i) => (
                <motion.div key={i} whileTap={{ scale: 0.95 }}
                  onClick={() => select(i)}
                  animate={{ opacity: selected.has(i) ? 0.4 : 1 }}
                  style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                    background: selected.has(i) ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.04, 2),
                    border: `1px solid ${selected.has(i) ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                  <div style={{ ...navicueType.choice, color: selected.has(i) ? themeColor(TH.accentHSL, 0.3, 10) : palette.textFaint, fontSize: '11px' }}>
                    {d.label} ({d.sense})
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>{selected.size}/{DETAILS.length} details</div>
          </motion.div>
        )}
        {stage === 'painted' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
              style={{ width: '120px', height: '60px', borderRadius: radius.sm,
                background: `linear-gradient(135deg, ${themeColor(TH.accentHSL, 0.06, 4)}, ${themeColor(TH.accentHSL, 0.03, 2)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10) }}>vivid</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The fog cleared. They can see the destination. They{"'"}re walking toward it.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Persuasive visualization. People cannot move toward what they cannot see. The future pace — painting a vivid, sensory-rich picture of success — creates a destination. Vision is the catalyst{"'"}s beam of light through the fog.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Painted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}