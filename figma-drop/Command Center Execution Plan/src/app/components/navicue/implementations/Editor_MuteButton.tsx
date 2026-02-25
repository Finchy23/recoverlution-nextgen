/**
 * EDITOR #8 — The Mute Button
 * "You cannot control what they say. You can control what you hear."
 * ARCHETYPE: Pattern A (Tap) — Tap mute on a talking avatar
 * ENTRY: Cold open — avatar talking
 * STEALTH KBE: Muting triggers relief response = Selective Attention (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'active' | 'muted' | 'resonant' | 'afterglow';

export default function Editor_MuteButton({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const mute = () => {
    if (stage !== 'active') return;
    console.log(`[KBE:E] MuteButton muted=true selectiveAttention=confirmed`);
    setStage('muted');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
            <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 0.6, repeat: Infinity }}>
              <div style={{ ...navicueType.hint, color: 'hsla(0, 25%, 40%, 0.3)' }}>blah blah blah</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Revoke their access to your inner ear.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.2, 8) }}>DRAINER</div>
              </div>
              <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 0.5, repeat: Infinity }}>
                <div style={{ ...navicueType.texture, color: 'hsla(0, 25%, 40%, 0.4)', fontSize: '11px' }}>
                  you should... why don{"'"}t you... you never...
                </div>
              </motion.div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={mute}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Mute</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'muted' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <div style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.12, 6) }}>muted</div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Silence. Their mouth moves but no sound reaches you. Access revoked.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Selective attention. You cannot control what they say. You can control what you hear. The mute button is boundary enforcement at the perceptual level, curating your auditory environment.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Muted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}