/**
 * COMPOSER #5 — The Counterpoint (The AND)
 * "Let the Fear and the Courage play at the same time."
 * ARCHETYPE: Pattern A (Tap) — Toggle stereo mode
 * ENTRY: Scene-first — alternating voices
 * STEALTH KBE: Accepting stereo = Complexity Integration / Paradox Tolerance (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'alternating' | 'stereo' | 'resonant' | 'afterglow';

export default function Composer_Counterpoint({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [active, setActive] = useState<'left' | 'right'>('left');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('alternating'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'alternating') return;
    const iv = setInterval(() => setActive(a => a === 'left' ? 'right' : 'left'), 1200);
    return () => clearInterval(iv);
  }, [stage]);

  const toggleStereo = () => {
    if (stage !== 'alternating') return;
    console.log(`[KBE:B] Counterpoint paradoxTolerance=confirmed complexityIntegration=true`);
    setStage('stereo');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'alternating' && (
          <motion.div key="alt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Fear and Courage alternate. They can{"'"}t play together... unless you toggle Stereo.
            </div>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <motion.div animate={{ opacity: active === 'left' ? 1 : 0.2, scale: active === 'left' ? 1.05 : 0.95 }}
                style={{ padding: '8px 14px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>L: I am afraid</span>
              </motion.div>
              <motion.div animate={{ opacity: active === 'right' ? 1 : 0.2, scale: active === 'right' ? 1.05 : 0.95 }}
                style={{ padding: '8px 14px', borderRadius: radius.sm,
                  background: themeColor(TH.accentHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>R: I am brave</span>
              </motion.div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={toggleStereo}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Stereo ◉</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'stereo' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ padding: '8px 14px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>I am afraid</span>
              </div>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>+</span>
              <div style={{ padding: '8px 14px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>I am brave</span>
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Rich texture. A single melody is boring. Polyphony is beautiful. Fear and Courage playing simultaneously — that{"'"}s not confusion; that{"'"}s the texture of being human.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Counterpoint. In Bach{"'"}s fugues, multiple independent melodies play simultaneously — each valid on its own, but together creating something far richer than any single line. Paradox tolerance research shows that people who can hold contradictory emotions simultaneously (afraid AND brave) demonstrate higher cognitive complexity and better decision-making under uncertainty.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Polyphony.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}