/**
 * MULTIVERSE #1 — The Identity Prism
 * "You are a spectrum. Which frequency does this moment require?"
 * ARCHETYPE: Pattern A (Tap) — Select a Self from refracted spectrum
 * ENTRY: Scene-first — white light hits prism
 * STEALTH KBE: Speed of selection = Self-Complexity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'refracted' | 'embodied' | 'resonant' | 'afterglow';

const SELVES = [
  { label: 'The Parent', hue: 0 },
  { label: 'The Creator', hue: 45 },
  { label: 'The Warrior', hue: 120 },
  { label: 'The Child', hue: 270 },
];

export default function Multiverse_IdentityPrism({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState('');
  const startRef = useRef(Date.now());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => { setStage('refracted'); startRef.current = Date.now(); }, 2200); return () => T.current.forEach(clearTimeout); }, []);

  const select = (label: string) => {
    if (stage !== 'refracted') return;
    setChosen(label);
    const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);
    console.log(`[KBE:K] IdentityPrism self="${label}" selectionTimeS=${elapsed} selfComplexity=confirmed`);
    setStage('embodied');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '24px', background: themeColor(TH.primaryHSL, 0.04, 2),
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          </motion.div>
        )}
        {stage === 'refracted' && (
          <motion.div key="ref" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              White light enters the prism. A spectrum of selves emerges. Which frequency does this moment require?
            </div>
            {/* Prism + spectrum */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '3px', height: '20px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              <div style={{ width: '16px', height: '20px', background: themeColor(TH.primaryHSL, 0.03, 2),
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
              <div style={{ display: 'flex', gap: '2px' }}>
                {SELVES.map((s, i) => (
                  <motion.div key={i} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2 + i * 0.15 }}
                    style={{ width: '3px', height: '20px', borderRadius: '1px',
                      background: `hsla(${s.hue}, 15%, 35%, 0.08)` }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SELVES.map(s => (
                <motion.div key={s.label} whileTap={{ scale: 0.9 }} onClick={() => select(s.label)}
                  style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                    background: `hsla(${s.hue}, 12%, 22%, 0.04)`,
                    border: `1px solid hsla(${s.hue}, 12%, 28%, 0.08)` }}>
                  <span style={{ fontSize: '11px', color: `hsla(${s.hue}, 12%, 35%, 0.3)` }}>{s.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'embodied' && (
          <motion.div key="em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {chosen}. Not your only frequency — just the one this moment needs. Stop trying to be {"'"}One Person.{"'"} That container is too small. You are a spectrum. The prism doesn{"'"}t destroy the light; it reveals what was always there.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-complexity. Patricia Linville{"'"}s research: people with greater self-complexity (multiple distinct self-aspects) are more resilient to stress. When one identity takes a hit, the others provide stability. You are not a single point of failure. You are a constellation of selves, each activated by different contexts.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Refracted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}