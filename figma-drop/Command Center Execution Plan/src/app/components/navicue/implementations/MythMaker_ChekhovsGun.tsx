/**
 * MYTHMAKER #7 — The Chekhov's Gun
 * "Nothing is wasted. The pain from 10 years ago is the weapon you need today."
 * ARCHETYPE: Pattern A (Tap ×5) — A useless object on a shelf (Act 1).
 * Each tap reveals another chapter. On final tap the object becomes the key weapon.
 * Resource Utilization: transforming trauma into tool.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ACTS = [
  { act: 'ACT I', label: 'A wound', desc: 'You picked this up', glow: false },
  { act: 'ACT II', label: 'A scar', desc: 'You carried it', glow: false },
  { act: 'ACT III', label: 'A lesson', desc: 'It taught you', glow: false },
  { act: 'ACT IV', label: 'A skill', desc: 'It shaped you', glow: true },
  { act: 'ACT V', label: 'A weapon', desc: 'Load the gun', glow: true },
];

export default function MythMaker_ChekhovsGun({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const advance = () => {
    if (stage !== 'active' || taps >= ACTS.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= ACTS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = taps / ACTS.length;
  const current = ACTS[Math.min(taps, ACTS.length - 1)];
  const loaded = taps >= ACTS.length;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something forgotten stirs...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Nothing is wasted. The pain from 10 years ago? That is the weapon you need for the dragon today. Load the gun.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to advance through the acts</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '300px',
              cursor: loaded ? 'default' : 'pointer' }}>

            {/* The object — evolves from dull to glowing */}
            <div style={{ position: 'relative', width: '160px', height: '120px' }}>
              <svg width="100%" height="100%" viewBox="0 0 160 120">
                {/* Shelf */}
                <rect x="30" y="85" width="100" height="3" rx="1" fill={themeColor(TH.primaryHSL, 0.08, 5)} />
                <rect x="40" y="88" width="3" height="25" fill={themeColor(TH.primaryHSL, 0.06, 4)} />
                <rect x="117" y="88" width="3" height="25" fill={themeColor(TH.primaryHSL, 0.06, 4)} />

                {/* The object — transforms from a dull stone to a golden key-weapon */}
                <motion.g animate={{ filter: loaded ? 'none' : 'none' }}>
                  {/* Aura glow (grows with acts) */}
                  <motion.ellipse cx="80" cy="65" rx={15 + t * 15} ry={12 + t * 10}
                    fill={themeColor(TH.accentHSL, t * 0.04, 15)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [t * 0.03, t * 0.06, t * 0.03] }}
                    transition={{ duration: 2.5, repeat: Infinity }} />

                  {/* Object shape — morphs from irregular stone to geometric form */}
                  <motion.path
                    d={loaded
                      ? 'M 68 55 L 80 40 L 92 55 L 88 80 L 72 80 Z'   // crystalline
                      : 'M 70 58 Q 72 48 80 50 Q 88 48 90 58 Q 92 70 85 78 Q 78 82 73 78 Q 68 72 70 58'  // amorphous
                    }
                    fill={themeColor(TH.accentHSL, 0.04 + t * 0.08, t * 15)}
                    stroke={themeColor(TH.accentHSL, 0.08 + t * 0.12, 10 + t * 10)}
                    strokeWidth={0.5 + t}
                    transition={{ duration: 0.6 }}
                  />
                </motion.g>
              </svg>
            </div>

            {/* Act timeline */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
              {ACTS.map((act, i) => {
                const isReached = i < taps;
                const isCurrent = i === taps - 1;
                return (
                  <motion.div key={i}
                    animate={{
                      background: isReached
                        ? themeColor(TH.accentHSL, act.glow ? 0.12 : 0.06, act.glow ? 12 : 6)
                        : themeColor(TH.primaryHSL, 0.04, 3),
                      height: isReached ? '48px' : '32px',
                    }}
                    style={{
                      width: '48px', borderRadius: radius.xs, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '4px 2px',
                      border: `1px solid ${isReached ? themeColor(TH.accentHSL, 0.08, 10) : themeColor(TH.primaryHSL, 0.04, 5)}`,
                      transition: 'all 0.4s ease',
                    }}>
                    <div style={{ fontSize: '4px', fontFamily: 'monospace', letterSpacing: '0.1em',
                      color: isReached ? themeColor(TH.accentHSL, 0.3, 15) : themeColor(TH.primaryHSL, 0.1, 8) }}>
                      {act.act}
                    </div>
                    {isReached && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ fontSize: '11px', fontFamily: 'serif', fontStyle: 'italic', textAlign: 'center',
                          color: themeColor(TH.accentHSL, 0.25, 12) }}>
                        {act.label}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Current act description */}
            {taps > 0 && (
              <motion.div key={taps} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.5, y: 0 }}
                style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.25, 12), fontStyle: 'italic' }}>
                {current.desc}
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The useless object from Act One became the weapon that saved Act Five. Nothing in your story was wasted.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>meaning-making transforms trauma into tool</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The gun was always loaded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}