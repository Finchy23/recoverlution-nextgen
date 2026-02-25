/**
 * WILDING #1 — The Cold Switch
 * "Comfort is the killer. Shock the system."
 * INTERACTION: Screen frosts over in stages. Each tap cracks the
 * frost — 5 cracks reveal blue-white ice beneath. A 10-second
 * cold-water timer runs. The mammalian dive reflex triggers.
 * Heart rate drops. Parasympathetic reset.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CRACK_COUNT = 5;

export default function Wilding_ColdSwitch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cracks, setCracks] = useState(0);
  const [coldTimer, setColdTimer] = useState(0);
  const [counting, setCounting] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Start 10s cold timer after all cracks
  useEffect(() => {
    if (!counting) return;
    startRef.current = performance.now();
    const tick = () => {
      const el = (performance.now() - startRef.current) / 1000;
      setColdTimer(Math.min(el, 10));
      if (el >= 10) {
        setCounting(false);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [counting]);

  const crack = () => {
    if (stage !== 'active' || cracks >= CRACK_COUNT || counting) return;
    const next = cracks + 1;
    setCracks(next);
    if (next >= CRACK_COUNT) {
      addTimer(() => setCounting(true), 800);
    }
  };

  const t = cracks / CRACK_COUNT;
  const ct = coldTimer / 10;

  // Crack paths — jagged lines radiating from impact points
  const crackPaths = [
    'M 110,90 L 105,70 L 98,55 L 102,40',
    'M 110,90 L 125,75 L 140,68 L 155,60',
    'M 110,90 L 100,100 L 85,108 L 70,115',
    'M 110,90 L 118,105 L 130,118 L 145,130',
    'M 110,90 L 95,85 L 78,80 L 60,72',
  ];

  const svgId = useId();

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The air chills...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Cold water on the face. Ten seconds. Comfort is the killer. Shock the system. The cold shuts up the monkey mind.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to crack the frost</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={crack}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: cracks >= CRACK_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(200, ${8 + t * 12}%, ${8 + t * 6}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Frost overlay — builds with each crack */}
                <defs>
                  <radialGradient id={`${svgId}-frostGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(200, ${20 + t * 20}%, ${60 + t * 15}%, ${t * 0.08})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                  <filter id={`${svgId}-frostBlur`}>
                    <feGaussianBlur stdDeviation={t * 1.5} />
                  </filter>
                </defs>

                {/* Frost crystals — tiny scattered shapes */}
                {t > 0 && Array.from({ length: Math.floor(t * 30) }, (_, i) => (
                  <motion.circle key={`fc-${i}`}
                    cx={20 + (i * 37) % 180} cy={15 + (i * 23) % 150}
                    r={0.5 + Math.random() * 1}
                    fill={`hsla(200, 25%, 70%, ${0.03 + t * 0.02})`}
                    initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.03 + t * 0.02) }}
                  />
                ))}

                {/* Central frost bloom */}
                <circle cx="110" cy="90" r={30 + t * 30} fill={`url(#${svgId}-frostGlow)`} />

                {/* Crack lines */}
                {crackPaths.map((d, i) => i < cracks && (
                  <motion.path key={`crack-${i}`} d={d}
                    fill="none"
                    stroke={`hsla(200, ${25 + i * 5}%, ${65 + i * 3}%, ${0.12 + i * 0.02})`}
                    strokeWidth={0.6 + i * 0.1}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                ))}

                {/* Blue-white flash on each crack */}
                {cracks > 0 && (
                  <motion.rect x="0" y="0" width="220" height="180"
                    fill={`hsla(200, 30%, 80%, 0.06)`}
                    key={`flash-${cracks}`}
                    initial={{ opacity: 0.15 }} animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Cold timer — runs after all cracks */}
                {counting && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    {/* Timer ring */}
                    <circle cx="110" cy="90" r="35" fill="none"
                      stroke="hsla(200, 10%, 25%, 0.04)" strokeWidth="2.5" />
                    <circle cx="110" cy="90" r="35" fill="none"
                      stroke={`hsla(200, ${25 + ct * 15}%, ${50 + ct * 15}%, ${0.1 + ct * 0.1})`}
                      strokeWidth="2.5" strokeLinecap="round"
                      strokeDasharray={`${ct * 220} 220`}
                      transform="rotate(-90, 110, 90)" />
                    {/* Seconds */}
                    <text x="110" y="94" textAnchor="middle" fontSize="12" fontFamily="monospace" fontWeight="300"
                      fill={`hsla(200, ${20 + ct * 15}%, ${50 + ct * 15}%, ${0.15 + ct * 0.1})`}>
                      {coldTimer.toFixed(1)}s
                    </text>
                  </motion.g>
                )}

                {/* Heart rate indicator — drops as timer runs */}
                {counting && (
                  <g>
                    <text x="185" y="155" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(200, 10%, 35%, ${0.06 + ct * 0.03})`}>
                      HR: {Math.round(80 - ct * 15)} bpm
                    </text>
                  </g>
                )}

                {/* Fully frosted + timer complete */}
                {ct >= 1 && (
                  <motion.text x="110" y="28" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(200, 25%, 65%, 0.2)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    RESET
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={`${cracks}-${Math.floor(coldTimer)}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {!counting && cracks === 0 ? 'Screen frosting. Warm. Too warm.' : !counting && cracks < CRACK_COUNT ? `Crack ${cracks}. Ice splitting.` : counting ? `Cold immersion. ${(10 - coldTimer).toFixed(0)}s remain.` : 'Ten seconds. Dive reflex triggered. Reset.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: CRACK_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < cracks ? 'hsla(200, 25%, 60%, 0.5)' : palette.primaryFaint, opacity: i < cracks ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five cracks in the frost. Ten seconds of cold. Heart rate dropped. The monkey mind went silent. The trigeminal nerve fired and the parasympathetic system caught you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Mammalian dive reflex. Cold water on the face stimulates the trigeminal nerve, instantly lowering heart rate and forcing a parasympathetic reset. The ancient circuit still works.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Frost. Crack. Reset.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}