# NaviCue Interaction Sizing System

## THE PROBLEM WE SOLVED

Specimens 1001-1200 suffered from **visual-tactile mismatch**: interactive elements were technically 48px but LOOKED tiny and fragile, causing confusion and failed taps.

### Anti-patterns Found:
```tsx
// ❌ WRONG: Tiny invisible tap target
<button style={{
  ...navicueInteraction.tapZone,  // 48px minimum (good)
  ...navicueType.hint,             // 12-14px text (TINY!)
  color: verse.palette.text,
  cursor: 'pointer',
}}>
  tap me  // ← Looks like tiny text, not a button
</button>

// ❌ WRONG: Hardcoded padding breaking systemization
<button style={{
  ...navicueInteraction.tapZone,
  padding: '12px 20px',  // Hardcoded!
  fontSize: 13,          // Hardcoded!
}}>
  tap me
</button>
```

**Issues:**
1. 48px touch target exists but visual element (text) is 12-14px - users can't see what's tappable
2. No visual feedback showing the interactive area
3. No glow/scale response on tap - feels dead
4. Hardcoded sizing prevents systematic updates
5. Text-only interactions feel fragile on mobile

---

## THE SOLUTION

### New Blueprint Architecture (navicue-blueprint.ts)

**1. Geometry Tokens** (interaction shape without color)
```tsx
navicueInteraction.tapButton       // Standard text button (14-16px, 48px minimum)
navicueInteraction.tapButtonSmall  // Compact variant (12-14px, 48px minimum)
```

**2. Complete Style Factories** (geometry + palette + feedback)
```tsx
immersiveTapButton(palette, variant?, size?, glowRadius?)
// Returns: { base, active, disabled }
```

### When to Use What

| Interaction Type | Use This | Why |
|-----------------|----------|-----|
| Text-based tap (button, choice) | `immersiveTapButton()` | Ensures 48px minimum with visible padding, built-in typography |
| Visual-only tap (SVG, canvas, icon) | `immersiveTap()` | Transparent wrapper for visual elements that ARE the button |
| Hold zone (ceremonial press) | `navicueInteraction.holdZone` | 120px circle for sustained touch |
| Drag track | `navicueInteraction.dragTrack` | Horizontal/vertical slider rail |
| Draw canvas | `navicueInteraction.drawCanvas` | Freeform drawing surface |

---

## MIGRATION PATTERNS

### Pattern 1: Single Text Button

**BEFORE (Buggy):**
```tsx
import { navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';

<button
  onClick={handleAction}
  style={{
    ...navicueInteraction.tapZone,
    ...navicueType.hint,
    color: verse.palette.text,
    cursor: 'pointer',
  }}
>
  activate
</button>
```

**AFTER (Gold Standard):**
```tsx
import { immersiveTapButton } from '@/app/design-system/navicue-blueprint';

<motion.button
  onClick={handleAction}
  style={immersiveTapButton(verse.palette).base}
  whileTap={immersiveTapButton(verse.palette).active}
>
  activate
</motion.button>
```

**What changed:**
- ✅ Removed `navicueType.hint` spread (no typography mixing)
- ✅ Removed manual `color` assignment (palette-aware)
- ✅ Added `whileTap` feedback (glow + scale on press)
- ✅ Proper padding makes 48px target VISIBLE

---

### Pattern 2: Multiple Choice Buttons

**BEFORE (Buggy):**
```tsx
<motion.div onClick={() => choose('option1')} whileTap={{ scale: 0.95 }} style={{
  ...navicueInteraction.tapZone,
  ...navicueType.hint,
  color: verse.palette.textFaint,
  padding: '12px 20px',  // Hardcoded!
}}>
  option 1
</motion.div>
<motion.div onClick={() => choose('option2')} style={{
  ...navicueInteraction.tapZone,
  ...navicueType.hint,
  color: verse.palette.text,
  padding: '12px 20px',  // Hardcoded!
}}>
  option 2
</motion.div>
```

**AFTER (Gold Standard):**
```tsx
<motion.button
  onClick={() => choose('option1')}
  style={immersiveTapButton(verse.palette, 'faint').base}
  whileTap={immersiveTapButton(verse.palette, 'faint').active}
>
  option 1
</motion.button>
<motion.button
  onClick={() => choose('option2')}
  style={immersiveTapButton(verse.palette, 'primary').base}
  whileTap={immersiveTapButton(verse.palette, 'primary').active}
>
  option 2
</motion.button>
```

**What changed:**
- ✅ Variant system (`'faint'` vs `'primary'`) replaces manual color assignment
- ✅ Padding is systematized (no hardcoding)
- ✅ Consistent glow feedback on both buttons
- ✅ Typography scales properly with viewport

