/**
 * FUTURE WEAVER #1 — The Future Memory
 * "Nostalgia for the future. Construct the memory now."
 * ARCHETYPE: Pattern A (Tap) — Drag items into empty photo frame
 * ENTRY: Scene-first — empty frame
 * STEALTH KBE: Specificity of items = Agency & Pathways Thinking / Hope Theory (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'framing' | 'filled' | 'resonant' | 'afterglow';

const ITEMS = ['Peace', 'Garden', 'Book', 'Laughter', 'Morning Light'];

export default function FutureWeaver_FutureMemory({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('framing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const place = (idx: number) => {
    if (stage !== 'framing') return;
    const next = new Set(placed);
    next.add(idx);
    setPlaced(next);
    if (next.size >= 3) {
      const items = Array.from(next).map(i => ITEMS[i]);
      console.log(`[KBE:B] FutureMemory items=${JSON.stringify(items)} hopeTheory=confirmed pathwaysThinking=true`);
      setStage('filled');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '40px', height: '30px', borderRadius: '3px',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
        )}
        {stage === 'framing' && (
          <motion.div key="fr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A photo from 5 years from now. Fill the frame.
            </div>
            {/* Frame */}
            <div style={{ width: '120px', height: '80px', borderRadius: radius.xs,
              border: `2px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
              background: themeColor(TH.primaryHSL, 0.02, 1),
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
              gap: '4px', padding: '8px' }}>
              {Array.from(placed).map(idx => (
                <motion.div key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ padding: '3px 6px', borderRadius: radius.xs,
                    background: themeColor(TH.accentHSL, 0.06, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>{ITEMS[idx]}</span>
                </motion.div>
              ))}
              {placed.size === 0 && (
                <span style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.06, 4) }}>5 Years From Now</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {ITEMS.map((item, idx) => (
                <motion.div key={idx} whileTap={{ scale: 0.9 }}
                  onClick={() => place(idx)}
                  style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
                    opacity: placed.has(idx) ? 0.3 : 1,
                    background: themeColor(TH.accentHSL, 0.05, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 10) }}>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'filled' && (
          <motion.div key="fi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Framed. A memory you haven{"'"}t had yet. The more specific the vision, the stronger the pull toward it. Nostalgia for the future — construct the memory now so you can walk towards it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Hope Theory (C.R. Snyder). Hope = Agency ("I can") + Pathways ("I know how"). Prospective memory — constructing a vivid future scene — activates the same neural circuitry as recalling the past. The specificity of the vision predicts motivation. Vague hope is weak; concrete future memory is nuclear fuel for action.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Framed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}