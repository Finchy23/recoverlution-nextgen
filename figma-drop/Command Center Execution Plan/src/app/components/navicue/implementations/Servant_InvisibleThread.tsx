/**
 * SERVANT #9 — The Invisible Thread
 * "We are a net. Be the strong knot for someone else today."
 * ARCHETYPE: Pattern A (Tap) — Select a weak thread to reinforce
 * ENTRY: Scene-first — glowing threads
 * STEALTH KBE: Valuing the link over the self = Interdependence / Collectivist Thinking (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'network' | 'strengthened' | 'resonant' | 'afterglow';

const THREADS = [
  { label: 'Old friend', strength: 0.3, angle: -30, dist: 40 },
  { label: 'Family', strength: 0.8, angle: 30, dist: 35 },
  { label: 'Colleague', strength: 0.5, angle: 90, dist: 42 },
  { label: 'Neighbor', strength: 0.2, angle: 150, dist: 38 },
  { label: 'Mentor', strength: 0.6, angle: -90, dist: 36 },
];

export default function Servant_InvisibleThread({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('network'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const reinforce = (idx: number) => {
    if (stage !== 'network') return;
    setChosen(idx);
    console.log(`[KBE:B] InvisibleThread thread="${THREADS[idx].label}" interdependence=confirmed collectivistThinking=true`);
    setStage('strengthened');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '50px', height: '50px', position: 'relative' }}>
            {THREADS.slice(0, 3).map((th, i) => (
              <div key={i} style={{ position: 'absolute', left: '25px', top: '25px',
                width: '20px', height: '1px',
                background: themeColor(TH.accentHSL, 0.05, 3),
                transform: `rotate(${th.angle}deg)`, transformOrigin: 'left center' }} />
            ))}
          </motion.div>
        )}
        {stage === 'network' && (
          <motion.div key="net" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your threads. Some bright, some dim. Strengthen one.
            </div>
            {/* Network visualization */}
            <div style={{ width: '150px', height: '150px', position: 'relative' }}>
              {/* Center (you) */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                width: '10px', height: '10px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.2, 10)}` }} />
              {THREADS.map((th, idx) => {
                const rad = (th.angle * Math.PI) / 180;
                const x = 75 + Math.cos(rad) * th.dist;
                const y = 75 + Math.sin(rad) * th.dist;
                const isWeak = th.strength < 0.4;
                return (
                  <div key={idx}>
                    {/* Thread line */}
                    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                      width="150" height="150" viewBox="0 0 150 150">
                      <line x1="75" y1="75" x2={x} y2={y}
                        stroke={themeColor(TH.accentHSL, th.strength * 0.15, 4 + th.strength * 4)}
                        strokeWidth={th.strength * 2} strokeDasharray={isWeak ? '3 3' : 'none'} />
                    </svg>
                    {/* Node */}
                    <motion.div whileTap={isWeak ? { scale: 0.85 } : {}}
                      onClick={isWeak ? () => reinforce(idx) : undefined}
                      style={{ position: 'absolute', left: `${x}px`, top: `${y}px`,
                        transform: 'translate(-50%,-50%)',
                        cursor: isWeak ? 'pointer' : 'default',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                        background: themeColor(TH.accentHSL, th.strength * 0.1, 3 + th.strength * 3),
                        border: `1px solid ${isWeak
                          ? themeColor(TH.accentHSL, 0.08, 4)
                          : themeColor(TH.accentHSL, th.strength * 0.15, 6)}` }} />
                      <span style={{ fontSize: '6px',
                        color: themeColor(TH.accentHSL, 0.15 + th.strength * 0.15, 5 + th.strength * 4) }}>
                        {th.label}
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap a dim thread to strengthen it</div>
          </motion.div>
        )}
        {stage === 'strengthened' && chosen !== null && (
          <motion.div key="str" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Thread strengthened: {THREADS[chosen].label}. We are a net — if one knot holds, the others hold. You chose to strengthen the weakest link. That{"'"}s not just kindness; it{"'"}s structural intelligence. Be the strong knot for someone today.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Interdependence. Ubuntu philosophy: "I am because we are." Research in social network science shows that the strength of weak ties (Granovetter) often matters more than strong ones — and that strengthening weak connections produces outsized benefits for the entire network. You are a knot in a net. Your strength isn{"'"}t just yours; it holds up everyone connected to you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Knotted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}