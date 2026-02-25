/**
 * OUROBOROS #2 — The Mirror Loop
 * "The observer becomes the observed becomes the observer."
 * INTERACTION: Two mirrors face each other. User taps to add reflections.
 * 5 reflections create infinite regression. Each reflection is slightly
 * shifted — the copy is never identical. The paradox of self-observation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Ouroboros_MirrorLoop({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [reflections, setReflections] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const reflect = () => {
    if (stage !== 'active' || reflections >= 5) return;
    const next = reflections + 1;
    setReflections(next);
    if (next >= 5) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
    }
  };

  const t = reflections / 5;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Mirrors facing mirrors...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The observer becomes the observed. Who watches the watcher? Place two mirrors facing. The infinite regression is not confusion; it is the shape of consciousness itself.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to add each reflection</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={reflect}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: reflections >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(260, ${6 + t * 6}%, ${5 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Nested rectangles — infinite regression */}
                {Array.from({ length: reflections }, (_, i) => {
                  const scale = 1 - (i + 1) * 0.15;
                  const w = 180 * scale; const h = 140 * scale;
                  const x = (220 - w) / 2; const y = (180 - h) / 2;
                  return (
                    <motion.rect key={`mirror-${i}`}
                      x={x} y={y} width={w} height={h}
                      fill="none" rx="3"
                      stroke={`hsla(260, ${12 + i * 3}%, ${30 + i * 6}%, ${0.04 + i * 0.015})`}
                      strokeWidth={0.5}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.12 + i * 0.015, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  );
                })}
                {/* Central eye/point */}
                {reflections > 0 && (
                  <motion.circle cx="110" cy="90" r={3 + t * 4}
                    fill={`hsla(260, ${15 + t * 12}%, ${35 + t * 15}%, ${t * 0.06})`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                  />
                )}
                <text x="110" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(260, 10%, 40%, ${0.05 + t * 0.04})`}>
                  {reflections > 0 ? `DEPTH: ${reflections}` : 'SURFACE'}
                </text>
              </svg>
            </div>
            <motion.div key={reflections} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {reflections === 0 ? 'Who watches?' : reflections === 1 ? 'The watcher watches.' : reflections === 2 ? 'The watcher of the watcher watches.' : reflections === 3 ? 'It goes all the way down.' : reflections === 4 ? 'And all the way back up.' : 'The loop is the answer.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < reflections ? 'hsla(260, 20%, 50%, 0.5)' : palette.primaryFaint, opacity: i < reflections ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five reflections deep. The mirror loop reveals the paradox of self-awareness: you cannot observe yourself without becoming something different from what you observe. The loop is not a bug; it is consciousness.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Douglas Hofstadter called it a "strange loop." The self that observes the self that observes the self. No ground floor. The ouroboros swallows itself, not to disappear, but to prove it exists.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Observer. Observed. Loop.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}