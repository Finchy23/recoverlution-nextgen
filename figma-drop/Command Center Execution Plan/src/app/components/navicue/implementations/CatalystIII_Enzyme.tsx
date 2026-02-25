/**
 * CATALYST III #9 -- 1229. The Enzyme (Speed)
 * "The mentor lowers the cost of the reaction."
 * INTERACTION: Tap to select a catalyst (Mentor/Book) -- reaction accelerates
 * STEALTH KBE: Accelerated Learning -- Humility (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / morning / knowing / tap / 1229
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

const CATALYSTS = [
  { label: 'mentor', speed: 100 },
  { label: 'book', speed: 50 },
  { label: 'experience', speed: 10 },
];

export default function CatalystIII_Enzyme({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1229,
        isSeal: false,
      }}
      arrivalText="A slow reaction. 100 years."
      prompt="You can learn it the hard way. Or you can use a catalyst. The mentor lowers the cost of the reaction."
      resonantText="Accelerated learning. The reaction was always possible. The enzyme did not change the destination. It lowered the barrier. Humility is choosing the shortcut that others have already cleared."
      afterglowCoda="Lower the barrier."
      onComplete={onComplete}
    >
      {(verse) => <EnzymeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EnzymeInteraction({ verse }: { verse: any }) {
  const [reactionTime, setReactionTime] = useState(100); // years
  const [selectedCatalyst, setSelectedCatalyst] = useState(-1);
  const [accelerating, setAccelerating] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);

  // Slow tick without catalyst
  useEffect(() => {
    if (accelerating || done) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.001;
        return Math.min(next, 0.05); // Barely moves
      });
    }, 100);
    return () => clearInterval(interval);
  }, [accelerating, done]);

  // Accelerated reaction after catalyst selection
  useEffect(() => {
    if (!accelerating) return;
    const speed = selectedCatalyst >= 0 ? CATALYSTS[selectedCatalyst].speed : 1;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + speed * 0.005;
        if (next >= 1) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => verse.advance(), 2500);
          return 1;
        }
        return next;
      });
      setReactionTime(prev => Math.max(0, prev - speed * 0.5));
    }, 30);
    return () => clearInterval(interval);
  }, [accelerating, selectedCatalyst, verse]);

  const handleSelect = (idx: number) => {
    if (accelerating) return;
    setSelectedCatalyst(idx);
  };

  const handleActivate = () => {
    if (selectedCatalyst < 0 || accelerating) return;
    setAccelerating(true);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 240;
  const SCENE_H = 80;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Reaction progress bar */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Progress track */}
          <rect x={15} y={30} width={SCENE_W - 30} height={6} rx={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.08)} />

          {/* Progress fill */}
          <motion.rect
            x={15} y={30}
            height={6} rx={3}
            fill={verse.palette.accent}
            animate={{
              width: progress * (SCENE_W - 30),
              opacity: safeOpacity(0.4),
            }}
          />

          {/* Start label */}
          <text x={15} y={55} textAnchor="start"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            start
          </text>

          {/* End label */}
          <text x={SCENE_W - 15} y={55} textAnchor="end"
            fill={verse.palette.accent} style={navicueType.micro}>
            complete
          </text>

          {/* Time remaining */}
          <text x={SCENE_W / 2} y={20} textAnchor="middle"
            fill={done ? verse.palette.accent : verse.palette.text}
            style={navicueType.data}>
            {done
              ? 'complete'
              : reactionTime > 1
                ? `${Math.round(reactionTime)} years`
                : `${Math.round(reactionTime * 365)} days`}
          </text>

          {/* Speed particles when accelerating */}
          {accelerating && !done && Array.from({ length: 4 }).map((_, i) => (
            <motion.circle
              key={i}
              cy={33} r={1.5}
              fill={verse.palette.accent}
              animate={{
                cx: [15, 15 + progress * (SCENE_W - 30)],
                opacity: [0, safeOpacity(0.3), 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.4,
                delay: i * 0.1,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Catalyst selection */}
      {!accelerating && (
        <div style={{
          display: 'flex', gap: 8, flexDirection: 'column',
          alignItems: 'center', width: '100%', maxWidth: 220,
        }}>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
            choose a catalyst
          </span>
          {CATALYSTS.map((cat, i) => {
            const isSelected = selectedCatalyst === i;
            return (
              <motion.button
                key={cat.label}
                onClick={() => handleSelect(i)}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...immersiveTapButton(verse.palette, isSelected ? 'accent' : 'faint').base,
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  opacity: isSelected ? 0.9 : 0.5,
                }}
              >
                <span>{cat.label}</span>
                <span style={{ ...navicueType.data, color: verse.palette.textFaint }}>
                  {cat.speed}x
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Activate button */}
      {selectedCatalyst >= 0 && !accelerating && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...btn.base, marginTop: 4 }}
          whileTap={btn.active}
          onClick={handleActivate}
        >
          add {CATALYSTS[selectedCatalyst].label}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'reaction complete'
          : accelerating
            ? 'accelerating...'
            : 'at this rate, 100 years'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          humility
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'accelerated learning' : 'lower the barrier'}
      </div>
    </div>
  );
}
