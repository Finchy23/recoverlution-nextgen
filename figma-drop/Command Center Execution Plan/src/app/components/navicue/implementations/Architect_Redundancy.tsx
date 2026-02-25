/**
 * ARCHITECT #3 -- 1323. The Redundancy
 * "Two is one, one is none."
 * INTERACTION: One bridge breaks -> traffic stops. Build second. One breaks -> traffic flows.
 * STEALTH KBE: Resilience -- Risk Management (B)
 *
 * COMPOSITOR: koan_paradox / Arc / morning / believing / tap / 1323
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

export default function Architect_Redundancy({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1323,
        isSeal: false,
      }}
      arrivalText="One bridge. One path."
      prompt="Efficiency is fragile. Redundancy is robust. Have a backup plan. Have a backup skill. Two is one, one is none."
      resonantText="Resilience. The bridge broke but traffic flowed. Risk management is the wisdom of redundancy: the backup you never use is the most valuable asset you own."
      afterglowCoda="Two is one. One is none."
      onComplete={onComplete}
    >
      {(verse) => <RedundancyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function RedundancyInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'single' | 'broken' | 'built' | 'breaks2' | 'flows'>('single');

  const handleBreak1 = () => {
    if (phase !== 'single') return;
    setPhase('broken');
  };

  const handleBuild = () => {
    if (phase !== 'broken') return;
    setPhase('built');
    setTimeout(() => {
      setPhase('breaks2');
      setTimeout(() => {
        setPhase('flows');
        setTimeout(() => verse.advance(), 3000);
      }, 1200);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 160;
  const LEFT = 40, RIGHT = 200;
  const RIVER_Y = H / 2;

  const bridge1Y = RIVER_Y - 20;
  const bridge2Y = RIVER_Y + 20;
  const bridge1Intact = phase === 'single' || phase === 'broken';
  const bridge2Exists = phase === 'built' || phase === 'breaks2' || phase === 'flows';
  const bridge1Working = phase === 'single';
  const bridge2Working = phase === 'built' || phase === 'flows';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>traffic</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'flows' ? verse.palette.accent
            : phase === 'broken' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'flows' ? 'flowing' : phase === 'broken' ? 'stopped' : phase === 'breaks2' ? 'rerouting...' : 'flowing'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* River */}
          <rect x={LEFT + 20} y={RIVER_Y - 5} width={RIGHT - LEFT - 40} height={10} rx={5}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />

          {/* Left bank */}
          <rect x={10} y={20} width={LEFT} height={H - 40} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <text x={30} y={H - 10} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>A</text>

          {/* Right bank */}
          <rect x={RIGHT} y={20} width={W - RIGHT - 10} height={H - 40} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <text x={W - 30} y={H - 10} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>B</text>

          {/* Bridge 1 */}
          <AnimatePresence>
            {(phase === 'single') && (
              <motion.g exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <line x1={LEFT} y1={bridge1Y} x2={RIGHT} y2={bridge1Y}
                  stroke={verse.palette.primary} strokeWidth={3} opacity={safeOpacity(0.2)} />
                <line x1={LEFT} y1={bridge1Y} x2={RIGHT} y2={bridge1Y}
                  stroke={verse.palette.accent} strokeWidth={1} opacity={safeOpacity(0.15)} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Bridge 1 broken */}
          {(phase === 'broken' || phase === 'built' || phase === 'breaks2' || phase === 'flows') && (
            <g>
              <line x1={LEFT} y1={bridge1Y} x2={LEFT + 60} y2={bridge1Y}
                stroke={verse.palette.shadow} strokeWidth={2} opacity={safeOpacity(0.12)} />
              <line x1={RIGHT - 50} y1={bridge1Y + 8} x2={RIGHT} y2={bridge1Y}
                stroke={verse.palette.shadow} strokeWidth={2} opacity={safeOpacity(0.12)} />
              <text x={W / 2} y={bridge1Y - 6} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.25}>
                broken
              </text>
            </g>
          )}

          {/* Bridge 2 */}
          {bridge2Exists && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <line x1={LEFT} y1={bridge2Y} x2={RIGHT} y2={bridge2Y}
                stroke={bridge2Working ? verse.palette.accent : verse.palette.primary}
                strokeWidth={3}
                opacity={safeOpacity(bridge2Working ? 0.25 : 0.15)} />
              <line x1={LEFT} y1={bridge2Y} x2={RIGHT} y2={bridge2Y}
                stroke={verse.palette.accent}
                strokeWidth={1}
                opacity={safeOpacity(bridge2Working ? 0.3 : 0.08)} />
              <text x={W / 2} y={bridge2Y + 15} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }}
                opacity={bridge2Working ? 0.4 : 0.2}>
                backup
              </text>
            </motion.g>
          )}

          {/* Traffic flow (cars/dots) */}
          {(bridge1Working || bridge2Working) && (
            <motion.g>
              {[0, 1, 2].map(i => {
                const bridgeY = bridge1Working ? bridge1Y : bridge2Y;
                return (
                  <motion.rect key={i}
                    y={bridgeY - 3} width={10} height={6} rx={2}
                    fill={verse.palette.accent}
                    animate={{
                      x: [LEFT - 5, RIGHT + 5],
                      opacity: [0, safeOpacity(0.3), safeOpacity(0.3), 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      delay: i * 0.6,
                      ease: 'linear',
                    }}
                  />
                );
              })}
            </motion.g>
          )}

          {/* Stopped traffic */}
          {phase === 'broken' && (
            <g>
              {[0, 1, 2].map(i => (
                <rect key={`stopped-${i}`}
                  x={LEFT - 15 + i * 14} y={bridge1Y - 3}
                  width={10} height={6} rx={2}
                  fill={verse.palette.shadow}
                  opacity={safeOpacity(0.15)} />
              ))}
            </g>
          )}
        </svg>
      </div>

      {phase === 'single' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBreak1}>
          simulate failure
        </motion.button>
      )}

      {phase === 'broken' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleBuild}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          build second bridge
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'flows' ? 'bridge broke. traffic flows. redundancy.'
          : phase === 'breaks2' ? 'the first bridge breaks again...'
            : phase === 'built' ? 'two bridges. robust.'
              : phase === 'broken' ? 'one bridge. it broke. everything stopped.'
                : 'one bridge. fragile.'}
      </span>

      {phase === 'flows' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          risk management
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'flows' ? 'resilience' : 'two is one. one is none.'}
      </div>
    </div>
  );
}
