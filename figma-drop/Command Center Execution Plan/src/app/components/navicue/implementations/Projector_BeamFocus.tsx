/**
 * PROJECTOR #2 -- 1002. The Beam Focus
 * "Clarity is not about seeing more. It is about seeing less."
 * INTERACTION: Drag upward through the focus ring to sharpen a blurred beam.
 * As focus increases, text sharpens from noise to insight.
 * STEALTH KBE: E (Embodying) -- Attention training via progressive reveal
 *
 * COMPOSITOR: science_x_soul / Theater / work / embodying / drag / 1002
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';
import { useDragInteraction } from '../interactions/useDragInteraction';

interface Props { data?: any; onComplete?: () => void; }

const CLARITY_LAYERS = [
  'The noise of everything you think you need to know',
  'The pattern underneath the noise',
  'The question underneath the pattern',
  'You already know.',
];

export default function Projector_BeamFocus({ onComplete }: Props) {
  const [focused, setFocused] = useState(false);

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
  });

  const blurAmount = Math.max(0, (1 - drag.progress) * 12);
  const layerIndex = Math.min(CLARITY_LAYERS.length - 1, Math.floor(drag.progress * CLARITY_LAYERS.length));

  const handleFocus = useCallback((advance: () => void) => {
    setFocused(true);
    setTimeout(() => advance(), 1800);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Theater',
        chrono: 'work',
        kbe: 'embodying',
        hook: 'drag',
        specimenSeed: 1002,
        isSeal: false,
      }}
      arrivalText="A beam searches the dark..."
      prompt="Drag upward to focus. Clarity costs distraction."
      resonantText="The sharpest image contains the fewest elements."
      afterglowCoda="Less. Always less."
      onComplete={onComplete}
      mechanism="Attention Shift"
    >
      {(verse) => (
        <div style={{ ...navicueInteraction.interactionWrapper, gap: 28 }}>
          {/* Focus ring -- the drag target IS the visual */}
          <div
            {...drag.dragProps}
            ref={(el) => {
              if (drag.dragProps.ref) (drag.dragProps.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
            }}
            style={{
              ...drag.dragProps.style,
              width: 180,
              height: 180,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              touchAction: 'none',
              userSelect: 'none',
            }}
          >
            {/* Outer ring -- subtle breathing when unfocused */}
            <motion.div
              animate={{
                scale: focused ? 1 : 1.15 - drag.progress * 0.15,
                opacity: 0.06 + drag.progress * 0.14,
              }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `1px solid ${verse.palette.primary}`,
              }}
            />

            {/* Inner core -- grows and brightens with focus */}
            <motion.div
              animate={{
                scale: 0.3 + drag.progress * 0.7,
                opacity: 0.04 + drag.progress * 0.15,
              }}
              transition={{ duration: 0.3 }}
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${verse.palette.accent}, transparent)`,
              }}
            />

            {/* Progress arc */}
            <svg
              viewBox="0 0 100 100"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <circle
                cx={50} cy={50} r={45}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={0.8}
                strokeDasharray={`${drag.progress * 283} 283`}
                strokeLinecap="round"
                opacity={0.25 + drag.progress * 0.2}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>

          {/* Clarity text -- deblurs with progress */}
          <motion.div
            animate={{ filter: `blur(${blurAmount}px)` }}
            transition={{ duration: 0.15 }}
            style={{
              ...navicueType.narrative,
              color: verse.palette.text,
              textAlign: 'center',
              maxWidth: 280,
              minHeight: 48,
            }}
          >
            {CLARITY_LAYERS[layerIndex]}
          </motion.div>

          {/* Focus percentage */}
          <span style={{
            ...navicueInteraction.tapHint,
            color: verse.palette.textFaint,
          }}>
            {focused ? 'focused' : `${Math.round(drag.progress * 100)}% clarity`}
          </span>

          {/* Complete -- emerges at high focus, no pill button */}
          {drag.progress > 0.85 && !focused && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 0.8 }}
              onClick={() => handleFocus(verse.advance)}
              whileTap={immersiveTapButton(verse.palette, 'accent').active}
              style={immersiveTapButton(verse.palette, 'accent').base}
            >
              hold this clarity
            </motion.button>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}