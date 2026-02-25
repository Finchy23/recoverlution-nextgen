/**
 * SOVEREIGN #1 -- 1371. The Constitution (The Code)
 * "Write the code when you are sober. Follow it when you are drunk on emotion."
 * INTERACTION: Chaos. Pull out scroll. Write a rule. Follow it. Chaos ends.
 * STEALTH KBE: Codification -- Principled Living (K)
 *
 * COMPOSITOR: poetic_precision / Arc / morning / knowing / type / 1371
 */
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Sovereign_Constitution({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'k',
        hook: 'type',
        specimenSeed: 1371,
        isSeal: false,
      }}
      arrivalText="Chaos. What do I do?"
      prompt="Emotions fluctuate. Principles do not. Write the code when you are sober. Follow it when you are drunk on emotion."
      resonantText="Codification. You wrote the rule and followed it and the chaos ended. Principled living: the constitution is the anchor that holds when the storm comes. Without it, every wave is a crisis."
      afterglowCoda="Follow the code."
      onComplete={onComplete}
    >
      {(verse) => <ConstitutionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ConstitutionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'chaos' | 'scroll' | 'writing' | 'written' | 'followed'>('chaos');
  const [rule, setRule] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScroll = () => {
    if (phase !== 'chaos') return;
    setPhase('scroll');
    setTimeout(() => {
      setPhase('writing');
      setTimeout(() => inputRef.current?.focus(), 200);
    }, 800);
  };

  const handleWrite = () => {
    if (phase !== 'writing' || rule.trim().length < 3) return;
    setPhase('written');
    setTimeout(() => {
      setPhase('followed');
      setTimeout(() => verse.advance(), 3000);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 150;
  const CX = W / 2;

  const chaosActive = phase === 'chaos';
  const scrollVisible = phase !== 'chaos';
  const calm = phase === 'written' || phase === 'followed';

  // Chaos particles
  const chaosParticles = Array.from({ length: 12 }).map((_, i) => ({
    x: 30 + (i % 4) * 50,
    y: 25 + Math.floor(i / 4) * 40,
    dx: (i % 2 === 0 ? 1 : -1) * (8 + i * 2),
    dy: (i % 3 === 0 ? 1 : -1) * (6 + i),
  }));

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>state</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'followed' ? verse.palette.accent
            : calm ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'followed' ? 'ordered'
            : calm ? 'stabilizing...'
              : phase === 'writing' ? 'write the rule'
                : phase === 'scroll' ? 'the scroll'
                  : 'chaos'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Chaos particles */}
          {chaosParticles.map((p, i) => (
            <motion.circle key={i}
              r={3 + i % 2}
              fill={verse.palette.shadow}
              animate={{
                cx: chaosActive ? [p.x, p.x + p.dx, p.x] : p.x,
                cy: chaosActive ? [p.y, p.y + p.dy, p.y] : p.y,
                opacity: safeOpacity(calm ? 0.01 : chaosActive ? 0.08 : 0.03),
              }}
              transition={{
                cx: { repeat: Infinity, duration: 0.8 + i * 0.1 },
                cy: { repeat: Infinity, duration: 1 + i * 0.1 },
                opacity: { duration: 0.5 },
              }}
            />
          ))}

          {/* Scroll */}
          {scrollVisible && (
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Scroll body */}
              <rect x={CX - 55} y={35} width={110} height={80} rx={3}
                fill={verse.palette.primary}
                opacity={safeOpacity(calm ? 0.06 : 0.04)} />
              <rect x={CX - 55} y={35} width={110} height={80} rx={3}
                fill="none"
                stroke={calm ? verse.palette.accent : verse.palette.primary}
                strokeWidth={1}
                opacity={safeOpacity(calm ? 0.25 : 0.15)} />

              {/* Scroll top roll */}
              <ellipse cx={CX} cy={35} rx={55} ry={4}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
              {/* Scroll bottom roll */}
              <ellipse cx={CX} cy={115} rx={55} ry={4}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />

              {/* Title */}
              <text x={CX} y={52} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.25}>
                constitution
              </text>

              {/* Rule line */}
              <line x1={CX - 40} y1={60} x2={CX + 40} y2={60}
                stroke={verse.palette.primary} strokeWidth={0.3}
                opacity={safeOpacity(0.08)} />

              {/* Written rule */}
              {(phase === 'written' || phase === 'followed') && rule && (
                <motion.text
                  x={CX} y={78} textAnchor="middle"
                  fill={phase === 'followed' ? verse.palette.accent : verse.palette.text}
                  style={{ fontSize: '11px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === 'followed' ? 0.5 : 0.35 }}
                >
                  {rule.length > 20 ? rule.slice(0, 20) + '...' : rule}
                </motion.text>
              )}

              {/* "Rule 1:" prefix */}
              {(phase === 'written' || phase === 'followed') && (
                <text x={CX} y={66} textAnchor="middle"
                  fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
                  rule 1
                </text>
              )}

              {/* Followed checkmark */}
              {phase === 'followed' && (
                <motion.path
                  d={`M ${CX - 6},${92} L ${CX - 2},${97} L ${CX + 8},${85}`}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={2} strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1, opacity: safeOpacity(0.5) }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                />
              )}
            </motion.g>
          )}

          {/* Calm indicator */}
          {phase === 'followed' && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              chaos ended. the code holds.
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'chaos' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleScroll}>
          pull out the scroll
        </motion.button>
      )}

      {phase === 'writing' && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={rule}
            onChange={e => setRule(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleWrite()}
            placeholder="write your rule..."
            style={{
              background: 'transparent',
              border: `1px solid ${verse.palette.primary}`,
              borderRadius: 6,
              padding: '6px 10px',
              color: verse.palette.text,
              fontSize: '13px',
              outline: 'none',
              opacity: 0.6,
              width: 160,
            }}
          />
          <motion.button style={btn.base} whileTap={btn.active} onClick={handleWrite}>
            seal
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'followed' ? 'the rule held. the kingdom stands.'
          : calm ? 'the rule is written. now follow it.'
            : phase === 'writing' ? 'write the code when you are sober.'
              : phase === 'scroll' ? 'the constitution...'
                : 'everything is moving. no anchor.'}
      </span>

      {phase === 'followed' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          principled living
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'followed' ? 'codification' : 'principles do not fluctuate'}
      </div>
    </div>
  );
}
