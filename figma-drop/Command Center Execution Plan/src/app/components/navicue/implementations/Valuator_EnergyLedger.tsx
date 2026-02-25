/**
 * VALUATOR #6 — The Energy Ledger
 * "You are emotionally overdrawn. Bounce the check."
 * ARCHETYPE: Pattern A (Tap) — Accept (overdraft) or Decline (green boundary)
 * ENTRY: Ambient fade — battery at 40%
 * STEALTH KBE: Pressing "Decline" = honoring Somatic Limit (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'active' | 'decided' | 'resonant' | 'afterglow';

export default function Valuator_EnergyLedger({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'accept' | 'decline' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const decide = (d: 'accept' | 'decline') => {
    if (stage !== 'active') return;
    setChoice(d);
    console.log(`[KBE:E] EnergyLedger choice=${d} somaticLimit=${d === 'decline'}`);
    setStage('decided');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '50px', height: '24px', borderRadius: radius.xs,
              border: `2px solid ${themeColor(TH.accentHSL, 0.12, 6)}`, overflow: 'hidden' }}>
              <div style={{ width: '40%', height: '100%', background: themeColor(TH.accentHSL, 0.2, 8) }} />
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You cannot pay this bill. Do not go into debt.
            </div>
            {/* Battery at 40% */}
            <div style={{ width: '60px', height: '28px', borderRadius: radius.xs,
              border: `2px solid ${themeColor(TH.primaryHSL, 0.12, 6)}`, overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: '40%', height: '100%', background: themeColor(TH.accentHSL, 0.2, 8) }} />
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '11px', fontWeight: '600', color: palette.text }}>40%</span>
            </div>
            {/* Request */}
            <div style={{ padding: '8px 14px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <span style={{ ...navicueType.texture, color: palette.textFaint }}>Request: Cost 50%</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide('accept')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: 'hsla(0, 25%, 35%, 0.08)', border: '1px solid hsla(0, 25%, 35%, 0.15)' }}>
                <div style={{ ...navicueType.choice, color: 'hsla(0, 30%, 40%, 0.5)', fontSize: '11px' }}>Accept</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide('decline')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15), fontSize: '11px' }}>Decline</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'decided' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'decline'
                ? 'Check bounced. Energy preserved. You honored the limit.'
                : 'Overdrawn. The battery hits -10%. The recovery will cost double.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Somatic limit. Emotional overdraft is real: saying yes when you are at 40% puts you in deficit. Declining is not selfish; it is self-preservation. Honor the ledger.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Balanced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}