import type { HeroGradeTier, ResolutionClass, SemanticNeutrality } from './hero-audit';

export type AtomReviewLane =
  | 'signature-pass'
  | 'hero-pass'
  | 'composition-pass'
  | 'rebuild-pass';

export type AtomSignoffStatus =
  | 'seeded'
  | 'in-review'
  | 'approved'
  | 'needs-refinement'
  | 'blocked';

export type AtomIngestReadiness =
  | 'hold'
  | 'curation-ready'
  | 'backend-ready';

export type AtomApprovalDecision = 'yes' | 'review' | 'no';

export interface AtomSignoffSeed {
  atomId: string;
  atomNumber: number;
  atomName: string;
  collectionNumber: number;
  seriesId: string;
  seriesNumber: number;
  seriesName: string;
  proposedHeroGrade: HeroGradeTier;
  reviewLane: AtomReviewLane;
  signoffStatus: AtomSignoffStatus;
  ingestReadiness: AtomIngestReadiness;
  dominantVerbSeed: string;
  counterforceTypeSeed: string;
  semanticNeutralitySeed: SemanticNeutrality;
  resolutionClassSeed: ResolutionClass;
  memoryTraceTypeSeed: string;
  approvedForNavicue: AtomApprovalDecision;
  approvedForJourney: AtomApprovalDecision;
  approvedForInsight: AtomApprovalDecision;
  approvedForPractice: AtomApprovalDecision;
  structuralScore: number;
  triageTier: string;
  heatFit: string;
  navicueFit: string;
  journeyFit: string;
  insightFit: string;
  practiceFit: string;
  repetitionClusterSize: number;
  refinementPriority: string;
  refinementReasons: string[];
  matchingTags: string[];
  signoffNotes: string;
  manualHeroGrade?: HeroGradeTier | '';
  manualOverrideReason?: string;
  reviewer?: string;
  reviewedAt?: string;
}

export interface AtomIngestRow {
  atomId: string;
  payload: {
    atomId: string;
    atomNumber: number;
    atomName: string;
    collectionNumber: number;
    seriesId: string;
    seriesNumber: number;
    seriesName: string;
    audit: {
      structuralScore: number;
      triageTier: string;
      heatFit: string;
      navicueFit: string;
      journeyFit: string;
      insightFit: string;
      practiceFit: string;
      repetitionClusterSize: number;
      refinementPriority: string;
      refinementReasons: string[];
    };
    matching: {
      dominantInputs: string[];
      sensoryProfile: string[];
      therapeuticJobs: string[];
      physicsTags: string[];
      tags: string[];
    };
    signoff: {
      proposedHeroGrade: HeroGradeTier;
      reviewLane: AtomReviewLane;
      signoffStatus: AtomSignoffStatus;
      ingestReadiness: AtomIngestReadiness;
      dominantVerbSeed: string;
      counterforceTypeSeed: string;
      semanticNeutralitySeed: SemanticNeutrality;
      resolutionClassSeed: ResolutionClass;
      memoryTraceTypeSeed: string;
      approvedForNavicue: AtomApprovalDecision;
      approvedForJourney: AtomApprovalDecision;
      approvedForInsight: AtomApprovalDecision;
      approvedForPractice: AtomApprovalDecision;
      signoffNotes: string;
    };
  };
}
