/**
 * EDITOR #2 -- 1252. The Soundtrack Swap
 * "Tragedy or Comedy? It depends on the soundtrack."
 * INTERACTION: Tap to swap genre from Horror to Comedy -- same scene, different feeling
 * STEALTH KBE: Reframing -- Resilience (B)
 *
 * COMPOSITOR: koan_paradox / Pulse / social / believing / tap / 1252
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

const GENRES = [
  { id: 'horror', label: 'horror', eq: [0.9, 0.7, 0.3, 0.2, 0.1, 0.05, 0.8, 0.6], color: 'shadow' as const },
  { id: 'drama', label: 'drama', eq: [0.4, 0.6, 0.8, 0.5, 0.3, 0.6, 0.4, 0.3], color: 'primary' as const },
  { id: 'comedy', label: 'comedy', eq: [0.2, 0.5, 0.8, 1, 0.9, 0.7, 0.5, 0.3], color: 'accent' as const },
];

export default function Editor_SoundtrackSwap({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1252,
        isSeal: false,
      }}
      arrivalText="Scene: Failure. Genre: Horror."
      prompt="The event is the same. The genre is up to you. Tragedy or Comedy? It depends on the soundtrack. Change the music."
      resonantText="Reframing. The failure did not change. The soundtrack did. And with it, the meaning. Resilience is not changing what happened. It is changing the genre."
      afterglowCoda="Change the music."
      onComplete={onComplete}
    >
      {(verse) => <SoundtrackSwapInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SoundtrackSwapInteraction({ verse }: { verse: any }) {
  const [genreIndex, setGenreIndex] = useState(0);
  const [done, setDone] = useState(false);

  const handleSwap = () => {
    if (done) return;
    const next = genreIndex + 1;
    setGenreIndex(next);
    if (next >= GENRES.length - 1) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const genre = GENRES[genreIndex];
  const paletteColor = genre.color === 'shadow'
    ? verse.palette.shadow
    : genre.color === 'accent'
      ? verse.palette.accent
      : verse.palette.primary;

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 120;

  const sceneLabels = [
    '"I failed the presentation"',
    '"I failed the presentation"',
    '"I failed the presentation"',
  ];

  const reactionLabels = [
    'terrifying',
    'disappointing',
    'hilarious',
  ];

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Genre selector */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {GENRES.map((g, i) => (
          <motion.span
            key={g.id}
            style={{
              ...navicueType.micro,
              color: i === genreIndex
                ? (g.color === 'shadow' ? verse.palette.shadow : g.color === 'accent' ? verse.palette.accent : verse.palette.text)
                : verse.palette.textFaint,
              borderBottom: i === genreIndex ? '1px solid currentColor' : 'none',
              paddingBottom: 2,
            }}
            animate={{ opacity: i <= genreIndex ? 0.7 : 0.2 }}
          >
            {g.label}
          </motion.span>
        ))}
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* The scene (same footage, always the same) */}
          <rect x={20} y={15} width={SCENE_W - 40} height={55} rx={4}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <rect x={20} y={15} width={SCENE_W - 40} height={55} rx={4}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.1)} />

          {/* Scene content (stick figure at podium) */}
          <circle cx={130} cy={30} r={5}
            fill={verse.palette.primary} opacity={safeOpacity(0.15)} />
          <line x1={130} y1={35} x2={130} y2={50}
            stroke={verse.palette.primary} strokeWidth={1} opacity={safeOpacity(0.12)} />
          <line x1={125} y1={42} x2={135} y2={42}
            stroke={verse.palette.primary} strokeWidth={1} opacity={safeOpacity(0.12)} />
          {/* Podium */}
          <rect x={120} y={50} width={20} height={15} rx={2}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />

          {/* Same text label */}
          <text x={130} y={55} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro} opacity={0.3}>
          </text>

          {/* Equalizer bars (soundtrack visualization) */}
          <motion.g>
            {genre.eq.map((level, i) => (
              <motion.rect
                key={i}
                x={35 + i * 25}
                width={12}
                rx={2}
                fill={paletteColor}
                animate={{
                  y: 100 - level * 20,
                  height: level * 20,
                  opacity: safeOpacity(0.15 + level * 0.15),
                }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
              />
            ))}
          </motion.g>

          {/* Waveform line */}
          <motion.path
            d={`M 30,95 ${genre.eq.map((l, i) => `Q ${35 + i * 25 + 6},${95 - l * 8} ${35 + (i + 0.5) * 25},95`).join(' ')}`}
            fill="none"
            stroke={paletteColor}
            strokeWidth={0.5}
            animate={{ opacity: safeOpacity(0.2) }}
          />
        </svg>
      </div>

      {/* Scene description (same event, different reaction) */}
      <div style={{ textAlign: 'center' }}>
        <span style={{ ...navicueType.choice, color: verse.palette.textFaint, opacity: 0.5 }}>
          {sceneLabels[genreIndex]}
        </span>
        <br />
        <motion.span
          key={genreIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.6, y: 0 }}
          style={{
            ...navicueType.micro,
            color: paletteColor,
          }}
        >
          {reactionLabels[genreIndex]}
        </motion.span>
      </div>

      {/* Swap button */}
      {!done && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleSwap}
        >
          change soundtrack
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'same scene. different genre.'
          : 'the event is the same. the music changes everything.'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          resilience
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'reframing' : 'swap the genre'}
      </div>
    </div>
  );
}
