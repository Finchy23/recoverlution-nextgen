/**
 * NETWORK #2 -- 1312. The Weak Tie (Bridge)
 * "The breakthrough comes from the stranger. Cross the bridge."
 * INTERACTION: Tap to reach across to the distant node -- new info floods in
 * STEALTH KBE: Openness -- Granovetter's Strength of Weak Ties (B)
 *
 * COMPOSITOR: koan_paradox / Arc / work / believing / tap / 1312
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

export default function Network_WeakTie({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1312,
        isSeal: false,
      }}
      arrivalText="Your circle. Everyone knows the same things."
      prompt="Your friends know what you know. The breakthrough comes from the stranger. Cross the bridge to the weak tie."
      resonantText="Openness. You reached across the gap and new data flooded in. Granovetter proved that weak ties carry more novel information than strong ones. The stranger holds the key."
      afterglowCoda="Cross the bridge."
      onComplete={onComplete}
    >
      {(verse) => <WeakTieInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function WeakTieInteraction({ verse }: { verse: any }) {
  const [bridged, setBridged] = useState(false);
  const [done, setDone] = useState(false);

  const handleBridge = () => {
    if (bridged) return;
    setBridged(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 260, H = 180;

  // Close circle (left cluster)
  const closeNodes = [
    { x: 55, y: 70 }, { x: 40, y: 100 }, { x: 70, y: 105 },
    { x: 80, y: 75 }, { x: 50, y: 130 },
  ];
  const you = { x: 65, y: 90 };

  // Distant node (right, isolated)
  const distant = { x: 210, y: 90 };

  // Data particles that flow across the bridge
  const dataParticles = Array.from({ length: 6 }).map((_, i) => ({
    delay: 0.3 + i * 0.15,
    yOff: (i - 3) * 8,
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>info</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'new data' : 'redundant'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Close circle connections (dense) */}
          {closeNodes.map((a, i) =>
            closeNodes.slice(i + 1).map((b, j) => (
              <line key={`cc-${i}-${j}`}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={verse.palette.primary} strokeWidth={0.5}
                opacity={safeOpacity(0.1)} />
            ))
          )}

          {/* Close circle nodes */}
          {closeNodes.map((node, i) => (
            <circle key={i} cx={node.x} cy={node.y} r={5}
              fill={verse.palette.primary} opacity={safeOpacity(0.12)} />
          ))}

          {/* You (in the cluster) */}
          <circle cx={you.x} cy={you.y} r={7}
            fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
          <circle cx={you.x} cy={you.y} r={7}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={0.8} opacity={safeOpacity(0.3)} />

          {/* "Same info" label */}
          <text x={60} y={155} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}
            opacity={bridged ? 0.15 : 0.25}>
            same info
          </text>

          {/* Gap */}
          {!bridged && (
            <motion.g
              animate={{ opacity: [0.08, 0.15, 0.08] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <line x1={110} y1={90} x2={170} y2={90}
                stroke={verse.palette.textFaint} strokeWidth={0.5}
                strokeDasharray="3 5" />
            </motion.g>
          )}

          {/* Bridge connection */}
          {bridged && (
            <motion.line
              x1={you.x} y1={you.y} x2={distant.x} y2={distant.y}
              stroke={verse.palette.accent}
              strokeWidth={1} strokeDasharray="5 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.3) }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Data flow particles */}
          {bridged && dataParticles.map((p, i) => (
            <motion.circle key={i}
              r={2} fill={verse.palette.accent}
              initial={{
                cx: distant.x, cy: distant.y + p.yOff,
                opacity: 0,
              }}
              animate={{
                cx: you.x,
                cy: you.y + p.yOff * 0.3,
                opacity: [0, safeOpacity(0.4), 0],
              }}
              transition={{
                duration: 0.8,
                delay: p.delay,
                ease: 'easeIn',
              }}
            />
          ))}

          {/* Distant node (weak tie) */}
          <motion.g>
            <circle cx={distant.x} cy={distant.y} r={8}
              fill={bridged ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(bridged ? 0.2 : 0.06)} />
            <circle cx={distant.x} cy={distant.y} r={8}
              fill="none"
              stroke={bridged ? verse.palette.accent : verse.palette.primary}
              strokeWidth={0.8}
              opacity={safeOpacity(bridged ? 0.35 : 0.12)} />
            <text x={distant.x} y={distant.y + 22} textAnchor="middle"
              fill={bridged ? verse.palette.accent : verse.palette.textFaint}
              style={navicueType.micro}
              opacity={bridged ? 0.5 : 0.2}>
              {bridged ? 'new info' : 'stranger'}
            </text>
          </motion.g>

          {/* Distant node's own small network (appears on bridge) */}
          {bridged && [
            { x: 230, y: 60 }, { x: 240, y: 110 }, { x: 220, y: 130 },
          ].map((n, i) => (
            <motion.g key={`dn-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.12) }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <line x1={distant.x} y1={distant.y} x2={n.x} y2={n.y}
                stroke={verse.palette.accent} strokeWidth={0.3} />
              <circle cx={n.x} cy={n.y} r={3}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
            </motion.g>
          ))}
        </svg>
      </div>

      {!bridged && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBridge}>
          cross the bridge
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the stranger held the key'
          : 'your friends know what you know'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          strength of weak ties
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'openness' : 'reach across the gap'}
      </div>
    </div>
  );
}
