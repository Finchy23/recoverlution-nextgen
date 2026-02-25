/**
 * SOCIAL PHYSICS #2 — The Status See-Saw
 * "They are shouting to lower your status. Do not shrink. Level the plank."
 * ARCHETYPE: Pattern A (Tap) — Tap to adjust fulcrum on a see-saw
 * ENTRY: Scene-first — tilted see-saw appears
 * STEALTH KBE: Balancing the fulcrum correctly = Social Awareness (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'active' | 'balanced' | 'resonant' | 'afterglow';

export default function SocialPhysics_StatusSeeSaw({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [fulcrum, setFulcrum] = useState(0.3); // 0=left, 1=right
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const adjustFulcrum = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== 'active') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setFulcrum(Math.max(0.15, Math.min(0.85, x)));
  };

  const isBalanced = Math.abs(fulcrum - 0.5) < 0.08;

  const confirmBalance = () => {
    if (!isBalanced) return;
    console.log(`[KBE:K] StatusSeeSaw fulcrum=${fulcrum.toFixed(2)} statusAwareness=confirmed`);
    setStage('balanced');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const tiltDeg = (fulcrum - 0.5) * -30;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '180px', height: '6px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.12, 6), transform: 'rotate(-8deg)' }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>uneven</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Level the plank. Find the balance point.
            </div>
            {/* See-saw */}
            <div style={{ position: 'relative', width: '220px', height: '80px' }}>
              <motion.div animate={{ rotate: tiltDeg }}
                style={{ position: 'absolute', top: '20px', left: '0', width: '220px', height: '6px',
                  borderRadius: '3px', background: themeColor(TH.primaryHSL, 0.15, 8),
                  transformOrigin: `${fulcrum * 100}% 50%` }}>
                {/* Them weight (left) */}
                <div style={{ position: 'absolute', left: '10px', top: '-14px',
                  width: '20px', height: '14px', borderRadius: '4px 4px 0 0',
                  background: themeColor(TH.primaryHSL, 0.12, 6) }}>
                  <div style={{ fontSize: '11px', textAlign: 'center', color: themeColor(TH.primaryHSL, 0.3, 12), paddingTop: '2px' }}>THEM</div>
                </div>
                {/* You weight (right) */}
                <div style={{ position: 'absolute', right: '10px', top: '-10px',
                  width: '16px', height: '10px', borderRadius: '4px 4px 0 0',
                  background: themeColor(TH.accentHSL, 0.1, 6) }}>
                  <div style={{ fontSize: '11px', textAlign: 'center', color: themeColor(TH.accentHSL, 0.3, 12), paddingTop: '1px' }}>YOU</div>
                </div>
              </motion.div>
              {/* Fulcrum */}
              <div style={{ position: 'absolute', top: '26px', left: `${fulcrum * 100}%`,
                transform: 'translateX(-50%)', width: '0', height: '0',
                borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
                borderBottom: `12px solid ${themeColor(TH.accentHSL, 0.2, 8)}` }} />
              {/* Click zone */}
              <div onClick={adjustFulcrum}
                style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
                  cursor: 'pointer' }} />
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={confirmBalance}
              style={{ padding: '14px 24px', borderRadius: radius.full, cursor: isBalanced ? 'pointer' : 'not-allowed',
                opacity: isBalanced ? 1 : 0.3,
                background: themeColor(TH.accentHSL, 0.08, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 10)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Level</div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {isBalanced ? 'balanced, confirm' : 'tap the plank to move the fulcrum'}
            </div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="bal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '180px', height: '6px', borderRadius: '3px',
              background: themeColor(TH.accentHSL, 0.2, 10) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Neither shrinking nor shouting. Standing tall. The playing field is level.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Status detection. Finding the balance point in a power dynamic requires social awareness, sensing the hidden fulcrum where neither party dominates.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Leveled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}