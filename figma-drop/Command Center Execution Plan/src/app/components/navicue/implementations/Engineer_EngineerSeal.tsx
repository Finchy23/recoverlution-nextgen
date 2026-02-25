/**
 * ENGINEER #10 — The Engineer Seal (Nudge Theory)
 * "The machine serves you. You do not serve the machine."
 * Pattern A (Tap) — Clockwork mechanism ticking perfectly
 * STEALTH KBE: Completion = Nudge Theory / Systems Design confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'ticking' | 'sealed' | 'resonant' | 'afterglow';

export default function Engineer_EngineerSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('ticking'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'ticking') return;
    console.log(`[KBE:K] EngineerSeal nudgeTheory=confirmed systemsDesign=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" fill="none" stroke={themeColor(TH.accentHSL, 0.05, 3)} strokeWidth="1" />
                <circle cx="12" cy="12" r="2" fill={themeColor(TH.accentHSL, 0.04, 2)} />
              </svg>
            </motion.div>
          </motion.div>
        )}
        {stage === 'ticking' && (
          <motion.div key="ti" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Clockwork */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              {/* Large gear */}
              <motion.g initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '40px 40px' }}>
                <circle cx="40" cy="40" r="22" fill="none" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1" />
                {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <rect key={i} x={40 + Math.cos(rad) * 22 - 3} y={40 + Math.sin(rad) * 22 - 2}
                      width="6" height="4" rx="1" fill={themeColor(TH.accentHSL, 0.06, 3)}
                      transform={`rotate(${angle}, ${40 + Math.cos(rad) * 22}, ${40 + Math.sin(rad) * 22})`} />
                  );
                })}
              </motion.g>
              {/* Small gear */}
              <motion.g initial={{ rotate: 0 }} animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '60px 25px' }}>
                <circle cx="60" cy="25" r="10" fill="none" stroke={themeColor(TH.primaryHSL, 0.05, 3)} strokeWidth="1" />
                {[0, 90, 180, 270].map((angle, i) => {
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <rect key={i} x={60 + Math.cos(rad) * 10 - 2} y={25 + Math.sin(rad) * 10 - 1.5}
                      width="4" height="3" rx="0.5" fill={themeColor(TH.primaryHSL, 0.05, 3)}
                      transform={`rotate(${angle}, ${60 + Math.cos(rad) * 10}, ${25 + Math.sin(rad) * 10})`} />
                  );
                })}
              </motion.g>
              {/* Center */}
              <circle cx="40" cy="40" r="3" fill={themeColor(TH.accentHSL, 0.08, 4)} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              Every gear meshes. The clockwork ticks. The machine serves you.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={seal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Seal</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              <svg width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="12" fill={themeColor(TH.accentHSL, 0.05, 3)}
                  stroke={themeColor(TH.accentHSL, 0.08, 5)} strokeWidth="1" />
                <circle cx="15" cy="15" r="3" fill={themeColor(TH.accentHSL, 0.1, 5)} />
              </svg>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Sealed. The machine serves you. You do not serve the machine. Defaults, friction reduction, commitment devices, batch processing, diagnostics, redundancy, constraints, feedback loops, maintenance schedules — this is the engineer{"'"}s toolkit. Don{"'"}t rely on willpower. Rely on architecture. Build the machine.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Nudge theory. Richard Thaler and Cass Sunstein{"'"}s foundational work: indirect suggestions and positive reinforcement ("nudges") can influence behavior as effectively as — and often more effectively than — direct instruction or regulation. Choice architecture (how options are presented) determines behavior more reliably than motivation or willpower. The Engineer collection is applied nudge theory: design the environment, and behavior follows.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Engineered.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}