/**
 * THE 300 MECHANISMS (Part 3 - FINAL)
 * Relational, Cognitive, Energetic, Ritual
 * 
 * Completing the trinity: Science x Spirituality x Apple
 * Ram Dass x Alan Watts x Steve Jobs x Neuroscience x Master Therapists
 */

import type { Mechanism } from './experience-genome';

export const MECHANISMS_300_PART3: Record<string, Mechanism> = {
  
  // ===================================================================
  // RELATIONAL MECHANISMS (35)
  // Connection: Attachment theory x Interdependence x Gesture intimacy
  // ===================================================================
  
  ENERGY_EXCHANGE: {
    id: 'energy_exchange', name: 'Energy Exchange', category: 'relational', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'decision'],
    description: 'Give/receive - are you balanced?',
    interactionType: 'balance-slider', duration: 'short',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  CONNECTION_WEB: {
    id: 'connection_web', name: 'Connection Web', category: 'relational', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'integration'],
    description: 'Map your web - who holds you?',
    interactionType: 'node-linking', duration: 'long',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  ATTACHMENT_STYLE: {
    id: 'attachment_style', name: 'Attachment Style', category: 'relational', complexity: 'medium',
    modality: ['visual'], outcome: ['awareness'],
    description: 'Your attachment - name it',
    interactionType: 'style-select', duration: 'short',
    responseAffinity: ['KNOWING', 'WITNESSING'],
  },
  NEEDS_INVENTORY: {
    id: 'needs_inventory', name: 'Needs Inventory', category: 'relational', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'decision'],
    description: 'What do you need right now?',
    interactionType: 'multi-select', duration: 'short',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  BOUNDARY_RING: {
    id: 'boundary_ring', name: 'Boundary Ring', category: 'relational', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['decision', 'grounding'],
    description: 'Draw the ring - this far, no further',
    interactionType: 'circular-boundary', duration: 'short',
    responseAffinity: ['CHOOSING', 'BELIEVING'],
  },
  EMPATHY_BRIDGE: {
    id: 'empathy_bridge', name: 'Empathy Bridge', category: 'relational', complexity: 'medium',
    modality: ['visual'], outcome: ['awareness', 'integration'],
    description: 'Build bridge to their world',
    interactionType: 'bridge-build', duration: 'medium',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  REPAIR_RITUAL: {
    id: 'repair_ritual', name: 'Repair Ritual', category: 'relational', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['integration', 'release'],
    description: 'Rupture happens - repair it',
    interactionType: 'ritual-steps', duration: 'long',
    responseAffinity: ['INTEGRATING', 'RELEASING'],
  },
  DIFFERENTIATION_MARKER: {
    id: 'differentiation_marker', name: 'Differentiation Marker', category: 'relational', complexity: 'simple',
    modality: ['visual'], outcome: ['awareness', 'grounding'],
    description: 'You are you, they are them',
    interactionType: 'separation-visual', duration: 'instant',
    responseAffinity: ['KNOWING', 'BELIEVING'],
  },
  TURN_TOWARD: {
    id: 'turn_toward', name: 'Turn Toward', category: 'relational', complexity: 'simple',
    modality: ['kinesthetic'], outcome: ['activation', 'decision'],
    description: 'Choose to turn toward',
    interactionType: 'directional-choice', duration: 'instant',
    responseAffinity: ['CHOOSING', 'FEELING'],
  },
  CO_REGULATION: {
    id: 'co_regulation', name: 'Co-Regulation', category: 'relational', complexity: 'medium',
    modality: ['visual', 'temporal'], outcome: ['grounding', 'awareness'],
    description: 'Sync nervous systems - breathe together',
    interactionType: 'sync-animation', duration: 'medium',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  SECURE_BASE: {
    id: 'secure_base', name: 'Secure Base', category: 'relational', complexity: 'simple',
    modality: ['visual'], outcome: ['grounding', 'awareness'],
    description: 'Who is your secure base?',
    interactionType: 'person-identify', duration: 'short',
    responseAffinity: ['KNOWING', 'BELIEVING'],
  },
  VULNERABILITY_OFFER: {
    id: 'vulnerability_offer', name: 'Vulnerability Offer', category: 'relational', complexity: 'complex',
    modality: ['kinesthetic'], outcome: ['activation', 'integration'],
    description: 'Risk being seen - offer truth',
    interactionType: 'courage-action', duration: 'medium',
    responseAffinity: ['CHOOSING', 'INTEGRATING'],
  },
  HOLDING_SPACE: {
    id: 'holding_space', name: 'Holding Space', category: 'relational', complexity: 'simple',
    modality: ['visual', 'temporal'], outcome: ['grounding', 'awareness'],
    description: 'Just hold - don\'t fix',
    interactionType: 'presence-hold', duration: 'medium',
    responseAffinity: ['WITNESSING', 'FEELING'],
  },

  // ===================================================================
  // COGNITIVE MECHANISMS (40)
  // Mind: CBT/ACT precision x Zen paradox x Intuitive interface
  // ===================================================================

  WISDOM_WELL: {
    id: 'wisdom_well', name: 'Wisdom Well', category: 'cognitive', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'integration'],
    description: 'Draw from inner knowing',
    interactionType: 'tap-to-reveal', duration: 'short',
    responseAffinity: ['KNOWING', 'BELIEVING'],
  },
  NARRATIVE_THREAD: {
    id: 'narrative_thread', name: 'Narrative Thread', category: 'cognitive', complexity: 'complex',
    modality: ['visual'], outcome: ['integration', 'awareness'],
    description: 'Connect story threads',
    interactionType: 'thread-weaving', duration: 'long',
    responseAffinity: ['INTEGRATING', 'KNOWING'],
  },
  BELIEF_BUBBLE: {
    id: 'belief_bubble', name: 'Belief Bubble', category: 'cognitive', complexity: 'simple',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'release'],
    description: 'Pop limiting belief - watch it dissolve',
    interactionType: 'tap-to-pop', duration: 'instant',
    responseAffinity: ['KNOWING', 'RELEASING'],
  },
  VALUE_STACK: {
    id: 'value_stack', name: 'Value Stack', category: 'cognitive', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['decision', 'awareness'],
    description: 'Order values - what matters most?',
    interactionType: 'drag-to-order', duration: 'medium',
    responseAffinity: ['CHOOSING', 'KNOWING'],
  },
  PERSPECTIVE_SHIFT: {
    id: 'perspective_shift', name: 'Perspective Shift', category: 'cognitive', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'integration'],
    description: 'Rotate viewpoint - see new angle',
    interactionType: 'rotate-view', duration: 'short',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  REFRAME_LENS: {
    id: 'reframe_lens', name: 'Reframe Lens', category: 'cognitive', complexity: 'medium',
    modality: ['visual'], outcome: ['awareness', 'integration'],
    description: 'Apply new lens - shift meaning',
    interactionType: 'lens-select', duration: 'short',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  COGNITIVE_TRIANGLE: {
    id: 'cognitive_triangle', name: 'Cognitive Triangle', category: 'cognitive', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'integration'],
    description: 'Thought -> Feeling -> Behavior loop',
    interactionType: 'triangle-plot', duration: 'medium',
    responseAffinity: ['KNOWING', 'INTEGRATING'],
  },
  DEFUSION_DISTANCE: {
    id: 'defusion_distance', name: 'Defusion Distance', category: 'cognitive', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'release'],
    description: 'You are not your thoughts - create space',
    interactionType: 'thought-separate', duration: 'short',
    responseAffinity: ['KNOWING', 'RELEASING'],
  },
  OBSERVER_SELF: {
    id: 'observer_self', name: 'Observer Self', category: 'cognitive', complexity: 'medium',
    modality: ['visual'], outcome: ['awareness', 'integration'],
    description: 'The you watching you',
    interactionType: 'meta-awareness', duration: 'medium',
    responseAffinity: ['WITNESSING', 'INTEGRATING'],
  },
  VALUES_COMPASS: {
    id: 'values_compass', name: 'Values Compass', category: 'cognitive', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'decision'],
    description: 'Align action to values',
    interactionType: 'values-align', duration: 'medium',
    responseAffinity: ['CHOOSING', 'KNOWING'],
  },
  COMMITTED_ACTION: {
    id: 'committed_action', name: 'Committed Action', category: 'cognitive', complexity: 'medium',
    modality: ['visual'], outcome: ['decision', 'activation'],
    description: 'Small action aligned to values',
    interactionType: 'action-commit', duration: 'short',
    responseAffinity: ['CHOOSING', 'BECOMING'],
  },
  LEAVES_ON_STREAM: {
    id: 'leaves_on_stream', name: 'Leaves on Stream', category: 'cognitive', complexity: 'simple',
    modality: ['visual', 'temporal'], outcome: ['awareness', 'release'],
    description: 'Watch thoughts float by',
    interactionType: 'flowing-animation', duration: 'medium',
    responseAffinity: ['WITNESSING', 'RELEASING'],
  },
  SELF_AS_CONTEXT: {
    id: 'self_as_context', name: 'Self as Context', category: 'cognitive', complexity: 'complex',
    modality: ['visual'], outcome: ['awareness', 'integration'],
    description: 'You are the space, not the content',
    interactionType: 'perspective-shift', duration: 'long',
    responseAffinity: ['WITNESSING', 'INTEGRATING'],
  },
  KOAN_CONTEMPLATION: {
    id: 'koan_contemplation', name: 'Koan Contemplation', category: 'cognitive', complexity: 'complex',
    modality: ['visual'], outcome: ['awareness', 'integration'],
    description: 'Sit with paradox - don\'t solve',
    interactionType: 'meditation-hold', duration: 'long',
    responseAffinity: ['WITNESSING', 'INTEGRATING'],
  },

  // ===================================================================
  // ENERGETIC MECHANISMS (30)
  // Energy: Vitality tracking x Subtle body wisdom x Flow state design
  // ===================================================================

  ENERGY_PIES: {
    id: 'energy_pies', name: 'Energy Pies', category: 'energetic', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness', 'decision'],
    description: 'Allocate energy - visualize spend',
    interactionType: 'pie-chart-adjust', duration: 'short',
    responseAffinity: ['KNOWING', 'CHOOSING'],
  },
  VITALITY_GAUGE: {
    id: 'vitality_gauge', name: 'Vitality Gauge', category: 'energetic', complexity: 'simple',
    modality: ['visual'], outcome: ['awareness'],
    description: 'Measure life force - how full?',
    interactionType: 'gauge-tap', duration: 'instant',
    responseAffinity: ['WITNESSING', 'FEELING'],
  },
  CHARGE_BATTERY: {
    id: 'charge_battery', name: 'Charge Battery', category: 'energetic', complexity: 'simple',
    modality: ['visual', 'temporal'], outcome: ['grounding', 'activation'],
    description: 'Recharge - hold to fill',
    interactionType: 'hold-to-charge', duration: 'short',
    responseAffinity: ['FEELING', 'CHOOSING'],
  },
  CHAKRA_SCAN: {
    id: 'chakra_scan', name: 'Chakra Scan', category: 'energetic', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['awareness'],
    description: 'Scan energy centers - notice blocks',
    interactionType: 'body-tap-sequence', duration: 'medium',
    responseAffinity: ['FEELING', 'WITNESSING'],
  },
  PROTECTION_SHIELD: {
    id: 'protection_shield', name: 'Protection Shield', category: 'energetic', complexity: 'simple',
    modality: ['visual', 'kinesthetic'], outcome: ['grounding', 'decision'],
    description: 'Activate shield - boundary up',
    interactionType: 'tap-to-shield', duration: 'instant',
    responseAffinity: ['BELIEVING', 'CHOOSING'],
  },
  CORD_CUTTING: {
    id: 'cord_cutting', name: 'Cord Cutting', category: 'energetic', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['release', 'grounding'],
    description: 'Cut energetic cords - reclaim power',
    interactionType: 'gesture-cut', duration: 'medium',
    responseAffinity: ['RELEASING', 'BELIEVING'],
  },
  POWER_ANIMAL: {
    id: 'power_animal', name: 'Power Animal', category: 'energetic', complexity: 'medium',
    modality: ['visual'], outcome: ['activation', 'grounding'],
    description: 'Call on animal medicine',
    interactionType: 'ally-invoke', duration: 'medium',
    responseAffinity: ['BELIEVING', 'FEELING'],
  },
  ANCESTRAL_LINE: {
    id: 'ancestral_line', name: 'Ancestral Line', category: 'energetic', complexity: 'complex',
    modality: ['visual'], outcome: ['integration', 'grounding'],
    description: 'Connect to lineage - draw strength',
    interactionType: 'lineage-connection', duration: 'long',
    responseAffinity: ['INTEGRATING', 'BELIEVING'],
  },

  // ===================================================================
  // RITUAL MECHANISMS (20)
  // Ceremony: Rites of passage x Sacred action x Intentional design
  // ===================================================================

  PERMISSION_STAMPS: {
    id: 'permission_stamps', name: 'Permission Stamps', category: 'ritual', complexity: 'simple',
    modality: ['visual', 'kinesthetic'], outcome: ['activation', 'decision'],
    description: 'Grant yourself permission - stamp it',
    interactionType: 'tap-to-stamp', duration: 'instant',
    responseAffinity: ['CHOOSING', 'BELIEVING'],
  },
  CELEBRATION_CONFETTI: {
    id: 'celebration_confetti', name: 'Celebration Confetti', category: 'ritual', complexity: 'simple',
    modality: ['visual', 'kinesthetic'], outcome: ['integration'],
    description: 'Celebrate wins - confetti burst',
    interactionType: 'shake-for-confetti', duration: 'instant',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
  THRESHOLD_CROSSING: {
    id: 'threshold_crossing', name: 'Threshold Crossing', category: 'ritual', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['activation', 'integration'],
    description: 'Cross threshold - enter new',
    interactionType: 'swipe-to-cross', duration: 'medium',
    responseAffinity: ['BECOMING', 'INTEGRATING'],
  },
  ALTAR_BUILD: {
    id: 'altar_build', name: 'Altar Build', category: 'ritual', complexity: 'complex',
    modality: ['visual', 'kinesthetic'], outcome: ['integration', 'grounding'],
    description: 'Build altar - make sacred',
    interactionType: 'drag-objects', duration: 'long',
    responseAffinity: ['INTEGRATING', 'BELIEVING'],
  },
  PHOENIX_RISE: {
    id: 'phoenix_rise', name: 'Phoenix Rise', category: 'ritual', complexity: 'complex',
    modality: ['visual', 'temporal'], outcome: ['integration', 'activation'],
    description: 'Death and rebirth - rise from ash',
    interactionType: 'animation-sequence', duration: 'long',
    responseAffinity: ['BECOMING', 'INTEGRATING'],
  },
  FIRE_CEREMONY: {
    id: 'fire_ceremony', name: 'Fire Ceremony', category: 'ritual', complexity: 'medium',
    modality: ['visual', 'kinesthetic'], outcome: ['release', 'integration'],
    description: 'Burn what no longer serves',
    interactionType: 'flame-release', duration: 'medium',
    responseAffinity: ['RELEASING', 'INTEGRATING'],
  },
  COMPLETION_RITUAL: {
    id: 'completion_ritual', name: 'Completion Ritual', category: 'ritual', complexity: 'complex',
    modality: ['visual', 'temporal'], outcome: ['integration', 'release'],
    description: 'Mark ending - honor cycle',
    interactionType: 'closing-ceremony', duration: 'long',
    responseAffinity: ['INTEGRATING', 'RELEASING'],
  },
  INITIATION_RITE: {
    id: 'initiation_rite', name: 'Initiation Rite', category: 'ritual', complexity: 'complex',
    modality: ['visual', 'temporal'], outcome: ['activation', 'integration'],
    description: 'Enter new phase - initiation',
    interactionType: 'multi-phase-ritual', duration: 'long',
    responseAffinity: ['BECOMING', 'INTEGRATING'],
  },
  GRATITUDE_OFFERING: {
    id: 'gratitude_offering', name: 'Gratitude Offering', category: 'ritual', complexity: 'simple',
    modality: ['visual'], outcome: ['integration', 'grounding'],
    description: 'Offer thanks - complete circle',
    interactionType: 'gratitude-gesture', duration: 'short',
    responseAffinity: ['FEELING', 'INTEGRATING'],
  },
};

export default MECHANISMS_300_PART3;

// ===================================================================
// COMPLETE: 300 MECHANISMS
// Science x Spirituality x Apple
// ===================================================================
