/**
 * KINETIC #5 — The Friction Polish
 * "Smooth out the process. Remove the friction. Make the action slippery."
 * ARCHETYPE: Pattern A (Tap) — Choose "Remove Phone" vs "Willpower"
 * ENTRY: Scene-first — rough jagged stone
 * STEALTH KBE: Choosing removal = Environmental Design knowledge (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Probe');
type Stage = 'arriving' | 'active' | 'polished' | 'resonant' | 'afterglow';

export default function Kinetic_FrictionPolish({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'remove' | 'willpower' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: 'remove' | 'willpower') => {
    if (stage !== 'active') return;
    setChoice(c);
    console.log(`[KBE:K] FrictionPolish method=${c} environmentalDesign=${c === 'remove'}`);
    setStage('polished');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="60" height="40" viewBox="0 0 60 40">
              <polygon points="5,35 15,10 25,30 35,5 45,25 55,35" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.12, 6)} strokeWidth="2" />
            </svg>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The resistance is drag. How do you remove friction?
            </div>
            <svg width="80" height="50" viewBox="0 0 80 50">
              <polygon points="5,45 15,15 30,40 45,5 60,30 75,45" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.15, 8)} strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => choose('willpower')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>More willpower</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => choose('remove')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Remove the phone</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'polished' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {choice === 'remove' ? (
              <motion.div initial={{ borderRadius: '0' }} animate={{ borderRadius: '50%' }} transition={{ duration: 1.5 }}>
                <svg width="60" height="40" viewBox="0 0 60 40">
                  <ellipse cx="30" cy="20" rx="25" ry="15" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.2, 10)} strokeWidth="2" />
                </svg>
              </motion.div>
            ) : (
              <svg width="80" height="50" viewBox="0 0 80 50">
                <polygon points="5,45 15,15 30,40 45,5 60,30 75,45" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.1, 6)} strokeWidth="2" />
              </svg>
            )}
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'remove'
                ? 'Smooth. Aerodynamic. The friction is gone. The action is slippery.'
                : 'Still jagged. Willpower depletes. The rock is still rough.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Environmental design. The resistance is drag: distractions, unnecessary steps, friction. Don{"'"}t rely on willpower (it depletes). Remove the obstacle from the environment. Make the desired action the path of least resistance.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Polished.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}