/**
 * CYBERNETICIST #5 -- 1095. The Gain (Sensitivity)
 * "Lower your sensitivity. Stability requires a thick skin."
 * INTERACTION: Drag the gain slider down -- needle jitters calm
 * STEALTH KBE: Regulation -- emotional dampening (E)
 *
 * COMPOSITOR: sensory_cinema / Circuit / work / embodying / drag / 1095
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_Gain({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1095,
        isSeal: false,
      }}
      arrivalText="The needle is jumping wildly."
      prompt="You are reacting to every micro-breeze. Lower your sensitivity. Dampen the input. Stability requires a thick skin."
      resonantText="Regulation. You did not remove the signal. You lowered the gain. The world is still noisy. You are simply no longer a leaf in every wind."
      afterglowCoda="Dampened."
      onComplete={onComplete}
    >
      {(verse) => <GainInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GainInteraction({ verse }: { verse: any }) {
  const [gain, setGain] = useState(95);
  const [needleAngle, setNeedleAngle] = useState(0);
  const [dampened, setDampened] = useState(false);
  const frameRef = useRef<number>();

  // Needle jitter based on gain
  useEffect(() => {
    const jitter = () => {
      const amplitude = gain * 0.8;
      const noise = (Math.random() - 0.5) * amplitude;
      setNeedleAngle(noise);
      frameRef.current = requestAnimationFrame(jitter);
    };
    frameRef.current = requestAnimationFrame(jitter);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [gain]);

  useEffect(() => {
    if (gain <= 12 && !dampened) {
      setDampened(true);
      setTimeout(() => verse.advance(), 2000);
    }
  }, [gain, dampened, verse]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (dampened) return;
    // Dragging down = lowering gain
    setGain(prev => {
      const next = Math.max(5, Math.min(100, prev + info.delta.y * 0.5));
      return next;
    });
  }, [dampened]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Meter */}
      <div style={{
        width: 140, height: 80, position: 'relative',
        borderBottom: `1px solid ${verse.palette.primaryGlow}`,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Meter arc */}
        <div style={{
          position: 'absolute', bottom: -60, width: 120, height: 120,
          borderRadius: '50%',
          border: `1px solid ${verse.palette.primaryGlow}`,
          opacity: 0.15,
        }} />
        {/* Needle */}
        <motion.div
          animate={{ rotate: needleAngle }}
          transition={{ duration: 0.05 }}
          style={{
            width: 2, height: 60,
            background: dampened ? 'hsla(140, 40%, 50%, 0.7)' : verse.palette.accent,
            transformOrigin: 'bottom center',
            borderRadius: 1,
          }}
        />
      </div>

      <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
        {dampened ? 'stable' : 'too sensitive'}
      </span>

      {/* Gain slider */}
      {!dampened && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 120, position: 'relative',
            borderRadius: 15,
            border: `1px solid ${verse.palette.primaryGlow}`,
          }}>
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 95 }}
              dragElastic={0}
              dragMomentum={false}
              onDrag={handleDrag}
              style={{
                position: 'absolute',
                top: `${Math.max(0, Math.min(88, 100 - gain))}%`,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 22, height: 22, borderRadius: '50%',
                background: verse.palette.accent,
                cursor: 'grab',
                touchAction: 'none',
                opacity: 0.7,
              }}
            />
          </div>
          <span style={navicueStyles.kbeLabel(verse.palette)}>
            gain: {Math.round(gain)}%
          </span>
        </div>
      )}

      <AnimatePresence>
        {dampened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: 'hsla(140, 40%, 55%, 0.8)', fontSize: 11 }}
          >
            dampened
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}