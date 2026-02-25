import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAsset } from '@/utils/assets';
import { useLazyBackground } from '@/hooks/useLazyBackground';
import { getOperatingTruthFeatureAsset, assetOpacity, reelOverlay } from '@/marketing-tokens';
import { Calendar, Compass, Activity, Heart, Package, Music, Navigation, TrendingUp, type LucideIcon } from 'lucide-react';
import { colors, surfaces, spacing, radius } from '@/design-tokens';

interface ComponentOneOperatingTruthSection4Props {
  mounted: boolean;
}

interface SubFeature {
  name: string;
  description: string;
}

interface Feature {
  id: number;
  shortName: string;
  icon: LucideIcon;
  layer: string;
  name: string;
  label: string;
  promise: string;
  whyItMatters: string;
  subFeatures: SubFeature[];
  accentColor: string;
  backgroundAsset: {
    collection: string;
    name: string;
    variant: 'light' | 'dark';
  };
}

const features: Feature[] = [
  {
    id: 1,
    shortName: 'JOURNEYS',
    icon: Calendar,
    layer: 'The Baseline Layer',
    name: 'Journeys',
    label: 'Your weekly rhythm',
    promise: 'The story shifts as behaviour repeats.',
    whyItMatters: 'Consistency is how defaults change.',
    subFeatures: [
      { name: 'A weekly chapter', description: 'One focus to install.' },
      { name: 'Guided experiences', description: 'You feel. You recognise.' },
      { name: 'A cadence', description: 'A rhythm you can trust.' },
      { name: 'Insight roots', description: 'Proven in the wild.' },
      { name: 'A change', description: 'One small adjustment.' },
      { name: 'Baseline, updated.', description: 'Mindblock calibrated.' },
    ],
    accentColor: colors.accent.blue.primary, // Changed from brand.purple.mid - blue carries better for baseline rhythm
    backgroundAsset: { collection: 'evolvingforms', name: 'skypattern', variant: 'light' },
  },
  {
    id: 2,
    shortName: 'CUES',
    icon: Compass,
    layer: 'The Moment Layer',
    name: 'NaviCues',
    label: 'Your momentum',
    promise: 'Tiny experiences. Real conditions.',
    whyItMatters: 'Small completions rewire faster than big plans.',
    subFeatures: [
      { name: 'Sparks', description: 'Quick cognitive shifts' },
      { name: 'Bridges', description: 'Pattern-to-choice transitions' },
      { name: 'Scans', description: 'Body-first resets' },
      { name: 'Threads', description: 'Values and meaning prompts' },
      { name: 'Mirrors', description: 'Statement reflection' },
      { name: 'Keys', description: 'Paradox and perspective unlocks' },
      { name: 'Stamps', description: 'Proof markers' },
    ],
    accentColor: colors.status.amber.bright,
    backgroundAsset: { collection: 'mindblock', name: 'integration', variant: 'light' },
  },
  {
    id: 3,
    shortName: 'SENSE',
    icon: Activity,
    layer: 'The Signals Layer',
    name: 'Sense Check',
    label: 'Three Signals',
    promise: 'The system maps to you.',
    whyItMatters: 'The right step depends on what\'s available.',
    subFeatures: [
      { name: 'Energy', description: 'What you have' },
      { name: 'Clarity', description: 'What you see' },
      { name: 'Anchorage', description: 'What holds you' },
    ],
    accentColor: colors.accent.cyan.primary,
    backgroundAsset: { collection: 'neuralflower', name: 'blossom', variant: 'light' },
  },
  {
    id: 4,
    shortName: 'STUDIO',
    icon: Heart,
    layer: 'The Body Layer',
    name: 'Wellbeing Studio',
    label: 'Regulation First',
    promise: 'Find your flow.',
    whyItMatters: 'The nervous system sets the ceiling.',
    subFeatures: [
      { name: 'Guided Sessions', description: 'Deliberate series, not a content dump' },
      { name: 'Your Rhythm', description: 'Schedule what steadies you' },
      { name: 'Foundations', description: 'Breath, movement, stillness, nourishment' },
    ],
    accentColor: colors.status.green.mid,
    backgroundAsset: { collection: 'evolvingforms', name: 'transition', variant: 'light' },
  },
  {
    id: 5,
    shortName: 'TOOLKIT',
    icon: Package,
    layer: 'The Meaning Layer',
    name: 'Toolkit',
    label: 'Depth on Demand',
    promise: 'Context you can carry.',
    whyItMatters: 'Meaning lands when capacity is there.',
    subFeatures: [
      { name: 'Articles', description: 'The calm line' },
      { name: 'Insights', description: 'The deeper why' },
      { name: 'Practices', description: 'Standalone components' },
      { name: 'Bag', description: 'Keep what becomes yours' },
    ],
    accentColor: colors.accent.cyan.light, // Changed from brand.purple.light - cyan carries better for meaning/depth
    backgroundAsset: { collection: 'mindblock', name: 'microspheres+defusion', variant: 'light' },
  },
  {
    id: 6,
    shortName: 'PLAY',
    icon: Music,
    layer: 'The Story Layer',
    name: 'Play',
    label: 'change the narrative',
    promise: 'The soundtrack to your recovery.',
    whyItMatters: 'Identity installation. Not ideology.',
    subFeatures: [
      { name: 'Your Story', description: 'You download. We Play.' },
      { name: 'Library', description: 'Curated spiritual soundbites' },
      { name: 'Sparks', description: 'Power affirmations' },
      { name: 'Flames', description: 'Contextual depth' },
      { name: 'Embers', description: 'Therapeutic flow' },
      { name: 'Beat Mode', description: 'Raw or tuned to the moment' },
    ],
    accentColor: colors.status.amber.mid,
    backgroundAsset: { collection: 'evolvingforms', name: 'balance', variant: 'dark' },
  },
  {
    id: 7,
    shortName: 'NAVIGATE',
    icon: Navigation,
    layer: 'The Pathway Layer',
    name: 'Navigate',
    label: 'Guided pathways',
    promise: 'The map adapts to where you are.',
    whyItMatters: 'Direction matters more than speed.',
    subFeatures: [
      { name: 'Intelligent Routing', description: 'System selects your next step' },
      { name: 'Phase Awareness', description: 'SENSE → ROUTE → DELIVER → SEAL' },
      { name: 'Adaptive Pathways', description: 'Responds to your signals' },
      { name: 'Clear Progression', description: 'You always know what\'s next' },
    ],
    accentColor: colors.accent.cyan.primary, // Changed to cyan.primary (same as Sense Check) - navigation needs strong visibility
    backgroundAsset: { collection: 'mindblock', name: 'integration', variant: 'light' },
  },
  {
    id: 8,
    shortName: 'MOMENTUM',
    icon: TrendingUp,
    layer: 'The Progress Layer',
    name: 'Momentum',
    label: 'Streaks and consistency',
    promise: 'Small wins compound.',
    whyItMatters: 'Proof of progress builds belief.',
    subFeatures: [
      { name: 'Daily Streaks', description: 'Track your consistency' },
      { name: 'Completion Patterns', description: 'See your rhythm emerge' },
      { name: 'Progress Markers', description: 'Milestones that matter' },
      { name: 'Recovery Momentum', description: 'Forward motion you can feel' },
    ],
    accentColor: colors.status.green.bright,
    backgroundAsset: { collection: 'neuralflower', name: 'blossom', variant: 'light' },
  },
];

