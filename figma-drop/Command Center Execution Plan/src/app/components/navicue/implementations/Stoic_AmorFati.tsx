/**
 * STOIC #9 — The Amor Fati (Love Fate)
 * "Do not just bear what is necessary. Love it. Burn bright."
 * INTERACTION: A piece of paper (a worry, a circumstance). Each tap
 * feeds it to the fire. The fire grows brighter and stronger with
 * every piece. Fuel, not burden. Your life burns bright.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FEED_STEPS = 5;
const PAPERS = ['a regret', 'a fear', 'a setback', 'a betrayal', 'a loss'];

export default function Stoic_AmorFati({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [fed, setFed] = useState(0);
  const [flamePhase, setFlamePhase] = useState(0);
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
    const tick = () => { setFlamePhase(p => p + 0.05); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const feed = () => {
    if (stage !== 'active' || fed >= FEED_STEPS) return;
    const next = fed + 1;
    setFed(next);
    if (next >= FEED_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = fed / FEED_STEPS;
  // Fire grows with each feeding
  const fireHeight = 30 + t * 50;
  const fireWidth = 20 + t * 25;
  const brightness = 35 + t * 25;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A flame flickers...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Do not just bear what is necessary. Love it. This fire is your life. Burn bright.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to feed each burden to the flame</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={feed}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: fed >= FEED_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(15, ${8 + t * 8}%, ${6 + t * 2}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Fire glow — radial */}
                <defs>
                  <radialGradient id={`${svgId}-fireGlow`} cx="50%" cy="70%">
                    <stop offset="0%" stopColor={`hsla(25, ${30 + t * 25}%, ${brightness}%, ${0.06 + t * 0.12})`} />
                    <stop offset="60%" stopColor={`hsla(15, ${15 + t * 10}%, ${20 + t * 8}%, ${t * 0.04})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="200" height="180" fill={`url(#${svgId}-fireGlow)`} />

                {/* Flame shapes — organic, flickering */}
                {Array.from({ length: 3 + Math.floor(t * 4) }, (_, i) => {
                  const cx = 100 + (i - 1.5) * (fireWidth * 0.3);
                  const baseY = 145;
                  const flicker = Math.sin(flamePhase * (1.5 + i * 0.3) + i * 1.2) * 4;
                  const h = (fireHeight * (0.5 + (i === 1 ? 0.5 : 0.3))) + flicker;
                  const w = fireWidth * (0.3 + Math.abs(Math.sin(flamePhase + i)) * 0.15);
                  const hue = 20 + i * 8 + Math.sin(flamePhase + i) * 5;
                  return (
                    <path key={i}
                      d={`M ${cx - w} ${baseY} Q ${cx - w * 0.5} ${baseY - h * 0.6}, ${cx} ${baseY - h} Q ${cx + w * 0.5} ${baseY - h * 0.6}, ${cx + w} ${baseY}`}
                      fill={`hsla(${hue}, ${35 + t * 20}%, ${brightness - 5 + i * 3}%, ${(0.08 + t * 0.08) / (i * 0.2 + 1)})`}
                    />
                  );
                })}

                {/* Paper being fed — next one waiting */}
                {fed < FEED_STEPS && (
                  <motion.g
                    key={`paper-${fed}`}
                    initial={{ opacity: 0.6, y: -10 }}
                    animate={{ opacity: 0.25, y: 0 }}
                    transition={{ duration: 0.5 }}>
                    <rect x="80" y="20" width="40" height="28" rx="2"
                      fill="hsla(40, 15%, 30%, 0.08)"
                      stroke="hsla(40, 10%, 35%, 0.15)" strokeWidth="0.3" />
                    <text x="100" y="37" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(40, 10%, 40%, 0.15)">
                      {PAPERS[fed]}
                    </text>
                    {/* Arrow indicating feed direction */}
                    <line x1="100" y1="50" x2="100" y2="65"
                      stroke="hsla(30, 10%, 35%, 0.08)" strokeWidth="0.5" />
                    <polygon points="97,63 100,68 103,63"
                      fill="hsla(30, 10%, 35%, 0.06)" />
                  </motion.g>
                )}

                {/* Ember particles — rising */}
                {Array.from({ length: Math.floor(t * 10) }, (_, i) => {
                  const emberPhase = (flamePhase * 0.7 + i * 0.8) % 4;
                  const x = 85 + (i * 17 % 30) + Math.sin(flamePhase + i) * 3;
                  const y = 140 - emberPhase * 30;
                  const opacity = Math.max(0, 0.15 - emberPhase * 0.04);
                  return (
                    <circle key={`e${i}`} cx={x} cy={y} r={0.8}
                      fill={`hsla(25, 40%, 50%, ${opacity})`} />
                  );
                })}

                {/* AMOR FATI */}
                {fed >= FEED_STEPS && (
                  <motion.text x="100" y="172" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(25, 25%, 50%, 0.25)`} letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.25 }}
                    transition={{ delay: 0.5, duration: 1.5 }}>
                    AMOR FATI
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={fed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {fed === 0 ? 'A small flame. A paper waits.' : fed < FEED_STEPS ? `Fed "${PAPERS[fed - 1]}" to the fire. Brighter.` : 'All fed. The fire blazes. Fuel, not burden.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: FEED_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < fed ? `hsla(25, ${30 + i * 5}%, ${45 + i * 4}%, 0.5)` : palette.primaryFaint, opacity: i < fed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>A regret. A fear. A setback. A betrayal. A loss. All fuel. The fire blazes. Do not just bear it. Love it. Amor Fati.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Radical acceptance. Beyond tolerance to enthusiastic acceptance. No secondary suffering. No "it shouldn't be this way." It is. And it burns bright.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Burden. Fuel. Bright.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}