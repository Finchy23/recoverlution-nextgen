/**
 * INFINITE PLAYER II #4 — The Open Door
 * "Every answer is just a door to a new question."
 * Pattern A (Tap) — Open doors in a hallway; each leads to more doors
 * STEALTH KBE: Expecting more doors (not a wall) = Intellectual Curiosity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'hallway' | 'explored' | 'resonant' | 'afterglow';

export default function Horizon_OpenDoor({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [doorsOpened, setDoorsOpened] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('hallway'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const openDoor = () => {
    if (stage !== 'hallway') return;
    const next = doorsOpened + 1;
    setDoorsOpened(next);
    if (next >= 4) {
      console.log(`[KBE:K] OpenDoor doorsOpened=${next} curiosity=true expectsMoreDoors=true`);
      setStage('explored');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '12px', height: '20px', borderRadius: '2px', border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'hallway' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0,1,2,3].map(i => (
                <motion.div key={i} whileTap={i <= doorsOpened ? { scale: 0.85 } : {}}
                  onClick={i === doorsOpened ? openDoor : undefined}
                  animate={i < doorsOpened ? { opacity: 0.3, scaleX: 0.3 } : { opacity: 1, scaleX: 1 }}
                  style={{ width: '30px', height: '50px', borderRadius: '3px',
                    border: `1px solid ${themeColor(i === doorsOpened ? TH.accentHSL : TH.primaryHSL, 0.1, 4)}`,
                    background: i < doorsOpened ? 'transparent' : themeColor(TH.primaryHSL, 0.03, 2),
                    cursor: i === doorsOpened ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i >= doorsOpened && (
                    <div style={{ width: '3px', height: '3px', borderRadius: '50%',
                      background: themeColor(TH.accentHSL, 0.15, 6) }} />
                  )}
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A hallway of doors. Open the next one. ({doorsOpened}/4)
            </div>
          </motion.div>
        )}
        {stage === 'explored' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Every door leads to another hallway. Do not look for the final room. Look for the next door. Every answer is just a door to a new question. The intellectually curious don{"'"}t seek closure — they seek openings.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Epistemic Curiosity (Litman): the drive to acquire new knowledge. Research shows it activates the same reward circuits as food and social bonding. The brain literally treats new understanding as a reward. The door is the dopamine.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Curious.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}