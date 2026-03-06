# Recoverlution Design Center

Apple-grade design system workspace for:

- Token governance and export
- NaviCue composition shell/player
- Atom registry and implementation library
- Live design-center review surface

## Source of Truth

- Canonical token source: `src/design-tokens.ts`
- Generated artifacts:
  - `src/styles/design-tokens.css`
  - `tokens/design-tokens.flat.json`

## Commands

- `npm run dev` - local development
- `npm run tokens:export` - regenerate token artifacts from source
- `npm run figma:handoff` - regenerate the clean handoff pack for Figma/GitHub review
- `npm run build` - token export + handoff pack + production build
- `npm run typecheck` - TypeScript static checks
- `npm run lint` - ESLint checks
- `npm run format` - Prettier write
- `npm run format:check` - Prettier check
- `npm run qa` - tokens + typecheck + lint + format check

## Live Review

- Vercel: `https://recoverlution-design-center.vercel.app`
- Primary route: `https://recoverlution-design-center.vercel.app/design-center`

## Figma Handoff

Use the generated handoff pack when pushing the cleaned code back into Figma-connected review:

- `handoff/figma-handoff.manifest.json`
- `handoff/FIGMA_HANDOFF.md`

## Standards

- Do not hand-edit generated token artifacts.
- Signature IDs use canonical `kebab-case`.
- All UI colors and timing should derive from token exports.
