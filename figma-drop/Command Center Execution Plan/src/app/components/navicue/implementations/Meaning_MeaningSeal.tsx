/**
 * MEANING MAKER #10 — The Meaning Seal (Sense of Coherence)
 * "You don't need to know the end. Just enough light for the next step."
 * ARCHETYPE: Pattern A (Tap) — Lantern in the forest
 * ENTRY: Cold open — dark forest, single lantern
 * STEALTH KBE: Completion = Sense of Coherence (Antonovsky)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'dark' | 'lit' | 'resonant' | 'afterglow';

export default function Meaning_MeaningSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('dark'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const light = () => {
    if (stage !== 'dark') return;
    console.log(`[KBE:K] MeaningSeal senseOfCoherence=confirmed comprehensible=true manageable=true meaningful=true`);
    setStage('lit');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ width: '6px', height: '10px', borderRadius: '3px 3px 0 0',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
        )}
        {stage === 'dark' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Dark forest with trees */}
            <div style={{ width: '140px', height: '80px', position: 'relative', overflow: 'hidden',
              borderRadius: radius.sm, background: themeColor(TH.voidHSL, 1, 0) }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ position: 'absolute',
                  left: `${10 + i * 28}px`, bottom: 0,
                  width: '3px', height: `${25 + Math.random() * 30}px`,
                  background: themeColor(TH.primaryHSL, 0.04 + Math.random() * 0.02, 2),
                  borderRadius: '1px' }} />
              ))}
              {/* Lantern (unlit) */}
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                width: '6px', height: '10px', borderRadius: '3px 3px 1px 1px',
                background: themeColor(TH.accentHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              A dark forest. A lantern. Light it.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={light}
              style={{ padding: '10px 22px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Light</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'lit' && (
          <motion.div key="lit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '140px', height: '80px', position: 'relative', overflow: 'hidden',
              borderRadius: radius.sm, background: themeColor(TH.voidHSL, 1, 0) }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ position: 'absolute',
                  left: `${10 + i * 28}px`, bottom: 0,
                  width: '3px', height: `${25 + Math.random() * 30}px`,
                  background: themeColor(TH.primaryHSL, 0.04 + (Math.abs(i - 2) < 2 ? 0.02 : 0), 2),
                  borderRadius: '1px' }} />
              ))}
              {/* Lantern glow */}
              <motion.div animate={{ opacity: [0.06, 0.1, 0.06] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', bottom: '0px', left: '50%', transform: 'translateX(-50%)',
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.08, 5)}, transparent)` }} />
              {/* Lantern (lit) */}
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                width: '6px', height: '10px', borderRadius: '3px 3px 1px 1px',
                background: themeColor(TH.accentHSL, 0.15, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.2, 10)}`,
                boxShadow: `0 0 8px ${themeColor(TH.accentHSL, 0.08, 6)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
              fontStyle: 'italic' }}>
              You do not need to know the end. You just need enough light for the next step. The lantern doesn{"'"}t illuminate the whole path — just enough to keep walking.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Sense of Coherence (SOC). Aaron Antonovsky{"'"}s foundational concept in salutogenesis — the study of health origins rather than disease origins. SOC has three components: comprehensibility (the world makes sense), manageability (you have the resources), and meaningfulness (it{"'"}s worth the effort). SOC is the single strongest predictor of mental health across cultures. You don{"'"}t need to see the whole path. Just enough light for the next step.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Coherent.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}