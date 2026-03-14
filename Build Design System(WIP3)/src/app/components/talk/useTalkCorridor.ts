/**
 * useTalkCorridor — The Runtime Spine
 *
 * This hook owns ALL non-visual behavior for the TALK corridor:
 *   - constellation loading & persistence
 *   - ∞MAP talk seed ingestion
 *   - prompt selection & LLM evolution
 *   - entry creation & sealing
 *   - schema detection (SEEK bridge)
 *   - KBE nudging (fire-and-forget)
 *   - deep thread mining (fire-and-forget)
 *   - phase orchestration (timing between phases)
 *   - rest invitation logic
 *
 * TalkSurface consumes this hook and renders.
 * TalkSurface does NOT import talk-runtime, does NOT call fetch,
 * does NOT manage prompt evolution, does NOT touch persistence.
 *
 * This is the runtime boundary the review directive demands.
 *
 * Shell law: TalkSurface renders what this hook tells it to.
 * Runtime law: This hook decides what happens and when.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { TalkPrompt, TalkEntry, TalkPhase, TalkReflection, TalkLane } from './talk-types';
import { selectPrompts, generateReflection } from './talk-seeds';
import {
  saveEntries,
  loadEntries,
  evolvePrompts,
  detectSchemas,
  nudgeKBEFromJournal,
  deepMineThreads,
  promoteThemeToInsight,
  type DetectedSchema,
  type MinedTheme,
} from './talk-runtime';

import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useIndividualId } from '../runtime/session-seam';
import { hapticSeal } from '../surfaces/haptics';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export interface TalkSeed {
  nodeId: string;
  schema: string;
  label: string;
  integration: number;
}

export interface CorridorState {
  /** Current corridor phase */
  phase: TalkPhase;
  /** Available prompts (2-3 luminous doorways) */
  prompts: TalkPrompt[];
  /** Currently selected prompt (writing/sealing phase) */
  activePrompt: TalkPrompt | null;
  /** All sealed entries (the constellation) */
  entries: TalkEntry[];
  /** Session depth (increments with each seal) */
  sessionDepth: number;
  /** Active reflection (reflecting phase) */
  reflection: TalkReflection | null;
  /** Whether the thread map should be prominent */
  showThread: boolean;
  /** Detected schemas for the bridge */
  detectedSchemas: DetectedSchema[];
  /** Mined themes from deep thread analysis */
  minedThemes: MinedTheme[];
  /** ∞MAP talk seed (if present) */
  talkSeed: TalkSeed | null;
  /** Whether rest invitation is showing */
  restInvitationVisible: boolean;
  /** Whether constellation data has loaded */
  loaded: boolean;
}

export interface CorridorActions {
  /** User selected a prompt doorway */
  selectPrompt: (prompt: TalkPrompt) => void;
  /** User sealed an entry (hold-to-seal complete) */
  sealEntry: (text: string) => void;
  /** User tapped the rest invitation */
  enterRest: () => void;
  /** Schema bridge navigation (TALK→SEEK/FORM) */
  navigateSchema: (insightId: string) => void;
}

// ═══════════════════════════════════════════════════
// THE HOOK
// ═══════════════════════════════════════════════════

