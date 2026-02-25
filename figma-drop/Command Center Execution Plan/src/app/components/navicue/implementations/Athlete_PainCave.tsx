/**
 * ATHLETE #8 -- The Pain Cave
 * "When your mind tells you you're done, you're only 40% done."
 * INTERACTION: A dark tunnel. A pinprick of light at the far end.
 * Each tap pushes deeper -- the walls tighten, the light grows.
 * 5 pushes. At the end: the light floods in. You survived.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PUSH_STEPS = 5;

export default function Athlete_PainCave({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pushes, setPushes] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const push = () => {
    if (stage !== 'active' || pushes >= PUSH_STEPS) return;
    const next = pushes + 1;
    setPushes(next);
    if (next >= PUSH_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = pushes / PUSH_STEPS;
  const exitLight = t;
  const wallTightness = 0.4 + t * 0.1; // walls get slightly tighter mid-cave
  const wallSpread = t < 0.6 ? 0.6 - t * 0.3 : 0.3 + (t - 0.6) * 0.7; // narrow then widen at end

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Darkness ahead...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>It burns. Good. Stay in the burn for ten more seconds. When your mind says you're done, you're only 40% done. Find the reserve.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to push deeper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={push}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: pushes >= PUSH_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, 0%, ${3 + exitLight * 5}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Tunnel walls -- converging perspective lines */}
                <defs>
                  <radialGradient id={`${svgId}-exitGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(45, ${20 + exitLight * 25}%, ${45 + exitLight * 20}%, ${exitLight * 0.2})`} />
                    <stop offset="50%" stopColor={`hsla(45, 15%, 35%, ${exitLight * 0.05})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                {/* Exit light -- grows */}
                <circle cx="100" cy="80" r={3 + exitLight * 30}
                  fill={`url(#${svgId}-exitGlow)`} />

                {/* Tunnel left wall */}
                <line x1="0" y1="0" x2={100 - wallSpread * 80} y2="80"
                  stroke={`hsla(0, 0%, ${10 + exitLight * 8}%, ${0.06 + exitLight * 0.03})`} strokeWidth="0.6" />
                <line x1="0" y1="160" x2={100 - wallSpread * 80} y2="80"
                  stroke={`hsla(0, 0%, ${10 + exitLight * 8}%, ${0.06 + exitLight * 0.03})`} strokeWidth="0.6" />
                {/* Tunnel right wall */}
                <line x1="200" y1="0" x2={100 + wallSpread * 80} y2="80"
                  stroke={`hsla(0, 0%, ${10 + exitLight * 8}%, ${0.06 + exitLight * 0.03})`} strokeWidth="0.6" />
                <line x1="200" y1="160" x2={100 + wallSpread * 80} y2="80"
                  stroke={`hsla(0, 0%, ${10 + exitLight * 8}%, ${0.06 + exitLight * 0.03})`} strokeWidth="0.6" />

                {/* Depth rings -- perspective markers */}
                {Array.from({ length: 4 }, (_, i) => {
                  const d = (i + 1) / 5;
                  const ringR = 60 * (1 - d * 0.7);
                  return (
                    <ellipse key={i} cx="100" cy="80" rx={ringR} ry={ringR * 0.5}
                      fill="none" stroke={`hsla(0, 0%, 15%, ${0.02 + exitLight * 0.01})`} strokeWidth={safeSvgStroke(0.3)} />
                  );
                })}

                {/* 40% marker */}
                {pushes >= 2 && pushes < PUSH_STEPS && (
                  <motion.text x="100" y="130" textAnchor="middle" fontSize="5" fontFamily="monospace"
                    fill="hsla(0, 10%, 30%, 0.1)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}>
                    only {Math.round(40 + t * 60)}% done
                  </motion.text>
                )}

                {/* Light flood at exit */}
                {t >= 1 && (
                  <motion.rect x="0" y="0" width="200" height="160"
                    fill="hsla(45, 25%, 50%, 0.08)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}
                    transition={{ duration: 2 }} />
                )}

                {/* Survived label */}
                {t >= 1 && (
                  <motion.text x="100" y="80" textAnchor="middle" dominantBaseline="middle"
                    fontSize="7" fontFamily="monospace" fill="hsla(45, 20%, 55%, 0.2)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.5, duration: 1.5 }}>
                    THROUGH
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={pushes} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {pushes === 0 ? 'Dark tunnel. Pinprick of light.' : pushes < PUSH_STEPS ? `Push ${pushes}. Deeper. The light grows.` : 'Through. Light floods in. You survived.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PUSH_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < pushes ? `hsla(45, ${15 + i * 5}%, ${38 + i * 3}%, 0.5)` : palette.primaryFaint, opacity: i < pushes ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five pushes through the cave. The walls narrowed, then opened. Light flooded in. Your mind said stop. You found the reserve.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The central governor theory. Fatigue is a psychological safety brake, not a physiological limit. Pushing past the mental brake expands the window of tolerance.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dark. Push. Light.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}