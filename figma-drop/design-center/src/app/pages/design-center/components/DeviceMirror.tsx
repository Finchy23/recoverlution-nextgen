/**
 * DEVICE MIRROR
 * ═════════════
 * The persistent device preview companion.
 * Lives on the right side of every lab page (desktop) or
 * as a floating modal on mobile. Shows live NaviCue output
 * driven by whatever the current lab is composing.
 *
 * The device is the hero. The proof. The mirror.
 * Everything designed in the workbench appears here in real-time.
 *
 * DEPENDENCIES:
 *   - useBreathEngine (shared hook)
 *   - Particles (shared component)
 *   - dc-tokens (device dimensions, signature palettes)
 *   - design-tokens (colors, fonts, surfaces)
 */

import { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces } from '@/design-tokens';
import { deviceFrame, SIGNATURE_PALETTES } from '../dc-tokens';
import { useBreathEngine, type BreathPattern } from '../hooks/useBreathEngine';
import { Particles } from './Particles';
import { parseColor, rgba, px, GLOW } from '@/universal-canvas';

// ─── Device Context ─────────────────────────────────────────
// Labs push content into the device mirror via this context.
// When no lab is active, the device shows default breathing specimens.

export interface DeviceMirrorContent {
  /** Primary copy line */
  copy?: string;
  /** Secondary/follow line */
  follow?: string;
  /** Accent color for glow/particles */
  accent?: string;
  /** Glow color (radial background) */
  glow?: string;
  /** Override the breath pattern */
  breathPattern?: BreathPattern;
  /** Custom content renderer (replaces default) */
  customRenderer?: React.ReactNode;
}

interface DeviceMirrorContextType {
  content: DeviceMirrorContent;
  setContent: (content: DeviceMirrorContent) => void;
  resetContent: () => void;
}

/** Default content — poetic_precision signature */
const DEFAULT_PALETTE = SIGNATURE_PALETTES[2]; // poetic_precision
const DEFAULT_CONTENT: DeviceMirrorContent = {
  copy: 'The mind is playing that old, loud song again.',
  follow: 'Step out of the theater for a moment.',
  accent: DEFAULT_PALETTE.accent,
  glow: DEFAULT_PALETTE.glow,
};

const DeviceMirrorContext = createContext<DeviceMirrorContextType>({
  content: DEFAULT_CONTENT,
  setContent: () => {},
  resetContent: () => {},
});

export function useDeviceMirror() {
  return useContext(DeviceMirrorContext);
}

export function DeviceMirrorProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<DeviceMirrorContent>(DEFAULT_CONTENT);
  const resetContent = () => setContent(DEFAULT_CONTENT);

  return (
    <DeviceMirrorContext.Provider value={{ content, setContent, resetContent }}>
      {children}
    </DeviceMirrorContext.Provider>
  );
}

// ─── Device Frame Component ─────────────────────────────────

export type DeviceVariant = 'default' | 'hero' | 'composer';

export function DeviceMirror({ className, variant = 'default' }: { className?: string; variant?: DeviceVariant }) {
  const { content } = useDeviceMirror();
  const { amplitude, phase } = useBreathEngine(content.breathPattern ?? 'calm');

  const accent = content.accent ?? DEFAULT_PALETTE.accent;
  const glow = content.glow ?? DEFAULT_PALETTE.glow;

  // Resolve dimensions from variant
  const dims = variant === 'composer'
    ? deviceFrame.composer
    : variant === 'hero'
      ? deviceFrame.hero
      : { width: deviceFrame.width, height: deviceFrame.height, borderRadius: deviceFrame.borderRadius };
  const islandDims = variant === 'composer'
    ? deviceFrame.composerIsland
    : variant === 'hero'
      ? deviceFrame.heroIsland
      : deviceFrame.island;
  const { width, height, borderRadius } = dims;
  const island = islandDims;
  const minDim = Math.min(width, height);
  const accentRgb = parseColor(accent);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Ambient glow behind device */}
      <motion.div
        animate={{
          scale: 0.8 + amplitude * 0.3,
          opacity: 0.4 + amplitude * 0.3,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: width * 1.5,
          height: width * 1.5,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glow} 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* The device */}
      <div
        style={{
          position: 'relative',
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          boxShadow: `
            0 0 ${px(0.115 + amplitude * 0.058, minDim)}px ${rgba(accentRgb, 0.06 + amplitude * 0.04)},
            0 0 ${px(0.23 + amplitude * 0.115, minDim)}px ${rgba(accentRgb, 0.03 + amplitude * 0.02)},
            0 ${px(0.115, minDim)}px ${px(0.23, minDim)}px rgba(0, 0, 0, 0.4)
          `,
        }}
      >
        {/* Bezel */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            border: `1px solid ${surfaces.glass.border}`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: island.top,
            left: '50%',
            transform: 'translateX(-50%)',
            width: island.width,
            height: island.height,
            borderRadius: island.borderRadius,
            background: colors.neutral.black,
            zIndex: 10,
          }}
        />

        {/* Screen */}
        <div style={{ position: 'absolute', inset: 0, background: surfaces.solid.base }}>
          {content.customRenderer ? (
            content.customRenderer
          ) : (
            <>
              <Particles count={14} color={accent} viewport={{ width, height }} />

              {/* Glow orb — minDim-relative */}
              <div
                style={{
                  position: 'absolute',
                  top: '25%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: px(GLOW.sm + amplitude * 0.1, minDim),
                  height: px(GLOW.sm + amplitude * 0.1, minDim),
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
                  opacity: 0.3 + amplitude * 0.3,
                  transition: 'width 1.5s ease, height 1.5s ease, opacity 1.5s ease',
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '52px 24px',
                  zIndex: 5,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={content.copy}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      fontFamily: fonts.secondary,
                      fontSize: 18,
                      color: colors.neutral.white,
                      textAlign: 'center',
                      lineHeight: 1.4,
                      letterSpacing: '-0.01em',
                      maxWidth: 200,
                    }}
                  >
                    {content.copy}
                  </motion.div>
                </AnimatePresence>

                {content.follow && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={content.follow}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 0.5, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                      style={{
                        fontFamily: fonts.primary,
                        fontSize: 12,
                        color: colors.neutral.white,
                        textAlign: 'center',
                        marginTop: 16,
                        letterSpacing: '0.01em',
                      }}
                    >
                      {content.follow}
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Breath pulse */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <motion.div
                    animate={{
                      scale: 0.7 + amplitude * 0.5,
                      opacity: 0.2 + amplitude * 0.4,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${accent}, transparent)`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 8,
                      color: colors.neutral.white,
                      opacity: 0.2,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                    }}
                  >
                    {phase}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}