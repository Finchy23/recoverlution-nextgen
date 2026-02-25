/**
 * MYSTIC #10 — The Mystic Seal
 * "I am That."
 * Pattern A (Tap) — Sri Yantra pulsing; center point is still
 * STEALTH KBE: Completion = Non-Dual Awareness mastery confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Non-Dual Awareness', 'knowing', 'Identity Koan');
type Stage = 'arriving' | 'yantra' | 'sealed' | 'resonant' | 'afterglow';

export default function Mystic_MysticSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('yantra'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'yantra') return;
    console.log(`[KBE:K] MysticSeal nonDualAwareness=confirmed tatTvamAsi=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="knowing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity }} exit={{ opacity: 0 }}>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.08, 4) }} />
          </motion.div>
        )}
        {stage === 'yantra' && (
          <motion.div key="y" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Sri Yantra (simplified) */}
            <motion.svg width="80" height="80" viewBox="0 0 80 80"
              animate={{ rotate: [0, 0.5, -0.5, 0] }}
              transition={{ duration: 8, repeat: Infinity }}>
              {/* Outer circle */}
              <circle cx="40" cy="40" r="36" fill="none"
                stroke={themeColor(TH.accentHSL, 0.04, 2)} strokeWidth="0.5" />
              {/* Triangles (simplified: 4 upward, 5 downward interlocking) */}
              <polygon points="40,8 12,58 68,58" fill="none"
                stroke={themeColor(TH.accentHSL, 0.05, 3)} strokeWidth="0.5" />
              <polygon points="40,72 12,22 68,22" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.05, 3)} strokeWidth="0.5" />
              <polygon points="40,14 18,52 62,52" fill="none"
                stroke={themeColor(TH.accentHSL, 0.04, 2)} strokeWidth="0.5" />
              <polygon points="40,66 18,28 62,28" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="0.5" />
              {/* Bindu (center point) */}
              <motion.circle cx="40" cy="40" r="2"
                animate={{ opacity: [0.08, 0.15, 0.08] }}
                transition={{ duration: 3, repeat: Infinity }}
                fill={themeColor(TH.accentHSL, 0.12, 8)} />
            </motion.svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              The Sri Yantra pulses. Nine interlocking triangles. The center point — the bindu — is perfectly still.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={seal}
              style={{ padding: '14px 22px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>I Am That</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ boxShadow: [`0 0 8px ${themeColor(TH.accentHSL, 0.03, 3)}`, `0 0 20px ${themeColor(TH.accentHSL, 0.06, 5)}`, `0 0 8px ${themeColor(TH.accentHSL, 0.03, 3)}`] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 8) }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Sealed. "Tat Tvam Asi" — Thou Art That. The candle flame was you. The ocean was you. The koan was you. The light was you. The sky was you. The dance was you. The thread was you. The silence was you. The net was you. The bindu — the still point at the center of infinite complexity — is you. Subject and object dissolve. The Mystic Seal: non-dual awareness. There is only This.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Non-dual awareness. "Tat Tvam Asi" (Chandogya Upanishad): "That [ultimate reality] is what you are." Non-duality (Advaita): the recognition that the apparent separation between observer and observed, self and world, is a cognitive construction. The Sri Yantra is a visual map of this principle — nine interlocking triangles representing the dynamic interplay of Shiva (consciousness) and Shakti (energy), converging on the bindu (dimensionless point) where duality collapses. This is not a belief. It is a state of consciousness — available now, always.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>That.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}