/**
 * TRIBALIST #2 — The Circle Audit
 * "You are an ecosystem. Invasive species will destroy the garden."
 * ARCHETYPE: Pattern B (Drag) — Drag red (Taker) dots to outer edge
 * ENTRY: Scene-first — orbiting dots around central avatar
 * STEALTH KBE: Speed/decisiveness of boundary = Boundary Conviction (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'active' | 'pruned' | 'resonant' | 'afterglow';

interface Dot { id: number; type: 'giver' | 'taker'; removed: boolean; angle: number; }

export default function Tribalist_CircleAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dots, setDots] = useState<Dot[]>([
    { id: 0, type: 'giver', removed: false, angle: 0 },
    { id: 1, type: 'taker', removed: false, angle: 60 },
    { id: 2, type: 'giver', removed: false, angle: 120 },
    { id: 3, type: 'taker', removed: false, angle: 200 },
    { id: 4, type: 'giver', removed: false, angle: 280 },
    { id: 5, type: 'taker', removed: false, angle: 340 },
  ]);
  const startTime = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => { setStage('active'); startTime.current = Date.now(); }, 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const removeDot = (id: number) => {
    if (stage !== 'active') return;
    const updated = dots.map(d => d.id === id ? { ...d, removed: true } : d);
    setDots(updated);
    const takersLeft = updated.filter(d => d.type === 'taker' && !d.removed).length;
    if (takersLeft === 0) {
      const elapsed = Date.now() - startTime.current;
      console.log(`[KBE:K] CircleAudit pruneTimeMs=${elapsed} boundaryConviction=${elapsed < 8000}`);
      setStage('pruned');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  const radius = 55;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.15, 8) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Prune the takers. Protect your energy.
            </div>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
              {/* Center - you */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '14px', height: '14px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.2, 10) }} />
              {/* Orbiting dots */}
              {dots.filter(d => !d.removed).map(d => {
                const rad = (d.angle * Math.PI) / 180;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;
                return (
                  <motion.div key={d.id} whileTap={{ scale: 0.85 }} onClick={() => d.type === 'taker' ? removeDot(d.id) : undefined}
                    style={{ position: 'absolute', top: `calc(50% + ${y}px)`, left: `calc(50% + ${x}px)`,
                      transform: 'translate(-50%, -50%)', width: '16px', height: '16px', borderRadius: '50%',
                      background: d.type === 'giver'
                        ? themeColor(TH.accentHSL, 0.2, 10)
                        : 'hsla(0, 30%, 40%, 0.3)',
                      cursor: d.type === 'taker' ? 'pointer' : 'default',
                      border: `1px solid ${d.type === 'giver'
                        ? themeColor(TH.accentHSL, 0.1, 6)
                        : 'hsla(0, 30%, 40%, 0.15)'}` }} />
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              tap the red dots to prune
            </div>
          </motion.div>
        )}
        {stage === 'pruned' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '14px', height: '14px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.25, 12) }} />
              {dots.filter(d => d.type === 'giver').map((d, i) => {
                const rad = ((i * 120) * Math.PI) / 180;
                return (
                  <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.3 }}
                    style={{ position: 'absolute', top: `calc(50% + ${Math.sin(rad) * 35}px)`,
                      left: `calc(50% + ${Math.cos(rad) * 35}px)`, transform: 'translate(-50%, -50%)',
                      width: '12px', height: '12px', borderRadius: '50%',
                      background: themeColor(TH.accentHSL, 0.2, 10) }} />
                );
              })}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The garden is clean. Only givers remain. Your energy is protected.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Relational clarity. Your social ecosystem requires active curation. The speed with which you identify and remove takers reveals your boundary conviction: the immune system of your social life.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Pruned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}