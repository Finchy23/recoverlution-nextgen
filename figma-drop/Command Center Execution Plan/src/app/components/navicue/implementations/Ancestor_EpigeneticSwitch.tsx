/**
 * ANCESTOR #1 -- The Epigenetic Switch
 * "The gene is the piano. The environment is the player. Change the music."
 * ARCHETYPE: Pattern A (Tap) -- Tap a glowing gene to dim it
 * ENTRY: Scene-first -- DNA helix with lit/dark genes
 * STEALTH KBE: Decisive tap = Biological Plasticity belief (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Ember');
type Stage = 'arriving' | 'active' | 'switched' | 'resonant' | 'afterglow';

const GENES = [
  { label: 'Resilience', on: true },
  { label: 'Anxiety', on: true },
  { label: 'Curiosity', on: false },
  { label: 'Stress', on: true },
];

export default function Ancestor_EpigeneticSwitch({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [genes, setGenes] = useState(GENES);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const tapTime = useRef(0);

  useEffect(() => { t(() => { setStage('active'); tapTime.current = Date.now(); }, 2200); return () => T.current.forEach(clearTimeout); }, []);

  const toggle = (i: number) => {
    if (stage !== 'active') return;
    const next = [...genes];
    next[i] = { ...next[i], on: !next[i].on };
    setGenes(next);
    // Check if "Anxiety" is dimmed (negative genes off)
    const negativeOff = !next.find(g => g.label === 'Anxiety')?.on && !next.find(g => g.label === 'Stress')?.on;
    if (negativeOff) {
      const latency = Date.now() - tapTime.current;
      console.log(`[KBE:B] EpigeneticSwitch latencyMs=${latency} biologicalPlasticity=confirmed`);
      setStage('switched');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                background: i % 2 === 0 ? themeColor(TH.accentHSL, 0.12, 6) : themeColor(TH.primaryHSL, 0.06, 3) }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Tap genes to switch them. Turn off the stress. Turn on the resilience.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {genes.map((g, i) => (
                <motion.div key={g.label} whileTap={{ scale: 0.95 }} onClick={() => toggle(i)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px',
                    borderRadius: radius.md, cursor: 'pointer',
                    background: g.on ? themeColor(TH.accentHSL, 0.06, 4) : themeColor(TH.primaryHSL, 0.03, 1),
                    border: `1px solid ${g.on ? themeColor(TH.accentHSL, 0.1, 6) : themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                    background: g.on ? themeColor(TH.accentHSL, 0.2, 8) : themeColor(TH.primaryHSL, 0.05, 3) }} />
                  <span style={{ fontSize: '11px', color: g.on ? themeColor(TH.accentHSL, 0.4, 12) : palette.textFaint }}>
                    {g.label}: {g.on ? 'ON' : 'OFF'}
                  </span>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              dim the negative, light the positive
            </div>
          </motion.div>
        )}
        {stage === 'switched' && (
          <motion.div key="sw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Switched. The piano is the same, but the music changed. You changed the expression.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Epigenetic modification. The gene is the piano. The environment is the player. Lifestyle and psychological state can alter gene expression without changing the DNA. You can turn off the stress gene. You can turn on the resilience.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Switched.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}