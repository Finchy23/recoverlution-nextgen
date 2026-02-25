/**
 * SAGE #2 — The Impermanence (Sand Mandala)
 * "The beauty was in the making, not the keeping."
 * Pattern A (Tap) — Tap to build pattern, then wind auto-destroys it
 * STEALTH KBE: Accepting destruction without undo = Radical Acceptance / Non-Attachment (E)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'embodying', 'Practice');
type Stage = 'arriving' | 'building' | 'wind' | 'released' | 'resonant' | 'afterglow';
type Grain = { x: number; y: number; hue: number };

export default function Sage_Impermanence({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [grains, setGrains] = useState<Grain[]>([]);
  const [scattered, setScattered] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('building'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const addGrain = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (stage !== 'building' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setGrains(prev => [...prev, { x: cx - rect.left, y: cy - rect.top, hue: 30 + Math.random() * 30 }]);
  }, [stage]);

  useEffect(() => {
    if (stage === 'building' && grains.length >= 12) {
      t(() => {
        setStage('wind');
        t(() => setScattered(true), 300);
        t(() => {
          console.log(`[KBE:E] Impermanence grains=${grains.length} nonAttachment=confirmed radicalAcceptance=true`);
          setStage('released');
          t(() => setStage('resonant'), 5500);
          t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
        }, 2500);
      }, 1000);
    }
  }, [grains.length, stage]);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.accentHSL, 0.03, 1)}` }} />
          </motion.div>
        )}
        {(stage === 'building' || stage === 'wind') && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {stage === 'building' ? 'Create a mandala. Tap to place sand. Make it beautiful.' : 'Wind is coming...'}
            </div>
            <div ref={canvasRef} onClick={addGrain} onTouchStart={addGrain}
              style={{ width: '140px', height: '140px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.015, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}`,
                position: 'relative', cursor: 'crosshair', overflow: 'hidden', touchAction: 'none' }}>
              {grains.map((g, i) => (
                <motion.div key={i}
                  initial={{ scale: 0 }}
                  animate={scattered
                    ? { x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200, opacity: 0, scale: 0 }
                    : { scale: 1 }}
                  transition={scattered ? { duration: 1.5, delay: Math.random() * 0.5 } : { duration: 0.2 }}
                  style={{ position: 'absolute', left: g.x - 3, top: g.y - 3,
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: `hsla(${g.hue}, 20%, 35%, 0.08)` }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {stage === 'building' ? `${grains.length}/12 grains` : ''}
            </div>
          </motion.div>
        )}
        {stage === 'released' && (
          <motion.div key="rl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Gone. The beauty was in the making, not the keeping. Everything ends. Do not cling to the sand; let the wind have it. The mandala existed. It was beautiful. And now it is gone. That is not a tragedy. That is the truth. The monks who build sand mandalas for weeks and then sweep them away know: the act of creation IS the purpose.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Non-attachment. Buddhist sand mandalas are deliberately destroyed after completion: a meditation on impermanence (anicca). Psychological research on "savoring without clinging" (Garland, 2015): the ability to appreciate positive experiences without trying to hold onto them predicts lower depression, higher well-being, and greater equanimity. Clinging amplifies suffering. Releasing amplifies peace.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Released.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}