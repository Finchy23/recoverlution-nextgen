/**
 * SURFER #10 — The Surfer Seal (Flow State)
 * "The wave is moving. You are the stillness inside the motion."
 * ARCHETYPE: Pattern A (Tap) — The surfer in the tube
 * ENTRY: Cold open — chaotic water, still surfer
 * STEALTH KBE: Completion = Flow State / stillness within motion
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'wave' | 'tube' | 'sealed' | 'resonant' | 'afterglow';

export default function Surfer_SurferSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('wave'), 2000);
    t(() => setStage('tube'), 5000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const seal = () => {
    if (stage !== 'tube') return;
    console.log(`[KBE:E] SurferSeal flowState=confirmed stillnessInMotion=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="80" height="40" viewBox="0 0 80 40">
              <motion.path d="M0,20 Q10,10 20,20 Q30,30 40,20 Q50,10 60,20 Q70,30 80,20"
                fill="none" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1.5"
                initial={{ d: 'M0,20 Q10,10 20,20 Q30,30 40,20 Q50,10 60,20 Q70,30 80,20' }}
                animate={{ d: ['M0,20 Q10,10 20,20 Q30,30 40,20 Q50,10 60,20 Q70,30 80,20',
                  'M0,20 Q10,30 20,20 Q30,10 40,20 Q50,30 60,20 Q70,10 80,20'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }} />
            </svg>
          </motion.div>
        )}
        {stage === 'wave' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Chaotic water */}
            <svg width="160" height="80" viewBox="0 0 160 80">
              {[0, 1, 2, 3].map(i => (
                <motion.path key={i}
                  d={`M0,${20 + i * 15} Q20,${10 + i * 15} 40,${20 + i * 15} Q60,${30 + i * 15} 80,${20 + i * 15} Q100,${10 + i * 15} 120,${20 + i * 15} Q140,${30 + i * 15} 160,${20 + i * 15}`}
                  fill="none" stroke={themeColor(TH.accentHSL, 0.04 + i * 0.01, 3 + i)} strokeWidth="1"
                  animate={{
                    d: [
                      `M0,${20 + i * 15} Q20,${10 + i * 15} 40,${20 + i * 15} Q60,${30 + i * 15} 80,${20 + i * 15} Q100,${10 + i * 15} 120,${20 + i * 15} Q140,${30 + i * 15} 160,${20 + i * 15}`,
                      `M0,${20 + i * 15} Q20,${30 + i * 15} 40,${20 + i * 15} Q60,${10 + i * 15} 80,${20 + i * 15} Q100,${30 + i * 15} 120,${20 + i * 15} Q140,${10 + i * 15} 160,${20 + i * 15}`,
                    ],
                  }}
                  transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity, repeatType: 'reverse' }} />
              ))}
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1, duration: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              the wave builds...
            </motion.div>
          </motion.div>
        )}
        {stage === 'tube' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* The tube — chaos around, stillness center */}
            <div style={{ width: '100px', height: '80px', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer chaos */}
              <svg style={{ position: 'absolute', inset: 0 }} width="100" height="80" viewBox="0 0 100 80">
                <motion.path d="M10,40 Q25,5 50,10 Q75,15 90,40 Q75,65 50,70 Q25,75 10,40"
                  fill="none" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1"
                  initial={{ d: 'M10,40 Q25,5 50,10 Q75,15 90,40 Q75,65 50,70 Q25,75 10,40' }}
                  animate={{ d: [
                    'M10,40 Q25,5 50,10 Q75,15 90,40 Q75,65 50,70 Q25,75 10,40',
                    'M10,40 Q25,10 50,5 Q75,10 90,40 Q75,70 50,75 Q25,70 10,40',
                  ] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }} />
                <motion.path d="M15,40 Q28,12 50,15 Q72,18 85,40 Q72,62 50,65 Q28,68 15,40"
                  fill="none" stroke={themeColor(TH.accentHSL, 0.04, 3)} strokeWidth="0.5"
                  initial={{ d: 'M15,40 Q28,12 50,15 Q72,18 85,40 Q72,62 50,65 Q28,68 15,40' }}
                  animate={{ d: [
                    'M15,40 Q28,12 50,15 Q72,18 85,40 Q72,62 50,65 Q28,68 15,40',
                    'M15,40 Q28,16 50,12 Q72,16 85,40 Q72,64 50,68 Q28,64 15,40',
                  ] }}
                  transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }} />
              </svg>
              {/* The surfer — still center */}
              <div style={{ width: '4px', height: '12px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.2, 10), zIndex: 1 }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
              fontStyle: 'italic' }}>
              The wave is moving. You are the stillness inside the motion.
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={seal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Seal</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Inside the tube, everything is chaos: water roaring, gravity pulling, time compressing. But the surfer? Still. Present. Riding the edge between control and surrender. That{"'"}s flow. Not the absence of motion; the stillness within it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Flow state. Csikszentmihalyi{"'"}s optimal experience: a mental state of complete immersion where time distorts, self-consciousness dissolves, and action merges with awareness. It{"'"}s not about control; it{"'"}s about alignment with the forces already in motion. The wave doesn{"'"}t need you to push it. It needs you to ride it. You are the stillness inside the motion.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Flowing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}