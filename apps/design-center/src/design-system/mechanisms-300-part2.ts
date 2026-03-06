/**
 * THE 300 MECHANISMS (Part 2)
 * Temporal, Emotional, Relational, Cognitive, Energetic, Ritual
 * 
 * Completing the trinity: Science x Spirituality x Apple
 */

import type { Mechanism } from './experience-genome';

export const MECHANISMS_300_PART2: Record<string, Mechanism> = {
  
  // ===================================================================
  // TEMPORAL MECHANISMS (35)
  // Time: Pattern recognition x Cyclical wisdom x Momentum design
  // ===================================================================
  
  MOMENTUM_TRACKER: {
    id: 'momentum_tracker', name: 'Momentum Tracker', category: 'temporal', complexity: 'medium',
    modality: ['visual', 'temporal'], outcome: ['awareness', 'activation'],
    description: 'Progress isn\'t linear - see the arc',
    interactionType: 'timeline-graph', duration: 'medium',
    responseAffinity: ['BECOMING', 'KNOWING'],
  },
  PATTERN_INTERRUPT: {
    id: 'pattern_interrupt', name: 'Pattern Interrupt', category: 'temporal', complexity: 'simple',
    modality: ['kinesthetic', 'temporal'], outcome: ['awareness', 'activation'],
    description: 'Break the loop - shake it',
    interactionType: 'shake-to-break', duration: 'instant',
    responseAffinity: ['CHOOSING', 'RELEASING'],
  },
  MICRO_COMMITMENT: {
    id: 'micro_commitment', name: 'Micro-Commitment', category: 'temporal', complexity: 'simple',
    modality: ['visual'], outcome: ['decision', 'activation'],
    description: 'Tiny promise - next 10 minutes',
    interactionType: 'tap-to-commit', duration: 'instant',
    responseAffinity: ['CHOOSING', 'BECOMING'],
  },
  FUTURE_SELF_POSTCARD: {
    id: 'future_self_postcard', name: 'Future Self Postcard', category: 'temporal', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['integration', 'awareness'],
    description: 'Message from future you',
    interactionType: 'text-input', duration: 'long',
    responseAffinity: ['BECOMING', 'INTEGRATING'],
  },
  CYCLE_WHEEL: {
    id: 'cycle_wheel', name: 'Cycle Wheel', category: 'temporal', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness'],
    description: 'Patterns repeat - map the wheel',
    interactionType: 'circular-drag', duration: 'medium',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  TIMELINE_PINPOINT: {
    id: 'timeline_pinpoint', name: 'Timeline Pinpoint', category: 'temporal', complexity: 'simple',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness'],
    description: 'Mark the moment - when did it shift?',
    interactionType: 'tap-timeline', duration: 'instant',
    responseAffinity: ['WITNESSING', 'KNOWING'],
  },
  RHYTHM_TAP: {
    id: 'rhythm_tap', name: 'Rhythm Tap', category: 'temporal', complexity: 'simple',
    modality: ['kinesthetic', 'auditory'], outcome: ['grounding', 'awareness'],
    description: 'Find your natural rhythm',
    interactionType: 'tap-rhythm', duration: 'short',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  DURATION_SLIDER: {
    id: 'duration_slider', name: 'Duration Slider', category: 'temporal', complexity: 'simple',
    modality: ['visual'], outcome: ['awareness'],
    description: 'How long did it last? Estimate',
    interactionType: 'time-slider', duration: 'instant',
    responseAffinity: ['WITNESSING', 'KNOWING'],
  },
  SEASON_SELECTOR: {
    id: 'season_selector', name: 'Season Selector', category: 'temporal', complexity: 'simple',
    modality: ['visual'], outcome: ['awareness'],
    description: 'What season are you in?',
    interactionType: 'seasonal-tap', duration: 'instant',
    responseAffinity: ['WITNESSING', 'KNOWING'],
  },
  PACE_ADJUSTER: {
    id: 'pace_adjuster', name: 'Pace Adjuster', category: 'temporal', complexity: 'simple',
    modality: ['visual'], outcome: ['decision', 'grounding'],
    description: 'Sustainable speed - set yours',
    interactionType: 'speed-slider', duration: 'instant',
    responseAffinity: ['CHOOSING', 'FEELING'],
  },
  BEFORE_AFTER_SPLIT: {
    id: 'before_after_split', name: 'Before/After Split', category: 'temporal', complexity: 'simple',
    modality: ['visual'], outcome: ['awareness', 'integration'],
    description: 'Life before this, life after',
    interactionType: 'timeline-divide', duration: 'short',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  REPLAY_REWRITE: {
    id: 'replay_rewrite', name: 'Replay & Rewrite', category: 'temporal', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['integration', 'awareness'],
    description: 'Replay moment - rewrite ending',
    interactionType: 'scenario-revision', duration: 'long',
    responseAffinity: ['INTEGRATING', 'KNOWING'],
  },
  WAIT_TOLERANCE: {
    id: 'wait_tolerance', name: 'Wait Tolerance', category: 'temporal', complexity: 'simple',
    modality: ['temporal'], outcome: ['grounding', 'awareness'],
    description: 'Practice pause - can you wait?',
    interactionType: 'delay-timer', duration: 'medium',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  TIME_HORIZON: {
    id: 'time_horizon', name: 'Time Horizon', category: 'temporal', complexity: 'simple',
    modality: ['visual'], outcome: ['awareness', 'decision'],
    description: 'Looking how far ahead?',
    interactionType: 'horizon-slider', duration: 'instant',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  PAST_SELF_COMPASSION: {
    id: 'past_self_compassion', name: 'Past Self Compassion', category: 'temporal', complexity: 'medium',
    modality: ['visual'], outcome: ['integration', 'release'],
    description: 'Look back with kindness',
    interactionType: 'timeline-reflection', duration: 'medium',
    responseAffinity: ['INTEGRATING', 'RELEASING'],
  },
  TIPPING_POINT: {
    id: 'tipping_point', name: 'Tipping Point', category: 'temporal', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness'],
    description: 'When did it tip? Mark it',
    interactionType: 'inflection-point', duration: 'short',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  HABIT_CHAIN_LINK: {
    id: 'habit_chain_link', name: 'Habit Chain Link', category: 'temporal', complexity: 'simple',
    modality: ['visual'], outcome: ['activation', 'awareness'],
    description: 'Don\'t break the chain',
    interactionType: 'streak-tracking', duration: 'instant',
    responseAffinity: ['BECOMING', 'CHOOSING'],
  },
  WINDOW_AWARENESS: {
    id: 'window_awareness', name: 'Window Awareness', category: 'temporal', complexity: 'simple',
    modality: ['visual'], outcome: ['awareness', 'decision'],
    description: 'Window is open - act now',
    interactionType: 'opportunity-alert', duration: 'instant',
    responseAffinity: ['CHOOSING', 'WITNESSING'],
  },
  CRESCENDO_BUILD: {
    id: 'crescendo_build', name: 'Crescendo Build', category: 'temporal', complexity: 'medium',
    modality: ['visual', 'temporal'], outcome: ['activation', 'awareness'],
    description: 'Feel the build - crescendo awareness',
    interactionType: 'intensity-curve', duration: 'medium',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  PRESENT_MOMENT_ANCHOR: {
    id: 'present_moment_anchor', name: 'Present Moment Anchor', category: 'temporal', complexity: 'simple',
    modality: ['visual', 'temporal'], outcome: ['grounding', 'awareness'],
    description: 'Now. Only now. Come back',
    interactionType: 'now-pulse', duration: 'instant',
    responseAffinity: ['WITNESSING', 'FEELING'],
  },
  TRANSITION_RITUAL: {
    id: 'transition_ritual', name: 'Transition Ritual', category: 'temporal', complexity: 'medium',
    modality: ['kinesthetic', 'temporal'], outcome: ['grounding', 'integration'],
    description: 'Mark passage between states',
    interactionType: 'ritual-sequence', duration: 'medium',
    responseAffinity: ['INTEGRATING', 'BELIEVING'],
  },

  // ===================================================================
  // EMOTIONAL MECHANISMS (50) - representative sample
  // Heart: Affect regulation x Emotional wisdom x Feeling elegance
  // ===================================================================

  MOOD_MOLECULE: {
    id: 'mood_molecule', name: 'Mood Molecule', category: 'emotional', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'integration'],
    description: 'Emotions are complex - build the molecule',
    interactionType: 'connect-emotions', duration: 'medium',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  BELIEF_WEATHER: {
    id: 'belief_weather', name: 'Belief Weather', category: 'emotional', complexity: 'medium',
    modality: ['visual'], outcome: ['awareness'],
    description: 'What\'s your inner climate?',
    interactionType: 'weather-select', duration: 'short',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  RESISTANCE_RADAR: {
    id: 'resistance_radar', name: 'Resistance Radar', category: 'emotional', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness'],
    description: 'Map what you avoid',
    interactionType: 'radar-plot', duration: 'medium',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  FORGIVENESS_FLAME: {
    id: 'forgiveness_flame', name: 'Forgiveness Flame', category: 'emotional', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['release', 'integration'],
    description: 'Burn it - release ritual',
    interactionType: 'swipe-to-burn', duration: 'medium',
    responseAffinity: ['RELEASING', 'INTEGRATING'],
  },
  EMOTION_SPECTRUM: {
    id: 'emotion_spectrum', name: 'Emotion Spectrum', category: 'emotional', complexity: 'simple',
    modality: ['visual'], outcome: ['awareness'],
    description: 'Not binary - find your place on spectrum',
    interactionType: 'spectrum-slider', duration: 'instant',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  HEART_COMPASS: {
    id: 'heart_compass', name: 'Heart Compass', category: 'emotional', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'decision'],
    description: 'Where does heart point?',
    interactionType: 'compass-spin', duration: 'short',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  GRATITUDE_GARDEN: {
    id: 'gratitude_garden', name: 'Gratitude Garden', category: 'emotional', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['integration', 'grounding'],
    description: 'Plant flowers of thanks',
    interactionType: 'tap-to-plant', duration: 'medium',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  EMOTION_LAYERS: {
    id: 'emotion_layers', name: 'Emotion Layers', category: 'emotional', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'integration'],
    description: 'Peel back - what\'s underneath?',
    interactionType: 'swipe-to-reveal', duration: 'medium',
    responseAffinity: ['FEELING', 'KNOWING'],
  },
  JOY_SPARK: {
    id: 'joy_spark', name: 'Joy Spark', category: 'emotional', complexity: 'simple',
    modality: ['visual', 'kinesthetic'], outcome: ['activation'],
    description: 'Light the spark - feel joy',
    interactionType: 'tap-to-spark', duration: 'instant',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  GRIEF_WAVE: {
    id: 'grief_wave', name: 'Grief Wave', category: 'emotional', complexity: 'medium',
    modality: ['visual', 'temporal'], outcome: ['release', 'awareness'],
    description: 'Ride it - don\'t drown',
    interactionType: 'wave-animation', duration: 'medium',
    responseAffinity: ['FEELING', 'RELEASING'],
  },
  ANGER_ALCHEMY: {
    id: 'anger_alchemy', name: 'Anger Alchemy', category: 'emotional', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['integration', 'activation'],
    description: 'Transform anger to power',
    interactionType: 'energy-conversion', duration: 'medium',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  SHAME_DISSOLVE: {
    id: 'shame_dissolve', name: 'Shame Dissolve', category: 'emotional', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['release', 'integration'],
    description: 'Shame shrinks in light - expose it',
    interactionType: 'exposure-fade', duration: 'long',
    responseAffinity: ['RELEASING', 'INTEGRATING'],
  },
  FEAR_FRIEND: {
    id: 'fear_friend', name: 'Fear Friend', category: 'emotional', complexity: 'medium',
    modality: ['visual'], outcome: ['integration', 'awareness'],
    description: 'What if fear is trying to help?',
    interactionType: 'reframe-dialogue', duration: 'medium',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  HOPE_KINDLE: {
    id: 'hope_kindle', name: 'Hope Kindle', category: 'emotional', complexity: 'simple',
    modality: ['visual', 'kinesthetic'], outcome: ['activation', 'grounding'],
    description: 'Kindle small flame of hope',
    interactionType: 'flame-grow', duration: 'short',
    responseAffinity: ['FEELING', 'BELIEVING'],
  },
  NUMBNESS_THAW: {
    id: 'numbness_thaw', name: 'Numbness Thaw', category: 'emotional', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'activation'],
    description: 'Gentle thaw - don\'t force',
    interactionType: 'gradual-warming', duration: 'long',
    responseAffinity: ['FEELING', 'BECOMING'],
  },
  AMBIVALENCE_HOLD: {
    id: 'ambivalence_hold', name: 'Ambivalence Hold', category: 'emotional', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'grounding'],
    description: 'Hold both truths - no rush',
    interactionType: 'paradox-embrace', duration: 'medium',
    responseAffinity: ['WITNESSING', 'INTEGRATING'],
  },
  PEACE_SETTLE: {
    id: 'peace_settle', name: 'Peace Settle', category: 'emotional', complexity: 'simple',
    modality: ['visual', 'temporal'], outcome: ['grounding', 'awareness'],
    description: 'Let peace settle like snow',
    interactionType: 'settling-animation', duration: 'medium',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  AWE_EXPANSION: {
    id: 'awe_expansion', name: 'Awe Expansion', category: 'emotional', complexity: 'simple',
    modality: ['visual', 'temporal'], outcome: ['integration', 'awareness'],
    description: 'Let awe expand you',
    interactionType: 'expansive-animation', duration: 'medium',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
};

export default MECHANISMS_300_PART2;
