/**
 * OPTICIAN #8 — The Broken Mirror (Integration)
 * "You feel fragmented. That is an illusion. The pieces are all here."
 * ARCHETYPE: Pattern A (Tap) — Tap scattered pieces to reassemble
 * ENTRY: Cold open — shattered fragments appear immediately
 * STEALTH KBE: Completion rate = commitment to Wholeness (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'shattered' | 'active' | 'whole' | 'resonant' | 'afterglow';

const FRAGMENTS = [
  { id: 0, label: 'joy', ox: -45, oy: -35 },
  { id: 1, label: 'grief', ox: 40, oy: -30 },
  { id: 2, label: 'strength', ox: -50, oy: 25 },
  { id: 3, label: 'doubt', ox: 35, oy: 30 },
  { id: 4, label: 'hope', ox: -10, oy: -50 },
  { id: 5, label: 'fear', ox: 15, oy: 45 },
];

export default function Optician_BrokenMirror({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('shattered');
  const [placed, setPlaced] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const placePiece = (id: number) => {
    const next = new Set(placed);
    next.add(id);
    setPlaced(next);
    if (next.size === FRAGMENTS.length) {
      console.log(`[KBE:B] BrokenMirror completionRate=1.0 piecesPlaced=${FRAGMENTS.length}`);
      t(() => setStage('whole'), 600);
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'shattered' && (
          <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '180px', height: '180px', position: 'relative' }}>
              {FRAGMENTS.map((f) => (
                <motion.div key={f.id}
                  initial={{ x: f.ox * 1.5, y: f.oy * 1.5, rotate: (f.id * 23) % 40 - 20 }}
                  animate={{ x: f.ox * 1.5, y: f.oy * 1.5, rotate: (f.id * 23) % 40 - 20 }}
                  style={{ position: 'absolute', top: '50%', left: '50%',
                    width: '40px', height: '30px', borderRadius: radius.xs,
                    background: themeColor(TH.primaryHSL, 0.08, 4 + f.id * 2),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ ...navicueType.hint, fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 10) }}>{f.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You feel fragmented. That is an illusion. The pieces are all here. Integration is an act of will.
            </div>
            <div style={{ width: '180px', height: '180px', position: 'relative' }}>
              {/* Center target */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '90px', height: '90px', borderRadius: '50%',
                border: `1px dashed ${themeColor(TH.accentHSL, 0.08, 8)}` }} />
              {FRAGMENTS.map((f) => {
                const isPlaced = placed.has(f.id);
                return (
                  <motion.div key={f.id}
                    animate={{ x: isPlaced ? 0 : f.ox, y: isPlaced ? 0 : f.oy,
                      rotate: isPlaced ? 0 : (f.id * 23) % 30 - 15, scale: isPlaced ? 0.9 : 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    onClick={() => !isPlaced && placePiece(f.id)}
                    whileTap={!isPlaced ? { scale: 0.9 } : undefined}
                    style={{ position: 'absolute', top: 'calc(50% - 15px)', left: 'calc(50% - 20px)',
                      width: '40px', height: '30px', borderRadius: radius.xs, cursor: isPlaced ? 'default' : 'pointer',
                      background: isPlaced
                        ? themeColor(TH.accentHSL, 0.1, 8)
                        : themeColor(TH.primaryHSL, 0.08, 4 + f.id * 2),
                      border: `1px solid ${themeColor(TH.accentHSL, isPlaced ? 0.12 : 0.06, 6)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ ...navicueType.hint, fontSize: '11px',
                      color: themeColor(TH.accentHSL, isPlaced ? 0.35 : 0.2, 10) }}>{f.label}</div>
                  </motion.div>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              tap each piece to integrate ({placed.size}/{FRAGMENTS.length})
            </div>
          </motion.div>
        )}
        {stage === 'whole' && (
          <motion.div key="w" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div
              animate={{ boxShadow: [`0 0 0px ${themeColor(TH.accentHSL, 0, 10)}`, `0 0 20px ${themeColor(TH.accentHSL, 0.1, 10)}`, `0 0 0px ${themeColor(TH.accentHSL, 0, 10)}`] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '90px', height: '90px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.1, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 10)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12), fontSize: '13px' }}>whole</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>not broken. reassembled.</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-concept fragmentation is a perceptual illusion. IFS therapy shows all parts serve a function. The act of deliberate reassembly, touching each fragment, is the integration itself.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Whole.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}