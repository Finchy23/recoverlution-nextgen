# Promoted Production-Candidate Cue Test Pack

Purpose:
- give a creative or UI agent the exact current promoted cue body we can seriously test with now
- keep the handoff bounded to the browser-proven shared-player set
- make it easy to pull from GitHub without dumping the full atom library

This is a **test pack**, not a launch-ready production claim.

---

## 1. Current truth

There are **three different counts** that matter right now:

- `0` fully launch-production-ready atoms
- `18` promoted production-candidate atoms on paper
- `15` browser-proven promoted production-candidate atoms on the shared `/player` glass

Why this matters:
- the promoted set has already been narrowed and curated
- but only `15` have been proven locally in the real shared player browser suite
- that is the safest body to hand to a creative/UI agent right now

Do **not** call this launch-ready.

The final launch gates are still open:
- hosted preview parity
- launch-route parity
- final QA/accessibility evidence
- runtime-honesty sign-off

So the correct label is:

**browser-proven local promoted cue body**

---

## 2. GitHub source

Repository:

```bash
https://github.com/Finchy23/recoverlution-nextgen.git
```

Branch:

```bash
codex/living-sanctuary-make
```

This branch contains the current handoff file and the current promoted cue body paths.

---

## 3. Fastest way to pull only what you need

If you want the smallest practical clone, use sparse checkout.

Copy/paste:

```bash
git clone --filter=blob:none --branch codex/living-sanctuary-make --single-branch https://github.com/Finchy23/recoverlution-nextgen.git
cd recoverlution-nextgen
git sparse-checkout init --cone
git sparse-checkout set \
  "apps/design-center/src/app/components/atoms" \
  "apps/design-center/src/app/pages/PlayerPage.tsx" \
  "apps/design-center/tests/e2e" \
  "Command Center Execution Plan/figma-drop/guidelines"
```

That gives you:
- the current atom source files
- the current shared glass page
- the proof suite
- the figma-drop guideline pack

If you want the full branch instead, just clone normally:

```bash
git clone --branch codex/living-sanctuary-make --single-branch https://github.com/Finchy23/recoverlution-nextgen.git
```

---

## 4. What this pack is for

Use this pack to:
- test the current strongest cue body on glass
- explore creative direction against a bounded set
- understand the current atom DNA without reading all `700`
- inspect how the shared player is currently carrying promoted atoms

Do **not** use this pack to:
- infer that all `700` atoms are equivalent
- claim launch production readiness
- redesign the shell from scratch
- treat non-promoted atoms as if they have the same proof status

---

## 5. The exact 15 browser-proven promoted cues

These are the cues currently proven locally on the shared `/player` glass.

### Cohort A — body-first callable truths

1. `chrono-kinetic`
- `apps/design-center/src/app/components/atoms/series-1-physics/chrono-kinetic.tsx`

2. `somatic-resonance`
- `apps/design-center/src/app/components/atoms/series-1-physics/somatic-resonance.tsx`

3. `heavy-anchor-ground`
- `apps/design-center/src/app/components/atoms/series-49-abyssal-anchor/heavy-anchor-ground.tsx`

4. `micro-step`
- `apps/design-center/src/app/components/atoms/series-8-kinematic-topology/micro-step.tsx`

5. `phase-shift`
- `apps/design-center/src/app/components/atoms/series-1-physics/phase-shift.tsx`

6. `annealing-relief`
- `apps/design-center/src/app/components/atoms/series-40-synthesis-forge/annealing-relief.tsx`

### Cohort B — relational, reveal, and boundary truths

7. `projection-mirror`
- `apps/design-center/src/app/components/atoms/series-9-shadow-crucible/projection-mirror.tsx`

8. `shadow-hug`
- `apps/design-center/src/app/components/atoms/series-9-shadow-crucible/shadow-hug.tsx`

9. `cryptographic`
- `apps/design-center/src/app/components/atoms/series-1-physics/cryptographic.tsx`

10. `constructive-destructive`
- `apps/design-center/src/app/components/atoms/series-1-physics/constructive-destructive.tsx`

11. `symbiotic`
- `apps/design-center/src/app/components/atoms/series-1-physics/symbiotic.tsx`

### Cohort C — proof, consequence, and support truths

12. `central-node`
- `apps/design-center/src/app/components/atoms/series-33-catalyst-web/central-node.tsx`

