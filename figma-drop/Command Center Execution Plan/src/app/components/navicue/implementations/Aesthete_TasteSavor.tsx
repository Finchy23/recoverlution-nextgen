/**
 * AESTHETE #9 -- The Taste Savor
 * "Do not eat. Taste. If you are not present for the flavor, you are starving."
 * INTERACTION: A macro-scale citrus burst. The user types texture words
 * (not taste words) -- "fibrous," "bursting," "gritty." Each word
 * deepens the zoom. Decouple speed from reward.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PROMPTS = [
  { instruction: 'Describe the texture of the first bite.', placeholder: 'fibrous, gritty, slippery...', zoom: 1 },
  { instruction: 'What does it feel like on your tongue?', placeholder: 'bursting, rough, melting...', zoom: 1.5 },
  { instruction: 'Slow down. What do your teeth feel?', placeholder: 'resistance, crunch, give...', zoom: 2.2 },
  { instruction: 'The final layer. What lingers?', placeholder: 'coating, tingle, warmth...', zoom: 3 },
];

export default function Aesthete_TasteSavor({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [promptIdx, setPromptIdx] = useState(0);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const submit = () => {
    if (!input.trim() || stage !== 'active') return;
    const next = [...answers, input.trim()];
    setAnswers(next);
    setInput('');
    if (promptIdx < PROMPTS.length - 1) {
      setPromptIdx(prev => prev + 1);
    } else {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    }
  };

  const currentZoom = promptIdx < PROMPTS.length ? PROMPTS[promptIdx].zoom : PROMPTS[PROMPTS.length - 1].zoom;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Preparing the bite...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Do not eat. Taste. Describe the texture, not the taste.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>slow down into each layer</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            {/* Macro zoom visualization -- abstract citrus cross-section */}
            <motion.div
              animate={{ scale: currentZoom }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', position: 'relative', transformOrigin: 'center' }}>
              <svg width="100%" height="100%" viewBox="0 0 120 120">
                {/* Citrus cross-section -- abstract */}
                <circle cx="60" cy="60" r="55" fill="none" stroke="hsla(35, 60%, 55%, 0.25)" strokeWidth="3" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="hsla(40, 50%, 50%, 0.15)" strokeWidth="1" />
                {/* Segments */}
                {Array.from({ length: 10 }, (_, i) => {
                  const angle = (i / 10) * Math.PI * 2;
                  const x2 = 60 + Math.cos(angle) * 45;
                  const y2 = 60 + Math.sin(angle) * 45;
                  return <line key={i} x1="60" y1="60" x2={x2} y2={y2} stroke="hsla(40, 40%, 50%, 0.1)" strokeWidth="0.5" />;
                })}
                {/* Vesicle texture dots */}
                {Array.from({ length: 30 }, (_, i) => {
                  const angle = Math.random() * Math.PI * 2;
                  const r = 10 + Math.random() * 30;
                  return <circle key={`v${i}`} cx={60 + Math.cos(angle) * r} cy={60 + Math.sin(angle) * r} r={0.8 + Math.random() * 1.2} fill="hsla(45, 50%, 55%, 0.15)" />;
                })}
                {/* Center pip */}
                <circle cx="60" cy="60" r="4" fill="hsla(35, 50%, 50%, 0.2)" />
              </svg>
            </motion.div>
            {/* Current prompt */}
            {promptIdx < PROMPTS.length && (
              <motion.div key={promptIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
                  {PROMPTS[promptIdx].instruction}
                </div>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder={PROMPTS[promptIdx].placeholder}
                    style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.sm, color: palette.text, fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <motion.button onClick={submit} whileHover={{ scale: 1.05 }}
                    style={{ padding: '14px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.accent}`, borderRadius: radius.sm, color: palette.accent, fontSize: '11px', cursor: 'pointer' }}>
                    savor
                  </motion.button>
                </div>
              </motion.div>
            )}
            {/* Past answers */}
            {answers.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {answers.map((a, i) => (
                  <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                    style={{ padding: '3px 8px', borderRadius: radius.md, border: `1px solid ${palette.primaryFaint}`, ...navicueType.hint, color: palette.text, fontSize: '11px' }}>
                    {a}
                  </motion.span>
                ))}
              </div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>layer {answers.length + 1} of {PROMPTS.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You tasted it. For the first time, you were actually there.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Slow enough to meet the flavor. Present enough to be fed.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Savored. Present. Fed.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}