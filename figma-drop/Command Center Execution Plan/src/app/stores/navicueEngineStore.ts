import { create } from 'zustand';
import type {
  UserContext,
  NaviCueDefinition,
  NaviCueResponse,
  SelectionStrategy,
  AestheticLayers,
  MindblockState,
} from '../types/navicue-engine';

// ==========================================
// NAVICUE ENGINE STORE
// ==========================================
// Production-ready state management for NaviCue delivery
// Handles: user context, calibration, selection, rendering

interface NaviCueEngineStore {
  // ===== USER STATE =====
  userContext: UserContext | null;
  
  // ===== NAVICUE STATE =====
  currentNaviCue: NaviCueDefinition | null;
  naviCueHistory: NaviCueDefinition[];
  responseHistory: NaviCueResponse[];
  
  // ===== CATALOG =====
  naviCueCatalog: NaviCueDefinition[]; // All 1,455 NaviCues
  
  // ===== RENDERING =====
  currentAesthetic: AestheticLayers | null;
  
  // ===== LOADING =====
  isLoading: boolean;
  error: string | null;
  
  // ===== ACTIONS =====
  
  // Initialize user context
  initializeUser: (initialContext?: Partial<UserContext>) => void;
  
  // Load NaviCue catalog
  loadNaviCueCatalog: (catalog: NaviCueDefinition[]) => void;
  
  // Get next NaviCue (main selection engine)
  getNextNaviCue: () => Promise<void>;
  
  // Submit response and calibrate
  submitResponse: (response: Omit<NaviCueResponse, 'timestamp' | 'sessionId' | 'userId'>) => Promise<void>;
  
  // Update mindblock state
  updateMindblock: (mindblockId: keyof UserContext['mindblocks'], updates: Partial<MindblockState>) => void;
  
  // Manual navigation (for demo/testing)
  setCurrentNaviCue: (naviCue: NaviCueDefinition) => void;
  
  // Reset session
  resetSession: () => void;
}

// ===== DEFAULT USER CONTEXT =====
const createDefaultUserContext = (): UserContext => ({
  phase: 1,
  stage: 1,
  kbe: 'K',
  mindblocks: {
    IDENTITY_SELF_CONCEPT: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    IDENTITY_SELF_TRUST: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    EMOTIONAL_REGULATION: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    EMOTIONAL_PROCESSING: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    COGNITIVE_DISTORTIONS: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    COGNITIVE_FLEXIBILITY: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    RELATIONAL_TRUST: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    RELATIONAL_BOUNDARIES: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    BEHAVIORAL_PATTERNS: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    BEHAVIORAL_ACTIVATION: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    SOMATIC_AWARENESS: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    EXISTENTIAL_MEANING: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
    SELF_CARE: { intensity: 50, valence: 0, trajectory: 'stable', lastUpdated: Date.now(), confidence: 0.5 },
  },
  voiceProfile: {
    warmth: 0.6,
    directness: 0.4,
    humor: 0.3,
    paradox_tolerance: 0.4,
    compassion_heat: 0.6,
    precision: 0.5,
    somatic_bias: 0.5,
    meaning_bias: 0.5,
    challenge_bias: 0.3,
  },
  antiPatterns: [],
  currentSession: {
    sessionId: `session_${Date.now()}`,
    startTime: Date.now(),
    naviCuesCompleted: 0,
    placeboCount: 0,
    recentTypes: [],
    energyLevel: 'medium',
    needsBreak: false,
  },
  lensProfile: {
    preferredComplexity: 'moderate',
    metaphorReceptivity: 0.5,
    visualLearning: 0.5,
    narrativeStyle: 'second_person',
  },
  magicProfile: {
    preferredAesthetics: ['ethereal', 'grounded'],
    colorSensitivity: 0.6,
    animationTolerance: 0.6,
  },
  practices: {
    activePractices: [],
    completedExperiments: [],
    pendingCheckIns: [],
  },
  transformationSignals: {
    knowing_to_believing: 0,
    believing_to_embodying: 0,
    phase_transition: 0,
    mindblock_breakthrough: {},
  },
});

