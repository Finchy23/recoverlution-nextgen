import { motion } from 'motion/react';
import { useCommandCenterStore } from '@/app/stores/commandCenterStore';
import { colors, surfaces, fonts } from '@/design-tokens';
import { buildAssetUrl, assetOpacity, reelOverlay } from '@/marketing-tokens';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface JourneyViewerProps {
  mounted: boolean;
  previewMode: 'mobile' | 'desktop';
}

/**
 * JOURNEY VIEWER
 * 
 * Instagram-stories style viewer for Journey scenes
 * - Shows ONE scene at a time
 * - Asset + Magic gradient layer
 * - Interaction-driven progression
 * - No labels/headlines/breadcrumbs
 * - Pure elegance & simplicity
 */

export function JourneyViewer({ mounted, previewMode }: JourneyViewerProps) {
  const {
    journeyScenes,
    currentJourneyIndex,
    showDataInspector,
    setCurrentJourneyIndex,
    nextScene,
    previousScene,
  } = useCommandCenterStore();

  const [imageLoaded, setImageLoaded] = useState(false);

  const currentScene = journeyScenes[currentJourneyIndex];

  // Reset image loaded state when scene changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentJourneyIndex]);

  if (!currentScene) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.neutral.gray[400],
          fontSize: '14px',
        }}
      >
        No journey scenes available
      </div>
    );
  }

  // Build asset URL from scene data
  // Using the flowstate abstract neurowave as default
  const assetUrl = 'https://wzeqlkbmqxlsjryidagf.supabase.co/storage/v1/object/public/recoverlution-assets/flowstate/5:4/avif/flowstate_abstract_neurowave_light.avif';

  // Get phase color for magic gradient
  const phaseColors: Record<string, string> = {
    'Foundation': colors.accent.blue.primary,
    'Emergence': colors.status.green.bright,
    'Reclamation': colors.status.amber.bright,
    'Evolution': colors.brand.purple.light,
  };
  const phaseColor = phaseColors[currentScene.phase || 'Foundation'] || colors.accent.cyan.primary;

  // Preview dimensions
  const previewDimensions = previewMode === 'mobile' 
    ? { width: '390px', height: '844px' }
    : { width: '1440px', height: '900px' };

  const handleInteraction = () => {
    // Auto-advance to next scene on interaction
    nextScene();
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
      }}
    >
      {/* Navigation Hints (subtle, keyboard shortcuts) */}
      <NavigationHint
        direction="left"
        onClick={previousScene}
        disabled={currentJourneyIndex === 0}
      />
      <NavigationHint
        direction="right"
        onClick={nextScene}
        disabled={currentJourneyIndex === journeyScenes.length - 1}
      />

      {/* Preview Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: previewDimensions.width,
          height: previewDimensions.height,
          maxWidth: '95vw',
          maxHeight: '85vh',
          position: 'relative',
          borderRadius: previewMode === 'mobile' ? '48px' : '24px',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6)',
          border: `1px solid ${colors.neutral.gray[100]}`,
        }}
      >
        {/* Background Asset */}
        <motion.div
          key={`asset-${currentJourneyIndex}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: imageLoaded ? assetOpacity.hero : 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
          }}
        >
          <img
            src={assetUrl}
            alt=""
            onLoad={() => setImageLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </motion.div>

        {/* Magic Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            background: `
              linear-gradient(
                135deg,
                ${phaseColor}08 0%,
                ${colors.neutral.black}00 50%,
                ${colors.neutral.black}40 100%
              ),
              ${reelOverlay.gradient}
            `,
          }}
        />

        {/* Content Layer */}
        <motion.div
          key={`content-${currentJourneyIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleInteraction}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: previewMode === 'mobile' ? '32px' : '64px',
            cursor: 'pointer',
          }}
        >
          {/* Scene Content */}
          <div style={{ maxWidth: previewMode === 'mobile' ? '100%' : '600px' }}>
            {/* Phase indicator (minimal) */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                fontSize: previewMode === 'mobile' ? '11px' : '12px',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: phaseColor,
                marginBottom: '16px',
                opacity: 0.8,
              }}
            >
              {currentScene.phase}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                fontFamily: fonts.secondary,
                fontSize: previewMode === 'mobile' ? '32px' : '48px',
                fontWeight: '400',
                lineHeight: '1.2',
                color: colors.neutral.white,
                marginBottom: '16px',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              {currentScene.headline}
            </motion.h1>

            {/* Narration (if exists) */}
            {currentScene.narration_text && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                style={{
                  fontFamily: fonts.primary,
                  fontSize: previewMode === 'mobile' ? '14px' : '16px',
                  lineHeight: '1.6',
                  color: colors.neutral.gray[700],
                  maxWidth: '500px',
                }}
              >
                {currentScene.narration_text}
              </motion.p>
            )}

            {/* Interaction hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              style={{
                marginTop: '32px',
                fontSize: '12px',
                color: colors.neutral.gray[400],
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '2px',
                  backgroundColor: colors.neutral.gray[300],
                  borderRadius: '1px',
                }}
              />
              Tap to continue
            </motion.div>
          </div>

          {/* Scene counter (minimal) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              position: 'absolute',
              top: previewMode === 'mobile' ? '32px' : '48px',
              right: previewMode === 'mobile' ? '32px' : '64px',
              fontSize: '12px',
              fontWeight: '500',
              color: colors.neutral.gray[400],
              fontFamily: fonts.mono,
            }}
          >
            {currentJourneyIndex + 1} / {journeyScenes.length}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Data Inspector (bottom, subtle) */}
      {showDataInspector && <SceneDataInspector scene={currentScene} />}
    </div>
  );
}

// Navigation Hint Component
interface NavigationHintProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}

function NavigationHint({ direction, onClick, disabled }: NavigationHintProps) {
  if (disabled) return null;

  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'absolute',
        [direction]: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: surfaces.glass.medium,
        border: `1px solid ${colors.neutral.gray[100]}`,
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: 0.4,
        transition: 'opacity 0.2s ease',
        zIndex: 10,
      }}
    >
      <Icon size={24} style={{ color: colors.neutral.white }} />
    </motion.button>
  );
}

// Scene Data Inspector (for development/QA)
function SceneDataInspector({ scene }: { scene: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: surfaces.solid.elevated,
        border: `1px solid ${colors.neutral.gray[100]}`,
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '450px',
        maxHeight: '500px',
        overflow: 'auto',
        fontSize: '10px',
        fontFamily: fonts.mono,
        color: colors.neutral.gray[600],
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: '600',
          color: colors.neutral.gray[400],
          marginBottom: '12px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${colors.neutral.gray[100]}`,
        }}
      >
        Journey Scene Data Inspector
      </div>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(scene, null, 2)}
      </pre>
    </motion.div>
  );
}