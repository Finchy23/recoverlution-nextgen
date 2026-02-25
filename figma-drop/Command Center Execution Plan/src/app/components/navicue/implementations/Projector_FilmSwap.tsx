/**
 * PROJECTOR #1 -- 1001. The Film Swap
 * "Your crisis is a genre problem, not a plot problem."
 * INTERACTION: Drag left/right to view the same situation through
 * different genre lenses (Comedy, Drama, Documentary, Thriller, Romance).
 * Each reframe reveals a new narrative angle on the user's challenge.
 * STEALTH KBE: B (Believing) -- Cognitive Restructuring via narrative reframe
 *
 * PROOF SPECIMEN: Validates NaviCueVerse compositor integration
 * with drag interaction, sensory_cinema signature, Theater form,
 * work chrono, and seed 1001.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueInteraction,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';
import { useDragInteraction } from '../interactions/useDragInteraction';

interface Props { data?: any; onComplete?: () => void; }

const GENRES = [
  { id: 'comedy',      label: 'Comedy',      reframe: 'What if this is the funniest thing that will ever happen to you?' },
  { id: 'drama',       label: 'Drama',       reframe: 'This is the scene where everything changes.' },
  { id: 'documentary', label: 'Documentary', reframe: 'An observer would find this fascinating, not frightening.' },
  { id: 'thriller',    label: 'Thriller',    reframe: 'The tension means the stakes are real. You are alive.' },
  { id: 'romance',     label: 'Romance',     reframe: 'Every great love story requires risk.' },
];

export default function Projector_FilmSwap({ onComplete }: Props) {
  const [currentGenre, setCurrentGenre] = useState(0);
  const [locked, setLocked] = useState(false);

  const drag = useDragInteraction({
    axis: 'x',
    sticky: false,
    onThreshold: (p) => {
      if (locked) return;
      const idx = Math.min(GENRES.length - 1, Math.floor(p * GENRES.length));
      if (idx !== currentGenre) setCurrentGenre(idx);
    },
  });

  const handleLock = useCallback((advance: () => void) => {
    setLocked(true);
    setTimeout(() => advance(), 2000);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Theater',
        chrono: 'work',
        kbe: 'believing',
        hook: 'drag',
        specimenSeed: 1001,
        isSeal: false,
      }}
      arrivalText="The projector hums..."
      prompt="Your situation has no fixed genre. Drag to reframe it."
      resonantText="The crisis was never the plot. It was the lens."
      afterglowCoda="Genre is a choice."
      onComplete={onComplete}
      mechanism="Cognitive Restructuring"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* Genre strip */}
          <div
            {...drag.dragProps}
            style={{
              ...drag.dragProps.style,
              width: '100%',
              maxWidth: 320,
              height: 48,
              borderRadius: 24,
              background: verse.palette.primaryFaint,
              border: `1px solid ${verse.palette.primaryGlow}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Position indicator */}
            <motion.div
              animate={{ left: `${(currentGenre / (GENRES.length - 1)) * 100}%` }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                top: 4,
                width: 40,
                height: 40,
                borderRadius: 20,
                background: verse.palette.primaryGlow,
                border: `1px solid ${verse.palette.primary}`,
                transform: 'translateX(-50%)',
              }}
            />
            {/* Genre dots */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              pointerEvents: 'none',
            }}>
              {GENRES.map((g, i) => (
                <div
                  key={g.id}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: i === currentGenre ? verse.palette.accent : verse.palette.primaryGlow,
                    transition: 'background 0.3s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Current genre label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={GENRES[currentGenre].id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                ...navicueType.subheading,
                color: verse.palette.text,
                marginBottom: 8,
              }}>
                {GENRES[currentGenre].label}
              </div>
              <div style={{
                ...navicueType.texture,
                color: verse.palette.textFaint,
                maxWidth: 280,
              }}>
                {GENRES[currentGenre].reframe}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Lock button */}
          {!locked && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              onClick={() => handleLock(verse.advance)}
              whileTap={immersiveTapButton(verse.palette).active}
              style={immersiveTapButton(verse.palette).base}
            >
              This is my genre
            </motion.button>
          )}

          {locked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              style={{ ...navicueType.hint, color: verse.palette.textFaint }}
            >
              {GENRES[currentGenre].label} it is.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}