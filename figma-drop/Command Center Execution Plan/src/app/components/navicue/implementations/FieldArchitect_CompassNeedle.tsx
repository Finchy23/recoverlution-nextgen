/**
 * FIELD ARCHITECT #6 -- 1106. The Compass Needle (True North)
 * "Remove the noise. Your internal needle knows the way."
 * INTERACTION: Spinning needle pulled by distractions -- tap to flick them away -- needle settles North
 * STEALTH KBE: Values Clarification -- intuitive clarity (K)
 *
 * COMPOSITOR: sacred_ordinary / Stellar / morning / knowing / tap / 1106
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const DISTRACTIONS = ['noise', 'doubt', 'envy', 'rush', 'approval'];

export default function FieldArchitect_CompassNeedle({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Stellar',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1106,
        isSeal: false,
      }}
      arrivalText="The needle is spinning."
      prompt="You are not lost. You are just surrounded by too many magnets. Remove the noise. Your internal needle knows the way."
      resonantText="Values Clarification. The needle was never broken. It was just confused by competing signals. You removed them, and it did what it was always built to do. Point North."
      afterglowCoda="True North."
      onComplete={onComplete}
    >
      {(verse) => <CompassNeedleInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CompassNeedleInteraction({ verse }: { verse: any }) {
  const [remaining, setRemaining] = useState<string[]>([...DISTRACTIONS]);
  const [needleAngle, setNeedleAngle] = useState(0);
  const [settled, setSettled] = useState(false);

  // Needle wobble based on distractions count
  useEffect(() => {
    if (settled) return;
    const wobble = remaining.length / DISTRACTIONS.length;
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * wobble * 120;
      setNeedleAngle(jitter);
    }, 200 + (1 - wobble) * 400);
    return () => clearInterval(interval);
  }, [remaining.length, settled]);

  // Check if all removed
  useEffect(() => {
    if (remaining.length === 0 && !settled) {
      setSettled(true);
      setNeedleAngle(0); // Points North
      setTimeout(() => verse.advance(), 2200);
    }
  }, [remaining.length, settled, verse]);

  const removeDistraction = useCallback((d: string) => {
    setRemaining(prev => prev.filter(x => x !== d));
  }, []);

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Compass */}
      <div style={{
        width: 130, height: 130, borderRadius: '50%',
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* N marker */}
        <span style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          ...navicueType.micro,
          color: settled ? verse.palette.accent : verse.palette.textFaint,
          opacity: settled ? 0.9 : 0.3,
        }}>
          N
        </span>
        {/* Needle */}
        <motion.div
          animate={{ rotate: needleAngle }}
          transition={{ type: 'spring', stiffness: settled ? 300 : 50, damping: settled ? 20 : 5 }}
          style={{
            width: 2, height: 80,
            background: `linear-gradient(to bottom, ${settled ? verse.palette.accent : verse.palette.shadow}, ${verse.palette.primaryGlow})`,
            transformOrigin: 'center center',
            borderRadius: 1,
          }}
        />
        {/* Center pivot */}
        <div style={{
          position: 'absolute',
          width: 8, height: 8, borderRadius: '50%',
          background: verse.palette.accent,
          opacity: 0.5,
        }} />
      </div>

      {/* Distractions */}
      {remaining.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 200 }}>
          {remaining.map(d => (
            <motion.button
              key={d}
              whileTap={immersiveTapButton(verse.palette, 'primary', 'small').active}
              onClick={() => removeDistraction(d)}
              exit={{ opacity: 0, scale: 0 }}
              style={immersiveTapButton(verse.palette, 'primary', 'small').base}
            >
              <span style={navicueStyles.shadowAnnotation(verse.palette)}>
                {d}
              </span>
            </motion.button>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={navicueStyles.accentHint(verse.palette)}
          >
            true north
          </motion.div>
        </AnimatePresence>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {settled ? 'clarity' : `${remaining.length} distractions`}
      </div>
    </div>
  );
}