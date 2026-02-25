/**
 * OUROBOROS #5 — The Circle Close
 * "Draw the circle. Walk the circumference. Arrive where you started."
 * INTERACTION: User taps 5 points on a circle's edge. As each point
 * connects to the next, a complete ring forms. The last point connects
 * to the first. You are where you began — changed.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const POINTS = Array.from({ length: 5 }, (_, i) => {
  const angle = (i / 5) * 360 - 90;
  const r = 50;
  return { x: 110 + r * Math.cos((angle * Math.PI) / 180), y: 90 + r * Math.sin((angle * Math.PI) / 180) };
});

export default function Ouroboros_CircleClose({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => { addTimer(() => setStage('present'), 1200); addTimer(() => setStage('active'), 3500); return () => { timersRef.current.forEach(clearTimeout); }; }, []);

  const place = () => {
    if (stage !== 'active' || placed >= 5) return;
    const next = placed + 1;
    setPlaced(next);
    if (next >= 5) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  const t = placed / 5;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (<motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The circumference waits...</motion.div>)}
        {stage === 'present' && (<motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Draw the circle. Walk the edge. Arrive where you started. You are the same coordinates but a different person. That is the teaching of the ouroboros: return is not repetition.</div><div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to place each point</div></motion.div>)}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={place}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: placed >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(38, ${6 + t * 8}%, ${5 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Guide circle */}
                <circle cx="110" cy="90" r="50" fill="none" stroke={`hsla(38, 8%, 25%, 0.02)`} strokeWidth="0.5" />
                {/* Placed points */}
                {POINTS.map((p, i) => i < placed && (
                  <motion.circle key={`pt-${i}`} cx={p.x} cy={p.y} r="3" fill={`hsla(38, ${18 + i * 4}%, ${40 + i * 4}%, ${0.08 + i * 0.02})`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, type: 'spring' }} />
                ))}
                {/* Connection arcs */}
                {placed >= 2 && Array.from({ length: placed - 1 }, (_, i) => (
                  <motion.line key={`arc-${i}`} x1={POINTS[i].x} y1={POINTS[i].y} x2={POINTS[i + 1].x} y2={POINTS[i + 1].y}
                    stroke={`hsla(38, ${15 + t * 10}%, ${35 + t * 10}%, ${0.05 + t * 0.03})`} strokeWidth="0.6"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
                ))}
                {/* Closing line — connects last to first */}
                {placed >= 5 && (
                  <motion.line x1={POINTS[4].x} y1={POINTS[4].y} x2={POINTS[0].x} y2={POINTS[0].y}
                    stroke={`hsla(38, 22%, 48%, 0.1)`} strokeWidth="0.8"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
                )}
                {/* Center glow on completion */}
                {placed >= 5 && (
                  <motion.circle cx="110" cy="90" r="15" fill={`hsla(38, 20%, 40%, 0.03)`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1, delay: 0.5 }} />
                )}
              </svg>
            </div>
            <motion.div key={placed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {placed === 0 ? 'Five points. One circle. One return.' : placed < 5 ? `Point ${placed}. The circumference grows.` : 'The last point meets the first. You have arrived.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>{Array.from({ length: 5 }, (_, i) => (<div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < placed ? 'hsla(38, 25%, 50%, 0.5)' : palette.primaryFaint, opacity: i < placed ? 0.6 : 0.15 }} />))}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (<motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Five points. The circle closed. T.S. Eliot wrote: "We shall not cease from exploration, and the end of all our exploring will be to arrive where we started and know the place for the first time."</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The hero's journey is a circle. Campbell mapped it. Every myth ends where it began. The treasure was always home, but you had to leave to see it.</motion.div></motion.div>)}
        {stage === 'afterglow' && (<motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>Started. Walked. Returned. Known.</motion.div>)}
      </AnimatePresence>
    </NaviCueShell>
  );
}