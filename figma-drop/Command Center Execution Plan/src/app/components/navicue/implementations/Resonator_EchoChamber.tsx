/**
 * RESONATOR #8 -- 1028. The Echo Chamber
 * "The universe has no original ideas. It only echoes you."
 * INTERACTION: Type a new word to change what echoes back
 * STEALTH KBE: Responsibility -- locus of control (B)
 *
 * COMPOSITOR: koan_paradox / Ocean / night / believing / type / 1028
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { useTypeInteraction } from '../interactions/useTypeInteraction';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_EchoChamber({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Ocean',
        chrono: 'night',
        kbe: 'b',
        hook: 'type',
        specimenSeed: 1028,
        isSeal: false,
      }}
      arrivalText="An echo returns."
      prompt="The universe has no original ideas. It only echoes you. If you do not like what you hear, change what you say."
      resonantText="The reticular activating system. The brain filters 99% of incoming data, surfacing only what matches your primed expectations. You are not observing reality. You are hearing your own broadcast reflected back."
      afterglowCoda="Change the input."
      onComplete={onComplete}
    >
      {(verse) => <EchoChamberInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EchoChamberInteraction({ verse }: { verse: any }) {
  const [echoes, setEchoes] = useState<string[]>(['doubt', 'doubt', 'doubt']);
  const [submitted, setSubmitted] = useState(false);
  const echoTimers = useRef<number[]>([]);

  const typeHook = useTypeInteraction({
    minLength: 2,
    onAccept: (value) => {
      setSubmitted(true);
      // Replace echoes one by one with the new word
      const word = value.trim().toLowerCase();
      echoTimers.current.forEach(clearTimeout);
      echoTimers.current = [];

      [0, 800, 1600].forEach((delay, i) => {
        const timer = window.setTimeout(() => {
          setEchoes(prev => {
            const next = [...prev];
            next[i] = word;
            return next;
          });
        }, delay);
        echoTimers.current.push(timer);
      });

      setTimeout(() => verse.advance(), 4000);
    },
  });

  useEffect(() => {
    return () => echoTimers.current.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Echo visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {echoes.map((echo, i) => (
          <motion.div
            key={`echo-${i}`}
            animate={{
              opacity: [0.3 - i * 0.08, 0.2 - i * 0.05, 0.3 - i * 0.08],
              scale: [1 - i * 0.04, 1 - i * 0.02, 1 - i * 0.04],
            }}
            transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              ...navicueType.prompt,
              color: verse.palette.text,
              fontSize: 16 - i * 2,
              letterSpacing: `${0.02 + i * 0.03}em`,
            }}
          >
            {echo}
          </motion.div>
        ))}
      </div>

      {/* Input to change the echo */}
      {!submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
            change the broadcast
          </div>
          <input
            value={typeHook.value}
            onChange={e => typeHook.onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && typeHook.submit()}
            placeholder="type a new word..."
            style={{
              ...navicueType.input,
              width: 220, padding: 10, textAlign: 'center',
              background: verse.palette.primaryFaint,
              border: `1px solid ${verse.palette.primaryGlow}`,
              borderRadius: 9999, color: verse.palette.text, outline: 'none',
            }}
          />
        </motion.div>
      )}

      {submitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 2 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          the echo shifted
        </motion.div>
      )}
    </div>
  );
}
