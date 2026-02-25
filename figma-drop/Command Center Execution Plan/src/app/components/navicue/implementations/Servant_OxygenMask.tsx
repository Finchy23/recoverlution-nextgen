/**
 * SERVANT #2 — The Oxygen Mask
 * "Self-care is not selfish; it is strategic. Breathe so you can help."
 * ARCHETYPE: Pattern A (Tap) — Try to help child first (blocked), then self
 * ENTRY: Scene-first — airplane cabin
 * STEALTH KBE: Prioritizing self in sequence = Strategic Self-Care (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'cabin' | 'blocked' | 'correct' | 'helped' | 'resonant' | 'afterglow';

export default function Servant_OxygenMask({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('cabin'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tryChild = () => {
    if (stage !== 'cabin') return;
    setStage('blocked');
  };

  const trySelf = () => {
    if (stage !== 'cabin' && stage !== 'blocked') return;
    console.log(`[KBE:B] OxygenMask strategicSelfCare=confirmed wellnessEqualsCapacity=true`);
    setStage('correct');
    t(() => setStage('helped'), 2500);
    t(() => setStage('resonant'), 6500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '10px', height: '16px', borderRadius: '5px 5px 2px 2px',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
              <div style={{ width: '8px', height: '12px', borderRadius: '4px 4px 2px 2px',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
            </motion.div>
        )}
        {(stage === 'cabin' || stage === 'blocked') && (
          <motion.div key="cab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {stage === 'blocked'
                ? 'Blocked. You can\'t help them if you can\'t breathe. Put yours on first.'
                : 'Masks fall. Who do you help first?'}
            </div>
            {/* Masks hanging */}
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
              {/* Self mask */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <svg width="24" height="30" viewBox="0 0 24 30">
                  <line x1="12" y1="0" x2="12" y2="10" stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="1" />
                  <ellipse cx="12" cy="20" rx="10" ry="8" fill={themeColor(TH.accentHSL, 0.06, 3)}
                    stroke={themeColor(TH.accentHSL, 0.1, 6)} strokeWidth="1" />
                </svg>
                <motion.div whileTap={{ scale: 0.9 }} onClick={trySelf}
                  style={{ padding: '6px 14px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.08, 4),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                  <span style={{ fontSize: '10px', color: themeColor(TH.accentHSL, 0.5, 14) }}>You</span>
                </motion.div>
              </div>
              {/* Child mask */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <svg width="20" height="26" viewBox="0 0 20 26">
                  <line x1="10" y1="0" x2="10" y2="8" stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="1" />
                  <ellipse cx="10" cy="17" rx="8" ry="7" fill={themeColor(TH.primaryHSL, 0.04, 2)}
                    stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="1" />
                </svg>
                <motion.div whileTap={{ scale: 0.9 }} onClick={tryChild}
                  animate={stage === 'blocked' ? { x: [-3, 3, -3, 3, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  style={{ padding: '6px 14px', borderRadius: radius.md, cursor: 'pointer',
                    background: stage === 'blocked' ? 'hsla(0, 12%, 20%, 0.04)' : themeColor(TH.primaryHSL, 0.04, 2),
                    border: `1px solid ${stage === 'blocked' ? 'hsla(0, 12%, 25%, 0.08)' : themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                  <span style={{ fontSize: '10px', color: palette.textFaint }}>Child</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'correct' && (
          <motion.div key="co" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), fontStyle: 'italic', textAlign: 'center' }}>
            Breathing. Good. Now you can help.
          </motion.div>
        )}
        {stage === 'helped' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Both breathing now. You cannot serve from an empty vessel. Self-care isn{"'"}t selfish — it{"'"}s strategic. Your capacity to help is directly proportional to your capacity to breathe.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Strategic self-care. Compassion fatigue research shows that helpers who don{"'"}t replenish themselves become less effective, more irritable, and eventually burn out. The airline metaphor isn{"'"}t a cliché — it{"'"}s physics. An unconscious helper helps no one. Wellness equals capacity. Put your mask on first. Breathe so you can help.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Breathing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}