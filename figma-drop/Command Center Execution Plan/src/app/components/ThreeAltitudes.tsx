import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, spacing, surfaces, radius } from '@/design-tokens';
import { Circle } from 'lucide-react';
import { buildAssetUrl, assetOpacity, frostedGlass, reelOverlay } from '@/marketing-tokens';

interface ThreeAltitudesProps {
  mounted: boolean;
}

interface Altitude {
  id: number;
  audience: string;
  productName: string;
  headline: string;
  subline: string;
  color: string;
  assetFamily: 'mindblock' | 'neuralflow' | 'flowstate';
  assetVariant: string;
  assetMode: 'light' | 'dark';
}

const altitudes: Altitude[] = [
  {
    id: 0,
    audience: 'FOR INDIVIDUALS',
    productName: 'Your Companion',
    headline: 'Recovery becomes\nwho you are.',
    subline: 'One step. One rep. Until stability feels normal.',
    color: colors.status.green.bright,
    assetFamily: 'mindblock',
    assetVariant: 'integration',
    assetMode: 'light',
  },
  {
    id: 1,
    audience: 'FOR PROFESSIONALS',
    productName: 'Your Console',
    headline: 'Your work,\ncarried forward.',
    subline: 'Real life becomes signal. Sessions become precision.',
    color: colors.accent.cyan.primary,
    assetFamily: 'neuralflow',
    assetVariant: 'flourish',
    assetMode: 'light',
  },
  {
    id: 2,
    audience: 'FOR ORGANISATIONS',
    productName: 'Your Core',
    headline: 'Continuity\nat scale.',
    subline: 'Consistent. Governable. Measurable. Human.',
    color: colors.brand.purple.light,
    assetFamily: 'flowstate',
    assetVariant: 'upward+shift',
    assetMode: 'light',
  },
];

