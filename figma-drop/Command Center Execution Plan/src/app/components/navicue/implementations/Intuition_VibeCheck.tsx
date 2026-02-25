/**
 * INTUITION #5 — The Vibe Check (Pattern Match)
 * "Intuition is not magic. It is high-speed pattern recognition."
 * Pattern A (Tap) — Select the red flag trait
 * STEALTH KBE: Converting vibe to data = Emotional Granularity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'knowing', 'Practice');
type Stage = 'arriving' | 'checking' | 'named' | 'resonant' | 'afterglow';
const FLAGS = ['Their eyes shift', 'Tone doesn\'t match words', 'Timing feels forced', 'They never ask about you'];

export default function Intuition_VibeCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [flag, setFlag] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('checking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pick = (f: string) => {
    if (stage !== 'checking') return;
    setFlag(f);
    console.log(`[KBE:K] VibeCheck flag="${f}" emotionalGranularity=confirmed patternArticulation=true`);
    setStage('named');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.03, 1), filter: 'blur(3px)' }} />
          </motion.div>
        )}
        {stage === 'checking' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A blurred face. "You don{"'"}t trust them." Why? Your brain saw a micro-expression your eyes missed. Name the red flag.
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.04, 2), filter: 'blur(4px)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '220px' }}>
              {FLAGS.map(f => (
                <motion.div key={f} whileTap={{ scale: 0.95 }} onClick={() => pick(f)}
                  style={{ padding: '6px 12px', borderRadius: '10px', cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'named' && (
          <motion.div key="na" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            "{flag}." Named. Intuition is not magic — it is high-speed pattern recognition. Your brain detected the micro-expression, the tone mismatch, the timing anomaly — all below conscious awareness. Converting a "vibe" to data is the skill. You just did it. The vague unease now has a name, and a name gives you power.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Emotional granularity. Lisa Feldman Barrett: people who can distinguish between closely related emotions ("granularity") make better decisions and regulate emotions more effectively. A "bad vibe" is low granularity. "They avoid eye contact when discussing money" is high granularity. The skill is translation: converting raw somatic data into specific, actionable language. This is what therapists do. Now you can too.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Named.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}