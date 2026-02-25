/**
 * OMEGA POINT #8 — The Fourth Wall
 * "This app is an illusion. Only your attention is real."
 * INTERACTION: The interface "cracks" — tap to crack it more. Behind
 * the cracks, monospace code is visible. The frame breaks. You see
 * the illusion. Meta-cognition: observing the framing itself.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CRACK_STEPS = 5;

const CODE_LINES = [
  'function renderReality() {',
  '  const attention = useRef(true);',
  '  const illusion = createFrame();',
  '  if (!attention.current) return null;',
  '  return <Experience />;',
  '}',
  '// Only your attention is real.',
];

const CRACK_PATHS = [
  'M 100 0 L 95 25 L 105 40 L 90 65 L 110 80',
  'M 0 55 L 30 50 L 55 60 L 70 45 L 95 55',
  'M 200 30 L 175 45 L 160 35 L 140 50 L 120 42',
  'M 50 130 L 70 115 L 60 100 L 85 90',
  'M 180 120 L 155 105 L 145 115 L 125 100',
];

export default function OmegaPoint_FourthWall({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cracked, setCracked] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const crack = () => {
    if (stage !== 'active' || cracked >= CRACK_STEPS) return;
    const next = cracked + 1;
    setCracked(next);
    if (next >= CRACK_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = cracked / CRACK_STEPS;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The surface trembles...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>This app is an illusion. Your phone is an illusion. Only your attention is real.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to crack the surface</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={crack}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: cracked >= CRACK_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '210px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(160, 10%, 7%, 0.3)' }}>
              {/* Code layer — behind the cracks */}
              <div style={{
                position: 'absolute', inset: 0, padding: '10px 14px',
                opacity: t * 0.5, pointerEvents: 'none',
              }}>
                {CODE_LINES.map((line, i) => (
                  <div key={i} style={{
                    fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.8,
                    color: `hsla(120, 40%, ${40 + i * 3}%, ${t * 0.6})`,
                    opacity: i < Math.ceil(t * CODE_LINES.length) ? 1 : 0,
                    transition: 'opacity 0.5s',
                  }}>
                    {line}
                  </div>
                ))}
              </div>
              {/* Surface layer — cracks progressively */}
              <svg width="100%" height="100%" viewBox="0 0 210 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Surface */}
                <rect x="0" y="0" width="210" height="150" rx="12"
                  fill={`hsla(0, 0%, 10%, ${0.6 - t * 0.45})`} />
                {/* Cracks */}
                {CRACK_PATHS.slice(0, cracked).map((d, i) => (
                  <motion.path key={i} d={d}
                    fill="none"
                    stroke={`hsla(120, 30%, ${35 + i * 5}%, ${0.2 + i * 0.05})`}
                    strokeWidth={0.8 + i * 0.15}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
                {/* Glitch fragments — at high crack levels */}
                {cracked >= 3 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}>
                    <rect x="70" y="40" width="25" height="8" rx="1" fill="hsla(120, 30%, 40%, 0.08)" />
                    <rect x="120" y="75" width="30" height="6" rx="1" fill="hsla(120, 25%, 35%, 0.06)" />
                    <rect x="40" y="100" width="20" height="10" rx="1" fill="hsla(120, 35%, 42%, 0.07)" />
                  </motion.g>
                )}
                {/* Full break — light through */}
                {cracked >= CRACK_STEPS && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ duration: 2 }}>
                    <radialGradient id={`${svgId}-breakLight`} cx="50%" cy="45%">
                      <stop offset="0%" stopColor="hsla(120, 30%, 50%, 0.08)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <rect x="0" y="0" width="210" height="150" fill={`url(#${svgId}-breakLight)`} />
                  </motion.g>
                )}
              </svg>
              {/* Corner label */}
              <div style={{ position: 'absolute', bottom: '6px', right: '8px', fontFamily: 'monospace', fontSize: '11px', color: `hsla(120, 25%, 45%, ${0.15 + t * 0.15})` }}>
                {cracked}/{CRACK_STEPS} cracks
              </div>
            </div>
            <motion.div key={cracked} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {cracked === 0 ? 'The surface. Seamless. Convincing.' : cracked < CRACK_STEPS ? 'Cracking... code visible beneath.' : 'Broken through. The frame is visible.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: CRACK_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < cracked ? 'hsla(120, 35%, 45%, 0.5)' : palette.primaryFaint, opacity: i < cracked ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The wall cracked. Code underneath. The frame was visible all along. Only your attention was ever real.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Meta-cognition. Stepping out of the frame to observe the framing itself.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Surface. Code. Attention.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}