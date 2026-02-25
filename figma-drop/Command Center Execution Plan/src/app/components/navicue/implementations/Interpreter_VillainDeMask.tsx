/**
 * INTERPRETER #2 — The Villain De-Mask (Attribution Shift)
 * "When they rage, they are wearing the mask. When they hurt, they are the child."
 * ARCHETYPE: Pattern B (Drag) — Drag/swipe up to lift the mask, down to replace
 * ENTRY: Scene-first — scary mask appears before instruction
 * STEALTH KBE: Which view user leaves active = Attribution shift (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'mask' | 'active' | 'revealed' | 'resonant' | 'afterglow';

export default function Interpreter_VillainDeMask({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('mask');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ finalView: 'mask' as 'mask' | 'child' });

  const drag = useDragInteraction({
    axis: 'y',
    onComplete: () => {
      kbe.current.finalView = 'child';
      console.log(`[KBE:B] VillainDeMask finalView=child attributionShift=wounded`);
      setStage('revealed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const maskLift = drag.progress;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'mask' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            {/* Scary mask */}
            <div style={{ width: '90px', height: '110px', borderRadius: `${radius.full} ${radius.full} ${radius['3xl']} ${radius['3xl']}`,
              background: themeColor(TH.primaryHSL, 0.12, 4),
              border: `2px solid ${themeColor(TH.primaryHSL, 0.15, 8)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '12px', height: '6px', borderRadius: '2px',
                  background: themeColor(TH.accentHSL, 0.2, -5), transform: 'rotate(-10deg)' }} />
                <div style={{ width: '12px', height: '6px', borderRadius: '2px',
                  background: themeColor(TH.accentHSL, 0.2, -5), transform: 'rotate(10deg)' }} />
              </div>
              <div style={{ width: '20px', height: '8px', borderRadius: '0 0 10px 10px',
                background: themeColor(TH.primaryHSL, 0.2, -5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              When they rage, they are wearing the mask. When they hurt, they are the child. Who are you talking to?
            </div>
            {/* Mask lifting to reveal child */}
            <div {...drag.dragProps}
              style={{ width: '100px', height: '130px', position: 'relative', touchAction: 'none', cursor: 'grab' }}>
              {/* Child underneath */}
              <motion.div
                animate={{ opacity: maskLift }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '70px', height: '85px', borderRadius: '35px 35px 25px 25px',
                  background: themeColor(TH.accentHSL, 0.08, 8),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                      background: themeColor(TH.accentHSL, 0.2, 10) }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                      background: themeColor(TH.accentHSL, 0.2, 10) }} />
                  </div>
                  {/* Tear */}
                  <div style={{ width: '3px', height: '6px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.15, 15), marginLeft: '12px', marginTop: '-4px' }} />
                  <div style={{ width: '12px', height: '4px', borderRadius: '2px',
                    background: themeColor(TH.accentHSL, 0.1, 8) }} />
                </div>
              </motion.div>
              {/* Mask overlay lifting */}
              <motion.div
                animate={{ y: -maskLift * 60, opacity: 1 - maskLift * 0.8 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '90px', height: '110px', borderRadius: `${radius.full} ${radius.full} ${radius['3xl']} ${radius['3xl']}`,
                  background: themeColor(TH.primaryHSL, 0.12, 4),
                  border: `2px solid ${themeColor(TH.primaryHSL, 0.15, 8)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ width: '12px', height: '6px', borderRadius: '2px',
                      background: themeColor(TH.accentHSL, 0.2, -5), transform: 'rotate(-10deg)' }} />
                    <div style={{ width: '12px', height: '6px', borderRadius: '2px',
                      background: themeColor(TH.accentHSL, 0.2, -5), transform: 'rotate(10deg)' }} />
                  </div>
                  <div style={{ width: '20px', height: '8px', borderRadius: '0 0 10px 10px',
                    background: themeColor(TH.primaryHSL, 0.2, -5) }} />
                </div>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag up to lift the mask</div>
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '70px', height: '85px', borderRadius: '35px 35px 25px 25px',
              background: themeColor(TH.accentHSL, 0.08, 8),
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 10)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.25, 10) }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.25, 10) }} />
              </div>
              <div style={{ width: '3px', height: '6px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.2, 15), marginLeft: '12px', marginTop: '-4px' }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>not a villain. a child.</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Attribution theory. We default to dispositional explanations for others{'\u2019'} behavior {'\u2014'} "they are bad." Lifting the mask reveals situational causation {'\u2014'} "they are hurt." This shift from malice to wound is the foundation of compassion.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Unmasked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}