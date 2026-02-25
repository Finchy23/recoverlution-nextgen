/**
 * INTUITION #7 — The Resonance Test
 * "Does this opportunity amplify your frequency or dampen it?"
 * Pattern A (Tap) — Harmonize or Reject
 * STEALTH KBE: Rejecting a clashing opportunity = Authenticity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'believing', 'Practice');
type Stage = 'arriving' | 'testing' | 'decided' | 'resonant' | 'afterglow';

export default function Intuition_ResonanceTest({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'harmonize' | 'reject' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('testing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const decide = (c: 'harmonize' | 'reject') => {
    if (stage !== 'testing') return;
    setChoice(c);
    console.log(`[KBE:B] ResonanceTest choice=${c} authenticity=${c === 'reject'} alignment=confirmed`);
    setStage('decided');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <svg width="40" height="20" viewBox="0 0 40 20">
              <line x1="5" y1="10" x2="15" y2="10" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="2" />
              <line x1="25" y1="10" x2="35" y2="10" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="2" />
            </svg>
          </motion.div>
        )}
        {stage === 'testing' && (
          <motion.div key="te" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two tuning forks. One is "You." One is "The Opportunity." Strike them. Do they sing together or clash?
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'end' }}>
              <motion.div animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 0.1, repeat: Infinity }}
                style={{ width: '6px', height: '36px', borderRadius: '2px',
                  background: themeColor(TH.accentHSL, 0.08, 4) }} />
              <motion.div animate={{ rotate: [2, -2, 2] }} transition={{ duration: 0.15, repeat: Infinity }}
                style={{ width: '6px', height: '36px', borderRadius: '2px',
                  background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => decide('harmonize')}
                style={{ padding: '8px 16px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Harmonize</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => decide('reject')}
                style={{ padding: '8px 16px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Reject</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'decided' && (
          <motion.div key="de" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'harmonize'
              ? 'Harmonized. The frequencies aligned. This opportunity amplifies who you are. It doesn\'t require you to twist yourself to fit. When alignment is real, the energy increases, not decreases.'
              : 'Rejected. The frequencies clashed. This opportunity would dampen your signal. If you have to twist yourself to fit, it is out of tune. Authenticity is saying no to things that look right but feel wrong. That took courage.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Authenticity and resonance. Self-Determination Theory (Deci & Ryan): intrinsic motivation peaks when activities align with autonomous values. "Resonance" is the felt sense of this alignment. Burnout research shows it{"'"}s not overwork that destroys people — it{"'"}s misalignment. The tuning fork metaphor is precise: when two frequencies match, they amplify. When they clash, they cancel. Choose amplification.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Tuned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
