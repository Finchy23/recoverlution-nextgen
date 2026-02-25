/**
 * GAME DESIGNER #2 -- 1392. The Incentive Structure
 * "Show me the incentive, and I will show you the outcome."
 * INTERACTION: Stealing. Camera (punishment) -> hide. Bonus (reward) -> stop stealing.
 * STEALTH KBE: Incentive Design -- Mechanism Design (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / morning / knowing / tap / 1392
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

export default function GameDesigner_IncentiveStructure({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1392,
        isSeal: false,
      }}
      arrivalText="People are stealing."
      prompt="Show me the incentive, and I will show you the outcome. Do not blame the player. Fix the payout."
      resonantText="Incentive design. You changed the reward structure and the behavior changed. Mechanism design: people are not broken. Systems are. Fix the incentive and you fix the player."
      afterglowCoda="Fix the payout."
      onComplete={onComplete}
    >
      {(verse) => <IncentiveInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function IncentiveInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'stealing' | 'camera' | 'hiding' | 'bonus' | 'fixed'>('stealing');

  const handleCamera = () => {
    if (phase !== 'stealing') return;
    setPhase('camera');
    setTimeout(() => setPhase('hiding'), 1200);
  };

  const handleBonus = () => {
    if (phase !== 'hiding') return;
    setPhase('bonus');
    setTimeout(() => {
      setPhase('fixed');
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 230, H = 150;
  const CX = W / 2;

  // Agents
  const agents = [
    { x: 50, y: 60 }, { x: 100, y: 50 }, { x: 150, y: 65 }, { x: 190, y: 55 },
  ];

  const hiding = phase === 'hiding' || phase === 'camera';
  const fixed = phase === 'fixed';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>behavior</span>
        <motion.span style={{
          ...navicueType.data,
          color: fixed ? verse.palette.accent
            : phase === 'hiding' ? verse.palette.shadow : verse.palette.text,
        }}>
          {fixed ? 'aligned'
            : phase === 'bonus' ? 'recalibrating...'
              : phase === 'hiding' ? 'still stealing (hidden)'
                : phase === 'camera' ? 'watching...'
                  : 'stealing'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Incentive structure bar */}
          <rect x={25} y={95} width={W - 50} height={30} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.03)} />
          <text x={CX} y={108} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.12}>
            incentive structure
          </text>

          {/* Old incentive: punishment (camera) */}
          {(phase === 'camera' || phase === 'hiding') && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <rect x={35} y={98} width={70} height={18} rx={3}
                fill={verse.palette.shadow} opacity={safeOpacity(0.06)} />
              <text x={70} y={110} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.25}>
                punishment
              </text>
              {/* Camera icon */}
              <circle cx={45} cy={40} r={8}
                fill="none" stroke={verse.palette.shadow}
                strokeWidth={1} opacity={safeOpacity(0.15)} />
              <circle cx={45} cy={40} r={3}
                fill={verse.palette.shadow} opacity={safeOpacity(0.1)} />
            </motion.g>
          )}

          {/* New incentive: reward (bonus) */}
          {(phase === 'bonus' || fixed) && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <rect x={W - 105} y={98} width={70} height={18} rx={3}
                fill={fixed ? verse.palette.accent : verse.palette.primary}
                opacity={safeOpacity(fixed ? 0.1 : 0.06)} />
              <text x={W - 70} y={110} textAnchor="middle"
                fill={fixed ? verse.palette.accent : verse.palette.text}
                style={{ fontSize: '7px' }}
                opacity={fixed ? 0.4 : 0.25}>
                reward
              </text>
            </motion.g>
          )}

          {/* Agents */}
          {agents.map((a, i) => {
            const isStealing = phase === 'stealing';
            const isHiding = hiding && !fixed;
            return (
              <motion.g key={i}
                animate={{
                  y: isHiding ? 15 : 0,
                  opacity: isHiding ? 0.5 : 1,
                }}
              >
                <circle cx={a.x} cy={a.y} r={7}
                  fill={fixed ? verse.palette.accent
                    : isStealing ? verse.palette.shadow : verse.palette.primary}
                  opacity={safeOpacity(fixed ? 0.15 : 0.08)} />
                <circle cx={a.x} cy={a.y} r={7}
                  fill="none"
                  stroke={fixed ? verse.palette.accent : verse.palette.primary}
                  strokeWidth={0.5}
                  opacity={safeOpacity(fixed ? 0.25 : 0.1)} />

                {/* Stealing indicator */}
                {isStealing && (
                  <motion.text x={a.x} y={a.y - 12} textAnchor="middle"
                    fill={verse.palette.shadow} style={{ fontSize: '6px' }}
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}>
                    steal
                  </motion.text>
                )}

                {/* Hidden indicator */}
                {isHiding && (
                  <text x={a.x} y={a.y - 12} textAnchor="middle"
                    fill={verse.palette.shadow} style={{ fontSize: '6px' }} opacity={0.15}>
                    {phase === 'hiding' ? 'hidden' : '...'}
                  </text>
                )}

                {/* Aligned indicator */}
                {fixed && (
                  <motion.text x={a.x} y={a.y + 18} textAnchor="middle"
                    fill={verse.palette.accent} style={{ fontSize: '6px' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ delay: i * 0.1 }}>
                    aligned
                  </motion.text>
                )}
              </motion.g>
            );
          })}

          {/* Arrow: incentive -> behavior */}
          {fixed && (
            <motion.line
              x1={CX} y1={95} x2={CX} y2={80}
              stroke={verse.palette.accent} strokeWidth={0.8}
              strokeDasharray="3 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.15) }}
            />
          )}

          {/* Result */}
          {fixed && (
            <motion.text x={CX} y={H - 3} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              fix the incentive, fix the player
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'stealing' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleCamera}>
          add camera (punishment)
        </motion.button>
      )}

      {phase === 'hiding' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBonus}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          change to bonus (reward)
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {fixed ? 'the reward changed. the behavior followed.'
          : phase === 'bonus' ? 'recalibrating incentives...'
            : phase === 'hiding' ? 'they hid. still stealing. punishment failed.'
              : phase === 'camera' ? 'watching...'
                : 'people are stealing. what do you change?'}
      </span>

      {fixed && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          mechanism design
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {fixed ? 'incentive design' : 'fix the payout'}
      </div>
    </div>
  );
}
