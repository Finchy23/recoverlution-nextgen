/**
 * KINETICIST #6 -- 1116. The Orbit (Habit Loop)
 * "Find the velocity that lets you rest in motion."
 * INTERACTION: Drag speed slider -- too slow crashes, too fast escapes -- find the green zone orbit
 * STEALTH KBE: Rhythm -- sustainable pacing (E)
 *
 * COMPOSITOR: sensory_cinema / Storm / morning / embodying / drag / 1116
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_Orbit({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Storm',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1116,
        isSeal: false,
      }}
      arrivalText="A satellite. Adjusting speed."
      prompt="A habit is an orbit. Once you are in the groove, you fall forever without effort. Find the velocity that lets you rest in motion."
      resonantText="Rhythm. You found the zone. Not too fast, not too slow. The satellite now circles without fuel. Sustainable pacing is the orbit where effort becomes zero."
      afterglowCoda="Zero energy orbit."
      onComplete={onComplete}
    >
      {(verse) => <OrbitInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OrbitInteraction({ verse }: { verse: any }) {
  const [speed, setSpeed] = useState(50); // 0-100
  const [angle, setAngle] = useState(0);
  const [locked, setLocked] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const LOCK_DURATION = 3; // seconds in green zone to complete
  const greenMin = 42, greenMax = 58;
  const frameRef = useRef<number>();

  // Orbit the satellite
  useEffect(() => {
    const animate = () => {
      setAngle(prev => prev + (speed / 500));
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [speed]);

  // Track time in green zone
  useEffect(() => {
    if (locked) return;
    const inZone = speed >= greenMin && speed <= greenMax;
    if (!inZone) { setHoldTime(0); return; }
    const interval = setInterval(() => {
      setHoldTime(prev => {
        const next = prev + 0.1;
        if (next >= LOCK_DURATION) {
          setLocked(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2200);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [speed, locked, verse]);

  const inZone = speed >= greenMin && speed <= greenMax;
  const tooSlow = speed < greenMin;
  const tooFast = speed > greenMax;

  // Orbit radius depends on speed
  const orbitR = 40 + (speed - 50) * 0.5;
  const cx = 90, cy = 80;
  const satX = cx + Math.cos(angle) * orbitR;
  const satY = cy + Math.sin(angle) * orbitR;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Scene */}
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 160)}>
        {/* Planet */}
        <div style={{
          position: 'absolute', left: cx - 12, top: cy - 12,
          width: 24, height: 24, borderRadius: '50%',
          background: `radial-gradient(circle at 40% 40%, hsla(210, 40%, 50%, 0.5), hsla(210, 30%, 35%, 0.3))`,
          border: `1px solid ${verse.palette.primaryGlow}`,
        }} />

        {/* Orbit path */}
        <div style={{
          position: 'absolute', left: cx - orbitR, top: cy - orbitR,
          width: orbitR * 2, height: orbitR * 2,
          borderRadius: '50%',
          border: `1px dashed ${inZone ? verse.palette.accent : verse.palette.primaryGlow}`,
          opacity: inZone ? 0.4 : 0.1,
        }} />

        {/* Green zone ring (visual hint) */}
        <div style={{
          position: 'absolute', left: cx - 40, top: cy - 40,
          width: 80, height: 80, borderRadius: '50%',
          border: `1px solid hsla(120, 30%, 45%, 0.15)`,
        }} />

        {/* Satellite */}
        <motion.div
          animate={{
            boxShadow: locked ? `0 0 12px ${verse.palette.accent}` : 'none',
          }}
          style={{
            position: 'absolute',
            left: satX - 5, top: satY - 5,
            width: 10, height: 10, borderRadius: 2,
            background: inZone || locked ? verse.palette.accent : verse.palette.textFaint,
            opacity: 0.7,
          }}
        />

        {/* Status */}
        <span style={{
          position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
          ...navicueType.micro,
          color: tooSlow ? verse.palette.shadow : tooFast ? 'hsla(40, 50%, 55%, 0.5)' : 'hsla(120, 30%, 50%, 0.5)',
        }}>
          {locked ? 'stable orbit' : tooSlow ? 'too slow (crash)' : tooFast ? 'too fast (escape)' : 'in the zone'}
        </span>
      </div>

      {/* Speed slider */}
      {!locked ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 160 }}>
          <input
            type="range"
            min={0} max={100}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            style={{ width: '100%', accentColor: inZone ? verse.palette.accent : verse.palette.textFaint }}
          />
          <span style={navicueStyles.annotation(verse.palette, 0.5)}>
            velocity: {speed}
          </span>
          {inZone && (
            <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(holdTime / LOCK_DURATION) * 100}%` }}
                style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }}
              />
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
        >
          zero energy
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {locked ? 'sustainable pacing' : 'find the green zone'}
      </div>
    </div>
  );
}