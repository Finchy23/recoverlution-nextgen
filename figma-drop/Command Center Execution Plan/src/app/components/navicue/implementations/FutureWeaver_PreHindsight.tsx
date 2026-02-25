/**
 * FUTURE WEAVER #4 — The Pre-Hindsight
 * "Reverse engineer the victory."
 * ARCHETYPE: Pattern A (Tap) — Work backward from trophy: Won → Trained → Started → Woke Up
 * ENTRY: Scene-first — trophy
 * STEALTH KBE: Successfully ordering steps in reverse = Backcasting (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'podium' | 'mapped' | 'resonant' | 'afterglow';

const STEPS = ['You won.', 'You competed.', 'You trained.', 'You started.', 'You woke up.'];

export default function FutureWeaver_PreHindsight({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState(1);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('podium'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tapBack = () => {
    if (stage !== 'podium') return;
    const next = revealed + 1;
    setRevealed(next);
    if (next >= STEPS.length) {
      console.log(`[KBE:K] PreHindsight backcasting=confirmed stepsRevealed=${next}`);
      setStage('mapped');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ fontSize: '16px', opacity: 0.15 }}>◇</motion.div>
        )}
        {stage === 'podium' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You won. Tap "How?" to work backward.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              {STEPS.slice(0, revealed).map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.1 + i * 0.04, 4 + i * 2) }}>←</span>
                  <span style={{ fontSize: i === 0 ? '12px' : '10px',
                    color: i === revealed - 1
                      ? themeColor(TH.accentHSL, 0.35, 12)
                      : themeColor(TH.primaryHSL, 0.1, 5),
                    fontWeight: i === revealed - 1 ? 500 : 400 }}>{step}</span>
                </motion.div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={tapBack}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>How?</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'mapped' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The bottom rung: "You woke up." That{"'"}s the first step. Every victory, reverse-engineered, leads back to one morning when you simply decided to begin. Stand on the podium. Look back. The steps are clear from the finish line.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Backcasting. Research shows that working backward from a desired outcome is more effective than forward planning for complex goals. Pre-mortem analysis (Gary Klein) and backcasting (John Robinson) both leverage the clarity of hindsight before it happens. From the podium, the path is obvious. Start from the win and trace backward. Then walk forward.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Mapped.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}