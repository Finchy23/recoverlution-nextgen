import { colors, spacing, radius } from "@/design-tokens";
import { fonts, surfaces, border } from "@/design-tokens";
import { buildAssetUrl, assetOpacity, reelOverlay } from "@/marketing-tokens";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Navigation, Activity, Dumbbell, Wrench, Play as PlayIcon, 
  Compass, TrendingUp, Target, Wind, Heart, Eye, Brain, Zap 
} from 'lucide-react';
import { JourneysExpanded } from './expanded/JourneysExpanded';

interface OperatingTruthGridProps {
  mounted: boolean;
}

// Operating Truth Apps Data Structure
const operatingTruthData = {
  apps: [
    {
      id: 'journeys',
      title: 'Journeys',
      layer: 'Baseline',
      tagline: 'Your weekly rhythm',
      color: colors.accent.blue.primary,
      size: 'large', // Takes left 50%
      icon: Calendar,
    },
    {
      id: 'navicues',
      title: 'NaviCues',
      layer: 'Moment',
      tagline: 'Your momentum',
      color: colors.brand.purple.light,
      size: 'large', // Takes left 50%
      icon: Navigation,
    },
    {
      id: 'sense',
      title: 'Sense',
      layer: 'Signals',
      tagline: 'Three Signals',
      color: colors.status.amber.bright,
      size: 'small',
      icon: Activity,
    },
    {
      id: 'studio',
      title: 'Studio',
      layer: 'Body',
      tagline: 'Regulation First',
      color: colors.status.red.bright,
      size: 'small',
      icon: Dumbbell,
    },
    {
      id: 'toolkit',
      title: 'Toolkit',
      layer: 'Meaning',
      tagline: 'Depth on Demand',
      color: colors.accent.cyan.primary,
      size: 'small',
      icon: Wrench,
    },
    {
      id: 'play',
      title: 'Play',
      layer: 'Story',
      tagline: 'change the narrative',
      color: colors.status.green.bright,
      size: 'small',
      icon: PlayIcon,
    },
    {
      id: 'navigate',
      title: 'Navigate',
      layer: 'Pathway',
      tagline: 'Guided pathways',
      color: colors.brand.purple.mid,
      size: 'small',
      icon: Compass,
    },
    {
      id: 'momentum',
      title: 'Momentum',
      layer: 'Progress',
      tagline: 'Streaks and consistency',
      color: colors.status.yellow.bright,
      size: 'small',
      icon: TrendingUp,
    },
  ],
};

