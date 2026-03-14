/**
 * RUNTIME GATEWAY — Unified Frontend Entry Point
 *
 * One import. Six runtime domains. Two modes.
 *
 * This is the single gateway through which all surfaces access runtime truth.
 * It does NOT own truth — it routes to the right runtime client.
 *
 * Modes:
 *   'mock'     — make-server serves as persistence/mock layer
 *   'live'     — external runtime Edge Functions serve as truth
 *
 * The gateway currently defaults to 'mock' for all domains except 'content'
 * and 'play', which already point at live external runtimes.
 *
 * As external runtimes come online, flip the mode per domain.
 *
 * Rule: Do NOT add business logic here. This is a routing layer.
 */

import * as contentRuntime from './content-runtime';
import * as signalRuntime from './signal-runtime';
import * as navigateRuntime from './navigate-runtime';
import * as talkExternalRuntime from './talk-external-runtime';
import * as playRuntime from './usePlayRuntime';

// ─── Mode configuration ───

export type RuntimeMode = 'mock' | 'live';

interface RuntimeConfig {
  content: RuntimeMode;
  play: RuntimeMode;
  signal: RuntimeMode;
  navigate: RuntimeMode;
  talk: RuntimeMode;
}

/** Current runtime mode per domain.
 *  Flip individual domains to 'live' as external runtimes are deployed. */
const config: RuntimeConfig = {
  content: 'live',    // content-runtime Edge Function is live
  play: 'live',       // play-runtime Edge Function is live (graceful degradation)
  signal: 'live',     // signal-runtime Edge Function — attempt live, fallback to mock
  navigate: 'live',   // navigate-runtime Edge Function — attempt live, fallback to mock
  talk: 'mock',       // talk uses make-server for persistence + LLM; external for prompt discovery
};

// ─── Gateway exports ───

export const gateway = {
  /** Content domain — videos, articles, soundbites, journeys */
  content: contentRuntime,

  /** Signal domain — PLOT (now truth) + MAP (constellation) */
  signal: signalRuntime,

  /** Navigate domain — LINK (support / infrastructure / SOS) */
  navigate: navigateRuntime,

  /** Talk external domain — prompt discovery + dispatch */
  talkDiscovery: talkExternalRuntime,

  /** Current mode for each domain */
  config,

  /** Check if a domain is in live mode */
  isLive: (domain: keyof RuntimeConfig): boolean => config[domain] === 'live',
} as const;

// ─── Health check across all live runtimes ───

export async function checkAllRuntimes(): Promise<
  Record<string, { available: boolean; error?: string }>
> {
  const results: Record<string, { available: boolean; error?: string }> = {};

  const checks = [
    { name: 'content', fn: contentRuntime.health },
    { name: 'play', fn: playRuntime.health },
    { name: 'signal', fn: signalRuntime.health },
    { name: 'navigate', fn: navigateRuntime.health },
    { name: 'talk-external', fn: talkExternalRuntime.health },
  ];

  await Promise.allSettled(
    checks.map(async ({ name, fn }) => {
      const { data, error } = await fn();
      results[name] = {
        available: !error && !!data,
        error: error || undefined,
      };
      console.info(`[runtime-gateway] ${name}: ${results[name].available ? 'LIVE' : `DOWN (${error})`}`);
    }),
  );

  return results;
}

export type { RuntimeConfig };