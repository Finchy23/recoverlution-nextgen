export interface GenesisAuditMetric {
  id: string;
  label: string;
  count: number;
  total: number;
  note: string;
}

export interface GenesisCoverageSignal {
  id: string;
  title: string;
  status: 'strong' | 'partial' | 'missing';
  note: string;
}

export interface GenesisRoadmapStep {
  id: string;
  title: string;
  goal: string;
  deliverables: string[];
}

/**
 * Baseline captured from repository-level static pattern scan.
 * Date: 2026-02-25
 * Scope: src/app/components/navicue/implementations (1388 files)
 */
export const GENESIS_AUDIT_BASELINE = {
  generatedAt: '2026-02-25',
  totalImplementations: 1388,
  metrics: [
    {
      id: 'verse_adoption',
      label: 'NaviCueVerse Adoption',
      count: 389,
      total: 1388,
      note: 'Strong abstraction base, but most files still on direct shell pattern.',
    },
    {
      id: 'shell_adoption',
      label: 'NaviCueShell Adoption',
      count: 966,
      total: 1388,
      note: 'Most cues are on the shared atmosphere shell; remaining set needs migration.',
    },
    {
      id: 'hold_hooks',
      label: 'Hold Interaction Hooks',
      count: 109,
      total: 1388,
      note: 'Good baseline for grounding cues.',
    },
    {
      id: 'drag_hooks',
      label: 'Drag Interaction Hooks',
      count: 123,
      total: 1388,
      note: 'Drag exists, but mostly linear mechanics.',
    },
    {
      id: 'type_hooks',
      label: 'Type Interaction Hooks',
      count: 75,
      total: 1388,
      note: 'Reflective text mechanics present but underused.',
    },
    {
      id: 'draw_hooks',
      label: 'Draw Interaction Hooks',
      count: 17,
      total: 1388,
      note: 'Large differentiation opportunity.',
    },
    {
      id: 'breath_engine',
      label: 'Breath Engine Integration',
      count: 1,
      total: 1388,
      note: 'Major gap for somatic entrainment.',
    },
    {
      id: 'svg_hero',
      label: 'SVG Hero Scene Usage',
      count: 731,
      total: 1388,
      note: 'Strong visual base; next leap is interaction physics + state richness.',
    },
  ] as const satisfies readonly GenesisAuditMetric[],
  domainSignals: [
    {
      id: 'sensor_metaphors',
      title: 'Sensor-Driven Metaphors',
      status: 'missing',
      note: 'No significant runtime sensor orchestration in hero mechanics yet.',
    },
    {
      id: 'advanced_webgl',
      title: 'Advanced WebGL',
      status: 'missing',
      note: 'No production-grade shader/WebGL interaction stack in cues yet.',
    },
    {
      id: 'kinematic_typography',
      title: 'Kinematic Typography',
      status: 'partial',
      note: 'Typography system is strong, but variable-font physics not yet exploited.',
    },
    {
      id: 'audio_haptics',
      title: 'Symbiotic Audio-Haptics',
      status: 'partial',
      note: 'Audio appears in isolated cues; no unified haptic texture system.',
    },
    {
      id: 'entrance_materialization',
      title: 'Entrance Materialization',
      status: 'partial',
      note: 'Entry patterns exist via compositor but need broader differentiated usage.',
    },
    {
      id: 'bio_optic_feedback',
      title: 'Bio-Optic Feedback',
      status: 'missing',
      note: 'No local camera-based feedback layer integrated.',
    },
    {
      id: 'chrono_mechanics',
      title: 'Chrono-Mechanics',
      status: 'partial',
      note: 'Chrono palette/timing modifiers exist; deep-time interaction primitives do not.',
    },
    {
      id: 'holographic_parallax',
      title: 'Holographic Parallax',
      status: 'missing',
      note: 'Current depth mostly visual, not orientation-reactive.',
    },
    {
      id: 'thermodynamic_ui',
      title: 'Thermodynamic UI',
      status: 'partial',
      note: 'Heat-band semantics exist; entropy/charge interaction patterns are not formalized.',
    },
    {
      id: 'wave_interference',
      title: 'Wave Interference',
      status: 'missing',
      note: 'No frequency alignment engine driving hero success states yet.',
    },
  ] as const satisfies readonly GenesisCoverageSignal[],
  roadmap: [
    {
      id: 'genesis-foundation',
      title: 'Sprint 1 - Foundation',
      goal: 'Establish reusable Genesis primitives without breaking current cues.',
      deliverables: [
        'Genesis innovation type system + composition contracts',
        'Entrance pattern runtime wrapper (plug-in to NaviCueVerse)',
        'Hero interaction API for velocity, phase, radial, gravity',
      ],
    },
    {
      id: 'genesis-pilot',
      title: 'Sprint 2 - Pilot 20 Cues',
      goal: 'Ship differentiated hero interactions in a controlled set.',
      deliverables: [
        '20 pilot cues mapped to domain + hero + atmosphere matrix',
        'A/B guardrail checks (readability, completion, time-to-complete)',
        'Fallback behavior for no-sensor/no-webgl environments',
      ],
    },
    {
      id: 'genesis-scale',
      title: 'Sprint 3 - Scale Framework',
      goal: 'Convert pilot patterns into repeatable build recipes for 4000+.',
      deliverables: [
        'Template packs per Hero Play',
        'Reactive background engines integrated with cue state',
        'Command Center governance board for domain coverage tracking',
      ],
    },
    {
      id: 'genesis-harden',
      title: 'Sprint 4 - Production Hardening',
      goal: 'Lock reliability, accessibility, and performance budgets.',
      deliverables: [
        'Performance envelopes for shader/sensor features',
        'Accessibility parity paths for each advanced interaction',
        'Release checklist for Genesis-tier cues',
      ],
    },
  ] as const satisfies readonly GenesisRoadmapStep[],
};

export type GenesisAuditBaseline = typeof GENESIS_AUDIT_BASELINE;
