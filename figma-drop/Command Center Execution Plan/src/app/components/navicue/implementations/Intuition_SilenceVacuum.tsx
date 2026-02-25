/**
 * INTUITION #6 — The Silence Vacuum
 * "The soul speaks in whispers. Kill the shout."
 * Pattern C (Hold) — Hold mute for 5 seconds, word appears
 * STEALTH KBE: Sustained stillness = Patience (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'embodying', 'Practice');
type Stage = 'arriving' | 'noisy' | 'whispered' | 'resonant' | 'afterglow';
const WHISPERS = ['Leave', 'Rest', 'Speak', 'Wait', 'Begin'];

export default function Intuition_SilenceVacuum({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [word] = useState(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({ duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] SilenceVacuum patience=confirmed stillness=true whisper="${word}"`);
      setStage('whispered');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('noisy'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '12px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.03, 1) }} />
          </motion.div>
        )}
        {stage === 'noisy' && (
          <motion.div key="no" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A noisy room. Press Mute. Hold it. Wait for the whisper.
            </div>
            {/* Noise visualization */}
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '30px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i}
                  animate={{ height: hold.isHolding ? [4, 4] : [6 + Math.random() * 16, 4 + Math.random() * 12] }}
                  transition={{ duration: 0.2 + Math.random() * 0.3, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ width: '3px', borderRadius: '1.5px',
                    background: themeColor(TH.primaryHSL, hold.isHolding ? 0.02 : 0.04, 2),
                    transition: 'background 0.3s' }} />
              ))}
            </div>
            {hold.progress > 0.8 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0.3, y: 0 }}
                style={{ fontSize: '14px', fontStyle: 'italic', color: themeColor(TH.accentHSL, 0.3, 10) }}>
                {word}
              </motion.div>
            )}
            <motion.div {...hold.holdProps}
              style={{ width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer',
                background: hold.isHolding
                  ? themeColor(TH.accentHSL, 0.06 + hold.progress * 0.06, 3)
                  : themeColor(TH.primaryHSL, 0.04, 2),
                border: `2px solid ${themeColor(TH.accentHSL, 0.06 + hold.progress * 0.1, 5)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                userSelect: 'none', WebkitUserSelect: 'none' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2 + hold.progress * 0.2, 8) }}>
                {hold.isHolding ? 'Muting...' : 'Mute'}
              </span>
            </motion.div>
            <div style={{ width: '60px', height: '3px', borderRadius: '1.5px', background: themeColor(TH.primaryHSL, 0.03, 1) }}>
              <div style={{ height: '100%', borderRadius: '1.5px', width: `${hold.progress * 100}%`,
                background: themeColor(TH.accentHSL, 0.1, 5), transition: 'width 0.1s' }} />
            </div>
          </motion.div>
        )}
        {stage === 'whispered' && (
          <motion.div key="wh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '18px', fontStyle: 'italic', color: themeColor(TH.accentHSL, 0.25, 8) }}>{word}</div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              That word floated up from the silence. The soul speaks in whispers. The world speaks in shouts. You cannot hear the whisper until you kill the shout. Five seconds of real silence — and the signal appeared.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Attentional silence. The Default Mode Network activates when external stimulation decreases. Mindfulness research (Brewer, Yale): even brief periods of mental silence allow pre-conscious processing to surface into awareness. The "shower insight" phenomenon — insights during low-stimulation activities — is the DMN working. The whisper was always there. You just couldn{"'"}t hear it over the noise.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Whispered.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}