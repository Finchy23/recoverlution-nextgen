/**
 * VALUATOR #10 — The Gold Standard (Unconditional Self-Worth)
 * "Your worth is inherent. It is not fluctuating on the market."
 * ARCHETYPE: Pattern A (Tap) — Gold coin struck with your face
 * ENTRY: Cold open — blank coin disc
 * STEALTH KBE: Completion = Unconditional Self-Worth mastery
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'striking' | 'sealed' | 'resonant' | 'afterglow';

export default function Valuator_GoldStandard({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [strikes, setStrikes] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('striking'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const strike = () => {
    const next = strikes + 1;
    setStrikes(next);
    if (next >= 3) {
      console.log(`[KBE:E] GoldStandard unconditionalSelfWorth=confirmed`);
      t(() => setStage('sealed'), 400);
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
          </motion.div>
        )}
        {stage === 'striking' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.1em' }}>
              strike. strike. strike.
            </div>
            <motion.div animate={{ boxShadow: strikes > 0 ? `0 0 ${strikes * 6}px ${themeColor(TH.accentHSL, 0.06 + strikes * 0.03, 8)}` : 'none' }}
              style={{ width: '60px', height: '60px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.04 + strikes * 0.03, 3),
                border: `2px solid ${themeColor(TH.accentHSL, 0.08 + strikes * 0.05, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {strikes >= 2 && <div style={{ width: '16px', height: '16px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 8) }} />}
            </motion.div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < strikes ? themeColor(TH.accentHSL, 0.3, 10) : themeColor(TH.primaryHSL, 0.06, 4) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={strike}
              style={{ padding: '14px 26px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12) }}>strike</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: '60px', height: '60px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 8),
                border: `2px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
                boxShadow: `0 0 20px ${themeColor(TH.accentHSL, 0.08, 10)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.25, 14) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              Your worth is inherent. It is not fluctuating on the market.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Unconditional self-worth. Decoupling self-esteem from external performance or validation buffers against depression and anxiety. The gold coin has your face on it: minted, not earned.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Minted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}