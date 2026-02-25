/**
 * Inventory Spark · Integrate · Exposure · Embodying
 * 
 * ESSENCE: Step toward the avoided moment with support - carry into real time
 * 
 * VISUAL LANGUAGE:
 * - Form: Signal (centered with edge aesthetic)
 * - Mechanism: Exposure (threshold crossing)
 * - Interaction: Tap Reveal (direct courage)
 * - Magic: Witness Ritual (ceremonial, stable)
 * - KBE: Embodying (active energy, sealing with action)
 * 
 * UNIQUE APPROACH: Concentric circles representing comfort zone boundaries
 * Tap to step through each layer toward the center/edge
 */

import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing, withAlpha } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

type Stage = 'dormant' | 'stepping' | 'crossed' | 'embodied';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  cta_defer: string;
  onComplete?: () => void;
}

export default function InventorySpark_Integrate_Exposure_E({
  primary_prompt,
  cta_primary,
  cta_defer,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.witness_ritual;
  const [stage, setStage] = useState<Stage>('dormant');
  const [currentLayer, setCurrentLayer] = useState(0);
  const [mounted, setMounted] = useState(false);
  const totalLayers = 4;
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  const svgId = useId();

  useEffect(() => {
    setMounted(true);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleStep = () => {
    if (currentLayer < totalLayers - 1) {
      setCurrentLayer(prev => prev + 1);
      if (currentLayer === 0) setStage('stepping');
    } else {
      setStage('crossed');
      safeTimeout(() => {
        setStage('embodied');
        if (onComplete) safeTimeout(onComplete, 800);
      }, 1000);
    }
  };

  const handleDefer = () => {
    setStage('embodied');
  };

  const layers = [120, 90, 60, 30];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: mounted ? 1 : 0 }}
      transition={{ 
        duration: signature.motion.entry.duration / 1000, 
        ease: signature.motion.entry.ease 
      }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(17, 23, 30, 0.97) 0%, rgba(22, 27, 35, 0.99) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
      }}
    >
      {/* Prompt */}
      <div style={{
        position: 'absolute',
        top: spacing.xl,
        left: spacing.xl,
        right: spacing.xl,
        textAlign: 'center',
      }}>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...navicueTypography.contemplative.primary,
            color: 'rgba(236, 239, 229, 0.9)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {primary_prompt}
        </motion.p>
      </div>

      {/* Concentric Comfort Zone Layers */}
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Background gradient */}
        <defs>
          <radialGradient id={`${svgId}-edgeGlow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={signature.colors.accent} stopOpacity="0.3" />
            <stop offset="100%" stopColor={signature.colors.accent} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Comfort zone rings */}
        {layers.map((radius, index) => (
          <motion.circle
            key={`layer-${index}`}
            cx={200}
            cy={200}
            r={radius}
            fill="none"
            stroke={
              index <= currentLayer 
                ? signature.colors.accent 
                : signature.colors.secondary
            }
            strokeWidth={index === currentLayer ? 3 : 1.5}
            strokeDasharray={index === currentLayer ? "0" : "5 5"}
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: index <= currentLayer ? 0.8 : 0.3,
              scale: index === currentLayer ? [1, 1.02, 1] : 1,
            }}
            transition={{
              opacity: { duration: 0.4 },
              scale: { duration: 2, repeat: Infinity },
            }}
          />
        ))}

        {/* Central edge point */}
        <motion.circle
          cx={200}
          cy={200}
          r={15}
          fill={currentLayer === totalLayers - 1 ? signature.colors.accent : signature.colors.primary}
          animate={{
            scale: currentLayer === totalLayers - 1 ? [1, 1.2, 1] : [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
        />

        {/* Pulse from center when at edge */}
        {stage === 'crossed' && (
          <motion.circle
            cx={200}
            cy={200}
            r={20}
            fill={`url(#${svgId}-edgeGlow)`}
            animate={{
              r: [20, 150, 20],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}

        {/* Progress indicator */}
        {stage === 'stepping' && (
          <motion.text
            x={200}
            y={260}
            textAnchor="middle"
            fill={signature.colors.accent}
            style={{
              fontSize: navicueType.texture.fontSize,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
            }}
          >
            Stepping closer
          </motion.text>
        )}
      </svg>

      {/* Step Button */}
      {stage !== 'embodied' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStep}
          style={{
            position: 'absolute',
            ...navicueTypography.ui.button,
            padding: `${spacing.md} ${spacing.lg}`,
            background: stage === 'crossed' 
              ? `linear-gradient(135deg, ${withAlpha(signature.colors.accent, 0.31)}, ${withAlpha(signature.colors.primary, 0.31)})`
              : 'rgba(30, 25, 50, 0.5)',
            border: `2px solid ${stage === 'crossed' ? signature.colors.accent : signature.colors.primary}`,
            borderRadius: radius.sm,
            color: 'rgba(236, 239, 229, 0.95)',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
          }}
        >
          {currentLayer < totalLayers - 1 ? 'Step closer' : cta_primary}
        </motion.button>
      )}

      {/* Defer Option */}
      {stage === 'dormant' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={handleDefer}
          style={{
            position: 'absolute',
            bottom: spacing.xl,
            ...navicueTypography.ui.button,
            padding: `${spacing.sm} ${spacing.md}`,
            background: 'transparent',
            border: '1px solid rgba(236, 239, 229, 0.2)',
            borderRadius: radius.sm,
            color: 'rgba(236, 239, 229, 0.6)',
            cursor: 'pointer',
            fontSize: navicueType.texture.fontSize,
          }}
        >
          {cta_defer}
        </motion.button>
      )}

      {/* Completion */}
      <AnimatePresence>
        {stage === 'embodied' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              textAlign: 'center',
            }}
          >
            <motion.div
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              style={{
                ...navicueTypography.eyebrow,
                color: signature.colors.accent,
                letterSpacing: '0.1em',
              }}
            >
              YOU CROSSED
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}