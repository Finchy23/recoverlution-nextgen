/**
 * OMEGA #8 — The Mirror of Truth
 * "Look at the hero. Look at the villain. Look at the masterpiece. I see you."
 * STEALTH KBE: Looking for 5 seconds + Accept = Unconditional Self-Regard (B)
 * Web: Hold a "gaze" button for 5s, then accept
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Self-Acceptance', 'believing', 'Cosmos');
type Stage = 'arriving' | 'mirror' | 'accept' | 'resonant' | 'afterglow';

export default function Unity_MirrorOfTruth({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    requiredDuration: 5000,
    onComplete: () => {
      setStage('accept');
    },
  });

  useEffect(() => { t(() => setStage('mirror'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const acceptSelf = () => {
    if (stage !== 'accept') return;
    console.log(`[KBE:B] MirrorOfTruth gazed=true accepted=true unconditionalSelfRegard=true`);
    setStage('resonant');
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Acceptance" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '20px', borderRadius: '8px 8px 0 0',
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'mirror' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            {/* Mirror frame */}
            <motion.div {...hold.bind()}
              style={{ width: '100px', height: '120px', borderRadius: '50px 50px 4px 4px', cursor: 'pointer',
                background: `radial-gradient(ellipse, ${themeColor(TH.accentHSL, 0.03 + hold.progress * 0.06, 4)}, ${themeColor(TH.primaryHSL, 0.02, 0)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + hold.progress * 0.08, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px', opacity: 0.1 + hold.progress * 0.3, transition: 'opacity 0.5s' }}>
                {'\u{1F464}'}
              </span>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              No filters. No text. Just you. Hold your gaze.
            </div>
            <div style={{ width: '60px', height: '2px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 1) }}>
              <motion.div style={{ width: `${hold.progress * 100}%`, height: '100%', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.15, 5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'accept' && (
          <motion.div key="ac" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Look at the hero. Look at the villain. Look at the masterpiece. It is all in the eyes.
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={acceptSelf}
              animate={{ boxShadow: `0 0 20px ${themeColor(TH.accentHSL, 0.08, 6)}` }}
              style={{ padding: '8px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}` }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: palette.text }}>I SEE YOU</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Carl Rogers (1961): unconditional positive regard, the acceptance of another (or yourself) without judgment, is the single most powerful catalyst for psychological change. The mirror doesn{"'"}t add or subtract. It shows what is. And what is, is enough.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Seen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}