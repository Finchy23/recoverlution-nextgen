/**
 * INTERPRETER #6 — The Third Chair (The Observer)
 * "Stop fighting. Watch the fight. You are the audience."
 * ARCHETYPE: Pattern A (Tap) — Tap to sit in 3rd chair; POV shifts to god-view
 * ENTRY: Scene-first — two chairs face each other before the third appears
 * STEALTH KBE: Choosing god-view perspective = psychological distancing (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'scene' | 'active' | 'elevated' | 'resonant' | 'afterglow';

export default function Interpreter_ThirdChair({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ dwellStart: 0 });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const sitInThirdChair = () => {
    console.log(`[KBE:E] ThirdChair distancingChosen=true`);
    kbe.current.dwellStart = Date.now();
    setStage('elevated');
    t(() => {
      const dwellMs = Date.now() - kbe.current.dwellStart;
      console.log(`[KBE:E] ThirdChair elevatedDwellMs=${dwellMs}`);
      setStage('resonant');
    }, 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  // Chair icon helper
  const Chair = ({ label, color, y }: { label: string; color: string; y?: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
      transform: y ? `translateY(${y}px)` : undefined }}>
      <div style={{ width: '28px', height: '38px', borderRadius: '4px 4px 0 0',
        background: themeColor(TH.primaryHSL, 0.08, 4),
        borderTop: `2px solid ${color}`, borderLeft: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <div style={{ width: '36px', height: '6px', borderRadius: '2px',
        background: color }} />
      <div style={{ ...navicueType.hint, fontSize: '11px', color }}>{label}</div>
    </div>
  );

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
              <Chair label="You" color={themeColor(TH.primaryHSL, 0.2, 8)} />
              <Chair label="Them" color={themeColor(TH.primaryHSL, 0.2, 8)} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>two chairs, one conflict</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Stop fighting. Watch the fight. You are the audience. What does the play look like from the balcony?
            </div>
            <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-end' }}>
              <Chair label="You" color={themeColor(TH.primaryHSL, 0.15, 6)} />
              <Chair label="Them" color={themeColor(TH.primaryHSL, 0.15, 6)} />
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={sitInThirdChair}
                style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.1, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Sit in the third chair</div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'elevated' && (
          <motion.div key="el" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* God view — top-down perspective */}
            <div style={{ position: 'relative', width: '160px', height: '160px',
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 4)}`, borderRadius: '50%' }}>
              {/* Two dots = chairs from above */}
              <div style={{ position: 'absolute', top: '50%', left: '25%', transform: 'translate(-50%, -50%)',
                width: '12px', height: '12px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.15, 8) }} />
              <div style={{ position: 'absolute', top: '50%', left: '75%', transform: 'translate(-50%, -50%)',
                width: '12px', height: '12px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.15, 8) }} />
              {/* Observer dot */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.3, 10),
                  boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              From above, the fight looks different. Two people who are afraid. Neither is the villain.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Psychological distancing. Solomon's Paradox: we give better advice to others than ourselves because distance improves judgment. The third chair is Solomon's seat. See the play, not the fight.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Elevated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}