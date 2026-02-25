/**
 * ADAPTIVE #9 -- The Phoenix Burn
 * "You have to be willing to die to be born. The new one is here."
 * ARCHETYPE: Pattern A (Tap) -- Watch bird burn to ash, accept new avatar
 * ENTRY: Cold open -- bird silhouette
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'burning' | 'ash' | 'reborn' | 'resonant' | 'afterglow';

export default function Adaptive_PhoenixBurn({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('burning'), 2000);
    t(() => setStage('ash'), 5000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const accept = () => {
    if (stage !== 'ash') return;
    console.log(`[KBE:B] PhoenixBurn newAvatar=accepted identityRenewal=confirmed`);
    setStage('reborn');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '24px', height: '20px', borderRadius: '50% 50% 0 0',
              background: themeColor(TH.primaryHSL, 0.08, 5) }} />
          </motion.div>
        )}
        {stage === 'burning' && (
          <motion.div key="burn" initial={{ opacity: 1 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [1, 0.5, 0.2, 0], scale: [1, 1.1, 0.9, 0.3] }}
              transition={{ duration: 3, ease: 'easeIn' }}
              style={{ width: '24px', height: '20px', borderRadius: '50% 50% 0 0',
                background: 'hsla(25, 40%, 35%, 0.15)',
                boxShadow: '0 0 8px hsla(25, 50%, 40%, 0.1)' }} />
          </motion.div>
        )}
        {stage === 'ash' && (
          <motion.div key="ash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ width: '30px', height: '6px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              Ash. Silence. Then...
            </div>
            <motion.div animate={{ y: [2, 0, 2] }} transition={{ duration: 1, repeat: Infinity }}
              style={{ width: '10px', height: '10px', borderRadius: '50% 50% 0 0',
                background: themeColor(TH.accentHSL, 0.12, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={accept}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Accept the new</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'reborn' && (
          <motion.div key="rb" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: '20px', height: '16px', borderRadius: '50% 50% 0 0',
                background: themeColor(TH.accentHSL, 0.15, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.2, 10)}`,
                boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.06, 8)}` }} />
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Reborn. The old version burned. The new one is here, and it can handle what the old one couldn{"'"}t.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Identity renewal. The phoenix must burn to be reborn. The version of you that couldn{"'"}t handle this is gone. Accepting the new avatar means accepting that growth requires letting the old self die. Be willing to die to be born.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Reborn.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}