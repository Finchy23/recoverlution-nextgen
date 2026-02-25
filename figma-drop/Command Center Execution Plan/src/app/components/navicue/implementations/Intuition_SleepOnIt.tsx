/**
 * INTUITION #4 — The "Sleep On It" (Incubation)
 * "The subconscious works the night shift. Hand over the file."
 * Pattern A (Tap) — Deposit problem in vault
 * STEALTH KBE: Cognitive offloading = Trust in Default Mode Network (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'believing', 'Practice');
type Stage = 'arriving' | 'open' | 'locked' | 'resonant' | 'afterglow';

export default function Intuition_SleepOnIt({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('open'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const deposit = () => {
    if (stage !== 'open') return;
    console.log(`[KBE:B] SleepOnIt cognitiveOffloading=confirmed defaultModeNetworkTrust=true`);
    setStage('locked');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '20px', borderRadius: '3px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'open' && (
          <motion.div key="op" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A vault door, open. Put the problem inside. Time lock: 8 hours. The subconscious works the night shift.
            </div>
            <div style={{ width: '60px', height: '50px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div animate={{ opacity: [0.15, 0.08, 0.15] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '30px', height: '20px', borderRadius: '2px',
                  background: themeColor(TH.accentHSL, 0.06, 3) }} />
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={deposit}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Deposit and Lock</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="lo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Locked. Time seal: 8 hours. The conscious mind is tired — it has been chewing this problem all day. The subconscious will work the night shift. Hand over the file. The answer will be on the desk in the morning. Trust the default mode network. It processes while you sleep.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Incubation effect. Ap Dijksterhuis{"'"} Unconscious Thought Theory: complex decisions with many variables are better when "slept on" because the unconscious mind can weigh more factors simultaneously. The Default Mode Network — active during rest, daydreaming, and sleep — integrates disparate information. Einstein, Kekulé, Mendeleev: breakthroughs came during rest, not effort. "Sleep on it" is not procrastination. It{"'"}s computation.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Deposited.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}