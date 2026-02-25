/**
 * REFRACTOR #4 -- 1044. The Color Grade (Mood)
 * "The scene is neutral. The feeling is a filter."
 * INTERACTION: Drag warmth slider to apply golden filter over grey scene
 * STEALTH KBE: Affective agency -- emotional regulation (B)
 *
 * COMPOSITOR: poetic_precision / Stellar / night / believing / drag / 1044
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Refractor_ColorGrade({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Stellar',
        chrono: 'night',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1044,
        isSeal: false,
      }}
      arrivalText="A grey, rainy street."
      prompt="The scene is neutral. The feeling is a filter. You are the colorist. If the day feels grey, warm up the grade."
      resonantText="Affective agency. The rain did not change. You did. The same street, seen through amber glass, becomes a memory worth keeping."
      afterglowCoda="Warm the grade."
      onComplete={onComplete}
    >
      {(verse) => <ColorGradeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ColorGradeInteraction({ verse }: { verse: any }) {
  const [warmth, setWarmth] = useState(0);
  const [committed, setCommitted] = useState(false);

  const handleDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (committed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setWarmth(x);
  }, [committed]);

  const handleRelease = useCallback(() => {
    if (warmth > 0.7 && !committed) {
      setCommitted(true);
      setTimeout(() => verse.advance(), 2500);
    }
  }, [warmth, committed, verse]);

  const greyHue = 220;
  const warmHue = 38;
  const hue = greyHue + (warmHue - greyHue) * warmth;
  const sat = 5 + warmth * 35;
  const light = 18 + warmth * 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Scene with color grade overlay */}
      <div style={{
        width: 220,
        height: 120,
        borderRadius: 8,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${verse.palette.primaryFaint}`,
      }}>
        {/* Base grey scene */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, 
            hsla(${hue}, ${sat}%, ${light + 15}%, 0.6) 0%, 
            hsla(${hue}, ${sat}%, ${light}%, 0.8) 60%, 
            hsla(${hue}, ${sat + 5}%, ${light - 5}%, 0.9) 100%)`,
        }} />

        {/* Rain streaks (fade with warmth) */}
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 1,
              height: 15 + Math.random() * 10,
              background: `rgba(180,190,200,${0.15 * (1 - warmth)})`,
              left: 20 + i * 35,
              top: 10 + i * 8,
              borderRadius: 1,
            }}
            animate={{ y: [0, 100], opacity: [(1 - warmth) * 0.3, 0] }}
            transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* Warm golden overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 60% 30%, hsla(42, 50%, 50%, ${warmth * 0.25}), transparent 70%)`,
        }} />

        {/* Label */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 10,
          ...navicueType.micro,
          color: `hsla(${hue}, 20%, 70%, 0.6)`,
        }}>
          {warmth < 0.3 ? 'cold' : warmth < 0.7 ? 'shifting' : 'golden'}
        </div>
      </div>

      {/* Warmth slider track */}
      <div
        style={{
          width: 200,
          height: 32,
          position: 'relative',
          cursor: committed ? 'default' : 'ew-resize',
          touchAction: 'none',
        }}
        onPointerMove={handleDrag}
        onPointerUp={handleRelease}
      >
        {/* Track background */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(to right, hsla(220, 10%, 30%, 0.4), hsla(42, 40%, 50%, 0.5))`,
        }} />

        {/* Thumb */}
        <motion.div
          style={{
            position: 'absolute',
            top: 8,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: `hsla(${hue}, ${sat}%, 50%, 0.8)`,
            border: `1px solid ${verse.palette.primary}`,
          }}
          animate={{ left: warmth * 184 }}
          transition={{ duration: 0.05 }}
        />

        {/* Labels */}
        <span style={{
          position: 'absolute',
          top: -12,
          left: 0,
          ...navicueType.micro,
          color: verse.palette.textFaint,
        }}>grey</span>
        <span style={{
          position: 'absolute',
          top: -12,
          right: 0,
          ...navicueType.micro,
          color: verse.palette.textFaint,
        }}>warm</span>
      </div>

      {committed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          nostalgic
        </motion.div>
      )}
    </div>
  );
}
