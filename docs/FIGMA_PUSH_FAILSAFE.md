# Figma Push Failsafe

This repository is configured so Figma-originated code can be pushed quickly but cannot silently damage `main`.

## Branch strategy

- Use `figma-drop/<date>-<topic>` for Figma exports.
- Never push directly to `main`.
- Every push to `figma-drop/*` auto-opens (or reuses) a PR into `main`.

## Guardrails in this repo

- `.github/workflows/figma-auto-pr.yml`
  - Opens PRs from `figma-drop/*` to `main`.
- `.github/workflows/figma-guardrails.yml`
  - Runs file safety checks on PRs to `main` and pushes to `figma-drop/*`.
- `scripts/validate_figma_import.sh`
  - Blocks secrets, `.env`, key material, conflict markers, oversized files, and `node_modules`.
  - Blocks edits to control-plane files from `figma-drop/*` branches.
- `.github/CODEOWNERS`
  - Routes all changes (and especially control-plane files) to `@Finchy23`.

## One-time GitHub settings (required)

Configure these in GitHub UI for `main` branch protection/ruleset:

1. Require pull request before merging.
2. Require status checks to pass before merging.
3. Add required check: `Figma Guardrails / validate`.
4. Restrict direct pushes to admins only (or nobody, if possible in your plan).
5. Require conversation resolution before merge.
6. Require review from Code Owners.

This is what makes the flow fail-safe. Workflows alone cannot fully prevent direct pushes unless branch protection is enabled.

## Recommended Figma import flow

1. Create/update branch `figma-drop/<date>-<topic>`.
2. Push Figma output to that branch.
3. Wait for `Figma Guardrails` to complete.
4. Review auto-opened PR.
5. Merge only after checks are green.

## Optional hardening

- Add preview deployment checks (Vercel/Netlify) as required status checks.
- Add lint/typecheck/test jobs to `figma-guardrails.yml` once codebase scaffolding is ready.
