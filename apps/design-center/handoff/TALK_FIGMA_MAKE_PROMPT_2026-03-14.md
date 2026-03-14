# TALK Figma Make Prompt

Last updated: 2026-03-14  
Audience: Figma Make / Figma AI / frontend exploration lane  
Status: active upstream exploration prompt

## Mission

Design the next TALK shell pass as a **self-instigated truth corridor**, not as chat UI and not as a generic journaling app.

This is an upstream exploration prompt.
It should generate shell direction, hierarchy, and motion intent.
It must not invent backend logic, product routing truth, or runtime contracts.

## Product law

TALK is:

- self-instigated
- system-bounded
- page-first
- seal-centered
- thread-aware
- graceful to enter
- graceful to leave

The user should feel:

- I started this
- the corridor held me
- I was not interrogated
- I did not get trapped in chat
- something true was sealed and carried forward

## Hard constraints

Do not design:

- chat bubbles
- assistant UI
- recommendation cards
- stacked widgets
- progress dashboard language
- analytics-feeling thread visuals
- multiple competing panels
- obvious feature toggles
- a transcript interface

Do design:

- one quiet doorway
- one page
- one seal-led gesture
- one bounded reflection state
- one quiet bridge posture
- one afterglow thread feeling

## Current implementation truth

Shared shell direction has already been lifted into code:

- prompt ceremony in `packages/ui/src/talk/talk-corridor-kit.tsx`
- proving-ground wiring in `apps/design-center/src/app/pages/design-center/TalkCorridorLab.tsx`

The next Figma Make pass should **push the shell further**, especially in these areas:

1. prompt ceremony  
2. branch ceremony  
3. writing page hierarchy  
4. write / speak gateway  
5. mobile composition

## Prompt ceremony

We want a more sacred and inevitable doorway.

Design for:

- an opener that feels like atmosphere, not instruction
- a preamble that is light and restrained
- 2 or 3 prompt seeds that feel like the user’s own thought forming
- a vertical breathing spine or field connection that subtly holds them together
- a sense that selection narrows into truth rather than “choosing an option”

Avoid menu energy.
Avoid card energy.
Avoid app-control energy.

## Branch ceremony

This is the biggest unresolved seam.

Design a moment where:

- one selected prompt deepens
- one or two next branches appear
- the corridor feels like it is going inward, not getting busier

This must feel like deepening recognition, not a decision tree.

## Writing page

The page must feel like a personal letter surface in the dark.

Design for:

- strong page quietness
- clear prompt-to-page handoff
- seal-led gravity
- writing as a central act, not a form field
- enough breathing room that the user feels held, not managed

## Write / speak gateway

The gateway is present conceptually but needs refinement.

Design it as a threshold, not as a toggle.

`write` should feel like:

- pen
- private letter
- inscription
- intimacy

`speak` should feel like:

- witness
- utterance
- breath
- being heard

The icons or glyphs should feel timeless and slightly spiritual, not technological.

## Thread and bridge

The bridge should be a quiet recognition, not recommendation UI.
The thread should feel like continuity and afterglow, not analytics.

Keep both subordinate to the page.

## Mobile

Mobile must be designed as first-class.

Do not simply shrink desktop.
Resolve:

- prompt stacking
- page priority
- gateway fit
- thread / bridge quietness

## Deliverables

Return one strong direction, not a scatter of unrelated variants.

Include:

- prompting state
- branch / narrowing state
- writing state
- gateway state
- resting / afterglow state
- mobile view

## Final rule

Push the organism forward.
Do not invent a second TALK runtime.
