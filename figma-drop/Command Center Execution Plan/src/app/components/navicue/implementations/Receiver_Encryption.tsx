/**
 * RECEIVER #8 -- 1178. The Encryption (Decode)
 * "Anger is just encrypted pain. Apply the key. Read the plaintext."
 * INTERACTION: Scrambled text. Apply "Compassion Key." Decoded: "I am hurt."
 * STEALTH KBE: Empathy -- emotional intelligence (B)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / social / believing / tap / 1178
 */
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const CIPHER_TEXT = 'Xj8#kL2@mN';
const PLAIN_TEXT = 'I am hurt.';

export default function Receiver_Encryption({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1178,
        isSeal: false,
      }}
      arrivalText="Scrambled text. Unreadable."
      prompt="Anger is just encrypted pain. Do not react to the code. Apply the key. Read the plaintext."
      resonantText="Empathy. The message looked like hostility. It was pain in code. You applied the compassion key and the cipher dissolved. Emotional intelligence: read beneath the encryption."
      afterglowCoda="Decoded."
      onComplete={onComplete}
    >
      {(verse) => <EncryptionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function EncryptionInteraction({ verse }: { verse: any }) {
  const [decoding, setDecoding] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [displayText, setDisplayText] = useState(CIPHER_TEXT);
  const [charIdx, setCharIdx] = useState(0);

  // Decode animation
  useEffect(() => {
    if (!decoding || decoded) return;
    if (charIdx >= PLAIN_TEXT.length) {
      setDecoded(true);
      setTimeout(() => verse.advance(), 2400);
      return;
    }
    const timeout = setTimeout(() => {
      setDisplayText(prev => {
        const plain = PLAIN_TEXT.slice(0, charIdx + 1);
        const remaining = CIPHER_TEXT.slice(charIdx + 1);
        return plain + remaining;
      });
      setCharIdx(prev => prev + 1);
    }, 150);
    return () => clearTimeout(timeout);
  }, [decoding, decoded, charIdx, verse]);

  const applyKey = useCallback(() => {
    if (decoding) return;
    setDecoding(true);
  }, [decoding]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, minHeight: 240 }}>
      {/* Message display */}
      <div style={{
        ...navicueStyles.heroCssScene(verse.palette, 160 / 80),
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8,
      }}>
        {/* Cipher/decoded text */}
        <div style={{
          padding: '8px 16px', borderRadius: 6,
          border: `1px solid ${decoded ? verse.palette.accent : verse.palette.primaryGlow}`,
          borderColor: decoded ? verse.palette.accent : verse.palette.primaryGlow,
          opacity: decoded ? 0.6 : 0.3,
        }}>
          <span style={{
            ...navicueType.hint, fontSize: 13,
            color: decoded ? verse.palette.accent : verse.palette.textFaint,
            fontFamily: decoding && !decoded ? 'monospace' : undefined,
            letterSpacing: decoded ? '0.02em' : '0.1em',
          }}>
            {displayText}
          </span>
        </div>

        {/* Key indicator */}
        {decoding && !decoded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ ...navicueType.hint, fontSize: 8, color: verse.palette.textFaint }}
          >
            applying compassion key...
          </motion.div>
        )}

        {decoded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            style={{ ...navicueType.hint, fontSize: 8, color: verse.palette.accent }}
          >
            plaintext
          </motion.span>
        )}
      </div>

      {/* Action */}
      {!decoding ? (
        <motion.button onClick={applyKey}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          apply compassion key
        </motion.button>
      ) : decoded ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          decoded
        </motion.div>
      ) : null}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {decoded ? 'emotional intelligence' : 'read beneath the code'}
      </div>
    </div>
  );
}