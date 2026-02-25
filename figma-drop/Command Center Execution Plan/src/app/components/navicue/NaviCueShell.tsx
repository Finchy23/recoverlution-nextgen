/**
 * NAVICUE SHELL
 * 
 * Layout wrapper for all NaviCues.
 * Handles: background gradient, atmosphere layer, content area, stage transitions.
 * 
 * TWO MODES:
 * - immersive: Full-bleed (flex: 1), for foundational/hero specimens
 * - centered:  Safe-centering wrapper (max-width 640px), for standard specimens
 * 
 * MOBILE-FIRST: No cursor-dependent effects. The atmosphere breathes
 * on its own — particles, glow orb, breath line are all autonomous.
 * Interaction events are for stillness timers only.
 * 
 * The bespoke implementation renders INSIDE this shell.
 * 
 * Usage:
 * ```tsx
 * <NaviCueShell
 *   signatureKey="witness_ritual"
 *   mechanism="Metacognition"
 *   kbe="believing"
 *   mode="immersive"
 *   breathProgress={stillnessLevel}
 *   isAfterglow={stage === 'afterglow'}
 *   onInteraction={handleInteraction}
 * >
 *   {children}
 * </NaviCueShell>
 * ```
 */

import { type ReactNode, useMemo, Children, cloneElement, isValidElement } from 'react';
import { motion } from 'motion/react';
import { fonts } from '@/design-tokens';
import { 
  type MagicSignatureKey,
  type NaviCueForm,
  createNaviCuePalette,
  createAtmosphereConfig,
  createMotionConfig,
  navicueLayout,
  NAVICUE_TYPE_FLOOR_PX,
} from '@/app/design-system/navicue-blueprint';
import type { AtmosphereMode } from '@/app/design-system/navicue-compositor';
import { NaviCueAtmosphere } from './NaviCueAtmosphere';
import { useNaviCueLabContext } from './NaviCueLabContext';

/**
 * Recursively walks a React children tree and applies runtime sanitization:
 *
 * 1. EM-DASH REMOVAL: Replaces U+2014 with '--' in all string nodes.
 *    Applied at render time so no source files need to change.
 *
 * 2. FONT SIZE FLOOR: Clamps any inline fontSize below NAVICUE_TYPE_FLOOR_PX
 *    (11px) up to the floor. Catches all sub-floor violations across the
 *    966 shell-wrapped NaviCues without requiring source edits.
 *
 * 3. MONOSPACE NORMALIZATION: Replaces bare fontFamily: 'monospace' with
 *    fonts.mono (the design-system stack including SF Mono, Monaco, etc.)
 *    so no NaviCue ever renders with the system's default monospace face.
 *
 * These are safety nets. Source files should still use navicueType tokens.
 */
const _warnedFontSizes = new Set<string>();
function sanitizeCopy(node: ReactNode): ReactNode {
  if (typeof node === 'string') {
    return node.replace(/\u2014/g, '--');
  }
  if (typeof node === 'number' || typeof node === 'boolean' || node == null) {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((child, i) => {
      const sanitized = sanitizeCopy(child);
      if (isValidElement(sanitized) && sanitized.key == null) {
        return cloneElement(sanitized, { key: `_sc_${i}` });
      }
      return sanitized;
    });
  }
  if (isValidElement(node)) {
    const props = node.props as any;
    let styleOverride: Record<string, any> | null = null;

    // Enforce font-size floor and monospace normalization on inline styles
    if (props.style) {
      const s = props.style;

      // Font size floor enforcement -- catches both numeric (fontSize: 8)
      // and string (fontSize: '8px') sub-floor violations
      if (typeof s.fontSize === 'number' && s.fontSize < NAVICUE_TYPE_FLOOR_PX) {
        if (import.meta.env.DEV) {
          const key = `${s.fontSize}`;
          if (!_warnedFontSizes.has(key)) {
            _warnedFontSizes.add(key);
            console.warn(`[NaviCue] fontSize: ${s.fontSize} clamped to ${NAVICUE_TYPE_FLOOR_PX}. Use navicueType.micro instead.`);
          }
        }
        styleOverride = { ...s, fontSize: NAVICUE_TYPE_FLOOR_PX };
      } else if (typeof s.fontSize === 'string' && s.fontSize.endsWith('px')) {
        const px = parseFloat(s.fontSize);
        if (!isNaN(px) && px < NAVICUE_TYPE_FLOOR_PX) {
          if (import.meta.env.DEV) {
            const key = `${s.fontSize}`;
            if (!_warnedFontSizes.has(key)) {
              _warnedFontSizes.add(key);
              console.warn(`[NaviCue] fontSize: '${s.fontSize}' clamped to ${NAVICUE_TYPE_FLOOR_PX}px. Use navicueType.micro instead.`);
            }
          }
          styleOverride = { ...s, fontSize: `${NAVICUE_TYPE_FLOOR_PX}px` };
        }
      }

      // Monospace normalization: bare 'monospace' -> fonts.mono
      if (s.fontFamily === 'monospace') {
        styleOverride = { ...(styleOverride || s), fontFamily: fonts.mono };
      }
    }

    // Recurse into children (always, for em-dash sanitization)
    if (props.children != null || styleOverride) {
      const newChildren = props.children != null
        ? Children.map(props.children, (child: ReactNode) => sanitizeCopy(child))
        : props.children;
      return cloneElement(
        node,
        styleOverride
          ? { style: styleOverride, children: newChildren }
          : { children: newChildren },
      );
    }
  }
  return node;
}

