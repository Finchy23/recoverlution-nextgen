/**
 * Act grouping metadata for Lab specimens.
 * Maps the current Lab specimen set across Foundation, legacy numbered acts,
 * and the atomic library extensions.
 */
import { ATOMIC_ACT_NAMES } from './lab/atomicLibrary';

export interface ActGroup {
  id: string;
  label: string;
  subtitle: string;
  start: number;
  count: number;
}

const NUMBERED_ACT_NAMES = [
  'Novice', 'Alchemist', 'Architect', 'Navigator', 'Sage',
  'Mender', 'Diplomat', 'Weaver', 'Visionary', 'Luminary',
  'Hacker', 'Chrononaut', 'Mycelium', 'Aesthete', 'Elemental',
  'Phenomenologist', 'Alchemist II', 'Servant Leader', 'Omega Point', 'Source',
  'Stoic', 'Lover', 'Athlete', 'Strategist', 'Wilding',
  'Guardian', 'Futurist', 'Mystic', 'Infinite Player', 'Reality Bender',
  'Magnet', 'Oracle', 'Maestro', 'Shaman', 'Stargazer',
  'Myth Maker', 'Shape Shifter', 'Dream Walker', 'Magnum Opus', 'Prism',
  'Graviton', 'Observer', 'Time Capsule', 'Loop Breaker', 'Retro-Causal',
  'Threshold', 'Soma', 'Frequency', 'Tuner', 'Broadcast',
  'Schr\u00f6dinger', 'Glitch', 'Construct', 'Biographer', 'Optician',
  'Interpreter', 'Social Physics', 'Tribalist', 'Valuator', 'Editor',
  'Grandmaster', 'Catalyst', 'Kinetic', 'Adaptive', 'Shadow Worker',
  'Ancestor', 'Trickster', 'Astronaut', 'Wonderer', 'Surfer',
  'Meaning', 'Servant', 'Synthesis', 'Future Weaver', 'Composer',
  'Zenith', 'Multiverse', 'Ethicist', 'Elementalist', 'Mentat',
  'Intuition', 'Engineer', 'Alchemist IV', 'Cognitive', 'Sage II',
  'Gaia', 'Mystic II', 'Ascendant', 'Gardener II', 'Ancestor II',
  'Magnum Opus II', 'Infinite Player II', 'Zero Point', 'Omega', 'Ouroboros',
  // 11th Century (Second Millennium)
  'Projector', 'Chronomancer', 'Resonator', 'Materialist',
  'Refractor', 'Engine',
  'Catalyst (Chemistry)',
  'Quantum Architect',
  'Transmuter',
  'Cyberneticist',
  'FieldArchitect',
  'Kineticist',
  'Crystal',
  'Hydrodynamicist',
  'Aviator',
  'Tensegrity',
  'Wayfinder',
  'Receiver',
  'Vector',
  'Tuning',
  // 12th Century (Third Millennium: S121-S140 full sequence)
  'Fulcrum', 'Conductor', 'Catalyst III',
  'Quantum Architect II',
  'Simulator', 'Editor (Narrative)', 'Diplomat II',
  'Scout', 'Weaver Pattern', 'Anchor',
  'Game Strategist', 'Network', 'Systems Architect',
  'Evolutionist', 'Economist', 'Politician',
  'Warrior II', 'Sovereign', 'Historian', 'Game Designer',
  ...ATOMIC_ACT_NAMES,
];

const FOUNDATION_ACTS: ActGroup[] = [
  { id: 'foundation', label: 'Foundation', subtitle: 'The Original 5', start: 0, count: 5 },
  { id: 'act-i', label: 'ACT I', subtitle: 'Deepening Observation', start: 5, count: 4 },
  { id: 'act-ii', label: 'ACT II', subtitle: 'Entering the Body', start: 9, count: 4 },
  { id: 'act-iii', label: 'ACT III', subtitle: 'The Tender Turn', start: 13, count: 2 },
  { id: 'act-iv', label: 'ACT IV', subtitle: 'The Choosing', start: 15, count: 3 },
  { id: 'act-v', label: 'ACT V', subtitle: 'Identity Frontier', start: 18, count: 2 },
  { id: 'act-vi', label: 'ACT VI', subtitle: 'The Deepening', start: 20, count: 3 },
  { id: 'act-vii', label: 'ACT VII', subtitle: 'The Moving', start: 23, count: 3 },
  { id: 'act-viii', label: 'ACT VIII', subtitle: 'The Facing', start: 26, count: 2 },
  { id: 'act-ix', label: 'ACT IX', subtitle: 'The Knowing', start: 28, count: 2 },
  { id: 'act-x', label: 'ACT X', subtitle: 'Tender Deepening', start: 30, count: 5 },
  { id: 'act-xi', label: 'ACT XI', subtitle: 'Second Sight', start: 35, count: 5 },
  { id: 'act-xii', label: 'ACT XII', subtitle: 'Integration', start: 40, count: 5 },
  { id: 'act-xiii', label: 'ACT XIII', subtitle: 'The Horizon', start: 45, count: 5 },
];

export const ACT_GROUPS: ActGroup[] = [
  ...FOUNDATION_ACTS,
  ...NUMBERED_ACT_NAMES.map((name, i) => ({
    id: `act-${i}`,
    label: `ACT ${i}`,
    subtitle: name,
    start: 50 + i * 10,
    count: 10,
  })),
];

export function getActForIndex(index: number): ActGroup | undefined {
  return ACT_GROUPS.find(a => index >= a.start && index < a.start + a.count);
}
