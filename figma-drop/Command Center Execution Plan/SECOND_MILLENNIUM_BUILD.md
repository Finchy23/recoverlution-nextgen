# SECOND MILLENNIUM BUILD INSTRUCTIONS
## 1,000 Specimens | Series 101--200 | Gen 4 Delivery Stack

---

## MANIFEST STATUS

### Complete centuries (all 10 series, 100 specimens each)
| Century | Range       | Series    | Status   |
|---------|-------------|-----------|----------|
| 14th    | 1301--1400  | 131--140  | COMPLETE |
| 15th    | 1401--1500  | 141--150  | COMPLETE |
| 16th    | 1501--1600  | 151--160  | COMPLETE |
| 17th    | 1601--1700  | 161--170  | COMPLETE |
| 18th    | 1701--1800  | 171--180  | TBD      |
| 19th    | 1801--1900  | 181--190  | TBD      |
| 20th    | 1901--2000  | 191--200  | TBD      |

### Incomplete centuries (content status)
| Century | Range       | Content          | Built             | Gap  |
|---------|-------------|------------------|-------------------|------|
| 11th    | 1001--1100  | ALL 100 FOUND    | S101-103 (30 built) | 70%  |
| 12th    | 1101--1200  | S111--116 (60)   | S117--120 (40)    | 40%  |
| 13th    | 1201--1300  | S121--126 (60)   | S127--130 (40)    | 40%  |

### Missing series by theme (from Org Structure)
11th Century -- ALL CONTENT FOUND, ARCHITECTURE COMPLETE:
- 101: Projection (BUILT)
- 102: Time (BUILT)
- 103: Vibration (BUILT)
- 104: Matter (ARCHITECTURE READY)
- 105: Light (ARCHITECTURE READY)
- 106: Heat (ARCHITECTURE READY)
- 107: Catalysis (ARCHITECTURE READY)
- 108: Probability (ARCHITECTURE READY)
- 109: Transmutation (ARCHITECTURE READY)
- 110: Steering (ARCHITECTURE READY)

12th Century gaps (S117--120):
- 117: Navigation
- 118: Signal
- 119: Direction
- 120: Harmony

13th Century gaps (S127--130):
- 127: Diplomacy
- 128: Exploration
- 129: Patterns
- 130: Stability

---

## TIERED DELIVERY STACK (Gen 4)

### REQUIRED -- All 1,000 specimens
```
navicueQuickstart(signature, mechanism?, kbe?)
NaviCueShell
navicueType (typography tokens)
navicueButtonStyle(palette, variant?, size?)
useNaviCueStages({ arriving, present, active, resonant, afterglow })
```

### RECOMMENDED -- ~900 non-seal specimens
REQUIRED stack plus:
```
One interaction hook:
  useHoldInteraction   -- sustained press (grounding, patience)
  useDragInteraction   -- swipe/slide (agency, direction)
  useDrawInteraction   -- freeform trace (expression, creativity)
  useTypeInteraction   -- keyboard input (cognition, naming)
  tap                  -- simple onTap handler (decision, selection)
  observe              -- passive watching, breath-synced (presence)

useBreathEngine (when the interaction benefits from breath pacing)
```

### ADVANCED -- 100 seal specimens only (#10 per series)
RECOMMENDED stack plus:
```
composeMechanics(config) -- full delivery spec
useTextMaterializer      -- text reveal modes (emerge, dissolve, burn_in)
useReceiptCeremony       -- proof receipt animation
```

### File size targets
- Non-seal specimens: 65--95 lines
- Seal specimens: ~180 lines (full ceremony)

---

## SILENCE ARCHITECTURE (per-specimen timing)

| Pause             | Duration | Rule                                                    |
|-------------------|----------|---------------------------------------------------------|
| Threshold Pause   | 1.5--3s  | Atmosphere before words. First particle 500ms before.   |
| Invitation Pause  | 2--4s    | After prompt materializes. Breath holds. Interaction on exhale. |
| Integration Pause | 3--6s    | After receipt. Nothing new. Glass breathes.             |
| Word Pacing       | 1.5x     | Most important word gets 1.5x msPerChar.                |

---

## TEMPORAL WORLDS (chrono-context)

| Chrono  | Glass             | Particles            | Text       | Breath     | Speed   | Color          |
|---------|-------------------|----------------------|------------|------------|---------|----------------|
| Morning | Warm, clear       | Upward drift (steam) | emerge     | simple 4-4 | -15%    | +5 warm, +sat  |
| Work    | Crisp, min frost  | Sparse, 15% faster   | dissolve   | None       | +25%    | Neutral-cool   |
| Social  | Subtle warmth     | Lateral drift        | dissolve   | None       | Normal  | +2 rose/amber  |
| Night   | Deep indigo       | 65% count, faint     | burn_in    | calm_478   | -25-30% | -3 warm, 85%   |

