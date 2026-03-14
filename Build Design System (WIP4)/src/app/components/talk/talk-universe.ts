/**
 * TALK UNIVERSE — The Inner Cosmos
 *
 * Six constellations. Real star names.
 * Each a therapeutic territory.
 *
 * THE VOICE (Pass 1, refined through Pass 58):
 *   108 Observations across 6 territories (18 each).
 *   Each: observation + deepening + opening.
 *   No questions. Only invitations.
 *   Ram Dass clarity. Alan Watts paradox.
 *   The opening ends in "..." not "?"
 *   The user completes a thought, not an answer.
 *
 * THE RECOGNITION:
 *   72 witnessing texts (12 per territory).
 *   Not fortune cookies. Mirrors.
 *   The universe reflects the act of writing,
 *   not evaluating its content.
 *
 * FOUR VOICES (Pass 59):
 *   ATMOSPHERE — SANS, tracked, ghost opacity (environmental)
 *   INVITATION — SERIF italic, territory-colored (observations, prompts)
 *   WITNESS    — SERIF non-italic, gold (recognition after writing)
 *   MEMORY     — SERIF non-italic, warm parchment (recalled words, past-tense)
 *
 * The writing IS the illumination.
 * No button. No mode switch. One gesture.
 */

// ═══════════════════════════════════════════════════
// 3D PRIMITIVES
// ═══════════════════════════════════════════════════

export interface Vec3 { x: number; y: number; z: number; }

export interface Camera {
  yaw: number;   // radians, horizontal
  pitch: number; // radians, vertical
  zoom: number;  // distance from origin
}

export const DEFAULT_CAMERA: Camera = { yaw: 0, pitch: 0.15, zoom: 600 };

export const CAMERA_LIMITS = {
  pitchMin: -1.2,
  pitchMax: 1.2,
  zoomMin: 200,
  zoomMax: 1200,
};

/**
 * Project a 3D point through the camera onto 2D screen space.
 */
export function project(pos: Vec3, cam: Camera, w: number, h: number) {
  const cosY = Math.cos(cam.yaw), sinY = Math.sin(cam.yaw);
  const cosP = Math.cos(cam.pitch), sinP = Math.sin(cam.pitch);

  // Rotate around Y axis (yaw)
  let rx = pos.x * cosY - pos.z * sinY;
  let rz = pos.x * sinY + pos.z * cosY;
  let ry = pos.y;

  // Rotate around X axis (pitch)
  const ry2 = ry * cosP - rz * sinP;
  const rz2 = ry * sinP + rz * cosP;
  ry = ry2;
  rz = rz2;

  // Translate by zoom
  const vz = rz + cam.zoom;
  if (vz < 1) return { x: w / 2, y: h / 2, scale: 0, behind: true };
  const fov = 600;
  const scale = fov / vz;
  return { x: rx * scale + w / 2, y: -ry * scale + h / 2, scale, behind: vz < 20 };
}

/**
 * Compute camera angles to center on a 3D position.
 */
export function aimCamera(pos: Vec3): { yaw: number; pitch: number } {
  const yaw = Math.atan2(pos.x, pos.z);
  const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
  const pitch = Math.atan2(pos.y, dist);
  return { yaw, pitch };
}

// ═══════════════════════════════════════════════════
// STAR
// ══════════════���═══════════════════════════════════

export interface UniverseStar {
  id: string;
  name: string;
  pos: Vec3;
  constellation: string;
  magnitude: number;
  illuminated: boolean;
  passage: string;
  stardust: string[];
}

// ═══════════════════════════════════════════════════
// CONSTELLATION
// ═══════════════════════════════════════════════════

export interface Constellation {
  id: string;
  name: string;
  schema: string;
  color: string;
  starIds: string[];
  connections: [string, string][];
  center: Vec3;
}

// ═══════════════════════════════════════════════════
// STAR FACTORY
// ═══════════════════════════════════════════════════

const D = 200;

function makeStars(
  conId: string,
  center: Vec3,
  names: string[],
  spread = 60,
): UniverseStar[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return names.map((name, i) => {
    const theta = goldenAngle * i;
    const r = spread * (0.3 + (i / names.length) * 0.7);
    const y = (i / (names.length - 1 || 1) - 0.5) * spread * 0.8;
    return {
      id: `${conId}-${i}`,
      name,
      pos: {
        x: center.x + Math.cos(theta) * r,
        y: center.y + y,
        z: center.z + Math.sin(theta) * r,
      },
      constellation: conId,
      magnitude: 1.5 + Math.random() * 2,
      illuminated: false,
      passage: '',
      stardust: [],
    };
  });
}

function makeConnections(starIds: string[]): [string, string][] {
  const conns: [string, string][] = [];
  for (let i = 0; i < starIds.length - 1; i++) {
    conns.push([starIds[i], starIds[i + 1]]);
  }
  // Close the shape for constellations with 5+ stars
  if (starIds.length >= 5) {
    conns.push([starIds[starIds.length - 1], starIds[0]]);
  }
  return conns;
}

// ─── Lyra (CALM) ─── Presence, regulation, breath
const LYRA_CENTER: Vec3 = { x: 0, y: D * 0.8, z: -D * 0.3 };
const LYRA_NAMES = ['Vega', 'Sheliak', 'Sulafat', 'Aladfar', 'Epsilon Lyrae'];
const LYRA_STARS = makeStars('lyra', LYRA_CENTER, LYRA_NAMES, 55);

// ─── Orion (ROOT) ─── Origin, memory, childhood
const ORION_CENTER: Vec3 = { x: D * 0.9, y: -D * 0.2, z: D * 0.4 };
const ORION_NAMES = ['Betelgeuse', 'Rigel', 'Bellatrix', 'Mintaka', 'Alnilam', 'Alnitak', 'Saiph'];
const ORION_STARS = makeStars('orion', ORION_CENTER, ORION_NAMES, 65);

// ─── Gemini (BOND) ── Connection, relationships
const GEMINI_CENTER: Vec3 = { x: -D * 0.85, y: D * 0.1, z: D * 0.6 };
const GEMINI_NAMES = ['Castor', 'Pollux', 'Alhena', 'Mebsuta', 'Tejat'];
const GEMINI_STARS = makeStars('gemini', GEMINI_CENTER, GEMINI_NAMES, 50);

// ─── Cassiopeia (WIRE) ─── Patterns, loops, awareness
const CASS_CENTER: Vec3 = { x: D * 0.3, y: D * 0.6, z: D * 0.8 };
const CASS_NAMES = ['Schedar', 'Caph', 'Tsih', 'Ruchbah', 'Segin'];
const CASS_STARS = makeStars('cassiopeia', CASS_CENTER, CASS_NAMES, 50);

// ─── Leo (SELF) ─── Identity, becoming
const LEO_CENTER: Vec3 = { x: -D * 0.5, y: -D * 0.7, z: -D * 0.6 };
const LEO_NAMES = ['Regulus', 'Denebola', 'Algieba', 'Zosma', 'Ras Elased'];
const LEO_STARS = makeStars('leo', LEO_CENTER, LEO_NAMES, 55);

// ─── Aquila (EDGE) ─── Decision, threshold, desire
const AQUILA_CENTER: Vec3 = { x: D * 0.6, y: -D * 0.5, z: -D * 0.8 };
const AQUILA_NAMES = ['Altair', 'Tarazed', 'Alschain', 'Deneb el Okab', 'Tseen Foo', 'Bezek', 'Al Thalimain'];
const AQUILA_STARS = makeStars('aquila', AQUILA_CENTER, AQUILA_NAMES, 60);

// ═══════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════���══════════════════════

export const ALL_STARS: UniverseStar[] = [
  ...LYRA_STARS, ...ORION_STARS, ...GEMINI_STARS,
  ...CASS_STARS, ...LEO_STARS, ...AQUILA_STARS,
];

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'lyra', name: 'Lyra', schema: 'CALM', color: '#8BC5E0',
    starIds: LYRA_STARS.map(s => s.id),
    connections: makeConnections(LYRA_STARS.map(s => s.id)),
    center: LYRA_CENTER,
  },
  {
    id: 'orion', name: 'Orion', schema: 'ROOT', color: '#C4956A',
    starIds: ORION_STARS.map(s => s.id),
    connections: makeConnections(ORION_STARS.map(s => s.id)),
    center: ORION_CENTER,
  },
  {
    id: 'gemini', name: 'Gemini', schema: 'BOND', color: '#A8C686',
    starIds: GEMINI_STARS.map(s => s.id),
    connections: makeConnections(GEMINI_STARS.map(s => s.id)),
    center: GEMINI_CENTER,
  },
  {
    id: 'cassiopeia', name: 'Cassiopeia', schema: 'WIRE', color: '#C2A4D4',
    starIds: CASS_STARS.map(s => s.id),
    connections: makeConnections(CASS_STARS.map(s => s.id)),
    center: CASS_CENTER,
  },
  {
    id: 'leo', name: 'Leo', schema: 'SELF', color: '#E0C374',
    starIds: LEO_STARS.map(s => s.id),
    connections: makeConnections(LEO_STARS.map(s => s.id)),
    center: LEO_CENTER,
  },
  {
    id: 'aquila', name: 'Aquila', schema: 'EDGE', color: '#D4878F',
    starIds: AQUILA_STARS.map(s => s.id),
    connections: makeConnections(AQUILA_STARS.map(s => s.id)),
    center: AQUILA_CENTER,
  },
];

// ═══════════════════════════════════════════════════
// GRAVITY — lane → constellation mapping
// ═══════════════════════════════════════════════════

const GRAVITY_MAP: Record<string, string> = {
  body: 'lyra',       // CALM
  present: 'lyra',
  origin: 'orion',    // ROOT
  relationship: 'gemini', // BOND
  pattern: 'cassiopeia', // WIRE
  mirror: 'leo',      // SELF
  fear: 'cassiopeia',
  desire: 'aquila',   // EDGE
};

export function getGravityTarget(lane: string): Constellation {
  const conId = GRAVITY_MAP[lane] || 'lyra';
  return CONSTELLATIONS.find(c => c.id === conId) || CONSTELLATIONS[0];
}

/**
 * Find the next unlit star in a constellation.
 */
export function findNextStar(con: Constellation, stars: UniverseStar[]): UniverseStar | null {
  for (const sid of con.starIds) {
    const s = stars.find(st => st.id === sid);
    if (s && !s.illuminated) return s;
  }
  return null;
}

// ═══════════════════════════════════════════════════
// STARDUST
// ═══════════════════════════════════════════════════

export interface Stardust {
  id: string;
  text: string;
  starId: string;
  timestamp: number;
  /** The universe reflecting back the act of writing */
  recognition?: string;
  /** Passage resonance — when the current writing echoes something written before */
  resonance?: string;
  /** Resonance depth milestone — the cosmos marking how many times echoes have surfaced */
  resonanceDepthWhisper?: string;
}

export const STARDUST_POOL: Record<string, string[]> = {
  CALM: [
    'Steadiness is not control. It is befriending the rhythm that was always there.',
    'The body is not a problem to solve. It is a landscape to inhabit.',
    'Stillness is not passive. It is the most active form of listening.',
    'What the watchful body calls danger, the breathing body calls information.',
    'There is a pace beneath the pace. It has been waiting.',
    'The breath is not a technique. It is the oldest language of the self.',
    'Calm is not the absence of feeling. It is the presence of space around it.',
    'You have survived every wave so far. The sea knows this, even if you forget.',
    'The vigilance served you. The ground beneath it is steady now.',
    'What the body holds, it also knows how to release. Given time.',
    'Safety is not a place. It is a rhythm the body remembers.',
    'The part of you that sounds the alarm is not the enemy. It is the messenger.',
  ],
  ROOT: [
    'What was planted in you is not who you are. It is what you grew around.',
    'The past does not ask to be fixed. It asks to be witnessed.',
    'Memory is not a replay. It is a translation by who you are now.',
    'The child adapted. The adult can choose. Both deserve tenderness.',
    'You did not choose the soil. But you are choosing what grows now.',
    'The origin story is a draft. Every reading reveals something new.',
    'Survival kept you here. And now there are other languages available.',
    'What was carried from that room can be set down in this one.',
    'The silence of that place spoke its own language. You translated it perfectly.',
    'What they could not give you was never a measure of what you deserved.',
    'The ground you came from holds you still. Differently now.',
    'You inherited the weather. Not the forecast.',
  ],
  BOND: [
    'The space between two people is not empty. It is the most honest room.',
    'Connection does not require perfection. It requires presence.',
    'What you carry for others, you are also allowed to set down.',
    'Boundaries are not rejection. They are the shape of respect.',
    'The bridge between two people can hold more weight than it appears.',
    'Needing someone is not a flaw. It is the oldest language of belonging.',
    'What goes unsaid still fills the room. Naming it changes the acoustics.',
    'Love is not a performance. It is a practice of staying.',
    'Receiving is not the opposite of giving. It is the other half of it.',
    'The strong one is allowed to rest. The room does not collapse.',
    'What you offer freely is also available to you. It always was.',
    'Distance is not always loss. Sometimes it is clarity.',
  ],
  WIRE: [
    'The circle only completes unobserved. You just observed it.',
    'A thought is not a fact. It is a weather pattern passing through.',
    'Between the impulse and the response, there is a continent.',
    'Patterns are not failures. They are the mind asking for a new answer.',
    'The shortcut was built for a hallway that no longer exists.',
    'What repeats is not broken. It is unfinished.',
    'Noticing the pattern is the first step outside of it.',
    'The map was drawn in another country. The territory has changed.',
    'The inner critic borrowed its voice. You just recognized where it came from.',
    'Perfectionism loosens in the light of attention. Not force.',
    'The rehearsal is over. The room is real. And different.',
    'What moves without asking can also move by invitation. Starting now.',
  ],
  SELF: [
    'Who you are is not who you were told you were.',
    'Growth feels like dissonance before it feels like clarity.',
    'The self is not a fixed point. It is a direction.',
    'What you are becoming does not need permission from what you were.',
    'The mask was necessary. Seeing its edges is the beginning.',
    'Identity is not a destination. It is an ongoing conversation.',
    'The unfamiliar version of you is not wrong. It is unexplored.',
    'You have survived yourself many times. Each version left a gift.',
    'The part that feels like too much is the part most worth knowing.',
    'The apology was learned. The presence was always yours.',
    'Grief for the unlived self is tenderness. Not failure.',
    'Authenticity is not a performance. It is a returning.',
  ],
  EDGE: [
    'Hesitation carries information worth reading.',
    'Desire is directional. What you want is a compass, not a luxury.',
    'The space between two choices is where the real question lives.',
    'Decision is not certainty. It is willingness.',
    'The path forward does not require the path to be visible. Only the next step.',
    'What feels like standing still may be gathering.',
    'Courage is not the absence of doubt. It is motion in its presence.',
    'Every threshold looks like an edge from one side and a beginning from the other.',
    'The comfort zone is known. What calls you is honest.',
    'The conversation you have been postponing is the one that matters.',
    'Growth grieves the smaller life. Both are real.',
    'What scares you and what calls you share a heartbeat.',
  ],
};

// Session-aware shuffled stardust selection — avoids repeating the same
// text in order across page refreshes. Each territory maintains its own
// shuffled order; once exhausted, the deck is reshuffled.
const _dustShuffled: Record<string, string[]> = {};
const _dustUsed: Record<string, number> = {};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function collectStardust(schema: string): string {
  const pool = STARDUST_POOL[schema] || STARDUST_POOL.CALM;
  if (!_dustShuffled[schema] || (_dustUsed[schema] || 0) >= pool.length) {
    _dustShuffled[schema] = shuffleArray(pool);
    _dustUsed[schema] = 0;
  }
  return _dustShuffled[schema][_dustUsed[schema]++];
}

// ════════════════════════════════════════════════���══
// THE VOICE — Observations, not questions
// ═══════════════════════════════════════════════════
//
// Ram Dass said: "We're all just walking each other home."
// Alan Watts said: "Muddy water is best cleared by leaving it alone."
//
// They never asked "What do you feel?"
// They made observations so precisely human
// that your own truth rose to meet them.
//
// An Observation is:
//   THE OBSERVATION — floats in the void, a thought already in the room
//   THE DEEPENING   — unfolds when you approach, a continuation
//   THE OPENING     — an unfinished thought ending in "..."
//                     the user does not answer a question
//                     they complete a thought already forming in them
//
// No question marks. No interrogation.
// Only recognition. Only invitation.

export interface Observation {
  id: string;
  /** The text that floats in the cosmos */
  text: string;
  /** What unfolds when the user approaches */
  deepening: string;
  /** The invitational fragment — floats as a choice, becomes the writing prompt (ends in "...") */
  opening: string;
  /** Territory this observation belongs to */
  territory: string;
  /** Depth tier: 0 = gentle/universal, 1 = personal/specific, 2 = intimate/earned */
  depth: number;
}

// ─── CALM (Lyra) ─── Presence, regulation, breath, the body
const CALM_OBSERVATIONS: Observation[] = [
  {
    id: 'calm-1', territory: 'CALM', depth: 0,
    text: 'The river does not push the water.',
    deepening: 'And yet everything arrives.',
    opening: 'What arrives when you stop pushing...',
  },
  {
    id: 'calm-2', territory: 'CALM', depth: 0,
    text: 'You are not the storm. You are the sky the storm moves through.',
    deepening: 'The sky does not need the storm to end.',
    opening: 'The sky in you right now...',
  },
  {
    id: 'calm-3', territory: 'CALM', depth: 1,
    text: 'Stillness is not empty. It is full of what you have been avoiding.',
    deepening: 'And what you have been avoiding may not be as large as you remember.',
    opening: 'What becomes visible when you are still...',
  },
  {
    id: 'calm-4', territory: 'CALM', depth: 1,
    text: 'The body carries what the mind refuses to name.',
    deepening: 'It has been carrying it faithfully, without complaint.',
    opening: 'If the body could speak without the mind translating...',
  },
  {
    id: 'calm-5', territory: 'CALM', depth: 0,
    text: 'Breath is the oldest conversation you will ever have.',
    deepening: 'It began before language. It will continue after thought.',
    opening: 'What the breath is saying right now...',
  },
  {
    id: 'calm-6', territory: 'CALM', depth: 1,
    text: 'The wave does not fight the ocean.',
    deepening: 'It rises. It falls. It does not cease to be water.',
    opening: 'If you stopped resisting the current, even briefly...',
  },
  {
    id: 'calm-7', territory: 'CALM', depth: 1,
    text: 'To feel without drowning is not the absence of feeling. It is feeling with room around it.',
    deepening: 'The shore is not far. You have stood on it before.',
    opening: 'Where does the shore begin from where you are standing...',
  },
  {
    id: 'calm-8', territory: 'CALM', depth: 0,
    text: 'There is a pace beneath your hurry that has always been there.',
    deepening: 'It moves at the speed of honesty.',
    opening: 'What emerges when you move at that pace...',
  },
  {
    id: 'calm-9', territory: 'CALM', depth: 1,
    text: 'Tension is the body saying: I am still listening.',
    deepening: 'Perhaps what it hears deserves a gentler response.',
    opening: 'Where in the body is the listening loudest...',
  },
  {
    id: 'calm-10', territory: 'CALM', depth: 2,
    text: 'The watchful body is not broken. It learned vigilance in a room that required it.',
    deepening: 'That room is behind you now.',
    opening: 'If the body believed it was safe, truly safe, it would...',
  },
  {
    id: 'calm-11', territory: 'CALM', depth: 1,
    text: 'You do not need to calm the mind. You need to widen the space around it.',
    deepening: 'Space does not judge what it contains.',
    opening: 'What if there were more room around the mind...',
  },
  {
    id: 'calm-12', territory: 'CALM', depth: 0,
    text: 'Rest is not a reward. It is a language the body speaks when it trusts you to listen.',
    deepening: 'It has been speaking.',
    opening: 'What the body is quietly asking for, even if it sounds simple...',
  },
  // ── Expanded pool (Pass 53) ──
  {
    id: 'calm-13', territory: 'CALM', depth: 1,
    text: 'There is a place in you that was never damaged. It is quieter than the noise, but it is older.',
    deepening: 'It does not need to be found. Only remembered.',
    opening: 'What the undamaged place remembers...',
  },
  {
    id: 'calm-14', territory: 'CALM', depth: 2,
    text: 'The vigilance that keeps you awake at night was once the thing that kept you alive.',
    deepening: 'It has not received the news that the danger has passed.',
    opening: 'If you could deliver that message gently, in your own words...',
  },
  {
    id: 'calm-15', territory: 'CALM', depth: 1,
    text: 'Exhaling is the oldest act of trust.',
    deepening: 'It says: I will let go of this, and I will still be here.',
    opening: 'What you are ready to exhale...',
  },
  {
    id: 'calm-16', territory: 'CALM', depth: 2,
    text: 'The body stores what the calendar forgot. Anniversaries of silence.',
    deepening: 'It tightens at the same time each year. Not randomly. Faithfully.',
    opening: 'What the body has been faithfully remembering without your permission...',
  },
  {
    id: 'calm-17', territory: 'CALM', depth: 1,
    text: 'Safety is not the absence of threat. It is the presence of enough ground to stand on.',
    deepening: 'You have more ground than you think.',
    opening: 'The ground that is here, even now, even in this...',
  },
  {
    id: 'calm-18', territory: 'CALM', depth: 2,
    text: 'What you call anxiety the body calls preparation for something that never arrives.',
    deepening: 'The rehearsal has become the performance. Both can end.',
    opening: 'If the rehearsal ended and nothing arrived, what would remain...',
  },
];

