import { colors, spacing, radius } from "@/design-tokens";
import { fonts, surfaces, border } from "@/design-tokens";
import { buildAssetUrl, assetOpacity, reelOverlay } from "@/marketing-tokens";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Users, Shield, Sparkles, Zap, Target, Brain, Compass, UserCheck, MessageCircle, FileText, Wrench,
  // Run icons
  Workflow, Eye, Infinity, Lightbulb, MessageSquare, Wind, Activity, Telescope, HandHeart, Search, BookOpen, FileCheck,
  // Memory icons
  Award, TrendingUp, Archive, Clock, Calendar, Rocket, Play, Repeat, Edit, ChevronDown
} from 'lucide-react';

// CSS Animations for SVG backgrounds
const styleSheet = `
  @keyframes dnaFlow {
    0%, 100% { stroke-dashoffset: 0; opacity: 0.4; }
    50% { stroke-dashoffset: 100; opacity: 0.7; }
  }
  
  @keyframes dnaPulse {
    0%, 100% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1.3); opacity: 0.9; }
  }
  
  @keyframes codeFade {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.3; }
  }
  
  @keyframes gearRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes gearRotateReverse {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  
  @keyframes nodePulse {
    0%, 100% { transform: scale(0.8); opacity: 0.3; }
    50% { transform: scale(1.2); opacity: 0.8; }
  }
  
  @keyframes lineFlow {
    0% { stroke-dashoffset: 0; opacity: 0.2; }
    50% { stroke-dashoffset: -50; opacity: 0.5; }
    100% { stroke-dashoffset: -100; opacity: 0.2; }
  }
  
  @keyframes lineFlowVertical {
    0% { stroke-dashoffset: 0; opacity: 0.2; }
    50% { stroke-dashoffset: -60; opacity: 0.5; }
    100% { stroke-dashoffset: -120; opacity: 0.2; }
  }
`;

// Icon mapping for each word in the layers
const iconMap = {
  // Install - Essence
  'Defaults': Shield,
  'Drivers': Zap,
  'Biases': Target,
  
  // Install - Stability
  'Capacity': Brain,
  'Cognition': Lightbulb,
  'Identity': UserCheck,
  
  // Install - Reality
  'Systems': Activity,
  'Levers': TrendingUp,
  'Signals': Wind,
  
  // Install - Lens
  'Body': Heart,
  'Mind': Brain,
  'Soul': Sparkles,
  
  // Install - Pattern
  'Trigger': Zap,
  'Prediction': Eye,
  'Loop': Repeat,
  
  // Run - Method
  'Match': Target,
  'Evidence': FileCheck,
  'Fit': Compass,
  
  // Run - Interface
  'Glance': Eye,
  'Thread': Workflow,
  'Journey': Compass,
  
  // Run - Regulate
  'Ground': Shield,
  'Sense': Eye,
  'Flow': Wind,
  
  // Run - Calibrate
  'Restore': Wrench,
  'Amend': HandHeart,
  'Trust': Shield,
  
  // Run - Frame
  'Inquiry': BookOpen,
  'Perspective': Telescope,
  'Truth': Wind,
  
  // Hold - Proof
  'Receipts': Award,
  'Momentum': TrendingUp,
  'Transfer': Repeat,
  
  // Hold - Integration
  'Future': Rocket,
  'Interrupt': Zap,
  'Edit': Edit,
  
  // Hold - Primitive
  'When': Clock,
  'Predict': Eye,
  'Do': Play,
};

interface ClinicalSpineProps {
  mounted: boolean;
}

