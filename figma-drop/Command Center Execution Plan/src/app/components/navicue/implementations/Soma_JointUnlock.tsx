/**
 * SOMA #5 — The Joint Unlock
 * "Frozen joints store frozen decisions."
 * ARCHETYPE: Pattern B (Drag) — Drag to unlock frozen joints one by one
 * ENTRY: Reverse Reveal — starts with "you're loose" then rewinds to locked
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

const JOINTS = ['neck', 'shoulders', 'wrists', 'spine', 'hips', 'ankles'];

export default function Soma_JointUnlock({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const p = drag.progress;
  const jointIdx = Math.min(JOINTS.length - 1, Math.floor(p * JOINTS.length));

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 2.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', opacity: 0.4 }}>You{'\u2019'}re loose.</div>
            <motion.div initial={{ opacity: 0.3 }} animate={{ opacity: 0 }} transition={{ delay: 1, duration: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>wait; not yet</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Frozen joints store frozen decisions. Drag to unlock them one by one. Feel each click of release.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {JOINTS.map((j, i) => (
                <motion.div key={j}
                  animate={{
                    opacity: i <= jointIdx ? 0.6 : 0.1,
                    borderRadius: i <= jointIdx ? '50%' : '4px',
                  }}
                  style={{
                    width: '20px', height: '20px',
                    background: themeColor(TH.accentHSL, i <= jointIdx ? 0.12 : 0.04, 5),
                    transition: 'all 0.4s',
                  }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>{JOINTS[jointIdx]}</div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
            }}>
              <motion.div style={{
                position: 'absolute', left: `${10 + p * 150}px`, top: '4px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1 + p * 0.08, 6),
                pointerEvents: 'none',
              }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Fascial adhesion. Joints that don{'\u2019'}t move develop fascial restrictions: connective tissue literally glues together. The metaphor is physical; stiffness in the body mirrors rigidity in thinking. Unlock one, and the other follows.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Unlocked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}