# Linear Release Control

## Purpose
Linear is the control plane for prioritization, release scope, and version intent.

Git and Vercel tell us what changed and what shipped.
Linear tells us why it shipped, in what order, and as part of which release boundary.

## What the dedicated Linear Codex thread should own

- triage
- prioritization
- milestone assignment
- dependency tracking
- release scope curation
- release notes inputs
- shipped-state updates

## Minimum release contract

Before a branch is promoted, the corresponding Linear item should have:

- clear owner
- clear status
- milestone or release bucket
- dependency state
- acceptance framing

## Suggested state flow

1. `Backlog`
- not yet selected

2. `Planned`
- prioritized for upcoming work

3. `In Progress`
- active implementation lane exists

4. `Review`
- branch is ready for validation

5. `Ready for Release`
- quality gate passed
- preview validated

6. `Shipped`
- production deployed
- post-release validation complete

## Versioning guidance

- Use Linear milestone or release bucket as the human-readable release boundary.
- Map deploy notes and git tags back to that release boundary.
- Do not rely on git history alone to explain release intent.

## Interaction with other lanes

- Foundation, Runtime, Platform, Growth, and Ops lanes execute changes.
- Program lane sequences and frames those changes in Linear.
- The program lane does not replace engineering gates.
- Engineering gates do not replace release coordination.
