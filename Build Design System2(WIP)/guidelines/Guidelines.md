# Recoverlution Frontend Guidelines

This workspace is building one living operating system on a single sheet of glass.

## Core laws
- Preserve `Surface / Anchor / Stream` as the primary shell law.
- Protect the organism leap; do not flatten it back into app/page thinking.
- Frontend owns shell behavior, room grammar, hierarchy, fallback posture, and interaction law.
- Backend owns runtime truth, auth/trust, semantics, orchestration truth, and media delivery truth.

## Build posture
- Prefer architectural seams over premature full integrations.
- Use the shared runtime gateway instead of ad hoc room-level fetches.
- Keep session / preview identity inside the session seam.
- Keep resilience / degraded behavior inside the resilience seam.
- Use event hooks and media hooks as seams, not local one-off logic.

## Do now
- shell actor seam
- runtime gateway normalization
- session seam usage
- event seam usage
- media seam protection
- resilience/fallback posture

## Do not harden yet
- final naming doctrine
- deep heat / KBE adaptation
- room-specific auth assumptions
- backend orchestration logic
- local semantic truth
- fake support or SOS truth

## Escalate when
- a room needs data the backend does not expose
- a visual choice implies new backend semantics
- a control needs persistence/auth truth not yet defined
- a local implementation would create a second backend or second doctrine
