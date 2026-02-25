/**
 * RESONATOR #7 -- 1027. The Volume Knob (Dynamics)
 * "Drop the volume to increase the gravity."
 * INTERACTION: Tap to choose whisper over shout -- power through restraint
 * STEALTH KBE: Status Regulation -- high status behavior (K)
 *
 * COMPOSITOR: sacred_ordinary / Ocean / social / knowing / tap / 1027
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_VolumeKnob({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Ocean',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1027,
        isSeal: false,
      }}
      arrivalText="A shout echoes."
      prompt="The loudest person in the room is the most scared. The quietest person is the most dangerous. Drop the volume to increase the gravity."
      resonantText="Vocal prosody and status. Research shows that lower volume, slower pace, and longer pauses are universally perceived as higher status. Volume is fear. Silence is power."
      afterglowCoda="Power is not volume."
      onComplete={onComplete}
    >
      {(verse) => <VolumeKnobInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function VolumeKnobInteraction({ verse }: { verse: any }) {
  const [choice, setChoice] = useState<'shout' | 'whisper' | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0.9); // starts loud

  const handleChoice = (c: 'shout' | 'whisper') => {
    setChoice(c);
    if (c === 'whisper') {
      // Animate volume down
      let v = 0.9;
      const interval = setInterval(() => {
        v -= 0.05;
        if (v <= 0.1) {
          v = 0.1;
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2000);
        }
        setVolumeLevel(v);
      }, 80);
    } else {
      // Shout -- volume stays high briefly, then fades
      setTimeout(() => {
        setVolumeLevel(0.2);
        setTimeout(() => verse.advance(), 2500);
      }, 1500);
    }
  };

  // Volume bar visualization
  const barCount = 12;
  const activeBars = Math.ceil(volumeLevel * barCount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Volume meter */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 60 }}>
        {Array.from({ length: barCount }, (_, i) => {
          const height = 12 + i * 4;
          const active = i < activeBars;
          return (
            <motion.div
              key={i}
              animate={{ opacity: active ? 0.15 + (i / barCount) * 0.15 : 0.06 }}
              style={{
                width: 12, height,
                borderRadius: 2,
                background: active ? verse.palette.accent : verse.palette.primaryFaint,
              }}
            />
          );
        })}
      </div>

      {/* Volume level text */}
      <div style={{
        ...navicueType.hint, color: verse.palette.textFaint,
        letterSpacing: volumeLevel < 0.3 ? '0.08em' : '0.02em',
        fontSize: volumeLevel < 0.3 ? 11 : 13 + volumeLevel * 4,
        transition: 'all 0.3s ease',
      }}>
        {volumeLevel > 0.7 ? 'LOUD' : volumeLevel > 0.3 ? 'moderate' : 'quiet'}
      </div>

      {/* Choice buttons */}
      <AnimatePresence>
        {!choice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: 32, alignItems: 'center' }}
          >
            <motion.button
              onClick={() => handleChoice('shout')}
              style={immersiveTapButton(verse.palette, 'faint').base}
              whileTap={immersiveTapButton(verse.palette, 'faint').active}
            >
              shout
            </motion.button>
            <div style={{ width: 1, height: 30, background: verse.palette.primary, opacity: 0.08 }} />
            <motion.button
              onClick={() => handleChoice('whisper')}
              style={immersiveTapButton(verse.palette, 'primary').base}
              whileTap={immersiveTapButton(verse.palette, 'primary').active}
            >
              whisper
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {choice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          {choice === 'whisper' ? 'gravity increases' : 'the room flinched'}
        </motion.div>
      )}
    </div>
  );
}