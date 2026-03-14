# TALK Frontend Review Feedback

Last updated: 2026-03-13
Audience: frontend and Figma AI agents iterating the TALK shell
Review scope: `Build Design System2(WIP)`
Status: active feedback note

## Summary

This pass is useful, but it is not a TALK shell close-out pass yet.

The main improvement is not the visible corridor shell.
The main improvement is a cleaner standalone app plus new local runtime posture seams.

That means the architectural instinct is improving, but the frontend shell still needs another focused pass.

## What improved

These changes are directionally strong:

- the standalone WIP app builds cleanly
- TALK now references a session seam instead of hardcoding `anon`
- TALK now has a resilience posture and a subtle degraded-state UI candidate

Strong candidate to keep:

- `src/app/components/surfaces/ResilienceWhisper.tsx`

Strong architectural instinct, but not final authority:

- `src/app/components/runtime/session-seam.ts`
- `src/app/components/runtime/resilience-seam.tsx`

## What did not materially improve yet

The visible TALK shell itself is still largely unchanged.

The following core shell pieces still need the real refinement pass:

- prompt field hierarchy
- writing page proportions
- seal prominence and emotional centrality
- reflection state clarity
- bridge placement and quietness
- thread-map coexistence with page and reflection
- rest-state finish

So this pass should not be treated as the visual finish line.

## Architectural caution

`src/app/components/surfaces/TalkSurface.tsx` now mixes even more local runtime behavior into the shell:

- session identity
- resilience posture
- persistence
- prompt evolution
- schema detection
- deep mining
- navigation

Do not promote that file wholesale.

Extract the shell law.
Do not adopt the local runtime law.

## What we want next

The next return should be a shell-first pass, not another runtime pass.

Focus only on:

- `arriving`
- `prompting`
- `writing`
- `sealing`
- `reflecting`
- `threading`
- `resting`

Priority order:

1. writing page
2. seal behavior
3. reflection state
4. bridge/thread coexistence
5. resting state

## What we need back next time

The next return should show:

- clearer writing page hierarchy
- a more resolved seal-led moment
- a bounded reflection state
- a final or near-final bridge posture
- a clearer rule for when and how thread topology appears
- mobile proof for those states
- explicit declaration that no additional app-local runtime law was added

## Keep

- the resilience whisper as a shell candidate if it stays lightweight
- the instinct to replace hardcoded preview identity with a seam
- the calm degraded-mode posture

## Do not expand next pass

Do not spend the next pass on:

- more local runtime clients
- more persistence logic
- deeper schema/KBE logic
- more routing law
- analytics additions

That work belongs outside the frontend shell pass.

## Final instruction

Bring back a better corridor, not a smarter prototype.