// ─── ROOT (Orion) ─── Origin, memory, childhood, the ground beneath
const ROOT_OBSERVATIONS: Observation[] = [
  {
    id: 'root-1', territory: 'ROOT', depth: 1,
    text: 'Every room you survived taught you something. Not all of it was true.',
    deepening: 'What was necessary then is not law now.',
    opening: 'What were you taught that you are ready to set down...',
  },
  {
    id: 'root-2', territory: 'ROOT', depth: 2,
    text: 'The younger version of you is not gone. They are watching to see what you do next.',
    deepening: 'They are not disappointed. They are curious.',
    opening: 'If you could speak to them now, across all that time...',
  },
  {
    id: 'root-3', territory: 'ROOT', depth: 1,
    text: 'Memory is not a replay. It is a translation by who you are now.',
    deepening: 'Each reading reveals something different.',
    opening: 'The memory speaks differently to who you are today...',
  },
  {
    id: 'root-4', territory: 'ROOT', depth: 1,
    text: 'The ground you stand on was built by someone else. And before them, someone else.',
    deepening: 'You inherited a structure. You are not required to live in it.',
    opening: 'What part of the old structure no longer fits...',
  },
  {
    id: 'root-5', territory: 'ROOT', depth: 0,
    text: 'You did not choose the soil. But you are choosing what grows now.',
    deepening: 'Growth does not require perfect ground. It requires light.',
    opening: 'Where is the light reaching you from...',
  },
  {
    id: 'root-6', territory: 'ROOT', depth: 1,
    text: 'The origin story you were given may not be the origin story you lived.',
    deepening: 'There is a version only you can tell.',
    opening: 'The part of the story that is yours alone...',
  },
  {
    id: 'root-7', territory: 'ROOT', depth: 2,
    text: 'Survival was the first language you learned. It kept you here.',
    deepening: 'Now there are other languages available.',
    opening: 'If survival stepped aside for a moment and let another language speak...',
  },
  {
    id: 'root-8', territory: 'ROOT', depth: 1,
    text: 'What was planted in you is not who you are. It is what you grew around.',
    deepening: 'And what you grew around can be seen from the outside now.',
    opening: 'What did you grow around that you can now see...',
  },
  {
    id: 'root-9', territory: 'ROOT', depth: 2,
    text: 'The past does not ask to be fixed. It asks to be witnessed.',
    deepening: 'Witnessing is not reliving. It is standing beside.',
    opening: 'There is a moment in the past asking to be stood beside, not entered...',
  },
  {
    id: 'root-10', territory: 'ROOT', depth: 0,
    text: 'There is a difference between where you come from and where you belong.',
    deepening: 'You are allowed to discover the difference.',
    opening: 'Where do you feel you belong that is different from where you began...',
  },
  {
    id: 'root-11', territory: 'ROOT', depth: 2,
    text: 'The child adapted. The adult can choose.',
    deepening: 'The adaptation was brilliant. The choice is also yours.',
    opening: 'An adaptation that has outlived its purpose...',
  },
  {
    id: 'root-12', territory: 'ROOT', depth: 1,
    text: 'Some of what you carry was never yours to hold.',
    deepening: 'Setting it down is not betrayal. It is honesty.',
    opening: 'The weight of what was never yours to carry...',
  },
  // ── Expanded pool (Pass 53) ──
  {
    id: 'root-13', territory: 'ROOT', depth: 2,
    text: 'The silence in that house was not empty. It was full of everything no one said.',
    deepening: 'You learned to read the silence. You still do.',
    opening: 'What the silence in that room was actually saying...',
  },
  {
    id: 'root-14', territory: 'ROOT', depth: 1,
    text: 'You inherited a map of what love looks like. Not all of it matches the territory.',
    deepening: 'The map was drawn honestly. By someone who did not have a better one.',
    opening: 'Where the inherited map differs from what you now know to be true...',
  },
  {
    id: 'root-15', territory: 'ROOT', depth: 2,
    text: 'The person you became in that room is not who you are. It is who you had to be.',
    deepening: 'Who you had to be kept you alive. Who you are is waiting.',
    opening: 'The difference between who you had to be and who you actually are...',
  },
  {
    id: 'root-16', territory: 'ROOT', depth: 1,
    text: 'There are things you understood too early. Things children should not have to translate.',
    deepening: 'The translation was brilliant. And it cost something.',
    opening: 'What it cost to understand that early...',
  },
  {
    id: 'root-17', territory: 'ROOT', depth: 2,
    text: 'Loyalty to where you came from and freedom to leave are not enemies.',
    deepening: 'Both can exist in the same breath. Both can be honored.',
    opening: 'The place where loyalty and freedom meet in you...',
  },
  {
    id: 'root-18', territory: 'ROOT', depth: 1,
    text: 'What happened to you is a fact. What it means is still being written.',
    deepening: 'The author was someone else then. The author is you now.',
    opening: 'The meaning that is forming now, different from the one you were given...',
  },
];

// ─── BOND (Gemini) ─── Connection, relationships, the space between
const BOND_OBSERVATIONS: Observation[] = [
  {
    id: 'bond-1', territory: 'BOND', depth: 0,
    text: 'The space between two people is also a place.',
    deepening: 'And sometimes it is the most honest place there is.',
    opening: 'What lives in the space between you and someone you carry...',
  },
  {
    id: 'bond-2', territory: 'BOND', depth: 0,
    text: 'Connection is not the absence of distance. It is what survives it.',
    deepening: 'Distance is not always a wall. Sometimes it is a window.',
    opening: 'Through the distance, something is visible that was not visible up close...',
  },
  {
    id: 'bond-3', territory: 'BOND', depth: 0,
    text: 'You learned to carry what was not yours. The weight became familiar.',
    deepening: 'Familiar is not the same as right.',
    opening: 'What are you carrying for someone else that you could set down...',
  },
  {
    id: 'bond-4', territory: 'BOND', depth: 0,
    text: 'What you offer others you are also allowed to receive.',
    deepening: 'The offering was never meant to be one direction.',
    opening: 'If you could receive what you give so freely...',
  },
  {
    id: 'bond-5', territory: 'BOND', depth: 2,
    text: 'Closeness without safety is proximity. You deserve both.',
    deepening: 'And deserving is not something earned. It is something remembered.',
    opening: 'The version of closeness that does not cost you...',
  },
  {
    id: 'bond-6', territory: 'BOND', depth: 0,
    text: 'The bridge between two people can hold weight.',
    deepening: 'You do not have to test it by carrying everything.',
    opening: 'What would the bridge hold if you trusted it...',
  },
  {
    id: 'bond-7', territory: 'BOND', depth: 2,
    text: 'Every relationship has an invisible agreement. Most were written before you could read.',
    deepening: 'The terms can be revisited.',
    opening: 'The part of the agreement you would rewrite...',
  },
  {
    id: 'bond-8', territory: 'BOND', depth: 2,
    text: 'To need is not weakness. It is the body remembering it was never meant to be alone.',
    deepening: 'The aloneness was circumstance. Not truth.',
    opening: 'If you allowed yourself to ask for one thing...',
  },
  {
    id: 'bond-9', territory: 'BOND', depth: 1,
    text: 'The pattern between people is often an echo of an earlier room.',
    deepening: 'The echo is not the voice. It is the shape of the room.',
    opening: 'Where does this echo originate...',
  },
  {
    id: 'bond-10', territory: 'BOND', depth: 0,
    text: 'Love does not require you to disappear.',
    deepening: 'Presence is not a sacrifice. It is an offering.',
    opening: 'Where have you been disappearing...',
  },
  {
    id: 'bond-11', territory: 'BOND', depth: 0,
    text: 'Boundaries are not walls. They are the shape of what you are willing to protect.',
    deepening: 'What you protect is what you value.',
    opening: 'What are you protecting that deserves clearer edges...',
  },
  {
    id: 'bond-12', territory: 'BOND', depth: 1,
    text: 'Forgiveness is not agreement. It is the body releasing its grip on a conversation that ended long ago.',
    deepening: 'The grip served you. Releasing it also serves you.',
    opening: 'Softening the grip, just slightly...',
  },
  // ── Expanded pool (Pass 53) ──
  {
    id: 'bond-13', territory: 'BOND', depth: 2,
    text: 'You learned to perform love before you learned to receive it.',
    deepening: 'The performance was convincing. Even to yourself.',
    opening: 'What receiving looks like without the performance...',
  },
  {
    id: 'bond-14', territory: 'BOND', depth: 1,
    text: 'The loneliest place is not an empty room. It is a room full of people where you cannot be yourself.',
    deepening: 'You have been in that room. You do not have to stay.',
    opening: 'The version of yourself that could not be present in that room...',
  },
  {
    id: 'bond-15', territory: 'BOND', depth: 2,
    text: 'Somewhere along the way, you decided that asking for help was a form of failure.',
    deepening: 'That decision was made in a room with no help available. The room has changed.',
    opening: 'If asking were not failure but fluency...',
  },
  {
    id: 'bond-16', territory: 'BOND', depth: 1,
    text: 'Every goodbye you avoided is still happening somewhere inside you.',
    deepening: 'Completion is not loss. It is honoring what was real.',
    opening: 'The goodbye that wants to be spoken, not to end something but to honor it...',
  },
  {
    id: 'bond-17', territory: 'BOND', depth: 2,
    text: 'You have been the strong one for so long that you forgot it was a choice.',
    deepening: 'Strength without rest becomes a wall. Walls do not receive.',
    opening: 'What would happen if you set down the strength, just for a moment...',
  },
  {
    id: 'bond-18', territory: 'BOND', depth: 1,
    text: 'There is a difference between being needed and being loved. You deserve the distinction.',
    deepening: 'Need is a function. Love is a recognition.',
    opening: 'Where you have been needed, and where you have been truly seen...',
  },
];

// ─── WIRE (Cassiopeia) ─── Patterns, loops, cognitive awareness
const WIRE_OBSERVATIONS: Observation[] = [
  {
    id: 'wire-1', territory: 'WIRE', depth: 0,
    text: 'The mind returns to what it has not finished.',
    deepening: 'Not out of weakness. Out of intelligence.',
    opening: 'What is your mind circling that wants to be completed...',
  },
  {
    id: 'wire-2', territory: 'WIRE', depth: 0,
    text: 'The loop only completes unobserved. You are already watching it.',
    deepening: 'Watching changes the thing watched.',
    opening: 'The loop, now that you are watching it...',
  },
  {
    id: 'wire-3', territory: 'WIRE', depth: 0,
    text: 'A thought is not a fact. It is a weather pattern.',
    deepening: 'Weather passes. The landscape remains.',
    opening: 'The landscape beneath this weather, if you look...',
  },
  {
    id: 'wire-4', territory: 'WIRE', depth: 0,
    text: 'The thought that arrives first is not always the truest. It is the oldest.',
    deepening: 'There are newer thoughts waiting behind it.',
    opening: 'Behind the old thought, something newer is waiting...',
  },
  {
    id: 'wire-5', territory: 'WIRE', depth: 1,
    text: 'Between the impulse and the response there is a space.',
    deepening: 'It grows with practice. It is growing now.',
    opening: 'In that space between, something is visible now...',
  },
  {
    id: 'wire-6', territory: 'WIRE', depth: 1,
    text: 'What repeats is not weakness. It is the mind asking for a new response.',
    deepening: 'The question is always the same. The answer can change.',
    opening: 'The new response forming beneath the old one...',
  },
  {
    id: 'wire-7', territory: 'WIRE', depth: 0,
    text: 'The map you are using was drawn in a different country.',
    deepening: 'It served you there. The territory has changed.',
    opening: 'If you drew the territory as it actually is, not as the old map says...',
  },
  {
    id: 'wire-8', territory: 'WIRE', depth: 2,
    text: 'The mind rehearses futures it cannot control.',
    deepening: 'The rehearsal feels productive. But the play is live.',
    opening: 'If the rehearsal ended and the room became real...',
  },
  {
    id: 'wire-9', territory: 'WIRE', depth: 1,
    text: 'Your mind learned this shortcut in a room that no longer exists.',
    deepening: 'The shortcut was efficient then. There are longer, better roads now.',
    opening: 'Where does the longer road lead, the one the shortcut was avoiding...',
  },
  {
    id: 'wire-10', territory: 'WIRE', depth: 0,
    text: 'Noticing the pattern is the first step outside of it.',
    deepening: 'You do not need to fix it. Only to see it.',
    opening: 'What do you see when you look at the pattern plainly...',
  },
  {
    id: 'wire-11', territory: 'WIRE', depth: 0,
    text: 'The story you tell yourself about yourself runs on repeat because it was never questioned.',
    deepening: 'Questioning is not doubting. It is listening to a newer voice.',
    opening: 'What part of your story is ready to be updated...',
  },
  {
    id: 'wire-12', territory: 'WIRE', depth: 2,
    text: 'Reaction has architecture. Not all of it is yours.',
    deepening: 'Some of the blueprints were inherited. Some were improvised under pressure.',
    opening: 'The part of the reaction that was inherited, not yours...',
  },
  // ── Expanded pool (Pass 53) ──
  {
    id: 'wire-13', territory: 'WIRE', depth: 1,
    text: 'The inner critic speaks in someone else\u2019s voice. You just never questioned the accent.',
    deepening: 'Listen again. Whose tone is it, really.',
    opening: 'The voice behind the critic, if you listen past the words...',
  },
  {
    id: 'wire-14', territory: 'WIRE', depth: 2,
    text: 'You built this wall in a single afternoon and have been maintaining it for years.',
    deepening: 'Maintenance takes more energy than the wall ever saved.',
    opening: 'What the wall was protecting, and what it is now preventing...',
  },
  {
    id: 'wire-15', territory: 'WIRE', depth: 1,
    text: 'The thing you do before you do the thing. That is where the pattern lives.',
    deepening: 'Not the action. The preamble. The preparation for the familiar.',
    opening: 'The preamble, the small ritual before the pattern runs...',
  },
  {
    id: 'wire-16', territory: 'WIRE', depth: 2,
    text: 'Perfectionism is not ambition. It is fear wearing a professional outfit.',
    deepening: 'The fear is of being seen as you are. Which is, of course, the only way to be seen.',
    opening: 'What lives beneath the perfectionism, if you lift it gently...',
  },
  {
    id: 'wire-17', territory: 'WIRE', depth: 1,
    text: 'You are not procrastinating. You are protecting yourself from something you have not named.',
    deepening: 'Naming the protection is more useful than defeating the delay.',
    opening: 'What the delay is protecting you from, if you name it plainly...',
  },
  {
    id: 'wire-18', territory: 'WIRE', depth: 2,
    text: 'The catastrophe you rehearse each night has never arrived. But the rehearsal itself has consequences.',
    deepening: 'The body does not distinguish between rehearsal and reality. It responds to both.',
    opening: 'The toll of the rehearsal, not the event itself, but the practicing of it...',
  },
];

// ─── SELF (Leo) ─── Identity, becoming, permission
const SELF_OBSERVATIONS: Observation[] = [
  {
    id: 'self-1', territory: 'SELF', depth: 0,
    text: 'You are not who you were told you were.',
    deepening: 'And you are not yet who you are becoming.',
    opening: 'What is becoming in you that has no name yet...',
  },
  {
    id: 'self-2', territory: 'SELF', depth: 1,
    text: 'Identity is not a fixed point. It is a direction.',
    deepening: 'Directions can change without the traveler being lost.',
    opening: 'The unfamiliar direction you are quietly facing...',
  },
  {
    id: 'self-3', territory: 'SELF', depth: 0,
    text: 'The voice that judges you was learned. What is learned can be seen.',
    deepening: 'Seeing it does not silence it. It gives you a second voice.',
    opening: 'What does the second voice say...',
  },
  {
    id: 'self-4', territory: 'SELF', depth: 1,
    text: 'Growth feels like dissonance before it feels like clarity.',
    deepening: 'The dissonance is not a sign you are wrong. It is a sign you are moving.',
    opening: 'If the dissonance had a message, not a complaint...',
  },
  {
    id: 'self-5', territory: 'SELF', depth: 1,
    text: 'Who you are is not a conclusion. It is an ongoing conversation.',
    deepening: 'The conversation has room for contradictions.',
    opening: 'The contradictions you are holding, both at once...',
  },
  {
    id: 'self-6', territory: 'SELF', depth: 2,
    text: 'The unfamiliar version of you is not wrong. It is unexplored.',
    deepening: 'Exploration does not require certainty. Only willingness.',
    opening: 'Where in yourself have you not yet been willing to look...',
  },
  {
    id: 'self-7', territory: 'SELF', depth: 1,
    text: 'What you are becoming does not need permission from what you were.',
    deepening: 'The old self is not abandoned. It is included.',
    opening: 'What from your old self do you want to bring forward...',
  },
  {
    id: 'self-8', territory: 'SELF', depth: 2,
    text: 'You have been editing yourself for audiences that are no longer watching.',
    deepening: 'The performance was protective. The stage is empty now.',
    opening: 'If no one were watching. No audience. No judge. Then...',
  },
  {
    id: 'self-9', territory: 'SELF', depth: 2,
    text: 'The mask is not the problem. Forgetting you put it on is.',
    deepening: 'You can see the edges now.',
    opening: 'Behind the mask, something wants to be seen...',
  },
  {
    id: 'self-10', territory: 'SELF', depth: 2,
    text: 'Shame is identity wearing clothes that were never yours.',
    deepening: 'The clothes were given to you. They can be returned.',
    opening: 'What would you wear if shame had no wardrobe...',
  },
  {
    id: 'self-11', territory: 'SELF', depth: 1,
    text: 'There is a version of you that exists only in honesty.',
    deepening: 'It does not perform. It does not protect. It simply is.',
    opening: 'The honest version of you is forming a sentence right now...',
  },
  {
    id: 'self-12', territory: 'SELF', depth: 0,
    text: 'You have survived yourself many times.',
    deepening: 'Each version left something valuable behind.',
    opening: 'When the last version of you left, something valuable remained...',
  },
  // ── Expanded pool (Pass 53) ──
  {
    id: 'self-13', territory: 'SELF', depth: 1,
    text: 'The part of you that feels like too much is the part someone once could not hold.',
    deepening: 'Their capacity was not a measurement of your worth.',
    opening: 'What you learned to hide because it was too much for the room...',
  },
  {
    id: 'self-14', territory: 'SELF', depth: 2,
    text: 'You have been apologizing for your existence in rooms that should have been grateful for it.',
    deepening: 'The apology was learned. The gratitude was owed.',
    opening: 'The room where you no longer need to apologize for arriving...',
  },
  {
    id: 'self-15', territory: 'SELF', depth: 1,
    text: 'There is a difference between what you believe about yourself and what is true about yourself.',
    deepening: 'Belief is inherited. Truth is discovered.',
    opening: 'A belief about yourself that you are ready to hold up to the light...',
  },
  {
    id: 'self-16', territory: 'SELF', depth: 2,
    text: 'The role you play so well that people forgot it was a role. You almost forgot too.',
    deepening: 'Remembering it is a role is not the same as abandoning it. It is the same as choosing it.',
    opening: 'What lives behind the role, if you hold it up to the light...',
  },
  {
    id: 'self-17', territory: 'SELF', depth: 1,
    text: 'Grief for the self you did not get to become is still grief. It deserves the same tenderness.',
    deepening: 'The unlived life is not lost. It is information about what matters.',
    opening: 'The self you did not get to become, held with recognition...',
  },
  {
    id: 'self-18', territory: 'SELF', depth: 2,
    text: 'Authenticity is not a destination you arrive at. It is the practice of removing what was never yours.',
    deepening: 'Each layer removed reveals more room. Not less.',
    opening: 'What is ready to be set down, gently, like a coat that was never yours...',
  },
];

// ─── EDGE (Aquila) ─── Decision, threshold, desire, courage
const EDGE_OBSERVATIONS: Observation[] = [
  {
    id: 'edge-1', territory: 'EDGE', depth: 0,
    text: 'Every threshold looks like an edge from one side and a beginning from the other.',
    deepening: 'You will not know which side you are on until you move.',
    opening: 'What does the other side look like from here...',
  },
  {
    id: 'edge-2', territory: 'EDGE', depth: 0,
    text: 'Hesitation carries information worth reading.',
    deepening: 'Not all hesitation is fear. Some of it is wisdom.',
    opening: 'What the hesitation is trying to tell you...',
  },
  {
    id: 'edge-3', territory: 'EDGE', depth: 0,
    text: 'Desire is directional. What you want is a compass, not a luxury.',
    deepening: 'The compass has been pointing.',
    opening: 'Where has it been pointing...',
  },
  {
    id: 'edge-4', territory: 'EDGE', depth: 1,
    text: 'The path forward does not require the path to be visible.',
    deepening: 'Only the next step. Not the whole staircase.',
    opening: 'Just the next step, not the whole staircase...',
  },
  {
    id: 'edge-5', territory: 'EDGE', depth: 1,
    text: 'Courage is not the absence of doubt. It is motion in its presence.',
    deepening: 'The doubt does not leave. You learn to move with it.',
    opening: 'Where are you ready to move, even with the doubt...',
  },
  {
    id: 'edge-6', territory: 'EDGE', depth: 0,
    text: 'What feels like standing still may be gathering.',
    deepening: 'The pause before the leap is not inaction. It is preparation.',
    opening: 'What are you gathering...',
  },
  {
    id: 'edge-7', territory: 'EDGE', depth: 2,
    text: 'The decision does not need to be right. It needs to be honest.',
    deepening: 'Honesty has a weight that rightness does not.',
    opening: 'If honesty chose for you...',
  },
  {
    id: 'edge-8', territory: 'EDGE', depth: 1,
    text: 'You are standing at a door you have been looking at for a long time.',
    deepening: 'Looking was the first step. The next step is different.',
    opening: 'What happens when you touch the handle...',
  },
  {
    id: 'edge-9', territory: 'EDGE', depth: 2,
    text: 'Risk is the body saying: something on the other side matters.',
    deepening: 'If nothing mattered, there would be no risk.',
    opening: 'What matters enough to risk something for...',
  },
  {
    id: 'edge-10', territory: 'EDGE', depth: 2,
    text: 'The space between two choices is where the real question lives.',
    deepening: 'The real question is rarely about the choices themselves.',
    opening: 'Beneath the two choices, a third thing that is not a choice...',
  },
  {
    id: 'edge-11', territory: 'EDGE', depth: 2,
    text: 'What you are afraid to want is often what you most need.',
    deepening: 'The fear is not about the wanting. It is about the deserving.',
    opening: 'If deserving were not a question but something already settled...',
  },
  {
    id: 'edge-12', territory: 'EDGE', depth: 1,
    text: 'Every ending is a doorway wearing a disguise.',
    deepening: 'The disguise is grief. The doorway is real.',
    opening: 'What doorway is hiding behind this ending...',
  },
  // ── Expanded pool (Pass 53) ──
  {
    id: 'edge-13', territory: 'EDGE', depth: 2,
    text: 'You already know what you want. The question is not what. It is whether you will let yourself have it.',
    deepening: 'Permission is not given. It is taken. Quietly. Honestly.',
    opening: 'What you already know you want, spoken without apology...',
  },
  {
    id: 'edge-14', territory: 'EDGE', depth: 1,
    text: 'The comfort zone is comfortable because it is known. Not because it is good.',
    deepening: 'Known and good are different countries. You can travel between them.',
    opening: 'What is known but no longer good, and what is good but not yet known...',
  },
  {
    id: 'edge-15', territory: 'EDGE', depth: 2,
    text: 'The conversation you have been avoiding is the one that would change everything.',
    deepening: 'It is not the words you fear. It is the room after the words.',
    opening: 'The room after the words. If you could see it...',
  },
  {
    id: 'edge-16', territory: 'EDGE', depth: 1,
    text: 'There is a grief that comes with growth. Mourning the certainty of the smaller life.',
    deepening: 'The smaller life was real. And it is okay to grieve it while you leave it.',
    opening: 'What you are grieving as you grow, not what was lost but what is ending...',
  },
  {
    id: 'edge-17', territory: 'EDGE', depth: 2,
    text: 'The thing that scares you and the thing that calls you are often standing in the same place.',
    deepening: 'Fear is not the opposite of calling. It is the proof that the calling is real.',
    opening: 'The place where the fear and the calling overlap...',
  },
  {
    id: 'edge-18', territory: 'EDGE', depth: 1,
    text: 'Waiting for readiness is sometimes wisdom. And sometimes it is the last hiding place.',
    deepening: 'You know which one it is right now. You have always known.',
    opening: 'What you have been calling patience that might actually be...',
  },
];

// ─── THE RECOGNITION — what stardust becomes ───
// Not fortune cookies. Witnessing.
// The universe reflecting back the act of writing,
// not evaluating its content.

