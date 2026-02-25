# NaviCue Interaction Sizing Audit

**Date:** 2026-02-24  
**Scope:** Specimens 1001-1200 (Series S101-S120)  
**Issue:** Visual-tactile mismatch in tap interactions

---

## SUMMARY

**Total specimens with old anti-pattern:** 27 files  
**Migrated to gold standard:** 27 files  
**Remaining to migrate:** 0 files  

**Anti-pattern detected:**
```tsx
...navicueInteraction.tapZone, ...navicueType.hint
```

This creates 48px touch targets with tiny (12-14px) text and no visual feedback, making interactions feel fragile and unclear on mobile.

---

## MIGRATION STATUS

### COMPLETED (Gold Standard Reference)

1. **Resonator_FrequencyJammer.tsx** - Single button pattern
2. **Resonator_VolumeKnob.tsx** - Multiple choice pattern

### COMPLETED (Phase 1: Refractor, Engine, Catalyst, Cyberneticist, FieldArchitect partial)

3. **Refractor_SpectrumSplit.tsx**
4. **Refractor_DistortionCheck.tsx**
5. **Refractor_BlackBody.tsx**
6. **Engine_FuelMix.tsx**
7. **Catalyst_Precipitate.tsx**
8. **Catalyst_Compound.tsx**
9. **Catalyst_Solvent.tsx**
10. **Catalyst_Purification.tsx**
11. **Catalyst_InertGas.tsx**
12. **Cyberneticist_NegativeFeedbackLoop.tsx**
13. **Cyberneticist_PositiveFeedbackLoop.tsx**
14. **Cyberneticist_Feedforward.tsx**
15. **Cyberneticist_BlackBox.tsx**
16. **FieldArchitect_PolarityCheck.tsx**
17. **FieldArchitect_IronFilings.tsx**

### COMPLETED (Phase 2: Remaining FieldArchitect, Kineticist, Crystal)

18. **FieldArchitect_Shield.tsx** - Removed hardcoded fontSize: 11
19. **FieldArchitect_ElectroMagnet.tsx** - 2 buttons migrated
20. **FieldArchitect_VoltageDrop.tsx** - Removed hardcoded padding overrides
21. **Kineticist_ElasticCollision.tsx** - Removed hardcoded fontSize: 11
22. **Kineticist_TerminalVelocity.tsx** - Removed hardcoded fontSize: 11
23. **Kineticist_RocketEquation.tsx** - Removed hardcoded padding overrides
24. **Kineticist_MomentumSave.tsx** - Removed hardcoded fontSize: 11
25. **Crystal_FacetCut.tsx** - Hold interaction, pointer events preserved
26. **Crystal_Inclusion.tsx** - 3 buttons migrated (faint + primary variants), removed hardcoded padding
27. **Crystal_ResonantFrequency.tsx** - Hold interaction, pointer events preserved, primaryFaint background kept
28. **Crystal_Annealing.tsx** - Removed hardcoded fontSize: 11
29. **Crystal_NucleationPoint.tsx** - Removed hardcoded fontSize: 11

---

## 📋 REMAINING FILES TO MIGRATE

### Refractor Series (S110) - 3 files
- [x] Refractor_SpectrumSplit.tsx (line 105)
- [x] Refractor_DistortionCheck.tsx (line 144)
- [x] Refractor_BlackBody.tsx (line 155)

### Engine Series (S111) - 1 file  
- [x] Engine_FuelMix.tsx (line 152)

### Catalyst Series (S107) - 5 files
- [x] Catalyst_Precipitate.tsx (line 184)
- [x] Catalyst_Compound.tsx (line 201)
- [x] Catalyst_Solvent.tsx (line 157)
- [x] Catalyst_Purification.tsx (line 229)
- [x] Catalyst_InertGas.tsx (line 210)

### Cyberneticist Series (S106) - 4 files
- [x] Cyberneticist_NegativeFeedbackLoop.tsx (line 109)
- [x] Cyberneticist_PositiveFeedbackLoop.tsx (line 114)
- [x] Cyberneticist_Feedforward.tsx (line 147)
- [x] Cyberneticist_BlackBox.tsx (line 147)

### FieldArchitect Series (S105) - 6 files
- [x] FieldArchitect_PolarityCheck.tsx (line 131)
- [x] FieldArchitect_IronFilings.tsx (line 147)
- [x] FieldArchitect_Shield.tsx (line 164)
- [x] FieldArchitect_ElectroMagnet.tsx (lines 150, 156)
- [x] FieldArchitect_VoltageDrop.tsx (line 129)

### Kineticist Series (S104) - 4 files
- [x] Kineticist_ElasticCollision.tsx (line 140)
- [x] Kineticist_TerminalVelocity.tsx (line 138)
- [x] Kineticist_RocketEquation.tsx (line 144)
- [x] Kineticist_MomentumSave.tsx (line 146)

### Crystal Series (S103) - 5 files
- [x] Crystal_FacetCut.tsx (line 145)
- [x] Crystal_Inclusion.tsx (lines 153, 160, 164)
- [x] Crystal_ResonantFrequency.tsx (line 172)
- [x] Crystal_Annealing.tsx (line 143)
- [x] Crystal_NucleationPoint.tsx (line 158)

