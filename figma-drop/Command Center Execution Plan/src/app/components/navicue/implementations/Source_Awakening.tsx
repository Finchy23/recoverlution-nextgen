/**
 * SOURCE #6 — The Awakening
 * "You were sleeping. Dreaming you were small. Wake up."
 * INTERACTION: The field is dimmed — asleep. Each tap opens the "eye"
 * wider, the screen brightens. At full open: a massive eye fills the
 * field, iris luminous. "Wake up."
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const WAKE_STEPS = 5;

export default function Source_Awakening({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [woken, setWoken] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const wake = () => {
    if (stage !== 'active' || woken >= WAKE_STEPS) return;
    const next = woken + 1;
    setWoken(next);
    if (next >= WAKE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = woken / WAKE_STEPS;
  // Eye opening: lid gap increases with t
  const lidGap = t * 40; // vertical pixels of opening
  const irisR = 8 + t * 14;
  const pupilR = 3 + t * 4;
  const brightness = 5 + t * 50;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Darkness...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You were sleeping. Dreaming you were small. Dreaming you were broken. Wake up.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to open the eye</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={wake}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: woken >= WAKE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <motion.div
              animate={{ backgroundColor: `hsla(45, ${5 + t * 12}%, ${brightness}%, ${0.04 + t * 0.12})` }}
              transition={{ duration: 0.8 }}
              style={{ position: 'relative', width: '210px', height: '150px', borderRadius: radius.md, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0)' }}>
              <svg width="100%" height="100%" viewBox="0 0 210 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Eye shape — almond, opening */}
                <defs>
                  <clipPath id={`${svgId}-eyeClip`}>
                    <ellipse cx="105" cy="75" rx={65 + t * 15} ry={lidGap / 2 + 2} />
                  </clipPath>
                </defs>
                {/* Eye white — visible through clip */}
                <g clipPath={`url(#${svgId}-eyeClip)`}>
                  <ellipse cx="105" cy="75" rx="70" ry="45"
                    fill={`hsla(0, 0%, ${25 + t * 45}%, ${0.08 + t * 0.15})`} />
                  {/* Iris */}
                  <motion.circle cx="105" cy="75" r={irisR}
                    fill={`hsla(${180 + t * 40}, ${25 + t * 20}%, ${30 + t * 20}%, ${0.2 + t * 0.3})`}
                    animate={{ r: irisR }}
                    transition={{ type: 'spring', stiffness: 80 }}
                  />
                  {/* Iris detail rings */}
                  {t > 0.3 && [0.5, 0.7, 0.9].map((ring, i) => (
                    <circle key={i} cx="105" cy="75" r={irisR * ring}
                      fill="none" stroke={`hsla(${200 + t * 30}, 20%, 40%, ${(t - 0.3) * 0.08})`}
                      strokeWidth="0.3" />
                  ))}
                  {/* Pupil */}
                  <motion.circle cx="105" cy="75" r={pupilR}
                    fill={`hsla(0, 0%, ${5 + t * 3}%, ${0.3 + t * 0.3})`}
                    animate={{ r: pupilR }}
                  />
                  {/* Light reflection */}
                  <circle cx={100 - t * 2} cy={71 - t} r={2 + t * 1.5}
                    fill={`hsla(0, 0%, ${70 + t * 20}%, ${0.15 + t * 0.2})`} />
                </g>
                {/* Eyelid lines — top and bottom */}
                <motion.path
                  d={`M 40 75 Q 105 ${75 - lidGap / 2 - 10}, 170 75`}
                  fill="none" stroke={`hsla(0, 0%, ${30 + t * 15}%, ${0.15 + t * 0.1})`}
                  strokeWidth="1" strokeLinecap="round"
                  initial={{ d: 'M 40 75 Q 105 65, 170 75' }}
                  animate={{ d: `M 40 75 Q 105 ${75 - lidGap / 2 - 10}, 170 75` }}
                />
                <motion.path
                  d={`M 40 75 Q 105 ${75 + lidGap / 2 + 10}, 170 75`}
                  fill="none" stroke={`hsla(0, 0%, ${30 + t * 15}%, ${0.15 + t * 0.1})`}
                  strokeWidth="1" strokeLinecap="round"
                />
                {/* "WAKE UP" — appears fully open */}
                {woken >= WAKE_STEPS && (
                  <motion.text x="105" y="135" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(45, 30%, 55%, 0.35)" letterSpacing="3"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.35 }}
                    transition={{ delay: 0.5, duration: 1.5 }}>
                    WAKE UP
                  </motion.text>
                )}
              </svg>
            </motion.div>
            <motion.div key={woken} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {woken === 0 ? 'Closed. Dreaming.' : woken < WAKE_STEPS ? `Opening... ${Math.floor(t * 100)}%` : 'Awake.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: WAKE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < woken ? `hsla(45, 35%, ${45 + i * 5}%, 0.5)` : palette.primaryFaint, opacity: i < woken ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The eye opened. You were sleeping. Dreaming you were small. You were never small. Wake up.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Meta-cognitive insight. Suffering is a mental construct, a dream. Recognition allows immediate detachment.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Asleep. Awake. Free.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}