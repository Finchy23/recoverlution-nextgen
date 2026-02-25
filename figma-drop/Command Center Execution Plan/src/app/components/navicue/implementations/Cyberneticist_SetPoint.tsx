/**
 * CYBERNETICIST #6 -- 1096. The Set Point (Thermostat)
 * "Raise the set point. Make 'Good' the new default."
 * INTERACTION: Drag the thermostat dial itself upward -- room temp follows
 * STEALTH KBE: Standard Setting -- high standards (K)
 *
 * COMPOSITOR: sacred_ordinary / Circuit / morning / knowing / drag / 1096
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, safeOpacity } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_SetPoint({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1096,
        isSeal: false,
      }}
      arrivalText="Thermostat: 60 degrees. Cold."
      prompt="Your baseline is set too low. You tolerate too much cold. Raise the set point. Make 'Good' the new default."
      resonantText="Standard Setting. You refused to tolerate the cold. The heater was always there. The problem was the number on the dial. You raised what you accept."
      afterglowCoda="New default."
      onComplete={onComplete}
    >
      {(verse) => <SetPointInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SetPointInteraction({ verse }: { verse: any }) {
  const [setPoint, setSetPoint] = useState(60);
  const [roomTemp, setRoomTemp] = useState(58);
  const [heaterOn, setHeaterOn] = useState(false);
  const [raised, setRaised] = useState(false);
  const TARGET = 72;

  // Heater logic -- room temp chases set point
  useEffect(() => {
    if (raised) return;
    const interval = setInterval(() => {
      setRoomTemp(prev => {
        if (prev < setPoint) {
          setHeaterOn(true);
          return prev + 0.3;
        } else {
          setHeaterOn(false);
          return prev;
        }
      });
    }, 150);
    return () => clearInterval(interval);
  }, [setPoint, raised]);

  useEffect(() => {
    if (setPoint >= TARGET && roomTemp >= TARGET - 2 && !raised) {
      setRaised(true);
      setTimeout(() => verse.advance(), 2000);
    }
  }, [setPoint, roomTemp, raised, verse]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (raised) return;
    setSetPoint(prev => Math.max(55, Math.min(80, prev - info.delta.y * 0.3)));
  }, [raised]);

  const progress = Math.min(1, (setPoint - 55) / 25);
  const needleAngle = -135 + progress * 270;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Thermostat dial -- the drag target IS the dial */}
      <motion.div
        drag={raised ? false : 'y'}
        dragConstraints={{ top: -100, bottom: 30 }}
        dragElastic={0.08}
        dragMomentum={false}
        onDrag={handleDrag}
        style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: raised ? 'default' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
        }}
        whileDrag={{ scale: 1.02 }}
      >
        {/* Outer ring */}
        <motion.div
          animate={{ opacity: safeOpacity(0.08 + progress * 0.1) }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `1px solid ${verse.palette.primary}`,
          }}
        />

        {/* Temperature arc */}
        <svg viewBox="0 0 160 160" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
        }}>
          {/* Background arc */}
          <path
            d="M 25 125 A 62 62 0 1 1 135 125"
            fill="none"
            stroke={verse.palette.primaryFaint}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.path
            d="M 25 125 A 62 62 0 1 1 135 125"
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${progress * 335} 335`}
            animate={{ opacity: 0.3 + progress * 0.4 }}
          />
          {/* Needle */}
          <motion.line
            x1={80} y1={80}
            x2={80} y2={30}
            stroke={verse.palette.accent}
            strokeWidth={1}
            strokeLinecap="round"
            animate={{ rotate: needleAngle }}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            style={{ transformOrigin: '80px 80px' }}
          />
          {/* Center dot */}
          <circle cx={80} cy={80} r={3} fill={verse.palette.accent} opacity={0.4} />
        </svg>

        {/* Temperature readout */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 10 }}>
          <motion.span
            animate={{ color: raised ? verse.palette.accent : verse.palette.text }}
            style={{ ...navicueType.data, fontSize: 26, fontWeight: 300, lineHeight: 1 }}
          >
            {Math.round(setPoint)}
          </motion.span>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.5 }}>
            set point
          </span>
        </div>

        {/* Heater indicator */}
        {heaterOn && (
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{
              position: 'absolute', bottom: 18,
              width: 8, height: 8, borderRadius: '50%',
              background: 'hsla(30, 60%, 55%, 0.7)',
            }}
          />
        )}
      </motion.div>

      {/* Room temp readout */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint, fontSize: 11, opacity: 0.6 }}>
          room: {Math.round(roomTemp)} deg
        </span>
        <span style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}>
          {raised ? 'standards raised' : setPoint < 65 ? 'drag up -- refuse the cold' : 'warming...'}
        </span>
      </div>

      {raised && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          new default
        </motion.div>
      )}
    </div>
  );
}