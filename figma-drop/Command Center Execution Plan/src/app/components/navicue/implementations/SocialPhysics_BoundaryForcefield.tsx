/**
 * SOCIAL PHYSICS #6 — The Boundary Forcefield
 * "A boundary is not a wall. It is a forcefield."
 * ARCHETYPE: Pattern C (Hold) — Hold the shield as external dot pushes in
 * ENTRY: Ambient fade — glowing circle appears
 * STEALTH KBE: Dot shows "Disappointment"; keeping shield up = Self-Trust (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'active' | 'held' | 'resonant' | 'afterglow';

export default function SocialPhysics_BoundaryForcefield({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dotPhase, setDotPhase] = useState<'approach' | 'disappointment'>('approach');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 4000,
    onThreshold: (tension) => {
      if (tension >= 0.5) setDotPhase('disappointment');
    },
    onComplete: () => {
      console.log(`[KBE:B] BoundaryForcefield shieldMaintained=true selfTrust=confirmed`);
      setStage('held');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const shieldSize = 100 + hold.tension * 10;
  const dotDist = 80 - hold.tension * 20;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Hold your boundary. Do not lower the shield.
            </div>
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              {/* Shield circle */}
              <motion.div {...hold.holdProps}
                animate={{ scale: hold.isHolding ? 0.97 : 1,
                  boxShadow: `0 0 ${10 + hold.tension * 25}px ${themeColor(TH.accentHSL, 0.05 + hold.tension * 0.1, 8)}` }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: `${shieldSize}px`, height: `${shieldSize}px`, borderRadius: '50%',
                  border: `2px solid ${themeColor(TH.accentHSL, 0.12 + hold.tension * 0.15, 8)}`,
                  background: themeColor(TH.accentHSL, 0.03 + hold.tension * 0.03, 3),
                  touchAction: 'none', cursor: 'pointer', userSelect: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.2, 10) }} />
              </motion.div>
              {/* External dot */}
              <motion.div animate={{ x: Math.cos(Date.now() / 500) * 5,
                y: -dotDist }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%',
                  background: dotPhase === 'approach' ? 'hsla(0, 35%, 45%, 0.4)' : themeColor(TH.primaryHSL, 0.2, 8) }} />
                {dotPhase === 'disappointment' && (
                  <div style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.25, 10), whiteSpace: 'nowrap' }}>
                    disappointed
                  </div>
                )}
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hold.isHolding ? `shield active... ${Math.round(hold.tension * 100)}%` : 'hold the shield'}
            </div>
          </motion.div>
        )}
        {stage === 'held' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '80px', height: '80px', borderRadius: '50%',
                border: `2px solid ${themeColor(TH.accentHSL, 0.2, 12)}`,
                background: themeColor(TH.accentHSL, 0.06, 6),
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.35, 15) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Their disappointment is not your responsibility. The forcefield held. You are impenetrable, not aggressive.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Rejection sensitivity override. Maintaining a boundary despite the other{"'"}s disappointment is the definition of self-trust. You do not need their approval to protect your space.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Held.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}