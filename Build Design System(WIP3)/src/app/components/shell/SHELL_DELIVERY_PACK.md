# Shell Actor Seam Delivery Pack

Date: 2026-03-13
Status: seam installed, not yet adopted
Audience: nextgen review loop (Codex + human)

## What Was Done

### XState v5 Shell Machine Installed

Per `XSTATE_SHELL_SEAM_PLAN.md`, an XState v5 shell actor seam has been created that wraps the existing Surface / Anchor / Stream behavior into a formal state model.

### File Map

```
shell/
  shell-machine.ts     ← XState v5 machine definition
  useShellActor.ts     ← React hook wrapping the machine
```

### Machine Shape

```
shellMachine
  states:
    cueFlow      ← CUEs are flowing (home state)
    surface      ← a room is active
  
  context:
    activeRoomId       string
    returnTarget       string | null
    expandedParentId   string | null
    anchorState        idle | pressing | expanded | forked
    streamState        closed | opening | open | closing
    posture            full | degraded | offline | reduced | low-power
    inCueFlow          boolean
    overlayId          string | null
    sessionMode        live | preview
```

### Events

```
ROOM.ENTER    { roomId, parentId? }     → navigate to a room
ROOM.RETURN                              → go back to previous room or CUE flow
ROOM.RESOLVE                             → room completed, return to CUE flow
ROOM.FORK     { childId, parentId }      → enter child room (e.g. KNOW → READ)
ANCHOR.PRESS / RELEASE / EXPAND / COLLAPSE
STREAM.OPEN / CLOSE / OPENED / CLOSED
POSTURE.SET   { posture }
OVERLAY.SHOW  { overlayId }
OVERLAY.DISMISS
CUE_FLOW.ENTER / EXIT
```

### Hook API

`useShellActor({ initialRoom: 'sync' })` returns:

**Read:**
- `activeRoomId`, `inCueFlow`, `streamOpen`, `streamState`
- `anchorState`, `posture`, `returnTarget`, `expandedParentId`, `overlayId`

**Write:**
- `enterRoom(roomId, parentId?)`, `forkRoom(childId, parentId)`
- `returnRoom()`, `resolve()`, `enterCueFlow()`, `exitCueFlow()`
- `openStream()`, `closeStream()`, `setPosture(posture)`
- `showOverlay(id)`, `dismissOverlay()`

### Adoption Path

The hook returns the same shape as UniversalPlayer's current useState calls. Adoption is incremental:

1. **Phase 1**: Replace `activeId` + `setActiveId` with `shell.activeRoomId` + `shell.enterRoom`
2. **Phase 2**: Replace `streamOpen` + `setStreamOpen` with `shell.streamOpen` + `shell.openStream`
3. **Phase 3**: Replace `inCueFlow` + `setInCueFlow` with `shell.inCueFlow` + `shell.enterCueFlow`
4. **Phase 4**: Wire anchor press/expand/collapse through machine events

Each phase can be done independently. No big-bang migration required.

### What Was Not Done

- UniversalPlayer was NOT modified to use the seam yet
- No room internals were rewritten
- No analytics side effects were added to the machine
- No media engine state was included
- No backend orchestration logic was included
- The machine is purely shell state; room content state remains room-owned

### Alignment with Guidance Pack

This seam was built per the directives in:
- `FRONTEND_AGENT_BRIEF.md` (shell actor seam as "install now")
- `XSTATE_SHELL_SEAM_PLAN.md` (scope, inputs, outputs, adoption rule)
- `FRONTEND_AGENT_DIRECTIVE.md` (install structural seams now, not heavy integrations)

### Contract Gaps

- The machine does not yet emit events for the event seam (PostHog). When analytics instrumentation is needed, add side effects to machine transitions.
- The `anchorMachine` and `streamMachine` from the plan are currently inline states, not separate child machines. If they grow complex, split them.
- `sessionMode` is accepted as input but not yet consumed by any room. Preview persona context needs the session seam to be wired.
