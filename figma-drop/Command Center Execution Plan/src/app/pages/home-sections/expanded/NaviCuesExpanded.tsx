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
import { X, ChevronRight } from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabaseInfo';

interface NaviCuesExpandedProps {
  onClose: () => void;
  mounted: boolean;
}

interface NaviCueType {
  navicue_id: number;
  navicue_name: string;
  navicue_description: string;
  phase: string;
  layer_number: number;
  voice_type: string;
  magic_type: string;
  emotional_tone: string;
  cognitive_mode: string;
}

interface Voice {
  voice_id: number;
  voice_name: string;
  voice_description: string;
}

interface Magic {
  magic_id: number;
  magic_name: string;
  magic_description: string;
}

// Variable field colors
const FIELD_COLORS = {
  phase: colors.brand.purple.light,
  layer: colors.accent.cyan.primary,
  voice: colors.status.amber.bright,
  magic: colors.status.green.bright,
  tone: colors.status.red.bright,
  mode: colors.accent.blue.primary,
};

export function NaviCuesExpanded({ onClose, mounted }: NaviCuesExpandedProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [typeCatalog, setTypeCatalog] = useState<NaviCueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [currentMoment, setCurrentMoment] = useState<NaviCueType | null>(null);
  const [spinningVariables, setSpinningVariables] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        try {
          response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-83873f76/navicues/type-catalog`,
            { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
          );
        } catch (fetchError) {
          console.warn('Network unavailable:', fetchError);
          setTypeCatalog([]);
          setLoading(false);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch type catalog');
        
        const catalogData = await response.json();
        
        // Ensure data is an array
        setTypeCatalog(Array.isArray(catalogData) ? catalogData : []);
        setLoading(false);

        // Deploy first moment after load
        if (Array.isArray(catalogData) && catalogData.length > 0) {
          setTimeout(() => deployNextMoment(catalogData), 1000);
        }
      } catch (error) {
        console.error('Error fetching NaviCue data:', error);
        setTypeCatalog([]);
        setLoading(false);
      }
    };

    if (mounted) {
      fetchData();
    }
  }, [mounted]);

  // Deploy next moment - shows intelligence calculation
  const deployNextMoment = (catalog = typeCatalog) => {
    if (catalog.length === 0) return;

    setCalculating(true);
    setSpinningVariables(true);
    setCurrentMoment(null);

    // Spin variables for 800ms
    setTimeout(() => {
      setSpinningVariables(false);
      // Pick a random moment (in production this would be intelligent matching)
      const randomMoment = catalog[Math.floor(Math.random() * catalog.length)];
      setCurrentMoment(randomMoment);
      setCalculating(false);
    }, 800);
  };

  // Background asset
  const assetUrl = buildAssetUrl('flowstate', 'neurowave', 'dark', '5:4');

  // Variable display data
  const variableFields = currentMoment ? [
    { label: 'Phase', value: currentMoment.phase, color: FIELD_COLORS.phase },
    { label: 'Layer', value: currentMoment.layer_number.toString(), color: FIELD_COLORS.layer },
    { label: 'Voice', value: currentMoment.voice_type, color: FIELD_COLORS.voice },
    { label: 'Magic', value: currentMoment.magic_type, color: FIELD_COLORS.magic },
    { label: 'Tone', value: currentMoment.emotional_tone, color: FIELD_COLORS.tone },
    { label: 'Mode', value: currentMoment.cognitive_mode, color: FIELD_COLORS.mode },
  ] : [];

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
          alt="Neural field"
          animate={{
            opacity: [assetOpacity.section, assetOpacity.section * 0.85, assetOpacity.section],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 10,
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

      {/* Neural overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: `
            radial-gradient(ellipse at 50% 30%, ${colors.brand.purple.light}12 0%, transparent 60%),
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
          e.currentTarget.style.borderColor = `${colors.brand.purple.light}60`;
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
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? spacing.xl : spacing['2xl'],
          padding: isMobile ? spacing.xl : spacing['3xl'],
        }}
      >
        {/* Left Side - The Intelligence Engine */}
        <div
          style={{
            flex: isMobile ? 'none' : '0 0 40%',
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.xl,
            padding: isMobile ? spacing.xl : spacing['2xl'],
            borderRadius: radius['2xl'],
            border: `1px solid ${colors.neutral.gray[100]}`,
            background: frostedGlass.dark.background,
            backdropFilter: frostedGlass.dark.backdropFilter,
          }}
        >
          <div>
            <motion.h2
              animate={{
                opacity: calculating ? [1, 0.5, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                repeat: calculating ? Infinity : 0,
              }}
              style={{
                ...typography.heading.h4,
                color: colors.brand.purple.light,
                marginBottom: spacing.md,
                fontFamily: typography.fontFamily.primary,
                textShadow: `0 0 20px ${colors.brand.purple.light}40`,
              }}
            >
              {calculating ? 'Calculating...' : 'Intelligence'}
            </motion.h2>
          </div>

          {/* Variable Fields - Spinning or Locked */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: spacing.md,
              flex: 1,
            }}
          >
            {spinningVariables ? (
              // Spinning state - blur cycling
              Object.entries(FIELD_COLORS).map(([key, color], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    delay: index * 0.05,
                  }}
                  style={{
                    padding: spacing.md,
                    borderRadius: radius.lg,
                    border: `1px solid ${color}30`,
                    background: `${color}10`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.xs,
                    filter: 'blur(2px)',
                  }}
                >
                  <div
                    style={{
                      ...typography.label.small,
                      color: color,
                      opacity: 0.6,
                    }}
                  >
                    {key.toUpperCase()}
                  </div>
                  <div
                    style={{
                      ...typography.body.small,
                      color: colors.neutral.gray[400],
                    }}
                  >
                    ???
                  </div>
                </motion.div>
              ))
            ) : (
              // Locked state - show actual values
              variableFields.map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.08,
                    ease: animations.easing.default,
                  }}
                  style={{
                    padding: spacing.md,
                    borderRadius: radius.lg,
                    border: `1px solid ${field.color}50`,
                    background: `${field.color}15`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.xs,
                  }}
                >
                  <div
                    style={{
                      ...typography.label.small,
                      color: field.color,
                      textShadow: `0 0 10px ${field.color}60`,
                    }}
                  >
                    {field.label.toUpperCase()}
                  </div>
                  <div
                    style={{
                      ...typography.body.small,
                      color: colors.neutral.white,
                      fontWeight: 500,
                    }}
                  >
                    {field.value}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Complexity indicator */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              ...typography.body.xsmall,
              color: colors.neutral.gray[500],
              textAlign: 'center',
              fontFamily: typography.fontFamily.secondary,
              fontStyle: 'italic',
            }}
          >
            {typeCatalog.length} possibilities
          </motion.div>
        </div>

        {/* Right Side - The Moment Feed */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing['2xl'],
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
              Initializing intelligence...
            </motion.div>
          ) : (
            <>
              {/* Current Moment Card */}
              <AnimatePresence mode="wait">
                {currentMoment && !calculating && (
                  <motion.div
                    key={currentMoment.navicue_id}
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -100 }}
                    transition={{
                      duration: 0.8,
                      ease: animations.easing.default,
                    }}
                    style={{
                      width: '100%',
                      maxWidth: '600px',
                      padding: isMobile ? spacing.xl : spacing['3xl'],
                      borderRadius: radius['2xl'],
                      border: `1px solid ${colors.brand.purple.light}40`,
                      background: frostedGlass.card.background,
                      backdropFilter: frostedGlass.card.backdropFilter,
                      boxShadow: `0 0 40px ${colors.brand.purple.light}20`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Ambient glow */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 50% 0%, ${colors.brand.purple.light}20 0%, transparent 60%)`,
                        pointerEvents: 'none',
                      }}
                    />

                    <div style={{ position: 'relative', zIndex: 2 }}>
                      {/* Type indicator */}
                      <div
                        style={{
                          ...typography.label.medium,
                          color: colors.brand.purple.light,
                          marginBottom: spacing.md,
                          textShadow: `0 0 15px ${colors.brand.purple.light}60`,
                        }}
                      >
                        NAVICUE TYPE {currentMoment.navicue_id}
                      </div>

                      {/* Moment name */}
                      <h3
                        style={{
                          ...typography.heading.h3,
                          color: colors.neutral.white,
                          marginBottom: spacing.lg,
                          fontFamily: typography.fontFamily.primary,
                        }}
                      >
                        {currentMoment.navicue_name}
                      </h3>

                      {/* Moment description */}
                      <p
                        style={{
                          ...typography.body.medium,
                          color: colors.neutral.gray[500],
                          lineHeight: 1.7,
                          marginBottom: spacing.xl,
                        }}
                      >
                        {currentMoment.navicue_description}
                      </p>

                      {/* Phase indicator */}
                      <div
                        style={{
                          ...typography.body.small,
                          color: colors.neutral.gray[600],
                          fontFamily: typography.fontFamily.secondary,
                          fontStyle: 'italic',
                        }}
                      >
                        {currentMoment.phase}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Deploy Next Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => deployNextMoment()}
                disabled={calculating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.sm,
                  padding: `${spacing.md} ${spacing.xl}`,
                  borderRadius: radius.full,
                  border: `1px solid ${colors.brand.purple.light}50`,
                  background: frostedGlass.card.background,
                  backdropFilter: frostedGlass.card.backdropFilter,
                  color: colors.neutral.white,
                  cursor: calculating ? 'not-allowed' : 'pointer',
                  transition: animations.transition.fast,
                  opacity: calculating ? 0.5 : 1,
                  ...typography.ui.button,
                }}
              >
                <span>Next Moment</span>
                <ChevronRight size={20} />
              </motion.button>

              {/* Feed essence */}
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
                  ...typography.body.small,
                  color: colors.neutral.gray[400],
                  fontFamily: typography.fontFamily.secondary,
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}
              >
                Complexity at work, simplicity delivered
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Particle field background - always active */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.15,
          pointerEvents: 'none',
        }}
        width="100%"
        height="100%"
      >
        {Array.from({ length: 50 }).map((_, i) => {
          const cx = Math.random() * 100;
          const cy = Math.random() * 100;
          const delay = Math.random() * 5;
          return (
            <motion.circle
              key={i}
              cx={`${cx}%`}
              cy={`${cy}%`}
              r="2"
              fill={Object.values(FIELD_COLORS)[i % 6]}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
              }}
              style={{
                filter: `drop-shadow(0 0 4px ${Object.values(FIELD_COLORS)[i % 6]})`,
              }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}