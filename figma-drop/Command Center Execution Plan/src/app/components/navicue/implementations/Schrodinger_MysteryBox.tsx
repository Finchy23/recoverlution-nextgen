/**
 * SCHRODINGER #1 — The Mystery Box (The Collapse)
 * "This box contains a Challenge OR a Comfort. It is both until you open it."
 * ARCHETYPE: Pattern A (Tap) — One tap collapses superposition
 * ENTRY: Ambient Fade — a vibrating box materializes from quantum noise
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'ambient' | 'active' | 'collapsed' | 'resonant' | 'afterglow';

const OUTCOMES = [
  { label: 'CHALLENGE', text: 'Tell someone the truth you\u2019ve been rehearsing.' },
  { label: 'COMFORT', text: 'You are allowed to rest without earning it.' },
  { label: 'CHALLENGE', text: 'Do the thing you\u2019ve been postponing for three days.' },
  { label: 'COMFORT', text: 'Close your eyes. Breathe. Nothing is required.' },
];

export default function Schrodinger_MysteryBox({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [outcome, setOutcome] = useState<typeof OUTCOMES[0] | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const openBox = () => {
    if (outcome) return;
    const pick = OUTCOMES[Math.floor(Math.random() * OUTCOMES.length)];
    setOutcome(pick);
    setStage('collapsed');
    t(() => setStage('resonant'), 4000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 9000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div animate={{ opacity: [0.02, 0.06, 0.02] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '60px', height: '60px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.05, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.04, 8)}` }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>something waits</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              This box contains a Challenge or a Comfort. It is both until you open it. The particle is in superposition.
            </div>
            <motion.div onClick={openBox}
              animate={{ scale: [1, 1.015, 1], rotate: [0, 0.5, -0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: '90px', height: '90px', borderRadius: radius.sm, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.12, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 10)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '22px', opacity: 0.12 }}>?</div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to observe</div>
          </motion.div>
        )}
        {stage === 'collapsed' && outcome && (
          <motion.div key="col" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div initial={{ letterSpacing: '0.5em' }} animate={{ letterSpacing: '0.15em' }}
              transition={{ duration: 1.2 }}
              style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.35, 15) }}>
              {outcome.label}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              {outcome.text}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Uncertainty is not anxiety: it is infinite potential. Before you opened it, every outcome existed simultaneously. You collapsed the wave. The result was always yours.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Both. Until you looked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}