/**
 * REEL SCROLLYTELLING COMPONENT
 * 
 * Interactive reel-style scrollytelling section with 7 scenes
 * Apple-grade navigation controls and frosted glass aesthetic
 * 
 * Features:
 * - 7 scenes with dynamic content and backgrounds
 * - Arrow navigation controls
 * - Auto-advance to next scene
 * - Restart from beginning when reaching the end
 * - Scene counter (1/7)
 * - Keyboard navigation (arrow keys)
 * - Full-brightness assets with glass text overlays
 * - Tokenized content and styling
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassTextEtched, GlassTextSubtle, GlassTextEyebrow } from '@/app/components/marketing/GlassText';
import { 
  buildAssetUrl, 
  assetOpacity, 
  reelOverlay,
  frostedGlass,
  animations,
  isMobileViewport,
} from '@/marketing-tokens';
import { colors, surfaces } from '@/design-tokens';
import { reelScenes, type ReelScene } from '@/content-tokens';

// ==========================================
// TYPES
// ==========================================

interface ReelScrollytellingProps {
  mounted?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export function ReelScrollytelling({ mounted = true }: ReelScrollytellingProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isPaused, setIsPaused] = useState(false);

  const scene = reelScenes[currentScene];

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileViewport());
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-advance to next scene
  useEffect(() => {
    if (!mounted || isPaused) return;

    const autoAdvanceTimer = setTimeout(() => {
      if (currentScene < reelScenes.length - 1) {
        setDirection('forward');
        setCurrentScene(prev => prev + 1);
      }
    }, 5000); // Auto-advance after 5 seconds

    return () => clearTimeout(autoAdvanceTimer);
  }, [mounted, currentScene, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mounted, currentScene]);

  // Navigation handlers
  const handleNext = () => {
    setIsPaused(true); // Pause auto-advance when user manually navigates
    if (currentScene < reelScenes.length - 1) {
      setDirection('forward');
      setCurrentScene(prev => prev + 1);
    }
    // Resume auto-advance after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handlePrevious = () => {
    setIsPaused(true); // Pause auto-advance when user manually navigates
    if (currentScene > 0) {
      setDirection('backward');
      setCurrentScene(prev => prev - 1);
    }
    // Resume auto-advance after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleRestart = () => {
    setIsPaused(false);
    setDirection('backward');
    setCurrentScene(0);
  };

  // Build asset URL for current scene
  const aspectRatio = isMobile ? '3:4' : '5:4';
  const assetUrl = buildAssetUrl(
    scene.assetFamily as any,
    scene.assetVariant as any,
    scene.assetMode,
    aspectRatio
  );

  return (
    <section 
      className="relative w-full h-screen flex items-center justify-center"
      style={{
        position: 'relative', // Required for scroll offset calculations with whileInView
        backgroundColor: surfaces.solid.base,
      }}
    >
      {/* Background Image with Crossfade */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          >
            <img 
              src={assetUrl}
              alt="Scene background"
              loading="lazy"
              className="w-full h-full object-cover"
              style={{
                opacity: assetOpacity.section,
              }}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Reel Overlay - gradient darkening */}
        <div 
          className="absolute inset-0"
          style={{
            background: reelOverlay.background,
          }}
        />
      </div>

      {/* Content Panel with Ultra-Light Glass Effect */}
      <div 
        className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 py-20"
        style={{
          background: frostedGlass.ultraLight.background,
          backdropFilter: frostedGlass.ultraLight.backdropFilter,
          WebkitBackdropFilter: frostedGlass.ultraLight.backdropFilter,
        }}
      >
        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto text-center flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScene}
              custom={direction}
              initial={(dir) => ({
                opacity: 0,
                y: dir === 'forward' ? 40 : -40,
              })}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={(dir) => ({
                opacity: 0,
                y: dir === 'forward' ? -40 : 40,
              })}
              transition={{
                duration: 1,
                ease: animations.easing.default.split('(')[1].split(')')[0].split(',').map(Number) as any,
              }}
              className="space-y-8"
            >
              {/* Eyebrow */}
              <GlassTextEyebrow 
                as="p" 
                className="font-body mb-8"
              >
                {scene.eyebrow}
              </GlassTextEyebrow>

              {/* Headline + Subheadline */}
              <div className="mb-8">
                <GlassTextEtched 
                  as="h2" 
                  className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight"
                >
                  {scene.headline}
                </GlassTextEtched>
                
                <GlassTextSubtle 
                  as="h3" 
                  className="font-display text-4xl md:text-5xl lg:text-6xl font-light italic mt-4"
                >
                  {scene.subheadline}
                </GlassTextSubtle>
              </div>

              {/* Body */}
              <GlassTextSubtle 
                as="p" 
                className="font-body text-base md:text-lg font-light tracking-wide max-w-md mx-auto opacity-75"
              >
                {scene.body}
              </GlassTextSubtle>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls - Bottom Center */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
          {/* Left Arrow */}
          <motion.button
            onClick={handlePrevious}
            disabled={currentScene === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: colors.neutral.gray[100], // Tokenized — was hardcoded rgba(255,255,255,0.1)
              cursor: currentScene === 0 ? 'not-allowed' : 'pointer',
              opacity: currentScene === 0 ? 0.3 : 1,
            }}
            aria-label="Previous scene"
          >
            <ChevronLeft 
              className="w-6 h-6"
              style={{ 
                color: colors.accent.cyan.primary,
              }}
            />
          </motion.button>

          {/* Scene Counter */}
          <div className="text-center min-w-16">
            <div 
              className="font-display text-sm font-light"
              style={{
                color: colors.accent.cyan.primary,
              }}
            >
              <span>{currentScene + 1}</span> / {reelScenes.length}
            </div>
          </div>

          {/* Right Arrow or Restart Button */}
          {currentScene === reelScenes.length - 1 ? (
            <motion.button
              onClick={handleRestart}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="px-4 py-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: `${colors.accent.cyan.primary}33`, // Cyan at 20% — was hardcoded rgba(64,224,208,0.2)
                border: `1px solid ${colors.accent.cyan.primary}`,
                cursor: 'pointer',
              }}
              aria-label="Restart from beginning"
            >
              <span 
                className="font-body text-xs font-light tracking-wide"
                style={{ color: colors.accent.cyan.primary }}
              >
                RESTART
              </span>
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: colors.neutral.gray[100], // Tokenized — was hardcoded rgba(255,255,255,0.1)
                cursor: 'pointer',
              }}
              aria-label="Next scene"
            >
              <ChevronRight 
                className="w-6 h-6"
                style={{ 
                  color: colors.accent.cyan.primary,
                }}
              />
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}

// Export as default and named
export default ReelScrollytelling;