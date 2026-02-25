/**
 * DIPLOMAT #3 — The Perspective Swap
 * "Stand where they stood. See what they saw."
 * INTERACTION: Two windows side by side — yours and theirs. Tap to
 * toggle between perspectives. The same event looks different from
 * each side. The truth is somewhere in between.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const PAIRS = [
  { yours: 'They ignored me.', theirs: 'I was overwhelmed and shut down.' },
  { yours: 'They chose them over me.', theirs: 'I was trying not to lose everything.' },
  { yours: 'They didn\'t even try.', theirs: 'I tried in ways you couldn\'t see.' },
  { yours: 'They lied to me.', theirs: 'I was too ashamed to tell the truth.' },
];

export default function Diplomat_PerspectiveSwap({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pairIdx, setPairIdx] = useState(0);
  const [side, setSide] = useState<'yours' | 'theirs'>('yours');
  const [swapCount, setSwapCount] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSwap = () => {
    if (stage !== 'active') return;
    const newSide = side === 'yours' ? 'theirs' : 'yours';
    setSide(newSide);
    const newCount = swapCount + 1;
    setSwapCount(newCount);
    // After toggling both sides, advance to next pair
    if (newCount % 2 === 0 && newCount > 0) {
      const nextPair = pairIdx + 1;
      if (nextPair < PAIRS.length) {
        setPairIdx(nextPair);
        setSide('yours');
      } else {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  const pair = PAIRS[pairIdx];
  const progress = Math.floor(swapCount / 2);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two sides. One story.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stand where they stood.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to swap perspectives</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            {/* Perspective window */}
            <motion.button onClick={handleSwap}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '280px', padding: '28px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.md, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              {/* Side indicator */}
              <div style={{ ...navicueType.hint, color: palette.accent, marginBottom: '14px', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>
                {side === 'yours' ? 'your view' : 'their view'}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={`${pairIdx}-${side}`}
                  initial={{ opacity: 0, x: side === 'yours' ? -20 : 20 }}
                  animate={{ opacity: 0.7, x: 0 }}
                  exit={{ opacity: 0, x: side === 'yours' ? 20 : -20 }}
                  transition={{ duration: 0.5 }}
                  style={{ ...navicueType.texture, color: palette.text, fontSize: '14px', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.6 }}>
                  "{pair[side]}"
                </motion.div>
              </AnimatePresence>
              {/* Swap icon hint */}
              <motion.div animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ marginTop: '16px', ...navicueType.hint, color: palette.textFaint, fontSize: '18px' }}>
                ⇄
              </motion.div>
            </motion.button>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {progress} of {PAIRS.length} pairs seen
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The truth lives in neither window alone.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Understanding doesn't require agreement.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Both windows are real.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}