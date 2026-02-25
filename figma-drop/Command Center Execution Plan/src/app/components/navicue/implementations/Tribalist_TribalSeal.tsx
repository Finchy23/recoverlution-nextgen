/**
 * TRIBALIST #10 — The Tribal Seal (Social Integration)
 * "You are not a thread. You are the weave."
 * ARCHETYPE: Pattern A (Tap) — Complex knot tying two ropes
 * ENTRY: Cold open — two ropes approach
 * STEALTH KBE: Completion = Social Integration mastery
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'tying' | 'sealed' | 'resonant' | 'afterglow';

export default function Tribalist_TribalSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [knots, setKnots] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('tying'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tie = () => {
    const next = knots + 1;
    setKnots(next);
    if (next >= 3) {
      console.log(`[KBE:E] TribalSeal socialIntegration=confirmed`);
      t(() => setStage('sealed'), 400);
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ width: '50px', height: '3px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.15, 8) }} />
              <div style={{ width: '50px', height: '3px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.15, 8) }} />
            </div>
          </motion.div>
        )}
        {stage === 'tying' && (
          <motion.div key="ty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.1em' }}>
              tie. tie. tie.
            </div>
            {/* Ropes approaching */}
            <div style={{ display: 'flex', gap: `${30 - knots * 8}px`, alignItems: 'center' }}>
              <div style={{ width: '50px', height: '4px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.12 + knots * 0.05, 8) }} />
              {knots > 0 && (
                <div style={{ width: `${knots * 6}px`, height: `${knots * 6}px`, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${themeColor(TH.primaryHSL, 0.12, 8)}, ${themeColor(TH.accentHSL, 0.12, 8)})`,
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }} />
              )}
              <div style={{ width: '50px', height: '4px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.12 + knots * 0.05, 8) }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < knots ? themeColor(TH.accentHSL, 0.3, 10) : themeColor(TH.primaryHSL, 0.06, 4) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={tie}
              style={{ padding: '14px 26px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12) }}>tie</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Complex knot */}
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px 0 0 2px',
                background: themeColor(TH.primaryHSL, 0.2, 10) }} />
              <div style={{ width: '20px', height: '20px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${themeColor(TH.primaryHSL, 0.15, 8)}, ${themeColor(TH.accentHSL, 0.15, 8)})`,
                border: `2px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
                boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.06, 8)}` }} />
              <div style={{ width: '40px', height: '4px', borderRadius: '0 2px 2px 0',
                background: themeColor(TH.accentHSL, 0.2, 10) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              You are not a thread. You are the weave.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Social integration. The Roseto Effect: the degree to which an individual feels connected to a social group is a primary predictor of longevity and resilience. The knot tightens under tension but does not break.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Woven.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}