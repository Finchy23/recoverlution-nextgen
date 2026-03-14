/**
 * FORM TYPE SYSTEM — The Clinical Architecture
 *
 * FORM is not SYNC. SYNC is the river — fast, atmospheric, the
 * default current. FORM is the consulting room — deliberate,
 * clinical, purpose-built. A therapist sat in a room with you.
 *
 * Five clinical containers, each a distinct therapeutic instrument:
 *   RESOURCE     — The vagal brake. Persistent somatic anchor.
 *   TITRATION    — Controlled exposure. The schema as contained object.
 *   PENDULATION  — Somatic shift. Oscillation between pain and safety.
 *   DEFUSION     — ACT decoupling. Observer state emergence.
 *   WASH         — Somatic integration. Parasympathetic clearing.
 *
 * These are NOT copy containers. Each has:
 *   - A therapeutic function (what it does clinically)
 *   - An interaction mechanic (what the user physically does)
 *   - A depth position (where on the Z-axis it lives)
 *   - A somatic component (haptics, breath, anchoring)
 *   - Safety mechanics (dual awareness, grounding escape)
 *
 * Protocols are compositions of containers into real ACT/SE/EMDR
 * sequences. Each protocol is a complete therapeutic exercise —
 * once done, it is done.
 */

// ═══════════════════════════════════════════════════
// THE FIVE CLINICAL CONTAINERS
// ═══════════════════════════════════════════════════

export type ClinicalContainer =
  | 'resource'
  | 'titration'
  | 'pendulation'
  | 'defusion'
  | 'wash';

/** Full definition of a clinical container as an instrument */
export interface ContainerDefinition {
  id: ClinicalContainer;
  /** 4-letter label for the glass */
  label: string;
  /** Clinical function — what this does to the nervous system */
  clinicalFunction: string;
  /** Therapeutic tradition it draws from */
  tradition: string;
  /** What the user physically does */
  interactionMechanic: string;
  /** Where on the Z-axis this container lives */
  depthPosition: 'foreground' | 'midground' | 'background' | 'atmospheric';
  /** Somatic component — how the body is engaged */
  somaticComponent: string;
  /** Whether this container persists across other containers */
  persistent: boolean;
  /** Safety mechanic — how the user stays grounded */
  safetyMechanic: string;
  /** Glyph for display */
  glyph: string;
  /** Container color tint */
  colorTint: string;
}

