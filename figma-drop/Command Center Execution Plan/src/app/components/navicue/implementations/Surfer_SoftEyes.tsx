/**
 * SURFER #7 — Soft Eyes
 * "Hard eyes hunt. Soft eyes receive. Let the world come to you."
 * ARCHETYPE: Pattern A (Tap) — Toggle between sharp and soft focus
 * ENTRY: Scene-first — hyper-sharp image
 * STEALTH KBE: Retaining soft mode = Relaxation Preference (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'sharp' | 'choosing' | 'settled' | 'resonant' | 'afterglow';

export default function Surfer_SoftEyes({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [soft, setSoft] = useState(false);
  const [kept, setKept] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('sharp'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const toggle = () => {
    if (stage === 'sharp') {
      setSoft(true);
      setStage('choosing');
      // Auto-settle after 4 seconds
      t(() => {
        console.log(`[KBE:E] SoftEyes keptSoft=${true} relaxationPreference=confirmed visualGating=true`);
        setKept(true);
        setStage('settled');
        t(() => setStage('resonant'), 4500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
      }, 4000);
    } else if (stage === 'choosing') {
      setSoft(!soft);
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '50px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `2px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
        )}
        {(stage === 'sharp' || stage === 'choosing') && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {stage === 'sharp' ? 'Too sharp. Toggle soft focus.' : (soft ? 'Soft. Ease. The world comes to you.' : 'Sharp again. Toggle to soften.')}
            </div>
            {/* Image visualization */}
            <div style={{ width: '160px', height: '100px', borderRadius: radius.sm, position: 'relative',
              overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: soft
                ? `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}`
                : `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
              filter: soft ? 'blur(1px)' : 'none',
              transition: 'all 0.6s' }}>
              {/* Abstract landscape shapes */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35px',
                background: themeColor(TH.primaryHSL, soft ? 0.03 : 0.06, soft ? 2 : 4),
                borderRadius: '50% 50% 0 0', transition: 'all 0.6s' }} />
              <div style={{ position: 'absolute', bottom: '30px', left: '30%', width: '40%', height: '40px',
                borderRadius: '50% 50% 0 0',
                background: themeColor(TH.accentHSL, soft ? 0.03 : 0.05, soft ? 3 : 5),
                transition: 'all 0.6s' }} />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute',
                  left: `${15 + Math.random() * 120}px`, top: `${10 + Math.random() * 30}px`,
                  width: soft ? '3px' : '2px', height: soft ? '3px' : '2px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, soft ? 0.06 : 0.03, soft ? 6 : 4),
                  transition: 'all 0.6s' }} />
              ))}
              {soft && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                  style={{ position: 'absolute', inset: 0,
                    background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.03, 3)}, transparent)` }} />
              )}
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={toggle}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: soft ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${soft ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <div style={{ ...navicueType.choice,
                color: soft ? themeColor(TH.accentHSL, 0.45, 14) : palette.textFaint }}>
                {soft ? 'Soft focus' : 'Toggle soft'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'settled' && (
          <motion.div key="se" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Soft eyes. The aperture widened. Peripheral vision expanded. Hard eyes hunt; soft eyes receive. You stopped chasing and let the world come to you.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Visual gating. "Soft eyes" is a concept from martial arts and mindfulness. Hard focus activates the sympathetic nervous system (fight/hunt mode). Soft focus, peripheral, relaxed attention, activates the parasympathetic system. Open the aperture. The world has more to show you when you stop squinting at it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Soft.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}