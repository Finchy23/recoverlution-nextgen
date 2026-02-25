/**
 * GRAVITON #9 — The Dark Star
 * "They obey what they cannot see."
 * ARCHETYPE: Pattern A (Tap ×4) — Tap to reveal what orbits the invisible
 * ENTRY: Ambient Fade — everything appears together, the star is already hidden
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'ambient' | 'resonant' | 'afterglow';

const ORBITERS = [
  { label: 'TRUST', angle: 0 },
  { label: 'CURIOSITY', angle: 90 },
  { label: 'LOYALTY', angle: 180 },
  { label: 'DESIRE', angle: 270 },
];

export default function Graviton_DarkStar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const reveal = () => {
    if (stage !== 'ambient' || taps >= 4) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 4) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
  };

  const d = taps / 4;
  const cx = 100, cy = 90, R = 55;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            onClick={reveal}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: taps >= 4 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your power is not in what you show. It is in what you withhold. The mystery creates the gravity.
            </div>
            <svg width="200" height="180" viewBox="0 0 200 180">
              {/* The invisible star — just a void */}
              <circle cx={cx} cy={cy} r="8" fill={themeColor(TH.voidHSL, 0.95, 0)} />
              {/* Orbit path */}
              <circle cx={cx} cy={cy} r={R} fill="none"
                stroke={themeColor(TH.primaryHSL, 0.04, 6)} strokeWidth="0.4" strokeDasharray="2 3" />
              {/* Revealed orbiters */}
              {ORBITERS.map((o, i) => {
                const a = (o.angle * Math.PI) / 180;
                const ox = cx + Math.cos(a) * R;
                const oy = cy + Math.sin(a) * R;
                const active = i < taps;
                return (
                  <motion.g key={i} initial={{ opacity: 0.15 }} animate={{ opacity: active ? 1 : 0.15 }}>
                    <circle cx={ox} cy={oy} r="6"
                      fill={themeColor(TH.accentHSL, active ? 0.2 : 0.03, 12)} />
                    <text x={ox} y={oy + 16} textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={themeColor(TH.accentHSL, active ? 0.15 : 0.04, 12)} letterSpacing="0.06em">
                      {o.label}
                    </text>
                    {/* Orbit line to center */}
                    {active && (
                      <motion.line x1={ox} y1={oy} x2={cx} y2={cy}
                        stroke={themeColor(TH.accentHSL, 0.06, 10)} strokeWidth={safeSvgStroke(0.3)} strokeDasharray="1 2"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                    )}
                  </motion.g>
                );
              })}
            </svg>
            {taps < 4 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.25 }}>reveal what orbits</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Information gap theory. Curiosity is cognitive deprivation; withholding full information creates gravitational pull. You cannot see the star, but everything orbits it. Keep your secrets.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The hidden.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}