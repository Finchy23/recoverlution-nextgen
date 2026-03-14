# PLAY Delivery Pack

Date: 2026-03-13
Status: shell refinement pass complete
Audience: nextgen review loop (Codex + human)

## What Was Done

### Architecture: Persistence Extraction

Created `usePlayPersistence.ts` hook that owns all KV persistence:

| Concern | Before | After |
|---------|--------|-------|
| Preferences load/save | inline fetch in PlaySurface | usePlayPersistence |
| Station save/load/list | inline fetch in PlaySurface | usePlayPersistence |
| `projectId`/`publicAnonKey` imports | in PlaySurface | in usePlayPersistence only |

**PlaySurface no longer imports `projectId` or `publicAnonKey`.** No direct fetch calls for preferences or stations. The shell consumes the persistence hook.

Note: Audio engine, mode selection, mutation tracking, and compile/boot logic remain in the shell. These are tightly coupled to visual state and the audio pipeline. A full extraction would require an event-driven architecture that the live runtime will provide.

### File Map

```
runtime/
  usePlayPersistence.ts    ← NEW: preferences + station KV persistence
  play-contracts.ts        ← unchanged (8 contract types declared)
  usePlayRuntime.ts        ← unchanged (Mode B compiled sessions)
  useAudioEngine.ts        ← unchanged (Web Audio API)
  event-seam.ts            ← unchanged (event logging)

surfaces/
  PlaySurface.tsx          ← REFINED: 6 priority improvements
  FrequencySignature.tsx   ← unchanged
```

### Six Priority Improvements

**Priority 1: Invitation to immersion quality**

Arrival state now has:
- Luminous threshold lines that scale in from center (top: 35% width, bottom: 20% width)
- PLAY surface label with frequency color
- Canopy copy with staggered timing (0.15s, 0.3s, 0.45s, 0.6s delays)
- Lower threshold line completing the doorway frame

The transition from arrival to surface feels like entering a room, not just seeing text.

**Priority 2: Depth feels bodily**

Three background layers now respond to the depth dial:

1. **Vignette contraction**: Ellipse shrinks from 80%x70% to 55%x50% as depth increases. At full depth the space physically contracts around you.

2. **Bottom gradient rise**: The darkness creeps up from `55%` to `45%` start point, bringing the floor closer.

3. **Depth warmth**: A subtle color wash (radial gradient) emerges past 30% depth, centered at 55% vertical. The room gets warmer as you go deeper.

DepthControl itself:
- Atmospheric glow field behind segments grows with depth (24-40px)
- Thumb grows (9-12px) and its glow intensifies with depth
- Segments widen more dramatically per layer threshold
- Active segment gets stronger boxShadow

**Priority 3: Playing-state control clarity**

Frequency dots during playback:
- Wider spacing (gap-7 vs gap-6)
- Active frequency shows its 4-letter label at trace opacity below the dot
- Larger atmospheric halo (22px vs 18px) with centered positioning
- Smoother entrance animation (ease curve)

**Priority 4: Saved stations feel emotionally real**

SavedStationShell redesigned:
- Toggle shows "MY ROOMS" (not "N SAVED") with frequency-colored dots for each saved room
- Each station entry shows its frequency identity color dot with soft glow
- Station names use `opacity.present` (not `opacity.murmur`)
- "SAVE THIS ROOM" (not "SAVE THIS") with a color dot
- Staggered entrance animation for station list items
- Up to 4 stations visible (was 3)

**Priority 5: Mutation and continuity cues**

Preserved as-is. MutationWhisper already handles:
- Pulsing dot + "WAITING" (phrase-safe) or "TUNING" (immediate)
- Brief "APPLIED" confirmation with green dot
- Auto-dismiss after 1.2s

No changes needed. This was already strong.

**Priority 6: Runtime inspector**

Preserved as-is behind Shift+I toggle. Shows:
- MODE (mock/live)
- PIPE (A/B)
- CONN (LIVE/OFF)
- SESS (ON/IDLE)
- QUEUE depth
- PEND mutations
- TRCK current track ID
- Error log (last 2 errors)

