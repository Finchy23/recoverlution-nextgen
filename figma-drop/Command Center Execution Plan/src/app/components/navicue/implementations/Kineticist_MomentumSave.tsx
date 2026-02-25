/**
 * KINETICIST #8 -- 1118. The Momentum Save
 * "Watch for the wobble. Micro-correct early."
 * INTERACTION: Spinning top wobbles -- tap gently when it tilts to straighten it
 * STEALTH KBE: Micro-Correction -- self-monitoring (E)
 *
 * COMPOSITOR: witness_ritual / Storm / work / embodying / tap / 1118
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_MomentumSave({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Storm',
        chrono: 'work',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1118,
        isSeal: false,
      }}
      arrivalText="A spinning top. Watch the wobble."
      prompt="It is easier to save a wobble than to restart a crash. Watch for the wobble. Micro-correct early."
      resonantText="Micro-Correction. You caught each tilt before it became a fall. The top never stopped. Self-monitoring is not anxiety. It is the gentle hand that keeps the world spinning."
      afterglowCoda="Saved the spin."
      onComplete={onComplete}
    >
      {(verse) => <MomentumSaveInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function MomentumSaveInteraction({ verse }: { verse: any }) {
  const [tilt, setTilt] = useState(0);
  const [corrections, setCorrections] = useState(0);
  const [done, setDone] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const TARGET_CORRECTIONS = 5;
  const frameRef = useRef<number>();

  // Spin the top and introduce wobble
  useEffect(() => {
    if (done) return;
    let t = 0;
    const animate = () => {
      t += 1;
      setSpinAngle(prev => prev + 8);
      // Wobble grows over time
      setTilt(prev => {
        const wobble = Math.sin(t * 0.05) * (3 + t * 0.03);
        return prev * 0.95 + wobble * 0.05 + (Math.random() - 0.5) * 0.5;
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [done]);

  const correctWobble = useCallback(() => {
    if (done) return;
    // Only count if actually wobbling
    if (Math.abs(tilt) > 2) {
      setTilt(prev => prev * 0.2); // dampen
      setCorrections(prev => {
        const next = prev + 1;
        if (next >= TARGET_CORRECTIONS) {
          setDone(true);
          setTimeout(() => verse.advance(), 2000);
        }
        return next;
      });
    }
  }, [done, tilt, verse]);

  const wobbleSeverity = Math.min(1, Math.abs(tilt) / 15);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 120 / 120)}>
        {/* Top */}
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{ rotate: done ? 0 : tilt * 3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {/* Tip */}
            <motion.div
              animate={{ rotate: spinAngle }}
              transition={{ duration: 0, ease: 'linear' }}
              style={{
                width: 50, height: 50, borderRadius: '50%',
                background: `conic-gradient(
                  ${verse.palette.accent} 0deg,
                  transparent 30deg,
                  ${verse.palette.primaryGlow} 90deg,
                  transparent 120deg,
                  ${verse.palette.accent} 180deg,
                  transparent 210deg,
                  ${verse.palette.primaryGlow} 270deg,
                  transparent 300deg,
                  ${verse.palette.accent} 360deg
                )`,
                opacity: 0.4 + (done ? 0.4 : 0),
                border: `1px solid ${verse.palette.primaryGlow}`,
              }}
            />
            {/* Stem */}
            <div style={{
              width: 3, height: 20,
              background: verse.palette.primaryGlow,
              opacity: 0.3,
              borderRadius: '0 0 2px 2px',
            }} />
            {/* Point */}
            <div style={{
              width: 0, height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `8px solid ${verse.palette.primaryGlow}`,
              opacity: 0.3,
            }} />
          </motion.div>

          {/* Wobble warning */}
          {wobbleSeverity > 0.3 && !done && (
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              style={{
                position: 'absolute', top: 5, right: 5,
                width: 6, height: 6, borderRadius: '50%',
                background: `hsla(${Math.round(40 - wobbleSeverity * 40)}, 50%, 55%, 0.6)`,
              }}
            />
          )}
        </div>

        {/* Action */}
        {!done ? (
          <motion.button onClick={correctWobble}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            {Math.abs(tilt) > 2 ? 'correct' : 'steady'}
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
          >
            stabilized
          </motion.div>
        )}

        {/* Progress */}
        {!done && (
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: TARGET_CORRECTIONS }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 3, borderRadius: 1,
                background: i < corrections ? verse.palette.accent : verse.palette.primaryGlow,
                opacity: i < corrections ? 0.6 : 0.2,
              }} />
            ))}
          </div>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {done ? 'self-monitoring' : `corrections: ${corrections}/${TARGET_CORRECTIONS}`}
        </div>
      </div>
    </div>
  );
}