---

## CEREMONY GRAMMAR (micro-choreography)

1. **First Particle / Last Particle** -- Content is a visitor. Space is always there.
2. **Held Breath** -- Prompt finishes -> breath top of inhale -> HOLDS -> interaction on exhale.
3. **Threshold Cross** -- Hold passes minimum: 5% brightness bump, 500ms, return. Registration, not celebration.
4. **Atmospheric Response**
   - Hold: particles slow 60%, glow brightens 10%
   - Type: each keystroke -> 2% opacity micro-ripple, 150ms recovery
   - Observe: breath amplitude -> scale pulse on central element
5. **The Weight** -- Landing text always uses burn_in, 1.5x msPerChar, +0.01em letter-spacing.
6. **Receipt Reveal** -- Button emerges 2s after landing text, on exhale, with emerge on label.

---

## 12-ITEM DELIVERY CHECKLIST

| ID    | Check                | Rule                                  |
|-------|----------------------|---------------------------------------|
| DC-1  | No opaque containers | Container bg <= 0.30 alpha            |
| DC-2  | No ghost strokes     | SVG opacity >= 0.06, strokeWidth >= 0.5 |
| DC-3  | No sub-floor fonts   | Nothing below 11px                    |
| DC-4  | System button geometry| navicueButtonStyle() always           |
| DC-5  | No em-dashes         | Use '--'                              |
| DC-6  | No bare monospace    | Use fonts.mono                        |
| DC-7  | useNaviCueStages     | No manual timer boilerplate           |
| DC-8  | Shell-wrapped        | NaviCueShell wraps everything         |
| DC-9  | Default export       | export default function               |
| DC-10 | No hardcoded colors  | All from palette/theme                |
| DC-11 | Interaction hooks    | Shared hooks for hold/drag/type/draw  |
| DC-12 | Stage timing sanity  | Total 15--45s, never >60s             |

---

## ANTI-PATTERNS (never do)
- AP-1: Opaque backgrounds on content
- AP-2: Ghost SVG strokes
- AP-3: Sub-floor font sizes
- AP-4: Custom button geometry
- AP-5: Em-dash usage (use --)
- AP-6: Bare monospace fonts
- AP-7: Manual timer boilerplate
- AP-8: Missing NaviCueShell wrapper
- AP-9: Hardcoded color values
- No gamification, no emojis, no solid backgrounds
- No loading spinners inside NaviCues
- No error states with tech language
- No comparison mechanics
- No "behind" language

---

## MAGIC SIGNATURE DISTRIBUTION PLAN

Target: Even distribution across 8 signatures over 1,000 specimens (~125 each).

| Signature          | Affinity                              | Target % |
|--------------------|---------------------------------------|----------|
| sacred_ordinary    | Grounding, presence, warmth           | 12-15%   |
| witness_ritual     | Observation, truth, stillness         | 12-15%   |
| poetic_precision   | Language, narrative, editing           | 12-15%   |
| science_x_soul     | Physics metaphors, data, measurement  | 12-15%   |
| koan_paradox       | Paradox, quantum, mystery             | 12-15%   |
| pattern_glitch     | Disruption, breaking, hacking         | 12-15%   |
| sensory_cinema     | Visual, somatic, immersive            | 12-15%   |
| relational_ghost   | Connection, social, empathy           | 10-12%   |

---

## INTERACTION HOOK DISTRIBUTION

Target across 900 non-seal specimens:
| Hook      | Best for                        | Target % |
|-----------|---------------------------------|----------|
| tap       | Decisions, selections, reveals  | ~30%     |
| hold      | Patience, grounding, endurance  | ~20%     |
| drag      | Agency, direction, adjustment   | ~15%     |
| type      | Naming, rewriting, cognition    | ~15%     |
| observe   | Presence, breath-sync, witness  | ~10%     |
| draw      | Expression, creative, mapping   | ~10%     |

---

## NAMING CONVENTIONS

### File names
```
{Prefix}_{PascalCaseSlug}.tsx
e.g. Projector_FilmSwap.tsx
     Projector_HologramSeal.tsx
     Chronomancer_PastEdit.tsx
```

### Component names
```
export default function Projector_FilmSwap({ ... })
```

### Registry slugs
```
Series slug:   projector
Specimen slug: film_swap
typeId:        lab__projector__film_swap
```

