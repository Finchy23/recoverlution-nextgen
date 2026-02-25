/**
 * MAGNUM OPUS II #2 — The Phoenix Ash
 * "The ash is not the end. It is the cradle."
 * Pattern A (Drag) — Blow on ash pile (drag upward); spark ignites, wing forms
 * STEALTH KBE: Trusting the rebirth = Regenerative Faith (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'believing', 'Cosmos');
type Stage = 'arriving' | 'ash' | 'spark' | 'resonant' | 'afterglow';

export default function Mastery_PhoenixAsh({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('ash'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const drag = useDragInteraction({
    axis: 'y',
    onComplete: () => {
      if (stage !== 'ash') return;
      console.log(`[KBE:B] PhoenixAsh blew=true regenerativeFaith=true rebirthTrust=true`);
      setStage('spark');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '3px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'ash' && (
          <motion.div key="ash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '140px', height: '50px' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute',
                  left: `${10 + Math.random() * 80}%`, top: `${40 + Math.random() * 50}%`,
                  width: `${3 + Math.random() * 5}px`, height: `${2 + Math.random() * 3}px`,
                  borderRadius: '50%', background: `hsla(0, 0%, ${25 + Math.random() * 20}%, ${0.3 + Math.random() * 0.3})`,
                  transform: `rotate(${Math.random() * 360}deg)` }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A pile of grey ash. Drag upward to blow on it.
            </div>
            <motion.div {...drag.bindDrag()} whileTap={{ scale: 0.95 }}
              style={{ padding: '10px 24px', borderRadius: '9999px', cursor: 'grab',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`, touchAction: 'none' }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>
                {drag.progress > 0 ? `${Math.round(drag.progress * 100)}% — breathing...` : 'Drag up to blow'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'spark' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '280px' }}>
            <motion.div animate={{ scale: [0.8, 1.2, 1], opacity: [0.3, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '60px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '36px' }}>&#x1F525;</div>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A spark ignites. A wing forms. Rise. You burned down. Good. The ash is not the end — it is the cradle. The new version of you is waiting in the dust. Phoenix mythology spans Greek, Egyptian, Chinese (Fenghuang), and Hindu (Garuda) traditions — all agree: destruction precedes rebirth.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Post-traumatic growth (Tedeschi & Calhoun): 70% of trauma survivors report positive change. The ash isn't waste — it's fertilizer. The breakdown was the prerequisite for the breakthrough.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Risen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}