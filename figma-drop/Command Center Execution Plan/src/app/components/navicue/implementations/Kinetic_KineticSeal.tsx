/**
 * KINETIC #10 — The Kinetic Seal (Newton's First Law)
 * "You are a body in motion. Stay in motion."
 * ARCHETYPE: Pattern A (Tap) — Newton's Cradle: tap to start, watch perpetual motion
 * ENTRY: Cold open — still silver balls
 * STEALTH KBE: Completion = Motion mastery
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Identity Koan');
type Stage = 'arriving' | 'still' | 'swinging' | 'sealed' | 'resonant' | 'afterglow';

export default function Kinetic_KineticSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('still'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const swing = () => {
    if (stage !== 'still') return;
    console.log(`[KBE:E] KineticSeal newtonsFirst=confirmed`);
    setStage('swinging');
    t(() => setStage('sealed'), 4000);
    t(() => setStage('resonant'), 8000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '1px', height: '20px', background: themeColor(TH.primaryHSL, 0.06, 4) }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                  background: themeColor(TH.primaryHSL, 0.08, 5) }} />
              </div>
            ))}
          </motion.div>
        )}
        {stage === 'still' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>newton{"'"}s cradle</div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '1px', height: '24px', background: themeColor(TH.primaryHSL, 0.08, 5) }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%',
                    background: themeColor(TH.primaryHSL, 0.1, 6),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.12, 8)}` }} />
                </div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={swing}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Swing</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'swinging' && (
          <motion.div key="sw" initial={{ opacity: 1 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i}
                  animate={i === 0 ? { x: [-10, 0, 0, 0, 0, -10], rotate: [-15, 0, 0, 0, 0, -15] }
                    : i === 4 ? { x: [0, 0, 0, 0, 10, 0], rotate: [0, 0, 0, 0, 15, 0] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transformOrigin: 'top center' }}>
                  <div style={{ width: '1px', height: '24px', background: themeColor(TH.primaryHSL, 0.08, 5) }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.12, 6),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>click... clack... click...</div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              You are a body in motion. Stay in motion. An object in motion stays in motion unless acted upon by an unbalanced force.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Newton{"'"}s First Law. A body in motion stays in motion. You have overcome the unbalanced force: inertia, doubt, friction. The click-clack continues. Kinetic energy is your native state now.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>In motion.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}