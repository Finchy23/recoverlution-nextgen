/**
 * SOURCE #3 — The Final Breath
 * "It was always you. You are the one you have been waiting for."
 * INTERACTION: The entire field breathes — expanding/contracting with
 * a soft rhythm. Each tap deepens the breath. At final exhale, everything
 * fades to pure luminous white. Welcome home.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BREATH_STEPS = 5;
const BREATH_LABELS = ['shallow', 'settling', 'deeper', 'still deeper', 'the final breath'];

export default function Source_FinalBreath({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [depth, setDepth] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    // Breathing rate slows as depth increases
    const speed = 0.018 - (depth / BREATH_STEPS) * 0.006;
    const tick = () => { setBreathPhase(p => p + speed); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage, depth]);

  const deepen = () => {
    if (stage !== 'active' || depth >= BREATH_STEPS) return;
    const next = depth + 1;
    setDepth(next);
    if (next >= BREATH_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = depth / BREATH_STEPS;
  const breath = Math.sin(breathPhase) * 0.5 + 0.5; // 0-1
  const fieldScale = 0.85 + breath * (0.15 + t * 0.15);
  const whiteness = t * 70 + breath * 10;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Breathe...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>It was always you. You are the one you have been waiting for. Welcome home.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to deepen the breath</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={deepen}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: depth >= BREATH_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <motion.div
              animate={{ scale: fieldScale }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-breathField`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(0, 0%, ${whiteness + 20}%, ${0.1 + t * 0.4 + breath * 0.1})`} />
                    <stop offset="50%" stopColor={`hsla(0, 0%, ${whiteness + 10}%, ${0.04 + t * 0.15 + breath * 0.04})`} />
                    <stop offset="100%" stopColor={`hsla(0, 0%, ${whiteness}%, ${t * 0.08})`} />
                  </radialGradient>
                </defs>
                <circle cx="95" cy="95" r="95" fill={`url(#${svgId}-breathField)`} />
                {/* Breath rings — concentric, expanding/contracting */}
                {Array.from({ length: 4 }, (_, i) => {
                  const baseR = 20 + i * 18;
                  const r = baseR + breath * (8 + t * 6);
                  return (
                    <circle key={i} cx="95" cy="95" r={r}
                      fill="none"
                      stroke={`hsla(0, 0%, ${50 + t * 30}%, ${(0.04 + breath * 0.03) * (1 - i * 0.15)})`}
                      strokeWidth={0.5 + t * 0.3}
                    />
                  );
                })}
                {/* Center — the breath itself */}
                <circle cx="95" cy="95" r={6 + breath * 4 + t * 4}
                  fill={`hsla(0, 0%, ${60 + t * 30}%, ${0.1 + breath * 0.1 + t * 0.2})`} />
                {/* Inhale/Exhale text */}
                <text x="95" y="95" textAnchor="middle" dominantBaseline="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, 0%, ${45 + t * 25}%, ${0.15 + breath * 0.1})`}>
                  {breath > 0.5 ? 'inhale' : 'exhale'}
                </text>
              </svg>
            </motion.div>
            <motion.div key={depth} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {BREATH_LABELS[Math.min(depth, BREATH_LABELS.length - 1)]}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BREATH_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < depth ? `hsla(0, 0%, ${50 + i * 8}%, 0.4)` : palette.primaryFaint, opacity: i < depth ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.5, duration: 2 }}
              style={{ ...navicueType.prompt, color: 'hsla(0, 0%, 65%, 0.6)' }}>
              The breath faded to white. It was always you. Welcome home.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 2.5, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}>
              Transcendence. The deepest parasympathetic activation. Safety at the cellular level.
            </motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ duration: 3.5 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Inhale. Exhale. Home.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}