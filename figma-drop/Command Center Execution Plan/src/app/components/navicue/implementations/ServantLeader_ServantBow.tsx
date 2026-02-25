/**
 * SERVANT LEADER #7 — The Servant Bow
 * "I honor the place in you where the entire universe dwells."
 * INTERACTION: The camera angle / viewpoint slowly lowers on each
 * tap — from level to looking upward — until you see the other
 * person from below, reverent. Namaste. Elevation felt.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BOW_STEPS = 5;

export default function ServantLeader_ServantBow({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bowed, setBowed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const bow = () => {
    if (stage !== 'active' || bowed >= BOW_STEPS) return;
    const next = bowed + 1;
    setBowed(next);
    if (next >= BOW_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = bowed / BOW_STEPS;
  // Camera lowers: viewpoint shifts downward
  const cameraShift = t * 50; // px the "camera" drops
  const figureScale = 1 + t * 0.4; // figure appears larger from below
  const warmth = t * 0.15;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The gaze softens...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>I honor the place in you where the entire universe dwells. Namaste.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to bow lower</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={bow}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: bowed >= BOW_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(30, ${5 + t * 10}%, ${7 + t * 3}%, 0.25)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Warm light above — elevation glow */}
                <radialGradient id={`${svgId}-elevGlow`} cx="50%" cy="20%">
                  <stop offset="0%" stopColor={`hsla(45, 40%, 60%, ${warmth})`} />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <rect x="0" y="0" width="180" height="170" fill={`url(#${svgId}-elevGlow)`} />
                {/* The Other — figure seen from lowering angle */}
                <motion.g
                  animate={{ y: cameraShift * 0.3, scale: figureScale }}
                  style={{ transformOrigin: '90px 60px' }}
                  transition={{ type: 'spring', stiffness: 60 }}>
                  {/* Head */}
                  <circle cx="90" cy="40" r={10}
                    fill={`hsla(30, 15%, ${30 + t * 12}%, ${0.2 + t * 0.15})`} />
                  {/* Body */}
                  <rect x="82" y="52" width="16" height="35" rx="5"
                    fill={`hsla(30, 12%, ${28 + t * 10}%, ${0.2 + t * 0.1})`} />
                  {/* Hands in prayer position */}
                  <motion.g initial={{ opacity: 0.15 }} animate={{ opacity: 0.15 + t * 0.2 }}>
                    <line x1="85" y1="62" x2="90" y2="68"
                      stroke={`hsla(30, 12%, 35%, 0.2)`} strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="95" y1="62" x2="90" y2="68"
                      stroke={`hsla(30, 12%, 35%, 0.2)`} strokeWidth="1.5" strokeLinecap="round" />
                  </motion.g>
                  {/* Light halo — appears at full bow */}
                  {t > 0.5 && (
                    <motion.circle cx="90" cy="38" r={15 + t * 8}
                      fill={`hsla(45, 35%, 60%, ${(t - 0.5) * 0.06})`}
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.5) * 0.08 }}
                    />
                  )}
                </motion.g>
                {/* Your perspective marker — lowering */}
                <motion.g initial={{ y: 0 }} animate={{ y: cameraShift }} transition={{ type: 'spring', stiffness: 60 }}>
                  <line x1="60" y1="140" x2="120" y2="140"
                    stroke={`hsla(220, 10%, 30%, ${0.1 - t * 0.05})`} strokeWidth="0.5" />
                  <text x="90" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(220, 10%, 35%, ${0.15 - t * 0.08})`}>
                    your view
                  </text>
                </motion.g>
                {/* Warmth particles */}
                {t > 0.4 && Array.from({ length: Math.floor((t - 0.4) * 10) }, (_, i) => (
                  <motion.circle key={i}
                    cx={70 + Math.sin(i * 2.1) * 25} cy={30 + Math.cos(i * 1.7) * 15}
                    r={1} fill={`hsla(45, 40%, 60%, ${(t - 0.4) * 0.2})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.4) * 0.15 }}
                    transition={{ delay: i * 0.1 }}
                  />
                ))}
              </svg>
              {/* Angle indicator */}
              <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontFamily: 'monospace', fontSize: '11px', color: `hsla(45, 25%, 50%, ${0.15 + t * 0.15})` }}>
                {bowed === 0 ? 'eye level' : bowed < BOW_STEPS ? `bowing...` : 'looking up'}
              </div>
            </div>
            <motion.div key={bowed} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {bowed === 0 ? 'Level gaze. Equal.' : bowed < BOW_STEPS ? 'Lowering...' : 'Looking up. Reverence.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BOW_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < bowed ? 'hsla(45, 35%, 55%, 0.5)' : palette.primaryFaint, opacity: i < bowed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You bowed. The warmth expanded. To serve is to see the universe in another.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Elevation. Vagus nerve activated. Moral beauty witnessed. Warmth spreading through the chest.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Bowed. Honored. Elevated.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}