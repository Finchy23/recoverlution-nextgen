/**
 * ZERO POINT #5 — The Ego Death (The Dissolve)
 * "You are not the figure. You are the ground. Let the image blow away."
 * STEALTH KBE: Accepting the empty screen (vs tapping to restore) = Non-Attachment (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('koan_paradox', 'Self-Transcendence', 'believing', 'Ocean');
type Stage = 'arriving' | 'figure' | 'dissolving' | 'empty' | 'resonant' | 'afterglow';

export default function Void_EgoDeath({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tappedRestore, setTappedRestore] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('figure'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const beginDissolve = () => {
    setStage('dissolving');
    t(() => setStage('empty'), 5000);
    // Wait 8 seconds — if user doesn't tap "restore", they pass
    t(() => {
      console.log(`[KBE:B] EgoDeath tappedRestore=${tappedRestore} nonAttachment=${!tappedRestore}`);
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }, 13000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Self-Transcendence" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '8px', height: '12px', borderRadius: radius.xs, background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'figure' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            {/* Avatar figure */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 5) }} />
              <div style={{ width: '16px', height: '30px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.06, 4) }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are not the figure. You are the ground. Let the image blow away.
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={beginDissolve}
              style={{ padding: '6px 16px', borderRadius: radius.md, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: palette.textFaint }}>RELEASE</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'dissolving' && (
          <motion.div key="d" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 4.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <motion.div animate={{ x: [0, 20, -10, 30], scale: [1, 0.8, 0.5, 0] }}
              transition={{ duration: 4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.08, 5) }} />
              <div style={{ width: '16px', height: '30px', borderRadius: radius.xs, background: themeColor(TH.accentHSL, 0.06, 4) }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'empty' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '80px', height: '80px' }} />
            <div style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center', opacity: 0.4, fontSize: '11px' }}>
              The ground cannot be moved.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The ego is a useful fiction, not a fixed entity (Metzinger, 2003). In psychedelic-assisted therapy, "ego dissolution" correlates with lasting increases in well-being and connectedness. You are not the dancer. You are the dance.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ground.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}