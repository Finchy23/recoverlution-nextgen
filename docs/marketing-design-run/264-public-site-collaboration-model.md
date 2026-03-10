# 264 Public Site Collaboration Model

Purpose: define how the public-site lanes work together so the clean-build run stays coherent.

## Core rule
Frontend owns the build system and final surface assembly.
Other lanes do not design in a vacuum and frontend does not invent doctrine in a vacuum.

The build runs like this:
1. marketing defines the page burden, family behavior, and review doctrine
2. frontend turns that into route composition, component logic, motion structure, and implementation constraints
3. asset delivers governed visual families and role-correct media
4. copy delivers route-correct language inside module envelopes
5. design calibrates the visual system and module choreography without becoming source of truth
6. frontend assembles the route and captures review evidence
7. marketing judges against burden, coherence, and launch truth

## Ownership split

### Frontend owns
- route composition
- component architecture
- module behavior
- motion implementation
- page assembly
- system coherence in code
- review evidence capture on the live surface

### Asset owns
- family-consistent still/motion source assets
- asset role manifests
- crop/fallback/poster logic
- surface suitability notes

### Copy owns
- route-level language
- module-level text inside envelopes
- public-safe claim wording
- compressed support language

### Design owns
- visual system calibration
- hierarchy refinement
- section choreography
- hero/bridge/transition refinement
- Figma validation and comparison

### Marketing owns
- page burden
- family doctrine
- launch truth
- review gate
- acceptance boundary

## Non-negotiable rule
No lane gets to solve another lane’s burden by smuggling it into their deliverable.

Examples:
- assets do not solve weak structure
- copy does not solve weak hierarchy
- design does not redefine doctrine
- frontend does not invent page purpose
- marketing does not dictate implementation detail where system behavior already answers it

## Build sequence
- marketing packet defines what the page must do
- frontend defines what the route must be built from
- asset/copy/design answer those bounded needs
- frontend assembles and proves
- marketing reviews from evidence, not intention
