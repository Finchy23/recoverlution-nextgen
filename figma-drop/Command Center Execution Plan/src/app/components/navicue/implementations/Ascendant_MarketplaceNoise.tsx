/**
 * ASCENDANT #3 -- The Marketplace Noise
 * "Peace in a cave is easy. Peace in the market is mastery."
 * Pattern A (Tap) -- Chaotic market scene; toggle "Inner Silence"; noise continues but calm
 * STEALTH KBE: Maintaining stability despite chaos = State Stability / Resilience (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'chaos' | 'silent' | 'mastered' | 'resonant' | 'afterglow';

const { palette } = navicueQuickstart('sacred_ordinary', 'Integrated Living', 'embodying', 'Cosmos');
const NOISES = ['SALE!', '$$$', 'BUY!', 'HURRY!', 'NOW!', 'MORE!', 'DEAL!', 'FAST!'];

export default function Ascendant_MarketplaceNoise({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holdTime, setHoldTime] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('chaos'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const toggleSilence = () => {
    if (stage !== 'chaos') return;
    setStage('silent');
  };

  useEffect(() => {
    if (stage !== 'silent') return;
    const iv = window.setInterval(() => {
      setHoldTime(prev => {
        const next = prev + 300;
        if (next >= 4000) {
          clearInterval(iv);
          console.log(`[KBE:E] MarketplaceNoise stateStability=confirmed resilience=true`);
          setStage('mastered');
          t(() => setStage('resonant'), 5000);
          t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
        }
        return next;
      });
    }, 300);
    return () => clearInterval(iv);
  }, [stage]);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[0,1,2,3].map(i => (
                <motion.div key={i} animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  style={{ width: '2px', height: '6px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {(stage === 'chaos' || stage === 'silent') && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {stage === 'chaos' ? 'A noisy market. Chaos everywhere. Can you find inner silence?' : 'Inner silence activated. The noise continues. You are calm.'}
            </div>
            {/* Noise field */}
            <div style={{ position: 'relative', width: '140px', height: '50px', overflow: 'hidden' }}>
              {NOISES.map((n, i) => (
                <motion.span key={i}
                  animate={{ x: [Math.random() * 120, Math.random() * 120], y: [Math.random() * 40, Math.random() * 40] }}
                  transition={{ duration: 1 + Math.random() * 2, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ position: 'absolute', fontSize: '11px',
                    color: stage === 'silent' ? themeColor(TH.primaryHSL, 0.02, 1) : themeColor(TH.primaryHSL, 0.05, 3),
                    transition: 'color 1s' }}>
                  {n}
                </motion.span>
              ))}
            </div>
            {stage === 'chaos' ? (
              <motion.div whileTap={{ scale: 0.9 }} onClick={toggleSilence}
                style={immersiveTapPillThemed(TH.accentHSL).container}>
                <div style={immersiveTapPillThemed(TH.accentHSL).label}>Inner Silence</div>
              </motion.div>
            ) : (
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.2, 6) }}>
                Holding center... {Math.round(holdTime / 1000)}s / 4s
              </div>
            )}
          </motion.div>
        )}
        {stage === 'mastered' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Mastered. The market is still shouting. But you held the center. Peace in a cave is easy. Peace in the market is mastery. Can you hold the center while the prices are shouting? You just did. This is integrated living -- not escaping chaos but containing it. The silence doesn{"'"}t require quiet. It requires depth.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            State stability under perturbation. The "10th Ox-Herding Picture" in Zen: the enlightened person returns to the marketplace "with bliss-bestowing hands." Resilience research (Bonanno, 2004): resilient individuals don{"'"}t avoid stressors -- they maintain stable functioning despite them. HRV coherence studies: experienced meditators maintain heart rate variability even during stress induction. The goal is not to eliminate noise. It is to develop a deeper relationship with silence that noise cannot penetrate.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Centered.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}