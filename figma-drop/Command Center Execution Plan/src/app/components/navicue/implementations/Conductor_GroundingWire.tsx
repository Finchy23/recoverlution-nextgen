/**
 * CONDUCTOR #2 -- 1212. The Grounding Wire (Safety)
 * "You are holding the voltage. Ground it."
 * INTERACTION: Hold the ground button -- visual discharge clears the screen
 * STEALTH KBE: Discharge -- Somatic Release (E)
 *
 * COMPOSITOR: sensory_cinema / Storm / night / embodying / hold / 1212
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveHoldButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function Conductor_GroundingWire({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Storm',
        chrono: 'night',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1212,
        isSeal: false,
      }}
      arrivalText="Lightning in your hands."
      prompt="You are holding the voltage. It will fry your nervous system. Ground it. Send the excess into the earth."
      resonantText="Discharge. The lightning did not stop. You gave it a path. Somatic release is not destruction. It is redirection. Walk, breathe, move. Let the charge find the ground."
      afterglowCoda="Into the earth."
      onComplete={onComplete}
    >
      {(verse) => <GroundingInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GroundingInteraction({ verse }: { verse: any }) {
  const [voltage, setVoltage] = useState(1);
  const [discharged, setDischarged] = useState(false);
  const [bolts, setBolts] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const hold = useHoldInteraction({
    maxDuration: 4000,
    onComplete: () => {
      setDischarged(true);
      setTimeout(() => verse.advance(), 2800);
    },
  });

  // Voltage drain while holding
  useEffect(() => {
    if (!hold.isHolding) return;
    const interval = setInterval(() => {
      setVoltage(prev => Math.max(0, prev - 0.015));
    }, 50);
    return () => clearInterval(interval);
  }, [hold.isHolding]);

  // Chaotic bolt generation while voltage is high
  useEffect(() => {
    if (discharged) return;
    if (voltage < 0.2) return;
    const interval = setInterval(() => {
      setBolts(prev => {
        const next = [...prev, {
          id: Date.now(),
          x: 40 + Math.random() * 180,
          y: 20 + Math.random() * 80,
        }];
        return next.slice(-6);
      });
    }, 400 + (1 - voltage) * 800);
    return () => clearInterval(interval);
  }, [voltage, discharged]);

  const btn = immersiveHoldButton(verse.palette, 90, 28);
  const SCENE_W = 260;
  const SCENE_H = 130;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Lightning field */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Lightning bolts */}
          {bolts.map(bolt => (
            <motion.g key={bolt.id}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <line
                x1={bolt.x} y1={bolt.y}
                x2={bolt.x + (Math.random() - 0.5) * 30}
                y2={bolt.y + 20 + Math.random() * 20}
                stroke={verse.palette.accent}
                strokeWidth={1.5}
                opacity={safeOpacity(voltage * 0.5)}
              />
              <line
                x1={bolt.x + (Math.random() - 0.5) * 30}
                y1={bolt.y + 20 + Math.random() * 20}
                x2={bolt.x + (Math.random() - 0.5) * 40}
                y2={bolt.y + 40 + Math.random() * 20}
                stroke={verse.palette.accent}
                strokeWidth={1}
                opacity={safeOpacity(voltage * 0.4)}
              />
            </motion.g>
          ))}

          {/* You (rod) -- center */}
          <motion.line
            x1={SCENE_W / 2} y1={15}
            x2={SCENE_W / 2} y2={SCENE_H - 15}
            stroke={voltage > 0.5 ? verse.palette.shadow : verse.palette.accent}
            strokeWidth={2}
            animate={{
              opacity: safeOpacity(0.3 + voltage * 0.2),
              x1: hold.isHolding ? 0 : [0, 1, -1, 0][Math.floor(voltage * 4) % 4],
            }}
          />

          {/* Ground wire -- appears during hold */}
          {hold.tension > 0 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(hold.tension * 0.6) }}
            >
              <line
                x1={SCENE_W / 2} y1={SCENE_H - 15}
                x2={SCENE_W / 2} y2={SCENE_H - 5}
                stroke={verse.palette.accent}
                strokeWidth={1.5}
              />
              {/* Ground symbol */}
              <line x1={SCENE_W / 2 - 12} y1={SCENE_H - 5}
                x2={SCENE_W / 2 + 12} y2={SCENE_H - 5}
                stroke={verse.palette.accent} strokeWidth={1} />
              <line x1={SCENE_W / 2 - 8} y1={SCENE_H}
                x2={SCENE_W / 2 + 8} y2={SCENE_H}
                stroke={verse.palette.accent} strokeWidth={1} />
              <line x1={SCENE_W / 2 - 4} y1={SCENE_H + 5}
                x2={SCENE_W / 2 + 4} y2={SCENE_H + 5}
                stroke={verse.palette.accent} strokeWidth={1} />
            </motion.g>
          )}

          {/* Discharge flow lines */}
          {hold.isHolding && Array.from({ length: 3 }).map((_, i) => (
            <motion.circle
              key={i}
              cx={SCENE_W / 2}
              r={2}
              fill={verse.palette.accent}
              animate={{
                cy: [SCENE_H / 2, SCENE_H - 5],
                opacity: [safeOpacity(0.4), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.25,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Voltage readout */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>voltage</span>
        <div style={{ width: 70, height: 3, borderRadius: 2, background: verse.palette.primaryFaint }}>
          <motion.div
            animate={{ width: `${voltage * 100}%` }}
            style={{
              height: '100%', borderRadius: 2,
              background: voltage > 0.5 ? verse.palette.shadow : verse.palette.accent,
              opacity: 0.6,
            }}
          />
        </div>
      </div>

      {/* Hold zone */}
      {!discharged && (
        <motion.div
          {...hold.holdProps}
          animate={hold.isHolding ? btn.holding : {}}
          transition={{ duration: 0.2 }}
          style={{ ...hold.holdProps.style, ...btn.base }}
        >
          <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
            <circle {...btn.progressRing.track} />
            <circle {...btn.progressRing.fill(hold.tension)} />
          </svg>
          <div style={btn.label}>
            {hold.isHolding ? 'grounding...' : 'hold to ground'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {discharged
          ? 'discharged'
          : hold.isHolding
            ? 'sending to earth...'
            : 'the charge is burning you'}
      </span>

      {discharged && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          somatic release
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {discharged ? 'discharge' : 'ground the voltage'}
      </div>
    </div>
  );
}
