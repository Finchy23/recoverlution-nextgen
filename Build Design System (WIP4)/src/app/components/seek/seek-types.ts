/**
 * SEEK TYPE SYSTEM — The Cinematic Chassis
 *
 * SEEK is not an article. It is a universal cinematic chassis.
 * A scene-driven discovery engine that takes massive, abstract,
 * lifelong pain and breaks it into micro-intense learning arcs.
 *
 * Three phases, each with elastic building blocks:
 *
 *   ENTRY       — Crossing the threshold. Deliberate consent.
 *   TRANSFER    — The illumination. Clinical truth delivered through physics.
 *   ASCERTAIN   — Silent telemetry. KBE measured through touch, not questions.
 *
 * The JSON payload for any insight selects which blocks to compose.
 * The engine renders the arc. The combinations are limitless.
 *
 * Silent Telemetry:
 *   We never ask the user to evaluate. We measure:
 *   - Entry friction (hesitation before beginning)
 *   - Cognitive pacing (how long they sit with each truth)
 *   - Resistance coefficient (how heavy the truth feels)
 *   - Autonomic location (where in the body the truth lands)
 *   - Ripple radius (systemic impact — localized thought or full-body shift)
 */

// ═══════════════════════════════════════════════════
// ENTRY BLOCKS — Framing the Intention
// ═══════════════════════════════���═══════════════════

export type EntryBlockType =
  | 'threshold-lock'    // 1A: 3-second sustained press on glowing node
  | 'somatic-sync'      // 1B: Match interaction to 5.5 BPM vagal rhythm
  | 'kinetic-clear';    // 1C: Swipe away fog/static to reveal title

// ═══════════════════════════════════════════════════
// TRANSFER BLOCKS — The Illumination
// ═══════════════════════════════════════════════════

export type TransferBlockType =
  | 'focal-lens'        // 2A: Drag luminous gradient to bring blurred text into focus
  | 'pendulum-pan'      // 2B: Drag left/right to read dual truths (trigger vs truth)
  | 'depth-descent'     // 2C: Text scales forward from background, pulled toward user
  | 'somatic-gate';     // Inline physics lock — body must catch up with mind

// ═══════════════════════════════════════════════════
// ASCERTAINMENT BLOCKS — Silent Telemetry (KBE)
// ═══════════════════════════════════════════════════

export type KnowingBlockType =
  | 'alignment'         // 3A: Rotate scattered geometry until it clicks
  | 'focus-pull';       // 3B: Slide tension bar to sharpen blur into sphere

export type BelievingBlockType =
  | 'gravity-drag'      // 3A: Drag digital mass upward — user dictates weight
  | 'tension-tether';   // 3B: Pull a string attached to old schema

export type EmbodyingBlockType =
  | 'topography-drop'   // 3A: Place light on abstract body map
  | 'ripple-radius';    // 3B: Hold to expand ripple — measures systemic impact

// ═══════════════════════════════════════════════════
// SCENE — A single cinematic frame
// ═══════════════════════════════════════════════════

export interface SeekScene {
  /** Scene identifier */
  id: string;
  /** Which phase this scene belongs to */
  phase: 'entry' | 'transfer' | 'ascertain';
  /** Block type for this scene */
  blockType: EntryBlockType | TransferBlockType | KnowingBlockType | BelievingBlockType | EmbodyingBlockType;
  /** Primary copy — the truth being delivered */
  copy: string;
  /** Secondary copy — elaboration, context */
  subCopy?: string;
  /** Instruction whisper — what the user must do */
  instruction?: string;
  /** Which atom to bind to this scene (id from atom registry) */
  atomId?: string;
  /** Atom atmospheric intensity (0-1) */
  atmosphereIntensity?: number;
  /** For pendulum-pan: the opposing truth */
  dualCopy?: string;
  /** For transfer scenes: additional text sections to reveal */
  sections?: string[];
  /** KBE dimension being measured (ascertainment only) */
  kbeDimension?: 'knowing' | 'believing' | 'embodying';
  /** The closing prompt for ascertainment */
  prompt?: string;
}

// ═══════════════════════════════════════════════════
// INSIGHT — A complete cinematic arc
// ═══════════════════════════════════════════════════

export interface SeekInsight {
  /** Unique insight ID */
  id: string;
  /** The ghost being illuminated */
  title: string;
  /** The clinical concept name */
  schema: string;
  /** One-breath essence */
  essence: string;
  /** Chapter color (from the pillar spectrum) */
  color: string;
  /** Accent color for secondary elements */
  accentColor: string;
  /** Which atom provides the atmospheric background */
  atomId: string;
  /** The scene sequence — the arc */
  scenes: SeekScene[];
}

// ═══════════════════════════════════════════════════
// TELEMETRY — Silent measurement data
// ═══════════════════════════════════════════════════

export interface SeekTelemetry {
  insightId: string;
  /** Entry friction — ms between screen open and threshold initiation */
  entryFrictionMs: number;
  /** Per-section pacing — ms spent on each transfer section */
  sectionPacingMs: number[];
  /** Knowing score 0-1 (from alignment/focus-pull interaction) */
  knowingScore: number;
  /** Believing score 0-1 (from gravity/tether interaction) */
  believingScore: number;
  /** Embodying location — where on the body map the truth landed */
  embodyingLocation: { x: number; y: number } | null;
  /** Ripple radius 0-1 (from ripple expansion) */
  rippleRadius: number;
  /** Total arc duration in ms */
  totalDurationMs: number;
  /** Timestamp */
  timestamp: number;
}

// ═══════════════════════════════════════════════════
// ENGINE STATE
// ═══════════════════════════════════════════════════

export type SeekPhase =
  | 'arriving'       // Surface arrival animation
  | 'entry'          // Phase 1: threshold/sync/clear
  | 'transferring'   // Phase 2: focal-lens/pendulum/descent
  | 'ascending'      // Phase 3: KBE ascertainment
  | 'integrating'    // Post-ascertainment — the truth settles
  | 'sealed';        // Arc complete

export interface SeekEngineState {
  phase: SeekPhase;
  sceneIndex: number;
  sceneProgress: number; // 0-1 within current scene
  transitioning: boolean;
}