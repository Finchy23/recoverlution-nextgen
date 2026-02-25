import { create } from 'zustand';

// ==========================================
// COMMAND CENTER STORE
// ==========================================
// State management for Command Center
// - Journey Template Scenes
// - NaviCue Type Catalog
// - Current selection & preview state

// Journey Scene from database (ALL columns)
export interface JourneyScene {
  // IDs & Keys
  id: string;
  template_id: string;
  scene_number: number;
  scene_key: string;
  scene_type: string;
  
  // Phase & Stage
  phase: string;
  era_phase: string | null;
  stage_key: string | null;
  state_band: string | null;
  move_key: string | null;
  
  // Content
  headline: string;
  narration_text: string | null;
  prompt: string | null;
  
  // Input & Interaction
  input_type: string | null;
  response_contract_json: any;
  requires_real_world_trigger: boolean | null;
  requires_resistance_check: boolean | null;
  real_life_check_keys: string[] | null;
  
  // Audio
  has_audio: boolean | null;
  audio_track_type: string | null;
  audio_object_path: string | null;
  
  // KBE & Mindblocks
  mindblock_targets: string[] | null;
  mindblock_prompt_style: string | null;
  mindblock_probe: string | null;
  mindblock_resolution_move: string | null;
  
  // Guidance & Receipts
  guidance_mode_key: string | null;
  receipt_type_keys: string[] | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// NaviCue Type from database (ALL columns)
export interface NaviCueType {
  // Primary Keys & IDs
  navicue_type_id: string;
  navicue_type_name: string;
  
  // Core Architecture
  form: string;
  intent: string;
  mechanism: string;
  kbe_layer: string;
  
  // Operator Sequence
  operator_sequence_key: string | null;
  operator_sequence: string[] | null;
  operators: string | null;
  
  // Defaults (JSON objects)
  lens_defaults: any;
  voice_defaults: any;
  magic_defaults: any;
  
  // Constraints & Proof
  constraints: any;
  proof_mode_default: string | null;
  proof_type_default: string | null;
  
  // Form & Container
  form_archetype: string | null;
  container_type: string | null;
  
  // Magic Layer - Signature & Emotion
  magic_signature: string | null;
  magic_emotion_job: string | null;
  magic_visual: string | null;
  magic_motion: string | null;
  magic_interaction_bias: string | null;
  magic_copy_mode: string | null;
  
  // Interaction & Voice
  interaction_pattern: string | null;
  voice_pairing: string | null;
  
  // Energy & Style
  energy_level: string | null;
  closure_style: string | null;
  entry_motion: string | null;
  accent_behavior: string | null;
  copy_rhythm: string | null;
  transition_signature: string | null;
  
  // Primary Content
  primary_prompt: string | null;
  cta_primary: string | null;
  cta_defer: string | null;
  
  // Guardrails & Rules
  anti_patterns: string | null;
  must_avoid: string | null;
  design_laws: string | null;
  auto_fail_conditions: string | null;
  magic_guardrails_never_show: string | null;
  magic_guardrails_never_feel_like: string | null;
  
  // Internal Fields
  internal_only_fields: string | null;
  render_drivers: string | null;
  never_show_labels: string | null;
  mapping_rules: string | null;
}

// NaviCue Filters
export interface NaviCueFilters {
  navicue_type_id?: string | null;
  navicue_type_name?: string | null;
  container_type?: string | null;
  form?: string | null;
  kbe_layer?: string | null;
  intent?: string | null;
  mechanism?: string | null;
  magic_signature?: string | null;
}

interface CommandCenterStore {
  // Data
  journeyScenes: JourneyScene[];
  navicueTypes: NaviCueType[];
  allNavicueTypes: NaviCueType[]; // Unfiltered source
  
  // Filters
  navicueFilters: NaviCueFilters;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Current selection
  currentTab: 'journeys' | 'navicues' | 'matrix' | 'lab' | 'atlas' | 'registry' | 'audit' | 'genesis';
  currentJourneyIndex: number;
  currentNavicueIndex: number;
  
  // Preview mode
  previewMode: 'mobile' | 'desktop';
  
  // Data inspector
  showDataInspector: boolean;
  
