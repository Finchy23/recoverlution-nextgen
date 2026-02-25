/**
 * SOURCE #5 — The Infinite Loop
 * "Beginning and end are the same point."
 * INTERACTION: A Möbius strip rendered as a continuous figure-8 path.
 * A tracer dot moves along it. Each tap speeds the tracer. At full
 * speed, inside and outside become indistinguishable. No beginning,
 * no end.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SPEED_STEPS = 5;

export default function Source_InfiniteLoop({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [speed, setSpeed] = useState(0);
  const [traceT, setTraceT] = useState(0);
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
      const rate = 0.004 + (speed / SPEED_STEPS) * 0.012;
      setTraceT(p => (p + rate) % 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage, speed]);

  const accelerate = () => {
    if (stage !== 'active' || speed >= SPEED_STEPS) return;
    const next = speed + 1;
    setSpeed(next);
    if (next >= SPEED_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = speed / SPEED_STEPS;

  // Lemniscate (figure-8) parametric
  const lemniscate = (param: number) => {
    const a = param * Math.PI * 2;
    const denom = 1 + Math.sin(a) * Math.sin(a);
    const x = 105 + (Math.cos(a) / denom) * 55;
    const y = 85 + (Math.sin(a) * Math.cos(a) / denom) * 40;
    return { x, y };
  };

  // Build the path for SVG
  const pathPoints: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const { x, y } = lemniscate(i / 120);
    pathPoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const pathD = pathPoints.join(' ') + ' Z';

  const tracerPos = lemniscate(traceT);
  // Trail positions
  const trailCount = 8 + Math.floor(t * 12);

  const svgId = useId();

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A loop forms...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Beginning and end are the same point. You are always exactly where you need to be.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to accelerate the trace</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={accelerate}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: speed >= SPEED_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '210px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(270, 10%, 6%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 210 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Lemniscate path */}
                <path d={pathD} fill="none"
                  stroke={`hsla(270, 20%, ${35 + t * 15}%, ${0.1 + t * 0.1})`}
                  strokeWidth={0.8 + t * 0.4} strokeLinecap="round" />
                {/* Speed glow along path */}
                {t > 0.4 && (
                  <path d={pathD} fill="none"
                    stroke={`hsla(45, 30%, 50%, ${(t - 0.4) * 0.06})`}
                    strokeWidth={3 + t * 2} strokeLinecap="round"
                    filter={`url(#${svgId}-softBlur)`} />
                )}
                <defs>
                  <filter id={`${svgId}-softBlur`}><feGaussianBlur stdDeviation="3" /></filter>
                </defs>
                {/* Trail */}
                {Array.from({ length: trailCount }, (_, i) => {
                  const offset = (i + 1) / (trailCount + 1);
                  const p = lemniscate(((traceT - offset * 0.08) % 1 + 1) % 1);
                  const fade = 1 - offset;
                  return (
                    <circle key={i} cx={p.x} cy={p.y} r={2 * fade + 0.5}
                      fill={`hsla(${270 + t * 90}, ${25 + t * 15}%, ${40 + t * 15}%, ${(0.1 + t * 0.15) * fade})`} />
                  );
                })}
                {/* Tracer dot */}
                <circle cx={tracerPos.x} cy={tracerPos.y} r={3 + t * 1.5}
                  fill={`hsla(${270 + t * 90}, ${30 + t * 20}%, ${45 + t * 15}%, ${0.35 + t * 0.25})`} />
                <circle cx={tracerPos.x} cy={tracerPos.y} r={6 + t * 4}
                  fill={`hsla(${270 + t * 90}, 25%, 50%, ${0.04 + t * 0.04})`} />
                {/* ∞ symbol at center — appears at high speed */}
                {t > 0.6 && (
                  <motion.text x="105" y="90" textAnchor="middle" dominantBaseline="middle"
                    fontSize={14 + t * 8} fontWeight="100" fontFamily="serif"
                    fill={`hsla(270, 20%, 50%, ${(t - 0.6) * 0.25})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.25 }}>
                    ∞
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={speed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {speed === 0 ? 'A loop. Slow trace.' : speed < SPEED_STEPS ? `Faster... no inside, no outside.` : 'No beginning. No end. Just here.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SPEED_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < speed ? `hsla(270, 30%, ${45 + i * 5}%, 0.5)` : palette.primaryFaint, opacity: i < speed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>No inside. No outside. No beginning. No end. The loop is complete because it never started.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cyclical time perception. "Running out of time" dissolves. Patience arrives. You are always exactly where you need to be.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            ∞
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}