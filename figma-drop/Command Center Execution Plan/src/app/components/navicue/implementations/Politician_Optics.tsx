/**
 * POLITICIAN #2 -- 1352. The Optics (The Frame)
 * "The event is a fact. The story is a choice."
 * INTERACTION: Image of "Failing." Crop it -> "Trying." Change filter -> "Heroic."
 * STEALTH KBE: Framing -- Narrative Control (B)
 *
 * COMPOSITOR: pattern_glitch / Drift / night / believing / tap / 1352
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

export default function Politician_Optics({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Drift',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1352,
        isSeal: false,
      }}
      arrivalText="A picture of you. Failing."
      prompt="The event is a fact. The story is a choice. Frame the narrative before they do. Control the angle."
      resonantText="Framing. You changed the crop and the filter and the same image told a different story. Narrative control: the event never changes, but the frame around it determines what people see."
      afterglowCoda="Control the angle."
      onComplete={onComplete}
    >
      {(verse) => <OpticsInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OpticsInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'failing' | 'cropped' | 'filtered' | 'heroic'>('failing');

  const handleCrop = () => {
    if (phase !== 'failing') return;
    setPhase('cropped');
  };

  const handleFilter = () => {
    if (phase !== 'cropped') return;
    setPhase('filtered');
    setTimeout(() => {
      setPhase('heroic');
      setTimeout(() => verse.advance(), 3000);
    }, 1200);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  // Image frame dimensions (crops down)
  const fullW = 140, fullH = 100;
  const croppedW = 80, croppedH = 70;
  const isWide = phase === 'failing';
  const isCropped = phase !== 'failing';
  const isFiltered = phase === 'filtered' || phase === 'heroic';

  const frameW = isCropped ? croppedW : fullW;
  const frameH = isCropped ? croppedH : fullH;
  const frameX = CX - frameW / 2;
  const frameY = 20;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>narrative</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'heroic' ? verse.palette.accent
            : phase === 'filtered' ? verse.palette.text
              : verse.palette.shadow,
        }}>
          {phase === 'heroic' ? 'heroic'
            : phase === 'filtered' ? 'reframing...'
              : phase === 'cropped' ? 'trying'
                : 'failing'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Photo frame */}
          <motion.rect
            rx={3}
            fill={isFiltered ? verse.palette.accent : verse.palette.primary}
            stroke={isFiltered ? verse.palette.accent : verse.palette.primary}
            strokeWidth={1}
            animate={{
              x: frameX,
              y: frameY,
              width: frameW,
              height: frameH,
              opacity: safeOpacity(isFiltered ? 0.08 : 0.04),
            }}
            transition={{ duration: 0.5 }}
          />
          <motion.rect
            rx={3}
            fill="none"
            stroke={isFiltered ? verse.palette.accent : verse.palette.primary}
            strokeWidth={isFiltered ? 1.5 : 0.8}
            animate={{
              x: frameX,
              y: frameY,
              width: frameW,
              height: frameH,
              opacity: safeOpacity(isFiltered ? 0.3 : 0.15),
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Scene inside frame */}
          {/* Person figure (always visible) */}
          <motion.g
            animate={{
              x: isCropped ? 5 : 0,
              y: isCropped ? -5 : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            {/* Head */}
            <circle cx={CX} cy={frameY + 22} r={7}
              fill={isFiltered ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(isFiltered ? 0.2 : 0.1)} />
            {/* Body */}
            <line x1={CX} y1={frameY + 29} x2={CX} y2={frameY + 50}
              stroke={isFiltered ? verse.palette.accent : verse.palette.primary}
              strokeWidth={2} opacity={safeOpacity(isFiltered ? 0.2 : 0.1)} />
            {/* Arms reaching up */}
            <line x1={CX} y1={frameY + 35} x2={CX - 15} y2={frameY + 25}
              stroke={isFiltered ? verse.palette.accent : verse.palette.primary}
              strokeWidth={2} strokeLinecap="round"
              opacity={safeOpacity(isFiltered ? 0.2 : 0.1)} />
            <line x1={CX} y1={frameY + 35} x2={CX + 15} y2={frameY + 25}
              stroke={isFiltered ? verse.palette.accent : verse.palette.primary}
              strokeWidth={2} strokeLinecap="round"
              opacity={safeOpacity(isFiltered ? 0.2 : 0.1)} />
          </motion.g>

          {/* Context that gets cropped out (only visible in "failing" view) */}
          {phase === 'failing' && (
            <g>
              {/* Fallen objects / mess */}
              <rect x={CX - 55} y={frameY + 60} width={12} height={8} rx={1}
                fill={verse.palette.shadow} opacity={safeOpacity(0.08)}
                transform={`rotate(-20 ${CX - 55} ${frameY + 60})`} />
              <rect x={CX + 45} y={frameY + 55} width={10} height={6} rx={1}
                fill={verse.palette.shadow} opacity={safeOpacity(0.08)}
                transform={`rotate(15 ${CX + 45} ${frameY + 55})`} />
              <circle cx={CX - 35} cy={frameY + 70} r={4}
                fill={verse.palette.shadow} opacity={safeOpacity(0.06)} />
              <circle cx={CX + 30} cy={frameY + 75} r={3}
                fill={verse.palette.shadow} opacity={safeOpacity(0.06)} />
              {/* Ground mess line */}
              <line x1={CX - 60} y1={frameY + 80} x2={CX + 60} y2={frameY + 80}
                stroke={verse.palette.shadow} strokeWidth={0.5}
                strokeDasharray="3 3" opacity={safeOpacity(0.08)} />
            </g>
          )}

          {/* Crop marks (during crop phase) */}
          {phase === 'cropped' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            >
              {/* Corner marks */}
              {[
                [frameX, frameY], [frameX + croppedW, frameY],
                [frameX, frameY + croppedH], [frameX + croppedW, frameY + croppedH],
              ].map(([cx, cy], i) => (
                <g key={i}>
                  <line x1={cx as number - (i % 2 === 0 ? 6 : -6)} y1={cy as number}
                    x2={cx as number} y2={cy as number}
                    stroke={verse.palette.accent} strokeWidth={1.5} />
                  <line x1={cx as number} y1={cy as number - (i < 2 ? 6 : -6)}
                    x2={cx as number} y2={cy as number}
                    stroke={verse.palette.accent} strokeWidth={1.5} />
                </g>
              ))}
            </motion.g>
          )}

          {/* Filter glow (heroic) */}
          {phase === 'heroic' && (
            <motion.rect
              x={frameX} y={frameY} width={frameW} height={frameH} rx={3}
              fill={verse.palette.accent}
              initial={{ opacity: 0.15 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Caption */}
          <motion.text
            x={CX} y={frameY + (isCropped ? croppedH : fullH) + 18}
            textAnchor="middle"
            fill={phase === 'heroic' ? verse.palette.accent : verse.palette.text}
            style={{ fontSize: '9px' }}
            animate={{
              opacity: phase === 'heroic' ? 0.5 : 0.25,
            }}
          >
            {phase === 'heroic' ? '"never gave up"'
              : phase === 'filtered' || phase === 'cropped' ? '"trying hard"'
                : '"total failure"'}
          </motion.text>

          {/* Same event, different story */}
          {phase === 'heroic' && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              same event. different story.
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'failing' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleCrop}>
          crop
        </motion.button>
      )}

      {phase === 'cropped' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleFilter}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          change filter
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'heroic' ? 'the event is a fact. the story is a choice.'
          : phase === 'filtered' ? 'reframing...'
            : phase === 'cropped' ? 'context removed. now it looks like trying.'
              : 'a picture of you. surrounded by failure.'}
      </span>

      {phase === 'heroic' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          narrative control
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'heroic' ? 'framing' : 'control the angle'}
      </div>
    </div>
  );
}
