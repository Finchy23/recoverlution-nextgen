/**
 * INFINITE PLAYER II #5 — The Torch Relay
 * "You are running against yourself. Pass the fire."
 * Pattern A (Drag) — Pass torch between self-versions across time
 * STEALTH KBE: Connecting the selves = Temporal Integration / Self-Continuity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'believing', 'Cosmos');
type Stage = 'arriving' | 'relay' | 'passed' | 'resonant' | 'afterglow';

export default function Horizon_TorchRelay({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('relay'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      if (stage !== 'relay') return;
      console.log(`[KBE:B] TorchRelay torchPassed=true temporalIntegration=true selfContinuity=true`);
      setStage('passed');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: '12px' }}>&#x1F3C3;</div>
          </motion.div>
        )}
        {stage === 'relay' && (
          <motion.div key="rel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: palette.textFaint }}>Younger</div>
                <div style={{ fontSize: '16px' }}>&#x1F9D2;</div>
              </div>
              <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>&#x1F525; &#x2192;</motion.div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: palette.textFaint }}>You</div>
                <div style={{ fontSize: '16px' }}>&#x1F9D1;</div>
              </div>
              <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>&#x1F525; &#x2192;</motion.div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: palette.textFaint }}>Older</div>
                <div style={{ fontSize: '16px' }}>&#x1F9D3;</div>
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are running against yourself. Pass the torch across time.
            </div>
            <motion.div {...drag.bindDrag()} whileTap={{ scale: 0.95 }}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'grab',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`, touchAction: 'none' }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>
                {drag.progress > 0 ? `Passing... ${Math.round(drag.progress * 100)}%` : 'Drag to pass the torch'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'passed' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            The relay is complete. The team is you across time. Past-you laid the groundwork. Present-you carries the fire. Future-you will carry it further. You are not competing with others. You are running a relay with the versions of yourself.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Self-Continuity (Ersner-Hershfield): people who feel connected to their future selves save more, exercise more, and make more ethical decisions. The relay metaphor bridges the temporal gap; your future self is not a stranger. They{"'"}re your teammate.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Relayed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}