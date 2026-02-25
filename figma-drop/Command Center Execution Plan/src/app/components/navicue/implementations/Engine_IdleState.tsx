/**
 * ENGINE #7 -- 1057. The Idle State
 * "You cannot redline forever. Master the idle."
 * INTERACTION: Drag RPM slider down to the green idle zone -- hold steady
 * STEALTH KBE: Readiness -- nervous system regulation (E)
 *
 * COMPOSITOR: witness_ritual / Circuit / night / embodying / drag / 1057
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Engine_IdleState({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1057,
        isSeal: false,
      }}
      arrivalText="An engine redlining."
      prompt="You cannot redline forever. You must master the idle. Ready, but resting. Low hum. Waiting for the light."
      resonantText="Readiness. The idle state is not off. It is the engine at its most sustainable. Still warm. Still alive. Just not burning."
      afterglowCoda="Low hum."
      onComplete={onComplete}
    >
      {(verse) => <IdleStateInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function IdleStateInteraction({ verse }: { verse: any }) {
  const [rpm, setRpm] = useState(0.85); // 0-1, where 0.15-0.25 is idle zone
  const [steadyTime, setSteadyTime] = useState(0);
  const [idled, setIdled] = useState(false);

  const isInIdleZone = rpm >= 0.1 && rpm <= 0.28;

  const handleDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (idled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = 1 - Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setRpm(y);
  }, [idled]);

  // Track time in idle zone
  useEffect(() => {
    if (idled || !isInIdleZone) {
      setSteadyTime(0);
      return;
    }
    const iv = setInterval(() => {
      setSteadyTime(prev => {
        if (prev >= 100) {
          setIdled(true);
          setTimeout(() => verse.advance(), 2500);
          return 100;
        }
        return prev + 4;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [isInIdleZone, idled, verse]);

  const rpmValue = Math.round(rpm * 8000);
  const rpmColor = rpm > 0.75 ? 'hsla(0, 60%, 50%, 0.7)'
    : rpm > 0.5 ? 'hsla(40, 50%, 50%, 0.6)'
    : isInIdleZone ? 'hsla(120, 40%, 40%, 0.6)'
    : verse.palette.textFaint;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      {/* RPM gauge */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <svg width="100" height="60" viewBox="0 0 100 60">
          {/* Gauge arc */}
          <path d="M 10 55 A 45 45 0 0 1 90 55"
            fill="none" stroke={verse.palette.primaryFaint} strokeWidth={3} strokeLinecap="round" />
          {/* Green idle zone */}
          <path d="M 16 47 A 45 45 0 0 1 26 34"
            fill="none" stroke="hsla(120, 35%, 35%, 0.4)" strokeWidth={4} strokeLinecap="round" />
          {/* Red zone */}
          <path d="M 78 30 A 45 45 0 0 1 90 55"
            fill="none" stroke="hsla(0, 40%, 35%, 0.3)" strokeWidth={3} strokeLinecap="round" />
          {/* Needle */}
          <motion.line
            x1="50" y1="55" x2="50" y2="15"
            stroke={rpmColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            style={{ transformOrigin: '50px 55px' }}
            animate={{ rotate: -90 + rpm * 180 }}
            transition={{ duration: 0.1 }}
          />
          <circle cx="50" cy="55" r="3" fill={rpmColor} />
        </svg>

        <span style={{ ...navicueType.status, color: rpmColor }}>{rpmValue} rpm</span>
      </div>

      {/* Vertical slider */}
      <div
        style={{
          width: 40,
          height: 130,
          position: 'relative',
          cursor: idled ? 'default' : 'ns-resize',
          touchAction: 'none',
        }}
        onPointerMove={handleDrag}
      >
        {/* Track */}
        <div style={{
          position: 'absolute',
          left: 18,
          top: 0,
          width: 4,
          height: '100%',
          borderRadius: 2,
          background: `linear-gradient(to bottom, hsla(0, 40%, 40%, 0.3), hsla(40, 40%, 40%, 0.3), hsla(120, 35%, 35%, 0.3))`,
        }} />

        {/* Idle zone marker */}
        <div style={{
          position: 'absolute',
          left: 10,
          top: `${(1 - 0.28) * 100}%`,
          height: `${0.18 * 100}%`,
          width: 20,
          borderRadius: 3,
          border: `1px dashed hsla(120, 35%, 40%, 0.3)`,
        }} />
        <span style={{
          position: 'absolute',
          left: 32,
          top: `${(1 - 0.2) * 100}%`,
          ...navicueType.micro,
          color: 'hsla(120, 35%, 45%, 0.5)',
          fontSize: 11,
        }}>idle</span>

        {/* Thumb */}
        <motion.div
          style={{
            position: 'absolute',
            left: 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: isInIdleZone ? 'hsla(120, 35%, 35%, 0.5)' : verse.palette.primaryGlow,
            border: `1px solid ${isInIdleZone ? 'hsla(120, 35%, 45%, 0.5)' : verse.palette.primary}`,
          }}
          animate={{ top: (1 - rpm) * 110 }}
          transition={{ duration: 0.05 }}
        />
      </div>

      {/* Steady timer (only in idle zone) */}
      {isInIdleZone && !idled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
        >
          <div style={{ width: 40, height: 40, position: 'relative' }}>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke={verse.palette.primaryFaint} strokeWidth={2} />
              <motion.circle cx="20" cy="20" r="16" fill="none"
                stroke="hsla(120, 35%, 45%, 0.5)" strokeWidth={2}
                strokeLinecap="round"
                style={{ transformOrigin: '20px 20px', rotate: -90 }}
                animate={{ pathLength: steadyTime / 100 }}
              />
            </svg>
          </div>
          <span style={{ ...navicueType.micro, color: 'hsla(120, 35%, 45%, 0.5)', fontSize: 11 }}>steady</span>
        </motion.div>
      )}

      {idled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          ready
        </motion.div>
      )}
    </div>
  );
}