export function ComponentOneOperatingTruthSection4({ mounted }: ComponentOneOperatingTruthSection4Props) {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [subFeaturePage, setSubFeaturePage] = useState(0);

  // Lazy background hooks for all 8 features - using tokenized assets (removed LUMA & ERA)
  const bg1 = useLazyBackground(getOperatingTruthFeatureAsset(1, isMobile), 'evolvingforms', 'skypattern');
  const bg2 = useLazyBackground(getOperatingTruthFeatureAsset(2, isMobile), 'mindblock', 'integration');
  const bg3 = useLazyBackground(getOperatingTruthFeatureAsset(3, isMobile), 'neuralflower', 'blossom');
  const bg4 = useLazyBackground(getOperatingTruthFeatureAsset(4, isMobile), 'evolvingforms', 'transition');
  const bg5 = useLazyBackground(getOperatingTruthFeatureAsset(5, isMobile), 'mindblock', 'microspheres+defusion');
  const bg6 = useLazyBackground(getOperatingTruthFeatureAsset(6, isMobile), 'evolvingforms', 'balance');
  const bg7 = useLazyBackground(getOperatingTruthFeatureAsset(7, isMobile), 'mindblock', 'integration');
  const bg8 = useLazyBackground(getOperatingTruthFeatureAsset(8, isMobile), 'neuralflower', 'blossom');

  const featureBgs = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expandedFeature !== null) {
        setExpandedFeature(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mounted, expandedFeature]);

  // Reset page when feature changes
  useEffect(() => {
    setSubFeaturePage(0);
  }, [expandedFeature]);

  return (
    <section 
      className="relative w-full transition-all duration-1000"
      style={{
        position: 'relative', // Required for scroll offset calculations with whileInView
        backgroundColor: surfaces.solid.base,
        overflow: 'hidden',
        padding: isMobile 
          ? `${spacing['3xl']} 0` // Mobile: 96px top/bottom, NO side padding
          : `120px 0`, // Desktop: 120px top/bottom, NO side padding
      }}
    >
      {/* Background Asset Layer */}
      <div className="absolute inset-0">
        <img 
          src="https://wzeqlkbmqxlsjryidagf.supabase.co/storage/v1/object/public/recoverlution-assets/flowstate/5:4/avif/flowstate_abstract_accelerate_light.avif"
          alt="" 
          className="w-full h-full object-cover"
          style={{
            opacity: assetOpacity.hero,
          }}
        />
        
        {/* Reel Overlay - subtle gradient darkening */}
        <div 
          className="absolute inset-0"
          style={{
            background: reelOverlay.background,
          }}
        />
      </div>

      {/* Feature Grid - Rich Cards */}
      <div 
        className="grid mx-auto relative z-10"
        style={{
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', // 4 columns for 8 tiles (2 rows of 4)
          gap: isMobile ? '16px' : '20px', // Increased gap for better spacing
          maxWidth: isMobile ? '100%' : '1200px', // Slightly narrower max-width
        }}
      >
        {features.map((feature, i) => {
          const Icon = feature.icon;
          const bg = featureBgs[i];
          const isHovered = hoveredCard === i;
          
          return (
            <motion.button
              key={feature.id}
              onClick={() => setExpandedFeature(i)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative overflow-hidden group"
              style={{
                aspectRatio: isMobile ? '1 / 1.25' : '1 / 1.1', // Slightly taller on mobile, more square on desktop
                borderRadius: isMobile ? radius.lg : radius.xl,
                border: `1px solid ${feature.accentColor}${isHovered ? '60' : '30'}`,
                backgroundColor: 'rgba(17, 23, 30, 0.8)',
                cursor: 'pointer',
                transition: 'all 0.3s ease-out',
              }}
              aria-label={`Explore ${feature.name}`}
            >
              {/* Background Asset Preview */}
              <div
                ref={bg.ref}
                className="absolute inset-0 transition-all duration-500"
                style={{
                  ...bg.style,
                  opacity: isHovered ? 0.4 : 0.4, // UPDATED: Consistent 0.4 opacity (standard system)
                }}
                role={bg.role}
                aria-label={bg.ariaLabel}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-between text-center" style={{
                padding: isMobile ? '16px' : '20px', // Increased padding
              }}>
                {/* Icon */}
                <motion.div
                  animate={{
                    rotate: isHovered ? [0, 5, -5, 0] : 0,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                >
                  <Icon 
                    size={isMobile ? 32 : 36} // Slightly larger icons
                    style={{ 
                      color: feature.accentColor,
                      opacity: 0.9,
                    }} 
                  />
                </motion.div>

                {/* Bottom Content */}
                <div className="w-full">
                  {/* Layer tag */}
                  <div
                    style={{
                      fontSize: isMobile ? '9px' : '10px', // Slightly larger
                      color: feature.accentColor,
                      letterSpacing: '0.15em',
                      textTransform: 'lowercase',
                      fontWeight: '600',
                      marginBottom: '8px',
                      opacity: 0.8,
                    }}
                  >
                    {feature.layer}
                  </div>

                  {/* Name */}
                  <div
                    style={{
                      fontSize: isMobile ? '16px' : '18px', // Increased font size
                      fontWeight: '700',
                      color: colors.neutral.white,
                      marginBottom: '6px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {feature.name}
                  </div>

                  {/* Label */}
                  <div
                    style={{
                      fontSize: isMobile ? '10px' : '11px', // Slightly larger
                      color: colors.neutral.gray[500],
                      fontStyle: 'italic',
                    }}
                  >
                    {feature.label}
                  </div>
                </div>
              </div>

              {/* Hover Glow */}
              {isHovered && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: `radial-gradient(circle at center, ${feature.accentColor}20, transparent 70%)`,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Feature Modal - Fullscreen */}
      <AnimatePresence>
        {expandedFeature !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backgroundColor: `${surfaces.solid.base}CC`, // 80% opacity of 11171E
              backdropFilter: 'blur(20px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
              padding: isMobile ? spacing.sm : spacing.xl,
            }}
            onClick={() => setExpandedFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full overflow-hidden"
              style={{
                maxWidth: isMobile ? '100%' : '1000px',
                maxHeight: isMobile ? '90vh' : '80vh',
                borderRadius: isMobile ? radius['2xl'] : radius['3xl'],
                border: `2px solid ${features[expandedFeature].accentColor}60`,
                backgroundColor: 'rgba(17, 23, 30, 0.98)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Asset - Full Opacity */}
              <div
                ref={featureBgs[expandedFeature].ref}
                className="absolute inset-0"
                style={{
                  ...featureBgs[expandedFeature].style,
                  opacity: 0.5,
                  pointerEvents: 'none',
                }}
              />

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, rgba(17, 23, 30, 0.5) 0%, rgba(17, 23, 30, 0.95) 100%)`,
                  pointerEvents: 'none',
                }}
              />

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedFeature(null);
                }}
                className="absolute z-10"
                style={{
                  top: isMobile ? spacing.sm : spacing.md,
                  right: isMobile ? spacing.sm : spacing.md,
                  width: isMobile ? '44px' : '40px',
                  height: isMobile ? '44px' : '40px',
                  borderRadius: radius.lg, // Icon container = radius.lg per design system
                  backgroundColor: 'rgba(236, 239, 229, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(236, 239, 229, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(236, 239, 229, 0.1)';
                }}
                aria-label="Close"
              >
                <X size={isMobile ? 22 : 20} style={{ color: colors.neutral.white }} />
              </button>

              {/* Scrollable Content */}
              <div 
                className="relative z-10 h-full overflow-y-auto"
                style={{
                  padding: isMobile ? spacing.section.content.mobile : `${spacing['3xl']} ${spacing['2xl']}`,
                }}
              >
                <div className="text-center max-w-3xl mx-auto">
                  {/* Icon - Large */}
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="flex justify-center"
                    style={{
                      marginBottom: isMobile ? '16px' : '24px',
                    }}
                  >
                    {(() => {
                      const Icon = features[expandedFeature].icon;
                      return (
                        <Icon 
                          size={isMobile ? 48 : 64} 
                          style={{ 
                            color: features[expandedFeature].accentColor,
                            opacity: 0.9,
                          }} 
                        />
                      );
                    })()}
                  </motion.div>

                  {/* Layer Tag */}
                  <div
                    style={{
                      fontSize: isMobile ? '10px' : '11px',
                      color: features[expandedFeature].accentColor,
                      letterSpacing: '0.2em',
                      textTransform: 'lowercase',
                      fontWeight: '600',
                      marginBottom: isMobile ? '12px' : '16px',
                      opacity: 0.7,
                    }}
                  >
                    {features[expandedFeature].layer}
                  </div>

                  {/* Feature Name */}
                  <h2
                    style={{
                      fontSize: isMobile ? 'clamp(36px, 10vw, 56px)' : 'clamp(56px, 7vw, 72px)',
                      fontWeight: '700',
                      color: colors.neutral.white,
                      lineHeight: '1.1',
                      marginBottom: isMobile ? '12px' : '16px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {features[expandedFeature].name}
                  </h2>

                  {/* Label */}
                  <div
                    style={{
                      fontSize: isMobile ? '14px' : '16px',
                      color: colors.neutral.gray[500],
                      fontStyle: 'italic',
                      marginBottom: isMobile ? '24px' : '32px',
                    }}
                  >
                    {features[expandedFeature].label}
                  </div>

                  {/* Promise */}
                  <div
                    style={{
                      fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : 'clamp(24px, 3vw, 32px)',
                      color: features[expandedFeature].accentColor,
                      fontStyle: 'italic',
                      lineHeight: '1.4',
                      marginBottom: isMobile ? '16px' : '20px',
                    }}
                  >
                    {features[expandedFeature].promise}
                  </div>

                  {/* Why It Matters */}
                  <div
                    style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: colors.neutral.gray[600],
                      fontStyle: 'italic',
                      marginBottom: isMobile ? '32px' : '48px',
                    }}
                  >
                    {features[expandedFeature].whyItMatters}
                  </div>

                  {/* Sub-features with Pagination */}
                  {(() => {
                    const currentFeature = features[expandedFeature];
                    const totalSubFeatures = currentFeature.subFeatures.length;
                    const itemsPerPage = 4;
                    const totalPages = Math.ceil(totalSubFeatures / itemsPerPage);
                    const startIndex = subFeaturePage * itemsPerPage;
                    const endIndex = Math.min(startIndex + itemsPerPage, totalSubFeatures);
                    const visibleSubFeatures = currentFeature.subFeatures.slice(startIndex, endIndex);
                    const showPagination = totalSubFeatures > itemsPerPage;

                    return (
                      <>
                        <div
                          className="grid gap-3"
                          style={{
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                          }}
                        >
                          {visibleSubFeatures.map((sub, i) => (
                            <motion.div
                              key={`expanded-sub-${startIndex + i}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ 
                                duration: 0.3, 
                                delay: 0.1 + (i * 0.05),
                              }}
                              style={{
                                padding: isMobile ? `${spacing.sm} ${spacing.sm}` : `${spacing.sm} ${spacing.sm}`,
                                background: `${colors.neutral.gray[900]}50`,
                                border: `1px solid ${currentFeature.accentColor}30`,
                                borderRadius: radius.lg,
                                backdropFilter: 'blur(10px)',
                                textAlign: 'left',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: isMobile ? '13px' : '14px',
                                  fontWeight: '600',
                                  color: colors.neutral.gray[300],
                                  marginBottom: '4px',
                                }}
                              >
                                {sub.name}
                              </div>
                              <div
                                style={{
                                  fontSize: isMobile ? '11px' : '12px',
                                  color: colors.neutral.gray[600],
                                  lineHeight: '1.5',
                                }}
                              >
                                {sub.description}
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        {showPagination && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center gap-4"
                            style={{
                              marginTop: isMobile ? '24px' : '32px',
                            }}
                          >
                            {/* Previous Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubFeaturePage(Math.max(0, subFeaturePage - 1));
                              }}
                              disabled={subFeaturePage === 0}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: subFeaturePage === 0 ? 'rgba(236, 239, 229, 0.05)' : 'rgba(236, 239, 229, 0.1)',
                                border: `1px solid ${subFeaturePage === 0 ? 'rgba(255, 255, 255, 0.1)' : currentFeature.accentColor + '40'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: subFeaturePage === 0 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease-out',
                                opacity: subFeaturePage === 0 ? 0.3 : 1,
                              }}
                              aria-label="Previous page"
                            >
                              <ChevronLeft size={20} style={{ color: colors.neutral.white }} />
                            </button>

                            {/* Page Indicator */}
                            <div
                              style={{
                                fontSize: isMobile ? '11px' : '12px',
                                color: currentFeature.accentColor,
                                fontWeight: '600',
                                letterSpacing: '0.05em',
                                minWidth: '60px',
                                textAlign: 'center',
                              }}
                            >
                              {subFeaturePage + 1} / {totalPages}
                            </div>

                            {/* Next Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSubFeaturePage(Math.min(totalPages - 1, subFeaturePage + 1));
                              }}
                              disabled={subFeaturePage === totalPages - 1}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: subFeaturePage === totalPages - 1 ? 'rgba(236, 239, 229, 0.05)' : 'rgba(236, 239, 229, 0.1)',
                                border: `1px solid ${subFeaturePage === totalPages - 1 ? 'rgba(255, 255, 255, 0.1)' : currentFeature.accentColor + '40'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: subFeaturePage === totalPages - 1 ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease-out',
                                opacity: subFeaturePage === totalPages - 1 ? 0.3 : 1,
                              }}
                              aria-label="Next page"
                            >
                              <ChevronRight size={20} style={{ color: colors.neutral.white }} />
                            </button>
                          </motion.div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}