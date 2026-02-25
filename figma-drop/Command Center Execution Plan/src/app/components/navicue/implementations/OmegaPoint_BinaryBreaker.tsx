/**
 * OMEGA POINT #2 — The Binary Breaker
 * "It is not Good vs Evil. It is a dance."
 * INTERACTION: Black fluid on one side, white fluid on the other.
 * Each tap swirls them closer — they blend into a luminous gold
 * spiral. Not choosing sides. Seeing the whole dance.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const MIX_STEPS = 5;

export default function OmegaPoint_BinaryBreaker({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [mixed, setMixed] = useState(0);
  const [phase, setPhase] = useState(0);
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
    const tick = () => { setPhase(p => p + 0.02); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const mix = () => {
    if (stage !== 'active' || mixed >= MIX_STEPS) return;
    const next = mixed + 1;
    setMixed(next);
    if (next >= MIX_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = mixed / MIX_STEPS;
  const swirlRadius = 15 + t * 40;
  const goldIntensity = t;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two forces appear...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>It is not Good vs Evil. It is a dance. Stop choosing sides. See the whole dance.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to swirl them together</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={mix}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: mixed >= MIX_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden', background: 'hsla(0, 0%, 6%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-goldCenter`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(45, 55%, 55%, ${goldIntensity * 0.3})`} />
                    <stop offset="60%" stopColor={`hsla(45, 40%, 50%, ${goldIntensity * 0.08})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                {/* Black fluid — left side, shrinking toward center */}
                {Array.from({ length: 6 }, (_, i) => {
                  const angle = (i / 6) * Math.PI * 2 + phase;
                  const dist = (1 - t) * 50 + 10;
                  const cx = 65 + Math.cos(angle) * dist * 0.3 + t * 30;
                  const cy = 95 + Math.sin(angle) * dist * 0.5;
                  const r = 12 - t * 4 + Math.sin(phase + i) * 3;
                  return (
                    <motion.circle key={`b${i}`} cx={cx} cy={cy} r={Math.max(r, 2)}
                      fill={`hsla(0, 0%, ${5 + goldIntensity * 20}%, ${0.3 - t * 0.15})`}
                      animate={{ cx, cy }}
                    />
                  );
                })}
                {/* White fluid — right side, shrinking toward center */}
                {Array.from({ length: 6 }, (_, i) => {
                  const angle = (i / 6) * Math.PI * 2 - phase * 0.8;
                  const dist = (1 - t) * 50 + 10;
                  const cx = 125 + Math.cos(angle) * dist * 0.3 - t * 30;
                  const cy = 95 + Math.sin(angle) * dist * 0.5;
                  const r = 12 - t * 4 + Math.sin(phase + i + 3) * 3;
                  return (
                    <motion.circle key={`w${i}`} cx={cx} cy={cy} r={Math.max(r, 2)}
                      fill={`hsla(0, 0%, ${85 - goldIntensity * 30}%, ${0.2 - t * 0.1})`}
                      animate={{ cx, cy }}
                    />
                  );
                })}
                {/* Gold spiral — emerging from mix */}
                {t > 0.2 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: goldIntensity * 0.8 }}>
                    {Array.from({ length: 24 }, (_, i) => {
                      const a = (i / 24) * Math.PI * 4 + phase * 1.5;
                      const r = (i / 24) * swirlRadius;
                      const cx = 95 + Math.cos(a) * r;
                      const cy = 95 + Math.sin(a) * r;
                      const dotR = 1.5 + (i / 24) * 1.5;
                      return (
                        <circle key={`g${i}`} cx={cx} cy={cy} r={dotR}
                          fill={`hsla(45, ${40 + (i / 24) * 20}%, ${50 + (i / 24) * 10}%, ${goldIntensity * (0.1 + (i / 24) * 0.2)})`} />
                      );
                    })}
                  </motion.g>
                )}
                {/* Gold center glow */}
                <circle cx="95" cy="95" r="60" fill={`url(#${svgId}-goldCenter)`} />
                {/* Labels — fading */}
                <text x="40" y="30" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, 0%, 30%, ${0.2 * (1 - t)})`}>BLACK</text>
                <text x="150" y="30" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, 0%, 70%, ${0.2 * (1 - t)})`}>WHITE</text>
                {t >= 1 && (
                  <motion.text x="95" y="178" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(45, 40%, 55%, 0.3)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                    transition={{ duration: 1.5 }}>
                    GOLD
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={mixed} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {mixed === 0 ? 'Black and white. Separate.' : mixed < MIX_STEPS ? 'Swirling together...' : 'Neither black nor white. Gold.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: MIX_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < mixed ? 'hsla(45, 45%, 55%, 0.5)' : palette.primaryFaint, opacity: i < mixed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Black and white became gold. The binary dissolved. The dance was always one.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Dialectical thinking. Holding opposites without dissonance. Broken AND whole. Both. Always.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Black. White. Gold.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}