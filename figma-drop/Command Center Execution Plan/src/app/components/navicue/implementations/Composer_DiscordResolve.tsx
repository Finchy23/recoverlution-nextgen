/**
 * COMPOSER #1 — The Discord Resolve
 * "Conflict is tension waiting for resolution. Find the chord."
 * ARCHETYPE: Pattern B (Drag) — Slide discordant waves to harmonic sweet spot
 * ENTRY: Scene-first — clashing audio waves
 * STEALTH KBE: Speed of finding sweet spot = Social Tuning (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Theater');
type Stage = 'arriving' | 'clashing' | 'harmonized' | 'resonant' | 'afterglow';

export default function Composer_DiscordResolve({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const startRef = useRef(Date.now());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);
      console.log(`[KBE:K] DiscordResolve socialTuning=confirmed resolutionTimeS=${elapsed}`);
      setStage('harmonized');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => { setStage('clashing'); startRef.current = Date.now(); }, 2200); return () => T.current.forEach(clearTimeout); }, []);

  const discord = 1 - drag.progress;
  const waveA = Math.sin(Date.now() / 200) * 8 * discord;
  const waveB = Math.sin(Date.now() / 180 + 2) * 8 * discord;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="60" height="30" viewBox="0 0 60 30">
              <path d="M0,15 Q15,5 30,25 T60,15" fill="none" stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="1.5" />
              <path d="M0,15 Q15,25 30,5 T60,15" fill="none" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1.5" />
            </svg>
          </motion.div>
        )}
        {stage === 'clashing' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two notes clashing. Slide them into harmony.
            </div>
            <svg width="160" height="50" viewBox="0 0 160 50">
              <motion.path
                d={`M0,25 Q40,${25 + waveA} 80,${25 - waveA} T160,25`}
                fill="none" stroke={themeColor(TH.primaryHSL, 0.08 + drag.progress * 0.04, 4)} strokeWidth="2" />
              <motion.path
                d={`M0,25 Q40,${25 + waveB} 80,${25 - waveB} T160,25`}
                fill="none" stroke={themeColor(TH.accentHSL, 0.08 + drag.progress * 0.04, 4)} strokeWidth="2" />
            </svg>
            {drag.progress > 0.85 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10), fontStyle: 'italic' }}>
                Hummmm ♪
              </motion.div>
            )}
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', top: '-6px', left: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'harmonized' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            A perfect Major Third. Conflict was not noise — it was tension waiting for resolution. You didn{"'"}t silence the opposing note. You harmonized with it. That{"'"}s the chord.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Social tuning. In music, consonance emerges when wave frequencies lock into simple ratios (3:2, 4:3). In relationships, conflict resolution follows the same physics — not silencing the other voice, but finding the interval where both can vibrate together. Gottman{"'"}s research: stable couples don{"'"}t avoid conflict; they find the chord within it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Resolved.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}