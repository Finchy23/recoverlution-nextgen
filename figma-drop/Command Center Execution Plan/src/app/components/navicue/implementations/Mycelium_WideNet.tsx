/**
 * MYCELIUM #7 — The Wide Net
 * "The net catches you when you fall. But you must weave it before you fall."
 * INTERACTION: A fishing net with a hole. Tap to weave knots — each knot
 * is a person you'd call at 3 AM. The hole closes as you name them.
 * Build your safety net before you need it.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart(
  'poetic_precision',
  'Values Clarification',
  'embodying',
  'Hearth'
);
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const KNOT_POSITIONS = [
  { x: 30, y: 30 }, { x: 50, y: 20 }, { x: 70, y: 35 },
  { x: 40, y: 55 }, { x: 60, y: 50 }, { x: 50, y: 70 },
];

export default function Mycelium_WideNet({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [knots, setKnots] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const addKnot = () => {
    if (!input.trim() || stage !== 'active' || knots.length >= KNOT_POSITIONS.length) return;
    const next = [...knots, input.trim()];
    setKnots(next);
    setInput('');
    if (next.length >= KNOT_POSITIONS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    }
  };

  const holeSize = 1 - knots.length / KNOT_POSITIONS.length;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Values Clarification" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The net has a hole.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Who would you call at 3 AM?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>weave the net before you fall</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px' }}>
            {/* Net visualization */}
            <div style={{ position: 'relative', width: '200px', height: '160px', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.md, overflow: 'hidden' }}>
              {/* Grid lines (the net) */}
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Horizontal threads */}
                {[25, 50, 75, 100, 125].map(y => (
                  <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke={palette.primaryFaint} strokeWidth="0.5" opacity={0.3} />
                ))}
                {/* Vertical threads */}
                {[30, 60, 90, 120, 150, 170].map(x => (
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="160" stroke={palette.primaryFaint} strokeWidth="0.5" opacity={0.3} />
                ))}
                {/* The hole — shrinks as knots added */}
                <motion.ellipse cx="100" cy="80" fill="rgba(0,0,0,0.3)"
                  initial={{ rx: 40, ry: 30, opacity: 0.4 }}
                  animate={{ rx: holeSize * 40, ry: holeSize * 30, opacity: holeSize * 0.4 }}
                  transition={{ duration: 0.6 }} />
              </svg>
              {/* Knot positions */}
              {KNOT_POSITIONS.map((pos, i) => {
                const filled = i < knots.length;
                return (
                  <motion.div key={i}
                    animate={{ opacity: filled ? 0.7 : 0.1, scale: filled ? 1 : 0.5 }}
                    style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: filled ? palette.accent : palette.primaryFaint, boxShadow: filled ? `0 0 8px ${palette.accentGlow}` : 'none' }} />
                    {filled && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                        style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', ...navicueType.hint, color: palette.text, fontSize: '11px' }}>
                        {knots[i]}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            {/* Input */}
            {knots.length < KNOT_POSITIONS.length && (
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addKnot()}
                  placeholder="a name, any name..."
                  style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.sm, color: palette.text, fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}
                />
                <motion.button onClick={addKnot} whileHover={{ scale: 1.05 }}
                  style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.accent}`, borderRadius: radius.sm, color: palette.accent, fontSize: '11px', cursor: 'pointer' }}>
                  knot
                </motion.button>
              </div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{knots.length} of {KNOT_POSITIONS.length} knots woven</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The hole is closed. The net holds.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Weave the net before you fall. It catches you in the dark.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The net holds. You are held.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}