export function OperatingTruthGrid({ mounted }: OperatingTruthGridProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleApp = (appId: string) => {
    // Only journeys has an expanded overlay
    const expandableApps = ['journeys'];
    if (!expandableApps.includes(appId) && expandedApp !== appId) return;
    
    if (expandedApp === appId) {
      setExpandedApp(null);
    } else {
      setExpandedApp(appId);
    }
  };

  // Background asset
  const assetUrl = 'https://wzeqlkbmqxlsjryidagf.supabase.co/storage/v1/object/public/recoverlution-assets/flowstate/5:4/avif/flowstate_abstract_neurowave_light.avif';

  // Get SVG animation based on app ID
  const getAppAnimation = (app: typeof operatingTruthData.apps[0]) => {
    switch (app.id) {
      case 'journeys':
        return (
          <motion.svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
            {[0, 1, 2, 3, 4].map((row) => 
              [0, 1, 2, 3, 4, 5, 6].map((col) => {
                const x = 30 + col * 50;
                const y = 30 + row * 50;
                return (
                  <g key={`${row}-${col}`}>
                    <motion.rect x={x} y={y} width={40} height={40} rx={6} stroke={app.color} strokeWidth="1.5" fill="none"
                      animate={{ opacity: [0.2, 0.6, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity, delay: (row * 7 + col) * 0.1, ease: "easeInOut" }}
                    />
                    <motion.circle cx={x + 20} cy={y + 20} r={4} fill={app.color}
                      animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: (row * 7 + col) * 0.1 + 0.3, ease: "easeInOut" }}
                      style={{ filter: `drop-shadow(0 0 4px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
                    />
                  </g>
                );
              })
            )}
          </motion.svg>
        );
      case 'navicues':
        return (
          <motion.svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
            <motion.circle cx={200} cy={150} r={60} stroke={app.color} strokeWidth="2.5" fill="none" strokeDasharray="10 5"
              animate={{ strokeDashoffset: [0, -30, -60], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ filter: `drop-shadow(0 0 6px ${app.color})` }}
            />
            {[0, 90, 180, 270].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 200 + 50 * Math.cos(rad);
              const y1 = 150 + 50 * Math.sin(rad);
              const x2 = 200 + 80 * Math.cos(rad);
              const y2 = 150 + 80 * Math.sin(rad);
              return (
                <g key={angle}>
                  <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={app.color} strokeWidth="3" strokeLinecap="round"
                    animate={{ opacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                  />
                  <motion.circle cx={x2} cy={y2} r={4} fill={app.color}
                    animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                    style={{ filter: `drop-shadow(0 0 5px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
                  />
                </g>
              );
            })}
            <motion.circle cx={200} cy={150} r={8} fill={app.color}
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: `drop-shadow(0 0 8px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
            />
          </motion.svg>
        );
      case 'sense':
        return (
          <motion.svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
            {[0, 1, 2].map((waveIndex) => {
              const y = 75 + waveIndex * 75;
              return (
                <g key={waveIndex}>
                  <motion.path d={`M 0,${y} Q 50,${y - 20} 100,${y} T 200,${y} T 300,${y} T 400,${y}`}
                    stroke={app.color} strokeWidth="2.5" fill="none" strokeDasharray="15 5"
                    animate={{ strokeDashoffset: [0, -40, -80], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3 + waveIndex * 0.5, repeat: Infinity, ease: "linear" }}
                    style={{ filter: `drop-shadow(0 0 4px ${app.color})` }}
                  />
                  {[0, 1, 2, 3].map((peak) => (
                    <motion.circle key={peak} cx={50 + peak * 100} cy={y - 20} r={3} fill={app.color}
                      animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 0.9, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: peak * 0.25 + waveIndex * 0.3, ease: "easeInOut" }}
                      style={{ filter: `drop-shadow(0 0 4px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
                    />
                  ))}
                </g>
              );
            })}
          </motion.svg>
        );
      case 'studio':
        return (
          <motion.svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
            {[0, 1, 2, 3].map((i) => (
              <motion.circle key={i} cx={200} cy={150} r={30 + i * 20} stroke={app.color} strokeWidth="2" fill="none" strokeDasharray="8 4"
                animate={{ strokeDashoffset: [0, -24, -48], opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(0 0 5px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
              />
            ))}
            <motion.circle cx={200} cy={150} r={12} fill={app.color}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: `drop-shadow(0 0 10px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
            />
          </motion.svg>
        );
      case 'toolkit':
        return (
          <motion.svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const y = 50 + i * 50;
              return (
                <g key={i}>
                  <motion.rect x={80} y={y} width={240} height={35} rx={6} stroke={app.color} strokeWidth="2" fill="none"
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                  />
                  <motion.circle cx={100} cy={y + 17.5} r={5} fill={app.color}
                    animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 + 0.3, ease: "easeInOut" }}
                    style={{ filter: `drop-shadow(0 0 4px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
                  />
                </g>
              );
            })}
          </motion.svg>
        );
      case 'play':
        return (
          <motion.svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
            <motion.path d="M 50,250 Q 150,50 250,150 T 450,100" stroke={app.color} strokeWidth="3" fill="none" strokeDasharray="20 10"
              animate={{ strokeDashoffset: [0, -60, -120], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{ filter: `drop-shadow(0 0 6px ${app.color})` }}
            />
            {[{ x: 50, y: 250 }, { x: 150, y: 150 }, { x: 250, y: 150 }, { x: 350, y: 125 }, { x: 400, y: 100 }].map((point, i) => (
              <motion.circle key={i} cx={point.x} cy={point.y} r={5} fill={app.color}
                animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(0 0 5px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
              />
            ))}
          </motion.svg>
        );
      case 'navigate':
        return (
          <motion.svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
            <motion.path d="M 50,150 L 150,150" stroke={app.color} strokeWidth="3" strokeDasharray="50"
              animate={{ strokeDashoffset: [0, -50, -100], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.path d="M 150,150 L 250,80" stroke={app.color} strokeWidth="3" strokeDasharray="50"
              animate={{ strokeDashoffset: [0, -50, -100], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.3, ease: "linear" }}
            />
            <motion.path d="M 150,150 L 250,220" stroke={app.color} strokeWidth="3" strokeDasharray="50"
              animate={{ strokeDashoffset: [0, -50, -100], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.6, ease: "linear" }}
            />
            {[{ x: 50, y: 150 }, { x: 150, y: 150 }, { x: 250, y: 80 }, { x: 250, y: 220 }].map((point, i) => (
              <motion.circle key={i} cx={point.x} cy={point.y} r={6} fill={app.color}
                animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(0 0 6px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
              />
            ))}
          </motion.svg>
        );
      case 'momentum':
        return (
          <motion.svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.15 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const x = 50 + i * 50;
              const height = 80 + i * 15;
              const y = 250 - height;
              return (
                <g key={i}>
                  <motion.rect x={x} y={y} width={35} height={height} rx={4} stroke={app.color} strokeWidth="2" fill="none"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  />
                  <motion.circle cx={x + 17.5} cy={y - 10} r={4} fill={app.color}
                    animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 + 0.2, ease: "easeInOut" }}
                    style={{ filter: `drop-shadow(0 0 5px ${app.color})`, transformOrigin: 'center', transformBox: 'fill-box' }}
                  />
                </g>
              );
            })}
          </motion.svg>
        );
      default:
        return null;
    }
  };

  const renderAppCard = (app: typeof operatingTruthData.apps[0], index: number, isLarge: boolean) => {
    const isExpanded = expandedApp === app.id;
    const isHovered = hoveredApp === app.id;
    const isOtherExpanded = expandedApp && expandedApp !== app.id;

    return (
      <motion.div
        key={app.id}
        initial={{ opacity: 0, y: 40 }}
        animate={{ 
          opacity: mounted ? (isOtherExpanded ? 0 : 1) : 0, 
          y: mounted ? 0 : 40 
        }}
        transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: isExpanded ? 'absolute' as const : 'relative' as const,
          inset: isExpanded ? 0 : 'auto',
          zIndex: isExpanded ? 10 : 'auto',
          cursor: 'pointer',
          borderRadius: isLarge ? radius['2xl'] : radius.xl,
          overflow: 'hidden',
          border: `${border.width.hairline} solid ${
            isHovered || isExpanded ? `${app.color}40` : surfaces.glass.border
          }`,
          boxShadow: isHovered || isExpanded
            ? `0 0 0 1px ${app.color}40, 0 0 20px ${app.color}30, 0 0 40px ${app.color}20`
            : 'none',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          flex: isLarge ? 1 : undefined,
          minHeight: isExpanded ? 'auto' : isMobile ? (isLarge ? '280px' : '240px') : '0',
          pointerEvents: isOtherExpanded ? 'none' as const : 'auto' as const,
        }}
        onClick={() => !isExpanded && toggleApp(app.id)}
        onMouseEnter={() => !isExpanded && setHoveredApp(app.id)}
        onMouseLeave={() => setHoveredApp(null)}
      >
        {/* Glass Background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          backgroundColor: `${surfaces.solid.base}${isExpanded ? '35' : '20'}`,
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          transition: 'all 0.5s ease',
        }} />

        {/* Color Accent Gradient */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: `linear-gradient(135deg, ${app.color}${isExpanded ? '20' : '12'} 0%, transparent 60%)`,
          transition: 'all 0.5s ease',
        }} />

        {/* Animated Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', overflow: 'hidden' }}>
          {getAppAnimation(app)}
        </div>

        {/* Close Button */}
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            onClick={(e) => { e.stopPropagation(); toggleApp(app.id); }}
            style={{
              position: 'absolute', top: spacing.xl, right: spacing.xl, zIndex: 20,
              width: '48px', height: '48px', borderRadius: radius.full,
              border: `${border.width.hairline} solid ${app.color}40`,
              backgroundColor: `${surfaces.solid.base}40`,
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: app.color, fontSize: '24px', fontWeight: '300',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${app.color}20`; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = `${surfaces.solid.base}40`; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            &times;
          </motion.button>
        )}

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 10,
          padding: isMobile ? spacing.xl : spacing['2xl'],
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: spacing.md, height: '100%', textAlign: 'center',
        }}>
          <div className="font-body text-xs md:text-sm" style={{
            color: app.color, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '700', opacity: 0.9,
          }}>
            {app.layer}
          </div>
          <h3 className={`font-display ${isLarge ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'} font-bold tracking-tight`} style={{
            color: colors.neutral.white, letterSpacing: '-0.03em', lineHeight: '1',
          }}>
            {app.title}
          </h3>
          <p className={`font-body ${isLarge ? 'text-base md:text-lg' : 'text-sm md:text-base'}`} style={{
            color: colors.neutral.gray[300], fontWeight: '500', letterSpacing: '-0.01em',
          }}>
            {app.tagline}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <section style={{
      position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: surfaces.solid.base, overflow: 'hidden',
    }}>
      {/* Background Asset */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src={assetUrl} alt="Operating truth background" style={{
          width: '100%', height: '100%', objectFit: 'cover', opacity: assetOpacity.background,
        }} />
      </div>

      {/* Reel Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: reelOverlay.background }} />

      {/* Content Container */}
      <div className="relative w-full mx-auto px-4 md:px-8" style={{
        zIndex: 2,
        paddingTop: isMobile ? spacing['3xl'] : spacing['4xl'],
        paddingBottom: isMobile ? spacing['3xl'] : spacing['4xl'],
        maxWidth: '1400px',
      }}>
        {/* Grid Layout */}
        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: spacing.xl, position: 'relative', minHeight: isMobile ? 'auto' : '800px',
        }}>
          {/* Left Column - Large Apps */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: spacing.xl, height: '100%',
            opacity: expandedApp && operatingTruthData.apps.find(a => a.id === expandedApp)?.size === 'small' ? 0 : 1,
            pointerEvents: expandedApp && operatingTruthData.apps.find(a => a.id === expandedApp)?.size === 'small' ? 'none' : 'auto',
            transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {operatingTruthData.apps.filter(app => app.size === 'large').map((app, index) => renderAppCard(app, index, true))}
          </div>

          {/* Right Column - Small Apps Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gridTemplateRows: isMobile ? 'auto' : 'repeat(3, 1fr)',
            gap: spacing.xl,
            opacity: expandedApp && ['journeys'].includes(expandedApp) ? 0 : 1,
            pointerEvents: expandedApp && ['journeys'].includes(expandedApp) ? 'none' : 'auto',
            transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {operatingTruthData.apps.filter(app => app.size === 'small').map((app, index) => renderAppCard(app, index, false))}
          </div>
        </div>
      </div>

      {/* Expanded View Overlays */}
      <AnimatePresence mode="wait">
        {expandedApp === 'journeys' && (
          <JourneysExpanded onClose={() => setExpandedApp(null)} mounted={mounted} />
        )}
      </AnimatePresence>
    </section>
  );
}