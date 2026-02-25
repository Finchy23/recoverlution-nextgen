/**
 * SERVANT #7 — The Ego Dissolve
 * "You are not the statue. You are the soil."
 * ARCHETYPE: Pattern C (Hold) — Hold to dissolve statue into forest
 * ENTRY: Scene-first — marble statue
 * STEALTH KBE: Letting go of image = Ego Transcendence (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'statue' | 'dissolved' | 'resonant' | 'afterglow';

export default function Servant_EgoDissolve({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] EgoDissolve egoTranscendence=confirmed surrender=true`);
      setStage('dissolved');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('statue'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const dissolve = hold.progress;
  const statueHeight = 40 * (1 - dissolve);
  const forestHeight = dissolve * 30;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '12px', height: '30px', borderRadius: '3px 3px 0 0',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
        )}
        {stage === 'statue' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Hold to dissolve. Let the statue become soil.
            </div>
            {/* Statue dissolving into forest */}
            <div style={{ width: '100px', height: '60px', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
              {/* Statue */}
              <div style={{ width: '14px', height: `${statueHeight}px`, borderRadius: '4px 4px 0 0',
                background: themeColor(TH.primaryHSL, 0.06 * (1 - dissolve) + 0.02, 3),
                transition: 'height 0.2s, opacity 0.2s',
                opacity: 1 - dissolve * 0.6 }} />
              {/* Sand particles falling */}
              {dissolve > 0.1 && Array.from({ length: Math.floor(dissolve * 8) }).map((_, i) => (
                <motion.div key={i} animate={{ y: [0, 8 + i * 2], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                  style={{ position: 'absolute', bottom: `${statueHeight + 2}px`,
                    left: `${45 + (Math.random() - 0.5) * 20}px`,
                    width: '2px', height: '2px', borderRadius: '50%',
                    background: themeColor(TH.primaryHSL, 0.08, 4) }} />
              ))}
              {/* Forest growing */}
              {dissolve > 0.3 && (
                <div style={{ position: 'absolute', bottom: 0, display: 'flex', gap: '4px' }}>
                  {Array.from({ length: Math.floor(dissolve * 5) }).map((_, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: forestHeight * (0.5 + Math.random() * 0.5) }}
                      style={{ width: '3px', borderRadius: '1px',
                        background: themeColor(TH.accentHSL, 0.06 + dissolve * 0.06, 3 + i) }} />
                  ))}
                </div>
              )}
            </div>
            <div {...hold.holdProps}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer', userSelect: 'none',
                touchAction: 'none',
                background: hold.isHolding
                  ? themeColor(TH.accentHSL, 0.1, 5)
                  : themeColor(TH.accentHSL, 0.06, 3),
                border: `2px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.18 : 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>
                {hold.isHolding ? 'Dissolving...' : 'Hold to dissolve'}
              </div>
            </div>
            {hold.progress > 0 && (
              <div style={{ width: '80px', height: '3px', borderRadius: '1.5px',
                background: themeColor(TH.primaryHSL, 0.04, 2) }}>
                <div style={{ height: '100%', borderRadius: '1.5px', width: `${hold.progress * 100}%`,
                  background: themeColor(TH.accentHSL, 0.15, 8),
                  transition: 'width 0.2s' }} />
              </div>
            )}
          </motion.div>
        )}
        {stage === 'dissolved' && (
          <motion.div key="dis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The statue is gone. The forest is lush. You are not the marble image — you are the soil beneath it. The more you give yourself away, the more life grows around you. That{"'"}s not loss. That{"'"}s transcendence.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Ego transcendence. Maslow{"'"}s final revision of his hierarchy placed self-transcendence above self-actualization. The ego — the story of "I" — is useful but limiting. The Bodhisattva ideal: the one who delays their own enlightenment to help all beings. You are not the statue. You are the soil. The forest that grows where the ego dissolved is more alive than any monument.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Soil.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}