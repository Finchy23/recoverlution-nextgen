/**
 * ENGINE #4 -- 1054. The Flywheel (Momentum)
 * "The first push is the hardest. Get it spinning."
 * INTERACTION: Tap the wheel itself to push it -- momentum builds visually
 * STEALTH KBE: Compound interest -- long-term thinking (B)
 *
 * COMPOSITOR: science_x_soul / Circuit / work / believing / tap / 1054
 */
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, safeOpacity, immersiveTap } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Engine_Flywheel({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1054,
        isSeal: false,
      }}
      arrivalText="A massive heavy wheel. Still."
      prompt="The first push is the hardest. Do not stop. Once the mass is moving, it stores the energy. Get it spinning."
      resonantText="Compound interest. The flywheel does not care about your feelings. It cares about consistency. Every push is stored, never lost."
      afterglowCoda="Get it spinning."
      onComplete={onComplete}
    >
      {(verse) => <FlywheelInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FlywheelInteraction({ verse }: { verse: any }) {
  const [pushes, setPushes] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const rotationRef = useRef(0);

  const requiredPushes = 8;
  const speed = Math.min(pushes / requiredPushes, 1);
  const rpm = Math.round(speed * 3000);

  const handlePush = () => {
    if (spinning) return;
    const next = pushes + 1;
    setPushes(next);
    rotationRef.current += 15 + next * 8;
    if (next >= requiredPushes) {
      setSpinning(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  return (
    <div style={{ ...navicueInteraction.interactionWrapper, gap: 24 }}>
      {/* Flywheel -- the tap target IS the wheel */}
      <motion.div
        style={{
          ...immersiveTap(verse.palette).zone,
          width: 160,
          height: 160,
          borderRadius: '50%',
          position: 'relative',
        }}
        onClick={handlePush}
        whileTap={spinning ? {} : { scale: 0.94 }}
        animate={{
          rotate: spinning ? [rotationRef.current, rotationRef.current + 360] : rotationRef.current,
        }}
        transition={spinning
          ? { duration: Math.max(0.3, 1 - speed * 0.7), repeat: Infinity, ease: 'linear' }
          : { duration: 0.4, ease: 'easeOut' }
        }
      >
        {/* Outer rim -- grows in opacity with speed */}
        <motion.div
          animate={{ opacity: safeOpacity(0.08 + speed * 0.15) }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `1.5px solid ${verse.palette.primary}`,
          }}
        />

        {/* Inner glow ring */}
        <motion.div
          animate={{ opacity: speed * 0.2, scale: 0.85 + speed * 0.15 }}
          style={{
            position: 'absolute', inset: 4, borderRadius: '50%',
            border: `1px solid ${verse.palette.accent}`,
          }}
        />

        {/* Spokes */}
        {[0, 60, 120, 180, 240, 300].map(angle => (
          <div key={angle} style={{
            position: 'absolute',
            width: 1,
            height: '45%',
            background: verse.palette.primary,
            left: '50%',
            top: '5%',
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            opacity: 0.12 + speed * 0.1,
          }} />
        ))}

        {/* Center hub */}
        <motion.div
          animate={{
            scale: spinning ? [1, 1.15, 1] : 1,
            opacity: 0.15 + speed * 0.35,
          }}
          transition={spinning ? { repeat: Infinity, duration: 0.8 } : {}}
          style={{
            width: 20, height: 20, borderRadius: '50%',
            background: `radial-gradient(circle, ${verse.palette.accent}, transparent)`,
          }}
        />
      </motion.div>

      {/* Momentum readout */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <motion.span
          animate={{ opacity: spinning ? 1 : 0.5 + speed * 0.3 }}
          style={{ ...navicueType.data, color: verse.palette.text, fontSize: 13 }}
        >
          {rpm} rpm
        </motion.span>
        <span style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}>
          {spinning ? 'self-sustaining' : pushes === 0 ? 'tap the wheel' : `push ${pushes} of ${requiredPushes}`}
        </span>
      </div>

      {/* Completion word */}
      {spinning && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 2, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          momentum
        </motion.div>
      )}
    </div>
  );
}