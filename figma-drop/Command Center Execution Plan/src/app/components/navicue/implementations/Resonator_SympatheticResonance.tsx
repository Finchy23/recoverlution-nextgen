/**
 * RESONATOR #4 -- 1024. The Sympathetic Resonance
 * "You just have to vibrate at their frequency."
 * INTERACTION: Tap to pluck a string -- adjacent silent string begins vibrating
 * STEALTH KBE: Influence -- emotional contagion (B)
 *
 * COMPOSITOR: relational_ghost / Ocean / social / believing / tap / 1024
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_SympatheticResonance({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'relational_ghost',
        form: 'Ocean',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1024,
        isSeal: false,
      }}
      arrivalText="Two strings. One silent."
      prompt="You do not have to touch people to move them. You just have to vibrate at their frequency. Tune yourself, and they will hum along."
      resonantText="Sympathetic resonance. When one vibrating body causes another at the same natural frequency to vibrate without direct contact. Emotional contagion works the same way. Your state is contagious."
      afterglowCoda="They hum along."
      onComplete={onComplete}
    >
      {(verse) => <SympatheticResonanceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SympatheticResonanceInteraction({ verse }: { verse: any }) {
  const [plucked, setPlucked] = useState(false);
  const [sympathetic, setSympathetic] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);

  const emotions = ['calm', 'courage', 'kindness', 'joy'];

  const handlePluck = () => {
    if (!emotion || plucked) return;
    setPlucked(true);
    // Delay sympathetic vibration -- the magic of resonance
    setTimeout(() => setSympathetic(true), 1800);
    setTimeout(() => verse.advance(), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Two strings visualization */}
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* String A -- the one you pluck */}
        <motion.line
          x1="40" y1="10" x2="40" y2="110"
          stroke={verse.palette.primary}
          strokeWidth={plucked ? 1.2 : 0.8}
          animate={plucked ? {
            x1: [40, 43, 37, 41, 39, 40],
            x2: [40, 43, 37, 41, 39, 40],
          } : {}}
          transition={{ duration: 1.5, repeat: plucked ? 3 : 0, ease: 'easeOut' }}
          opacity={0.3}
        />
        <text x="40" y="125" textAnchor="middle" fill={verse.palette.textFaint}
          style={{ ...navicueType.micro, fontSize: 11 }}>you</text>

        {/* String B -- the silent one */}
        <motion.line
          x1="160" y1="10" x2="160" y2="110"
          stroke={verse.palette.accent}
          strokeWidth={sympathetic ? 1 : 0.6}
          animate={sympathetic ? {
            x1: [160, 162, 158, 161, 159, 160],
            x2: [160, 162, 158, 161, 159, 160],
          } : {}}
          transition={{ duration: 2, repeat: sympathetic ? Infinity : 0, ease: 'easeInOut' }}
          opacity={sympathetic ? 0.25 : 0.1}
        />
        <text x="160" y="125" textAnchor="middle" fill={verse.palette.textFaint}
          style={{ ...navicueType.micro, fontSize: 11 }}>them</text>

        {/* Resonance lines between strings */}
        {sympathetic && Array.from({ length: 5 }, (_, i) => (
          <motion.line key={i}
            x1="45" y1={20 + i * 20} x2="155" y2={20 + i * 20}
            stroke={verse.palette.accent}
            strokeWidth={0.3}
            strokeDasharray="3 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </svg>

      {/* Emotion selection */}
      {!plucked && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {emotions.map(e => (
            <motion.button
              key={e}
              onClick={() => setEmotion(e)}
              whileTap={immersiveTapButton(verse.palette, 'primary', 'small').active}
              style={immersiveTapButton(verse.palette, 'primary', 'small').base}
            >
              {e}
            </motion.button>
          ))}
        </div>
      )}

      {/* Pluck action */}
      {emotion && !plucked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <motion.button
            onClick={handlePluck}
            whileTap={immersiveTapButton(verse.palette, 'accent').active}
            style={immersiveTapButton(verse.palette, 'accent').base}
          >
            pluck
          </motion.button>
        </motion.div>
      )}

      {sympathetic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          resonating
        </motion.div>
      )}
    </div>
  );
}