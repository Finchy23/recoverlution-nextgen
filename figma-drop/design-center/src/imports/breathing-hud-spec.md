# BREATHING HUD ARCHITECTURE
## Engineering Specification & Migration Plan

> Replaces the 8-variable AtomicVoice system with a 7-element Narrative
> Delivery system built on a collapsible "Breathing HUD" mechanic.

---

## 1. THE NARRATIVE ELEMENTS (7)

Each NaviCue carries up to 7 text elements. Not all are always present
(see Narrative Density below).

```
Element            Max Words  Type Scale       Phase          Position
-----------------  ---------  ---------------  -------------  ------------------
1. Inbound Hook    8          heading.h3       ENTERING       Center (varies)
2. Narrative Canopy 40        body.large       ACTIVE (open)  Top 15% canopy
   .condensed      8          body.large       ACTIVE (retog) Top 15% canopy
3. Semantic Pill   2          ui.caption       ACTIVE (coll)  Top dead-center
4. Ambient Subtext 6          (blurred, 8%)    ACTIVE         Deep Z parallax
5. Idle Whisper    4          ui.caption lc    ACTIVE (dwell) Bottom 15%
6. Threshold Morph 2          ui.caption       RESOLVING      Pill position
7. Outbound Receipt 10        heading.h3       RECEIPT        Center
```

### Element Details

**1. INBOUND HOOK** (bridges from previous NaviCue)
- Fades out in ~1.5s as Canopy emerges
- Position varies by entrance type:
  - `center-fade` (default): materializes in dead center
  - `bottom-rise`: emerges from below (carried from previous exit)
  - `peripheral`: appears at screen edge (whispered aside)
- Voice lane constrains word count differently:
  - companion: 10, coach: 8, mirror: 10, narrator: 12, activator: 6
- Typography: `fonts.secondary` (emotional) or `fonts.mono` (clinical)
  bound by voice lane `typographyAffinity`

**2. NARRATIVE CANOPY** (the Why)
- The readable text block at the top of screen
- Collapses on interaction (see Collapse Model)
- Voice lane drives typography treatment:
  | Lane       | Font            | Align  | Vibe                    |
  |------------|-----------------|--------|-------------------------|
  | companion  | fonts.secondary | center | Warm, generous spacing  |
  | coach      | fonts.mono      | left   | Tight, clipped, data    |
  | mirror     | fonts.secondary | center | Spacious, questions     |
  | narrator   | fonts.secondary | left   | Poetic, literary        |
  | activator  | fonts.mono      | center | Small caps, compressed  |
- `.condensed` field (<=8 words) used on re-toggle instead of replay
- COPY RULES ENFORCED:
  - Ram Dass Test: no "should", "must", "stop", "try"
  - Punctuation Rule: periods for absolute facts only; line breaks for pacing
  - Zero pathologizing: validate the defense mechanism immediately

**3. SEMANTIC PILL** (collapsed canopy)
- Tiny pill at top dead-center of screen
- Shows `before` word during ACTIVE, morphs to `after` on RESOLVING
- Pulses with `breathAmplitude` (scale 0.95-1.05)
- Tapping re-toggles the canopy (shows .condensed text)
- PILL CHAINING: optional `chainPrevious: true` flag means this pill's
  `before` word = previous NaviCue's pill `after` word. Creates a
  macro-narrative arc across the stream.
- Voice lane inflection on the article/possessive:
  - companion: "OUR WALL", coach: "THE PLAY", mirror: "YOUR NOISE"
  - narrator: "A STORM", activator: just "STUCK" (no article)

**4. AMBIENT SUBTEXT** (the subconscious)
- HARD RULE: Always first-person, lowercase, no punctuation
- Represents the user's anxious voice OPPOSING the canopy
  - Canopy: "Step to the side and let it fall"
  - Ambient: "but what if they need me"
- Blurred, 8% opacity, deep Z-axis
- Slow vertical drift coupled to breath (rises on inhale, settles on exhale)
- Position varies: center-behind-physics, off-side, split-lines

**5. IDLE WHISPER** (the nudge)
- DUAL TRIGGER:
  - No touch at all after 5s -> invite text ("hold the center")
  - Touching but no resolution after 4s -> hint text ("swipe to redirect")