export const CONTAINERS: Record<ClinicalContainer, ContainerDefinition> = {
  resource: {
    id: 'resource',
    label: 'RSCE',
    clinicalFunction: 'Vagal brake activation. Establishes somatic safety before any clinical work. The nervous system must be resourced.',
    tradition: 'Somatic Experiencing (Peter Levine)',
    interactionMechanic: 'Haptic pulse entrainment. The device vibrates at 5.5 BPM. The user does nothing except feel the rhythm.',
    depthPosition: 'atmospheric',
    somaticComponent: 'Bilateral haptic pulse, breath-locked visual anchor, continuous under all other containers.',
    persistent: true,
    safetyMechanic: 'IS the safety mechanic. Always present. Always running. The heartbeat of the room.',
    glyph: '◎',
    colorTint: 'rgba(80,180,120,0.5)',
  },
  titration: {
    id: 'titration',
    label: 'TITR',
    clinicalFunction: 'Controlled exposure. The schema (e.g., "I am broken") is introduced not as a screen takeover but as a contained, observable object.',
    tradition: 'Somatic Experiencing / Exposure Therapy',
    interactionMechanic: 'Observation only. The text appears, constrained. The user reads but does not interact. Dual Awareness is enforced — the haptic pulse continues underneath.',
    depthPosition: 'midground',
    somaticComponent: 'The schema sits behind the resource pulse. Typographically constrained — small, clinical, bounded.',
    persistent: false,
    safetyMechanic: 'Dual Awareness enforcement. The resource pulse runs continuously. The schema cannot dominate the visual hierarchy.',
    glyph: '◻',
    colorTint: 'rgba(200,160,100,0.5)',
  },
  pendulation: {
    id: 'pendulation',
    label: 'PNDL',
    clinicalFunction: 'Somatic shift. Moving attention between the friction (Titration) and the safety (Resource), training the nervous system that it can visit the pain and return safely.',
    tradition: 'Somatic Experiencing (Peter Levine)',
    interactionMechanic: 'Physical drag. The user moves their thumb between the schema zone and the anchor zone. As they slide away from the text, it blurs; as they approach the anchor, haptic pulse strengthens.',
    depthPosition: 'foreground',
    somaticComponent: 'Drag-to-oscillate. Schema blurs on retreat. Haptic pulse amplifies on approach to anchor. The nervous system learns the return path.',
    persistent: false,
    safetyMechanic: 'The anchor zone is always accessible. Releasing touch returns to safety. The oscillation IS the therapy.',
    glyph: '↔',
    colorTint: 'rgba(180,140,200,0.5)',
  },
  defusion: {
    id: 'defusion',
    label: 'DFUS',
    clinicalFunction: 'ACT cognitive defusion. The user is not the thought — they are the observer of the thought. The schema does not shatter. It detaches from the foreground and drifts into the Z-axis background.',
    tradition: 'Acceptance and Commitment Therapy (ACT)',
    interactionMechanic: 'Press and hold the schema text. It physically changes state — loses contrast, turns translucent, sinks deep into the Z-axis. The observer reframe emerges in the foreground.',
    depthPosition: 'background',
    somaticComponent: 'Z-axis depth transition. The text is still visible but ambient and powerless. The user watches it drift. The reframe text replaces it in the foreground.',
    persistent: false,
    safetyMechanic: 'The schema is not destroyed. It is relocated. The user maintains visual contact but from a position of distance and safety.',
    glyph: '◇',
    colorTint: 'rgba(100,136,192,0.5)',
  },
  wash: {
    id: 'wash',
    label: 'WASH',
    clinicalFunction: 'Somatic integration. Discharge of autonomic energy. Closing the loop so the user does not leave dysregulated.',
    tradition: 'Somatic Experiencing / Autonomic Discharge',
    interactionMechanic: 'Passive. Typography dissolves. A full-screen bimodal visual wave sweeps the glass clean. Parasympathetic clearing.',
    depthPosition: 'foreground',
    somaticComponent: 'Full haptic smoothing. The pulse transitions from bilateral to a single long, slow sine wave. The glass returns to pure dark.',
    persistent: false,
    safetyMechanic: 'This IS the safety mechanic for the entire protocol. No content remains. The user exits to the clean glass of SYNC.',
    glyph: '≈',
    colorTint: 'rgba(100,180,160,0.5)',
  },
};

// ═══════════════════════════════════���═══════════════
// PRACTICE DEFINITION
// ═══════════════════════════════════════════════════

/** A single step within a practice — maps a container to specific content and timing */
export interface PracticeStep {
  /** Which container this step uses */
  container: ClinicalContainer;
  /** Primary copy for this step */
  copy: string;
  /** Secondary copy (subtext, elaboration) */
  subCopy?: string;
  /** Interaction instruction for the user */
  instruction?: string;
  /** Which atom to bind to (if step-specific) */
  atomId?: string;
  /** Minimum duration hint in seconds (actual duration is user-driven) */
  minDurationHint?: number;
}

/** Complete practice definition */
export interface Practice {
  /** Unique practice ID */
  id: string;
  /** Practice name — evocative, not descriptive (guardrails apply) */
  name: string;
  /** The schema — the thought/feeling being worked with */
  schema: string;
  /** Clinical protocol this implements */
  protocol: PracticeProtocol;
  /** Which pillar of agency this practice serves */
  pillar: PracticePillar;
  /** Primary atom bound to this practice */
  atomId: string;
  /** Ordered sequence of steps */
  steps: PracticeStep[];
  /** One-breath description */
  essence: string;
  /** Whether to use active breath volume entrainment during resource */
  useBreathVolume?: boolean;
  /** Whether to use boundary field during pendulation (Shield pillar) */
  useBoundaryField?: boolean;
}

// ═══════════════════════════════════════════════════
// PROTOCOL TYPES
// ═══════════════════════════════════════════════════

export type PracticeProtocol =
  | 'act-defusion'           // ACT — cognitive defusion
  | 'somatic-titration'      // SE — titrate and discharge
  | 'bilateral-processing'   // EMDR-adjacent — bilateral stimulation
  | 'schema-rescripting'     // Schema therapy — imagery rescripting
  | 'parts-unburdening';     // IFS — inner parts work

export interface ProtocolDefinition {
  id: PracticeProtocol;
  name: string;
  tradition: string;
  /** Which containers this protocol uses, in order */
  containerSequence: ClinicalContainer[];
  /** Clinical description */
  description: string;
}

