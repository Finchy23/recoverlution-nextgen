/**
 * KINETICIST #3 -- 1113. The Elastic Collision
 * "An elastic mind bounces. Retain your kinetic energy."
 * INTERACTION: Swipe to hit a wall -- choose bounce (retain speed) vs crash (stop)
 * STEALTH KBE: Resilience -- growth mindset (B)
 *
 * COMPOSITOR: pattern_glitch / Storm / social / believing / tap / 1113
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_ElasticCollision({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Storm',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1113,
        isSeal: false,
      }}
      arrivalText="A wall ahead. Full speed."
      prompt="A rigid mind shatters on impact. An elastic mind bounces. Retain your kinetic energy. Use the bounce to change direction."
      resonantText="Resilience. You hit the wall and came back with 90% of your speed. The wall did not move. But you did not break. Failure is not a stop. It is a vector change."
      afterglowCoda="Elastic."
      onComplete={onComplete}
    >
      {(verse) => <ElasticCollisionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ElasticCollisionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'moving' | 'impact' | 'bouncing' | 'resilient'>('moving');
  const [ballX, setBallX] = useState(30);
  const [speed, setSpeed] = useState(100);

  const hitWall = useCallback(() => {
    if (phase !== 'moving') return;
    // Animate toward wall
    setPhase('impact');
    let x = 30;
    const approach = setInterval(() => {
      x += 6;
      setBallX(x);
      if (x >= 150) {
        clearInterval(approach);
        // Impact flash then bounce back
        setTimeout(() => {
          setPhase('bouncing');
          setSpeed(90);
          let bx = 150;
          const bounce = setInterval(() => {
            bx -= 4;
            setBallX(bx);
            if (bx <= 50) {
              clearInterval(bounce);
              setPhase('resilient');
              setTimeout(() => verse.advance(), 2000);
            }
          }, 30);
        }, 300);
      }
    }, 30);
  }, [phase, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Scene */}
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 100)}>
        {/* Wall */}
        <div style={{
          position: 'absolute', right: 20, top: 20, bottom: 20,
          width: 3,
          background: phase === 'impact' ? 'hsla(0, 50%, 55%, 0.5)' : verse.palette.primaryGlow,
          opacity: phase === 'impact' ? 0.8 : 0.3,
          transition: 'all 0.2s',
        }} />

        {/* Ball */}
        <motion.div
          animate={{
            scale: phase === 'impact' ? [1, 1.3, 0.8, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            left: ballX, top: '50%',
            width: 22, height: 22, borderRadius: '50%',
            background: phase === 'resilient'
              ? verse.palette.accent
              : `radial-gradient(circle at 40% 40%, hsla(210, 40%, 55%, 0.6), hsla(210, 30%, 40%, 0.4))`,
            border: `1px solid ${verse.palette.primaryGlow}`,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Impact flash */}
        <AnimatePresence>
          {phase === 'impact' && (
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute', right: 20, top: '50%',
                width: 10, height: 10, borderRadius: '50%',
                background: 'hsla(0, 50%, 60%, 0.5)',
                transform: 'translate(50%, -50%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Speed label */}
        {(phase === 'bouncing' || phase === 'resilient') && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={{
              position: 'absolute', left: ballX + 28, top: '50%', transform: 'translateY(-50%)',
              ...navicueStyles.accentReadout(verse.palette),
            }}
          >
            {speed}%
          </motion.span>
        )}
      </div>

      {/* Action */}
      {phase === 'moving' && (
        <motion.button onClick={hitWall}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          bounce
        </motion.button>
      )}
      {phase === 'impact' && (
        <span style={{ ...navicueType.hint, color: 'hsla(0, 50%, 55%, 0.6)', fontSize: 11 }}>impact</span>
      )}
      {phase === 'bouncing' && (
        <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, opacity: 0.7 }}>bouncing back...</span>
      )}
      {phase === 'resilient' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
        >
          resilient
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'resilient' ? 'growth mindset' : phase === 'moving' ? 'full speed' : 'elastic'}
      </div>
    </div>
  );
}