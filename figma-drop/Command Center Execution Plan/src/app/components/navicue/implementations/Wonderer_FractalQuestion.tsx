/**
 * WONDERER #3 — The Fractal Question
 * "The first answer is a disguise. The truth is five layers down."
 * ARCHETYPE: Pattern A (Tap) + D (Type) — Recursive "Why?" branching
 * ENTRY: Instruction-as-poetry — "I am stuck"
 * STEALTH KBE: 3+ levels = Deep Inquiry (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Probe');
type Stage = 'arriving' | 'digging' | 'bedrock' | 'resonant' | 'afterglow';

const SEED = 'I am stuck.';

export default function Wonderer_FractalQuestion({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [layers, setLayers] = useState<string[]>([SEED]);
  const [currentInput, setCurrentInput] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'because...',
    onAccept: (value: string) => {
      if (value.trim().length < 2) return;
      const next = [...layers, value.trim()];
      setLayers(next);
      setCurrentInput('');
      if (next.length >= 6) {
        console.log(`[KBE:K] FractalQuestion depth=${next.length - 1} deepInquiry=confirmed layers=${JSON.stringify(next)}`);
        setStage('bedrock');
        t(() => setStage('resonant'), 5000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
      }
    },
    onChange: (v: string) => setCurrentInput(v),
  });

  useEffect(() => { t(() => setStage('digging'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const depth = layers.length - 1;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: themeColor(TH.primaryHSL, 0.1, 5), fontStyle: 'italic' }}>
            I am stuck.
          </motion.div>
        )}
        {stage === 'digging' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            {/* Layer stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {layers.map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ paddingLeft: `${i * 12}px`, display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                  {i > 0 && <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>↳</span>}
                  <span style={{ fontSize: '11px',
                    color: i === 0 ? palette.textFaint : themeColor(TH.accentHSL, 0.2 + i * 0.06, 6 + i * 2),
                    fontStyle: i === 0 ? 'italic' : 'normal' }}>
                    {i === 0 ? l : `"${l}"`}
                  </span>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Why? (layer {depth + 1}/5)
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={{ padding: '14px 20px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Why?</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'bedrock' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12), fontStyle: 'italic', textAlign: 'center' }}>
              Bedrock. Five layers down. The first answer was a disguise. This is closer to the truth.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {layers.map((l, i) => (
                <div key={i} style={{ paddingLeft: `${i * 8}px`, fontSize: '11px',
                  color: themeColor(TH.accentHSL, 0.1 + i * 0.05, 4 + i * 2),
                  opacity: i === layers.length - 1 ? 1 : 0.5 }}>
                  {i > 0 ? `↳ "${l}"` : l}
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The 5 Whys: Sakichi Toyoda{"'"}s technique from Toyota. The first answer is a surface symptom. Each "why?" peels a layer. By the fifth, you{"'"}ve reached the root cause. Most people stop at layer one or two. Deep inquiry, going 3+ layers, correlates with insight quality and genuine self-understanding.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Bedrock.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}