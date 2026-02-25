/**
 * SOURCE #7 — The Void
 * "Form is emptiness. Emptiness is form. In the void, there is no fear."
 * INTERACTION: Absolute blackness. Each tap removes a subtle remaining
 * element — a faint border, a hint of glow, a pixel — until there is
 * truly nothing. In the nothing, rest.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const VOID_STEPS = 5;
const ELEMENTS = [
  'The border dissolves.',
  'The glow fades.',
  'The grain disappears.',
  'The last pixel goes.',
  'Nothing.',
];

export default function Source_Void({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [voided, setVoided] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const removeElement = () => {
    if (stage !== 'active' || voided >= VOID_STEPS) return;
    const next = voided + 1;
    setVoided(next);
    if (next >= VOID_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4500);
    }
  };

  const t = voided / VOID_STEPS;
  const borderOpacity = Math.max(0, 0.08 - t * 0.08);
  const glowOpacity = Math.max(0, 0.04 - (t > 0.2 ? (t - 0.2) * 0.05 : 0));
  const grainCount = Math.max(0, Math.floor(12 * (1 - t * 1.2)));

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Darkness descends...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Form is emptiness. Emptiness is form. In the void, there is no fear.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to remove what remains</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={removeElement}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: voided >= VOID_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <motion.div
              animate={{ backgroundColor: `hsla(0, 0%, ${2 - t * 2}%, 1)` }}
              transition={{ duration: 1.5 }}
              style={{
                position: 'relative', width: '200px', height: '180px',
                borderRadius: radius.md, overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0)',
              }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Center glow — fading */}
                <circle cx="100" cy="90" r="40"
                  fill={`hsla(0, 0%, 12%, ${glowOpacity})`} />
                {/* Grain particles — disappearing */}
                {Array.from({ length: grainCount }, (_, i) => (
                  <circle key={i}
                    cx={20 + (i * 47 % 160)}
                    cy={15 + (i * 31 % 150)}
                    r="0.5"
                    fill={`hsla(0, 0%, ${10 + (i * 7 % 8)}%, ${0.08 * (1 - t)})`}
                  />
                ))}
                {/* Faint edge highlights — removing */}
                {t < 0.6 && (
                  <rect x="0" y="0" width="200" height="180" rx="12" fill="none"
                    stroke={`hsla(0, 0%, 10%, ${0.03 * (1 - t * 1.5)})`} strokeWidth="0.5" />
                )}
              </svg>
              {/* True void state indicator */}
              {voided >= VOID_STEPS && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  transition={{ delay: 1.5, duration: 3 }}
                  style={{
                    position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                    fontFamily: 'monospace', fontSize: '11px', color: 'hsla(0, 0%, 15%, 0.15)',
                    letterSpacing: '4px',
                  }}>
                  void
                </motion.div>
              )}
            </motion.div>
            <motion.div key={voided} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {voided === 0 ? 'Almost dark. Not quite nothing.' : ELEMENTS[voided - 1]}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: VOID_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < voided ? 'hsla(0, 0%, 20%, 0.4)' : palette.primaryFaint, opacity: i < voided ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: 'hsla(0, 0%, 40%, 0.45)' }}>Nothing. Absolute void. And in the nothing, no fear. Rest here.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 2.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Sensory deprivation. All input removed. The brain generates its own state. Deep relaxation. Insight from the void.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ duration: 3.5 }} style={{ ...navicueType.afterglow, color: 'hsla(0, 0%, 25%, 0.3)', textAlign: 'center' }}>
            Form. Emptiness. Rest.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}