/**
 * MENDER #8 — The Guardrail Build
 * "Build the guardrails before you need them."
 * INTERACTION: An open road with no edges. Tap to place guardrails
 * along the path — each one a commitment you make while clear-headed.
 * The path doesn't narrow. It becomes navigable.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const GUARDRAILS = [
  { side: 'left', y: 15, label: 'When tired, I will pause before deciding.' },
  { side: 'right', y: 30, label: 'When triggered, I will breathe first.' },
  { side: 'left', y: 50, label: 'When lonely, I will reach out, not reach for.' },
  { side: 'right', y: 65, label: 'When doubting, I will reread my reasons.' },
  { side: 'left', y: 80, label: 'When lost, I will return to what I value.' },
];

export default function Mender_GuardrailBuild({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePlace = (i: number) => {
    if (stage !== 'active' || placed.includes(i)) return;
    // Must place in order
    if (i !== placed.length) return;
    const next = [...placed, i];
    setPlaced(next);
    if (next.length >= GUARDRAILS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The road ahead is open.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Build the guardrails while you're clear-headed.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each post to place it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Road with guardrails */}
            <div style={{ width: '260px', height: '280px', position: 'relative' }}>
              {/* Road center line */}
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: `linear-gradient(180deg, transparent, ${palette.primaryFaint}, transparent)`, opacity: 0.2 }} />
              {/* Guardrail posts */}
              {GUARDRAILS.map((rail, i) => {
                const isPlaced = placed.includes(i);
                const isNext = i === placed.length;
                const x = rail.side === 'left' ? '15%' : '85%';
                return (
                  <motion.button key={i}
                    onClick={() => handlePlace(i)}
                    animate={{ opacity: isPlaced ? 0.8 : isNext ? 0.35 : 0.1 }}
                    whileHover={isNext ? { scale: 1.1, opacity: 0.6 } : undefined}
                    style={{ position: 'absolute', left: x, top: `${rail.y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: rail.side === 'left' ? 'flex-start' : 'flex-end', gap: '4px', background: 'none', border: 'none', cursor: isNext ? 'pointer' : 'default', padding: 0, maxWidth: '100px' }}>
                    {/* Post */}
                    <div style={{ width: '4px', height: isPlaced ? '20px' : '10px', borderRadius: '2px', background: isPlaced ? palette.accent : palette.primaryFaint, transition: 'all 0.6s', boxShadow: isPlaced ? `0 0 8px ${palette.accentGlow}` : 'none' }} />
                    {isPlaced && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.5, y: 0 }} transition={{ duration: 0.8 }}
                        style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '9px', lineHeight: 1.3, textAlign: rail.side === 'left' ? 'left' : 'right' }}>
                        {rail.label}
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
              {/* Connecting rail lines */}
              {placed.length > 1 && placed.map((_, i) => {
                if (i === 0) return null;
                const prev = GUARDRAILS[placed[i - 1]];
                const curr = GUARDRAILS[placed[i]];
                return (
                  <motion.div key={`line-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}
                    style={{ position: 'absolute', left: prev.side === 'left' ? '15%' : '85%', top: `${prev.y}%`, width: '1px', height: `${curr.y - prev.y}%`, background: palette.accent }} />
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {placed.length} of {GUARDRAILS.length} guardrails placed
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The path doesn't narrow. It becomes navigable.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Build when clear. Trust when clouded.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The guardrails hold. Even when you forget you built them.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}