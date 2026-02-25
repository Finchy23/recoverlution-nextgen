/**
 * ASTRONAUT #9 -- The Deathbed View
 * "Regret is a compass. Don't wait until the end to look back."
 * ARCHETYPE: Pattern A (Tap) -- Choose Love, Courage, or Work
 * ENTRY: Scene-first -- peaceful bedroom window
 * STEALTH KBE: Selecting Love/Courage = Mortality Salience benefits (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Stellar');
type Stage = 'arriving' | 'looking' | 'chosen' | 'resonant' | 'afterglow';

const VALUES = [
  { label: 'Love', description: 'I wish I had loved more fearlessly.' },
  { label: 'Courage', description: 'I wish I had risked more, failed more, lived louder.' },
  { label: 'Work', description: 'I wish I had built the thing I kept postponing.' },
];

export default function Astronaut_DeathbedView({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<typeof VALUES[0] | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('looking'), 2500); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (v: typeof VALUES[0]) => {
    if (stage !== 'looking') return;
    setChoice(v);
    const mortalityBenefit = v.label === 'Love' || v.label === 'Courage';
    console.log(`[KBE:B] DeathbedView choice="${v.label}" mortalitySalience=${mortalityBenefit} valueClarity=confirmed`);
    setStage('chosen');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '40px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}`,
              position: 'relative' }}>
            {/* Window frame */}
            <div style={{ position: 'absolute', inset: '4px', borderRadius: '2px',
              background: themeColor(TH.accentHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}` }} />
          </motion.div>
        )}
        {stage === 'looking' && (
          <motion.div key="lo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are 90. Safe. Peaceful. Looking back at today. What do you wish you had done?
            </div>
            {/* Window visualization */}
            <div style={{ width: '80px', height: '55px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '6px', borderRadius: '2px',
                background: `linear-gradient(to bottom,
                  ${themeColor(TH.accentHSL, 0.03, 2)},
                  ${themeColor(TH.accentHSL, 0.01, 1)})` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {VALUES.map(v => (
                <motion.div key={v.label} whileTap={{ scale: 0.97 }} onClick={() => choose(v)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '14px 14px',
                    borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.03, 2),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
                  <div style={{ fontSize: '11px', fontWeight: 600,
                    color: themeColor(TH.accentHSL, 0.4, 12) }}>{v.label}</div>
                  <div style={{ fontSize: '11px', color: palette.textFaint, fontStyle: 'italic' }}>{v.description}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'chosen' && choice && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
              fontStyle: 'italic' }}>
            {choice.label}. The 90-year-old version of you just told you what matters. Don{"'"}t wait until the end to look back. Look back now -- from the future -- and change today.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Mortality salience. Terror Management Theory shows that brief, safe contemplation of death clarifies values and reduces trivial anxiety. Regret is a compass -- it points to what matters. The top five deathbed regrets are all about love, courage, and authenticity, never about productivity metrics. Look back from 90. Change today.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Clarified.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}