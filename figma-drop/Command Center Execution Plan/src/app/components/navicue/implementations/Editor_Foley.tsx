/**
 * EDITOR #8 -- 1258. The Foley (Sound Effects)
 * "If you make the criticism sound ridiculous, it cannot bruise you."
 * INTERACTION: Tap to swap the sound effect from bone crack to squeaky toy
 * STEALTH KBE: Defusion -- Cognitive Defusion (E)
 *
 * COMPOSITOR: pattern_glitch / Pulse / social / embodying / tap / 1258
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

const SOUND_OPTIONS = [
  { id: 'crack', label: 'bone crack', waveform: [0.9, 0.7, 0.5, 0.8, 0.3, 0.1], impact: 'devastating', tone: 'shadow' as const },
  { id: 'squeak', label: 'squeaky toy', waveform: [0.3, 0.8, 0.2, 0.6, 0.9, 0.4], impact: 'harmless', tone: 'accent' as const },
  { id: 'pop', label: 'bubble pop', waveform: [0.1, 0.2, 0.9, 0.1, 0.05, 0.02], impact: 'nothing', tone: 'accent' as const },
];

export default function Editor_Foley({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'social',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1258,
        isSeal: false,
      }}
      arrivalText="A punch lands. Sound: bone crack."
      prompt="The impact is subjective. If you make the criticism sound ridiculous, it cannot bruise you. Change the foley."
      resonantText="Defusion. The criticism did not change. The sound effect did. And with it, the flinch disappeared. Cognitive defusion is making the threat absurd. When the monster squeaks, you stop running."
      afterglowCoda="Change the foley."
      onComplete={onComplete}
    >
      {(verse) => <FoleyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FoleyInteraction({ verse }: { verse: any }) {
  const [soundIndex, setSoundIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const handleSwap = () => {
    if (done || playing) return;
    setPlaying(true);

    setTimeout(() => {
      const next = soundIndex + 1;
      setSoundIndex(next);
      setPlaying(false);

      if (next >= SOUND_OPTIONS.length - 1) {
        setDone(true);
        setTimeout(() => verse.advance(), 3000);
      }
    }, 800);
  };

  const sound = SOUND_OPTIONS[soundIndex];
  const toneColor = sound.tone === 'shadow' ? verse.palette.shadow : verse.palette.accent;

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 120;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Sound name */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>
          foley:
        </span>
        <motion.span
          key={sound.id}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 0.7, x: 0 }}
          style={{ ...navicueType.choice, color: toneColor }}
        >
          {sound.label}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* The punch (same event) */}
          <motion.g>
            {/* Fist shape */}
            <motion.circle
              cx={80} cy={50} r={14}
              fill={verse.palette.primary}
              animate={{
                opacity: safeOpacity(0.1),
              }}
            />
            {/* Impact line */}
            <motion.line
              x1={95} y1={50} x2={130} y2={50}
              stroke={verse.palette.primary}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={safeOpacity(0.1)}
            />
            {/* Target */}
            <motion.circle
              cx={140} cy={50} r={10}
              fill="none"
              stroke={verse.palette.primary}
              strokeWidth={0.5}
              opacity={safeOpacity(0.15)}
            />

            {/* Impact starburst */}
            {playing && (
              <motion.g>
                {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                  <motion.line
                    key={angle}
                    x1={140} y1={50}
                    x2={140 + Math.cos(angle * Math.PI / 180) * 20}
                    y2={50 + Math.sin(angle * Math.PI / 180) * 20}
                    stroke={toneColor}
                    strokeWidth={1}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                ))}
              </motion.g>
            )}

            {/* Label: "criticism" */}
            <text x={110} y={80} textAnchor="middle"
              fill={verse.palette.textFaint} style={navicueType.micro}
              opacity={0.3}>
              criticism
            </text>
          </motion.g>

          {/* Waveform visualization */}
          <motion.g>
            {sound.waveform.map((level, i) => {
              const x = 170 + i * 14;
              const h = level * 40;
              return (
                <motion.rect
                  key={i}
                  x={x}
                  width={8} rx={2}
                  fill={toneColor}
                  animate={{
                    y: 50 - h / 2,
                    height: h,
                    opacity: safeOpacity(0.12 + level * 0.15),
                  }}
                  transition={{
                    duration: 0.3,
                    delay: playing ? i * 0.05 : 0,
                  }}
                />
              );
            })}
          </motion.g>

          {/* Impact text */}
          <AnimatePresence mode="wait">
            <motion.text
              key={sound.id}
              x={SCENE_W / 2} y={SCENE_H - 10}
              textAnchor="middle"
              fill={toneColor}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
            >
              impact: {sound.impact}
            </motion.text>
          </AnimatePresence>
        </svg>
      </div>

      {/* Swap button */}
      {!done && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleSwap}
        >
          change sound effect
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the criticism squeaked. you did not flinch.'
          : playing
            ? 'playing...'
            : 'the same punch. different sound.'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          cognitive defusion
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'defusion' : 'change the foley'}
      </div>
    </div>
  );
}
