/**
 * TALK TYPE SYSTEM — The Guided Corridor
 *
 * TALK is not a chatbot. It is not a conversation interface.
 * It is a prompt-led voyage of discovery — a choose-your-own-path
 * journal that the user fills in, one piece at a time.
 *
 * The best therapists don't fix you. They guide you to the inner
 * work so you get to the answers faster. TALK is that guide.
 *
 * Architecture:
 *   PROMPT     — luminous doorways the user selects (2-3 at a time)
 *   PAGE       — the breathing blank journal page for text entry
 *   SEAL       — hold to seal the entry, text sinks into the glass
 *   REFLECTION — a mirror sentence echoed back in new light
 *   THREAD     — the growing constellation of sealed entries
 *
 * The user thinks they are choosing the questions.
 * They are choosing the path. The corridor holds.
 *
 * Behind the curtain (silently):
 *   - Each entry is stored and mapped
 *   - Prompts evolve based on what was written
 *   - The thread constellation grows
 *   - We never peek. We never judge. We guide.
 */

// ═══════════════════════════════════════════════════
// PROMPT — A luminous doorway in the dark
// ═══════════════════════════════════════════════════

export interface TalkPrompt {
  /** Unique prompt identifier */
  id: string;
  /** The question / invitation text */
  text: string;
  /** The therapeutic lane this prompt opens */
  lane: TalkLane;
  /** Which depth tier this prompt belongs to (1=surface, 5=deep) */
  depth: number;
  /** Tags for matching follow-up prompts to entries */
  tags?: string[];
}

// ═══════════════════════════════════════════════════
// LANE — The therapeutic direction of travel
// ═══════════════════════════════════════════════════

export type TalkLane =
  | 'origin'        // Where does it come from? Childhood, family, memory.
  | 'present'       // What is happening right now? The current friction.
  | 'pattern'       // What keeps repeating? The schema. The loop.
  | 'relationship'  // Who is in the room? The relational architecture.
  | 'body'          // Where does it live in you? The somatic map.
  | 'fear'          // What is the worst thing? The catastrophe. The shadow.
  | 'desire'        // What do you actually want? The unlived life.
  | 'mirror';       // Reflection — not a question. A witnessing.

// ═══════════════════════════════════════════════════
// ENTRY — A sealed piece of the puzzle
// ═══════════════════════════════════════════════════

export interface TalkEntry {
  /** Unique entry ID */
  id: string;
  /** The prompt that opened this entry */
  promptId: string;
  /** The prompt text */
  promptText: string;
  /** The user's response */
  response: string;
  /** When this was sealed */
  timestamp: number;
  /** Which lane this belongs to */
  lane: TalkLane;
  /** Depth tier */
  depth: number;
  /** Position in the thread constellation (assigned on seal) */
  threadPosition: { x: number; y: number };
}

// ═══════════════════════════════════════════════════
// REFLECTION — A mirror sentence from the corridor
// ═══════════════════════════════════════════════════

export interface TalkReflection {
  /** The reflection text */
  text: string;
  /** Which entry it reflects on */
  entryId: string;
  /** The lane it opens next */
  opensLane: TalkLane;
}

// ═══════════════════════════════════════════════════
// CORRIDOR STATE
// ═══════════════════════════════════════════════════

export type TalkPhase =
  | 'arriving'      // Glass breathes. Corridor opens.
  | 'prompting'     // Prompt nodes float in the dark. User selects.
  | 'writing'       // The blank page is open. User fills the space.
  | 'sealing'       // Hold to seal. Text sinks into glass.
  | 'reflecting'    // Mirror sentence. The corridor echoes.
  | 'threading'     // The thread constellation grows. Brief pause.
  | 'resting';      // Session complete. The corridor closes gently.

export interface TalkState {
  phase: TalkPhase;
  /** Current prompts available (2-3 options) */
  currentPrompts: TalkPrompt[];
  /** The selected prompt (if in writing/sealing phase) */
  activePrompt: TalkPrompt | null;
  /** All sealed entries in this session */
  entries: TalkEntry[];
  /** Current session depth (increments with each seal) */
  sessionDepth: number;
  /** Whether a reflection is due before next prompts */
  reflectionPending: TalkReflection | null;
}

// ═══════════════════════════════════════════════════
// LANE METADATA
// ═══════════════════════════════════════════════════

export const LANES: Record<TalkLane, {
  id: TalkLane;
  name: string;
  essence: string;
  /** Subtle tint for this lane's prompts */
  tint: string;
}> = {
  origin: {
    id: 'origin',
    name: 'Origin',
    essence: 'Where it began.',
    tint: 'rgba(184,160,255,0.5)',
  },
  present: {
    id: 'present',
    name: 'Present',
    essence: 'What is here now.',
    tint: 'rgba(139,157,195,0.5)',
  },
  pattern: {
    id: 'pattern',
    name: 'Pattern',
    essence: 'What keeps returning.',
    tint: 'rgba(200,160,100,0.5)',
  },
  relationship: {
    id: 'relationship',
    name: 'Relationship',
    essence: 'Who is in the room.',
    tint: 'rgba(128,200,160,0.5)',
  },
  body: {
    id: 'body',
    name: 'Body',
    essence: 'Where it lives in you.',
    tint: 'rgba(180,140,200,0.5)',
  },
  fear: {
    id: 'fear',
    name: 'Fear',
    essence: 'The shadow beneath.',
    tint: 'rgba(200,120,120,0.5)',
  },
  desire: {
    id: 'desire',
    name: 'Desire',
    essence: 'What is waiting.',
    tint: 'rgba(200,180,100,0.5)',
  },
  mirror: {
    id: 'mirror',
    name: 'Mirror',
    essence: 'What you already know.',
    tint: 'rgba(220,220,240,0.5)',
  },
};
