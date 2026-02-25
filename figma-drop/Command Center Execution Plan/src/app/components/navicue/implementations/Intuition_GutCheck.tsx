/**
 * INTUITION #1 — The Gut Check (Yes/No)
 * "Your enteric nervous system knows before your brain does."
 * Pattern A (Tap) — Hold two buttons, pick the smooth one
 * STEALTH KBE: Selecting smooth option = Somatic Trust / Interoceptive Cues (E)
 * WEB ADAPT: vibration → visual smooth vs rough animation
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'embodying', 'Practice');
type Stage = 'arriving' | 'sensing' | 'trusted' | 'resonant' | 'afterglow';

export default function Intuition_GutCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'smooth' | 'rough' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('sensing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pick = (c: 'smooth' | 'rough') => {
    if (stage !== 'sensing') return;
    setChoice(c);
    console.log(`[KBE:E] GutCheck somaticTrust=${c === 'smooth'} interoceptiveCue=${c}`);
    setStage('trusted');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'sensing' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              "Should I do it?" Two options. One feels smooth. One feels rough. Which thumb feels lighter? Trust the vibration.
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {/* Smooth button */}
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => pick('smooth')}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `2px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>Yes</span>
              </motion.div>
              {/* Rough button */}
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => pick('rough')}
                animate={{ x: [-1, 1, -1, 0], y: [0, -1, 1, 0] }}
                transition={{ duration: 0.15, repeat: Infinity }}
                style={{ width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>No</span>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>One breathes. One jitters. Feel.</div>
          </motion.div>
        )}
        {stage === 'trusted' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'smooth'
              ? 'Smooth. You chose the lighter thumb. Your enteric nervous system, 500 million neurons in your gut, processed the answer before your prefrontal cortex finished deliberating. That feeling of lightness IS the data. Trust the vibration.'
              : 'Rough. The jitter was the warning. Sometimes the body says no before the mind catches up. That contraction, that unease: it\'s not anxiety, it\'s information. Your gut has 500 million neurons. It votes before you think.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Somatic Marker Hypothesis. Antonio Damasio{"'"}s research: emotional processes guide behavior via "somatic markers," bodily sensations associated with past outcomes. The ventromedial prefrontal cortex stores these associations. Patients with damage to this area can reason logically but make catastrophic life decisions because they{"'"}ve lost access to gut data. Your body IS a decision-making organ.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Trusted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}