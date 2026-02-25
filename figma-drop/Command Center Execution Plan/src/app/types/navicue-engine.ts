// ==========================================
// NAVICUE ENGINE - COMPLETE TYPE SYSTEM
// ==========================================
// Production-ready backend architecture for NaviCue delivery system
// Cross-channel compatible, fully calibrated, infinitely scalable

// ==========================================
// USER CONTEXT (Complete State)
// ==========================================

export interface UserContext {
  // Core trajectory
  phase: 1 | 2 | 3 | 4;
  stage: number; // 1-5 within phase
  kbe: 'K' | 'B' | 'E';
  
  // 13 Mindblock states (0-100 scale each)
  mindblocks: {
    'IDENTITY_SELF_CONCEPT': MindblockState;
    'IDENTITY_SELF_TRUST': MindblockState;
    'EMOTIONAL_REGULATION': MindblockState;
    'EMOTIONAL_PROCESSING': MindblockState;
    'COGNITIVE_DISTORTIONS': MindblockState;
    'COGNITIVE_FLEXIBILITY': MindblockState;
    'RELATIONAL_TRUST': MindblockState;
    'RELATIONAL_BOUNDARIES': MindblockState;
    'BEHAVIORAL_PATTERNS': MindblockState;
    'BEHAVIORAL_ACTIVATION': MindblockState;
    'SOMATIC_AWARENESS': MindblockState;
    'EXISTENTIAL_MEANING': MindblockState;
    'SELF_CARE': MindblockState;
  };
  
  // Voice calibration (dynamic, evolves with user)
  voiceProfile: {
    warmth: number; // 0-1: cold/clinical → warm/nurturing
    directness: number; // 0-1: gentle/indirect → direct/confronting
    humor: number; // 0-1: serious → playful
    paradox_tolerance: number; // 0-1: literal → comfortable with koans
    compassion_heat: number; // 0-1: neutral → deeply empathetic
    precision: number; // 0-1: loose/poetic → precise/clear
    somatic_bias: number; // 0-1: cognitive → body-centered
    meaning_bias: number; // 0-1: practical → existential/philosophical
    challenge_bias: number; // 0-1: supportive → pushing growth edge
  };
  
  // Anti-patterns (what NOT to do with this user)
  antiPatterns: string[];
  
  // Current arc (if in multi-NaviCue sequence)
  activeArc?: {
    arcId: string;
    arcType: string;
    position: number;
    totalSteps: number;
    targetMindblock: string;
    intent: string;
  };
  
  // Session context
  currentSession: {
    sessionId: string;
    startTime: number;
    naviCuesCompleted: number;
    placeboCount: number;
    recentTypes: string[];
    energyLevel: 'low' | 'medium' | 'high';
    needsBreak: boolean;
  };
  
  // Lens preferences (learned over time)
  lensProfile: {
    preferredComplexity: 'simple' | 'moderate' | 'deep';
    metaphorReceptivity: number;
    visualLearning: number;
    narrativeStyle: 'first_person' | 'second_person' | 'observer';
  };
  
  // Magic aesthetic preferences
  magicProfile: {
    preferredAesthetics: string[];
    colorSensitivity: number;
    animationTolerance: number;
  };
  
  // Real-world integration
  practices: {
    activePractices: Practice[];
    completedExperiments: Experiment[];
    pendingCheckIns: CheckIn[];
  };
  
  // Transformation indicators
  transformationSignals: {
    knowing_to_believing: number;
    believing_to_embodying: number;
    phase_transition: number;
    mindblock_breakthrough: Record<string, number>;
  };
}

export interface MindblockState {
  intensity: number; // 0-100: How activated is this block?
  valence: number; // -1 to 1: Negative to positive state
  trajectory: 'improving' | 'stable' | 'declining';
  lastUpdated: number;
  confidence: number; // 0-1: How confident are we in this reading?
}

export interface Practice {
  id: string;
  type: 'mantra' | 'somatic_practice' | 'cognitive_tool' | 'behavioral_experiment';
  content: string;
  introducedAt: number;
  lastPracticed?: number;
  effectivenessRating?: number;
}

export interface Experiment {
  id: string;
  prompt: string;
  attempted: boolean;
  outcome?: string;
  insights?: string[];
}

export interface CheckIn {
  id: string;
  practiceId: string;
  scheduledFor: number;
  naviCueType: string;
}

// ==========================================
// NAVICUE DEFINITION (Complete Spec)
// ==========================================

export interface NaviCueDefinition {
  // Identity
  id: string;
  category: 'DEEP_WORK' | 'PLACEBO' | 'ARC_STEP' | 'PRACTICE_INTRO' | 'EXPERIMENT_CHECKIN';
  
  // Parsed metadata
  format: 'MOMENT' | 'MICRO' | 'MINI' | 'MODAL' | 'MILESTONE';
  container: 'CARD' | 'TOAST' | 'TIMER' | 'BANNER' | 'WIDGET' | 'FULLSCREEN';
  kbe: 'K' | 'B' | 'E';
  subcategory: string;
  
  // Targeting
  targetMindblocks: string[];
  targetPhases: number[];
  targetKBE: ('K' | 'B' | 'E')[];
  
  // Content (templated)
  content: {
    primary: string;
    secondary?: string;
    cta?: string;
  };
  
  // Response mechanism
  response: {
    type: 'select' | 'multiselect' | 'text' | 'voice' | 'body_map' | 'slider' | 'timer' | 'skip_allowed' | 'sit_with_it';
    options?: ResponseOption[];
    skipText?: string;
    placeholder?: string;
  };
  
