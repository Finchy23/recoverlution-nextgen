/**
 * ADAPTIVE #4 -- The Water Mode
 * "You cannot break water. Be water."
 * ARCHETYPE: Pattern B (Drag) -- Navigate a ball through obstacles by dragging
 * ENTRY: Scene-first -- maze of rocks
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'active' | 'flowed' | 'resonant' | 'afterglow';

const GATES = [
  { x: 70, gap: 25 },
  { x: 130, gap: 30 },
  { x: 190, gap: 20 },
];

export default function Adaptive_WaterMode({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [ballX, setBallX] = useState(0);
  const [ballY, setBallY] = useState(50);
  const [hits, setHits] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (stage !== 'active' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(230, e.clientX - rect.left));
    const y = Math.max(0, Math.min(100, e.clientY - rect.top));
    setBallX(x);
    setBallY(y);

    // Check gate collisions
    let newHits = 0;
    for (const g of GATES) {
      if (Math.abs(x - g.x) < 8) {
        const gateTop = 50 - g.gap / 2;
        const gateBot = 50 + g.gap / 2;
        if (y < gateTop || y > gateBot) newHits++;
      }
    }
    setHits(newHits);

    // Reached the end
    if (x > 220) {
      console.log(`[KBE:E] WaterMode hits=${newHits} somaticFluidity=${newHits === 0}`);
      setStage('flowed');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  }, [stage]);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '8px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '12px', height: '18px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.08, 5) }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Be water. Flow through the gaps.
            </div>
            <div ref={containerRef} onPointerMove={handlePointerMove}
              style={{ width: '240px', height: '100px', borderRadius: radius.sm, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.03, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                touchAction: 'none', cursor: 'crosshair' }}>
              {/* Gates */}
              {GATES.map((g, i) => (
                <div key={i}>
                  <div style={{ position: 'absolute', left: g.x - 2, top: 0, width: '4px',
                    height: `${50 - g.gap / 2}px`,
                    background: themeColor(TH.primaryHSL, 0.1, 6) }} />
                  <div style={{ position: 'absolute', left: g.x - 2, bottom: 0, width: '4px',
                    height: `${50 - g.gap / 2}px`,
                    background: themeColor(TH.primaryHSL, 0.1, 6) }} />
                </div>
              ))}
              {/* Ball */}
              <div style={{ position: 'absolute', left: ballX - 4, top: ballY - 4,
                width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.25, 10),
                boxShadow: `0 0 6px ${themeColor(TH.accentHSL, 0.1, 8)}` }} />
            </div>
            <div style={{ ...navicueType.hint, color: hits > 0 ? 'hsla(0, 25%, 40%, 0.4)' : palette.textFaint }}>
              {hits > 0 ? 'hitting walls, too rigid' : 'flowing...'}
            </div>
          </motion.div>
        )}
        {stage === 'flowed' && (
          <motion.div key="fl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Through. Water finds every crack. No force, just flow.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Somatic fluidity. You cannot break water. If you hit it, it flows around your fist. Rigidity shatters; adaptability endures. Be water. Adapt to the container, find every crack, flow through.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Water.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}