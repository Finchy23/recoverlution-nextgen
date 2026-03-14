import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  MessageSquareText,
  Route,
  Waypoints,
} from 'lucide-react';

import { talkResponseFamilies } from '@recoverlution/content/talk';
import {
  createTalkCorridorActor,
  createTalkLifecycleEvent,
  getAllowedTalkMoves,
  resolveTalkTurn,
} from '@recoverlution/talk-core';
import type {
  TalkCorridorPhase,
  TalkCorridorRouteTarget,
  TalkDispatchResponse,
  TalkGuidanceCandidate,
  TalkLane,
  TalkLifecycleEvent,
  TalkMachineEvent,
  TalkOrientationState,
  TalkResponseMove,
  TalkRuntimeObjective,
  TalkRuntimeRouteTarget,
  TalkSafetyBand,
  TalkSessionResponse,
} from '@recoverlution/types';
import {
  TalkActionButton,
  TalkCorridorPanel,
  TalkDeviceScreen,
  TalkPanel,
  TalkPill,
  TalkResponseMatrixPanel,
  TalkThreadTopologyPanel,
  type TalkTheme,
} from '@recoverlution/ui/talk';

import { colors, fonts, surfaces, withAlpha } from '@/design-tokens';
import { talkRuntime } from '@/utils/talkRuntime';
import { LabShell } from './components/LabShell';
import { useDeviceMirror } from './components/DeviceMirror';
import { sectionAccents } from './dc-tokens';

const FIELD_STYLE: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 12,
  border: `1px solid ${withAlpha(colors.neutral.white, 0.08)}`,
  background: withAlpha(colors.neutral.white, 0.035),
  color: colors.neutral.white,
  fontFamily: fonts.primary,
  fontSize: 12,
  outline: 'none',
};

const OBJECTIVES: TalkRuntimeObjective[] = [
  'open_talk_corridor',
  'clarify_current_friction',
  'gather_backstory_fragment',
  'dispatch_to_regulation',
  'dispatch_to_meaning',
  'seal_after_route',
];

const ORIENTATIONS: TalkOrientationState[] = [
  'compressed',
  'flooded',
  'fogged',
  'reflective',
  'avoidant',
  'relational',
  'body_led',
  'ready_to_seal',
];

const LANES: TalkLane[] = [
  'present',
  'body',
  'mirror',
  'relationship',
  'pattern',
  'fear',
  'desire',
  'origin',
];

const SAFETY_BANDS: TalkSafetyBand[] = ['safe', 'constrained', 'restricted'];

const CORRIDOR_TARGETS: Array<TalkCorridorRouteTarget | 'auto'> = [
  'auto',
  'seek',
  'form',
  'play',
  'practice',
  'rest',
  'navicue',
];

const corridorRouteToRuntimeTarget: Record<TalkCorridorRouteTarget, TalkRuntimeRouteTarget> = {
  seek: 'insight',
  form: 'journey',
  play: 'soundbite',
  practice: 'practice',
  rest: 'article',
  navicue: 'navicue',
};

const phaseTitles: Record<TalkCorridorPhase, string> = {
  arriving: 'Corridor at rest',
  prompting: 'A doorway is open',
  writing: 'The page is listening',
  sealing: 'Truth is being sealed',
  reflecting: 'The next move is narrowing',
  threading: 'The thread is settling',
  resting: 'The room has gone quiet',
};

const phaseBodies: Record<TalkCorridorPhase, string> = {
  arriving: 'Nothing pushes. The corridor waits for a first signal.',
  prompting: 'Use one signpost or prompt. The system should feel invitational, not hungry.',
  writing: 'This is not chat. It is one page, one truth, one body of language.',
  sealing: 'The room compresses around what was said so it can become part of the thread.',
  reflecting: 'The response matrix chooses one bounded move, not a flood of explanation.',
  threading: 'What was said now belongs to topology, not transcript.',
  resting: 'Exit stays graceful. The room can close without feeling abandoned.',
};

