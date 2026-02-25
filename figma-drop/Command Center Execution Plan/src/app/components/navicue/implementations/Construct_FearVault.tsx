/**
 * CONSTRUCT #5 — The Fear Vault (Cognitive Offloading)
 * "It is safe here. It cannot get out. I will hold it in the dark."
 * ARCHETYPE: Pattern D (Type) — Type your fear, slam the door shut
 * ENTRY: Cold open — heavy iron door with gears appears first
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'locking' | 'resonant' | 'afterglow';

export default function Construct_FearVault({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lockAngle, setLockAngle] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const type = useTypeInteraction({
    minLength: 3,
    onAccept: () => {
      setStage('locking');
      let angle = 0;
      const spin = setInterval(() => {
        angle += 45;
        setLockAngle(angle);
        if (angle >= 360) { clearInterval(spin); }
      }, 150);
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 1600);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '100px', height: '120px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.18, 6),
              border: `2px solid ${themeColor(TH.accentHSL, 0.1, 4)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%',
                border: `2px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }} />
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              It is safe here. It cannot get out. You do not need to hold it in your head.
            </div>
            <textarea
              value={type.value}
              onChange={(e) => type.onChange(e.target.value)}
              placeholder="Type the fear you carry..."
              style={{ width: '240px', minHeight: '70px', padding: '12px', borderRadius: radius.md, resize: 'none',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                color: palette.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
            {type.value.length >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={type.submit}
                style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer' }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>lock the vault</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'locking' && (
          <motion.div key="lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.3 }}
              style={{ width: '100px', height: '120px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.22, 8),
                border: `2px solid ${themeColor(TH.accentHSL, 0.14, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div animate={{ rotate: lockAngle }} transition={{ duration: 0.15 }}
                style={{ width: '28px', height: '28px', borderRadius: '50%',
                  border: `2px solid ${themeColor(TH.accentHSL, 0.2, 10)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '8px', height: '2px', background: themeColor(TH.accentHSL, 0.3, 12) }} />
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>clank.</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive Offloading. Writing down intrusive thoughts and physically locking them away reduces the working memory load required to suppress them. The Bear Effect {'\u2014'} you do not need to hold it in your head.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Locked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}