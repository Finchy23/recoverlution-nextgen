/**
 * SCHRODINGER #4 — The Many-Worlds Map
 * "There are three versions of you waking up tomorrow. Select the timeline."
 * ARCHETYPE: Pattern A (Tap) — Tap a path, destination reveals
 * ENTRY: Instruction-as-poetry — the map draws itself as you read
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'arriving' | 'active' | 'revealed' | 'resonant' | 'afterglow';

const PATHS = [
  { label: 'SAFE', icon: '\u2302', dest: 'You wake up unchanged. Nothing risked. Nothing lost. Nothing gained. The same Tuesday.' },
  { label: 'RISKY', icon: '\u2194', dest: 'You wake up sore from the conversation you finally had. Something is different. You can\u2019t go back.' },
  { label: 'WILD', icon: '\u2605', dest: 'You wake up somewhere you don\u2019t plan. The story took over. You are someone you don\u2019t fully recognize yet.' },
];

export default function Schrodinger_ManyWorldsMap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const pick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    setStage('revealed');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.5 }}>three timelines diverge</motion.span>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Three versions of you wake up tomorrow. Which timeline do you choose?
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {PATHS.map((p, i) => (
                <motion.div key={i} onClick={() => pick(i)}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * i }}
                  style={{ width: '80px', height: '90px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.1, 4),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.06, 8)}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '18px', opacity: 0.15 }}>{p.icon}</div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                    color: themeColor(TH.accentHSL, 0.25, 12) }}>{p.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'revealed' && chosen !== null && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.15em',
              color: themeColor(TH.accentHSL, 0.3, 15) }}>TIMELINE {PATHS[chosen].label}</div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {PATHS[chosen].dest}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Prospective simulation. When you vividly imagine a specific future, your valuation network activates: abstract goals become concrete. The timeline you chose reveals the life you already want.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Timeline selected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}