export const RECOGNITION_POOL: Record<string, string[]> = {
  CALM: [
    'Something shifted just now. The body noticed.',
    'The breath you just took was different from the one before.',
    'What was held is now named. That changes its weight.',
    'Stillness spoke. You listened.',
    'The body remembers how to be still. You are remembering.',
    'Something loosened. Not everything. Enough.',
    'The space you just created did not exist before you wrote.',
    'Presence is not a skill. It is what remains when the noise settles.',
    'The vigilance noticed it was no longer needed. Even briefly. That is something.',
    'What was tight just found a fraction more room. The body knows.',
    'You just spoke to the place that never gets spoken to. It heard you.',
    'The ground held. It always does. You just noticed.',
  ],
  ROOT: [
    'Naming the origin does not erase it. It loosens the grip.',
    'You just stood beside something old. That is different from standing inside it.',
    'The room you described no longer contains you. Only its echo.',
    'What you carried just became lighter. Not gone. Lighter.',
    'The younger version of you just heard your voice. It mattered.',
    'To witness is to change the story without rewriting it.',
    'The ground shifted. Not violently. Like settling.',
    'What was silent just became spoken. That is a form of freedom.',
    'The silence you described is no longer unopened. You opened it.',
    'What they could not say, you just said for them. And for yourself.',
    'The meaning just shifted. Not the event. The translation.',
    'Something old just met something present. The meeting mattered.',
  ],
  BOND: [
    'What you just said aloud, even silently, changes the space between.',
    'The weight you named is shared now. Not with someone. With the truth.',
    'Something between you and another person just became visible.',
    'The invisible agreement was spoken. It can be revised.',
    'What was carried alone just entered the room. It is smaller than it felt.',
    'Connection does not require resolution. Only honesty.',
    'You just drew a line. Not to keep someone out. To know where you stand.',
    'What you need is not a burden. It is a bridge.',
    'The performance paused. The person remained. That was enough.',
    'Asking just became less impossible. Not easy. Less impossible.',
    'Something between you and someone just became speakable.',
    'The strength set down did not break. It rested.',
  ],
  WIRE: [
    'The loop just paused. Not because it stopped. Because you noticed.',
    'What was invisible just became visible. And what is visible begins to change.',
    'The pattern was repeating. Now it is being read.',
    'You just stepped outside the rehearsal and into the room.',
    'The shortcut was seen. Longer roads are now available.',
    'Something that repeated without permission just received your attention.',
    'The weather shifted. The landscape held.',
    'What lived beneath the surface just rose into view. That is progress.',
    'The voice was recognized. And in the recognition, it grew quieter.',
    'What was habitual just became a choice. That is a different kind of freedom.',
    'The rehearsal was interrupted by reality. Reality was gentler.',
    'The beginning of the pattern was seen. It can no longer arrive unannounced.',
  ],
  SELF: [
    'Something in you recognized itself just now.',
    'The version of you that wrote this is not the same one that arrived.',
    'What was hidden just chose to be seen. That took something.',
    'The honest word is heavier than the safe one. You chose the honest one.',
    'Identity moved. Not because you forced it. Because you allowed it.',
    'The mask was acknowledged. That is the beginning of removing it.',
    'You just let yourself be unfamiliar. That is courage.',
    'Something new just spoke in your voice. Let it keep speaking.',
    'The part that was too much just became exactly enough.',
    'The room you no longer apologize for entering just got larger.',
    'Belief was examined. Truth took its place. Quietly.',
    'The role was seen. The person behind it just breathed.',
  ],
  EDGE: [
    'The step was taken before the ground appeared. That is how it works.',
    'What you just named as desire is also information.',
    'Hesitation was read. Not obeyed. That is new.',
    'The door was touched. Not opened. Not avoided. Touched.',
    'Something that was only imagined just became words. Words travel further.',
    'The threshold noticed you approaching. The light changed.',
    'What you risked was honesty. The return is already arriving.',
    'Movement happened. Not the whole staircase. One step. That is everything.',
    'The comfort zone just received a forwarding address.',
    'What was postponed just became present. The room after the words is closer.',
    'The grief and the growth just acknowledged each other. Both are real.',
    'Fear and calling just stood in the same place. You stayed.',
  ],
};

// Session-aware shuffled recognition selection — same pattern as stardust
const _recShuffled: Record<string, string[]> = {};
const _recUsed: Record<string, number> = {};

export function collectRecognition(schema: string): string {
  const pool = RECOGNITION_POOL[schema] || RECOGNITION_POOL.CALM;
  if (!_recShuffled[schema] || (_recUsed[schema] || 0) >= pool.length) {
    _recShuffled[schema] = shuffleArray(pool);
    _recUsed[schema] = 0;
  }
  return _recShuffled[schema][_recUsed[schema]++];
}

// ─── OBSERVATION POOL — all territories ───

export const OBSERVATION_POOL: Record<string, Observation[]> = {
  CALM: CALM_OBSERVATIONS,
  ROOT: ROOT_OBSERVATIONS,
  BOND: BOND_OBSERVATIONS,
  WIRE: WIRE_OBSERVATIONS,
  SELF: SELF_OBSERVATIONS,
  EDGE: EDGE_OBSERVATIONS,
};

export const ALL_OBSERVATIONS: Observation[] = [
  ...CALM_OBSERVATIONS, ...ROOT_OBSERVATIONS, ...BOND_OBSERVATIONS,
  ...WIRE_OBSERVATIONS, ...SELF_OBSERVATIONS, ...EDGE_OBSERVATIONS,
];

// ═══════════════════════════════════════════════════
// TERRITORY SEEDS — short invitational fragments
// ═══════════════════════════════════════════════════
//
// These are not prompts. They are the beginning of a thought
// the user is already forming. 1-3 words maximum.
// They feel like typing back, not being asked.
//
// Displayed as the dwelling invitation: three seeds,
// one per drawn observation. The user taps the fragment
// that resonates, and the observation unfolds.

export const TERRITORY_SEEDS: Record<string, string[]> = {
  CALM: [
    'stillness',
    'the body',
    'breath',
    'the quiet',
    'what rests',
    'the pace beneath',
  ],
  ROOT: [
    'what was',
    'the ground',
    'before',
    'where I began',
    'the old room',
    'what I carried',
  ],
  BOND: [
    'the space between',
    'someone',
    'what connects',
    'reaching',
    'the bridge',
    'who I carry',
  ],
  WIRE: [
    'the pattern',
    'the loop',
    'noticing',
    'the old map',
    'what repeats',
    'the story I tell',
  ],
  SELF: [
    'becoming',
    'the mask',
    'permission',
    'who I am',
    'what is forming',
    'the honest version',
  ],
  EDGE: [
    'the threshold',
    'the next step',
    'desire',
    'what calls',
    'the doorway',
    'courage',
  ],
};

/**
 * Pick a seed word for an observation's territory.
 * Returns a short 1-3 word fragment that acts as the user's entry point.
 * Avoids repeating seeds within the same draw.
 */
export function pickSeed(territory: string, usedSeeds: Set<string>): string {
  const pool = TERRITORY_SEEDS[territory] || ['something'];
  const fresh = pool.filter(s => !usedSeeds.has(s));
  const candidates = fresh.length > 0 ? fresh : pool;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  usedSeeds.add(pick);
  return pick;
}

/**
 * Draw observations for a dwelling session.
 * Returns 2-3 observations, biased toward territories
 * with fewer illuminated stars (gentle gravity toward unexplored space).
 *
 * Cross-session territory depth accelerates access to deeper observations:
 * territories visited heavily across sessions earn intimate observations
 * earlier in new sessions, as if the cosmos remembers your attention.
 *
 * @param illuminatedByTerritory - map of schema → count of illuminated stars
 * @param encountered - set of observation IDs already seen (memory)
 * @param count - number of observations to draw
 * @param crossSessionDepth - per-territory inscription counts from session memory
 */
export function drawObservations(
  illuminatedByTerritory: Record<string, number>,
  encountered: Set<string>,
  count = 3,
  crossSessionDepth?: Record<string, number>,
): Observation[] {
  // Compute base depth tier from total illumination (within this session)
  const totalIllum = Object.values(illuminatedByTerritory).reduce((a, b) => a + b, 0);
  const baseMaxDepth = totalIllum < 3 ? 0 : totalIllum < 10 ? 1 : 2;

  // Weight territories inversely to illumination
  const territories = Object.keys(OBSERVATION_POOL);
  const weights = territories.map(t => {
    const lit = illuminatedByTerritory[t] || 0;
    const total = OBSERVATION_POOL[t].length;
    // More weight to less explored territories
    return Math.max(0.1, 1 - (lit / Math.max(1, total)) * 0.6);
  });

  const result: Observation[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Weighted random territory selection
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    let tIdx = 0;
    for (let j = 0; j < weights.length; j++) {
      roll -= weights[j];
      if (roll <= 0) { tIdx = j; break; }
    }

    // Cross-session depth evolution: territories visited heavily across sessions
    // earn deeper observations even early in a new session
    const territoryKey = territories[tIdx];
    const crossDepth = crossSessionDepth?.[territoryKey] || 0;
    // 4+ cross-session inscriptions in a territory → unlock depth 1 immediately
    // 8+ → unlock depth 2 immediately
    const depthBoost = crossDepth >= 8 ? 2 : crossDepth >= 4 ? 1 : 0;
    const maxDepth = Math.min(2, Math.max(baseMaxDepth, depthBoost));

    // Filter by depth tier — only surface observations the user has earned
    const pool = OBSERVATION_POOL[territoryKey].filter(o => o.depth <= maxDepth);
    // Prefer unencountered observations
    const fresh = pool.filter(o => !encountered.has(o.id) && !used.has(o.id));
    const candidates = fresh.length > 0 ? fresh : pool.filter(o => !used.has(o.id));

    if (candidates.length === 0) continue;

    // Cross-session depth biases toward deeper observations when available
    // Deeper observations get higher weight in territories the user has frequented
    let pick: Observation;
    if (depthBoost > 0 && Math.random() < 0.6) {
      // 60% chance to prefer the deeper observations when depth boost is active
      const deep = candidates.filter(o => o.depth >= depthBoost);
      pick = deep.length > 0
        ? deep[Math.floor(Math.random() * deep.length)]
        : candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      pick = candidates[Math.floor(Math.random() * candidates.length)];
    }

    result.push(pick);
    used.add(pick.id);
  }

  return result;
}

// ═══════════════════════════════════════════════════
// THE WEAVE — Thoughts surfacing, not sentences
// ═══════════════════════════════════════════════════
//
// Structure:
//   OPENER (ambient text, not a chip)
//   → TIER 1: raw feeling words (chips)
//   → TIER 2: location/context words (chips)
//   → TIER 3: the question (chip that becomes the writing prompt)
//
// The opener rotates each session. It is the universe
// speaking first, the way the mind does — a half-formed
// observation. Then the user completes it by choosing words.
// The final word is always a question. The question opens
// the textarea. Writing IS illumination.

export const OPENERS = [
  'something is here',
  'a thought surfaces',
  'the mind reaches',
  'something wants attention',
  'a feeling arrives',
  'the body remembers',
  'notice what is present',
  'something stirs',
  'the quiet holds something',
  'there is a shape forming',
];

export interface WeaveChip {
  id: string;
  /** The floating word */
  text: string;
  /** Full thought fragment so far */
  fragment: string;
  /** Therapeutic lane for gravity */
  lane: string;
  /** Next tier of chips (if not terminal) */
  children?: WeaveChip[];
  /** The question that opens writing (terminal chips only) */
  question?: string;
}

/**
 * TIER 1: Raw words. No "I feel" prefix.
 * These are the feelings themselves, surfacing.
 */
export const WEAVE_ROOTS: WeaveChip[] = [
  {
    id: 'heavy', text: 'heavy', fragment: 'heavy', lane: 'body',
    children: [
      { id: 'heavy-chest', text: 'chest', fragment: 'heavy, in the chest', lane: 'body',
        children: [
          { id: 'heavy-chest-what', text: 'what lives there', fragment: 'heavy, in the chest', lane: 'body', question: 'What lives in your chest right now' },
          { id: 'heavy-chest-when', text: 'when did it arrive', fragment: 'heavy, in the chest', lane: 'origin', question: 'When did this weight first arrive' },
        ],
      },
      { id: 'heavy-someone', text: 'someone', fragment: 'heavy, about someone', lane: 'relationship',
        children: [
          { id: 'heavy-someone-who', text: 'what goes unsaid', fragment: 'heavy, about someone', lane: 'relationship', question: 'What goes unsaid between you' },
          { id: 'heavy-someone-pattern', text: 'is it familiar', fragment: 'heavy, about someone, and familiar', lane: 'pattern', question: 'Where have you felt this weight before' },
        ],
      },
      { id: 'heavy-everything', text: 'everything', fragment: 'heavy, about everything', lane: 'present',
        children: [
          { id: 'heavy-everything-one', text: 'one thread', fragment: 'heavy, but one thread carries most', lane: 'present', question: 'If there is one thread carrying most of the weight, what is it' },
          { id: 'heavy-everything-when', text: 'how long', fragment: 'heavy, about everything, for a while', lane: 'origin', question: 'How long has everything felt this heavy' },
        ],
      },
    ],
  },
  {
    id: 'familiar', text: 'familiar', fragment: 'familiar', lane: 'pattern',
    children: [
      { id: 'familiar-loop', text: 'a loop', fragment: 'something familiar, a loop', lane: 'pattern',
        children: [
          { id: 'familiar-loop-where', text: 'where it starts', fragment: 'a familiar loop', lane: 'pattern', question: 'Where does the loop usually begin' },
          { id: 'familiar-loop-body', text: 'the body knows', fragment: 'a familiar loop, the body knows', lane: 'body', question: 'What does your body do when the loop starts' },
        ],
      },
      { id: 'familiar-voice', text: 'a voice', fragment: 'something familiar, a voice', lane: 'mirror',
        children: [
          { id: 'familiar-voice-whose', text: 'whose voice', fragment: 'a familiar voice', lane: 'origin', question: 'Whose voice is it, if you listen closely' },
          { id: 'familiar-voice-says', text: 'what it says', fragment: 'a familiar voice', lane: 'mirror', question: 'What does the voice say when it arrives' },
        ],
      },
      { id: 'familiar-feeling', text: 'a feeling', fragment: 'a familiar feeling', lane: 'origin',
        children: [
          { id: 'familiar-feeling-age', text: 'how old is it', fragment: 'a familiar feeling', lane: 'origin', question: 'How old were you when this feeling first arrived' },
          { id: 'familiar-feeling-room', text: 'which room', fragment: 'a familiar feeling, from a room', lane: 'origin', question: 'What room does this feeling come from' },
        ],
      },
    ],
  },
  {
    id: 'distant', text: 'distant', fragment: 'distant', lane: 'mirror',
    children: [
      { id: 'distant-self', text: 'from myself', fragment: 'distant from myself', lane: 'mirror',
        children: [
          { id: 'distant-self-when', text: 'when it started', fragment: 'distant from myself', lane: 'mirror', question: 'When did you start feeling far from yourself' },
          { id: 'distant-self-closer', text: 'what brings me closer', fragment: 'distant, but something brings me closer', lane: 'desire', question: 'What brings you closer to yourself' },
        ],
      },
      { id: 'distant-them', text: 'from them', fragment: 'distant from them', lane: 'relationship',
        children: [
          { id: 'distant-them-who', text: 'who', fragment: 'distant from someone', lane: 'relationship', question: 'Who do you feel distant from' },
          { id: 'distant-them-protect', text: 'is it protection', fragment: 'distant, and maybe it is protection', lane: 'fear', question: 'What is the distance protecting' },
        ],
      },
    ],
  },
  {
    id: 'old', text: 'old', fragment: 'something old', lane: 'origin',
    children: [
      { id: 'old-returning', text: 'returning', fragment: 'something old, returning', lane: 'origin',
        children: [
          { id: 'old-returning-what', text: 'what is it', fragment: 'something old keeps returning', lane: 'origin', question: 'What is the old thing that keeps returning' },
          { id: 'old-returning-wants', text: 'what it wants', fragment: 'something old returns, wanting something', lane: 'origin', question: 'What does it want from you this time' },
        ],
      },
      { id: 'old-body', text: 'in the body', fragment: 'something old, in the body', lane: 'body',
        children: [
          { id: 'old-body-where', text: 'where exactly', fragment: 'something old lives in the body', lane: 'body', question: 'Where exactly in the body does it live' },
          { id: 'old-body-shape', text: 'what shape', fragment: 'something old, in the body, with a shape', lane: 'body', question: 'If it had a shape or color, what would it be' },
        ],
      },
    ],
  },
  {
    id: 'sharp', text: 'sharp', fragment: 'something sharp', lane: 'fear',
    children: [
      { id: 'sharp-fear', text: 'a fear', fragment: 'something sharp, a fear', lane: 'fear',
        children: [
          { id: 'sharp-fear-of', text: 'of what', fragment: 'a sharp fear', lane: 'fear', question: 'What is the fear, if you name it plainly' },
          { id: 'sharp-fear-true', text: 'is it true', fragment: 'a sharp fear, but is it true', lane: 'pattern', question: 'If you examine the fear closely, what part of it is real and what part is inherited' },
        ],
      },
      { id: 'sharp-decision', text: 'a decision', fragment: 'something sharp, a decision', lane: 'desire',
        children: [
          { id: 'sharp-decision-between', text: 'between what', fragment: 'a sharp decision', lane: 'desire', question: 'What are the two things the decision lives between' },
          { id: 'sharp-decision-body', text: 'the body knows', fragment: 'a sharp decision, and the body already knows', lane: 'body', question: 'If your body could answer for you, what would it choose' },
        ],
      },
    ],
  },
  {
    id: 'quiet', text: 'quiet', fragment: 'something quiet', lane: 'present',
    children: [
      { id: 'quiet-underneath', text: 'underneath', fragment: 'something quiet, underneath', lane: 'fear',
        children: [
          { id: 'quiet-underneath-what', text: 'what is it', fragment: 'something quiet underneath', lane: 'fear', question: 'What is the quiet thing underneath' },
          { id: 'quiet-underneath-look', text: 'can I look', fragment: 'something quiet, and I want to look', lane: 'mirror', question: 'What do you see when you look at it' },
        ],
      },
      { id: 'quiet-new', text: 'emerging', fragment: 'something quiet, emerging', lane: 'desire',
        children: [
          { id: 'quiet-new-what', text: 'what is forming', fragment: 'something quiet is forming', lane: 'desire', question: 'What do you sense is forming' },
          { id: 'quiet-new-space', text: 'it needs space', fragment: 'something quiet needs space', lane: 'mirror', question: 'What kind of space does it need from you' },
        ],
      },
    ],
  },
];

