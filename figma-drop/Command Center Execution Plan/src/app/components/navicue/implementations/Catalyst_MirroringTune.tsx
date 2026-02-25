/**
 * CATALYST #2 — The Mirroring Tune
 * "Match their tone. Once locked, then lead."
 * ARCHETYPE: Pattern B (Drag) — Slider to match sine wave frequencies
 * ENTRY: Scene-first — two out-of-phase waves
 * STEALTH KBE: Smooth adjustment = Rapport Building (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CATALYST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Theater');
type Stage = 'arriving' | 'active' | 'locked' | 'resonant' | 'afterglow';

export default function Catalyst_MirroringTune({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] MirroringTune phaseLocked=true rapportBuilding=confirmed`);
      setStage('locked');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const phase = (1 - drag.progress) * Math.PI; // Starts out of sync → in sync

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="140" height="50" viewBox="0 0 140 50">
              <path d="M0,25 Q17.5,5 35,25 Q52.5,45 70,25 Q87.5,5 105,25 Q122.5,45 140,25"
                fill="none" stroke={themeColor(TH.accentHSL, 0.12, 6)} strokeWidth="1.5" />
              <path d="M0,30 Q17.5,50 35,30 Q52.5,10 70,30 Q87.5,50 105,30 Q122.5,10 140,30"
                fill="none" stroke={themeColor(TH.primaryHSL, 0.1, 5)} strokeWidth="1.5" />
            </svg>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Match their frequency. Lock into phase.
            </div>
            <svg width="160" height="60" viewBox="0 0 160 60">
              {/* Target wave */}
              <path d="M0,30 Q20,10 40,30 Q60,50 80,30 Q100,10 120,30 Q140,50 160,30"
                fill="none" stroke={themeColor(TH.accentHSL, 0.2, 10)} strokeWidth="1.5" />
              {/* User wave (phase shifting) */}
              <path d={`M0,${30 + 10 * Math.sin(phase)} Q20,${30 - 10 * Math.cos(phase)} 40,${30 + 10 * Math.sin(phase)} Q60,${30 + 10 * Math.cos(phase)} 80,${30 + 10 * Math.sin(phase)} Q100,${30 - 10 * Math.cos(phase)} 120,${30 + 10 * Math.sin(phase)} Q140,${30 + 10 * Math.cos(phase)} 160,${30 + 10 * Math.sin(phase)}`}
                fill="none" stroke={themeColor(TH.primaryHSL, 0.15, 8)} strokeWidth="1.5"
                strokeDasharray={drag.progress > 0.8 ? 'none' : '4,4'} />
            </svg>
            <div style={{ ...navicueType.hint, color: drag.progress > 0.8
              ? themeColor(TH.accentHSL, 0.3, 10) : palette.textFaint }}>
              {drag.progress > 0.9 ? 'LOCKED' : drag.progress > 0.6 ? 'almost...' : 'out of phase'}
            </div>
            <div ref={drag.containerRef} style={{ width: '200px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1 + drag.progress * 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15 + drag.progress * 0.1, 10)}`,
                  position: 'absolute', top: '-6px', left: '3px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <svg width="160" height="50" viewBox="0 0 160 50">
              <motion.path d="M0,25 Q20,5 40,25 Q60,45 80,25 Q100,5 120,25 Q140,45 160,25"
                fill="none" stroke={themeColor(TH.accentHSL, 0.25, 10)} strokeWidth="2"
                initial={{ opacity: 0.5 }} animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Hummmm. In phase. Now you can lead.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Rapport building. You cannot lead someone you{"'"}re not in sync with. Match their tone, speed, energy. Once locked into phase, a small shift in your frequency pulls theirs with it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>In phase.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}