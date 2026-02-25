/**
 * HISTORIAN #7 -- 1387. The Golden Age (Nostalgia)
 * "Nostalgia is a liar. The Golden Age is a myth."
 * INTERACTION: "The past was better." Zoom in. Plague. War. Accept the present.
 * STEALTH KBE: Gratitude -- Reality Acceptance (K)
 *
 * COMPOSITOR: science_x_soul / Arc / morning / knowing / tap / 1387
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

export default function Historian_GoldenAge({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1387,
        isSeal: false,
      }}
      arrivalText='"The past was better."'
      prompt="Nostalgia is a liar. The Golden Age is a myth. You are living in the miracle. Do not trade the present for a fantasy."
      resonantText="Gratitude. You zoomed in and saw the truth and accepted the present. Reality acceptance: every era had its plague, its war, its suffering. The miracle is now. Nostalgia edits the pain."
      afterglowCoda="The miracle is now."
      onComplete={onComplete}
    >
      {(verse) => <GoldenAgeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function GoldenAgeInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'nostalgia' | 'zooming' | 'truth' | 'accepted'>('nostalgia');

  const handleZoom = () => {
    if (phase !== 'nostalgia') return;
    setPhase('zooming');
    setTimeout(() => setPhase('truth'), 1200);
  };

  const handleAccept = () => {
    if (phase !== 'truth') return;
    setPhase('accepted');
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 230, H = 155;
  const CX = W / 2;

  const zoomed = phase === 'truth' || phase === 'accepted';

  // Past scene (left), Present scene (right)
  const PAST_X = 55, PRESENT_X = 175, SCENE_Y = 40;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>lens</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'accepted' ? verse.palette.accent
            : zoomed ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'accepted' ? 'present (miracle)'
            : zoomed ? 'the truth'
              : phase === 'zooming' ? 'zooming in...'
                : 'nostalgia'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Past scene (left) */}
          <g>
            <rect x={PAST_X - 40} y={SCENE_Y} width={80} height={65} rx={4}
              fill={verse.palette.primary}
              opacity={safeOpacity(phase === 'accepted' ? 0.02 : 0.04)} />
            <rect x={PAST_X - 40} y={SCENE_Y} width={80} height={65} rx={4}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={0.5} opacity={safeOpacity(0.08)} />

            {/* Golden glow (nostalgia filter) */}
            {!zoomed && (
              <motion.rect
                x={PAST_X - 40} y={SCENE_Y} width={80} height={65} rx={4}
                fill={verse.palette.accent}
                animate={{ opacity: safeOpacity(phase === 'zooming' ? 0.01 : 0.04) }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Idealized: columns, sun */}
            {!zoomed && (
              <g opacity={0.12}>
                <rect x={PAST_X - 15} y={SCENE_Y + 20} width={6} height={30} rx={1}
                  fill={verse.palette.primary} />
                <rect x={PAST_X + 9} y={SCENE_Y + 20} width={6} height={30} rx={1}
                  fill={verse.palette.primary} />
                <circle cx={PAST_X} cy={SCENE_Y + 12} r={6}
                  fill={verse.palette.accent} opacity={0.3} />
              </g>
            )}

            {/* Truth: plague, war, hardship */}
            {zoomed && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Broken structures */}
                <line x1={PAST_X - 15} y1={SCENE_Y + 20}
                  x2={PAST_X - 12} y2={SCENE_Y + 45}
                  stroke={verse.palette.shadow} strokeWidth={2}
                  opacity={safeOpacity(0.1)} />
                <line x1={PAST_X + 12} y1={SCENE_Y + 25}
                  x2={PAST_X + 15} y2={SCENE_Y + 48}
                  stroke={verse.palette.shadow} strokeWidth={2}
                  opacity={safeOpacity(0.1)} />

                {/* Labels */}
                <text x={PAST_X - 20} y={SCENE_Y + 58}
                  fill={verse.palette.shadow} style={{ fontSize: '6px' }} opacity={0.25}>
                  plague
                </text>
                <text x={PAST_X + 8} y={SCENE_Y + 58}
                  fill={verse.palette.shadow} style={{ fontSize: '6px' }} opacity={0.25}>
                  war
                </text>
                <text x={PAST_X} y={SCENE_Y + 15} textAnchor="middle"
                  fill={verse.palette.shadow} style={{ fontSize: '7px' }} opacity={0.2}>
                  hard
                </text>
              </motion.g>
            )}

            <text x={PAST_X} y={SCENE_Y - 5} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }}
              opacity={zoomed ? 0.3 : 0.2}>
              the past
            </text>
          </g>

          {/* Arrow between */}
          <text x={CX} y={SCENE_Y + 35} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '9px' }} opacity={0.1}>
            vs
          </text>

          {/* Present scene (right) */}
          <g>
            <rect x={PRESENT_X - 40} y={SCENE_Y} width={80} height={65} rx={4}
              fill={phase === 'accepted' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'accepted' ? 0.06 : 0.04)} />
            <rect x={PRESENT_X - 40} y={SCENE_Y} width={80} height={65} rx={4}
              fill="none"
              stroke={phase === 'accepted' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={phase === 'accepted' ? 1 : 0.5}
              opacity={safeOpacity(phase === 'accepted' ? 0.25 : 0.08)} />

            {/* Present details */}
            <circle cx={PRESENT_X} cy={SCENE_Y + 25} r={8}
              fill={phase === 'accepted' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'accepted' ? 0.15 : 0.06)} />
            <line x1={PRESENT_X} y1={SCENE_Y + 33}
              x2={PRESENT_X} y2={SCENE_Y + 48}
              stroke={phase === 'accepted' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1.5}
              opacity={safeOpacity(phase === 'accepted' ? 0.2 : 0.08)} />

            <text x={PRESENT_X} y={SCENE_Y - 5} textAnchor="middle"
              fill={phase === 'accepted' ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '8px' }}
              opacity={phase === 'accepted' ? 0.5 : 0.2}>
              now
            </text>

            {phase === 'accepted' && (
              <motion.text x={PRESENT_X} y={SCENE_Y + 58} textAnchor="middle"
                fill={verse.palette.accent} style={{ fontSize: '7px' }}
                initial={{ opacity: 0 }} animate={{ opacity: 0.35 }}>
                the miracle
              </motion.text>
            )}
          </g>

          {/* Magnifying glass (zoom indicator) */}
          {phase === 'zooming' && (
            <motion.g
              initial={{ x: CX - 30, y: SCENE_Y + 30 }}
              animate={{ x: PAST_X - 5, y: SCENE_Y + 30 }}
              transition={{ duration: 0.8 }}
            >
              <circle cx={0} cy={0} r={14}
                fill="none" stroke={verse.palette.text}
                strokeWidth={1} opacity={0.2} />
              <line x1={10} y1={10} x2={18} y2={18}
                stroke={verse.palette.text} strokeWidth={1.5}
                opacity={0.15} />
            </motion.g>
          )}

          {/* Result */}
          {phase === 'accepted' && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              nostalgia edits the pain. the miracle is now.
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'nostalgia' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleZoom}>
          zoom in on the past
        </motion.button>
      )}

      {phase === 'truth' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleAccept}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          accept the present
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'accepted' ? 'every era had its plague. the miracle is now.'
          : zoomed ? 'plague. war. hardship. the golden age is a myth.'
            : phase === 'zooming' ? 'zooming in...'
              : '"the past was better." was it?'}
      </span>

      {phase === 'accepted' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          reality acceptance
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'accepted' ? 'gratitude' : 'do not trade the present'}
      </div>
    </div>
  );
}
