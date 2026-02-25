/**
 * BIOGRAPHER #4 — The "Yet" Append (Growth Mindset / Dweck)
 * "The sentence is not finished. Never end on a defeat."
 * ARCHETYPE: Pattern D (Type) — Type a defeat statement, "...yet" auto-appends
 * ENTRY: Reverse reveal — the cursor blinks first, then prompt appears
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'active' | 'appending' | 'resonant' | 'afterglow';

export default function Biographer_YetAppend({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [text, setText] = useState('');
  const [showYet, setShowYet] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const submit = () => {
    if (text.trim().length < 5) return;
    setStage('appending');
    t(() => setShowYet(true), 1200);
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>|</div>
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: '2px', height: '14px', background: themeColor(TH.accentHSL, 0.15, 8) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The sentence is not finished. Never end on a defeat. Leave the door open for time.
            </div>
            <div style={{ padding: '14px 16px', borderRadius: radius.sm, width: '250px',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              <input value={text} onChange={(e) => setText(e.target.value)}
                placeholder="I can't..."
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: palette.text, fontSize: '14px', fontFamily: 'serif' }} />
            </div>
            {text.trim().length >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={submit}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer' }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>finish the sentence</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'appending' && (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '280px' }}>
            <div style={{ padding: '16px', borderRadius: radius.sm, width: '100%', textAlign: 'center',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              <span style={{ fontSize: '15px', fontFamily: 'serif', color: palette.text }}>
                {text.replace(/[.!]$/, '')}
              </span>
              {showYet && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
                  style={{ fontSize: '15px', fontFamily: 'serif', fontWeight: 600,
                    color: themeColor(TH.accentHSL, 0.5, 18) }}>
                  ...yet.
                </motion.span>
              )}
            </div>
            {showYet && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
                style={{ ...navicueType.hint, color: palette.textFaint }}>the period became a comma</motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Growth Mindset. The linguistic addition of "yet" bridges the gap between current inability and future potential {'\u2014'} keeping the dopamine seeking circuit active. The door stays open.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>...yet.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}