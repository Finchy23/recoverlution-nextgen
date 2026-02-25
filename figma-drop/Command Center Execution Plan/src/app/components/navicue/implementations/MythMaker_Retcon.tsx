/**
 * MYTHMAKER #2 — The Retcon (Retroactive Continuity)
 * "You cannot change the footage, but you can change the genre."
 * ARCHETYPE: Pattern B (Drag) — A film strip of a "bad memory."
 * Drag horizontally to splice in a new meaning. Genre shifts from
 * Tragedy to Origin Story. Narrative Identity Theory.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FRAMES = [
  { label: 'THE WOUND', genre: 'Tragedy' },
  { label: 'THE FALL', genre: 'Tragedy' },
  { label: 'THE DARK', genre: 'Tragedy' },
  { label: 'THE LESSON', genre: 'Origin Story' },
  { label: 'THE FORGING', genre: 'Origin Story' },
  { label: 'THE RISE', genre: 'Origin Story' },
];

export default function MythMaker_Retcon({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  const splicePoint = Math.floor(t * 6); // which frame is being "re-edited"
  const genreShift = t > 0.5; // genre flips after halfway

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The footage is loading...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You cannot change the footage, but you can change the genre. Was it a Tragedy? Or was it an Origin Story?
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to splice a new meaning</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '320px' }}>

            {/* Genre label */}
            <motion.div
              animate={{ color: genreShift ? themeColor(TH.accentHSL, 0.6, 20) : 'hsla(0, 15%, 45%, 0.5)' }}
              style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {genreShift ? 'ORIGIN STORY' : 'TRAGEDY'}
            </motion.div>

            {/* Film strip */}
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, display: 'flex', gap: '4px', padding: '8px', borderRadius: radius.sm,
                background: themeColor(TH.voidHSL, 0.8, 2), width: '100%', justifyContent: 'center' }}>
              {FRAMES.map((frame, i) => {
                const isRetconned = i >= 3 && i <= splicePoint + 2;
                const isOriginal = i < 3;
                const alpha = isRetconned ? 0.12 + t * 0.06 : isOriginal ? 0.06 * (1 - t * 0.3) : 0.04;
                return (
                  <motion.div key={i}
                    animate={{
                      borderColor: isRetconned ? themeColor(TH.accentHSL, 0.15, 15) : themeColor(TH.primaryHSL, 0.06, 5),
                      background: isRetconned ? themeColor(TH.accentHSL, alpha, 10) : themeColor(TH.primaryHSL, alpha, 3),
                    }}
                    style={{
                      width: '44px', height: '60px', borderRadius: radius.xs,
                      border: '1px solid', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '4px',
                      transition: 'all 0.4s ease',
                    }}>
                    {/* Sprocket holes */}
                    <div style={{ width: '6px', height: '2px', borderRadius: '1px',
                      background: themeColor(TH.primaryHSL, 0.08, 10) }} />
                    <div style={{ fontSize: '4px', fontFamily: 'monospace', textAlign: 'center',
                      color: isRetconned ? themeColor(TH.accentHSL, 0.4, 20) : themeColor(TH.primaryHSL, 0.15, 10),
                      letterSpacing: '0.05em', lineHeight: 1.3 }}>
                      {isRetconned && i >= 3 ? FRAMES[i].label : isOriginal ? FRAMES[i].label : '\u2022'}
                    </div>
                    <div style={{ width: '6px', height: '2px', borderRadius: '1px',
                      background: themeColor(TH.primaryHSL, 0.08, 10) }} />
                  </motion.div>
                );
              })}
            </div>

            {/* Splice indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '1px', background: themeColor(TH.primaryHSL, 0.08, 5) }} />
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.2 + t * 0.15, 10),
                letterSpacing: '0.1em' }}>
                {Math.round(t * 100)}% RE-EDITED
              </div>
              <div style={{ width: '40px', height: '1px', background: themeColor(TH.primaryHSL, 0.08, 5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The event remains. The meaning changes. It was never a tragedy.
            </div>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 15) }}>
              genre: origin story
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The Director{'\u2019'}s Cut.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}