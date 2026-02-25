/**
 * VALUATOR #5 — The Opportunity Cost
 * "You cannot spend the same hour twice."
 * ARCHETYPE: Pattern A (Tap) — Drop coin into Scroll or Create; wrong choice seals the other
 * ENTRY: Cold open — coin labeled "Time"
 * STEALTH KBE: Selecting "Create" = Executive Function alignment (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Circuit');
type Stage = 'arriving' | 'active' | 'spent' | 'resonant' | 'afterglow';

export default function Valuator_OpportunityCost({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'scroll' | 'create' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const spend = (slot: 'scroll' | 'create') => {
    if (stage !== 'active') return;
    setChoice(slot);
    console.log(`[KBE:K] OpportunityCost choice=${slot} executiveFunction=${slot === 'create'}`);
    setStage('spent');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '36px', height: '36px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8px', color: themeColor(TH.accentHSL, 0.3, 10) }}>TIME</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You cannot spend the same hour twice. Where does the coin go?
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.1, 6),
              border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>TIME</span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => spend('scroll')}
                style={{ width: '80px', height: '50px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.25, 8), fontSize: '11px' }}>Scroll</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => spend('create')}
                style={{ width: '80px', height: '50px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.05, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12), fontSize: '11px' }}>Create</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'spent' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ width: '80px', height: '50px', borderRadius: radius.md,
                background: choice === 'scroll' ? themeColor(TH.primaryHSL, 0.06, 3) : themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${choice === 'scroll' ? themeColor(TH.primaryHSL, 0.1, 6) : themeColor(TH.primaryHSL, 0.04, 3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: choice === 'create' ? 0.3 : 1 }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.2, 8) }}>{choice === 'create' ? 'SEALED' : 'Scroll'}</span>
              </div>
              <div style={{ width: '80px', height: '50px', borderRadius: radius.md,
                background: choice === 'create' ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${choice === 'create' ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.04, 3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: choice === 'scroll' ? 0.3 : 1 }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>{choice === 'scroll' ? 'SEALED' : 'Create'}</span>
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'create' ? 'You chose the masterpiece. The noise is sealed shut.' : 'Slot B sealed forever. The masterpiece was never made.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Opportunity cost. Every "Yes" to noise is a "No" to signal. Executive function is the ability to choose the harder, more valuable option: to spend the coin on creation, not consumption.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Invested.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}