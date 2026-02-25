import { motion } from 'motion/react';
import { useCommandCenterStore } from '@/app/stores/commandCenterStore';
import { useNaviCueEngineStore } from '@/app/stores/navicueEngineStore';
import { colors, surfaces, fonts } from '@/design-tokens';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NaviCueRenderer } from '@/app/components/navicue/NaviCueRenderer';
import { NaviCueMasterRenderer } from '@/app/components/navicue/NaviCueMasterRenderer';
import { NaviCueLabProvider } from '@/app/components/navicue/NaviCueLabContext';

interface NaviCueViewerProps {
  mounted: boolean;
  previewMode: 'mobile' | 'desktop';
}

/**
 * NAVICUE VIEWER (Command Center)
 * 
 * Production NaviCue renderer with:
 * - Interactive animated background
 * - Apple-grade elegance
 * - Full width/height usage
 * - Graceful interactions
 */

export function NaviCueViewer({ mounted, previewMode }: NaviCueViewerProps) {
  const {
    currentNavicueIndex,
    navicueTypes,
    nextScene,
    previousScene,
  } = useCommandCenterStore();
  
  const {
    currentAesthetic,
  } = useNaviCueEngineStore();

  // Get the actual NaviCue from the database (the real 1,435)
  const currentNavicue = navicueTypes[currentNavicueIndex];

  // Console log first NaviCue for debugging — must be before any early returns
  useEffect(() => {
    if (currentNavicueIndex === 0 && currentNavicue) {
      console.log('📋 FIRST NAVICUE SAMPLE:', {
        navicue_type_name: currentNavicue.navicue_type_name,
        form: currentNavicue.form,
        intent: currentNavicue.intent,
        mechanism: currentNavicue.mechanism,
        kbe_layer: currentNavicue.kbe_layer,
        container_type: currentNavicue.container_type,
        magic_signature: currentNavicue.magic_signature,
        primary_prompt: currentNavicue.primary_prompt,
        full_record: currentNavicue,
      });
    }
  }, [currentNavicueIndex, currentNavicue]);

  // Debug logging
  console.log('🎬 NaviCueViewer render:', {
    mounted,
    currentNavicueIndex,
    navicueTypesLength: navicueTypes.length,
    hasCurrentNavicue: !!currentNavicue,
  });

  if (!currentNavicue) {
    console.log('⚠️ No current NaviCue. navicueTypes:', navicueTypes.length, 'currentIndex:', currentNavicueIndex);
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.neutral.gray[400],
          fontSize: '14px',
        }}
      >
        No navicues available (navicueTypes: {navicueTypes.length}, index: {currentNavicueIndex})
      </div>
    );
  }
  
  console.log('✅ Rendering NaviCue:', currentNavicue.navicue_type_id);

  // Preview dimensions - fill the frame
  const previewDimensions = previewMode === 'mobile' 
    ? { width: '390px', height: '844px' }
    : { width: '1280px', height: '800px' };

  // Generate aesthetic for this NaviCue
  const aesthetic = currentAesthetic || {
    color: {
      primary: getMatrixColor(currentNavicue.kbe_layer),
      secondary: getMatrixColor(currentNavicue.kbe_layer),
      gradient: `linear-gradient(135deg, ${getMatrixColor(currentNavicue.kbe_layer)}, ${adjustHue(getMatrixColor(currentNavicue.kbe_layer), 60)})`,
      text: colors.neutral.white,
      background: surfaces.solid.base,
    },
    voice: {
      tone: 'balanced_supportive',
      parameters: {} as any,
    },
    magic: {
      aesthetic: currentNavicue.magic_signature || 'grounded',
      overlay: `hsla(0, 0%, 90%, 0.3)`,
      animation: 'medium',
    },
    layout: {
      variant: `${currentNavicue.form?.toLowerCase()}_${currentNavicue.container_type?.toLowerCase()}`,
      spacing: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      shadow: 'var(--shadow-md)',
    },
    tokens: {},
  };

  const handleResponse = (response: any) => {
    // Gracefully advance to next
    nextScene();
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: previewMode === 'mobile' ? '20px' : '40px',
        position: 'relative',
      }}
    >
      {/* Navigation Hints */}
      <NavigationHint
        direction="left"
        onClick={previousScene}
        disabled={currentNavicueIndex === 0}
      />
      <NavigationHint
        direction="right"
        onClick={nextScene}
        disabled={currentNavicueIndex === navicueTypes.length - 1}
      />

      {/* Preview Frame - Apple elegance, no borders */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: previewDimensions.width,
          height: previewDimensions.height,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 150px)',
          position: 'relative',
          borderRadius: previewMode === 'mobile' ? '48px' : '20px',
          overflow: 'hidden',
          boxShadow: previewMode === 'mobile' 
            ? '0 60px 120px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 40px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.03)',
          backgroundColor: surfaces.solid.base,
        }}
      >
        {/* Interactive Background Animation */}
        <InteractiveBackground 
          color={aesthetic.color.primary} 
          navicue={currentNavicue}
        />

        {/* Content Layer - Full Width/Height */}
        <motion.div
          key={`navicue-${currentNavicueIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: previewMode === 'mobile' ? '20px 16px' : '28px 36px',
            overflowY: 'auto',
          }}
        >
          <NaviCueLabProvider>
            <div style={{ 
              width: '100%',
              minHeight: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <NaviCueMasterRenderer
                navicueTypeData={currentNavicue}
                onResponse={handleResponse}
                previewMode={previewMode}
              />
            </div>
          </NaviCueLabProvider>
        </motion.div>

        {/* Minimal Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            position: 'absolute',
            top: previewMode === 'mobile' ? '20px' : '24px',
            right: previewMode === 'mobile' ? '20px' : '32px',
            fontSize: '10px',
            fontWeight: '500',
            color: colors.neutral.gray[500],
            fontFamily: fonts.mono,
            zIndex: 20,
            letterSpacing: '0.05em',
          }}
        >
          {currentNavicueIndex + 1}/{navicueTypes.length}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Navigation Hint Component - Elegant, minimal
interface NavigationHintProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}

function NavigationHint({ direction, onClick, disabled }: NavigationHintProps) {
  if (disabled) return null;

  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'absolute',
        [direction]: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: 'none',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: 0.3,
        transition: 'all 0.3s ease',
        zIndex: 10,
      }}
    >
      <Icon size={20} style={{ color: colors.neutral.white }} />
    </motion.button>
  );
}

// Interactive Background Animation - Consistent with homepage
interface InteractiveBackgroundProps {
  color: string;
  navicue: any;
}

function InteractiveBackground({ color, navicue }: InteractiveBackgroundProps) {
  // Different animation patterns based on format/container
  const pattern = getAnimationPattern(navicue);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        overflow: 'hidden',
        opacity: 0.4,
      }}
    >
      {/* Base gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 20% 30%, ${color}08 0%, transparent 60%)`,
        }}
      />

      {/* Pattern-specific animations */}
      {pattern === 'neural' && <NeuralPattern color={color} />}
      {pattern === 'flow' && <FlowPattern color={color} />}
      {pattern === 'pulse' && <PulsePattern color={color} />}
      {pattern === 'breathe' && <BreathePattern color={color} />}
    </div>
  );
}

