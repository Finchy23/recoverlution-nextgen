/**
 * KINETIC #7 — The Momentum Save
 * "100 units to start. 1 unit to keep going. Never let the top fall."
 * ARCHETYPE: Pattern A (Tap) — Tap spinning top + choose daily vs weekly
 * ENTRY: Scene-first — wobbling top
 * STEALTH KBE: Choosing 5min/day over 1hr/Saturday = Compound Interest belief (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'wobbling' | 'choosing' | 'saved' | 'resonant' | 'afterglow';

export default function Kinetic_MomentumSave({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'daily' | 'weekly' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('wobbling'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const nudge = () => { if (stage === 'wobbling') setStage('choosing'); };

  const pick = (c: 'daily' | 'weekly') => {
    setChoice(c);
    console.log(`[KBE:B] MomentumSave choice=${c} compoundInterest=${c === 'daily'}`);
    setStage('saved');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: '20px', height: '20px', borderRadius: '50%',
                borderTop: `2px solid ${themeColor(TH.accentHSL, 0.15, 6)}`,
                borderRight: `2px solid transparent` }} />
          </motion.div>
        )}
        {stage === 'wobbling' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The top is wobbling. Don{"'"}t let it fall.
            </div>
            <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 0.5, repeat: Infinity }}
              style={{ width: '30px', height: '30px', borderRadius: '50%',
                borderTop: `3px solid ${themeColor(TH.accentHSL, 0.2, 8)}`,
                borderRight: `3px solid transparent`,
                borderBottom: `3px solid transparent`,
                borderLeft: `3px solid transparent` }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={nudge}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Gentle tap</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'choosing' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              To keep momentum, which do you choose?
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('daily')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>5 min today</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('weekly')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>1 hour Saturday</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'saved' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'daily'
                ? 'The top keeps spinning. 5 minutes × 365 days = 30 hours. Compound interest.'
                : 'It stops spinning by Tuesday. 1 hour on Saturday can\'t overcome 6 days of inertia.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Compound interest. It takes 100 units to start the top, but only 1 to keep it spinning. Daily micro-doses beat weekly marathons because momentum compounds. Never let the top fall.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Spinning.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}