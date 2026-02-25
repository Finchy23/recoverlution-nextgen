/**
 * MYCELIUM #6 — The Mirror Neuron
 * "Your biology is wireless. You catch emotions like you catch a cold."
 * INTERACTION: A split screen. A face expression on the left. You mimic
 * it by tapping matching expressions on the right. Each match
 * "installs" the emotion. Infect yourself with joy.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Somatic Regulation', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const EXPRESSIONS = [
  { label: 'calm', face: '◯', desc: 'softened brow, slow breath' },
  { label: 'joy', face: '◠', desc: 'cheeks lifted, eyes bright' },
  { label: 'wonder', face: '○', desc: 'mouth open, wide gaze' },
  { label: 'warmth', face: '◡', desc: 'gentle smile, heart open' },
];

export default function Mycelium_MirrorNeuron({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mirrored, setMirrored] = useState<number[]>([]);
  const [installing, setInstalling] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleMirror = () => {
    if (stage !== 'active' || installing || mirrored.includes(currentIdx)) return;
    setInstalling(true);
    addTimer(() => {
      const next = [...mirrored, currentIdx];
      setMirrored(next);
      setInstalling(false);
      if (next.length >= EXPRESSIONS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      } else {
        setCurrentIdx(prev => prev + 1);
      }
    }, 1200);
  };

  const current = EXPRESSIONS[currentIdx];

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Somatic Regulation" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Tuning the mirror...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your biology is wireless. Infect yourself with joy.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>mirror each expression to install it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px' }}>
            {currentIdx < EXPRESSIONS.length && (
              <motion.div key={currentIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%' }}>
                {/* Split screen */}
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  {/* Left — the expression to mirror */}
                  <div style={{ flex: 1, padding: '20px 12px', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.md, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>feel this</div>
                    <div style={{ fontSize: '32px' }}>{current.face}</div>
                    <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic', opacity: 0.5 }}>{current.desc}</div>
                  </div>
                  {/* Right — mirror button */}
                  <motion.button onClick={handleMirror}
                    animate={{ borderColor: installing ? palette.accent : palette.primaryFaint, boxShadow: installing ? `0 0 16px ${palette.accentGlow}` : 'none' }}
                    whileHover={{ scale: 1.02 }}
                    style={{ flex: 1, padding: '20px 12px', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.md, textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>you</div>
                    {installing ? (
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 0.8 }}
                        style={{ fontSize: '32px' }}>{current.face}</motion.div>
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px dashed ${palette.primaryFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>tap</span>
                      </div>
                    )}
                    {installing && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                        style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px' }}>installing {current.label}...</motion.div>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {EXPRESSIONS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: mirrored.includes(i) ? palette.accent : palette.primaryFaint, opacity: mirrored.includes(i) ? 0.5 : 0.15 }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, fontSize: '11px' }}>{mirrored.length} of {EXPRESSIONS.length} installed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You caught it. The emotion is installed.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Your biology is wireless. Choose what you catch.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Infected with joy.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}