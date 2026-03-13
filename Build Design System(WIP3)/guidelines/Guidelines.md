# Recoverlution WIP3 Guidelines

## Core rule

Build and refine one living organism, not a collection of polished screens.

The shell must remain governed by:
- `Surface`
- `Anchor`
- `Stream`

Hierarchy must come from:
- depth
- proximity
- atmosphere
- motion
- attenuation

Not from:
- boxes
- heavy containers
- visible chrome
- generic app scaffolding

## What this repo owns

This workspace is for:
- shell refinement
- room behavior
- visual hierarchy
- interaction law
- structural seams that protect the organism

## What this repo does not own

This workspace does not define final truth for:
- backend semantics
- auth / trust boundaries
- runtime contracts
- support / SOS doctrine
- canonical naming outside approved harmony decisions

## Structural seams that should exist

Prefer adding or preserving:
- shell actor seam
- runtime gateway seam
- session seam
- resilience seam
- event seam
- media adapter seams

Do not bypass those seams casually in room code.

## Runtime rule

Surfaces should consume reviewed seams.
Do not grow new direct fetch / anon / make-server patterns inside room shells unless the seam explicitly owns it.

## Quality bar

The product should feel:
- resonant
- sentient
- resilient
- honest
- returnable

If a refinement makes the system feel more generic, more app-like, or more over-explained, it is probably moving in the wrong direction.
