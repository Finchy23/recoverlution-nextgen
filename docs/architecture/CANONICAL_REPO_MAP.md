# Canonical Repo Map

## Objective

Start clean without losing useful source material.

This repo is not being replaced.
It is being re-centered.

## Source of Truth

- GitHub repo: `recoverlution-nextgen`
- Canonical local checkout: `/Users/daniel/Documents/New project`
- Primary integration branch: `main`
- Parallel execution branches: `codex/*`

## Canonical Directories

### Active apps

- `apps/design-center`
  - live design-system and frontend review surface

- `apps/marketing`
  - future public marketing surface

- `apps/web`
  - future authenticated product shell

- `apps/analytics`
  - future internal reporting surface

- `apps/mobile`
  - future mobile shell

### Shared packages

- `packages/design-system`
  - canonical token authority

- `packages/ui`
  - shared primitives authority

- `packages/navicue-engine`
  - shared runtime and engine contracts

- `packages/types`
  - shared platform types

- `packages/content`
  - approved reusable copy and content contracts

### Platform + ops

- `services/`
- `scripts/`
- `docs/`

## Legacy Directories

- `Command Center Execution Plan/`
  - legacy runtime/reference source
  - do not treat as active app architecture

- `Design System Draft/`
  - legacy design-system draft/reference source
  - do not treat as the active review app

## Placement Rules

- new deployable frontend work goes in `apps/`
- new shared logic goes in `packages/`
- new service/integration logic goes in `services/`
- new process or architecture docs go in `docs/`
- new operational tooling goes in `scripts/`

Do not create new top-level runtime directories.

## Current Direction

1. `packages/design-system` owns tokens
2. `apps/design-center` is the live review surface
3. `packages/ui` becomes the primitives authority next
4. an atoms/interactions package becomes the hero-system authority after that
5. legacy folders are mined deliberately, not expanded