13. `tapestry-integration`
- `apps/design-center/src/app/components/atoms/series-34-chaos-loom/tapestry-integration.tsx`

14. `terminal-velocity-hover`
- `apps/design-center/src/app/components/atoms/series-43-gravity-inverter/terminal-velocity-hover.tsx`

15. `trench-beacon`
- `apps/design-center/src/app/components/atoms/series-44-depth-sounder/trench-beacon.tsx`

---

## 6. The 3 promoted atoms not yet in the current browser-proven 15

These are still part of the broader promoted set on paper, but they are **not** in the current shared-player proven body:

16. `future-memory`
- `apps/design-center/src/app/components/atoms/series-10-reality-bender/future-memory.tsx`

17. `archimedes-lever`
- `apps/design-center/src/app/components/atoms/series-43-gravity-inverter/archimedes-lever.tsx`

18. `muddy-water`
- `apps/design-center/src/app/components/atoms/series-45-turbidity/muddy-water.tsx`

Treat these as:

**promoted candidates awaiting the same proof lane**

---

## 7. Minimum companion files to pull with the cues

Do not review the cues without these:

### Shared glass surface

- `apps/design-center/src/app/pages/PlayerPage.tsx`

This is the clearest live glass for feeling one atom inside the player environment.

### Browser proof suite

- `apps/design-center/tests/e2e/atom-proof.spec.ts`
- `apps/design-center/tests/e2e/test-helpers.ts`

These prove the promoted body on the shared `/player` surface.

### Existing figma-drop context

- `Command Center Execution Plan/figma-drop/guidelines/ATOM_SEED_PACK_FOR_CREATIVE_UI_AGENT.md`
- `Command Center Execution Plan/figma-drop/guidelines/Guidelines.md`

These provide the broader handoff context and current repo-side creative guardrails.

---

## 8. What this cue body is meant to prove

This pack is not random. It is meant to prove that the atom organism can already carry:

- body-first regulation
- emotional pressure and release
- boundary and relation
- projection and reveal
- network consequence
- support gravity
- survivable depth
- proof without dashboard behavior

If this body does not feel coherent, the wider library is not ready.

If this body feels coherent, we have a real identity nucleus.

---

## 9. How to review it

Review in this order:

1. **one cue on glass**
- open `PlayerPage`
- feel one atom in isolation

2. **the callable body**
- check Cohort A
- ask whether the mechanics feel body-first and inevitable

3. **the relational body**
- check Cohort B
- ask whether meaning is carried by the atom, not by explanatory copy

4. **the proof body**
- check Cohort C
- ask whether consequence and support feel believable without collapsing into analytics or workflow UI

5. **the shell fit**
- make sure the player carries the atom and does not have to explain it

---

## 10. Review questions

Use these when testing:

- Is the dominant verb obvious?
- Does the atom carry one emotional law cleanly?
- Does it move the user from `Empty -> Knowing -> Believing -> Embodying`, or at least clearly serve one stage?
- Is the room/shell supporting the atom, or rescuing it?
- Would the cue still make sense if copy were reduced further?
- Does the cue leave a trace or seal?
- Does it feel like part of one organism?

---

## 11. The honest production stance

This is the current stance:

- **ready for creative testing:** yes
- **ready for shared-player review:** yes
- **ready for user-facing concept testing:** yes
- **ready for launch production claim:** no

Until hosted preview parity and final QA are complete, this pack should be described as:

**the current browser-proven promoted cue body**

not:

**the launch production atom library**

---

## 12. Short version for a receiving agent

If you need a minimal instruction block, use this:

```text
Pull the branch `codex/living-sanctuary-make` from `https://github.com/Finchy23/recoverlution-nextgen.git`.

Use the file `Command Center Execution Plan/figma-drop/guidelines/PROMOTED_PRODUCTION_CUE_TEST_PACK.md` as the pack authority.

Work from the 15 browser-proven promoted cues only.

Treat them as the current serious test body on the shared `/player` glass.

Do not treat the wider 700-atom library as equally ready.
Do not treat this set as launch-production-ready yet.

Use the pack to explore identity, glass fit, room fit, and creative range without over-expanding the scope.
```

---

## 13. Final instruction

If a creative or UI agent only has time to review a small body, this is the right one.

It is:
- bounded
- proven enough to matter
- small enough to hold
- strong enough to teach us what the wider library should become
