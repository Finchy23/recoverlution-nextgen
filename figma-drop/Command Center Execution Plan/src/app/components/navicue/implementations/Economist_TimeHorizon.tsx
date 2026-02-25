/**
 * ECONOMIST #7 -- 1347. The Time Horizon
 * "Wait for the second marshmallow."
 * INTERACTION: Marshmallow. Eat now (1) or wait 10s (2).
 * STEALTH KBE: Self-Control -- Delayed Gratification (E)
 *
 * COMPOSITOR: witness_ritual / Arc / night / embodying / hold / 1347
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Economist_TimeHorizon({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'night',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1347,
        isSeal: false,
      }}
      arrivalText="A marshmallow. One."
      prompt="The ability to delay gratification is the primary predictor of success. Wait for the second marshmallow."
      resonantText="Self-control. You waited and the reward doubled. Delayed gratification: the marshmallow test is the simplest measure of the most powerful human ability. The future self always outbids the present."
      afterglowCoda="Wait."
      onComplete={onComplete}
    >
      {(verse) => <TimeHorizonInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TimeHorizonInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'choose' | 'waiting' | 'doubled' | 'ate'>('choose');
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (phase !== 'waiting') return;
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setPhase('doubled');
          setTimeout(() => verse.advance(), 3000);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, verse]);

  const handleEatNow = () => {
    if (phase !== 'choose') return;
    setPhase('ate');
    setTimeout(() => verse.advance(), 2500);
  };

  const handleWait = () => {
    if (phase !== 'choose') return;
    setPhase('waiting');
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 200, H = 140;
  const CX = W / 2, CY = H / 2;

  const showTwo = phase === 'doubled';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>reward</span>
        <motion.span style={{
          ...navicueType.data,
          color: showTwo ? verse.palette.accent : verse.palette.text,
        }}>
          {showTwo ? '2' : phase === 'ate' ? '1' : phase === 'waiting' ? `wait ${countdown}s` : '1 (now) or 2 (wait)'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Plate */}
          <ellipse cx={CX} cy={CY + 25} rx={55} ry={12}
            fill={verse.palette.primary} opacity={safeOpacity(0.05)} />
          <ellipse cx={CX} cy={CY + 25} rx={55} ry={12}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.1)} />

          {/* Marshmallow 1 */}
          {phase !== 'ate' && (
            <motion.g
              animate={{
                x: showTwo ? -20 : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              {/* Shadow */}
              <ellipse cx={CX} cy={CY + 18} rx={18} ry={5}
                fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
              {/* Body */}
              <rect x={CX - 15} y={CY - 10} width={30} height={28} rx={12}
                fill={verse.palette.accent}
                opacity={safeOpacity(phase === 'doubled' ? 0.2 : 0.12)} />
              <rect x={CX - 15} y={CY - 10} width={30} height={28} rx={12}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5}
                opacity={safeOpacity(phase === 'doubled' ? 0.3 : 0.2)} />
            </motion.g>
          )}

          {/* Marshmallow 2 (appears when doubled) */}
          {showTwo && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, x: 20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <ellipse cx={CX} cy={CY + 18} rx={18} ry={5}
                fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
              <rect x={CX - 15} y={CY - 10} width={30} height={28} rx={12}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              <rect x={CX - 15} y={CY - 10} width={30} height={28} rx={12}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.3)} />
            </motion.g>
          )}

          {/* Ate indicator (crumbs) */}
          {phase === 'ate' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2, 3].map(i => (
                <circle key={i}
                  cx={CX - 10 + i * 8 + (Math.random() * 4)}
                  cy={CY + 10 + (Math.random() * 6)}
                  r={2}
                  fill={verse.palette.primary}
                  opacity={safeOpacity(0.08)}
                />
              ))}
              <text x={CX} y={CY + 5} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.25}>
                eaten
              </text>
            </motion.g>
          )}

          {/* Countdown ring */}
          {phase === 'waiting' && (
            <motion.circle
              cx={CX} cy={CY + 5} r={40}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              strokeDasharray={`${(1 - countdown / 10) * 251} 251`}
              opacity={safeOpacity(0.2)}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY + 5}px` }}
            />
          )}

          {/* Temptation pulse */}
          {phase === 'waiting' && countdown > 3 && (
            <motion.text
              x={CX} y={H - 10} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '8px' }}
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              tempting...
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'choose' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{ ...btn.base, opacity: 0.5, padding: '8px 12px' }}
            whileTap={btn.active}
            onClick={handleEatNow}
          >
            eat now (1)
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '8px 12px' }}
            whileTap={btn.active}
            onClick={handleWait}
          >
            wait (2)
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {showTwo ? 'you waited. the reward doubled.'
          : phase === 'ate' ? 'instant gratification. one marshmallow.'
            : phase === 'waiting' ? `${countdown} seconds remaining...`
              : 'one now or two later'}
      </span>

      {showTwo && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          delayed gratification
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {showTwo ? 'self-control' : phase === 'ate' ? 'gratification' : 'the marshmallow test'}
      </div>
    </div>
  );
}
