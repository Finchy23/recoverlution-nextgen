/**
 * KINETIC #1 — The Inertia Break (The Rocket)
 * "The hardest part of the flight is the first inch. Burn the fuel."
 * ARCHETYPE: Pattern C (Hold) — Hold for 5s to build thrust through visual shaking
 * ENTRY: Scene-first — rocket on pad
 * STEALTH KBE: Holding through chaos = Commitment (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'active' | 'launched' | 'resonant' | 'afterglow';

export default function Kinetic_InertiaBreak({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] InertiaBreak heldThrough=true commitment=confirmed`);
      setStage('launched');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const shake = hold.isHolding ? hold.progress * 6 : 0;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '16px', height: '40px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.primaryHSL, 0.08, 4),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
            <div style={{ width: '24px', height: '6px', borderRadius: '0 0 4px 4px',
              background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Gravity is strongest at zero. Hold to burn.
            </div>
            <motion.div animate={{ x: hold.isHolding ? [0, shake, -shake, shake, 0] : 0 }}
              transition={{ duration: 0.1, repeat: hold.isHolding ? Infinity : 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '18px', height: '44px', borderRadius: '6px 6px 0 0',
                background: themeColor(TH.primaryHSL, 0.08 + hold.progress * 0.04, 4),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
              <motion.div animate={{ height: hold.isHolding ? `${8 + hold.progress * 20}px` : '6px',
                opacity: hold.isHolding ? 0.4 + hold.progress * 0.4 : 0.2 }}
                style={{ width: '12px', borderRadius: '0 0 4px 4px',
                  background: themeColor(TH.accentHSL, 0.2 + hold.progress * 0.2, 8) }} />
            </motion.div>
            <div {...hold.holdProps}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer', userSelect: 'none',
                background: hold.isHolding ? themeColor(TH.accentHSL, 0.1, 6) : themeColor(TH.accentHSL, 0.06, 4),
                border: `2px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.2 : 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 15) }}>
                {hold.isHolding ? `${Math.round(hold.progress * 100)}%` : 'HOLD TO LAUNCH'}
              </div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hold.isHolding ? 'building thrust...' : 'press and hold'}
            </div>
          </motion.div>
        )}
        {stage === 'launched' && (
          <motion.div key="l" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ y: 0 }} animate={{ y: -60 }} transition={{ duration: 2, ease: 'easeIn' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '18px', height: '44px', borderRadius: '6px 6px 0 0',
                background: themeColor(TH.accentHSL, 0.15, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.18, 10)}` }} />
              <div style={{ width: '14px', height: '22px', borderRadius: '0 0 4px 4px',
                background: themeColor(TH.accentHSL, 0.4, 12) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Escape velocity. The first inch is behind you.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Activation energy. The hardest part of any flight is the first inch. You{"'"}re fighting inertia, gravity, and the entire mass of resistance. Holding through the shaking is the discipline that separates launchers from planners.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Launched.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}