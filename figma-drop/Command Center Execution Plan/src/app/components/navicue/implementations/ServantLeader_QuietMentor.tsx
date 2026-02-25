/**
 * SERVANT LEADER #9 — The Quiet Mentor
 * "The best leader: when the job is done, the people say: 'We did it ourselves.'"
 * INTERACTION: A seed sits in soil. Each tap waters it — a stem grows,
 * leaves unfurl. But your hand (the mentor) fades as the plant grows
 * stronger. The teacher disappears. The student thrives.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const WATER_STEPS = 5;

export default function ServantLeader_QuietMentor({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [watered, setWatered] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const water = () => {
    if (stage !== 'active' || watered >= WATER_STEPS) return;
    const next = watered + 1;
    setWatered(next);
    if (next >= WATER_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = watered / WATER_STEPS;
  const stemHeight = 10 + t * 60;
  const mentorOpacity = Math.max(0, 0.3 - t * 0.3); // fades as plant grows
  const plantStrength = t;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A seed waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Plant an idea. Walk away. Let them think they thought of it. The best leader: when the job is done, the people say, we did it ourselves.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to water the seed</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={water}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: watered >= WATER_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(120, 8%, 7%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Soil */}
                <rect x="30" y="120" width="140" height="30" rx="3"
                  fill={`hsla(25, ${10 + t * 10}%, ${12 + t * 3}%, 0.4)`} />
                {/* Mentor hand — fading */}
                <motion.g initial={{ opacity: 1 }} animate={{ opacity: mentorOpacity }} transition={{ duration: 1 }}>
                  {/* Watering gesture */}
                  <path d="M 50 60 Q 55 50, 65 55 L 70 70 Q 65 75, 55 72 Z"
                    fill="none" stroke={`hsla(30, 15%, 40%, ${mentorOpacity})`} strokeWidth="0.8" />
                  {/* Water drops */}
                  {watered > 0 && watered < WATER_STEPS && (
                    <>
                      <motion.circle cx="63" cy="78" r="1.5" fill={`hsla(200, 30%, 50%, ${mentorOpacity * 0.6})`}
                        initial={{ cy: 78, opacity: 0.3 }}
                        animate={{ cy: [78, 90], opacity: [0.3, 0] }} transition={{ duration: 0.8, repeat: 2, repeatDelay: 0.2 }} />
                      <motion.circle cx="67" cy="80" r="1" fill={`hsla(200, 30%, 50%, ${mentorOpacity * 0.5})`}
                        initial={{ cy: 80, opacity: 0.2 }}
                        animate={{ cy: [80, 95], opacity: [0.2, 0] }} transition={{ duration: 0.9, repeat: 2, delay: 0.1 }} />
                    </>
                  )}
                </motion.g>
                {/* The growing plant */}
                <motion.g>
                  {/* Stem */}
                  <motion.line x1="100" y1="120" x2="100" y2={120 - stemHeight}
                    stroke={`hsla(120, ${25 + t * 15}%, ${30 + t * 12}%, ${0.2 + t * 0.3})`}
                    strokeWidth={1.5 + t} strokeLinecap="round"
                    animate={{ y2: 120 - stemHeight }}
                    transition={{ type: 'spring', stiffness: 60 }}
                  />
                  {/* Leaves — appear progressively */}
                  {t > 0.2 && (
                    <motion.ellipse cx="93" cy={120 - stemHeight * 0.4} rx={4 + t * 4} ry={2 + t * 1.5}
                      fill={`hsla(120, 30%, 35%, ${(t - 0.2) * 0.4})`}
                      transform={`rotate(-30, 93, ${120 - stemHeight * 0.4})`}
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.2) * 0.5 }}
                    />
                  )}
                  {t > 0.4 && (
                    <motion.ellipse cx="107" cy={120 - stemHeight * 0.55} rx={4 + t * 4} ry={2 + t * 1.5}
                      fill={`hsla(120, 30%, 35%, ${(t - 0.4) * 0.4})`}
                      transform={`rotate(30, 107, ${120 - stemHeight * 0.55})`}
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.4) * 0.5 }}
                    />
                  )}
                  {t > 0.6 && (
                    <motion.ellipse cx="92" cy={120 - stemHeight * 0.7} rx={3 + t * 3} ry={2 + t}
                      fill={`hsla(120, 30%, 35%, ${(t - 0.6) * 0.4})`}
                      transform={`rotate(-25, 92, ${120 - stemHeight * 0.7})`}
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.45 }}
                    />
                  )}
                  {t > 0.8 && (
                    <motion.ellipse cx="108" cy={120 - stemHeight * 0.85} rx={3 + t * 3} ry={2 + t}
                      fill={`hsla(120, 30%, 35%, ${(t - 0.8) * 0.4})`}
                      transform={`rotate(25, 108, ${120 - stemHeight * 0.85})`}
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.8) * 0.45 }}
                    />
                  )}
                  {/* Flower at top */}
                  {t >= 1 && (
                    <motion.circle cx="100" cy={120 - stemHeight - 5} r="6"
                      fill="hsla(45, 40%, 55%, 0.25)"
                      initial={{ r: 0, opacity: 0 }} animate={{ r: 6, opacity: 0.3 }}
                      transition={{ duration: 1.5 }}
                    />
                  )}
                </motion.g>
                {/* "We did it ourselves" — appears when mentor is gone */}
                {t >= 1 && (
                  <motion.text x="100" y="155" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(120, 25%, 45%, 0.25)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.25 }}
                    transition={{ delay: 1, duration: 1.5 }}>
                    "we did it ourselves"
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={watered} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {watered === 0 ? 'A seed in the soil. Your hand ready.' : watered < WATER_STEPS ? `Watering. Growing. Your hand fading.` : 'The plant thrives. The mentor is gone.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: WATER_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < watered ? 'hsla(120, 30%, 45%, 0.5)' : palette.primaryFaint, opacity: i < watered ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The plant grew. The hand disappeared. They think they did it themselves. That is leadership.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Autonomy supported. Intrinsic motivation amplified. The quiet mentor's work is done.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Planted. Watered. Vanished.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}