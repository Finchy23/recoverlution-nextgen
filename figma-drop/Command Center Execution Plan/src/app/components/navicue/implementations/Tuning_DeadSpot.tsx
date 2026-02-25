/**
 * TUNING #7 -- 1197. The Dead Spot (Node)
 * "Find the node. Stand there while the world vibrates."
 * INTERACTION: Vibrating plate. Sand gathers at quiet nodes. Drag avatar to the quiet line.
 * STEALTH KBE: Refuge -- centering (E)
 *
 * COMPOSITOR: sensory_cinema / Echo / night / embodying / drag / 1197
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

// Node positions (quiet lines on vibrating plate)
const NODES = [40, 80, 120]; // x positions of nodal lines

export default function Tuning_DeadSpot({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Echo',
        chrono: 'night',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1197,
        isSeal: false,
      }}
      arrivalText="A vibrating plate. Sand scattering."
      prompt="Even in the chaos, there are places of stillness. Find the node. Stand there while the world vibrates."
      resonantText="Refuge. The plate shook violently but the sand gathered in lines of perfect stillness. You found the node and stood there. Centering is not stopping the vibration. It is finding the still point inside it."
      afterglowCoda="Safety."
      onComplete={onComplete}
    >
      {(verse) => <DeadSpotInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DeadSpotInteraction({ verse }: { verse: any }) {
  const [avatarX, setAvatarX] = useState(20);
  const [settled, setSettled] = useState(0);
  const [done, setDone] = useState(false);
  const SETTLE_TARGET = 20;

  // Check if avatar is on a node
  const onNode = NODES.some(n => Math.abs(avatarX - n) < 8);

  useEffect(() => {
    if (done) return;
    if (!onNode) {
      setSettled(0);
      return;
    }
    const interval = setInterval(() => {
      setSettled(prev => {
        const next = prev + 1;
        if (next >= SETTLE_TARGET) {
          setDone(true);
          setTimeout(() => verse.advance(), 2200);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onNode, done, verse]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    setAvatarX(prev => Math.max(10, Math.min(150, prev + info.delta.x)));
  }, [done]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Plate */}
          <rect x={5} y={30} width={150} height={40} rx={3}
            fill="none" stroke={verse.palette.primaryGlow} strokeWidth={0.8} opacity={0.12} />

          {/* Vibration lines (anti-nodes) */}
          {[20, 60, 100, 140].map((x, i) => (
            <motion.line key={i}
              x1={x} y1={35} x2={x} y2={65}
              stroke="hsla(0, 20%, 50%, 0.15)" strokeWidth={1}
              animate={{ x1: [x - 1, x + 1], x2: [x + 1, x - 1] }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.1 + i * 0.02 }}
            />
          ))}

          {/* Nodal lines (quiet) with sand */}
          {NODES.map((x, i) => (
            <g key={`node${i}`}>
              <line x1={x} y1={33} x2={x} y2={67}
                stroke={done ? verse.palette.accent : 'hsla(200, 20%, 50%, 0.15)'}
                strokeWidth={1} strokeDasharray="2 3" opacity={0.3} />
              {/* Sand dots at nodes */}
              {Array.from({ length: 5 }).map((_, j) => (
                <circle key={j} cx={x + (j - 2) * 2} cy={48 + (j % 3 - 1) * 6} r={1}
                  fill={done ? verse.palette.accent : 'hsla(40, 20%, 55%, 0.3)'}
                  opacity={0.3}
                />
              ))}
            </g>
          ))}

          {/* Avatar */}
          <motion.circle
            cx={avatarX} cy={50} r={5}
            fill={onNode
              ? (done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.5)')
              : 'hsla(0, 20%, 50%, 0.3)'}
            opacity={0.5}
            animate={onNode ? {} : {
              cx: [avatarX - 1, avatarX + 1],
            }}
            transition={onNode ? {} : {
              repeat: Infinity, repeatType: 'reverse', duration: 0.08,
            }}
          />

          {/* Status */}
          <text x={80} y={82} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={done ? verse.palette.accent : onNode ? 'hsla(200, 25%, 50%, 0.4)' : 'hsla(0, 20%, 50%, 0.3)'}
            opacity={0.5}>
            {done ? 'node' : onNode ? `settling... ${Math.round(settled / SETTLE_TARGET * 100)}%` : 'vibrating'}
          </text>
        </svg>
      </div>

      {!done ? (
        <motion.div
          drag="x"
          dragConstraints={{ left: -60, right: 60 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDrag={handleDrag}
          style={{
            ...immersiveTapButton(verse.palette).base,
            cursor: 'grab',
            touchAction: 'none',
          }}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          {onNode ? 'hold still...' : 'find the quiet line'}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          safety
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'centering' : 'stillness inside vibration'}
      </div>
    </div>
  );
}