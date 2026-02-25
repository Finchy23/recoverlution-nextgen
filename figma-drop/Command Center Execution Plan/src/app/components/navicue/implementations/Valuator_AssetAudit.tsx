/**
 * VALUATOR #3 — The Asset Audit
 * "Relationships are investments. Audit the portfolio."
 * ARCHETYPE: Pattern A (Tap) — Categorize faces into Assets or Liabilities
 * ENTRY: Scene-first — two columns appear
 * STEALTH KBE: Categorization speed = Relational Clarity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VALUATOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Circuit');
type Stage = 'arriving' | 'active' | 'audited' | 'resonant' | 'afterglow';
const FACES = [
  { id: 'a', label: 'Mentor', truth: 'asset' },
  { id: 'b', label: 'Critic', truth: 'liability' },
  { id: 'c', label: 'Partner', truth: 'asset' },
  { id: 'd', label: 'Drainer', truth: 'liability' },
];

export default function Valuator_AssetAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [sorted, setSorted] = useState<Record<string, string>>({});
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const startTime = useRef(0);

  useEffect(() => {
    t(() => { setStage('active'); startTime.current = Date.now(); }, 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const categorize = (id: string, col: 'asset' | 'liability') => {
    if (stage !== 'active') return;
    const next = { ...sorted, [id]: col };
    setSorted(next);
    if (Object.keys(next).length === FACES.length) {
      const elapsed = Date.now() - startTime.current;
      console.log(`[KBE:K] AssetAudit timeMs=${elapsed} relationalClarity=${elapsed < 10000}`);
      setStage('audited');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  const unsorted = FACES.filter(f => !sorted[f.id]);
  const current = unsorted[0];

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '40px' }}>
            <div style={{ ...navicueType.hint, color: 'hsla(0, 30%, 40%, 0.3)' }}>Liabilities</div>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.2, 8) }}>Assets</div>
          </motion.div>
        )}
        {stage === 'active' && current && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Audit the portfolio.
            </div>
            <motion.div key={current.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.text }}>{current.label}</span>
            </motion.div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => categorize(current.id, 'liability')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor([0, 15, 25], 0.06, 3),
                  border: `1px solid ${'hsla(0, 20%, 35%, 0.15)'}` }}>
                <div style={{ ...navicueType.choice, color: 'hsla(0, 30%, 40%, 0.5)', fontSize: '11px' }}>Drain</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => categorize(current.id, 'asset')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Gain</div>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>{unsorted.length} remaining</div>
          </motion.div>
        )}
        {stage === 'audited' && (
          <motion.div key="au" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Portfolio audited. Some pay dividends. Some charge interest. Protect your energy.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Relational clarity. Quick categorization means you already know; hovering means denial. Relationships are investments: audit regularly. Cut the liabilities before they bankrupt your energy.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Audited.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}