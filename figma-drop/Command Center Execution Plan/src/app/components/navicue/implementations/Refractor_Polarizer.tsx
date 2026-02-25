/**
 * REFRACTOR #6 -- 1046. The Polarizer (Glare)
 * "Cut the glare. Look into the depth."
 * INTERACTION: Drag to rotate polarizer angle -- glare decreases, fish appears
 * STEALTH KBE: Deep looking -- insight (E)
 *
 * COMPOSITOR: pattern_glitch / Stellar / work / embodying / drag / 1046
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Refractor_Polarizer({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Stellar',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1046,
        isSeal: false,
      }}
      arrivalText="Blinding glare on the water."
      prompt="The surface reflection is blinding you. Cut the glare. Look into the depth. The prize is under the shine."
      resonantText="Deep looking. A polarizer does not remove light. It removes the noise. What remains is the signal. The fish was always there."
      afterglowCoda="Under the shine."
      onComplete={onComplete}
    >
      {(verse) => <PolarizerInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PolarizerInteraction({ verse }: { verse: any }) {
  const [angle, setAngle] = useState(0);
  const [cleared, setCleared] = useState(false);

  const glare = Math.max(0, 1 - angle);
  const clarity = Math.min(1, angle);

  const handleDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (cleared) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setAngle(y);
  }, [cleared]);

  const handleRelease = useCallback(() => {
    if (angle > 0.85 && !cleared) {
      setCleared(true);
      setTimeout(() => verse.advance(), 2500);
    }
  }, [angle, cleared, verse]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      {/* Water scene */}
      <div style={{
        width: 180,
        height: 140,
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${verse.palette.primaryFaint}`,
      }}>
        {/* Deep water */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, 
            hsla(210, 20%, ${20 + clarity * 15}%, 0.6) 0%, 
            hsla(200, 25%, ${15 + clarity * 10}%, 0.8) 100%)`,
        }} />

        {/* Glare overlay */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, 
              rgba(255,255,255,${glare * 0.4}) 0%, 
              rgba(255,255,255,${glare * 0.15}) 40%, 
              transparent 70%)`,
          }}
        />

        {/* Glare streaks */}
        {Array.from({ length: 4 }, (_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 40 + i * 15,
              height: 2,
              background: `rgba(255,255,255,${glare * 0.25})`,
              left: 10 + i * 20,
              top: 20 + i * 15,
              borderRadius: 1,
              transform: `rotate(${-15 + i * 8}deg)`,
            }}
            animate={{ opacity: [glare * 0.15, glare * 0.3, glare * 0.15] }}
            transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }}
          />
        ))}

        {/* Fish (revealed as clarity increases) */}
        <motion.svg
          width="32" height="16"
          viewBox="0 0 32 16"
          style={{ position: 'absolute', left: '40%', top: '60%' }}
          animate={{ opacity: clarity * 0.6, x: [0, 3, 0] }}
          transition={{ x: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <path
            d="M2 8 Q8 2 16 8 Q8 14 2 8 Z M16 8 L22 4 L22 12 Z"
            fill={verse.palette.accent}
            opacity={0.7}
          />
        </motion.svg>
      </div>

      {/* Rotation control */}
      <div
        style={{
          width: 32,
          height: 120,
          position: 'relative',
          cursor: 'ns-resize',
          touchAction: 'none',
        }}
        onPointerMove={handleDrag}
        onPointerUp={handleRelease}
      >
        {/* Track */}
        <div style={{
          position: 'absolute',
          left: 14,
          top: 0,
          width: 4,
          height: '100%',
          borderRadius: 2,
          background: verse.palette.primaryFaint,
        }} />

        {/* Thumb */}
        <motion.div
          style={{
            position: 'absolute',
            left: 6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: verse.palette.primaryGlow,
            border: `1px solid ${verse.palette.primary}`,
          }}
          animate={{ top: (1 - angle) * 100 }}
          transition={{ duration: 0.05 }}
        />

        {/* Labels */}
        <span style={{
          position: 'absolute',
          top: -16,
          left: 0,
          width: 32,
          textAlign: 'center',
          ...navicueType.micro,
          color: verse.palette.textFaint,
          fontSize: 11,
        }}>clear</span>
        <span style={{
          position: 'absolute',
          bottom: -16,
          left: 0,
          width: 32,
          textAlign: 'center',
          ...navicueType.micro,
          color: verse.palette.textFaint,
          fontSize: 11,
        }}>glare</span>
      </div>
    </div>
  );
}