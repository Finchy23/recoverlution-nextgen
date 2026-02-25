import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, surfaces, radius, typography, spacing } from '@/design-tokens';
import { 
  buildAssetUrl, 
  assetOpacity, 
  reelOverlay, 
  frostedGlass,
  animations 
} from '@/marketing-tokens';
import { X } from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabaseInfo';

interface JourneysExpandedProps {
  onClose: () => void;
  mounted: boolean;
}

interface Scene {
  id: string;
  scene_name: string;
  scene_description: string;
  era: string;
  phase: string;
  voice_type: string;
  magic_type: string;
}

// ERA color mapping
const ERA_COLORS: Record<string, string> = {
  'Foundation': colors.accent.blue.primary,
  'Emergence': colors.brand.purple.light,
  'Reclamation': colors.status.green.bright,
  'Evolution': colors.accent.cyan.primary,
};

export function JourneysExpanded({ onClose, mounted }: JourneysExpandedProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentERA, setCurrentERA] = useState<string>('Foundation');
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch journey scenes
  useEffect(() => {
    const fetchScenes = async () => {
      try {
        let response;
        try {
          response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-83873f76/journeys/template-scenes`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
              },
            }
          );
        } catch (fetchError) {
          console.warn('Network unavailable:', fetchError);
          setScenes([]);
          setLoading(false);
          return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch scenes');
        
        const data = await response.json();
        // Ensure data is an array
        setScenes(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching journey scenes:', error);
        setScenes([]);
        setLoading(false);
      }
    };

    if (mounted) {
      fetchScenes();
    }
  }, [mounted]);

  // Cycle through ERAs
  useEffect(() => {
    const eras = Object.keys(ERA_COLORS);
    let currentIndex = eras.indexOf(currentERA);
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % eras.length;
      setCurrentERA(eras[currentIndex]);
    }, 8000);

    return () => clearInterval(interval);
  }, [currentERA]);

  // Get scenes for current ERA
  const eraScenes = scenes.filter(scene => scene.era === currentERA);
  const eraColor = ERA_COLORS[currentERA] || colors.accent.cyan.primary;

  // Handle scene engagement (dissolve into world)
  const handleSceneEngage = (sceneId: string) => {
    setSelectedScene(sceneId);
    setTimeout(() => {
      setSelectedScene(null);
    }, 1500);
  };

  // Background asset
  const assetUrl = buildAssetUrl('neuralflower', 'transformation', 'light', '5:4');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: surfaces.solid.base,
        overflow: 'hidden',
      }}
    >
      {/* Background Asset */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <motion.img
          src={assetUrl}
          alt="Journey canvas"
          animate={{
            opacity: [assetOpacity.section, assetOpacity.section * 0.9, assetOpacity.section],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: assetOpacity.section,
          }}
        />
      </div>

      {/* ERA-based atmospheric gradient overlay */}
      <motion.div
        key={currentERA}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `
            radial-gradient(ellipse at center top, ${eraColor}15 0%, transparent 50%),
            ${reelOverlay.background}
          `,
        }}
      />

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          top: isMobile ? spacing.lg : spacing.xl,
          right: isMobile ? spacing.lg : spacing.xl,
          zIndex: 100,
          width: '48px',
          height: '48px',
          borderRadius: radius.full,
          border: `1px solid ${colors.neutral.gray[200]}`,
          backgroundColor: frostedGlass.dark.background,
          backdropFilter: frostedGlass.dark.backdropFilter,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.neutral.white,
          transition: animations.transition.fast,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = frostedGlass.card.background;
          e.currentTarget.style.borderColor = `${eraColor}60`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = frostedGlass.dark.background;
          e.currentTarget.style.borderColor = colors.neutral.gray[200];
        }}
      >
        <X size={20} />
      </motion.button>

      {/* Content Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: isMobile ? spacing.xl : spacing['3xl'],
          paddingTop: isMobile ? spacing['2xl'] : spacing['4xl'],
        }}
      >
        {/* ERA Display - Breathing atmospheric presence */}
        <motion.div
          key={currentERA}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 1.5, ease: animations.easing.default }}
          style={{
            textAlign: 'center',
            marginBottom: isMobile ? spacing['2xl'] : spacing['3xl'],
          }}
        >
          {/* ERA Name */}
          <motion.h1
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              ...typography.display.hero,
              color: eraColor,
              textShadow: `0 0 40px ${eraColor}60, 0 0 80px ${eraColor}30`,
              marginBottom: spacing.sm,
              fontFamily: typography.fontFamily.primary,
            }}
          >
            {currentERA}
          </motion.h1>
        </motion.div>

        {/* Seeds/Scenes Container - Floating horizontal timeline */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {loading ? (
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              style={{
                ...typography.body.large,
                color: colors.neutral.gray[500],
              }}
            >
              Loading seeds...
            </motion.div>
          ) : eraScenes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              style={{
                ...typography.body.medium,
                color: colors.neutral.gray[400],
              }}
            >
              No seeds planted yet
            </motion.div>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: isMobile ? spacing.xl : spacing['2xl'],
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: '1400px',
                padding: spacing.xl,
              }}
            >
              {eraScenes.map((scene, index) => {
                const isSelected = selectedScene === scene.id;
                
                return (
                  <AnimatePresence key={scene.id}>
                    {!isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1, 
                          y: [0, -10, 0],
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.3,
                          y: -100,
                          transition: { duration: 1.5, ease: animations.easing.default }
                        }}
                        transition={{
                          duration: 0.8,
                          delay: index * 0.15,
                          y: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.3,
                          }
                        }}
                        whileHover={{ scale: 1.05, y: -15 }}
                        onClick={() => handleSceneEngage(scene.id)}
                        style={{
                          minWidth: isMobile ? '280px' : '320px',
                          maxWidth: isMobile ? '280px' : '320px',
                          padding: spacing['2xl'],
                          borderRadius: radius['2xl'],
                          border: `1px solid ${eraColor}30`,
                          background: frostedGlass.card.background,
                          backdropFilter: frostedGlass.card.backdropFilter,
                          cursor: 'pointer',
                          transition: animations.transition.default,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Seed glow */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: `radial-gradient(circle at 50% 50%, ${eraColor}20 0%, transparent 70%)`,
                            opacity: 0.5,
                            pointerEvents: 'none',
                          }}
                        />

                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 2 }}>
                          <h3
                            style={{
                              ...typography.heading.h5,
                              color: colors.neutral.white,
                              marginBottom: spacing.sm,
                              fontFamily: typography.fontFamily.primary,
                            }}
                          >
                            {scene.scene_name}
                          </h3>
                          <p
                            style={{
                              ...typography.body.small,
                              color: colors.neutral.gray[500],
                              lineHeight: 1.6,
                            }}
                          >
                            {scene.scene_description}
                          </p>
                        </div>

                        {/* Particle dissolution effect */}
                        <motion.div
                          animate={{
                            opacity: [0, 0.3, 0],
                            scale: [0.8, 1.2, 1.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                          style={{
                            position: 'absolute',
                            inset: -20,
                            border: `2px solid ${eraColor}`,
                            borderRadius: radius['2xl'],
                            pointerEvents: 'none',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>
          )}
        </div>

        {/* Threshold indicator - subtle */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            textAlign: 'center',
            paddingTop: spacing.xl,
            ...typography.body.small,
            color: colors.neutral.gray[400],
            fontFamily: typography.fontFamily.secondary,
            fontStyle: 'italic',
          }}
        >
          Seeds planted become experiences lived
        </motion.div>
      </div>
    </motion.div>
  );
}