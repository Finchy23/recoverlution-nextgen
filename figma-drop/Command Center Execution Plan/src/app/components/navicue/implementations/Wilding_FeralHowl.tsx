/**
 * WILDING #10 — The Feral Howl
 * "Release the animal sound. Vagal toning through vocalization."
 * INTERACTION: A primal waveform builds as user holds a button.
 * 5 holds of increasing duration. The waveform grows wilder,
 * more jagged. Vagal tone visualization shows the nerve lighting up.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const HOWL_COUNT = 5;
const HOLD_DURATION = 2000;

export default function Wilding_FeralHowl({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [howls, setHowls] = useState(0);
  const [holding, setHolding] = useState(false);
  const [holdProg, setHoldProg] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (!holding || stage !== 'active') return;
    startRef.current = performance.now();
    const tick = () => {
      const el = performance.now() - startRef.current;
      const prog = Math.min(el / HOLD_DURATION, 1);
      setHoldProg(prog);
      if (prog >= 1) {
        setHolding(false);
        const next = howls + 1;
        setHowls(next);
        setHoldProg(0);
        if (next >= HOWL_COUNT) {
          addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
        }
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [holding]);

  const t = howls / HOWL_COUNT;
  const wildness = holding ? holdProg : 0;

  // Generate waveform path — gets wilder with more howls
  const wavePath = (() => {
    const points: string[] = ['M 10,90'];
    for (let x = 10; x <= 210; x += 3) {
      const base = Math.sin(x * 0.08) * 15;
      const chaos = Math.sin(x * 0.15 + howls * 2) * (8 + t * 20) * wildness;
      const y = 90 + base + chaos + (Math.sin(x * 0.3 + howls) * 5 * t);
      points.push(`L ${x},${y}`);
    }
    return points.join(' ');
  })();

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something ancient stirs...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The primal scream is not chaos. It is vagal toning. The longest cranial nerve, from brainstem to gut, responds to deep vocalization. The animal sound resets the human system.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to release each howl</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(25, ${8 + t * 10}%, ${6 + wildness * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Waveform */}
                <motion.path d={wavePath} fill="none"
                  stroke={`hsla(25, ${20 + wildness * 20}%, ${40 + wildness * 20}%, ${0.06 + wildness * 0.1 + t * 0.04})`}
                  strokeWidth={0.8 + wildness * 1.2}
                  strokeLinecap="round"
                />
                {/* Vagus nerve visualization — lights up with howls */}
                {howls > 0 && (
                  <motion.path
                    d="M 110,20 C 108,40 112,55 110,70 C 108,85 106,100 110,120 C 112,135 108,150 110,165"
                    fill="none"
                    stroke={`hsla(35, ${18 + t * 15}%, ${35 + t * 15}%, ${t * 0.08})`}
                    strokeWidth={0.5 + t * 0.8}
                    strokeLinecap="round"
                    strokeDasharray="4 6"
                    initial={{ pathLength: 0 }} animate={{ pathLength: t }}
                    transition={{ duration: 0.8 }}
                  />
                )}
                {/* Howl counter */}
                <text x="110" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(25, 12%, 40%, ${0.06 + t * 0.04})`} letterSpacing="1.5">
                  {howls}/{HOWL_COUNT} RELEASED
                </text>
              </svg>
            </div>
            <button
              onPointerDown={() => { if (howls < HOWL_COUNT) setHolding(true); }}
              onPointerUp={() => { setHolding(false); setHoldProg(0); }}
              onPointerLeave={() => { setHolding(false); setHoldProg(0); }}
              style={{ padding: '8px 24px', borderRadius: radius.sm, border: 'none', cursor: 'pointer',
                background: holding ? `hsla(25, 22%, 25%, 0.3)` : `hsla(25, 12%, 18%, 0.15)`,
                color: palette.text, fontSize: '11px', fontFamily: 'monospace', letterSpacing: '1px', transition: 'background 0.3s' }}>
              {holding ? 'howling...' : `howl ${howls + 1}`}
            </button>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: HOWL_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < howls ? 'hsla(25, 28%, 55%, 0.5)' : palette.primaryFaint,
                  opacity: i < howls ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five howls. The vagus nerve lit up from brainstem to belly. Deep vocalization, humming, chanting, screaming, stimulates the longest nerve in the body, downregulating the sympathetic threat response.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Polyvagal theory: the vagus nerve is the body's braking system. Vocalization at low frequencies (humming, chanting) increases vagal tone. Wolves howl to co-regulate. So do you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Wild. Released. Reset.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}