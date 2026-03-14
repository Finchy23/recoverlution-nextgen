/**
 * useTalkCorridor — The Universe Runtime (Pass 18)
 *
 * Observations float in the cosmos. You approach one.
 * It deepens. An opening unfolds, trailing into silence...
 * The camera drifts toward a constellation.
 * The opening becomes the writing invitation.
 * You write. You pause. The star illuminates.
 * Stardust appears near the star.
 * One continuous gesture from recognition to inscription.
 *
 * Pass 2: Observation flow replaces WeaveChip word-selection
 * Pass 3: Territory-aware inscription, recognition witnessing
 * Pass 5: Constellation naming ceremony
 * Pass 6: Persistent names, parallel load, universe completion
 * Pass 7: Cross-constellation bridges, thread glow, progressive atmosphere
 * Pass 8: Universe naming ceremony, enriched stardust library
 * Pass 9: Stardust auto-advance with reading time for recognition text
 * Pass 12: Returning phase, visited territories, passage echo proximity
 * Pass 13: Completion haptic threshold, ceremony shimmer
 * Pass 14: Session-aware openers, depth-tiered observations, inscription flash
 * Pass 15: Territory gravity, depth-aware sacred pause, rest invitation, session tracking
 * Pass 16: First star ever ceremony (singular unrepeatable stardust)
 * Pass 17: Territory atmosphere layers, depth-of-field, localized nebulae, boundary sensing
 * Pass 18: Ambient soundscape hooks, passage search/recall, territory completion evolution, cross-territory resonance
 * Pass 19: Phase F — constellation lore, passage export, guided pathways, seasonal events (surface-side)
 * Pass 20: Phase G — writing momentum (ceremony pacing accelerates with session depth)
 * Pass 21: Phase U+ — inter-session continuity: session memory persistence, whisper/bridge/territory depth tracking
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { TalkEntry, TalkLane } from './talk-types';
import { saveEntries, loadEntries, saveConstellationNames, loadConstellationNames, saveSessionMemory, loadSessionMemory, type SessionMemory } from './talk-runtime';
import {
  ALL_STARS, CONSTELLATIONS,
  WEAVE_ROOTS, shuffleChips,
  getGravityTarget, findNextStar, aimCamera, collectStardust, collectRecognition,
  DEFAULT_CAMERA, CAMERA_LIMITS, selectOpener, computeMomentum,
  type UniverseStar, type Camera, type WeaveChip, type Stardust,
  type Observation, drawObservations,
  FIRST_STAR_STARDUST, FIRST_STAR_RECOGNITION,
  OBSERVATION_POOL, getStarTapOpening,
  extractPassageEcho, detectPassageResonance, getResonanceDepthWhisper,
  drawPenultimateRecognition, drawPenultimateStardust,
} from './talk-universe';

import { useIndividualId } from '../runtime/session-seam';
import { hapticSeal, hapticTick, hapticThreshold } from '../surfaces/haptics';

// ════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

export type TalkPhase =
  | 'arriving'        // Camera reveals the universe
  | 'dwelling'        // Observations float in the cosmos
  | 'approaching'     // Observation tapped — deepening unfolds, sacred pause
  | 'weaving'         // (legacy) Building thought via word selection
  | 'drifting'        // Camera drifts toward constellation
  | 'gateway'         // Phase P: Mic/Pen choice before inscription
  | 'inscribing'      // Opening visible + cursor open at star (pen or mic mode)
  | 'stardust'        // Discovery materialized near star
  | 'returning'       // Gentle reverse drift back to cosmos
  | 'naming'          // Constellation completed — personal naming ceremony
  | 'cartographing'   // Free passage entry
  | 'placed'          // Confirmation
  | 'resting';

export type InscriptionMode = 'pen' | 'mic';

export interface CorridorState {
  phase: TalkPhase;
  chips: WeaveChip[];
  trail: WeaveChip[];
  sentence: string;
  /** The opener text for this session */
  opener: string;
  /** The question that bridges into writing (from terminal chip) */
  question: string;
  camera: Camera;
  cameraTarget: Camera | null;
  stars: UniverseStar[];
  focusedStarId: string | null;
  currentStardust: Stardust | null;
  collectedDust: Stardust[];
  targetConstellation: string | null;
  entries: TalkEntry[];
  sessionDepth: number;
  loaded: boolean;
  /** Personal names given to completed constellations */
  constellationNames: Record<string, string>;
  /** Constellation currently being named (after completion) */
  namingConstellationId: string | null;
  /** Floating observations for the dwelling phase */
  observations: Observation[];
  /** The observation currently being approached */
  activeObservation: Observation | null;
  /** Constellations visited during this session (for territory map) */
  visitedTerritories: Set<string>;
  /** Brief flash of the user's words before stardust (inscription to light) */
  inscriptionFlash: string | null;
  /** Number of inscriptions in this session (for rest invitation) */
  sessionInscriptions: number;
  /** Whether the rest invitation is visible */
  restInvitationVisible: boolean;
  /** Phase O: Current branching depth (0 = initial approach, 1 = branch selected → converging) */
  branchDepth: number;
  /** Phase O: Branch prompts drawn from the same territory as the active observation */
  branchPrompts: Observation[];
  /** Phase O: The initial observation text (persists through branching) */
  rootObservation: Observation | null;
  /** Phase P: Current inscription mode (pen or mic) */
  inscriptionMode: InscriptionMode;
  /** Phase U+: Inter-session continuity memory (persisted across visits) */
  sessionMemory: SessionMemory | null;
  /** Ordered territory trail for this session (schema names in visit order) */
  territoryTrail: string[];
}

