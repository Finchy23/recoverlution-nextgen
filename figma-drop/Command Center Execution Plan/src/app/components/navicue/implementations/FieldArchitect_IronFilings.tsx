/**
 * FIELD ARCHITECT #2 -- 1102. The Iron Filings (The Invisible)
 * "Drop your purpose into the center. Watch the chaos organize."
 * INTERACTION: Blank chaos -- tap to place magnet -- filings align into geometric field
 * STEALTH KBE: Purpose -- leadership presence (B)
 *
 * COMPOSITOR: science_x_soul / Stellar / work / believing / tap / 1102
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function FieldArchitect_IronFilings({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Stellar',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1102,
        isSeal: false,
      }}
      arrivalText="Scattered particles. No pattern."
      prompt="The chaos is just un-magnetized potential. Drop your purpose into the center of the room. Watch the chaos organize around you."
      resonantText="Purpose. The filings were always there. They just had no center. You placed yours, and the disorder found its geometry. Leadership is not command. It is magnetism."
      afterglowCoda="Center placed."
      onComplete={onComplete}
    >
      {(verse) => <IronFilingsInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

function IronFilingsInteraction({ verse }: { verse: any }) {
  const COUNT = 40;
  const [magnetPlaced, setMagnetPlaced] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [particles, setParticles] = useState<Particle[]>(() => {
    const seed = 1102;
    return Array.from({ length: COUNT }, (_, i) => {
      const angle = ((seed + i * 137) % 360) * (Math.PI / 180);
      const r = 30 + ((seed * (i + 1)) % 60);
      // Chaotic positions
      const cx = 90, cy = 90;
      return {
        id: i,
        x: cx + Math.cos(angle) * r + ((i * 7) % 20 - 10),
        y: cy + Math.sin(angle) * r + ((i * 11) % 20 - 10),
        // Field-line positions
        targetX: cx + Math.cos(angle * 1.0) * (20 + (i % 5) * 14),
        targetY: cy + Math.sin(angle * 1.0) * (20 + (i % 5) * 14),
      };
    });
  });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const placeMagnet = useCallback(() => {
    if (magnetPlaced) return;
    setMagnetPlaced(true);
    // Animate alignment
    timerRef.current = setTimeout(() => {
      setAligned(true);
      setTimeout(() => verse.advance(), 2200);
    }, 1600);
  }, [magnetPlaced, verse]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Field area */}
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 180)}>
        {/* Particles */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            animate={{
              x: magnetPlaced ? p.targetX : p.x,
              y: magnetPlaced ? p.targetY : p.y,
              opacity: aligned ? 0.7 : 0.35,
            }}
            transition={{
              duration: magnetPlaced ? 1.2 + (p.id % 5) * 0.15 : 0,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: 3, height: 3, borderRadius: '50%',
              background: aligned ? verse.palette.accent : verse.palette.textFaint,
            }}
          />
        ))}

        {/* Center magnet */}
        <AnimatePresence>
          {magnetPlaced && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: 14, height: 14, borderRadius: '50%',
                background: verse.palette.accent,
                transform: 'translate(-50%, -50%)',
                boxShadow: aligned ? `0 0 20px ${verse.palette.accent}` : 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Field lines (visible after alignment) */}
        {aligned && [1, 2, 3].map(r => (
          <motion.div
            key={r}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.12, scale: 1 }}
            transition={{ delay: r * 0.2 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: r * 50, height: r * 50,
              borderRadius: '50%',
              border: `1px solid ${verse.palette.accent}`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Action */}
      {!magnetPlaced ? (
        <motion.button onClick={placeMagnet}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          place your center
        </motion.button>
      ) : aligned ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
        >
          organized
        </motion.div>
      ) : (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          aligning...
        </span>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {aligned ? 'invisible structure' : magnetPlaced ? 'aligning...' : 'chaos'}
      </div>
    </div>
  );
}