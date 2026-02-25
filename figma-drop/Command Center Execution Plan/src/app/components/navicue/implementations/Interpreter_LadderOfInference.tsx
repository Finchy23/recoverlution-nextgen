/**
 * INTERPRETER #3 — The Ladder of Inference (Fact-Stripping)
 * "Come down. The air is thin up there. Get back to the ground. What actually happened?"
 * ARCHETYPE: Pattern D (Type) — Type the raw fact without emotional words
 * ENTRY: Reverse reveal — starts high on the ladder, climbs down
 * STEALTH KBE: Fact-stripping quality = Cognitive De-fusion (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'high' | 'active' | 'grounded' | 'resonant' | 'afterglow';

const EMOTIONAL_WORDS = ['horrible', 'terrible', 'awful', 'evil', 'stupid', 'hate', 'never', 'always', 'worst', 'ruined'];

export default function Interpreter_LadderOfInference({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('high');
  const [rawFact, setRawFact] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const type = useTypeInteraction({
    minLength: 5,
    rejectPhrases: EMOTIONAL_WORDS,
    onAccept: (text: string) => {
      const hasEmotional = EMOTIONAL_WORDS.some(w => text.toLowerCase().includes(w));
      console.log(`[KBE:K] LadderOfInference factStripping=${!hasEmotional ? 'clean' : 'emotional'} text="${text.trim()}"`);
      setRawFact(text.trim());
      setStage('grounded');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onReject: () => {
      // Shake but let them try again
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const rungs = ['JUDGMENT', 'ASSUMPTION', 'INTERPRETATION', 'OBSERVATION', 'RAW FACT'];

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'high' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {rungs.slice(0, 3).map((rung, i) => (
              <motion.div key={rung} initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.8 - i * 0.15, x: 0 }}
                transition={{ delay: i * 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '4px', height: '20px', background: themeColor(TH.primaryHSL, 0.1, 6) }} />
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.2 + i * 0.05, 8),
                  fontSize: '11px', letterSpacing: '0.1em' }}>{rung}</div>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint, marginTop: '8px' }}>you are up here</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Come down. The air is thin up there. Get back to the ground. What actually happened? No adjectives.
            </div>
            {/* Ladder visual */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
              {rungs.map((rung, i) => (
                <div key={rung} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.3 + (i / rungs.length) * 0.5 }}>
                  <div style={{ width: '3px', height: '14px', background: themeColor(TH.primaryHSL, 0.06 + i * 0.02, 4) }} />
                  <div style={{ ...navicueType.hint, fontSize: '11px', letterSpacing: '0.08em',
                    color: i === rungs.length - 1
                      ? themeColor(TH.accentHSL, 0.35, 10)
                      : themeColor(TH.primaryHSL, 0.15, 6) }}>{rung}</div>
                </div>
              ))}
            </div>
            <motion.div
              animate={type.status === 'rejected' ? { x: [0, -5, 5, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
              key={type.shakeCount}
              style={{ width: '100%' }}>
              <input
                value={type.value}
                onChange={(e) => type.onChange(e.target.value)}
                placeholder="just the raw fact"
                style={{ width: '100%', padding: '10px 16px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${type.status === 'rejected'
                    ? themeColor(TH.accentHSL, 0.2, -5)
                    : themeColor(TH.primaryHSL, 0.08, 6)}`,
                  color: palette.text, fontSize: '14px', fontFamily: 'inherit',
                  outline: 'none', textAlign: 'center' }} />
            </motion.div>
            {type.status === 'rejected' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.4, -5) }}>
                that word has emotion in it. strip it.
              </motion.div>
            )}
            {type.value.length >= 5 && type.status !== 'rejected' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={type.submit}
                style={{ padding: '12px 20px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10) }}>ground it</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'grounded' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.45, 12), textAlign: 'center', maxWidth: '280px' }}>
              {rawFact}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>ground level. raw data.</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Ladder of Inference. We climb from observation to judgment in milliseconds. Cognitive de-fusion means deliberately descending, separating the raw fact from the story we built on top of it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Grounded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}