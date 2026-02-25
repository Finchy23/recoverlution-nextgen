/**
 * ADAPTIVE #1 -- The Elastic Snap
 * "The stress is loading the bow. The further back, the further you fly."
 * ARCHETYPE: Pattern A (Tap) -- Label the tension: "Threat" or "Potential"
 * ENTRY: Scene-first -- stretching rubber band
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'stretching' | 'labeled' | 'resonant' | 'afterglow';

export default function Adaptive_ElasticSnap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'threat' | 'potential' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('stretching'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const label = (c: 'threat' | 'potential') => {
    if (stage !== 'stretching') return;
    setChoice(c);
    console.log(`[KBE:B] ElasticSnap label=${c} stressEnhancing=${c === 'potential'}`);
    setStage('labeled');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div animate={{ scaleX: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '60px', height: '6px', borderRadius: '3px',
                background: themeColor(TH.accentHSL, 0.12, 6) }} />
          </motion.div>
        )}
        {stage === 'stretching' && (
          <motion.div key="str" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The band is stretching. What is this tension?
            </div>
            <motion.div animate={{ scaleX: [1, 1.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '80px', height: '8px', borderRadius: radius.xs,
                background: themeColor(TH.accentHSL, 0.15, 8) }} />
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => label('threat')}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: 'hsla(0, 18%, 28%, 0.05)', border: '1px solid hsla(0, 18%, 35%, 0.1)' }}>
                <div style={{ ...navicueType.choice, color: 'hsla(0, 25%, 40%, 0.4)' }}>Threat</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => label('potential')}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Potential</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'labeled' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {choice === 'potential' ? (
              <motion.div initial={{ x: -20 }} animate={{ x: 40 }} transition={{ duration: 0.8, delay: 0.5 }}
                style={{ width: '10px', height: '10px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.25, 10) }} />
            ) : (
              <div style={{ width: '60px', height: '6px', borderRadius: '3px',
                background: 'hsla(0, 20%, 30%, 0.08)' }} />
            )}
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'potential'
                ? 'Snap! The tension launched you forward. Stress was stored energy all along.'
                : 'You saw a threat. The tension felt like damage. But it was loading the bow.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Stress mindset. The tension is not trying to break you. It{"'"}s loading the bow. Research shows: believing stress enhances performance actually makes it so. The further you are pulled back, the further you fly.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Elastic.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}