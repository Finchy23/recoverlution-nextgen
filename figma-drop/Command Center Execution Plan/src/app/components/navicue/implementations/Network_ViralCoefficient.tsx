/**
 * NETWORK #3 -- 1313. The Viral Coefficient
 * "Ideas spread if they carry emotional payload. Make it contagious."
 * INTERACTION: Share idea without emotion (dies). Add emotion -> exponential spread
 * STEALTH KBE: Emotional Design -- Memetic Engineering (K)
 *
 * COMPOSITOR: pattern_glitch / Circuit / work / knowing / tap / 1313
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

export default function Network_ViralCoefficient({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1313,
        isSeal: false,
      }}
      arrivalText="An idea. No carrier."
      prompt="Ideas spread if they carry emotional payload. Infect the host with meaning. Make it contagious."
      resonantText="Emotional design. You added feeling to the idea and it went viral. Memetic engineering is the science of making concepts sticky: logic informs, but emotion spreads."
      afterglowCoda="Make it contagious."
      onComplete={onComplete}
    >
      {(verse) => <ViralCoefficientInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ViralCoefficientInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'idle' | 'dead' | 'emotional' | 'viral'>('idle');
  const [spreadCount, setSpreadCount] = useState(1);

  const handleSharePlain = () => {
    if (phase !== 'idle') return;
    setPhase('dead');
  };

  const handleAddEmotion = () => {
    if (phase !== 'dead') return;
    setPhase('emotional');
    // Exponential spread animation
    let count = 2;
    const interval = setInterval(() => {
      count *= 2;
      setSpreadCount(count);
      if (count >= 32) {
        clearInterval(interval);
        setPhase('viral');
        setTimeout(() => verse.advance(), 3000);
      }
    }, 500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 180;
  const CX = W / 2, CY = H / 2;

  // Generate spread nodes in expanding rings
  const spreadNodes = Array.from({ length: Math.min(spreadCount, 32) }).map((_, i) => {
    if (i === 0) return { x: CX, y: CY };
    const ring = Math.ceil(Math.log2(i + 1));
    const nodesInRing = Math.pow(2, ring - 1);
    const indexInRing = i - (Math.pow(2, ring - 1));
    const angle = (indexInRing / nodesInRing) * Math.PI * 2 - Math.PI / 2;
    const r = ring * 28;
    return {
      x: CX + Math.cos(angle) * r,
      y: CY + Math.sin(angle) * r,
    };
  });

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>reach</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'viral' ? verse.palette.accent
            : phase === 'dead' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'viral' ? 'viral' : phase === 'dead' ? 'dead' : spreadCount}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Dead idea indicator */}
          {phase === 'dead' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <circle cx={CX} cy={CY} r={8}
                fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
              <line x1={CX - 4} y1={CY - 4} x2={CX + 4} y2={CY + 4}
                stroke={verse.palette.shadow} strokeWidth={1} opacity={0.3} />
              <line x1={CX + 4} y1={CY - 4} x2={CX - 4} y2={CY + 4}
                stroke={verse.palette.shadow} strokeWidth={1} opacity={0.3} />
              <text x={CX} y={CY + 25} textAnchor="middle"
                fill={verse.palette.shadow} style={navicueType.micro} opacity={0.4}>
                idea died
              </text>
            </motion.g>
          )}

          {/* Spreading nodes */}
          {(phase === 'emotional' || phase === 'viral') && (
            <g>
              {/* Connection lines */}
              {spreadNodes.map((node, i) => {
                if (i === 0) return null;
                const parentIdx = Math.floor((i - 1) / 2);
                const parent = spreadNodes[parentIdx];
                if (!parent) return null;
                return (
                  <motion.line key={`l-${i}`}
                    x1={parent.x} y1={parent.y}
                    x2={node.x} y2={node.y}
                    stroke={verse.palette.accent}
                    strokeWidth={0.5}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.15) }}
                    transition={{ delay: i * 0.05 }}
                  />
                );
              })}

              {/* Nodes */}
              {spreadNodes.map((node, i) => (
                <motion.circle key={`n-${i}`}
                  cx={node.x} cy={node.y}
                  r={i === 0 ? 7 : 4}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: safeOpacity(i === 0 ? 0.3 : 0.2),
                    scale: 1,
                  }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                />
              ))}

              {/* Pulse ring on center */}
              <motion.circle
                cx={CX} cy={CY}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5}
                animate={{
                  r: [10, 80],
                  opacity: [safeOpacity(0.15), 0],
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </g>
          )}

          {/* Idle: single dot */}
          {phase === 'idle' && (
            <g>
              <circle cx={CX} cy={CY} r={6}
                fill={verse.palette.accent} opacity={safeOpacity(0.15)} />
              <circle cx={CX} cy={CY} r={6}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.8} opacity={safeOpacity(0.3)} />
              <text x={CX} y={CY + 22} textAnchor="middle"
                fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.25}>
                idea
              </text>
            </g>
          )}

          {/* Viral label */}
          {phase === 'viral' && (
            <motion.text
              x={CX} y={H - 8} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              viral
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'idle' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleSharePlain}>
          share (plain)
        </motion.button>
      )}

      {phase === 'dead' && (
        <motion.button style={btn.base} whileTap={btn.active}
          onClick={handleAddEmotion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          add emotion
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'viral' ? 'emotion carried the idea'
          : phase === 'emotional' ? `spreading... ${spreadCount} reached`
            : phase === 'dead' ? 'logic alone does not spread'
              : 'ideas need carriers'}
      </span>

      {phase === 'viral' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          memetic engineering
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'viral' ? 'emotional design' : 'make it contagious'}
      </div>
    </div>
  );
}
