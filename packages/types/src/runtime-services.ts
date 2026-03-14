import type { CompanionHomePayload } from './altitude-payloads';

export type CompanionCheckoutPlanCode = 'monthly' | 'yearly' | 'lifetime';

export interface CompanionCheckoutSessionRequest {
  planCode: CompanionCheckoutPlanCode;
  priceId: string;
  successPath?: string;
  cancelPath?: string;
}

export interface CompanionCheckoutSessionResponse {
  id: string;
  url: string;
  mode: 'stripe_checkout_session';
}

export interface CompanionCheckoutSessionConfirmRequest {
  sessionId: string;
}

export interface CompanionCheckoutSessionConfirmResponse {
  id: string;
  status: 'open' | 'complete' | 'expired';
  paymentStatus?: string | null;
  customerEmail?: string | null;
  planCode?: CompanionCheckoutPlanCode;
  canEnterCompanion: boolean;
  mode: 'stripe_checkout_session';
}

export interface CompanionBootstrapRequest {
  sessionId: string;
  previewIndividualId?: string;
}

export type CompanionBootstrapAccessState =
  | 'checkout_visible'
  | 'pending_payment'
  | 'ready_for_companion'
  | 'needs_identity_binding'
  | 'needs_support';

export type CompanionBootstrapNextAction =
  | 'wait_for_confirmation'
  | 'enter_companion'
  | 'bind_identity'
  | 'retry_checkout'
  | 'contact_support';

export type CompanionBootstrapIdentityMode =
  | 'none'
  | 'preview_individual'
  | 'unbound_checkout';

export interface CompanionBootstrapResponse {
  id: string;
  verifiedAt: string;
  source: 'stripe_checkout_session';
  status: 'open' | 'complete' | 'expired';
  paymentStatus?: string | null;
  customerEmail?: string | null;
  planCode?: CompanionCheckoutPlanCode;
  canEnterCompanion: boolean;
  accessState: CompanionBootstrapAccessState;
  nextAction: CompanionBootstrapNextAction;
  identityMode: CompanionBootstrapIdentityMode;
  continuityWindowDays: number;
  mode: 'companion_bootstrap';
  detail?: string;
  companionHome?: CompanionHomePayload;
}

export type CompanionAuthReturnState =
  | 'return_pending'
  | 'provider_returned'
  | 'provider_error'
  | 'missing_transaction'
  | 'expired_transaction'
  | 'session_mismatch'
  | 'provider_mismatch'
  | 'state_mismatch';

export interface CompanionIdentityBindingRequest {
  sessionId: string;
  previewIndividualId?: string;
  bindingMode?: 'preview' | 'auth';
  identityProvider?: 'google' | 'apple' | 'email' | 'manual';
  callbackState?: CompanionAuthReturnState;
}

export interface CompanionIdentityBindingResponse {
  sessionId: string;
  verifiedAt: string;
  bindingState: 'bound_preview' | 'needs_auth' | 'needs_support';
  nextAction: 'launch_companion' | 'complete_auth' | 'contact_support';
  identityProvider?: 'google' | 'apple' | 'email' | 'manual';
  authReturnState?: CompanionAuthReturnState;
  individualId?: string;
  detail?: string;
  companionHome?: CompanionHomePayload;
}

export type EchoLinkDomain =
  | 'identity_gate'
  | 'biology'
  | 'recovery'
  | 'movement'
  | 'attention'
  | 'frequency';

export type EchoLinkProviderKey =
  | 'apple'
  | 'google'
  | 'healthkit'
  | 'health_connect'
  | 'oura'
  | 'whoop'
  | 'strava'
  | 'garmin'
  | 'coros'
  | 'screen_time'
  | 'focus_modes'
  | 'spotify'
  | 'apple_music';

export type EchoLinkAuthMode = 'oauth' | 'native_aggregate' | 'device_bridge' | 'manual';

export type EchoLinkAccountStatus =
  | 'available'
  | 'pending'
  | 'active'
  | 'paused'
  | 'attention'
  | 'error'
  | 'revoked';

export type EchoLinkSyncStatus =
  | 'idle'
  | 'queued'
  | 'syncing'
  | 'success'
  | 'attention'
  | 'failed'
  | 'stale';

export type EchoLinkSignalType =
  | 'identity'
  | 'sleep'
  | 'recovery'
  | 'activity'
  | 'steps'
  | 'workout'
  | 'heart_rate'
  | 'hrv'
  | 'strain'
  | 'readiness'
  | 'screen_time'
  | 'focus_state'
  | 'music_activity'
  | 'playback_state';

