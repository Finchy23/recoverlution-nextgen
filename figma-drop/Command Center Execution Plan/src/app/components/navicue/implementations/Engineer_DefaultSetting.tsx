/**
 * ENGINEER #1 — The Default Setting
 * "Decision fatigue is the enemy. Set the default."
 * Pattern A (Tap) — Toggle default option
 * STEALTH KBE: Setting a default = Decision Hygiene / Choice Architecture (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Behavioral Design', 'knowing', 'Circuit');
type Stage = 'arriving' | 'settings' | 'defaulted' | 'resonant' | 'afterglow';

export default function Engineer_DefaultSetting({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [toggled, setToggled] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('settings'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const toggle = () => {
    if (stage !== 'settings' || toggled) return;
    setToggled(true);
    console.log(`[KBE:K] DefaultSetting choiceArchitecture=confirmed decisionHygiene=true`);
    setStage('defaulted');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '16px', borderRadius: radius.sm, background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'settings' && (
          <motion.div key="se" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Settings menu: Breakfast. Option A: Willpower (decide daily). Option B: Default (Oatmeal). Toggle the default.
            </div>
            <div style={{ width: '160px', padding: '8px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', opacity: toggled ? 0.3 : 0.6 }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>A: Willpower (Daily)</span>
                <div style={{ width: '20px', height: '10px', borderRadius: '5px',
                  background: themeColor(TH.primaryHSL, 0.03, 1) }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: toggled ? themeColor(TH.accentHSL, 0.35, 10) : palette.textFaint }}>B: Default (Oatmeal)</span>
                <motion.div onClick={toggle} whileTap={{ scale: 0.9 }}
                  style={{ width: '28px', height: '14px', borderRadius: '7px', cursor: 'pointer', position: 'relative',
                    background: toggled ? themeColor(TH.accentHSL, 0.1, 5) : themeColor(TH.primaryHSL, 0.04, 2) }}>
                  <motion.div animate={{ x: toggled ? 14 : 0 }}
                    style={{ width: '12px', height: '12px', borderRadius: '50%', position: 'absolute', top: '1px', left: '1px',
                      background: toggled ? themeColor(TH.accentHSL, 0.2, 8) : themeColor(TH.primaryHSL, 0.06, 4) }} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'defaulted' && (
          <motion.div key="de" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Default set. Oatmeal. Every morning. No decision required. Decision fatigue is the enemy — every choice you eliminate frees cognitive bandwidth for the hard stuff. Obama wore the same suit every day. Zuckerberg wears the same shirt. Steve Jobs: black turtleneck. They weren{"'"}t lazy — they were engineers.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Choice architecture. Richard Thaler and Cass Sunstein{"'"}s "Nudge": the design of the choice environment dramatically affects decisions. Organ donation rates jump from 15% to 90% when the default is "opt-in" vs. "opt-out." Your daily routines are choice environments. Set the defaults correctly and willpower becomes unnecessary. The system does the work. You do the thinking.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Defaulted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}