---

### Pattern 3: Disabled/Conditional States

```tsx
const btn = immersiveTapButton(verse.palette);

<motion.button
  onClick={isReady ? handleAction : undefined}
  style={{
    ...btn.base,
    ...(isReady ? {} : btn.disabled),
  }}
  whileTap={isReady ? btn.active : undefined}
>
  {isReady ? 'continue' : 'wait...'}
</motion.button>
```

---

### Pattern 4: Accent/Highlighted Button

```tsx
// For success states, confirmations, or primary actions
<motion.button
  onClick={handleConfirm}
  style={immersiveTapButton(verse.palette, 'accent').base}
  whileTap={immersiveTapButton(verse.palette, 'accent').active}
>
  yes, continue
</motion.button>
```

---

## VARIANT REFERENCE

```tsx
immersiveTapButton(palette, variant, size, glowRadius)
```

**Variants:**
- `'primary'` (default) - Normal text color, standard emphasis
- `'accent'` - Accent color, highlighted/success states  
- `'faint'` - Faint text color, de-emphasized options

**Sizes:**
- `'standard'` (default) - 14-16px text, 14px vertical padding
- `'small'` - 12-14px text, 16px vertical padding (still 48px minimum!)

**Glow Radius:**
- Default: `20` (standard glow spread in px)
- Increase for dramatic emphasis, decrease for subtle feedback

---

## MECHANICAL MIGRATION STEPS

For each specimen file with tap interactions:

### 1. Update imports
```diff
- import { navicueType, navicueInteraction } from '@/app/design-system/navicue-blueprint';
+ import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';
```

### 2. Replace button pattern
```diff
- <button style={{
-   ...navicueInteraction.tapZone,
-   ...navicueType.hint,
-   color: verse.palette.text,
-   cursor: 'pointer',
- }}>
+ <motion.button
+   style={immersiveTapButton(verse.palette).base}
+   whileTap={immersiveTapButton(verse.palette).active}
+ >
```

### 3. Handle variants
- De-emphasized option → `'faint'`
- Highlighted/success → `'accent'`
- Normal → `'primary'` (or omit, it's default)

### 4. Remove hardcoded overrides
- Delete `padding: '...'`
- Delete `fontSize: ...`
- Delete manual `color: ...` (use variant instead)

### 5. Test touch targets
- Visual padding should be VISIBLE (text + breathing room)
- Glow feedback should appear on tap
- Scale animation should feel smooth

---

## FILES TO MIGRATE

### Completed (Reference Examples):
- ✅ Resonator_FrequencyJammer.tsx - Single button pattern
- ✅ Resonator_VolumeKnob.tsx - Multiple choice pattern

### Remaining Candidates:
Run this search to find specimens using the old pattern:
```bash
grep -r "navicueInteraction.tapZone" src/app/components/navicue/implementations/
```

Look for files spreading:
- `...navicueInteraction.tapZone, ...navicueType.hint`
- `...navicueInteraction.tapZone` with manual `color:`
- Any hardcoded `padding:` on tap zones

---

## VERIFICATION CHECKLIST

After migration, every text-based tap interaction should:

1. ✅ Use `immersiveTapButton()` (not manual tapZone spread)
2. ✅ Have VISIBLE padding (not just 48px with tiny text)
3. ✅ Show glow feedback on tap (`whileTap={...active}`)
4. ✅ Use variant system for color (`'primary'|'accent'|'faint'`)
5. ✅ Have no hardcoded sizing (`padding`, `fontSize`, etc.)
6. ✅ Meet 48px minimum touch target
7. ✅ Scale smoothly on press (0.97x via `whileTap`)

---

## WHY THIS MATTERS

**Before:** Users tap tiny text, miss the target, feel frustrated
**After:** Users tap visible buttons, feel satisfying glow feedback, complete interactions successfully

This isn't just aesthetics - it's functional UX. Mobile users need to SEE what's tappable and FEEL the response. The old pattern created invisible 48px zones around 12px text. The new pattern makes the entire 48px zone VISIBLE with proper padding and feedback.

---

## GOLD STANDARD RULE

> "If it's tappable text, use `immersiveTapButton()`. If it's a tappable visual (SVG, icon, canvas), use `immersiveTap()`. Never spread `...tapZone, ...navicueType.hint` together - that's the anti-pattern we're eliminating."

---

## NEXT STEPS

1. Run grep search to find remaining old-pattern specimens
2. Migrate each file following the mechanical steps above
3. Test on mobile device (not just desktop cursor)
4. Verify glow feedback is visible and satisfying
5. Ensure no hardcoded sizing remains in any specimen
