/**
 * GRANDMASTER #5 — The Sunk Cost Eject
 * "The plane is dead. Save the pilot. Pull the handle."
 * ARCHETYPE: Pattern A (Tap) — Pull EJECT handle while investment counter ticks up
 * ENTRY: Cold open — cockpit alarm
 * STEALTH KBE: Reaction latency vs ticking counter = Sunk Cost Resistance (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'active' | 'ejected' | 'resonant' | 'afterglow';

export default function Grandmaster_SunkCostEject({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [invested, setInvested] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const stageStart = useRef(0);

  useEffect(() => {
    t(() => { setStage('active'); stageStart.current = Date.now(); }, 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const id = window.setInterval(() => setInvested(v => v + Math.floor(Math.random() * 300 + 100)), 300);
    return () => clearInterval(id);
  }, [stage]);

  const eject = () => {
    if (stage !== 'active') return;
    const latency = Date.now() - stageStart.current;
    console.log(`[KBE:B] SunkCostEject latencyMs=${latency} invested=${invested} sunkCostResistance=${latency < 5000}`);
    setStage('ejected');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0.3, 0.6] }}
            transition={{ duration: 1, repeat: Infinity }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: 'hsla(0, 40%, 45%, 0.5)', letterSpacing: '0.15em' }}>
            ENGINE FAILURE
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ ...navicueType.hint, color: 'hsla(0, 35%, 42%, 0.6)', letterSpacing: '0.12em' }}>
              ENGINE FAILURE
            </motion.div>
            <div style={{ padding: '8px 14px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <span style={{ ...navicueType.texture, color: palette.textFaint }}>
                Invested: ${invested.toLocaleString()}
              </span>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={eject}
              animate={{ boxShadow: [`0 0 4px hsla(0, 40%, 40%, 0.1)`, `0 0 12px hsla(0, 40%, 40%, 0.2)`, `0 0 4px hsla(0, 40%, 40%, 0.1)`] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ padding: '14px 28px', borderRadius: radius.sm, cursor: 'pointer',
                background: 'hsla(0, 30%, 30%, 0.08)',
                border: '2px solid hsla(0, 30%, 40%, 0.2)' }}>
              <div style={{ ...navicueType.choice, color: 'hsla(0, 35%, 45%, 0.6)', fontWeight: '700', letterSpacing: '0.1em' }}>
                EJECT
              </div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              the counter keeps rising...
            </div>
          </motion.div>
        )}
        {stage === 'ejected' && (
          <motion.div key="ej" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Ejected. The plane crashed. The pilot survived. The investment is gone, but you are not.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Sunk cost fallacy. The counter ticking up creates psychological gravity, making it harder to eject the more you{"'"}ve invested. But the plane is dead. Staying will not fix it. Save the pilot. The faster you pulled, the less susceptible you are.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ejected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}