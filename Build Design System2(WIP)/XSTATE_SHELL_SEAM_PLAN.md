# XState Shell Seam Plan

Date: 2026-03-13
Status: planning-safe
Audience: frontend implementation agent

## Goal

Introduce an `XState v5` shell seam that protects the organism without forcing all live integrations yet.

## Why

The shell now has enough moving parts that ad hoc React state will become drift:
- `Surface / Anchor / Stream`
- parent / child room expansion
- invocation and return law
- degraded / reduced states
- temporary overlays
- room transitions and carry

The actor seam should protect the shell before we deepen room wiring.

## Scope for the first seam

The first actor should own only:
- current visible room
- anchor state: `idle | pressing | expanded | forked`
- stream state: `closed | opening | open | closing`
- shell posture: `full | degraded | offline | reduced | low-power`
- return target
- transient overlay state

## Out of scope for the first seam

Do not include yet:
- live `phenomenon` or `strategy` authority
- full analytics side effects
- media engine state
- room-specific content state
- backend orchestration logic

## Recommended machine split

1. `shellMachine`
- top-level owner of room, anchor, stream, resilience posture

2. `anchorMachine`
- hold / tap / radial / child-fork behavior

3. `streamMachine`
- reveal / dismiss / carry state

These can start in one file, then separate later if the shape proves stable.

## Inputs the seam should accept

- `initialRoom`
- `sessionMode`
- `resiliencePosture`
- `canOpenStream`
- `canInvokeAnchor`

## Outputs the seam should expose

- `activeRoomId`
- `activeResidence`
- `anchorExpanded`
- `expandedParentId`
- `streamOpen`
- `returnTarget`
- `shellPosture`

## Adoption rule

Wrap existing shell behavior first.
Do not rewrite all room internals on the first pass.