---

## SEVERITY BREAKDOWN

### 🔴 CRITICAL (Hardcoded fontSize breaking 11px floor)
**13 files** have `fontSize: 11` hardcoded in nested `<span>` elements:
- Cyberneticist: 3 files
- FieldArchitect: 4 files  
- Kineticist: 4 files
- Crystal: 2 files

**Why critical:** These break the `sanitizeCopy` runtime enforcement and can fall below the 11px minimum on some viewports.

### 🟡 MEDIUM (Hardcoded padding breaking systemization)
**5 files** have hardcoded `padding` values:
- Cyberneticist_BlackBox.tsx
- FieldArchitect_VoltageDrop.tsx
- Kineticist_RocketEquation.tsx
- Crystal_Inclusion.tsx (2 buttons)

**Why medium:** Prevents global design system updates and creates inconsistent touch targets.

### 🟢 STANDARD (Base anti-pattern only)
**9 files** just need the basic pattern replacement.

---

## MECHANICAL MIGRATION RECIPE

For each file:

### Step 1: Update imports
```diff
- import { navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';
+ import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';
```

### Step 2: Replace button element
```diff
- <motion.div onClick={...} whileTap={{ scale: 0.95 }}
-   style={{ ...navicueInteraction.tapZone, ...navicueType.hint, color: verse.palette.text, cursor: 'pointer' }}>
-   <span style={{ ...navicueType.hint, fontSize: 11 }}>text</span>
- </motion.div>

+ <motion.button onClick={...}
+   style={immersiveTapButton(verse.palette).base}
+   whileTap={immersiveTapButton(verse.palette).active}>
+   text
+ </motion.button>
```

### Step 3: Remove nested spans
The new pattern has typography built in - no need for `<span>` wrappers.

### Step 4: Choose variant
- Normal emphasis → `immersiveTapButton(verse.palette)`
- De-emphasized → `immersiveTapButton(verse.palette, 'faint')`
- Highlighted → `immersiveTapButton(verse.palette, 'accent')`

---

## ESTIMATED TIME

- **Simple migration** (standard pattern): ~2 min per file
- **Complex migration** (hardcoded overrides): ~5 min per file
- **Total estimated time:** ~1.5-2 hours for all 25 files

---

## TESTING CHECKLIST

After migrating each file, verify:

1. ✅ Button text is VISIBLE (not tiny floating text)
2. ✅ Padding creates clear interactive area
3. ✅ Glow feedback appears on tap
4. ✅ Scale animation feels smooth (0.97x)
5. ✅ 48px minimum touch target is met
6. ✅ No console warnings about fontSize floor
7. ✅ Color variant matches intent (primary/faint/accent)

---

## PRIORITY ORDER

Recommend migrating in this order:

### Phase 1: CRITICAL (Fix fontSize violations)
1. Cyberneticist series (3 files)
2. FieldArchitect series (4 files)
3. Kineticist series (4 files)
4. Crystal series (2 files)

### Phase 2: MEDIUM (Fix hardcoded padding)
5. Remaining files with custom padding (5 files)

### Phase 3: STANDARD (Complete systemization)
6. All other files (9 files)

---

## VERIFICATION COMMAND

After migration, run this to confirm no anti-patterns remain:

```bash
grep -r "navicueInteraction\.tapZone.*navicueType" src/app/components/navicue/implementations/
```

Should return 0 results when complete.

---

## GOLD STANDARD PATTERN

**Correct usage (post-migration):**

```tsx
// Single button
<motion.button
  onClick={handleAction}
  style={immersiveTapButton(verse.palette).base}
  whileTap={immersiveTapButton(verse.palette).active}
>
  action text
</motion.button>

// Multiple choice
<motion.button
  onClick={handleOption1}
  style={immersiveTapButton(verse.palette, 'faint').base}
  whileTap={immersiveTapButton(verse.palette, 'faint').active}
>
  option 1
</motion.button>
<motion.button
  onClick={handleOption2}
  style={immersiveTapButton(verse.palette, 'primary').base}
  whileTap={immersiveTapButton(verse.palette, 'primary').active}
>
  option 2
</motion.button>
```

**Key benefits:**
- Visible 48px touch target (padding makes it clear)
- Glow + scale feedback on tap
- No hardcoded sizes (fully systematic)
- Palette-aware color variants
- Typography built in (no fontSize mixing)

---

## NEXT STEPS

1. ~~Start with Phase 1 (CRITICAL files) - these have runtime enforcement violations~~
2. ~~Test each migrated file on mobile device~~
3. ~~Verify glow feedback is visible and satisfying~~
4. Run verification command to confirm completion
5. ~~Update this audit file as files are migrated (check boxes above)~~

ALL 27 FILES MIGRATED. Run verification grep to confirm zero remaining anti-patterns.

---

**Last updated:** 2026-02-24  
**Audit performed by:** NaviCue Design System Team  
**Migration completed:** 2026-02-24