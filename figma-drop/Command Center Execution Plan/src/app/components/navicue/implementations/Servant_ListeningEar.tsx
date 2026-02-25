/**
 * SERVANT #5 — The Listening Ear
 * "They don't need your solution. They need your witness."
 * ARCHETYPE: Pattern A (Tap) — Choose "Fix It" (fails) or "Listen" (succeeds)
 * ENTRY: Scene-first — avatar talking (waveform)
 * STEALTH KBE: Choosing Listen = Active Listening knowledge (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'talking' | 'result' | 'resonant' | 'afterglow';

export default function Servant_ListeningEar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'fix' | 'listen' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('talking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const decide = (c: 'fix' | 'listen') => {
    if (stage !== 'talking') return;
    setChoice(c);
    console.log(`[KBE:K] ListeningEar choice=${c} activeListening=${c === 'listen'} supportLogic=confirmed`);
    setStage('result');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div key={i} animate={{ height: [4, 8, 4] }}
                transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                style={{ width: '2px', borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            ))}
          </motion.div>
        )}
        {stage === 'talking' && (
          <motion.div key="talk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Avatar talking — waveform */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={i} animate={{ height: [3, 6 + Math.random() * 6, 3] }}
                    transition={{ duration: 0.4 + Math.random() * 0.2, repeat: Infinity }}
                    style={{ width: '2px', borderRadius: '1px',
                      background: themeColor(TH.accentHSL, 0.08 + i * 0.01, 4) }} />
                ))}
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Someone is pouring their heart out. What do you do?
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide('fix')}
                style={{ padding: '10px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Fix It</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide('listen')}
                style={{ padding: '10px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.5, 14) }}>Listen</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'result' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'listen'
              ? 'They feel heard. The waveform calms. They didn\'t need your solution — they needed your witness. Hold the bucket while they pour it out.'
              : 'They shut down. Fixing interrupted the flow. They didn\'t want a solution. They wanted to be seen. Next time, just hold the bucket.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Active listening vs. fixing. Research by Reis & Shaver shows that perceived partner responsiveness — feeling heard, not fixed — is the strongest predictor of relationship satisfaction. The "Fix It" reflex comes from anxiety, not compassion. True support is co-regulation: your calm nervous system regulating theirs. Don{"'"}t fix it. Just hold the bucket while they pour.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Witnessed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}