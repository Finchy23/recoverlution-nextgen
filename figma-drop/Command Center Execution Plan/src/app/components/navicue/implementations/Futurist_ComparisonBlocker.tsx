/**
 * FUTURIST #9 — The Comparison Blocker
 * "You are comparing your insides to their outsides."
 * INTERACTION: A "perfect life" photo (geometric shapes suggesting
 * a curated scene). Each tap blurs one layer — 5 layers. The image
 * dissolves into abstract color fields. The highlight reel
 * de-contextualizes. The envy loop breaks.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BLUR_STEPS = 5;

export default function Futurist_ComparisonBlocker({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [blurred, setBlurred] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const blur = () => {
    if (stage !== 'active' || blurred >= BLUR_STEPS) return;
    const next = blurred + 1;
    setBlurred(next);
    if (next >= BLUR_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = blurred / BLUR_STEPS;
  const full = t >= 1;
  const blurPx = t * 12;

  const svgId = useId();

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A perfect life...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are comparing your insides to their outsides. It is a rigged game. Stop playing. This is a highlight reel. Not reality.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to blur the illusion</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={blur}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: blurred >= BLUR_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(300, ${3 + t * 4}%, ${5 + t * 3}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <filter id={`${svgId}-blurComp`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation={blurPx} />
                  </filter>
                </defs>

                {/* "Perfect life" scene — geometric composition */}
                <g filter={blurPx > 0 ? `url(#${svgId}-blurComp)` : undefined}>
                  {/* Sky */}
                  <rect x="25" y="20" width="170" height="50" rx="3"
                    fill={`hsla(200, ${14 - t * 8}%, ${22 - t * 6}%, ${0.06 - t * 0.02})`} />
                  {/* Sun */}
                  <circle cx="160" cy="35" r="10"
                    fill={`hsla(42, ${18 - t * 10}%, ${35 - t * 10}%, ${0.08 - t * 0.03})`} />
                  {/* Beach/horizon */}
                  <rect x="25" y="70" width="170" height="20" rx="2"
                    fill={`hsla(42, ${12 - t * 6}%, ${20 - t * 6}%, ${0.05 - t * 0.02})`} />
                  {/* Figure silhouette */}
                  <ellipse cx="80" cy="68" rx="6" ry="4"
                    fill={`hsla(25, ${10 - t * 5}%, ${18 - t * 5}%, ${0.06 - t * 0.02})`} />
                  <rect x="77" y="55" width="6" height="14" rx="2"
                    fill={`hsla(25, ${10 - t * 5}%, ${18 - t * 5}%, ${0.06 - t * 0.02})`} />
                  <circle cx="80" cy="50" r="5"
                    fill={`hsla(25, ${10 - t * 5}%, ${18 - t * 5}%, ${0.06 - t * 0.02})`} />
                  {/* Luxury items */}
                  <rect x="100" y="60" width="15" height="12" rx="2"
                    fill={`hsla(340, ${10 - t * 5}%, ${20 - t * 6}%, ${0.05 - t * 0.02})`} />
                  <rect x="130" y="55" width="20" height="18" rx="3"
                    fill={`hsla(210, ${10 - t * 5}%, ${18 - t * 5}%, ${0.05 - t * 0.02})`} />
                  {/* Hearts / likes */}
                  <text x="50" y="108" fontSize="11" fill={`hsla(0, ${15 - t * 10}%, ${35 - t * 10}%, ${0.1 - t * 0.06})`}>♥ 4,328</text>
                  {/* Caption */}
                  <text x="50" y="120" fontSize="4" fontFamily="monospace"
                    fill={`hsla(0, 0%, ${28 - t * 10}%, ${0.08 - t * 0.04})`}>
                    living my best life
                  </text>
                </g>

                {/* Abstract color fields — emerge as blur increases */}
                {t > 0.4 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: t * 0.06 }}>
                    <ellipse cx="80" cy="60" rx="40" ry="30"
                      fill={`hsla(200, ${t * 12}%, ${25 + t * 8}%, ${t * 0.04})`} />
                    <ellipse cx="150" cy="50" rx="35" ry="25"
                      fill={`hsla(42, ${t * 10}%, ${22 + t * 6}%, ${t * 0.03})`} />
                    <ellipse cx="110" cy="90" rx="50" ry="20"
                      fill={`hsla(300, ${t * 8}%, ${20 + t * 5}%, ${t * 0.025})`} />
                  </motion.g>
                )}

                {/* "NOT REALITY" stamp */}
                {full && (
                  <motion.g initial={{ opacity: 0, rotate: -12 }} animate={{ opacity: 0.15, rotate: -12 }}
                    transition={{ delay: 0.5, duration: 1.5 }}
                    style={{ transformOrigin: '110px 70px' }}>
                    <rect x="50" y="55" width="120" height="30" rx="3"
                      fill="none" stroke="hsla(0, 15%, 40%, 0.12)" strokeWidth="1.5" />
                    <text x="110" y="75" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700"
                      fill="hsla(0, 15%, 40%, 0.15)" letterSpacing="2">
                      NOT REAL
                    </text>
                  </motion.g>
                )}

                {/* Envy meter */}
                <text x="195" y="170" textAnchor="end" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(300, 6%, 25%, ${0.04 + t * 0.02})`}>
                  envy: {Math.round((1 - t) * 100)}%
                </text>

                {/* Status */}
                <text x="15" y="170" fontSize="4.5" fontFamily="monospace"
                  fill={`hsla(${full ? 0 : 300}, ${6 + t * 6}%, ${22 + t * 8}%, ${0.05 + t * 0.04})`}>
                  {full ? 'illusion dissolved' : `blur ${blurred}/${BLUR_STEPS}`}
                </text>
              </svg>
            </div>
            <motion.div key={blurred} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {blurred === 0 ? 'A perfect scene. Beach, sun, 4,328 likes. You feel small.' : blurred < BLUR_STEPS ? `Layer ${blurred} blurred. The details dissolve.` : 'Abstract colors. No envy. The highlight reel is gone.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BLUR_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < blurred ? 'hsla(300, 12%, 42%, 0.5)' : palette.primaryFaint, opacity: i < blurred ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five layers of blur. The beach dissolved. The sun smeared. The figure became color. The 4,328 hearts disappeared. What was left was abstract, beautiful, but not envious. You were comparing your insides to their outsides. The game was rigged. You stopped playing.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Social comparison theory. Upward social comparison on digital platforms is a primary driver of depression. De-contextualizing the image breaks the envy loop.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Perfect. Blur. Free.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}