/**
 * OMEGA POINT #9 — The Omega Pulse
 * "We are moving toward a point of convergence. Love is the gravity of the soul."
 * INTERACTION: A central light. Each tap brightens it. The glow
 * expands until the entire field is luminous white. Convergence.
 * Self-actualization. The peak experience.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Self-Compassion', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BRIGHT_STEPS = 6;

export default function OmegaPoint_OmegaPulse({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [brightness, setBrightness] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const brighten = () => {
    if (stage !== 'active' || brightness >= BRIGHT_STEPS) return;
    const next = brightness + 1;
    setBrightness(next);
    if (next >= BRIGHT_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = brightness / BRIGHT_STEPS;
  const lightness = 8 + t * 85;
  const glowR = 20 + t * 80;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Self-Compassion" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A point of light...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>We are moving toward a point of convergence. Love is the gravity of the soul.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to brighten</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={brighten}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: brightness >= BRIGHT_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <motion.div
              animate={{ backgroundColor: `hsla(45, ${10 + t * 15}%, ${lightness}%, ${0.05 + t * 0.35})` }}
              transition={{ duration: 1 }}
              style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0)' }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-omegaGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(45, ${30 + t * 30}%, ${50 + t * 40}%, ${0.1 + t * 0.5})`} />
                    <stop offset="40%" stopColor={`hsla(45, ${20 + t * 20}%, ${40 + t * 30}%, ${0.05 + t * 0.2})`} />
                    <stop offset="100%" stopColor={`hsla(45, 10%, ${10 + t * 20}%, ${t * 0.1})`} />
                  </radialGradient>
                </defs>
                {/* Background glow */}
                <circle cx="95" cy="95" r="95" fill={`url(#${svgId}-omegaGlow)`} />
                {/* Central light */}
                <motion.circle cx="95" cy="95" r={4 + t * 12}
                  fill={`hsla(45, ${40 + t * 20}%, ${55 + t * 35}%, ${0.2 + t * 0.6})`}
                  animate={{ r: 4 + t * 12 }}
                  transition={{ type: 'spring', stiffness: 80 }}
                />
                {/* Expanding glow rings */}
                {Array.from({ length: brightness }, (_, i) => (
                  <motion.circle key={i} cx="95" cy="95" r={20 + i * 15}
                    fill="none"
                    stroke={`hsla(45, ${30 + i * 5}%, ${50 + t * 20}%, ${(0.05 + t * 0.08) / (i + 1)})`}
                    strokeWidth={0.5 + t * 0.3}
                    initial={{ r: 10, opacity: 0 }}
                    animate={{ r: 20 + i * 15, opacity: 0.1 + t * 0.1 }}
                    transition={{ duration: 1.2, delay: i * 0.1 }}
                  />
                ))}
                {/* Converging rays at high brightness */}
                {t > 0.6 && Array.from({ length: 8 }, (_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  return (
                    <motion.line key={`ray${i}`}
                      x1={95 + Math.cos(angle) * 85} y1={95 + Math.sin(angle) * 85}
                      x2={95 + Math.cos(angle) * (40 - t * 20)} y2={95 + Math.sin(angle) * (40 - t * 20)}
                      stroke={`hsla(45, 35%, 65%, ${(t - 0.6) * 0.12})`}
                      strokeWidth="0.5"
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.15 }}
                    />
                  );
                })}
              </svg>
            </motion.div>
            <motion.div key={brightness} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: brightness >= BRIGHT_STEPS ? 'hsla(45, 30%, 55%, 0.6)' : palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {brightness === 0 ? 'A dim point. Barely visible.' : brightness < BRIGHT_STEPS ? `Brightening... ${Math.floor(t * 100)}%` : 'Pure light. Convergence.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BRIGHT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < brightness ? `hsla(45, ${30 + i * 5}%, ${50 + i * 5}%, 0.5)` : palette.primaryFaint, opacity: i < brightness ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The light converged. Everything that rises must converge. Love is the gravity.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Self-actualization. Full potential realized. Peak experience. The Omega Point.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dim. Bright. Everything.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}