  // Voice requirements
  voiceRequirements: {
    warmth: { min: number; max: number };
    directness: { min: number; max: number };
    humor: { min: number; max: number };
    paradox_tolerance: { min: number; max: number };
    compassion_heat: { min: number; max: number };
    precision: { min: number; max: number };
    somatic_bias: { min: number; max: number };
    meaning_bias: { min: number; max: number };
    challenge_bias: { min: number; max: number };
  };
  
  // Lens requirements
  lensRequirements: {
    complexity: 'simple' | 'moderate' | 'deep';
    metaphorUse: 'none' | 'light' | 'heavy';
    visualWeight: 'text_primary' | 'balanced' | 'visual_primary';
    narrativeVoice: 'first' | 'second' | 'observer' | 'flexible';
  };
  
  // Magic aesthetic
  magicRequirements: {
    aesthetics: string[];
    colorFamily?: string;
    animationIntensity: 'minimal' | 'moderate' | 'dynamic';
  };
  
  // Arc compatibility
  arcCompatibility?: {
    canStartArc: boolean;
    arcType?: string;
    position?: number;
  };
  
  // Practice/experiment delivery
  practiceDelivery?: {
    type: 'mantra' | 'somatic_practice' | 'cognitive_tool' | 'behavioral_experiment';
    content: string;
    followUpAfter?: number;
  };
  
  // Calibration impact
  calibration: {
    mindblockUpdates: MindblockUpdateRule[];
    voiceAdjustments?: VoiceAdjustmentRule[];
    kbeTransitionSignals?: KBESignalRule[];
    arcTriggers?: ArcTriggerRule[];
  };
}

export interface ResponseOption {
  value: string;
  display: string;
  revealsBias?: string;
  calibrationHint?: string;
}

export interface MindblockUpdateRule {
  mindblockId: string;
  responseMapping: Record<string, number>;
  confidenceWeight: number;
}

export interface VoiceAdjustmentRule {
  trigger: string;
  parameter: keyof UserContext['voiceProfile'];
  adjustment: number;
}

export interface KBESignalRule {
  trigger: string;
  from: 'K' | 'B' | 'E';
  to: 'K' | 'B' | 'E';
  strengthSignal: number;
}

export interface ArcTriggerRule {
  trigger: string;
  arcType: string;
  priority: number;
}

// ==========================================
// ARC DEFINITIONS (Sequential Chains)
// ==========================================

export interface ArcDefinition {
  id: string;
  type: string;
  targetMindblock: string;
  targetPhase: number[];
  targetKBE: ('K' | 'B' | 'E')[];
  steps: ArcStep[];
  triggerConditions: {
    mindblockIntensity?: { min: number };
    userReadiness?: { min: number };
    sessionContext?: { energyLevel: ('medium' | 'high')[] };
    recentActivity?: { noArcsInLast: number };
  };
  intent: string;
  expectedOutcome: string;
  aestheticContinuity: boolean;
  voiceContinuity: boolean;
}

export interface ArcStep {
  position: number;
  naviCueId: string;
  transitionDelay?: number;
  requiredCompletion: boolean;
  carryForward?: string[];
}

// ==========================================
// RESPONSE & CALIBRATION
// ==========================================

export interface NaviCueResponse {
  naviCueId: string;
  timestamp: number;
  sessionId: string;
  userId: string;
  responseType: 'select' | 'multiselect' | 'text' | 'voice' | 'skip' | 'custom';
  responseData: {
    selectedOptions?: string[];
    textContent?: string;
    voiceNoteUrl?: string;
    customData?: Record<string, any>;
  };
  targetMindblocks: string[];
  currentKBE: 'K' | 'B' | 'E';
  currentPhase: number;
  currentStage: number;
  insights: {
    mindblockUpdates: {
      mindblockId: string;
      previousState: number;
      newState: number;
      confidence: number;
    }[];
    nextNaviCueHints: {
      increaseDepth?: boolean;
      reduceIntensity?: boolean;
      shiftFocus?: string;
      addPlacebo?: boolean;
    };
    kbeTransitionSignal?: {
      from: 'K' | 'B' | 'E';
      to: 'K' | 'B' | 'E';
      readiness: number;
    };
  };
}

// ==========================================
// SELECTION STRATEGY
// ==========================================

export interface SelectionStrategy {
  mode: 'DEEP_WORK' | 'PLACEBO' | 'ARC_CONTINUATION' | 'PRACTICE_CHECKIN';
  arcId?: string;
  nextPosition?: number;
  checkInId?: string;
  practiceId?: string;
  targetMindblocks?: string[];
  depthModifier?: number;
  voiceProfile?: UserContext['voiceProfile'];
  antiPatterns?: string[];
  lensProfile?: UserContext['lensProfile'];
  magicProfile?: UserContext['magicProfile'];
  excludeRecent?: string[];
  avoidRepetition?: {
    format?: string;
    container?: string;
    subcategory?: string;
  };
  phase?: number;
  kbe?: 'K' | 'B' | 'E';
  surpriseChance?: number;
  aestheticConstraint?: any;
}

// ==========================================
// AESTHETIC LAYERS (Applied at render time)
// ==========================================

export interface AestheticLayers {
  color: {
    primary: string; // HSL
    secondary: string;
    gradient: string;
    text: string;
    background: string;
  };
  voice: {
    tone: string; // Descriptive: 'warm_compassionate', 'direct_coach', etc.
    parameters: UserContext['voiceProfile'];
  };
  magic: {
    aesthetic: string; // 'ethereal', 'grounded', 'clinical', etc.
    overlay: string; // CSS for overlay effects
    animation: string; // Animation class
  };
  layout: {
    variant: string; // Component variant to use
    spacing: string; // Spacing scale
    borderRadius: string;
    shadow: string;
  };
  tokens: Record<string, string>; // CSS custom properties
}
