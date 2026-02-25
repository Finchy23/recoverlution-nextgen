/**
 * CONSTRUCT #1 — The Foundation Stone (Cognitive Anchoring)
 * "Every castle needs a cornerstone. What is the one truth you will build this life on?"
 * ARCHETYPE: Pattern D (Type) — Chisel a single word into stone
 * ENTRY: Instruction-as-poetry — the chisel instruction appears first
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'setting' | 'resonant' | 'afterglow';

export default function Construct_FoundationStone({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [word, setWord] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const type = useTypeInteraction({
    minLength: 2,
    onAccept: (text: string) => {
      setWord(text.trim().toUpperCase());
      setStage('setting');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center', letterSpacing: '0.12em' }}>
            chisel one truth into stone
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Every castle needs a cornerstone. What is the one truth you will build this life on?
            </div>
            <motion.div
              style={{ width: '140px', height: '140px', borderRadius: radius.sm, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.15, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <input
                value={type.value}
                onChange={(e) => type.onChange(e.target.value)}
                placeholder="ONE WORD"
                maxLength={16}
                style={{ width: '110px', textAlign: 'center', background: 'transparent', border: 'none', outline: 'none',
                  color: themeColor(TH.accentHSL, 0.5, 15), fontSize: '16px', fontFamily: 'monospace',
                  letterSpacing: '0.08em', textTransform: 'uppercase' }} />
              <div style={{ position: 'absolute', bottom: '6px', left: 0, right: 0, height: '1px',
                background: themeColor(TH.accentHSL, 0.06, 4) }} />
            </motion.div>
            {type.value.length >= 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={type.submit}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer' }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>set it in stone</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'setting' && (
          <motion.div key="set" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div
              animate={{ y: [0, 4, 0] }} transition={{ duration: 0.3, delay: 0.8 }}
              style={{ width: '140px', height: '140px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.2, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 10)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ fontSize: '18px', fontFamily: 'monospace', letterSpacing: '0.1em',
                  color: themeColor(TH.accentHSL, 0.45, 12) }}>
                {word}
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>it will not move</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive Anchoring. Defining a superordinate goal {'\u2014'} a core value {'\u2014'} creates a stable psychological hierarchy. Every future decision passes through this stone. It does not move.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Set in stone.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}