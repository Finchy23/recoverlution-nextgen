/**
 * POLITICIAN #8 -- 1358. The Fall Guy (Responsibility)
 * "If you take the blame, you keep the power."
 * INTERACTION: Scandal. Blame the intern (weak) or take blame (strong). Respect rises.
 * STEALTH KBE: Accountability -- Extreme Ownership (B)
 *
 * COMPOSITOR: koan_paradox / Arc / night / believing / tap / 1358
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

export default function Politician_FallGuy({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1358,
        isSeal: false,
      }}
      arrivalText="A scandal. Your watch."
      prompt="The buck stops here. If you take the blame, you keep the power. If you pass the blame, you pass the crown."
      resonantText="Accountability. You took the blame and your respect rose. Extreme ownership: the paradox of blame is that the person who accepts it gains the power, because they prove they are in control."
      afterglowCoda="The buck stops here."
      onComplete={onComplete}
    >
      {(verse) => <FallGuyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FallGuyInteraction({ verse }: { verse: any }) {
  const [choice, setChoice] = useState<null | 'blame' | 'own'>(null);
  const [done, setDone] = useState(false);

  const handleChoice = (c: 'blame' | 'own') => {
    if (choice) return;
    setChoice(c);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 150;
  const CX = W / 2;

  // Respect meter
  const METER_X = W - 35, METER_Y = 20, METER_H = 100;
  const respectFill = !done ? 0.3
    : choice === 'own' ? 0.9 : 0.1;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>respect</span>
        <motion.span style={{
          ...navicueType.data,
          color: done && choice === 'own' ? verse.palette.accent
            : done ? verse.palette.shadow : verse.palette.text,
        }}>
          {done ? (choice === 'own' ? 'rising' : 'falling') : 'at risk'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Scandal cloud */}
          <ellipse cx={CX - 20} cy={25} rx={50} ry={15}
            fill={verse.palette.shadow}
            opacity={safeOpacity(done && choice === 'own' ? 0.02 : 0.05)} />
          <text x={CX - 20} y={28} textAnchor="middle"
            fill={verse.palette.shadow} style={{ fontSize: '8px' }}
            opacity={done && choice === 'own' ? 0.1 : 0.25}>
            scandal
          </text>

          {/* You (center figure) */}
          <g>
            <circle cx={CX - 20} cy={CY_POS(H)} r={14}
              fill={done && choice === 'own' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(done && choice === 'own' ? 0.15 : 0.08)} />
            <circle cx={CX - 20} cy={CY_POS(H)} r={14}
              fill="none"
              stroke={done && choice === 'own' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1}
              opacity={safeOpacity(0.2)} />
            <text x={CX - 20} y={CY_POS(H) + 3} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '9px' }} opacity={0.25}>
              you
            </text>
          </g>

          {/* Intern (smaller, to the side) */}
          <motion.g
            animate={{
              opacity: done && choice === 'blame' ? 0.3 : 1,
            }}
          >
            <circle cx={CX - 70} cy={CY_POS(H) + 15} r={9}
              fill={done && choice === 'blame' ? verse.palette.shadow : verse.palette.primary}
              opacity={safeOpacity(0.06)} />
            <text x={CX - 70} y={CY_POS(H) + 18} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              intern
            </text>
          </motion.g>

          {/* Blame arrow (if blame chosen) */}
          {done && choice === 'blame' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              <line x1={CX - 34} y1={CY_POS(H) + 5}
                x2={CX - 61} y2={CY_POS(H) + 12}
                stroke={verse.palette.shadow} strokeWidth={1}
                markerEnd="url(#arrow)" />
              <text x={CX - 50} y={CY_POS(H) - 5} textAnchor="middle"
                fill={verse.palette.shadow} style={{ fontSize: '7px' }}>
                blame passed
              </text>
            </motion.g>
          )}

          {/* Own it indicator */}
          {done && choice === 'own' && (
            <motion.g
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Spotlight on you */}
              <circle cx={CX - 20} cy={CY_POS(H)}
                r={25} fill={verse.palette.accent}
                opacity={safeOpacity(0.04)} />
              <text x={CX - 20} y={CY_POS(H) + 30} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '8px' }}
                opacity={0.4}>
                "my responsibility"
              </text>
            </motion.g>
          )}

          {/* Respect meter */}
          <g>
            <rect x={METER_X} y={METER_Y} width={12} height={METER_H} rx={3}
              fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
            <rect x={METER_X} y={METER_Y} width={12} height={METER_H} rx={3}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.5} opacity={safeOpacity(0.1)} />

            <motion.rect
              x={METER_X} width={12} rx={3}
              fill={done && choice === 'own' ? verse.palette.accent : verse.palette.primary}
              animate={{
                y: METER_Y + METER_H * (1 - respectFill),
                height: METER_H * respectFill,
                opacity: safeOpacity(
                  done && choice === 'own' ? 0.25
                    : done ? 0.06 : 0.1
                ),
              }}
              transition={{ duration: 0.8 }}
            />

            <text x={METER_X + 6} y={METER_Y - 5} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '6px' }} opacity={0.2}>
              respect
            </text>
          </g>

          {/* Arrow marker def */}
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <path d="M 0,0 L 6,2 L 0,4" fill={verse.palette.shadow} opacity={0.3} />
            </marker>
          </defs>
        </svg>
      </div>

      {!choice && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            style={{ ...btn.base, opacity: 0.5, padding: '8px 12px' }}
            whileTap={btn.active}
            onClick={() => handleChoice('blame')}
          >
            blame the intern
          </motion.button>
          <motion.button
            style={{ ...btn.base, padding: '8px 12px' }}
            whileTap={btn.active}
            onClick={() => handleChoice('own')}
          >
            take the blame
          </motion.button>
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? (choice === 'own'
          ? 'you took the blame. you kept the power.'
          : 'you passed the blame. you passed the crown.')
          : 'a scandal. who takes the fall?'}
      </span>

      {done && choice === 'own' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          extreme ownership
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done && choice === 'own' ? 'accountability' : 'the buck stops here'}
      </div>
    </div>
  );
}

// Helper to position the center figure
function CY_POS(h: number) { return h / 2 + 10; }
