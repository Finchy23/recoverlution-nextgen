/**
 * STRATEGIST #6 -- 1306. The Zugzwang (Forced Move)
 * "Do not attack. Just improve your position."
 * INTERACTION: Hold to make a quiet waiting move -- opponent blunders
 * STEALTH KBE: Patience -- Pressure Application (E)
 *
 * COMPOSITOR: witness_ritual / Drift / night / embodying / hold / 1306
 */
import { useState } from 'react';
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

export default function Strategist_Zugzwang({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1306,
        isSeal: false,
      }}
      arrivalText="The opponent has no good moves."
      prompt="Do not attack. Just improve your position. Let them strangle themselves. When every move is bad, the only winning move is yours."
      resonantText="Patience. You waited and the opponent destroyed themselves. Pressure application is the art of zugzwang: the position where being forced to move is the punishment."
      afterglowCoda="Wait."
      onComplete={onComplete}
    >
      {(verse) => <ZugzwangInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ZugzwangInteraction({ verse }: { verse: any }) {
  const [done, setDone] = useState(false);
  const [blundered, setBlundered] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setBlundered(true);
      setTimeout(() => {
        setDone(true);
        setTimeout(() => verse.advance(), 2800);
      }, 1200);
    },
  });

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const W = 220, H = 160;
  const CX = W / 2;

  // Opponent's position deteriorates as you wait
  const pressure = hold.tension;

  // Opponent's pieces -- they shift into worse positions
  const oppPieces = [
    { x: 150, y: 50, type: 'K', badX: 170, badY: 35 },
    { x: 140, y: 80, type: 'P', badX: 140, badY: 95 },
    { x: 165, y: 90, type: 'P', badX: 175, badY: 105 },
  ];

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Pressure gauge */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>pressure</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'zugzwang' : blundered ? 'blunder' : `${Math.round(pressure * 100)}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={10} y={10} width={W - 20} height={H - 20} rx={6}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />

          {/* Your pieces (solid, unmoved) */}
          {[
            { x: 55, y: 70, type: 'K' },
            { x: 45, y: 100, type: 'R' },
            { x: 75, y: 90, type: 'B' },
          ].map((p, i) => (
            <g key={`y-${i}`}>
              <circle cx={p.x} cy={p.y} r={10}
                fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
              <circle cx={p.x} cy={p.y} r={10}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.8} opacity={safeOpacity(0.3)} />
              <text x={p.x} y={p.y + 4} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '11px' }} opacity={0.5}>
                {p.type}
              </text>
            </g>
          ))}

          {/* Opponent's pieces (shift to worse positions under pressure) */}
          {oppPieces.map((p, i) => {
            const cx = p.x + (p.badX - p.x) * pressure;
            const cy = p.y + (p.badY - p.y) * pressure;
            return (
              <motion.g key={`o-${i}`}
                animate={{ x: 0 }}
              >
                <circle cx={cx} cy={cy} r={10}
                  fill={verse.palette.shadow} opacity={safeOpacity(0.06)} />
                <circle cx={cx} cy={cy} r={10}
                  fill="none" stroke={verse.palette.shadow}
                  strokeWidth={0.8}
                  opacity={safeOpacity(blundered ? 0.15 : 0.2)} />
                <text x={cx} y={cy + 4} textAnchor="middle"
                  fill={verse.palette.shadow} style={{ fontSize: '11px' }}
                  opacity={blundered ? 0.25 : 0.4}>
                  {p.type}
                </text>

                {/* Stress indicator */}
                {pressure > 0.3 && (
                  <motion.circle
                    cx={cx} cy={cy} r={14}
                    fill="none" stroke={verse.palette.shadow}
                    strokeWidth={0.3} strokeDasharray="2 2"
                    animate={{ opacity: [safeOpacity(0.05), safeOpacity(0.12), safeOpacity(0.05)] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  />
                )}
              </motion.g>
            );
          })}

          {/* Blunder indicator */}
          {blundered && (
            <motion.g>
              <motion.text
                x={155} y={65} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '12px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              >
                ?
              </motion.text>
              <motion.text
                x={CX} y={H - 15} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.choice}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5 }}
              >
                blunder
              </motion.text>
            </motion.g>
          )}

          {/* "wait" label near your side */}
          {!blundered && hold.isHolding && (
            <motion.text
              x={55} y={45} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              waiting...
            </motion.text>
          )}
        </svg>
      </div>

      {/* Hold button */}
      {!blundered && (
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
            {hold.isHolding ? 'waiting...' : 'wait'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'they strangled themselves'
          : blundered ? 'the opponent blunders...'
            : hold.isHolding ? 'every move worsens their position...'
              : 'do not attack. just wait.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          pressure application
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'patience' : 'improve your position'}
      </div>
    </div>
  );
}
