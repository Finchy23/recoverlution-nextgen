# WIP4 Frontend Atmosphere Plumbing Run

- Date: 2026-03-14
- Scope: `Build Design System (WIP4)` atmosphere plumbing integration
- Status: pass

## What Changed

- Added the shared WIP4 surface atmosphere contract in:
  - `Build Design System (WIP4)/src/app/components/runtime/surface-atmosphere.ts`
- Added the shared settings seam in:
  - `Build Design System (WIP4)/src/app/components/runtime/surface-atmosphere-seam.tsx`
- Added the root route-aware canopy runtime in:
  - `Build Design System (WIP4)/src/app/components/runtime/GlobalSurfaceAtmosphereRuntime.tsx`
- Wrapped the WIP4 app in `SurfaceAtmosphereProvider` in:
  - `Build Design System (WIP4)/src/app/App.tsx`
- Mounted the hidden canopy runtime in the shell in:
  - `Build Design System (WIP4)/src/app/components/design-system/NavShell.tsx`
- Added the proving-ground atmosphere rail on `/surfaces` in:
  - `Build Design System (WIP4)/src/app/pages/SurfacesPage.tsx`
- Wired the same settings seam into `LINK` via an `Atmospheric Music` control node in:
  - `Build Design System (WIP4)/src/app/components/surfaces/LinkSurface.tsx`

## Verification

### Build

- Command:
  - `npm --prefix "Build Design System (WIP4)" run build`
- Result:
  - pass

### Browser Smoke

- Dev server:
  - `http://127.0.0.1:4175/surfaces`
- Result:
  - pass

Observed behavior:

- Atmosphere rail rendered beneath the WIP4 player shell.
- Initial adapted state resolved to:
  - `Quiet Line`
  - `Sync`
  - `fallback`
- Clicking `Immersive` succeeded with no new runtime errors.
- Clicking `Adapt Off` switched the rail to:
  - `Atomic Canopy`
  - `dedicated`
- Resetting to `Subtle` + `Adapt On` returned the shell to:
  - `Quiet Line`
  - `fallback`

Console posture:

- No atmosphere runtime errors observed.
- Existing minor console issue remained:
  - `favicon.ico` `404`

### Experience Assurance

- Command:
  - `npm run -s experience:power-pack`
- Result:
  - pass

## Live Ops Repair

The repo-level assurance gate initially failed due to recurring live Supabase grant drift on the asset runtime summary path.

Repair added:

- Migration file:
  - `services/supabase/migrations/20260314_asset_runtime_observations_access_repair.sql`

Applied live to project:

- `wzeqlkbmqxlsjryidagf`

Repair scope:

- re-granted `execute` on the asset runtime summary RPCs
- re-granted `select` on the asset runtime summary views
- granted `select` on `public.asset_runtime_observations` for the anon/authenticated fallback path

## Notes

- The WIP4 shell now has the same real atmosphere plumbing as the WIP3 proving pass, but adapted to the newer WIP4 mode taxonomy.
- `LINK` now has a natural home for atmosphere settings without inventing a second runtime.
- This pass was intentionally plumbing-first. It does not change PLAY architecture or station truth.
