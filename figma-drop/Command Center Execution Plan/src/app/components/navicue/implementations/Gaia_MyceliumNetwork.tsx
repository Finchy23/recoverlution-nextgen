/**
 * GAIA #2 — The Mycelium Network
 * "Beneath your feet is a brain older than yours."
 * Pattern A (Tap) — Tap mushrooms to light up underground connections
 * STEALTH KBE: Tracing hidden connections = Systems Thinking / Systems Awareness (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'knowing', 'Canopy');
type Stage = 'arriving' | 'tapping' | 'connected' | 'resonant' | 'afterglow';

const MUSHROOMS = [
  { x: 15, y: 20 }, { x: 50, y: 15 }, { x: 85, y: 25 },
  { x: 30, y: 55 }, { x: 70, y: 50 },
];

const LINKS = [
  [0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [2, 4],
];

export default function Gaia_MyceliumNetwork({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lit, setLit] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('tapping'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tap = (idx: number) => {
    if (stage !== 'tapping') return;
    const next = new Set(lit);
    next.add(idx);
    // Also light connected mushrooms
    LINKS.forEach(([a, b]) => {
      if (a === idx && lit.has(b)) next.add(a);
      if (b === idx && lit.has(a)) next.add(b);
      if (a === idx) next.add(b);
      if (b === idx) next.add(a);
    });
    setLit(next);
    if (next.size >= MUSHROOMS.length) {
      console.log(`[KBE:K] MyceliumNetwork systemsAwareness=confirmed systemsThinking=true`);
      t(() => {
        setStage('connected');
        t(() => setStage('resonant'), 5000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
      }, 800);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '6px', height: '8px', borderRadius: '6px 6px 0 0',
                  background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'tapping' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Tap a mushroom. Watch the underground network light up. The Wood Wide Web.
            </div>
            <svg width="140" height="80" viewBox="0 0 140 80" style={{ overflow: 'visible' }}>
              {/* Underground threads */}
              {LINKS.map(([a, b], i) => {
                const active = lit.has(a) && lit.has(b);
                return (
                  <motion.line key={`l${i}`}
                    x1={MUSHROOMS[a].x * 1.4} y1={MUSHROOMS[a].y + 20}
                    x2={MUSHROOMS[b].x * 1.4} y2={MUSHROOMS[b].y + 20}
                    stroke={active ? themeColor(TH.accentHSL, 0.1, 5) : themeColor(TH.primaryHSL, 0.02, 1)}
                    strokeWidth="1.5" strokeDasharray={active ? '0' : '3,3'}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: active ? 1 : 0.3 }}
                  />
                );
              })}
              {/* Mushrooms */}
              {MUSHROOMS.map((m, i) => {
                const isLit = lit.has(i);
                return (
                  <g key={i} onClick={() => tap(i)} style={{ cursor: 'pointer' }}>
                    <rect x={m.x * 1.4 - 2} y={m.y + 8} width="4" height="12" rx="1"
                      fill={themeColor(TH.primaryHSL, 0.04, 2)} />
                    <ellipse cx={m.x * 1.4} cy={m.y + 8} rx="8" ry="6"
                      fill={isLit ? themeColor(TH.accentHSL, 0.1, 5) : themeColor(TH.primaryHSL, 0.04, 2)} />
                    {isLit && (
                      <motion.ellipse cx={m.x * 1.4} cy={m.y + 8} rx="12" ry="9" fill="none"
                        stroke={themeColor(TH.accentHSL, 0.04, 3)} strokeWidth="1"
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.2, opacity: [0.06, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }} />
                    )}
                  </g>
                );
              })}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>{lit.size}/{MUSHROOMS.length} nodes active</div>
          </motion.div>
        )}
        {stage === 'connected' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Connected. The forest is talking. Beneath your feet is a brain older than yours — the mycorrhizal network, connecting every tree. Nutrients flow through fungal threads: a mother tree feeds her seedlings through the network. A dying tree dumps its carbon into the web for others. This is not competition. This is cooperation at scale. You are plugged in. Feel the pulse.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Wood Wide Web. Suzanne Simard{"'"}s research: mycorrhizal networks connect 90% of forest plant species. Trees share carbon, water, and defense signals through fungal hyphae. "Mother trees" preferentially feed their kin. The network exhibits self-organizing, emergent behavior — properties we associate with intelligence. Systems thinking (Meadows, 2008): the behavior of a system cannot be understood by examining its parts in isolation. The forest is not a collection of trees. It is a network.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Connected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}