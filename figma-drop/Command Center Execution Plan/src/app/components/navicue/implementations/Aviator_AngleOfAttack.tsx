/**
 * AVIATOR #2 -- 1142. The Angle of Attack (Stall)
 * "Lower the nose to regain the lift."
 * INTERACTION: Drag wing angle -- too high causes stall -- lower to recover
 * STEALTH KBE: Humility -- sustainable growth (B)
 *
 * COMPOSITOR: science_x_soul / Drift / work / believing / drag / 1142
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Aviator_AngleOfAttack({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Drift',
        chrono: 'work',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1142,
        isSeal: false,
      }}
      arrivalText="A wing. Tilting upward."
      prompt="You are trying too hard. If you pitch the nose up too high, the air separates. The wing stops flying. Lower the nose to regain the lift."
      resonantText="Humility. You lowered the nose and the lift returned. Ambition without calibration is a stall. Sustainable growth is not less ambition. It is the right angle."
      afterglowCoda="Nose down."
      onComplete={onComplete}
    >
      {(verse) => <AngleOfAttackInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AngleOfAttackInteraction({ verse }: { verse: any }) {
  const [angle, setAngle] = useState(10);
  const [phase, setPhase] = useState<'climbing' | 'stalled' | 'recovered'>('climbing');
  const [autoClimb, setAutoClimb] = useState(true);

  // Auto-climb to stall
  useEffect(() => {
    if (!autoClimb) return;
    const interval = setInterval(() => {
      setAngle(prev => {
        const next = prev + 0.3;
        if (next >= 22) {
          setPhase('stalled');
          setAutoClimb(false);
          clearInterval(interval);
        }
        return Math.min(next, 22);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [autoClimb]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (phase !== 'stalled') return;
    // Downward drag lowers nose
    if (info.delta.y > 0) {
      setAngle(prev => {
        const next = prev - info.delta.y * 0.2;
        if (next <= 12) {
          setPhase('recovered');
          setTimeout(() => verse.advance(), 2000);
          return 12;
        }
        return Math.max(next, 10);
      });
    }
  }, [phase, verse]);

  const lift = angle <= 15 ? angle * 6 : Math.max(0, 100 - (angle - 15) * 15);
  const isStalling = angle > 18;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 100)}>
        {/* Airflow lines */}
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i}
            animate={{
              opacity: isStalling ? [0.15, 0.05] : 0.15,
              y: isStalling ? [0, (i % 2 === 0 ? -5 : 5)] : 0,
            }}
            transition={isStalling ? { repeat: Infinity, duration: 0.3 } : {}}
            style={{
              position: 'absolute', left: 20, right: 40,
              top: 25 + i * 15, height: 1,
              background: verse.palette.textFaint,
            }}
          />
        ))}

        {/* Wing */}
        <motion.div
          animate={{ rotate: -angle }}
          style={{
            position: 'absolute', left: 50, top: 40,
            width: 80, height: 8,
            background: phase === 'recovered'
              ? `hsla(200, 35%, 50%, 0.4)`
              : isStalling
              ? verse.palette.shadowFaint
              : `hsla(210, 25%, 45%, 0.3)`,
            borderRadius: '40% 60% 60% 40%',
            border: `1px solid ${verse.palette.primaryGlow}`,
            transformOrigin: '30% 50%',
            transition: 'background 0.3s',
          }}
        />

        {/* Angle indicator */}
        <span style={{
          position: 'absolute', right: 10, top: 10,
          ...navicueType.micro,
          color: isStalling ? verse.palette.shadow : verse.palette.textFaint,
          opacity: 0.6,
        }}>
          {Math.round(angle)}deg
        </span>

        {/* Lift indicator */}
        <div style={{
          position: 'absolute', left: 10, top: 10, bottom: 10,
          width: 4, borderRadius: 2,
          background: verse.palette.primaryGlow,
          overflow: 'hidden',
        }}>
          <motion.div
            animate={{ height: `${lift}%` }}
            style={{
              position: 'absolute', bottom: 0, width: '100%',
              background: lift > 50 ? verse.palette.accent : verse.palette.shadow,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Stall warning */}
        {isStalling && phase === 'stalled' && (
          <motion.span
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            style={{
              position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
              ...navicueStyles.shadowAnnotation(verse.palette, 0.7),
            }}
          >
            stall
          </motion.span>
        )}
      </div>

      {/* Action */}
      {phase === 'stalled' ? (
        <motion.div
          drag="y"
          dragConstraints={{ top: -10, bottom: 50 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDrag={handleDrag}
          style={{
            ...immersiveTapButton(verse.palette).base,
            cursor: 'grab',
            touchAction: 'none',
          }}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          lower the nose
        </motion.div>
      ) : phase === 'recovered' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          flying again
        </motion.div>
      ) : (
        <span style={navicueStyles.interactionHint(verse.palette, 0.4)}>
          climbing...
        </span>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'recovered' ? 'humility' : phase === 'stalled' ? 'too much ambition' : `lift: ${Math.round(lift)}%`}
      </div>
    </div>
  );
}