/**
 * MYTHMAKER #9 — The Cliffhanger
 * "Uncertainty is not fear. Uncertainty is suspense."
 * ARCHETYPE: Pattern E (Hold) — A book slowly closing.
 * Hold to keep it open, resist the urge to close it.
 * As tension builds, the page text transforms from dread to curiosity.
 * Uncertainty Tolerance — reframing unknown as narrative suspense.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function MythMaker_Cliffhanger({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  // Book cover angle — starts closed (70deg), hold opens it (0deg)
  const coverAngle = 70 * (1 - t);
  // Text evolves from fear-language to curiosity-language
  const textPhase = t < 0.25 ? 0 : t < 0.5 ? 1 : t < 0.75 ? 2 : 3;
  const TEXTS = [
    'What if it goes wrong?',
    'What if something happens?',
    'What happens next?',
    'To be continued...',
  ];

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A story pauses mid-sentence...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Uncertainty is not fear. Uncertainty is suspense. The best stories keep you guessing. Enjoy the suspense.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>hold to stay with the unknown</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '300px' }}>

            {/* The book */}
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, position: 'relative', width: '180px', height: '140px', perspective: '400px' }}>

              {/* Book spine */}
              <div style={{
                position: 'absolute', left: '50%', top: '10px', bottom: '10px', width: '8px',
                marginLeft: '-4px', background: themeColor(TH.primaryHSL, 0.1, 5), borderRadius: '2px',
              }} />

              {/* Right page (fixed) */}
              <div style={{
                position: 'absolute', left: '50%', top: '10px', right: '10px', bottom: '10px',
                background: themeColor(TH.accentHSL, 0.03, 8), borderRadius: '0 4px 4px 0',
                border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 5)}`, borderLeft: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px',
              }}>
                {/* Text lines — simulated */}
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} style={{
                    width: `${60 + (i % 3) * 10}%`, height: '2px', borderRadius: '1px',
                    background: themeColor(TH.primaryHSL, 0.04, 8),
                  }} />
                ))}
                <div style={{ fontSize: '11px', fontFamily: 'serif', fontStyle: 'italic', textAlign: 'center',
                  color: themeColor(TH.accentHSL, 0.15 + t * 0.1, 12), marginTop: '4px' }}>
                  {TEXTS[textPhase]}
                </div>
              </div>

              {/* Left cover (closes/opens with hold) */}
              <motion.div
                animate={{ rotateY: coverAngle }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                style={{
                  position: 'absolute', left: '10px', top: '10px', width: 'calc(50% - 10px)', bottom: '10px',
                  background: themeColor(TH.primaryHSL, 0.12 - t * 0.04, 6),
                  borderRadius: '4px 0 0 4px',
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 8)}`, borderRight: 'none',
                  transformOrigin: 'right center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backfaceVisibility: 'hidden',
                }}>
                {/* Cover emboss */}
                <div style={{ fontSize: '11px', fontFamily: 'serif', letterSpacing: '0.1em',
                  color: themeColor(TH.accentHSL, 0.08, 10), textTransform: 'uppercase' }}>
                  YOUR STORY
                </div>
              </motion.div>
            </div>

            {/* Tension meter — suspense bar */}
            <div style={{ width: '160px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '3px', borderRadius: '2px',
                background: themeColor(TH.voidHSL, 0.4, 3) }}>
                <motion.div
                  animate={{ width: `${t * 100}%` }}
                  style={{
                    height: '100%', borderRadius: '2px',
                    background: t < 0.5
                      ? themeColor(TH.primaryHSL, 0.15, 10)
                      : themeColor(TH.accentHSL, 0.2, 15),
                    transition: 'background 0.5s ease',
                  }} />
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                color: themeColor(TH.accentHSL, 0.12 + t * 0.12, 10) }}>
                {t < 0.3 ? 'DREAD' : t < 0.6 ? 'TENSION' : t < 0.9 ? 'SUSPENSE' : 'CURIOSITY'}
              </div>
            </div>

            {/* Hold prompt */}
            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5 }}>
                {hold.isHolding ? 'stay with it...' : 'press and hold'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              To be continued... You converted dread into curiosity. The arousal is the same. The label changed everything.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>uncertainty reframed as dopamine</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Enjoy the suspense.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}