/**
 * CRYSTAL #4 -- 1124. The Inclusion (Flaw)
 * "The flaw is the fingerprint. Keep the crack."
 * INTERACTION: Perfect emerald -- zoom in to flaw -- try to erase it (shatters) -- accept it
 * STEALTH KBE: Self-Acceptance -- authenticity (B)
 *
 * COMPOSITOR: koan_paradox / Glacier / social / believing / tap / 1124
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_Inclusion({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Glacier',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1124,
        isSeal: false,
      }}
      arrivalText="A perfect emerald. Or so it seems."
      prompt="The flaw is the fingerprint. A perfect stone is usually a fake. The crack proves it is real. Keep the crack."
      resonantText="Self-Acceptance. You kept the flaw. And the stone kept its soul. Perfection is a cage. Authenticity is the crack where the real light enters."
      afterglowCoda="Real."
      onComplete={onComplete}
    >
      {(verse) => <InclusionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InclusionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'whole' | 'zoomed' | 'shattered' | 'accepted'>('whole');
  const [zoom, setZoom] = useState(1);

  const zoomIn = useCallback(() => {
    if (phase !== 'whole') return;
    setZoom(2.5);
    setTimeout(() => setPhase('zoomed'), 600);
  }, [phase]);

  const tryErase = useCallback(() => {
    if (phase !== 'zoomed') return;
    setPhase('shattered');
    setTimeout(() => {
      // Reset to show the lesson
      setPhase('zoomed');
    }, 1800);
  }, [phase]);

  const acceptFlaw = useCallback(() => {
    if (phase !== 'zoomed') return;
    setPhase('accepted');
    setTimeout(() => verse.advance(), 2200);
  }, [phase, verse]);

  const emeraldColor = phase === 'accepted'
    ? 'hsla(145, 45%, 45%, 0.6)'
    : 'hsla(145, 40%, 40%, 0.4)';

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Emerald */}
      <div style={navicueStyles.heroCssScene(verse.palette, 140 / 120)}>
        <AnimatePresence mode="wait">
          {phase === 'shattered' ? (
            <motion.div
              key="shattered"
              initial={{ scale: 1 }}
              animate={{ scale: 0.8, opacity: 0.3 }}
              style={{ display: 'flex', gap: 4, flexWrap: 'wrap', width: 60, justifyContent: 'center' }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0 }}
                  animate={{
                    x: (i % 3 - 1) * 20 + Math.random() * 10,
                    y: (Math.floor(i / 3) - 0.5) * 20 + Math.random() * 10,
                    rotate: Math.random() * 90,
                    opacity: 0.2,
                  }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: 12, height: 12,
                    background: 'hsla(145, 30%, 40%, 0.3)',
                    borderRadius: 2,
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="emerald"
              animate={{ scale: zoom }}
              transition={{ duration: 0.5 }}
              style={{
                width: 50, height: 50,
                background: `linear-gradient(135deg, ${emeraldColor}, hsla(145, 35%, 35%, 0.3))`,
                borderRadius: 6,
                border: `1px solid hsla(145, 30%, 55%, 0.3)`,
                position: 'relative',
                boxShadow: phase === 'accepted'
                  ? `0 0 20px hsla(145, 45%, 50%, 0.3)`
                  : 'none',
              }}
            >
              {/* The flaw/inclusion */}
              {(phase === 'zoomed' || phase === 'accepted') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === 'accepted' ? 0.8 : 0.5 }}
                  style={{
                    position: 'absolute', top: '35%', left: '40%',
                    width: 8, height: 3,
                    background: phase === 'accepted'
                      ? 'hsla(45, 60%, 65%, 0.5)'
                      : 'hsla(0, 0%, 50%, 0.4)',
                    borderRadius: 1,
                    transform: 'rotate(25deg)',
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shatter warning */}
        {phase === 'shattered' && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            style={{
              position: 'absolute', bottom: 5,
              ...navicueStyles.shadowAnnotation(verse.palette, 0.6),
            }}
          >
            shattered
          </motion.span>
        )}
      </div>

      {/* Actions */}
      {phase === 'whole' && (
        <motion.button onClick={zoomIn}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          look closer
        </motion.button>
      )}
      {phase === 'zoomed' && (
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button onClick={tryErase}
            style={immersiveTapButton(verse.palette, 'faint').base}
            whileTap={immersiveTapButton(verse.palette, 'faint').active}>
            erase flaw
          </motion.button>
          <motion.button onClick={acceptFlaw}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            keep it
          </motion.button>
        </div>
      )}
      {phase === 'accepted' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: 'hsla(145, 45%, 55%, 0.9)', fontSize: 11 }}>
          authentic
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'accepted' ? 'real' : phase === 'shattered' ? 'perfection destroys' : phase === 'zoomed' ? 'flaw visible' : 'surface'}
      </div>
    </div>
  );
}