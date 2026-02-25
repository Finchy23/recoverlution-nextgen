/**
 * ASCENDANT #7 -- The Ripple Maker
 * "You cannot not matter. Move with intention."
 * Pattern A (Tap) -- Still lake; tap to make ripple; watch it hit the shore
 * STEALTH KBE: Initiating ripple = Agency / Belief in Consequence (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'still' | 'rippling' | 'shore' | 'resonant' | 'afterglow';

export default function Ascendant_RippleMaker({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [ripples, setRipples] = useState<number[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('still'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tap = () => {
    if (stage !== 'still') return;
    setRipples([Date.now()]);
    setStage('rippling');
    console.log(`[KBE:B] RippleMaker agency=confirmed beliefInConsequence=true`);
    t(() => {
      setStage('shore');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }, 3000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '20px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.02, 1) }} />
          </motion.div>
        )}
        {stage === 'still' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A still lake. You stand in it. The water is perfectly flat. Move one finger.
            </div>
            <div style={{ width: '100px', height: '40px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.025, 1),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 2)}` }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={tap}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Touch the Water</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'rippling' && (
          <motion.div key="rp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '120px', height: '60px' }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i}
                  initial={{ width: 4, height: 2, opacity: 0.08 }}
                  animate={{ width: 30 + i * 25, height: 12 + i * 8, opacity: 0 }}
                  transition={{ duration: 2, delay: i * 0.5 }}
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    borderRadius: '50%', border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
              ))}
            </div>
            <span style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>Rippling...</span>
          </motion.div>
        )}
        {stage === 'shore' && (
          <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Shore reached. One finger. One ripple. It touched the entire shore. You cannot not matter. Everything you do touches everything. Move with intention. The ripple doesn{"'"}t ask permission to travel. It doesn{"'"}t wonder if it matters. It just moves outward, touching everything it reaches. So do you.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Agency and consequence. Albert Bandura{"'"}s self-efficacy theory: belief in one{"'"}s ability to affect outcomes is the strongest predictor of action. The "ripple effect" in social networks (Fowler & Christakis): behaviors, emotions, and beliefs spread through three degrees of separation. Your kindness affects your friend{"'"}s friend{"'"}s friend. Complex adaptive systems: every local action has global consequences. You are never not mattering.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rippling.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}