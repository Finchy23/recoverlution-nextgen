/**
 * WILDING #4 — The Terpene Inhale
 * "You trade breath with the trees."
 * INTERACTION: A forest canopy from below — branches radiate
 * outward. Each tap triggers a breath cycle: inhale (green
 * particles float down from canopy) → exhale (grey particles
 * rise up). 5 breath trades. NK cells activate.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BREATH_COUNT = 5;

interface Particle { id: number; x: number; startY: number; endY: number; type: 'in' | 'out'; hue: number; }

export default function Wilding_TerpeneInhale({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [breaths, setBreaths] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'exhale'>('idle');
  const pidRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const breathe = () => {
    if (stage !== 'active' || breaths >= BREATH_COUNT || phase !== 'idle') return;

    // Inhale phase — green particles fall
    setPhase('inhale');
    const inhalePs: Particle[] = Array.from({ length: 6 }, () => ({
      id: pidRef.current++,
      x: 50 + Math.random() * 120,
      startY: 15 + Math.random() * 20,
      endY: 120 + Math.random() * 20,
      type: 'in' as const,
      hue: 120 + Math.random() * 30,
    }));
    setParticles(prev => [...prev, ...inhalePs]);

    // Exhale phase
    addTimer(() => {
      setPhase('exhale');
      const exhalePs: Particle[] = Array.from({ length: 4 }, () => ({
        id: pidRef.current++,
        x: 80 + Math.random() * 60,
        startY: 130 + Math.random() * 15,
        endY: 20 + Math.random() * 20,
        type: 'out' as const,
        hue: 0,
      }));
      setParticles(prev => [...prev, ...exhalePs]);

      addTimer(() => {
        setPhase('idle');
        const next = breaths + 1;
        setBreaths(next);
        if (next >= BREATH_COUNT) {
          addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
        }
      }, 2000);
    }, 2500);
  };

  const t = breaths / BREATH_COUNT;

  // Branch positions — radiating from center top
  const branches = [
    { x1: 110, y1: 0, x2: 45, y2: 40 },
    { x1: 110, y1: 0, x2: 175, y2: 35 },
    { x1: 110, y1: 0, x2: 30, y2: 60 },
    { x1: 110, y1: 0, x2: 190, y2: 55 },
    { x1: 110, y1: 0, x2: 75, y2: 25 },
    { x1: 110, y1: 0, x2: 150, y2: 22 },
  ];

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Canopy overhead...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Breathe. The trees are releasing medicine. You trade breath with the trees. They want your carbon. You need their oxygen. It is a trade.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to breathe with the canopy</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={breathe}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: breaths >= BREATH_COUNT || phase !== 'idle' ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(140, ${6 + t * 6}%, ${6 + t * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Canopy dappled light */}
                <defs>
                  <radialGradient id={`${svgId}-canopyLight`} cx="50%" cy="10%">
                    <stop offset="0%" stopColor={`hsla(120, ${15 + t * 10}%, ${30 + t * 8}%, ${0.04 + t * 0.03})`} />
                    <stop offset="70%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="220" height="180" fill={`url(#${svgId}-canopyLight)`} />

                {/* Branches radiating from top center */}
                {branches.map((b, i) => (
                  <g key={i}>
                    <line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
                      stroke={`hsla(30, ${8 + i}%, ${18 + i * 2}%, ${0.05 + t * 0.02})`}
                      strokeWidth={1.2 - i * 0.1} strokeLinecap="round" />
                    {/* Leaf clusters at ends */}
                    <circle cx={b.x2} cy={b.y2} r={8 + i * 1.5}
                      fill={`hsla(${120 + i * 8}, ${12 + t * 8}%, ${22 + t * 6}%, ${0.04 + t * 0.02})`} />
                  </g>
                ))}

                {/* Leaf scatter */}
                {Array.from({ length: 10 }, (_, i) => (
                  <circle key={`leaf-${i}`}
                    cx={25 + (i * 19) % 180} cy={10 + (i * 13) % 55}
                    r={3 + (i % 3)}
                    fill={`hsla(${125 + i * 6}, ${10 + i}%, ${20 + i * 2}%, ${0.03 + t * 0.015})`} />
                ))}

                {/* Breath particles */}
                {particles.map(p => (
                  <motion.circle key={p.id}
                    cx={p.x} cy={p.startY}
                    r={p.type === 'in' ? 2.5 : 1.8}
                    fill={p.type === 'in'
                      ? `hsla(${p.hue}, 18%, 42%, 0.1)`
                      : 'hsla(0, 0%, 35%, 0.06)'}
                    initial={{ cy: p.startY, opacity: 0.1 }}
                    animate={{ cy: p.endY, opacity: 0 }}
                    transition={{ duration: 2.2, ease: 'easeOut' }}
                  />
                ))}

                {/* Central lungs icon */}
                <g opacity={0.06 + t * 0.04}>
                  <ellipse cx="100" cy="125" rx="10" ry="14"
                    fill="none" stroke={`hsla(140, 12%, 35%, ${0.06 + t * 0.03})`} strokeWidth="0.4" />
                  <ellipse cx="120" cy="125" rx="10" ry="14"
                    fill="none" stroke={`hsla(140, 12%, 35%, ${0.06 + t * 0.03})`} strokeWidth="0.4" />
                  <line x1="110" y1="108" x2="110" y2="125"
                    stroke={`hsla(140, 10%, 30%, ${0.05 + t * 0.03})`} strokeWidth="0.4" />
                </g>

                {/* Phase label */}
                <text x="110" y="168" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(140, ${10 + t * 8}%, ${28 + t * 8}%, ${0.06 + t * 0.04})`}>
                  {phase === 'inhale' ? 'inhale. terpenes.' : phase === 'exhale' ? 'exhale. carbon.' : `${breaths}/${BREATH_COUNT} trades`}
                </text>

                {/* NK cell readout */}
                {t > 0.3 && (
                  <text x="195" y="165" textAnchor="end" fontSize="11" fontFamily="monospace"
                    fill={`hsla(140, 10%, 35%, ${t * 0.06})`}>
                    NK +{Math.round(t * 40)}%
                  </text>
                )}

                {/* Complete */}
                {t >= 1 && (
                  <motion.text x="110" y="100" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(140, 18%, 45%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    TRADED
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={`${breaths}-${phase}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {breaths === 0 && phase === 'idle' ? 'Canopy above. Medicine in the air.' : phase === 'inhale' ? 'Terpenes falling. Inhaling the forest.' : phase === 'exhale' ? 'Carbon rising. Giving back.' : breaths < BREATH_COUNT ? `Trade ${breaths} complete.` : 'Five trades. The breath exchange is ancient.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BREATH_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < breaths ? 'hsla(140, 20%, 42%, 0.5)' : palette.primaryFaint, opacity: i < breaths ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five breath trades with the canopy. Terpenes down. Carbon up. You gave what the trees need. They gave what you need. The oldest partnership on earth.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Phytoncides. Trees release antimicrobial terpenes which, when inhaled, significantly increase natural killer cell activity and immune function. The forest is pharmacy. Breathe.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Canopy. Breathe. Trade.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}