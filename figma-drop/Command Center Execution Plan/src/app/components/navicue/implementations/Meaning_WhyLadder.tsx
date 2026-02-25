/**
 * MEANING MAKER #5 — The "Why" Ladder (5 Whys)
 * "The surface desire is weak. The deep desire is nuclear fuel."
 * ARCHETYPE: Pattern A (Tap) — Drill down through "Why?" layers
 * ENTRY: Instruction-as-poetry — "I want money"
 * STEALTH KBE: Reaching relational/existential reason = Deep Motivation (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'climbing' | 'bedrock' | 'resonant' | 'afterglow';

const SEED = 'I want money.';

export default function Meaning_WhyLadder({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rungs, setRungs] = useState<string[]>([SEED]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'because...',
    onAccept: (value: string) => {
      if (value.trim().length < 2) return;
      const next = [...rungs, value.trim()];
      setRungs(next);
      if (next.length >= 5) {
        console.log(`[KBE:K] WhyLadder depth=${next.length} deepMotivation=confirmed rungs=${JSON.stringify(next)}`);
        setStage('bedrock');
        t(() => setStage('resonant'), 5000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
      }
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('climbing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: themeColor(TH.primaryHSL, 0.1, 5), fontStyle: 'italic' }}>
            I want money.
          </motion.div>
        )}
        {stage === 'climbing' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              {rungs.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '16px', height: '2px', borderRadius: '1px',
                    background: themeColor(TH.accentHSL, 0.06 + i * 0.04, 3 + i * 2) }} />
                  <span style={{ fontSize: i === rungs.length - 1 ? '12px' : '10px',
                    color: i === rungs.length - 1 ? themeColor(TH.accentHSL, 0.3 + i * 0.05, 8 + i * 2) : palette.textFaint }}>
                    {r}
                  </span>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Why? (rung {rungs.length}/4)
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={{ padding: '10px 20px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Why?</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'bedrock' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '280px' }}>
            {rungs.map((r, i) => (
              <div key={i} style={{ fontSize: i === rungs.length - 1 ? '12px' : '9px',
                color: i === rungs.length - 1
                  ? themeColor(TH.accentHSL, 0.45, 14)
                  : themeColor(TH.primaryHSL, 0.08 + i * 0.02, 4 + i),
                textAlign: 'center', opacity: i === rungs.length - 1 ? 1 : 0.5 }}>
                {r}
              </div>
            ))}
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginTop: '6px' }}>
              The bottom rung glows gold. The surface desire was paper; the deep desire is nuclear fuel. This is what actually drives you.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Motivation depth. The "Why Ladder" is a variation of motivational interviewing — drilling past surface desires to find the existential core. "I want money" is weak fuel. "I want my mother to feel safe" is nuclear. Research shows that relational and existential motivations are more durable than material ones, producing sustained effort and higher wellbeing. Dig down. The surface is never the whole story.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Deep.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}