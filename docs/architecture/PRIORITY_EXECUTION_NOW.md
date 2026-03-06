# Priority Execution Now

## Priority 1: System Integrity (Immediate)
- Enforce SSOT as operational rule.
- Keep `apps/design-center` as the only active frontend review surface.
- Run `scripts/platform-readiness.sh` before any release.

## Priority 2: Design System (Apple-grade, scalable)
- Treat `packages/design-system` as canonical token authority.
- Extract shared primitives and hero systems into `packages/ui` and the runtime packages with no behavior drift.
- Block feature work that introduces parallel token systems.

## Priority 3: Infinite Cue Operations
- Use Supabase catalog/version/deploy model.
- Dispatch from index + state, not fixed cue ranges.
- Keep governance/review gates mandatory for publishing.

## Priority 4: Figma AI + Zeroheight pipeline
- Figma consumes canonical package exports and app handoff artifacts.
- Downstream mirrors are never authoritative.
- No manual edits in downstream mirrors.

## Priority 5: Vercel release confidence
- Preview + production deploys gated by readiness check.
- Ship only after drift/token/SSOT/build checks pass.

## Working cadence
1. Update canonical source
2. Propagate downstream
3. Run readiness checks
4. Deploy preview
5. Verify + promote
