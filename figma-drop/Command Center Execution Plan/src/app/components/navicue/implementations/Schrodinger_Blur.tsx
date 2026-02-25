/**
 * SCHRODINGER #7 — The Blur (The Focus)
 * "To see one thing clearly, you must blind yourself to the others."
 * ARCHETYPE: Pattern C (Draw/Scrub) — Scrub to reveal one hidden word, others vanish
 * ENTRY: Ambient Fade — blurred field slowly materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'ambient' | 'active' | 'revealed' | 'resonant' | 'afterglow';

const WORDS = ['COURAGE', 'PATIENCE', 'RELEASE'];

export default function Schrodinger_Blur({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    onComplete: () => {
      if (revealedIndex === null) {
        const pick = Math.floor(Math.random() * 3);
        setRevealedIndex(pick);
        setStage('revealed');
        t(() => setStage('resonant'), 4500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
      }
    },
    coverageThreshold: 0.25,
  });

  useEffect(() => {
    t(() => setStage('active'), 2500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const blurLevel = Math.max(0, 12 - draw.coverage * 48);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [0.03, 0.06, 0.03] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '200px', height: '60px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.06, 4), filter: 'blur(12px)' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>something hidden</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Three words are hidden. Scrub the screen to reveal one. The others vanish forever. You cannot have everything.
            </div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '240px', height: '80px', borderRadius: radius.md,
              background: themeColor(TH.primaryHSL, 0.08, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 8)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
              cursor: 'crosshair', touchAction: 'none', userSelect: 'none',
            }}>
              {WORDS.map((w, i) => (
                <div key={i} style={{
                  fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
                  color: themeColor(TH.accentHSL, 0.08 + draw.coverage * 0.2, 12),
                  filter: `blur(${blurLevel}px)`, transition: 'filter 0.3s',
                }}>{w}</div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>scrub to defocus</div>
          </motion.div>
        )}
        {stage === 'revealed' && revealedIndex !== null && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div initial={{ scale: 1.2 }} animate={{ scale: 1 }}
              style={{ fontSize: '16px', fontFamily: 'monospace', letterSpacing: '0.3em',
                color: themeColor(TH.accentHSL, 0.4, 18) }}>
              {WORDS[revealedIndex]}
            </motion.div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {WORDS.filter((_, i) => i !== revealedIndex).map((w, i) => (
                <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                  style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, textDecoration: 'line-through' }}>
                  {w}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Opportunity cost salience. Explicitly showing that choosing A destroys B and C forces a high-commitment decision. Paradoxically, acknowledging what you lose increases satisfaction with what you chose.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>One word. Yours.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}