const fallbackCandidates: TalkGuidanceCandidate[] = [
  {
    guidance_id: 'local-entry-01',
    guidance_type: 'signpost',
    guidance_subtype: 'entry',
    title: 'First Signal',
    body_md: 'You do not need the whole story. Start with the first signal.',
    response_contract: 'tap_continue',
    route_affinity: ['talk'],
    score: 1,
    reason_codes: { source: 'local_fallback' },
  },
  {
    guidance_id: 'local-entry-02',
    guidance_type: 'prompt',
    guidance_subtype: 'inquiry',
    title: 'The Smallest Truth',
    body_md: 'What is the smallest true sentence you can say right now?',
    response_contract: 'short_text',
    route_affinity: ['talk'],
    score: 0.9,
    reason_codes: { source: 'local_fallback' },
  },
  {
    guidance_id: 'local-entry-03',
    guidance_type: 'prompt',
    guidance_subtype: 'body',
    title: 'Start Where It Landed',
    body_md: 'Before the story arrives, where did the body move first?',
    response_contract: 'short_text',
    route_affinity: ['talk'],
    score: 0.85,
    reason_codes: { source: 'local_fallback' },
  },
];

interface SealedEntry {
  entryId: string;
  promptId: string;
  promptTitle: string;
  excerpt: string;
  lane: TalkLane;
  orientation: TalkOrientationState;
  depth: number;
  move: TalkResponseMove | null;
  routeTarget: TalkCorridorRouteTarget | null;
  sealedAtIso: string;
}

