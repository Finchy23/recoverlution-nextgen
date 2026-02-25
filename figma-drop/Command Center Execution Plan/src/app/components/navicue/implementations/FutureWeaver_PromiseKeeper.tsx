/**
 * FUTURE WEAVER #9 — The Promise Keeper
 * "Your word to yourself is the only law that matters."
 * ARCHETYPE: Pattern D (Type) — Type a contract, sign it
 * ENTRY: Scene-first — blank contract
 * STEALTH KBE: Signing = Integrity / Weight of the Word (E)
 * WEB ADAPT: haptic friction → visual weight/seal animation
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'contract' | 'signed' | 'resonant' | 'afterglow';

export default function FutureWeaver_PromiseKeeper({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [promise, setPromise] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'I will _____ by _____',
    onAccept: (value: string) => {
      if (value.trim().length < 5) return;
      setPromise(value.trim());
      console.log(`[KBE:E] PromiseKeeper integrity=confirmed weightOfWord=true promise="${value.trim()}"`);
      setStage('signed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('contract'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '40px', height: '50px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }} />
        )}
        {stage === 'contract' && (
          <motion.div key="co" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ width: '140px', padding: '14px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
              <div style={{ fontSize: '11px', color: palette.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '8px' }}>
                Contract With Self
              </div>
              <div style={{ width: '100%', height: '1px', background: themeColor(TH.primaryHSL, 0.04, 3), marginBottom: '8px' }} />
              <div style={{ fontSize: '11px', color: palette.textFaint, textAlign: 'center' }}>
                "I will _____ by _____"
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Write the contract. Your self-esteem is the collateral.
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Sign</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'signed' && (
          <motion.div key="si" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '140px', padding: '14px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ fontSize: '11px', color: palette.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '8px' }}>
                Contract With Self
              </div>
              <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10), textAlign: 'center', fontStyle: 'italic' }}>
                "{promise}"
              </div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                style={{ width: '20px', height: '20px', borderRadius: '50%', margin: '8px auto 0',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `2px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>✓</span>
              </motion.div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Signed. Immutable. Your word to yourself is the only law that matters. Don{"'"}t break the contract — your self-esteem is the collateral.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Integrity. Nathaniel Branden: "Self-esteem is the reputation we acquire with ourselves." Every kept promise to yourself builds self-trust; every broken one erodes it. Research on implementation intentions (Peter Gollwitzer) shows that specific "I will X by Y" commitments increase follow-through by 2-3x. Sign the contract. Your word is your foundation.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Signed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}