export interface CorridorActions {
  selectChip: (chip: WeaveChip) => void;
  /** Approach a floating observation (one-tap ceremony) */
  approachObservation: (obs: Observation) => void;
  /** Phase O: Select a branch prompt during the approaching ceremony */
  selectBranch: (obs: Observation) => void;
  /** Submit passage (from inscribing phase) */
  inscribe: (text: string) => void;
  collectDust: () => void;
  enterCartograph: () => void;
  placeEntry: (text: string) => void;
  returnToDwelling: () => void;
  enterRest: () => void;
  dragCamera: (dYaw: number, dPitch: number) => void;
  zoomCamera: (delta: number) => void;
  /** Direct star tap — navigate camera to star */
  focusStar: (starId: string) => void;
  /** Name a completed constellation */
  nameConstellation: (name: string) => void;
  /** Cycle floating prompts to a fresh set (typewriter refresh) */
  cycleObservations: () => void;
  /** Phase P: Choose inscription mode from the gateway (pen or mic) */
  chooseGateway: (mode: InscriptionMode) => void;
  /** Phase U+: Merge new whispers and bridge crossings into persisted session memory */
  recordWhisperMemory: (newWhispers: string[], bridgeCrossing?: string) => void;
}

// ═══════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════

export function useTalkCorridor(opts: {
  arrived: boolean;
  modeId: string;
  onResolve?: () => void;
  onNavigate?: (modeId: string, payload?: { schema?: string; insightId?: string }) => void;
}): [CorridorState, CorridorActions] {
  const { arrived, modeId, onResolve } = opts;
  const userId = useIndividualId();

  const [phase, setPhase] = useState<TalkPhase>('arriving');
  const [chips, setChips] = useState<WeaveChip[]>([]);
  const [trail, setTrail] = useState<WeaveChip[]>([]);
  const [sentence, setSentence] = useState('');
  const [opener, setOpener] = useState('something is here');
  const [question, setQuestion] = useState('');
  const [camera, setCamera] = useState<Camera>({ ...DEFAULT_CAMERA });
  const [cameraTarget, setCameraTarget] = useState<Camera | null>(null);
  const [stars, setStars] = useState<UniverseStar[]>(() => ALL_STARS.map(s => ({ ...s })));
  const [focusedStarId, setFocusedStarId] = useState<string | null>(null);
  const [currentStardust, setCurrentStardust] = useState<Stardust | null>(null);
  const [collectedDust, setCollectedDust] = useState<Stardust[]>([]);
  const [targetConstellation, setTargetConstellation] = useState<string | null>(null);
  const [entries, setEntries] = useState<TalkEntry[]>([]);
  const [sessionDepth, setSessionDepth] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [constellationNames, setConstellationNames] = useState<Record<string, string>>({});
  const [namingConstellationId, setNamingConstellationId] = useState<string | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [activeObservation, setActiveObservation] = useState<Observation | null>(null);
  const [encounteredObs] = useState<Set<string>>(() => new Set());
  const [visitedTerritories] = useState<Set<string>>(() => new Set());
  const [inscriptionFlash, setInscriptionFlash] = useState<string | null>(null);
  const [sessionInscriptions, setSessionInscriptions] = useState(0);
  const [restInvitationVisible, setRestInvitationVisible] = useState(false);
  const [branchDepth, setBranchDepth] = useState(0);
  const [branchPrompts, setBranchPrompts] = useState<Observation[]>([]);
  const [rootObservation, setRootObservation] = useState<Observation | null>(null);
  const [inscriptionMode, setInscriptionMode] = useState<InscriptionMode>('pen');

  // Phase U+: Inter-session continuity memory
  const [sessionMemory, setSessionMemory] = useState<SessionMemory | null>(null);
  const [territoryTrail, setTerritoryTrail] = useState<string[]>([]);

  // ── Load ───
  useEffect(() => {
    if (loaded) return;
    Promise.all([
      loadEntries(userId),
      loadConstellationNames(userId),
      loadSessionMemory(userId),
    ]).then(([{ entries: e, sessionDepth: d, found }, { names, found: namesFound }, { memory, found: memoryFound }]) => {
      if (found && e.length > 0) {
        setEntries(e);
        setSessionDepth(d);
        // Session-aware opener: universe speaks differently to returning users
        // Territory-affinity: find the user's dominant territory from session memory
        const dominantTerritory = memory?.territoryDepth
          ? Object.entries(memory.territoryDepth).sort((a, b) => b[1] - a[1])[0]?.[0] || null
          : null;
        setOpener(selectOpener(e.length, dominantTerritory));
        setStars(prev => {
          const updated = prev.map(s => ({ ...s }));
          for (const entry of e) {
            const star = updated.find(s => s.id === entry.promptId);
            if (star) { star.illuminated = true; star.passage = entry.response; }
          }
          return updated;
        });
      }
      if (namesFound && names) {
        setConstellationNames(names);
      }
      // Phase U+: Restore session memory for whisper continuity
      if (memoryFound && memory) {
        const restored: SessionMemory = {
          ...memory,
          // Increment session count for this visit
          sessionCount: (memory.sessionCount || 0) + 1,
          // Preserve the old lastVisit as previousVisit for time-aware returning whispers
          previousVisit: memory.lastVisit,
          lastVisit: Date.now(),
        };
        setSessionMemory(restored);
        // Persist the incremented session count immediately
        saveSessionMemory(restored, userId);
        // Seed encountered observations from cross-session memory (prevents repetition)
        if (memory.encounteredObservations && memory.encounteredObservations.length > 0) {
          for (const obsId of memory.encounteredObservations) {
            encounteredObs.add(obsId);
          }
          console.log(`[TALK obs] Seeded ${memory.encounteredObservations.length} encountered observations from memory`);
        }
      } else {
        // First visit ever
        const fresh: SessionMemory = {
          sessionCount: 1,
          shownWhispers: [],
          territoryDepth: {},
          bridgesCrossed: [],
          lastTerritory: null,
          lastVisit: Date.now(),
        };
        setSessionMemory(fresh);
        saveSessionMemory(fresh, userId);
      }
      // If no entries found, use first-visit opener
      if (!found || e.length === 0) {
        setOpener(selectOpener(0));
      }
      setLoaded(true);
    });
  }, [loaded, userId]);

  // ─── Reset ───
  useEffect(() => {
    setPhase('arriving');
    setChips([]);
    setTrail([]);
    setSentence('');
    setQuestion('');
    setCameraTarget(null);
    setFocusedStarId(null);
    setCurrentStardust(null);
    setTargetConstellation(null);
    setInscriptionFlash(null);
    setSessionInscriptions(0);
    setRestInvitationVisible(false);
    setBranchDepth(0);
    setBranchPrompts([]);
    setRootObservation(null);
    setInscriptionMode('pen');
  }, [modeId]);

  // ─── Arriving → dwelling ───
  useEffect(() => {
    if (arrived && phase === 'arriving' && loaded) {
      const t = setTimeout(() => {
        setChips(shuffleChips(WEAVE_ROOTS));
        // Draw fresh observations for this dwelling session
        const illumByTerritory: Record<string, number> = {};
        for (const con of CONSTELLATIONS) {
          illumByTerritory[con.schema] = stars.filter(
            s => s.constellation === con.id && s.illuminated
          ).length;
        }
        setObservations(drawObservations(illumByTerritory, encounteredObs, 3, sessionMemory?.territoryDepth));

        // Phase U+: Last-territory camera drift — gently pan toward where the user left off
        if (sessionMemory?.lastTerritory && sessionMemory.sessionCount > 1) {
          const lastCon = CONSTELLATIONS.find(c => c.schema === sessionMemory.lastTerritory);
          if (lastCon) {
            const aim = aimCamera(lastCon.center);
            // Subtle drift: halfway between default and the last territory, at default zoom
            setCameraTarget({
              yaw: aim.yaw * 0.4,
              pitch: aim.pitch * 0.4,
              zoom: DEFAULT_CAMERA.zoom,
            });
          }
        }

        setPhase('dwelling');
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [arrived, phase, loaded, stars, encounteredObs, sessionMemory]);

  // ─── Approaching → drifting (sacred pause) ───
  // Phase O: Only auto-transitions when branchDepth >= 1 (branch has been selected)
  // At branchDepth 0, the user must select a branch prompt interactively
  useEffect(() => {
    if (phase !== 'approaching' || !activeObservation) return;
    // branchDepth 0: wait for user to select a branch — no auto-transition
    if (branchDepth < 1) return;

    // Mark as encountered
    encounteredObs.add(activeObservation.id);

    // Persist encountered observation to cross-session memory (capped at 50)
    setSessionMemory(prev => {
      if (!prev) return prev;
      const existing = prev.encounteredObservations || [];
      if (existing.includes(activeObservation.id)) return prev;
      const all = [...existing, activeObservation.id];
      const capped = all.length > 50 ? all.slice(-50) : all;
      const updated: SessionMemory = { ...prev, encounteredObservations: capped };
      saveSessionMemory(updated, userId);
      return updated;
    });

    // Depth-aware sacred pause: deeper observations earn a longer ceremony
    const momentum = computeMomentum(sessionInscriptions, sessionMemory?.sessionCount);
    const baseSacredDelay = activeObservation.depth === 2 ? 3500
      : activeObservation.depth === 1 ? 2800
      : 2400;
    const sacredDelay = Math.round(baseSacredDelay * momentum.paceMultiplier);

    const t = setTimeout(() => {
      // Find constellation for this observation's territory
      const con = CONSTELLATIONS.find(c => c.schema === activeObservation.territory);
      if (!con) { returnToDwellingInner(); return; }

      // Smart gravity — prefer less-explored constellations
      let target = con;
      const conLit = stars.filter(s => s.constellation === con.id && s.illuminated).length;
      if (conLit >= con.starIds.length) {
        const candidates = CONSTELLATIONS
          .map(c => ({
            con: c,
            lit: stars.filter(s => s.constellation === c.id && s.illuminated).length,
          }))
          .filter(c => c.lit < c.con.starIds.length)
          .sort((a, b) => a.lit / a.con.starIds.length - b.lit / b.con.starIds.length);
        if (candidates.length > 0) target = candidates[0].con;
      }

      setQuestion(activeObservation.opening);
      setTargetConstellation(target.id);
      const aim = aimCamera(target.center);
      setCameraTarget({ yaw: aim.yaw, pitch: aim.pitch, zoom: 350 });
      setPhase('drifting');
    }, sacredDelay);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeObservation, branchDepth, stars, encounteredObs]);

  // ─── Camera interpolation ───
  useEffect(() => {
    if (!cameraTarget) return;
    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      setCamera(prev => {
        const t = 0.03;
        const ny = lerp(prev.yaw, cameraTarget.yaw, t);
        const np = lerp(prev.pitch, cameraTarget.pitch, t);
        const nz = lerp(prev.zoom, cameraTarget.zoom, t);

        const dy = Math.abs(ny - cameraTarget.yaw);
        const dp = Math.abs(np - cameraTarget.pitch);
        const dz = Math.abs(nz - cameraTarget.zoom);

        if (dy < 0.002 && dp < 0.002 && dz < 1) {
          // Arrived at target
          if (phase === 'drifting') {
            if (focusedStarId) {
              // Direct star tap — focusedStarId already set
              // Phase P: Route through gateway for inscription mode choice
              setPhase('gateway');
            } else {
              const con = CONSTELLATIONS.find(c => c.id === targetConstellation);
              if (con) {
                const next = findNextStar(con, stars);
                if (next) {
                  setFocusedStarId(next.id);
                  // Phase P: Route through gateway for inscription mode choice
                  setPhase('gateway');
                } else {
                  returnToDwellingInner();
                }
              }
            }
            setCameraTarget(null);
          } else if (phase === 'returning') {
            // Reverse drift complete — settle into dwelling with fresh observations
            returnToDwellingInner();
            setCameraTarget(null);
          } else {
            // Any other phase (e.g. dwelling drift on return) — just clear the target
            setCameraTarget(null);
          }
          return { yaw: cameraTarget.yaw, pitch: cameraTarget.pitch, zoom: cameraTarget.zoom };
        }
        return { yaw: ny, pitch: np, zoom: nz };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cameraTarget, phase, targetConstellation, stars, focusedStarId]);

  // ─── Internal reset to dwelling ───
  const returnToDwellingInner = useCallback(() => {
    setPhase('dwelling');
    setTrail([]);
    setSentence('');
    setQuestion('');
    setFocusedStarId(null);
    setTargetConstellation(null);
    setCurrentStardust(null);
    setActiveObservation(null);
    setInscriptionFlash(null);
    setBranchDepth(0);
    setBranchPrompts([]);
    setRootObservation(null);
    setInscriptionMode('pen');
    setChips(shuffleChips(WEAVE_ROOTS));
    setCameraTarget({ ...DEFAULT_CAMERA });
    // Draw fresh observations for the new dwelling session
    const illumByTerritory: Record<string, number> = {};
    for (const con of CONSTELLATIONS) {
      illumByTerritory[con.schema] = stars.filter(
        s => s.constellation === con.id && s.illuminated
      ).length;
    }
    setObservations(drawObservations(illumByTerritory, encounteredObs, 3, sessionMemory?.territoryDepth));
    // Surface rest invitation after 3+ inscriptions this session
    setRestInvitationVisible(prev => sessionInscriptions >= 3 ? true : prev);
  }, [stars, encounteredObs, sessionInscriptions, sessionMemory]);

  // ─── Actions ───

  const selectChip = useCallback((chip: WeaveChip) => {
    hapticTick();
    const newTrail = [...trail, chip];
    setTrail(newTrail);
    setSentence(chip.fragment);

    if (chip.question) {
      // Terminal: this chip IS the question that opens writing
      setQuestion(chip.question);
      
      // ── Smart gravity: bias toward unexplored territory ──
      const primary = getGravityTarget(chip.lane);
      const primaryLit = stars.filter(s => s.constellation === primary.id && s.illuminated).length;
      const primaryTotal = primary.starIds.length;
      
      let target = primary;
      // If primary constellation is >50% explored, check for less-explored alternatives
      if (primaryLit / primaryTotal > 0.5) {
        const candidates = CONSTELLATIONS
          .map(c => ({
            con: c,
            lit: stars.filter(s => s.constellation === c.id && s.illuminated).length,
            total: c.starIds.length,
          }))
          .filter(c => c.lit < c.total) // has unlit stars
          .sort((a, b) => (a.lit / a.total) - (b.lit / b.total)); // least explored first
        
        if (candidates.length > 0 && candidates[0].lit / candidates[0].total < primaryLit / primaryTotal) {
          target = candidates[0].con;
        }
      }
      
      setTargetConstellation(target.id);
      const aim = aimCamera(target.center);
      setCameraTarget({ yaw: aim.yaw, pitch: aim.pitch, zoom: 350 });
      setPhase('drifting');
    } else if (chip.children && chip.children.length > 0) {
      setChips(chip.children);
      setPhase('weaving');
    }
  }, [trail, stars]);

  const approachObservation = useCallback((obs: Observation) => {
    hapticTick();
    setActiveObservation(obs);
    setRootObservation(obs);
    setBranchDepth(0);
    // Phase O: Draw 2 branch prompts from the same territory (excluding the selected one)
    // Pass 53: Depth-aware branch selection — branches respect earned depth and prefer
    // observations at or adjacent to the approached observation's depth tier,
    // ensuring the ceremony does not surface deeper content prematurely
    const pool = (OBSERVATION_POOL[obs.territory] || []).filter(o => o.id !== obs.id);
    // Compute the user's earned max depth for this territory
    const totalIllum = stars.filter(s => s.illuminated).length;
    const baseMaxDepth = totalIllum < 3 ? 0 : totalIllum < 10 ? 1 : 2;
    const crossDepth = sessionMemory?.territoryDepth?.[obs.territory] || 0;
    const depthBoost = crossDepth >= 8 ? 2 : crossDepth >= 4 ? 1 : 0;
    const earnedDepth = Math.min(2, Math.max(baseMaxDepth, depthBoost));
    // Filter to earned depth, then prefer same or adjacent depth to the root observation
    const depthFiltered = pool.filter(o => o.depth <= earnedDepth);
    const adjacent = depthFiltered.filter(o => Math.abs(o.depth - obs.depth) <= 1);
    const branchPool = adjacent.length >= 2 ? adjacent : depthFiltered.length >= 2 ? depthFiltered : pool;
    const shuffled = [...branchPool].sort(() => Math.random() - 0.5);
    setBranchPrompts(shuffled.slice(0, 2));
    setPhase('approaching');
  }, [stars, sessionMemory]);

  const selectBranch = useCallback((obs: Observation) => {
    hapticTick();
    setActiveObservation(obs);
    setBranchDepth(1);
    setPhase('approaching');
  }, []);

  const inscribe = useCallback((text: string) => {
    if (!focusedStarId || !text.trim()) return;
    hapticSeal();

    const star = stars.find(s => s.id === focusedStarId);
    if (!star) return;

    setStars(prev => prev.map(s =>
      s.id === focusedStarId ? { ...s, illuminated: true, passage: text.trim() } : s
    ));

    const constellation = CONSTELLATIONS.find(c => c.starIds.includes(focusedStarId));
    const entry: TalkEntry = {
      id: `star-${Date.now()}`,
      promptId: focusedStarId,
      promptText: star.name,
      response: text.trim(),
      timestamp: Date.now(),
      lane: (trail.length > 0 ? trail[trail.length - 1].lane : 'present') as TalkLane,
      depth: sessionDepth,
      threadPosition: { x: (star.pos.x + 300) / 600, y: (star.pos.y + 300) / 600 },
    };

    // Track territory visit for the territory map
    if (constellation) visitedTerritories.add(constellation.id);

    // Track ordered territory trail for session journey shape
    if (constellation) {
      setTerritoryTrail(prev => {
        const last = prev.length > 0 ? prev[prev.length - 1] : null;
        // Only add if different from the last territory (avoid consecutive duplicates)
        if (last !== constellation.schema) return [...prev, constellation.schema];
        return prev;
      });
    }

    const newEntries = [...entries, entry];
    const newDepth = sessionDepth + 1;
    setEntries(newEntries);
    setSessionDepth(newDepth);
    saveEntries(newEntries, newDepth, userId);

    // Stardust
    const schema = constellation?.schema || 'CALM';
    // First star ever — singular, unrepeatable ceremony
    const isFirstStarEver = !stars.some(s => s.id !== focusedStarId && s.illuminated);

    // Completion momentum: detect penultimate star (one star left after this inscription)
    let isPenultimate = false;
    if (constellation && !isFirstStarEver) {
      const litAfter = constellation.starIds.filter(sid =>
        sid === focusedStarId || stars.find(s => s.id === sid)?.illuminated
      ).length;
      const remaining = constellation.starIds.length - litAfter;
      isPenultimate = remaining === 1;
    }

    const dustText = isFirstStarEver ? FIRST_STAR_STARDUST
      : isPenultimate ? drawPenultimateStardust()
      : collectStardust(schema);
    const recognitionText = isFirstStarEver ? FIRST_STAR_RECOGNITION
      : isPenultimate ? drawPenultimateRecognition()
      : collectRecognition(schema);
    // Passage resonance: detect thematic echo with previous writings
    const resonanceText = sessionMemory?.passageEchoes
      ? detectPassageResonance(text.trim(), sessionMemory.passageEchoes)
      : null;

    // Resonance depth: increment counter and check for milestone whisper
    let resonanceDepthWhisper: string | null = null;
    if (resonanceText) {
      const newDepth = (sessionMemory?.resonanceDepth || 0) + 1;
      resonanceDepthWhisper = getResonanceDepthWhisper(newDepth);
      // Increment resonanceDepth in session memory
      setSessionMemory(prev => {
        if (!prev) return prev;
        const updated: SessionMemory = { ...prev, resonanceDepth: newDepth };
        saveSessionMemory(updated, userId);
        return updated;
      });
      console.log(`[TALK resonance] Depth now ${newDepth}${resonanceDepthWhisper ? ' — milestone reached' : ''}`);
    }

    const dust: Stardust = {
      id: `dust-${Date.now()}`, text: dustText, starId: focusedStarId,
      timestamp: Date.now(), recognition: recognitionText,
      ...(resonanceText ? { resonance: resonanceText } : {}),
      ...(resonanceDepthWhisper ? { resonanceDepthWhisper } : {}),
    };

    setStars(prev => prev.map(s =>
      s.id === focusedStarId ? { ...s, stardust: [...s.stardust, dustText] } : s
    ));

    setCurrentStardust(dust);
    setCollectedDust(prev => [...prev, dust]);
    // Flash the user's words briefly before stardust materializes
    setInscriptionFlash(text.trim());
    setPhase('stardust');
    setSessionInscriptions(prev => prev + 1);

    // Phase U+: Update session memory with territory depth
    if (constellation) {
      setSessionMemory(prev => {
        if (!prev) return prev;
        const updated: SessionMemory = {
          ...prev,
          territoryDepth: {
            ...prev.territoryDepth,
            [constellation.schema]: (prev.territoryDepth[constellation.schema] || 0) + 1,
          },
          lastTerritory: constellation.schema,
          lastVisit: Date.now(),
        };
        // Fire-and-forget save
        saveSessionMemory(updated, userId);
        return updated;
      });
    }

    // Passage echo extraction: extract a meaningful fragment for cross-session echoing
    const echo = extractPassageEcho(text.trim());
    if (echo) {
      setSessionMemory(prev => {
        if (!prev) return prev;
        const existing = prev.passageEchoes || [];
        // Avoid duplicate echoes and cap at 20
        if (existing.includes(echo)) return prev;
        const all = [...existing, echo];
        const capped = all.length > 20 ? all.slice(-20) : all;
        const updated: SessionMemory = { ...prev, passageEchoes: capped };
        saveSessionMemory(updated, userId);
        return updated;
      });
    }
  }, [focusedStarId, stars, trail, entries, sessionDepth, userId, visitedTerritories, sessionMemory]);

  // ─── Stardust auto-advance — reading time for recognition text ───
  const collectDustRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (phase !== 'stardust' || !currentStardust) return;
    // Reading time: 8s with resonance echo, 5.5s with stardust only
    const delay = currentStardust.resonance ? 8000 : 5500;
    const t = setTimeout(() => {
      collectDustRef.current();
    }, delay);
    return () => clearTimeout(t);
  }, [phase, currentStardust]);

  const collectDust = useCallback(() => {
    // Check if the just-inscribed star completed a constellation
    const dustStarId = currentStardust?.starId;
    if (dustStarId) {
      const con = CONSTELLATIONS.find(c => c.starIds.includes(dustStarId));
      if (con) {
        const allLit = con.starIds.every(sid => stars.find(s => s.id === sid)?.illuminated);
        if (allLit && !constellationNames[con.id]) {
          // Constellation just completed — enter naming ceremony
          hapticThreshold();
          setCurrentStardust(null);
          setInscriptionFlash(null);
          setNamingConstellationId(con.id);
          setPhase('naming');
          return;
        }
      }
    }
    setCurrentStardust(null);
    setInscriptionFlash(null);
    // Gentle reverse drift instead of snap — camera glides back to cosmos
    setPhase('returning');
    setCameraTarget({ ...DEFAULT_CAMERA });
  }, [currentStardust, stars, constellationNames]);

  // Keep ref in sync for timer
  useEffect(() => { collectDustRef.current = collectDust; }, [collectDust]);

  const enterCartograph = useCallback(() => {
    setPhase('cartographing');
    setTrail([]);
    setSentence('');
    setQuestion('');
    setFocusedStarId(null);
  }, []);

  const placeEntry = useCallback((text: string) => {
    if (!text.trim()) return;
    hapticSeal();

    const unlit = stars.filter(s => !s.illuminated);
    const target = unlit.length > 0 ? unlit[Math.floor(Math.random() * unlit.length)] : null;

    if (target) {
      setStars(prev => prev.map(s =>
        s.id === target.id ? { ...s, illuminated: true, passage: text.trim() } : s
      ));
    }

    const lower = text.toLowerCase();
    let lane: TalkLane = 'present';
    if (/\b(child|parent|family|grew up|remember|small|young)\b/.test(lower)) lane = 'origin';
    else if (/\b(always|again|repeat|pattern|every time|loop)\b/.test(lower)) lane = 'pattern';
    else if (/\b(they|him|her|friend|partner|relationship)\b/.test(lower)) lane = 'relationship';
    else if (/\b(body|chest|stomach|throat|tight|heavy|breath)\b/.test(lower)) lane = 'body';
    else if (/\b(afraid|scared|fear|worst|anxious|panic)\b/.test(lower)) lane = 'fear';
    else if (/\b(want|wish|hope|dream|imagine|someday)\b/.test(lower)) lane = 'desire';

    const entry: TalkEntry = {
      id: `carto-${Date.now()}`,
      promptId: target?.id || 'freeform',
      promptText: target?.name || '',
      response: text.trim(),
      timestamp: Date.now(),
      lane, depth: sessionDepth,
      threadPosition: target
        ? { x: (target.pos.x + 300) / 600, y: (target.pos.y + 300) / 600 }
        : { x: 0.5, y: 0.5 },
    };

    const newEntries = [...entries, entry];
    setEntries(newEntries);
    setSessionDepth(prev => prev + 1);
    setPhase('placed');
    saveEntries(newEntries, sessionDepth + 1, userId);

    setTimeout(returnToDwellingInner, 2500);
  }, [stars, entries, sessionDepth, userId, returnToDwellingInner]);

  const enterRest = useCallback(() => {
    setPhase('resting');
    setTimeout(() => { onResolve?.(); }, 6000);
  }, [onResolve]);

  const dragCamera = useCallback((dYaw: number, dPitch: number) => {
    if (phase === 'drifting' || phase === 'approaching' || phase === 'returning' || phase === 'gateway') return;
    setCamera(prev => ({
      ...prev, yaw: prev.yaw + dYaw,
      pitch: Math.max(CAMERA_LIMITS.pitchMin, Math.min(CAMERA_LIMITS.pitchMax, prev.pitch + dPitch)),
    }));
  }, [phase]);

  const zoomCamera = useCallback((delta: number) => {
    if (phase === 'drifting' || phase === 'approaching' || phase === 'returning' || phase === 'gateway') return;
    setCamera(prev => ({
      ...prev, zoom: Math.max(CAMERA_LIMITS.zoomMin, Math.min(CAMERA_LIMITS.zoomMax, prev.zoom + delta)),
    }));
  }, [phase]);

  const focusStar = useCallback((starId: string) => {
    const star = stars.find(s => s.id === starId);
    if (!star) return;
    // Find the constellation this star belongs to
    const con = CONSTELLATIONS.find(c => c.starIds.includes(starId));
    if (!con) return;
    
    if (star.illuminated) {
      // Already illuminated — just navigate to view it (no inscribing)
      const aim = aimCamera(star.pos);
      setCameraTarget({ yaw: aim.yaw, pitch: aim.pitch, zoom: 350 });
      // Don't change phase — just pan the camera
      return;
    }
    
    // Unlit star: navigate and prepare to inscribe
    setFocusedStarId(starId);
    setTargetConstellation(con.id);
    setQuestion(getStarTapOpening(con.schema));
    const aim = aimCamera(star.pos);
    setCameraTarget({ yaw: aim.yaw, pitch: aim.pitch, zoom: 350 });
    setPhase('drifting');
  }, [stars]);

  const nameConstellation = useCallback((name: string) => {
    if (!namingConstellationId) return;

    if (namingConstellationId === '__universe__') {
      // Universe naming ceremony — all 6 constellations complete
      const updated = { ...constellationNames, __universe__: name };
      setConstellationNames(updated);
      setNamingConstellationId(null);
      saveConstellationNames(updated, userId);
      returnToDwellingInner();
      return;
    }

    const updated = { ...constellationNames, [namingConstellationId]: name };
    setConstellationNames(updated);
    setNamingConstellationId(null);
    saveConstellationNames(updated, userId);

    // Persist completed constellation to session memory for cross-session recognition
    setSessionMemory(prev => {
      if (!prev) return prev;
      const existing = prev.completedConstellations || [];
      if (existing.includes(namingConstellationId)) return prev;
      const updatedMemory: SessionMemory = {
        ...prev,
        completedConstellations: [...existing, namingConstellationId],
      };
      saveSessionMemory(updatedMemory, userId);
      return updatedMemory;
    });

    // Check if all 6 constellations are now named — trigger universe naming
    const allNamed = CONSTELLATIONS.every(c => updated[c.id]);
    if (allNamed && !updated.__universe__) {
      // Brief pause, then universe naming ceremony
      setTimeout(() => {
        setNamingConstellationId('__universe__');
        setPhase('naming');
      }, 1500);
      return;
    }

    returnToDwellingInner();
  }, [namingConstellationId, constellationNames, userId, returnToDwellingInner]);

  const cycleObservations = useCallback(() => {
    // Draw fresh observations for the new dwelling session
    const illumByTerritory: Record<string, number> = {};
    for (const con of CONSTELLATIONS) {
      illumByTerritory[con.schema] = stars.filter(
        s => s.constellation === con.id && s.illuminated
      ).length;
    }
    setObservations(drawObservations(illumByTerritory, encounteredObs, 3, sessionMemory?.territoryDepth));
  }, [stars, encounteredObs, sessionMemory]);

  const chooseGateway = useCallback((mode: InscriptionMode) => {
    setInscriptionMode(mode);
    setPhase('inscribing');
  }, []);

  const recordWhisperMemory = useCallback((newWhispers: string[], bridgeCrossing?: string) => {
    setSessionMemory(prev => {
      if (!prev) return prev;
      // Keep only the most recent 100 whispers to prevent unbounded growth
      const allWhispers = [...prev.shownWhispers, ...newWhispers];
      const cappedWhispers = allWhispers.length > 100 ? allWhispers.slice(-100) : allWhispers;
      // Keep only the most recent 50 bridge crossings
      const allBridges = bridgeCrossing ? [...prev.bridgesCrossed, bridgeCrossing] : prev.bridgesCrossed;
      const cappedBridges = allBridges.length > 50 ? allBridges.slice(-50) : allBridges;
      const updated: SessionMemory = {
        ...prev,
        shownWhispers: cappedWhispers,
        bridgesCrossed: cappedBridges,
      };
      // Fire-and-forget save
      saveSessionMemory(updated, userId);
      return updated;
    });
  }, [userId]);

  const state: CorridorState = {
    phase, chips, trail, sentence, opener, question,
    camera, cameraTarget, stars, focusedStarId,
    currentStardust, collectedDust, targetConstellation,
    entries, sessionDepth, loaded,
    constellationNames, namingConstellationId,
    observations, activeObservation,
    visitedTerritories,
    inscriptionFlash,
    sessionInscriptions,
    restInvitationVisible,
    branchDepth,
    branchPrompts,
    rootObservation,
    inscriptionMode,
    sessionMemory,
    territoryTrail,
  };

  const actions: CorridorActions = useMemo(() => ({
    selectChip, approachObservation, selectBranch, inscribe, collectDust, enterCartograph,
    placeEntry, returnToDwelling: returnToDwellingInner, enterRest,
    dragCamera, zoomCamera, focusStar,
    nameConstellation,
    cycleObservations,
    chooseGateway,
    recordWhisperMemory,
  }), [selectChip, approachObservation, selectBranch, inscribe, collectDust, enterCartograph,
    placeEntry, returnToDwellingInner, enterRest, dragCamera, zoomCamera, focusStar, nameConstellation, cycleObservations, chooseGateway, recordWhisperMemory]);

  return [state, actions];
}