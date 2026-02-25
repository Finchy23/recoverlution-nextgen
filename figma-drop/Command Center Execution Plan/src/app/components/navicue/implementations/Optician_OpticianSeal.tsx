/**
 * OPTICIAN #10 — The Optician's Seal (Perceptual Agency)
 * "I see clearly. I choose what I see."
 * ARCHETYPE: Pattern A (Tap) — Phoropter lenses clicking into clarity
 * ENTRY: Cold open — lens mechanism appears, clicking sounds
 * STEALTH KBE: Completion itself is the proof of Perceptual Agency
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Identity Koan');
type Stage = 'arriving' | 'clicking' | 'clear' | 'resonant' | 'afterglow';

export default function Optician_OpticianSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lensClick, setLensClick] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('clicking'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const clickLens = () => {
    const next = lensClick + 1;
    setLensClick(next);
    if (next >= 3) {
      console.log(`[KBE:E] OpticianSeal lensClicks=3 perceptualAgency=confirmed`);
      t(() => setStage('clear'), 400);
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    }
  };

  const lensLabels = ['blur', 'close', '20/20'];
  const blurLevels = [4, 2, 0];

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Phoropter shape */}
            <div style={{ width: '120px', height: '60px', borderRadius: radius.full,
              border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
                background: themeColor(TH.primaryHSL, 0.04, 3) }} />
            </div>
          </motion.div>
        )}
        {stage === 'clicking' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center', letterSpacing: '0.1em' }}>
              click. click. click.
            </div>
            {/* Phoropter with lens slot */}
            <div style={{ position: 'relative' }}>
              <div style={{ width: '120px', height: '60px', borderRadius: radius.full,
                border: `2px solid ${themeColor(TH.primaryHSL, 0.12, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                  animate={{ filter: `blur(${blurLevels[Math.min(lensClick, 2)]}px)` }}
                  transition={{ duration: 0.3 }}
                  style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3 + lensClick * 0.15, 10),
                    fontSize: '14px', textAlign: 'center' }}>
                  {lensClick < 3 ? lensLabels[lensClick] : '20/20'}
                </motion.div>
              </div>
              {/* Click indicator */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                    background: i < lensClick
                      ? themeColor(TH.accentHSL, 0.3, 10)
                      : themeColor(TH.primaryHSL, 0.06, 4) }} />
                ))}
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={clickLens}
              style={{ padding: '14px 26px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12) }}>click</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'clear' && (
          <motion.div key="clr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: '120px', height: '60px', borderRadius: radius.full,
                border: `2px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${themeColor(TH.accentHSL, 0.06, 10)}` }}>
              <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.5, 15), fontWeight: '500' }}>20/20</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              I see clearly. I choose what I see.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Perceptual agency. The realization that perception is an active construction, not a passive reception. You do not see the world. You see your prescription. Change the glasses.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Prescribed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}