/**
 * RETRO-CAUSAL #10 — The Retro Seal
 * "The past is not stone. It is clay. You have reshaped the foundation."
 * ARCHETYPE: Pattern A (Tap) — Tap to transform film strip into golden file
 * ENTRY: Ambient Fade — film burning to gold, all elements arrive together
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Identity Koan');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_RetroSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [transformed, setTransformed] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const transform = () => {
    if (stage !== 'active' || transformed) return;
    setTransformed(true);
    t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 4000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="180" height="120" viewBox="0 0 180 120">
              {/* Film strip */}
              <motion.rect x="50" y="20" width="80" height="80" rx="2"
                fill={themeColor(TH.primaryHSL, 0.06, 3)}
                stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="0.5"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
              {/* Sprocket holes */}
              {[0, 1, 2, 3].map(i => (
                <motion.rect key={i} x="53" y={28 + i * 18} width="5" height="6" rx="1"
                  fill={themeColor(TH.primaryHSL, 0.03, 2)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} />
              ))}
              {/* Burn effect — amber glow at edges */}
              <motion.rect x="50" y="90" width="80" height="10" rx="1"
                fill={themeColor(TH.accentHSL, 0.06, 10)}
                animate={{ opacity: [0.04, 0.1, 0.04] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>burning and becoming</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={transform}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: transformed ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              I am someone who reshapes the past.
            </div>
            <motion.div style={{
              width: '100px', height: '100px', borderRadius: transformed ? '8px' : '2px',
              background: transformed
                ? themeColor(TH.accentHSL, 0.12, 10)
                : themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, transformed ? 0.2 : 0.06, 8)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 2s ease',
            }}
              animate={{ rotate: transformed ? 0 : 0, scale: transformed ? [1, 1.08, 1] : 1 }}>
              {transformed ? (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.6, scale: 1 }} transition={{ delay: 0.5 }}
                  style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.text, textAlign: 'center' }}>
                  RESTORED<br />.gold
                </motion.div>
              ) : (
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>
                  old.film
                </div>
              )}
            </motion.div>
            {!transformed && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>transform</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Transformed. The old film burned away and left a golden file in its place. The past is not stone. It is clay, rewritten every time you access it. You are not a prisoner of your history. You are its editor, its director, its author. Restored.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Restored.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}