// Clinical Spine Data Structure - Using user's EXACT content
const clinicalSpineData = {
  vertebrae: [
    {
      id: 'core',
      title: 'Install',
      subtitle: 'Operating Truth',
      color: colors.accent.blue.primary,
      layers: [
        {
          title: 'Essence',
          tag: 'tells the truth',
          eyebrow: 'source code',
          content: {
            items: ['Defaults', 'Drivers', 'Biases'],
          },
        },
        {
          title: 'Stability',
          tag: 'builds the base',
          eyebrow: 'architectural structure',
          content: {
            items: ['Capacity', 'Cognition', 'Identity'],
          },
        },
        {
          title: 'Reality',
          tag: 'names the why',
          eyebrow: 'conceptual neuroscience',
          content: {
            items: ['Systems', 'Levers', 'Signals'],
          },
        },
        {
          title: 'Lens',
          tag: 'locates the identity',
          eyebrow: 'diagnostic domains',
          content: {
            items: ['Body', 'Mind', 'Soul'],
          },
        },
        {
          title: 'Pattern',
          tag: 'shines the light',
          eyebrow: 'tuned understanding',
          content: {
            items: ['Trigger', 'Prediction', 'Loop'],
          },
        },
      ],
    },
    {
      id: 'run',
      title: 'Run',
      subtitle: 'Cognition Engine',
      color: colors.status.amber.bright,
      layers: [
        {
          title: 'State',
          tag: 'steadies the ship',
          eyebrow: 'somatic alignment',
          content: {
            items: ['Ground', 'Sense', 'Flow'],
          },
        },
        {
          title: 'Way',
          tag: 'guides the way',
          eyebrow: 'proven modalities',
          content: {
            items: ['Match', 'Evidence', 'Fit'],
          },
        },
        {
          title: 'Mode',
          tag: 'fits the moment',
          eyebrow: 'interaction levels',
          content: {
            items: ['Glance', 'Thread', 'Journey'],
          },
        },
        {
          title: 'Calibrate',
          tag: 'evolves the story',
          eyebrow: 'relational repairs',
          content: {
            items: ['Restore', 'Amend', 'Trust'],
          },
        },
        {
          title: 'Frame',
          tag: 'integrates the meaning',
          eyebrow: 'contemplative inquiry',
          content: {
            items: ['Inquiry', 'Perspective', 'Truth'],
          },
        },
      ],
    },
    {
      id: 'memory',
      title: 'Hold',
      subtitle: 'Living Continuity',
      color: colors.status.green.bright,
      layers: [
        {
          title: 'Proof',
          tag: 'makes progress visible',
          eyebrow: 'recognisable returns',
          content: {
            items: ['Receipts', 'Momentum', 'Transfer'],
          },
        },
        {
          title: 'Integration',
          tag: 'transfers into identity',
          eyebrow: 'repeatable motion',
          content: {
            items: ['Future', 'Interrupt', 'Edit'],
          },
        },
        {
          title: 'Primitive',
          tag: 'rewrites the system',
          eyebrow: 'atomic change',
          content: {
            items: ['When', 'Predict', 'Do'],
          },
        },
      ],
    },
  ],
};

