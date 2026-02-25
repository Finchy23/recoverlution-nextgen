/**
 * AVIATOR #6 -- 1146. The Trim Tab (Micro-Adjustment)
 * "A tiny adjustment relieves the pressure on the whole system."
 * INTERACTION: Fighting the yoke (exhausting) -- drag to adjust trim tab -- yoke centers itself
 * STEALTH KBE: Ease -- systemic correction (E)
 *
 * COMPOSITOR: sensory_cinema / Drift / morning / embodying / drag / 1146
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Aviator_TrimTab({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1146,
        isSeal: false,
      }}
      arrivalText="Fighting the yoke. Exhausting."
      prompt="You are fighting the pressure manually. Use the trim tab. A tiny adjustment relieves the pressure on the whole system."
      resonantText="Ease. One small tab. The entire yoke centered. You were fighting a systemic imbalance with raw effort. Systemic correction is not harder work. It is the right micro-adjustment."
      afterglowCoda="Hands off."
      onComplete={onComplete}
    >
      {(verse) => <TrimTabInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TrimTabInteraction({ verse }: { verse: any }) {
  const [trimOffset, setTrimOffset] = useState(0);
  const [done, setDone] = useState(false);
  const TARGET = 50; // Need to drag trim to approximately this position

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    setTrimOffset(prev => {
      const next = Math.max(0, Math.min(100, prev + info.delta.x * 0.5));
      const accuracy = Math.abs(next - TARGET);
      if (accuracy < 5) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  const shaking = !done;
  const accuracy = 1 - Math.min(1, Math.abs(trimOffset - TARGET) / 50);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 100)}>
        {/* Yoke */}
        <motion.div
          animate={{
            rotate: done ? 0 : [-(5 - accuracy * 5), (5 - accuracy * 5)],
            x: done ? 0 : [(3 - accuracy * 3), -(3 - accuracy * 3)],
          }}
          transition={done ? { duration: 0.5 } : { repeat: Infinity, duration: 0.2 + accuracy * 0.3 }}
          style={{
            position: 'absolute', top: 15, left: '50%',
            width: 50, height: 50,
            border: `2px solid ${done ? verse.palette.accent : verse.palette.primaryGlow}`,
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            opacity: done ? 0.4 : 0.25,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Center dot */}
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: done ? verse.palette.accent : verse.palette.textFaint,
            opacity: done ? 0.6 : 0.3,
          }} />
        </motion.div>

        {/* Horizon line */}
        <motion.div
          animate={{
            rotate: done ? 0 : (trimOffset - TARGET) * 0.15,
          }}
          style={{
            position: 'absolute', top: 38, left: 10, right: 10,
            height: 1,
            background: verse.palette.primaryGlow,
            opacity: 0.1,
            transformOrigin: 'center',
          }}
        />

        {/* Effort indicator */}
        {!done && (
          <span style={{
            position: 'absolute', top: 5, right: 5,
            ...navicueType.micro,
            color: accuracy < 0.3 ? verse.palette.shadow : verse.palette.textFaint,
            opacity: 0.5,
          }}>
            effort: {Math.round((1 - accuracy) * 100)}%
          </span>
        )}
      </div>

      {/* Trim tab slider */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={navicueStyles.annotation(verse.palette)}>
          trim tab
        </span>
        <div style={{ position: 'relative', width: 120, height: 16 }}>
          {/* Track */}
          <div style={{
            position: 'absolute', top: 7, left: 0, right: 0,
            height: 2, borderRadius: 1,
            background: verse.palette.primaryGlow, opacity: 0.15,
          }} />
          {/* Center mark */}
          <div style={{
            position: 'absolute', top: 4, left: `${TARGET}%`,
            width: 1, height: 8,
            background: verse.palette.accent, opacity: 0.2,
            transform: 'translateX(-50%)',
          }} />
          {/* Thumb */}
          {!done ? (
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 108 }}
              dragElastic={0}
              dragMomentum={false}
              onDrag={handleDrag}
              animate={{ x: trimOffset * 1.08 }}
              style={{
                position: 'absolute', top: 2,
                width: 12, height: 12, borderRadius: 2,
                background: `hsla(210, 20%, 45%, 0.3)`,
                border: `1px solid ${verse.palette.primaryGlow}`,
                cursor: 'grab', touchAction: 'none',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute', top: 2,
              left: `${TARGET}%`, transform: 'translateX(-50%)',
              width: 12, height: 12, borderRadius: 2,
              background: verse.palette.accent,
              opacity: 0.3,
            }} />
          )}
        </div>
      </div>

      {/* Status */}
      {done ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          hands off
        </motion.div>
      ) : (
        <span style={navicueStyles.annotation(verse.palette)}>
          slide to center
        </span>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'systemic correction' : 'micro-adjustment'}
      </div>
    </div>
  );
}