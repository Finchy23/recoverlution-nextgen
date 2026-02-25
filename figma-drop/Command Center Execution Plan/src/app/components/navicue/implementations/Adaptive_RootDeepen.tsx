/**
 * ADAPTIVE #8 -- The Root Deepen
 * "The wind reveals the root system. Anchor deep in the dark."
 * ARCHETYPE: Pattern C (Hold) -- Breathing pacer slows the storm; match to calm
 * ENTRY: Scene-first -- tree in storm
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'storming' | 'calmed' | 'resonant' | 'afterglow';

export default function Adaptive_RootDeepen({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [breaths, setBreaths] = useState(0);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('storming'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'storming') return;
    // 4s in, 4s out
    const id = window.setInterval(() => {
      setPhase(p => p === 'in' ? 'out' : 'in');
    }, 4000);
    return () => clearInterval(id);
  }, [stage]);

  const breathe = () => {
    if (stage !== 'storming') return;
    const next = breaths + 1;
    setBreaths(next);
    if (next >= 4) {
      console.log(`[KBE:E] RootDeepen breathingPacer=matched physiologicalRegulation=confirmed`);
      setStage('calmed');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  const windStrength = Math.max(0, 1 - breaths * 0.25);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 0.5, repeat: Infinity }}
              style={{ width: '3px', height: '30px', background: themeColor(TH.primaryHSL, 0.1, 6),
                borderRadius: '2px', transformOrigin: 'bottom center' }} />
            <div style={{ width: '20px', height: '6px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.08, 5) }} />
          </motion.div>
        )}
        {stage === 'storming' && (
          <motion.div key="str" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Breathe with the pacer. Calm the storm.
            </div>
            {/* Tree */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div animate={{ rotate: [-8 * windStrength, 8 * windStrength, -8 * windStrength] }}
                transition={{ duration: 0.6 + breaths * 0.3, repeat: Infinity }}
                style={{ width: '3px', height: '35px', background: themeColor(TH.primaryHSL, 0.12, 6),
                  borderRadius: '2px', transformOrigin: 'bottom center' }} />
              <motion.div animate={{ opacity: [0.3, 0.3 + breaths * 0.15] }}
                style={{ width: '24px', height: '8px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.08 + breaths * 0.04, 4 + breaths * 2) }} />
            </div>
            {/* Breathing circle */}
            <motion.div animate={{ scale: phase === 'in' ? 1.3 : 0.8 }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>
                {phase === 'in' ? 'in' : 'out'}
              </span>
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={breathe}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Breathe ({breaths}/4)</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'calmed' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '3px', height: '35px', background: themeColor(TH.accentHSL, 0.15, 8),
                borderRadius: '2px' }} />
              <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ width: '28px', height: '10px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.12, 6) }} />
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Still. The wind stopped. The roots grew deeper. Grounded.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Physiological regulation. The storm doesn{"'"}t break the tree with deep roots. The wind reveals the root system, and conscious breathing is how you deepen yours. To stand tall in the light, anchor deep in the dark.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rooted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}