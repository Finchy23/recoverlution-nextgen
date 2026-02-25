/**
 * TRANSMUTER #4 -- 1084. The Coagulation (The Solidify)
 * "Do not just have the idea. Coagulate it. Make it solid enough to stand on."
 * INTERACTION: Tap repeatedly to freeze a liquid idea into a solid brick
 * STEALTH KBE: Action -- implementation (E)
 *
 * COMPOSITOR: science_x_soul / Ember / social / embodying / tap / 1084
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_Coagulation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Ember',
        chrono: 'social',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1084,
        isSeal: false,
      }}
      arrivalText="A liquid idea. 'I should...'"
      prompt="Spirit is volatile. Matter is fixed. Do not just have the idea. Coagulate it. Make it solid enough to stand on."
      resonantText="Action. You froze the intention into form. The idea became a brick. You can build with bricks. You cannot build with vapour."
      afterglowCoda="I did."
      onComplete={onComplete}
    >
      {(verse) => <CoagulationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CoagulationInteraction({ verse }: { verse: any }) {
  const [taps, setTaps] = useState(0);
  const [solidified, setSolidified] = useState(false);
  const FREEZE_TAPS = 8;

  const handleTap = useCallback(() => {
    if (solidified) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= FREEZE_TAPS) {
      setSolidified(true);
      setTimeout(() => verse.advance(), 2200);
    }
  }, [taps, solidified, verse]);

  const progress = taps / FREEZE_TAPS;
  // Liquid starts wavy, becomes rigid
  const borderRadius = Math.max(4, 40 - progress * 36);
  const wobble = solidified ? 0 : (1 - progress) * 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Shape */}
      <motion.div
        animate={{
          borderRadius,
          rotate: solidified ? 0 : [wobble, -wobble, wobble],
        }}
        transition={solidified
          ? { duration: 0.6 }
          : { rotate: { repeat: Infinity, duration: 1.5 } }
        }
        style={{
          width: solidified ? 100 : 90,
          height: solidified ? 70 : 80,
          border: `1px solid ${solidified ? verse.palette.accent : verse.palette.primaryGlow}`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'width 0.4s, height 0.4s',
        }}
      >
        {/* Liquid interior */}
        <motion.div
          animate={{
            background: solidified
              ? `linear-gradient(135deg, hsla(0, 0%, 35%, 0.4), hsla(0, 0%, 28%, 0.5))`
              : `linear-gradient(${135 + progress * 20}deg, ${verse.palette.primaryFaint}, hsla(210, 30%, 30%, ${0.3 - progress * 0.15}))`,
          }}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        />

        {/* Frost cracks appearing */}
        {progress > 0.3 && !solidified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progress * 0.4 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(${45 + progress * 90}deg, transparent 40%, hsla(210, 30%, 70%, 0.1) 50%, transparent 60%)`,
            }}
          />
        )}

        {/* Label */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AnimatePresence mode="wait">
            {!solidified ? (
              <motion.span key="should" exit={{ opacity: 0 }}
                style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
                I should...
              </motion.span>
            ) : (
              <motion.span key="did"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 12, fontWeight: 500 }}>
                I did.
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress hint */}
      {!solidified && (
        <div style={{
          display: 'flex',
          gap: 3,
          alignItems: 'center',
        }}>
          {Array.from({ length: FREEZE_TAPS }).map((_, i) => (
            <div key={i} style={{
              width: 6,
              height: 6,
              borderRadius: 2,
              background: i < taps ? verse.palette.accent : verse.palette.primaryGlow,
              opacity: i < taps ? 0.7 : 0.2,
              transition: 'background 0.2s, opacity 0.2s',
            }} />
          ))}
        </div>
      )}

      {/* Action */}
      {!solidified && (
        <motion.button
          onClick={handleTap}
          whileTap={immersiveTapButton(verse.palette).active}
          style={immersiveTapButton(verse.palette).base}
        >
          solidify
        </motion.button>
      )}
    </div>
  );
}