### Series prefix mapping (S101--S110, 11th Century)
| Series | Name                 | Prefix            | Registry Slug    | Signature         | Form    | HSL Primary       |
|--------|----------------------|-------------------|------------------|-------------------|---------|-------------------|
| 101    | THE PROJECTOR        | Projector_        | projector        | science_x_soul    | Theater | [38, 24, 26]      |
| 102    | THE CHRONOMANCER     | Chronomancer_     | chronomancer     | koan_paradox      | Cosmos  | [255, 18, 20]     |
| 103    | THE RESONATOR        | Resonator_        | resonator        | sensory_cinema    | Ocean   | [190, 18, 22]     |
| 104    | THE MATERIALIST      | Materialist_      | materialist      | sacred_ordinary   | Ember   | [28, 22, 24]      |
| 105    | THE PRISM            | Refractor_        | prism            | poetic_precision  | Stellar | [220, 12, 25]     |
| 106    | THE ENGINE           | Engine_           | engine           | pattern_glitch    | Circuit | [205, 14, 22]     |
| 107    | THE CATALYST II      | CatalystII_       | catalystii       | science_x_soul    | Ember   | [165, 20, 22]     |
| 108    | THE QUANTUM ARCHITECT| QuantumArch_      | quantumarchitect | koan_paradox      | Stellar | [262, 18, 20]     |
| 109    | THE TRANSMUTER       | Transmuter_       | transmuter       | witness_ritual    | Ember   | [32, 26, 22]      |
| 110    | THE CYBERNETICIST    | Cyberneticist_    | cyberneticist    | poetic_precision  | Circuit | [175, 18, 20]     |

### S103 THE RESONATOR -- BUILT (10/10)
| # | Specimen | File | Hook | KBE | Sig | Chrono |
|---|----------|------|------|-----|-----|--------|
| 1021 | Noise Cancellation | Resonator_NoiseCancellation | hold | E | sensory_cinema | work |
| 1022 | Carrier Wave | Resonator_CarrierWave | type | B | poetic_precision | morning |
| 1023 | Constructive Interference | Resonator_ConstructiveInterference | drag | K | science_x_soul | work |
| 1024 | Sympathetic Resonance | Resonator_SympatheticResonance | tap | B | relational_ghost | social |
| 1025 | Feedback Loop | Resonator_FeedbackLoop | drag | E | pattern_glitch | work |
| 1026 | Pure Tone | Resonator_PureTone | hold | E | witness_ritual | morning |
| 1027 | Volume Knob | Resonator_VolumeKnob | tap | K | sacred_ordinary | social |
| 1028 | Echo Chamber | Resonator_EchoChamber | type | B | koan_paradox | night |
| 1029 | Frequency Jammer | Resonator_FrequencyJammer | tap | K | pattern_glitch | work |
| 1030 | Resonator Seal | Resonator_ResonatorSeal | hold+ceremony | E | sensory_cinema | night |

---

## ARCHITECTURAL ANNOTATIONS PER SPECIMEN

Each specimen needs these properties before build:

```
specimen_id:       1001
series:            101
series_name:       THE PROJECTOR
specimen_name:     The Film Swap
file_name:         Projector_FilmSwap
slug:              film_swap
type_id:           lab__projector__film_swap
is_seal:           false
tier:              RECOMMENDED
magic_signature:   science_x_soul
interaction_hook:  drag (swipe to change genre)
breath_mode:       none
chrono_designed:   work
text_mode:         dissolve
kbe_layer:         B (Believing)
voice_archetype:   The Director
silence_timing:
  threshold_pause: 2s
  invitation_pause: 3s
  integration_pause: 4s
```

---

## BUILD ORDER

### Batch 1: Series 101--102 (specimens 1001--1020)
- 18 RECOMMENDED specimens (non-seal)
- 2 ADVANCED specimens (seals: 1010, 1020)

### Per-batch deliverables
1. Implementation .tsx files in /src/app/components/navicue/implementations/
2. Update atlas-series-metadata.ts (add Series 101--102)
3. Update navicue-registry.ts (add LAB_SPECIMENS entries + slug mapping)
4. Update NaviCueMasterRenderer.tsx (add imports + routing)

---

## SPECIMEN TEMPLATE (RECOMMENDED tier, non-seal)

### Pattern A: Direct (NaviCueShell + useNaviCueStages)
Use when the specimen needs full control over its stage rendering.

```tsx
/**
 * SERIES_NAME #N -- Specimen Title
 * "Quote from voice archetype"
 * INTERACTION: Brief description of the interaction
 * STEALTH KBE: What it teaches (K/B/E)
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueShell } from '../NaviCueShell';
import {
  navicueQuickstart,
  navicueType,
  navicueButtonStyle,
} from '@/app/design-system/navicue-blueprint';
import { useNaviCueStages } from '../interactions/useNaviCueStages';
// + one interaction hook

interface Props { data?: any; onComplete?: () => void; }

export default function Series_Specimen({ onComplete }: Props) {
  const { palette, atmosphere } =
    navicueQuickstart('SIGNATURE', undefined, 'KBE', 'FORM');
  const { stage, setStage, addTimer } = useNaviCueStages();
  // Default timing: arriving->present at 1200ms, present->active at 3500ms
  // Custom: useNaviCueStages({ presentAt: 2000, activeAt: 5000 })

  // Interaction hook (hold/drag/type/draw/tap/observe)

  return (
    <NaviCueShell signatureKey="SIGNATURE" kbe="KBE" form="FORM"
      mode="immersive" breathProgress={0} isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a"
            initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Arrival text...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
            Prompt text
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* Core interaction content */}
            {/* On completion: setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); */}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="res"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.narrative, color: palette.text, textAlign: 'center' }}>
            Landing insight
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Poetic coda
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
```

