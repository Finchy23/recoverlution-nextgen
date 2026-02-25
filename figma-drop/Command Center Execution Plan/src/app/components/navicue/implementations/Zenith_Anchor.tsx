/**
 * ZENITH #4 — The Anchor (The Belay)
 * "Trust the gear. Set the anchor. Now you can relax your grip."
 * ARCHETYPE: Pattern A (Tap) — Place bolt into rock
 * ENTRY: Scene-first — vertical wall, exposed
 * STEALTH KBE: Engaging anchor = System Trust / Belief in Structure (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'exposed' | 'anchored' | 'resonant' | 'afterglow';

export default function Zenith_Anchor({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [shake, setShake] = useState(true);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('exposed'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const placeBolt = () => {
    if (stage !== 'exposed') return;
    setShake(false);
    console.log(`[KBE:B] Anchor systemTrust=confirmed beliefInStructure=true`);
    setStage('anchored');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '4px', height: '40px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
        )}
        {stage === 'exposed' && (
          <motion.div key="ex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            {/* Wall */}
            <motion.div animate={shake ? { x: [-1, 1, -1, 0] } : {}}
              transition={{ duration: 0.3, repeat: shake ? Infinity : 0 }}
              style={{ width: '40px', height: '80px', borderRadius: '2px',
                background: `linear-gradient(180deg, ${themeColor(TH.primaryHSL, 0.03, 1)}, ${themeColor(TH.primaryHSL, 0.05, 3)})`,
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                position: 'relative' }}>
              {/* Hand holds */}
              {[15, 35, 55].map(y => (
                <div key={y} style={{ position: 'absolute', left: `${10 + Math.random() * 20}px`, top: `${y}px`,
                  width: '8px', height: '4px', borderRadius: '2px',
                  background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
              {/* Bolt point */}
              <div style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%,-50%)',
                width: '8px', height: '8px', borderRadius: '50%',
                border: `1px dashed ${themeColor(TH.accentHSL, 0.1, 5)}` }} />
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Vertical wall. You feel exposed. Place a bolt. Trust the gear.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={placeBolt}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Set Anchor</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'anchored' && (
          <motion.div key="an" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Click. The shake stops. You are safe. Fear made you grip too tight; now you can relax your hand and move. The anchor (routine, system, structure) is what lets you climb freely. Trust the gear.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            System trust. In climbing, the protection system (bolts, cams, rope) is what allows movement on vertical terrain. Without trust in the system, you grip too hard and fatigue. In life, routines and structures serve the same function; they{"'"}re the belays that let you take risks. Set the anchor, test it, trust it. Then climb.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Anchored.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}