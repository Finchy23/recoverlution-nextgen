/**
 * AESTHETE #3 -- The Wabi-Sabi
 * "It is beautiful because it is broken. It is honest because it decays."
 * INTERACTION: A ceramic vessel rendered in SVG -- pristine at first.
 * Tap to crack it. Gold seeps into the cracks (kintsugi). Each crack
 * makes it more beautiful. Imperfection as art.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'believing', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CRACK_PATHS = [
  'M 80 40 Q 85 60 75 80',
  'M 120 35 Q 115 55 125 75',
  'M 95 30 Q 100 50 90 70 Q 95 80 100 95',
  'M 70 60 Q 80 65 90 60',
  'M 110 55 Q 120 60 130 55',
];

const TRUTHS = [
  'It cracks.',
  'Gold fills the wound.',
  'The break becomes the pattern.',
  'Decay is honesty.',
  'Imperfection is the art.',
];

export default function Aesthete_WabiSabi({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cracks, setCracks] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const addCrack = () => {
    if (stage !== 'active' || cracks >= CRACK_PATHS.length) return;
    const next = cracks + 1;
    setCracks(next);
    if (next >= CRACK_PATHS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const goldIntensity = cracks / CRACK_PATHS.length;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something beautiful waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Beautiful because it is broken. Honest because it decays.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the vessel to crack it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={addCrack}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: cracks >= CRACK_PATHS.length ? 'default' : 'pointer' }}>
            {/* Vessel */}
            <div style={{ position: 'relative', width: '200px', height: '160px' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 140">
                {/* Bowl shape */}
                <path d="M 50 30 Q 50 110, 100 115 Q 150 110, 150 30 Q 130 35, 100 35 Q 70 35, 50 30 Z"
                  fill="none" stroke={`hsla(25, 20%, ${40 + goldIntensity * 15}%, ${0.3 + goldIntensity * 0.2})`}
                  strokeWidth="1.5" />
                {/* Rim */}
                <ellipse cx="100" cy="30" rx="50" ry="8"
                  fill="none" stroke={`hsla(25, 20%, ${40 + goldIntensity * 15}%, ${0.25 + goldIntensity * 0.15})`}
                  strokeWidth="1" />
                {/* Cracks with gold */}
                {CRACK_PATHS.slice(0, cracks).map((path, i) => (
                  <motion.path key={i} d={path}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.7 }}
                    transition={{ duration: 0.8 }}
                    fill="none"
                    stroke={`hsla(42, 70%, ${55 + i * 3}%, 0.7)`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ))}
                {/* Gold glow on cracks */}
                {CRACK_PATHS.slice(0, cracks).map((path, i) => (
                  <motion.path key={`g${i}`} d={path}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    fill="none"
                    stroke="hsla(42, 80%, 60%, 0.4)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="blur(2px)"
                  />
                ))}
              </svg>
              {/* Overall gold aura as more cracks appear */}
              <motion.div
                animate={{ opacity: goldIntensity * 0.08 }}
                style={{ position: 'absolute', inset: '10%', borderRadius: '50%', background: 'radial-gradient(circle, hsla(42, 70%, 55%, 0.3), transparent)' }}
              />
            </div>
            {/* Truth revelation */}
            {cracks > 0 && (
              <motion.div key={cracks} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.5, y: 0 }}
                style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
                {TRUTHS[cracks - 1]}
              </motion.div>
            )}
            <div style={{ display: 'flex', gap: '4px' }}>
              {CRACK_PATHS.map((_, i) => (
                <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i < cracks ? 'hsla(42, 70%, 55%, 0.6)' : palette.primaryFaint, opacity: i < cracks ? 0.6 : 0.15 }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>
              {cracks >= CRACK_PATHS.length ? 'more beautiful now' : 'tap to crack'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Just like you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The gold lives in the cracks. Perfection was never the point.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Broken. Golden. Beautiful.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}