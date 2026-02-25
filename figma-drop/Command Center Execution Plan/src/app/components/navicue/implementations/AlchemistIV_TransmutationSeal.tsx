/**
 * ALCHEMIST IV #10 - The Transmutation Seal
 * "You are the vessel. You are the fire. You are the gold."
 * Pattern A (Tap) - Philosopher's stone glows; lead turns to gold
 * STEALTH KBE: Completion = Emotional Regulation mastery confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'knowing', 'Ember');
type Stage = 'arriving' | 'glowing' | 'sealed' | 'resonant' | 'afterglow';

export default function AlchemistIV_TransmutationSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('glowing'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'glowing') return;
    console.log(`[KBE:K] TransmutationSeal emotionalRegulation=confirmed transmutation=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '3px', transform: 'rotate(45deg)',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'glowing' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Philosopher's Stone */}
            <motion.div
              animate={{ boxShadow: [
                `0 0 12px ${themeColor(TH.accentHSL, 0.04, 4)}`,
                `0 0 24px ${themeColor(TH.accentHSL, 0.06, 6)}`,
                `0 0 12px ${themeColor(TH.accentHSL, 0.04, 4)}`,
              ] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '40px', height: '40px', borderRadius: '6px', transform: 'rotate(45deg)',
                background: `linear-gradient(135deg, ${themeColor(TH.accentHSL, 0.06, 3)}, ${themeColor(TH.accentHSL, 0.08, 5)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              The philosopher{"'"}s stone glows with an inner, shifting light. Lead turns to gold.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={seal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Seal</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ width: '24px', height: '24px', borderRadius: radius.xs, transform: 'rotate(45deg)',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Sealed. You are the vessel. You are the fire. You are the gold. Anger forged into boundaries. Grief planted into depth. Fear calibrated into growth. Joy savored into reserves. Shame dissolved by empathy. Envy mapped into ambition. Sadness allowed into flow. Anxiety channeled into preparation. Love amplified into waves. Emotion is not a directive - it is raw material. Refine it.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Emotional regulation. James Gross{"'"}s process model defines five families of regulation strategies: situation selection, situation modification, attentional deployment, cognitive change, and response modulation. The Alchemist IV collection maps to all five: forging (cognitive change), gardening (response modulation), compass-reading (attentional deployment), reservoir-filling (situation selection), and accepting flow (situation modification). Mastery is not emotional control - it{"'"}s emotional agility.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Transmuted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}