export function ThreeAltitudes({ mounted }: ThreeAltitudesProps) {
  const [currentAltitude, setCurrentAltitude] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const altitude = altitudes[currentAltitude];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (!mounted || !isPlaying) return;

    timerRef.current = setInterval(() => {
      setCurrentAltitude((prev) => {
        if (prev === altitudes.length - 1) {
          // Loop back to first altitude and keep playing
          setDirection('forward');
          return 0;
        } else {
          setDirection('forward');
          return prev + 1;
        }
      });
    }, 7000); // 7 seconds per altitude

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mounted, isPlaying]);

  // Keyboard navigation
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setIsPlaying(false);
        if (currentAltitude < altitudes.length - 1) {
          setDirection('forward');
          setCurrentAltitude(prev => prev + 1);
        } else {
          setDirection('forward');
          setCurrentAltitude(0);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setIsPlaying(false);
        if (currentAltitude > 0) {
          setDirection('backward');
          setCurrentAltitude(prev => prev - 1);
        } else {
          setDirection('backward');
          setCurrentAltitude(altitudes.length - 1);
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mounted, currentAltitude]);

  const goToAltitude = (index: number) => {
    setIsPlaying(false);
    setDirection(index > currentAltitude ? 'forward' : 'backward');
    setCurrentAltitude(index);
  };

  return (
    <section 
      className="relative w-full"
      style={{
        backgroundColor: surfaces.solid.base,
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? `${spacing.xl} 0` : `${spacing['3xl']} 0`,
      }}
    >
      {/* Background Assets with Crossfade - FULL WIDTH at section level */}
      <div className="absolute inset-0">
        {altitudes.map((alt, i) => (
          <motion.div
            key={alt.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: currentAltitude === i ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <img 
              src={buildAssetUrl(alt.assetFamily, alt.assetVariant, alt.assetMode)} 
              alt="" 
              className="w-full h-full object-cover"
              style={{
                opacity: assetOpacity.section,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Container - Content with Magic Layer applied */}
      {/* Reel Overlay - Magic Layer for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: reelOverlay.background,
        }}
      />

      {/* Main Container - Content floats on top */}
      <div 
        className="relative w-full max-w-6xl mx-auto z-10"
        style={{
          aspectRatio: isMobile ? undefined : '5/4',
          minHeight: isMobile ? '100vh' : undefined,
          width: '100%',
          padding: isMobile ? `0 ${spacing.md}` : '0',
        }}
      >
        {/* Content Layer */}
        <div 
          className="relative flex flex-col justify-between"
          style={{
            padding: isMobile ? `${spacing.xl} 0 ${spacing.lg} 0` : `${spacing['3xl']} ${spacing.xl} ${spacing['2xl']} ${spacing.xl}`,
            minHeight: isMobile ? '100vh' : '100%',
            height: isMobile ? '100vh' : '100%',
          }}
        >
          {/* Top: Altitude Selector - Shows all three perspectives */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 md:gap-3"
            style={{
              marginBottom: isMobile ? spacing.md : spacing['2xl'],
            }}
          >
            {altitudes.map((alt, index) => (
              <motion.button
                key={alt.id}
                onClick={() => goToAltitude(index)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: isMobile ? `${spacing.xs} ${spacing.sm}` : `${spacing.md} ${spacing.lg}`,
                  borderRadius: radius.md,
                  backgroundColor: currentAltitude === index 
                    ? `${alt.color}20` 
                    : 'transparent',
                  border: currentAltitude === index 
                    ? `1px solid ${alt.color}40` 
                    : `1px solid ${colors.neutral.gray[800]}40`,
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  backdropFilter: currentAltitude === index ? 'blur(10px)' : 'none',
                  flex: isMobile ? '1' : '0 1 auto',
                  minWidth: isMobile ? '0' : '180px',
                }}
                aria-label={`View ${alt.productName}`}
              >
                {/* Audience Label */}
                <div
                  style={{
                    fontSize: isMobile ? '8px' : '10px',
                    color: currentAltitude === index ? alt.color : colors.neutral.gray[600],
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    marginBottom: isMobile ? '2px' : '6px',
                    opacity: currentAltitude === index ? 1 : 0.6,
                    transition: 'all 0.4s ease',
                  }}
                >
                  {alt.audience.replace('FOR ', '')}
                </div>
                
                {/* Product Name */}
                <div
                  style={{
                    fontSize: isMobile ? '11px' : '15px',
                    color: currentAltitude === index ? colors.neutral.white : colors.neutral.gray[500],
                    fontWeight: '600',
                    transition: 'all 0.4s ease',
                    whiteSpace: isMobile ? 'nowrap' : 'normal',
                    overflow: isMobile ? 'hidden' : 'visible',
                    textOverflow: isMobile ? 'ellipsis' : 'clip',
                  }}
                >
                  {alt.productName}
                </div>

                {/* Active indicator dot */}
                {currentAltitude === index && (
                  <motion.div
                    layoutId="activeAltitude"
                    style={{
                      width: isMobile ? '16px' : '24px',
                      height: '2px',
                      backgroundColor: alt.color,
                      borderRadius: radius.full,
                      marginTop: isMobile ? '4px' : '8px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    }}
                    transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Center: Product Name + Headline + Subline */}
          <div 
            className="flex-1 flex flex-col justify-center"
            style={{
              textAlign: isMobile ? 'center' : 'left',
              maxWidth: isMobile ? '100%' : '900px',
              margin: isMobile ? '0 auto' : '0',
            }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`content-${currentAltitude}`}
                custom={direction}
                initial={(dir) => ({
                  opacity: 0,
                  y: dir === 'forward' ? 40 : -40,
                  scale: 0.95,
                })}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={(dir) => ({
                  opacity: 0,
                  y: dir === 'forward' ? -40 : 40,
                  scale: 0.95,
                })}
                transition={{
                  duration: 0.7,
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                {/* Product Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    fontSize: isMobile ? '18px' : '32px',
                    fontWeight: '600',
                    color: colors.neutral.white,
                    marginBottom: isMobile ? '16px' : '32px',
                    opacity: 0.9,
                  }}
                >
                  {altitude.productName}
                </motion.div>

                {/* Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    fontSize: isMobile ? 'clamp(40px, 10vw, 56px)' : 'clamp(56px, 8vw, 96px)',
                    fontWeight: '700',
                    color: colors.neutral.white,
                    lineHeight: '1.05',
                    letterSpacing: '-0.03em',
                    marginBottom: isMobile ? '16px' : '32px',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {altitude.headline}
                </motion.h2>

                {/* Subline */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  style={{
                    fontSize: isMobile ? 'clamp(15px, 4vw, 18px)' : 'clamp(20px, 2.5vw, 26px)',
                    color: colors.neutral.gray[400],
                    lineHeight: '1.6',
                    maxWidth: isMobile ? '100%' : '700px',
                    margin: isMobile ? '0 auto' : '0',
                    fontWeight: '300',
                    textWrap: 'balance',
                  }}
                >
                  {altitude.subline}
                </motion.p>

                {/* Explore CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05, opacity: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Navigate to individual landing pages
                  }}
                  style={{
                    marginTop: isMobile ? spacing.lg : spacing['2xl'],
                    padding: '0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '15px',
                    color: altitude.color,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    opacity: 0.8,
                    transition: 'opacity 0.3s ease',
                    textAlign: isMobile ? 'center' : 'left',
                    width: isMobile ? '100%' : 'auto',
                  }}
                  aria-label={`Explore ${altitude.productName}`}
                >
                  EXPLORE →
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom: Progress Indicators */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`progress-${currentAltitude}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3"
              style={{
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              {altitudes.map((alt, index) => (
                <button
                  key={alt.id}
                  onClick={() => goToAltitude(index)}
                  className="group relative transition-all duration-500"
                  style={{
                    width: isMobile ? '10px' : '12px',
                    height: isMobile ? '10px' : '12px',
                    cursor: 'pointer',
                  }}
                  aria-label={`View ${alt.productName}`}
                >
                  {/* Background Circle */}
                  <Circle
                    size={isMobile ? 10 : 12}
                    style={{
                      color: `${alt.color}40`,
                      strokeWidth: 1.5,
                    }}
                  />
                  
                  {/* Active Fill */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={false}
                    animate={{
                      scale: currentAltitude === index ? 1 : 0,
                      opacity: currentAltitude === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      style={{
                        width: isMobile ? '6px' : '7px',
                        height: isMobile ? '6px' : '7px',
                        borderRadius: '50%',
                        backgroundColor: alt.color
                      }}
                    />
                  </motion.div>

                  {/* Hover Glow */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: isMobile ? '16px' : '20px',
                        height: isMobile ? '16px' : '20px',
                        borderRadius: '50%',
                        backgroundColor: `${alt.color}20`,
                        border: `1px solid ${alt.color}40`,
                      }}
                    />
                  </motion.div>
                </button>
              ))}

              {/* Separator */}
              <div
                style={{
                  width: '1px',
                  height: isMobile ? '12px' : '16px',
                  backgroundColor: `${colors.neutral.gray[800]}60`,
                  margin: '0 4px',
                }}
              />

              {/* Current Label */}
              <motion.div
                style={{
                  fontSize: isMobile ? '10px' : '11px',
                  color: altitude.color,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: '600',
                }}
              >
                {altitude.productName}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}