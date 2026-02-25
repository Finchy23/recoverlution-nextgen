/**
 * CONSTRUCT #3 — The Memory Palace / The Hall (Method of Loci)
 * "The brain forgets. The hallway remembers. Hang the victory."
 * ARCHETYPE: Pattern A (Tap) — Tap an empty frame to hang a win
 * ENTRY: Scene-first — the hallway with frames appears before prompt
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'hung' | 'resonant' | 'afterglow';

const FRAMES = [
  { id: 0, filled: true, label: 'First breath of courage' },
  { id: 1, filled: true, label: 'Said no for the first time' },
  { id: 2, filled: false, label: '' },
];

export default function Construct_MemoryPalace({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [win, setWin] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const hangFrame = () => {
    if (!win.trim()) return;
    setStage('hung');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const renderFrame = (f: typeof FRAMES[0], i: number, empty = false) => (
    <motion.div key={f.id} initial={{ opacity: i === 2 ? 0.3 : 0.6 }}
      animate={{ opacity: empty ? 0.4 : 0.8 }}
      style={{ width: '80px', height: '60px', borderRadius: radius.xs,
        border: `1px solid ${themeColor(TH.accentHSL, empty ? 0.08 : 0.14, 8)}`,
        background: themeColor(TH.primaryHSL, empty ? 0.04 : 0.1, 4),
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
      {f.filled || (stage === 'hung' && f.id === 2) ? (
        <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 12), textAlign: 'center',
          fontFamily: 'monospace', lineHeight: 1.4 }}>
          {f.id === 2 && stage === 'hung' ? win : f.label}
        </div>
      ) : (
        <div style={{ fontSize: '16px', color: themeColor(TH.accentHSL, 0.08, 6) }}>+</div>
      )}
    </motion.div>
  );

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {FRAMES.map((f, i) => renderFrame(f, i, !f.filled))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the hallway remembers</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              One frame is empty. Hang a victory. When you feel small, walk down this hall.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {FRAMES.map((f, i) => renderFrame(f, i, !f.filled))}
            </div>
            <input value={win} onChange={(e) => setWin(e.target.value)} placeholder="A win worth remembering"
              style={{ width: '220px', padding: '10px 14px', borderRadius: radius.md, textAlign: 'center',
                background: themeColor(TH.primaryHSL, 0.06, 3), border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                color: palette.text, fontSize: '12px', fontFamily: 'inherit', outline: 'none' }} />
            {win.trim().length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={hangFrame}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>hang it</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'hung' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {FRAMES.map((f, i) => renderFrame(f, i, false))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>it hangs forever</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Method of Loci. The hippocampus stores spatial navigation cues more reliably than abstract memory. You built a hallway. Walk it when you need proof.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The hall remembers.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}