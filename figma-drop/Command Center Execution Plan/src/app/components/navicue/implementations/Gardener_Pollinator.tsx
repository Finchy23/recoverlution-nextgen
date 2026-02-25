/**
 * GARDENER II #7 — The Pollinator
 * "Ideas are sterile alone. They need sex."
 * Pattern A (Tap) — Visit flower-Ideas; cross-pollinate two domains; new hybrid blooms
 * STEALTH KBE: Mixing two distinct domains = Interdisciplinary Thinking / Combinatorial Creativity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Ecological Identity', 'knowing', 'Canopy');
type Stage = 'arriving' | 'field' | 'hybrid' | 'resonant' | 'afterglow';

const FLOWERS = [
  { id: 'tech', label: 'Technology' },
  { id: 'biology', label: 'Biology' },
  { id: 'poetry', label: 'Poetry' },
  { id: 'physics', label: 'Physics' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'music', label: 'Music' },
];

const HYBRIDS: Record<string, string> = {
  'tech+biology': 'Biotech: Living machines',
  'tech+poetry': 'Code Poetry: Algorithms that breathe',
  'tech+physics': 'Quantum Computing: Logic beyond logic',
  'tech+cooking': 'Molecular Gastronomy: Flavor engineering',
  'tech+music': 'Algorithmic Composition: Math that sings',
  'biology+poetry': 'Biomimicry Poetry: Nature\'s verses',
  'biology+physics': 'Biophysics: Life\'s equations',
  'biology+cooking': 'Fermentation: Microbial alchemy',
  'biology+music': 'Bioacoustics: The music of cells',
  'poetry+physics': 'Einstein\'s Dreams: Lyrical spacetime',
  'poetry+cooking': 'Culinary Narrative: Stories you taste',
  'poetry+music': 'Song: The original hybrid art',
  'physics+cooking': 'Food Science: Heat transfer on a plate',
  'physics+music': 'Acoustics: Wave mathematics',
  'cooking+music': 'Synesthesia Kitchen: Sound flavors',
};

export default function Gardener_Pollinator({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState<string[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('field'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const visit = (id: string) => {
    if (stage !== 'field') return;
    if (selected.includes(id)) return;
    const next = [...selected, id];
    setSelected(next);
    if (next.length === 2) {
      const key = next.sort().join('+');
      console.log(`[KBE:K] Pollinator combinatorialCreativity=confirmed domains=[${next}] hybrid=${key}`);
      t(() => {
        setStage('hybrid');
        t(() => setStage('resonant'), 5500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
      }, 800);
    }
  };

  const key = selected.length === 2 ? selected.sort().join('+') : '';
  const hybridName = HYBRIDS[key] || 'A new species of thought';

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ x: [-3, 3, -3] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <span style={{ fontSize: '11px', opacity: 0.3 }}>◦</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'field' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are a bee. Visit two flowers (domains) to cross-pollinate. {selected.length === 1 ? 'Pick one more.' : 'Pick two.'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {FLOWERS.map(f => {
                const on = selected.includes(f.id);
                return (
                  <motion.div key={f.id} whileTap={{ scale: 0.9 }} onClick={() => visit(f.id)}
                    style={{ padding: '12px 18px', borderRadius: '14px', cursor: 'pointer',
                      background: on ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.03, 1),
                      border: `1px solid ${on ? themeColor(TH.accentHSL, 0.14, 6) : themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                    <span style={{ fontSize: '11px', color: on ? themeColor(TH.accentHSL, 0.5, 14) : palette.textFaint }}>
                      {f.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        {stage === 'hybrid' && (
          <motion.div key="h" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            A new flower blooms: <span style={{ fontStyle: 'italic' }}>{hybridName}</span>. Ideas are sterile alone. They need cross-pollination. You mixed {selected.map(id => FLOWERS.find(f => f.id === id)?.label).join(' and ')}, and something neither field could have produced alone emerged. The innovator is always a bee: visiting different gardens, carrying pollen between worlds.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Combinatorial creativity. Arthur Koestler{"'"}s "bisociation": creative breakthroughs occur at the intersection of two previously unrelated frames of reference. Frans Johansson{"'"}s "Medici Effect": innovation happens at the intersection of diverse fields. Steve Jobs: "Creativity is just connecting things." Darwin visited geology, pigeon breeding, AND economics before synthesizing natural selection. The bee visits many flowers. The specialist stays on one. Both are needed, but the bee creates new species.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Pollinated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}