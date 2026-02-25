/**
 * BIOGRAPHER #9 — The Supporting Cast (Relational Savoring)
 * "The hero never wins alone. Acknowledge the sidekicks."
 * ARCHETYPE: Pattern A (Tap) — Tap to spotlight a person who helped you
 * ENTRY: Ambient fade — spotlight on empty stage materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'ambient' | 'active' | 'spotlit' | 'resonant' | 'afterglow';

export default function Biographer_SupportingCast({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [name, setName] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 3000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const spotlight = () => {
    if (!name.trim()) return;
    setStage('spotlit');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', position: 'relative' }}>
              <motion.div animate={{ opacity: [0.02, 0.05, 0.02] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ width: '100%', height: '100%', borderRadius: '50%',
                  background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.06, 8)} 0%, transparent 70%)` }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>an empty stage</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The hero never wins alone. Who helped you today? Drag them into the light. Gratitude is just noticing the cast.
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Who helped you?"
              style={{ width: '200px', padding: '10px 14px', borderRadius: radius.md, textAlign: 'center',
                background: themeColor(TH.primaryHSL, 0.06, 3), border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                color: palette.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
            {name.trim() && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={spotlight}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer' }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>into the spotlight</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'spotlit' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div animate={{ opacity: [0.06, 0.1, 0.06] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                  background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.12, 12)} 0%, transparent 70%)` }} />
              <div style={{ fontSize: '14px', fontFamily: 'serif', fontWeight: 600,
                color: themeColor(TH.accentHSL, 0.45, 18), position: 'relative', textAlign: 'center' }}>
                {name}
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>in the light now</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Relational Savoring. Focusing on the benevolent actions of others increases perceived social support and oxytocin levels, buffering against stress. The hero never wins alone.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Never alone.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}