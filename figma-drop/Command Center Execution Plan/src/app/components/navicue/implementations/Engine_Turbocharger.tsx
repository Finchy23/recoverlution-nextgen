/**
 * ENGINE #6 -- 1056. The Turbocharger (Recycle)
 * "Waste is just misplaced power. Boost the engine with your own mistakes."
 * INTERACTION: Drag exhaust output to intake -- power boost
 * STEALTH KBE: Reframing -- antifragility (B)
 *
 * COMPOSITOR: koan_paradox / Circuit / social / believing / drag / 1056
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Engine_Turbocharger({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Circuit',
        chrono: 'social',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1056,
        isSeal: false,
      }}
      arrivalText="An engine exhaust pipe. Waste gas escaping."
      prompt="Waste is just misplaced power. Take the exhaust and feed it back into the intake. Boost the engine with your own mistakes."
      resonantText="Reframing. The turbocharger does not create new energy. It recycles what was already being thrown away. Your failures are compressed fuel."
      afterglowCoda="Misplaced power."
      onComplete={onComplete}
    >
      {(verse) => <TurbochargerInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TurbochargerInteraction({ verse }: { verse: any }) {
  const [connected, setConnected] = useState(0); // 0-100 drag progress
  const [boosted, setBoosted] = useState(false);
  const [power, setPower] = useState(40);

  const handleDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (boosted) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setConnected(x * 100);
  }, [boosted]);

  const handleRelease = useCallback(() => {
    if (connected > 85 && !boosted) {
      setBoosted(true);
      // Power surge
      let p = 40;
      const iv = setInterval(() => {
        p += 3;
        setPower(p);
        if (p >= 95) {
          clearInterval(iv);
          setTimeout(() => verse.advance(), 2000);
        }
      }, 60);
    }
  }, [connected, boosted, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Engine diagram */}
      <svg width="220" height="100" viewBox="0 0 220 100">
        {/* Engine block */}
        <rect x="70" y="25" width="80" height="50" rx="4"
          fill="none" stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.3} />
        <text x="110" y="55" textAnchor="middle" fill={verse.palette.textFaint}
          style={{ ...navicueType.micro, fontSize: 11 }}>engine</text>

        {/* Exhaust pipe (right) */}
        <line x1="150" y1="50" x2="200" y2="50"
          stroke={verse.palette.primaryGlow} strokeWidth={3} opacity={0.2} />

        {/* Exhaust particles */}
        {!boosted && Array.from({ length: 3 }, (_, i) => (
          <motion.circle key={i}
            cx={200} cy={50} r={2}
            fill="hsla(0, 0%, 50%, 0.2)"
            animate={{ cx: [200, 215], opacity: [0.2, 0] }}
            transition={{ duration: 0.8, delay: i * 0.25, repeat: Infinity }}
          />
        ))}

        {/* Intake pipe (left) */}
        <line x1="20" y1="50" x2="70" y2="50"
          stroke={verse.palette.primaryGlow} strokeWidth={3} opacity={0.2} />

        {/* Turbo connection pipe (curves from exhaust to intake) */}
        <motion.path
          d="M 200 50 Q 210 10 110 10 Q 10 10 20 50"
          fill="none"
          stroke={verse.palette.accent}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          animate={{ pathLength: connected / 100, opacity: connected / 150 + 0.1 }}
          transition={{ duration: 0.1 }}
        />

        {/* Turbo spinner (center top) */}
        {connected > 50 && (
          <motion.circle
            cx="110" cy="10" r="6"
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={1}
            animate={{ rotate: boosted ? 360 : connected * 2 }}
            transition={boosted ? { duration: 0.3, repeat: Infinity, ease: 'linear' } : { duration: 0.1 }}
          />
        )}

        {/* Power boost glow */}
        {boosted && (
          <motion.rect x="72" y="27" width="76" height="46" rx="3"
            fill={verse.palette.accentGlow}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </svg>

      {/* Drag track */}
      <div
        style={{
          width: 180,
          height: 28,
          position: 'relative',
          cursor: boosted ? 'default' : 'ew-resize',
          touchAction: 'none',
        }}
        onPointerMove={handleDrag}
        onPointerUp={handleRelease}
      >
        <div style={{
          position: 'absolute', top: 12, left: 0, right: 0, height: 4,
          borderRadius: 2, background: verse.palette.primaryFaint,
        }} />
        <motion.div
          style={{
            position: 'absolute', top: 12, left: 0, height: 4,
            borderRadius: 2, background: verse.palette.primary,
          }}
          animate={{ width: `${connected}%` }}
          transition={{ duration: 0.05 }}
        />
        <span style={{ position: 'absolute', left: 0, top: -10, ...navicueType.micro, color: verse.palette.textFaint, fontSize: 11 }}>exhaust</span>
        <span style={{ position: 'absolute', right: 0, top: -10, ...navicueType.micro, color: verse.palette.textFaint, fontSize: 11 }}>intake</span>
      </div>

      {/* Power gauge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>power</span>
        <div style={{ width: 80, height: 4, background: verse.palette.primaryFaint, borderRadius: 2 }}>
          <motion.div
            style={{ height: '100%', borderRadius: 2, background: verse.palette.accent }}
            animate={{ width: `${power}%` }}
          />
        </div>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>{Math.round(power)}%</span>
      </div>

      {boosted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          boosted
        </motion.div>
      )}
    </div>
  );
}