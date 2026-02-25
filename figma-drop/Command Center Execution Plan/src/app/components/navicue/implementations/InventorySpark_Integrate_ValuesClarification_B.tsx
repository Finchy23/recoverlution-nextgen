/**
 * Inventory Spark · Integrate · Values Clarification · Believing
 * 
 * ESSENCE: Choose which direction aligns with your north star
 * 
 * VISUAL LANGUAGE:
 * - Form: Signal (compass in center with two diverging paths)
 * - Mechanism: Values Clarification (directional clarity, purposeful choosing)
 * - Interaction: Branch Fork (compass needle wavers toward hovered choice)
 * - Magic: Sacred Ordinary (grounded, everyday truth-finding)
 * 
 * STAGES:
 * - Dormant: Compass needle spinning, paths dim
 * - Choosing: Hover paths, needle points toward hovered option
 * - Committed: Needle locks to chosen direction
 * - Complete: Chosen path glows, alignment confirmed
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { magicSignatures, navicueTypography, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';

type Stage = 'dormant' | 'choosing' | 'committed' | 'complete';
type PathChoice = 'left' | 'right' | null;

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  cta_defer: string;
  onComplete?: () => void;
}

export default function InventorySpark_Integrate_ValuesClarification_B({
  primary_prompt,
  cta_primary,
  cta_defer,
  onComplete,
}: NaviCueProps) {
  const signature = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('dormant');
  const [hoveredPath, setHoveredPath] = useState<PathChoice>(null);
  const [chosenPath, setChosenPath] = useState<PathChoice>(null);
  const [mounted, setMounted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCompassClick = () => {
    if (stage === 'dormant') {
      setStage('choosing');
    }
  };

  const handlePathChoose = (path: PathChoice) => {
    if (stage === 'choosing') {
      setChosenPath(path);
      setStage('committed');
      safeTimeout(() => {
        setStage('complete');
        onComplete?.();
      }, 800);
    }
  };

  const getNeedleRotation = () => {
    if (stage === 'dormant') return 0;
    if (stage === 'choosing') {
      if (hoveredPath === 'left') return -45;
      if (hoveredPath === 'right') return 45;
      return 0;
    }
    if (stage === 'committed' || stage === 'complete') {
      return chosenPath === 'left' ? -45 : 45;
    }
    return 0;
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        padding: spacing.xl,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing.xl,
      }}
    >
      {/* Contemplative Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          ...navicueTypography.contemplative.primary,
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        {primary_prompt}
      </motion.div>

      {/* Compass + Paths */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Left Path */}
        <motion.div
          onMouseEnter={() => stage === 'choosing' && setHoveredPath('left')}
          onMouseLeave={() => stage === 'choosing' && setHoveredPath(null)}
          onClick={() => handlePathChoose('left')}
          animate={{
            opacity: stage === 'dormant' ? 0.3 : 
                     chosenPath === 'right' ? 0.2 : 
                     hoveredPath === 'left' || chosenPath === 'left' ? 1 : 0.5,
          }}
          style={{
            position: 'absolute',
            left: '10%',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: stage === 'choosing' ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          <svg width="120" height="140" viewBox="0 0 120 140">
            <path
              d="M 110 70 Q 80 30, 40 10"
              stroke={signature.colors.primary}
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
            />
            <circle
              cx="40"
              cy="10"
              r="8"
              fill={signature.colors.primary}
            />
          </svg>
          <div
            style={{
              marginTop: '8px',
              fontSize: navicueType.texture.fontSize,
              fontFamily: navicueTypography.ui.label.fontFamily,
              color: signature.colors.primary,
              textAlign: 'center',
            }}
          >
            {cta_defer}
          </div>
        </motion.div>

        {/* Right Path */}
        <motion.div
          onMouseEnter={() => stage === 'choosing' && setHoveredPath('right')}
          onMouseLeave={() => stage === 'choosing' && setHoveredPath(null)}
          onClick={() => handlePathChoose('right')}
          animate={{
            opacity: stage === 'dormant' ? 0.3 : 
                     chosenPath === 'left' ? 0.2 : 
                     hoveredPath === 'right' || chosenPath === 'right' ? 1 : 0.5,
          }}
          style={{
            position: 'absolute',
            right: '10%',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: stage === 'choosing' ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          <svg width="120" height="140" viewBox="0 0 120 140">
            <path
              d="M 10 70 Q 40 30, 80 10"
              stroke={signature.colors.primary}
              strokeWidth="3"
              fill="none"
              strokeDasharray="5,5"
            />
            <circle
              cx="80"
              cy="10"
              r="8"
              fill={signature.colors.primary}
            />
          </svg>
          <div
            style={{
              marginTop: '8px',
              fontSize: navicueType.texture.fontSize,
              fontFamily: navicueTypography.ui.label.fontFamily,
              color: signature.colors.primary,
              textAlign: 'center',
            }}
          >
            {cta_primary}
          </div>
        </motion.div>

        {/* Compass Center */}
        <motion.div
          onClick={handleCompassClick}
          animate={{
            scale: stage === 'choosing' ? 1.1 : 1,
          }}
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: `3px solid ${signature.colors.primary}`,
            background: `radial-gradient(circle, ${signature.colors.glow}, transparent)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: stage === 'dormant' ? 'pointer' : 'default',
            zIndex: 10,
          }}
        >
          {/* Cardinal Marks */}
          <div style={{ position: 'absolute', top: '8px', fontSize: navicueType.caption.fontSize, color: signature.colors.secondary }}>N</div>
          <div style={{ position: 'absolute', bottom: '8px', fontSize: navicueType.caption.fontSize, color: signature.colors.secondary }}>S</div>
          <div style={{ position: 'absolute', left: '8px', fontSize: navicueType.caption.fontSize, color: signature.colors.secondary }}>W</div>
          <div style={{ position: 'absolute', right: '8px', fontSize: navicueType.caption.fontSize, color: signature.colors.secondary }}>E</div>

          {/* Needle */}
          <motion.div
            animate={{
              rotate: getNeedleRotation(),
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              width: '4px',
              height: '50px',
              transformOrigin: 'center center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '50%',
                backgroundColor: signature.colors.primary,
                borderRadius: '2px 2px 0 0',
              }}
            />
            <div
              style={{
                width: '100%',
                height: '50%',
                backgroundColor: signature.colors.secondary,
                borderRadius: '0 0 2px 2px',
              }}
            />
          </motion.div>

          {/* Center Pivot */}
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: signature.colors.primary,
              position: 'absolute',
            }}
          />
        </motion.div>

        {/* Glow on chosen path */}
        {stage === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.4, scale: 1.5 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              [chosenPath === 'left' ? 'left' : 'right']: '10%',
              top: '30%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${signature.colors.glow}, transparent)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Instruction */}
      {stage === 'dormant' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          style={{
            ...navicueTypography.contemplative.whisper,
            textAlign: 'center',
          }}
        >
          Tap compass, then choose your direction
        </motion.div>
      )}

      {stage === 'choosing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          style={{
            ...navicueTypography.contemplative.whisper,
            textAlign: 'center',
          }}
        >
          Where does your compass point?
        </motion.div>
      )}
    </div>
  );
}