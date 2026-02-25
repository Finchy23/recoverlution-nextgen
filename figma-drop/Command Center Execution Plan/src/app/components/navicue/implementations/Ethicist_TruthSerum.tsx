/**
 * ETHICIST #4 — The Truth Serum
 * "The first person you must not fool is yourself."
 * ARCHETYPE: Pattern D (Type) — Correct a lie with truth
 * ENTRY: Scene-first — lie detector spiking
 * STEALTH KBE: Correcting distortion = Self-Honesty / Radical Honesty (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'spiking' | 'truthed' | 'resonant' | 'afterglow';

export default function Ethicist_TruthSerum({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [truth, setTruth] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setTruth(val),
    onAccept: () => {
      if (!truth.trim()) return;
      console.log(`[KBE:K] TruthSerum radicalHonesty=confirmed selfHonesty=true`);
      setStage('truthed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('spiking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="60" height="20" viewBox="0 0 60 20">
              <polyline points="0,10 10,10 15,3 20,17 25,10 35,10 40,5 45,15 50,10 60,10"
                fill="none" stroke="hsla(0, 15%, 30%, 0.08)" strokeWidth="1.5" />
            </svg>
          </motion.div>
        )}
        {stage === 'spiking' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The graph spikes red. "You are lying to yourself." Type the truth.
            </div>
            {/* Lie detector */}
            <svg width="140" height="30" viewBox="0 0 140 30">
              <motion.polyline
                points="0,15 20,15 30,5 40,25 50,15 70,15 80,8 90,22 100,15 140,15"
                fill="none" stroke="hsla(0, 18%, 30%, 0.12)" strokeWidth="2" />
            </svg>
            <div style={{ padding: '6px 10px', borderRadius: '6px',
              background: 'hsla(0, 8%, 20%, 0.03)',
              border: '1px dashed hsla(0, 8%, 25%, 0.06)' }}>
              <span style={{ fontSize: '11px', color: 'hsla(0, 10%, 32%, 0.2)', fontStyle: 'italic' }}>{"\"I'm fine.\""}</span>
            </div>
            <input type="text" value={truth} onChange={(e) => typeInt.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
              placeholder="The real truth..."
              style={{ width: '140px', padding: '6px 10px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                opacity: truth.trim() ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Speak Truth</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'truthed' && (
          <motion.div key="tr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <svg width="140" height="20" viewBox="0 0 140 20">
              <line x1="0" y1="10" x2="140" y2="10"
                stroke={themeColor(TH.accentHSL, 0.12, 6)} strokeWidth="2" />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Flat green. The lie detector calms. The first person you must not fool is yourself — and you are the easiest person to fool. You spit out the lie. Truth is the only medicine.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Radical honesty. Richard Feynman: "The first principle is that you must not fool yourself — and you are the easiest person to fool." Self-deception research (Chance et al.): we systematically overestimate our abilities and rationalize our failures. The correction — naming the truth to yourself first — activates the dorsolateral PFC (reality-testing) and reduces amygdala-driven avoidance.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Truthed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}