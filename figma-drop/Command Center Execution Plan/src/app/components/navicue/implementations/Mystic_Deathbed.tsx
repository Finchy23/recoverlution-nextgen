/**
 * MYSTIC #3 — The Deathbed
 * "Death is the destination we all share."
 * INTERACTION: Screen progressively fades to white — 5 taps.
 * Each tap brightens the screen and dims the interface. At the end:
 * pure white. "What do you wish you had done?" Terror management.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FADE_STEPS = 5;
const PROMPTS = [
  'The room is dimming.',
  'Faces surround you. Blurring.',
  'Sounds are fading.',
  'Only one question remains.',
  'What do you wish you had done?',
];

export default function Mystic_Deathbed({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [faded, setFaded] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const fade = () => {
    if (stage !== 'active' || faded >= FADE_STEPS) return;
    const next = faded + 1;
    setFaded(next);
    if (next >= FADE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = faded / FADE_STEPS;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The light is changing...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>This is the end. Death is the destination we all share. Let it strip away the pride and fear. What do you wish you had done?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap as the screen fades to white</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={fade}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: faded >= FADE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, 0%, ${4 + t * 92}%, ${0.95})` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* World elements fading */}
                {/* Room outline */}
                <motion.rect x="30" y="20" width="160" height="100" rx="3"
                  fill="none" stroke={`hsla(0, 0%, ${20 * (1 - t)}%, ${0.06 * (1 - t)})`}
                  strokeWidth="0.4"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 - t }}
                />
                {/* Window */}
                <motion.rect x="130" y="30" width="30" height="25" rx="2"
                  fill={`hsla(210, ${8 * (1 - t)}%, ${15 * (1 - t)}%, ${0.04 * (1 - t)})`}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 - t }}
                />
                {/* Faces — blurring circles */}
                {[60, 90, 120].map((x, i) => (
                  <motion.circle key={i} cx={x} cy={55} r={8 - t * 3}
                    fill={`hsla(25, ${6 * (1 - t)}%, ${18 * (1 - t)}%, ${0.04 * (1 - t)})`}
                    initial={{ opacity: 1, r: 8 }}
                    animate={{ opacity: 1 - t, r: 8 - t * 3 }}
                    transition={{ duration: 0.8 }}
                  />
                ))}
                {/* Heartbeat line — flattening */}
                <motion.path
                  d={t >= 1
                    ? 'M 40,90 L 180,90'
                    : `M 40,90 L ${50 + t * 10},90 L ${60 - t * 5},${85 + t * 3} L ${70 - t * 5},${95 - t * 3} L ${80 + t * 5},90 L 180,90`
                  }
                  fill="none" stroke={`hsla(0, ${10 * (1 - t)}%, ${25 * (1 - t)}%, ${0.06 * (1 - t)})`}
                  strokeWidth="0.4"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 - t * 0.8 }}
                />
                {/* Current prompt */}
                {faded > 0 && (
                  <motion.text x="110" y="135" textAnchor="middle" fontSize="11" fontFamily="Georgia, serif"
                    fill={`hsla(0, 0%, ${t < 0.6 ? 30 + t * 20 : 60 - t * 40}%, ${0.1 + t * 0.05})`}
                    key={faded}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ duration: 1.5 }}>
                    {PROMPTS[faded - 1]}
                  </motion.text>
                )}
                {/* White wash overlay */}
                <rect x="0" y="0" width="220" height="160"
                  fill={`hsla(0, 0%, 100%, ${t * 0.1})`} />
              </svg>
            </div>
            <motion.div key={faded} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {faded === 0 ? 'A room. Faces. A heartbeat. All about to fade.' : faded < FADE_STEPS ? PROMPTS[faded - 1] : 'Pure white. The question hangs in light.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: FADE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < faded ? `hsla(0, 0%, ${40 + i * 10}%, 0.4)` : palette.primaryFaint, opacity: i < faded ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five fades. The room dimmed. The faces blurred. The heartbeat flattened. Then white. Pure, total white. And in that white, one question: what do you wish you had done? Not tomorrow. Not someday. The answer you just felt, that is your compass.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Terror management. Mortality salience clarifies intrinsic values. Death strips away the trivial. What remains is what matters.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Room. White. Truth.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}