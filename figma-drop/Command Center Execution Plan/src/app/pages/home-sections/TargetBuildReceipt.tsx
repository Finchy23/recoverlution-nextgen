import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { colors, surfaces, typography, radius, spacing } from '@/design-tokens';
import { buildAssetUrl, assetOpacity, frostedGlass, reelOverlay } from '@/marketing-tokens';
import { ArrowRight, ArrowDown, Radio, BookOpen, Activity, Layers, MousePointer, Settings, Brain, Heart, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TargetBuildReceiptProps {
  mounted: boolean;
}

interface Stage {
  id: 'target' | 'build' | 'receipt';
  title: string;
  description: string;
  items: { text: string; icon: LucideIcon }[];
  color: string;
  nextTransition: string;
}

const stages: Stage[] = [
  {
    id: 'target',
    title: 'TARGET',
    description: 'The moment is the input.',
    items: [
      { text: 'Signal', icon: Radio },
      { text: 'Story', icon: BookOpen },
      { text: 'Rhythm', icon: Activity },
    ],
    color: colors.accent.cyan.primary,
    nextTransition: 'the framework targets',
  },
  {
    id: 'build',
    title: 'BUILD',
    description: 'The move is the output',
    items: [
      { text: 'Modalities', icon: Layers },
      { text: 'Interaction', icon: MousePointer },
      { text: 'Mechanics', icon: Settings },
    ],
    color: colors.status.amber.bright,
    nextTransition: 'the engine delivers',
  },
  {
    id: 'receipt',
    title: 'RECEIPT',
    description: 'The return is the transfer',
    items: [
      { text: 'Knowing', icon: Brain },
      { text: 'Believing', icon: Heart },
      { text: 'Embodying', icon: Zap },
    ],
    color: colors.status.green.bright,
    nextTransition: 'the mindblock updates',
  },
];

export function TargetBuildReceipt({ mounted }: TargetBuildReceiptProps) {
  const [activeStage, setActiveStage] = useState<'target' | 'build' | 'receipt'>('target');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-cycle through stages
  useEffect(() => {
    if (!mounted) return;
    
    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev === 'target') return 'build';
        if (prev === 'build') return 'receipt';
        return 'target';
      });
    }, 4500);
    
    return () => clearInterval(interval);
  }, [mounted]);

  const currentStageIndex = stages.findIndex((s) => s.id === activeStage);

  return (
    <section 
      className="relative w-full"
      style={{
        position: 'relative', // Required for scroll offset calculations with whileInView
        backgroundColor: surfaces.solid.base,
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? `${spacing['2xl']} 0` : `${spacing['3xl']} 0`,
      }}
    >
      {/* Background Asset - FULL WIDTH at section level */}
      <div className="absolute inset-0">
        <img 
          src={buildAssetUrl('flowstate', 'neurocoding', 'light')} 
          alt="" 
          className="w-full h-full object-cover"
          style={{
            opacity: assetOpacity.section,
          }}
        />
      </div>

      {/* Reel Overlay - Magic Layer for text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: reelOverlay.background,
        }}
      />

      {/* Main Container - Content floats on top */}
      <div 
        className="relative w-full h-full z-10"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div 
          className="w-full max-w-7xl mx-auto"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isMobile ? '32px' : '48px',
            padding: isMobile ? `0 ${spacing.md}` : `0 ${spacing.xl}`,
            background: frostedGlass.ultraLight.background,
            backdropFilter: frostedGlass.ultraLight.backdropFilter,
            WebkitBackdropFilter: frostedGlass.ultraLight.backdropFilter,
          }}
        >
          {/* The Loop */}
          <div
            className="relative w-full"
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? '24px' : '48px', // Reduced gap between cards
              maxWidth: isMobile ? '100%' : '100%',
            }}
          >
            {stages.map((stage, stageIdx) => {
              const isActive = stage.id === activeStage;
              const nextStage = stages[(stageIdx + 1) % stages.length];

              return (
                <div 
                  key={`stage-group-${stage.id}`}
                  style={{
                    display: 'contents',
                  }}
                >
                  {/* Stage Card */}
                  <motion.div
                    onClick={() => setActiveStage(stage.id)}
                    whileHover={{ scale: isActive ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      scale: isActive ? 1 : 0.92,
                      opacity: isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{
                      flex: 1,
                      maxWidth: isMobile ? '100%' : '360px',
                      minWidth: isMobile ? '100%' : '280px',
                      padding: isMobile ? '28px 24px' : '40px 32px',
                      background: isActive 
                        ? frostedGlass.card.background
                        : `${colors.neutral.gray[900]}60`,
                      backdropFilter: isActive ? frostedGlass.card.backdropFilter : 'blur(8px)',
                      WebkitBackdropFilter: isActive ? frostedGlass.card.backdropFilter : 'blur(8px)',
                      border: isActive ? `2px solid ${stage.color}` : `1px solid ${colors.neutral.gray[800]}40`,
                      borderRadius: isMobile ? radius.xl : radius['2xl'],
                      boxShadow: isActive ? frostedGlass.card.shadow : 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Active glow */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '2px',
                          background: `linear-gradient(90deg, transparent, ${stage.color}, transparent)`,
                        }}
                      />
                    )}

                    {/* Title */}
                    <div
                      style={{
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: '700',
                        letterSpacing: '0.15em',
                        color: isActive ? stage.color : colors.neutral.gray[500],
                        marginBottom: isMobile ? '10px' : '16px', // Reduced margin
                        textAlign: 'center',
                        transition: 'color 0.4s ease',
                      }}
                    >
                      {stage.title}
                    </div>

                    {/* Description */}
                    <div
                      style={{
                        fontSize: isMobile ? '16px' : '20px', // Slightly reduced
                        fontWeight: '500',
                        color: isActive ? colors.neutral.white : colors.neutral.gray[600],
                        textAlign: 'center',
                        marginBottom: isMobile ? '16px' : '24px', // Reduced margin
                        lineHeight: '1.4',
                        transition: 'color 0.4s ease',
                      }}
                    >
                      {stage.description}
                    </div>

                    {/* Items */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: isMobile ? '10px' : '14px', // Slightly reduced gap
                        alignItems: 'center',
                      }}
                    >
                      {stage.items.map((item, itemIdx) => {
                        const ItemIcon = item.icon;
                        return (
                          <motion.div
                            key={itemIdx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ 
                              opacity: isActive ? 1 : 0.3,
                              y: 0,
                              scale: isActive ? [1, 1, 1, 1.1, 1] : 1,
                            }}
                            transition={{ 
                              delay: isActive ? itemIdx * 0.4 : 0,
                              duration: isActive ? 0.6 : 0.3,
                              scale: {
                                delay: isActive ? itemIdx * 0.4 + 0.2 : 0,
                                duration: 0.4,
                                ease: 'easeOut',
                              },
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontSize: isMobile ? '13px' : '16px',
                              color: isActive ? colors.neutral.gray[300] : colors.neutral.gray[700],
                              fontWeight: '500',
                              letterSpacing: '0.01em',
                            }}
                          >
                            {/* Icon with pulse */}
                            <motion.div
                              animate={
                                isActive
                                  ? {
                                      scale: [1, 1, 1.3, 1],
                                      opacity: [0.6, 0.6, 1, 0.6],
                                    }
                                  : { scale: 1, opacity: 0.4 }
                              }
                              transition={{
                                delay: isActive ? itemIdx * 0.4 + 0.2 : 0,
                                duration: 0.5,
                                ease: 'easeOut',
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <ItemIcon
                                size={isMobile ? 14 : 17}
                                strokeWidth={2.5}
                                style={{
                                  color: stage.color,
                                }}
                              />
                            </motion.div>
                            
                            {/* Text */}
                            <span>{item.text}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Transition Connector - Clean minimal design */}
                  {(stageIdx < stages.length - 1) || (isMobile && stage.id === 'receipt') ? (
                    <motion.div
                      key={`transition-${stage.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: isActive ? 0.7 : 0.25,
                      }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'center',
                        gap: isMobile ? '4px' : '8px',
                        alignSelf: isMobile ? 'center' : undefined,
                      }}
                    >
                      {/* Arrow Icon - larger and more prominent */}
                      <motion.div
                        animate={{
                          y: isMobile ? [0, 4, 0] : 0,
                          x: !isMobile ? [0, 4, 0] : 0,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        {isMobile ? (
                          <ArrowDown 
                            size={20} 
                            strokeWidth={2.5}
                            style={{ 
                              color: stage.color,
                            }} 
                          />
                        ) : (
                          <ArrowRight 
                            size={18} 
                            strokeWidth={2.5}
                            style={{ 
                              color: stage.color,
                            }} 
                          />
                        )}
                      </motion.div>
                      
                      {/* Transition Text - subtle */}
                      <div
                        style={{
                          fontSize: typography.micro.small.fontSize,
                          fontWeight: '500',
                          color: stage.color,
                          letterSpacing: '0.03em',
                          opacity: isActive ? 0.6 : 0.3,
                          transition: 'opacity 0.4s ease',
                          textAlign: 'center',
                        }}
                      >
                        {stage.nextTransition}
                      </div>
                    </motion.div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Progress Dots */}
          <div
            style={{
              display: 'flex',
              gap: isMobile ? '12px' : '16px',
              marginTop: isMobile ? '24px' : '40px',
            }}
          >
            {stages.map((stage) => (
              <motion.div
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: stage.id === activeStage ? (isMobile ? '32px' : '40px') : (isMobile ? '10px' : '12px'),
                  height: isMobile ? '10px' : '12px',
                  borderRadius: radius.xs,
                  backgroundColor: stage.id === activeStage 
                    ? stage.color 
                    : colors.neutral.gray[700],
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-out',
                  opacity: stage.id === activeStage ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}