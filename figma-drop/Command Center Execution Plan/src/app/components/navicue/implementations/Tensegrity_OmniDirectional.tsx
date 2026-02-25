/**
 * TENSEGRITY #4 -- 1154. The Omni-Directional
 * "Build a life that works from any angle."
 * INTERACTION: House collapses in earthquake. Geodesic dome survives. Select the dome.
 * STEALTH KBE: Antifragility -- geometric strength (K)
 *
 * COMPOSITOR: koan_paradox / Lattice / work / knowing / tap / 1154
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tensegrity_OmniDirectional({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1154,
        isSeal: false,
      }}
      arrivalText="An earthquake. Two structures."
      prompt="Triangles are the strongest shape. Build a life that works from any angle. If the world flips you over, you are still standing."
      resonantText="Antifragility. The house fell. The dome rolled but held. It had no weak axis because it had no single axis. Geometric strength is the architecture of lives that survive from any direction."
      afterglowCoda="Standing."
      onComplete={onComplete}
    >
      {(verse) => <OmniDirectionalInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OmniDirectionalInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'choose' | 'quake' | 'result'>('choose');
  const [choice, setChoice] = useState<'house' | 'dome' | null>(null);
  const [quakeOffset, setQuakeOffset] = useState(0);

  useEffect(() => {
    if (phase !== 'quake') return;
    let t = 0;
    const interval = setInterval(() => {
      t += 1;
      setQuakeOffset(Math.sin(t * 0.5) * 6);
      if (t > 40) {
        clearInterval(interval);
        setQuakeOffset(0);
        setPhase('result');
        setTimeout(() => verse.advance(), 2200);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phase, verse]);

  const selectDome = useCallback(() => {
    if (phase !== 'choose') return;
    setChoice('dome');
    setTimeout(() => setPhase('quake'), 600);
  }, [phase]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 100)}>
        {/* House */}
        <motion.div
          animate={{
            x: phase === 'quake' ? quakeOffset : 0,
            rotate: phase === 'result' ? 15 : 0,
            opacity: phase === 'result' ? 0.15 : 0.3,
          }}
          style={{ position: 'absolute', left: 15, bottom: 15 }}
        >
          {/* Roof */}
          <div style={{
            width: 0, height: 0,
            borderLeft: '25px solid transparent',
            borderRight: '25px solid transparent',
            borderBottom: `18px solid ${verse.palette.primaryFaint}`,
          }} />
          {/* Walls */}
          <div style={{
            width: 50, height: 35,
            background: verse.palette.primaryFaint,
            border: `1px solid ${verse.palette.primaryGlow}`,
          }} />
          {phase === 'result' && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              ...navicueStyles.shadowAnnotation(verse.palette),
            }}>collapsed</span>
          )}
        </motion.div>

        {/* Geodesic dome */}
        <motion.div
          animate={{
            x: phase === 'quake' ? quakeOffset * 0.3 : 0,
            rotate: phase === 'quake' ? quakeOffset * 0.5 : phase === 'result' ? 5 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          style={{ position: 'absolute', right: 15, bottom: 15 }}
        >
          <svg width={60} height={50}>
            {/* Dome triangles */}
            <path d="M 30 5 L 10 35 L 50 35 Z" fill="none"
              stroke={phase === 'result' ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.4)'}
              strokeWidth={1.5} />
            <path d="M 30 5 L 0 45 L 10 35 Z" fill="none"
              stroke={phase === 'result' ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.3)'}
              strokeWidth={1} />
            <path d="M 30 5 L 60 45 L 50 35 Z" fill="none"
              stroke={phase === 'result' ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.3)'}
              strokeWidth={1} />
            <path d="M 10 35 L 30 45 L 50 35" fill="none"
              stroke={phase === 'result' ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.3)'}
              strokeWidth={1} />
            <line x1={0} y1={45} x2={60} y2={45}
              stroke={phase === 'result' ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.3)'}
              strokeWidth={1} />
          </svg>
          {phase === 'result' && (
            <span style={{
              position: 'absolute', top: -5, left: 10,
              ...navicueStyles.accentReadout(verse.palette, 0.6),
            }}>intact</span>
          )}
        </motion.div>

        {/* Quake indicator */}
        {phase === 'quake' && (
          <motion.span
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
            style={{
              position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)',
              ...navicueStyles.shadowAnnotation(verse.palette),
            }}
          >
            earthquake
          </motion.span>
        )}
      </div>

      {/* Action */}
      {phase === 'choose' && (
        <motion.button onClick={selectDome}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          build the dome
        </motion.button>
      )}
      {phase === 'quake' && (
        <span style={navicueStyles.interactionHint(verse.palette)}>
          shaking...
        </span>
      )}
      {phase === 'result' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          still standing
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'result' ? 'antifragility' : 'geometric strength'}
      </div>
    </div>
  );
}