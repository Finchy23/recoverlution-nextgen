/**
 * Canonical type-id aliases for Lab specimens.
 *
 * This lets us keep one implementation per interaction while allowing
 * additional specimen IDs (e.g. restored ranges) to render through the
 * same component library.
 */

const TYPE_ID_ALIASES: Record<string, string> = {
  // S124 (1231-1240) -> reuse canonical Quantum Architect interaction files
  'lab__quantumarchitectii__superposition': 'lab__quantumarchitect__superposition',
  'lab__quantumarchitectii__probability_cloud': 'lab__quantumarchitect__probability_cloud',
  'lab__quantumarchitectii__observer_effect': 'lab__quantumarchitect__observer_effect',
  'lab__quantumarchitectii__multiverse_branch': 'lab__quantumarchitect__multiverse_branch',
  'lab__quantumarchitectii__quantum_tunneling': 'lab__quantumarchitect__quantum_tunneling',
  'lab__quantumarchitectii__entanglement': 'lab__quantumarchitect__entanglement',
  'lab__quantumarchitectii__wave_function_collapse': 'lab__quantumarchitect__wave_function_collapse',
  'lab__quantumarchitectii__uncertainty_principle': 'lab__quantumarchitect__uncertainty_principle',
  'lab__quantumarchitectii__vacuum_fluctuation': 'lab__quantumarchitect__vacuum_fluctuation',
  'lab__quantumarchitectii__quantum_seal': 'lab__quantumarchitect__quantum_seal',

  // S127 (1261-1270) -> reuse canonical Diplomat interaction files
  'lab__diplomatii__bridge_builder': 'lab__diplomat__empathy_bridge',
  'lab__diplomatii__intent_impact_translator': 'lab__diplomat__translator',
  'lab__diplomatii__aikido_blend': 'lab__diplomat__boundary_dance',
  'lab__diplomatii__third_story': 'lab__diplomat__perspective_swap',
  'lab__diplomatii__mirror_neuron': 'lab__diplomat__mirror_shield',
  'lab__diplomatii__treaty': 'lab__diplomat__truce_table',
  'lab__diplomatii__open_palm': 'lab__diplomat__peace_thread',
  'lab__diplomatii__common_ground': 'lab__diplomat__common_ground',
  'lab__diplomatii__gift': 'lab__diplomat__sangha_search',
  'lab__diplomatii__diplomat_seal': 'lab__diplomat__common_ground',
};

export function resolveTypeIdAlias(typeId: string | undefined | null): string | undefined {
  if (!typeId) return undefined;
  return TYPE_ID_ALIASES[typeId] || typeId;
}