export const PROTOCOLS: Record<PracticeProtocol, ProtocolDefinition> = {
  'act-defusion': {
    id: 'act-defusion',
    name: 'ACT Defusion',
    tradition: 'Acceptance and Commitment Therapy',
    containerSequence: ['resource', 'titration', 'pendulation', 'defusion', 'wash'],
    description: 'The thought is not you. You are the observer of the thought. The schema detaches from identity and drifts into the Z-axis background.',
  },
  'somatic-titration': {
    id: 'somatic-titration',
    name: 'Somatic Titration',
    tradition: 'Somatic Experiencing',
    containerSequence: ['resource', 'titration', 'pendulation', 'wash'],
    description: 'Locate the physical shape of the friction. Breathe into its edges. Watch the tightly drawn mass expand and diffuse.',
  },
  'bilateral-processing': {
    id: 'bilateral-processing',
    name: 'Bilateral Processing',
    tradition: 'EMDR-Adjacent',
    containerSequence: ['resource', 'titration', 'wash'],
    description: 'Hold the memory. Follow the bilateral node. Left, right, left, right. The amygdala cools. The memory archives safely.',
  },
  'schema-rescripting': {
    id: 'schema-rescripting',
    name: 'Schema Rescripting',
    tradition: 'Schema Therapy / Imagery Rescripting',
    containerSequence: ['resource', 'titration', 'defusion', 'wash'],
    description: 'The capable adult self returns to the origin. The perimeter holds. The memory reconsolidates with safety.',
  },
  'parts-unburdening': {
    id: 'parts-unburdening',
    name: 'Parts Unburdening',
    tradition: 'Internal Family Systems',
    containerSequence: ['resource', 'titration', 'pendulation', 'defusion', 'wash'],
    description: 'You are not one mind. You are made of parts. Separate the burdened part. Ask it to step back. The center clears.',
  },
};

// ═══════════════════════════════════════════════════
// THE FOUR PILLARS — Spectrum of Agency
// ═══════════════════════════════════════════════════

/**
 * The instruments are categorized across the profound spectrum
 * of human experience, giving the user exact control over
 * their specific friction:
 *
 *   BASELINE — Pure biology. Breath, body, nervous system.
 *   SHIELD   — Energetic & spatial. For HSPs, enmeshment, boundaries.
 *   REWIRE   — Therapeutic & cognitive. Clinical interventions wrapped in poetry.
 *   BRIDGE   — Relational & social. The hardest moments of connection.
 */
export type PracticePillar =
  | 'baseline'    // Somatic & Breath — pure manipulation of biology
  | 'shield'      // Energetic & Spatial — boundaries, energy clearing
  | 'rewire'      // Therapeutic & Cognitive — defusion, rescripting, bilateral
  | 'bridge';     // Relational & Social — scripts, ground-holding, the "no"

export const PILLARS: Record<PracticePillar, {
  id: PracticePillar;
  name: string;
  essence: string;
  glyph: string;
}> = {
  baseline: {
    id: 'baseline',
    name: 'The Baseline',
    essence: 'Pure manipulation of biology. The breath is the anchor.',
    glyph: '◉',
  },
  shield: {
    id: 'shield',
    name: 'The Shield',
    essence: 'Tools for those who feel everything. Reclaim the perimeter.',
    glyph: '◈',
  },
  rewire: {
    id: 'rewire',
    name: 'The Re-Wire',
    essence: 'Clinical interventions wrapped in poetry. Change the relationship to the thought.',
    glyph: '◇',
  },
  bridge: {
    id: 'bridge',
    name: 'The Bridge',
    essence: 'Embodied practices for the hardest moments of connection.',
    glyph: '⟷',
  },
};

// ═══════════════════════════════════════════════════
// FORM PHASE — Where the user is in a practice
// ═══════════════════════════════════════════════════

export type FormPhase =
  | 'selecting'     // Choosing a practice (browse state)
  | 'arriving'      // Glass breathes, practice loads
  | 'active'        // Inside a practice step
  | 'transitioning' // Moving between steps
  | 'completing'    // Wash is clearing
  | 'sealed';       // Practice is done

// ═══════════════════════════════════════════════════
// CONTAINER ORDERED LIST
// ═══════════════════════════════════════════════════

export const ALL_CONTAINERS: ClinicalContainer[] = [
  'resource', 'titration', 'pendulation', 'defusion', 'wash',
];