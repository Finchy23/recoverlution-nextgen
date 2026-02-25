/**
 * TRICKSTER #9 — Sandbox Mode
 * "Why does everything need a KPI? Play without a purpose."
 * ARCHETYPE: Pattern B (Drag) — Drag blocks around, no goal
 * ENTRY: Scene-first — physics blocks
 * STEALTH KBE: Duration of purposeless play = Intrinsic Motivation (K)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'knowing', 'Storm');
type Stage = 'arriving' | 'active' | 'playing' | 'resonant' | 'afterglow';

interface Block { id: number; x: number; y: number; w: number; h: number; color: string; }

export default function Trickster_SandboxMode({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [playTime, setPlayTime] = useState(0);
  const playStart = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    t(() => {
      setStage('active');
      const colors = [
        themeColor(TH.accentHSL, 0.15, 8),
        themeColor(TH.primaryHSL, 0.1, 6),
        themeColor(TH.accentHSL, 0.12, 4),
        themeColor(TH.primaryHSL, 0.08, 8),
        themeColor(TH.accentHSL, 0.1, 12),
      ];
      setBlocks(colors.map((c, i) => ({
        id: i, x: 20 + Math.random() * 130, y: 15 + Math.random() * 80,
        w: 20 + Math.random() * 25, h: 16 + Math.random() * 20, color: c,
      })));
      playStart.current = Date.now();
    }, 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Auto-complete after 12 seconds of play
  useEffect(() => {
    if (stage !== 'active') return;
    const iv = setInterval(() => {
      const elapsed = Math.round((Date.now() - playStart.current) / 1000);
      setPlayTime(elapsed);
      if (elapsed >= 12) {
        clearInterval(iv);
        console.log(`[KBE:K] SandboxMode playDurationSec=${elapsed} intrinsicMotivation=confirmed`);
        setStage('playing');
        t(() => setStage('resonant'), 4000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [stage]);

  const onDown = useCallback((id: number, e: React.PointerEvent) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    offset.current = { x: e.clientX - block.x, y: e.clientY - block.y };
    setDragging(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [blocks]);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (dragging === null) return;
    setBlocks(bs => bs.map(b => b.id === dragging
      ? { ...b, x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }
      : b));
  }, [dragging]);

  const onUp = useCallback(() => { setDragging(null); }, []);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="knowing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '16px', height: '12px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              No goal. No score. Just play. Drag the blocks anywhere.
            </div>
            <div onPointerMove={onMove} onPointerUp={onUp}
              style={{ width: '200px', height: '130px', borderRadius: radius.sm, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                touchAction: 'none', overflow: 'hidden' }}>
              {blocks.map(b => (
                <div key={b.id} onPointerDown={e => onDown(b.id, e)}
                  style={{ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h,
                    borderRadius: radius.xs, background: b.color, cursor: 'grab',
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                    transform: dragging === b.id ? 'scale(1.1)' : 'none',
                    transition: 'transform 0.1s' }} />
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              playing for {playTime}s, no purpose required
            </div>
          </motion.div>
        )}
        {stage === 'playing' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.4, 12), textAlign: 'center', maxWidth: '260px' }}>
            {playTime} seconds of purposeless play. That{"'"}s not waste. It{"'"}s fertilizer. The brain just reorganized.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Intrinsic motivation. Why does everything need a KPI? The default mode network, the brain{"'"}s creative engine, only activates during purposeless activity. Wasting time is not waste; it{"'"}s fertilizer. Play without a purpose is where insight grows.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Played.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}