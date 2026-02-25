/**
 * CYBERNETICIST #3 -- 1093. The Positive Feedback Loop
 * "Anxiety feeds itself. Cut the cable. Break the loop."
 * INTERACTION: A microphone near a speaker -- sound roars -- tap to cut the wire
 * STEALTH KBE: Interruption -- pattern interrupt (E)
 *
 * COMPOSITOR: pattern_glitch / Circuit / social / embodying / tap / 1093
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Cyberneticist_PositiveFeedbackLoop({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'social',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1093,
        isSeal: false,
      }}
      arrivalText="A quiet hum."
      prompt="Anxiety feeds itself. The more you listen, the louder it gets. Cut the cable. Break the loop."
      resonantText="Interruption. The roar was not the world. It was the microphone feeding the speaker feeding the microphone. You did not lower the volume. You severed the circuit."
      afterglowCoda="Silence."
      onComplete={onComplete}
    >
      {(verse) => <PositiveFeedbackInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PositiveFeedbackInteraction({ verse }: { verse: any }) {
  const [volume, setVolume] = useState(5);
  const [cut, setCut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const MAX_VOLUME = 100;

  // Volume escalates
  useEffect(() => {
    if (cut) return;
    intervalRef.current = setInterval(() => {
      setVolume(prev => Math.min(prev + 1.5 + prev * 0.03, MAX_VOLUME));
    }, 150);
    return () => clearInterval(intervalRef.current);
  }, [cut]);

  const cutCable = useCallback(() => {
    if (cut) return;
    setCut(true);
    clearInterval(intervalRef.current);
    setVolume(0);
    setTimeout(() => verse.advance(), 2200);
  }, [cut, verse]);

  const volumePct = volume / MAX_VOLUME;
  const barCount = 12;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Sound visualization */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 100 }}>
        {Array.from({ length: barCount }).map((_, i) => {
          const barHeight = cut ? 2 : Math.max(4, (volumePct * 80) * (0.5 + 0.5 * Math.sin(i * 0.8 + volume * 0.1)));
          const barOpacity = cut ? 0.1 : 0.2 + volumePct * 0.6;
          return (
            <motion.div
              key={i}
              animate={{ height: barHeight, opacity: barOpacity }}
              transition={{ duration: 0.15 }}
              style={{
                width: 6,
                borderRadius: 3,
                background: cut
                  ? verse.palette.primaryGlow
                  : `hsla(${Math.round(40 - 40 * volumePct)}, ${Math.round(40 + 30 * volumePct)}%, 50%, 0.8)`,
              }}
            />
          );
        })}
      </div>

      {/* Cable */}
      <div style={{
        width: 120, height: 2, position: 'relative',
        background: cut ? 'transparent' : verse.palette.primaryGlow,
        opacity: cut ? 0 : 0.4,
      }}>
        {cut && (
          <>
            <motion.div
              initial={{ width: 60 }}
              animate={{ width: 40, x: -10 }}
              style={{ position: 'absolute', left: 0, height: 2, background: verse.palette.textFaint, opacity: 0.3, borderRadius: 1 }}
            />
            <motion.div
              initial={{ width: 60 }}
              animate={{ width: 40, x: 10 }}
              style={{ position: 'absolute', right: 0, height: 2, background: verse.palette.textFaint, opacity: 0.3, borderRadius: 1 }}
            />
          </>
        )}
      </div>

      {/* Action */}
      {!cut ? (
        <motion.button onClick={cutCable}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          cut the cable
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
          >
            silence
          </motion.div>
        </AnimatePresence>
      )}

      {/* Volume indicator */}
      <motion.div
        animate={{ scale: cut ? 0.8 : 1, opacity: cut ? 0.2 : 0.4 }}
        style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10 }}
      >
        {cut ? 'loop broken' : `${Math.round(volume)}%`}
      </motion.div>
    </div>
  );
}