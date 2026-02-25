/**
 * ADAPTIVE #5 -- The Shock Absorber
 * "Too rigid = crash. Too soft = bounce. Find the middle."
 * ARCHETYPE: Pattern B (Drag) -- Drag stiffness slider to the sweet spot
 * ENTRY: Scene-first -- car suspension test
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'active' | 'calibrated' | 'resonant' | 'afterglow';

export default function Adaptive_ShockAbsorber({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {}, // Not using auto-complete; we check manually
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const inMiddle = drag.progress > 0.4 && drag.progress < 0.6;

  const calibrate = () => {
    if (stage !== 'active' || !inMiddle) return;
    console.log(`[KBE:E] ShockAbsorber stiffness=${Math.round(drag.progress * 100)} bodyAwareness=confirmed`);
    setStage('calibrated');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const zone = drag.progress < 0.3 ? 'too soft' : drag.progress > 0.7 ? 'too stiff' : inMiddle ? 'smooth' : 'close...';
  const zoneColor = inMiddle ? themeColor(TH.accentHSL, 0.35, 10) : palette.textFaint;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ y: [0, -3, 2, -1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ width: '40px', height: '20px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.08, 5) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Adjust the stiffness. Find the sweet spot.
            </div>
            <motion.div animate={{ y: drag.progress < 0.3 ? [0, -8, 6, -4, 0] : drag.progress > 0.7 ? [0, -1, 0] : [0, -2, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ width: '50px', height: '24px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '200px' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>SOFT</span>
              <div ref={drag.containerRef} style={{ flex: 1, height: '12px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                touchAction: 'none', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '40%', width: '20%', height: '100%', borderRadius: radius.sm,
                  background: themeColor(TH.accentHSL, 0.06, 4) }} />
                <motion.div {...drag.dragProps}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                    background: inMiddle ? themeColor(TH.accentHSL, 0.2, 10) : themeColor(TH.primaryHSL, 0.1, 6),
                    border: `1px solid ${inMiddle ? themeColor(TH.accentHSL, 0.25, 12) : themeColor(TH.primaryHSL, 0.12, 8)}`,
                    position: 'absolute', top: '-12px', left: '3px' }} />
              </div>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>STIFF</span>
            </div>
            <div style={{ ...navicueType.hint, color: zoneColor }}>{zone}</div>
            {inMiddle && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                whileTap={{ scale: 0.95 }} onClick={calibrate}
                style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Lock it</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'calibrated' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Calibrated. The bumps still come, but the ride is smooth. Not rigid, not limp. Resilient.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Body awareness. Too rigid and you feel every bump, you crack. Too soft and you bounce helplessly. The sweet spot is resilience: absorbing impact without breaking. Soften your knees.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Calibrated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}