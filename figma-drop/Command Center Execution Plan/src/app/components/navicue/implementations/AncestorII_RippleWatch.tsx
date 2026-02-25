/**
 * ANCESTOR II #7 -- The Ripple Watch
 * "You will never know who you saved."
 * Pattern A (Tap) -- Drop pebble (blind kindness); watch ripple cross years; flowers bloom on distant island
 * STEALTH KBE: Initiating blind act = Karmic Faith / Faith in Consequence (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'pebble' | 'rippling' | 'bloomed' | 'resonant' | 'afterglow';

export default function AncestorII_RippleWatch({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('pebble'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const drop = () => {
    if (stage !== 'pebble') return;
    console.log(`[KBE:B] RippleWatch faithInConsequence=confirmed karmicFaith=true`);
    setStage('rippling');
    t(() => {
      setStage('bloomed');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }, 3000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'pebble' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A pebble in your hand. An act of kindness you will never see land. Drop it. Trust the physics.
            </div>
            <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 4) }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={drop}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Drop</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'rippling' && (
          <motion.div key="ri" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '120px', height: '40px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  initial={{ width: 4, height: 2, opacity: 0.06 }}
                  animate={{ width: 24 + i * 20, height: 8 + i * 4, opacity: 0 }}
                  transition={{ duration: 2.5, delay: i * 0.4 }}
                  style={{ position: 'absolute', top: '50%', left: '15%', transform: 'translate(-50%, -50%)',
                    borderRadius: '50%', border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
              ))}
            </div>
            <span style={{ fontSize: '11px', color: palette.textFaint, fontStyle: 'italic' }}>Years passing...</span>
          </motion.div>
        )}
        {stage === 'bloomed' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Bloomed. On a distant island, years away, flowers grow where your ripple landed. You will never know who you saved. You smiled at a stranger, and it saved a life ten years later. Trust the physics. The ripple doesn{"'"}t ask where it{"'"}s going. It just moves outward with the energy you gave it. Every blind act of kindness is a message in a bottle that always reaches shore.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The unseen impact. Fowler & Christakis{"'"} social network research: acts of kindness propagate through three degrees of separation: your generosity affects your friend{"'"}s friend{"'"}s friend. The "butterfly effect" (Lorenz): tiny perturbations in initial conditions lead to dramatically different outcomes. "Pay it forward" research (Chancellor, 2018): receiving kindness from a stranger increases the recipient{"'"}s likelihood of being kind to others by 278%. You will never see most of your impact. The physics is real. Trust it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rippled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}