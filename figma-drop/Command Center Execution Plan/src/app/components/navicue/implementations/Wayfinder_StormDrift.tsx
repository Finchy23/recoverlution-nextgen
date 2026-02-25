/**
 * WAYFINDER #8 -- 1168. The Storm Drift (Correction)
 * "The storm will take you. Let it. Then pay the debt."
 * INTERACTION: Storm pushes you off course. Accept drift. Calculate error. Correct.
 * STEALTH KBE: Adaptability -- resilience (B)
 *
 * COMPOSITOR: sacred_ordinary / Compass / social / believing / tap / 1168
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Wayfinder_StormDrift({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Compass',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1168,
        isSeal: false,
      }}
      arrivalText="A storm. Incoming."
      prompt="The storm will take you. Let it. But count the miles it took you. When the sun returns, pay the debt."
      resonantText="Adaptability. You did not fight the storm. You let it push you, counted the distance, and corrected when it cleared. Acceptance plus action equals resilience."
      afterglowCoda="Corrected."
      onComplete={onComplete}
    >
      {(verse) => <StormDriftInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function StormDriftInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'storm' | 'drifting' | 'calculate' | 'correct' | 'done'>('storm');
  const [driftAngle, setDriftAngle] = useState(0);
  const [stormIntensity, setStormIntensity] = useState(0);

  // Storm animation
  useEffect(() => {
    if (phase !== 'drifting') return;
    let t = 0;
    const interval = setInterval(() => {
      t += 1;
      setStormIntensity(Math.sin(t * 0.1) * 0.5 + 0.5);
      setDriftAngle(prev => prev + 0.5 + Math.random() * 0.3);
      if (t > 60) {
        clearInterval(interval);
        setPhase('calculate');
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phase]);

  const acceptStorm = useCallback(() => {
    if (phase !== 'storm') return;
    setPhase('drifting');
  }, [phase]);

  const correct = useCallback(() => {
    if (phase !== 'calculate') return;
    setPhase('correct');
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => verse.advance(), 2000);
    }, 1200);
  }, [phase, verse]);

  const driftDeg = Math.round(driftAngle);
  const compassAngle = phase === 'correct' || phase === 'done' ? 0 : driftAngle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 100)}>
        {/* Storm overlay */}
        {phase === 'drifting' && (
          <motion.div
            animate={{ opacity: stormIntensity * 0.3 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: 8,
              background: 'linear-gradient(135deg, hsla(220, 20%, 25%, 0.3), hsla(240, 15%, 20%, 0.2))',
              pointerEvents: 'none',
            }}
          />
        )}

        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Compass circle */}
          <circle cx={80} cy={50} r={35} fill="none"
            stroke={verse.palette.primaryGlow} strokeWidth={0.5} opacity={0.15} />

          {/* N/S/E/W */}
          {[['N', 80, 12], ['S', 80, 92], ['E', 120, 52], ['W', 40, 52]].map(([l, x, y]) => (
            <text key={l as string} x={x as number} y={y as number} textAnchor="middle"
              style={{ ...navicueType.micro }}
              fill={verse.palette.textFaint} opacity={0.25}>
              {l as string}
            </text>
          ))}

          {/* Needle */}
          <motion.line
            animate={{
              x1: 80, y1: 50,
              x2: 80 + Math.sin((compassAngle * Math.PI) / 180) * 25,
              y2: 50 - Math.cos((compassAngle * Math.PI) / 180) * 25,
            }}
            stroke={phase === 'done' ? verse.palette.accent : 'hsla(0, 35%, 50%, 0.5)'}
            strokeWidth={2} strokeLinecap="round"
          />
          <circle cx={80} cy={50} r={2}
            fill={phase === 'done' ? verse.palette.accent : 'hsla(0, 0%, 50%, 0.3)'} />

          {/* Drift indicator */}
          {(phase === 'calculate' || phase === 'correct') && (
            <text x={80} y={8} textAnchor="middle"
              style={{ ...navicueType.hint, fontSize: 9 }}
              fill={phase === 'correct' ? verse.palette.accent : 'hsla(40, 40%, 50%, 0.5)'}>
              drift: {driftDeg}°
            </text>
          )}

          {/* Storm lines */}
          {phase === 'drifting' && (
            <>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.line key={i}
                  animate={{
                    x1: 140 + i * 5, y1: 10 + i * 15,
                    x2: 120 + i * 5, y2: 25 + i * 15,
                    opacity: [0, stormIntensity * 0.3, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  stroke="hsla(220, 20%, 50%, 0.3)" strokeWidth={1}
                />
              ))}
            </>
          )}
        </svg>
      </div>

      {/* Action */}
      {phase === 'storm' && (
        <motion.button onClick={acceptStorm}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          let it take you
        </motion.button>
      )}
      {phase === 'drifting' && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.5 }}>
          drifting... counting miles
        </span>
      )}
      {phase === 'calculate' && (
        <motion.button onClick={correct}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          correct {driftDeg}°
        </motion.button>
      )}
      {phase === 'correct' && (
        <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, opacity: 0.6 }}>
          correcting...
        </span>
      )}
      {phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          on course
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {phase === 'done' ? 'resilience' : 'acceptance + action'}
      </div>
    </div>
  );
}