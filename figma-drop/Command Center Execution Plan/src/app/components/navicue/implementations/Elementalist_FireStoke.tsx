/**
 * ELEMENTALIST #3 — The Fire Stoke (Action)
 * "Motivation is not a lightning strike. It is a coal. Tend it."
 * ARCHETYPE: Pattern A (Tap) — Rapid tapping to stoke dying ember
 * ENTRY: Scene-first — dying ember
 * STEALTH KBE: Sustained tapping rhythm = Drive / Activation Rate (K)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'knowing', 'Canopy');
type Stage = 'arriving' | 'stoking' | 'blazing' | 'resonant' | 'afterglow';

const TAPS_NEEDED = 12;

export default function Elementalist_FireStoke({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [heat, setHeat] = useState(0);
  const decayRef = useRef<number>();
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('stoking'), 2000); return () => { T.current.forEach(clearTimeout); clearInterval(decayRef.current); }; }, []);

  // Heat decays over time
  useEffect(() => {
    if (stage === 'stoking') {
      decayRef.current = window.setInterval(() => {
        setHeat(h => Math.max(0, h - 0.5));
      }, 400);
    }
    return () => clearInterval(decayRef.current);
  }, [stage]);

  const blow = useCallback(() => {
    if (stage !== 'stoking') return;
    setHeat(h => {
      const next = Math.min(TAPS_NEEDED, h + 1);
      if (next >= TAPS_NEEDED) {
        clearInterval(decayRef.current);
        console.log(`[KBE:K] FireStoke drive=confirmed activationRate=sustained`);
        setStage('blazing');
        t(() => setStage('resonant'), 5000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
      }
      return next;
    });
  }, [stage]);

  const progress = heat / TAPS_NEEDED;
  const emberColor = `hsla(${25 + progress * 15}, ${20 + progress * 15}%, ${25 + progress * 10}%, ${0.06 + progress * 0.12})`;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.05, 2) }} />
          </motion.div>
        )}
        {stage === 'stoking' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A dying ember. Tap to blow on it. Keep the rhythm — stop and it dies.
            </div>
            {/* Ember */}
            <motion.div whileTap={{ scale: 1.1 }} onClick={blow}
              animate={{ boxShadow: `0 0 ${4 + progress * 20}px ${emberColor}` }}
              style={{ width: `${20 + progress * 20}px`, height: `${20 + progress * 20}px`,
                borderRadius: '50%', cursor: 'pointer',
                background: emberColor,
                border: `1px solid hsla(${30 + progress * 10}, ${25 + progress * 10}%, ${30 + progress * 8}%, ${0.1 + progress * 0.1})`,
                transition: 'width 0.2s, height 0.2s' }} />
            {/* Progress bar */}
            <div style={{ width: '80px', height: '3px', borderRadius: '1.5px',
              background: themeColor(TH.primaryHSL, 0.03, 1) }}>
              <div style={{ height: '100%', borderRadius: '1.5px',
                width: `${progress * 100}%`,
                background: themeColor(TH.accentHSL, 0.12, 6), transition: 'width 0.15s' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {progress < 0.3 ? 'Blow harder...' : progress < 0.7 ? 'It glows...' : 'Almost there...'}
            </div>
          </motion.div>
        )}
        {stage === 'blazing' && (
          <motion.div key="bl" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.2, 0.15] }}
              transition={{ duration: 1.5, repeat: 3 }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: `hsla(40, 35%, 35%, 0.15)`,
                boxShadow: `0 0 24px hsla(35, 30%, 30%, 0.08)` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Flame. You stoked the coal into a fire. Motivation is not a lightning strike. It is a coal you tend. Action creates the heat. The fire doesn{"'"}t wait for you to feel like it — you have to blow on the spark first. Feed the fire.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Behavioral activation. The biggest myth about motivation: that it precedes action. Research shows the reverse — action precedes motivation. The "fire stoke" principle: start with the smallest possible action, then momentum builds. James Clear: "The most effective form of motivation is progress." You don{"'"}t wait until you feel motivated. You blow on the ember. The warmth follows.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Blazing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}