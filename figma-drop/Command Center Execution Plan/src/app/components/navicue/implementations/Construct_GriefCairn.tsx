/**
 * CONSTRUCT #2 — The Grief Cairn (Externalization of Grief)
 * "Do not carry the stone in your pocket. Place it here."
 * ARCHETYPE: Pattern A (Tap) — Tap to place a stone on the cairn
 * ENTRY: Cold open — the lonely hill appears immediately
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'placed' | 'resonant' | 'afterglow';

const STONE_OFFSETS = [
  { x: 0, y: 0 }, { x: -12, y: -18 }, { x: 10, y: -16 },
  { x: -6, y: -34 }, { x: 8, y: -32 }, { x: 0, y: -48 },
  { x: -10, y: -46 }, { x: 4, y: -60 },
];

export default function Construct_GriefCairn({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stones, setStones] = useState(3);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const placeStone = () => {
    if (stage !== 'active') return;
    const next = stones + 1;
    setStones(next);
    setStage('placed');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const renderStones = (count: number) => {
    return STONE_OFFSETS.slice(0, Math.min(count, STONE_OFFSETS.length)).map((off, i) => (
      <motion.div key={i} initial={i === count - 1 ? { opacity: 0, y: -30 } : { opacity: 1 }}
        animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'absolute', bottom: `${50 + off.y * -1}px`, left: `${60 + off.x}px`,
          width: `${18 + Math.random() * 8}px`, height: `${12 + Math.random() * 6}px`,
          borderRadius: '40%', background: themeColor(TH.primaryHSL, 0.25 + i * 0.03, 8 + i * 2),
          border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
    ));
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '140px', height: '120px', position: 'relative' }}>
              {renderStones(stones)}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>a lonely hill</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Do not carry the stone in your pocket. It is too heavy. Place it here. The pile is proof that you survived.
            </div>
            <div style={{ width: '140px', height: '120px', position: 'relative' }}>
              {renderStones(stones)}
            </div>
            <motion.div onClick={placeStone} whileTap={{ scale: 0.96 }}
              style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>place a stone</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'placed' && (
          <motion.div key="pl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '140px', height: '120px', position: 'relative' }}>
              {renderStones(stones)}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the pile grows</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Externalization of Grief. Creating a tangible, cumulative representation of loss transforms abstract suffering into a concrete monument {'\u2014'} facilitating the shift from holding on to honoring.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>You survived.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}