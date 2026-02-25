/**
 * SCOUT #2 -- 1272. The Breadcrumbs (Tracing)
 * "Where did you deviate from your values? Trace the breadcrumbs."
 * INTERACTION: Tap breadcrumbs backward to find the wrong turn
 * STEALTH KBE: Pattern Recognition -- Self-Correction (K)
 *
 * COMPOSITOR: poetic_precision / Arc / night / knowing / tap / 1272
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

const CRUMBS = [
  { id: 'now', label: 'lost', x: 230, y: 145, isWrong: false },
  { id: 'step4', label: 'drifted', x: 200, y: 120, isWrong: false },
  { id: 'step3', label: 'said yes', x: 165, y: 100, isWrong: true },
  { id: 'step2', label: 'aligned', x: 120, y: 85, isWrong: false },
  { id: 'step1', label: 'centered', x: 75, y: 70, isWrong: false },
  { id: 'start', label: 'start', x: 35, y: 55, isWrong: false },
];

export default function Scout_Breadcrumbs({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Arc',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1272,
        isSeal: false,
      }}
      arrivalText="Lost. Glowing dots behind you."
      prompt="If you are lost, look back. You have been leaving clues. Where did you deviate from your values? Trace the breadcrumbs."
      resonantText="Pattern recognition. You traced back and found the exact turn where you left your values behind. Self-correction is not starting over. It is finding the fork and choosing again."
      afterglowCoda="Trace the breadcrumbs."
      onComplete={onComplete}
    >
      {(verse) => <BreadcrumbsInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BreadcrumbsInteraction({ verse }: { verse: any }) {
  const [traced, setTraced] = useState<string[]>([]);
  const [found, setFound] = useState(false);
  const [done, setDone] = useState(false);

  const handleTrace = (id: string) => {
    if (found || traced.includes(id)) return;
    const crumb = CRUMBS.find(c => c.id === id);
    if (!crumb) return;

    const next = [...traced, id];
    setTraced(next);

    if (crumb.isWrong) {
      setFound(true);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const W = 270, H = 180;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Trace progress */}
      <motion.span
        style={{ ...navicueType.micro, color: verse.palette.textFaint }}
        animate={{ opacity: 0.4 }}
      >
        {done ? 'wrong turn found' : `tracing back... ${traced.length} checked`}
      </motion.span>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Maze-like background lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h-${i}`}
              x1={10} y1={20 + i * 20} x2={W - 10} y2={20 + i * 20}
              stroke={verse.palette.primary} strokeWidth={0.3}
              opacity={safeOpacity(0.04)} />
          ))}

          {/* Path connecting crumbs */}
          <path
            d={`M ${CRUMBS.map(c => `${c.x},${c.y}`).join(' L ')}`}
            fill="none"
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            strokeDasharray="3 4"
            opacity={safeOpacity(0.1)} />

          {/* Traced-back path highlight */}
          {traced.length > 0 && (
            <motion.path
              d={`M ${CRUMBS[0].x},${CRUMBS[0].y} ${CRUMBS.filter(c => traced.includes(c.id)).map(c => `L ${c.x},${c.y}`).join(' ')}`}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={1}
              strokeDasharray="4 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.3) }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Breadcrumb dots */}
          {CRUMBS.map((crumb, i) => {
            const isTraced = traced.includes(crumb.id);
            const isFound = found && crumb.isWrong;
            const isActive = !found && !isTraced;

            return (
              <motion.g key={crumb.id}
                style={{ cursor: isActive ? 'pointer' : 'default' }}
                onClick={() => handleTrace(crumb.id)}
              >
                {/* Glow ring for wrong turn */}
                {isFound && (
                  <motion.circle
                    cx={crumb.x} cy={crumb.y} r={18}
                    fill={verse.palette.accent}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: safeOpacity(0.12), scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Crumb dot */}
                <motion.circle
                  cx={crumb.x} cy={crumb.y}
                  r={isFound ? 7 : isTraced ? 5 : 4}
                  fill={
                    isFound ? verse.palette.accent
                      : isTraced ? verse.palette.accent
                        : verse.palette.primary
                  }
                  animate={{
                    opacity: safeOpacity(
                      isFound ? 0.5
                        : isTraced ? 0.25
                          : 0.12
                    ),
                  }}
                />

                {/* Pulse for untraced crumbs */}
                {isActive && (
                  <motion.circle
                    cx={crumb.x} cy={crumb.y} r={4}
                    fill="none" stroke={verse.palette.primary}
                    strokeWidth={0.5}
                    animate={{ r: [4, 10, 4], opacity: [0.2, 0, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  />
                )}

                {/* Label */}
                <motion.text
                  x={crumb.x} y={crumb.y + (i % 2 === 0 ? -12 : 18)}
                  textAnchor="middle"
                  fill={isFound ? verse.palette.accent : isTraced ? verse.palette.accent : verse.palette.textFaint}
                  style={navicueType.micro}
                  animate={{
                    opacity: isFound ? 0.7 : isTraced ? 0.4 : 0.25,
                  }}
                >
                  {crumb.label}
                </motion.text>

                {/* "Wrong turn" marker */}
                {isFound && (
                  <motion.text
                    x={crumb.x} y={crumb.y + (i % 2 === 0 ? 18 : -12)}
                    textAnchor="middle"
                    fill={verse.palette.accent}
                    style={{ ...navicueType.micro, fontStyle: 'italic' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 0.3 }}
                  >
                    wrong turn
                  </motion.text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'you found where you deviated'
          : 'tap each crumb backward to trace your path'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          self-correction
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'pattern recognition' : 'trace the breadcrumbs'}
      </div>
    </div>
  );
}
