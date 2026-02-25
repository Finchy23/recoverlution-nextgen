/**
 * QUANTUM ARCHITECT #9 -- 1239. The Vacuum Fluctuation
 * "The void is not empty. It is pregnant."
 * INTERACTION: Observe -- wait in stillness. A particle pops from nothing.
 * STEALTH KBE: Stillness -- Creative Faith (E)
 *
 * COMPOSITOR: sacred_ordinary / Cosmos / night / embodying / observe / 1239
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function QuantumArchitect_VacuumFluctuation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1239,
        isSeal: false,
      }}
      arrivalText="Empty space."
      prompt="The void is not empty. It is pregnant. Trust the silence. The idea will pop when it is ready."
      resonantText="Stillness. You waited. You did not force it. And from the absolute emptiness, something appeared. Creative faith is trusting that the silence is working. The vacuum was never empty."
      afterglowCoda="Something from nothing."
      onComplete={onComplete}
    >
      {(verse) => <VacuumFluctuationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function VacuumFluctuationInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0); // 0=void, 1=fluctuating, 2=pop, 3=done
  const [microPops, setMicroPops] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [popCount, setPopCount] = useState(0);

  const SCENE_W = 220;
  const SCENE_H = 180;
  const CENTER_X = SCENE_W / 2;
  const CENTER_Y = SCENE_H / 2;

  // Phase progression -- user just waits
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000); // Fluctuations begin
    const t2 = setTimeout(() => setPhase(2), 5000); // The pop
    const t3 = setTimeout(() => {
      setPhase(3);
      setTimeout(() => verse.advance(), 3000);
    }, 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [verse]);

  // Micro fluctuations (virtual particles appearing and vanishing)
  useEffect(() => {
    if (phase < 1 || phase > 2) return;
    const interval = setInterval(() => {
      setMicroPops(prev => {
        const next = [...prev, {
          id: popCount,
          x: CENTER_X + (Math.random() - 0.5) * 120,
          y: CENTER_Y + (Math.random() - 0.5) * 100,
        }];
        setPopCount(c => c + 1);
        return next.slice(-8); // Keep last 8
      });
    }, 400);
    return () => clearInterval(interval);
  }, [phase, popCount]);

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* The void -- subtle border */}
          <rect x={10} y={10} width={SCENE_W - 20} height={SCENE_H - 20} rx={8}
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            opacity={safeOpacity(0.1)}
          />

          {/* Phase 0: Pure emptiness -- just a faint label */}
          {phase === 0 && (
            <motion.text
              x={CENTER_X} y={CENTER_Y + 4}
              textAnchor="middle"
              fill={verse.palette.textFaint}
              style={navicueType.micro}
              animate={{ opacity: [0.15, 0.25, 0.15] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              nothing
            </motion.text>
          )}

          {/* Phase 1+: Virtual particle pairs (appear and vanish) */}
          {phase >= 1 && microPops.map(pop => (
            <motion.g key={pop.id}>
              {/* Particle */}
              <motion.circle
                cx={pop.x - 4} cy={pop.y}
                r={2}
                fill={verse.palette.accent}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, safeOpacity(0.3), 0], scale: [0, 1, 0] }}
                transition={{ duration: 0.6 }}
              />
              {/* Anti-particle */}
              <motion.circle
                cx={pop.x + 4} cy={pop.y}
                r={2}
                fill={verse.palette.primary}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, safeOpacity(0.2), 0], scale: [0, 1, 0] }}
                transition={{ duration: 0.6 }}
              />
            </motion.g>
          ))}

          {/* Phase 2: THE POP -- real particle from nothing */}
          {phase >= 2 && (
            <motion.g>
              {/* Expansion ring */}
              <motion.circle
                cx={CENTER_X} cy={CENTER_Y}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1}
                initial={{ r: 0, opacity: 0.5 }}
                animate={{ r: 60, opacity: 0 }}
                transition={{ duration: 1.5 }}
              />

              {/* The particle */}
              <motion.circle
                cx={CENTER_X} cy={CENTER_Y}
                fill={verse.palette.accent}
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 10, opacity: safeOpacity(0.5) }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Glow pulse */}
              <motion.circle
                cx={CENTER_X} cy={CENTER_Y}
                r={25}
                fill={verse.palette.accent}
                animate={{
                  opacity: [safeOpacity(0.03), safeOpacity(0.1), safeOpacity(0.03)],
                }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.8 }}
              />

              {/* "Pop" text */}
              <motion.text
                x={CENTER_X} y={CENTER_Y - 25}
                textAnchor="middle"
                fill={verse.palette.accent}
                style={navicueType.micro}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                something
              </motion.text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Phase indicator */}
      <motion.span
        style={{
          ...navicueType.micro,
          color: phase >= 2 ? verse.palette.accent : verse.palette.textFaint,
        }}
        animate={{ opacity: 0.5 }}
      >
        {phase === 0
          ? 'the void'
          : phase === 1
            ? 'fluctuating...'
            : 'something from nothing'}
      </motion.span>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase >= 3
          ? 'the idea popped'
          : phase >= 2
            ? 'from absolute emptiness'
          : phase >= 1
            ? 'virtual particles appear and vanish...'
            : 'wait. trust the silence.'}
      </span>

      {phase >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          creative faith
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 3 ? 'stillness' : 'observe'}
      </div>
    </div>
  );
}
