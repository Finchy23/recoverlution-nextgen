/**
 * NETWORK #1 -- 1311. The Node Strength
 * "You need to know the person who knows everyone. Connect to the hub."
 * INTERACTION: Tap to connect your lone node to the hub -- network lights up
 * STEALTH KBE: Strategic Networking -- Leverage (K)
 *
 * COMPOSITOR: science_x_soul / Lattice / morning / knowing / tap / 1311
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Network_NodeStrength({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1311,
        isSeal: false,
      }}
      arrivalText="A single dot. One connection. Weak."
      prompt="You do not need to know everyone. You need to know the person who knows everyone. Connect to the hub."
      resonantText="Strategic networking. You connected to the hub and the entire network opened. Leverage is the understanding that one right connection outweighs a hundred weak ones."
      afterglowCoda="Connect to the hub."
      onComplete={onComplete}
    >
      {(verse) => <NodeStrengthInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NodeStrengthInteraction({ verse }: { verse: any }) {
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);

  const handleConnect = () => {
    if (connected) return;
    setConnected(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 260, H = 200;
  const CX = W / 2, CY = H / 2;

  // You: isolated node on left
  const you = { x: 45, y: CY };
  // Your single weak connection
  const weakFriend = { x: 85, y: CY - 15 };

  // Hub: super-connector center-right
  const hub = { x: 160, y: CY };

  // Hub's connections (radial)
  const hubConnections = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const r = 55;
    return {
      x: hub.x + Math.cos(angle) * r,
      y: hub.y + Math.sin(angle) * r,
    };
  });

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>connections</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? '9' : '1'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Hub connections (always visible, dim until connected) */}
          {hubConnections.map((node, i) => (
            <g key={i}>
              <motion.line
                x1={hub.x} y1={hub.y} x2={node.x} y2={node.y}
                stroke={verse.palette.primary}
                strokeWidth={0.5}
                animate={{ opacity: safeOpacity(connected ? 0.2 : 0.06) }}
                transition={{ delay: connected ? i * 0.06 : 0, duration: 0.4 }}
              />
              <motion.circle
                cx={node.x} cy={node.y} r={4}
                fill={verse.palette.primary}
                animate={{ opacity: safeOpacity(connected ? 0.2 : 0.06) }}
                transition={{ delay: connected ? i * 0.06 + 0.2 : 0, duration: 0.3 }}
              />
            </g>
          ))}

          {/* Hub node */}
          <circle cx={hub.x} cy={hub.y} r={12}
            fill={verse.palette.primary} opacity={safeOpacity(0.08)} />
          <circle cx={hub.x} cy={hub.y} r={12}
            fill="none" stroke={connected ? verse.palette.accent : verse.palette.primary}
            strokeWidth={connected ? 1.5 : 0.8}
            opacity={safeOpacity(connected ? 0.4 : 0.15)} />
          <text x={hub.x} y={hub.y + 20} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}
            opacity={connected ? 0.5 : 0.25}>
            hub
          </text>

          {/* Your weak friend */}
          <line x1={you.x} y1={you.y} x2={weakFriend.x} y2={weakFriend.y}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.1)} />
          <circle cx={weakFriend.x} cy={weakFriend.y} r={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.1)} />

          {/* Connection line from you to hub */}
          {connected && (
            <motion.line
              x1={you.x} y1={you.y} x2={hub.x} y2={hub.y}
              stroke={verse.palette.accent}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.35) }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* You: node */}
          <motion.circle
            cx={you.x} cy={you.y} r={7}
            fill={connected ? verse.palette.accent : verse.palette.accent}
            animate={{
              opacity: safeOpacity(connected ? 0.3 : 0.12),
            }}
            transition={{ duration: 0.4 }}
          />
          <motion.circle
            cx={you.x} cy={you.y} r={7}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={connected ? 1.5 : 0.8}
            animate={{
              opacity: safeOpacity(connected ? 0.5 : 0.25),
            }}
          />
          <text x={you.x} y={you.y + 18} textAnchor="middle"
            fill={verse.palette.accent} style={navicueType.micro}
            opacity={connected ? 0.6 : 0.3}>
            you
          </text>

          {/* Light-up pulse when connected */}
          {connected && (
            <motion.circle
              cx={you.x} cy={you.y} r={7}
              fill={verse.palette.accent}
              initial={{ r: 7, opacity: 0.3 }}
              animate={{ r: 25, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Network reach indicator */}
          {done && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {/* Second-degree connections from hub's nodes */}
              {hubConnections.slice(0, 4).map((node, i) => {
                const angle = ((i * 2 + 1) / 8) * Math.PI * 2;
                const ext = {
                  x: node.x + Math.cos(angle) * 20,
                  y: node.y + Math.sin(angle) * 20,
                };
                return (
                  <motion.g key={`ext-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.1) }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <line x1={node.x} y1={node.y} x2={ext.x} y2={ext.y}
                      stroke={verse.palette.primary} strokeWidth={0.3} />
                    <circle cx={ext.x} cy={ext.y} r={2}
                      fill={verse.palette.primary} />
                  </motion.g>
                );
              })}
            </motion.g>
          )}
        </svg>
      </div>

      {!connected && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleConnect}>
          connect to hub
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'one connection. entire network.'
          : 'you are a dot with one line'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          leverage
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'strategic networking' : 'find the hub'}
      </div>
    </div>
  );
}