// Neural Pattern - DNA strands, synapses
function NeuralPattern({ color }: { color: string }) {
  return (
    <motion.svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 400 300" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.3 }}
    >
      {/* DNA helix */}
      <motion.path
        d="M 160,0 Q 180,75 160,150 T 160,300"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeDasharray="10 5"
        animate={{ 
          strokeDashoffset: [0, -30, -60],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
      />
      <motion.path
        d="M 240,0 Q 220,75 240,150 T 240,300"
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeDasharray="10 5"
        animate={{ 
          strokeDashoffset: [0, -30, -60],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 0.5,
          ease: "linear",
        }}
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
      />
    </motion.svg>
  );
}

// Flow Pattern - Gentle waves
function FlowPattern({ color }: { color: string }) {
  return (
    <motion.svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 400 300" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.25 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M 0,${150 + i * 40} Q 100,${120 + i * 40} 200,${150 + i * 40} T 400,${150 + i * 40}`}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          animate={{ 
            d: [
              `M 0,${150 + i * 40} Q 100,${120 + i * 40} 200,${150 + i * 40} T 400,${150 + i * 40}`,
              `M 0,${150 + i * 40} Q 100,${180 + i * 40} 200,${150 + i * 40} T 400,${150 + i * 40}`,
              `M 0,${150 + i * 40} Q 100,${120 + i * 40} 200,${150 + i * 40} T 400,${150 + i * 40}`,
            ],
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ filter: `drop-shadow(0 0 2px ${color})` }}
        />
      ))}
    </motion.svg>
  );
}

// Pulse Pattern - Concentric circles
function PulsePattern({ color }: { color: string }) {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 400 300" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.2 }}
    >
      {[0, 1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          cx="200"
          cy="150"
          r="20"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          animate={{ 
            r: [20 + i * 15, 100 + i * 20],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  );
}

// Breathe Pattern - Expanding/contracting
function BreathePattern({ color }: { color: string }) {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 400 300" 
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity: 0.15 }}
    >
      <motion.circle
        cx="200"
        cy="150"
        r="50"
        stroke={color}
        strokeWidth="2"
        fill="none"
        animate={{ 
          r: [50, 80, 50],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}

// Helper: Get animation pattern based on NaviCue
function getAnimationPattern(navicue: any): 'neural' | 'flow' | 'pulse' | 'breathe' {
  // K layer = neural (cognitive, learning)
  if (navicue.kbe_layer === 'K') return 'neural';
  
  // B layer = flow (integration, testing)
  if (navicue.kbe_layer === 'B') return 'flow';
  
  // E layer with timer = breathe
  if (navicue.kbe_layer === 'E' && navicue.response?.type === 'timer') return 'breathe';
  
  // E layer = pulse (action, embodiment)
  if (navicue.kbe_layer === 'E') return 'pulse';
  
  return 'flow';
}

// Helper: Get matrix color (subtle, from spine bundle)
function getMatrixColor(kbe: string | undefined): string {
  // Subtle colors from the matrix - not bright KBE colors
  const matrixColors: Record<string, string> = {
    K: 'hsl(210, 40%, 55%)',   // Soft blue
    k: 'hsl(210, 40%, 55%)',   // Soft blue (lowercase)
    B: 'hsl(30, 45%, 55%)',    // Soft amber
    b: 'hsl(30, 45%, 55%)',    // Soft amber (lowercase)
    E: 'hsl(140, 40%, 50%)',   // Soft green
    e: 'hsl(140, 40%, 50%)',   // Soft green (lowercase)
  };
  return matrixColors[kbe || ''] || 'hsl(270, 60%, 55%)'; // Default to purple if unknown
}

function adjustHue(hslColor: string | undefined, degrees: number): string {
  if (!hslColor) return 'hsl(270, 60%, 55%)'; // Default fallback
  
  const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslColor;
  
  const h = (parseInt(match[1]) + degrees) % 360;
  const s = match[2];
  const l = match[3];
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}
