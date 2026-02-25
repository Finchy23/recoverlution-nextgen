/**
 * MAGNUM OPUS II #1 — The Distillation (Essence)
 * "Complexity is the first step. Simplicity is the final step."
 * Pattern A (Type) — User types their "One Word" essence
 * STEALTH KBE: Reducing identity to singularity = Clarity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'boiling' | 'typed' | 'resonant' | 'afterglow';

export default function Mastery_Distillation({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [word, setWord] = useState('');
  const [bubbles, setBubbles] = useState(12);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('boiling'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  // Simulate boiling reduction
  useEffect(() => {
    if (stage !== 'boiling') return;
    const iv = setInterval(() => setBubbles(p => Math.max(1, p - 1)), 800);
    return () => clearInterval(iv);
  }, [stage]);

  const accept = () => {
    if (!word.trim() || stage !== 'boiling') return;
    console.log(`[KBE:K] Distillation word="${word.trim()}" essentialism=true singularity=true`);
    setStage('typed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  const typeInt = useTypeInteraction({ onAccept: accept, onChange: (v: string) => setWord(v) });

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', width: '40px' }}>
              {[0,1,2].map(i => (
                <motion.div key={i} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
                  style={{ width: '5px', height: '5px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.08, 3) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'boiling' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '0 0 40px 40px',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 3)}`, borderTop: 'none',
              overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {Array.from({ length: bubbles }).map((_, i) => (
                <motion.div key={i} animate={{ y: [0, -10, -20], opacity: [0.6, 0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 1 + Math.random(), delay: Math.random() * 0.5 }}
                  style={{ position: 'absolute', bottom: `${10 + Math.random() * 30}%`, left: `${15 + Math.random() * 70}%`,
                    width: '4px', height: '4px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.1, 6) }} />
              ))}
              {bubbles <= 1 && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ width: '10px', height: '10px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.25, 10), marginBottom: '12px',
                    boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
              )}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {bubbles > 1 ? 'The liquid boils down... reduces... concentrating...' : 'One glowing drop remains. What is your One Word?'}
            </div>
            {bubbles <= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <input type="text" value={word} onChange={e => typeInt.onChange(e.target.value)}
                  placeholder="Your essence..."
                  style={{ background: 'transparent', border: `1px solid ${themeColor(TH.accentHSL, 0.1, 4)}`,
                    borderRadius: radius.md, padding: '8px 16px', color: palette.text, fontSize: '13px',
                    textAlign: 'center', outline: 'none', width: '180px' }} />
                {word.trim() && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.9 }} onClick={accept}
                    style={{ padding: '8px 20px', borderRadius: '9999px', cursor: 'pointer',
                      background: themeColor(TH.accentHSL, 0.06, 3),
                      border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                    <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>The Essence</div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'typed' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', maxWidth: '280px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}
              style={{ fontSize: '24px', color: themeColor(TH.accentHSL, 0.5, 14), fontStyle: 'italic',
                textAlign: 'center', letterSpacing: '3px' }}>
              {word.trim()}
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Boil down your life. This is the one drop that remains. Essentialism: the disciplined pursuit of less, but better. Greg McKeown argues that almost everything is noise — only a vital few things truly matter. You just named yours.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The Science: Cognitive load theory shows that when identity is diffuse, decision fatigue multiplies. When identity is singular — one word, one principle — every choice filters through clarity. Reduce. Simplify. Distill.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Distilled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}