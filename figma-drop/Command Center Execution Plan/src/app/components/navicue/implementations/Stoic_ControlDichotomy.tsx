/**
 * STOIC #5 — The Control Dichotomy
 * "Some things are up to us. Some things are not. Know the difference."
 * INTERACTION: Two concentric circles: inner "My Choice", outer "The World".
 * Worry items orbit the outer ring. Tap one to try dragging it in —
 * controllable items snap to the inner ring; uncontrollable ones bounce
 * off. The boundary is the lesson.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

interface Worry {
  label: string;
  controllable: boolean;
  angle: number;
  tested: boolean;
  accepted: boolean;
}

const INITIAL_WORRIES: Worry[] = [
  { label: 'my effort', controllable: true, angle: 0, tested: false, accepted: false },
  { label: 'weather', controllable: false, angle: Math.PI * 0.4, tested: false, accepted: false },
  { label: 'my words', controllable: true, angle: Math.PI * 0.8, tested: false, accepted: false },
  { label: 'others\' opinion', controllable: false, angle: Math.PI * 1.2, tested: false, accepted: false },
  { label: 'my focus', controllable: true, angle: Math.PI * 1.6, tested: false, accepted: false },
];

export default function Stoic_ControlDichotomy({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [worries, setWorries] = useState(INITIAL_WORRIES);
  const [bounceIdx, setBounceIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const testWorry = (idx: number) => {
    if (stage !== 'active') return;
    const w = worries[idx];
    if (w.tested) return;
    const updated = [...worries];
    updated[idx] = { ...w, tested: true, accepted: w.controllable };
    setWorries(updated);
    if (!w.controllable) {
      setBounceIdx(idx);
      addTimer(() => setBounceIdx(null), 800);
    }
    const allTested = updated.every(x => x.tested);
    if (allTested) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
    }
  };

  const tested = worries.filter(w => w.tested).length;
  const t = tested / worries.length;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two circles form...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Some things are up to us. Some things are not. Know the difference. Ignore the rest.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each worry to test the boundary</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '210px', height: '210px', borderRadius: '50%', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 210 210" style={{ position: 'absolute', inset: 0 }}>
                {/* Outer circle — The World */}
                <circle cx="105" cy="105" r="95" fill="none"
                  stroke="hsla(0, 0%, 25%, 0.1)" strokeWidth="0.8" strokeDasharray="3 3" />
                {/* Inner circle — My Choice */}
                <circle cx="105" cy="105" r="40" fill="hsla(140, 12%, 15%, 0.04)"
                  stroke={`hsla(140, 18%, 35%, ${0.12 + t * 0.1})`} strokeWidth="1" />
                {/* Labels */}
                <text x="105" y="108" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill="hsla(140, 15%, 38%, 0.18)">my choice</text>
                <text x="105" y="198" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill="hsla(0, 0%, 30%, 0.1)">the world</text>

                {/* Worry items */}
                {worries.map((w, i) => {
                  const outerDist = 68;
                  const innerDist = 22;
                  const isBouncing = bounceIdx === i;
                  const dist = w.tested ? (w.controllable ? innerDist : outerDist + (isBouncing ? 8 : 0)) : outerDist;
                  const x = 105 + Math.cos(w.angle) * dist;
                  const y = 105 + Math.sin(w.angle) * dist;
                  const isAccepted = w.tested && w.controllable;
                  const isRejected = w.tested && !w.controllable;
                  return (
                    <motion.g key={i}
                      onClick={(e) => { e.stopPropagation(); testWorry(i); }}
                      style={{ cursor: w.tested ? 'default' : 'pointer' }}
                      animate={{
                        x: x - 105,
                        y: y - 105,
                      }}
                      transition={{ type: 'spring', stiffness: isBouncing ? 300 : 80, damping: isBouncing ? 8 : 15 }}>
                      {/* Worry bubble */}
                      <circle cx="105" cy="105" r={14}
                        fill={isAccepted ? 'hsla(140, 15%, 22%, 0.08)' : isRejected ? 'hsla(0, 10%, 18%, 0.04)' : 'hsla(30, 8%, 18%, 0.06)'}
                        stroke={isAccepted ? 'hsla(140, 18%, 35%, 0.15)' : isRejected ? 'hsla(0, 12%, 30%, 0.08)' : 'hsla(30, 8%, 30%, 0.1)'}
                        strokeWidth="0.5"
                      />
                      <text x="105" y="104" textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={isAccepted ? 'hsla(140, 18%, 40%, 0.35)' : isRejected ? 'hsla(0, 8%, 30%, 0.15)' : 'hsla(30, 8%, 40%, 0.25)'}>
                        {w.label}
                      </text>
                      {isRejected && (
                        <text x="105" y="112" textAnchor="middle" fontSize="11" fontFamily="monospace"
                          fill="hsla(0, 10%, 35%, 0.12)">bounced</text>
                      )}
                      {isAccepted && (
                        <text x="105" y="112" textAnchor="middle" fontSize="11" fontFamily="monospace"
                          fill="hsla(140, 15%, 38%, 0.2)">yours</text>
                      )}
                    </motion.g>
                  );
                })}
              </svg>
            </div>
            <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
              {tested === 0 ? 'Five worries orbit. Test each one.' : tested < worries.length ? `${tested} tested. ${worries.length - tested} remain.` : 'Sorted. Control what you can.'}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {worries.map((w, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: w.tested ? (w.controllable ? 'hsla(140, 20%, 40%, 0.5)' : 'hsla(0, 10%, 30%, 0.3)') : palette.primaryFaint,
                  opacity: w.tested ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>My effort, my words, my focus: inside the circle. Weather, others' opinions, bounced off. Know the difference. Ignore the rest.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Locus of control. Focusing only on what can be controlled reduces helplessness and anxiety. The Serenity Prayer, rendered as physics.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Mine. Not mine. Peace.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}