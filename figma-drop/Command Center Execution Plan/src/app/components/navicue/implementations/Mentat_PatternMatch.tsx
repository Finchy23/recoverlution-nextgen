/**
 * MENTAT #7 — The Pattern Match
 * "Once is an accident. Twice is coincidence. Three times is a pattern."
 * ARCHETYPE: Pattern A (Tap) — Identify common denominator
 * ENTRY: Scene-first — three overlaid bad days
 * STEALTH KBE: Identifying variable = Systemic Insight / Pattern Recognition (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'knowing', 'Circuit');
type Stage = 'arriving' | 'overlaying' | 'matched' | 'resonant' | 'afterglow';

const VARIABLES = ['Hunger', 'Poor Sleep', 'Skipped Exercise', 'Isolation'];

export default function Mentat_PatternMatch({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('overlaying'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const identify = (v: string) => {
    if (stage !== 'overlaying') return;
    setChosen(v);
    console.log(`[KBE:K] PatternMatch variable="${v}" patternRecognition=confirmed systemicInsight=true`);
    setStage('matched');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="40" height="20" viewBox="0 0 40 20">
              {[0, 1, 2].map(i => (
                <line key={i} x1="5" y1={6 + i * 5} x2="35" y2={6 + i * 5}
                  stroke={themeColor(TH.primaryHSL, 0.04 - i * 0.005, 2)} strokeWidth="1" />
              ))}
            </svg>
          </motion.div>
        )}
        {stage === 'overlaying' && (
          <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Three bad days overlaid. A common shape emerges. Find the variable.
            </div>
            {/* Overlaid patterns */}
            <svg width="140" height="50" viewBox="0 0 140 50">
              <path d="M10,40 Q30,30 50,25 Q70,20 90,35 Q110,45 130,30" fill="none"
                stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1" />
              <path d="M10,35 Q30,25 50,30 Q70,15 90,30 Q110,40 130,25" fill="none"
                stroke={themeColor(TH.accentHSL, 0.05, 2)} strokeWidth="1" />
              <path d="M10,38 Q30,28 50,22 Q70,18 90,32 Q110,42 130,28" fill="none"
                stroke={themeColor(TH.accentHSL, 0.04, 1)} strokeWidth="1" />
              {/* Common dip area */}
              <rect x="55" y="12" width="30" height="18" rx="3" fill="none"
                stroke={themeColor(TH.accentHSL, 0.1, 6)} strokeWidth="1" strokeDasharray="3 2" />
              <text x="60" y="10" fill={themeColor(TH.accentHSL, 0.15, 8)} fontSize="11">Pattern</text>
            </svg>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {VARIABLES.map(v => (
                <motion.div key={v} whileTap={{ scale: 0.9 }} onClick={() => identify(v)}
                  style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.06, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>{v}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'matched' && (
          <motion.div key="ma" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The pattern is: {chosen}. Three bad days, one common variable. Once is an accident. Twice is a coincidence. Three times is a pattern. Now you know the variable. Control it, and the pattern breaks. Systems thinking applied to your own life.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Pattern recognition. The human brain is fundamentally a pattern-detection machine (Hawkins, "On Intelligence"). Most emotional problems feel unique but follow repeating patterns. The "three-instance" rule: when you see the same outcome three times, look for the common variable — the element present in all three situations. This is systems thinking applied to personal data. Find the variable. Change the variable. Change the outcome.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Matched.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}