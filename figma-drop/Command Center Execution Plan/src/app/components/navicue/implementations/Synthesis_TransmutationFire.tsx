/**
 * SYNTHESIS #4 — The Transmutation Fire
 * "Heat changes the state of matter. Burn it to learn it."
 * ARCHETYPE: Pattern D (Type) — Type a lesson from failure
 * ENTRY: Scene-first — fire
 * STEALTH KBE: Extracting lesson = Post-Traumatic Growth / Learning Orientation (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'fire' | 'forged' | 'resonant' | 'afterglow';

export default function Synthesis_TransmutationFire({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lesson, setLesson] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'the lesson the fire revealed...',
    onAccept: (value: string) => {
      if (value.trim().length < 5) return;
      setLesson(value.trim());
      console.log(`[KBE:K] TransmutationFire lesson="${value.trim()}" postTraumaticGrowth=confirmed learningOrientation=true`);
      setStage('forged');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('fire'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ y: [-2, -6, -2], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                style={{ width: '4px', height: '10px', borderRadius: '2px',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  display: 'inline-block', margin: '0 2px' }} />
            ))}
          </motion.div>
        )}
        {stage === 'fire' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Fire */}
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  animate={{ height: [10 + Math.random() * 10, 18 + Math.random() * 12, 10 + Math.random() * 10], opacity: [0.08, 0.14, 0.08] }}
                  transition={{ duration: 0.6 + Math.random() * 0.3, repeat: Infinity }}
                  style={{ width: '5px', borderRadius: '2px 2px 0 0',
                    background: i === 2 ? themeColor(TH.accentHSL, 0.12, 6) : themeColor(TH.accentHSL, 0.06, 3) }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Feed your failure to the fire. What wisdom does it release?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Transmute</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'forged' && (
          <motion.div key="fo" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px 16px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <span style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12), fontStyle: 'italic' }}>
                "{lesson}"
              </span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              The scroll emerges from the fire. The failure burned away; the wisdom remains. Heat changes the state of matter. Your failure just became your steel.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Post-traumatic growth. Tedeschi & Calhoun{"'"}s research shows that 50-70% of trauma survivors report significant positive change: new possibilities, deeper relationships, greater appreciation for life. The fire doesn{"'"}t just destroy; it transmutes. But only if you extract the lesson. Burn it to learn it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Forged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}