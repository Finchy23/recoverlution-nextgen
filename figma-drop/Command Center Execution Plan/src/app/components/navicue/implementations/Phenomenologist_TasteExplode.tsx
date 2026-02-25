/**
 * PHENOMENOLOGIST #4 — The Taste Explode
 * "Is it sharp? Round? Heavy? Map the sensation before the label."
 * INTERACTION: Macro-scale flavor burst visualization. Progressive
 * sensory mapping — user identifies qualities (sharp, round, heavy,
 * bright, deep) before naming. Decoupling taste from judgment.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const QUALITIES = [
  { name: 'sharp', color: 'hsla(50, 60%, 55%, 0.5)', shape: 'polygon', points: '100,30 115,70 85,70', prompt: 'Is it sharp?' },
  { name: 'round', color: 'hsla(25, 50%, 50%, 0.5)', shape: 'circle', prompt: 'Is it round?' },
  { name: 'heavy', color: 'hsla(15, 40%, 35%, 0.5)', shape: 'rect', prompt: 'Is it heavy?' },
  { name: 'bright', color: 'hsla(45, 70%, 60%, 0.5)', shape: 'star', prompt: 'Is it bright?' },
  { name: 'deep', color: 'hsla(280, 30%, 40%, 0.5)', shape: 'ellipse', prompt: 'Deep?' },
];

export default function Phenomenologist_TasteExplode({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [mapped, setMapped] = useState<number[]>([]);
  const [burstPhase, setBurstPhase] = useState(0);
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
    const tick = () => { setBurstPhase(p => p + 0.03); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const mapQuality = (idx: number) => {
    if (stage !== 'active' || mapped.includes(idx)) return;
    const next = [...mapped, idx];
    setMapped(next);
    if (next.length >= QUALITIES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const intensity = mapped.length / QUALITIES.length;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Taste buds waking...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Put something on your tongue. Do not swallow. Map the geography of the taste.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>map each quality before naming</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            {/* Flavor burst visualization */}
            <div style={{ position: 'relative', width: '200px', height: '140px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(15, 15%, 10%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Burst center */}
                <motion.circle cx="100" cy="70" r={15 + intensity * 20}
                  fill={`hsla(30, ${40 + intensity * 30}%, ${35 + intensity * 15}%, ${0.08 + intensity * 0.1})`}
                  animate={{ r: 15 + intensity * 20 + Math.sin(burstPhase) * 3 }}
                />
                {/* Flavor rays */}
                {mapped.map(idx => {
                  const q = QUALITIES[idx];
                  const angle = (idx / QUALITIES.length) * Math.PI * 2 - Math.PI / 2;
                  const endX = 100 + Math.cos(angle) * (35 + intensity * 20);
                  const endY = 70 + Math.sin(angle) * (35 + intensity * 20);
                  return (
                    <motion.line key={idx}
                      x1="100" y1="70" x2={endX} y2={endY}
                      stroke={q.color} strokeWidth="2" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                  );
                })}
                {/* Ambient particles */}
                {Array.from({ length: Math.floor(intensity * 12) }, (_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const dist = 25 + Math.sin(burstPhase + i) * 10 + intensity * 15;
                  return (
                    <circle key={`p${i}`}
                      cx={100 + Math.cos(angle + burstPhase * 0.3) * dist}
                      cy={70 + Math.sin(angle + burstPhase * 0.3) * dist}
                      r={1 + Math.random()}
                      fill={`hsla(30, 40%, 55%, ${0.1 + intensity * 0.1})`}
                    />
                  );
                })}
              </svg>
            </div>
            {/* Quality buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {QUALITIES.map((q, i) => (
                <motion.button key={i}
                  onClick={() => mapQuality(i)}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '12px 18px', borderRadius: radius.full, border: 'none', cursor: mapped.includes(i) ? 'default' : 'pointer',
                    background: mapped.includes(i) ? q.color : 'hsla(0, 0%, 20%, 0.2)',
                    color: mapped.includes(i) ? 'hsla(0, 0%, 95%, 0.7)' : palette.textFaint,
                    fontSize: '11px', fontStyle: 'italic', opacity: mapped.includes(i) ? 0.7 : 0.3,
                    transition: 'all 0.3s',
                  }}>
                  {q.name}
                </motion.button>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>
              {mapped.length < QUALITIES.length ? `map the sensation before the label` : 'mapped. before the word.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Sharp. Round. Heavy. Bright. Deep. You mapped the geography before the name.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Sensation decoupled from judgment. The tongue as cartographer. Pure data.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Tasted. Mapped. No label needed.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}