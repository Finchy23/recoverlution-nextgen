/**
 * PHENOMENOLOGIST #6 — The Proprioception Check
 * "You exist in space. You occupy volume. Feel your own dimensions."
 * INTERACTION: A skeletal wireframe silhouette. User closes eyes
 * and taps body points — the wireframe lights up at each touched
 * joint. Building a spatial map of the self without vision.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Somatic Regulation', 'embodying', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const JOINTS = [
  { id: 'nose', x: 100, y: 22, label: 'Nose. Found.', instruction: 'Touch your nose.' },
  { id: 'shoulder_l', x: 68, y: 50, label: 'Left shoulder. Found.', instruction: 'Touch your left shoulder.' },
  { id: 'shoulder_r', x: 132, y: 50, label: 'Right shoulder. Found.', instruction: 'Touch your right shoulder.' },
  { id: 'elbow_l', x: 52, y: 78, label: 'Left elbow. Found.', instruction: 'Touch your left elbow.' },
  { id: 'knee_r', x: 118, y: 130, label: 'Right knee. Found.', instruction: 'Touch your right knee.' },
  { id: 'heart', x: 100, y: 62, label: 'Heart. Found.', instruction: 'Place your hand on your heart.' },
];

// Wireframe bones connecting joints
const BONES = [
  ['nose', 'shoulder_l'], ['nose', 'shoulder_r'],
  ['shoulder_l', 'elbow_l'], ['shoulder_r', 'knee_r'],
  ['shoulder_l', 'heart'], ['shoulder_r', 'heart'],
];

export default function Phenomenologist_ProprioceptionCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [found, setFound] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const findJoint = () => {
    if (stage !== 'active' || currentIdx >= JOINTS.length) return;
    const j = JOINTS[currentIdx];
    const next = [...found, j.id];
    setFound(next);
    const nextIdx = currentIdx + 1;
    setCurrentIdx(nextIdx);
    if (nextIdx >= JOINTS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const jointMap = Object.fromEntries(JOINTS.map(j => [j.id, j]));

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Somatic Regulation" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Mapping your dimensions...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You exist in space. You occupy volume. Feel your own dimensions.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>close your eyes and tap when you've found each point</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={findJoint}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: currentIdx >= JOINTS.length ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Wireframe body */}
            <div style={{ position: 'relative', width: '200px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 10%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Bones */}
                {BONES.map(([a, b], i) => {
                  const ja = jointMap[a];
                  const jb = jointMap[b];
                  if (!ja || !jb) return null;
                  const lit = found.includes(a) && found.includes(b);
                  return (
                    <motion.line key={i}
                      x1={ja.x} y1={ja.y} x2={jb.x} y2={jb.y}
                      stroke={lit ? 'hsla(180, 30%, 55%, 0.3)' : 'hsla(0, 0%, 30%, 0.08)'}
                      strokeWidth="0.8"
                      initial={{ opacity: 0.15 }}
                      animate={{ opacity: lit ? 0.5 : 0.15 }}
                    />
                  );
                })}
                {/* Spine */}
                <line x1="100" y1="40" x2="100" y2="115" stroke="hsla(0, 0%, 30%, 0.08)" strokeWidth="0.5" />
                <line x1="100" y1="115" x2="82" y2="155" stroke="hsla(0, 0%, 30%, 0.08)" strokeWidth="0.5" />
                <line x1="100" y1="115" x2="118" y2="155" stroke="hsla(0, 0%, 30%, 0.08)" strokeWidth="0.5" />
                {/* Joints */}
                {JOINTS.map((j, i) => {
                  const isFound = found.includes(j.id);
                  const isCurrent = i === currentIdx;
                  return (
                    <g key={j.id}>
                      <motion.circle cx={j.x} cy={j.y}
                        r={isFound ? 5 : isCurrent ? 4 : 3}
                        fill={isFound ? 'hsla(180, 40%, 55%, 0.5)' : 'hsla(0, 0%, 30%, 0.15)'}
                        animate={{
                          opacity: isFound ? 0.7 : isCurrent ? [0.2, 0.4, 0.2] : 0.15,
                          r: isCurrent && !isFound ? [3, 5, 3] : isFound ? 5 : 3,
                        }}
                        transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
                      />
                      {isFound && (
                        <motion.circle cx={j.x} cy={j.y} r={10}
                          fill="hsla(180, 40%, 55%, 0.05)"
                          initial={{ r: 5, opacity: 0.2 }} animate={{ r: 12, opacity: 0 }}
                          transition={{ duration: 1 }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Current instruction */}
            {currentIdx < JOINTS.length ? (
              <motion.div key={currentIdx} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                style={{ textAlign: 'center' }}>
                <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>{JOINTS[currentIdx].instruction}</div>
                <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginTop: '3px', opacity: 0.3 }}>tap when found</div>
              </motion.div>
            ) : found.length > 0 && (
              <div style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic', opacity: 0.4 }}>
                {JOINTS[found.length - 1].label}
              </div>
            )}
            <div style={{ display: 'flex', gap: '5px' }}>
              {JOINTS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < found.length ? 'hsla(180, 40%, 55%, 0.5)' : palette.primaryFaint, opacity: i < found.length ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every joint found. You occupy volume. You exist in space. Anchored.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Proprioceptive awareness restored. Body-self reconnected. Dissociation countered.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Found. Mapped. Embodied.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}