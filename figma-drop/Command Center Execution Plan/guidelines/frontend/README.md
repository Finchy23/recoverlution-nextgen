# Frontend Handoff Hub

Use this folder as the frontend entrypoint after pulling latest from GitHub.

## 1) Re-Pull Checklist

Run from repo root:

```bash
git fetch --all --prune
git checkout <branch>
git pull --ff-only
npm install
```

If your branch is stale, rebase before coding:

```bash
git fetch origin
git rebase origin/<branch>
```

## 2) Read In This Order

1. `guidelines/frontend/FRONTEND_DESIGN_SYSTEM_DIRECTIVE.md`
2. `NAVICUE_TOKEN_SYSTEM_CONTRACT.md`
3. `guidelines/Guidelines.md`
4. `ATLAS_GENESIS_BUILD_DIRECTIVE.md`

## 3) Design-System Authority

Only use these authorities, in this order:

1. `src/app/design-system/navicue-blueprint.ts`
2. `src/design-tokens.ts`
3. `src/app/components/navicue/NaviCueShell.tsx`
4. `src/app/components/navicue/NaviCueVerse.tsx`

Do not create parallel token/style systems.

## 4) Daily Commands

```bash
./utils/navicue-token-health.sh
./utils/navicue-drift-audit.sh
```

For new specimen scaffolds:

```bash
./utils/create-navicue.sh --series "<Series>" --name "<Name>" --signature "<signature>" --form "<form>" --mechanism "<mechanism>" --kbe "<kbe>" --hook "<hook>"
```
