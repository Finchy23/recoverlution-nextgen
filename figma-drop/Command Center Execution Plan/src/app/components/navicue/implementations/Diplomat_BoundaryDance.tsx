/**
 * DIPLOMAT #6 — The Boundary Dance
 * "Closeness without collapse. Distance without abandonment."
 * INTERACTION: Two circles on screen — you and them. Drag/tap to
 * find the right distance. Too close and they overlap (enmeshment).
 * Too far and you lose connection. Find the sweet spot.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const DISTANCES = [
  { gap: 0, label: 'Enmeshed. You disappear into them.', quality: 'too-close' },
  { gap: 20, label: 'Close, but suffocating.', quality: 'too-close' },
  { gap: 40, label: 'Warm. Present. Breathing room.', quality: 'right' },
  { gap: 60, label: 'Distance grows. Connection thins.', quality: 'too-far' },
  { gap: 80, label: 'Alone. Safe, but hollow.', quality: 'too-far' },
];

export default function Diplomat_BoundaryDance({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [distIdx, setDistIdx] = useState(0);
  const [found, setFound] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleAdjust = () => {
    if (stage !== 'active' || found) return;
    const next = distIdx + 1;
    if (next < DISTANCES.length) {
      setDistIdx(next);
      if (DISTANCES[next].quality === 'right') {
        setFound(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
      }
    } else {
      // Wrap back
      setDistIdx(0);
    }
  };

  const dist = DISTANCES[distIdx];
  const gap = dist.gap;
  const isRight = dist.quality === 'right';

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            How close is close enough?
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Closeness without collapse. Distance without abandonment.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to adjust the distance</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleAdjust}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: found ? 'default' : 'pointer' }}>
            {/* Two circles */}
            <div style={{ width: '260px', height: '140px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* You */}
              <motion.div
                animate={{ x: -(gap / 2) }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '60px', height: '60px', borderRadius: '50%', border: `1.5px solid ${isRight ? palette.accent : palette.primaryFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', boxShadow: isRight ? `0 0 16px ${palette.accentGlow}` : 'none', transition: 'box-shadow 0.8s' }}>
                <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>you</span>
              </motion.div>
              {/* Them */}
              <motion.div
                animate={{ x: gap / 2 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '60px', height: '60px', borderRadius: '50%', border: `1.5px solid ${isRight ? palette.accent : palette.primaryFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', boxShadow: isRight ? `0 0 16px ${palette.accentGlow}` : 'none', transition: 'box-shadow 0.8s' }}>
                <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>them</span>
              </motion.div>
              {/* Connection line */}
              {gap > 10 && (
                <motion.div animate={{ opacity: isRight ? 0.4 : 0.1, width: `${gap - 20}px` }}
                  style={{ position: 'absolute', height: '1px', background: isRight ? palette.accent : palette.primaryFaint }} />
              )}
            </div>
            {/* Distance label */}
            <motion.div key={distIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.6, y: 0 }}
              style={{ ...navicueType.texture, color: isRight ? palette.accent : palette.text, textAlign: 'center', maxWidth: '240px', fontSize: '12px', fontStyle: 'italic' }}>
              {dist.label}
            </motion.div>
            {!found && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                finding the right distance...
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Warm. Present. Room to breathe.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Boundaries aren't walls. They're membranes.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Close enough to feel. Far enough to be.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}