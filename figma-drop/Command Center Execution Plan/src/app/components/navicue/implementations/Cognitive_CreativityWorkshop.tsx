/**
 * ARCHITECT II #7 — The Creativity Workshop
 * "The muse does not visit sterile rooms."
 * Pattern E (Draw) — Free scribble on canvas; speed + lack of erasing = confidence
 * STEALTH KBE: Creative flow engagement = Creative Confidence (E)
 * WEB ADAPT: draw → tap-scatter interaction (place marks freely)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Structuring', 'embodying', 'Circuit');
type Stage = 'arriving' | 'creating' | 'created' | 'resonant' | 'afterglow';
type Mark = { x: number; y: number; r: number };

export default function Cognitive_CreativityWorkshop({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [marks, setMarks] = useState<Mark[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('creating'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const addMark = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (stage !== 'creating' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const r = 3 + Math.random() * 6;
    setMarks(prev => [...prev, { x, y, r }]);
  }, [stage]);

  const finish = () => {
    if (marks.length < 5) return;
    console.log(`[KBE:E] CreativityWorkshop marks=${marks.length} creativeConfidence=confirmed creativeFlow=true`);
    setStage('created');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '2px',
              border: `1px dashed ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'creating' && (
          <motion.div key="cr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A messy workshop. Tap anywhere on the canvas. Make something. Don{"'"}t think. The muse doesn{"'"}t visit sterile rooms.
            </div>
            {/* Canvas */}
            <div ref={canvasRef} onClick={addMark} onTouchStart={addMark}
              style={{ width: '140px', height: '100px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.015, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}`,
                position: 'relative', cursor: 'crosshair', overflow: 'hidden', touchAction: 'none' }}>
              {marks.map((m, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ position: 'absolute', left: m.x - m.r / 2, top: m.y - m.r / 2,
                    width: m.r, height: m.r, borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.06 + Math.random() * 0.04, 3 + Math.random() * 4) }} />
              ))}
              {marks.length === 0 && (
                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                  fontSize: '11px', color: palette.textFaint }}>tap to create</span>
              )}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>{marks.length} marks</div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={finish}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                opacity: marks.length >= 5 ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Done</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'created' && (
          <motion.div key="cd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Created. {marks.length} marks. Order is for the library — chaos is for the workshop. Let it be messy. The muse does not visit sterile rooms. You didn{"'"}t need a plan; you needed permission. Creativity is not precision. It{"'"}s play with constraints loose enough to surprise yourself.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Creative confidence. Tom & David Kelley (IDEO/Stanford d.school): creativity is not a talent — it{"'"}s a practice. The biggest blocker is self-censorship: the inner critic that edits before creation. The workshop metaphor: mess is prerequisite. Research on "divergent thinking" (Guilford) shows that quantity of ideas predicts quality. The first 20 ideas are obvious; the breakthrough is idea 21. Don{"'"}t erase. Keep going.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Created.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}