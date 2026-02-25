/**
 * SURFER #5 — The "Good Enough" Release
 * "Loose muscles move faster. Release the tension to gain the speed."
 * ARCHETYPE: Pattern C (Hold) — Hold tight, then release
 * ENTRY: Scene-first — wound spring
 * STEALTH KBE: Release action = Muscle Release / letting go (E)
 * WEB ADAPTATION: Gyroscope → hold-and-release
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'wound' | 'holding' | 'released' | 'resonant' | 'afterglow';

export default function Surfer_GoodEnoughRelease({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tension, setTension] = useState(100);
  const holdStart = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('wound'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const startHold = () => {
    if (stage !== 'wound') return;
    setStage('holding');
    holdStart.current = Date.now();
  };

  const release = () => {
    if (stage !== 'holding') return;
    const held = Date.now() - holdStart.current;
    const remaining = Math.max(0, 100 - (held / 30));
    setTension(remaining);
    console.log(`[KBE:E] GoodEnoughRelease heldMs=${held} muscleRelease=confirmed tensionDrop=${100 - remaining}`);
    setStage('released');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  // Spring visual compression during hold
  useEffect(() => {
    if (stage !== 'holding') return;
    const iv = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      setTension(Math.max(20, 100 - elapsed / 30));
    }, 50);
    return () => clearInterval(iv);
  }, [stage]);

  const springH = tension * 0.6 + 10;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="30" height="40" viewBox="0 0 30 40">
              {Array.from({ length: 6 }).map((_, i) => (
                <line key={i} x1="8" y1={5 + i * 5} x2="22" y2={8 + i * 5}
                  stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="1.5" />
              ))}
            </svg>
          </motion.div>
        )}
        {(stage === 'wound' || stage === 'holding') && (
          <motion.div key="wh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {stage === 'wound' ? 'Hold the spring tight. Then let go.' : 'Tighter... tighter... now release.'}
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), fontSize: '12px' }}>
              Tension: {Math.round(tension)}%
            </div>
            {/* Spring visualization */}
            <svg width="40" height="70" viewBox="0 0 40 70">
              {Array.from({ length: 8 }).map((_, i) => {
                const y = 5 + (i / 8) * springH;
                return <line key={i} x1="10" y1={y} x2="30" y2={y + 2}
                  stroke={themeColor(TH.accentHSL, 0.08 + (1 - tension / 100) * 0.1, 4 + i)}
                  strokeWidth="2" strokeLinecap="round" />;
              })}
            </svg>
            <div
              onPointerDown={startHold}
              onPointerUp={release}
              onPointerLeave={stage === 'holding' ? release : undefined}
              style={{ padding: '14px 32px', borderRadius: radius.full, cursor: 'pointer', userSelect: 'none',
                background: stage === 'holding'
                  ? themeColor(TH.accentHSL, 0.1, 5)
                  : themeColor(TH.accentHSL, 0.06, 3),
                border: `2px solid ${themeColor(TH.accentHSL, stage === 'holding' ? 0.18 : 0.1, 6)}`,
                transform: stage === 'holding' ? 'scale(0.97)' : 'none' }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>
                {stage === 'holding' ? 'Release...' : 'Hold tight'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'released' && (
          <motion.div key="rel" initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div initial={{ height: 20 }} animate={{ height: 60 }} transition={{ type: 'spring', damping: 6 }}
              style={{ width: '2px', borderRadius: '1px',
                background: themeColor(TH.accentHSL, 0.12, 8) }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Boing. Released. The spring settles. Loose muscles move faster: release the tension to gain the speed. Good enough is good enough.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Progressive muscle relaxation. Edmund Jacobson{"'"}s technique: tense a muscle group, then release. The contrast between tension and release teaches the body what relaxation actually feels like. Most of us hold chronic tension without knowing it. The spring is always wound. "Good enough" isn{"'"}t settling; it{"'"}s freedom.
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