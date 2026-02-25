/**
 * GRANDMASTER #4 — The Positive Sum (The Pie)
 * "Do not fight for the slice. Bake a bigger pie."
 * ARCHETYPE: Pattern A (Tap) — Choose "Cut bigger slice" or "Expand the pie"
 * ENTRY: Scene-first — pie chart
 * STEALTH KBE: Choosing expansion = Abundance Mindset (E)
 * WEB ADAPTATION: Tap-to-choose replaces gesture distinction (cut vs pinch-out)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'active' | 'result' | 'resonant' | 'afterglow';

export default function Grandmaster_PositiveSum({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'cut' | 'expand' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const choose = (c: 'cut' | 'expand') => {
    if (stage !== 'active') return;
    setChoice(c);
    console.log(`[KBE:E] PositiveSum choice=${c} abundanceMindset=${c === 'expand'}`);
    setStage('result');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const pieR = 35;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r={pieR} fill="none" stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="2" />
              <path d={`M40,40 L40,${40 - pieR} A${pieR},${pieR} 0 0,1 ${40 + pieR * Math.sin(Math.PI / 3)},${40 - pieR * Math.cos(Math.PI / 3)} Z`}
                fill={themeColor(TH.accentHSL, 0.08, 4)} />
            </svg>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your slice is small. What do you do?
            </div>
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r={pieR} fill="none" stroke={themeColor(TH.primaryHSL, 0.1, 6)} strokeWidth="2" />
              <path d={`M45,45 L45,${45 - pieR} A${pieR},${pieR} 0 0,1 ${45 + pieR * Math.sin(Math.PI / 3)},${45 - pieR * Math.cos(Math.PI / 3)} Z`}
                fill={themeColor(TH.accentHSL, 0.1, 5)} stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="1" />
            </svg>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => choose('cut')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: 'hsla(0, 18%, 28%, 0.06)', border: '1px solid hsla(0, 18%, 35%, 0.12)' }}>
                <div style={{ ...navicueType.choice, color: 'hsla(0, 25%, 40%, 0.5)', fontSize: '11px' }}>Cut bigger slice</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => choose('expand')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Expand the pie</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'result' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {choice === 'expand' ? (
              <motion.div initial={{ scale: 1 }} animate={{ scale: 1.4 }} transition={{ duration: 1.2 }}>
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r={pieR} fill="none" stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="2" />
                  <path d={`M45,45 L45,${45 - pieR} A${pieR},${pieR} 0 0,1 ${45 + pieR * Math.sin(Math.PI / 3)},${45 - pieR * Math.cos(Math.PI / 3)} Z`}
                    fill={themeColor(TH.accentHSL, 0.12, 6)} />
                </svg>
              </motion.div>
            ) : (
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={pieR} fill="none" stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="2" />
                <path d={`M45,45 L45,${45 - pieR} A${pieR},${pieR} 0 1,1 ${45 - pieR * Math.sin(Math.PI / 6)},${45 - pieR * Math.cos(Math.PI / 6)} Z`}
                  fill="hsla(0, 18%, 30%, 0.08)" />
              </svg>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'expand'
                ? 'Everyone gets more. The pie expanded. Positive sum.'
                : 'Your slice grew, but theirs shrank. Zero sum. They resent you now.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Abundance mindset. Status games are zero-sum: your gain is their loss. Value games are positive-sum: expand the pie and everyone wins. The grandmaster plays the game that creates more games.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Expanded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}