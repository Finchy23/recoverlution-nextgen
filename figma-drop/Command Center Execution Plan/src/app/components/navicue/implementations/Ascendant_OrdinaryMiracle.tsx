/**
 * ASCENDANT #5 -- The Ordinary Miracle
 * "There are no ordinary things. Only ordinary seeing."
 * Pattern A (Tap) -- Tap bread; trace chain backward: Wheat → Sun → Rain → Farmer → Baker → Miracle
 * STEALTH KBE: Acknowledging chain = Sacred Outlook / Gratitude (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Integrated Living', 'believing', 'Cosmos');
type Stage = 'arriving' | 'bread' | 'miracle' | 'resonant' | 'afterglow';

const CHAIN = ['Bread', 'Wheat', 'Sun', 'Rain', 'Farmer', 'Baker', 'Miracle'];

export default function Ascendant_OrdinaryMiracle({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [idx, setIdx] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('bread'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tap = () => {
    if (stage !== 'bread') return;
    const next = idx + 1;
    if (next >= CHAIN.length) {
      console.log(`[KBE:B] OrdinaryMiracle sacredOutlook=confirmed gratitude=true`);
      setStage('miracle');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    } else {
      setIdx(next);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '10px', borderRadius: '4px 4px 2px 2px',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'bread' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A slice of bread. "Just bread." Tap to look closer.
            </div>
            <motion.div key={idx} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35 + idx * 0.02, 12), fontSize: '13px' }}>
                {CHAIN[idx]}
              </span>
            </motion.div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {CHAIN.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: i <= idx ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.03, 1) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={tap}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Look Closer</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'miracle' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Miracle. Just bread? No -- wheat, sun, rain, farmer, baker. A miracle disguised as breakfast. There are no ordinary things. There is only ordinary seeing. Look closer. The bread is the body of the stars -- carbon forged in supernovae, captured by wheat from air and light, shaped by human hands. Every object is a compressed history of the universe.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Gratitude and the sacred ordinary. Thich Nhat Hanh{"'"}s "interbeing": a sheet of paper contains the tree, the rain, the logger, the sun. Robert Emmons{"'"} gratitude research: people who practice daily gratitude show 25% higher well-being, better sleep, more exercise, and lower depression. Brother David Steindl-Rast: "It is not happiness that makes us grateful. It is gratefulness that makes us happy." The ordinary miracle is a perceptual practice: seeing the extraordinary in what the habituated eye dismisses.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Miraculous.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}