/**
 * COMPOSER #4 — The Rest Note
 * "The music is not in the notes. It is in the silence between them."
 * ARCHETYPE: Pattern A (Tap) — Insert rest into packed schedule
 * ENTRY: Scene-first — sheet music full of black notes
 * STEALTH KBE: Placing rest before crash = Strategic Recovery (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'packed' | 'rested' | 'resonant' | 'afterglow';

const SLOTS = ['Work', 'Meeting', 'Work', 'Call', 'Work', 'Work', 'Deadline', 'Work'];

export default function Composer_RestNote({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [restAt, setRestAt] = useState<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('packed'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const insertRest = (idx: number) => {
    if (stage !== 'packed') return;
    setRestAt(idx);
    const beforeCrash = idx < 5;
    console.log(`[KBE:B] RestNote position=${idx} beforeCrash=${beforeCrash} strategicRecovery=${beforeCrash}`);
    setStage('rested');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: '6px', height: '10px', borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              ))}
            </motion.div>
        )}
        {stage === 'packed' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A schedule full of notes. It looks exhausting. Insert a rest. Where?
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SLOTS.map((slot, idx) => (
                <motion.div key={idx} whileTap={{ scale: 0.9 }} onClick={() => insertRest(idx)}
                  style={{ padding: '5px 8px', borderRadius: radius.xs, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.04, 2),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                  <span style={{ fontSize: '11px', color: palette.textFaint }}>♩ {slot}</span>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Tap to place a rest ♪</div>
          </motion.div>
        )}
        {stage === 'rested' && (
          <motion.div key="re" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SLOTS.map((slot, idx) => (
                <div key={idx} style={{ padding: '5px 8px', borderRadius: radius.xs,
                  background: idx === restAt
                    ? themeColor(TH.accentHSL, 0.06, 3)
                    : themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${idx === restAt
                    ? themeColor(TH.accentHSL, 0.12, 8)
                    : themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                  <span style={{ fontSize: '11px',
                    color: idx === restAt ? themeColor(TH.accentHSL, 0.35, 12) : palette.textFaint }}>
                    {idx === restAt ? '𝄾 Rest' : `♩ ${slot}`}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              The next note sounds louder. The music isn{"'"}t in the notes — it{"'"}s in the silence between them. Without the rest, it{"'"}s just noise. Insert the pause.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Strategic recovery. Alex Soojung-Kim Pang{"'"}s research on deliberate rest: the most productive people work in focused bursts with intentional recovery. Miles Davis: "It{"'"}s not the notes you play, it{"'"}s the notes you don{"'"}t play." The rest note isn{"'"}t wasted time — it{"'"}s the space that gives meaning to the music. Schedule the silence.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rested.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}