/**
 * GRANDMASTER #7 — The Tempo Control
 * "When they speed up, you slow down. Control the clock."
 * ARCHETYPE: Pattern B (Drag) + Rhythm Tap — Slow metronome, then tap in sync
 * ENTRY: Cold open — frantic ticking
 * STEALTH KBE: Holding slow beat = Composure; rushing = Anxiety (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'slowing' | 'tapping' | 'controlled' | 'resonant' | 'afterglow';

export default function Grandmaster_TempoControl({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tapCount, setTapCount] = useState(0);
  const [beatFlash, setBeatFlash] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const tapTimes = useRef<number[]>([]);

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      setStage('tapping');
    },
  });

  useEffect(() => {
    t(() => setStage('slowing'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Slow beat pulse (1.5s intervals) when tapping
  useEffect(() => {
    if (stage !== 'tapping') return;
    const id = window.setInterval(() => {
      setBeatFlash(true);
      setTimeout(() => setBeatFlash(false), 200);
    }, 1500);
    return () => clearInterval(id);
  }, [stage]);

  const tap = () => {
    if (stage !== 'tapping') return;
    tapTimes.current.push(Date.now());
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 4) {
      // Measure rhythm consistency
      const gaps = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        gaps.push(tapTimes.current[i] - tapTimes.current[i - 1]);
      }
      const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const composure = avgGap > 1000; // Holding slow beat
      console.log(`[KBE:E] TempoControl avgGapMs=${Math.round(avgGap)} composure=${composure}`);
      setStage('controlled');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  const bpm = stage === 'slowing' ? Math.round(200 - drag.progress * 160) : 40;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ rotate: [-20, 20, -20] }} transition={{ duration: 0.3, repeat: Infinity }}
              style={{ width: '3px', height: '30px', background: themeColor(TH.primaryHSL, 0.12, 6),
                borderRadius: '2px', transformOrigin: 'bottom center' }} />
          </motion.div>
        )}
        {stage === 'slowing' && (
          <motion.div key="sl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Slow the tempo. Control the clock.
            </div>
            <motion.div animate={{ rotate: [-15 * (1 - drag.progress), 15 * (1 - drag.progress), -15 * (1 - drag.progress)] }}
              transition={{ duration: 0.3 + drag.progress * 1.2, repeat: Infinity }}
              style={{ width: '3px', height: '40px', background: themeColor(TH.accentHSL, 0.15, 8),
                borderRadius: '2px', transformOrigin: 'bottom center' }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>{bpm} BPM</div>
            <div ref={drag.containerRef} style={{ width: '40px', height: '100px', touchAction: 'none',
              background: themeColor(TH.primaryHSL, 0.03, 2), borderRadius: radius.xl,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`, position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '28px', height: '28px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.12, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.18, 10)}`,
                  position: 'absolute', left: '5px', bottom: '5px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'tapping' && (
          <motion.div key="tap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint }}>
              Tap in sync with the slow beat.
            </div>
            <motion.div animate={{ opacity: beatFlash ? 1 : 0.3 }}
              style={{ width: '16px', height: '16px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.25, 10), transition: 'opacity 0.1s' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < tapCount ? themeColor(TH.accentHSL, 0.3, 10) : themeColor(TH.primaryHSL, 0.06, 4) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={tap}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Tap</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'controlled' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The tempo is yours. Powerful. Heavy. Slow. You control the game.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Composure. When they speed up, you slow down. The one who controls the rhythm controls the game. Rushing the beat signals anxiety; holding the slow beat signals mastery of tempo.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Controlled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}