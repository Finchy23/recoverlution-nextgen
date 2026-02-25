/**
 * AESTHETE #10 -- The Masterpiece Frame (The Proof)
 * "Reality is raw material. Your perception is the art. Frame it beautifully."
 * INTERACTION: An ornate museum frame overlay. Tap to apply it to
 * different "scenes" of ordinary life -- messy desk, rain on glass,
 * an empty hallway. Each frame transforms the mundane into art.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Values Clarification', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SCENES = [
  { name: 'the messy desk', desc: 'papers, cables, a cold cup', elements: ['▭', '◦', '▬', '◻', '▫'] },
  { name: 'rain on glass', desc: 'drops tracing paths down the pane', elements: ['·', '·', '·', '·', '·'] },
  { name: 'the empty hallway', desc: 'light at the far end, silence', elements: ['▫', '▫', '▫', '◻', '○'] },
  { name: 'your reflection', desc: 'tired eyes, half a smile, still here', elements: ['◯', '·', '·', '·', '⌓'] },
];

export default function Aesthete_MasterpieceFrame({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [sceneIdx, setSceneIdx] = useState(0);
  const [framed, setFramed] = useState<number[]>([]);
  const [framing, setFraming] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const frameScene = () => {
    if (stage !== 'active' || framing || framed.includes(sceneIdx)) return;
    setFraming(true);
    addTimer(() => {
      const next = [...framed, sceneIdx];
      setFramed(next);
      setFraming(false);
      if (next.length >= SCENES.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      } else {
        setSceneIdx(prev => prev + 1);
      }
    }, 1800);
  };

  const current = SCENES[sceneIdx];
  const isFramed = framed.includes(sceneIdx);

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Values Clarification" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Preparing the frame...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Reality is raw material. Your perception is the art.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to frame the ordinary as art</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={frameScene}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: isFramed ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Museum frame + scene */}
            <motion.div key={sceneIdx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'relative', width: '200px', height: '160px' }}>
              {/* Ornate frame border */}
              <motion.div
                animate={{
                  borderColor: framing || isFramed ? 'hsla(42, 50%, 50%, 0.5)' : palette.primaryFaint,
                  boxShadow: framing || isFramed ? '0 0 20px hsla(42, 50%, 50%, 0.1), inset 0 0 20px hsla(42, 50%, 50%, 0.05)' : 'none',
                }}
                style={{ position: 'absolute', inset: 0, border: `3px solid ${palette.primaryFaint}`, borderRadius: '2px' }}>
                {/* Inner frame line */}
                <div style={{ position: 'absolute', inset: '6px', border: `1px solid ${framing || isFramed ? 'hsla(42, 40%, 45%, 0.3)' : palette.primaryFaint}`, borderRadius: '1px' }} />
                {/* Corner ornaments */}
                {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy], i) => (
                  <motion.div key={i}
                    animate={{ opacity: framing || isFramed ? 0.4 : 0.08 }}
                    style={{ position: 'absolute', [cx ? 'right' : 'left']: '2px', [cy ? 'bottom' : 'top']: '2px', width: '8px', height: '8px', borderRadius: '1px', border: `1px solid hsla(42, 50%, 50%, 0.3)` }} />
                ))}
              </motion.div>
              {/* Scene content */}
              <div style={{ position: 'absolute', inset: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {/* Scene elements -- abstract representations */}
                <div style={{ display: 'flex', gap: '8px', opacity: framing ? 0.7 : 0.3, filter: framing || isFramed ? 'grayscale(0.7) contrast(1.2)' : 'none', transition: 'all 1.5s ease' }}>
                  {current.elements.map((el, i) => (
                    <span key={i} style={{ fontSize: '14px' }}>{el}</span>
                  ))}
                </div>
                <div style={{ ...navicueType.texture, color: isFramed ? palette.text : palette.textFaint, fontSize: '11px', fontStyle: 'italic', opacity: 0.5, textAlign: 'center' }}>
                  {current.desc}
                </div>
              </div>
              {/* Museum label */}
              {(framing || isFramed) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                  style={{ position: 'absolute', bottom: '-24px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', ...navicueType.hint, color: 'hsla(42, 40%, 55%, 0.6)', fontSize: '11px', fontStyle: 'italic' }}>
                  "{current.name}" -- mixed media, today
                </motion.div>
              )}
            </motion.div>
            {/* Scene name */}
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4, marginTop: '14px' }}>
              {current.name}
            </div>
            {/* Progress */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {SCENES.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: framed.includes(i) ? 'hsla(42, 50%, 55%, 0.6)' : palette.primaryFaint, opacity: framed.includes(i) ? 0.6 : 0.15 }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>
              {isFramed ? 'art' : framing ? 'framing...' : 'tap to frame'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Everything is a masterpiece. If you frame it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Your perception is the art. You are the curator of your own existence.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Framed. Beautiful. Yours.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}