/**
 * ENGINE #2 -- 1052. The Heat Sink (Cooling)
 * "You are not stupid. You are throttled. Cool down to speed up."
 * INTERACTION: Hold "Cool" zone to dissipate heat -- temp drops, speed rises
 * STEALTH KBE: Regulation -- somatic regulation (E)
 *
 * COMPOSITOR: sensory_cinema / Circuit / work / embodying / hold / 1052
 */
import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Engine_HeatSink({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1052,
        isSeal: false,
      }}
      arrivalText="A processor overheating."
      prompt="You are not stupid. You are throttled. The heat is slowing the clock speed. Cool down to speed up."
      resonantText="Regulation. The chip does not get smarter with a heat sink. It performs at its actual capacity. You already have the speed. Remove the heat."
      afterglowCoda="Cool down to speed up."
      onComplete={onComplete}
    >
      {(verse) => <HeatSinkInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HeatSinkInteraction({ verse }: { verse: any }) {
  const [temp, setTemp] = useState(92);
  const [cooled, setCooled] = useState(false);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = useCallback(() => {
    if (cooled) return;
    holdRef.current = setInterval(() => {
      setTemp(prev => {
        const next = Math.max(prev - 1.5, 28);
        if (next <= 30) {
          clearInterval(holdRef.current!);
          setCooled(true);
          setTimeout(() => verse.advance(), 2500);
        }
        return next;
      });
    }, 60);
  }, [cooled, verse]);

  const endHold = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
    if (!cooled) {
      // Heat creeps back up
      const iv = setInterval(() => {
        setTemp(prev => {
          if (prev >= 92) { clearInterval(iv); return 92; }
          return prev + 0.5;
        });
      }, 100);
      setTimeout(() => clearInterval(iv), 3000);
    }
  }, [cooled]);

  const speed = Math.max(10, 100 - (temp - 28));
  const tempColor = temp > 70 ? `hsla(0, ${temp * 0.6}%, 45%, 0.7)` : `hsla(200, 40%, 45%, 0.7)`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Processor chip */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 8,
        border: `1px solid ${tempColor}`,
        background: `radial-gradient(circle, hsla(${temp > 60 ? 0 : 200}, ${temp * 0.4}%, ${20 + temp * 0.1}%, 0.4), transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ ...navicueType.status, color: tempColor }}>{Math.round(temp)}C</span>

        {/* Heat waves */}
        {temp > 50 && Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 20,
              height: 2,
              background: `hsla(0, 40%, 50%, ${(temp - 50) / 100})`,
              top: -8 - i * 6,
              borderRadius: 1,
            }}
            animate={{ opacity: [(temp - 50) / 100, 0], y: [0, -8] }}
            transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>

      {/* Speed gauge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>speed</span>
        <div style={{ width: 100, height: 4, background: verse.palette.primaryFaint, borderRadius: 2 }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: verse.palette.primary }}
            animate={{ width: `${speed}%` }}
          />
        </div>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>{Math.round(speed)}%</span>
      </div>

      {/* Cool zone */}
      {!cooled && (
        <motion.div
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: `1px solid hsla(200, 30%, 40%, 0.4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          <span style={{ ...navicueType.hint, color: 'hsla(200, 30%, 50%, 0.6)' }}>cool</span>
        </motion.div>
      )}

      {cooled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          optimal
        </motion.div>
      )}
    </div>
  );
}