No changes needed. This was already recessive and informative.

### Beat Character Identity (New)

Each beat now has a `whisper` property:
- PULSE: "Rhythmic presence"
- WAVE: "Flowing undertow"
- HAZE: "Ambient dissolve"
- BARE: "Voice forward"

The active beat's whisper shows in italic below the beat constellation (serif, `opacity.emerging`).

### Contract Gaps (Flagged, Continuing in Mock Mode)

1. **PlayBedFamilyRoster → beat selector**: The beat selector uses a static `BEATS` array. The shell needs a runtime adapter to source bed families from the live roster when `PlayBedFamilyRoster` becomes available. Currently mocked.

2. **Station persistence ownership**: `usePlayPersistence` calls KV directly. When the live runtime delivers saved-station truth, this hook should be replaced by the canonical runtime adapter. Flagged in the hook's doc comment.

3. **PlayQueueItem.duckingProfile / energyCurve**: Declared in the contract but the audio engine doesn't consume them yet. Mode B will need these for premium depth mixing when the DJ engine delivers compiled sessions with ducking profiles.

4. **Depth → audio engine mapping**: The depth dial currently maps to a simple voice-presence EQ duck via `audioEngine.setDepthDuck(depth)`. The live runtime's depth concept may be richer (voice density, layering, etc.). The visual depth response (vignette, warmth) is shell-owned; the audio depth response should be runtime-owned.

### What Was Not Done

- No new compile law, queue law, or mutation law was invented
- No second backend was created
- Mode B compile path was not modified
- Audio engine was not touched
- Event seam schema was not changed
- No catalog or playlist thinking was introduced

### Shell/Runtime Boundary Summary

**Shell owns:**
- Glass hierarchy and room composition
- Invitation, immersion, paused visual states
- Hero orb and control placement
- Sonic field and analyser-driven atmosphere
- Frequency signature canvas identity
- In-room control grammar (frequency, thread, beat, depth)
- Depth-responsive background (vignette, warmth)
- Saved station visual treatment
- Mutation whisper visual treatment

**Runtime owns (via hooks and adapters):**
- Compiled session law (usePlayRuntime)
- Queue and rolling-window truth (useAudioEngine)
- Preferences persistence (usePlayPersistence)
- Station persistence (usePlayPersistence)
- Event logging schema (event-seam)

**Runtime should own (currently mocked or missing):**
- Bed family selection law (static BEATS array)
- Mutation continuity law (currently local setTimeout)
- Saved-station truth (currently KV direct)
- Runtime health truth (currently derived locally)

### Handoff Rule

When this work comes back into the main Codex/runtime path:
- Preserve the frontend experience primitives (depth warmth, invitation threshold, beat whispers, emotionally real stations)
- Replace `usePlayPersistence` with canonical runtime adapter
- Map `BEATS` array to `PlayBedFamilyRoster` from the live runtime
- Do not carry the static frequency/thread/beat arrays as product truth

### Alignment with Organism Guidance Pack

Per `FRONTEND_AGENT_BRIEF.md` (codex/build-design-system2-agent-pack):
- **Runtime gateway**: PlaySurface no longer does direct room-level fetches for persistence. `usePlayPersistence` is the adapter boundary. Audio engine fetches still go through `useContentSoundbites` and `usePlayRuntime` which route through the runtime gateway.
- **Session seam**: `useIndividualId()` from session-seam is used for all person-bound persistence. No local identity assumptions.
- **Event seam**: All mutation events, station saves, and session starts go through `event-seam.ts`. No local one-off event logic.
- **Resilience seam**: `useResilience()` from resilience-seam drives the ResilienceWhisper and runtime availability checks.
- **Shell actor seam**: PLAY can adopt `useShellActor` for room-level state (entering/resolving PLAY as a room) when UniversalPlayer migrates. No action needed from PLAY surface itself.