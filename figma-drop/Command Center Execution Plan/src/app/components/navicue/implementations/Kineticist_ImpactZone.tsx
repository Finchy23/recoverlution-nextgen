/**
 * KINETICIST #9 -- 1119. The Impact Zone
 * "Hit it once with commitment. F = ma."
 * INTERACTION: Hammer and nail -- slow tap does nothing -- fast decisive swipe drives it home
 * STEALTH KBE: Decisiveness -- committed action (B)
 *
 * COMPOSITOR: pattern_glitch / Storm / night / believing / drag / 1119
 */
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_ImpactZone({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Storm',
        chrono: 'night',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1119,
        isSeal: false,
      }}
      arrivalText="A nail. A hammer."
      prompt="Do not tap it ten times. Hit it once with commitment. Force equals Mass times Acceleration. Speed creates the breakthrough."
      resonantText="Decisiveness. One swing. Full commitment. The nail is flush. You did not hesitate, second-guess, or half-swing. Committed action is the physics of breakthrough."
      afterglowCoda="One committed strike."
      onComplete={onComplete}
    >
      {(verse) => <ImpactZoneInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ImpactZoneInteraction({ verse }: { verse: any }) {
  const [attempts, setAttempts] = useState(0);
  const [nailDepth, setNailDepth] = useState(0); // 0-100
  const [done, setDone] = useState(false);
  const [lastSpeed, setLastSpeed] = useState(0);
  const [hammerY, setHammerY] = useState(0);
  const startTimeRef = useRef(0);
  const startYRef = useRef(0);

  const handleDragStart = useCallback((_: any, info: any) => {
    startTimeRef.current = Date.now();
    startYRef.current = info.point.y;
  }, []);

  const handleDragEnd = useCallback((_: any, info: any) => {
    if (done) return;
    const elapsed = Date.now() - startTimeRef.current;
    const distance = Math.abs(info.point.y - startYRef.current);
    const speed = distance / Math.max(elapsed, 1) * 10;
    setLastSpeed(speed);
    setAttempts(prev => prev + 1);

    // Hammer visual
    setHammerY(10);
    setTimeout(() => setHammerY(0), 150);

    const SPEED_THRESHOLD = 3;
    if (speed >= SPEED_THRESHOLD) {
      setNailDepth(100);
      setDone(true);
      setTimeout(() => verse.advance(), 2200);
    } else {
      // Weak hit -- barely moves
      setNailDepth(prev => Math.min(prev + speed * 3, 30));
    }
  }, [done, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 140)}>
        {/* Board */}
        <div style={{
          position: 'absolute', bottom: 20, left: 30, right: 30,
          height: 20, borderRadius: 3,
          background: 'hsla(30, 20%, 30%, 0.3)',
          border: `1px solid ${verse.palette.primaryGlow}`,
          opacity: 0.4,
        }} />

        {/* Nail */}
        <div style={{
          position: 'absolute', bottom: 20 + 20 - nailDepth * 0.18, left: '50%',
          width: 3, height: 30, borderRadius: '1px 1px 0 0',
          background: `linear-gradient(to bottom, hsla(0, 0%, 60%, 0.5), hsla(0, 0%, 45%, 0.4))`,
          transform: 'translateX(-50%)',
          transition: 'bottom 0.15s',
        }}>
          {/* Nail head */}
          <div style={{
            width: 12, height: 3, borderRadius: 1,
            background: 'hsla(0, 0%, 55%, 0.5)',
            position: 'absolute', top: -2, left: -4.5,
          }} />
        </div>

        {/* Hammer (draggable) */}
        {!done && (
          <motion.div
            drag="y"
            dragConstraints={{ top: -60, bottom: 30 }}
            dragElastic={0.3}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            animate={{ y: hammerY }}
            style={{
              position: 'absolute', top: 10, left: '50%',
              transform: 'translateX(-50%)',
              cursor: 'grab', touchAction: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              zIndex: 2,
            }}
          >
            {/* Handle */}
            <div style={{
              width: 6, height: 30,
              background: 'hsla(30, 25%, 40%, 0.4)',
              borderRadius: 2,
            }} />
            {/* Head */}
            <div style={{
              width: 30, height: 14, borderRadius: 3,
              background: `linear-gradient(to bottom, hsla(0, 0%, 50%, 0.5), hsla(0, 0%, 38%, 0.4))`,
              border: `1px solid ${verse.palette.primaryGlow}`,
            }} />
          </motion.div>
        )}

        {/* Impact flash */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', bottom: 35, left: '50%',
                width: 8, height: 8, borderRadius: '50%',
                background: verse.palette.accent,
                transform: 'translateX(-50%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* F=ma label */}
        <span style={{
          position: 'absolute', top: 5, right: 5,
          ...navicueStyles.annotation(verse.palette, 0.3),
        }}>
          F = ma
        </span>
      </div>

      {/* Status */}
      {done ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
        >
          driven home
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
            swipe down fast
          </span>
          {attempts > 0 && lastSpeed < 3 && (
            <span style={navicueStyles.shadowAnnotation(verse.palette)}>
              too weak. commit.
            </span>
          )}
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'committed action' : `attempts: ${attempts}`}
      </div>
    </div>
  );
}