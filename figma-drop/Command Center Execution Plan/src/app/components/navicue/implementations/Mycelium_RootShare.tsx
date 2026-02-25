/**
 * MYCELIUM #4 — The Root Share
 * "The healthy tree sends sugar to the sick tree. Not pity. Survival."
 * INTERACTION: You are a tree. The camera pans underground. Your roots
 * touch another tree's roots. Hold to send resources — watch the flow
 * of sugar travel from your roots to theirs. The forest must stand.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Self-Compassion', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SHARE_DURATION = 6000;

export default function Mycelium_RootShare({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const tick = () => {
    const elapsed = Date.now() - startRef.current;
    const p = Math.min(1, elapsed / SHARE_DURATION);
    setProgress(p);
    if (p >= 1 && !completed) {
      setCompleted(true);
      setHolding(false);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleDown = () => {
    if (completed || stage !== 'active') return;
    setHolding(true);
    startRef.current = Date.now() - progress * SHARE_DURATION;
    rafRef.current = requestAnimationFrame(tick);
  };
  const handleUp = () => {
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const treeHealth = Math.min(1, progress * 1.5);

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Self-Compassion" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Going underground...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The healthy tree sends sugar to the sick tree. Not pity. Survival.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to share your roots</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={handleDown} onPointerUp={handleUp} onPointerLeave={handleUp}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: completed ? 'default' : 'pointer', userSelect: 'none', touchAction: 'none', width: '100%', maxWidth: '280px' }}>
            {/* Two trees above ground */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 20px' }}>
              {/* Your tree — healthy */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'hsla(120, 35%, 45%, 0.4)', marginBottom: '2px' }} />
                <div style={{ width: '4px', height: '20px', background: 'hsla(30, 25%, 35%, 0.4)' }} />
                <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4, marginTop: '2px' }}>you</div>
              </div>
              {/* Sick tree — greying then healing */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div animate={{ backgroundColor: `hsla(120, ${10 + treeHealth * 30}%, ${30 + treeHealth * 15}%, ${0.2 + treeHealth * 0.3})` }}
                  style={{ width: '24px', height: '24px', borderRadius: '50%', marginBottom: '2px', backgroundColor: 'rgba(0,0,0,0)' }} />
                <div style={{ width: '4px', height: '20px', background: 'hsla(30, 20%, 30%, 0.3)' }} />
                <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4, marginTop: '2px' }}>them</div>
              </div>
            </div>
            {/* Ground line */}
            <div style={{ width: '100%', height: '1px', background: 'hsla(30, 20%, 35%, 0.2)', margin: '4px 0' }} />
            {/* Underground root network */}
            <div style={{ width: '100%', height: '80px', position: 'relative', overflow: 'hidden' }}>
              {/* Root lines */}
              <svg width="100%" height="100%" viewBox="0 0 280 80" style={{ position: 'absolute', inset: 0 }}>
                {/* Your roots (left) */}
                <path d="M 60 0 C 60 30, 90 40, 140 50" fill="none" stroke="hsla(30, 25%, 40%, 0.2)" strokeWidth="2" />
                <path d="M 60 0 C 50 20, 70 45, 140 55" fill="none" stroke="hsla(30, 25%, 40%, 0.15)" strokeWidth="1.5" />
                {/* Their roots (right) */}
                <path d="M 220 0 C 220 30, 190 40, 140 50" fill="none" stroke="hsla(30, 20%, 35%, 0.15)" strokeWidth="2" />
                <path d="M 220 0 C 230 20, 210 45, 140 55" fill="none" stroke="hsla(30, 20%, 35%, 0.1)" strokeWidth="1.5" />
                {/* Sugar flow — animated dots */}
                {holding && [0, 1, 2, 3].map(i => (
                  <motion.circle key={i} r="3" fill={palette.accent}
                    initial={{ cx: 60 + i * 5, cy: 0 }}
                    animate={{ cx: [60 + i * 5, 100, 140, 180, 220 - i * 5], cy: [0, 25, 50, 35, 0] }}
                    transition={{ duration: 2, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                    opacity={0.5} />
                ))}
              </svg>
              {/* Connection point glow */}
              <motion.div animate={{ opacity: holding ? 0.3 : 0.05 }}
                style={{ position: 'absolute', left: '50%', top: '60%', transform: 'translate(-50%, -50%)', width: '30px', height: '30px', borderRadius: '50%', background: `radial-gradient(circle, ${palette.accent}, transparent)` }} />
            </div>
            {/* Progress */}
            <div style={{ width: '100%', height: '3px', background: palette.primaryFaint, borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', background: palette.accent, borderRadius: '2px', opacity: 0.5 }} />
            </div>
            <div style={{ ...navicueType.hint, color: holding ? palette.accent : palette.textFaint, fontSize: '11px', opacity: holding ? 0.6 : 0.3 }}>
              {completed ? 'the forest stands' : holding ? 'sharing...' : 'hold to send sugar through your roots'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The forest must stand.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Giving regulates your own roots. The act of sharing heals the giver.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Underground. Connected. Standing.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}