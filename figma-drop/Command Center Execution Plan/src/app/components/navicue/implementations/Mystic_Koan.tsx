/**
 * MYSTIC #3 — The Koan (The Sound)
 * "Logic cannot hear it. Let the mind break."
 * Pattern A (Tap → Wait) — Tap to clap = silence; stop tapping & wait = breakthrough
 * STEALTH KBE: Stopping tap attempts and waiting = Logical Bypass / Experiential knowing (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Non-Dual Awareness', 'knowing', 'Practice');
type Stage = 'arriving' | 'trying' | 'broken' | 'resonant' | 'afterglow';

export default function Mystic_Koan({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const [idle, setIdle] = useState(0);
  const lastTapRef = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('trying'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'trying') return;
    const iv = window.setInterval(() => {
      if (lastTapRef.current > 0 && Date.now() - lastTapRef.current > 3000) {
        setIdle(prev => {
          const next = prev + 500;
          if (next >= 4000) {
            console.log(`[KBE:K] Koan logicalBypass=confirmed experientialKnowing=true taps=${taps}`);
            setStage('broken');
            t(() => setStage('resonant'), 5500);
            t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
          }
          return next;
        });
      }
    }, 500);
    return () => clearInterval(iv);
  }, [stage, taps]);

  const clap = () => {
    if (stage !== 'trying') return;
    lastTapRef.current = Date.now();
    setIdle(0);
    setTaps(c => c + 1);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.06, 3) }}>?</span>
          </motion.div>
        )}
        {stage === 'trying' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontStyle: 'italic' }}>
              "What is the sound of one hand clapping?"
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={clap}
              style={{ padding: '14px 28px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>Clap</div>
            </motion.div>
            {taps > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}>
                {taps <= 2 ? 'Silence.' : taps <= 4 ? 'Still silence.' : 'Nothing. Maybe stop trying.'}
              </motion.div>
            )}
            {idle > 1500 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6), fontStyle: 'italic' }}>
                The silence is listening...
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'broken' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Broken through. You stopped trying to solve the riddle. Logic cannot hear the sound of one hand clapping because the question is not a puzzle — it is a doorway. The answer is experiential, not intellectual. The mind breaks, and in the crack, something larger enters. You tapped {taps} times, then stopped. The stopping was the answer.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Zen Koan. Hakuin Ekaku (1686–1769) created "What is the sound of one hand clapping?" as a meditation device designed to exhaust the rational mind. Koans are not riddles with clever answers — they are tools to induce a state of "great doubt" (taigi) that shatters conceptual thinking. Neuroscience of insight (Kounios & Beeman): the "aha moment" involves a burst of gamma activity in the right temporal lobe, preceded by alpha suppression — the brain literally stops trying before the answer arrives.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Heard.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}