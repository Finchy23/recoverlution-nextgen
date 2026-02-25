/**
 * MAGNET #10 — The Magnet Seal (The Proof)
 * "I do not seek. I find. I do not chase. I attract."
 * ARCHETYPE: Pattern A (Tap × 5) — Iron filings scattered randomly.
 * Each tap aligns more filings to an invisible magnetic field.
 * No sound. Just alignment. Social gravity.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'IdentityKoan');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ALIGN_STEPS = 5;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function Magnet_MagnetSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [aligned, setAligned] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  // Generate stable filings
  const filings = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      // Random scatter position
      rx: seededRandom(i * 7 + 1) * 180 + 10,
      ry: seededRandom(i * 7 + 2) * 140 + 10,
      rAngle: seededRandom(i * 7 + 3) * 360,
      // Aligned position (magnetic field lines)
      ax: 100 + Math.cos((i / 80) * Math.PI * 4) * (20 + (i % 5) * 12),
      ay: 85 + Math.sin((i / 80) * Math.PI * 4) * (15 + (i % 4) * 10),
      aAngle: ((i / 80) * Math.PI * 4) * (180 / Math.PI),
      len: 3 + seededRandom(i * 7 + 4) * 4,
    })),
  []);

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const align = () => {
    if (stage !== 'active' || aligned >= ALIGN_STEPS) return;
    const next = aligned + 1;
    setAligned(next);
    if (next >= ALIGN_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = aligned / ALIGN_STEPS;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Scattered. Waiting for a field.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>I do not seek. I find. I do not chase. I attract.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to magnetize; filings align to your field</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={align}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: aligned >= ALIGN_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Magnetic field lines — subtle, emerge with alignment */}
                {t > 0.2 && [0, 1, 2, 3].map(i => (
                  <motion.ellipse key={`field-${i}`}
                    cx="100" cy="85"
                    rx={30 + i * 15} ry={20 + i * 10}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, (t - 0.2) * 0.02, 8)}
                    strokeWidth="0.3" strokeDasharray="2 3"
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.2) * 0.02 }}
                  />
                ))}

                {/* Iron filings */}
                {filings.map((f, i) => {
                  // How many filings are aligned based on current step
                  const filingAligned = i < aligned * 16;
                  const x = filingAligned ? f.rx + (f.ax - f.rx) * t : f.rx;
                  const y = filingAligned ? f.ry + (f.ay - f.ry) * t : f.ry;
                  const angle = filingAligned ? f.rAngle + (f.aAngle - f.rAngle) * t : f.rAngle;

                  return (
                    <motion.line key={i}
                      x1={x - Math.cos(angle * Math.PI / 180) * f.len / 2}
                      y1={y - Math.sin(angle * Math.PI / 180) * f.len / 2}
                      x2={x + Math.cos(angle * Math.PI / 180) * f.len / 2}
                      y2={y + Math.sin(angle * Math.PI / 180) * f.len / 2}
                      stroke={filingAligned
                        ? themeColor(TH.accentHSL, 0.06 + t * 0.05, 15)
                        : themeColor(TH.primaryHSL, 0.04, 8)
                      }
                      strokeWidth={filingAligned ? 0.6 + t * 0.3 : 0.4}
                      strokeLinecap="round"
                      animate={{
                        x1: x - Math.cos(angle * Math.PI / 180) * f.len / 2,
                        y1: y - Math.sin(angle * Math.PI / 180) * f.len / 2,
                        x2: x + Math.cos(angle * Math.PI / 180) * f.len / 2,
                        y2: y + Math.sin(angle * Math.PI / 180) * f.len / 2,
                      }}
                      transition={{ type: 'spring', stiffness: 15, damping: 8, delay: filingAligned ? i * 0.01 : 0 }}
                    />
                  );
                })}

                {/* Center magnet point */}
                <motion.circle cx="100" cy="85" r={3 + t * 4}
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.06, 15)}
                  animate={{ r: 3 + t * 4 }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                <text x="100" y="174" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'ALIGNED. the field is you' : `magnetized: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {aligned === 0 ? 'Eighty filings. Scattered, random, chaotic.' : aligned < ALIGN_STEPS ? `Magnetized ${aligned}×. ${aligned * 16} filings aligned.` : 'All aligned. No sound. Just alignment. The field is you.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: ALIGN_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < aligned ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five pulses. Eighty iron filings, scattered, random, chaotic, slowly rotated and drifted into alignment. No force. No noise. Just a field. The filings found their place. The pattern emerged from chaos. I do not seek. I find. I do not chase. I attract. The field is you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Social gravity. The cumulative effect of high agency, warmth, and mystery creates a distortion field that draws resources and people inward. You are the magnet.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Scatter. Field. Align.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}