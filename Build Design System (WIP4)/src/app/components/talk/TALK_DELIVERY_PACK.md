# TALK Delivery Pack

Date: 2026-03-13
Status: shell-first pass complete
Audience: nextgen review loop (Codex + human)

## What Was Done

### Architecture: Shell/Runtime Separation

TalkSurface is now a **pure visual shell**.

All runtime behavior has been extracted into `useTalkCorridor.ts`:

| Concern | Before | After |
|---------|--------|-------|
| Constellation persistence | inline in TalkSurface | useTalkCorridor |
| Prompt evolution (LLM) | inline in TalkSurface | useTalkCorridor |
| Schema detection (SEEK bridge) | inline in TalkSurface | useTalkCorridor |
| KBE nudging | inline in TalkSurface | useTalkCorridor |
| Deep thread mining | inline in TalkSurface | useTalkCorridor |
| Phase orchestration timing | inline in TalkSurface | useTalkCorridor |
| Rest invitation logic | inline in TalkSurface | useTalkCorridor |
| Talk seed ingestion | inline in TalkSurface | useTalkCorridor |

**TalkSurface now imports zero runtime modules.** No `talk-runtime`, no `projectId`, no `publicAnonKey`, no `fetch`. The shell consumes `[CorridorState, CorridorActions]` from the hook and renders.

This directly addresses PR #10's directive: "do not grow app-local runtime logic further inside the WIP shell."

### File Map

```
talk/
  useTalkCorridor.ts    ← NEW: runtime spine (all non-visual behavior)
  JournalPage.tsx       ← REFINED: elevated seal mechanic
  PromptField.tsx       ← unchanged
  SchemaBridge.tsx      ← REFINED: quieter positioning (12% vs 18%)
  ThreadMap.tsx          ← unchanged
  talk-runtime.ts        ← unchanged (API client, consumed by hook)
  talk-types.ts          ← unchanged

surfaces/
  TalkSurface.tsx        ← REWRITTEN: pure visual shell
```

### Visual Improvements

**Seven phases, seven shell regions** now fully implemented:

1. **Arriving** (doorway): luminous threshold lines scale in from center, TALK label appears, canopy copy fades in with staggered timing. Feels like crossing a threshold.

2. **Prompting** (prompt field): unchanged, 2-3 floating prompt nodes with drift.

3. **Writing** (page): JournalPage unchanged structurally but constellation now slightly more visible (`op.emerging` vs `op.ambient`) during writing. The user always feels their growing constellation.

4. **Sealing** (seal): THE emotional center of the corridor. Three-layer glow system:
   - Outer atmospheric field (40-100px radius, grows with hold progress)
   - Inner glow (20-50px, brighter)
   - Luminous core (6-12px, white-hot center emerges at 30%)
   - Progress ring (22-26px, prominent with background track)
   - Completion bloom (expanding ring ripple + fading core)

5. **Reflecting** (reflection): bounded with luminous gradient edges (top/bottom) that scale in. Creates a distinct mirror moment container.

6. **Threading** (thread map): constellation brightens to `op.clear`, "N PIECES MAPPED" label.

7. **Resting** (rest state): breathing glyph, rest copy, depth marker. Constellation brightens to `op.spoken`. Rest invitation appears after 3+ entries during prompting phase.

### Contract Boundary

The hook (`useTalkCorridor`) is the extraction boundary. When nextgen promotes to `packages/talk-core`:

- The hook maps directly to their runtime client
- The shell remains untouched
- No structural rewrites needed

### What Was Not Done

- Runtime logic is still fire-and-forget (no retry, no offline queue)
- Schema detection still calls the LLM inline (should be runtime-owned)
- No TALK contract types file yet (unlike PLAY's `play-contracts.ts`)
- KBE nudging and deep mining should eventually move to a runtime adapter

### Suggested Next Steps

- Create `talk-contracts.ts` with declared shapes for constellation, prompt evolution, and schema detection
- Extract audio/haptic patterns into shared surface utilities
- Consider a `useTalkRuntime` adapter layer between the hook and the server

### Alignment with Organism Guidance Pack

Per `FRONTEND_AGENT_BRIEF.md` (codex/build-design-system2-agent-pack):
- **Runtime gateway**: TalkSurface imports zero runtime modules. `useTalkCorridor` is the adapter boundary. Talk persistence goes through `talk-runtime.ts` which should normalize to the reviewed runtime path.
- **Session seam**: `useIndividualId()` from session-seam is used inside useTalkCorridor for all person-bound constellation persistence. No local identity assumptions.
- **Event seam**: Entry sealed, prompt selected, schema detected events go through the event seam inside the hook. No local one-off event logic.
- **Resilience seam**: `useResilience()` from resilience-seam drives the ResilienceWhisper. The hook checks runtime availability before attempting LLM calls.
- **Shell actor seam**: TALK can adopt `useShellActor` for room-level state (entering/resolving TALK, forking to SEEK/FORM via schema bridge) when UniversalPlayer migrates. The `onNavigate` callback already provides the seam point.
- **Known steering note**: The dev flagged that the Talk client is still pointed at an old function seam. The `talk-runtime.ts` file should eventually normalize to the reviewed talk-runtime path. Do not invent a local second Talk backend.