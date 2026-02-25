/**
 * CONSTRUCT #7 — The Lighthouse / The Beacon (Hope Theory)
 * "The storm will come. You cannot stop the storm. You can only keep the light burning."
 * ARCHETYPE: Pattern E (Hold) — Hold to light the lamp; beam cuts fog
 * ENTRY: Instruction-as-poetry — dark sea described before tower appears
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'lit' | 'resonant' | 'afterglow';

export default function Construct_Lighthouse({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 4000,
    onComplete: () => {
      setStage('lit');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const beamOpacity = stage === 'active' ? hold.tension * 0.4 : stage === 'lit' ? 0.5 : 0;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            a dark sea. fog everywhere. somewhere, a tower.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The storm will come. You cannot stop the storm. You can only keep the light burning. Tend the flame.
            </div>
            <div style={{ position: 'relative', width: '120px', height: '160px' }}>
              {/* Tower */}
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '24px', height: '100px', borderRadius: '3px 3px 0 0',
                background: themeColor(TH.primaryHSL, 0.2, 8) }} />
              {/* Lamp area */}
              <div {...hold.holdProps}
                style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                  width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06 + hold.tension * 0.2, 4 + hold.tension * 12),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08 + hold.tension * 0.12, 8)}`,
                  boxShadow: hold.tension > 0.1 ? `0 0 ${20 + hold.tension * 40}px ${themeColor(TH.accentHSL, hold.tension * 0.15, 10)}` : 'none',
                  ...hold.holdProps.style }} />
              {/* Beam */}
              {beamOpacity > 0 && (
                <motion.div animate={{ rotate: [-8, 8, -8] }} transition={{ duration: 6, repeat: Infinity }}
                  style={{ position: 'absolute', top: '28px', left: '50%', transformOrigin: 'center top',
                    width: `${40 + hold.tension * 80}px`, height: '2px', marginLeft: `${-(20 + hold.tension * 40)}px`,
                    background: `linear-gradient(90deg, transparent, ${themeColor(TH.accentHSL, beamOpacity, 15)}, transparent)` }} />
              )}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hold.isHolding ? 'hold the flame...' : 'hold to light'}
            </div>
          </motion.div>
        )}
        {stage === 'lit' && (
          <motion.div key="lit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', width: '120px', height: '160px' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '24px', height: '100px', borderRadius: '3px 3px 0 0',
                background: themeColor(TH.primaryHSL, 0.2, 8) }} />
              <motion.div animate={{ opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.25, 15),
                  boxShadow: `0 0 60px ${themeColor(TH.accentHSL, 0.15, 10)}` }} />
              <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity }}
                style={{ position: 'absolute', top: '28px', left: '50%', transformOrigin: 'center top',
                  width: '140px', height: '2px', marginLeft: '-70px',
                  background: `linear-gradient(90deg, transparent, ${themeColor(TH.accentHSL, 0.3, 15)}, transparent)` }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the beam cuts through</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Hope Theory. Hope requires both pathways and agency. Maintaining a symbol of agency {'\u2014'} the light {'\u2014'} increases resilience during storms. The beam is proof you chose to keep burning.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The light burns.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
