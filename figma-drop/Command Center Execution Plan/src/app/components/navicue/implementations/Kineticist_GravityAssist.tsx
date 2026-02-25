/**
 * KINETICIST #2 -- 1112. The Gravity Assist (Slingshot)
 * "Use the gravity of the deadline. Dive into it and sling out fast."
 * INTERACTION: Drag spaceship toward planet -- whip around -- shoot out accelerated
 * STEALTH KBE: Reframing Stress -- antifragility (K)
 *
 * COMPOSITOR: science_x_soul / Storm / work / knowing / drag / 1112
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_GravityAssist({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Storm',
        chrono: 'work',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1112,
        isSeal: false,
      }}
      arrivalText="Fuel is low. A massive planet ahead."
      prompt="Use the gravity of the deadline. Do not fight the pressure. Dive into it and let it sling you out the other side with free speed."
      resonantText="Reframing Stress. You flew toward the thing you feared. And it did not crush you. It accelerated you. The pressure was never the enemy. Your angle was."
      afterglowCoda="Free speed."
      onComplete={onComplete}
    >
      {(verse) => <GravityAssistInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GravityAssistInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'approach' | 'sling' | 'launched'>('approach');
  const [shipPos, setShipPos] = useState({ x: 30, y: 20 });
  const [orbitAngle, setOrbitAngle] = useState(Math.PI);
  const planetCenter = { x: 100, y: 80 };
  const frameRef = useRef<number>();

  const handleDrag = useCallback((_: any, info: any) => {
    if (phase !== 'approach') return;
    setShipPos(prev => {
      const nx = Math.max(10, Math.min(190, prev.x + info.delta.x));
      const ny = Math.max(10, Math.min(150, prev.y + info.delta.y));
      // Check if close enough to planet
      const dx = nx - planetCenter.x;
      const dy = ny - planetCenter.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 35) {
        setPhase('sling');
      }
      return { x: nx, y: ny };
    });
  }, [phase]);

  // Slingshot orbit animation
  useEffect(() => {
    if (phase !== 'sling') return;
    let angle = Math.PI;
    const orbit = () => {
      angle -= 0.08;
      setOrbitAngle(angle);
      const r = 30;
      setShipPos({
        x: planetCenter.x + Math.cos(angle) * r,
        y: planetCenter.y + Math.sin(angle) * r,
      });
      if (angle <= -Math.PI * 0.3) {
        setPhase('launched');
        setTimeout(() => verse.advance(), 2000);
        return;
      }
      frameRef.current = requestAnimationFrame(orbit);
    };
    frameRef.current = requestAnimationFrame(orbit);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [phase, verse]);

  // Launch animation
  useEffect(() => {
    if (phase !== 'launched') return;
    const launch = setInterval(() => {
      setShipPos(prev => ({ x: prev.x + 4, y: prev.y - 3 }));
    }, 30);
    return () => clearInterval(launch);
  }, [phase]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 160)}>
        {/* Planet */}
        <motion.div
          animate={{
            boxShadow: phase === 'sling'
              ? `0 0 30px ${verse.palette.secondaryGlow}`
              : `0 0 12px ${verse.palette.primaryFaint}`,
          }}
          style={{
            position: 'absolute',
            left: planetCenter.x - 20, top: planetCenter.y - 20,
            width: 40, height: 40, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${verse.palette.secondary}, ${verse.palette.primaryGlow})`,
            border: `1px solid ${verse.palette.primaryGlow}`,
          }}
        />

        {/* Gravity well rings */}
        {[1, 2].map(r => (
          <div key={r} style={{
            position: 'absolute',
            left: planetCenter.x - r * 25, top: planetCenter.y - r * 25,
            width: r * 50, height: r * 50,
            borderRadius: '50%',
            border: `1px dashed ${verse.palette.primaryGlow}`,
            opacity: 0.08,
          }} />
        ))}

        {/* Ship */}
        <motion.div
          drag={phase === 'approach'}
          dragMomentum={false}
          dragElastic={0}
          onDrag={handleDrag}
          animate={{ x: shipPos.x - 8, y: shipPos.y - 8 }}
          style={{
            position: 'absolute',
            width: 16, height: 16,
            background: verse.palette.accent,
            borderRadius: '2px 8px 2px 8px',
            opacity: 0.7,
            cursor: phase === 'approach' ? 'grab' : 'default',
            touchAction: 'none',
            zIndex: 2,
          }}
        />

        {/* Speed trail (launched) */}
        {phase === 'launched' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            style={{
              position: 'absolute',
              left: shipPos.x - 30, top: shipPos.y,
              width: 25, height: 2,
              background: `linear-gradient(to right, transparent, ${verse.palette.accent})`,
            }}
          />
        )}

        {/* Label */}
        <span style={{
          position: 'absolute', left: planetCenter.x - 14, top: planetCenter.y + 25,
          ...navicueStyles.annotation(verse.palette),
        }}>
          deadline
        </span>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        {phase === 'approach' ? (
          <motion.span key="a" style={navicueStyles.interactionHint(verse.palette)}>
            steer toward the planet
          </motion.span>
        ) : phase === 'sling' ? (
          <motion.span key="s" style={navicueStyles.accentReadout(verse.palette)}>
            slingshotting...
          </motion.span>
        ) : (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={navicueStyles.accentHint(verse.palette)}>
            accelerated
          </motion.div>
        )}
      </AnimatePresence>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'launched' ? 'antifragility' : phase === 'sling' ? 'gravity assist' : 'low fuel'}
      </div>
    </div>
  );
}