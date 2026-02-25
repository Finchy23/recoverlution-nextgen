/**
 * ARCHITECT #8 -- 1328. The Scalability
 * "Some structures cannot scale."
 * INTERACTION: Build card tower (crashes). Choose pyramid base (stable).
 * STEALTH KBE: Scalability -- Growth Planning (K)
 *
 * COMPOSITOR: science_x_soul / Arc / work / knowing / tap / 1328
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

export default function Architect_Scalability({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1328,
        isSeal: false,
      }}
      arrivalText="A structure. Rising."
      prompt="Some structures cannot scale. If you want to go high, you need a wide base. Build for the scale you want, not the scale you have."
      resonantText="Scalability. The cards fell, but the pyramid stood. Growth planning is architectural honesty: the height you can reach is determined by the width of your foundation."
      afterglowCoda="Build for the scale you want."
      onComplete={onComplete}
    >
      {(verse) => <ScalabilityInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ScalabilityInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'choose' | 'cards' | 'crash' | 'pyramid' | 'stable'>('choose');
  const [cardHeight, setCardHeight] = useState(0);
  const [pyramidHeight, setPyramidHeight] = useState(0);

  const handleCards = () => {
    if (phase !== 'choose') return;
    setPhase('cards');
    // Build card tower, then crash
    let h = 0;
    const buildInterval = setInterval(() => {
      h++;
      setCardHeight(h);
      if (h >= 5) {
        clearInterval(buildInterval);
        setTimeout(() => setPhase('crash'), 600);
      }
    }, 400);
  };

  const handlePyramid = () => {
    if (phase !== 'crash') return;
    setPhase('pyramid');
    let h = 0;
    const buildInterval = setInterval(() => {
      h++;
      setPyramidHeight(h);
      if (h >= 5) {
        clearInterval(buildInterval);
        setPhase('stable');
        setTimeout(() => verse.advance(), 3000);
      }
    }, 400);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 180;
  const CX = W / 2;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>structure</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'stable' ? verse.palette.accent
            : phase === 'crash' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'stable' ? 'stable' : phase === 'crash' ? 'collapsed' : phase === 'cards' ? 'fragile' : 'pending'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Card tower (left side) */}
          {(phase === 'cards' || phase === 'crash') && (
            <g>
              {Array.from({ length: cardHeight }).map((_, i) => {
                const y = H - 20 - i * 25;
                const crashed = phase === 'crash';
                return (
                  <motion.g key={`card-${i}`}
                    animate={crashed ? {
                      y: (5 - i) * 15,
                      rotate: (i % 2 === 0 ? 1 : -1) * (30 + i * 10),
                      opacity: 0.15,
                    } : {}}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    style={{ transformOrigin: `${CX - 50}px ${y}px` }}
                  >
                    {/* Two leaning cards forming A shape */}
                    <line x1={CX - 60} y1={y} x2={CX - 50} y2={y - 20}
                      stroke={verse.palette.primary} strokeWidth={2}
                      opacity={safeOpacity(0.15)} />
                    <line x1={CX - 40} y1={y} x2={CX - 50} y2={y - 20}
                      stroke={verse.palette.primary} strokeWidth={2}
                      opacity={safeOpacity(0.15)} />
                  </motion.g>
                );
              })}

              {/* Crash indicator */}
              {phase === 'crash' && (
                <motion.text
                  x={CX - 50} y={H / 2} textAnchor="middle"
                  fill={verse.palette.shadow} style={{ fontSize: '9px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 0.3 }}
                >
                  crash
                </motion.text>
              )}
            </g>
          )}

          {/* Pyramid (right side, or center if post-crash) */}
          {(phase === 'pyramid' || phase === 'stable') && (
            <g>
              {Array.from({ length: pyramidHeight }).map((_, i) => {
                const y = H - 20 - i * 25;
                const width = 20 + (pyramidHeight - i) * 18;
                const x = CX + 50 - width / 2;
                return (
                  <motion.rect key={`pyr-${i}`}
                    x={x} y={y} width={width} height={20} rx={2}
                    fill={verse.palette.accent}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: safeOpacity(0.1), scaleX: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ transformOrigin: `${CX + 50}px ${y + 10}px` }}
                  />
                );
              })}

              {/* Pyramid outline */}
              {pyramidHeight >= 5 && (
                <motion.path
                  d={`M ${CX + 50},${H - 20 - 4 * 25} L ${CX + 50 - (20 + 5 * 18) / 2},${H - 20 + 20} L ${CX + 50 + (20 + 5 * 18) / 2},${H - 20 + 20} Z`}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.15) }}
                  transition={{ delay: 0.3 }}
                />
              )}
            </g>
          )}

          {/* Labels */}
          {phase === 'crash' && (
            <text x={CX + 50} y={H / 2} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.2}>
              try again?
            </text>
          )}

          {phase === 'stable' && (
            <motion.text
              x={CX + 50} y={30} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              stable
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'choose' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleCards}>
          build tall (cards)
        </motion.button>
      )}

      {phase === 'crash' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handlePyramid}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          build wide (pyramid)
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'stable' ? 'wide base. stable height.'
          : phase === 'pyramid' ? 'building with foundation...'
            : phase === 'crash' ? 'no foundation. collapse.'
              : phase === 'cards' ? 'taller... fragile...'
                : 'how do you build?'}
      </span>

      {phase === 'stable' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          growth planning
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'stable' ? 'scalability' : 'build for the scale you want'}
      </div>
    </div>
  );
}
