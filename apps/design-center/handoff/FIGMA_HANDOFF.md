# Figma Handoff

## Project
- Name: Recoverlution Design Center
- Package: `@recoverlution/design-center`
- Live review URL: https://recoverlution-design-center.vercel.app/design-center

## Canonical files
- Token source: `src/design-tokens.ts`
- Generated CSS: `src/styles/design-tokens.css`
- Generated token JSON: `tokens/design-tokens.flat.json`
- App entry: `src/app/App.tsx`
- Design Center entry: `src/app/pages/DesignCenter.tsx`
- Atoms registry: `src/app/components/atoms/atom-registry.ts`

## Commands
- Dev: `npm run dev`
- QA: `npm run qa`
- Build: `npm run build`
- Refresh handoff pack: `npm run figma:handoff`

## Routes
- `/design-center`
- `/design-center/palette`
- `/design-center/type`
- `/design-center/glass`
- `/design-center/motion`
- `/design-center/gates`
- `/atoms`
- `/surfaces`
- `/motion`
- `/voice`
- `/delivery`
- `/player`
- `/showcase`
- `/home`

## Notes
- Treat this workspace as the clean frontend handoff surface for Figma AI.
- Do not edit generated token artifacts directly; edit src/design-tokens.ts and regenerate.
- Do not treat the old figma-drop Vercel project as canonical.
- The live review surface is recoverlution-design-center.vercel.app.

## Supplemental briefs
- TALK frontend directive: `handoff/TALK_FRONTEND_FIGMA_DIRECTIVE_2026-03-12.md`
- TALK return checklist: `handoff/TALK_FRONTEND_RETURN_CHECKLIST_2026-03-12.md`