/** Exported so NaviCueVerse (render-prop pattern) can apply the same floor */
export { sanitizeCopy };

interface NaviCueShellProps {
  /** Magic signature key — determines the visual family */
  signatureKey: MagicSignatureKey;
  /** Mechanism name for accent color */
  mechanism?: string;
  /** KBE layer for intensity */
  kbe?: string;
  /** NaviCue form — determines atmosphere mood */
  form?: NaviCueForm;
  /** Layout mode */
  mode?: 'immersive' | 'centered';
  /** 0-1 progress for bottom breath line */
  breathProgress?: number;
  /** Whether the shell is in afterglow state */
  isAfterglow?: boolean;
  /** Unique particle seed for this specimen */
  particleSeed?: number;
  /** Atmosphere mode from compositor (particle motion style) */
  atmosphereMode?: AtmosphereMode;
  /** Chrono speed multiplier for particle animation (from CHRONO_MODIFIERS) */
  chronoSpeedMult?: number;
  /** Interaction hook type (for atmospheric response during interaction) */
  interactionHook?: string;
  /** Whether the user is in the active interaction stage */
  interactionActive?: boolean;
  /** Interaction handler (resets stillness, etc.) */
  onInteraction?: () => void;
  /** Content */
  children: ReactNode;
}

export function NaviCueShell({
  signatureKey,
  mechanism,
  kbe,
  form,
  mode = 'immersive',
  breathProgress = 0,
  isAfterglow = false,
  particleSeed,
  atmosphereMode,
  chronoSpeedMult,
  interactionHook,
  interactionActive,
  onInteraction,
  children,
}: NaviCueShellProps) {
  const { isLabMode } = useNaviCueLabContext();

  // Generate all tokens from the signature
  const palette = useMemo(
    () => createNaviCuePalette(signatureKey, mechanism, kbe),
    [signatureKey, mechanism, kbe]
  );
  const atmosphere = useMemo(
    () => createAtmosphereConfig(palette, signatureKey, form),
    [palette, signatureKey, form]
  );
  const motionConfig = useMemo(
    () => createMotionConfig(signatureKey),
    [signatureKey]
  );

  const isImmersive = mode === 'immersive';
  const contentStyle = isImmersive
    ? {
        ...(isLabMode ? navicueLayout.contentLab : navicueLayout.content),
        justifyContent: 'center',
        minHeight: '100%',
      }
    : {
        ...navicueLayout.centered,
        justifyContent: 'center',
        minHeight: '100%',
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: motionConfig.entryDuration / 1000,
        ease: motionConfig.entryEase as any,
      }}
      onTouchStart={onInteraction}
      onClick={onInteraction}
      style={{
        ...(isImmersive ? navicueLayout.immersive : {
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none',
          cursor: 'default',
        }),
        ...(isImmersive ? { flex: 1 } : {}),
        background: atmosphere.backgroundGradient,
        fontFamily: fonts.primary,
      }}
    >
      {/* Atmosphere layer -- particles + breath line */}
      <NaviCueAtmosphere
        palette={palette}
        atmosphere={atmosphere}
        atmosphereMode={atmosphereMode}
        breathProgress={breathProgress}
        particleSeed={particleSeed}
        isAfterglow={isAfterglow}
        chronoSpeedMult={chronoSpeedMult}
        interactionHook={interactionHook}
        interactionActive={interactionActive}
      />

      {/* Content area */}
      <div style={contentStyle}>
        {sanitizeCopy(children)}
      </div>
    </motion.div>
  );
}

/**
 * Hook to get the full NaviCue design kit for a given signature.
 * For specimens that need the palette/motion but build their own layout.
 */
export function useNaviCueDesign(
  signatureKey: MagicSignatureKey,
  mechanism?: string,
  kbe?: string,
  form?: NaviCueForm,
) {
  const palette = useMemo(
    () => createNaviCuePalette(signatureKey, mechanism, kbe),
    [signatureKey, mechanism, kbe]
  );
  const atmosphere = useMemo(
    () => createAtmosphereConfig(palette, signatureKey, form),
    [palette, signatureKey, form]
  );
  const motionConfig = useMemo(
    () => createMotionConfig(signatureKey),
    [signatureKey]
  );

  return { palette, atmosphere, motion: motionConfig };
}