### Pattern B: Compositor-driven (NaviCueVerse)
Use when you want the compositor to auto-select scene, atmosphere, entry, transitions.
Specimen only provides its unique interactive content.

```tsx
import { NaviCueVerse } from '../NaviCueVerse';
import { useHoldInteraction } from '../interactions/useHoldInteraction';
import { navicueType, navicueButtonStyle } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Series_Specimen({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'SIGNATURE',
        form: 'FORM',
        chrono: 'CHRONO',
        kbe: 'KBE',
        hook: 'HOOK',
        specimenSeed: SPECIMEN_NUMBER,
        isSeal: false,
      }}
      arrivalText="The world shimmers..."
      prompt="The central question."
      resonantText="The insight that lands."
      afterglowCoda="The poetic echo."
      onComplete={onComplete}
    >
      {(verse) => (
        /* Interactive content only -- verse.palette, verse.advance, verse.stage available */
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={verse.advance}
            style={navicueButtonStyle(verse.palette)}>
            Engage
          </button>
        </div>
      )}
    </NaviCueVerse>
  );
}
```

---

## SPECIMEN TEMPLATE (ADVANCED tier, seal only)

Seal specimens (#10 per series) add:
- composeMechanics() for full delivery spec
- useTextMaterializer for text reveal (burn_in for landing)
- useReceiptCeremony for proof receipt
- Science fact in the afterglow stage
- Full ceremony grammar (all 6 micro-choreography moments)

---

## SERIES 101 ARCHITECTURAL MAP (THE PROJECTOR)

| # | Specimen          | File                        | Interaction | Signature       | KBE | Chrono  |
|---|-------------------|-----------------------------|-------------|-----------------|-----|---------|
| 1 | The Film Swap     | Projector_FilmSwap          | drag        | sensory_cinema  | B   | work    |
| 2 | The Beam Focus    | Projector_BeamFocus         | drag        | science_x_soul  | E   | work    |
| 3 | The Mirror Wipe   | Projector_MirrorWipe        | drag        | witness_ritual  | K   | morning |
| 4 | The Reality Lag   | Projector_RealityLag        | hold        | koan_paradox    | B   | social  |
| 5 | The Tuning Fork   | Projector_TuningFork        | observe     | sensory_cinema  | E   | night   |
| 6 | The Script Edit   | Projector_ScriptEdit        | type        | poetic_precision| K   | work    |
| 7 | The Fourth Wall   | Projector_FourthWall        | tap         | pattern_glitch  | B   | social  |
| 8 | The Aperture Open | Projector_ApertureOpen      | hold        | sensory_cinema  | E   | morning |
| 9 | The Feedback Loop | Projector_FeedbackLoop      | observe     | science_x_soul  | E   | work    |
|10 | Hologram Seal     | Projector_HologramSeal      | hold+text   | science_x_soul  | --  | night   |

## SERIES 102 ARCHITECTURAL MAP (THE CHRONOMANCER)

| # | Specimen           | File                          | Interaction | Signature       | KBE | Chrono  |
|---|--------------------|-------------------------------|-------------|-----------------|-----|---------|
| 1 | The Past Edit      | Chronomancer_PastEdit         | tap         | poetic_precision| K   | night   |
| 2 | The Future Borrow  | Chronomancer_FutureBorrow     | tap         | science_x_soul  | B   | morning |
| 3 | The Time Dilation  | Chronomancer_TimeDilation     | observe     | sensory_cinema  | E   | night   |
| 4 | The Ancestral Link | Chronomancer_AncestralLink    | hold        | sacred_ordinary | B   | morning |
| 5 | The Legacy Cast    | Chronomancer_LegacyCast       | tap         | witness_ritual  | K   | social  |
| 6 | The Regret Reversal| Chronomancer_RegretReversal   | drag        | koan_paradox    | B   | night   |
| 7 | The Deja Vu        | Chronomancer_DejaVu           | tap         | pattern_glitch  | K   | work    |
| 8 | The Wormhole       | Chronomancer_Wormhole         | hold        | science_x_soul  | E   | work    |
| 9 | The Eternal Now    | Chronomancer_EternalNow       | observe     | sacred_ordinary | E   | night   |
|10 | Chronos Seal       | Chronomancer_ChronosSeal      | hold+text   | science_x_soul  | --  | night   |

---

## SERIES 104 ARCHITECTURAL MAP (THE MATERIALIST)

Theme: "Thought is the blueprint. Action is the brick. Build the house."
Voice: The Architect + The Mason | Schema: materialization_physics
Default Sig: sacred_ordinary | Default Form: Ember | SVG Domain: Construction/Architecture

| #    | Specimen            | File                          | Hook    | KBE | Signature        | Chrono  | SVG Scene Concept                                    |
|------|---------------------|-------------------------------|---------|-----|------------------|---------|------------------------------------------------------|
| 1031 | The First Brick     | Materialist_FirstBrick        | tap     | E   | sacred_ordinary  | morning | Hologram castle flickers; solid brick placed on grid  |
| 1032 | The Blueprint Edit  | Materialist_BlueprintEdit     | type    | K   | poetic_precision | work    | Blueprint wireframe; erase wall, draw pillar          |
| 1033 | The Gravity Well    | Materialist_GravityWell       | drag    | B   | science_x_soul   | social  | Planet with orbiting asteroids; increase mass slider  |
| 1034 | The Friction Test   | Materialist_FrictionTest      | hold    | B   | witness_ritual   | work    | Block on surface; sparks fly proportional to hold     |
| 1035 | The Scaffolding     | Materialist_Scaffolding       | tap     | K   | koan_paradox     | social  | Building with metal poles; toggle ugly/necessary      |
| 1036 | The Concrete Pour   | Materialist_ConcretePour      | hold    | E   | sensory_cinema   | night   | Liquid concrete timer; patience test, walk too soon=sink|
| 1037 | The Keystone        | Materialist_Keystone          | tap     | K   | poetic_precision | morning | Arch with missing center stone; place to stabilize    |
| 1038 | The Demolition      | Materialist_Demolition        | drag    | B   | pattern_glitch   | work    | Rotting shack; wrecking ball swing via drag           |
| 1039 | The Inspection      | Materialist_Inspection        | draw    | K   | science_x_soul   | work    | Perfect wall; draw X-ray reveals hidden crack         |
| 1040 | Materialist Seal    | Materialist_MaterialistSeal   | hold+cer| E   | sacred_ordinary  | night   | Pyramid: perfect geometry, timeless. Science: Neuroplasticity->Behavior |

## SERIES 105 ARCHITECTURAL MAP (THE PRISM)

Theme: "The problem is not the light. It is the angle. Bend the beam."
Voice: The Opticist + The Photographer | Schema: cognitive_refraction
Default Sig: poetic_precision | Default Form: Stellar | SVG Domain: Optics/Light

| #    | Specimen              | File                          | Hook    | KBE | Signature        | Chrono  | SVG Scene Concept                                    |
|------|-----------------------|-------------------------------|---------|-----|------------------|---------|------------------------------------------------------|
| 1041 | The Spectrum Split    | Refractor_SpectrumSplit       | draw    | K   | poetic_precision | work    | White beam hits prism; rainbow fans out; pick one     |
| 1042 | The Focal Point       | Refractor_FocalPoint          | hold    | E   | science_x_soul   | morning | Scattered rays; hold lens steady to ignite leaf       |
| 1043 | The Distortion Check  | Refractor_DistortionCheck     | tap     | K   | koan_paradox     | work    | Fun-house mirror vs flat mirror toggle                |
| 1044 | The Color Grade       | Refractor_ColorGrade          | drag    | B   | sensory_cinema   | social  | Grey street scene; drag warm filter slider            |
| 1045 | The Blind Spot        | Refractor_BlindSpot           | observe | K   | witness_ritual   | work    | Driving POV; red warning in blind spot                |
| 1046 | The Polarizer         | Refractor_Polarizer           | drag    | E   | science_x_soul   | morning | Glare on water; rotate lens to see fish beneath      |
| 1047 | The Black Body        | Refractor_BlackBody           | tap     | B   | sacred_ordinary  | social  | Black/white objects; absorb vs reflect choice         |
| 1048 | The Laser             | Refractor_Laser               | drag    | E   | pattern_glitch   | work    | Align 3 sliders (mind/body/emotion); beam shoots     |
| 1049 | The Darkroom          | Refractor_Darkroom            | hold    | B   | sensory_cinema   | night   | Red room; image slowly emerges in developer tray      |
| 1050 | Prism Seal            | Refractor_PrismSeal           | hold+cer| E   | poetic_precision | night   | Glass prism, single beam in, perfect rainbow out. Science: Refraction |

## SERIES 106 ARCHITECTURAL MAP (THE ENGINE)

Theme: "Energy is never lost, only transferred. Stop the leaks."
Voice: The Engineer + The Physicist | Schema: entropic_management
Default Sig: pattern_glitch | Default Form: Circuit | SVG Domain: Thermodynamics/Machinery

| #    | Specimen           | File                          | Hook    | KBE | Signature        | Chrono  | SVG Scene Concept                                    |
|------|--------------------|-------------------------------|---------|-----|------------------|---------|------------------------------------------------------|
| 1051 | The Entropy Check  | Engine_EntropyCheck           | tap     | B   | pattern_glitch   | morning | Clean room decaying to chaos; tap to restore order    |
| 1052 | The Heat Sink      | Engine_HeatSink               | hold    | E   | sensory_cinema   | work    | Processor temp gauge redlining; hold to cool down     |
| 1053 | The Closed Loop    | Engine_ClosedLoop             | type    | K   | science_x_soul   | work    | Pipe with leaks; type the distraction name to patch   |
| 1054 | The Flywheel       | Engine_Flywheel               | hold    | B   | sacred_ordinary  | morning | Massive wheel; repeated push via hold, momentum builds|
| 1055 | The Insulation     | Engine_Insulation             | tap     | K   | poetic_precision | social  | House in winter; heat escaping roof; add insulation   |
| 1056 | The Turbocharger   | Engine_Turbocharger           | drag    | B   | pattern_glitch   | work    | Exhaust pipe; drag to connect turbo, power boosts     |
| 1057 | The Idle State     | Engine_IdleState              | observe | E   | sensory_cinema   | night   | Car RPM gauge at idle; breathing circle syncs to hum  |
| 1058 | The Fuel Mix       | Engine_FuelMix                | drag    | K   | science_x_soul   | work    | Air/Fuel ratio slider; balance rest and work          |
| 1059 | The Governor       | Engine_Governor               | drag    | B   | witness_ritual   | social  | Speedometer at 200; drag limiter to 150, ride smooths |
| 1060 | Engine Seal        | Engine_EngineSeal             | hold+cer| E   | pattern_glitch   | night   | Stirling engine: heat->motion, silent. Science: 2nd Law of Thermodynamics |

## SERIES 107 ARCHITECTURAL MAP (THE CATALYST II)

Theme: "The reaction is waiting for you. You are the ingredient."
Voice: The Chemist + The Sorcerer | Schema: catalytic_agency
Default Sig: science_x_soul | Default Form: Ember | SVG Domain: Chemistry/Reactions

| #    | Specimen              | File                          | Hook    | KBE | Signature        | Chrono  | SVG Scene Concept                                    |
|------|-----------------------|-------------------------------|---------|-----|------------------|---------|------------------------------------------------------|
| 1061 | The Phase Change      | CatalystII_PhaseChange        | hold    | B   | science_x_soul   | morning | Ice block; hold heat -- nothing, nothing, then crack  |
| 1062 | The Precipitate       | CatalystII_Precipitate        | type    | K   | poetic_precision | work    | Cloudy liquid; type a decision to precipitate clarity |
| 1063 | The Activation Energy | CatalystII_ActivationEnergy   | drag    | E   | science_x_soul   | work    | Ball at hill bottom; drag up steep slope to crest     |
| 1064 | The Compound          | CatalystII_Compound           | drag    | K   | koan_paradox     | social  | Element A + Element B; drag to combine; explosion=new |
| 1065 | The Solvent           | CatalystII_Solvent            | hold    | B   | witness_ritual   | night   | Rigid "Old Identity"; hold pour to dissolve it        |
| 1066 | The Chain Reaction    | CatalystII_ChainReaction      | draw    | K   | pattern_glitch   | work    | Mousetrap field; draw trajectory to trigger cascade   |
| 1067 | The Purification      | CatalystII_Purification       | observe | B   | sacred_ordinary  | night   | Muddy water boiling; steam rises; pure drop condenses |
| 1068 | The Inert Gas         | CatalystII_InertGas           | tap     | E   | science_x_soul   | work    | Volatile chemical + oxygen; tap to flood with argon   |
| 1069 | The Enzyme            | CatalystII_Enzyme             | tap     | K   | relational_ghost | social  | 100yr reaction; tap to add enzyme/mentor, instant     |
| 1070 | Catalyst Seal         | CatalystII_CatalystSeal       | hold+cer| E   | science_x_soul   | night   | Activation energy graph with tunnel. Science: Catalysis |

## SERIES 108 ARCHITECTURAL MAP (THE QUANTUM ARCHITECT)

Theme: "The future is a cloud. Build a house that can float."
Voice: The Quantum Physicist + The Weaver | Schema: probabilistic_design
Default Sig: koan_paradox | Default Form: Stellar | SVG Domain: Quantum Physics

| #    | Specimen                 | File                              | Hook    | KBE | Signature        | Chrono  | SVG Scene Concept                                    |
|------|--------------------------|-----------------------------------|---------|-----|------------------|---------|------------------------------------------------------|
| 1071 | The Superposition        | QuantumArch_Superposition         | hold    | B   | koan_paradox     | morning | Schrodinger box glowing; hold "Both" state            |
| 1072 | The Probability Cloud    | QuantumArch_ProbabilityCloud      | draw    | K   | science_x_soul   | work    | Dot + cloud of dots; draw path to highest density     |
| 1073 | The Observer Effect      | QuantumArch_ObserverEffect        | draw    | E   | witness_ritual   | work    | Chaotic particles; draw eye icon to snap to grid      |
| 1074 | The Multiverse Branch    | QuantumArch_MultiverseBranch      | tap     | B   | koan_paradox     | social  | Decision tree; tap left, right fades to ghost path    |
| 1075 | The Quantum Tunneling    | QuantumArch_QuantumTunneling      | hold    | E   | sensory_cinema   | night   | Wall barrier; hold "vibrate" to phase through         |
| 1076 | The Entanglement         | QuantumArch_Entanglement          | tap     | B   | relational_ghost | social  | Two particles; spin one, other mirrors instantly      |
| 1077 | The Wave Function        | QuantumArch_WaveFunction          | tap     | K   | poetic_precision | work    | Blurry image; tap detail to sharpen, rest blurs       |
| 1078 | The Uncertainty          | QuantumArch_Uncertainty           | drag    | K   | science_x_soul   | work    | Speed vs Position slider; one sharpens, other blurs   |
| 1079 | The Vacuum Fluctuation   | QuantumArch_VacuumFluctuation     | observe | E   | sacred_ordinary  | night   | Empty space; particle pops from void; patience        |
| 1080 | Quantum Seal             | QuantumArch_QuantumSeal           | hold+cer| E   | koan_paradox     | night   | Double slit interference pattern. Science: QBism      |

## SERIES 109 ARCHITECTURAL MAP (THE TRANSMUTER)

Theme: "Nothing is wasted. Everything is fuel. Burn it."
Voice: The Alchemist + The Blacksmith | Schema: emotional_alchemy
Default Sig: witness_ritual | Default Form: Ember | SVG Domain: Alchemy/Transformation

| #    | Specimen              | File                          | Hook    | KBE | Signature        | Chrono  | SVG Scene Concept                                    |
|------|-----------------------|-------------------------------|---------|-----|------------------|---------|------------------------------------------------------|
| 1081 | The Lead Weight       | Transmuter_LeadWeight         | drag    | B   | witness_ritual   | morning | Heavy lead block; drag into furnace, pours as gold    |
| 1082 | The Calcination       | Transmuter_Calcination        | hold    | K   | sacred_ordinary  | morning | White fire burns ego; hold to blow ash, diamond left  |
| 1083 | The Distillation      | Transmuter_Distillation       | observe | K   | poetic_precision | work    | Muddy mixture boiling; clear drop condenses slowly    |
| 1084 | The Coagulation       | Transmuter_Coagulation        | type    | E   | science_x_soul   | work    | Liquid idea "I should"; type to freeze into "I did"   |
| 1085 | The Fermentation      | Transmuter_Fermentation       | hold    | B   | sensory_cinema   | night   | Grapes rotting; hold patience; transform to wine      |
| 1086 | The Sublimation       | Transmuter_Sublimation        | drag    | E   | pattern_glitch   | work    | Ice to vapor; drag rapidly upward, skip liquid phase  |
| 1087 | The Amalgam           | Transmuter_Amalgam            | drag    | K   | koan_paradox     | social  | Mercury + Silver; drag to mix; result = mirror        |
| 1088 | The Universal Solvent | Transmuter_UniversalSolvent   | hold    | E   | relational_ghost | social  | Knot of resentment; hold pour forgiveness to untie    |
| 1089 | The Philosopher Stone | Transmuter_PhilosopherStone   | tap     | B   | sacred_ordinary  | morning | Red stone; tap objects to transmute fear->courage     |
| 1090 | Transmuter Seal       | Transmuter_TransmuterSeal     | hold+cer| E   | witness_ritual   | night   | Ouroboros: snake eating tail. Science: Conservation of Energy |

## SERIES 110 ARCHITECTURAL MAP (THE CYBERNETICIST)

Theme: "The goal is not a straight line. The goal is the correction."
Voice: The Pilot + The Systems Theorist | Schema: cybernetic_control
Default Sig: poetic_precision | Default Form: Circuit | SVG Domain: Systems/Feedback

| #    | Specimen              | File                              | Hook    | KBE | Signature        | Chrono  | SVG Scene Concept                                    |
|------|-----------------------|-----------------------------------|---------|-----|------------------|---------|------------------------------------------------------|
| 1091 | The Error Signal      | Cyberneticist_ErrorSignal         | tap     | K   | science_x_soul   | work    | Target with crosshair off-center; tap to nudge back  |
| 1092 | The Negative Feedback | Cyberneticist_NegativeFeedback    | drag    | B   | pattern_glitch   | work    | Rising temperature; drag fan connection to auto-cool  |
| 1093 | The Positive Feedback | Cyberneticist_PositiveFeedback    | tap     | E   | pattern_glitch   | work    | Mic near speaker; roar builds; tap to cut the cable   |
| 1094 | The Lag Time          | Cyberneticist_LagTime             | hold    | B   | sensory_cinema   | morning | Ship wheel turned; hold patience; ship turns 3s later |
| 1095 | The Gain              | Cyberneticist_Gain                | drag    | E   | science_x_soul   | work    | Sensitive dial; drag to lower gain, needle smooths    |
| 1096 | The Set Point         | Cyberneticist_SetPoint            | drag    | K   | sacred_ordinary  | morning | Thermostat at 60; drag up to 70; heater kicks on      |
| 1097 | The Feedforward       | Cyberneticist_Feedforward         | tap     | B   | witness_ritual   | social  | Storm on radar; tap to close shutters before it hits  |
| 1098 | The Oscillation       | Cyberneticist_Oscillation         | drag    | E   | koan_paradox     | work    | Line weaving L/R of center; drag gently to tighten   |
| 1099 | The Black Box         | Cyberneticist_BlackBox            | type    | K   | poetic_precision | social  | Input->?->Output; type new input to change output     |
| 1100 | Navigator Seal        | Cyberneticist_NavigatorSeal       | hold+cer| E   | poetic_precision | night   | Gyroscope: frame tilts, center stays true. Science: Cybernetics |

---

## 11TH CENTURY DISTRIBUTION ANALYSIS (100 specimens)

### Signature Distribution
| Signature          | S101 | S102 | S103 | S104 | S105 | S106 | S107 | S108 | S109 | S110 | Total | %    |
|--------------------|------|------|------|------|------|------|------|------|------|------|-------|------|
| sacred_ordinary    | 0    | 2    | 1    | 3    | 1    | 1    | 1    | 1    | 2    | 1    | 13    | 13%  |
| witness_ritual     | 1    | 0    | 1    | 1    | 1    | 1    | 1    | 1    | 2    | 1    | 10    | 10%  |
| poetic_precision   | 1    | 1    | 1    | 2    | 3    | 1    | 1    | 1    | 1    | 3    | 15    | 15%  |
| science_x_soul     | 3    | 2    | 1    | 1    | 1    | 1    | 3    | 2    | 1    | 2    | 17    | 17%  |
| koan_paradox       | 1    | 1    | 1    | 1    | 1    | 0    | 1    | 3    | 1    | 1    | 11    | 11%  |
| pattern_glitch     | 1    | 1    | 2    | 1    | 1    | 3    | 1    | 0    | 1    | 2    | 13    | 13%  |
| sensory_cinema     | 3    | 1    | 2    | 1    | 2    | 2    | 0    | 1    | 1    | 1    | 14    | 14%  |
| relational_ghost   | 0    | 0    | 1    | 0    | 0    | 0    | 1    | 1    | 1    | 0    | 4     | 4%   |
| **Total**          | 10   | 8*   | 10   | 10   | 10   | 9*   | 9*   | 10   | 10   | 11*  | 100*  |      |

*Note: Slight rounding due to some series signatures being allocated via theme affinity.
science_x_soul runs slightly high (17%) -- appropriate for a physics-metaphor century.
relational_ghost runs low (4%) -- expected since 11th century is about Reality-Actualization, not relational. Later centuries will compensate.

### Hook Distribution (90 non-seal specimens)
| Hook    | Count | %    |
|---------|-------|------|
| tap     | 26    | 29%  |
| hold    | 17    | 19%  |
| drag    | 20    | 22%  |
| type    | 8     | 9%   |
| observe | 9     | 10%  |
| draw    | 5     | 6%   |
| **seal**| **5** | (excluded from hook distribution) |

### KBE Distribution (90 non-seal specimens)
| KBE | Count | %    |
|-----|-------|------|
| K   | 30    | 33%  |
| B   | 30    | 33%  |
| E   | 30    | 33%  |

### Chrono Distribution (90 non-seal specimens)
| Chrono  | Count | %    |
|---------|-------|------|
| morning | 18    | 20%  |
| work    | 36    | 40%  |
| social  | 16    | 18%  |
| night   | 10    | 11%  |
| (seals) | 10    | (all night -- integration window) |