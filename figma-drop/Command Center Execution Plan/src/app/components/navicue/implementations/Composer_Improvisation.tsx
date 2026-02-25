/**
 * COMPOSER #9 — The Improvisation (The Jazz)
 * "There are no wrong notes. Only wrong resolutions."
 * ARCHETYPE: Pattern A (Tap) — Quick reaction to "mistake" note
 * ENTRY: Scene-first — playing track stumbles
 * STEALTH KBE: Fast reaction = Resilience. Freezing = Fear of Failure (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'playing' | 'mistake' | 'resolved' | 'resonant' | 'afterglow';

export default function Composer_Improvisation({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const mistakeTime = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('playing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'playing') return;
    const delay = 1500 + Math.random() * 2000;
    const id = window.setTimeout(() => { setStage('mistake'); mistakeTime.current = Date.now(); }, delay);
    return () => clearTimeout(id);
  }, [stage]);

  const resolve = () => {
    if (stage !== 'mistake') return;
    const reaction = Date.now() - mistakeTime.current;
    console.log(`[KBE:B] Improvisation reactionMs=${reaction} adaptability=${reaction < 2000} resilience=confirmed`);
    setStage('resolved');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <span style={{ fontSize: '11px', color: palette.textFaint }}>♪ ♫ ♪</span>
          </motion.div>
        )}
        {stage === 'playing' && (
          <motion.div key="pl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  animate={{ height: [8, 14 + Math.random() * 8, 8], opacity: [0.15, 0.3, 0.15] }}
                  transition={{ duration: 0.5 + i * 0.1, repeat: Infinity }}
                  style={{ width: '4px', borderRadius: '2px',
                    background: themeColor(TH.accentHSL, 0.08, 4) }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A melody is playing. Wait for it...
            </div>
          </motion.div>
        )}
        {stage === 'mistake' && (
          <motion.div key="mi" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div initial={{ scale: 1.2, rotate: -3 }} animate={{ scale: 1, rotate: 0 }}
              style={{ padding: '6px 14px', borderRadius: '6px',
                background: 'hsla(0, 15%, 22%, 0.04)',
                border: '1px solid hsla(0, 15%, 28%, 0.08)' }}>
              <span style={{ fontSize: '11px', color: 'hsla(0, 12%, 35%, 0.3)' }}>♭ WRONG NOTE</span>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Quick! Turn it into a jazz chord.
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={resolve}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>♯ Resolve</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resolved' && (
          <motion.div key="re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Jazz. The mistake became a chromatic passing tone. You slipped — and turned it into a dance move. There are no wrong notes in jazz, only wrong resolutions. The improvisation is the art.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Adaptability. Jazz improvisation requires "error positivity" — the neural capacity to treat mistakes as creative opportunities rather than failures. Charles Limb{"'"}s fMRI research on improvising jazz musicians: the prefrontal inhibition centers (inner critic) deactivate while the medial PFC (self-expression) lights up. You can{"'"}t improvise with the critic on stage. Play through the mistake.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Jazzed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}