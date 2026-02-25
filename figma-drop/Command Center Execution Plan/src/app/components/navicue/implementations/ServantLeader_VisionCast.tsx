/**
 * SERVANT LEADER #6 — The Vision Cast
 * "People don't buy products. They buy better versions of themselves."
 * INTERACTION: A projector beam hitting a blank wall. Each tap adds
 * a frame to the "movie" — shapes of a future forming on the wall.
 * From blank to vivid. Show them the future.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FRAMES = [
  { label: 'blank wall', elements: [] },
  { label: 'a horizon', elements: [{ type: 'line', x1: 70, y1: 80, x2: 190, y2: 80 }] },
  { label: 'a path', elements: [{ type: 'path', d: 'M 130 120 Q 140 90, 150 80 Q 160 70, 170 65' }] },
  { label: 'a mountain', elements: [{ type: 'polygon', points: '140,80 160,50 180,80' }] },
  { label: 'a sun', elements: [{ type: 'circle', cx: 170, cy: 42, r: 10 }] },
  { label: 'the future', elements: [{ type: 'glow' }] },
];

export default function ServantLeader_VisionCast({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [frame, setFrame] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const project = () => {
    if (stage !== 'active' || frame >= FRAMES.length - 1) return;
    const next = frame + 1;
    setFrame(next);
    if (next >= FRAMES.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const t = frame / (FRAMES.length - 1);
  const beamOpacity = 0.03 + t * 0.04;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The projector hums...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>People don't buy products. They buy better versions of themselves. Paint the picture. Show them the future.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to project the next frame</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={project}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: frame >= FRAMES.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(240, 10%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Projector */}
                <rect x="10" y="60" width="18" height="12" rx="2" fill="hsla(0, 0%, 22%, 0.3)" />
                <circle cx="16" cy="66" r="3" fill={`hsla(45, 40%, 55%, ${0.15 + t * 0.15})`} />
                {/* Beam */}
                <polygon points="28,62 65,30 200,30 200,130 65,130 28,70"
                  fill={`hsla(45, 30%, 55%, ${beamOpacity})`} />
                {/* Wall / Screen */}
                <rect x="65" y="28" width="140" height="105" rx="4"
                  fill="none" stroke={`hsla(0, 0%, 25%, ${0.1 + t * 0.05})`} strokeWidth="0.5" />
                {/* Projected elements — accumulative */}
                {FRAMES.slice(1, frame + 1).map((f, fIdx) =>
                  f.elements.map((el: any, eIdx: number) => {
                    const opacity = 0.15 + (fIdx / FRAMES.length) * 0.2;
                    const color = `hsla(45, 30%, 55%, ${opacity})`;
                    if (el.type === 'line') return (
                      <motion.line key={`${fIdx}-${eIdx}`} x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2}
                        stroke={color} strokeWidth="0.8"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
                    );
                    if (el.type === 'path') return (
                      <motion.path key={`${fIdx}-${eIdx}`} d={el.d}
                        fill="none" stroke={color} strokeWidth="0.8"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
                    );
                    if (el.type === 'polygon') return (
                      <motion.polygon key={`${fIdx}-${eIdx}`} points={el.points}
                        fill={`hsla(45, 25%, 45%, ${opacity * 0.5})`} stroke={color} strokeWidth="0.5"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
                    );
                    if (el.type === 'circle') return (
                      <motion.circle key={`${fIdx}-${eIdx}`} cx={el.cx} cy={el.cy} r={el.r}
                        fill={`hsla(45, 50%, 60%, ${opacity})`}
                        initial={{ r: 0, opacity: 0 }} animate={{ r: el.r, opacity: 1 }} transition={{ duration: 1.2 }} />
                    );
                    if (el.type === 'glow') return (
                      <motion.rect key={`${fIdx}-${eIdx}`} x="68" y="31" width="134" height="99" rx="3"
                        fill="hsla(45, 35%, 55%, 0.03)"
                        initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ duration: 2 }} />
                    );
                    return null;
                  })
                )}
              </svg>
              {/* Frame counter */}
              <div style={{ position: 'absolute', top: '8px', right: '10px', fontFamily: 'monospace', fontSize: '11px', color: `hsla(45, 30%, 55%, ${0.2 + t * 0.15})` }}>
                {frame}/{FRAMES.length - 1}
              </div>
            </div>
            <motion.div key={frame} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {FRAMES[frame].label}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {FRAMES.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i <= frame ? 'hsla(45, 40%, 55%, 0.5)' : palette.primaryFaint, opacity: i <= frame ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The blank wall became a future. You projected it. They saw it. Now they want to walk toward it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Shared intentionality. A joint mental representation of a goal. The basis of all cooperation.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Blank. Projected. Shared.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}