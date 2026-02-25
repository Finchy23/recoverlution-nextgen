/**
 * MULTIVERSE #5 — The Committee Meeting
 * "There is no 'I'. There is a committee."
 * ARCHETYPE: Pattern B (Drag) — Drag Logic to head of table
 * ENTRY: Scene-first — boardroom with Fear shouting
 * STEALTH KBE: Putting Logic/Values at head = Self-Leadership / Internal Leadership (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'chaotic' | 'ordered' | 'resonant' | 'afterglow';

export default function Multiverse_CommitteeMeeting({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:K] CommitteeMeeting selfLeadership=confirmed internalLeadership=true`);
      setStage('ordered');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('chaotic'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const fearOpacity = 0.3 - drag.progress * 0.2;
  const logicOpacity = 0.1 + drag.progress * 0.25;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '20px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'chaotic' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The boardroom. Fear is shouting. Logic is silent. Drag Logic to the head of the table.
            </div>
            {/* Board table */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Head of table */}
              <div style={{ width: '30px', height: '24px', borderRadius: radius.xs,
                background: themeColor(TH.accentHSL, logicOpacity * 0.3, 4),
                border: `1px solid ${themeColor(TH.accentHSL, logicOpacity * 0.5, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, logicOpacity + 0.1, 8) }}>
                  {drag.progress > 0.7 ? 'Logic' : '?'}
                </span>
              </div>
              {/* Table */}
              <div style={{ width: '60px', height: '3px', borderRadius: '1.5px',
                background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              {/* Fear seat */}
              <motion.div animate={{ scale: fearOpacity > 0.15 ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 0.3, repeat: fearOpacity > 0.15 ? Infinity : 0 }}
                style={{ width: '30px', height: '24px', borderRadius: radius.xs,
                  background: `hsla(0, 12%, 22%, ${fearOpacity * 0.3})`,
                  border: `1px solid hsla(0, 12%, 28%, ${fearOpacity * 0.5})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: `hsla(0, 12%, 35%, ${fearOpacity + 0.05})` }}>Fear</span>
              </motion.div>
            </div>
            {/* Drag slider */}
            <div ref={drag.containerRef} style={{ width: '12px', height: '70px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', left: '-6px', top: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Promote Logic ↑</div>
          </motion.div>
        )}
        {stage === 'ordered' && (
          <motion.div key="or" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Logic chairs the meeting. Fear sits down. There is no {"'"}I{"'"} — there is a committee. The question isn{"'"}t "Who am I?" but "Who is chairing the meeting right now?" If it{"'"}s Fear, fire him. Promote the part that serves the moment.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Internal Family Systems (IFS). Richard Schwartz{"'"}s model: the psyche is not a monolith — it{"'"}s a system of sub-personalities (Parts). Each Part has a function. The goal is not to eliminate Fear but to ensure that the Self (the calm center) leads the system. Self-leadership: when the wisest part chairs the meeting.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Chaired.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}