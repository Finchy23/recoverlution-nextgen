/**
 * VECTOR #1 -- 1181. The Scalar vs. Vector
 * "You are confusing busyness with progress. Add a direction."
 * INTERACTION: Car spinning wheels. Speed: 100. Velocity: 0. Add direction. Car shoots forward.
 * STEALTH KBE: Differentiation -- strategic clarity (K)
 *
 * COMPOSITOR: science_x_soul / Drift / work / knowing / tap / 1181
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Vector_ScalarVsVector({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Drift',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1181,
        isSeal: false,
      }}
      arrivalText="Wheels spinning. Going nowhere."
      prompt="You are confusing busyness with progress. Spinning tires create smoke, not distance. Add a direction."
      resonantText="Differentiation. Speed is how fast you move. Velocity is how fast you move toward something. You were running at full power in a circle. One direction changed everything. Strategic clarity is not more effort. It is aimed effort."
      afterglowCoda="Forward."
      onComplete={onComplete}
    >
      {(verse) => <ScalarVsVectorInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ScalarVsVectorInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'spinning' | 'directed' | 'done'>('spinning');
  const [spin, setSpin] = useState(0);
  const [carX, setCarX] = useState(60);

  useEffect(() => {
    if (phase !== 'spinning') return;
    const interval = setInterval(() => setSpin(p => p + 8), 30);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'directed') return;
    const interval = setInterval(() => {
      setCarX(prev => {
        if (prev > 150) {
          setPhase('done');
          setTimeout(() => verse.advance(), 2000);
          return prev;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase, verse]);

  const addDirection = useCallback(() => {
    if (phase !== 'spinning') return;
    setPhase('directed');
  }, [phase]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Road */}
          <line x1={0} y1={65} x2={160} y2={65}
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.12} />

          {/* Car body */}
          <rect x={carX - 12} y={50} width={24} height={12} rx={3}
            fill={phase === 'done' ? verse.palette.accent : 'hsla(0, 0%, 45%, 0.3)'}
            opacity={0.4} />

          {/* Wheels */}
          <motion.circle
            cx={carX - 7} cy={63} r={3}
            fill="none" stroke={verse.palette.textFaint} strokeWidth={1.5} opacity={0.3}
            animate={{ rotate: spin }}
            style={{ transformOrigin: `${carX - 7}px 63px` }}
          />
          <motion.circle
            cx={carX + 7} cy={63} r={3}
            fill="none" stroke={verse.palette.textFaint} strokeWidth={1.5} opacity={0.3}
            animate={{ rotate: spin }}
            style={{ transformOrigin: `${carX + 7}px 63px` }}
          />

          {/* Smoke (spinning only) */}
          {phase === 'spinning' && (
            <>
              {[0, 1, 2].map(i => (
                <motion.circle key={i}
                  cx={carX - 10 - i * 5} cy={62 - i * 3} r={2 + i}
                  fill="hsla(0, 0%, 50%, 0.1)"
                  animate={{ opacity: [0.1, 0.2, 0.05] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.15 }}
                />
              ))}
            </>
          )}

          {/* Direction arrow (after adding) */}
          {(phase === 'directed' || phase === 'done') && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              d={`M ${carX + 15} 56 L ${carX + 28} 56 L ${carX + 25} 52 M ${carX + 28} 56 L ${carX + 25} 60`}
              fill="none" stroke={verse.palette.accent} strokeWidth={1.5} strokeLinecap="round"
            />
          )}

          {/* Readouts */}
          <text x={10} y={20} style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.4}>
            speed: 100
          </text>
          <text x={10} y={32} style={{ ...navicueType.micro }}
            fill={phase === 'spinning' ? 'hsla(0, 30%, 50%, 0.4)' : verse.palette.accent}
            opacity={0.5}>
            velocity: {phase === 'spinning' ? '0' : '100'}
          </text>
        </svg>
      </div>

      {phase === 'spinning' && (
        <motion.button onClick={addDirection}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          add direction
        </motion.button>
      )}
      {phase === 'directed' && (
        <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, opacity: 0.6 }}>
          moving...
        </span>
      )}
      {phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          forward
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {phase === 'done' ? 'strategic clarity' : 'speed is scalar. velocity is vector.'}
      </div>
    </div>
  );
}