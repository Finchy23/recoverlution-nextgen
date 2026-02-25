/**
 * MYCELIUM #3 — The Symbiosis Check
 * "Relationships are not transactions. They are ecologies."
 * INTERACTION: Two organisms — one protects, one nourishes. Drag
 * tokens between "Who protects you?" and "Who do you feed?" to
 * balance the ecosystem of your relationships.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Values Clarification', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PROMPTS = [
  { q: 'Who protects you?', placeholder: 'name someone...', side: 'receive' as const },
  { q: 'Who do you feed?', placeholder: 'name someone...', side: 'give' as const },
  { q: 'Who does both?', placeholder: 'the mutual one...', side: 'both' as const },
];

export default function Mycelium_SymbiosisCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState('');
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
    if (idx < PROMPTS.length - 1) {
      setIdx(prev => prev + 1);
    } else {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    }
  };

  const sideColor = (side: string) =>
    side === 'receive' ? 'hsla(200, 35%, 55%, 0.5)' : side === 'give' ? 'hsla(140, 35%, 50%, 0.5)' : palette.accent;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Values Clarification" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Balancing the ecosystem...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Relationships are not transactions. They are ecologies.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>balance the ecosystem</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px' }}>
            {/* Organism visualization */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '8px' }}>
              {/* Receive organism */}
              <motion.div animate={{ opacity: idx >= 0 ? 0.6 : 0.15, scale: idx === 0 ? 1.1 : 1 }}
                style={{ width: '40px', height: '40px', borderRadius: '50% 50% 50% 20%', background: 'hsla(200, 35%, 55%, 0.2)', border: `1px solid hsla(200, 35%, 55%, 0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px', opacity: 0.5 }}>∘</span>
              </motion.div>
              {/* Connection line */}
              <motion.div animate={{ opacity: answers.length >= 2 ? 0.4 : 0.1 }}
                style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, hsla(200, 35%, 55%, 0.3), hsla(140, 35%, 50%, 0.3))` }} />
              {/* Give organism */}
              <motion.div animate={{ opacity: idx >= 1 ? 0.6 : 0.15, scale: idx === 1 ? 1.1 : 1 }}
                style={{ width: '48px', height: '35px', borderRadius: `${radius.sm} ${radius.sm} ${radius.xl} ${radius.xl}`, background: 'hsla(140, 35%, 50%, 0.2)', border: `1px solid hsla(140, 35%, 50%, 0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px', opacity: 0.5 }}>◌</span>
              </motion.div>
            </div>
            {/* Current prompt */}
            {idx < PROMPTS.length && (
              <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <div style={{ ...navicueType.texture, color: palette.text, fontSize: '13px', fontStyle: 'italic', textAlign: 'center' }}>
                  {PROMPTS[idx].q}
                </div>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder={PROMPTS[idx].placeholder}
                    style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${sideColor(PROMPTS[idx].side)}`, borderRadius: radius.sm, color: palette.text, fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <motion.button onClick={submit} whileHover={{ scale: 1.05 }}
                    style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.accent}`, borderRadius: radius.sm, color: palette.accent, fontSize: '11px', cursor: 'pointer' }}>
                    →
                  </motion.button>
                </div>
              </motion.div>
            )}
            {/* Completed answers */}
            {answers.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {answers.map((a, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ padding: '12px 18px', borderRadius: radius.md, border: `1px solid ${sideColor(PROMPTS[i]?.side || 'both')}`, ...navicueType.hint, color: palette.text, fontSize: '11px', opacity: 0.5 }}>
                    {a}
                  </motion.div>
                ))}
              </div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{answers.length} of {PROMPTS.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The ecosystem is balanced.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Not a transaction. An ecology. Both thrive.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Symbiosis. Both alive.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}