import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, surfaces, radius, spacing } from '@/design-tokens';
import {
  buildAssetUrl,
  assetOpacity,
  reelOverlay,
} from '@/marketing-tokens';
import { phases } from '@/content-tokens'; // Import phases from content tokens

interface RadialPhaseStageProps {
  mounted: boolean;
}

// Map phases to radial display format with ring sizes
const PHASES = phases.map((phase, index) => {
  // Ring sizes from outermost to innermost
  const ringSizes = [100, 75, 50, 25];
  
  // Extract the part after the "/" from the title (e.g., "NOTICE / Sense" -> "Sense")
  const displayName = phase.title.split('/')[1]?.trim() || phase.title;
  
  return {
    id: phase.id,
    name: displayName, // Use only the part after the slash
    eyebrow: phase.watermark,
    subline: phase.tagline,
    features: phase.features, // Add the features array
    color: phase.color,
    ringSize: ringSizes[index] || 25,
  };
});

export function RadialPhaseStage({ mounted }: RadialPhaseStageProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(-1); // -1 means show tagline, 0-3 shows features

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-cycle through phases
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PHASES.length);
      setFeatureIndex(-1); // Reset to tagline when phase changes
    }, 9000); // Longer cycle to accommodate feature animation (1s tagline + 4x1.5s features + 0.5s buffer = ~8s)

    return () => clearInterval(interval);
  }, []);

  // Cycle through features within each phase
  useEffect(() => {
    const activePhase = PHASES[activeIndex];
    const featureCount = activePhase.features.length;
    
    const interval = setInterval(() => {
      setFeatureIndex((prev) => {
        // Cycle: tagline (-1) → feature 0 → feature 1 → feature 2 → feature 3 → tagline (-1) → ...
        if (prev === -1) return 0; // From tagline to first feature
        if (prev >= featureCount - 1) return -1; // From last feature back to tagline
        return prev + 1; // Next feature
      });
    }, 1500); // Each feature shows for 1.5 seconds

    return () => clearInterval(interval);
  }, [activeIndex]);

  const activePhase = PHASES[activeIndex];

  // Background asset
  const assetUrl = buildAssetUrl('evolvingforms', 'synconicity', 'light', '5:4');

  // Function to render phase-specific animation
  const renderPhaseAnimation = () => {
    const animationStyle = {
      position: 'absolute' as const,
      width: isMobile ? '280px' : '400px', // Increased from 200/300
      height: isMobile ? '180px' : '250px', // Increased from 120/150
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1, // Changed from 5 to 1 (behind text which is now at zIndex 10)
      pointerEvents: 'none' as const,
      filter: 'drop-shadow(0 0 20px currentColor)', // Add glow effect
    };

    switch (activePhase.id) {
      case 'sense': // NOTICE - Ripple/Pulse detection
        return (
          <div style={animationStyle}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.6 }}> {/* Increased from 0.15 to 0.6 */}
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.circle
                  key={i}
                  cx={150}
                  cy={75}
                  r={20}
                  stroke={activePhase.color}
                  strokeWidth="2"
                  fill="none"
                  initial={{ r: 20, opacity: 0.8 }}
                  animate={{ 
                    r: [20, 80],
                    opacity: [0.8, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeOut",
                  }}
                  style={{ filter: `drop-shadow(0 0 8px ${activePhase.color})` }} // Individual glow
                />
              ))}
            </svg>
          </div>
        );

      case 'map': // EMBRACE - Node map connecting/coming together
        return (
          <div style={animationStyle}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.6 }}>
              {/* 5 nodes positioned around the center */}
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * 72 * Math.PI) / 180;
                const startRadius = 70; // Start far from center
                const x = 150 + startRadius * Math.cos(angle);
                const y = 75 + startRadius * Math.sin(angle);
                
                return (
                  <g key={i}>
                    {/* Connection line from node to center - draws inward */}
                    <motion.line
                      x1={x}
                      y1={y}
                      x2={150}
                      y2={75}
                      stroke={activePhase.color}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ 
                        pathLength: [0, 1],
                        opacity: [0, 0.6, 0.6],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut",
                      }}
                      style={{ 
                        filter: `drop-shadow(0 0 6px ${activePhase.color})`,
                      }}
                    />
                    
                    {/* Node circle - appears and moves slightly toward center */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={4}
                      fill={activePhase.color}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 0.8, 0.8, 0.6],
                        scale: [0, 1, 1, 0.9],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeOut",
                      }}
                      style={{ filter: `drop-shadow(0 0 8px ${activePhase.color})` }}
                    />
                  </g>
                );
              })}
              
              {/* Center node - pulses as connections form */}
              <motion.circle
                cx={150}
                cy={75}
                r={6}
                fill={activePhase.color}
                animate={{ 
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ filter: `drop-shadow(0 0 10px ${activePhase.color})` }}
              />
            </svg>
          </div>
        );

      case 'deliver': // SHIFT - Energetic sparks/lightning
        return (
          <div style={animationStyle}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.7 }}> {/* Increased from 0.15 to 0.7 for more energetic feel */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const x = 50 + i * 40;
                return (
                  <motion.line
                    key={i}
                    x1={x}
                    y1={75}
                    x2={x + (i % 2 === 0 ? 15 : -15)}
                    y2={75}
                    stroke={activePhase.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: [0, 1, 1, 0],
                      opacity: [0, 1, 1, 0],
                      x1: x,
                      x2: x + (i % 2 === 0 ? 15 : -15),
                      y1: 75,
                      y2: [75, 40 + Math.random() * 70, 75],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeOut",
                    }}
                    style={{ filter: `drop-shadow(0 0 8px ${activePhase.color})` }} // Individual glow
                  />
                );
              })}
            </svg>
          </div>
        );

      case 'seal': // BECOME - Circles converging back to center (transcending into seal)
        return (
          <div style={animationStyle}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.65 }}>
              {/* 5 circles starting from outside, converging to center */}
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * 72 * Math.PI) / 180;
                const startRadius = 70; // Start far from center
                const endRadius = 0; // End at center
                
                return (
                  <motion.circle
                    key={i}
                    cx={150}
                    cy={75}
                    r={5}
                    stroke={activePhase.color}
                    strokeWidth="2"
                    fill={activePhase.color}
                    fillOpacity={0.3}
                    initial={{ 
                      x: startRadius * Math.cos(angle), 
                      y: startRadius * Math.sin(angle),
                      opacity: 0,
                      scale: 1,
                    }}
                    animate={{ 
                      x: [
                        startRadius * Math.cos(angle),
                        endRadius * Math.cos(angle)
                      ],
                      y: [
                        startRadius * Math.sin(angle),
                        endRadius * Math.sin(angle)
                      ],
                      opacity: [0, 0.8, 0.6, 0],
                      scale: [1, 1.1, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeInOut",
                    }}
                    style={{ 
                      filter: `drop-shadow(0 0 8px ${activePhase.color})`,
                    }}
                  />
                );
              })}
              
              {/* Center core - pulses stronger as circles converge (the seal forming) */}
              <motion.circle
                cx={150}
                cy={75}
                r={6}
                fill={activePhase.color}
                animate={{ 
                  scale: [1, 1.5, 1.3, 1],
                  opacity: [0.7, 1, 0.9, 0.7],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ filter: `drop-shadow(0 0 12px ${activePhase.color})` }}
              />
              
              {/* Completion ring - appears at the end to signify seal is complete */}
              <motion.circle
                cx={150}
                cy={75}
                r={10}
                stroke={activePhase.color}
                strokeWidth="2"
                fill="none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 1, 0],
                  opacity: [0, 0, 0.8, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  times: [0, 0.7, 0.9, 1], // Appears near the end (70% through)
                }}
                style={{ filter: `drop-shadow(0 0 10px ${activePhase.color})` }}
              />
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section 
      className="relative w-full"
      style={{
        position: 'relative',
        backgroundColor: surfaces.solid.base,
        overflow: 'hidden',
        minHeight: isMobile ? '100vh' : '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? `${spacing['3xl']} 0` : `${spacing['4xl']} 0`,
      }}
    >
      {/* Background Asset */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0"
          style={{
            opacity: assetOpacity.section,
          }}
        >
          <img 
            src={assetUrl}
            alt="Phase Flow"
            loading="lazy"
            className="w-full h-full object-cover"
            style={{
              opacity: assetOpacity.section,
            }}
          />
        </div>
        
        {/* Reel Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: reelOverlay.background,
          }}
        />
      </div>

      {/* Main Container */}
      <div 
        className="relative w-full max-w-7xl mx-auto px-4 md:px-8"
        style={{
          width: '100%',
          zIndex: 10,
        }}
      >
        {/* Radial Stage Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.95 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: isMobile ? '90vw' : '700px',
            aspectRatio: '1',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Concentric Rings */}
          {PHASES.map((phase, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;
            
            // Calculate ring size
            // SEAL expands to full when active, otherwise stays at 25%
            let ringSize = phase.ringSize;
            if (phase.id === 'seal' && isActive) {
              ringSize = 100;
            }
            
            return (
              <motion.div
                key={phase.id}
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '0',
                  width: `${ringSize}%`,
                  height: `${ringSize}%`,
                  margin: 'auto',
                  borderRadius: '50%',
                  border: `2px solid ${phase.color}`,
                  // Subtle glass effect on active circle
                  backgroundColor: isActive 
                    ? `${phase.color}08` // Very subtle color tint
                    : 'transparent',
                  backdropFilter: isActive ? 'blur(12px)' : 'none',
                  WebkitBackdropFilter: isActive ? 'blur(12px)' : 'none',
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.25 : 0.15,
                  scale: isActive ? [1, 1.02, 1] : 1,
                  boxShadow: isActive 
                    ? [
                        `0 0 0px ${phase.color}00`,
                        `0 0 60px ${phase.color}40`,
                        `0 0 0px ${phase.color}00`
                      ]
                    : `0 0 0px ${phase.color}00`,
                }}
                transition={{
                  scale: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  boxShadow: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  opacity: {
                    duration: 0.6,
                  },
                }}
              />
            );
          })}

          {/* Center Content - Active Phase Spotlight */}
          <motion.div
            key={activePhase.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              position: 'relative',
              zIndex: 20,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing.md,
              maxWidth: isMobile ? '75%' : '60%',
              padding: spacing.xl,
            }}
          >
            {/* Phase-Specific Animation Background - Behind the text */}
            {renderPhaseAnimation()}

            {/* Eyebrow - KBE Category */}
            <div
              className="font-body text-[13px] md:text-sm"
              style={{
                color: activePhase.color,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: '700',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {activePhase.eyebrow}
            </div>

            {/* Headline - Apple-style large, bold type matching ReelScrollytelling */}
            <h2
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
              style={{
                color: colors.neutral.white,
                letterSpacing: '-0.03em',
                lineHeight: '1',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {activePhase.name}
            </h2>

            {/* Subline/Feature Chip Area - Animated cycling */}
            <div
              className="min-h-[52px] md:min-h-[60px]"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <AnimatePresence mode="wait">
                {featureIndex === -1 ? (
                  // Show tagline
                  <motion.p
                    key="tagline"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      fontSize: isMobile ? '16px' : '20px',
                      color: colors.neutral.gray[300],
                      fontWeight: '500',
                      letterSpacing: '-0.01em',
                      lineHeight: '1.4',
                    }}
                  >
                    {activePhase.subline}
                  </motion.p>
                ) : (
                  // Show feature chip - muted style matching tagline but with phase color
                  <motion.div
                    key={`feature-${featureIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {/* Mini eyebrow stamp - trademark style */}
                    <div
                      style={{
                        fontSize: isMobile ? '8px' : '9px',
                        color: activePhase.color,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        opacity: 0.5,
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {activePhase.features[featureIndex]?.split('/')[0]?.trim().toUpperCase() || ''}
                    </div>
                    
                    {/* Feature pair with italicized second part */}
                    <div
                      style={{
                        fontSize: isMobile ? '16px' : '20px',
                        color: activePhase.color,
                        fontWeight: '500',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.4',
                        position: 'relative',
                        paddingBottom: '4px',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ fontStyle: 'italic', opacity: 0.85 }}>
                        {activePhase.features[featureIndex]?.split('/')[1]?.trim() || activePhase.features[featureIndex] || ''}
                      </span>
                      
                      {/* Subtle underline accent */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          backgroundColor: activePhase.color,
                          opacity: 0.4,
                          transformOrigin: 'left',
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Flow Arrow - Subtle directional hint */}
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              rotate: 360,
            }}
            transition={{
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
            style={{
              position: 'absolute',
              bottom: isMobile ? '10%' : '8%',
              right: isMobile ? '10%' : '8%',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: `1px dashed ${colors.neutral.gray[600]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.neutral.gray[500],
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}