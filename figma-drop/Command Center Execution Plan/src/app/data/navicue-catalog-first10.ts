import type { NaviCueDefinition } from '../types/navicue-engine';

// ==========================================
// FIRST 10 NAVICUES - PRODUCTION CATALOG
// ==========================================
// Mix of formats, KBE layers, mindblocks, and response types
// Includes: 8 deep work + 2 placebo + 1 arc starter

export const naviCueCatalog: NaviCueDefinition[] = [
  // ===== 1. MOMENT-CARD-K-REFLECT (Deep Work) =====
  {
    id: 'NAVICUE-001',
    category: 'DEEP_WORK',
    format: 'MOMENT',
    container: 'CARD',
    kbe: 'K',
    subcategory: 'REFLECT',
    
    targetMindblocks: ['IDENTITY_SELF_CONCEPT', 'IDENTITY_SELF_TRUST'],
    targetPhases: [1, 2, 3, 4],
    targetKBE: ['K', 'B'],
    
    content: {
      primary: 'What would trusting yourself look like today?',
      secondary: 'Not what it should look like. What would it actually look like?',
    },
    
    response: {
      type: 'text',
      placeholder: 'Type your thoughts...',
      skipText: 'Not right now',
    },
    
    voiceRequirements: {
      warmth: { min: 0.5, max: 1.0 },
      directness: { min: 0.3, max: 0.7 },
      humor: { min: 0, max: 0.5 },
      paradox_tolerance: { min: 0.3, max: 1.0 },
      compassion_heat: { min: 0.5, max: 1.0 },
      precision: { min: 0.4, max: 0.8 },
      somatic_bias: { min: 0, max: 0.5 },
      meaning_bias: { min: 0.3, max: 0.8 },
      challenge_bias: { min: 0.3, max: 0.7 },
    },
    
    lensRequirements: {
      complexity: 'moderate',
      metaphorUse: 'light',
      visualWeight: 'text_primary',
      narrativeVoice: 'second_person',
    },
    
    magicRequirements: {
      aesthetics: ['ethereal', 'grounded'],
      animationIntensity: 'minimal',
    },
    
    calibration: {
      mindblockUpdates: [
        {
          mindblockId: 'IDENTITY_SELF_TRUST',
          responseMapping: {
            skip: 5,
            text_long: -10,
            text_short: -5,
          },
          confidenceWeight: 0.1,
        },
      ],
    },
  },
  
  // ===== 2. MICRO-TOAST-B-SOMATIC (Deep Work) =====
  {
    id: 'NAVICUE-002',
    category: 'DEEP_WORK',
    format: 'MICRO',
    container: 'TOAST',
    kbe: 'B',
    subcategory: 'SOMATIC_CHECK',
    
    targetMindblocks: ['SOMATIC_AWARENESS'],
    targetPhases: [1, 2, 3, 4],
    targetKBE: ['B', 'E'],
    
    content: {
      primary: 'Where are you holding tension right now?',
    },
    
    response: {
      type: 'multiselect',
      options: [
        { value: 'shoulders', display: 'Shoulders', revealsBias: 'stress_holding' },
        { value: 'jaw', display: 'Jaw', revealsBias: 'suppression_pattern' },
        { value: 'chest', display: 'Chest', revealsBias: 'breath_restriction' },
        { value: 'stomach', display: 'Stomach', revealsBias: 'anxiety_center' },
        { value: 'nowhere', display: 'I feel relaxed', revealsBias: 'dissociation_or_calm' },
      ],
      skipText: 'Skip',
    },
    
    voiceRequirements: {
      warmth: { min: 0.4, max: 0.8 },
      directness: { min: 0.5, max: 1.0 },
      humor: { min: 0, max: 0.3 },
      paradox_tolerance: { min: 0, max: 0.4 },
      compassion_heat: { min: 0.4, max: 0.8 },
      precision: { min: 0.6, max: 1.0 },
      somatic_bias: { min: 0.7, max: 1.0 },
      meaning_bias: { min: 0, max: 0.3 },
      challenge_bias: { min: 0.2, max: 0.6 },
    },
    
    lensRequirements: {
      complexity: 'simple',
      metaphorUse: 'none',
      visualWeight: 'text_primary',
      narrativeVoice: 'second_person',
    },
    
    magicRequirements: {
      aesthetics: ['grounded', 'clinical'],
      animationIntensity: 'minimal',
    },
    
    arcCompatibility: {
      canStartArc: true,
      arcType: 'SOMATIC_GROUNDING_SEQUENCE',
      position: 1,
    },
    
    calibration: {
      mindblockUpdates: [
        {
          mindblockId: 'SOMATIC_AWARENESS',
          responseMapping: {
            nowhere: 10,
            shoulders: -5,
            jaw: -5,
            chest: -8,
            stomach: -8,
          },
          confidenceWeight: 0.15,
        },
      ],
      arcTriggers: [
        {
          trigger: 'shoulders,jaw',
          arcType: 'SOMATIC_GROUNDING_SEQUENCE',
          priority: 1,
        },
      ],
    },
  },
  
  // ===== 3. PLACEBO-CARD-MANTRA (Placebo) =====
  {
    id: 'NAVICUE-003',
    category: 'PLACEBO',
    format: 'MOMENT',
    container: 'CARD',
    kbe: 'B',
    subcategory: 'MANTRA',
    
    targetMindblocks: [],
    targetPhases: [1, 2, 3, 4],
    targetKBE: ['K', 'B', 'E'],
    
    content: {
      primary: 'You\'re doing better than you think.',
    },
    
    response: {
      type: 'sit_with_it',
    },
    
    voiceRequirements: {
      warmth: { min: 0.7, max: 1.0 },
      directness: { min: 0, max: 0.5 },
      humor: { min: 0, max: 0.4 },
      paradox_tolerance: { min: 0, max: 1.0 },
      compassion_heat: { min: 0.7, max: 1.0 },
      precision: { min: 0, max: 0.5 },
      somatic_bias: { min: 0, max: 0.5 },
      meaning_bias: { min: 0, max: 0.6 },
      challenge_bias: { min: 0, max: 0.3 },
    },
    
    lensRequirements: {
      complexity: 'simple',
      metaphorUse: 'none',
      visualWeight: 'balanced',
      narrativeVoice: 'second_person',
    },
    
    magicRequirements: {
      aesthetics: ['ethereal', 'vibrant'],
      animationIntensity: 'moderate',
    },
    
    calibration: {
      mindblockUpdates: [],
    },
  },
  
  // ===== 4. MODAL-FULLSCREEN-B-REFRAME (Deep Work) =====
  {
    id: 'NAVICUE-004',
    category: 'DEEP_WORK',
    format: 'MODAL',
    container: 'FULLSCREEN',
    kbe: 'B',
    subcategory: 'REFRAME',
    
    targetMindblocks: ['COGNITIVE_DISTORTIONS', 'COGNITIVE_FLEXIBILITY'],
    targetPhases: [2, 3, 4],
    targetKBE: ['B', 'E'],
    
    content: {
      primary: 'What if this difficult feeling is exactly where the growth is?',
      secondary: 'Not despite the difficulty. Because of it.',
    },
    
    response: {
      type: 'select',
      options: [
        { value: 'resist', display: 'That doesn\'t feel true', revealsBias: 'resistance' },
        { value: 'curious', display: 'I\'m curious about that', revealsBias: 'openness' },
        { value: 'experienced', display: 'I\'ve felt this before', revealsBias: 'recognition' },
        { value: 'sitting', display: 'Let me sit with this', revealsBias: 'contemplation' },
      ],
      skipText: 'Not ready',
    },
    
    voiceRequirements: {
      warmth: { min: 0.5, max: 0.9 },
      directness: { min: 0.4, max: 0.8 },
      humor: { min: 0, max: 0.3 },
      paradox_tolerance: { min: 0.6, max: 1.0 },
      compassion_heat: { min: 0.5, max: 0.9 },
      precision: { min: 0.3, max: 0.7 },
      somatic_bias: { min: 0.2, max: 0.6 },
      meaning_bias: { min: 0.5, max: 1.0 },
      challenge_bias: { min: 0.4, max: 0.8 },
    },
    
    lensRequirements: {
      complexity: 'deep',
      metaphorUse: 'light',
      visualWeight: 'visual_primary',
      narrativeVoice: 'second_person',
    },
    
    magicRequirements: {
      aesthetics: ['ethereal', 'vibrant'],
      animationIntensity: 'dynamic',
    },
    
    calibration: {
      mindblockUpdates: [
        {
          mindblockId: 'COGNITIVE_FLEXIBILITY',
          responseMapping: {
            resist: 5,
            curious: -15,
            experienced: -10,
            sitting: -12,
          },
          confidenceWeight: 0.2,
        },
      ],
      kbeTransitionSignals: [
        {
          trigger: 'curious',
          from: 'B',
          to: 'E',
          strengthSignal: 0.3,
        },
      ],
    },
  },
  
  // ===== 5. MICRO-TIMER-E-BREATHE (Deep Work - Arc Step 2) =====
  {
    id: 'NAVICUE-005',
    category: 'DEEP_WORK',
    format: 'MICRO',
    container: 'TIMER',
    kbe: 'E',
    subcategory: 'BREATHE',
    
    targetMindblocks: ['SOMATIC_AWARENESS', 'EMOTIONAL_REGULATION'],
    targetPhases: [1, 2, 3, 4],
    targetKBE: ['B', 'E'],
    
    content: {
      primary: 'Take 3 deep breaths.',
      secondary: 'Notice what shifts.',
    },
    
    response: {
      type: 'timer',
    },
    
    voiceRequirements: {
      warmth: { min: 0.5, max: 0.9 },
      directness: { min: 0.6, max: 1.0 },
      humor: { min: 0, max: 0.2 },
      paradox_tolerance: { min: 0, max: 0.3 },
      compassion_heat: { min: 0.5, max: 0.8 },
      precision: { min: 0.7, max: 1.0 },
      somatic_bias: { min: 0.8, max: 1.0 },
      meaning_bias: { min: 0, max: 0.3 },
      challenge_bias: { min: 0.2, max: 0.5 },
    },
    
    lensRequirements: {
      complexity: 'simple',
      metaphorUse: 'none',
      visualWeight: 'balanced',
      narrativeVoice: 'second_person',
    },
    
    magicRequirements: {
      aesthetics: ['grounded', 'clinical'],
      animationIntensity: 'moderate',
    },
    
    arcCompatibility: {
      canStartArc: false,
      arcType: 'SOMATIC_GROUNDING_SEQUENCE',
      position: 2,
    },
    
    calibration: {
      mindblockUpdates: [
        {
          mindblockId: 'SOMATIC_AWARENESS',
          responseMapping: {
            completed: -8,
            skip: 3,
          },
          confidenceWeight: 0.15,
        },
      ],
    },
  },
  
  // ===== 6. MOMENT-CARD-K-CHOICE (Deep Work) =====
  {
    id: 'NAVICUE-006',
    category: 'DEEP_WORK',
    format: 'MOMENT',
    container: 'CARD',
    kbe: 'K',
    subcategory: 'CHOICE_REVEALS',
    
    targetMindblocks: ['SELF_CARE', 'BEHAVIORAL_PATTERNS'],
    targetPhases: [1, 2, 3, 4],
    targetKBE: ['K', 'B'],
    
    content: {
      primary: 'You have 10 minutes free. What sounds most appealing?',
    },
    
    response: {
      type: 'select',
      options: [
        { value: 'scroll', display: 'Scroll social media', revealsBias: 'avoidance_pattern' },
        { value: 'friend', display: 'Call a friend', revealsBias: 'connection_seeking' },
        { value: 'silence', display: 'Sit in silence', revealsBias: 'contemplative_capacity' },
        { value: 'move', display: 'Move my body', revealsBias: 'embodiment_active' },
        { value: 'guilty', display: 'Do nothing and feel guilty about it', revealsBias: 'shame_present' },
      ],
    },
    
    voiceRequirements: {
      warmth: { min: 0.4, max: 0.8 },
      directness: { min: 0.5, max: 0.9 },
      humor: { min: 0.2, max: 0.6 },
      paradox_tolerance: { min: 0.2, max: 0.6 },
      compassion_heat: { min: 0.3, max: 0.7 },
      precision: { min: 0.5, max: 0.9 },
      somatic_bias: { min: 0.2, max: 0.6 },
      meaning_bias: { min: 0.2, max: 0.6 },
      challenge_bias: { min: 0.3, max: 0.7 },
    },
    
    lensRequirements: {
      complexity: 'moderate',
      metaphorUse: 'none',
      visualWeight: 'text_primary',
      narrativeVoice: 'second_person',
    },
    
    magicRequirements: {
      aesthetics: ['grounded', 'clinical'],
      animationIntensity: 'minimal',
    },
    
    calibration: {
      mindblockUpdates: [
        {
          mindblockId: 'SELF_CARE',
          responseMapping: {
            scroll: 8,
            friend: -5,
            silence: -10,
            move: -12,
            guilty: 15,
          },
          confidenceWeight: 0.15,
        },
      ],
      voiceAdjustments: [
        {
          trigger: 'guilty',
          parameter: 'compassion_heat',
          adjustment: 0.1,
        },
      ],
    },
  },
  
  // ===== 7. PLACEBO-TOAST-FACTOID (Placebo) =====
  {
    id: 'NAVICUE-007',
    category: 'PLACEBO',
    format: 'MICRO',
    container: 'TOAST',
    kbe: 'K',
    subcategory: 'FACTOID',
    
    targetMindblocks: [],
    targetPhases: [1, 2, 3, 4],
    targetKBE: ['K', 'B', 'E'],
    
    content: {
      primary: 'Your brain is more plastic than you think.',
      secondary: 'Every experience rewires neural pathways.',
    },
    
    response: {
      type: 'sit_with_it',
    },
    
    voiceRequirements: {
      warmth: { min: 0.3, max: 0.7 },
      directness: { min: 0.5, max: 0.9 },
      humor: { min: 0.2, max: 0.6 },
      paradox_tolerance: { min: 0, max: 0.5 },
      compassion_heat: { min: 0, max: 0.5 },
      precision: { min: 0.7, max: 1.0 },
      somatic_bias: { min: 0, max: 0.3 },
      meaning_bias: { min: 0.3, max: 0.7 },
      challenge_bias: { min: 0, max: 0.4 },
    },
    
    lensRequirements: {
      complexity: 'simple',
      metaphorUse: 'none',
      visualWeight: 'text_primary',
      narrativeVoice: 'observer',
    },
    
    magicRequirements: {
      aesthetics: ['clinical', 'grounded'],
      animationIntensity: 'minimal',
    },
    
    calibration: {
      mindblockUpdates: [],
    },
  },
  
  // ===== 8. MOMENT-CARD-B-PARADOX (Deep Work) =====
  {
    id: 'NAVICUE-008',
    category: 'DEEP_WORK',
    format: 'MOMENT',
    container: 'CARD',
    kbe: 'B',
    subcategory: 'PARADOX',
    
    targetMindblocks: ['EXISTENTIAL_MEANING', 'COGNITIVE_FLEXIBILITY'],
    targetPhases: [2, 3, 4],
    targetKBE: ['B', 'E'],
    
    content: {
      primary: 'What if the part of you that\'s struggling is also the part that\'s waking up?',
    },
    
    response: {
      type: 'select',
      options: [
        { value: 'tell_more', display: 'Tell me more', revealsBias: 'curiosity' },
        { value: 'sitting', display: 'Let me sit with this', revealsBias: 'contemplation' },
        { value: 'not_ready', display: 'This feels too abstract', revealsBias: 'concreteness_need' },
      ],
    },
    
    voiceRequirements: {
      warmth: { min: 0.5, max: 0.9 },
      directness: { min: 0.3, max: 0.7 },
      humor: { min: 0, max: 0.3 },
      paradox_tolerance: { min: 0.7, max: 1.0 },
      compassion_heat: { min: 0.5, max: 0.9 },
      precision: { min: 0.2, max: 0.6 },
      somatic_bias: { min: 0, max: 0.4 },
      meaning_bias: { min: 0.7, max: 1.0 },
      challenge_bias: { min: 0.5, max: 0.9 },
    },
    
    lensRequirements: {
      complexity: 'deep',
      metaphorUse: 'heavy',
      visualWeight: 'text_primary',
      narrativeVoice: 'second_person',
    },
    
    magicRequirements: {
      aesthetics: ['ethereal', 'vibrant'],
      animationIntensity: 'moderate',
    },
    
    calibration: {
      mindblockUpdates: [
        {
          mindblockId: 'EXISTENTIAL_MEANING',
          responseMapping: {
            tell_more: -10,
            sitting: -8,
            not_ready: 5,
          },
          confidenceWeight: 0.15,
        },
      ],
      voiceAdjustments: [
        {
          trigger: 'not_ready',
          parameter: 'paradox_tolerance',
          adjustment: -0.1,
        },
        {
          trigger: 'tell_more',
          parameter: 'meaning_bias',
          adjustment: 0.1,
        },
      ],
    },
  },
  
  // ===== 9. MINI-CARD-E-BACKSTORY (Deep Work) =====
  {
    id: 'NAVICUE-009',
    category: 'DEEP_WORK',
    format: 'MINI',
    container: 'CARD',
    kbe: 'E',
    subcategory: 'BACKSTORY',
    
    targetMindblocks: ['RELATIONAL_BOUNDARIES', 'IDENTITY_SELF_CONCEPT'],
    targetPhases: [2, 3, 4],
    targetKBE: ['B', 'E'],
    
    content: {
      primary: 'When did you first learn that your needs didn\'t matter?',
    },
    
    response: {
      type: 'text',
      placeholder: 'Share if you\'re ready...',
      skipText: 'Not ready to explore this',
    },
    
    voiceRequirements: {
      warmth: { min: 0.7, max: 1.0 },
      directness: { min: 0.4, max: 0.8 },
      humor: { min: 0, max: 0.2 },
      paradox_tolerance: { min: 0.3, max: 0.7 },
      compassion_heat: { min: 0.8, max: 1.0 },
      precision: { min: 0.3, max: 0.7 },
      somatic_bias: { min: 0.2, max: 0.6 },
      meaning_bias: { min: 0.4, max: 0.8 },
      challenge_bias: { min: 0.5, max: 0.9 },
    },
    
    lensRequirements: {
      complexity: 'deep',
      metaphorUse: 'none',
      visualWeight: 'text_primary',
      narrativeVoice: 'second_person',
    },
    
    magicRequirements: {
      aesthetics: ['grounded', 'ethereal'],
      animationIntensity: 'minimal',
    },
    
    calibration: {
      mindblockUpdates: [
        {
          mindblockId: 'RELATIONAL_BOUNDARIES',
          responseMapping: {
            skip: 8,
            text_long: -15,
            text_short: -8,
          },
          confidenceWeight: 0.2,
        },
      ],
    },
  },
  
  // ===== 10. MOMENT-CARD-E-MICRO_REFLECT (Deep Work - Arc Step 3) =====
  {
    id: 'NAVICUE-010',
    category: 'DEEP_WORK',
    format: 'MOMENT',
    container: 'CARD',
    kbe: 'E',
    subcategory: 'MICRO_REFLECT',
    
    targetMindblocks: ['SOMATIC_AWARENESS', 'EMOTIONAL_PROCESSING'],
    targetPhases: [1, 2, 3, 4],
    targetKBE: ['B', 'E'],
    
    content: {
      primary: 'Right now, I feel...',
    },
    
    response: {
      type: 'multiselect',
      options: [
        { value: 'curious', display: 'Curious', revealsBias: 'openness' },
        { value: 'overwhelmed', display: 'Overwhelmed', revealsBias: 'capacity_limit' },
        { value: 'hopeful', display: 'Hopeful', revealsBias: 'positive_valence' },
        { value: 'stuck', display: 'Stuck', revealsBias: 'blocked' },
        { value: 'calm', display: 'Calm', revealsBias: 'regulated' },
        { value: 'restless', display: 'Restless', revealsBias: 'activation' },
      ],
    },
    
    voiceRequirements: {
      warmth: { min: 0.5, max: 0.9 },
      directness: { min: 0.4, max: 0.8 },
      humor: { min: 0, max: 0.4 },
      paradox_tolerance: { min: 0, max: 0.5 },
      compassion_heat: { min: 0.6, max: 1.0 },
      precision: { min: 0.5, max: 0.9 },
      somatic_bias: { min: 0.5, max: 0.9 },
      meaning_bias: { min: 0.2, max: 0.6 },
      challenge_bias: { min: 0.2, max: 0.6 },
    },
    
    lensRequirements: {
      complexity: 'simple',
      metaphorUse: 'none',
      visualWeight: 'text_primary',
      narrativeVoice: 'first_person',
    },
    
    magicRequirements: {
      aesthetics: ['grounded', 'ethereal'],
      animationIntensity: 'minimal',
    },
    
    arcCompatibility: {
      canStartArc: false,
      arcType: 'SOMATIC_GROUNDING_SEQUENCE',
      position: 3,
    },
    
    calibration: {
      mindblockUpdates: [
        {
          mindblockId: 'EMOTIONAL_REGULATION',
          responseMapping: {
            curious: -5,
            overwhelmed: 10,
            hopeful: -8,
            stuck: 8,
            calm: -10,
            restless: 6,
          },
          confidenceWeight: 0.15,
        },
      ],
    },
  },
];
