/**
 * SAGE #10 — The Sage Seal (Wabi-Sabi)
 * "Perfect because it is imperfect."
 * Pattern A (Tap) — Draw an Enso circle in one brushstroke
 * STEALTH KBE: Completion = Transcendent Wisdom mastery confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'knowing', 'Identity Koan');
type Stage = 'arriving' | 'brush' | 'sealed' | 'resonant' | 'afterglow';

export default function Sage_SageSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('brush'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const draw = () => {
    if (stage !== 'brush') return;
    console.log(`[KBE:K] SageSeal transcendentWisdom=confirmed wabiSabi=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="knowing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity }} exit={{ opacity: 0 }}>
            <svg width="30" height="30" viewBox="0 0 30 30">
              <circle cx="15" cy="15" r="12" fill="none"
                stroke={themeColor(TH.accentHSL, 0.04, 2)} strokeWidth="2"
                strokeDasharray="65" strokeDashoffset="10" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
        {stage === 'brush' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Enso placeholder */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.03, 1)} strokeWidth="3"
                strokeDasharray="175" strokeDashoffset="20" strokeLinecap="round" />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              One brushstroke. The circle does not need to close. Perfect because it is imperfect.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={draw}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Draw Ens{"ō"}</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* Animated Enso drawing */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              <motion.circle cx="40" cy="40" r="30" fill="none"
                stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="4"
                strokeDasharray="175" strokeLinecap="round"
                initial={{ strokeDashoffset: 175 }}
                animate={{ strokeDashoffset: 20 }}
                transition={{ duration: 2, ease: 'easeOut' }} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Sealed. The Ens{"ō"} — one brushstroke. It does not close. It is perfect because it is imperfect. This is the Sage{"'"}s seal: emptiness is fullness. Silence is answer. Imperfection is beauty. Wisdom is subtraction. You have poured out the cup, watched the sand blow, walked the middle way, held the paradox, sat in silence, observed the traffic, floated in the river, owned the mirror, and seen with fresh eyes. Knowledge adds. Wisdom subtracts.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Wabi-Sabi ({"侘寂"}). The Japanese aesthetic centered on the acceptance of transience and imperfection. Three marks: impermanence (nothing lasts), incompleteness (nothing is finished), imperfection (nothing is flawless). The Ens{"ō"} circle in Zen calligraphy is drawn in a single, uninhibited brushstroke — it embodies all three. It is the visual signature of a mind that has stopped seeking perfection and started embracing reality. This is not resignation. It is liberation.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Wise.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}