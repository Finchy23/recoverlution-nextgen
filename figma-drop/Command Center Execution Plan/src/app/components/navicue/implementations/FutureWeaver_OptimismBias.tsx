/**
 * FUTURE WEAVER #8 — The Optimism Bias (The Toggle)
 * "Optimism is not a delusion. It is a strategy."
 * ARCHETYPE: Pattern A (Tap) — Toggle rose lens, scan for opportunities
 * ENTRY: Scene-first — grey world with glasses
 * STEALTH KBE: Scanning for opportunities = Learned Optimism / Attentional Bias (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'grey' | 'scanning' | 'resonant' | 'afterglow';

const OPPORTUNITIES = [
  { label: 'New Connection', x: 25, y: 30 },
  { label: 'Hidden Skill', x: 60, y: 20 },
  { label: 'Open Door', x: 75, y: 55 },
  { label: 'Second Chance', x: 35, y: 65 },
];

export default function FutureWeaver_OptimismBias({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lensOn, setLensOn] = useState(false);
  const [found, setFound] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('grey'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const toggleLens = () => {
    if (!lensOn) {
      setLensOn(true);
      setStage('scanning');
    }
  };

  const findOpp = (idx: number) => {
    if (!lensOn) return;
    const next = new Set(found);
    next.add(idx);
    setFound(next);
    if (next.size >= OPPORTUNITIES.length) {
      console.log(`[KBE:E] OptimismBias learnedOptimism=confirmed attentionalBias=positive found=${next.size}`);
      t(() => setStage('resonant'), 3000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 9000);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '12px', height: '8px', borderRadius: '50%', border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
              <div style={{ width: '12px', height: '8px', borderRadius: '50%', border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
            </motion.div>
        )}
        {(stage === 'grey' || stage === 'scanning') && (
          <motion.div key="world" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {lensOn ? 'Scan for opportunities. Tap the glowing items.' : 'A grey world. Put on the optimism glasses.'}
            </div>
            {/* Scene */}
            <div style={{ width: '160px', height: '90px', borderRadius: radius.sm, position: 'relative',
              background: lensOn
                ? `linear-gradient(135deg, ${themeColor(TH.accentHSL, 0.02, 1)}, ${themeColor(TH.accentHSL, 0.04, 2)})`
                : themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              transition: 'background 0.5s' }}>
              {OPPORTUNITIES.map((opp, idx) => (
                <motion.div key={idx}
                  animate={lensOn && !found.has(idx) ? { boxShadow: [
                    `0 0 3px ${themeColor(TH.accentHSL, 0.04, 3)}`,
                    `0 0 8px ${themeColor(TH.accentHSL, 0.1, 6)}`,
                    `0 0 3px ${themeColor(TH.accentHSL, 0.04, 3)}`,
                  ] } : {}}
                  transition={lensOn ? { duration: 1.2, repeat: Infinity } : {}}
                  whileTap={lensOn ? { scale: 0.85 } : {}}
                  onClick={() => findOpp(idx)}
                  style={{ position: 'absolute', left: `${opp.x}%`, top: `${opp.y}%`,
                    transform: 'translate(-50%,-50%)', cursor: lensOn ? 'pointer' : 'default',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: found.has(idx)
                      ? themeColor(TH.accentHSL, 0.12, 6)
                      : lensOn ? themeColor(TH.accentHSL, 0.04, 2) : 'transparent',
                    border: found.has(idx)
                      ? `1px solid ${themeColor(TH.accentHSL, 0.2, 10)}`
                      : lensOn ? `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.4s' }}>
                  {(lensOn || found.has(idx)) && (
                    <span style={{ fontSize: '11px', color: found.has(idx) ? themeColor(TH.accentHSL, 0.4, 14) : themeColor(TH.accentHSL, 0.15, 6) }}>
                      {opp.label.split(' ')[0]}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            {!lensOn && (
              <motion.div whileTap={{ scale: 0.9 }} onClick={toggleLens}
                style={immersiveTapPillThemed(TH.accentHSL).container}>
                <div style={immersiveTapPillThemed(TH.accentHSL).label}>Rose Lens</div>
              </motion.div>
            )}
            {lensOn && (
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>{found.size}/{OPPORTUNITIES.length} found</div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Learned optimism. Martin Seligman{"'"}s research: optimism is not a personality trait — it{"'"}s a learnable skill that reshapes attentional bias. Optimists don{"'"}t ignore problems; they see opportunities the pessimist misses. The glasses don{"'"}t create the opportunities — they reveal what was always there. Put on the lens. The world isn{"'"}t grey; your filter was.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Seen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}