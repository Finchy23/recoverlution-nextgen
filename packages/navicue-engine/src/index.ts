import type { SignalHeatBand, NavicueStageContract } from '@recoverlution/types';
export * from './runtime/format-adapter-registry';
export * from './runtime/compile-intervention-demo';
export * from './runtime/altitude-payload-adapters';
export * from './runtime/entry-runtime-adapters';
export * from './runtime/echo-link-runtime';
export * from './runtime/echo-link-routes';
export * from './runtime/companion-auth-provider';
export * from './runtime/companion-auth-transaction';
export * from './runtime/companion-commerce';
export * from './runtime/companion-entry-continuity';
export * from './runtime/companion-entry-requests';

export const NAVICUE_STAGES: readonly NavicueStageContract[] = [
  { id: 'arriving', order: 1 },
  { id: 'present', order: 2 },
  { id: 'active', order: 3 },
  { id: 'resonant', order: 4 },
  { id: 'afterglow', order: 5 },
] as const;

export const HEAT_BANDS: readonly SignalHeatBand[] = ['green', 'amber', 'red'] as const;

export interface NavicueDispatchEnvelope {
  stage: NavicueStageContract['id'];
  heatBand: SignalHeatBand;
  consentBound: boolean;
}
export * from './runtime/companion-auth-routes';