export type EchoLinkScopeId =
  | 'identity_basic'
  | 'sleep'
  | 'recovery'
  | 'activity'
  | 'steps'
  | 'workout'
  | 'heart_rate'
  | 'hrv'
  | 'strain'
  | 'readiness'
  | 'screen_time'
  | 'focus_state'
  | 'music_activity'
  | 'playback_state';

export type EchoLinkContractStatus = 'active' | 'paused' | 'stale' | 'attention' | 'error' | 'revoked';

export type EchoLinkFreshnessTier = 'fresh' | 'steady' | 'aging' | 'stale' | 'unknown';

export interface EchoLinkProviderContract {
  providerKey: EchoLinkProviderKey;
  domain: EchoLinkDomain;
  displayName: string;
  description: string;
  authMode: EchoLinkAuthMode;
  signalTypes: EchoLinkSignalType[];
  supportedScopes: EchoLinkScopeId[];
  isIdentityProvider?: boolean;
}

export interface EchoLinkDomainGroup {
  domain: EchoLinkDomain;
  title: string;
  promptLine: string;
  providers: EchoLinkProviderContract[];
}

export interface EchoLinkSignalContract {
  signalType: EchoLinkSignalType;
  contractStatus: EchoLinkContractStatus;
  freshnessTier: EchoLinkFreshnessTier;
  lastEventAt?: string | null;
  latestSyncStatus?: EchoLinkSyncStatus | null;
  latestSyncFinishedAt?: string | null;
  events7d: number;
  events30d: number;
}

export interface EchoLinkConnectedProvider {
  providerKey: EchoLinkProviderKey;
  domain: EchoLinkDomain;
  displayName: string;
  authMode: EchoLinkAuthMode;
  signalTypes: EchoLinkSignalType[];
  supportedScopes: EchoLinkScopeId[];
  isIdentityProvider?: boolean;
  status: EchoLinkAccountStatus;
  connectedAt?: string | null;
  lastSyncAt?: string | null;
  lastWebhookAt?: string | null;
  latestSyncStatus?: EchoLinkSyncStatus | null;
  latestSyncFinishedAt?: string | null;
  events7d: number;
  events30d: number;
  lastEventAt?: string | null;
  consent: Partial<Record<EchoLinkScopeId, boolean>>;
  contracts: EchoLinkSignalContract[];
}

export interface EchoLinkManifest {
  ok: true;
  surface: 'navigate';
  link: {
    groups: EchoLinkDomainGroup[];
    connectedCount: number;
    attentionCount: number;
    identityGateProviders: Array<Extract<EchoLinkProviderKey, 'apple' | 'google'>>;
  };
}

export interface EchoLinkContextResponse {
  ok: true;
  surface: 'navigate';
  context: {
    connectedProviders: EchoLinkConnectedProvider[];
    pressureHints: string[];
  };
}

export type AltitudeRuntimeMode = 'companion-home' | 'console-case' | 'core-operations';

export interface AltitudeRuntimeCompanionHomeRequest {
  mode: 'companion-home';
  individualId: string;
}

export interface AltitudeRuntimeConsoleCaseRequest {
  mode: 'console-case';
  individualId: string;
  caseId?: string;
}

export interface AltitudeRuntimeCoreOperationsRequest {
  mode: 'core-operations';
  organizationId?: string;
}

export type AltitudeRuntimeRequest =
  | AltitudeRuntimeCompanionHomeRequest
  | AltitudeRuntimeConsoleCaseRequest
  | AltitudeRuntimeCoreOperationsRequest;

export interface AltitudeRuntimeEnvelope<TPayload> {
  ok: true;
  mode: AltitudeRuntimeMode;
  payload: TPayload;
}

export type AssetObservationSurface =
  | 'homepage'
  | 'companion'
  | 'console'
  | 'core'
  | 'journey'
  | 'insight'
  | 'article'
  | 'studio'
  | 'practice'
  | 'play'
  | 'talk'
  | 'navigate'
  | 'signal'
  | 'design_center';

export type AssetRuntimeObservationEventOutcome =
  | 'rendered'
  | 'proxy_failed'
  | 'family_fallback'
  | 'item_native_used'
  | 'missing';

export interface AssetRuntimeObservationEvent {
  surface: AssetObservationSurface;
  assetId?: string;
  familyKey?: string;
  requestedVariant?: string;
  resolvedVariant?: string;
  outcome: AssetRuntimeObservationEventOutcome;
  loadMs?: number;
  runtimeContext?: Record<string, unknown>;
}

export interface AssetRuntimeObservationRequest {
  observations: AssetRuntimeObservationEvent[];
}

export interface AssetRuntimeObservationResponse {
  accepted: number;
}
