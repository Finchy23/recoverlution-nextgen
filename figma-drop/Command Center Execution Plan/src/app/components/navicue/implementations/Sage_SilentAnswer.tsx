/**
 * SAGE #5 — The Silent Answer
 * "The answer is not in the words. It is in the silence."
 * Pattern D (Type) → then wait — type a question, receive silence
 * STEALTH KBE: Waiting without retrying = Tolerance of Ambiguity / Comfort with Unknown (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'embodying', 'Practice');
type Stage = 'arriving' | 'asking' | 'listening' | 'silent' | 'resonant' | 'afterglow';

export default function Sage_SilentAnswer({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [question, setQuestion] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setQuestion(val),
    onAccept: () => {
      if (!question.trim()) return;
      setStage('listening');
      // After 6 seconds of silence, the answer arrives
      t(() => {
        console.log(`[KBE:E] SilentAnswer question="${question.trim()}" toleranceOfAmbiguity=confirmed comfortWithUnknown=true`);
        setStage('silent');
        t(() => setStage('resonant'), 5500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
      }, 6000);
    },
  });

  useEffect(() => { t(() => setStage('asking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'asking' && (
          <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Ask your deepest question. The one you{"'"}ve been carrying.
            </div>
            <input type="text" value={question} onChange={(e) => typeInt.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
              placeholder="What do you need to know?"
              autoFocus
              style={{ width: '180px', padding: '8px 12px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                opacity: question.trim() ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Ask</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'listening' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}>
              Listening...
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                  style={{ width: '4px', height: '4px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.08, 4) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'silent' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Silence. You asked: "{question}." No text appeared. Because the answer is not in the words — it is in the silence. The space between thoughts is where wisdom lives. You were waiting for an oracle. The oracle was the waiting itself. Listen to the silence. What did it say?
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Tolerance of ambiguity. Frenkel-Brunswik{"'"}s research: the ability to tolerate uncertainty, incomplete information, and paradox is a marker of psychological maturity. Budner{"'"}s Scale: high tolerance of ambiguity correlates with creativity, flexibility, and lower anxiety. The modern epidemic of "need for closure" (Kruglanski) drives premature judgment. Sometimes the most powerful thing you can do is sit with the question and let the silence answer.
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