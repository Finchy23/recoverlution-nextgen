/**
 * INTERPRETER #10 — The Interpreter Seal (The Rosetta Stone)
 * "Judgment is a wall. Understanding is a door."
 * ARCHETYPE: Pattern A (Tap) — Hieroglyphs rearrange into clarity
 * ENTRY: Ambient fade — Rosetta Stone glow fades in from dark
 * STEALTH KBE: Completing the seal = shift from egocentric to allocentric (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'glow' | 'active' | 'translating' | 'resonant' | 'afterglow';

// Hieroglyph-like symbols that will rearrange
const GLYPHS = ['\u2625', '\u2638', '\u2721', '\u262F', '\u2606', '\u2302', '\u2318', '\u2740'];
const FINAL_TEXT = 'I understand';

export default function Interpreter_InterpreterSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('glow');
  const [translateProgress, setTranslateProgress] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const activateSeal = () => {
    console.log(`[KBE:K] InterpreterSeal sealActivated=true socialCognitionComplete=true`);
    setStage('translating');
    // Animate glyph→text translation
    let frame = 0;
    const totalFrames = 20;
    const animInterval = window.setInterval(() => {
      frame++;
      setTranslateProgress(frame / totalFrames);
      if (frame >= totalFrames) {
        clearInterval(animInterval);
        t(() => setStage('resonant'), 4000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
      }
    }, 100);
    T.current.push(animInterval as unknown as number);
  };

  // Interpolate between glyphs and final text
  const getDisplayChars = () => {
    if (translateProgress === 0) return GLYPHS;
    if (translateProgress >= 1) return FINAL_TEXT.split('');
    const chars: string[] = [];
    const targetLen = FINAL_TEXT.length;
    for (let i = 0; i < Math.max(GLYPHS.length, targetLen); i++) {
      if (i / targetLen < translateProgress) {
        chars.push(FINAL_TEXT[i] || '');
      } else if (i < GLYPHS.length) {
        chars.push(GLYPHS[i]);
      }
    }
    return chars;
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'glow' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Rosetta stone shape */}
            <div style={{ width: '120px', height: '140px', borderRadius: '8px 8px 60px 60px',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 4)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: `0 0 30px ${themeColor(TH.accentHSL, 0.04, 4)}` }}>
              {[0, 1, 2].map(row => (
                <div key={row} style={{ display: 'flex', gap: '8px' }}>
                  {GLYPHS.slice(row * 3, row * 3 + 3).map((g, i) => (
                    <motion.div key={i} animate={{ opacity: [0.15, 0.3, 0.15] }}
                      transition={{ duration: 3, delay: (row * 3 + i) * 0.3, repeat: Infinity }}
                      style={{ fontSize: '14px', color: themeColor(TH.accentHSL, 0.25, 8) }}>
                      {g}
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Judgment is a wall. Understanding is a door. Social cognition: the shift from egocentric judgment to allocentric understanding is the highest marker of social maturity.
            </div>
            {/* Stone with glyphs */}
            <div style={{ width: '130px', height: '150px', borderRadius: '8px 8px 65px 65px',
              background: themeColor(TH.primaryHSL, 0.05, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {[0, 1, 2].map(row => (
                <div key={row} style={{ display: 'flex', gap: '8px' }}>
                  {GLYPHS.slice(row * 3, row * 3 + 3).map((g, i) => (
                    <div key={i} style={{ fontSize: '14px', color: themeColor(TH.accentHSL, 0.2, 8) }}>{g}</div>
                  ))}
                </div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={activateSeal}
              style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>translate the stone</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'translating' && (
          <motion.div key="tr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px' }}>
            {/* Stone with morphing glyphs→text */}
            <motion.div
              animate={{ boxShadow: `0 0 ${20 + translateProgress * 30}px ${themeColor(TH.accentHSL, 0.06 + translateProgress * 0.06, 6)}` }}
              style={{ width: '130px', height: '150px', borderRadius: '8px 8px 65px 65px',
                background: themeColor(TH.primaryHSL, 0.05 + translateProgress * 0.03, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1 + translateProgress * 0.08, 6 + translateProgress * 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px' }}>
                {getDisplayChars().map((ch, i) => (
                  <motion.span key={i}
                    animate={{ opacity: [0.4, 1] }}
                    transition={{ duration: 0.3 }}
                    style={{ fontSize: translateProgress >= 1 ? '16px' : '14px',
                      fontWeight: translateProgress >= 1 ? 500 : 400,
                      color: translateProgress >= 1
                        ? themeColor(TH.accentHSL, 0.5, 12)
                        : themeColor(TH.accentHSL, 0.2 + translateProgress * 0.15, 8) }}>
                    {ch}
                  </motion.span>
                ))}
              </div>
            </motion.div>
            {translateProgress >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.5 }}
                style={{ ...navicueType.hint, color: palette.textFaint }}>the seal is complete</motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Social cognition. The Interpreter Collection maps the shift from reactive judgment to considered understanding. Each tool {'\u2014'} scanning subtext, de-masking villains, climbing down ladders, flipping coins, translating criticism {'\u2014'} builds the neural pathways of allocentric thinking. I understand.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Understood.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}