  // Actions
  setJourneyScenes: (scenes: JourneyScene[]) => void;
  setNavicueTypes: (types: NaviCueType[]) => void;
  setCurrentTab: (tab: 'journeys' | 'navicues' | 'matrix' | 'lab' | 'atlas' | 'registry' | 'audit' | 'genesis') => void;
  setCurrentJourneyIndex: (index: number) => void;
  setCurrentNavicueIndex: (index: number) => void;
  setPreviewMode: (mode: 'mobile' | 'desktop') => void;
  nextScene: () => void;
  previousScene: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNavicueFilter: (filterKey: keyof NaviCueFilters, value: string | null) => void;
  clearNavicueFilters: () => void;
  applyNavicueFilters: () => void;
  setShowDataInspector: (show: boolean) => void;
}

export const useCommandCenterStore = create<CommandCenterStore>((set, get) => ({
  // Initial state
  journeyScenes: [],
  navicueTypes: [],
  allNavicueTypes: [],
  navicueFilters: {
    navicue_type_id: null,
    navicue_type_name: null,
    container_type: null,
    form: null,
    kbe_layer: null,
    intent: null,
    mechanism: null,
    magic_signature: null,
  },
  isLoading: false,
  error: null,
  currentTab: 'audit',
  currentJourneyIndex: 0,
  currentNavicueIndex: 0,
  previewMode: 'mobile',
  showDataInspector: false,
  
  // Actions
  setJourneyScenes: (scenes) => set({ journeyScenes: scenes }),
  setNavicueTypes: (types) => set({ navicueTypes: types, allNavicueTypes: types }),
  setCurrentTab: (tab) => set({ currentTab: tab }),
  setCurrentJourneyIndex: (index) => set({ currentJourneyIndex: index }),
  setCurrentNavicueIndex: (index) => set({ currentNavicueIndex: index }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  nextScene: () => {
    const state = get();
    if (state.currentTab === 'journeys') {
      const maxIndex = state.journeyScenes.length - 1;
      if (state.currentJourneyIndex < maxIndex) {
        set({ currentJourneyIndex: state.currentJourneyIndex + 1 });
      }
    } else {
      const maxIndex = state.navicueTypes.length - 1;
      if (state.currentNavicueIndex < maxIndex) {
        set({ currentNavicueIndex: state.currentNavicueIndex + 1 });
      }
    }
  },
  
  previousScene: () => {
    const state = get();
    if (state.currentTab === 'journeys') {
      if (state.currentJourneyIndex > 0) {
        set({ currentJourneyIndex: state.currentJourneyIndex - 1 });
      }
    } else {
      if (state.currentNavicueIndex > 0) {
        set({ currentNavicueIndex: state.currentNavicueIndex - 1 });
      }
    }
  },
  
  setNavicueFilter: (filterKey, value) => {
    const state = get();
    set({
      navicueFilters: {
        ...state.navicueFilters,
        [filterKey]: value,
      },
    });
  },
  
  clearNavicueFilters: () => {
    set({
      navicueFilters: {
        navicue_type_id: null,
        navicue_type_name: null,
        container_type: null,
        form: null,
        kbe_layer: null,
        intent: null,
        mechanism: null,
        magic_signature: null,
      },
    });
  },
  
  applyNavicueFilters: () => {
    const state = get();
    const filters = state.navicueFilters;
    const filteredTypes = state.allNavicueTypes.filter(type => {
      return (
        (!filters.navicue_type_id || type.navicue_type_id === filters.navicue_type_id) &&
        (!filters.navicue_type_name || type.navicue_type_name === filters.navicue_type_name) &&
        (!filters.container_type || type.container_type === filters.container_type) &&
        (!filters.form || type.form === filters.form) &&
        (!filters.kbe_layer || type.kbe_layer === filters.kbe_layer) &&
        (!filters.intent || type.intent === filters.intent) &&
        (!filters.mechanism || type.mechanism === filters.mechanism) &&
        (!filters.magic_signature || type.magic_signature === filters.magic_signature)
      );
    });
    set({ navicueTypes: filteredTypes });
  },
  
  setShowDataInspector: (show) => set({ showDataInspector: show }),
}));
