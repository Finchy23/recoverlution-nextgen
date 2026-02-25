/**
 * ASTRONAUT #7 -- The Ocean Breath
 * "Your lungs are an internal ocean. Sync the tide."
 * ARCHETYPE: Pattern C (Hold) -- Breathing pacer: hold = inhale, release = exhale
 * ENTRY: Ambient fade -- tide line
 * STEALTH KBE: Breath sync with visual tide = Somatic Awe (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Stellar');
type Stage = 'arriving' | 'active' | 'synced' | 'resonant' | 'afterglow';

const TOTAL_CYCLES = 4;

export default function Astronaut_OceanBreath({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [cycles, setCycles] = useState(0);
  const [tidePos, setTidePos] = useState(0); // 0 = out, 1 = in
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const animRef = useRef<number>(0);

  useEffect(() => { t(() => setStage('active'), 2200); return () => { T.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); }; }, []);

  // Automatic tide animation
  useEffect(() => {
    if (stage !== 'active') return;
    const cycleMs = 4000; // 4s per half-cycle
    let start = Date.now();
    let currentPhase: 'inhale' | 'exhale' = 'inhale';
    let completedCycles = 0;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / cycleMs);
      setTidePos(currentPhase === 'inhale' ? progress : 1 - progress);

      if (progress >= 1) {
        start = Date.now();
        if (currentPhase === 'exhale') {
          completedCycles += 1;
          setCycles(completedCycles);
          if (completedCycles >= TOTAL_CYCLES) {
            console.log(`[KBE:E] OceanBreath cycles=${completedCycles} somaticAwe=confirmed breathSync=true`);
            setStage('synced');
            t(() => setStage('resonant'), 5000);
            t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
            return;
          }
        }
        currentPhase = currentPhase === 'inhale' ? 'exhale' : 'inhale';
        setPhase(currentPhase);
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [stage]);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '120px', height: '3px', borderRadius: '1.5px',
              background: themeColor(TH.accentHSL, 0.08, 4) }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Sync your breath with the tide.
            </div>
            {/* Ocean tide visualization */}
            <div style={{ width: '180px', height: '40px', borderRadius: radius.sm, overflow: 'hidden',
              position: 'relative', background: themeColor(TH.primaryHSL, 0.02, 1) }}>
              <motion.div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${10 + tidePos * 30}px`,
                background: `linear-gradient(to top,
                  ${themeColor(TH.accentHSL, 0.06 + tidePos * 0.06, 4)},
                  ${themeColor(TH.accentHSL, 0.02, 2)})`,
                borderRadius: `0 0 ${radius.sm} ${radius.sm}`,
                transition: 'height 0.3s ease',
              }} />
              {/* Wave crests */}
              <svg style={{ position: 'absolute', bottom: `${8 + tidePos * 28}px`, left: 0,
                width: '100%', height: '8px', opacity: 0.15 + tidePos * 0.1 }}
                viewBox="0 0 180 8">
                <path d="M0,4 Q15,0 30,4 Q45,8 60,4 Q75,0 90,4 Q105,8 120,4 Q135,0 150,4 Q165,8 180,4"
                  fill="none" stroke={themeColor(TH.accentHSL, 0.2, 10)} strokeWidth="1" />
              </svg>
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12),
              textAlign: 'center', fontSize: '14px', letterSpacing: '0.05em' }}>
              {phase === 'inhale' ? 'inhale...' : 'exhale...'}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              cycle {cycles + 1}/{TOTAL_CYCLES}
            </div>
          </motion.div>
        )}
        {stage === 'synced' && (
          <motion.div key="sy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
              fontStyle: 'italic' }}>
            Synced. Your lungs became an ocean. The tide breathed you. You didn{"'"}t breathe the air -- the air breathed you.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Respiratory entrainment. When your breathing syncs to a slow external rhythm, the autonomic nervous system shifts toward parasympathetic dominance. The ocean{"'"}s tide is the original metronome -- 4 seconds in, 4 seconds out. Your lungs are an internal ocean. The air doesn{"'"}t need you to breathe it. It breathes you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Tidal.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}