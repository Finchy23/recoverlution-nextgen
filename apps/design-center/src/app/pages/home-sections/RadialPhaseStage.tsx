import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, radius, spacing, withAlpha } from '@/design-tokens';
import { getSectionAsset } from '@/marketing-tokens';
import { phases } from '@/content-tokens';
import {
  ImmersiveSection,
  getImmersivePanelStyle,
  immersiveContentPadding,
  immersiveSectionPadding,
} from '@/app/components/marketing/ImmersiveSection';
import { useIsMobile } from '@/app/components/ui/use-mobile';

interface RadialPhaseStageProps {
  mounted: boolean;
}

// Map phases to radial display format with ring sizes
const PHASES = phases.map((phase, index) => {
  const ringSizes = [100, 75, 50, 25];
  const displayName = phase.title.split('/')[1]?.trim() || phase.title;
  
  return {
    id: phase.id,
    name: displayName,
    eyebrow: phase.watermark,
    subline: phase.tagline,
    features: phase.features,
    color: phase.color,
    ringSize: ringSizes[index] || 25,
  };
});

export function RadialPhaseStage({ mounted }: RadialPhaseStageProps) {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PHASES.length);
      setFeatureIndex(-1);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activePhase = PHASES[activeIndex];
    const featureCount = activePhase.features.length;
    
    const interval = setInterval(() => {
      setFeatureIndex((prev) => {
        if (prev === -1) return 0;
        if (prev >= featureCount - 1) return -1;
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const activePhase = PHASES[activeIndex];
  const assetUrl = getSectionAsset('neuroadaptive', isMobile);

  const renderPhaseAnimation = () => {
    const animationStyle = {
      position: 'absolute' as const,
      width: isMobile ? '280px' : '400px',
      height: isMobile ? '180px' : '250px',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1,
      pointerEvents: 'none' as const,
      filter: 'drop-shadow(0 0 20px currentColor)',
    };

    switch (activePhase.id) {
      case 'sense':
        return (
          <div style={animationStyle}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.6 }}>
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
                  animate={{ r: [20, 80], opacity: [0.8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                  style={{ filter: `drop-shadow(0 0 8px ${activePhase.color})` }}
                />
              ))}
            </svg>
          </div>
        );
      case 'map':
        return (
          <div style={animationStyle}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.6 }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * 72 * Math.PI) / 180;
                const startRadius = 70;
                const x = 150 + startRadius * Math.cos(angle);
                const y = 75 + startRadius * Math.sin(angle);
                return (
                  <g key={i}>
                    <motion.line
                      x1={x} y1={y} x2={150} y2={75}
                      stroke={activePhase.color} strokeWidth="1.5" strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: [0, 1], opacity: [0, 0.6, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                      style={{ filter: `drop-shadow(0 0 6px ${activePhase.color})` }}
                    />
                    <motion.circle
                      cx={x} cy={y} r={4} fill={activePhase.color}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 0.8, 0.8, 0.6], scale: [0, 1, 1, 0.9] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                      style={{ filter: `drop-shadow(0 0 8px ${activePhase.color})` }}
                    />
                  </g>
                );
              })}
              <motion.circle
                cx={150} cy={75} r={6} fill={activePhase.color}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(0 0 10px ${activePhase.color})` }}
              />
            </svg>
          </div>
        );
      case 'deliver':
        return (
          <div style={animationStyle}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.7 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const x = 50 + i * 40;
                const travelY = i % 2 === 0 ? -26 : 26;
                return (
                  <motion.g
                    key={i}
                    initial={{ opacity: 0, y: 0, scale: 0.75 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [0, travelY, 0],
                      scale: [0.75, 1, 0.9, 0.7],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2, ease: 'easeOut' }}
                  >
                    <line
                      x1={x}
                      y1={75}
                      x2={x + (i % 2 === 0 ? 15 : -15)}
                      y2={75}
                      stroke={activePhase.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 8px ${activePhase.color})` }}
                    />
                    <circle
                      cx={x + (i % 2 === 0 ? 15 : -15)}
                      cy={75}
                      r="3"
                      fill={activePhase.color}
                      style={{ filter: `drop-shadow(0 0 10px ${activePhase.color})` }}
                    />
                  </motion.g>
                );
              })}
            </svg>
          </div>
        );
      case 'seal':
        return (
          <div style={animationStyle}>
            <svg width="100%" height="100%" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet" style={{ opacity: 0.65 }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * 72 * Math.PI) / 180;
                const startRadius = 70;
                return (
                  <motion.circle
                    key={i}
                    cx={150} cy={75} r={5}
                    stroke={activePhase.color} strokeWidth="2" fill={activePhase.color} fillOpacity={0.3}
                    initial={{ x: startRadius * Math.cos(angle), y: startRadius * Math.sin(angle), opacity: 0, scale: 1 }}
                    animate={{
                      x: [startRadius * Math.cos(angle), 0],
                      y: [startRadius * Math.sin(angle), 0],
                      opacity: [0, 0.8, 0.6, 0],
                      scale: [1, 1.1, 0.8, 0.3],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                    style={{ filter: `drop-shadow(0 0 8px ${activePhase.color})` }}
                  />
                );
              })}
              <motion.circle
                cx={150} cy={75} r={6} fill={activePhase.color}
                animate={{ scale: [1, 1.5, 1.3, 1], opacity: [0.7, 1, 0.9, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(0 0 12px ${activePhase.color})` }}
              />
              <motion.circle
                cx={150} cy={75} r={10}
                stroke={activePhase.color} strokeWidth="2" fill="none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 1, 0], opacity: [0, 0, 0.8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", times: [0, 0.7, 0.9, 1] }}
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
    <ImmersiveSection
      assetUrl={assetUrl}
      assetAlt="Phase flow"
      accentColor={activePhase.color}
      style={{
        padding: isMobile ? immersiveSectionPadding.mobile : immersiveSectionPadding.desktop,
      }}
    >
      <div
        className="relative w-full max-w-7xl mx-auto"
        style={{
          width: '100%',
          zIndex: 10,
          padding: isMobile ? immersiveContentPadding.mobile : immersiveContentPadding.desktop,
        }}
      >
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
            ...getImmersivePanelStyle({
              accentColor: activePhase.color,
              borderAlpha: 0.18,
              glowAlpha: 0.12,
              radiusValue: radius['3xl'],
              variant: 'ultraLight',
            }),
            padding: isMobile ? spacing.lg : spacing.xl,
          }}
        >
          {PHASES.map((phase, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;
            let ringSize = phase.ringSize;
            if (phase.id === 'seal' && isActive) ringSize = 100;
            
            return (
              <motion.div
                key={phase.id}
                style={{
                  position: 'absolute',
                  top: '0', left: '0', right: '0', bottom: '0',
                  width: `${ringSize}%`,
                  height: `${ringSize}%`,
                  margin: 'auto',
                  borderRadius: '50%',
                  border: `2px solid ${phase.color}`,
                  backgroundColor: isActive ? `${phase.color}08` : 'rgba(0,0,0,0)',
                  backdropFilter: isActive ? 'blur(12px)' : 'none',
                  WebkitBackdropFilter: isActive ? 'blur(12px)' : 'none',
                  transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.25 : 0.15,
                  scale: isActive ? [1, 1.02, 1] : 1,
                  boxShadow: isActive 
                    ? [`0 0 0px ${phase.color}00`, `0 0 60px ${phase.color}40`, `0 0 0px ${phase.color}00`]
                    : `0 0 0px ${phase.color}00`,
                }}
                transition={{
                  scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  opacity: { duration: 0.6 },
                }}
              />
            );
          })}

          <motion.div
            key={activePhase.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
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
            {renderPhaseAnimation()}

            <div
              className="font-body text-[13px] md:text-sm"
              style={{ color: activePhase.color, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '700', position: 'relative', zIndex: 1 }}
            >
              {activePhase.eyebrow}
            </div>

            <h2
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
              style={{ color: colors.neutral.white, letterSpacing: '-0.03em', lineHeight: '1', position: 'relative', zIndex: 1 }}
            >
              {activePhase.name}
            </h2>

            <div className="min-h-[52px] md:min-h-[60px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <AnimatePresence mode="wait">
                {featureIndex === -1 ? (
                  <motion.p
                    key="tagline"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    style={{ fontSize: isMobile ? '16px' : '20px', color: colors.neutral.gray[300], fontWeight: '500', letterSpacing: '-0.01em', lineHeight: '1.4' }}
                  >
                    {activePhase.subline}
                  </motion.p>
                ) : (
                  <motion.div
                    key={`feature-${featureIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                  >
                    <div style={{ fontSize: isMobile ? '8px' : '9px', color: activePhase.color, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700', opacity: 0.5, fontFamily: 'Inter, sans-serif' }}>
                      {activePhase.features[featureIndex]?.split('/')[0]?.trim().toUpperCase() || ''}
                    </div>
                    <div style={{ fontSize: isMobile ? '16px' : '20px', color: activePhase.color, fontWeight: '500', letterSpacing: '-0.01em', lineHeight: '1.4', position: 'relative', paddingBottom: '4px', textAlign: 'center' }}>
                      <span style={{ fontStyle: 'italic', opacity: 0.85 }}>
                        {activePhase.features[featureIndex]?.split('/')[1]?.trim() || activePhase.features[featureIndex] || ''}
                      </span>
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
                          boxShadow: `0 0 18px ${withAlpha(activePhase.color, 0.35)}`,
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], rotate: 360 }}
            transition={{
              opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            }}
            style={{
              position: 'absolute',
              bottom: isMobile ? '10%' : '8%',
              right: isMobile ? '10%' : '8%',
              width: '40px', height: '40px',
              borderRadius: '50%',
              border: `1px dashed ${colors.neutral.gray[600]}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.neutral.gray[500] }} />
          </motion.div>
        </motion.div>
      </div>
    </ImmersiveSection>
  );
}
