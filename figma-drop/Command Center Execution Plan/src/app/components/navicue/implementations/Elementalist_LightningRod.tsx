/**
 * ELEMENTALIST #9 — The Lightning Rod (Discharge)
 * "Anger is just voltage. Ground it."
 * ARCHETYPE: Pattern A (Tap) — Touch rod to ground the bolt
 * ENTRY: Scene-first — charged storm cloud
 * STEALTH KBE: Performing discharge = Somatic Release / Catharsis (E)
 * WEB ADAPT: shake gesture → tap rod firmly
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'charged' | 'discharged' | 'resonant' | 'afterglow';

export default function Elementalist_LightningRod({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bolt, setBolt] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('charged'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const ground = () => {
    if (stage !== 'charged') return;
    setBolt(true);
    console.log(`[KBE:E] LightningRod somaticRelease=confirmed catharsis=grounded`);
    t(() => setStage('discharged'), 800);
    t(() => setStage('resonant'), 5800);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11800);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '16px', borderRadius: '8px 8px 0 0',
              background: 'hsla(270, 10%, 20%, 0.04)' }} />
          </motion.div>
        )}
        {stage === 'charged' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A charged storm cloud. Anger is voltage. Touch the rod. Ground it.
            </div>
            <div style={{ position: 'relative', width: '80px', height: '90px' }}>
              {/* Storm cloud */}
              <motion.div animate={{ opacity: [0.06, 0.09, 0.06] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ width: '50px', height: '22px', borderRadius: '10px',
                  background: 'hsla(270, 10%, 22%, 0.06)', position: 'absolute', top: '0', left: '15px' }} />
              {/* Lightning bolt */}
              {bolt && (
                <motion.div initial={{ opacity: 0.4, scaleY: 0 }} animate={{ opacity: [0.4, 0.2, 0], scaleY: 1 }}
                  transition={{ duration: 0.6 }}
                  style={{ position: 'absolute', top: '22px', left: '38px', transformOrigin: 'top',
                    width: '4px', height: '45px', background: 'hsla(270, 15%, 35%, 0.1)' }} />
              )}
              {/* Rod */}
              <div style={{ position: 'absolute', bottom: '0', left: '37px',
                width: '6px', height: '30px', borderRadius: '1px',
                background: themeColor(TH.primaryHSL, 0.06, 4) }}>
                <div style={{ width: '8px', height: '2px', borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.04, 3),
                  position: 'absolute', top: '-1px', left: '-1px' }} />
              </div>
              {/* Ground line */}
              <div style={{ position: 'absolute', bottom: '0', width: '80px', height: '2px',
                background: themeColor(TH.accentHSL, 0.04, 2), borderRadius: '1px' }} />
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={ground}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Ground</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'discharged' && (
          <motion.div key="di" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Discharged. The bolt struck and grounded. The cloud turns white. Anger is just voltage. It is dangerous if you hold it. It is safe if you ground it. Let it pass through you into the floor. The rod doesn{"'"}t store the lightning — it conducts it safely.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Somatic release. Peter Levine{"'"}s Somatic Experiencing: trauma and anger are stored as incomplete motor responses in the body. The discharge — shaking, movement, exhalation — completes the stress cycle and returns the nervous system to baseline. Animals in the wild shake after near-death experiences. Humans suppress this instinct. The lightning rod is permission to discharge. Not to suppress. Not to explode. To ground.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Grounded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}