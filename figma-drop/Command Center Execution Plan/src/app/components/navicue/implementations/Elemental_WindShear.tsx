/**
 * ELEMENTAL #3 — The Wind Shear
 * "Do not brace against the wind. Be the grass that bends."
 * INTERACTION: Procedural leaves/particles blowing violently across
 * the screen in a storm pattern. Tilt your device (or drag) to bend
 * with the wind. Resistance increases tension; yielding brings calm.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

interface Leaf { id: number; x: number; y: number; rot: number; size: number; speed: number; }

const BEND_DURATION = 8000;

export default function Elemental_WindShear({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bending, setBending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [windPhase, setWindPhase] = useState(0);
  const leafId = useRef(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => {
      setWindPhase(p => p + 0.05);
      setLeaves(prev => {
        const next = prev.map(l => ({
          ...l,
          x: l.x + l.speed * (1 + Math.sin(windPhase) * 0.5),
          y: l.y + Math.sin(l.id * 0.3 + windPhase) * 1.5 + 0.5,
          rot: l.rot + l.speed * 3,
        })).filter(l => l.x < 260 && l.y < 200);
        if (Math.random() > 0.4) {
          leafId.current++;
          next.push({
            id: leafId.current,
            x: -10 - Math.random() * 20,
            y: 20 + Math.random() * 140,
            rot: Math.random() * 360,
            size: 3 + Math.random() * 5,
            speed: 2 + Math.random() * 3,
          });
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const startBend = () => {
    if (bending || stage !== 'active') return;
    setBending(true);
    startRef.current = Date.now();
    const track = () => {
      const p = Math.min(1, (Date.now() - startRef.current) / BEND_DURATION);
      setProgress(p);
      if (p >= 1) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      } else {
        addTimer(() => requestAnimationFrame(track), 100);
      }
    };
    track();
  };

  const calm = bending ? progress : 0;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The wind rises...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Do not brace against the wind. Be the grass that bends.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to bend with the storm</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startBend}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: bending ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Storm field */}
            <div style={{ position: 'relative', width: '230px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(200, 15%, ${12 + calm * 8}%, 0.4)` }}>
              <svg width="100%" height="100%" viewBox="0 0 230 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Wind lines */}
                {[30, 60, 90, 120, 140].map((y, i) => (
                  <motion.line key={`w${i}`}
                    x1={0} y1={y + Math.sin(windPhase + i) * 5}
                    x2={230} y2={y + Math.sin(windPhase + i + 1) * 8}
                    stroke={`hsla(200, 15%, 45%, ${0.06 - calm * 0.03})`}
                    strokeWidth="0.5"
                  />
                ))}
                {/* Leaves */}
                {leaves.map(l => (
                  <g key={l.id} transform={`translate(${l.x}, ${l.y}) rotate(${l.rot})`}>
                    <ellipse rx={l.size} ry={l.size * 0.4}
                      fill={`hsla(${90 + l.id * 7 % 40}, ${25 + calm * 10}%, ${35 + calm * 10}%, ${0.3 - calm * 0.1})`}
                    />
                  </g>
                ))}
                {/* Grass blades at bottom — bending */}
                {Array.from({ length: 15 }, (_, i) => {
                  const bx = 15 + i * 15;
                  const bendAngle = bending ? 15 + Math.sin(windPhase + i * 0.5) * 10 * (1 - calm) : 25 + Math.sin(windPhase + i * 0.5) * 15;
                  return (
                    <line key={`g${i}`}
                      x1={bx} y1={170}
                      x2={bx + bendAngle} y2={170 - 20 - Math.random() * 5}
                      stroke={`hsla(100, 25%, ${30 + calm * 10}%, ${0.2 + calm * 0.15})`}
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            </div>
            {/* Calm indicator */}
            {bending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic', opacity: 0.4 }}>
                  {calm < 0.3 ? 'the storm rages...' : calm < 0.7 ? 'bending, yielding...' : 'the chaos is cleaning you.'}
                </div>
                <div style={{ width: '120px', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', background: 'hsla(120, 25%, 45%, 0.4)' }} />
                </div>
              </motion.div>
            )}
            {!bending && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>
                tap to yield to the wind
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The wind cleaned the tree. The chaos cleaned you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Parasympathetic engaged. Rest and digest. The storm passed through.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Bent. Not broken. Clean.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}