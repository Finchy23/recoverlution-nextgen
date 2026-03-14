/**
 * ATOM REGISTRY — The Seed Pack
 *
 * 18 representative atoms across the interaction spectrum.
 * 6 fully implemented, 12 registered as stubs for expansion.
 *
 * The atom system spans 7 collections × 10 series × 10 atoms = 700 total.
 * This registry holds the curated seed pack — enough range to demonstrate
 * the language of the glass without dumping the entire library.
 */

import type { AtomMeta } from './types';

export const ATOM_REGISTRY: AtomMeta[] = [
  // ─── Core 10 (one per series) ───
  {
    id: 'somatic-resonance',
    name: 'Somatic Resonance',
    series: 1, seriesName: 'Physics Engines',
    essence: 'Breath-driven bioluminescent membrane. The body regulates itself.',
    interaction: 'breath',
    color: '#6488C0', accentColor: '#C8A064',
    implemented: true,
  },
  {
    id: 'wave-collapse',
    name: 'Wave Collapse',
    series: 2, seriesName: 'Quantum Mechanics',
    essence: 'Attention changes reality. Hold to collapse probability into truth.',
    interaction: 'hold',
    color: '#5A46B4', accentColor: '#C8D2FF',
    implemented: true,
  },
  {
    id: 'mycelial-routing',
    name: 'Mycelial Routing',
    series: 3, seriesName: 'Biomimetic',
    essence: 'Healing as growth, not fixing. A living network finds its own path.',
    interaction: 'tap',
    color: '#50B478', accentColor: '#8CDC98',
    implemented: true,
  },
  {
    id: 'dark-matter',
    name: 'Dark Matter',
    series: 4, seriesName: 'Via Negativa',
    essence: 'Invisible gravity. Your influence is proven by how the field responds.',
    interaction: 'hold',
    color: '#504B46', accentColor: '#786E64',
    implemented: true,
  },
  {
    id: 'cymatic-coherence',
    name: 'Cymatic Coherence',
    series: 5, seriesName: 'Chrono-Acoustic',
    essence: 'Sound made visible. Breath brings chaos into geometric order.',
    interaction: 'breath',
    color: '#5A3C78', accentColor: '#A0C8FF',
    implemented: true,
  },
  {
    id: 'phantom-alert',
    name: 'Phantom Alert',
    series: 6, seriesName: 'Meta-Glitch',
    essence: 'Break the autopilot. A rupture in the glass that demands attention.',
    interaction: 'tap',
    color: '#C84040', accentColor: '#FF8888',
    implemented: false,
  },
  {
    id: 'narrative-flip',
    name: 'Narrative Flip',
    series: 7, seriesName: 'Retro-Causal',
    essence: 'Meaning shifts through physics. The story rewrites itself.',
    interaction: 'swipe',
    color: '#8878B0', accentColor: '#D0C8E8',
    implemented: false,
  },
  {
    id: 'overview-effect',
    name: 'Overview Effect',
    series: 8, seriesName: 'Kinematic Topology',
    essence: 'Perspective and scale. See the landscape from above.',
    interaction: 'pinch',
    color: '#4488AA', accentColor: '#88CCDD',
    implemented: false,
  },
  {
    id: 'phoenix-ash',
    name: 'Phoenix Ash',
    series: 9, seriesName: 'Shadow Crucible',
    essence: 'Ash falls. Breath transmutes. The dark becomes the light.',
    interaction: 'breath',
    color: '#8C5028', accentColor: '#FFB450',
    implemented: true,
  },
  {
    id: 'future-memory',
    name: 'Future Memory',
    series: 10, seriesName: 'Reality Bender',
    essence: 'Draw the architecture of who you are becoming.',
    interaction: 'draw',
    color: '#1E1940', accentColor: '#DCC88C',
    implemented: true,
  },

  // ─── Stretch 8 ───
  {
    id: 'still-point',
    name: 'Still Point',
    series: 1, seriesName: 'Physics Engines',
    essence: 'Particles orbit a luminous center. Stillness is magnetic. The center holds.',
    interaction: 'observe',
    color: '#A89070', accentColor: '#D4C4A8',
    implemented: true,
  },
  {
    id: 'tidal-breath',
    name: 'Tidal Breath',
    series: 1, seriesName: 'Physics Engines',
    essence: 'A luminous horizon breathes. Above: sky. Below: ocean. Match the rhythm.',
    interaction: 'breath',
    color: '#2A5A7A', accentColor: '#78B4D4',
    implemented: true,
  },
  {
    id: 'weight-release',
    name: 'Weight Release',
    series: 4, seriesName: 'Via Negativa',
    essence: 'Heavy mass resists, stretches, then releases into light. Weight becomes lightness.',
    interaction: 'drag',
    color: '#6A5A40', accentColor: '#D4C088',
    implemented: true,
  },
  {
    id: 'signal-fire',
    name: 'Signal Fire',
    series: 2, seriesName: 'Quantum Mechanics',
    essence: 'Noise decays. A spiral emerges. The signal was always there.',
    interaction: 'observe',
    color: '#3A2A64', accentColor: '#8A7AC4',
    implemented: true,
  },
  {
    id: 'dissolve',
    name: 'Dissolve',
    series: 6, seriesName: 'Meta-Glitch',
    essence: 'A sharp boundary softens. Colors bleed. The wall was always a gradient.',
    interaction: 'hold',
    color: '#5A4AA0', accentColor: '#B0A0E0',
    implemented: true,
  },
  {
    id: 'ember-grid',
    name: 'Ember Grid',
    series: 9, seriesName: 'Shadow Crucible',
    essence: 'A field of fading embers. Touch reveals hidden constellations of meaning.',
    interaction: 'tap',
    color: '#8B3A14', accentColor: '#D4784A',
    implemented: true,
  },
  {
    id: 'pendulum-rest',
    name: 'Pendulum Rest',
    series: 5, seriesName: 'Chrono-Acoustic',
    essence: 'The swing traces afterimages. Breath controls the damping. Equilibrium arrives.',
    interaction: 'breath',
    color: '#4A7878', accentColor: '#88BCBC',
    implemented: true,
  },
  {
    id: 'mirror-breath',
    name: 'Mirror Breath',
    series: 7, seriesName: 'Retro-Causal',
    essence: 'The system mirrors your touch — delayed, warped, revealing. The reflection clarifies.',
    interaction: 'hold',
    color: '#7080A0', accentColor: '#B0C0E0',
    implemented: true,
  },
  {
    id: 'root-pulse',
    name: 'Root Pulse',
    series: 3, seriesName: 'Biomimetic',
    essence: 'Bioluminescent roots grow upward. Touch spawns branches. The network deepens.',
    interaction: 'tap',
    color: '#2A5A2A', accentColor: '#78BC78',
    implemented: true,
  },
  {
    id: 'threshold',
    name: 'Threshold',
    series: 10, seriesName: 'Reality Bender',
    essence: 'Particles cross a luminous line. Dense becomes light. The crossing is irreversible.',
    interaction: 'hold',
    color: '#5A4A28', accentColor: '#C8B478',
    implemented: true,
  },
  {
    id: 'micro-step-shrink',
    name: 'Micro-Step Shrink',
    series: 12, seriesName: 'Friction',
    essence: 'Overwhelm reduction. The task shrinks to the size of one breath.',
    interaction: 'drag',
    color: '#6080A0', accentColor: '#A0C0E0',
    implemented: false,
  },
  {
    id: 'vagal-resonance',
    name: 'Vagal Resonance',
    series: 5, seriesName: 'Chrono-Acoustic',
    essence: 'Direct vagal entrainment. The tone finds your frequency.',
    interaction: 'breath',
    color: '#406080', accentColor: '#80B0D0',
    implemented: false,
  },
  {
    id: 'audio-rescore',
    name: 'Audio Rescore',
    series: 7, seriesName: 'Retro-Causal',
    essence: 'The same scene, a different soundtrack. Everything changes.',
    interaction: 'drag',
    color: '#705898', accentColor: '#B0A0D0',
    implemented: false,
  },
  {
    id: 'third-person-shift',
    name: 'Third Person Shift',
    series: 7, seriesName: 'Retro-Causal',
    essence: 'Step outside yourself. Watch from the corridor.',
    interaction: 'swipe',
    color: '#607090', accentColor: '#90A8C8',
    implemented: false,
  },
  {
    id: 'shame-compass',
    name: 'Shame Compass',
    series: 9, seriesName: 'Shadow Crucible',
    essence: 'Navigate the weight. The compass points toward release.',
    interaction: 'drag',
    color: '#8C4060', accentColor: '#D080A0',
    implemented: false,
  },
  {
    id: 'atmosphere-weather',
    name: 'Atmosphere Weather',
    series: 10, seriesName: 'Reality Bender',
    essence: 'You change the room. The glass responds to your state.',
    interaction: 'breath',
    color: '#506878', accentColor: '#88A8B8',
    implemented: false,
  },
  {
    id: 'belief-bridge',
    name: 'Belief Bridge',
    series: 10, seriesName: 'Reality Bender',
    essence: 'Faith materializes. Step forward and the path appears.',
    interaction: 'tap',
    color: '#786050', accentColor: '#C8A888',
    implemented: false,
  },
  {
    id: 'inner-child',
    name: 'Inner Child',
    series: 9, seriesName: 'Shadow Crucible',
    essence: 'The armor drops. Tenderness is the intervention.',
    interaction: 'hold',
    color: '#A08890', accentColor: '#E0C8D0',
    implemented: false,
  },
];

/** Get all implemented atoms */
export function getImplementedAtoms(): AtomMeta[] {
  return ATOM_REGISTRY.filter(a => a.implemented);
}

/** Get atom meta by id */
export function getAtomById(id: string): AtomMeta | undefined {
  return ATOM_REGISTRY.find(a => a.id === id);
}

/** Get unique series from registry */
export function getSeries(): { series: number; name: string }[] {
  const seen = new Map<number, string>();
  for (const a of ATOM_REGISTRY) {
    if (!seen.has(a.series)) seen.set(a.series, a.seriesName);
  }
  return Array.from(seen.entries()).map(([series, name]) => ({ series, name })).sort((a, b) => a.series - b.series);
}