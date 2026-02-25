/**
 * MYSTIC #5 — The Wave Collapse
 * "Your attention collapses the wave. Choose what you manifest."
 * INTERACTION: A cloud of blur (probability). Each tap sharpens
 * one region — 5 taps. Blur resolves into a geometric form.
 * Observer effect: attention as creative force.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const COLLAPSE_STEPS = 5;

export default function Mystic_WaveCollapse({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [collapsed, setCollapsed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const collapse = () => {
    if (stage !== 'active' || collapsed >= COLLAPSE_STEPS) return;
    const next = collapsed + 1;
    setCollapsed(next);
    if (next >= COLLAPSE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = collapsed / COLLAPSE_STEPS;
  const blurVal = (1 - t) * 10;

  const svgId = useId();

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Probability... everywhere...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Reality remains a wave of probability until you observe it. Your attention collapses the wave. Choose what you manifest.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to collapse the probability cloud</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={collapse}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: collapsed >= COLLAPSE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(220, ${5 + t * 3}%, ${4 + t * 2}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <filter id={`${svgId}-waveBlur`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation={blurVal} />
                  </filter>
                </defs>

                {/* Probability cloud — blurred shapes */}
                <g filter={blurVal > 0.5 ? `url(#${svgId}-waveBlur)` : undefined}>
                  {/* The emerging form — a diamond/crystal */}
                  <polygon points="100,30 140,80 100,130 60,80"
                    fill={`hsla(280, ${10 + t * 15}%, ${20 + t * 15}%, ${0.04 + t * 0.06})`}
                    stroke={`hsla(280, ${10 + t * 12}%, ${25 + t * 18}%, ${0.03 + t * 0.08})`}
                    strokeWidth={0.3 + t * 0.5}
                  />
                  {/* Inner facets — appear as sharpness increases */}
                  <line x1="100" y1="30" x2="100" y2="130"
                    stroke={`hsla(260, ${8 + t * 10}%, ${22 + t * 12}%, ${t * 0.06})`}
                    strokeWidth="0.3" />
                  <line x1="60" y1="80" x2="140" y2="80"
                    stroke={`hsla(260, ${8 + t * 10}%, ${22 + t * 12}%, ${t * 0.06})`}
                    strokeWidth="0.3" />
                  {/* Facet diagonals */}
                  {t > 0.4 && (
                    <>
                      <line x1="80" y1="55" x2="120" y2="105"
                        stroke={`hsla(260, 8%, 25%, ${(t - 0.4) * 0.06})`} strokeWidth="0.2" />
                      <line x1="120" y1="55" x2="80" y2="105"
                        stroke={`hsla(260, 8%, 25%, ${(t - 0.4) * 0.06})`} strokeWidth="0.2" />
                    </>
                  )}
                </g>

                {/* Probability scatter — fades as collapse happens */}
                {Array.from({ length: 30 }, (_, i) => {
                  const px = 40 + (i * 17 + i * i) % 120;
                  const py = 20 + (i * 13 + i * i * 3) % 120;
                  return (
                    <motion.circle key={i} cx={px} cy={py} r={1 + (i % 3) * 0.5}
                      fill={`hsla(${260 + i * 4}, 10%, 25%, ${0.03 * (1 - t)})`}
                      animate={{ opacity: 1 - t }}
                    />
                  );
                })}

                {/* Crystal glow at full collapse */}
                {t >= 1 && (
                  <motion.circle cx="100" cy="80" r="30"
                    fill="hsla(280, 18%, 35%, 0.04)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.04 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="100" y="152" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(260, ${8 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.04})`}>
                  {t >= 1 ? 'collapsed. Observed.' : `probability: ${Math.round((1 - t) * 100)}%`}
                </text>
              </svg>
            </div>
            <motion.div key={collapsed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {collapsed === 0 ? 'A cloud of probability. Everything and nothing.' : collapsed < COLLAPSE_STEPS ? `Observation ${collapsed}. The wave is collapsing into form.` : 'Collapsed. A crystal emerged. Your attention manifested this.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: COLLAPSE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < collapsed ? 'hsla(280, 18%, 48%, 0.5)' : palette.primaryFaint, opacity: i < collapsed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five observations. The blur sharpened. Scatter became facets. A crystal emerged from probability, precise, geometric, real. It did not exist until you looked. Your attention collapsed the wave. You are not a passive receptor. You are a creative force.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The observer effect. Framing attention as a creative force empowers you to curate your sensory inputs and emotional reality. Choose what you manifest.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Cloud. Observe. Crystal.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}