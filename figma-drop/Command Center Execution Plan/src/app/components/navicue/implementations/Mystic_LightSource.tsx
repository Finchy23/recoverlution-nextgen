/**
 * MYSTIC #4 — The Light Source
 * "Turn around. Look at the light that makes the movie possible."
 * Pattern A (Tap) — Screen shows movie; tap to turn around; see projector beam
 * STEALTH KBE: Shifting from content to context = Consciousness-as-Substrate / Source Awareness (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'screen' | 'turned' | 'resonant' | 'afterglow';

export default function Mystic_LightSource({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('screen'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const turn = () => {
    if (stage !== 'screen') return;
    console.log(`[KBE:K] LightSource sourceAwareness=confirmed consciousnessAsSubstrate=true`);
    setStage('turned');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '14px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'screen' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A projector beam hits a screen. Your life plays as a movie. You{"'"}re watching the screen. But the instruction says: "Look at the beam."
            </div>
            {/* Screen */}
            <div style={{ width: '80px', height: '50px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div animate={{ opacity: [0.04, 0.06, 0.04] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '11px', color: palette.textFaint }}>Your Story</motion.div>
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={turn}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Turn Around</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'turned' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* Light beam */}
            <motion.div animate={{ opacity: [0.06, 0.1, 0.06] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 8),
                boxShadow: `0 0 20px ${themeColor(TH.accentHSL, 0.06, 6)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              The Light. You were obsessed with the movie — the plot, the characters, the drama. But the movie is just light on a wall. Turn around. The projector is consciousness itself. The light that makes every experience possible. You are not the movie. You are the light.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Consciousness as substrate. Plato{"'"}s Cave allegory (Republic, Book VII): prisoners watching shadows on a wall, mistaking them for reality. The "turn around" is the philosophical awakening — seeing the fire (source) rather than the shadows (content). In non-dual traditions (Advaita Vedanta), consciousness is not produced by the brain but is the field in which brain, body, and world appear. Like the screen in a cinema: unchanged by the movie.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Source.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}