export function useTalkCorridor(opts: {
  arrived: boolean;
  modeId: string;
  onResolve?: () => void;
  onNavigate?: (modeId: string, payload?: { schema?: string; insightId?: string }) => void;
}): [CorridorState, CorridorActions] {
  const { arrived, modeId, onResolve, onNavigate } = opts;
  const userId = useIndividualId();

  // ─── Core state ───
  const [phase, setPhase] = useState<TalkPhase>('arriving');
  const [prompts, setPrompts] = useState<TalkPrompt[]>([]);
  const [activePrompt, setActivePrompt] = useState<TalkPrompt | null>(null);
  const [entries, setEntries] = useState<TalkEntry[]>([]);
  const [sessionDepth, setSessionDepth] = useState(0);
  const [reflection, setReflection] = useState<TalkReflection | null>(null);
  const [showThread, setShowThread] = useState(false);
  const [detectedSchemas, setDetectedSchemas] = useState<DetectedSchema[]>([]);
  const [minedThemes, setMinedThemes] = useState<MinedTheme[]>([]);
  const [talkSeed, setTalkSeed] = useState<TalkSeed | null>(null);
  const [restInvitationVisible, setRestInvitationVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deepMineTriggered, setDeepMineTriggered] = useState(false);

  const usedPromptIdsRef = useRef(new Set<string>());

  // ─── Constellation loading (one-shot on mount) ───
  useEffect(() => {
    if (loaded) return;

    const TALK_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
    const talkHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };

    Promise.all([
      loadEntries(userId),
      fetch(`${TALK_BASE}/map/talk-seed/${userId}`, { headers: talkHeaders })
        .then(r => r.ok ? r.json() : { seed: null, found: false })
        .catch(() => ({ seed: null, found: false })),
    ]).then(([entryData, seedData]) => {
      const { entries: loadedEntries, sessionDepth: depth, found } = entryData;
      if (found && loadedEntries.length > 0) {
        setEntries(loadedEntries);
        setSessionDepth(depth);
        loadedEntries.forEach((e: TalkEntry) => usedPromptIdsRef.current.add(e.promptId));
        console.log(`[TALK] Restored ${loadedEntries.length} entries at depth ${depth}`);
      }

      if (seedData.found && seedData.seed) {
        setTalkSeed(seedData.seed);
        console.log(`[TALK] ∞MAP seed loaded: ${seedData.seed.label} (${seedData.seed.nodeId})`);
      }

      setLoaded(true);
    });
  }, [loaded, userId]);

  // ─── Mode change reset ───
  useEffect(() => {
    setPhase('arriving');
    setPrompts([]);
    setActivePrompt(null);
    setReflection(null);
    setShowThread(false);
    setDetectedSchemas([]);
  }, [modeId]);

  // ─── Arrival → prompting transition ───
  useEffect(() => {
    if (arrived && phase === 'arriving' && loaded) {
      const timer = setTimeout(async () => {
        let nextPrompts: TalkPrompt[];

        if (talkSeed) {
          nextPrompts = [
            {
              id: `seed-${talkSeed.nodeId}-what`,
              text: `What does "${talkSeed.schema}" look like in your daily life?`,
              lane: 'pattern' as TalkLane,
              depth: sessionDepth,
            },
            {
              id: `seed-${talkSeed.nodeId}-feel`,
              text: `When you think about ${talkSeed.label.toLowerCase()}, where do you feel it in your body?`,
              lane: 'body' as TalkLane,
              depth: sessionDepth,
            },
            {
              id: `seed-${talkSeed.nodeId}-origin`,
              text: `When did you first learn this pattern?`,
              lane: 'origin' as TalkLane,
              depth: sessionDepth,
            },
          ];
          console.log(`[TALK] Schema-focused prompts from ∞MAP seed: ${talkSeed.label}`);
        } else if (entries.length > 0) {
          const evolved = await evolvePrompts(entries, sessionDepth);
          if (evolved.prompts && evolved.prompts.length > 0) {
            nextPrompts = evolved.prompts;
            console.log('[TALK] Using LLM-evolved prompts');
          } else {
            nextPrompts = selectPrompts(sessionDepth, usedPromptIdsRef.current);
            console.log('[TALK] LLM fallback — using template prompts');
          }
        } else {
          nextPrompts = selectPrompts(0, usedPromptIdsRef.current);
        }

        setPrompts(nextPrompts);
        setPhase('prompting');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [arrived, phase, loaded, entries.length, sessionDepth, talkSeed]);

  // ─── Rest invitation (3+ entries, during prompting) ───
  useEffect(() => {
    if (phase !== 'prompting' || sessionDepth < 3) {
      setRestInvitationVisible(false);
      return;
    }
    const t = setTimeout(() => setRestInvitationVisible(true), 3000);
    return () => clearTimeout(t);
  }, [phase, sessionDepth]);

  // ─── Deep thread mining (milestones: 10, 15, 20, ...) ───
  useEffect(() => {
    const milestone = entries.length >= 10 && entries.length % 5 === 0;
    if (!milestone || deepMineTriggered) return;

    setDeepMineTriggered(true);

    deepMineThreads(entries, userId).then(({ themes, mined }) => {
      if (mined && themes.length > 0) {
        setMinedThemes(themes);
        console.log(`[TALK] Deep mine: ${themes.length} themes at ${entries.length} entries`);

        themes
          .filter(t => t.insightCandidate && t.suggestedInsightTitle)
          .forEach(t => { promoteThemeToInsight(t, userId); });

        setTimeout(() => setMinedThemes([]), 15000);
      }
      setTimeout(() => setDeepMineTriggered(false), 60000);
    });
  }, [entries.length, deepMineTriggered, userId]);

  // ─── Actions ───

  const selectPrompt = useCallback((prompt: TalkPrompt) => {
    setActivePrompt(prompt);
    usedPromptIdsRef.current.add(prompt.id);
    setPhase('writing');
  }, []);

  const sealEntry = useCallback((text: string) => {
    if (!activePrompt || !text.trim()) return;

    setPhase('sealing');

    // Thread position — golden angle spiral
    const angle = entries.length * 137.5 * Math.PI / 180;
    const radius = 0.08 + entries.length * 0.035;
    const threadX = 0.5 + Math.cos(angle) * radius;
    const threadY = 0.5 + Math.sin(angle) * radius;

    const entry: TalkEntry = {
      id: `entry-${Date.now()}`,
      promptId: activePrompt.id,
      promptText: activePrompt.text,
      response: text.trim(),
      timestamp: Date.now(),
      lane: activePrompt.lane,
      depth: activePrompt.depth,
      threadPosition: {
        x: Math.max(0.15, Math.min(0.85, threadX)),
        y: Math.max(0.15, Math.min(0.85, threadY)),
      },
    };

    const newEntries = [...entries, entry];
    setEntries(newEntries);

    const newDepth = sessionDepth + 1;
    setSessionDepth(newDepth);

    hapticSeal();

    // ── Fire-and-forget side effects ──
    saveEntries(newEntries, newDepth, userId);

    if (newEntries.length >= 3 && newEntries.length % 2 === 1) {
      detectSchemas(newEntries).then(({ schemas, detected }) => {
        if (detected) {
          setDetectedSchemas(schemas);
          console.log('[TALK] Schemas detected:', schemas.map(s => s.insightId).join(', '));
          nudgeKBEFromJournal(schemas, userId);
        }
      });
    }

    // ── Phase orchestration: seal → thread → reflect → prompt ──
    setTimeout(() => {
      setShowThread(true);
      setPhase('threading');

      const ref = generateReflection(entry);

      setTimeout(async () => {
        setShowThread(false);

        if (ref) {
          setReflection(ref);
          setPhase('reflecting');

          setTimeout(async () => {
            setReflection(null);

            const evolved = await evolvePrompts(newEntries, newDepth, entry.lane);
            let nextPrompts: TalkPrompt[];

            if (evolved.prompts && evolved.prompts.length > 0) {
              nextPrompts = evolved.prompts;
              console.log('[TALK] Evolved prompts via LLM');
            } else {
              nextPrompts = selectPrompts(newDepth, usedPromptIdsRef.current, entry.lane);
              console.log('[TALK] Template prompts (LLM fallback)');
            }

            setPrompts(nextPrompts);
            setActivePrompt(null);
            setPhase('prompting');
          }, 4000);
        } else {
          const evolved = await evolvePrompts(newEntries, newDepth, entry.lane);
          let nextPrompts: TalkPrompt[];

          if (evolved.prompts && evolved.prompts.length > 0) {
            nextPrompts = evolved.prompts;
            console.log('[TALK] Evolved prompts via LLM');
          } else {
            nextPrompts = selectPrompts(newDepth, usedPromptIdsRef.current, entry.lane);
            console.log('[TALK] Template prompts (LLM fallback)');
          }

          setPrompts(nextPrompts);
          setActivePrompt(null);
          setPhase('prompting');
        }
      }, 2500);
    }, 1500);
  }, [activePrompt, entries, sessionDepth, userId]);

  const enterRest = useCallback(() => {
    setRestInvitationVisible(false);
    setPhase('resting');
    setTimeout(() => { onResolve?.(); }, 6000);
  }, [onResolve]);

  const navigateSchema = useCallback((insightId: string) => {
    const schema = detectedSchemas.find(s => s.insightId === insightId);
    console.log(`[TALK→FORM/SEEK] Schema bridge tapped: ${insightId}`);
    setDetectedSchemas([]);

    if (onNavigate) {
      const TALK_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
      const talkHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      };

      fetch(`${TALK_BASE}/talk/form-handoff`, {
        method: 'POST',
        headers: talkHeaders,
        body: JSON.stringify({
          userId,
          insightId,
          schema: schema?.matchedText || insightId,
          source: 'talk-schema-bridge',
          timestamp: Date.now(),
        }),
      }).catch(err => console.error('[TALK→FORM] Handoff persist failed:', err));

      onNavigate('form', { schema: schema?.matchedText || insightId, insightId });
    } else {
      onResolve?.();
    }
  }, [onResolve, onNavigate, detectedSchemas, userId]);

  // ─── Compose state and actions ───

  const state: CorridorState = {
    phase,
    prompts,
    activePrompt,
    entries,
    sessionDepth,
    reflection,
    showThread,
    detectedSchemas,
    minedThemes,
    talkSeed,
    restInvitationVisible,
    loaded,
  };

  const actions: CorridorActions = useMemo(() => ({
    selectPrompt,
    sealEntry,
    enterRest,
    navigateSchema,
  }), [selectPrompt, sealEntry, enterRest, navigateSchema]);

  return [state, actions];
}
