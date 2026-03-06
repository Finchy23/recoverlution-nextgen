# Migration Plan (Non-Breaking)

## Phase 0 (Now)
- Make `apps/design-center` the active frontend review surface.
- Make `packages/design-system` the token authority.
- Quarantine legacy runtime folders as reference only.

## Phase 1
- Extract shared contracts from active and legacy source material into:
  - `packages/design-system`
  - `packages/ui`
  - `packages/navicue-engine`
  - `packages/types`
- Keep consumer imports stable while ownership moves into packages.

## Phase 2
- Stand up `apps/marketing` and complete homepage + subpages using shared packages.
- Stand up `apps/web` for authenticated product shell.

## Phase 3
- Build product modules in web shell:
  - Journeys
  - Wellbeing Studio
  - Play
  - Toolkit
  - State
  - Momentum
  - Navigate
  - Talk
  - Voice Notes/Journal

## Phase 4
- Integrate auth providers, care-team routing, notifications, health hooks.
- Stand up `apps/mobile` with same engine contracts.

## Phase 5
- Remove remaining legacy runtime assumptions from docs, tooling, and release pipelines.
- Lock repo conventions and release pipelines.

## Definition of Done for Each Module
- Uses shared tokens/components.
- Uses shared engine contracts.
- Has safety/tone guardrail tests.
- No unsupported one-off styles or language drift.
