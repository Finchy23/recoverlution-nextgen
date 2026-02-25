/**
 * OMEGA #9 — The Final Exhale
 * "Hold your breath. Hold everything you've learned. Now... let it all go."
 * STEALTH KBE: Hold 10s + Release = Letting Go (E)
 * Web: Hold button for 10s, then release
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Letting Go', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'hold' | 'release' | 'resonant' | 'afterglow';

export default function Unity_FinalExhale({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    requiredDuration: 10000,
    onComplete: () => {
      setStage('release');
    },
  });

  useEffect(() => { t(() => setStage('hold'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const releaseAll = () => {
    if (stage !== 'release') return;
    console.log(`[KBE:E] FinalExhale held=true released=true lettingGo=true`);
    setStage('resonant');
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Letting Go" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'hold' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Hold your breath. Hold everything you have learned. Hold it all.
            </div>
            {/* Expanding ring — grows with hold progress */}
            <motion.div {...hold.bind()}
              style={{ width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.02 + hold.progress * 0.08, 4)}, transparent)`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + hold.progress * 0.14, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${1 + hold.progress * 0.3})`, transition: 'transform 0.3s' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: palette.text, opacity: 0.4 + hold.progress * 0.4 }}>
                HOLD
              </span>
            </motion.div>
            <div style={{ width: '60px', height: '2px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 1) }}>
              <motion.div style={{ width: `${hold.progress * 100}%`, height: '100%', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.15, 5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'release' && (
          <motion.div key="rel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Now... let it all go.
            </div>
            <motion.div whileTap={{ scale: 0.92 }} onClick={releaseAll}
              animate={{ scale: [1, 0.98, 1], transition: { repeat: Infinity, duration: 3 } }}
              style={{ padding: '14px 28px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}` }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: palette.text }}>RELEASE</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            William James (1890): "The art of being wise is the art of knowing what to overlook." The exhale is not loss. The exhale is trust. You held everything. And then you chose to let it live freely. This is mastery.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.35 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Released.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}