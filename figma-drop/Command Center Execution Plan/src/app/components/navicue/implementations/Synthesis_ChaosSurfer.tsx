/**
 * SYNTHESIS #9 — The Chaos Surfer
 * "You cannot control the ocean. You can only control the board."
 * ARCHETYPE: Pattern B (Drag) — Stay balanced on wave via drag
 * ENTRY: Scene-first — wave
 * STEALTH KBE: Constant micro-adjustments = Resilience / Dynamic Balance (E)
 * WEB ADAPT: phone tilt → drag slider
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'surfing' | 'ridden' | 'resonant' | 'afterglow';

export default function Synthesis_ChaosSurfer({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: false, onComplete: () => {} });

  useEffect(() => { t(() => setStage('surfing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const [balanceTime, setBalanceTime] = useState(0);
  const lastCheck = useRef(Date.now());

  useEffect(() => {
    if (stage !== 'surfing') return;
    const iv = setInterval(() => {
      const inZone = drag.progress > 0.35 && drag.progress < 0.65;
      if (inZone) {
        const elapsed = Date.now() - lastCheck.current;
        setBalanceTime(prev => {
          const next = prev + elapsed;
          if (next >= 4000) {
            console.log(`[KBE:E] ChaosSurfer dynamicBalance=confirmed resilience=true balanceMsHeld=${next}`);
            setStage('ridden');
            t(() => setStage('resonant'), 5000);
            t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
          }
          return next;
        });
      }
      lastCheck.current = Date.now();
    }, 200);
    return () => clearInterval(iv);
  }, [stage, drag.progress]);

  const waveOffset = Math.sin(Date.now() / 300) * 5;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="60" height="20" viewBox="0 0 60 20">
              <path d="M0,15 Q15,5 30,15 T60,15" fill="none"
                stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="2" />
            </svg>
          </motion.div>
        )}
        {stage === 'surfing' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Surf the chaos. Stay in the center zone.
            </div>
            {/* Wave + surfer */}
            <div style={{ width: '160px', height: '40px', position: 'relative' }}>
              <svg width="160" height="40" viewBox="0 0 160 40" style={{ position: 'absolute', top: 0 }}>
                <motion.path
                  d={`M0,30 Q40,${10 + waveOffset} 80,30 T160,30`}
                  fill="none" stroke={themeColor(TH.accentHSL, 0.08, 5)} strokeWidth="2" />
              </svg>
              {/* Surfer dot */}
              <div style={{ position: 'absolute', left: `${drag.progress * 140}px`, top: '18px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.15, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.25, 12)}`,
                transition: 'left 0.1s' }} />
              {/* Center zone indicator */}
              <div style={{ position: 'absolute', top: '35px', left: '35%', width: '30%', height: '2px',
                background: themeColor(TH.accentHSL, 0.06, 3), borderRadius: '1px' }} />
            </div>
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', top: '-6px', left: '2px' }} />
            </div>
            <div style={{ width: '60px', height: '3px', borderRadius: '1.5px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }}>
              <div style={{ height: '100%', borderRadius: '1.5px',
                width: `${Math.min(100, (balanceTime / 4000) * 100)}%`,
                background: themeColor(TH.accentHSL, 0.12, 6), transition: 'width 0.2s' }} />
            </div>
          </motion.div>
        )}
        {stage === 'ridden' && (
          <motion.div key="rd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Ridden. You didn{"'"}t stop the wave — you surfed it. Balance is dynamic, not static. The stability came from the constant micro-adjustments, not from standing still. Shift your weight. Ride the chaos.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Dynamic balance. Nassim Taleb{"'"}s antifragility: systems that gain from disorder. The surfer doesn{"'"}t control the ocean — they respond to it. Constant micro-corrections, moment by moment. Resilience isn{"'"}t rigidity; it{"'"}s flexibility under pressure. You cannot control the wave. You can only control the board.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Surfed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}