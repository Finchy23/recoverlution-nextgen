/**
 * SIMULATOR #9 -- 1249. The User Interface (The Mask)
 * "The behavior is just the UI. The backend is the need."
 * INTERACTION: Tap to peel the UI layer, revealing the child underneath the monster
 * STEALTH KBE: Depth Perception -- Insight (K)
 *
 * COMPOSITOR: witness_ritual / Pulse / social / knowing / tap / 1249
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Simulator_UserInterface({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Pulse',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1249,
        isSeal: false,
      }}
      arrivalText="You see a monster."
      prompt="The behavior is just the user interface. The backend is the need. Do not fight the UI. Address the backend."
      resonantText="Depth perception. Under the monster was a child. Under the anger was fear. Under the fear was a need for safety. Insight is peeling the interface to read the source code underneath."
      afterglowCoda="Address the backend."
      onComplete={onComplete}
    >
      {(verse) => <UserInterfaceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function UserInterfaceInteraction({ verse }: { verse: any }) {
  const [peeled, setPeeled] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const handlePeel = () => {
    if (peeled) return;
    setPeeled(true);
    setTimeout(() => {
      setRevealed(true);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 200;
  const SCENE_H = 200;
  const CX = SCENE_W / 2;
  const CY = SCENE_H / 2;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Layer indicator */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{
          ...navicueType.micro,
          color: revealed ? verse.palette.accent : verse.palette.textFaint,
        }}>
          {revealed ? 'backend' : 'frontend'}
        </span>
        <span style={{
          ...navicueType.micro,
          color: verse.palette.textFaint,
          opacity: 0.3,
        }}>
          {revealed ? 'the need' : 'the behavior'}
        </span>
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Child (backend) -- always present underneath */}
          <motion.g
            animate={{
              opacity: revealed ? 1 : 0,
            }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Small, soft circle (child) */}
            <circle cx={CX} cy={CY + 10} r={30}
              fill={verse.palette.accent}
              opacity={safeOpacity(0.1)} />
            <circle cx={CX} cy={CY + 10} r={30}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5} opacity={safeOpacity(0.3)} />

            {/* Eyes (soft, round) */}
            <circle cx={CX - 10} cy={CY + 5} r={3}
              fill={verse.palette.accent} opacity={safeOpacity(0.3)} />
            <circle cx={CX + 10} cy={CY + 5} r={3}
              fill={verse.palette.accent} opacity={safeOpacity(0.3)} />

            {/* Slight downward mouth (sad) */}
            <path
              d={`M ${CX - 8},${CY + 18} Q ${CX},${CY + 22} ${CX + 8},${CY + 18}`}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.8} opacity={safeOpacity(0.25)}
            />

            {/* Label */}
            <text x={CX} y={CY + 55} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              opacity={0.5}>
              child
            </text>

            {/* Need label */}
            <motion.text
              x={CX} y={CY + 70} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1 }}
            >
              need: safety
            </motion.text>
          </motion.g>

          {/* Monster (UI layer) -- peels away */}
          <AnimatePresence>
            {!revealed && (
              <motion.g
                exit={{
                  x: 80,
                  y: -40,
                  rotate: 15,
                  opacity: 0,
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Large angular shape (monster) */}
                <motion.path
                  d={`M ${CX - 45},${CY - 40} L ${CX - 50},${CY + 40} L ${CX + 50},${CY + 40} L ${CX + 45},${CY - 40} Z`}
                  fill={verse.palette.primary}
                  opacity={safeOpacity(0.08)}
                />
                <motion.path
                  d={`M ${CX - 45},${CY - 40} L ${CX - 50},${CY + 40} L ${CX + 50},${CY + 40} L ${CX + 45},${CY - 40} Z`}
                  fill="none"
                  stroke={verse.palette.shadow}
                  strokeWidth={1}
                  opacity={safeOpacity(0.2)}
                />

                {/* Angry eyes (sharp angles) */}
                <line x1={CX - 20} y1={CY - 10} x2={CX - 8} y2={CY - 5}
                  stroke={verse.palette.shadow} strokeWidth={2}
                  opacity={safeOpacity(0.3)} />
                <line x1={CX + 20} y1={CY - 10} x2={CX + 8} y2={CY - 5}
                  stroke={verse.palette.shadow} strokeWidth={2}
                  opacity={safeOpacity(0.3)} />

                {/* Sharp mouth */}
                <path
                  d={`M ${CX - 18},${CY + 15} L ${CX - 10},${CY + 20} L ${CX},${CY + 15} L ${CX + 10},${CY + 20} L ${CX + 18},${CY + 15}`}
                  fill="none" stroke={verse.palette.shadow}
                  strokeWidth={1} opacity={safeOpacity(0.25)}
                />

                {/* Label */}
                <text x={CX} y={CY + 55} textAnchor="middle"
                  fill={verse.palette.shadow} style={navicueType.micro}
                  opacity={0.4}>
                  monster
                </text>

                {/* Peel corner hint */}
                {!peeled && (
                  <motion.path
                    d={`M ${CX + 35},${CY - 35} L ${CX + 45},${CY - 45} L ${CX + 45},${CY - 30}`}
                    fill={verse.palette.primary}
                    opacity={safeOpacity(0.1)}
                    animate={{ opacity: [safeOpacity(0.05), safeOpacity(0.12), safeOpacity(0.05)] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </div>

      {/* Peel button */}
      {!peeled && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handlePeel}
        >
          peel the interface
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'under the monster was a child'
          : peeled
            ? 'peeling...'
            : 'the behavior is the UI. what is the backend?'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          insight
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'depth perception' : 'what is underneath?'}
      </div>
    </div>
  );
}
