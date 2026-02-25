/**
 * ADAPTIVE #10 -- The Adaptive Seal (Neuroplasticity)
 * "Survival is not the strongest. It is the most adaptable."
 * ARCHETYPE: Pattern A (Tap) -- DNA helix mutating and improving
 * ENTRY: Cold open -- DNA helix spinning
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'spinning' | 'mutating' | 'sealed' | 'resonant' | 'afterglow';

export default function Adaptive_AdaptiveSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('spinning'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const evolve = () => {
    if (stage !== 'spinning') return;
    console.log(`[KBE:E] AdaptiveSeal neuroplasticity=confirmed`);
    setStage('mutating');
    t(() => setStage('sealed'), 3000);
    t(() => setStage('resonant'), 7000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: `${8 + Math.sin(i * 1.5) * 8}px`, marginTop: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: themeColor(TH.primaryHSL, 0.08, 5) }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: themeColor(TH.primaryHSL, 0.08, 5) }} />
              </div>
            ))}
          </motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>DNA</div>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', gap: `${8 + Math.sin(i * 1.2) * 10}px`, marginTop: '3px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.1, 5 + i) }} />
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.1, 5 + i) }} />
                </div>
              ))}
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={evolve}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Evolve</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'mutating' && (
          <motion.div key="mut" initial={{ opacity: 1 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: 0, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i} animate={{ gap: [`${8 + Math.sin(i * 1.2) * 10}px`, `${12 + Math.cos(i * 0.8) * 8}px`] }}
                  transition={{ duration: 1.5, delay: i * 0.3 }}
                  style={{ display: 'flex', marginTop: '3px' }}>
                  <motion.div animate={{ backgroundColor: [themeColor(TH.accentHSL, 0.1, 5 + i), themeColor(TH.accentHSL, 0.2, 8 + i)] }}
                    style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
                  <motion.div animate={{ backgroundColor: [themeColor(TH.accentHSL, 0.1, 5 + i), themeColor(TH.accentHSL, 0.2, 8 + i)] }}
                    style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
                </motion.div>
              ))}
            </motion.div>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.25, 8) }}>mutating...</div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              I evolve. Survival is not the strongest. It is the most adaptable. You are literally re-wiring.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Neuroplasticity. The brain{"'"}s ability to reorganize itself by forming new neural connections throughout life. You are not fixed. You are not your old wiring. The DNA mutates, improves, adapts. Survival belongs to the most adaptable.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Evolved.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}