/**
 * ENGINEER #3 — The Commitment Device
 * "You are not trustworthy. You are human. Raise the stakes."
 * Pattern A (Tap) — Lock the commitment
 * STEALTH KBE: Setting penalty = Loss Aversion / Commitment (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('poetic_precision', 'Behavioral Design', 'embodying', 'Circuit');
type Stage = 'arriving' | 'staking' | 'locked' | 'resonant' | 'afterglow';

export default function Engineer_CommitmentDevice({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('staking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const lock = () => {
    if (stage !== 'staking') return;
    console.log(`[KBE:E] CommitmentDevice lossAversion=confirmed commitment=locked`);
    setStage('locked');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '20px', borderRadius: '3px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'staking' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A lockbox. Put $50 in. "If I don{"'"}t run, this money goes to a cause I hate." Lock it.
            </div>
            <div style={{ width: '50px', height: '40px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: themeColor(TH.accentHSL, 0.2, 6) }}>$50</span>
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={lock}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Lock</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="lo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Locked. The stakes are real. You are not trustworthy — you are human. Loss aversion is 2x stronger than gain motivation (Kahneman). You just weaponized your own psychology: the pain of losing $50 to a hated cause is worse than the pain of running. Now the run is the easy option. That{"'"}s engineering.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Commitment devices. Odysseus tied himself to the mast — the original commitment device. Modern research (stickK.com): people who put money at stake are 3x more likely to achieve their goals. Loss aversion (Kahneman & Tversky): losses are psychologically about twice as powerful as gains. The commitment device doesn{"'"}t change motivation — it changes the cost of failure. Build the system. Don{"'"}t trust the self.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Locked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}