- Always `fonts.mono`, lowercase
- Fades in 0->0.5 opacity
- Voice lane shapes tone:
  - companion: "breathe with this"
  - coach: "push through center"
  - mirror: "what happens if you hold"
  - narrator: "the hand finds the center"
  - activator: "break it"

**6. THRESHOLD MORPH** (resolution payoff)
- The Semantic Pill scrambles letter-by-letter into the `after` word
- Character count: aim for matched length, allow +/-2 chars (pad with space)
- Paired authoring: `{ before: "THE NOISE", after: "THE SIGNAL" }`
- Triggers `UIImpactFeedback.medium` haptic

**7. OUTBOUND RECEIPT** (final stamp)
- Appears after 1.5s afterglow gap (pure aftermath, no text)
- Fades into center of screen
- Bridges to next NaviCue's Inbound Hook (occupies same physical space)
- Voice lane shapes tone:
  - companion: "We made room. Let's keep going."
  - coach: "Cleared. Next play."
  - mirror: "What did you just release?"
  - narrator: "The weather passed. The sky remained."
  - activator: "Done. Move."

---

## 2. THE BREATHING HUD STATE MACHINE

```
                    canopy
  ENTERING ──────> EXPANDED ──────> COLLAPSED ──────> MORPHED ──────> RECEIPT
    |                |    ^              |                |               |
    |  hook          |    |  re-toggle   |   resolution   |  afterglow   |
    | dissolves      |    └──────────────┘                |  (1.5s gap)  |
    |                |         (shows .condensed)         |              |
    v                v                                    v              v
  [Inbound Hook]  [Canopy visible]  [Pill visible]  [Pill morphs]  [Receipt text]
                  [Ambient starts]  [Ambient cont]  [Ambient fades] [Fades out]
                  [Physics loads]   [Physics HERO]  [Physics resolves]
```

### Collapse Triggers (per atom interaction model)

```typescript
type CollapseModel = 'touch' | 'breath-cycles' | 'timed';
```

| Atom Interaction | Collapse Model  | Trigger                              |
|-----------------|-----------------|--------------------------------------|
| Touch atoms     | `'touch'`       | First `pointerdown` in physics zone  |
| Breath atoms    | `'breath-cycles'` | After 3 breath cycles              |
| Observe atoms   | `'timed'`       | word-count * 250ms auto-collapse     |

### Haptic Punctuation

| Event            | Haptic                          |
|------------------|---------------------------------|
| Canopy collapse  | `UIImpactFeedback.light`        |
| Threshold morph  | `UIImpactFeedback.medium`       |
| All other events | None                            |

---

## 3. THE SPATIAL CONTRACT

```
┌─────────────────────────────────────┐
│  TOP 15% — NARRATIVE CANOPY        │ ← Collapsible. body.large.
│  (or Semantic Pill when collapsed)  │    Voice-lane-driven typography.
├─────────────────────────────────────┤
│                                     │
│                                     │
│  CENTER 70% — PURE PHYSICS CORE    │ ← ZERO text. The atom only.
│  (Ambient Subtext in deep Z-axis)  │    User projects meaning.
│                                     │
│                                     │
├─────────────────────────────────────┤
│  BOTTOM 15% — IDLE WHISPER         │ ← Dwell-triggered only.
│  (or empty if user is interacting) │    fonts.mono, lowercase.
└─────────────────────────────────────┘
```

### Hero Zone Adjustment

The current heroZone default is `{ topFrac: 0.12, heightFrac: 0.76 }`.
With the Breathing HUD, the physics core needs to shift down to make room
for the canopy:

- Canopy open: heroZone = `{ topFrac: 0.15, heightFrac: 0.70 }`
- Canopy collapsed: heroZone = `{ topFrac: 0.05, heightFrac: 0.80 }`
  (pill takes almost no space, physics reclaims the canvas)

