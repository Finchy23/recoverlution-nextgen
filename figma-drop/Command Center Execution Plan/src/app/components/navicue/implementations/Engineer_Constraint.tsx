/**
 * ENGINEER #7 — The Constraint (The Box)
 * "Freedom is paralyzing. Constraints are liberating."
 * Pattern A (Tap) — Shrink the canvas to force creativity
 * STEALTH KBE: Accepting the constraint = Creative Constraint / Focus (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'blank' | 'constrained' | 'resonant' | 'afterglow';

export default function Engineer_Constraint({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [shrunk, setShrunk] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('blank'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const shrink = () => {
    if (stage !== 'blank') return;
    setShrunk(true);
    console.log(`[KBE:B] Constraint creativeConstraint=accepted focus=confirmed`);
    setStage('constrained');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '60px', height: '40px', borderRadius: '2px',
              border: `1px dashed ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'blank' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A blank canvas. Too big. Too many choices. Paralysis. Shrink the frame.
            </div>
            {/* Canvas that shrinks */}
            <motion.div animate={{ width: shrunk ? '80px' : '140px', height: shrunk ? '40px' : '80px' }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{ borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
              {shrunk ? (
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>50 words only</span>
              ) : (
                <span style={{ fontSize: '11px', color: palette.textFaint }}>∞ possibilities</span>
              )}
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={shrink}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Shrink Frame</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'constrained' && (
          <motion.div key="co" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Small box. Now the words flow. Freedom is paralyzing — infinite choice produces infinite hesitation. Constraints are liberating: a deadline, a word limit, a budget, a format. The box forces the creativity out. You don{"'"}t need a bigger canvas. You need a smaller one.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Creative constraint. Dan Ariely{"'"}s research on the paradox of choice shows that constraints boost creative output. Haiku (17 syllables), Twitter (280 characters), Dogme 95 (strict filmmaking rules) — all produced breakthrough art BECAUSE of limits, not despite them. In behavioral design, "choice architecture" means reducing options to increase action. When everything is possible, nothing happens.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Constrained.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}