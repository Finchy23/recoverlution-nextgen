# Command Center SSOT Readiness

- Generated: 2026-03-06T11:53:35.844Z
- Strict: no
- Score: 100
- Passed: 27
- Failed: 0
- Warnings: 2

## Checks
- [PASS] exists:Command Center Execution Plan: Required path present.
- [PASS] exists:Command Center Execution Plan/src: Required path present.
- [PASS] exists:Command Center Execution Plan/figma-drop: Required path present.
- [PASS] exists:apps/command-center/package.json: Required path present.
- [PASS] exists:system/source-of-truth.manifest.json: Required path present.
- [PASS] exists:docs/architecture/SINGLE_SOURCE_OF_TRUTH.md: Required path present.
- [PASS] root-command-center-routing: Root scripts route through apps/command-center.
- [PASS] app-command-center-routing: apps/command-center proxies to Command Center Execution Plan only.
- [PASS] command-center-readme-boundary: Command Center README defines figma-drop as mirror only.
- [PASS] figma-readme-boundary: figma-drop README defines ingest-only behavior.
- [PASS] manifest-design-mirror: SSOT manifest tracks figma-drop as derived for design system.
- [PASS] manifest-runtime-domain: SSOT manifest tracks Command Center runtime and figma-drop ingest boundary.
- [PASS] authority:design-tokens.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:styles/theme.css: Canonical and mirror copies are synchronized.
- [PASS] authority:styles/design-tokens.css: Canonical and mirror copies are synchronized.
- [PASS] authority:styles/fonts.css: Canonical and mirror copies are synchronized.
- [PASS] authority:app/design-system/navicue-blueprint.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:app/design-system/navicue-mechanics.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:app/design-system/navicue-compositor.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:app/design-system/navicue-creative-brief.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:app/design-system/navicue-magic-colors.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:app/design-system/navicue-visual-patterns.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:app/design-system/navicue-figma-surface.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:app/design-system/navicue-tokens.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:utils/assets.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:utils/storageUrls.ts: Canonical and mirror copies are synchronized.
- [PASS] authority:utils/supabaseInfo.ts: Canonical and mirror copies are synchronized.

## Warnings
- figma-drop has 3+ files that do not exist in canonical src/. This is acceptable only as ingest/reference, not runtime authority.
- Command Center has 12+ canonical files not mirrored into figma-drop. Review if tooling needs them; do not invert authority.

## Failures
- None

## Runtime-only sample
- app/design-system/navicue-color-math.ts
- app/integrations/config.ts
- app/integrations/jwplayer.ts
- app/integrations/onesignal.ts
- app/integrations/stripe.ts
- app/observability/config.ts
- app/observability/events.ts
- app/observability/init.ts
- app/observability/posthog.ts
- app/observability/sentry.ts
- app/utils/wellbeingVideoApi.ts
- vite-env.d.ts

## Mirror-only sample
- app/data/lab/atomicLibrarySeries31_3701_3800.ts
- app/data/lab/atomicLibrarySeries31_3801_3900.ts
- app/data/lab/atomicLibrarySeries31_3901_4000.ts

