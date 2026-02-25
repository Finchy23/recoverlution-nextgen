/**
 * ENGINE #9 -- 1059. The Governor (Limit)
 * "Just because you can go fast does not mean you should."
 * INTERACTION: Drag to set a governor / speed limit -- ride smooths out
 * STEALTH KBE: Self-limitation -- sustainability (B)
 *
 * COMPOSITOR: poetic_precision / Circuit / night / believing / drag / 1059
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Engine_Governor({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1059,
        isSeal: false,
      }}
      arrivalText="A speedometer hitting 200."
      prompt="Just because you can go fast does not mean you should. Set a limit. Protect the machine from itself."
      resonantText="Self-limitation. The governor is not weakness. It is wisdom. The engine that runs forever is the one that never redlines."
      afterglowCoda="Protect the machine."
      onComplete={onComplete}
    >
      {(verse) => <GovernorInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GovernorInteraction({ verse }: { verse: any }) {
  const [limit, setLimit] = useState(1); // 0-1, starts at max (no governor)
  const [set, setSet] = useState(false);
  const [shake, setShake] = useState(true);

  const handleDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (set) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0.3, Math.min(1, (e.clientX - rect.left) / rect.width));
    setLimit(x);
    setShake(x > 0.8);
  }, [set]);

  const handleRelease = useCallback(() => {
    if (limit <= 0.65 && !set) {
      setSet(true);
      setShake(false);
      setTimeout(() => verse.advance(), 2500);
    }
  }, [limit, set, verse]);

  const mph = Math.round(limit * 200);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Speedometer */}
      <motion.div
        animate={shake ? { x: [-1, 1, -1, 0] } : {}}
        transition={shake ? { duration: 0.15, repeat: Infinity } : {}}
      >
        <svg width="140" height="80" viewBox="0 0 140 80">
          {/* Arc */}
          <path d="M 15 75 A 60 60 0 0 1 125 75"
            fill="none" stroke={verse.palette.primaryFaint} strokeWidth={3} strokeLinecap="round" />

          {/* Red danger zone */}
          <path d="M 100 25 A 60 60 0 0 1 125 75"
            fill="none" stroke="hsla(0, 40%, 35%, 0.4)" strokeWidth={4} strokeLinecap="round" />

          {/* Green zone (governor limit indicator) */}
          {set && (
            <path d={`M 15 75 A 60 60 0 0 1 ${15 + limit * 110} ${75 - Math.sin(limit * Math.PI) * 55}`}
              fill="none" stroke="hsla(120, 30%, 35%, 0.3)" strokeWidth={3} strokeLinecap="round" />
          )}

          {/* Needle */}
          <motion.line
            x1="70" y1="75" x2="70" y2="20"
            stroke={limit > 0.8 ? 'hsla(0, 50%, 50%, 0.7)' : verse.palette.primary}
            strokeWidth={1.5}
            strokeLinecap="round"
            style={{ transformOrigin: '70px 75px' }}
            animate={{ rotate: -90 + limit * 180 }}
            transition={{ duration: 0.1 }}
          />
          <circle cx="70" cy="75" r="3" fill={verse.palette.primary} opacity={0.5} />

          {/* Speed reading */}
          <text x="70" y="65" textAnchor="middle" fill={verse.palette.textFaint}
            style={{ ...navicueType.status, fontSize: 11 }}>
            {mph}
          </text>
          <text x="70" y="73" textAnchor="middle" fill={verse.palette.textFaint}
            style={{ ...navicueType.micro, fontSize: 11 }}>
            mph
          </text>
        </svg>
      </motion.div>

      {/* Governor slider */}
      <div
        style={{
          width: 200,
          height: 28,
          position: 'relative',
          cursor: set ? 'default' : 'ew-resize',
          touchAction: 'none',
        }}
        onPointerMove={handleDrag}
        onPointerUp={handleRelease}
      >
        <div style={{
          position: 'absolute', top: 12, left: 0, right: 0, height: 4,
          borderRadius: 2,
          background: `linear-gradient(to right, hsla(120, 30%, 35%, 0.3), hsla(40, 40%, 40%, 0.3), hsla(0, 40%, 35%, 0.3))`,
        }} />

        {/* Governor marker */}
        <motion.div
          style={{
            position: 'absolute', top: 6, width: 16, height: 16, borderRadius: '50%',
            background: set ? 'hsla(120, 30%, 35%, 0.5)' : verse.palette.primaryGlow,
            border: `1px solid ${set ? 'hsla(120, 35%, 45%, 0.5)' : verse.palette.primary}`,
          }}
          animate={{ left: limit * 184 }}
          transition={{ duration: 0.05 }}
        />

        <span style={{ position: 'absolute', left: 0, top: -10, ...navicueType.micro, color: verse.palette.textFaint, fontSize: 11 }}>safe</span>
        <span style={{ position: 'absolute', right: 0, top: -10, ...navicueType.micro, color: verse.palette.textFaint, fontSize: 11 }}>max</span>
      </div>

      <div style={{ ...navicueType.hint, color: set ? verse.palette.accent : verse.palette.textFaint }}>
        {set ? 'governed' : limit > 0.8 ? 'engine shaking' : 'set your limit'}
      </div>
    </div>
  );
}