The BreathingHUD component can animate the heroZone change on collapse.
Or: keep heroZone fixed and let the canopy overlay the top of the physics
zone (since it collapses on interaction, there's no touch conflict).

**Recommendation**: Keep heroZone fixed at `{ topFrac: 0.15, heightFrac: 0.70 }`
and let the canopy live ABOVE it. When collapsed, the pill sits at `top: 2%`
and the physics zone has clean space.

---

## 4. NARRATIVE DENSITY (Composition Variable)

```typescript
type NarrativeDensity = 'full' | 'core' | 'minimal' | 'silent';
```

| Density    | Elements Present                                    | Frequency |
|------------|-----------------------------------------------------|-----------|
| `'full'`   | All 7: hook + canopy + pill + ambient + whisper + morph + receipt | ~1 in 4 |
| `'core'`   | Hook + canopy + pill + morph + receipt (no ambient, no whisper) | ~2 in 4 |
| `'minimal'`| Hook + physics + receipt only (no canopy, no pill)   | ~1 in 5   |
| `'silent'` | Physics + ambient only (zero readable text)          | ~1 in 8   |

Stream sequencing should alternate densities like musical dynamics.

---

## 5. COPY VALIDATION RULES

Enforced at authoring time (Voice workspace + Supabase pipeline), NOT runtime.

```typescript
// Word ceiling per element x voice lane
const NARRATIVE_THROTTLE = {
  inboundHook: {
    companion: { wordMax: 10, charMax: 55 },
    coach:     { wordMax: 8,  charMax: 45 },
    mirror:    { wordMax: 10, charMax: 55 },
    narrator:  { wordMax: 12, charMax: 65 },
    activator: { wordMax: 6,  charMax: 30 },
  },
  narrativeCanopy: { wordMax: 40, charMax: 240, lineMax: 4 },
  canopyCondensed: { wordMax: 8,  charMax: 45 },
  semanticPill:    { wordMax: 2,  charMax: 14 },
  ambientSubtext:  { wordMax: 6,  charMax: 35 },
  idleWhisper:     { wordMax: 4,  charMax: 25 },
  thresholdMorph:  { wordMax: 2,  charMax: 14 },
  outboundReceipt: { wordMax: 10, charMax: 55, lineMax: 2 },
} as const;

// Ram Dass Test — banned words
const BANNED_WORDS = ['should', 'must', 'stop', 'try', "don't", "can't"];

// Ambient subtext MUST be: lowercase, first-person, no terminal punctuation
// Punctuation Rule: periods only for absolute facts; prefer line breaks
```

---

## 6. TYPE SYSTEM CHANGES

### New types to ADD in `navicue-types.ts`:

```typescript
// ── THE NARRATIVE PAYLOAD (replaces AtomicVoicePayload) ──

export type NarrativeDensity = 'full' | 'core' | 'minimal' | 'silent';
export type CollapseModel = 'touch' | 'breath-cycles' | 'timed';
export type HookPosition = 'center-fade' | 'bottom-rise' | 'peripheral';

export interface NarrativePayload {
  density: NarrativeDensity;
  collapseModel: CollapseModel;

  /** 1. Inbound Hook — bridges from previous NaviCue (<=8 words) */
  inboundHook?: {
    text: string;
    position: HookPosition;
  };

  /** 2. Narrative Canopy — the Why (<=40 words, collapses on interaction) */
  narrativeCanopy?: {
    text: string;
    /** Shortened version for re-toggle (<=8 words) */
    condensed: string;
  };

  /** 3+6. Semantic Pill + Threshold Morph — paired before/after */
  semanticPill?: {
    before: string;  // Active phase pill label (<=2 words)
    after: string;   // Resolution morph target (<=2 words)
    /** If true, `before` = previous NaviCue's `after` */
    chainPrevious?: boolean;
  };

  /** 4. Ambient Subtext — user's anxious voice (<=6 words, always lowercase) */
  ambientSubtext?: {
    text: string;
  };

  /** 5. Idle Whisper — dwell-triggered nudge */
  idleWhisper?: {
    /** Shown when user hasn't touched (5s timeout) */
    invite: string;
    /** Shown when user is stuck (4s no-resolution timeout) */
    hint: string;
  };

  /** 7. Outbound Receipt — final stamp (<=10 words) */
  outboundReceipt?: {
    text: string;
  };
}
```

### Changes to `NaviCueComposition`:

```typescript
export interface NaviCueComposition {
  id: string;
  diagnosticCore: DiagnosticCore;
  livingAtmosphere: LivingAtmosphere;
  pulseMotion: PulseMotion;
  persona: Persona;
  temporalBookends: TemporalBookends;
  heroPhysics: HeroPhysics;

  // ── OLD (to deprecate) ──
  atomicVoice: AtomicVoicePayload;   // keep for backward compat
  entranceCopy: { text: string; followText?: string };
  gestureLabel: string;
  exitReceipt: string;

  // ── NEW ──
  narrative: NarrativePayload;
}
```

### New THROTTLE entries:

Replace the old throttle block with `NARRATIVE_THROTTLE` (see section 5).

---

## 7. FILE-BY-FILE MIGRATION MAP

### Complete Dependency Graph (audited)

**PRODUCERS (create voice data):**
- `/src/navicue-types.ts` — AtomicVoicePayload, AtomicVoiceSlot, THROTTLE, AtomContentProfile
- `/src/app/pages/voice/atomic-voice-copy.ts` — AtomicVoiceCopy, getAtomicVoiceCopy(), 20 series templates
- `/src/app/data/composition-engine.ts` — buildComposition(), deriveAtomicVoice(), CompositionInput
- `/src/app/data/atom-content-profiles.ts` — ATOM_CONTENT_PROFILES, deriveVoiceSlots()
- `/src/app/data/atom-copy-profile.ts` — AtomCopyProfile, getAtomCopyProfile(), zoneToTop(), weightOpacity()

**CONSUMERS (render/display voice data):**
- `/src/app/components/NaviCueCompositor.tsx` — Z-3 layer (voice.anchorPrompt, .kineticPayload, etc.)
- `/src/app/pages/voice/VoiceWorkspace.tsx` — Parallel rendering + Type Browser (atomicVoice.*)
- `/src/app/pages/PlayerPage.tsx` — Local buildComposition(), passes to Compositor
- `/src/app/pages/delivery/DeliveryWorkspace.tsx` — VoiceSlotGrid, deriveVoiceSlots()
- `/src/app/pages/motion/MotionWorkspace.tsx` — ENTRANCE_COPY, EXIT_COPY display

**ORCHESTRATION:**
- `/src/app/hooks/usePhaseOrchestrator.ts` — Phase state machine (loading→entering→active→resolving→receipt→complete)
  - BreathingHUD needs to hook into: `atmosphereSettled`, `textVisible`, `phase`, `phaseElapsed`
  - May need new signals: `interactionStarted` (for collapse trigger), `afterglowComplete` (for receipt timing)

### Phase 1: Foundation (types + spec)
No runtime changes. Nothing breaks.

| File | Action |
|------|--------|
| `/src/imports/breathing-hud-spec.md` | CREATE — this document |
| `/src/navicue-types.ts` | ADD new types alongside old |

### Phase 2: Data Layer (copy derivation)
Old system still works. New system available in parallel.

| File | Action |
|------|--------|
| `/src/app/pages/voice/narrative-copy.ts` | CREATE — new copy derivation |
| `/src/app/data/composition-engine.ts` | UPDATE — produce `narrative` field |

### Phase 3: Rendering (the BreathingHUD)
This is where the visual change happens.

| File | Action |
|------|--------|
| `/src/app/components/BreathingHUD.tsx` | CREATE — the new component |
| `/src/app/components/NaviCueCompositor.tsx` | UPDATE — replace Z-3 with BreathingHUD, update Z-4/Z-5 |

### Phase 4: Consumer Updates
Wire everything together.

| File | Action |
|------|--------|
| `/src/app/pages/PlayerPage.tsx` | UPDATE — use new composition fields |
| `/src/app/pages/voice/VoiceWorkspace.tsx` | UPDATE — preview new elements |
| `/src/app/pages/motion/MotionWorkspace.tsx` | UPDATE — entrance/exit copy |
| `/src/app/pages/delivery/DeliveryWorkspace.tsx` | UPDATE — composition test |

### Phase 5: Cleanup (deprecate old)
Once everything works on the new system.

| File | Action |
|------|--------|
| `/src/navicue-types.ts` | REMOVE old AtomicVoicePayload types |
| `/src/app/data/atom-copy-profile.ts` | DEPRECATE (replaced by BreathingHUD spatial logic) |
| `/src/app/pages/voice/atomic-voice-copy.ts` | DEPRECATE (replaced by narrative-copy.ts) |

---

## 8. THE OLD → NEW MAPPING

```
OLD AtomicVoicePayload          →  NEW NarrativePayload
─────────────────────────────────────────────────────────
anchorPrompt                    →  narrativeCanopy.text (absorbed, expanded)
kineticPayload                  →  semanticPill.before
ambientSubtext                  →  ambientSubtext.text (repurposed: user's voice)
reactiveFriction                →  REMOVED (physics replaces)
progressiveSequence             →  REMOVED (physics replaces)
metacognitiveTag                →  REMOVED from render (metadata only)
shadowNode                      →  absorbed into outboundReceipt
thresholdShift                  →  semanticPill.after (threshold morph)

OLD Bookend Copy                →  NEW NarrativePayload
─────────────────────────────────────────────────────────
entranceCopy.text               →  inboundHook.text
entranceCopy.followText         →  REMOVED (canopy replaces)
gestureLabel                    →  idleWhisper.invite
exitReceipt                     →  outboundReceipt.text

NEW (no old equivalent)
─────────────────────────────────────────────────────────
narrativeCanopy.condensed       →  NEW (re-toggle summary)
idleWhisper.hint                →  NEW (stuck-state nudge)
density                         →  NEW (composition variable)
collapseModel                   →  NEW (atom-interaction-aware)
inboundHook.position            →  NEW (entrance-type-driven)
semanticPill.chainPrevious      →  NEW (stream continuity)
```

---

## 9. IMPLEMENTATION ORDER

Execute in this exact sequence. Each step is independently testable.

1. **Add types** to `navicue-types.ts` (additive, nothing breaks)
2. **Create `narrative-copy.ts`** with new copy derivation
3. **Update `composition-engine.ts`** to produce both old + new payloads
4. **Create `BreathingHUD.tsx`** component
5. **Update `NaviCueCompositor.tsx`** — swap Z-3 for BreathingHUD
6. **Update `PlayerPage.tsx`** — ensure new composition flows through
7. **Update `VoiceWorkspace.tsx`** — preview new 7-element system
8. **Test end-to-end** on Player + Voice workspace (mobile + desktop)
9. **Deprecate** old types and copy system (Phase 5)

---

## 10. STREAM CONTINUITY MODEL

For the scroll-through-100-NaviCues experience:

```
NaviCue N Receipt → NaviCue N+1 Hook
─────────────────────────────────────
Same physical screen position (center).
Receipt fades out (1.2s) → Hook fades in (0.8s).
If pillChain: pill.after carries forward to next pill.before.

NaviCue stream rhythm:
  [full] [core] [core] [minimal] [full] [silent] [core] [full] ...
```

The composition engine (or future Supabase pipeline) determines density
sequencing. The frontend trusts the data and renders accordingly.

---

## 11. WHAT THIS REPLACES

### Removed from render pipeline:
- Z-3 anchor prompt (→ absorbed into canopy)
- Z-3 kinetic payload (→ semantic pill)
- Z-3 ambient subtext positioning (→ BreathingHUD deep Z layer)
- Z-3 reactive friction (→ gone, physics owns interaction)
- Z-3 progressive sequence (→ gone, physics owns progression)
- Z-3 metacognitive tag (→ metadata only, no render)
- Z-3 shadow node (→ absorbed into receipt)
- Z-4 entrance copy overlay (→ inbound hook)
- Z-5 static gesture CTA (→ idle whisper)

### Kept intact:
- Z-0: Black void base
- Z-1: Living Atmosphere (engine + response profile)
- Z-2: Hero Physics (the atom, unchanged)
- Z-4b: Exit overlay (now driven by outbound receipt)
- Phase indicator (dev HUD, bottom)

### New Z-order:
```
Z-0: Black void (base)
Z-1: Living Atmosphere (Layer 2 — engine + response profile)
Z-2: Hero Physics (Layer 6 — the atom)
Z-3: Ambient Subtext (deep parallax, blurred, 8% opacity)
Z-4: BreathingHUD (canopy / pill / hook / whisper / receipt)
Z-5: Phase indicator (dev HUD)
```

Note: Ambient Subtext drops to Z-3 (BEHIND the atom) because it's
the subconscious layer — it should feel like it's printed on the
glass beneath the physics, not floating above them.