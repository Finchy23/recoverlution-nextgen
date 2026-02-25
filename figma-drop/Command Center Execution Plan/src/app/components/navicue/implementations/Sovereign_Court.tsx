/**
 * SOVEREIGN #2 -- 1372. The Court (Internal Family)
 * "Your mind is a court of bickering advisors."
 * INTERACTION: Jester (Play), General (Work), Monk (Rest). They argue. You decide.
 * STEALTH KBE: Self-Leadership -- Internal Integration (B)
 *
 * COMPOSITOR: witness_ritual / Lattice / work / believing / tap / 1372
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

export default function Sovereign_Court({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1372,
        isSeal: false,
      }}
      arrivalText="Three voices. All shouting."
      prompt="Your mind is a court of bickering advisors. Listen to them all. But remember: You are the Monarch. You cast the vote."
      resonantText="Self-leadership. You listened to all three and made the call. Internal integration: the jester, the general, and the monk all serve the crown. None of them are the king. You are."
      afterglowCoda="You cast the vote."
      onComplete={onComplete}
    >
      {(verse) => <CourtInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

const ADVISORS = [
  { id: 'jester', label: 'the jester', role: 'play', arg: '"life is short. have fun."' },
  { id: 'general', label: 'the general', role: 'work', arg: '"discipline wins. grind now."' },
  { id: 'monk', label: 'the monk', role: 'rest', arg: '"stillness. you are depleted."' },
] as const;

function CourtInteraction({ verse }: { verse: any }) {
  const [listened, setListened] = useState<Set<string>>(new Set());
  const [decided, setDecided] = useState(false);

  const handleListen = (id: string) => {
    if (decided) return;
    setListened(prev => new Set(prev).add(id));
  };

  const allHeard = listened.size === ADVISORS.length;

  const handleDecide = () => {
    if (!allHeard || decided) return;
    setDecided(true);
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 160;
  const CX = W / 2;

  // Positions: three advisors in a semicircle, throne at bottom center
  const positions = [
    { x: 50, y: 45 },   // Jester (left)
    { x: CX, y: 30 },   // General (center top)
    { x: 190, y: 45 },  // Monk (right)
  ];
  const THRONE = { x: CX, y: 115 };

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>court</span>
        <motion.span style={{
          ...navicueType.data,
          color: decided ? verse.palette.accent
            : allHeard ? verse.palette.text : verse.palette.shadow,
        }}>
          {decided ? 'ordered'
            : allHeard ? 'all heard. decide.'
              : `${listened.size} / ${ADVISORS.length} heard`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Advisors */}
          {ADVISORS.map((adv, i) => {
            const pos = positions[i];
            const heard = listened.has(adv.id);
            return (
              <g key={adv.id}>
                {/* Advisor circle */}
                <motion.circle
                  cx={pos.x} cy={pos.y} r={16}
                  fill={heard ? verse.palette.accent : verse.palette.primary}
                  animate={{
                    opacity: safeOpacity(
                      decided ? 0.06 : heard ? 0.1 : 0.05
                    ),
                  }}
                  style={{ cursor: decided ? 'default' : 'pointer' }}
                  onClick={() => handleListen(adv.id)}
                />
                <motion.circle
                  cx={pos.x} cy={pos.y} r={16}
                  fill="none"
                  stroke={heard ? verse.palette.accent : verse.palette.primary}
                  strokeWidth={1}
                  animate={{
                    opacity: safeOpacity(heard ? 0.25 : 0.12),
                  }}
                  style={{ cursor: decided ? 'default' : 'pointer' }}
                  onClick={() => handleListen(adv.id)}
                />

                {/* Role label */}
                <text x={pos.x} y={pos.y + 3} textAnchor="middle"
                  fill={verse.palette.text} style={{ fontSize: '8px' }}
                  opacity={0.25} pointerEvents="none">
                  {adv.role}
                </text>

                {/* Name */}
                <text x={pos.x} y={pos.y + 28} textAnchor="middle"
                  fill={verse.palette.textFaint} style={{ fontSize: '7px' }}
                  opacity={0.2} pointerEvents="none">
                  {adv.label}
                </text>

                {/* Argument bubble (when heard) */}
                {heard && !decided && (
                  <motion.g
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <text x={pos.x} y={pos.y - 22} textAnchor="middle"
                      fill={verse.palette.accent} style={{ fontSize: '7px' }}
                      opacity={0.3}>
                      {adv.arg}
                    </text>
                  </motion.g>
                )}

                {/* Arguing lines (before heard, animated) */}
                {!heard && !decided && (
                  <motion.g
                    animate={{ opacity: [safeOpacity(0.06), safeOpacity(0.12), safeOpacity(0.06)] }}
                    transition={{ repeat: Infinity, duration: 0.5 + i * 0.2 }}
                  >
                    <line x1={pos.x + 16} y1={pos.y - 5}
                      x2={pos.x + 22} y2={pos.y - 8}
                      stroke={verse.palette.shadow} strokeWidth={0.8} />
                    <line x1={pos.x + 16} y1={pos.y}
                      x2={pos.x + 24} y2={pos.y}
                      stroke={verse.palette.shadow} strokeWidth={0.8} />
                  </motion.g>
                )}

                {/* Connection line to throne (when decided) */}
                {decided && (
                  <motion.line
                    x1={pos.x} y1={pos.y + 16}
                    x2={THRONE.x} y2={THRONE.y - 12}
                    stroke={verse.palette.accent}
                    strokeWidth={0.5}
                    strokeDasharray="4 3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: safeOpacity(0.12) }}
                    transition={{ delay: i * 0.15 }}
                  />
                )}
              </g>
            );
          })}

          {/* Throne (you, the king) */}
          <motion.g
            animate={{
              scale: decided ? 1.1 : 1,
            }}
            style={{ transformOrigin: `${THRONE.x}px ${THRONE.y}px` }}
          >
            {/* Crown shape */}
            <path
              d={`M ${THRONE.x - 10},${THRONE.y - 8} L ${THRONE.x - 8},${THRONE.y - 16} L ${THRONE.x - 3},${THRONE.y - 10} L ${THRONE.x},${THRONE.y - 18} L ${THRONE.x + 3},${THRONE.y - 10} L ${THRONE.x + 8},${THRONE.y - 16} L ${THRONE.x + 10},${THRONE.y - 8} Z`}
              fill={decided ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(decided ? 0.2 : 0.08)}
            />
            <circle cx={THRONE.x} cy={THRONE.y} r={10}
              fill={decided ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(decided ? 0.15 : 0.06)} />
            <circle cx={THRONE.x} cy={THRONE.y} r={10}
              fill="none"
              stroke={decided ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1}
              opacity={safeOpacity(decided ? 0.3 : 0.15)} />
            <text x={THRONE.x} y={THRONE.y + 3} textAnchor="middle"
              fill={decided ? verse.palette.accent : verse.palette.text}
              style={{ fontSize: '8px' }}
              opacity={decided ? 0.5 : 0.2}>
              you
            </text>
          </motion.g>

          {/* Decision text */}
          {decided && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              you are the monarch
            </motion.text>
          )}
        </svg>
      </div>

      {allHeard && !decided && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleDecide}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          cast the vote
        </motion.button>
      )}

      {!allHeard && !decided && (
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.4 }}>
          tap each advisor to listen
        </span>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {decided ? 'all heard. you decided. the court is ordered.'
          : allHeard ? 'all three have spoken. your turn.'
            : 'the advisors argue. listen to each one.'}
      </span>

      {decided && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          internal integration
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {decided ? 'self-leadership' : 'listen to them all'}
      </div>
    </div>
  );
}
