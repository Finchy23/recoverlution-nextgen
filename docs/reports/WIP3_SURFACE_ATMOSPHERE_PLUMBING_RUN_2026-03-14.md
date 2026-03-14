# WIP3 Surface Atmosphere Plumbing Run

- Date: 2026-03-14
- Scope: Wire real surface-atmosphere playback into `Build Design System(WIP3)` so the frontend shell can be tested with live canopy audio before final sign-off.

## What Changed

- Added a local atmosphere contract and deck builder in `/Users/daniel/Documents/New project/Build Design System(WIP3)/src/app/components/runtime/surface-atmosphere.ts`.
- Added a shared settings + mode-override seam in `/Users/daniel/Documents/New project/Build Design System(WIP3)/src/app/components/runtime/surface-atmosphere-seam.tsx`.
- Added a root route-aware audio runtime in `/Users/daniel/Documents/New project/Build Design System(WIP3)/src/app/components/runtime/GlobalSurfaceAtmosphereRuntime.tsx`.
- Wrapped the WIP3 app in the new provider in `/Users/daniel/Documents/New project/Build Design System(WIP3)/src/app/App.tsx`.
- Mounted the runtime in the shell root from `/Users/daniel/Documents/New project/Build Design System(WIP3)/src/app/components/design-system/NavShell.tsx`.
- Wired `/surfaces` to drive the atmosphere from the active `UniversalPlayer` mode and added a compact testing rail in `/Users/daniel/Documents/New project/Build Design System(WIP3)/src/app/pages/SurfacesPage.tsx`.
- Removed the unrelated `hls.js` build blocker from `/Users/daniel/Documents/New project/Build Design System(WIP3)/src/app/components/surfaces/VideoShell.tsx` by falling back to native HLS or MP4.

## Behavior

- Home and shell routes now resolve a real atmosphere scene instead of visual-only ambience.
- `/surfaces` now maps the active mode into the canopy:
  - `talk` -> `Held Corridor`
  - `echo` -> `Reflective Chamber`
  - `link` -> `Control Silence`
  - `play` -> canopy yields so PLAY can own audio
- The test rail supports:
  - `Off`
  - `Subtle`
  - `Immersive`
  - `Adapt On/Off`
- Live audio uses the same Supabase asset proxy family/object path model as the main Design Center implementation.

## Verification

- `npm --prefix '/Users/daniel/Documents/New project/Build Design System(WIP3)' run build`
  - PASS
- `npm run -s experience:power-pack`
  - PASS

## Notes

- This pass intentionally kept runtime truth thin inside WIP3. The shell now has real live atmosphere plumbing for testing, but authoritative station/runtime law still lives in the main repo path.
- The atmosphere control lives in the `/surfaces` testing seam for now. Final user-facing placement can still move into `LINK` inside `ECHO` once the shell is signed off.
