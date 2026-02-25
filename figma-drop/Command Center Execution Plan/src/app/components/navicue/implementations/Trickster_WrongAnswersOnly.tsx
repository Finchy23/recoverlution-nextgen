/**
 * TRICKSTER #2 — The "Wrong Answers Only"
 * "Logic is stuck. Nonsense unlocks the side door."
 * ARCHETYPE: Pattern D (Type) — Must type nonsense; logic rejected
 * ENTRY: Instruction-as-poetry — the keyboard blocks logic
 * STEALTH KBE: High semantic divergence = Creative Agility (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'knowing', 'Storm');
type Stage = 'arriving' | 'active' | 'rejected' | 'accepted' | 'resonant' | 'afterglow';

const BORING = ['plan', 'budget', 'schedule', 'organize', 'list', 'prioritize', 'spreadsheet', 'strategy'];

export default function Trickster_WrongAnswersOnly({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [answer, setAnswer] = useState('');
  const [rejects, setRejects] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'wrong answers only...',
    onAccept: (value: string) => {
      const v = value.trim().toLowerCase();
      if (v.length < 3) return;
      const isBoring = BORING.some(b => v.includes(b)) || v.split(' ').length <= 2 && /^[a-z]+$/.test(v.replace(/\s/g, ''));
      if (isBoring && rejects < 2) {
        setRejects(r => r + 1);
        setStage('rejected');
        t(() => setStage('active'), 1500);
        return;
      }
      setAnswer(value.trim());
      console.log(`[KBE:K] WrongAnswersOnly answer="${value.trim()}" rejects=${rejects} creativeDivergence=confirmed`);
      setStage('accepted');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('active'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="knowing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.12, 4), letterSpacing: '0.1em' }}>
            ?????
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              How will you solve your biggest problem?
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), textAlign: 'center', fontStyle: 'italic' }}>
              wrong answers only. be ridiculous.
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9, rotate: -3 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Submit nonsense</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'rejected' && (
          <motion.div key="rej" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ x: [-4, 4, -4, 0] }} transition={{ duration: 0.3 }}
              style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.4, 12), textAlign: 'center' }}>
              Too logical. Be stupider.
            </motion.div>
          </motion.div>
        )}
        {stage === 'accepted' && (
          <motion.div key="acc" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 0.5 }}
              style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 10), textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              "{answer}"
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Perfect. The smartest idea is always hiding behind the stupidest one.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Lateral thinking. Logic is a highway: fast, direct, predictable. Nonsense is a side road. It takes you somewhere you didn{"'"}t plan. The brain{"'"}s default mode network activates during play, and that{"'"}s where breakthrough ideas live. Be stupid on purpose. The side door is always open.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Unlocked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}