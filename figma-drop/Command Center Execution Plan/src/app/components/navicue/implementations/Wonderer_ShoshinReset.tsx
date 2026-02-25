/**
 * WONDERER #2 — The Shoshin Reset (Beginner's Mind)
 * "The expert is stuck. The beginner is free. Wipe the board."
 * ARCHETYPE: Pattern A (Tap) + D (Type) — Erase the clutter, then type a first step
 * ENTRY: Scene-first — cluttered diagram
 * STEALTH KBE: Novel first step = Cognitive Unlearning (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'cluttered' | 'erased' | 'typed' | 'resonant' | 'afterglow';

export default function Wonderer_ShoshinReset({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'if you knew nothing, what would you do?',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      console.log(`[KBE:K] ShoshinReset firstStep="${value.trim()}" cognitiveUnlearning=confirmed noveltySeeking=true`);
      setStage('typed');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('cluttered'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const erase = () => {
    if (stage !== 'cluttered') return;
    setStage('erased');
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '60px', position: 'relative' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute',
                left: `${5 + Math.random() * 65}px`, top: `${5 + Math.random() * 45}px`,
                width: `${15 + Math.random() * 20}px`, height: '2px',
                background: themeColor(TH.primaryHSL, 0.04 + Math.random() * 0.03, 3),
                transform: `rotate(${Math.random() * 40 - 20}deg)` }} />
            ))}
          </motion.div>
        )}
        {stage === 'cluttered' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>your life (as you know it)</div>
            <div style={{ width: '160px', height: '100px', borderRadius: radius.sm, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                  style={{ position: 'absolute',
                    left: `${8 + Math.random() * 130}px`, top: `${8 + Math.random() * 75}px`,
                    width: `${20 + Math.random() * 30}px`, height: '2px',
                    background: themeColor(TH.primaryHSL, 0.06, 4),
                    transform: `rotate(${Math.random() * 60 - 30}deg)` }} />
              ))}
              {['Plans', 'Rules', 'Fears', 'Habits'].map((w, i) => (
                <div key={w} style={{ position: 'absolute', fontSize: '11px',
                  left: `${15 + i * 30}px`, top: `${20 + (i % 2) * 35}px`,
                  color: themeColor(TH.primaryHSL, 0.12, 6), fontStyle: 'italic' }}>{w}</div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={erase}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Erase</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'erased' && (
          <motion.div key="er" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ width: '160px', height: '100px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.01, 0),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}` }} />
            <div style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}>
              I know nothing. Blank slate. Shoshin.
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              If you knew nothing about your life, what would you do today?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Begin</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'typed' && (
          <motion.div key="ty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Beginner{"'"}s mind. The expert is stuck. The beginner sees fresh paths everywhere. You just unlearned the story you were telling yourself.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Shoshin — beginner{"'"}s mind. Zen Buddhism{"'"}s most practical concept. The expert{"'"}s mind has few possibilities; the beginner{"'"}s mind has many. Cognitive unlearning, deliberately forgetting what you "know," reactivates the brain{"'"}s novelty-seeking circuits and enables creative problem solving. Wipe the board. Start from "I know nothing."
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Beginner.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}