export type HeroTriageTier = 'hero-candidate' | 'composition-sensitive' | 'likely-underpowered';
export type HeroGradeTier = 'designed' | 'implemented' | 'playable' | 'hero-grade' | 'signature';
export type SemanticNeutrality = 'high' | 'medium' | 'low';
export type ResolutionClass = 'state-morph' | 'field-recompose' | 'seal' | 'loop' | 'none';

export interface AtomAuditInput {
  id: string;
  name: string;
  number: number;
  series: string;
  renderMode: string;
  defaultScale: string;
  surfaces: string[];
  deviceRequirements: string[];
  breathCoupling: string;
  hasResolution: boolean;
  continuous: boolean;
  status: string;
}

export interface StructuralHeroSignals {
  occupancyScore: number;
  interactionScore: number;
  consequenceScore: number;
  sensoryScore: number;
  structuralScore: number;
  triageTier: HeroTriageTier;
  reasons: string[];
}

export interface FutureManualHeroAudit {
  dominantVerb: string;
  counterforceType: string;
  semanticNeutrality: SemanticNeutrality;
  resolutionClass: ResolutionClass;
  memoryTraceType: string;
  instructionNeed: 'none' | 'minimal' | 'moderate' | 'high';
  heroGrade: HeroGradeTier;
}

const SCALE_SCORES: Record<string, number> = {
  point: 0,
  focus: 1,
  field: 2,
  full: 3,
};

export function deriveStructuralHeroSignals(atom: AtomAuditInput): StructuralHeroSignals {
  const reasons: string[] = [];

  const occupancyScore = SCALE_SCORES[atom.defaultScale] ?? 1;
  const interactionScore = Math.min(3, Math.max(0, atom.surfaces.length - 1));
  const consequenceScore = (atom.hasResolution ? 2 : 0) + (atom.continuous ? 1 : 0);
  const sensoryScore =
    (atom.breathCoupling !== 'none' ? 1 : 0) +
    (atom.deviceRequirements.includes('haptics') ? 1 : 0) +
    (atom.deviceRequirements.some(req => req !== 'haptics') ? 1 : 0);

  let structuralScore = occupancyScore + interactionScore + consequenceScore + sensoryScore;

  if (atom.defaultScale === 'point') {
    reasons.push('Tiny default scale puts pressure on consequence design.');
  }
  if (atom.surfaces.length <= 1) {
    reasons.push('Single-surface interaction increases risk of weak hero depth.');
  }
  if (!atom.hasResolution) {
    reasons.push('No explicit resolution means the player must carry the payoff.');
  }
  if (atom.continuous && !atom.hasResolution) {
    reasons.push('Continuous loop without resolution risks feeling ambient instead of decisive.');
  }
  if (atom.defaultScale === 'focus' && atom.surfaces.length <= 1 && !atom.hasResolution) {
    structuralScore -= 2;
    reasons.push('Local focus + low interaction breadth + no resolution is a common “small atom” pattern.');
  }
  if (atom.defaultScale === 'full' || atom.defaultScale === 'field') {
    reasons.push('Spatial authority is structurally available.');
  }
  if (atom.hasResolution) {
    reasons.push('Resolution path exists in the engine.');
  }
  if (atom.surfaces.length >= 3) {
    reasons.push('Rich interaction surface set supports deeper hero behavior.');
  }

  let triageTier: HeroTriageTier;
  if (structuralScore >= 8 && (atom.hasResolution || atom.continuous) && occupancyScore >= 2) {
    triageTier = 'hero-candidate';
  } else if (structuralScore <= 3 || (occupancyScore <= 1 && atom.surfaces.length <= 1 && !atom.hasResolution)) {
    triageTier = 'likely-underpowered';
  } else {
    triageTier = 'composition-sensitive';
  }

  return {
    occupancyScore,
    interactionScore,
    consequenceScore,
    sensoryScore,
    structuralScore,
    triageTier,
    reasons,
  };
}