function markdownToPlainText(value: string): string {
  return value
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildFallbackSession(
  objective: TalkRuntimeObjective,
  stateBand: string,
): TalkSessionResponse {
  return {
    ok: true,
    service: 'talk-runtime',
    version: 'local-fallback',
    policy_key: 'talk_corridor_fallback',
    session: {
      objective,
      state_band: stateBand,
      surface: 'talk',
      time_horizon: null,
      limit: fallbackCandidates.length,
    },
    primary: fallbackCandidates[0],
    candidates: fallbackCandidates,
    gaps: [],
  };
}


export default function TalkCorridorLab() {
  const { setContent, resetContent } = useDeviceMirror();
  const actorRef = useRef<ReturnType<typeof createTalkCorridorActor> | null>(null);
  const [snapshot, setSnapshot] = useState(() => {
    const actor = createTalkCorridorActor();
    actorRef.current = actor;
    return actor.getSnapshot();
  });
  const [objective, setObjective] = useState<TalkRuntimeObjective>('open_talk_corridor');
  const [stateBand, setStateBand] = useState('amber');
  const [orientation, setOrientation] = useState<TalkOrientationState>('reflective');
  const [lane, setLane] = useState<TalkLane>('present');
  const [depth, setDepth] = useState(2);
  const [safetyBand, setSafetyBand] = useState<TalkSafetyBand>('safe');
  const [routeTargetPreference, setRouteTargetPreference] = useState<TalkCorridorRouteTarget | 'auto'>('auto');
  const [selectedCandidate, setSelectedCandidate] = useState<TalkGuidanceCandidate | null>(null);
  const [entryDraft, setEntryDraft] = useState('');
  const [requestedMove, setRequestedMove] = useState<TalkResponseMove>('mirror');
  const [runtimeSession, setRuntimeSession] = useState<TalkSessionResponse | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback' | 'error'>('idle');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [dispatchPreview, setDispatchPreview] = useState<TalkDispatchResponse | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [sealedEntries, setSealedEntries] = useState<SealedEntry[]>([]);
  const [eventLog, setEventLog] = useState<TalkLifecycleEvent[]>([]);
  const [entryMode, setEntryMode] = useState<'pen' | 'voice'>('pen');
  const responseResolutionKeyRef = useRef('');

  const phase = snapshot.value as TalkCorridorPhase;
  const allowedMoves = useMemo(() => getAllowedTalkMoves(orientation), [orientation]);
  const lifecycleContextRef = useRef({
    phase,
    lane,
    orientation,
    depth,
  });
  lifecycleContextRef.current = {
    phase,
    lane,
    orientation,
    depth,
  };

  const sendCorridorEvent = useCallback((event: TalkMachineEvent) => {
    const actor = actorRef.current;
    if (!actor) return;
    actor.send(event);
    setSnapshot(actor.getSnapshot());
  }, []);

  useEffect(() => {
    const actor = actorRef.current;
    if (!actor) return;

    const subscription = actor.subscribe((nextSnapshot) => {
      setSnapshot(nextSnapshot);
    });

    return () => {
      subscription.unsubscribe();
      actor.stop();
      actorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!allowedMoves.includes(requestedMove)) {
      setRequestedMove(allowedMoves[0]);
    }
  }, [allowedMoves, requestedMove]);

  const turnResolution = useMemo(
    () =>
      resolveTalkTurn({
        orientation,
        lane,
        depth,
        requestedMove,
        safetyBand,
        routeTarget: routeTargetPreference === 'auto' ? undefined : routeTargetPreference,
      }),
    [depth, lane, orientation, requestedMove, routeTargetPreference, safetyBand],
  );

  const primaryFamily = turnResolution.primaryFamily;
  const currentRouteTarget =
    primaryFamily?.move === 'route' && primaryFamily.routeTarget
      ? primaryFamily.routeTarget
      : null;
  const runtimeRouteTarget = currentRouteTarget
    ? corridorRouteToRuntimeTarget[currentRouteTarget]
    : null;
  const candidates = runtimeSession?.candidates ?? fallbackCandidates;
  const visibleCandidates = candidates.slice(0, 3);

  const threadNodes = useMemo(() => {
    const laneCounts = new Map<string, number>();
    const orientationCounts = new Map<string, number>();
    for (const entry of sealedEntries) {
      laneCounts.set(entry.lane, (laneCounts.get(entry.lane) ?? 0) + 1);
      orientationCounts.set(entry.orientation, (orientationCounts.get(entry.orientation) ?? 0) + 1);
    }
    return {
      lanes: [...laneCounts.entries()].sort((a, b) => b[1] - a[1]),
      orientations: [...orientationCounts.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [sealedEntries]);

  const talkTheme: TalkTheme = useMemo(
    () => ({
      accent: sectionAccents.talk,
      textPrimary: colors.neutral.white,
      textSecondary: withAlpha(colors.neutral.white, 0.58),
      textTertiary: withAlpha(colors.neutral.white, 0.46),
      surfaceBase: surfaces.solid.base,
      positiveAccent: colors.accent.green.primary,
      dangerAccent: colors.ui.gateRose,
      fontPrimary: fonts.primary,
      fontSecondary: fonts.secondary,
      fontMono: fonts.mono,
    }),
    [],
  );

  const logEvent = useCallback((
    name: TalkLifecycleEvent['name'],
    input: Partial<Omit<TalkLifecycleEvent, 'eventId' | 'name' | 'emittedAtIso' | 'phase' | 'lane' | 'orientation' | 'depth'>> = {},
  ) => {
    const { phase: currentPhase, lane: currentLane, orientation: currentOrientation, depth: currentDepth } =
      lifecycleContextRef.current;

    const event = createTalkLifecycleEvent({
      name,
      phase: currentPhase,
      lane: currentLane,
      orientation: currentOrientation,
      depth: currentDepth,
      ...input,
    });

    setEventLog((current) => [event, ...current].slice(0, 12));
  }, []);

  useEffect(() => {
    const promptOptions = visibleCandidates.map((candidate) => ({
      id: candidate.guidance_id,
      title: candidate.title,
      body: markdownToPlainText(candidate.body_md),
      overline: candidate.guidance_subtype ?? candidate.guidance_type,
      accent: sectionAccents.talk,
      active: candidate.guidance_id === selectedCandidate?.guidance_id,
      onSelect: () => selectCandidate(candidate),
    }));

    setContent({
      accent: sectionAccents.talk,
      glow: withAlpha(sectionAccents.talk, 0.18),
      breathPattern:
        orientation === 'flooded' ? 'box' : orientation === 'compressed' || orientation === 'body_led' ? 'simple' : 'calm',
      customRenderer: (
        <TalkDeviceScreen
          theme={talkTheme}
          phase={phase}
          phaseTitle={phaseTitles[phase]}
          candidateTitle={selectedCandidate ? selectedCandidate.title : 'The corridor is waiting.'}
          candidateBody={
            selectedCandidate
              ? markdownToPlainText(selectedCandidate.body_md)
              : 'User-instigated truth. One bounded next move.'
          }
          entryText={
            entryDraft.trim().length > 0
              ? entryDraft.trim()
              : phase === 'writing' && entryMode === 'voice'
                ? 'The voice lane is staged here. Keep the line simple and true.'
              : 'The page is quiet until the user begins.'
          }
          responseLine={primaryFamily?.copyShort ?? null}
          dispatchTitle={dispatchPreview?.dispatch.target_kind ?? null}
          dispatchRoute={dispatchPreview?.dispatch.route ?? null}
          opener="something is here"
          preamble={
            phase === 'prompting'
              ? 'The room can offer a few doorways. The user still begins.'
              : null
          }
          promptOptions={promptOptions}
          inputModes={[
            {
              id: 'pen',
              label: 'write',
              hint: 'one page, one line',
              active: entryMode === 'pen',
              onSelect: () => setEntryMode('pen'),
            },
            {
              id: 'voice',
              label: 'speak',
              hint: 'bounded witness lane',
              active: entryMode === 'voice',
              onSelect: () => setEntryMode('voice'),
            },
          ]}
        />
      ),
    });

    return () => resetContent();
  }, [
    dispatchPreview,
    entryDraft,
    entryMode,
    orientation,
    phase,
    primaryFamily?.copyShort,
    resetContent,
    selectCandidate,
    selectedCandidate,
    setContent,
    talkTheme,
    visibleCandidates,
  ]);

  useEffect(() => {
    if (phase !== 'reflecting' || !primaryFamily) return;

    const resolutionKey = [
      phase,
      primaryFamily.familyId,
      lane,
      orientation,
      depth,
      selectedCandidate?.guidance_id ?? 'no-prompt',
    ].join(':');

    if (responseResolutionKeyRef.current === resolutionKey) return;
    responseResolutionKeyRef.current = resolutionKey;

    logEvent('talk_response_resolved', {
      promptId: selectedCandidate?.guidance_id ?? null,
      responseFamilyId: primaryFamily.familyId,
      routeTarget: primaryFamily.routeTarget ?? null,
      status: 'success',
    });
  }, [depth, lane, logEvent, orientation, phase, primaryFamily, selectedCandidate?.guidance_id]);

  const openCorridor = useCallback(async () => {
    setRuntimeStatus('loading');
    setRuntimeError(null);
    setDispatchPreview(null);
    setDispatchError(null);
    setDispatchStatus('idle');

    try {
      const session = await talkRuntime.createSession({
        objective,
        state_band: stateBand,
        surface: 'talk',
        limit: 5,
      });
      setRuntimeSession(session);
      setRuntimeStatus('ready');
      logEvent('talk_corridor_opened', {
        promptId: session.primary?.guidance_id ?? null,
        status: 'success',
      });
    } catch (error) {
      setRuntimeSession(buildFallbackSession(objective, stateBand));
      setRuntimeStatus('fallback');
      setRuntimeError(error instanceof Error ? error.message : 'Unable to reach the TALK runtime.');
      logEvent('talk_corridor_opened', {
        promptId: fallbackCandidates[0]?.guidance_id ?? null,
        status: 'fallback',
        notes: [error instanceof Error ? error.message : 'runtime unreachable'],
      });
    }

    sendCorridorEvent({ type: 'PROMPTS_READY' });
    setSelectedCandidate(null);
    setEntryDraft('');
    setEntryMode('pen');
    setRequestedMove('mirror');
  }, [logEvent, objective, sendCorridorEvent, stateBand]);

  useEffect(() => {
    void openCorridor();
    // We intentionally refresh when the corridor posture changes so the proving ground
    // stays honest about what the live runtime would surface for this moment class.
  }, [openCorridor]);

  const selectCandidate = useCallback((candidate: TalkGuidanceCandidate) => {
    setSelectedCandidate(candidate);
    setEntryDraft('');
    setEntryMode('pen');
    setRequestedMove('mirror');
    setDispatchPreview(null);
    setDispatchError(null);
    setDispatchStatus('idle');
    sendCorridorEvent({
      type: 'SELECT_PROMPT',
      promptId: candidate.guidance_id,
      lane,
      depth,
    });
    logEvent('talk_prompt_selected', {
      promptId: candidate.guidance_id,
      status: 'success',
    });
  }, [depth, lane, logEvent, sendCorridorEvent]);

  function sealCurrentEntry() {
    if (!selectedCandidate || entryDraft.trim().length === 0) return;

    const entryId = `talk-entry-${Date.now()}`;
    setSealedEntries((current) => [
      {
        entryId,
        promptId: selectedCandidate.guidance_id,
        promptTitle: selectedCandidate.title,
        excerpt: entryDraft.trim(),
        lane,
        orientation,
        depth,
        move: primaryFamily?.move ?? null,
        routeTarget: currentRouteTarget,
        sealedAtIso: new Date().toISOString(),
      },
      ...current,
    ]);

    sendCorridorEvent({ type: 'SEAL', entryId });
    sendCorridorEvent({ type: 'REFLECTION_READY' });
    logEvent('talk_entry_sealed', {
      promptId: selectedCandidate.guidance_id,
      responseFamilyId: primaryFamily?.familyId ?? null,
      routeTarget: currentRouteTarget,
      status: 'success',
    });
  }

  function settleThread() {
    sendCorridorEvent({ type: 'THREAD_SETTLED' });
    logEvent('talk_thread_settled', {
      promptId: selectedCandidate?.guidance_id ?? null,
      responseFamilyId: primaryFamily?.familyId ?? null,
      routeTarget: currentRouteTarget,
      status: 'success',
    });
  }

  async function resolveRoute() {
    if (!runtimeRouteTarget) return;

    setDispatchStatus('loading');
    setDispatchError(null);

    try {
      const dispatch = await talkRuntime.dispatch({
        target_kind: runtimeRouteTarget,
        state_band: stateBand,
        time_horizon: phase === 'reflecting' ? 'immediate' : null,
      });
      setDispatchPreview(dispatch);
      setDispatchStatus('ready');
      sendCorridorEvent({
        type: 'ROUTE',
        target: currentRouteTarget as TalkCorridorRouteTarget,
      });
      logEvent('talk_route_resolved', {
        promptId: selectedCandidate?.guidance_id ?? null,
        responseFamilyId: primaryFamily?.familyId ?? null,
        routeTarget: runtimeRouteTarget,
        status: 'success',
      });
    } catch (error) {
      setDispatchStatus('error');
      setDispatchError(error instanceof Error ? error.message : 'Unable to resolve route.');
      logEvent('talk_route_resolved', {
        promptId: selectedCandidate?.guidance_id ?? null,
        responseFamilyId: primaryFamily?.familyId ?? null,
        routeTarget: runtimeRouteTarget,
        status: 'error',
        notes: [error instanceof Error ? error.message : 'route resolution failed'],
      });
    }
  }

  const phaseChips = ([
    'arriving',
    'prompting',
    'writing',
    'sealing',
    'reflecting',
    'threading',
    'resting',
  ] as TalkCorridorPhase[]).map((value) => ({
    id: value,
    label: value,
    active: value === phase,
  }));
  const candidateCards = visibleCandidates.map((candidate) => ({
    id: candidate.guidance_id,
    overline: `${candidate.guidance_type} / ${candidate.response_contract}`,
    title: candidate.title,
    body: markdownToPlainText(candidate.body_md),
    active: candidate.guidance_id === selectedCandidate?.guidance_id,
    onSelect: () => selectCandidate(candidate),
  }));
  const matrixFamily = primaryFamily
    ? {
        move: primaryFamily.move,
        voiceFamily: primaryFamily.voiceFamily,
        safetyBand: primaryFamily.safetyBand,
        routeTarget: primaryFamily.routeTarget ?? null,
        copy: primaryFamily.copyMedium,
        optionalPrompt: primaryFamily.optionalPrompt ?? null,
        editorialNotes: primaryFamily.editorialNotes,
        runtimeBridgeLabel: runtimeRouteTarget ? `runtime bridge -> ${runtimeRouteTarget}` : null,
      }
    : null;
  const matrixPrimaryActions = runtimeRouteTarget
    ? [
        {
          id: 'resolve-route',
          label: dispatchStatus === 'loading' ? 'resolving route' : 'resolve route',
          onClick: () => void resolveRoute(),
          disabled: dispatchStatus === 'loading',
          active: dispatchStatus === 'ready',
        },
        ...(phase === 'threading'
          ? [
              {
                id: 'open-next-corridor',
                label: 'open next corridor step',
                onClick: () => void openCorridor(),
              },
            ]
          : []),
      ]
    : [];
  const matrixSecondaryActions =
    phase === 'reflecting'
      ? [
          {
            id: 'settle-thread',
            label: 'settle into thread',
            onClick: settleThread,
          },
          ...(currentRouteTarget
            ? [
                {
                  id: 'route-out',
                  label: 'route out of corridor',
                  onClick: () => void resolveRoute(),
                  disabled: dispatchStatus === 'loading',
                },
              ]
            : []),
        ]
      : [];
  const threadEntryCards = sealedEntries.slice(0, 4).map((entry) => ({
    id: entry.entryId,
    lane: entry.lane,
    orientation: entry.orientation,
    routeTarget: entry.routeTarget,
    title: entry.promptTitle,
    excerpt: entry.excerpt,
  }));
  const stableNodeChips = [
    ...threadNodes.lanes.map(([value, count]) => ({
      id: `lane:${value}`,
      label: `${value} x${count}`,
      active: count > 1,
    })),
    ...threadNodes.orientations.map(([value, count]) => ({
      id: `orientation:${value}`,
      label: `${value} x${count}`,
      active: false,
    })),
  ];

  return (
    <LabShell
      eyebrow="talk corridor"
      headline="A bounded truth corridor. One doorway, one page, one next move."
      subline="This is the proving ground for TALK as a user-instigated corridor. The runtime opens the room, the response matrix governs the language, and the thread settles into topology instead of transcript."
    >
      <div style={{ display: 'grid', gap: 20 }}>
        <TalkPanel theme={talkTheme} eyebrow="runtime + law" title="Open the corridor from the live runtime, then keep the language governed on the glass.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, opacity: 0.24, color: colors.neutral.white }}>objective</span>
              <select value={objective} onChange={(event) => setObjective(event.target.value as TalkRuntimeObjective)} style={FIELD_STYLE}>
                {OBJECTIVES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, opacity: 0.24, color: colors.neutral.white }}>state band</span>
              <select value={stateBand} onChange={(event) => setStateBand(event.target.value)} style={FIELD_STYLE}>
                {['green', 'amber', 'red'].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, opacity: 0.24, color: colors.neutral.white }}>orientation</span>
              <select value={orientation} onChange={(event) => setOrientation(event.target.value as TalkOrientationState)} style={FIELD_STYLE}>
                {ORIENTATIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, opacity: 0.24, color: colors.neutral.white }}>lane</span>
              <select value={lane} onChange={(event) => setLane(event.target.value as TalkLane)} style={FIELD_STYLE}>
                {LANES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, opacity: 0.24, color: colors.neutral.white }}>depth</span>
              <input
                aria-label="depth"
                type="range"
                min={1}
                max={5}
                step={1}
                value={depth}
                onChange={(event) => setDepth(Number(event.target.value))}
              />
              <span style={{ fontFamily: fonts.primary, fontSize: 12, color: colors.neutral.white, opacity: 0.52 }}>
                depth {depth}
              </span>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, opacity: 0.24, color: colors.neutral.white }}>safety band</span>
              <select value={safetyBand} onChange={(event) => setSafetyBand(event.target.value as TalkSafetyBand)} style={FIELD_STYLE}>
                {SAFETY_BANDS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 10, opacity: 0.24, color: colors.neutral.white }}>route preference</span>
              <select value={routeTargetPreference} onChange={(event) => setRouteTargetPreference(event.target.value as TalkCorridorRouteTarget | 'auto')} style={FIELD_STYLE}>
                {CORRIDOR_TARGETS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <TalkActionButton theme={talkTheme} onClick={() => void openCorridor()} active>
              refresh corridor
            </TalkActionButton>
            <TalkPill theme={talkTheme} active={runtimeStatus === 'ready'}>
              {runtimeStatus === 'loading'
                ? 'runtime loading'
                : runtimeStatus === 'fallback'
                  ? 'corridor holding locally'
                  : runtimeStatus === 'error'
                    ? 'runtime error'
                  : runtimeStatus === 'ready'
                      ? 'runtime live'
                      : 'corridor idle'}
            </TalkPill>
            <TalkPill theme={talkTheme}>{phase}</TalkPill>
            <TalkPill theme={talkTheme}>{allowedMoves.length} allowed moves</TalkPill>
            <TalkPill theme={talkTheme}>{talkResponseFamilies.length} signed-off families</TalkPill>
          </div>

          {runtimeError ? (
            <div style={{ marginTop: 16, color: colors.neutral.white, opacity: 0.62, fontFamily: fonts.primary, fontSize: 13, lineHeight: 1.55 }}>
              Runtime note: {runtimeError}. The corridor still holds locally so the glass never blocks on network.
            </div>
          ) : null}
        </TalkPanel>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: 20, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 20 }}>
            <TalkCorridorPanel
              theme={talkTheme}
              title={phaseTitles[phase]}
              phaseBody={phaseBodies[phase]}
              phaseChips={phaseChips}
              candidates={candidateCards}
              entryDraft={entryDraft}
              entryPlaceholder={
                selectedCandidate
                  ? markdownToPlainText(selectedCandidate.body_md)
                  : 'Select one doorway first. The corridor should begin with the user, not with a machine monologue.'
              }
              onEntryDraftChange={setEntryDraft}
              canSeal={Boolean(selectedCandidate) && entryDraft.trim().length > 0}
              onSeal={sealCurrentEntry}
              onRest={() => {
                sendCorridorEvent({ type: 'REST' });
                logEvent('talk_room_rested', {
                  promptId: selectedCandidate?.guidance_id ?? null,
                  responseFamilyId: primaryFamily?.familyId ?? null,
                  status: 'success',
                });
              }}
              onReset={() => {
                sendCorridorEvent({ type: 'RESET' });
                setSelectedCandidate(null);
                setEntryDraft('');
                setDispatchPreview(null);
              }}
              isResting={phase === 'resting'}
            />

            <TalkResponseMatrixPanel
              theme={talkTheme}
              title="Choose one move. Let the library do the talking."
              moveOptions={allowedMoves.map((move) => ({
                id: move,
                label: move,
                active: requestedMove === move,
                onSelect: () => setRequestedMove(move),
              }))}
              family={matrixFamily}
              notes={
                dispatchError
                  ? [...turnResolution.notes, `Route note: ${dispatchError}`]
                  : turnResolution.notes
              }
              primaryActions={matrixPrimaryActions}
              secondaryActions={matrixSecondaryActions}
            />
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            <TalkPanel theme={talkTheme} eyebrow="runtime evidence" title="Keep the runtime honest, but never let network become the corridor.">
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.neutral.white, opacity: 0.22 }}>
                    primary runtime guidance
                  </div>
                  <div style={{ fontFamily: fonts.secondary, fontSize: 19, lineHeight: 1.3, letterSpacing: '-0.02em', color: colors.neutral.white, opacity: 0.86 }}>
                    {runtimeSession?.primary?.title ?? 'No runtime prompt loaded'}
                  </div>
                  <div style={{ fontFamily: fonts.primary, fontSize: 13, lineHeight: 1.55, color: colors.neutral.white, opacity: 0.56 }}>
                    {runtimeSession?.primary ? markdownToPlainText(runtimeSession.primary.body_md) : 'The corridor should start from one signpost, not a pile of options.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <TalkPill theme={talkTheme}>{runtimeSession?.session.objective ?? objective}</TalkPill>
                  <TalkPill theme={talkTheme}>{runtimeSession?.session.state_band ?? stateBand}</TalkPill>
                  <TalkPill theme={talkTheme}>{runtimeSession?.gaps.length ?? 0} gap checks</TalkPill>
                </div>

                {dispatchPreview ? (
                  <div
                    style={{
                      borderRadius: 18,
                      background: withAlpha(colors.accent.green.primary, 0.08),
                      border: `1px solid ${withAlpha(colors.accent.green.primary, 0.18)}`,
                      padding: 16,
                      display: 'grid',
                      gap: 8,
                    }}
                  >
                    <div style={{ fontFamily: fonts.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.neutral.white, opacity: 0.24 }}>
                      dispatch preview
                    </div>
                    <div style={{ fontFamily: fonts.secondary, fontSize: 18, lineHeight: 1.28, letterSpacing: '-0.02em', color: colors.neutral.white, opacity: 0.86 }}>
                      {dispatchPreview.dispatch.title ?? dispatchPreview.dispatch.target_kind}
                    </div>
                    <div style={{ fontFamily: fonts.primary, fontSize: 12, lineHeight: 1.55, color: colors.neutral.white, opacity: 0.58 }}>
                      {dispatchPreview.dispatch.route}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <TalkPill theme={talkTheme} accent={colors.accent.green.primary} active>
                        confidence {dispatchPreview.dispatch.semantic_provenance.confidence_score.toFixed(2)}
                      </TalkPill>
                      <TalkPill theme={talkTheme}>{dispatchPreview.dispatch.semantic_provenance.focus_scope_type}</TalkPill>
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'grid', gap: 10, marginTop: 6 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: colors.neutral.white, opacity: 0.22 }}>
                    lifecycle events
                  </div>
                  {eventLog.length === 0 ? (
                    <div style={{ fontFamily: fonts.primary, fontSize: 12, lineHeight: 1.55, color: colors.neutral.white, opacity: 0.48 }}>
                      No lifecycle events yet. The proving ground should emit a clean sequence as the corridor moves.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: 8 }}>
                      {eventLog.slice(0, 5).map((event) => (
                        <div
                          key={event.eventId}
                          style={{
                            borderRadius: 14,
                            background: withAlpha(colors.neutral.white, 0.03),
                            border: `1px solid ${withAlpha(colors.neutral.white, 0.05)}`,
                            padding: 12,
                            display: 'grid',
                            gap: 6,
                          }}
                        >
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <TalkPill theme={talkTheme} accent={event.status === 'error' ? colors.ui.gateRose : sectionAccents.talk} active>
                              {event.name}
                            </TalkPill>
                            <TalkPill theme={talkTheme}>{event.phase}</TalkPill>
                            {event.status ? <TalkPill theme={talkTheme}>{event.status}</TalkPill> : null}
                          </div>
                          <div style={{ fontFamily: fonts.primary, fontSize: 12, lineHeight: 1.5, color: colors.neutral.white, opacity: 0.54 }}>
                            {event.promptId ? `prompt ${event.promptId}` : 'no prompt'}{event.responseFamilyId ? ` / family ${event.responseFamilyId}` : ''}{event.routeTarget ? ` / route ${event.routeTarget}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TalkPanel>

            <TalkThreadTopologyPanel
              theme={talkTheme}
              title="Learn by deepening the map, not by loosening the voice."
              summary={
                sealedEntries.length === 0
                  ? 'No sealed entries yet. The topology should grow from receipts, not raw chat.'
                  : `${sealedEntries.length} sealed truths have entered the local thread model.`
              }
              entries={threadEntryCards}
              stableNodes={stableNodeChips}
            />

            <TalkPanel theme={talkTheme} eyebrow="governor readout" title="The corridor behaves like an instrument, not a chat transcript.">
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Waypoints size={16} color={sectionAccents.talk} />
                  <div style={{ fontFamily: fonts.primary, fontSize: 13, lineHeight: 1.55, color: colors.neutral.white, opacity: 0.58 }}>
                    The user starts every meaningful thread. The system narrows with one move at a time.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Route size={16} color={sectionAccents.talk} />
                  <div style={{ fontFamily: fonts.primary, fontSize: 13, lineHeight: 1.55, color: colors.neutral.white, opacity: 0.58 }}>
                    Route resolution is runtime-driven. The frontend should render the corridor, not guess the next surface.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <MessageSquareText size={16} color={sectionAccents.talk} />
                  <div style={{ fontFamily: fonts.primary, fontSize: 13, lineHeight: 1.55, color: colors.neutral.white, opacity: 0.58 }}>
                    If no approved response family fits the moment, that is a matrix gap. We do not improvise over it.
                  </div>
                </div>
              </div>
            </TalkPanel>
          </div>
        </div>
      </div>
    </LabShell>
  );
}