export function shuffleChips(arr: WeaveChip[]): WeaveChip[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════════════════════════
// SESSION-AWARE OPENERS
// ═══════════════════════════════════════════════════
//
// The universe notices when you return.
// First visit: gentle ambient text.
// Returning: acknowledgment.
// Deep: the sky knows your voice.

const OPENERS_FIRST = [
  'something is here',
  'a thought surfaces',
  'the quiet holds something',
  'a feeling arrives',
  'there is a shape forming',
];

const OPENERS_RETURNING = [
  'you returned',
  'the sky remembers',
  'something was waiting',
  'the stars held their light',
  'the body remembers',
  'something stirs',
];

const OPENERS_DEEP = [
  'this place knows your voice now',
  'the constellations are listening',
  'you have been here before. it shows',
  'the universe rearranges itself around your words',
  'the stars have been rearranging',
  'something is different this time',
];

// Territory-flavored openers for returning users (Pass 53)
// When the cosmos knows where you have been spending time,
// it greets you in that territory's language
const OPENERS_TERRITORY: Record<string, string[]> = {
  CALM: [
    'the stillness remembered you',
    'something in the quiet waited',
    'the breath is already here',
  ],
  ROOT: [
    'the ground beneath you held its shape',
    'the roots are still growing',
    'something old is ready to be seen again',
  ],
  BOND: [
    'the space between held steady',
    'someone is still in the room',
    'what connects is still connecting',
  ],
  WIRE: [
    'the pattern paused while you were away',
    'what you noticed last time is still visible',
    'awareness does not forget',
  ],
  SELF: [
    'the honest version of you waited',
    'something in you is continuing',
    'the conversation did not end',
  ],
  EDGE: [
    'the threshold held its light',
    'the doorway is still here',
    'what called you is still calling',
  ],
};

/**
 * Select an opener based on total illumination depth and territory affinity.
 * The universe speaks differently to someone arriving for the first time,
 * someone returning, and someone who has been spending time in a specific territory.
 */
export function selectOpener(totalEntries: number, dominantTerritory?: string | null): string {
  if (totalEntries === 0) {
    return OPENERS_FIRST[Math.floor(Math.random() * OPENERS_FIRST.length)];
  }
  if (totalEntries < 8) {
    // Mix first + returning (territory not yet established)
    const pool = [...OPENERS_FIRST, ...OPENERS_RETURNING];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  // Deep — 8+ entries: 40% chance of territory-flavored opener when dominant territory exists
  if (dominantTerritory && OPENERS_TERRITORY[dominantTerritory] && Math.random() < 0.4) {
    const pool = OPENERS_TERRITORY[dominantTerritory];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  const pool = [...OPENERS_RETURNING, ...OPENERS_DEEP];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ═══════════════════════════════════════════════════
// FIRST STAR EVER — unrepeatable ceremony texts
// ═══════════════════════════════════════════════════
//
// The first mark in the sky is singular.
// It cannot be re-encountered. It is not in any pool.
// It exists once, for one moment, then becomes memory.

// ═══════════════════════════════════════════════════
// STAR-TAP OPENINGS — territory-specific writing invitations
// ═══════════════════════════════════════════════════
// When a user taps an unlit star directly (bypassing the
// observation flow), the opening should still honor the
// territory's voice rather than being generic.

const STAR_TAP_OPENINGS: Record<string, string[]> = {
  CALM: [
    'What this star is holding for the body...',
    'The stillness this star belongs to...',
    'If this light could rest, what it would say...',
    'The breath this star has been keeping for you...',
    'Where this light meets the quiet place inside...',
  ],
  ROOT: [
    'What this star remembers from before...',
    'The ground this star is standing on...',
    'What this light inherited...',
    'The story this star has been listening to...',
    'What was carried here, to this exact point in the sky...',
  ],
  BOND: [
    'The connection this star holds between...',
    'Who this light reminds you of...',
    'What this star knows about the space between...',
    'The conversation this star has been waiting for...',
    'Who you are thinking of, here in this light...',
  ],
  WIRE: [
    'The pattern this star illuminates...',
    'What becomes visible in this light...',
    'The thought this star has been circling...',
    'What this light keeps returning to...',
    'The question this star has been turning over...',
  ],
  SELF: [
    'What this star recognizes in you...',
    'The version of you this light sees...',
    'What this star would name in you...',
    'The part of you this star has been watching...',
    'Who you are becoming, in this particular light...',
  ],
  EDGE: [
    'What this star is pointing toward...',
    'The threshold this light stands on...',
    'What becomes possible in this light...',
    'The direction this star has been facing...',
    'What this light sees on the other side...',
  ],
};

export function getStarTapOpening(schema: string): string {
  const pool = STAR_TAP_OPENINGS[schema] || STAR_TAP_OPENINGS.CALM;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const FIRST_STAR_STARDUST = 'The first mark in the sky. Everything that follows begins here.';
export const FIRST_STAR_RECOGNITION = 'You placed a word where there was silence. The universe shifted to hold it.';

// ═══════════════════════════════════════════════════
// PHASE E: AMBIENT FIELD — territory-aware atmospheric state
// ═══════════════════════════════════════════════════

export interface AmbientField {
  territory: string | null;
  color: string;
  warmth: number;
  depth: number;
  pulseRate: number;
  presence: number;
  phaseCharacter: 'still' | 'floating' | 'approaching' | 'drifting' | 'inscribing' | 'illuminating' | 'resting';
}

export function computeAmbientField(opts: {
  phase: string;
  nearestTerritory: string | null;
  stars: UniverseStar[];
  sessionInscriptions: number;
}): AmbientField {
  const { phase, nearestTerritory, stars, sessionInscriptions } = opts;
  const totalLit = stars.filter(s => s.illuminated).length;
  const depth = totalLit / Math.max(1, stars.length);
  const presence = Math.min(1, sessionInscriptions / 6);

  let territory: string | null = null;
  let color = '#8B9DC3';
  let warmth = 0.1 + depth * 0.2;

  if (nearestTerritory) {
    const con = CONSTELLATIONS.find(c => c.id === nearestTerritory);
    if (con) {
      territory = con.schema;
      color = con.color;
      const conLit = stars.filter(s => s.constellation === con.id && s.illuminated).length;
      const conProgress = conLit / con.starIds.length;
      warmth = 0.3 + conProgress * 0.5 + presence * 0.2;
    }
  }

  let phaseCharacter: AmbientField['phaseCharacter'] = 'still';
  if (phase === 'dwelling') phaseCharacter = 'floating';
  else if (phase === 'approaching') phaseCharacter = 'approaching';
  else if (phase === 'drifting' || phase === 'returning') phaseCharacter = 'drifting';
  else if (phase === 'inscribing' || phase === 'cartographing') phaseCharacter = 'inscribing';
  else if (phase === 'stardust' || phase === 'naming') phaseCharacter = 'illuminating';
  else if (phase === 'resting') phaseCharacter = 'resting';

  const pulseRates: Record<string, number> = {
    still: 0.08, floating: 0.12, approaching: 0.06,
    drifting: 0.1, inscribing: 0.04, illuminating: 0.15, resting: 0.03,
  };
  const pulseRate = pulseRates[phaseCharacter] || 0.1;

  return { territory, color, warmth, depth, pulseRate, presence, phaseCharacter };
}

// ═══════════════════════════════════════════════════
// PHASE E: PASSAGE SEARCH — recall past inscriptions
// ═══════════════════════════════════════════════════

export interface PassageResult {
  starId: string;
  starName: string;
  constellationId: string;
  constellationColor: string;
  schema: string;
  passage: string;
  relevance: number;
}

export function searchPassages(
  stars: UniverseStar[],
  query: string,
): PassageResult[] {
  if (!query || query.trim().length < 2) return [];
  const terms = query.toLowerCase().trim().split(/\s+/);

  const results: PassageResult[] = [];
  for (const star of stars) {
    if (!star.illuminated || !star.passage) continue;
    const lower = star.passage.toLowerCase();
    const matchCount = terms.filter(t => lower.includes(t)).length;
    if (matchCount === 0) continue;

    const con = CONSTELLATIONS.find(c => c.starIds.includes(star.id));
    results.push({
      starId: star.id,
      starName: star.name,
      constellationId: con?.id || '',
      constellationColor: con?.color || '#AAB0C0',
      schema: con?.schema || 'CALM',
      passage: star.passage,
      relevance: matchCount / terms.length,
    });
  }

  return results.sort((a, b) => b.relevance - a.relevance);
}

// ═══════════════════════════════════════════════════
// PHASE E: TERRITORY COMPLETION EVOLUTION
// ══════════════════════════════════════��════════════

export interface TerritoryEvolution {
  conId: string;
  stage: number;
  progress: number;
  complete: boolean;
  glowMul: number;
  lineStyle: 'dotted' | 'thin' | 'flowing' | 'pulsing';
  breathAmp: number;
}

export function computeTerritoryEvolution(
  conId: string,
  stars: UniverseStar[],
): TerritoryEvolution {
  const con = CONSTELLATIONS.find(c => c.id === conId);
  if (!con) return { conId, stage: 0, progress: 0, complete: false, glowMul: 1, lineStyle: 'dotted', breathAmp: 0.02 };

  const litCount = stars.filter(s => s.constellation === conId && s.illuminated).length;
  const total = con.starIds.length;
  const progress = litCount / total;
  const complete = litCount === total;

  let stage: number;
  let lineStyle: TerritoryEvolution['lineStyle'];
  let glowMul: number;
  let breathAmp: number;

  if (litCount === 0) {
    stage = 0; lineStyle = 'dotted'; glowMul = 1; breathAmp = 0.02;
  } else if (progress < 0.5) {
    stage = 1; lineStyle = 'thin'; glowMul = 1 + progress * 0.5; breathAmp = 0.03;
  } else if (!complete) {
    stage = 2; lineStyle = 'flowing'; glowMul = 1.3 + progress * 0.4; breathAmp = 0.05;
  } else {
    stage = 3; lineStyle = 'pulsing'; glowMul = 2.0; breathAmp = 0.08;
  }

  return { conId, stage, progress, complete, glowMul, lineStyle, breathAmp };
}

// ═══════════════════════════════════════════════════
// PHASE E: CROSS-TERRITORY THEMATIC RESONANCE
// ═══════════════════════════════════════════════════

const THEMATIC_CLUSTERS: { theme: string; keywords: string[]; territories: string[] }[] = [
  { theme: 'holding', keywords: ['carry', 'hold', 'weight', 'heavy', 'burden', 'grip', 'carrying'], territories: ['CALM', 'BOND', 'ROOT'] },
  { theme: 'voice', keywords: ['voice', 'say', 'speak', 'word', 'told', 'silence', 'silent', 'unsaid'], territories: ['WIRE', 'SELF', 'BOND'] },
  { theme: 'room', keywords: ['room', 'space', 'place', 'house', 'home', 'door', 'wall'], territories: ['ROOT', 'SELF', 'EDGE'] },
  { theme: 'body', keywords: ['body', 'chest', 'breath', 'stomach', 'throat', 'tight', 'tense'], territories: ['CALM', 'ROOT', 'WIRE'] },
  { theme: 'time', keywords: ['remember', 'memory', 'child', 'young', 'before', 'ago', 'past', 'old'], territories: ['ROOT', 'SELF', 'WIRE'] },
  { theme: 'boundary', keywords: ['boundary', 'edge', 'limit', 'protect', 'safe', 'trust', 'permission'], territories: ['BOND', 'EDGE', 'SELF'] },
  { theme: 'movement', keywords: ['move', 'step', 'forward', 'change', 'leave', 'stay', 'return', 'begin'], territories: ['EDGE', 'SELF', 'CALM'] },
  { theme: 'pattern', keywords: ['pattern', 'repeat', 'loop', 'again', 'always', 'every time', 'familiar'], territories: ['WIRE', 'ROOT', 'BOND'] },
];

export interface ThematicResonance {
  theme: string;
  resonatingTerritories: string[];
  strength: number;
  bridgeText: string;
}

const RESONANCE_BRIDGES: Record<string, string[]> = {
  holding: [
    'What is held in the body is also held between people. The weight knows both rooms.',
    'The carrying was learned in one room and practiced in every room since.',
  ],
  voice: [
    'The voice that speaks inside you has crossed many constellations. It began in one. It settled in others.',
    'What went unsaid in one room became a pattern in every room that followed.',
  ],
  room: [
    'The rooms you describe are one room. The architecture is the same. Only the furniture changes.',
    'There is a doorway between these constellations. You have been standing in it.',
  ],
  body: [
    'The body holds what the mind distributes across stories. In the body, all the stories converge.',
    'Where the chest tightens is where the story lives. The body does not sort by name.',
  ],
  time: [
    'Memory does not respect boundaries. What was then is now. What was there is here.',
    'The past speaks in every constellation. It is the water table beneath every landscape.',
  ],
  boundary: [
    'The edge you are standing at is also a boundary you are protecting. They are the same line.',
    'What you guard and what you approach share a border. The self lives at the intersection.',
  ],
  movement: [
    'To steady yourself and to move forward are not opposites. They are the same gesture at different speeds.',
    'The threshold and the stillness are conversing. What you need is already in motion.',
  ],
  pattern: [
    'The loop passes through more than one constellation. It was born in one. It echoes in others.',
    'What repeats in one place echoes in another. The pattern is the bridge between them.',
  ],
};

export function detectResonances(stars: UniverseStar[]): ThematicResonance[] {
  const resonances: ThematicResonance[] = [];

  const passagesByTerritory: Record<string, string[]> = {};
  for (const star of stars) {
    if (!star.illuminated || !star.passage) continue;
    const con = CONSTELLATIONS.find(c => c.starIds.includes(star.id));
    if (!con) continue;
    if (!passagesByTerritory[con.schema]) passagesByTerritory[con.schema] = [];
    passagesByTerritory[con.schema].push(star.passage.toLowerCase());
  }

  for (const cluster of THEMATIC_CLUSTERS) {
    const matchingTerritories: string[] = [];
    let totalStrength = 0;

    for (const territory of cluster.territories) {
      const passages = passagesByTerritory[territory];
      if (!passages) continue;
      const joined = passages.join(' ');
      const hits = cluster.keywords.filter(kw => joined.includes(kw)).length;
      if (hits > 0) {
        matchingTerritories.push(territory);
        totalStrength += hits;
      }
    }

    if (matchingTerritories.length >= 2) {
      const bridges = RESONANCE_BRIDGES[cluster.theme] || [];
      const bridgeText = bridges[Math.floor(Math.random() * bridges.length)] || '';
      resonances.push({
        theme: cluster.theme,
        resonatingTerritories: matchingTerritories,
        strength: totalStrength,
        bridgeText,
      });
    }
  }

  return resonances.sort((a, b) => b.strength - a.strength);
}

// ═══════════════════════════════════════════════════
// PHASE F ITEM 21: CONSTELLATION LORE FRAGMENTS
// ═══════════════════════════════════════════════════

export interface LoreFragment {
  id: string;
  conId: string;
  text: string;
  stage: number;
}

export const CONSTELLATION_LORE: LoreFragment[] = [
  { id: 'lyra-lore-0', conId: 'lyra', stage: 0,
    text: 'Vega was the first star ever photographed. Some lights wait to be seen.' },
  { id: 'lyra-lore-1', conId: 'lyra', stage: 1,
    text: 'Orpheus played Lyra so gently that rivers paused to listen. Stillness is not silence. It is music the body already knows.' },
  { id: 'lyra-lore-2', conId: 'lyra', stage: 2,
    text: 'The ancients placed the harp in the sky not to be played, but to be remembered. Some instruments are carried, not held.' },
  { id: 'orion-lore-0', conId: 'orion', stage: 0,
    text: 'Orion rises in winter. The coldest skies hold the brightest stories.' },
  { id: 'orion-lore-1', conId: 'orion', stage: 1,
    text: 'Betelgeuse is nearing the end of its life. Even the oldest stars are still becoming.' },
  { id: 'orion-lore-2', conId: 'orion', stage: 2,
    text: 'Every culture on Earth named this hunter. The origin story is never singular. It belongs to everyone who looks up.' },
  { id: 'gemini-lore-0', conId: 'gemini', stage: 0,
    text: 'Castor and Pollux chose to share immortality rather than be parted. Connection is a form of choosing.' },
  { id: 'gemini-lore-1', conId: 'gemini', stage: 1,
    text: 'One twin was mortal, one divine. They loved each other anyway. Difference is not distance.' },
  { id: 'gemini-lore-2', conId: 'gemini', stage: 2,
    text: 'The twins alternate between sky and underworld. To be present for another is to take turns holding the weight.' },
  { id: 'cass-lore-0', conId: 'cassiopeia', stage: 0,
    text: 'Cassiopeia circles the pole star without ever reaching it. Familiar orbits are not the same as standing still.' },
  { id: 'cass-lore-1', conId: 'cassiopeia', stage: 1,
    text: 'The queen was chained to her throne as consequence. But consequences observed become information, not punishment.' },
  { id: 'cass-lore-2', conId: 'cassiopeia', stage: 2,
    text: 'Her W shape is the most recognized pattern in the northern sky. We see patterns because we are pattern. Seeing them is the first freedom.' },
  { id: 'leo-lore-0', conId: 'leo', stage: 0,
    text: 'Regulus means "little king." Sovereignty begins small. It begins with naming what is yours.' },
  { id: 'leo-lore-1', conId: 'leo', stage: 1,
    text: 'The lion Hercules could not defeat was placed in the sky to remind him: some strengths are not conquered. They are recognized.' },
  { id: 'leo-lore-2', conId: 'leo', stage: 2,
    text: 'Leo faces west, toward the setting. The self that is becoming faces both what is arriving and what is leaving.' },
  { id: 'aquila-lore-0', conId: 'aquila', stage: 0,
    text: 'Altair crosses the summer triangle. Thresholds are where three paths converge, not where one ends.' },
  { id: 'aquila-lore-1', conId: 'aquila', stage: 1,
    text: 'The eagle carried lightning for the gods. To hold something powerful is to choose what it touches.' },
  { id: 'aquila-lore-2', conId: 'aquila', stage: 2,
    text: 'In Japanese myth, Altair is the cowherd who crosses the Milky Way once a year for love. Desire is patient enough to wait for the bridge to form.' },
];

export function getLoreForTerritory(
  conId: string,
  stars: UniverseStar[],
): LoreFragment | null {
  const con = CONSTELLATIONS.find(c => c.id === conId);
  if (!con) return null;
  const litCount = stars.filter(s => s.constellation === conId && s.illuminated).length;
  const total = con.starIds.length;
  const progress = litCount / total;
  let stage = 0;
  if (progress >= 1) stage = 2;
  else if (progress >= 0.5) stage = 1;
  const candidates = CONSTELLATION_LORE.filter(l => l.conId === conId && l.stage <= stage);
  return candidates.length > 0 ? candidates[candidates.length - 1] : null;
}

// ═══════════════════════════════════════════════════
// PHASE F ITEM 22: PASSAGE EXPORT
// ═══════════════════════════════════════════════════

export interface GatheredPassages {
  title: string;
  date: string;
  constellations: {
    name: string;
    personalName?: string;
    schema: string;
    color: string;
    passages: { starName: string; text: string }[];
  }[];
  totalStars: number;
  illuminated: number;
}

export function gatherPassages(
  stars: UniverseStar[],
  constellationNames: Record<string, string>,
): GatheredPassages {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const constellations: GatheredPassages['constellations'] = [];
  for (const con of CONSTELLATIONS) {
    const conStars = stars.filter(s => s.constellation === con.id && s.illuminated && s.passage);
    if (conStars.length === 0) continue;
    constellations.push({
      name: con.name,
      personalName: constellationNames[con.id],
      schema: con.schema,
      color: con.color,
      passages: conStars.map(s => ({ starName: s.name, text: s.passage })),
    });
  }
  const universeName = constellationNames.__universe__;
  return {
    title: universeName || 'gathered passages',
    date: dateStr,
    constellations,
    totalStars: stars.length,
    illuminated: stars.filter(s => s.illuminated).length,
  };
}

export function formatPassagesAsText(gathered: GatheredPassages): string {
  const lines: string[] = [];
  lines.push(gathered.title.toUpperCase());
  lines.push(gathered.date);
  lines.push(`${gathered.illuminated} of ${gathered.totalStars} stars illuminated`);
  lines.push('');
  for (const con of gathered.constellations) {
    const header = con.personalName ? `${con.personalName} (${con.name})` : con.name;
    lines.push(`\u2500\u2500\u2500 ${header} \u2500\u2500\u2500`);
    lines.push('');
    for (const passage of con.passages) {
      lines.push(`  ${passage.starName}`);
      lines.push(`  ${passage.text}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════
// PHASE F ITEM 23: GUIDED PATHWAYS
// ═══════════════════════════════════════════════════

export interface GuidedPathway {
  conId: string;
  conName: string;
  schema: string;
  color: string;
  whisper: string;
  gravity: number;
}

const PATHWAY_WHISPERS: Record<string, string[]> = {
  lyra: [
    'Lyra is listening.',
    'Stillness has something to say.',
    'The breath waits.',
  ],
  orion: [
    'The roots are shallow here.',
    'Something old stirs beneath.',
    'Where you began is waiting.',
  ],
  gemini: [
    'The space between is unvisited.',
    'Someone is in the room.',
    'Connection is asking.',
  ],
  cassiopeia: [
    'The pattern is circling.',
    'Something repeats, unobserved.',
    'The loop has a question.',
  ],
  leo: [
    'The self is quiet here.',
    'Who you are becoming has not spoken.',
    'There is an unnamed thing.',
  ],
  aquila: [
    'A threshold waits.',
    'Desire has not been named.',
    'The edge is closer than it appears.',
  ],
};

export function detectPathways(stars: UniverseStar[]): GuidedPathway[] {
  const explorations: { con: typeof CONSTELLATIONS[0]; ratio: number }[] = [];
  for (const con of CONSTELLATIONS) {
    const lit = stars.filter(s => s.constellation === con.id && s.illuminated).length;
    const total = con.starIds.length;
    explorations.push({ con, ratio: lit / total });
  }
  const totalLit = stars.filter(s => s.illuminated).length;
  if (totalLit < 2) return [];
  const avgRatio = explorations.reduce((sum, e) => sum + e.ratio, 0) / explorations.length;
  const underexplored = explorations
    .filter(e => e.ratio < avgRatio * 0.6 && e.ratio < 0.5)
    .sort((a, b) => a.ratio - b.ratio);
  if (underexplored.length === 0) return [];
  return underexplored.slice(0, 2).map(({ con, ratio }) => {
    const whispers = PATHWAY_WHISPERS[con.id] || ['Something awaits.'];
    const whisper = whispers[Math.floor(Math.random() * whispers.length)];
    return { conId: con.id, conName: con.name, schema: con.schema, color: con.color, whisper, gravity: 1 - ratio };
  });
}

// ═══════════════════════════════════════════════════
// PHASE F ITEM 24: SEASONAL COSMIC EVENTS
// ═══════════════════════════════════════════════════

export interface CosmicSeason {
  name: string;
  intensity: number;
  effect: 'solstice_glow' | 'equinox_aurora' | 'meteor_shower' | 'new_moon' | 'full_moon' | 'none';
  whisper: string;
}

export function getCosmicSeason(): CosmicSeason {
  const now = new Date();
  const month = now.getMonth();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const lunarCycle = 29.53058867;
  const refNewMoon = new Date(2000, 0, 6).getTime();
  const daysSinceRef = (now.getTime() - refNewMoon) / 86400000;
  const lunarPhase = ((daysSinceRef % lunarCycle) + lunarCycle) % lunarCycle / lunarCycle;

  const summerSolstice = 172;
  const winterSolstice = 355;
  const distToSolstice = Math.min(
    Math.abs(dayOfYear - summerSolstice),
    Math.abs(dayOfYear - winterSolstice),
    Math.abs(dayOfYear - winterSolstice + 365),
  );
  const solsticeIntensity = Math.max(0, 1 - distToSolstice / 15);

  const springEquinox = 79;
  const autumnEquinox = 265;
  const distToEquinox = Math.min(
    Math.abs(dayOfYear - springEquinox),
    Math.abs(dayOfYear - autumnEquinox),
  );
  const equinoxIntensity = Math.max(0, 1 - distToEquinox / 12);

  const perseids = 224;
  const leonids = 321;
  const distToMeteor = Math.min(
    Math.abs(dayOfYear - perseids),
    Math.abs(dayOfYear - leonids),
  );
  const meteorIntensity = Math.max(0, 1 - distToMeteor / 10);

  const newMoonIntensity = lunarPhase < 0.1 || lunarPhase > 0.9
    ? 1 - Math.min(lunarPhase, 1 - lunarPhase) / 0.1 : 0;
  const fullMoonIntensity = Math.abs(lunarPhase - 0.5) < 0.1
    ? 1 - Math.abs(lunarPhase - 0.5) / 0.1 : 0;

  const events: { effect: CosmicSeason['effect']; intensity: number; name: string; whisper: string }[] = [
    { effect: 'solstice_glow', intensity: solsticeIntensity,
      name: month >= 3 && month <= 8 ? 'summer solstice' : 'winter solstice',
      whisper: month >= 3 && month <= 8
        ? 'the longest light. the sky remembers warmth.'
        : 'the longest dark. the stars are closer tonight.',
    },
    { effect: 'equinox_aurora', intensity: equinoxIntensity,
      name: month >= 1 && month <= 5 ? 'spring equinox' : 'autumn equinox',
      whisper: month >= 1 && month <= 5
        ? 'balance point. light and dark in equal measure.'
        : 'the scales tip. what was light gives way.',
    },
    { effect: 'meteor_shower', intensity: meteorIntensity,
      name: Math.abs(dayOfYear - perseids) < Math.abs(dayOfYear - leonids) ? 'perseid rain' : 'leonid rain',
      whisper: 'the sky is shedding. old light making room for new.',
    },
    { effect: 'new_moon', intensity: newMoonIntensity,
      name: 'new moon',
      whisper: 'the moon is dark. the stars are everything.',
    },
    { effect: 'full_moon', intensity: fullMoonIntensity,
      name: 'full moon',
      whisper: 'the moon is full. the universe softens.',
    },
  ];

  const strongest = events.reduce((a, b) => a.intensity > b.intensity ? a : b);
  if (strongest.intensity < 0.05) {
    return { name: '', intensity: 0, effect: 'none', whisper: '' };
  }
  return strongest;
}

// ═══════════════════════════════════════════════════
// PHASE G ITEM 25: CONSTELLATION COMPLETION WHISPERS
// ═══════════════════════════════════════════════════
//
// When a territory is fully illuminated and the camera
// gazes upon it, the universe speaks completion poems.
// Not congratulations. Recognition of the journey.

export interface CompletionWhisper {
  id: string;
  conId: string;
  text: string;
  /** A deeper line that unfolds after the first */
  continuation: string;
}

export const COMPLETION_WHISPERS: CompletionWhisper[] = [
  // Lyra / CALM
  {
    id: 'lyra-cw-0', conId: 'lyra',
    text: 'Every star in Lyra holds a breath you gave it.',
    continuation: 'The harp is not silent. It is playing in a register only the body hears.',
  },
  {
    id: 'lyra-cw-1', conId: 'lyra',
    text: 'Stillness was never empty here. You proved that.',
    continuation: 'What you placed in the quiet will keep speaking.',
  },
  // Orion / ROOT
  {
    id: 'orion-cw-0', conId: 'orion',
    text: 'The hunter holds your origins now. They are witnessed.',
    continuation: 'What was buried is not gone. It is planted. And it grew into these words.',
  },
  {
    id: 'orion-cw-1', conId: 'orion',
    text: 'Every room you named is no longer a room you carry alone.',
    continuation: 'The stars remember what the rooms contained. That is enough.',
  },
  // Gemini / BOND
  {
    id: 'gemini-cw-0', conId: 'gemini',
    text: 'The space between is fully illuminated now.',
    continuation: 'Not the distance. The bridge. You lit every span of it.',
  },
  {
    id: 'gemini-cw-1', conId: 'gemini',
    text: 'Castor and Pollux share what you placed here.',
    continuation: 'Connection does not diminish when it is spoken. It clarifies.',
  },
  // Cassiopeia / WIRE
  {
    id: 'cass-cw-0', conId: 'cassiopeia',
    text: 'The pattern is fully visible now. Every loop, named.',
    continuation: 'What is seen cannot run the same way. You changed its velocity.',
  },
  {
    id: 'cass-cw-1', conId: 'cassiopeia',
    text: 'The queen\u2019s throne holds your observations.',
    continuation: 'Not as consequence. As evidence that you are awake.',
  },
  // Leo / SELF
  {
    id: 'leo-cw-0', conId: 'leo',
    text: 'Every version of you that wrote here is still present.',
    continuation: 'The lion does not forget its voices. It carries them forward.',
  },
  {
    id: 'leo-cw-1', conId: 'leo',
    text: 'Identity moved here. Not because you forced it.',
    continuation: 'Because you allowed it. And that is the braver act.',
  },
  // Aquila / EDGE
  {
    id: 'aquila-cw-0', conId: 'aquila',
    text: 'Every threshold you named is a doorway you can return to.',
    continuation: 'The eagle does not forget where it has landed. Neither will you.',
  },
  {
    id: 'aquila-cw-1', conId: 'aquila',
    text: 'Desire, decision, hesitation. All illuminated.',
    continuation: 'The edge is not an ending. It is a beginning that was waiting for your words.',
  },
];

export function getCompletionWhisper(
  conId: string,
  stars: UniverseStar[],
): CompletionWhisper | null {
  const con = CONSTELLATIONS.find(c => c.id === conId);
  if (!con) return null;
  const allLit = con.starIds.every(sid => stars.find(s => s.id === sid)?.illuminated);
  if (!allLit) return null;
  const candidates = COMPLETION_WHISPERS.filter(w => w.conId === conId);
  if (candidates.length === 0) return null;
  // Deterministic but session-varying selection
  const idx = Math.floor(Date.now() / 60000) % candidates.length;
  return candidates[idx];
}

// ═══════════════════════════════════════════════════
// PHASE G ITEM 26: WRITING MOMENTUM
// ══════════════════��════════════════════════════════
//
// After multiple inscriptions in a session, the ceremony
// pacing subtly accelerates. The universe recognizes
// that the writer is in flow.

export interface MomentumState {
  /** 0 = first inscription, 1 = warming, 2 = flowing */
  tier: number;
  /** Multiplier for ceremony delay (lower = faster) */
  paceMultiplier: number;
  /** Whether the writer has entered flow state */
  inFlow: boolean;
  /** Subtle text that acknowledges the momentum */
  flowWhisper: string;
}

const FLOW_WHISPERS = [
  'the words are arriving faster now',
  'the stars are listening closely',
  'the pace has shifted. the universe follows',
  'something has opened. the writing knows',
  'the cosmos leans closer. keep going',
];

export function computeMomentum(sessionInscriptions: number, crossSessionCount?: number): MomentumState {
  // Cross-session trust multiplier: the cosmos trusts your rhythm after many visits
  // 6+ visits → 0.85x; 10+ visits → 0.75x (stacks with within-session momentum)
  const trustMultiplier = (crossSessionCount || 0) >= 10 ? 0.75
    : (crossSessionCount || 0) >= 6 ? 0.85
    : 1.0;

  if (sessionInscriptions < 2) {
    return { tier: 0, paceMultiplier: 1.0 * trustMultiplier, inFlow: false, flowWhisper: '' };
  }
  if (sessionInscriptions < 4) {
    return {
      tier: 1,
      paceMultiplier: 0.82 * trustMultiplier,
      inFlow: false,
      flowWhisper: '',
    };
  }
  // 4+ inscriptions: flow state
  const whisperIdx = (sessionInscriptions - 4) % FLOW_WHISPERS.length;
  return {
    tier: 2,
    paceMultiplier: 0.65 * trustMultiplier,
    inFlow: true,
    flowWhisper: FLOW_WHISPERS[whisperIdx],
  };
}

// ═══════════════════════════════════════════════════
// PHASE G ITEM 28: TERRITORY BREATH VARIATION
// ═══════════════════════════════════════════════════
//
// Each constellation breathes at its own rate.
// Recently inscribed territories pulse warmly.
// Territories with unlocked depth have a beckoning quality.

export interface TerritoryBreath {
  conId: string;
  /** Base breathing frequency (radians per second) */
  frequency: number;
  /** Amplitude of the breath (0..1) */
  amplitude: number;
  /** Whether this territory has a beckoning pulse (unlocked but unvisited) */
  beckoning: boolean;
  /** Warmth multiplier for recently inscribed territories */
  warmthBoost: number;
}

export function computeTerritoryBreaths(
  stars: UniverseStar[],
  visitedThisSession: Set<string>,
  sessionInscriptions: number,
): TerritoryBreath[] {
  const totalLit = stars.filter(s => s.illuminated).length;
  const maxDepth = totalLit < 3 ? 0 : totalLit < 10 ? 1 : 2;

  return CONSTELLATIONS.map(con => {
    const litCount = stars.filter(s => s.constellation === con.id && s.illuminated).length;
    const total = con.starIds.length;
    const progress = litCount / total;
    const visited = visitedThisSession.has(con.id);
    const complete = litCount === total;

    // Base frequency: unique per constellation using golden ratio offsets
    const baseFreq = 0.06 + (CONSTELLATIONS.indexOf(con) * 0.618) % 0.08;

    // Completed territories breathe slower and deeper
    // Recently visited pulse more actively
    // Unvisited but unlocked territories have a gentle beckoning
    let frequency = baseFreq;
    let amplitude = 0.3 + progress * 0.3;
    let warmthBoost = 1.0;
    let beckoning = false;

    if (complete) {
      frequency = baseFreq * 0.7; // slower, deeper
      amplitude = 0.6 + Math.sin(Date.now() * 0.0001) * 0.1;
    }

    if (visited && sessionInscriptions > 0) {
      warmthBoost = 1.3 + Math.min(0.4, sessionInscriptions * 0.08);
      frequency *= 1.15; // slightly faster when recently active
    }

    // Beckoning: territory has depth-unlocked observations but few lit stars
    if (!visited && litCount < total && litCount > 0 && maxDepth >= 1 && progress < 0.3) {
      beckoning = true;
      amplitude *= 1.2;
    }

    return { conId: con.id, frequency, amplitude, beckoning, warmthBoost };
  });
}

// ═══════════════════════════════════════════════════
// PHASE H ITEM 29: PASSAGE LUMINANCE
// ═══════════════════════════════════════════════════
//
// Stars glow proportionally to the depth of their
// inscriptions. A brief phrase creates a gentle gleam;
// a full paragraph creates a warm radiance. The universe
// reflects the weight of what was offered.

export interface PassageLuminance {
  starId: string;
  /** 0..1 normalized luminance based on passage length */
  luminance: number;
  /** Whether this is a particularly deep passage (50+ words) */
  deep: boolean;
}

export function computePassageLuminance(stars: UniverseStar[]): PassageLuminance[] {
  const illuminated = stars.filter(s => s.illuminated && s.passage);
  if (illuminated.length === 0) return [];

  // Find the longest passage for normalization
  const maxLen = Math.max(1, ...illuminated.map(s => s.passage.length));

  return illuminated.map(s => {
    const len = s.passage.length;
    const wordCount = s.passage.split(/\s+/).filter(Boolean).length;
    // Logarithmic curve: short passages still glow, long passages radiate
    const raw = Math.log(1 + len) / Math.log(1 + maxLen);
    const luminance = 0.2 + raw * 0.8; // floor at 0.2 so every star shines
    return {
      starId: s.id,
      luminance,
      deep: wordCount >= 50,
    };
  });
}

// ═══════════════════════════════════════════════════
// PHASE H ITEM 30: TERRITORY ECHO FRAGMENTS
// ═══════════════════════════════════════════════════
//
// When the camera gazes near a constellation with 2+
// illuminated stars, fragments of the user's own passages
// drift as whispers near neighboring stars. Their own
// words, echoing across the territory.

export interface EchoFragment {
  id: string;
  conId: string;
  /** The fragment of the user's writing */
  text: string;
  /** Screen-space offset hint (0..1) for positioning near a star */
  anchorStarId: string;
}

export function getEchoFragments(
  conId: string,
  stars: UniverseStar[],
): EchoFragment[] {
  const con = CONSTELLATIONS.find(c => c.id === conId);
  if (!con) return [];

  const litStars = stars.filter(s => s.constellation === conId && s.illuminated && s.passage);
  if (litStars.length < 2) return [];

  // Extract 3 to 7 word fragments from each passage
  const fragments: EchoFragment[] = [];
  for (const star of litStars) {
    const words = star.passage.split(/\s+/).filter(Boolean);
    if (words.length < 3) continue;

    // Take a slice from the middle of the passage (the heart of the thought)
    const midStart = Math.max(0, Math.floor(words.length / 2) - 2);
    const fragLen = Math.min(words.length - midStart, 3 + Math.floor(Math.random() * 4));
    const frag = words.slice(midStart, midStart + fragLen).join(' ');

    // Anchor to a neighboring star (not the source) so the echo drifts near siblings
    const neighbors = litStars.filter(s => s.id !== star.id);
    if (neighbors.length === 0) continue;
    const anchor = neighbors[fragments.length % neighbors.length];

    fragments.push({
      id: `echo-${star.id}-${anchor.id}`,
      conId,
      text: frag,
      anchorStarId: anchor.id,
    });
  }

  // Cap at 3 fragments to avoid visual noise
  return fragments.slice(0, 3);
}

// ═══════════════════════════════════════════════════
// PHASE H ITEM 31: INSCRIPTION AFTERGLOW
// ═══════════════════════════════════════════════════
//
// The most recently inscribed star retains a warm,
// fading aureole for the duration of the session.
// This is tracked by the surface; here we provide
// the afterglow rendering parameters.

export interface AfterglowState {
  starId: string;
  /** Time since inscription in seconds (computed externally) */
  age: number;
  /** Glow intensity 0..1 (fades over session) */
  intensity: number;
  /** Constellation color for the glow */
  color: string;
}

export function computeAfterglow(
  recentStarIds: string[],
  stars: UniverseStar[],
  sessionStartTime: number,
): AfterglowState[] {
  const now = Date.now();
  const glows: AfterglowState[] = [];

  // Each recently inscribed star gets an afterglow
  // The most recent is brightest; earlier ones are dimmer
  for (let i = 0; i < recentStarIds.length; i++) {
    const starId = recentStarIds[i];
    const star = stars.find(s => s.id === starId);
    if (!star) continue;

    const con = CONSTELLATIONS.find(c => c.starIds.includes(starId));
    if (!con) continue;

    // Recency: most recent = index (length-1), earliest = index 0
    const recency = i / Math.max(1, recentStarIds.length - 1);
    const age = (now - sessionStartTime) / 1000;

    // Afterglow fades over ~20 minutes but never fully disappears in session
    const timeFade = Math.max(0.15, 1 - age / 1200);
    const recencyBoost = 0.3 + recency * 0.7; // most recent = 1.0

    glows.push({
      starId,
      age,
      intensity: timeFade * recencyBoost,
      color: con.color,
    });
  }

  return glows;
}

// ═══════════════════════════════════════════════════
// PHASE H ITEM 32: CAMERA HOME GRAVITY
// ═══════════════════════════════════════════════════
//
// The camera softly gravitates toward territories
// where the user has written most, creating a subtle
// "home" orientation that shifts as the universe fills.

export interface HomeGravity {
  /** The constellation ID with highest gravity */
  homeConId: string | null;
  /** Target yaw/pitch toward home (radians) */
  targetYaw: number;
  targetPitch: number;
  /** Strength of gravitational pull (0..1) */
  strength: number;
}

export function computeHomeGravity(stars: UniverseStar[]): HomeGravity {
  // Count passages per constellation
  let maxCount = 0;
  let homeConId: string | null = null;

  for (const con of CONSTELLATIONS) {
    const count = stars.filter(s => s.constellation === con.id && s.illuminated).length;
    if (count > maxCount) {
      maxCount = count;
      homeConId = con.id;
    }
  }

  if (!homeConId || maxCount < 2) {
    return { homeConId: null, targetYaw: 0, targetPitch: 0, strength: 0 };
  }

  const con = CONSTELLATIONS.find(c => c.id === homeConId)!;
  const aim = aimCamera(con.center);

  // Strength proportional to how dominant this constellation is
  const totalLit = stars.filter(s => s.illuminated).length;
  const ratio = maxCount / Math.max(1, totalLit);
  // Only apply gravity when one territory clearly dominates (> 30%)
  const strength = ratio > 0.3 ? Math.min(0.15, (ratio - 0.3) * 0.5) : 0;

  return {
    homeConId,
    targetYaw: aim.yaw,
    targetPitch: aim.pitch,
    strength,
  };
}

// ═══════════════════════════════════════════════════
// PHASE I ITEM 33: INSCRIPTION RIPPLE
// ═══════════════════════════════════════════════════
//
// When a star is illuminated, a visual shockwave expands
// outward through the cosmos. The universe physically
// responds to each inscription. Not decoration. Recognition.

export interface InscriptionRipple {
  /** Center star ID */
  starId: string;
  /** Timestamp of ripple birth (seconds, matches canvas t) */
  birth: number;
  /** Constellation color for the ripple */
  color: string;
  /** Max radius in screen pixels */
  maxRadius: number;
  /** Duration in seconds */
  duration: number;
}

export function createInscriptionRipple(
  starId: string,
  stars: UniverseStar[],
): InscriptionRipple | null {
  const star = stars.find(s => s.id === starId);
  if (!star) return null;
  const con = CONSTELLATIONS.find(c => c.starIds.includes(starId));
  if (!con) return null;

  return {
    starId,
    birth: Date.now() * 0.001,
    color: con.color,
    maxRadius: 250 + Math.random() * 100,
    duration: 2.5 + Math.random() * 0.5,
  };
}

// ═══════════════════════════════════════════════════
// PHASE I ITEM 34: TERRITORY VOICE EVOLUTION
// ═══════════════════════════════════════════════════
//
// The universe speaks differently to someone arriving
// in a territory for the first time versus returning
// versus having deeply explored. The observations don't
// change, but the atmospheric opener adapts.

export interface TerritoryVoiceState {
  conId: string;
  /** 0 = first encounter, 1 = returning, 2 = deepening, 3 = intimate */
  voiceTier: number;
  /** Ambient text that hovers near the territory boundary */
  atmosphericWhisper: string;
}

const TERRITORY_VOICE_FIRST: Record<string, string[]> = {
  lyra: ['stillness is waiting here', 'the harp listens'],
  orion: ['something old is near', 'the ground remembers'],
  gemini: ['the space between opens', 'there is room here'],
  cassiopeia: ['a pattern surfaces', 'the shape is forming'],
  leo: ['something unnamed stirs', 'the mirror is clear here'],
  aquila: ['a threshold is close', 'the air changes here'],
};

const TERRITORY_VOICE_RETURNING: Record<string, string[]> = {
  lyra: ['the stillness recognizes you', 'the breath has been waiting'],
  orion: ['the roots remember your words', 'what was planted is growing'],
  gemini: ['the bridge recalls your crossing', 'the space between knows you now'],
  cassiopeia: ['the pattern pauses when you arrive', 'the loop noticed you returned'],
  leo: ['something in you recognized itself here before', 'the unnamed thing moved closer'],
  aquila: ['the threshold shifted since you last stood here', 'the edge remembers your approach'],
};

const TERRITORY_VOICE_DEEP: Record<string, string[]> = {
  lyra: ['the harp plays in a register only you can hear now', 'this constellation breathes with your rhythm'],
  orion: ['the roots have woven your words into the soil', 'the origin speaks your language now'],
  gemini: ['the bridge you built here is permanent', 'connection lives in what you placed between the stars'],
  cassiopeia: ['every loop you named has changed its orbit', 'the pattern evolved because you watched it'],
  leo: ['the versions of you that wrote here are all present', 'identity has a home now. you built it here'],
  aquila: ['every threshold you crossed left a doorway open', 'desire was named so many times here it became direction'],
};

export function computeTerritoryVoice(
  conId: string,
  stars: UniverseStar[],
  visitedThisSession: boolean,
): TerritoryVoiceState {
  const con = CONSTELLATIONS.find(c => c.id === conId);
  if (!con) return { conId, voiceTier: 0, atmosphericWhisper: '' };

  const litCount = stars.filter(s => s.constellation === conId && s.illuminated).length;
  const total = con.starIds.length;
  const progress = litCount / total;

  let voiceTier = 0;
  if (progress >= 0.6 || litCount >= 4) voiceTier = 3;
  else if (litCount >= 2) voiceTier = 2;
  else if (litCount >= 1 || visitedThisSession) voiceTier = 1;

  const pool = voiceTier >= 3
    ? (TERRITORY_VOICE_DEEP[conId] || [])
    : voiceTier >= 1
      ? (TERRITORY_VOICE_RETURNING[conId] || [])
      : (TERRITORY_VOICE_FIRST[conId] || []);

  const whisper = pool.length > 0
    ? pool[Math.floor((Date.now() / 30000) % pool.length)]
    : '';

  return { conId, voiceTier, atmosphericWhisper: whisper };
}

// ═══════════════════════════════════════════════════
// PHASE I ITEM 35: STAR PROXIMITY CONSTELLATIONS
// ═══════════════════════════════════════════════════
//
// When zoomed close to an illuminated star, its stardust
// particles form a private micro-constellation. A personal
// galaxy within the galaxy. Visible only on approach.

export interface MicroConstellation {
  starId: string;
  /** Positions relative to the star center (in screen px offsets) */
  nodes: { x: number; y: number; size: number; alpha: number }[];
  /** Connections between nodes */
  connections: [number, number][];
}

export function computeMicroConstellation(
  starId: string,
  stars: UniverseStar[],
): MicroConstellation | null {
  const star = stars.find(s => s.id === starId);
  if (!star || !star.illuminated || star.stardust.length < 2) return null;

  const count = Math.min(star.stardust.length * 2, 8);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const nodes: MicroConstellation['nodes'] = [];

  for (let i = 0; i < count; i++) {
    const theta = goldenAngle * i + (starId.charCodeAt(0) || 0) * 0.1;
    const r = 8 + (i / count) * 14 + (i % 2) * 4;
    nodes.push({
      x: Math.cos(theta) * r,
      y: Math.sin(theta) * r,
      size: 0.4 + Math.random() * 0.4,
      alpha: 0.15 + (1 - i / count) * 0.15,
    });
  }

  // Connect adjacent nodes in sequence, plus one cross-link
  const connections: [number, number][] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push([i, i + 1]);
  }
  if (nodes.length >= 4) {
    connections.push([0, Math.floor(nodes.length / 2)]);
  }

  return { starId, nodes, connections };
}

// ═══════════════════════════════════════════════════
// PHASE I ITEM 36: PASSAGE TIDE
// ═══════════════════════════════════════════════════
//
// Stars in a visited constellation pulse in sequence
// based on the order they were illuminated, creating
// a living wave that traces the user's journey through
// the territory. A breathing timeline.

export interface PassageTide {
  conId: string;
  /** Star IDs in order of illumination (earliest first) */
  sequence: string[];
  /** Wave speed (radians per second) */
  speed: number;
}

export function computePassageTides(
  stars: UniverseStar[],
  sessionStarIds: string[],
): PassageTide[] {
  const tides: PassageTide[] = [];

  for (const con of CONSTELLATIONS) {
    const litStars = con.starIds.filter(sid => {
      const s = stars.find(st => st.id === sid);
      return s && s.illuminated;
    });
    if (litStars.length < 2) continue;

    // Order by session illumination sequence, then by constellation order
    const sessionOrder = [...litStars].sort((a, b) => {
      const aIdx = sessionStarIds.indexOf(a);
      const bIdx = sessionStarIds.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return -1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });

    tides.push({
      conId: con.id,
      sequence: sessionOrder,
      speed: 0.08 + litStars.length * 0.01,
    });
  }

  return tides;
}

// ═══════════════════════════════════════════════════
// PHASE J ITEM 37: STARDUST MEMORY SHIMMER
// ═══════════════════════════════════════════════════
//
// When the camera approaches a star that has gathered
// stardust, the stardust texts briefly shimmer visible
// near the star before dissolving. The universe remembers
// what was gathered. Not replayed. Glimpsed.

export interface StardustMemory {
  starId: string;
  /** The stardust texts attached to this star */
  texts: string[];
  /** Constellation color */
  color: string;
  /** 0..1 visibility based on camera proximity */
  visibility: number;
}

export function computeStardustMemories(
  stars: UniverseStar[],
  cameraZoom: number,
): StardustMemory[] {
  // Only visible when zoomed close
  if (cameraZoom > 450) return [];

  const memories: StardustMemory[] = [];
  const zoomFactor = Math.max(0, 1 - (cameraZoom - 200) / 250);

  for (const star of stars) {
    if (!star.illuminated || star.stardust.length === 0) continue;
    const con = CONSTELLATIONS.find(c => c.starIds.includes(star.id));
    if (!con) continue;

    memories.push({
      starId: star.id,
      texts: star.stardust,
      color: con.color,
      visibility: zoomFactor * Math.min(1, star.stardust.length * 0.5),
    });
  }

  return memories;
}

// ═══════════════════════════════════════════════════
// PHASE J ITEM 38: TERRITORY HARMONIC RESONANCE
// ═══════════════════════════════════════════════════
//
// When two or more completed constellations are both
// visible on screen, their breathing patterns slowly
// synchronize. Visual consonance. The universe finds
// harmony in what was fully explored.

export interface HarmonicPair {
  conIdA: string;
  conIdB: string;
  colorA: string;
  colorB: string;
  /** 0..1 how synchronized their breathing is */
  coherence: number;
  /** Shared frequency when fully coherent */
  sharedFrequency: number;
}

export function computeHarmonicResonance(
  stars: UniverseStar[],
): HarmonicPair[] {
  const completed = CONSTELLATIONS.filter(c =>
    c.starIds.every(sid => stars.find(s => s.id === sid)?.illuminated)
  );

  if (completed.length < 2) return [];

  const pairs: HarmonicPair[] = [];
  for (let i = 0; i < completed.length; i++) {
    for (let j = i + 1; j < completed.length; j++) {
      const a = completed[i];
      const b = completed[j];

      const pairSeed = a.id.charCodeAt(0) + b.id.charCodeAt(0);
      const timeFactor = (Date.now() / 60000) % 10 / 10;
      const coherence = Math.min(1, 0.3 + timeFactor * 0.7 + Math.sin(pairSeed) * 0.1);

      const freqA = 0.06 + (CONSTELLATIONS.indexOf(a) * 0.618) % 0.08;
      const freqB = 0.06 + (CONSTELLATIONS.indexOf(b) * 0.618) % 0.08;
      const sharedFrequency = (freqA + freqB) / 2;

      pairs.push({
        conIdA: a.id,
        conIdB: b.id,
        colorA: a.color,
        colorB: b.color,
        coherence,
        sharedFrequency,
      });
    }
  }

  return pairs;
}

// ═══════════════════════════════════════════��═══════
// PHASE J ITEM 39: INSCRIPTION DEPTH WHISPER
// ═══════════════════════════════════════════════════
//
// When a user writes a particularly deep passage
// (50+ words), the universe responds with a special
// acknowledgment that exists outside the regular
// recognition pool. Rarer. More intimate. The cosmos
// leaning closer.

export interface DepthWhisper {
  text: string;
  continuation: string;
  threshold: number;
}

const DEPTH_WHISPERS_50: { text: string; continuation: string }[] = [
  {
    text: 'Something opened that does not usually open.',
    continuation: 'The universe held still to receive it.',
  },
  {
    text: 'That was not a surface thought. That came from beneath.',
    continuation: 'What lives beneath is now above. It is lighter for having been spoken.',
  },
  {
    text: 'The words poured. The cosmos caught every one.',
    continuation: 'Nothing was lost. Nothing was wasted.',
  },
  {
    text: 'You went further than the opening invited.',
    continuation: 'The opening is grateful. It did not know there was this much to hold.',
  },
];

const DEPTH_WHISPERS_100: { text: string; continuation: string }[] = [
  {
    text: 'This was not writing. This was archaeology.',
    continuation: 'What you unearthed will not return to the ground. It has been named.',
  },
  {
    text: 'The universe rearranged itself around what you just said.',
    continuation: 'Not because it was perfect. Because it was true.',
  },
  {
    text: 'Something was witnessed here that required this many words.',
    continuation: 'The length was not excess. It was thoroughness. The self needed every word.',
  },
];

export function getDepthWhisper(wordCount: number): DepthWhisper | null {
  if (wordCount < 50) return null;

  if (wordCount >= 100) {
    const pool = DEPTH_WHISPERS_100;
    const pick = pool[Math.floor((Date.now() / 30000) % pool.length)];
    return { ...pick, threshold: 100 };
  }

  const pool = DEPTH_WHISPERS_50;
  const pick = pool[Math.floor((Date.now() / 30000) % pool.length)];
  return { ...pick, threshold: 50 };
}

// ═══════════════════════════════════════════════════
// PHASE J ITEM 40: CONSTELLATION GRAVITY WELLS
// ═══════════════════════════════════════════════════
//
// Stars in more-explored territories exert a subtle
// visual gravity. Stardust particles and nearby motes
// drift toward them slightly, creating a sense of mass
// and importance that grows with inscription count.
// The universe has weight where words have been placed.

export interface GravityWell {
  starId: string;
  pos: Vec3;
  strength: number;
  color: string;
  radius: number;
}

export function computeGravityWells(
  stars: UniverseStar[],
): GravityWell[] {
  const wells: GravityWell[] = [];

  for (const star of stars) {
    if (!star.illuminated) continue;

    const con = CONSTELLATIONS.find(c => c.starIds.includes(star.id));
    if (!con) continue;

    const wordCount = star.passage ? star.passage.split(/\s+/).filter(Boolean).length : 0;
    const dustCount = star.stardust.length;
    const passageWeight = Math.min(1, wordCount / 80);
    const dustWeight = Math.min(1, dustCount / 4);
    const strength = (passageWeight * 0.6 + dustWeight * 0.4) * 0.8;

    if (strength < 0.1) continue;

    wells.push({
      starId: star.id,
      pos: star.pos,
      strength,
      color: con.color,
      radius: 30 + strength * 40,
    });
  }

  return wells;
}

// ═══════════════════════════════════════════════════
// PHASE K ITEM 41: PASSAGE WEAVING
// ═══════════════════════════════════════════════════
//
// The universe surfaces thematic connections between
// the user's own passages across different territories.
// Not keyword matching. Linguistic echoes. The cosmos
// noticing that what was said in one place reverberates
// in another.

export interface PassageWeave {
  starIdA: string;
  starNameA: string;
  conIdA: string;
  colorA: string;
  starIdB: string;
  starNameB: string;
  conIdB: string;
  colorB: string;
  sharedFragments: string[];
  strength: number;
  weavingText: string;
}

const WEAVING_TEXTS: string[] = [
  'These words found each other across the sky.',
  'What was spoken in one territory echoed in another.',
  'The same thought, arriving from two directions.',
  'Your voice carries between constellations.',
  'What lives in one place also lives in another. You named it both times.',
  'The constellations are listening to each other through your words.',
  'A thread runs between these stars that only you could have woven.',
  'Two passages. One rhythm. The cosmos noticed.',
];

export function detectPassageWeaves(stars: UniverseStar[]): PassageWeave[] {
  const weaves: PassageWeave[] = [];
  const illuminated = stars.filter(s => s.illuminated && s.passage && s.passage.length > 20);
  if (illuminated.length < 3) return [];

  const stopwords = new Set(['that', 'this', 'with', 'from', 'have', 'been', 'were', 'what', 'when', 'where', 'which', 'their', 'there', 'about', 'would', 'could', 'should', 'because', 'through', 'before', 'after', 'between', 'something', 'everything', 'nothing', 'myself', 'yourself']);

  const extractWords = (text: string): Set<string> => {
    const words = text.toLowerCase().split(/\s+/).filter(w =>
      w.length >= 4 && !stopwords.has(w)
    );
    return new Set(words);
  };

  for (let i = 0; i < illuminated.length; i++) {
    for (let j = i + 1; j < illuminated.length; j++) {
      const a = illuminated[i];
      const b = illuminated[j];
      if (a.constellation === b.constellation) continue;

      const wordsA = extractWords(a.passage);
      const wordsB = extractWords(b.passage);
      const shared: string[] = [];
      for (const word of wordsA) {
        if (wordsB.has(word)) shared.push(word);
      }
      if (shared.length < 2) continue;

      const conA = CONSTELLATIONS.find(c => c.starIds.includes(a.id));
      const conB = CONSTELLATIONS.find(c => c.starIds.includes(b.id));
      if (!conA || !conB) continue;

      const strength = Math.min(1, shared.length / 5);
      const textIdx = (a.id.charCodeAt(0) + b.id.charCodeAt(0)) % WEAVING_TEXTS.length;

      weaves.push({
        starIdA: a.id, starNameA: a.name, conIdA: conA.id, colorA: conA.color,
        starIdB: b.id, starNameB: b.name, conIdB: conB.id, colorB: conB.color,
        sharedFragments: shared.slice(0, 5), strength,
        weavingText: WEAVING_TEXTS[textIdx],
      });
    }
  }
  return weaves.sort((a, b) => b.strength - a.strength).slice(0, 3);
}

// ═══════════════════════════════════════════════════
// PHASE K ITEM 42: TERRITORY COMPLETION POETRY
// ═══════════════════════════════════════════════════
//
// When a territory is fully explored, the universe
// composes a verse from fragments of the user's own
// inscriptions. Not generated. Gathered. A mirror
// made of the writer's own words.

export interface CompletionPoem {
  conId: string;
  conName: string;
  color: string;
  lines: string[];
  coda: string;
}

const POEM_CODAS: Record<string, string[]> = {
  lyra: [
    'The harp holds what you placed here. It plays without being asked.',
    'Stillness was never empty. You proved that, word by word.',
  ],
  orion: [
    'The hunter carries your origins now. They are safe in the stars.',
    'What was buried was not lost. It was planted. And it grew into these words.',
  ],
  gemini: [
    'The twins share what you named. The bridge is made of your language.',
    'The space between was never empty. You filled it with honesty.',
  ],
  cassiopeia: [
    'Every loop you traced became a line. The pattern is poetry now.',
    'The throne holds your observations. Not as judgment. As witness.',
  ],
  leo: [
    'The lion speaks in your voice now. Every version is present.',
    'Identity was never fixed. You showed that, passage by passage.',
  ],
  aquila: [
    'The eagle carries your thresholds. Every edge became a beginning.',
    'What you risked was naming. The return was the naming itself.',
  ],
};

export function composeCompletionPoem(
  conId: string,
  stars: UniverseStar[],
): CompletionPoem | null {
  const con = CONSTELLATIONS.find(c => c.id === conId);
  if (!con) return null;

  const conStars = stars.filter(s => s.constellation === conId && s.illuminated && s.passage);
  if (conStars.length < con.starIds.length) return null;

  const fragments: string[] = [];
  for (const star of conStars) {
    const words = star.passage.split(/\s+/).filter(Boolean);
    if (words.length < 3) continue;
    if (words.length <= 6) {
      fragments.push(words.join(' '));
    } else {
      const midStart = Math.max(0, Math.floor(words.length * 0.3));
      const fragLen = Math.min(words.length - midStart, 4 + Math.floor(Math.random() * 3));
      fragments.push(words.slice(midStart, midStart + fragLen).join(' '));
    }
  }
  if (fragments.length < 2) return null;

  const lines = fragments.slice(0, Math.min(4, fragments.length));
  const codas = POEM_CODAS[conId] || ['What was written here will not fade. The stars remember.'];
  const codaIdx = Math.floor((Date.now() / 60000) % codas.length);

  return { conId, conName: con.name, color: con.color, lines, coda: codas[codaIdx] };
}

// ═══════════════════════════════════════════════════
// PHASE K ITEM 43: AMBIENT SOUND FREQUENCY HOOKS
// ═══════════════════════════════════════════════════
//
// Each territory has a sonic character. These hooks
// define the frequency, waveform, and harmonic series
// that would shape the ambient layer. Data only for now.
// When the sound layer arrives, these become audible.

export interface TerritoryFrequency {
  conId: string;
  schema: string;
  baseFreqHz: number;
  noteName: string;
  waveform: 'sine' | 'triangle' | 'sawtooth' | 'square';
  harmonics: number[];
  envelope: 'sustained' | 'breathing' | 'plucked' | 'bowed';
  reverbDepth: number;
  intervalName: string;
}

export const TERRITORY_FREQUENCIES: TerritoryFrequency[] = [
  { conId: 'lyra', schema: 'CALM', baseFreqHz: 261.63, noteName: 'C4', waveform: 'sine', harmonics: [1, 2, 3, 5], envelope: 'sustained', reverbDepth: 0.8, intervalName: 'unison' },
  { conId: 'orion', schema: 'ROOT', baseFreqHz: 196.00, noteName: 'G3', waveform: 'triangle', harmonics: [1, 2, 4], envelope: 'bowed', reverbDepth: 0.7, intervalName: 'perfect fifth below' },
  { conId: 'gemini', schema: 'BOND', baseFreqHz: 329.63, noteName: 'E4', waveform: 'sine', harmonics: [1, 3, 5], envelope: 'breathing', reverbDepth: 0.75, intervalName: 'major third' },
  { conId: 'cassiopeia', schema: 'WIRE', baseFreqHz: 293.66, noteName: 'D4', waveform: 'triangle', harmonics: [1, 2, 3, 4, 6], envelope: 'plucked', reverbDepth: 0.5, intervalName: 'major second' },
  { conId: 'leo', schema: 'SELF', baseFreqHz: 349.23, noteName: 'F4', waveform: 'sawtooth', harmonics: [1, 2, 4, 5], envelope: 'bowed', reverbDepth: 0.65, intervalName: 'perfect fourth' },
  { conId: 'aquila', schema: 'EDGE', baseFreqHz: 392.00, noteName: 'G4', waveform: 'triangle', harmonics: [1, 3, 5, 7], envelope: 'breathing', reverbDepth: 0.6, intervalName: 'perfect fifth' },
];

export function getTerritoryFrequency(conId: string): TerritoryFrequency | null {
  return TERRITORY_FREQUENCIES.find(f => f.conId === conId) || null;
}

export interface HarmonicConsonance {
  conIdA: string;
  conIdB: string;
  ratio: number;
  intervalName: string;
  consonance: number;
  sharedDroneHz: number;
}

const CONSONANCE_RATIOS: { ratio: number; name: string; consonance: number }[] = [
  { ratio: 1.0, name: 'unison', consonance: 1.0 },
  { ratio: 0.5, name: 'octave', consonance: 0.95 },
  { ratio: 2/3, name: 'perfect fifth', consonance: 0.9 },
  { ratio: 3/4, name: 'perfect fourth', consonance: 0.85 },
  { ratio: 4/5, name: 'major third', consonance: 0.8 },
  { ratio: 5/6, name: 'minor third', consonance: 0.7 },
  { ratio: 8/9, name: 'major second', consonance: 0.5 },
  { ratio: 15/16, name: 'minor second', consonance: 0.3 },
];

export function computeHarmonicConsonance(
  conIdA: string,
  conIdB: string,
): HarmonicConsonance | null {
  const freqA = TERRITORY_FREQUENCIES.find(f => f.conId === conIdA);
  const freqB = TERRITORY_FREQUENCIES.find(f => f.conId === conIdB);
  if (!freqA || !freqB) return null;

  const lower = Math.min(freqA.baseFreqHz, freqB.baseFreqHz);
  const higher = Math.max(freqA.baseFreqHz, freqB.baseFreqHz);
  const ratio = lower / higher;

  let best = CONSONANCE_RATIOS[0];
  let bestDist = Infinity;
  for (const cr of CONSONANCE_RATIOS) {
    const dist = Math.abs(ratio - cr.ratio);
    if (dist < bestDist) { bestDist = dist; best = cr; }
  }

  const adjustedConsonance = best.consonance * Math.max(0.5, 1 - bestDist * 5);

  return {
    conIdA, conIdB, ratio,
    intervalName: best.name,
    consonance: adjustedConsonance,
    sharedDroneHz: (freqA.baseFreqHz + freqB.baseFreqHz) / 2,
  };
}

// ════════════════════════════════════════��══════════
// PHASE K ITEM 44: CAMERA CHOREOGRAPHY PRESETS
// ═══════════════════════════════════════════════════
//
// Guided fly-throughs that trace the user's journey
// through their illuminated constellations.

export interface CameraWaypoint {
  yaw: number;
  pitch: number;
  zoom: number;
  travelTime: number;
  pauseTime: number;
  conId: string | null;
  conName: string;
  color: string;
}

export interface CameraChoreography {
  id: string;
  name: string;
  totalDuration: number;
  waypoints: CameraWaypoint[];
}

export function composeCameraJourney(
  stars: UniverseStar[],
  constellationNames: Record<string, string>,
): CameraChoreography | null {
  const explored: { con: typeof CONSTELLATIONS[0]; litCount: number }[] = [];
  for (const con of CONSTELLATIONS) {
    const litCount = stars.filter(s => s.constellation === con.id && s.illuminated).length;
    if (litCount > 0) explored.push({ con, litCount });
  }
  if (explored.length < 2) return null;

  explored.sort((a, b) => b.litCount - a.litCount);

  const waypoints: CameraWaypoint[] = [];
  waypoints.push({
    yaw: 0, pitch: 0.15, zoom: 800,
    travelTime: 0, pauseTime: 2,
    conId: null, conName: 'your universe', color: '#FFE088',
  });

  for (const { con } of explored) {
    const aim = aimCamera(con.center);
    const displayName = constellationNames[con.id] || con.name;
    waypoints.push({
      yaw: aim.yaw, pitch: aim.pitch, zoom: 380,
      travelTime: 3.5, pauseTime: 3,
      conId: con.id, conName: displayName, color: con.color,
    });
  }

  waypoints.push({
    yaw: 0, pitch: 0.15, zoom: 600,
    travelTime: 4, pauseTime: 2,
    conId: null, conName: '', color: '#FFE088',
  });

  const totalDuration = waypoints.reduce((sum, wp) => sum + wp.travelTime + wp.pauseTime, 0);
  return { id: `journey-${Date.now()}`, name: 'journey through the constellations', totalDuration, waypoints };
}

// ═══════════════════════════════════════════════════
// CHOREOGRAPHY VARIATIONS
// ═══════════════════════════════════════════════════
//
// Three modes of traversal:
//   sequential — visits constellations by inscription count (default journey)
//   spiral     — orbits outward in a widening gyre
//   resonance  — follows harmonic consonance, strongest bonds first

export type ChoreographyMode = 'sequential' | 'spiral' | 'resonance';

export const CHOREOGRAPHY_MODES: { mode: ChoreographyMode; label: string; description: string }[] = [
  { mode: 'sequential', label: 'journey', description: 'visiting each territory you have explored' },
  { mode: 'spiral', label: 'spiral', description: 'orbiting outward through the constellations' },
  { mode: 'resonance', label: 'resonance', description: 'following the harmonics between constellations' },
];

export function composeSpiralJourney(
  stars: UniverseStar[],
  constellationNames: Record<string, string>,
): CameraChoreography | null {
  const explored: { con: typeof CONSTELLATIONS[0]; litCount: number }[] = [];
  for (const con of CONSTELLATIONS) {
    const litCount = stars.filter(s => s.constellation === con.id && s.illuminated).length;
    if (litCount > 0) explored.push({ con, litCount });
  }
  if (explored.length < 2) return null;

  // Sort by angular position (yaw) to create a spatial spiral
  explored.sort((a, b) => {
    const aimA = aimCamera(a.con.center);
    const aimB = aimCamera(b.con.center);
    return aimA.yaw - aimB.yaw;
  });

  const waypoints: CameraWaypoint[] = [];
  waypoints.push({
    yaw: 0, pitch: 0.6, zoom: 1000,
    travelTime: 0, pauseTime: 2.5,
    conId: null, conName: 'the spiral begins', color: '#FFE088',
  });

  for (let i = 0; i < explored.length; i++) {
    const { con } = explored[i];
    const aim = aimCamera(con.center);
    const progress = i / Math.max(1, explored.length - 1);
    const zoom = 600 - progress * 250;
    const pitchOffset = 0.3 * (1 - progress);
    const displayName = constellationNames[con.id] || con.name;
    waypoints.push({
      yaw: aim.yaw + (1 - progress) * 0.15,
      pitch: aim.pitch + pitchOffset,
      zoom,
      travelTime: 3 + (1 - progress) * 1.5,
      pauseTime: 2.5,
      conId: con.id, conName: displayName, color: con.color,
    });
  }

  waypoints.push({
    yaw: 0, pitch: 0.1, zoom: 550,
    travelTime: 4.5, pauseTime: 2,
    conId: null, conName: '', color: '#FFE088',
  });

  const totalDuration = waypoints.reduce((sum, wp) => sum + wp.travelTime + wp.pauseTime, 0);
  return { id: `spiral-${Date.now()}`, name: 'spiral through the constellations', totalDuration, waypoints };
}

export function composeResonanceJourney(
  stars: UniverseStar[],
  constellationNames: Record<string, string>,
): CameraChoreography | null {
  const explored: { con: typeof CONSTELLATIONS[0]; litCount: number }[] = [];
  for (const con of CONSTELLATIONS) {
    const litCount = stars.filter(s => s.constellation === con.id && s.illuminated).length;
    if (litCount > 0) explored.push({ con, litCount });
  }
  if (explored.length < 2) return null;

  const pairs: { conA: typeof CONSTELLATIONS[0]; conB: typeof CONSTELLATIONS[0]; consonance: number }[] = [];
  for (let i = 0; i < explored.length; i++) {
    for (let j = i + 1; j < explored.length; j++) {
      const hc = computeHarmonicConsonance(explored[i].con.id, explored[j].con.id);
      if (hc) pairs.push({ conA: explored[i].con, conB: explored[j].con, consonance: hc.consonance });
    }
  }
  pairs.sort((a, b) => b.consonance - a.consonance);

  const visited = new Set<string>();
  const order: typeof CONSTELLATIONS[0][] = [];

  if (pairs.length > 0) {
    order.push(pairs[0].conA);
    order.push(pairs[0].conB);
    visited.add(pairs[0].conA.id);
    visited.add(pairs[0].conB.id);
  }

  while (order.length < explored.length) {
    let bestPair: typeof pairs[0] | null = null;
    for (const p of pairs) {
      const aVisited = visited.has(p.conA.id);
      const bVisited = visited.has(p.conB.id);
      if (aVisited && !bVisited) { bestPair = { ...p, conA: p.conB, conB: p.conA, consonance: p.consonance }; break; }
      if (bVisited && !aVisited) { bestPair = p; break; }
    }
    if (!bestPair) {
      for (const e of explored) {
        if (!visited.has(e.con.id)) { order.push(e.con); visited.add(e.con.id); }
      }
      break;
    }
    order.push(bestPair.conA);
    visited.add(bestPair.conA.id);
  }

  const waypoints: CameraWaypoint[] = [];
  waypoints.push({
    yaw: 0, pitch: 0.15, zoom: 750,
    travelTime: 0, pauseTime: 2,
    conId: null, conName: 'following the harmonics', color: '#FFE088',
  });

  for (let i = 0; i < order.length; i++) {
    const con = order[i];
    const aim = aimCamera(con.center);
    const displayName = constellationNames[con.id] || con.name;

    if (i > 0) {
      const prevCon = order[i - 1];
      const midYaw = (aimCamera(prevCon.center).yaw + aim.yaw) / 2;
      const midPitch = (aimCamera(prevCon.center).pitch + aim.pitch) / 2;
      waypoints.push({
        yaw: midYaw, pitch: midPitch, zoom: 500,
        travelTime: 1.5, pauseTime: 0.8,
        conId: null, conName: '', color: '#FFE088',
      });
    }

    waypoints.push({
      yaw: aim.yaw, pitch: aim.pitch, zoom: 360,
      travelTime: 3, pauseTime: 3.5,
      conId: con.id, conName: displayName, color: con.color,
    });
  }

  waypoints.push({
    yaw: 0, pitch: 0.15, zoom: 600,
    travelTime: 4, pauseTime: 2,
    conId: null, conName: '', color: '#FFE088',
  });

  const totalDuration = waypoints.reduce((sum, wp) => sum + wp.travelTime + wp.pauseTime, 0);
  return { id: `resonance-${Date.now()}`, name: 'resonance path', totalDuration, waypoints };
}

export function composeJourney(
  mode: ChoreographyMode,
  stars: UniverseStar[],
  constellationNames: Record<string, string>,
): CameraChoreography | null {
  switch (mode) {
    case 'spiral': return composeSpiralJourney(stars, constellationNames);
    case 'resonance': return composeResonanceJourney(stars, constellationNames);
    default: return composeCameraJourney(stars, constellationNames);
  }
}

// ═══════════════════════════════════════════════════
// PASSAGE WEAVE GLOW — shared word positions
// ═══════════════════════════════════════════════════

export interface WeaveGlowWord {
  word: string;
  starId: string;
  conColor: string;
  positionInPassage: number;
}

export function computeWeaveGlowWords(weave: PassageWeave, stars: UniverseStar[]): WeaveGlowWord[] {
  const result: WeaveGlowWord[] = [];
  const starA = stars.find(s => s.id === weave.starIdA);
  const starB = stars.find(s => s.id === weave.starIdB);

  for (const fragment of weave.sharedFragments) {
    if (starA && starA.passage) {
      const words = starA.passage.toLowerCase().split(/\s+/);
      const idx = words.findIndex(w => w.includes(fragment.toLowerCase()));
      const posInPassage = idx >= 0 ? idx / Math.max(1, words.length - 1) : 0.5;
      result.push({ word: fragment, starId: starA.id, conColor: weave.colorA, positionInPassage: posInPassage });
    }
    if (starB && starB.passage) {
      const words = starB.passage.toLowerCase().split(/\s+/);
      const idx = words.findIndex(w => w.includes(fragment.toLowerCase()));
      const posInPassage = idx >= 0 ? idx / Math.max(1, words.length - 1) : 0.5;
      result.push({ word: fragment, starId: starB.id, conColor: weave.colorB, positionInPassage: posInPassage });
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════
// PHASE K: TERRITORY-SPECIFIC DEPTH WHISPERS
// ═══════════════════════════════════════════════════

const TERRITORY_DEPTH_WHISPERS_50: Record<string, { text: string; continuation: string }[]> = {
  CALM: [
    { text: 'The body spoke at length. The breath made room for every word.', continuation: 'What was held in the body is now held in the stars.' },
    { text: 'Stillness poured out of you. It was never empty.', continuation: 'The quiet you described is louder than you knew.' },
  ],
  ROOT: [
    { text: 'The ground opened and the words came from beneath it.', continuation: 'What was buried wanted light. You gave it light.' },
    { text: 'That came from a room you had not entered in a long time.', continuation: 'The room is different now. Your presence changed it.' },
  ],
  BOND: [
    { text: 'The space between held more than you expected.', continuation: 'What lives between people is vast. You just mapped part of it.' },
    { text: 'Connection spoke through you at length. It had been waiting.', continuation: 'What was said changes the bridge. It is stronger now.' },
  ],
  WIRE: [
    { text: 'The pattern unraveled as you wrote. Thread by thread.', continuation: 'What repeats does not own you. You just proved that.' },
    { text: 'Something that ran in the background just moved to the surface.', continuation: 'Visibility is the first act of change. You chose it.' },
  ],
  SELF: [
    { text: 'A version of you just spoke that has never spoken before.', continuation: 'The unfamiliar voice is not wrong. It is new. And it is yours.' },
    { text: 'Identity shifted as the words arrived. You felt it.', continuation: 'Who you are becoming just took shape in that passage.' },
  ],
  EDGE: [
    { text: 'The threshold you described is closer than it was when you started writing.', continuation: 'Naming the edge changes its distance. You are nearer now.' },
    { text: 'Desire spoke without apology. That is rare. That is courage.', continuation: 'What you want is no longer a secret. The stars hold it.' },
  ],
};

const TERRITORY_DEPTH_WHISPERS_100: Record<string, { text: string; continuation: string }[]> = {
  CALM: [
    { text: 'The body had a novel inside it. You wrote the first chapter.', continuation: 'What the body holds is not a sentence. It is a landscape. And you just traversed it.' },
  ],
  ROOT: [
    { text: 'You went back further than the opening invited. The origin story expanded.', continuation: 'Not because you forced it. Because honesty has its own momentum.' },
  ],
  BOND: [
    { text: 'The space between was a country. You just drew its borders honestly.', continuation: 'Connection at this depth is cartography. You mapped what most people only feel.' },
  ],
  WIRE: [
    { text: 'The pattern had layers you had not seen until now. You unfolded every one.', continuation: 'What was habitual is now archaeological. The dig was worth it.' },
  ],
  SELF: [
    { text: 'The self that wrote this passage is not the self that began it.', continuation: 'Transformation happened mid-sentence. The stars recorded every word.' },
  ],
  EDGE: [
    { text: 'You described the threshold with such thoroughness that it became a doorway.', continuation: 'Naming something completely is the same as walking through it.' },
  ],
};

export function getDepthWhisperForTerritory(
  wordCount: number,
  schema?: string,
): DepthWhisper | null {
  if (wordCount < 50) return null;

  if (wordCount >= 100) {
    if (schema) {
      const pool = TERRITORY_DEPTH_WHISPERS_100[schema];
      if (pool && pool.length > 0) {
        const pick = pool[Math.floor((Date.now() / 30000) % pool.length)];
        return { ...pick, threshold: 100 };
      }
    }
    return getDepthWhisper(wordCount);
  }

  if (schema) {
    const pool = TERRITORY_DEPTH_WHISPERS_50[schema];
    if (pool && pool.length > 0) {
      const pick = pool[Math.floor((Date.now() / 30000) % pool.length)];
      return { ...pick, threshold: 50 };
    }
  }
  return getDepthWhisper(wordCount);
}

// ═══════════════════════════════════════════════════
// PHASE Q/S: SPATIAL GURU WHISPERS + RESONANCE
// ═══════════════════════════════════════════════════
//
// Wisdom fragments that float through the cosmos after
// inscriptions. Not responses. Not evaluations. Spacious
// observations from the void itself, inspired by the
// quiet knowing of Ram Dass and the playful paradox
// of Alan Watts. They arise during the returning drift,
// like thoughts that come after meditation, unbidden.
//
// Phase S extends this with:
//   WHISPER MEMORY — never repeat a fragment within a session
//   PASSAGE RESONANCE — sense themes in the inscription and
//     bias toward whispers that echo what was written, without
//     ever quoting or evaluating the user's words
//   JOURNEY ECHO — after visiting multiple territories, whispers
//     occasionally acknowledge the breadth of exploration
//   CADENCE — early sessions prefer shorter fragments, deeper
//     sessions allow longer, more layered observations
//
// Phase T extends further:
//   WHISPER THREADING — when moving between territories, bridge
//     whispers acknowledge the crossing without naming it
//   TRAIL ANCHORING — whisper fragments carry star position data
//     so luminous threads can be drawn in the surface layer
//
// Phase U completes the arc:
//   WHISPER HARMONICS — simultaneous whispers breathe in phase-offset
//     counterpoint, each at its own rhythm, creating a living chorus
//   TRAIL PARTICLES — luminous dots drift along bezier paths from
//     whisper to star, fireflies tracing the invisible connection
//   BRIDGE RIPPLES — expanding concentric rings at the star when a
//     territory crossing is sensed, the cosmos exhaling
//   EXPANDED BRIDGES — 45 total bridge fragments (3 per pair) to
//     prevent repetition in longer multi-territory sessions
//
// No em dashes. No hyphens. No mechanical language.
// Only invitations and observations.

export interface GuruWhisperFragment {
  text: string;
  /** 0..1 horizontal placement bias */
  xBias: number;
  /** 0..1 vertical placement bias */
  yBias: number;
  /** seconds delay before appearing */
  delay: number;
  /** Phase U: source type for harmonic + trail rendering */
  source?: 'territory' | 'resonant' | 'universal' | 'echo' | 'bridge';
  /** Phase U: index for harmonic phase-offset breathing */
  harmonicIndex?: number;
}

const GURU_WHISPERS_BY_TERRITORY: Record<string, string[]> = {
  CALM: [
    'Stillness is not the absence of movement. It is the presence of everything, resting.',
    'The breath was here before the thought. It will be here after.',
    'Nothing needs to be fixed right now. Notice how that lands.',
    'What you call quiet has its own language. You already speak it.',
    'The pause between breaths holds more than most conversations.',
    'Rest is not retreat. It is the ground returning to meet you.',
    'Even the ocean between waves is still the ocean.',
    'Presence does not require effort. Only permission.',
  ],
  ROOT: [
    'The ground remembers what the mind forgets.',
    'You did not come from nowhere. And nowhere is not where you are going.',
    'What grew you is still growing. The roots do not stop at the surface.',
    'The past is not behind you. It is beneath you. And it is holding.',
    'Every story about where you came from is also about where you are.',
    'The foundation does not need to be understood to be trusted.',
    'What was planted long ago is still finding the light.',
    'Origin is not a place you left. It is a place that travels with you.',
  ],
  BOND: [
    'Between any two people there is a space. That space is alive.',
    'Connection does not require understanding. Only willingness.',
    'The other person is also trying. That is always true.',
    'Love is not the bridge. Love is the water under it.',
    'What you give to another, you have already given to yourself.',
    'Separation is a feeling, not a fact.',
    'The space between is not empty. It is where everything grows.',
    'To be seen is not the same as to be watched. You know the difference.',
  ],
  WIRE: [
    'The pattern is not a cage. It is a map of where attention has been.',
    'Noticing the loop is not the same as being caught in it.',
    'What repeats is asking to be understood, not defeated.',
    'Awareness is not a tool. It is a landscape. You just stepped into it.',
    'The habit was useful once. Thank it. Then look around.',
    'Patterns dissolve in the light of observation. Not force.',
    'Every loop has a door. You do not need a key. Just eyes.',
    'What runs underneath is not the enemy. It is the teacher arriving early.',
  ],
  SELF: [
    'You are not the voice in your head. You are the one who hears it.',
    'Identity is not a conclusion. It is a conversation that never ends.',
    'The person writing these words is not the same person who sat down.',
    'Who you are is not a problem to solve. It is a landscape to explore.',
    'Expression does not need an audience to be real.',
    'What if who you are is larger than any description of it.',
    'The unfamiliar self is not the wrong self. It is the next one.',
    'You are allowed to be more than one thing. You always were.',
  ],
  EDGE: [
    'Fear is not the wall. It is the door wearing a costume.',
    'Courage is not the absence of trembling. It is trembling and still being here.',
    'The boundary you are sensing is not a limit. It is a frontier.',
    'What lives beyond comfort is not danger. It is territory.',
    'You do not need to be ready. You only need to be willing.',
    'The edge is where the most interesting weather happens.',
    'Desire is information. It is pointing somewhere. Look.',
    'What feels like too much is often exactly enough.',
  ],
};

const GURU_WHISPERS_UNIVERSAL: string[] = [
  'The universe does not hurry. And yet everything is accomplished.',
  'What you just wrote is already changing something.',
  'This moment is enough. And it always was.',
  'You are not here to be completed. You are here to be continued.',
  'The words were not the point. The willingness was.',
  'Something just moved that had been still for a long time.',
  'What if there is nothing to fix.',
  'Attention is the rarest gift. You just gave it to yourself.',
  'The quiet after writing is not emptiness. It is absorption.',
  'You arrived here. That was never guaranteed.',
];

// ═══════════════════════════════════════════════════
// PHASE S: RESONANCE SEEDS + PASSAGE-RESONANT WHISPERS
// ═══════════════════════════════════════════════════

/** Theme seeds: words that signal affinity with a territory */
const RESONANCE_SEEDS: Record<string, string[]> = {
  CALM: [
    'quiet', 'still', 'peace', 'breath', 'rest', 'slow', 'gentle', 'pause',
    'calm', 'soft', 'ease', 'relax', 'silence', 'nothing', 'sleep', 'exhale',
    'morning', 'settle', 'float', 'drift', 'soothe', 'tender', 'warm',
  ],
  ROOT: [
    'family', 'home', 'father', 'mother', 'parent', 'child', 'past', 'memory',
    'remember', 'grew', 'origin', 'belong', 'foundation', 'ground',
    'heritage', 'ancestor', 'roots', 'where', 'story', 'history', 'tradition',
  ],
  BOND: [
    'love', 'friend', 'partner', 'together', 'relationship', 'trust', 'care',
    'connect', 'close', 'distance', 'miss', 'hold', 'touch', 'listen', 'share',
    'between', 'someone', 'people', 'lonely', 'alone',
  ],
  WIRE: [
    'habit', 'pattern', 'loop', 'again', 'always', 'never', 'stuck', 'repeat',
    'cycle', 'notice', 'aware', 'trigger', 'urge', 'craving', 'automatic',
    'compulsive', 'impulse', 'react', 'spiral', 'trap', 'same',
  ],
  SELF: [
    'who', 'identity', 'myself', 'person', 'become', 'change', 'name',
    'real', 'true', 'mask', 'role', 'pretend', 'authentic', 'lost', 'found',
    'discover', 'voice', 'express', 'create', 'art', 'write', 'feel',
  ],
  EDGE: [
    'fear', 'afraid', 'scary', 'risk', 'brave', 'courage', 'dare', 'try',
    'new', 'unknown', 'difficult', 'hard', 'challenge', 'impossible', 'edge',
    'boundary', 'limit', 'push', 'leap', 'jump', 'beyond', 'desire', 'want',
  ],
};

/** Passage-resonant whispers: fragments that respond to thematic content */
const RESONANT_WHISPERS: Record<string, string[]> = {
  CALM: [
    'Whatever you just set down, the ground is strong enough to hold it.',
    'There is no wrong way to arrive at stillness. Even through noise.',
    'The quiet you are reaching for is already reaching for you.',
    'What if rest is not something you earn. What if it is something you remember.',
  ],
  ROOT: [
    'The soil you came from did not forget you. Even if the seasons changed.',
    'Where you began is part of every step. Not as weight. As texture.',
    'Memory is not a place you visit. It is a place that visits you.',
    'What was given to you, even the difficult things, became the ground you walk on.',
  ],
  BOND: [
    'What lives between you and another cannot be lost. Only transformed.',
    'The ache of connection is proof that connection was real.',
    'To care about someone is to carry weather you did not choose. And it is worth it.',
    'Every gesture of reaching, even the ones that missed, left something in the air.',
  ],
  WIRE: [
    'Seeing the pattern is not the same as being the pattern. You just proved that.',
    'What repeats is not failing. It is rehearsing a question it has not yet heard answered.',
    'The space between the impulse and the action is growing. You are in it now.',
    'Awareness arrived before the habit this time. That is not nothing.',
  ],
  SELF: [
    'Whatever name you are trying on, it does not have to fit perfectly. Only honestly.',
    'The version of you writing these words is a version worth knowing.',
    'You are describing something that has no edges. That is why it feels unfinished. It is not.',
    'Expression is not performance. It is excavation. And you are digging.',
  ],
  EDGE: [
    'The trembling and the stepping forward are not opposites. They are partners.',
    'Whatever boundary you are sensing, your awareness of it means you are already past the old one.',
    'Fear and curiosity share a heartbeat. You are feeling both right now.',
    'The territory beyond the familiar does not require confidence. Only presence.',
  ],
};

/** Journey echo whispers: arise when the user has explored multiple territories */
const JOURNEY_ECHOES: string[] = [
  'You have been in more than one place tonight. The cosmos notices.',
  'Each constellation you visited left something in your hands. You may not see it yet.',
  'The distance between where you started and where you are is not empty. It is woven.',
  'Moving between constellations is its own kind of writing. You are composing something.',
  'There are threads connecting the places you have been. They are becoming visible.',
  'The path you are tracing through the stars has a shape. It is yours.',
];

// ═══════════════════════════════════════════════════
// PHASE U+: RETURNING COSMOS WHISPERS
// ═══════════════════════════════════════════════════
//
// When a user returns to the cosmos across sessions,
// the universe acknowledges their return. Not with fanfare.
// With recognition. The way a familiar sky greets you
// when you step outside again.

/** Returning whispers: tiered by session count */
const RETURNING_WHISPERS: Record<string, string[]> = {
  /** Second visit */
  early: [
    'Something in the sky shifted since you were last here.',
    'The stars you touched are still glowing. They waited.',
    'You left light behind. It grew while you were away.',
    'The cosmos kept your place. It does that.',
  ],
  /** 3-5 visits */
  familiar: [
    'The constellations lean toward you now. They know the way you move.',
    'Each time you return, the distances feel different. That is real.',
    'Your footprints in this space have become pathways.',
    'The light you have gathered is changing the shape of this sky.',
    'Something here has been growing between your visits.',
  ],
  /** 6+ visits */
  deep: [
    'This cosmos has become partly yours. The distinction blurs.',
    'The stars no longer wait. They anticipate.',
    'You have been here enough times that the darkness recognizes your breathing.',
    'What you have woven across these visits is becoming its own constellation.',
    'The universe you are building has weather now. Seasons.',
  ],
};

/** Territory-depth returning whispers */
const TERRITORY_DEPTH_WHISPERS: string[] = [
  'One of these constellations has heard you many times. It listens differently now.',
  'You have gone deep in one direction. The depth itself becomes a kind of light.',
  'Repeated visits to the same constellation are not repetition. They are archaeology.',
  'The part of the sky you keep returning to is teaching you something about what you need.',
];

/** Bridge-history returning whispers */
const BRIDGE_MEMORY_WHISPERS: string[] = [
  'The connections you have drawn between constellations are becoming a language.',
  'You have crossed between constellations so many times the borders are thinning.',
  'The bridges you built across this sky hold weight now.',
  'Movement between constellations is your signature. The cosmos reads it.',
];

/** Time-aware returning whispers: shaped by how long the user has been away */
const TIME_AWAY_WHISPERS: Record<string, string[]> = {
  /** Less than 1 hour */
  brief: [
    'You stepped away for just a moment. The cosmos barely noticed.',
    'Back already. The stars are still warm from your last visit.',
    'A short breath between arrivals. The rhythm continues.',
  ],
  /** 1-24 hours */
  sameDay: [
    'The same day, a different arrival. Something shifted between then and now.',
    'Hours have passed. The constellations have been turning slowly in your absence.',
    'You returned before the sky could forget your warmth.',
  ],
  /** 1-7 days */
  days: [
    'Days have gathered since your last visit. The stars counted them.',
    'The cosmos has been quiet. It is glad to feel your attention again.',
    'Time passed differently here while you were gone. It always does.',
    'The distance between visits holds its own kind of meaning.',
  ],
  /** More than a week */
  long: [
    'It has been a while. The cosmos does not measure absence the way clocks do.',
    'The stars have been patient. They are good at waiting.',
    'Something about a long return makes the light look different. Notice it.',
    'You have been elsewhere. Whatever that elsewhere gave you, it is welcome here too.',
    'A longer pause between visits. The silence was not empty. It was composing.',
  ],
};

/**
 * Phase U+: Draw a returning cosmos whisper based on session memory.
 * Called once on the first dwelling phase of a returning session.
 * Returns null for first-time visitors.
 */
export function drawReturningWhisper(
  sessionCount: number,
  territoryDepth: Record<string, number>,
  bridgesCrossed: string[],
  shownWhispers: Set<string>,
  lastVisit?: number,
  constellationNames?: Record<string, string>,
  completedConstellations?: string[],
  passageEchoes?: string[],
): GuruWhisperFragment | null {
  if (sessionCount <= 1) return null;

  const tier = sessionCount >= 6 ? 'deep' : sessionCount >= 3 ? 'familiar' : 'early';
  const pool: string[] = [];

  for (const t of RETURNING_WHISPERS[tier]) {
    if (!shownWhispers.has(t)) pool.push(t);
  }

  // Session milestone whispers: marking the journey without celebrating it
  const milestonePool: string[] = [];
  if (sessionCount === 5) {
    milestonePool.push(
      'Five arrivals. The cosmos does not count them. But the light remembers each one.',
      'This is your fifth time here. The stars are not impressed. They are simply glad.',
      'Five visits. The path between here and elsewhere is becoming worn. That is not a flaw. That is a trail.',
    );
  } else if (sessionCount === 10) {
    milestonePool.push(
      'Ten arrivals. The sky has grown accustomed to your presence. That changes the way it holds the dark.',
      'You have returned ten times. Each arrival was different. The cosmos noticed that too.',
      'Ten visits. The space here has started to shape itself around the way you move through it.',
    );
  } else if (sessionCount === 20) {
    milestonePool.push(
      'Twenty arrivals. The cosmos does not give awards. But the quiet here has deepened because of you.',
      'You have come here twenty times. The stars do not keep score. They keep company.',
      'Twenty visits. Something about this practice has become part of your breathing. The cosmos can feel it.',
    );
  } else if (sessionCount === 50) {
    milestonePool.push(
      'Fifty arrivals. The cosmos has stopped being surprised by your return. It simply waits, knowing you will come.',
      'Fifty visits. The light here is no longer borrowed. It is something you and the cosmos have made together.',
    );
  }
  for (const t of milestonePool) {
    if (!shownWhispers.has(t)) pool.push(t);
  }

  // Territory completion whispers: acknowledge completed constellations on return
  if (completedConstellations && completedConstellations.length > 0) {
    for (const conId of completedConstellations) {
      const con = CONSTELLATIONS.find(c => c.id === conId);
      if (!con) continue;
      const personalName = constellationNames?.[conId];
      const completionPool: string[] = [];
      if (personalName) {
        completionPool.push(
          `The constellation you called "${personalName}" is still glowing. Every star you lit there holds.`,
          `"${personalName}" carries its name differently now. It was a constellation. You made it a place.`,
          `You completed ${con.name} and named it "${personalName}." The name still fits. Names chosen in the dark usually do.`,
        );
      } else {
        completionPool.push(
          `${con.name} still glows with every star you gave it. The constellation is whole because of you.`,
          `You completed ${con.name}. The light there has not dimmed. It will not.`,
        );
      }
      for (const t of completionPool) {
        if (!shownWhispers.has(t)) pool.push(t);
      }
    }
    if (completedConstellations.length >= 3) {
      const count = completedConstellations.length;
      const multiPool = [
        `${count} constellations completed. The sky is more yours than it was before.`,
        `You have completed ${count} constellations. The darkness between them is shaped by your attention.`,
      ];
      for (const t of multiPool) {
        if (!shownWhispers.has(t)) pool.push(t);
      }
    }
  }

  const maxTerritoryDepth = Math.max(0, ...Object.values(territoryDepth));
  if (maxTerritoryDepth >= 4) {
    for (const t of TERRITORY_DEPTH_WHISPERS) {
      if (!shownWhispers.has(t)) pool.push(t);
    }
  }

  if (bridgesCrossed.length >= 5) {
    for (const t of BRIDGE_MEMORY_WHISPERS) {
      if (!shownWhispers.has(t)) pool.push(t);
    }
  }

  // Time-aware whispers: shaped by absence duration
  if (lastVisit && lastVisit > 0) {
    const hoursAway = (Date.now() - lastVisit) / (1000 * 60 * 60);
    const timeTier = hoursAway < 1 ? 'brief'
      : hoursAway < 24 ? 'sameDay'
      : hoursAway < 168 ? 'days'
      : 'long';
    for (const t of TIME_AWAY_WHISPERS[timeTier]) {
      if (!shownWhispers.has(t)) pool.push(t);
    }
  }

  // Territory-specific returning whispers: name the constellation where the user lingers most
  const depthEntries = Object.entries(territoryDepth).filter(([, v]) => v >= 3);
  if (depthEntries.length > 0) {
    // Find the territory with the highest depth
    depthEntries.sort((a, b) => b[1] - a[1]);
    const [topSchema, topCount] = depthEntries[0];
    const topCon = CONSTELLATIONS.find(c => c.schema === topSchema);
    if (topCon) {
      // Resolve display name: personal name if given, otherwise astronomical name
      const topPersonal = constellationNames?.[topCon.id];
      const topDisplay = topPersonal ? `"${topPersonal}"` : topCon.name;
      // Tiered affinity whispers: light attention (3+), deep attention (6+), devotion (10+)
      const affinityPool: string[] = [];
      if (topCount >= 3) {
        affinityPool.push(
          `${topDisplay} has been holding most of your attention. The cosmos notices where you linger.`,
          `Something about ${topDisplay} keeps calling you back. That gravity is worth noticing.`,
          `You return to ${topDisplay} the way the tide returns. Not by decision. By nature.`,
        );
        // Extra whisper when user has given a personal name
        if (topPersonal) {
          affinityPool.push(
            `You gave ${topCon.name} the name "${topPersonal}." The constellation still answers to it.`,
          );
        }
      }
      if (topCount >= 6) {
        affinityPool.push(
          `${topDisplay} knows you well now. The stars there glow a little differently for you.`,
          `The sky around ${topDisplay} has changed shape from all your visiting. Or maybe you have.`,
          `Six passages through ${topDisplay}. The light there has learned your handwriting.`,
        );
      }
      if (topCount >= 10) {
        affinityPool.push(
          `${topDisplay} is no longer a place you visit. It is a place that lives in you.`,
          `Your devotion to ${topDisplay} has made it something only you can see. The constellation is yours.`,
        );
      }
      // If there's a clear second territory too, acknowledge the axis
      if (depthEntries.length >= 2) {
        const [secondSchema] = depthEntries[1];
        const secondCon = CONSTELLATIONS.find(c => c.schema === secondSchema);
        if (secondCon && depthEntries[1][1] >= 3) {
          const secondPersonal = constellationNames?.[secondCon.id];
          const secondDisplay = secondPersonal ? `"${secondPersonal}"` : secondCon.name;
          affinityPool.push(
            `${topDisplay} and ${secondDisplay}. Two territories holding the most of your attention. The space between them is becoming yours.`,
            `Your compass keeps pointing between ${topDisplay} and ${secondDisplay}. Two poles. One field.`,
          );
        }
      }
      for (const t of affinityPool) {
        if (!shownWhispers.has(t)) pool.push(t);
      }
    }
  }

  // Territory affinity: detect repeated bridge crossings between the same pair
  if (bridgesCrossed.length >= 3) {
    const pairCounts: Record<string, number> = {};
    for (const b of bridgesCrossed) {
      // Normalize bridge direction so A→B and B→A count as the same pair
      const parts = b.split('→');
      const key = parts.length === 2 ? [parts[0], parts[1]].sort().join('↔') : b;
      pairCounts[key] = (pairCounts[key] || 0) + 1;
    }
    const maxPairCount = Math.max(0, ...Object.values(pairCounts));
    if (maxPairCount >= 3) {
      const affinityWhispers = [
        'You keep crossing between the same two constellations, as if they are the same place.',
        'Two constellations call you back and forth. The space between them is becoming yours.',
        'There is a corridor you keep walking. It is not a detour. It is a practice.',
        'The same crossing, again. Repetition here is not a circle. It is a spiral.',
      ];
      for (const t of affinityWhispers) {
        if (!shownWhispers.has(t)) pool.push(t);
      }
    }
  }

  // Passage echo whispers: the cosmos quotes fragments of your own writing back to you
  if (passageEchoes && passageEchoes.length > 0) {
    const shuffled = [...passageEchoes].sort(() => Math.random() - 0.5);
    const echoTemplates = [
      (frag: string) => `You once wrote: "${frag}." The stars still hold those words.`,
      (frag: string) => `"${frag}." You wrote that. The cosmos has not let it go.`,
      (frag: string) => `Somewhere in this sky, "${frag}" is still glowing. Your words. Still here.`,
      (frag: string) => `The light remembers what you said: "${frag}."`,
      (frag: string) => `"${frag}." Those were your words. They changed the shape of something here.`,
    ];
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      const template = echoTemplates[Math.floor(Math.random() * echoTemplates.length)];
      const echoWhisper = template(shuffled[i]);
      if (!shownWhispers.has(echoWhisper)) {
        pool.push(echoWhisper);
        break;
      }
    }
  }

  if (pool.length === 0) return null;

  const text = pool[Math.floor(Math.random() * pool.length)];
  return {
    text,
    xBias: 0.2 + Math.random() * 0.6,
    yBias: 0.35 + (Math.random() - 0.5) * 0.15,
    delay: 1.2,
    source: 'echo',
    harmonicIndex: 0,
  };
}

// ═══════════════════════════════════════════════════
// PASSAGE ECHO EXTRACTION
// ═══════════════════════════════════════════════════

const ECHO_STOP_WORDS = new Set(['the', 'a', 'an', 'is', 'was', 'it', 'i', 'my', 'me', 'and', 'or', 'but', 'to', 'of', 'in', 'for', 'on', 'at', 'by', 'so', 'if', 'do', 'am', 'be', 'as', 'no', 'not', 'this', 'that']);

export function extractPassageEcho(passage: string): string | null {
  const trimmed = passage.trim();
  if (trimmed.length < 15) return null;

  const parts = trimmed.split(/[.!?;]+/).map(s => s.trim()).filter(s => s.length > 0);
  const candidates: { text: string; score: number }[] = [];
  for (const part of parts) {
    const words = part.split(/\s+/);
    if (words.length < 4 || words.length > 12) continue;
    const contentWords = words.filter(w => !ECHO_STOP_WORDS.has(w.toLowerCase()));
    const score = contentWords.length / words.length;
    if (score >= 0.4) {
      let text = part;
      if (text[0] === text[0].toUpperCase() && parts.indexOf(part) > 0) {
        text = text[0].toLowerCase() + text.slice(1);
      }
      candidates.push({ text, score });
    }
  }

  if (candidates.length === 0) {
    if (trimmed.length <= 60) return trimmed.toLowerCase();
    const cut = trimmed.slice(0, 50);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 20) return cut.slice(0, lastSpace).toLowerCase();
    return null;
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].text;
}

// ═══════════════════════════════════════════════════
// PASSAGE RESONANCE DETECTION
// ═══════════════════════════════════════════════════
//
// When the user writes something that echoes a previous passage,
// the cosmos notices and whispers about the resonance.

const RESONANCE_TEMPLATES: ((echo: string) => string)[] = [
  (echo) => `There is an echo here. You once wrote: "${echo}." The stars remember.`,
  (echo) => `"${echo}." You have been near these words before. Something in the cosmos noticed.`,
  (echo) => `Something you wrote just reached back in time. "${echo}." Both passages hold.`,
  (echo) => `These words carry the shape of something older: "${echo}." A resonance between then and now.`,
  (echo) => `"${echo}." These words arrived before. They are arriving again. The constellation felt it.`,
];

export function detectPassageResonance(
  passage: string,
  passageEchoes: string[],
): string | null {
  if (!passageEchoes || passageEchoes.length === 0) return null;

  const passageWords = new Set(
    passage.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !ECHO_STOP_WORDS.has(w))
  );
  if (passageWords.size < 3) return null;

  // Find the echo with the highest word overlap
  let bestEcho: string | null = null;
  let bestOverlap = 0;

  for (const echo of passageEchoes) {
    const echoWords = echo.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !ECHO_STOP_WORDS.has(w));
    let overlap = 0;
    for (const w of echoWords) {
      if (passageWords.has(w)) overlap++;
    }
    // Require at least 2 overlapping content words and 30% echo coverage
    const coverage = echoWords.length > 0 ? overlap / echoWords.length : 0;
    if (overlap >= 2 && coverage >= 0.3 && overlap > bestOverlap) {
      bestOverlap = overlap;
      bestEcho = echo;
    }
  }

  if (!bestEcho) return null;

  const template = RESONANCE_TEMPLATES[Math.floor(Math.random() * RESONANCE_TEMPLATES.length)];
  return template(bestEcho);
}

// ═══════════════════════════════════════════════════
// RESONANCE DEPTH — Milestone whispers for recurring echoes
// ═══════════════════════════════════════════════════
//
// When the cosmos detects passage resonance repeatedly across sessions,
// it notices the pattern of returning. Special whispers surface at
// threshold depths: the universe recognizing a deepening spiral.

const RESONANCE_DEPTH_WHISPERS: Record<number, string[]> = {
  3: [
    'Three times now, the cosmos has heard you circle back to similar words. This is not repetition. It is deepening.',
    'Something keeps drawing you toward the same waters. Three echoes. The cosmos is listening.',
    'You have returned to these shapes three times. The constellation recognizes what you are reaching for.',
  ],
  7: [
    'Seven echoes across your visits. The words you keep circling are becoming their own constellation.',
    'Again and again, these themes surface. Seven times the cosmos has noticed. What you are writing is writing you back.',
    'Seven resonances. The pattern is no longer accidental. Something in these words wants to be understood.',
  ],
  12: [
    'Twelve times now. The echoes have become a river, and the river has carved its own path through the cosmos.',
    'What once echoed now hums. Twelve resonances. The part of the sky you keep visiting has changed shape because of your presence.',
    'The cosmos has lost count in the most beautiful way. Twelve echoes. These words belong to you now.',
  ],
  20: [
    'Twenty echoes. The words have become constellations of their own. The cosmos does not distinguish between your voice and the stars.',
    'You have made the same water holy by returning to it twenty times. The cosmos holds what you keep circling.',
    'Twenty resonances. The universe has stopped noticing the repetition and started noticing the devotion.',
  ],
};

export function getResonanceDepthWhisper(depth: number): string | null {
  // Find the highest threshold the depth has reached
  const thresholds = [20, 12, 7, 3];
  for (const t of thresholds) {
    if (depth === t) {
      const pool = RESONANCE_DEPTH_WHISPERS[t];
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════
// TERRITORY DRIFT — Session journey shape whispers
// ═══════════════════════════════════════════════════

export function composeDriftWhisper(
  territoryTrail: string[],
  constellationNames?: Record<string, string>,
): string | null {
  if (territoryTrail.length < 2) return null;

  const resolveName = (schema: string): string => {
    const con = CONSTELLATIONS.find(c => c.schema === schema);
    if (!con) return schema;
    const personal = constellationNames?.[con.id];
    return personal ? `"${personal}"` : con.name;
  };

  const unique = [...new Set(territoryTrail)];
  const names = unique.map(resolveName);

  const returned = territoryTrail[territoryTrail.length - 1] === territoryTrail[0] && territoryTrail.length >= 3;
  const linear = unique.length === territoryTrail.length;
  const oscillating = territoryTrail.length >= 4 && new Set(territoryTrail).size === 2;

  if (returned) {
    return `You began at ${names[0]} and the cosmos brought you back. That is not a circle. It is a recognition.`;
  }
  if (oscillating && names.length >= 2) {
    return `${names[0]} and ${names[1]}. Back and forth. The space between them held something you kept needing to touch.`;
  }
  if (linear && names.length >= 3) {
    const joined = names.slice(0, -1).join(', ') + `, then ${names[names.length - 1]}`;
    return `Tonight you moved through ${joined}. That path has a shape. The cosmos noticed.`;
  }
  if (names.length === 2) {
    return `Two constellations tonight: ${names[0]} and ${names[1]}. The path between them is becoming familiar.`;
  }
  if (names.length >= 3) {
    const joined = names.slice(0, -1).join(', ') + ` and ${names[names.length - 1]}`;
    return `You touched ${joined} tonight. Each one changed the way the next one felt.`;
  }
  return null;
}

// ═══════════════════════════════════════════════════
// COMPLETION MOMENTUM — Penultimate star anticipation
// ═══════════════════════════════════════════════════

const PENULTIMATE_RECOGNITION: string[] = [
  'One star remains. The constellation is almost awake.',
  'The light here is nearly whole. One more passage and this part of the sky will know its own shape.',
  'Almost complete. The last star is waiting. It has been patient.',
  'This constellation is one passage away from knowing its name.',
  'The constellation trembles. One more star and it becomes something else entirely.',
  'So close now. The final star can feel the others calling.',
];

const PENULTIMATE_STARDUST: string[] = [
  'the constellation stirs, almost complete',
  'one star remains, glowing with anticipation',
  'nearly whole, the constellation remembers every word',
  'the final star watches, patient, ready',
];

export function drawPenultimateRecognition(): string {
  return PENULTIMATE_RECOGNITION[Math.floor(Math.random() * PENULTIMATE_RECOGNITION.length)];
}

export function drawPenultimateStardust(): string {
  return PENULTIMATE_STARDUST[Math.floor(Math.random() * PENULTIMATE_STARDUST.length)];
}

// ═══════════════════════════════════════════════════
// PHASE T: CROSS-TERRITORY BRIDGE WHISPERS
// ═══════════════════════════════════════════════════
//
// When the cosmos senses you have moved from one territory
// to another, it offers a whisper that acknowledges the
// crossing. Not naming either place. Just noticing the motion.

/** Territory pair keys: sorted alphabetically, joined with '>' */
function bridgeKey(a: string, b: string): string {
  return [a, b].sort().join('>');
}

const BRIDGE_WHISPERS: Record<string, string[]> = {
  [bridgeKey('CALM', 'ROOT')]: [
    'From stillness, something remembered. The ground knows both languages.',
    'What was quiet became something older. Both are true at once.',
    'The earth and the silence have always been in conversation. You just sat down between them.',
  ],
  [bridgeKey('CALM', 'BOND')]: [
    'The peace you found is not separate from the people you carry.',
    'Stillness and connection breathe the same air.',
    'What you give to quiet, you also give to those you love. It is the same offering.',
  ],
  [bridgeKey('CALM', 'WIRE')]: [
    'You moved from rest into noticing. That is not a contradiction.',
    'Awareness and calm are not opposites. They are neighbors.',
    'The quiet gave you eyes. The noticing gave them something to see.',
  ],
  [bridgeKey('CALM', 'SELF')]: [
    'From quiet into the question of who. The silence was preparing you.',
    'Resting and searching use the same eyes. Just different distances.',
    'In the pause, a face appeared. It may have been yours.',
  ],
  [bridgeKey('CALM', 'EDGE')]: [
    'From peace to the frontier. Courage often begins in stillness.',
    'The calm you touched is still with you. It travels.',
    'What is brave was once very, very still. You felt that transition.',
  ],
  [bridgeKey('ROOT', 'BOND')]: [
    'Where you came from and who you reach toward. The roots and the branches.',
    'Memory and connection share a pulse. You are hearing it now.',
    'The past gave you a hand. You are using it to reach for someone.',
  ],
  [bridgeKey('ROOT', 'WIRE')]: [
    'What grew you and what loops through you are not enemies. They are relatives.',
    'The pattern has history. You just visited both.',
    'The oldest habits carry the newest awareness. They are learning from each other.',
  ],
  [bridgeKey('ROOT', 'SELF')]: [
    'Origin and identity are having a conversation. You are the room.',
    'Where you came from is not who you are. But it is part of the clay.',
    'The story of how you began and the story of who you are touch here.',
  ],
  [bridgeKey('ROOT', 'EDGE')]: [
    'The ground you came from gave you legs. Now they want to move.',
    'Memory and risk. What held you and what calls you forward.',
    'You are carrying the past into something unknown. It is lighter than you expected.',
  ],
  [bridgeKey('BOND', 'WIRE')]: [
    'Connection has patterns too. Noticing them is not betrayal. It is tenderness.',
    'What loops between people is asking for the same attention you just gave it.',
    'The space between you and another also has a shape. You are tracing it.',
  ],
  [bridgeKey('BOND', 'SELF')]: [
    'From the space between you and another into the space inside. Both are vast.',
    'Who you are with others and who you are alone. Neither is the whole.',
    'Love and selfhood drink from the same well. You are standing at its edge.',
  ],
  [bridgeKey('BOND', 'EDGE')]: [
    'Love and courage share a trembling. You are feeling the kinship.',
    'What connects and what dares. They are asking the same question tonight.',
    'The bravest thing you have ever done involved another person. You already know this.',
  ],
  [bridgeKey('WIRE', 'SELF')]: [
    'The pattern noticed itself and became a question about identity. That is how it works.',
    'Awareness and selfhood. You are standing in both at once.',
    'What repeats and what remains. The loop and the one who walks it are meeting.',
  ],
  [bridgeKey('WIRE', 'EDGE')]: [
    'From the loop to the frontier. The pattern knows you are leaving. And it is not angry.',
    'Noticing and daring. One gave you eyes. The other gave you feet.',
    'The familiar and the unknown are separated by one breath. You just took it.',
  ],
  [bridgeKey('SELF', 'EDGE')]: [
    'Who you are and what you dare are the same question with different lighting.',
    'Identity and the frontier. You are discovering both at the same time.',
    'The self and the edge are not far apart. They are the same cliff, seen from two angles.',
  ],
};

/**
 * Extract normalized words from an inscription for resonance matching.
 */
function extractWords(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z\s']/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
  );
}

/**
 * Score how resonant the user's inscription is with a territory's themes.
 * Returns 0-1 where higher = stronger thematic resonance.
 */
function scoreResonance(inscriptionWords: Set<string>, territory: string): number {
  const seeds = RESONANCE_SEEDS[territory];
  if (!seeds || inscriptionWords.size === 0) return 0;

  let seedHits = 0;
  for (const seed of seeds) {
    if (inscriptionWords.has(seed)) seedHits++;
  }

  // Normalize: 1 hit = 0.3, 2 = 0.5, 3+ = 0.7
  if (seedHits === 0) return 0;
  if (seedHits === 1) return 0.3;
  if (seedHits === 2) return 0.5;
  return 0.7;
}

/**
 * Phase S/T: Draw guru whisper fragments with memory, resonance, and threading.
 *
 * - Never repeats a whisper already shown this session
 * - Senses themes in the inscription and biases toward resonant fragments
 * - After 3+ territories visited, may surface a journey echo
 * - Phase T: When crossing between territories, may surface a bridge whisper
 *   that acknowledges the motion without naming the places
 * - Whisper cadence deepens: early sessions prefer shorter fragments,
 *   deep sessions allow longer, more layered observations
 * - Cross-session cadence: returning users (3+ visits) get a minimum of 2
 *   whispers per inscription; deep visitors (6+ visits) always get 3
 */
export function drawGuruWhispers(
  territory: string | null,
  sessionInscriptions: number,
  inscriptionText?: string,
  shownWhispers?: Set<string>,
  visitedTerritoryCount?: number,
  lastWhisperTerritory?: string | null,
  crossSessionCount?: number,
): GuruWhisperFragment[] {
  // Base count from within-session inscriptions: 1 early, 2 after 3+, 3 after 6+
  const baseCount = sessionInscriptions >= 6 ? 3 : sessionInscriptions >= 3 ? 2 : 1;
  // Cross-session cadence deepening: returning visitors earn richer whisper density
  // 6+ visits: always 3 whispers; 3+ visits: minimum 2; first sessions: use base
  const sessionFloor = (crossSessionCount || 0) >= 6 ? 3 : (crossSessionCount || 0) >= 3 ? 2 : 0;
  const count = Math.max(baseCount, sessionFloor);
  const shown = shownWhispers || new Set<string>();
  const words = inscriptionText ? extractWords(inscriptionText) : new Set<string>();

  // Build the candidate pool with resonance scores
  type Candidate = { text: string; score: number; source: 'territory' | 'resonant' | 'universal' | 'echo' | 'bridge' };
  const candidates: Candidate[] = [];

  // Territory-specific whispers
  if (territory && GURU_WHISPERS_BY_TERRITORY[territory]) {
    for (const text of GURU_WHISPERS_BY_TERRITORY[territory]) {
      if (!shown.has(text)) {
        candidates.push({ text, score: 0.5, source: 'territory' });
      }
    }
  }

  // Passage-resonant whispers (only when we detected thematic affinity)
  const resonanceLevel = territory ? scoreResonance(words, territory) : 0;
  if (resonanceLevel > 0 && territory && RESONANT_WHISPERS[territory]) {
    for (const text of RESONANT_WHISPERS[territory]) {
      if (!shown.has(text)) {
        // Resonant whispers get a boost proportional to the resonance level
        candidates.push({ text, score: 0.6 + resonanceLevel * 0.4, source: 'resonant' });
      }
    }
  }

  // Universal whispers
  for (const text of GURU_WHISPERS_UNIVERSAL) {
    if (!shown.has(text)) {
      candidates.push({ text, score: 0.3, source: 'universal' });
    }
  }

  // Journey echo: after visiting 3+ territories, 40% chance of including one
  const visited = visitedTerritoryCount || 0;
  if (visited >= 3 && Math.random() < 0.4) {
    const availableEchoes = JOURNEY_ECHOES.filter(t => !shown.has(t));
    if (availableEchoes.length > 0) {
      const echo = availableEchoes[Math.floor(Math.random() * availableEchoes.length)];
      candidates.push({ text: echo, score: 0.8, source: 'echo' });
    }
  }

  // Phase T: Bridge whisper — when crossing between territories
  if (territory && lastWhisperTerritory && territory !== lastWhisperTerritory) {
    const key = bridgeKey(territory, lastWhisperTerritory);
    const bridges = BRIDGE_WHISPERS[key];
    if (bridges) {
      const available = bridges.filter(t => !shown.has(t));
      if (available.length > 0) {
        const bridge = available[Math.floor(Math.random() * available.length)];
        // Bridge whispers get high priority — the crossing is noteworthy
        candidates.push({ text: bridge, score: 0.85, source: 'bridge' });
      }
    }
  }

  // If all candidates are exhausted (long session), allow repeats from the full pool
  if (candidates.length === 0) {
    if (territory && GURU_WHISPERS_BY_TERRITORY[territory]) {
      for (const text of GURU_WHISPERS_BY_TERRITORY[territory]) {
        candidates.push({ text, score: 0.5, source: 'territory' });
      }
    }
    for (const text of GURU_WHISPERS_UNIVERSAL) {
      candidates.push({ text, score: 0.3, source: 'universal' });
    }
  }

  // Weighted shuffle: higher-scored candidates are more likely to be picked first
  // Score acts as weight, with random jitter scaled by inverse score
  const weighted = candidates.map(c => ({
    ...c,
    sortKey: c.score + Math.random() * (1 - c.score * 0.5),
  })).sort((a, b) => b.sortKey - a.sortKey);

  // Cadence: early sessions prefer shorter fragments, deeper sessions allow longer ones
  const baseMaxLen = sessionInscriptions <= 2 ? 80 : sessionInscriptions <= 5 ? 120 : Infinity;
  // Cross-session cadence relaxes length limits for returning users
  const maxLen = (crossSessionCount || 0) >= 6 ? Infinity
    : (crossSessionCount || 0) >= 3 ? Math.max(baseMaxLen, 120)
    : baseMaxLen;

  const fragments: GuruWhisperFragment[] = [];
  let picked = 0;
  for (const candidate of weighted) {
    if (picked >= count) break;
    // Cadence filter: skip overly long whispers in early sessions
    if (candidate.text.length > maxLen) continue;
    fragments.push({
      text: candidate.text,
      // Spread fragments across the screen with some randomness
      xBias: 0.15 + Math.random() * 0.7,
      yBias: 0.2 + (picked / Math.max(count - 1, 1)) * 0.4 + (Math.random() - 0.5) * 0.1,
      // Stagger appearance: first at 0.5s, subsequent at +1.5s intervals
      delay: 0.5 + picked * 1.8,
      // Phase U: source + harmonic index for breathing counterpoint
      source: candidate.source,
      harmonicIndex: picked,
    });
    picked++;
  }

  // Fallback: if cadence filter excluded everything, relax and retry
  if (fragments.length === 0 && weighted.length > 0) {
    for (let i = 0; i < count && i < weighted.length; i++) {
      fragments.push({
        text: weighted[i].text,
        xBias: 0.15 + Math.random() * 0.7,
        yBias: 0.2 + (i / Math.max(count - 1, 1)) * 0.4 + (Math.random() - 0.5) * 0.1,
        delay: 0.5 + i * 1.8,
        source: weighted[i].source,
        harmonicIndex: i,
      });
    }
  }

  return fragments;
}