// ===== STORE =====
export const useNaviCueEngineStore = create<NaviCueEngineStore>((set, get) => ({
  // Initial state
  userContext: null,
  currentNaviCue: null,
  naviCueHistory: [],
  responseHistory: [],
  naviCueCatalog: [],
  currentAesthetic: null,
  isLoading: false,
  error: null,
  
  // Initialize user
  initializeUser: (initialContext) => {
    const defaultContext = createDefaultUserContext();
    set({
      userContext: {
        ...defaultContext,
        ...initialContext,
      },
    });
  },
  
  // Load catalog
  loadNaviCueCatalog: (catalog) => {
    set({ naviCueCatalog: catalog });
  },
  
  // Get next NaviCue (main selection engine)
  getNextNaviCue: async () => {
    const state = get();
    
    if (!state.userContext) {
      console.warn('No user context initialized');
      return;
    }
    
    if (state.naviCueCatalog.length === 0) {
      console.warn('No NaviCue catalog loaded');
      return;
    }
    
    set({ isLoading: true });
    
    try {
      // Build selection strategy
      const strategy = buildSelectionStrategy(state.userContext, state.currentNaviCue);
      
      // Query catalog with strategy
      const nextNaviCue = selectNaviCue(state.naviCueCatalog, state.userContext, strategy);
      
      if (!nextNaviCue) {
        throw new Error('No suitable NaviCue found');
      }
      
      // Generate aesthetic layers
      const aesthetic = generateAestheticLayers(nextNaviCue, state.userContext);
      
      // Update state
      set({
        currentNaviCue: nextNaviCue,
        currentAesthetic: aesthetic,
        naviCueHistory: [...state.naviCueHistory, nextNaviCue],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error getting next NaviCue:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },
  
  // Submit response and calibrate
  submitResponse: async (responseData) => {
    const state = get();
    
    if (!state.userContext || !state.currentNaviCue) {
      console.warn('Cannot submit response: missing context or NaviCue');
      return;
    }
    
    const response: NaviCueResponse = {
      ...responseData,
      timestamp: Date.now(),
      sessionId: state.userContext.currentSession.sessionId,
      userId: 'demo_user', // TODO: Real user ID
    };
    
    // Run calibration
    const updatedContext = calibrateUserContext(
      state.userContext,
      response,
      state.currentNaviCue
    );
    
    // Update state
    set({
      userContext: updatedContext,
      responseHistory: [...state.responseHistory, response],
    });
    
    // Auto-advance to next NaviCue
    await get().getNextNaviCue();
  },
  
  // Update mindblock
  updateMindblock: (mindblockId, updates) => {
    set((state) => {
      if (!state.userContext) return state;
      
      return {
        userContext: {
          ...state.userContext,
          mindblocks: {
            ...state.userContext.mindblocks,
            [mindblockId]: {
              ...state.userContext.mindblocks[mindblockId],
              ...updates,
              lastUpdated: Date.now(),
            },
          },
        },
      };
    });
  },
  
  // Manual navigation
  setCurrentNaviCue: (naviCue) => {
    const state = get();
    const aesthetic = state.userContext 
      ? generateAestheticLayers(naviCue, state.userContext)
      : null;
    
    set({
      currentNaviCue: naviCue,
      currentAesthetic: aesthetic,
    });
  },
  
  // Reset session
  resetSession: () => {
    set({
      userContext: createDefaultUserContext(),
      currentNaviCue: null,
      naviCueHistory: [],
      responseHistory: [],
      currentAesthetic: null,
      error: null,
    });
  },
}));

// ==========================================
// SELECTION ENGINE
// ==========================================

function buildSelectionStrategy(
  context: UserContext,
  lastNaviCue: NaviCueDefinition | null
): SelectionStrategy {
  // If in active arc, continue it
  if (context.activeArc) {
    return {
      mode: 'ARC_CONTINUATION',
      arcId: context.activeArc.arcId,
      nextPosition: context.activeArc.position + 1,
    };
  }
  
  // Check if placebo needed
  const needsPlacebo = shouldInsertPlacebo(context);
  if (needsPlacebo) {
    return {
      mode: 'PLACEBO',
      excludeRecent: context.currentSession.recentTypes,
    };
  }
  
  // Check for pending check-ins
  const dueCheckIn = findDueCheckIn(context);
  if (dueCheckIn) {
    return {
      mode: 'PRACTICE_CHECKIN',
      checkInId: dueCheckIn.id,
      practiceId: dueCheckIn.practiceId,
    };
  }
  
  // Normal deep work selection
  return {
    mode: 'DEEP_WORK',
    targetMindblocks: prioritizeMindblocks(context.mindblocks),
    depthModifier: 1.0,
    voiceProfile: context.voiceProfile,
    antiPatterns: context.antiPatterns,
    lensProfile: context.lensProfile,
    magicProfile: context.magicProfile,
    excludeRecent: context.currentSession.recentTypes,
    avoidRepetition: lastNaviCue ? {
      format: lastNaviCue.format,
      container: lastNaviCue.container,
      subcategory: lastNaviCue.subcategory,
    } : undefined,
    phase: context.phase,
    kbe: context.kbe,
    surpriseChance: 0.2,
  };
}

function selectNaviCue(
  catalog: NaviCueDefinition[],
  context: UserContext,
  strategy: SelectionStrategy
): NaviCueDefinition | null {
  // Filter by strategy mode
  let candidates = catalog.filter(nc => {
    if (strategy.mode === 'PLACEBO') {
      return nc.category === 'PLACEBO';
    } else if (strategy.mode === 'DEEP_WORK') {
      return nc.category === 'DEEP_WORK';
    }
    return true;
  });
  
  // Filter by phase/KBE
  if (strategy.phase) {
    candidates = candidates.filter(nc => nc.targetPhases.includes(strategy.phase!));
  }
  if (strategy.kbe) {
    candidates = candidates.filter(nc => nc.targetKBE.includes(strategy.kbe!));
  }
  
  // Filter by mindblock targeting
  if (strategy.targetMindblocks && strategy.targetMindblocks.length > 0) {
    candidates = candidates.filter(nc => {
      return nc.targetMindblocks.some(mb => strategy.targetMindblocks!.includes(mb));
    });
  }
  
  // Exclude recent types
  if (strategy.excludeRecent && strategy.excludeRecent.length > 0) {
    candidates = candidates.filter(nc => !strategy.excludeRecent!.includes(nc.id));
  }
  
  // Avoid repetition
  if (strategy.avoidRepetition) {
    const { format, container, subcategory } = strategy.avoidRepetition;
    candidates = candidates.filter(nc => {
      return nc.format !== format || nc.container !== container || nc.subcategory !== subcategory;
    });
  }
  
  // Filter by voice compatibility
  if (strategy.voiceProfile) {
    candidates = candidates.filter(nc => {
      return isVoiceCompatible(nc.voiceRequirements, strategy.voiceProfile!);
    });
  }
  
  // Select random from remaining candidates
  if (candidates.length === 0) {
    console.warn('No candidates found, relaxing filters');
    candidates = catalog.filter(nc => nc.category === 'DEEP_WORK');
  }
  
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || null;
}

function isVoiceCompatible(
  requirements: NaviCueDefinition['voiceRequirements'],
  profile: UserContext['voiceProfile']
): boolean {
  // Check if user's voice profile falls within NaviCue requirements
  return Object.entries(requirements).every(([key, range]) => {
    const value = profile[key as keyof typeof profile];
    return value >= range.min && value <= range.max;
  });
}

function shouldInsertPlacebo(context: UserContext): boolean {
  const { naviCuesCompleted, placeboCount, energyLevel } = context.currentSession;
  const deepWorkStreak = naviCuesCompleted - placeboCount;
  
  if (deepWorkStreak >= 4 && Math.random() < 0.7) return true;
  if (energyLevel === 'low') return true;
  if (Math.random() < 0.15) return true;
  
  return false;
}

function findDueCheckIn(context: UserContext): typeof context.practices.pendingCheckIns[0] | null {
  const now = Date.now();
  return context.practices.pendingCheckIns.find(ci => ci.scheduledFor <= now) || null;
}

function prioritizeMindblocks(mindblocks: UserContext['mindblocks']): string[] {
  const scored = Object.entries(mindblocks).map(([id, state]) => ({
    id,
    score: 
      state.intensity * 1.0 +
      (state.trajectory === 'declining' ? 20 : 0) +
      (state.trajectory === 'improving' ? -10 : 0) -
      (state.confidence < 0.5 ? -15 : 0),
  }));
  
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(s => s.id);
}

// ==========================================
// CALIBRATION ENGINE
// ==========================================

function calibrateUserContext(
  context: UserContext,
  response: NaviCueResponse,
  naviCue: NaviCueDefinition
): UserContext {
  const updated = { ...context };
  
  // Update mindblocks based on calibration rules
  naviCue.calibration.mindblockUpdates.forEach(rule => {
    const mindblockId = rule.mindblockId as keyof UserContext['mindblocks'];
    const currentState = updated.mindblocks[mindblockId];
    
    // Calculate state change based on response
    let delta = 0;
    if (response.responseType === 'select' && response.responseData.selectedOptions) {
      const selectedValue = response.responseData.selectedOptions[0];
      delta = rule.responseMapping[selectedValue] || 0;
    }
    
    // Apply delta with confidence weighting
    const newIntensity = Math.max(0, Math.min(100, currentState.intensity + delta));
    
    updated.mindblocks[mindblockId] = {
      ...currentState,
      intensity: newIntensity,
      trajectory: delta > 0 ? 'declining' : delta < 0 ? 'improving' : 'stable',
      lastUpdated: Date.now(),
      confidence: Math.min(1, currentState.confidence + rule.confidenceWeight),
    };
  });
  
  // Update session context
  updated.currentSession = {
    ...updated.currentSession,
    naviCuesCompleted: updated.currentSession.naviCuesCompleted + 1,
    recentTypes: [response.naviCueId, ...updated.currentSession.recentTypes.slice(0, 9)],
  };
  
  // Check for KBE transition signals
  if (naviCue.calibration.kbeTransitionSignals) {
    naviCue.calibration.kbeTransitionSignals.forEach(signal => {
      if (response.responseData.selectedOptions?.includes(signal.trigger)) {
        updated.transformationSignals = {
          ...updated.transformationSignals,
          [`${signal.from}_to_${signal.to}`]: signal.strengthSignal,
        };
        
        // Auto-transition if signal is strong enough
        if (signal.strengthSignal >= 0.8) {
          updated.kbe = signal.to;
        }
      }
    });
  }
  
  return updated;
}

// ==========================================
// AESTHETIC GENERATION
// ==========================================

function generateAestheticLayers(
  naviCue: NaviCueDefinition,
  context: UserContext
): AestheticLayers {
  // Get KBE color
  const kbeColor = getKBEColor(naviCue.kbe);
  
  // Get mindblock color influence
  const primaryMindblock = naviCue.targetMindblocks[0];
  const mindblockColor = getMindblockColor(primaryMindblock);
  
  // Blend colors
  const primaryColor = blendColors(kbeColor, mindblockColor, 0.7);
  
  return {
    color: {
      primary: primaryColor,
      secondary: adjustHue(primaryColor, 30),
      gradient: `linear-gradient(135deg, ${primaryColor}, ${adjustHue(primaryColor, 60)})`,
      text: 'hsl(0, 0%, 20%)',
      background: 'hsl(0, 0%, 98%)',
    },
    voice: {
      tone: generateVoiceTone(context.voiceProfile),
      parameters: context.voiceProfile,
    },
    magic: {
      aesthetic: naviCue.magicRequirements.aesthetics[0] || 'grounded',
      overlay: `hsla(${extractHue(primaryColor)}, 40%, 90%, 0.3)`,
      animation: naviCue.magicRequirements.animationIntensity,
    },
    layout: {
      variant: `${naviCue.format.toLowerCase()}_${naviCue.container.toLowerCase()}`,
      spacing: 'var(--space-4)',
      borderRadius: 'var(--radius-lg)',
      shadow: 'var(--shadow-md)',
    },
    tokens: {
      '--navicue-primary': primaryColor,
      '--navicue-gradient': `linear-gradient(135deg, ${primaryColor}, ${adjustHue(primaryColor, 60)})`,
    },
  };
}

// Color utility functions
function getKBEColor(kbe: 'K' | 'B' | 'E'): string {
  const colors = {
    K: 'hsl(210, 70%, 55%)', // Blue - analytical
    B: 'hsl(30, 70%, 55%)', // Amber - integrating
    E: 'hsl(140, 65%, 50%)', // Green - embodying
  };
  return colors[kbe];
}

function getMindblockColor(mindblock: string): string {
  const colors: Record<string, string> = {
    IDENTITY_SELF_CONCEPT: 'hsl(280, 60%, 55%)',
    IDENTITY_SELF_TRUST: 'hsl(290, 60%, 55%)',
    EMOTIONAL_REGULATION: 'hsl(340, 70%, 60%)',
    EMOTIONAL_PROCESSING: 'hsl(350, 70%, 60%)',
    COGNITIVE_DISTORTIONS: 'hsl(200, 60%, 55%)',
    COGNITIVE_FLEXIBILITY: 'hsl(190, 60%, 55%)',
    RELATIONAL_TRUST: 'hsl(160, 55%, 50%)',
    RELATIONAL_BOUNDARIES: 'hsl(170, 55%, 50%)',
    BEHAVIORAL_PATTERNS: 'hsl(40, 80%, 55%)',
    BEHAVIORAL_ACTIVATION: 'hsl(50, 80%, 55%)',
    SOMATIC_AWARENESS: 'hsl(25, 70%, 55%)',
    EXISTENTIAL_MEANING: 'hsl(270, 55%, 50%)',
    SELF_CARE: 'hsl(100, 60%, 50%)',
  };
  return colors[mindblock] || 'hsl(0, 0%, 50%)';
}

function blendColors(color1: string, color2: string, weight: number): string {
  // Simple blend - in production, use proper HSL blending
  return color1; // TODO: Implement proper color blending
}

function adjustHue(hslColor: string, degrees: number): string {
  // Extract hue and adjust
  const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hslColor;
  
  const h = (parseInt(match[1]) + degrees) % 360;
  const s = match[2];
  const l = match[3];
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function extractHue(hslColor: string): number {
  const match = hslColor.match(/hsl\((\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function generateVoiceTone(profile: UserContext['voiceProfile']): string {
  const { warmth, directness, compassion_heat } = profile;
  
  if (warmth > 0.7 && compassion_heat > 0.7) return 'warm_compassionate';
  if (directness > 0.7) return 'direct_coach';
  if (warmth < 0.3 && directness < 0.3) return 'neutral_guide';
  
  return 'balanced_supportive';
}
