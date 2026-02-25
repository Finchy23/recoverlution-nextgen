/**
 * MEANING MAKER #7 — The Gratitude Lens
 * "You are swimming in miracles you have normalized."
 * ARCHETYPE: Pattern A (Tap) — Toggle lens, tap glowing items
 * ENTRY: Scene-first — boring room
 * STEALTH KBE: Dwell time on items = Depth of Appreciation / Savoring (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'boring' | 'illuminated' | 'resonant' | 'afterglow';

const ITEMS = [
  { name: 'The coffee', x: 20, y: 25, poem: 'A harvest of hands. Soil, rain, fire, ship, grinder, cup.' },
  { name: 'The window', x: 65, y: 15, poem: 'A shield of glass. Rain outside, warmth inside. Engineering miracle.' },
  { name: 'The chair', x: 40, y: 55, poem: 'Holding you so you don\'t have to hold yourself. Quiet servant.' },
  { name: 'The light', x: 75, y: 50, poem: 'Captured lightning. Edison\'s gift, still glowing, still free.' },
];

export default function Meaning_GratitudeLens({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lensOn, setLensOn] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [activePoem, setActivePoem] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('boring'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const toggleLens = () => {
    if (!lensOn) {
      setLensOn(true);
      setStage('illuminated');
    }
  };

  const revealItem = (idx: number) => {
    if (!lensOn) return;
    const next = new Set(revealed);
    next.add(idx);
    setRevealed(next);
    setActivePoem(ITEMS[idx].poem);
    if (next.size >= ITEMS.length) {
      console.log(`[KBE:B] GratitudeLens itemsRevealed=${next.size} savoring=confirmed appreciation=true`);
      t(() => setStage('resonant'), 4000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '50px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }} />
        )}
        {(stage === 'boring' || stage === 'illuminated') && (
          <motion.div key="room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {lensOn ? 'Inventory the wealth. Tap the glowing items.' : 'A boring room. Toggle the gratitude lens.'}
            </div>
            {/* Room */}
            <div style={{ width: '180px', height: '100px', borderRadius: radius.sm, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
              {ITEMS.map((item, idx) => (
                <motion.div key={idx}
                  animate={lensOn && !revealed.has(idx) ? { boxShadow: [
                    `0 0 4px ${themeColor(TH.accentHSL, 0.04, 4)}`,
                    `0 0 8px ${themeColor(TH.accentHSL, 0.08, 6)}`,
                    `0 0 4px ${themeColor(TH.accentHSL, 0.04, 4)}`,
                  ] } : {}}
                  transition={lensOn ? { duration: 1.5, repeat: Infinity } : {}}
                  whileTap={lensOn ? { scale: 0.85 } : {}}
                  onClick={() => revealItem(idx)}
                  style={{ position: 'absolute', left: `${item.x}%`, top: `${item.y}%`,
                    transform: 'translate(-50%,-50%)', cursor: lensOn ? 'pointer' : 'default',
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: revealed.has(idx)
                      ? themeColor(TH.accentHSL, 0.12, 6)
                      : lensOn ? themeColor(TH.accentHSL, 0.05, 3) : themeColor(TH.primaryHSL, 0.03, 1),
                    border: `1px solid ${revealed.has(idx)
                      ? themeColor(TH.accentHSL, 0.2, 10)
                      : lensOn ? themeColor(TH.accentHSL, 0.08, 5) : themeColor(TH.primaryHSL, 0.04, 2)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.4s' }}>
                  <span style={{ fontSize: '6px',
                    color: revealed.has(idx) ? themeColor(TH.accentHSL, 0.4, 14) : palette.textFaint }}>
                    {item.name.split(' ')[1]}
                  </span>
                </motion.div>
              ))}
            </div>
            {activePoem && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), fontStyle: 'italic',
                  textAlign: 'center', maxWidth: '240px' }}>
                {activePoem}
              </motion.div>
            )}
            {!lensOn && (
              <motion.div whileTap={{ scale: 0.9 }} onClick={toggleLens}
                style={{ padding: '10px 22px', borderRadius: '9999px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Gratitude Lens</div>
              </motion.div>
            )}
            {lensOn && (
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {revealed.size}/{ITEMS.length} revealed
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Savoring — the deliberate attention to positive experience. Robert Emmons{"'"} gratitude research shows that regular savoring increases happiness by 25% and reduces depressive symptoms. You{"'"}re swimming in miracles you{"'"}ve normalized. The coffee is a harvest. The window is a shield. The chair is a servant. De-normalize them. Inventory the wealth.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Wealthy.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}