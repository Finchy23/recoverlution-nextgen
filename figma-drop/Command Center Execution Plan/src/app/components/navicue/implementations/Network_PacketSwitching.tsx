/**
 * NETWORK #6 -- 1316. The Packet Switching
 * "Break it down. Send the pieces through different channels. Reassemble."
 * INTERACTION: Tap to fragment the big message -- packets take different routes, reassemble
 * STEALTH KBE: Decentralization -- Agility (K)
 *
 * COMPOSITOR: poetic_precision / Circuit / work / knowing / tap / 1316
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Network_PacketSwitching({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1316,
        isSeal: false,
      }}
      arrivalText="A big message. Blocked."
      prompt="The big move is blocked. Break it down. Send the pieces through different channels. Reassemble on the other side."
      resonantText="Decentralization. You fragmented the message and it arrived intact through five different routes. Agility is the packet-switching of life: when the main path is blocked, split and reroute."
      afterglowCoda="Reassemble on the other side."
      onComplete={onComplete}
    >
      {(verse) => <PacketSwitchingInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PacketSwitchingInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'blocked' | 'split' | 'routing' | 'assembled'>('blocked');
  const [arrived, setArrived] = useState(0);
  const PACKETS = 5;

  const handleSplit = () => {
    if (phase !== 'blocked') return;
    setPhase('split');
    setTimeout(() => {
      setPhase('routing');
      // Packets arrive at staggered times
      for (let i = 0; i < PACKETS; i++) {
        setTimeout(() => {
          setArrived(prev => {
            const next = prev + 1;
            if (next >= PACKETS) {
              setTimeout(() => {
                setPhase('assembled');
                setTimeout(() => verse.advance(), 2800);
              }, 400);
            }
            return next;
          });
        }, 600 + i * 400);
      }
    }, 800);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 260, H = 160;

  const SOURCE = { x: 30, y: H / 2 };
  const DEST = { x: 230, y: H / 2 };
  const BLOCK = { x: 130, y: H / 2 };

  // Route waypoints for each packet (different paths)
  const routes = [
    [{ x: 80, y: 30 }, { x: 160, y: 25 }],
    [{ x: 100, y: 55 }, { x: 180, y: 50 }],
    [{ x: 70, y: H / 2 }, { x: 170, y: H / 2 + 5 }],
    [{ x: 100, y: H / 2 + 30 }, { x: 180, y: H / 2 + 25 }],
    [{ x: 80, y: H - 25 }, { x: 160, y: H - 30 }],
  ];

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>packets</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'assembled' ? verse.palette.accent : verse.palette.text,
        }}>
          {phase === 'assembled' ? 'reassembled' : phase === 'routing' ? `${arrived}/${PACKETS}` : phase === 'split' ? 'fragmented' : 'blocked'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Direct path (blocked) */}
          {phase === 'blocked' && (
            <g>
              <line x1={SOURCE.x} y1={SOURCE.y} x2={DEST.x} y2={DEST.y}
                stroke={verse.palette.primary} strokeWidth={0.5}
                opacity={safeOpacity(0.08)} />
              {/* Block */}
              <rect x={BLOCK.x - 12} y={BLOCK.y - 15} width={24} height={30} rx={3}
                fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
              <line x1={BLOCK.x - 6} y1={BLOCK.y - 6} x2={BLOCK.x + 6} y2={BLOCK.y + 6}
                stroke={verse.palette.shadow} strokeWidth={1.5} opacity={0.25} />
              <line x1={BLOCK.x + 6} y1={BLOCK.y - 6} x2={BLOCK.x - 6} y2={BLOCK.y + 6}
                stroke={verse.palette.shadow} strokeWidth={1.5} opacity={0.25} />
            </g>
          )}

          {/* Big message (before split) */}
          {phase === 'blocked' && (
            <g>
              <rect x={SOURCE.x - 10} y={SOURCE.y - 18} width={20} height={36} rx={3}
                fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
              <rect x={SOURCE.x - 10} y={SOURCE.y - 18} width={20} height={36} rx={3}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.8} opacity={safeOpacity(0.25)} />
              {/* Message lines */}
              {[-8, -2, 4, 10].map((dy, i) => (
                <line key={i} x1={SOURCE.x - 5} y1={SOURCE.y + dy}
                  x2={SOURCE.x + 5} y2={SOURCE.y + dy}
                  stroke={verse.palette.accent} strokeWidth={0.5}
                  opacity={safeOpacity(0.15)} />
              ))}
            </g>
          )}

          {/* Route paths (visible during routing) */}
          {(phase === 'routing' || phase === 'assembled') && routes.map((route, i) => (
            <motion.path key={`route-${i}`}
              d={`M ${SOURCE.x},${SOURCE.y} Q ${route[0].x},${route[0].y} ${(route[0].x + route[1].x) / 2},${(route[0].y + route[1].y) / 2} Q ${route[1].x},${route[1].y} ${DEST.x},${DEST.y}`}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.3} strokeDasharray="2 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.1) }}
              transition={{ delay: i * 0.08 }}
            />
          ))}

          {/* Packets in transit */}
          {phase === 'routing' && routes.map((route, i) => {
            if (i < arrived) return null;
            return (
              <motion.rect key={`pkt-${i}`}
                width={8} height={8} rx={2}
                fill={verse.palette.accent}
                animate={{
                  x: [SOURCE.x - 4, route[0].x - 4, route[1].x - 4, DEST.x - 4],
                  y: [SOURCE.y - 4, route[0].y - 4, route[1].y - 4, DEST.y - 4],
                  opacity: [safeOpacity(0.3), safeOpacity(0.3), safeOpacity(0.3), 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  ease: 'linear',
                }}
              />
            );
          })}

          {/* Destination: reassembled message */}
          {phase === 'assembled' && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <rect x={DEST.x - 10} y={DEST.y - 18} width={20} height={36} rx={3}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
              <rect x={DEST.x - 10} y={DEST.y - 18} width={20} height={36} rx={3}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1} opacity={safeOpacity(0.35)} />
              {[-8, -2, 4, 10].map((dy, i) => (
                <line key={i} x1={DEST.x - 5} y1={DEST.y + dy}
                  x2={DEST.x + 5} y2={DEST.y + dy}
                  stroke={verse.palette.accent} strokeWidth={0.5}
                  opacity={safeOpacity(0.2)} />
              ))}
            </motion.g>
          )}

          {/* Arrived packet indicators at destination */}
          {arrived > 0 && phase !== 'assembled' && (
            <g>
              {Array.from({ length: arrived }).map((_, i) => (
                <motion.rect key={`arr-${i}`}
                  x={DEST.x - 10 + (i % 3) * 8} y={DEST.y - 12 + Math.floor(i / 3) * 10}
                  width={6} height={6} rx={1}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.2) }}
                />
              ))}
            </g>
          )}

          {/* Source/Dest labels */}
          <text x={SOURCE.x} y={H - 5} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>src</text>
          <text x={DEST.x} y={H - 5} textAnchor="middle"
            fill={phase === 'assembled' ? verse.palette.accent : verse.palette.textFaint}
            style={{ fontSize: '7px' }} opacity={phase === 'assembled' ? 0.4 : 0.2}>dst</text>
        </svg>
      </div>

      {phase === 'blocked' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleSplit}>
          fragment
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'assembled' ? 'message arrived intact. five routes.'
          : phase === 'routing' ? 'packets in transit...'
            : phase === 'split' ? 'breaking into packets...'
              : 'the direct path is blocked'}
      </span>

      {phase === 'assembled' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          agility
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'assembled' ? 'decentralization' : 'split and reroute'}
      </div>
    </div>
  );
}
