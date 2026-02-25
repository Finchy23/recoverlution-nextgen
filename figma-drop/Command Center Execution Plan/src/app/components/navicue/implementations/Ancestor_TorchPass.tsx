/**
 * ANCESTOR #9 -- The Torch Pass
 * "They have done their part. Carry the fire. It is your leg of the race."
 * ARCHETYPE: Pattern A (Tap) -- Tap "Run" to accept the torch
 * ENTRY: Cold open -- ghostly hand passing torch
 * STEALTH KBE: Tapping Run = Agency Assumption / readiness to Lead (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Ember');
type Stage = 'arriving' | 'passing' | 'running' | 'resonant' | 'afterglow';

export default function Ancestor_TorchPass({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('passing'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const run = () => {
    if (stage !== 'passing') return;
    console.log(`[KBE:B] TorchPass agencyAssumption=confirmed`);
    setStage('running');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.4, x: 0 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ width: '10px', height: '20px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.05, 3), opacity: 0.4 }} />
            <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '4px', height: '10px', borderRadius: '2px 2px 0 0',
                background: themeColor(TH.accentHSL, 0.15, 8) }} />
          </motion.div>
        )}
        {stage === 'passing' && (
          <motion.div key="pa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A ghostly hand passes you a flaming torch. They{"'"}ve done their part. It{"'"}s your leg now.
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <motion.div animate={{ opacity: [0.3, 0.15] }} transition={{ duration: 2 }}
                style={{ width: '14px', height: '24px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.05, 3) }} />
              <motion.div animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1, repeat: Infinity }}
                style={{ width: '6px', height: '18px', borderRadius: '3px 3px 0 0',
                  background: themeColor(TH.accentHSL, 0.2, 10),
                  boxShadow: `0 -4px 8px ${themeColor(TH.accentHSL, 0.08, 8)}` }} />
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={run}
              style={{ padding: '12px 28px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `2px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Run</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'running' && (
          <motion.div key="ru" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ x: [0, 40] }} transition={{ duration: 2 }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
              <motion.div animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 0.5, repeat: Infinity }}
                style={{ width: '6px', height: '18px', borderRadius: '3px 3px 0 0',
                  background: themeColor(TH.accentHSL, 0.25, 12) }} />
            </motion.div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Running. The ghost faded. They{"'"}re resting now. The fire is yours. Don{"'"}t look back.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Agency assumption. They{"'"}ve done their part. They{"'"}re resting now. Don{"'"}t look back. Run. Carry the fire. It{"'"}s your leg of the relay. The torch was passed. Now it{"'"}s yours to carry forward.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Carrying.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}