export function ClinicalSpine({ mounted }: ClinicalSpineProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedVertebra, setExpandedVertebra] = useState<string | null>(null);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [rotatingIndex, setRotatingIndex] = useState<{ [key: string]: number }>({
    core: 0,
    run: 0,
    memory: 0,
  });

  // Inject CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = styleSheet;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Rotate layer titles for each vertebra
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => ({
        core: (prev.core + 1) % 5, // Install has 5 layers
        run: (prev.run + 1) % 5, // Run has 5 layers
        memory: (prev.memory + 1) % 3, // Hold has 3 layers
      }));
    }, 2500); // Rotate every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleVertebra = (vertebraId: string) => {
    if (expandedVertebra === vertebraId) {
      setExpandedVertebra(null);
      setHoveredLayer(null);
    } else {
      setExpandedVertebra(vertebraId);
      setHoveredLayer(null);
    }
  };

  const toggleLayer = (layerIndex: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Ensure event doesn't bubble
    setHoveredLayer(layerIndex);
  };

  // Background asset
  const assetUrl = 'https://wzeqlkbmqxlsjryidagf.supabase.co/storage/v1/object/public/recoverlution-assets/flowstate/5:4/avif/flowstate_abstract_neurowave_light.avif';

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: surfaces.solid.base,
        overflow: 'hidden',
      }}
    >
      {/* Background Asset */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img
          src={assetUrl}
          alt="Clinical spine background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: assetOpacity.background,
          }}
        />
      </div>

      {/* Reel Overlay - Magic Layer aesthetic matching Hero */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: reelOverlay.background,
        }}
      />

      {/* Content Container */}
      <div
        className="relative w-full mx-auto px-4 md:px-8"
        style={{
          zIndex: 2,
          paddingTop: isMobile ? spacing['3xl'] : spacing['4xl'],
          paddingBottom: isMobile ? spacing['3xl'] : spacing['4xl'],
          maxWidth: '700px', // Match RadialPhaseStage outer circle width for visual consistency
        }}
      >
        {/* Vertebrae Stack - Vertical layout for elegant expansion */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.xl,
          }}
        >
          {clinicalSpineData.vertebrae.map((vertebra, vertebraIndex) => {
            const isExpanded = expandedVertebra === vertebra.id;

            return (
              <motion.div
                key={vertebra.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ 
                  opacity: mounted ? 1 : 0, 
                  y: mounted ? 0 : 40 
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.2 + vertebraIndex * 0.15,
                  ease: [0.4, 0, 0.2, 1],
                }}
                style={{
                  position: 'relative',
                  width: '100%',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Vertebra Card */}
                <div
                  style={{
                    position: 'relative',
                    borderRadius: radius['2xl'],
                    overflow: 'hidden',
                    border: `${border.width.hairline} solid ${
                      isExpanded ? `${vertebra.color}40` : 
                      surfaces.glass.border
                    }`,
                    boxShadow: isExpanded 
                      ? `0 0 0 1px ${vertebra.color}40, 0 0 20px ${vertebra.color}30, 0 0 40px ${vertebra.color}20`
                      : 'none',
                    // Remove animation when expanded so glow holds steady
                    animation: 'none',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleVertebra(vertebra.id)}
                >
                  {/* Glass Background */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 2,
                      backgroundColor: isExpanded 
                        ? `${surfaces.solid.base}25`
                        : `${surfaces.solid.base}15`,
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      transition: 'all 0.5s ease',
                    }}
                  />

                  {/* Color Accent Gradient */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 3,
                      background: `linear-gradient(135deg, ${vertebra.color}${isExpanded ? '15' : '08'} 0%, transparent 60%)`,
                      transition: 'all 0.5s ease',
                    }}
                  />

                  {/* Interactive Background Animation - Behind Text */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: 4,
                      pointerEvents: 'none',
                      overflow: 'hidden',
                    }}
                  >
                    {vertebra.id === 'core' && (
                      // INSTALL - DNA/code strands (genetic truth, core programming)
                      <motion.svg 
                        width="100%" 
                        height="100%" 
                        viewBox="0 0 400 300" 
                        preserveAspectRatio="xMidYMid slice"
                        style={{ opacity: 0.15 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        transition={{ duration: 1 }}
                        onAnimationStart={() => console.log('DNA SVG animation started')}
                      >
                        {/* Single centered double helix */}
                        {/* Left strand (backbone 1) */}
                        <motion.path
                          d="M 160,0 Q 180,75 160,150 T 160,300"
                          stroke={vertebra.color}
                          strokeWidth="2.5"
                          fill="none"
                          strokeDasharray="10 5"
                          animate={{ 
                            strokeDashoffset: [0, -30, -60],
                            opacity: [0.4, 0.7, 0.4],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{ filter: `drop-shadow(0 0 3px ${vertebra.color})` }}
                        />
                        {/* Right strand (backbone 2) */}
                        <motion.path
                          d="M 240,0 Q 220,75 240,150 T 240,300"
                          stroke={vertebra.color}
                          strokeWidth="2.5"
                          fill="none"
                          strokeDasharray="10 5"
                          animate={{ 
                            strokeDashoffset: [0, -30, -60],
                            opacity: [0.4, 0.7, 0.4],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: 0.5,
                            ease: "linear",
                          }}
                          style={{ filter: `drop-shadow(0 0 3px ${vertebra.color})` }}
                        />

                        {/* DNA base pairs connecting the strands */}
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                          const y = 20 + i * 30;
                          const offset = Math.sin(i * 0.5) * 30;
                          return (
                            <motion.line
                              key={`base-pair-${i}`}
                              x1={160 + offset}
                              y1={y}
                              x2={240 - offset}
                              y2={y}
                              stroke={vertebra.color}
                              strokeWidth="2"
                              strokeDasharray="5 3"
                              animate={{ 
                                strokeDashoffset: [0, -16, -32],
                                opacity: [0.2, 0.5, 0.2],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "linear",
                              }}
                            />
                          );
                        })}

                        {/* Genetic code markers on strands */}
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                          const y = 20 + i * 30;
                          const offset = Math.sin(i * 0.5) * 30;
                          return (
                            <g key={`marker-${i}`}>
                              <motion.circle
                                cx={160 + offset}
                                cy={y}
                                r={3.5}
                                fill={vertebra.color}
                                animate={{ 
                                  scale: [0.8, 1.3, 0.8],
                                  opacity: [0.5, 0.9, 0.5],
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: "easeInOut",
                                }}
                                style={{ filter: `drop-shadow(0 0 4px ${vertebra.color})` }}
                              />
                              <motion.circle
                                cx={240 - offset}
                                cy={y}
                                r={3.5}
                                fill={vertebra.color}
                                animate={{ 
                                  scale: [0.8, 1.3, 0.8],
                                  opacity: [0.5, 0.9, 0.5],
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  delay: i * 0.15 + 0.1,
                                  ease: "easeInOut",
                                }}
                                style={{ filter: `drop-shadow(0 0 4px ${vertebra.color})` }}
                              />
                            </g>
                          );
                        })}

                        {/* Code sequence visualization - binary markers floating on left */}
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                          const y = 40 + i * 45;
                          return (
                            <motion.text
                              key={`code-left-${i}`}
                              x={80}
                              y={y}
                              fill={vertebra.color}
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                              animate={{ 
                                opacity: [0, 0.3, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeInOut",
                              }}
                              style={{ filter: `drop-shadow(0 0 2px ${vertebra.color})` }}
                            >
                              {['01010', '11001', '10110', '00111', '11010', '01601'][i]}
                            </motion.text>
                          );
                        })}
                        
                        {/* Code on right side */}
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                          const y = 40 + i * 45;
                          return (
                            <motion.text
                              key={`code-right-${i}`}
                              x={320}
                              y={y}
                              fill={vertebra.color}
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                              animate={{ 
                                opacity: [0, 0.3, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3 + 0.5,
                                ease: "easeInOut",
                              }}
                              style={{ filter: `drop-shadow(0 0 2px ${vertebra.color})` }}
                            >
                              {['10101', '00110', '01001', '11000', '00101', '10010'][i]}
                            </motion.text>
                          );
                        })}
                      </motion.svg>
                    )}

                    {vertebra.id === 'run' && (
                      // RUN - Rotating gears (execution engine) - using dash offset like Hold
                      <motion.svg 
                        width="100%" 
                        height="100%" 
                        viewBox="0 0 400 300" 
                        preserveAspectRatio="xMidYMid slice"
                        style={{ opacity: 0.15 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        transition={{ duration: 1 }}
                      >
                        {/* Large gear - center right */}
                        <g>
                          <motion.circle
                            cx={280}
                            cy={150}
                            r={60}
                            stroke={vertebra.color}
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray="15 5"
                            animate={{ 
                              strokeDashoffset: [0, -40, -80],
                              opacity: [0.6, 0.9, 0.6],
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{ filter: `drop-shadow(0 0 8px ${vertebra.color})` }}
                          />
                          {/* Pulsing center */}
                          <motion.circle
                            cx={280}
                            cy={150}
                            r={8}
                            fill={vertebra.color}
                            animate={{ 
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 0.9, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{ 
                              filter: `drop-shadow(0 0 6px ${vertebra.color})`,
                              transformOrigin: 'center',
                              transformBox: 'fill-box',
                            }}
                          />
                          {/* Gear teeth with wave animation */}
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                            const angle = (i * 45 * Math.PI) / 180;
                            const x1 = 280 + 55 * Math.cos(angle);
                            const y1 = 150 + 55 * Math.sin(angle);
                            const x2 = 280 + 70 * Math.cos(angle);
                            const y2 = 150 + 70 * Math.sin(angle);
                            return (
                              <motion.line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={vertebra.color}
                                strokeWidth="4"
                                strokeLinecap="round"
                                animate={{
                                  opacity: [0.3, 0.9, 0.3],
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                  ease: "easeInOut",
                                }}
                              />
                            );
                          })}
                          {/* Rotating connection dots */}
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                            const angle = (i * 45 * Math.PI) / 180;
                            const x = 280 + 60 * Math.cos(angle);
                            const y = 150 + 60 * Math.sin(angle);
                            return (
                              <motion.circle
                                key={`dot-${i}`}
                                cx={x}
                                cy={y}
                                r={3}
                                fill={vertebra.color}
                                animate={{ 
                                  scale: [0.8, 1.4, 0.8],
                                  opacity: [0.4, 0.9, 0.4],
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  delay: i * 0.125,
                                  ease: "easeInOut",
                                }}
                                style={{ 
                                  filter: `drop-shadow(0 0 4px ${vertebra.color})`,
                                  transformOrigin: 'center',
                                  transformBox: 'fill-box',
                                }}
                              />
                            );
                          })}
                        </g>

                        {/* Small gear - center left */}
                        <g>
                          <motion.circle
                            cx={120}
                            cy={150}
                            r={40}
                            stroke={vertebra.color}
                            strokeWidth="2.5"
                            fill="none"
                            strokeDasharray="12 4"
                            animate={{ 
                              strokeDashoffset: [0, 32, 64],
                              opacity: [0.6, 0.9, 0.6],
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{ filter: `drop-shadow(0 0 6px ${vertebra.color})` }}
                          />
                          {/* Pulsing center */}
                          <motion.circle
                            cx={120}
                            cy={150}
                            r={6}
                            fill={vertebra.color}
                            animate={{ 
                              scale: [1, 1.6, 1],
                              opacity: [0.5, 0.9, 0.5],
                            }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{ 
                              filter: `drop-shadow(0 0 5px ${vertebra.color})`,
                              transformOrigin: 'center',
                              transformBox: 'fill-box',
                            }}
                          />
                          {/* Gear teeth */}
                          {[0, 1, 2, 3, 4, 5].map((i) => {
                            const angle = (i * 60 * Math.PI) / 180;
                            const x1 = 120 + 36 * Math.cos(angle);
                            const y1 = 150 + 36 * Math.sin(angle);
                            const x2 = 120 + 48 * Math.cos(angle);
                            const y2 = 150 + 48 * Math.sin(angle);
                            return (
                              <motion.line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={vertebra.color}
                                strokeWidth="3"
                                strokeLinecap="round"
                                animate={{
                                  opacity: [0.3, 0.9, 0.3],
                                }}
                                transition={{
                                  duration: 0.9,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: "easeInOut",
                                }}
                              />
                            );
                          })}
                          {/* Connection dots on perimeter */}
                          {[0, 1, 2, 3, 4, 5].map((i) => {
                            const angle = (i * 60 * Math.PI) / 180;
                            const x = 120 + 40 * Math.cos(angle);
                            const y = 150 + 40 * Math.sin(angle);
                            return (
                              <motion.circle
                                key={`dot-small-${i}`}
                                cx={x}
                                cy={y}
                                r={2.5}
                                fill={vertebra.color}
                                animate={{ 
                                  scale: [0.8, 1.5, 0.8],
                                  opacity: [0.4, 0.9, 0.4],
                                }}
                                transition={{
                                  duration: 1.1,
                                  repeat: Infinity,
                                  delay: i * 0.15 + 0.2,
                                  ease: "easeInOut",
                                }}
                                style={{ 
                                  filter: `drop-shadow(0 0 3px ${vertebra.color})`,
                                  transformOrigin: 'center',
                                  transformBox: 'fill-box',
                                }}
                              />
                            );
                          })}
                        </g>
                      </motion.svg>
                    )}

                    {vertebra.id === 'memory' && (
                      // HOLD - Archive nodes connecting (memory storage)
                      <motion.svg 
                        width="100%" 
                        height="100%" 
                        viewBox="0 0 400 300" 
                        preserveAspectRatio="xMidYMid slice"
                        style={{ opacity: 0.2 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 1 }}
                      >
                        {/* Grid of memory nodes */}
                        {[0, 1, 2, 3, 4].map((row) => 
                          [0, 1, 2, 3, 4, 5, 6].map((col) => {
                            const x = 50 + col * 50;
                            const y = 30 + row * 60;
                            return (
                              <g key={`${row}-${col}`}>
                                {/* Node */}
                                <motion.circle
                                  cx={x}
                                  cy={y}
                                  r={4}
                                  fill={vertebra.color}
                                  animate={{ 
                                    opacity: [0.3, 0.8, 0.3],
                                    scale: [0.8, 1.2, 0.8],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: (row + col) * 0.2,
                                    ease: "easeInOut",
                                  }}
                                  style={{ 
                                    filter: `drop-shadow(0 0 6px ${vertebra.color})`,
                                    transformOrigin: 'center',
                                    transformBox: 'fill-box',
                                  }}
                                />
                                {/* Horizontal connection to right neighbor */}
                                {col < 6 && (
                                  <motion.line
                                    x1={x}
                                    y1={y}
                                    x2={x + 50}
                                    y2={y}
                                    stroke={vertebra.color}
                                    strokeWidth="1.5"
                                    strokeDasharray="50"
                                    animate={{ 
                                      strokeDashoffset: [0, -50, -100],
                                      opacity: [0.2, 0.5, 0.2],
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      delay: (row + col) * 0.3,
                                      ease: "linear",
                                    }}
                                  />
                                )}
                                {/* Vertical connection to bottom neighbor */}
                                {row < 4 && (
                                  <motion.line
                                    x1={x}
                                    y1={y}
                                    x2={x}
                                    y2={y + 60}
                                    stroke={vertebra.color}
                                    strokeWidth="1.5"
                                    strokeDasharray="60"
                                    animate={{ 
                                      strokeDashoffset: [0, -60, -120],
                                      opacity: [0.2, 0.5, 0.2],
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      delay: (row + col) * 0.3 + 0.5,
                                      ease: "linear",
                                    }}
                                  />
                                )}
                              </g>
                            );
                          })
                        )}
                      </motion.svg>
                    )}
                  </div>

                  {/* Header */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      paddingTop: isMobile ? spacing.xl : spacing['2xl'],
                      paddingRight: isMobile ? spacing.xl : spacing['2xl'],
                      paddingBottom: isMobile ? spacing.md : spacing.lg,
                      paddingLeft: isMobile ? spacing.xl : spacing['2xl'],
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: spacing.md, // Match RadialPhaseStage gap
                      textAlign: 'center',
                    }}
                  >
                    {/* Eyebrow - Vertebra subtitle (Operating Truth, etc.) */}
                    <div
                      className="font-body text-[13px] md:text-sm" // Match RadialPhaseStage exactly
                      style={{ 
                        color: vertebra.color,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {vertebra.subtitle}
                    </div>

                    {/* Title - Now white */}
                    <h3
                      className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight" // Match RadialPhaseStage exactly
                      style={{
                        color: colors.neutral.white,
                        letterSpacing: '-0.03em', // Match RadialPhaseStage
                        lineHeight: '1', // Match RadialPhaseStage
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {vertebra.title}
                    </h3>

                    {/* Rotating Subline - Layer titles */}
                    <div
                      className="min-h-[52px] md:min-h-[60px]" // Match RadialPhaseStage exactly
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={`${vertebra.id}-${rotatingIndex[vertebra.id]}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                          style={{
                            fontSize: isMobile ? '16px' : '20px', // Match RadialPhaseStage exactly
                            color: colors.neutral.gray[300], // Match RadialPhaseStage exactly
                            fontWeight: '500', // Match RadialPhaseStage exactly
                            letterSpacing: '-0.01em', // Match RadialPhaseStage exactly
                            lineHeight: '1.4', // Match RadialPhaseStage exactly
                          }}
                        >
                          {vertebra.layers[rotatingIndex[vertebra.id]].title}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Arrow - Centered with no border line */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      paddingTop: spacing.sm, // Reduced from lg/xl
                      paddingBottom: isExpanded ? 0 : isMobile ? spacing.lg : spacing.xl, // Reduced from 2xl/3xl
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: isExpanded ? 180 : 0,
                      }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      <ChevronDown 
                        size={20} 
                        color={vertebra.color} 
                        strokeWidth={2.5}
                      />
                    </motion.div>
                  </div>

                  {/* Expanded Layers */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key={`expanded-${vertebra.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                          overflow: 'hidden',
                          position: 'relative',
                          zIndex: 10,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          style={{
                            paddingTop: spacing.lg, // Reduced from 2xl
                            paddingRight: isMobile ? spacing.lg : spacing.xl, // Reduced from 2xl/4xl
                            paddingBottom: isMobile ? spacing.xl : spacing['2xl'], // Reduced from 3xl/4xl
                            paddingLeft: isMobile ? spacing.lg : spacing.xl, // Reduced from 2xl/4xl
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: isMobile ? spacing.lg : spacing.xl, // Reduced from xl/2xl
                          }}
                        >
                          {vertebra.layers.map((layer, layerIndex) => {
                            const isHovered = hoveredLayer === layerIndex;
                            
                            return (
                              <motion.div
                                key={layerIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ 
                                  opacity: 1, 
                                  y: 0,
                                }}
                                transition={{ 
                                  duration: 0.4, 
                                  delay: layerIndex * 0.08,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                                style={{
                                  position: 'relative',
                                  borderRadius: radius.xl,
                                  border: `${border.width.hairline} solid ${isHovered ? `${vertebra.color}40` : `${vertebra.color}15`}`,
                                  overflow: 'hidden',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer',
                                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                                  boxShadow: isHovered 
                                    ? `0 8px 16px -4px ${vertebra.color}15, 0 4px 8px -2px rgba(0, 0, 0, 0.1)` 
                                    : '0 2px 4px -1px rgba(0, 0, 0, 0.05)',
                                }}
                                onMouseEnter={() => setHoveredLayer(layerIndex)}
                                onMouseLeave={() => setHoveredLayer(null)}
                              >
                                {/* Layer Glass Background */}
                                <div
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    zIndex: 1,
                                    backgroundColor: `${surfaces.solid.base}25`,
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    transition: 'all 0.3s ease',
                                  }}
                                />

                                {/* Layer Content - Two Column Layout */}
                                <div style={{ 
                                  position: 'relative', 
                                  zIndex: 10,
                                  paddingTop: isMobile ? spacing.lg : spacing.xl,
                                  paddingRight: isMobile ? spacing.lg : spacing.xl,
                                  paddingBottom: isMobile ? spacing.lg : spacing.xl,
                                  paddingLeft: isMobile ? spacing.lg : spacing.xl,
                                }}>
                                  {/* Four-Row Centered Layout */}
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: spacing.md,
                                  }}>
                                    {/* Row 1: Layer Title - Prominent and centered */}
                                    <h4
                                      style={{
                                        fontFamily: fonts.primary,
                                        fontSize: isMobile ? '24px' : '28px',
                                        fontWeight: 600,
                                        color: colors.neutral.white,
                                        letterSpacing: '-0.02em',
                                        textAlign: 'center',
                                      }}
                                    >
                                      {layer.title}
                                    </h4>
                                    
                                    {/* Row 1.5: Tag - Between title and words */}
                                    <div
                                      style={{
                                        fontFamily: fonts.primary,
                                        fontSize: isMobile ? '13px' : '14px',
                                        fontWeight: 500,
                                        color: colors.neutral.gray[400],
                                        letterSpacing: '0.01em',
                                        textAlign: 'center',
                                        fontStyle: 'italic',
                                      }}
                                    >
                                      {layer.tag}
                                    </div>
                                    
                                    {/* Row 2: Three Static Items with Icons Above */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: isMobile ? spacing.lg : spacing['2xl'],
                                      flexWrap: 'wrap',
                                      marginTop: spacing.sm,
                                    }}>
                                      {layer.content.items.slice(0, 3).map((item, itemIndex) => {
                                        const Icon = iconMap[item];
                                        // Extract single word from multi-word items for elegance
                                        const displayWord = item.includes(' ') ? item.split(' ')[0] : item;
                                        
                                        return (
                                          <div
                                            key={`${layerIndex}-${itemIndex}`}
                                            style={{
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                              gap: spacing.sm,
                                            }}
                                          >
                                            {/* Icon Above */}
                                            {Icon && (
                                              <Icon 
                                                size={isMobile ? 20 : 24}
                                                color={vertebra.color}
                                                strokeWidth={1.5}
                                                style={{
                                                  opacity: 0.9,
                                                }}
                                              />
                                            )}
                                            {/* Single Word Below */}
                                            <div
                                              style={{
                                                fontFamily: fonts.primary,
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: 500,
                                                color: colors.neutral.gray[300],
                                                textAlign: 'center',
                                                textTransform: 'capitalize',
                                              }}
                                            >
                                              {displayWord}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Row 3: Eyebrow - Beneath the words */}
                                    <div
                                      className="font-body"
                                      style={{
                                        fontSize: isMobile ? '10px' : '11px',
                                        color: vertebra.color,
                                        letterSpacing: '0.12em',
                                        textTransform: 'uppercase',
                                        fontWeight: '600',
                                        opacity: 0.8,
                                        textAlign: 'center',
                                      }}
                                    >
                                      {layer.eyebrow}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}