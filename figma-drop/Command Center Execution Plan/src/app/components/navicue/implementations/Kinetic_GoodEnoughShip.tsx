/**
 * KINETIC #8 — The "Good Enough" Ship
 * "Perfection is procrastination in a tuxedo. 80% is done. Ship it."
 * ARCHETYPE: Pattern A (Tap) — "Ship" (open) vs "Perfect" (locked)
 * ENTRY: Cold open — 80% polished product
 * STEALTH KBE: Pressing Ship = Completion Bias; tapping Perfect = Perfectionism (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'active' | 'shipped' | 'resonant' | 'afterglow';

export default function Kinetic_GoodEnoughShip({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [triedPerfect, setTriedPerfect] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const ship = () => {
    if (stage !== 'active') return;
    console.log(`[KBE:E] GoodEnoughShip shipped=true triedPerfect=${triedPerfect} completionBias=true`);
    setStage('shipped');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const tryPerfect = () => {
    setTriedPerfect(true);
    console.log(`[KBE:E] GoodEnoughShip perfectionism=true`);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '50px', height: '30px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
            <span style={{ fontSize: '11px', color: palette.textFaint }}>80%</span>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              80% polished. Ship it?
            </div>
            <div style={{ width: '80px', height: '50px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '60px', height: '4px', borderRadius: '2px',
                background: `linear-gradient(to right, ${themeColor(TH.accentHSL, 0.2, 8)} 80%, transparent 80%)` }} />
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={ship}
                style={{ padding: '12px 24px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Ship</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={tryPerfect}
                style={{ padding: '12px 24px', borderRadius: radius.lg, cursor: 'not-allowed', opacity: 0.4,
                  background: themeColor(TH.primaryHSL, 0.03, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>Perfect {'\ud83d\udd12'}</div>
              </motion.div>
            </div>
            {triedPerfect && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...navicueType.hint, color: 'hsla(0, 25%, 40%, 0.4)' }}>
                Locked. Perfection is not an option. Ship it.
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'shipped' && (
          <motion.div key="sh" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ x: 0 }} animate={{ x: 60, opacity: [1, 1, 0] }} transition={{ duration: 1.5 }}
              style={{ width: '50px', height: '30px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.1, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }} />
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Shipped. Out the door. You can fix it in v2.0.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Completion bias. Perfection is procrastination in a tuxedo. 80% is done. Ship it. Real feedback from the world beats imagined perfection in isolation. Version 2.0 is where the real polish happens.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Shipped.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}