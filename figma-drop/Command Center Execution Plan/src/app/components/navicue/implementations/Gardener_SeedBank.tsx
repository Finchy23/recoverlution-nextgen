/**
 * GARDENER II #1 — The Seed Bank
 * "Most seeds will not sprout in your lifetime. Plant them anyway."
 * Pattern A (Tap) — Select seeds (Patience, Truth, Courage vs Fast Cash); plant in "The Future"
 * STEALTH KBE: Choosing slow-growth seed = Long-Term Orientation / Generativity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'vault' | 'planted' | 'resonant' | 'afterglow';

const SEEDS = [
  { id: 'patience', label: 'Patience', slow: true },
  { id: 'truth', label: 'Truth', slow: true },
  { id: 'courage', label: 'Courage', slow: true },
  { id: 'peace', label: 'Peace', slow: true },
  { id: 'fastcash', label: 'Fast Cash', slow: false },
  { id: 'fame', label: 'Quick Fame', slow: false },
];

export default function Gardener_SeedBank({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState<string[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('vault'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const toggle = (id: string) => {
    if (stage !== 'vault') return;
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id].slice(-3));
  };

  const plant = () => {
    if (stage !== 'vault' || selected.length === 0) return;
    const slowCount = selected.filter(id => SEEDS.find(s => s.id === id)?.slow).length;
    console.log(`[KBE:B] SeedBank seeds=[${selected}] slowGrowth=${slowCount}/${selected.length} longTermOrientation=${slowCount > selected.length / 2}`);
    setStage('planted');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '4px', height: '6px', borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
                  background: themeColor(TH.accentHSL, 0.06, 3) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'vault' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A vault of seeds. Heirlooms. Select up to three to plant in The Future.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {SEEDS.map(s => {
                const on = selected.includes(s.id);
                return (
                  <motion.div key={s.id} whileTap={{ scale: 0.9 }} onClick={() => toggle(s.id)}
                    style={{ padding: '6px 12px', borderRadius: radius.md, cursor: 'pointer',
                      background: on ? themeColor(TH.accentHSL, 0.08, 3) : themeColor(TH.primaryHSL, 0.03, 1),
                      border: `1px solid ${on ? themeColor(TH.accentHSL, 0.14, 6) : themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                    <span style={{ fontSize: '11px', color: on ? themeColor(TH.accentHSL, 0.5, 14) : palette.textFaint }}>
                      {s.slow ? '○ ' : '· '}{s.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            {selected.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.9 }} onClick={plant}
                style={immersiveTapPillThemed(TH.accentHSL).container}>
                <div style={immersiveTapPillThemed(TH.accentHSL).label}>Plant in The Future</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'planted' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Planted. {selected.filter(id => SEEDS.find(s => s.id === id)?.slow).length > 0
              ? 'You chose seeds that won\'t sprout in your lifetime. Shade is a gift you give to strangers. The heirloom seeds — Patience, Truth, Courage, Peace — they take generations. But they feed generations too. The fast crops give quick returns and leave the soil barren.'
              : 'You chose the fast crops. They\'ll yield quickly. But heirloom seeds — the slow ones — are what build forests. What if next time you planted something you\'d never see bloom?'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Generativity (Erikson{"'"}s 7th stage): the concern for establishing and guiding the next generation. The Svalbard Global Seed Vault stores 1.1 million seed samples as insurance against catastrophe — a literal generative act. Research (McAdams & de St. Aubin): highly generative adults report greater life satisfaction, lower depression, and stronger sense of meaning. The seeds you plant for strangers are the truest measure of who you are.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Seeded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}