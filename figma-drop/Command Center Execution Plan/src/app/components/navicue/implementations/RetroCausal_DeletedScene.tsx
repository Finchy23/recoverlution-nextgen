/**
 * RETRO-CAUSAL #2 — The "Deleted Scene"
 * "Depression edits out the light. Find the smile. Splice it back in."
 * ARCHETYPE: Pattern A (Tap ×3) — Tap to recover 3 deleted positive moments
 * ENTRY: Cold Open — "CUT" appears, then the film reel materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

const SCENES = [
  { label: 'a laugh you forgot', frame: 'frame 1' },
  { label: 'a kindness you missed', frame: 'frame 2' },
  { label: 'a beauty you walked past', frame: 'frame 3' },
];

export default function RetroCausal_DeletedScene({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [found, setFound] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const recover = () => {
    if (stage !== 'active' || found >= 3) return;
    const n = found + 1;
    setFound(n);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '28px', fontFamily: 'monospace', letterSpacing: '0.2em', color: palette.text, textAlign: 'center' }}>
            CUT
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={recover}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: found >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              That day was not all shadow. Something good happened that you forgot. Depression edited it out. Go back to the raw footage. Find the deleted scenes and splice them back in.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {SCENES.map((s, i) => (
                <motion.div key={i} style={{
                  width: '70px', height: '50px', borderRadius: radius.xs, position: 'relative',
                  background: i < found ? themeColor(TH.accentHSL, 0.1, 8) : themeColor(TH.primaryHSL, 0.04, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, i < found ? 0.15 : 0.04, 5)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}
                  animate={{ scale: i === found - 1 ? [1, 1.08, 1] : 1 }}>
                  {i < found ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.text, textAlign: 'center', padding: '4px' }}>
                      {s.label}
                    </motion.div>
                  ) : (
                    <div style={{ fontSize: '16px', opacity: 0.15 }}>?</div>
                  )}
                  {/* Film strip perforations */}
                  <div style={{ position: 'absolute', bottom: '2px', left: '4px', display: 'flex', gap: '3px' }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{ width: '3px', height: '2px', background: 'rgba(255,255,255,0.04)' }} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} style={{ width: '24px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < found ? themeColor(TH.accentHSL, 0.4, 10) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {found < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>find the scene</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Three scenes restored. Mood-congruent memory bias had edited the light from the film. You went back to the raw footage and found what the depression cut: a laugh, a kindness, a beauty. The record is now more complete.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Spliced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}